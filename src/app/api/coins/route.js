import redis from "@/lib/redis";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const per_page = searchParams.get("per_page") || "50";


  // --- Handle search ---
  if (q) {
    const cacheKey = `coins:search:${q}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      
      return new Response(cached, { status: 200 });
    }

    try {
      // 1️⃣ Try CoinGecko search first
      const searchUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`;
      
      const s = await fetch(searchUrl);

      if (!s.ok) {
        const text = await s.text();
        console.warn("⚠️ CoinGecko search error text:", text);
        return new Response(JSON.stringify([]), { status: 200 });
      }

      const sr = await s.json();
  
      let ids = sr.coins.map((c) => c.id);

      // 2️⃣ Limit to top 10 IDs to avoid throttling
      ids = ids.slice(0, 10);

      if (ids.length === 0) {
        
        return new Response(JSON.stringify([]), { status: 200 });
      }

      

      // 3️⃣ Get market data
      const marketsUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(
        ids.join(",")
      )}&per_page=${ids.length}`;
     

      const m = await fetch(marketsUrl);
      if (!m.ok) {
        const text = await m.text();
        console.warn("⚠️ CoinGecko markets error text:", text);
        return new Response(JSON.stringify([]), { status: 200 });
      }

      const mr = await m.json();
      

      await redis.set(cacheKey, JSON.stringify(mr), "EX", 120); // 2 min cache
      return new Response(JSON.stringify(mr), { status: 200 });
    } catch (err) {
      console.error("❌ Error in /api/coins search", err);
      return new Response(JSON.stringify([]), { status: 200 });
    }
  }

  // --- Handle featured coins ---
  const cacheKey = `coins:featured:${per_page}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    
    return new Response(cached, { status: 200 });
  }

  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${per_page}&page=1&sparkline=false`;
  try {
    
    const r = await fetch(url);
    if (!r.ok) {
      const text = await r.text();
      console.warn("⚠️ CoinGecko featured error text:", text);
      return new Response(JSON.stringify([]), { status: 200 });
    }

    const data = await r.json();
    
    await redis.set(cacheKey, JSON.stringify(data), "EX", 300); // 5 min cache
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching featured coins", err);
    return new Response(JSON.stringify([]), { status: 200 });
  }
}
