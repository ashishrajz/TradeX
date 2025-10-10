import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

// ===== Helper functions =====
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
    indicatorValue = candles.at(-1)[rule.params?.field || "close"];
  }
  if (rule.indicator === "SMA") {
    indicatorValue = SMA(closes, rule.params?.period || 20);
  }
  if (rule.indicator === "EMA") {
    indicatorValue = EMA(closes, rule.params?.period || 20);
  }
  if (rule.indicator === "RSI") {
    indicatorValue = RSI(closes, rule.params?.period || 14);
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

// ====== Main API Handler ======
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user) return new Response("User not found", { status: 404 });

    const body = await req.json();
    const { symbol, startDate, endDate, interval, capital, strategyId, strategyUrl } = body;

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/klines?symbol=${symbol}&interval=${interval}&startDate=${startDate}&endDate=${endDate}`;
    const r = await fetch(url);
    const candles = await r.json();

    let cash = Number(capital) || 10000;
    let position = 0;
    const trades = [];
    const equityCurve = [];

    // ==================== STRATEGY ID MODE ====================
    if (strategyId) {
      const strategy = user.strategies.find(s => String(s._id) === String(strategyId));
      if (!strategy) return new Response("Strategy not found", { status: 404 });

      for (let i = 20; i < candles.length; i++) {
        const slice = candles.slice(0, i + 1);
        const c = candles[i];

        let matchedRule = null;
        for (const rule of strategy.rules) {
          const res = evaluateRule(rule, slice);
          if (res) { matchedRule = res; break; }
        }

        if (matchedRule?.action === "BUY" && cash >= c.close) {
          const qty = matchedRule.quantity || 1;
          const cost = qty * c.close;
          if (cash >= cost) {
            position += qty;
            cash -= cost;
            trades.push({ type: "BUY", qty, price: c.close, time: c.openTime });
          }
        }

        if (matchedRule?.action === "SELL" && position > 0) {
          const qty = Math.min(matchedRule.quantity || position, position);
          position -= qty;
          cash += qty * c.close;
          trades.push({ type: "SELL", qty, price: c.close, time: c.openTime });
        }

        equityCurve.push({ time: c.openTime, value: cash + position * c.close });
      }
    }

    // ==================== STRATEGY URL MODE ====================
    else if (strategyUrl || user.strategyUrl) {
      const activeUrl = strategyUrl || user.strategyUrl;
      console.log(`[backtest] Using strategy URL: ${activeUrl}`);

      for (const candle of candles) {
        const { openTime, close } = candle;

        let decision = { action: "HOLD" };
        try {
          const resp = await fetch(activeUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symbol, price: close, candle, position, cash }),
          });

          console.log("[backtest] Sent data to:", activeUrl, "status:", resp.status);

          const text = await resp.text();
          console.log("[backtest] Raw response:", text);

          try {
            decision = JSON.parse(text);
          } catch {
            console.warn("[backtest] Invalid JSON, treating as HOLD");
          }
        } catch (err) {
          console.error("[backtest] Strategy API call failed:", err);
        }

        // Apply actions
        if (decision.action === "BUY" && cash >= close) {
          const qty = decision.quantity || 1;
          const cost = close * qty;
          if (cash >= cost) {
            position += qty;
            cash -= cost;
            trades.push({ type: "BUY", qty, price: close, time: openTime });
          }
        }

        if (decision.action === "SELL" && position > 0) {
          const qty = Math.min(decision.quantity || position, position);
          position -= qty;
          cash += close * qty;
          trades.push({ type: "SELL", qty, price: close, time: openTime });
        }

        equityCurve.push({ time: openTime, value: cash + position * close });
      }
    } else {
      return new Response("No strategy provided", { status: 400 });
    }

    // Return results
    return Response.json({ equityCurve, trades, candles });
  } catch (err) {
    console.error("❌ Backtest error", err);
    return new Response(err.message, { status: 500 });
  }
}
