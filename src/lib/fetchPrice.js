export async function fetchCurrentPrice(symbol) {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/ticker?symbol=${encodeURIComponent(symbol)}`;
      
      const r = await fetch(url);
      if (!r.ok) {
        const txt = await r.text();
        console.warn(`[fetchPrice] Non-OK ${symbol} status=${r.status} body=${txt}`);
        return null;
      }
      const json = await r.json();
      
      return {
        lastPrice: Number(json.lastPrice ?? json.price ?? json.close ?? 0),
        priceChangePercent: Number(json.priceChangePercent ?? json.priceChange ?? 0),
        raw: json,
      };
    } catch (err) {
      console.error(`[fetchPrice] Error fetching price for ${symbol}:`, err);
      return null;
    }
  }
  