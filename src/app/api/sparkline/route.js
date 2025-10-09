import redis from "@/lib/redis";

const API_BASE = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.CG_API_KEY;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // e.g. "bitcoin"
  const days = searchParams.get("days") || "7";

  if (!id)
    return new Response(JSON.stringify({ error: "Missing coin id" }), { status: 400 });

  const cacheKey = `sparkline:${id}:${days}`;
  const cached = await redis.get(cacheKey);
  if (cached) return new Response(cached, { status: 200 });

  try {
    const headers = API_KEY ? { "x-cg-demo-api-key": API_KEY } : {};
    const url = `${API_BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=hourly`;
    const r = await fetch(url, { headers });
    if (!r.ok) throw new Error(`CoinGecko sparkline error ${r.status}`);
    const data = await r.json();

    const formatted = data.prices.map(([t, p]) => ({ time: t, price: p }));
    await redis.set(cacheKey, JSON.stringify(formatted), "EX", 300);
    return new Response(JSON.stringify(formatted), { status: 200 });
  } catch (err) {
    console.error("[sparkline]", err);
    return new Response(JSON.stringify([]), { status: 200 });
  }
}
