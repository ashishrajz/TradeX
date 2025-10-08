"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import useSWR from "swr";
import Sidebar from "@/components/Sidebar";
import DashboardSummary from "@/components/DashboardSummary";
import DashboardCharts from "@/components/DashboardCharts";
import AssetRow from "@/components/AssetRow";
import AssetDetailBox from "@/components/AssetDetailBox";

const fetcher = (url) => fetch(url).then((r) => r.json());

/**
 * Robust fetcher that uses the same working /api/coins branch as FeaturedCoins.
 * Input: portfolioSymbols = array of strings like ["DOGEUSDT","BNBUSDT"]
 * Returns: { [portfolioSymbol]: sparklineArray }
 */
async function fetchAssetSparklinesForPortfolio(portfolioAssets = []) {
  if (!Array.isArray(portfolioAssets) || portfolioAssets.length === 0) return {};

  const normalize = (s) =>
    (s || "").replace(/(USDT|BUSD|USD|BTC|ETH)$/i, "").trim().toLowerCase();

  const fallbackMap = {
    btc: "bitcoin",
    eth: "ethereum",
    sol: "solana",
    bnb: "binancecoin",
    ada: "cardano",
    doge: "dogecoin",
    xrp: "ripple",
    dot: "polkadot",
    avax: "avalanche-2",
    matic: "matic-network",
    trx: "tron",
    usdc: "usd-coin",
    usdt: "tether",
    link: "chainlink",
    ltc: "litecoin",
    uni: "uniswap",
    shib: "shiba-inu",
  };

  // ✅ Normalize + map unique symbols
  const normalizedSymbols = Array.from(
    new Set(portfolioAssets.map((a) => normalize(a.symbol)))
  );
  const mappedSymbols = normalizedSymbols.map(
    (s) => fallbackMap[s] || s
  );

  try {
    // ✅ Step 1: Try to get all coins in one cached API call
    const url = `/api/coins?q=${encodeURIComponent(
      mappedSymbols.join(",")
    )}&per_page=${mappedSymbols.length}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Coin API failed (${res.status})`);
    const data = await res.json();

    const result = {};
    const byId = new Map();
    const bySymbol = new Map();

    (Array.isArray(data) ? data : []).forEach((coin) => {
      if (!coin) return;
      byId.set(String(coin.id).toLowerCase(), coin);
      bySymbol.set(String(coin.symbol).toLowerCase(), coin);
    });

    // ✅ Step 2: Match each portfolio asset to its CoinGecko data
    for (const asset of portfolioAssets) {
      const norm = normalize(asset.symbol);
      const mapped = fallbackMap[norm] || norm;

      let coin =
        bySymbol.get(norm) ||
        bySymbol.get(mapped) ||
        byId.get(norm) ||
        byId.get(mapped);

      // 🔁 Step 3: Retry individually only if data missing or empty sparkline
      if (!coin || !coin.sparkline_in_7d?.price?.length) {
        console.warn(`⚠️ Missing data for ${asset.symbol} → retrying...`);
        try {
          const retryUrl = `/api/coins?q=${mapped}&per_page=1`;
          const retryRes = await fetch(retryUrl);
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            const retryCoin = Array.isArray(retryData) ? retryData[0] : null;
            if (retryCoin?.sparkline_in_7d?.price?.length) {
              coin = retryCoin;
              
            } else {
              console.warn(`❌ Retry returned no sparkline for ${asset.symbol}`);
            }
          }
          // Short delay to avoid hitting API limits
          await new Promise((r) => setTimeout(r, 250));
        } catch (err) {
          console.error(`❌ Retry failed for ${asset.symbol}:`, err);
        }
      }

      // ✅ Skip if still no data
      if (!coin) continue;

      result[asset.symbol] = {
        image: coin.image || "/default-coin.png",
        sparkline: coin.sparkline_in_7d?.price || [],
        priceChangePercent: coin.price_change_percentage_24h ?? 0,
      };
    }

    // ✅ Step 4: Handle case where API rate-limited (empty response)
    const missing = portfolioAssets.filter((a) => !result[a.symbol]);
    if (missing.length > 0) {
      console.warn("⚠️ Missing symbols after full fetch:", missing.map((a) => a.symbol));
    }

    return result;
  } catch (err) {
    console.error("❌ fetchAssetSparklinesForPortfolio failed:", err);
    return {};
  }
}




