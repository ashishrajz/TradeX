import redis from "@/lib/redis";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "BTCUSDT";
  const interval = searchParams.get("interval") || "1d";
  const limit = searchParams.get("limit") || "500";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  // Build cache key dynamically
  const cacheKey = startDate && endDate
    ? `klines:${symbol}:${interval}:${startDate}:${endDate}:${limit}`
    : `klines:${symbol}:${interval}:${limit}`;

  // 1. Redis cache check
  const cached = await redis.get(cacheKey);
  if (cached) {
    
    return new Response(cached, { status: 200 });
  }

  // 2. Build Binance URL dynamically
  const params = new URLSearchParams({ symbol, interval });
  if (startDate && endDate) {
    params.append("startTime", new Date(startDate).getTime().toString());
    params.append("endTime", new Date(endDate).getTime().toString());
  } else {
    params.append("limit", limit);
  }

  const url = `https://api.binance.com/api/v3/klines?${params.toString()}`;

  try {
    const r = await fetch(url);
    if (!r.ok) {
      const txt = await r.text();
      return new Response(`Binance error: ${txt}`, { status: 502 });
    }
    const data = await r.json();

    const mapped = data.map(d => ({
      openTime: d[0],
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
      volume: parseFloat(d[5]),
      closeTime: d[6],
    }));

    // 3. Save to Redis for 5 min
    await redis.set(cacheKey, JSON.stringify(mapped), "EX", 300);
    return new Response(JSON.stringify(mapped), { status: 200 });
  } catch (err) {
    return new Response(String(err.message || err), { status: 500 });
  }
}
