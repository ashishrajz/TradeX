import redis from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "BTCUSDT";
  const cacheKey = `ticker:${symbol}`;

  // ✅ Step 1: Check Redis cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return new Response(cached, { status: 200 });
  }

  try {
    // ✅ Step 2: Map Binance-style symbols to CoinGecko coin IDs
    const mapping = {
      BTCUSDT: "bitcoin",
      ETHUSDT: "ethereum",
      BNBUSDT: "binancecoin",
      SOLUSDT: "solana",
      DOGEUSDT: "dogecoin",
      XRPUSDT: "ripple",
      TRXUSDT: "tron",
      USDCUSDT: "usd-coin",
    };

    const coinId = mapping[symbol.toUpperCase()];
    if (!coinId) {
      return new Response(JSON.stringify({ error: `Unsupported symbol ${symbol}` }), { status: 400 });
    }

    // ✅ Step 3: Fetch from CoinGecko instead of Binance
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
    const r = await fetch(url, { cache: "no-store" });

    if (!r.ok) {
      console.error(`[ticker] CoinGecko error ${r.status}`);
      return new Response("CoinGecko error", { status: 502 });
    }

    const data = await r.json();
    const price = data[coinId]?.usd || 0;

    // ✅ Step 4: Convert to Binance-style format so rest of your app still works
    const formatted = {
      symbol,
      lastPrice: price,
      priceChangePercent: 0, // You can extend this if needed
    };

    // ✅ Step 5: Cache in Redis for 15 seconds
    await redis.set(cacheKey, JSON.stringify(formatted), "EX", 15);

    return new Response(JSON.stringify(formatted), { status: 200 });
  } catch (err) {
    console.error(`[ticker] Fetch failed for ${symbol}:`, err);
    return new Response("Failed to fetch price", { status: 500 });
  }
}