export default function DashboardPage() {
  const { data: portfolio, mutate: mutatePortfolio } = useSWR(
    "/api/user/portfolio",
    fetcher,
    { refreshInterval: 15000 }
  );

  const { data: trades } = useSWR("/api/user/trades?limit=50", fetcher);

  const [expandedSymbol, setExpandedSymbol] = useState(null);
  const [assetsWithSparkline, setAssetsWithSparkline] = useState([]);

  // When portfolio loads (or updates), fetch sparklines and merge into assets
useEffect(() => {
  if (!portfolio?.assets || portfolio.assets.length === 0) {
    setAssetsWithSparkline([]);
    return;
  }

  let mounted = true;

  (async () => {
    const assets = portfolio.assets;
    setAssetsWithSparkline((prev) => {
      // show existing data while new data loads (prevents flicker)
      return prev.length ? prev : assets;
    });

    try {
      const sparkMap = await fetchAssetSparklinesForPortfolio(assets);
      if (!mounted) return;

      const merged = assets.map((a) => {
        const sparkData = sparkMap[a.symbol];

        return {
          ...a,
          // ✅ Use cached image if available from last render
          image:
            sparkData?.image ||
            a.image ||
            "/default-coin.png",

          // ✅ Gracefully fallback to previous sparkline if new one fails
          sparkline:
            sparkData?.sparkline?.length
              ? sparkData.sparkline
              : (a.sparkline || []),

          priceChangePercent: sparkData?.priceChangePercent ?? a.priceChangePercent ?? 0,
        };
      });

      setAssetsWithSparkline(merged);
    } catch (err) {
      console.error("❌ Failed merging sparkline data:", err);
    }
  })();

  return () => {
    mounted = false;
  };
}, [portfolio]);


  // compute total asset value for weighting from merged list
  const totalAssetValue = assetsWithSparkline.reduce(
    (acc, a) =>
      acc + ((a.currentPrice ?? a.price) || 0) * (a.quantity || 0),
    0
  );

  const assetsWithMeta = assetsWithSparkline.map((a) => ({
    ...a,
    portfolioValue: totalAssetValue,
  }));

  return (
    <div className="flex bg-black min-h-screen text-white">
      <Sidebar activeTab="dashboard" setActiveTab={() => {}} />

      <div className="flex-1 p-6 ml-20 space-y-6">
        <h1 className="text-4xl font-bold text-green-400 mb-4">Dashboard</h1>

        <DashboardSummary portfolio={portfolio || {}} />

        {portfolio && (
          <DashboardCharts
            equityHistory={portfolio.equityHistory || []}
            assets={portfolio.assets || []}
            cash={portfolio.cash || 0}
          />
        )}

        {/* Assets section */}
        <div className="bg-gray-900/60 p-6 rounded-2xl border border-green-500/20">
          <h2 className="text-2xl font-bold text-green-400 mb-4">Assets</h2>
          <div className="grid grid-cols-3 gap-6 relative items-start">
  {/* Left side: Asset list */}
  <div
    className={
      expandedSymbol ? "col-span-2 space-y-3" : "col-span-3 space-y-3"
    }
  >
    {assetsWithMeta.length > 0 ? (
      assetsWithMeta.map((asset) => (
        <AssetRow
          key={asset.symbol}
          asset={asset}
          isExpanded={expandedSymbol === asset.symbol}
          onOpenDetail={() =>
            setExpandedSymbol((prev) =>
              prev === asset.symbol ? null : asset.symbol
            )
          }
          anySelected={!!expandedSymbol}
        />
      ))
    ) : (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="animate-pulse flex justify-between items-center p-5 bg-gray-800 rounded-2xl"
          >
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-gray-700 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-700 rounded" />
                <div className="h-3 w-16 bg-gray-700 rounded" />
              </div>
            </div>
            <div className="h-4 w-10 bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Right side: Sticky detail box */}
  {expandedSymbol && (
    <div className="col-span-1 space-y-3 sticky top-24 self-start">
      <AssetDetailBox
        asset={assetsWithMeta.find((a) => a.symbol === expandedSymbol)}
      />
    </div>
  )}
</div>

        </div>

        {/* Recent Trades */}
        <div className="mt-10">
          <h2 className="text-3xl font-bold text-green-400 mb-6 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">
            Recent Trades
          </h2>

          <div className="space-y-4">
            {trades?.length ? (
              trades.slice(0, 10).map((t, i) => (
                <div
                  key={t._id || `${t.symbol}-${i}`}
                  className="backdrop-blur-xl bg-gray-900/60 hover:bg-gray-800/60 p-5 rounded-2xl border border-green-500/20 hover:border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.15)] hover:shadow-[0_0_25px_rgba(34,197,94,0.25)] flex justify-between items-center transition-all duration-300 cursor-pointer"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]">
                      {t.symbol}
                    </h3>
                    <div className="text-sm text-gray-300 mt-1 flex flex-wrap gap-3">
                      <span
                        className={`font-semibold ${
                          t.side?.toLowerCase() === "buy"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {t.side?.toUpperCase() || "N/A"}
                      </span>
                      <span>Qty: {t.quantity || 0}</span>
                      <span>Price: ${t.price || 0}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 text-right">
                    {new Date(t.date || t.at).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-4">
  {Array.from({ length: 3 }).map((_, idx) => (
    <div
      key={idx}
      className="animate-pulse flex justify-between items-center p-5 bg-gray-800 rounded-2xl"
    >
      <div>
        <div className="h-4 w-32 bg-gray-700 rounded mb-2" />
        <div className="h-3 w-40 bg-gray-700 rounded" />
      </div>
      <div className="h-4 w-20 bg-gray-700 rounded" />
    </div>
  ))}
</div>

            )}
          </div>
        </div>
      </div>
    </div>
  );
}
