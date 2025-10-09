import redis from "@/lib/redis";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "BTCUSDT";
  const interval = searchParams.get("interval") || "1d";
  const limit = searchParams.get("limit") || "500";

  const cacheKey = `klines:${symbol}:${interval}:${limit}`;

  // 1. Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) return new Response(cached, { status: 200 });

  const cgKey = process.env.COINGECKO_API_KEY || "";
  const isDemo = cgKey.includes("demo") || cgKey === "";

  try {
    let data;

    // ✅ 2A. If you have a full CoinGecko API key (not demo)
    if (!isDemo) {
      const coinId = mapSymbolToCoinId(symbol);
      const url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=90`;
      const r = await fetch(url, {
        headers: {
          "x-cg-pro-api-key": cgKey,
          "User-Agent": "TradeX/1.0",
        },
      });
      if (!r.ok) throw new Error(`CoinGecko error ${r.status}`);
      const raw = await r.json();

      data = raw.map((d) => ({
        openTime: d[0],
        open: d[1],
        high: d[2],
        low: d[3],
        close: d[4],
      }));
    } else {
      // ✅ 2B. Fallback to Binance mirror (for demo keys)
      const url = `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
      const r = await fetch(url);
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`Binance mirror error: ${txt}`);
      }
      const raw = await r.json();
      data = raw.map((d) => ({
        openTime: d[0],
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5]),
        closeTime: d[6],
      }));
    }

    // 3. Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(data), "EX", 300);
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("[klines]", err);
    return new Response(String(err.message || err), { status: 500 });
  }
}

// 🔁 helper: map Binance symbols to CoinGecko coin IDs
function mapSymbolToCoinId(symbol) {
  const base = symbol.replace("USDT", "").toLowerCase();
  const map = {
    btc: "bitcoin",
    eth: "ethereum",
    bnb: "binancecoin",
    sol: "solana",
    trx: "tron",
    xrp: "ripple",
    doge: "dogecoin",
    usdc: "usd-coin",
  };
  return map[base] || "bitcoin";
}
