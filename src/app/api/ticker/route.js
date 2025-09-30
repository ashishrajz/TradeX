import redis from "@/lib/redis";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "BTCUSDT";
  const cacheKey = `ticker:${symbol}`;

  // 1. Check Redis first (short TTL)
  const cached = await redis.get(cacheKey);
  if (cached) {
   
    return new Response(cached, { status: 200 });
  }

  // 2. Fetch from Binance (24hr stats)
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
  try {
    const r = await fetch(url);
    if (!r.ok) return new Response("Binance error", { status: 502 });
    const data = await r.json();
   

    // 3. Cache in Redis with TTL of 15 seconds (ticker changes fast)
    await redis.set(cacheKey, JSON.stringify(data), "EX", 15);

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(String(err.message || err), { status: 500 });
  }
}
