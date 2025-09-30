// src/app/api/strategy/backtest/route.js
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

const CALL_TIMEOUT_MS = 4000;

// reuse klines fetch
async function fetchKlinesRange(symbol, interval = "1d", startDate, endDate) {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  
    const url = `${base}/api/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
  
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed fetching historical klines");
    return res.json();
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
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`Strategy responded ${r.status}: ${txt}`);
    }
    return await r.json();
  } catch (err) {
    clearTimeout(t);
    throw err;
  }
}

// helper: compute simple metrics
function computeMetrics(equityCurve, trades, startingCapital) {
  const returns = [];
  for (let i = 1; i < equityCurve.length; i++) {
    const r = (equityCurve[i].value / equityCurve[i - 1].value) - 1;
    returns.push(r);
  }
  const avg = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const sd = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / (returns.length || 1));
  const totalReturn = ((equityCurve[equityCurve.length - 1].value / startingCapital) - 1) * 100;
  // max drawdown
  let peak = -Infinity;
  let maxDD = 0;
  equityCurve.forEach(pt => {
    peak = Math.max(peak, pt.value);
    maxDD = Math.max(maxDD, (peak - pt.value) / peak);
  });
  return {
    totalReturnPct: Number(totalReturn.toFixed(2)),
    avgDailyReturn: Number((avg * 100).toFixed(4)),
    stdDev: Number((sd * 100).toFixed(4)),
    maxDrawdownPct: Number((maxDD * 100).toFixed(2)),
    tradesCount: trades.length,
  };
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" }});

    const body = await req.json();
    const { symbol, interval = "1d", startDate, endDate, startingCapital = 10000 } = body;
    if (!symbol || !startDate || !endDate) return new Response(JSON.stringify({ error: "Missing params" }), { status: 400, headers: { "Content-Type": "application/json" }});

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user || !user.strategyUrl) return new Response(JSON.stringify({ error: "Strategy URL not set" }), { status: 400, headers: { "Content-Type": "application/json" }});

    const candles = await fetchKlinesRange(symbol, interval, startDate, endDate); // array of [ts,o,h,l,c,v] or objects depending on your klines route
    if (!Array.isArray(candles) || candles.length === 0) {
      return new Response(JSON.stringify({ error: "No candles returned" }), { status: 400, headers: { "Content-Type": "application/json" }});
    }

    // normalize to objects if array-of-arrays: try to detect
    const normalized = candles.map(c => {
      if (Array.isArray(c)) {
        return { time: c[0], open: c[1], high: c[2], low: c[3], close: c[4], volume: c[5] };
      }
      return c;
    });

    let cash = Number(startingCapital);
    let position = 0; // amount of asset
    const equityCurve = [];
    const trades = [];

    // We'll iterate step-by-step
    for (let i = 0; i < normalized.length; i++) {
      const slice = normalized.slice(0, i + 1); // full history up to current
      const latest = slice[slice.length - 1];
      const payload = {
        symbol,
        interval,
        candles: slice,
        account: { cash, positions: { [symbol]: position } },
        meta: { runType: "backtest", stepIndex: i, stepTime: latest.time },
      };

      let decision;
      try {
        decision = await callStrategy(user.strategyUrl, payload);
      } catch (err) {
        // log but continue; treat as HOLD
        user.strategyLogs = user.strategyLogs || [];
        user.strategyLogs.push({ at: new Date(), payload, response: null, error: String(err.message || err) });
        if (user.strategyLogs.length > 100) user.strategyLogs = user.strategyLogs.slice(-100);
        await user.save();
        decision = { action: "HOLD" };
      }

      // Validate decision
      const action = (decision && decision.action) ? String(decision.action).toUpperCase() : "HOLD";
      const qty = Number(decision && decision.quantity ? decision.quantity : 0);

      const price = Number(latest.close);

      if (action === "BUY" && qty > 0) {
        const cost = qty * price;
        if (cost <= cash && qty > 0) {
          cash -= cost;
          position += qty;
          trades.push({ date: new Date(latest.time), action: "BUY", quantity: qty, price });
        }
      } else if (action === "SELL" && qty > 0) {
        const sellQty = Math.min(position, qty);
        if (sellQty > 0) {
          position -= sellQty;
          cash += sellQty * price;
          trades.push({ date: new Date(latest.time), action: "SELL", quantity: sellQty, price });
        }
      }
      // compute equity
      const equity = cash + (position * price);
      equityCurve.push({ time: latest.time, value: Number(equity) });
    }

    const metrics = computeMetrics(equityCurve, trades, startingCapital);
    return new Response(JSON.stringify({ startingCapital, finalValue: equityCurve[equityCurve.length - 1].value, equityCurve, trades, metrics }), { status: 200, headers: { "Content-Type": "application/json" }});
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err.message || err) }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}
