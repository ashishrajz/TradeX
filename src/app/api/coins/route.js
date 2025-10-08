import redis from "@/lib/redis";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const per_page = searchParams.get("per_page") || "50";
  const withChart = searchParams.get("with_chart") === "1"; // 👈 new flag

  if (q) {
    const cacheKey = `coins:search:${q}:chart=${withChart}`;
    const cached = await redis.get(cacheKey);
    if (cached) return new Response(cached, { status: 200 });

    try {
      let ids = [];
      // Support comma-separated IDs (Dashboard use-case)
      if (q.includes(",")) {
        ids = q.split(",").map(id => id.trim().toLowerCase());
      } else {
        // Otherwise, normal search
        const searchUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`;
        const s = await fetch(searchUrl);
        if (!s.ok) return new Response(JSON.stringify([]), { status: 200 });
        const sr = await s.json();
        ids = sr.coins.map((c) => c.id).slice(0, 10);
      }

      if (ids.length === 0) return new Response(JSON.stringify([]), { status: 200 });

      // Fetch market data with sparkline
      const marketsUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(
        ids.join(",")
      )}&per_page=${ids.length}&sparkline=true&price_change_percentage=1h,24h,7d`;

      const m = await fetch(marketsUrl);
      if (!m.ok) return new Response(JSON.stringify([]), { status: 200 });
      let mr = await m.json();

      // Ensure sparkline_in_7d always exists
      mr = mr.map(coin => ({
        ...coin,
        sparkline_in_7d: coin.sparkline_in_7d || { price: [] }
      }));

      // Attach 30d historical prices if requested
      if (withChart) {
        const chartPromises = mr.map(async (coin) => {
          try {
            const histUrl = `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=30&interval=daily`;
            const h = await fetch(histUrl);
            const hist = await h.json();
            return {
              ...coin,
              chart: hist.prices.map(([t, p]) => ({ time: t, price: p })),
            };
          } catch {
            return coin;
          }
        });
        mr = await Promise.all(chartPromises);
      }

      // Prevent caching incomplete responses (e.g. partial or empty sparkline data)
const validCoins = mr.filter(
  (coin) =>
    coin?.image &&
    coin?.sparkline_in_7d?.price?.length > 0 &&
    coin.current_price
);

if (validCoins.length >= Math.floor(ids.length / 2)) {
  // only cache if at least half of them are valid
  await redis.set(cacheKey, JSON.stringify(validCoins), "EX", 300);
} else {
  console.warn("⚠️ Skipping Redis cache — partial data for:", q);
}

return new Response(JSON.stringify(validCoins.length ? validCoins : mr), {
  status: 200,
});

    } catch (err) {
      console.error("❌ Error in /api/coins search", err);
      return new Response(JSON.stringify([]), { status: 200 });
    }
  }

  // --- Handle featured coins ---
  const cacheKey = `coins:featured:${per_page}:chart=${withChart}`;
  const cached = await redis.get(cacheKey);
  if (cached) return new Response(cached, { status: 200 });

  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${per_page}&page=1&sparkline=true&price_change_percentage=1h,24h,7d`;

  try {
    const r = await fetch(url);
    if (!r.ok) return new Response(JSON.stringify([]), { status: 200 });
    let data = await r.json();

    // Ensure sparkline_in_7d always exists
    data = data.map(coin => ({
      ...coin,
      sparkline_in_7d: coin.sparkline_in_7d || { price: [] }
    }));

    if (withChart) {
      const chartPromises = data.map(async (coin) => {
        try {
          const histUrl = `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=30&interval=daily`;
          const h = await fetch(histUrl);
          const hist = await h.json();
          return {
            ...coin,
            chart: hist.prices.map(([t, p]) => ({ time: t, price: p })),
          };
        } catch {
          return coin;
        }
      });
      data = await Promise.all(chartPromises);
    }

    await redis.set(cacheKey, JSON.stringify(data), "EX", 300);
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching featured coins", err);
    return new Response(JSON.stringify([]), { status: 200 });
  }
}
