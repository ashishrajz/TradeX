import redis from "@/lib/redis";

export const revalidate = 0;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  let symbol = (searchParams.get("symbol") || "BTCUSDT").toUpperCase();

  // --- Normalize symbol (e.g. "SOL" → "SOLUSDT") ---
  if (!symbol.endsWith("USDT")) symbol = `${symbol}USDT`;

  const cacheKey = `ticker:${symbol}`;
  const coinId = mapSymbolToCoinId(symbol);

  try {
    // 1️⃣ Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) return new Response(cached, { status: 200 });

    let data = null;

    // 2️⃣ Try CoinGecko primary
    if (coinId) {
      try {
        const geckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,usdt,btc,eth&include_24hr_change=true`;
        const geckoRes = await fetch(geckoUrl, {
          headers: {
            "User-Agent": "TradeX/1.0",
            "x-cg-demo-api-key": process.env.COINGECKO_API_KEY || "",
          },
          next: { revalidate: 0 },
        });

        if (geckoRes.ok) {
          const json = await geckoRes.json();
          const coinData = json[coinId];
          if (coinData) {
            data = {
              source: "coingecko",
              symbol,
              lastPrice: coinData.usd ?? coinData.usdt ?? 0,
              priceChangePercent: coinData.usd_24h_change ?? 0,
            };
          }
        } else {
          console.warn(`[ticker] CoinGecko error ${geckoRes.status}`);
        }
      } catch (err) {
        console.error("[ticker] CoinGecko fetch failed:", err);
      }
    }

    // 3️⃣ Fallback proxy (Render safe)
    if (!data && coinId) {
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,usdt&include_24hr_change=true`
        )}`;

        const proxyRes = await fetch(proxyUrl);
        if (proxyRes.ok) {
          const json = await proxyRes.json();
          const coinData = json[coinId];
          if (coinData) {
            data = {
              source: "coingecko-proxy",
              symbol,
              lastPrice: coinData.usd ?? coinData.usdt ?? 0,
              priceChangePercent: coinData.usd_24h_change ?? 0,
            };
          }
        } else {
          console.warn(`[ticker] Proxy error ${proxyRes.status}`);
        }
      } catch (err) {
        console.error("[ticker] Proxy fetch failed:", err);
      }
    }

    // 4️⃣ Binance fallback (if Render somehow allowed)
    if (!data) {
      try {
        const binanceRes = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
          { next: { revalidate: 0 } }
        );

        if (binanceRes.ok) {
          const json = await binanceRes.json();
          data = {
            source: "binance",
            symbol,
            lastPrice: Number(json.lastPrice ?? 0),
            priceChangePercent: Number(json.priceChangePercent ?? 0),
          };
        } else {
          console.warn(`[ticker] Binance error ${binanceRes.status}`);
        }
      } catch (err) {
        console.error("[ticker] Binance fetch failed:", err);
      }
    }

    // 5️⃣ No data fallback
    if (!data) {
      console.warn(`[ticker] No valid data for ${symbol}`);
      return new Response("No valid price data", { status: 502 });
    }

    // 6️⃣ Cache in Redis for 30 s
    await redis.set(cacheKey, JSON.stringify(data), "EX", 30);

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("[ticker] Unexpected error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// --- Mapping for CoinGecko IDs ---
function mapSymbolToCoinId(symbol) {
  const mapping = {
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
  return mapping[symbol] || null;
}
