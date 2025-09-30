// src/app/api/strategy/decision/route.js
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

// helper: absolute base for internal fetch
function getBase() {
  return process.env.NEXT_PUBLIC_BASE_URL ||
         (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
}

async function fetchKlines(symbol, interval = "1m", limit = 100) {
  const base = getBase();
  const url = `${base}/api/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Failed to fetch klines");
  return r.json();
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

    const body = await req.json();
    const { symbol = "BTCUSDT", interval = "1m", lastN = 100 } = body;

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user || !user.strategyUrl) {
      return new Response(JSON.stringify({ error: "Strategy URL not set on dashboard" }), { status: 400, headers: { "Content-Type": "application/json" }});
    }

    const candles = await fetchKlines(symbol, interval, lastN);
    const payload = {
      symbol,
      interval,
      candles,
      account: { cash: user.cash, positions: Object.fromEntries(user.positions || {}) },
      meta: { runType: "instant" },
    };

    // call user strategy
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    let res;
    try {
      res = await fetch(user.strategyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(t);
    } catch (err) {
      clearTimeout(t);
      return new Response(JSON.stringify({ error: "Strategy call failed: " + err.message }), { status: 502, headers: { "Content-Type": "application/json" }});
    }

    if (!res.ok) {
      const txt = await res.text().catch(()=>"");
      return new Response(JSON.stringify({ error: "Strategy returned error: " + txt }), { status: 502, headers: { "Content-Type": "application/json" }});
    }

    const decision = await res.json();
    // log a short entry in user.strategyLogs for debugging
    user.strategyLogs = user.strategyLogs || [];
    user.strategyLogs.push({ at: new Date(), payload, response: decision, error: null });
    if (user.strategyLogs.length > 100) user.strategyLogs = user.strategyLogs.slice(-100);
    await user.save();

    return new Response(JSON.stringify({ decision }), { status: 200, headers: { "Content-Type": "application/json" }});
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err.message || err) }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}
