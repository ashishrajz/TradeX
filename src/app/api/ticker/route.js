import redis from "@/lib/redis";

export const revalidate = 0; // disable Next caching

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol")?.toLowerCase() || "bitcoin";
  const vs = searchParams.get("vs")?.toLowerCase() || "usd";
  const cacheKey = `ticker:${symbol}:${vs}`;

  // Check Redis first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return new Response(cached, { status: 200 });
  }

  // Fetch from CoinGecko
  const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=${vs}`;
  try {
    const res = await fetch(apiUrl, {
      headers: { "User-Agent": "TradeX/1.0" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error("[ticker] CoinGecko error", res.status);
      return new Response("CoinGecko error", { status: 502 });
    }

    const data = await res.json();

    // Cache for 60s
    await redis.set(cacheKey, JSON.stringify(data), "EX", 60);

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("[ticker] Fetch failed", err);
    return new Response("Fetch failed", { status: 500 });
  }
}
