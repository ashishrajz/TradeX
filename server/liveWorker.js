// server/liveWorker.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import connectDB from "../src/lib/db.js";
import LiveRun from "../src/lib/models/LiveRun.js";
import User from "../src/lib/models/User.js";
import Trade from "../src/lib/models/Trade.js";

const POLL_INTERVAL = 10_000; // 10s for demo
const CALL_TIMEOUT_MS = 4000;


function SMA(values, period) {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function EMA(values, period) {
  if (values.length < period) return null;
  const k = 2 / (period + 1);
  let ema = values[values.length - period];
  for (let i = values.length - period + 1; i < values.length; i++) {
    ema = values[i] * k + ema * (1 - k);
  }
  return ema;
}

function RSI(values, period = 14) {
  if (values.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = values.length - period; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const rs = gains / (losses || 1);
  return 100 - 100 / (1 + rs);
}

function evaluateRule(rule, candles) {
  const closes = candles.map(c => c.close);
  let indicatorValue;

  if (rule.indicator === "PRICE") {
    indicatorValue = candles.at(-1)[rule.params.field || "close"];
  }
  if (rule.indicator === "SMA") {
    indicatorValue = SMA(closes, rule.params.period || 20);
  }
  if (rule.indicator === "EMA") {
    indicatorValue = EMA(closes, rule.params.period || 20);
  }
  if (rule.indicator === "RSI") {
    indicatorValue = RSI(closes, rule.params.period || 14);
  }

  if (indicatorValue == null) return null;

  const v = Number(rule.value);
  switch (rule.condition) {
    case "<": return indicatorValue < v ? rule : null;
    case ">": return indicatorValue > v ? rule : null;
    case "<=": return indicatorValue <= v ? rule : null;
    case ">=": return indicatorValue >= v ? rule : null;
    case "==": return indicatorValue == v ? rule : null;
    default: return null;
  }
}


async function fetchTicker(symbol) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ticker?symbol=${symbol}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Ticker fetch failed");
  return r.json();
}


async function callStrategy(url, payload) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(t);
    return r.ok ? r.json() : { action: "HOLD" };
  } catch {
    clearTimeout(t);
    return { action: "HOLD" };
  }
}

//trade executor
async function executeTrade(user, run, side, qty, price) {
  if (qty <= 0) return;

  const cost = qty * price;

  if (side === "BUY") {
    if (cost > run.remainingCapital) return;

    run.remainingCapital -= cost;
    run.positions.set(run.symbol, (run.positions.get(run.symbol) || 0) + qty);

    // update user
    user.cash -= cost;
    user.positions.set(run.symbol, (user.positions.get(run.symbol) || 0) + qty);
  } else if (side === "SELL") {
    const prev = run.positions.get(run.symbol) || 0;
    const sellQty = Math.min(prev, qty);
    if (sellQty <= 0) return;

    run.positions.set(run.symbol, prev - sellQty);
    run.remainingCapital += sellQty * price;

    // update user
    const userPrev = user.positions.get(run.symbol) || 0;
    const userSellQty = Math.min(userPrev, qty);
    user.positions.set(run.symbol, userPrev - userSellQty);
    user.cash += userSellQty * price;
  }

  // Save run trade log
  run.tradeHistory.push({
    side,
    quantity: qty,
    price,
    at: new Date(),
  });

  // Save user trade history
  user.trades.push({
    symbol: run.symbol,
    side,
    quantity: qty,
    price,
    at: new Date(),
    source: "copilot",
  });

  await run.save();
  await user.save();
}

//main loop
async function loopOnce() {
  await connectDB();
  const runs = await LiveRun.find({ status: "running" });
  for (const run of runs) {
    const user = await User.findOne({ clerkId: run.clerkId });
    if (!user) continue;

    const ticker = await fetchTicker(run.symbol);
    const price = Number(ticker.lastPrice);

    // stop-loss check
    if (run.stopLoss) {
      const equity = run.remainingCapital + (run.positions.get(run.symbol) || 0) * price;
      run.equityCurve.push({ at: new Date(), equity });
      const minEquity = run.capital * (1 - run.stopLoss / 100);
      if (equity < minEquity) {
        
        run.status = "stopped";
        await run.save();
        continue;
      }
    }

    const payload = {
      symbol: run.symbol,
      price,
      account: { cash: run.remainingCapital, positions: Object.fromEntries(run.positions) },
    };

    let decision = { action: "HOLD" };

    if (run.strategyUrl) {
      
      decision = await callStrategy(run.strategyUrl, payload);
    } else if (run.strategyId) {
      
      const strategy = user.strategies.find(s => String(s._id) === String(run.strategyId));
      if (strategy) {
        const candlesUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/klines?symbol=${run.symbol}&interval=${run.interval}&limit=100`;
        const r = await fetch(candlesUrl);
        const candles = await r.json();

        for (const rule of strategy.rules) {
          const res = evaluateRule(rule, candles);
          if (res) {
            decision = { action: res.action, quantity: res.quantity || 1 };
            break;
          }
        }
      }
    }

    const action = decision?.action?.toUpperCase() || "HOLD";
    const qty = Number(decision?.quantity || 0);

    if (action === "BUY" || action === "SELL") {
      await executeTrade(user, run, action, qty, price);
      
    }

    run.lastRunAt = new Date();
    await run.save();
  }
}

async function main() {
  
  setInterval(() => {
    loopOnce().catch((err) => console.error("Loop error:", err));
  }, POLL_INTERVAL);
}

main();
