import redis from "@/lib/redis";

const API_BASE = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.CG_API_KEY; // ✅ add this in Render env vars

async function fetchWithKey(url) {
  const headers = API_KEY ? { "x-cg-demo-api-key": API_KEY } : {};
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`CoinGecko error ${r.status}`);
  return r.json();
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const per_page = searchParams.get("per_page") || "50";
  const withChart = searchParams.get("with_chart") === "1";

  try {
    if (q) {
      const cacheKey = `coins:search:${q}:chart=${withChart}`;
      const cached = await redis.get(cacheKey);
      if (cached) return new Response(cached, { status: 200 });

      let ids = [];

      // 🔹 Case 1: Comma-separated IDs
      if (q.includes(",")) {
        ids = q.split(",").map((id) => id.trim().toLowerCase());
      } else {
        // 🔹 Case 2: Search CoinGecko
        const searchUrl = `${API_BASE}/search?query=${encodeURIComponent(q)}`;
        const sr = await fetchWithKey(searchUrl);
        ids = sr.coins.map((c) => c.id).slice(0, 10);
      }

      if (ids.length === 0)
        return new Response(JSON.stringify([]), { status: 200 });

      // 🔹 Market data
      const marketsUrl = `${API_BASE}/coins/markets?vs_currency=usd&ids=${encodeURIComponent(
        ids.join(",")
      )}&per_page=${ids.length}&sparkline=true&price_change_percentage=1h,24h,7d`;
      let mr = await fetchWithKey(marketsUrl);

      mr = mr.map((coin) => ({
        ...coin,
        sparkline_in_7d: coin.sparkline_in_7d || { price: [] },
      }));

      // 🔹 Optional 30d chart
      if (withChart) {
        const chartPromises = mr.map(async (coin) => {
          try {
            const histUrl = `${API_BASE}/coins/${coin.id}/market_chart?vs_currency=usd&days=30&interval=daily`;
            const hist = await fetchWithKey(histUrl);
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

      const validCoins = mr.filter(
        (coin) =>
          coin?.image &&
          coin?.sparkline_in_7d?.price?.length > 0 &&
          coin.current_price
      );

      if (validCoins.length >= Math.floor(ids.length / 2)) {
        await redis.set(cacheKey, JSON.stringify(validCoins), "EX", 300);
      }

      return new Response(
        JSON.stringify(validCoins.length ? validCoins : mr),
        { status: 200 }
      );
    }

    // --- 🔹 Featured Coins ---
    const cacheKey = `coins:featured:${per_page}:chart=${withChart}`;
    const cached = await redis.get(cacheKey);
    if (cached) return new Response(cached, { status: 200 });

    const url = `${API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${per_page}&page=1&sparkline=true&price_change_percentage=1h,24h,7d`;
    let data = await fetchWithKey(url);

    data = data.map((coin) => ({
      ...coin,
      sparkline_in_7d: coin.sparkline_in_7d || { price: [] },
    }));

    if (withChart) {
      const chartPromises = data.map(async (coin) => {
        try {
          const histUrl = `${API_BASE}/coins/${coin.id}/market_chart?vs_currency=usd&days=30&interval=daily`;
          const hist = await fetchWithKey(histUrl);
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
    console.error("❌ Error in /api/coin:", err);
    return new Response(JSON.stringify([]), { status: 200 });
  }
}
