import redis from "@/lib/redis";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "BTCUSDT";
  const interval = searchParams.get("interval") || "1d";
  const limit = searchParams.get("limit") || "500";

  const cacheKey = `klines:${symbol}:${interval}:${limit}`;

  // 1️⃣ Check Redis cache
  const cached = await redis.get(cacheKey);
  if (cached) return new Response(cached, { status: 200 });

  try {
    // 2️⃣ Use Binance public mirror (this works from Render)
    const url = `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const r = await fetch(url);

    if (!r.ok) {
      const txt = await r.text();
      console.error(`[klines] Binance mirror error ${r.status}: ${txt}`);
      return new Response(`Binance error ${r.status}`, { status: 502 });
    }

    const raw = await r.json();
    const mapped = raw.map((d) => ({
      openTime: d[0],
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
      volume: parseFloat(d[5]),
      closeTime: d[6],
    }));

    // 3️⃣ Cache result for 5 minutes
    await redis.set(cacheKey, JSON.stringify(mapped), "EX", 300);

    return new Response(JSON.stringify(mapped), { status: 200 });
  } catch (err) {
    console.error("[klines]", err);
    return new Response(String(err.message || err), { status: 500 });
  }
}
