import redis from "@/lib/redis";

export const revalidate = 0;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") || "BTCUSDT").toUpperCase();
  const interval = searchParams.get("interval") || "1d";
  const limit = parseInt(searchParams.get("limit") || "500", 10);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  // 🧠 Redis cache key
  const cacheKey =
    startDate && endDate
      ? `klines:${symbol}:${interval}:${startDate}:${endDate}:${limit}`
      : `klines:${symbol}:${interval}:${limit}`;

  // 1️⃣ Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return new Response(cached, { status: 200 });
  }

  let data = null;

  // 2️⃣ Try CoinGecko (if available for this symbol)
  const coinId = mapSymbolToCoinId(symbol);
  if (coinId) {
    try {
      const geckoUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=90&interval=${mapInterval(interval)}`;
      const geckoRes = await fetch(geckoUrl, {
        headers: {
          "x-cg-pro-api-key": process.env.COINGECKO_API_KEY || "",
          "User-Agent": "TradeX/1.0",
        },
        next: { revalidate: 0 },
      });

      if (geckoRes.ok) {
        const json = await geckoRes.json();
        // CoinGecko returns [timestamp, price] arrays
        const prices = json.prices || [];
        const mapped = prices.slice(-limit).map((p) => ({
          openTime: p[0],
          open: p[1],
          high: p[1],
          low: p[1],
          close: p[1],
          volume: 0,
          closeTime: p[0],
        }));
        data = mapped;
      } else {
        console.warn(`[klines] CoinGecko error ${geckoRes.status}`);
      }
    } catch (err) {
      console.error("[klines] CoinGecko fetch failed:", err);
    }
  }

  // 3️⃣ Fallback → Binance
  if (!data) {
    try {
      const params = new URLSearchParams({ symbol, interval });
      if (startDate && endDate) {
        params.append("startTime", new Date(startDate).getTime().toString());
        params.append("endTime", new Date(endDate).getTime().toString());
      } else {
        params.append("limit", limit.toString());
      }

      const binanceUrl = `https://api.binance.com/api/v3/klines?${params}`;
      const r = await fetch(binanceUrl);
      if (!r.ok) {
        const txt = await r.text();
        console.warn(`[klines] Binance error: ${txt}`);
        return new Response(`Binance error: ${txt}`, { status: 502 });
      }

      const json = await r.json();
      data = json.map((d) => ({
        openTime: d[0],
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5]),
        closeTime: d[6],
      }));
    } catch (err) {
      console.error("[klines] Binance fetch failed:", err);
      return new Response(String(err.message || err), { status: 500 });
    }
  }

  // 4️⃣ Cache + return
  if (data) {
    await redis.set(cacheKey, JSON.stringify(data), "EX", 300);
    return new Response(JSON.stringify(data), { status: 200 });
  }

  return new Response("No valid data", { status: 502 });
}

/** Coin symbol → CoinGecko ID */
function mapSymbolToCoinId(symbol) {
  const map = {
    BTCUSDT: "bitcoin",
    ETHUSDT: "ethereum",
    BNBUSDT: "binancecoin",
    XRPUSDT: "ripple",
    DOGEUSDT: "dogecoin",
    SOLUSDT: "solana",
    TRXUSDT: "tron",
    ADAUSDT: "cardano",
    USDCUSDT: "usd-coin",
  };
  return map[symbol] || null;
}

/** Normalize Binance interval to CoinGecko granularity */
function mapInterval(interval) {
  const map = {
    "1m": "minutely",
    "5m": "minutely",
    "15m": "minutely",
    "30m": "minutely",
    "1h": "hourly",
    "4h": "hourly",
    "1d": "daily",
    "1w": "daily",
  };
  return map[interval] || "daily";
}
