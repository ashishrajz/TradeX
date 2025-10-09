// src/lib/fetchPrice.js
export async function fetchCurrentPrice(symbol) {
  try {
    const id = symbol.replace("USDT", "").toLowerCase(); // e.g. BTCUSDT -> bitcoin
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ticker?symbol=${id}&vs=usd`;

    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) {
      const txt = await r.text();
      console.warn(`[fetchPrice] ⚠️ Non-OK ${symbol} status=${r.status} body=${txt}`);
      return null;
    }

    const json = await r.json();
    const coinData = json[id] || {};
    return {
      lastPrice: Number(coinData.usd || 0),
      priceChangePercent: 0,
      raw: json,
    };
  } catch (err) {
    console.error(`[fetchPrice] ❌ Error fetching price for ${symbol}:`, err);
    return null;
  }
}
