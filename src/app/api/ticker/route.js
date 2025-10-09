import redis from "@/lib/redis";

export const revalidate = 0;

/**
 * ✅ Unified Ticker Endpoint (CoinGecko primary, Binance fallback)
 * - Uses Redis cache for 30s
 * - Handles CoinGecko rate limits (429)
 * - Handles Binance region blocks (451)
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") || "BTCUSDT").toUpperCase();
  const cacheKey = `ticker:${symbol}`;

  try {
    // 1️⃣ Check Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) return new Response(cached, { status: 200 });

    let data = null;
    const coinId = mapSymbolToCoinId(symbol);

    // 2️⃣ Try CoinGecko first (primary)
    if (coinId) {
      try {
        const geckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,usdt,btc,eth&include_24hr_change=true`;
        const geckoRes = await fetch(geckoUrl, {
          headers: {
            "User-Agent": "TradeX/1.0",
            // ✅ Support both demo and pro keys automatically
            "x-cg-pro-api-key":
              process.env.COINGECKO_API_KEY?.startsWith("CG-")
                ? process.env.COINGECKO_API_KEY
                : undefined,
            "x-cg-demo-api-key":
              !process.env.COINGECKO_API_KEY?.startsWith("CG-")
                ? process.env.COINGECKO_API_KEY || ""
                : undefined,
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
        console.error("[ticker] CoinGecko fetch failed:", err.message);
      }
    }

    // 3️⃣ Fallback to Binance (secondary)
    if (!data) {
      try {
        const binanceUrl = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
        const binanceRes = await fetch(binanceUrl, { next: { revalidate: 0 } });

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
        console.error("[ticker] Binance fetch failed:", err.message);
      }
    }

    // 4️⃣ If still no data, return error
    if (!data) {
      console.error(`[ticker] No valid data for ${symbol}`);
      return new Response(JSON.stringify({ error: "No valid price data" }), {
        status: 502,
      });
    }

    // 5️⃣ Cache and return
    await redis.set(cacheKey, JSON.stringify(data), "EX", 30);
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("[ticker] Unexpected error:", err.message);
    return new Response("Internal Server Error", { status: 500 });
  }
}

/**
 * 🔁 Map trading symbols → CoinGecko coin IDs
 */
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
