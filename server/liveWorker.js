// server/liveWorker.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import connectDB from "../src/lib/db.js";
import LiveRun from "../src/lib/models/LiveRun.js";
import User from "../src/lib/models/User.js";

const POLL_INTERVAL = 10_000; // 10s for demo
const CALL_TIMEOUT_MS = 4000;

// ===== UTILITIES =====
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
  const closes = candles.map((c) => c.close);
  let indicatorValue;

  if (rule.indicator === "PRICE") indicatorValue = candles.at(-1)[rule.params.field || "close"];
  if (rule.indicator === "SMA") indicatorValue = SMA(closes, rule.params.period || 20);
  if (rule.indicator === "EMA") indicatorValue = EMA(closes, rule.params.period || 20);
  if (rule.indicator === "RSI") indicatorValue = RSI(closes, rule.params.period || 14);

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

// ===== API HELPERS =====
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
  } catch (err) {
    clearTimeout(t);
    console.warn("[liveWorker] Strategy call failed:", err.message);
    return { action: "HOLD" };
  }
}

// ===== TRADE EXECUTION =====
async function executeTrade(user, run, side, qty, price) {
  if (qty <= 0) return;
  const cost = qty * price;

  if (side === "BUY") {
    if (cost > run.remainingCapital) return;
    run.remainingCapital -= cost;
    run.positions.set(run.symbol, (run.positions.get(run.symbol) || 0) + qty);
    user.cash -= cost;
    user.positions.set(run.symbol, (user.positions.get(run.symbol) || 0) + qty);
  } else if (side === "SELL") {
    const prev = run.positions.get(run.symbol) || 0;
    const sellQty = Math.min(prev, qty);
    if (sellQty <= 0) return;

    run.positions.set(run.symbol, prev - sellQty);
    run.remainingCapital += sellQty * price;
    user.positions.set(run.symbol, (user.positions.get(run.symbol) || 0) - sellQty);
    user.cash += sellQty * price;
  }

  run.tradeHistory.push({ side, quantity: qty, price, at: new Date() });
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
  console.log(`[liveWorker] Executed ${side} ${qty} ${run.symbol} @ ${price.toFixed(2)}`);
}

// ===== MAIN LOOP =====
async function loopOnce() {
  try {
    await connectDB();
    console.log("[liveWorker] DB connected, polling for active runs...");

    const runs = await LiveRun.find({ status: "running" });
    if (!runs.length) {
      console.log("[liveWorker] No active runs found.");
      return;
    }

    console.log(`[liveWorker] Found ${runs.length} active run(s).`);

    for (const run of runs) {
      const user = await User.findOne({ clerkId: run.clerkId });
      if (!user) continue;

      const ticker = await fetchTicker(run.symbol);
      const price = Number(ticker.lastPrice);

      // Stop-loss check
      if (run.stopLoss) {
        const equity = run.remainingCapital + (run.positions.get(run.symbol) || 0) * price;
        run.equityCurve.push({ at: new Date(), equity });

        const minEquity = run.capital * (1 - run.stopLoss / 100);
        if (equity < minEquity) {
          run.status = "stopped";
          await run.save();
          console.warn(`[liveWorker] Stopped run ${run._id} due to stop loss.`);
          continue;
        }
      }

      const payload = {
        symbol: run.symbol,
        price,
        account: {
          cash: run.remainingCapital,
          positions: Object.fromEntries(run.positions),
        },
      };

      let decision = { action: "HOLD" };

      if (run.strategyUrl) {
        decision = await callStrategy(run.strategyUrl, payload);
      } else if (run.strategyId) {
        const strategy = user.strategies.find((s) => String(s._id) === String(run.strategyId));
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
  } catch (err) {
    console.error("[liveWorker] Loop error:", err);
  }
}

// ===== ENTRYPOINT =====
async function main() {
  console.log("🚀 liveWorker started (Render process up)");
  console.log("Polling interval:", POLL_INTERVAL / 1000, "seconds");

  await connectDB();
  setInterval(() => {
    loopOnce().catch((err) => console.error("[liveWorker] Interval loop error:", err));
  }, POLL_INTERVAL);
}

main();
