import redis from "@/lib/redis";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "BTCUSDT";
  const interval = searchParams.get("interval") || "1d";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const limit = searchParams.get("limit") || "500";

  // Convert date strings (e.g., "2023-01-01") → timestamps
  const startTime = startDate ? new Date(startDate).getTime() : undefined;
  const endTime = endDate ? new Date(endDate).getTime() : undefined;

  // Create a more precise cache key
  const cacheKey = `klines:${symbol}:${interval}:${startDate || "none"}:${endDate || "none"}`;

  // ✅ 1. Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log("[klines] Cache hit for", cacheKey);
    return new Response(cached, { status: 200 });
  }

  try {
    // ✅ 2. Build Binance API URL properly
    let url = `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=${interval}`;

    if (startTime) url += `&startTime=${startTime}`;
    if (endTime) url += `&endTime=${endTime}`;
    else url += `&limit=${limit}`;

    console.log("[klines] Fetching:", url);

    const r = await fetch(url);
    if (!r.ok) {
      const txt = await r.text();
      console.error(`[klines] Binance error ${r.status}: ${txt}`);
      return new Response(`Binance error ${r.status}`, { status: 502 });
    }

    const raw = await r.json();

    // ✅ 3. Map response cleanly
    const mapped = raw.map((d) => ({
      openTime: d[0],
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
      volume: parseFloat(d[5]),
      closeTime: d[6],
    }));

    // ✅ 4. Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(mapped), "EX", 300);

    return new Response(JSON.stringify(mapped), { status: 200 });
  } catch (err) {
    console.error("[klines]", err);
    return new Response(String(err.message || err), { status: 500 });
  }
}
