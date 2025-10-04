"use client";

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

  // Normalize portfolio symbols into queries (strip common quote suffixes)
  const normalize = (s) =>
    (s || "")
      .replace(/(USDT|BUSD|USD|BTC|ETH)$/i, "")
      .trim()
      .toLowerCase();

  // build a list of normalized queries (unique)
  const normalizedList = Array.from(
    new Set(portfolioAssets.map((a) => normalize(a.symbol)))
  );

  // call the same API branch as FeaturedCoins (search/featured) which supplies sparkline_in_7d
  // We use q=... and per_page to ask for those coins (the API already supports this).
  const url = `/api/coins?q=${encodeURIComponent(
    normalizedList.join(",")
  )}&per_page=${normalizedList.length}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      console.warn("fetchAssetSparklinesForPortfolio: coins API returned", resp.status);
      return {};
    }
    const data = await resp.json();
    // build maps keyed by coin.id and coin.symbol (lowercase)
    const byId = new Map();
    const bySymbol = new Map();
    (Array.isArray(data) ? data : []).forEach((c) => {
      if (!c) return;
      if (c.id) byId.set(String(c.id).toLowerCase(), c);
      if (c.symbol) bySymbol.set(String(c.symbol).toLowerCase(), c);
    });

    const result = {};

    // For each portfolio asset, attempt to find best coin match:
    for (const asset of portfolioAssets) {
      const raw = String(asset.symbol || "");
      const norm = normalize(raw); // e.g. DOGEUSDT -> doge

      // Try matches in this order:
      // 1) exact symbol match (coin.symbol === norm)
      // 2) id match (coin.id === norm)
      // 3) coin whose symbol is prefix of raw (e.g., coin.symbol === "doge" and raw === "DOGEUSDT")
      // 4) first coin whose id or symbol contains norm
      let coin =
        bySymbol.get(norm) ||
        byId.get(norm) ||
        [...bySymbol.values()].find((c) =>
          raw.toLowerCase().startsWith(String(c.symbol || "").toLowerCase())
        ) ||
        [...byId.values()].find((c) =>
          String(c.id || "").toLowerCase().includes(norm)
        ) ||
        [...bySymbol.values()][0]; // last resort: pick first returned coin (will be undefined sometimes)

      // Extract sparkline_in_7d.price if present, else [].
      const spark =
        (coin && coin.sparkline_in_7d && Array.isArray(coin.sparkline_in_7d.price))
          ? coin.sparkline_in_7d.price
          : [];

      result[asset.symbol] = spark;
    }

    // Debug: remove/disable in production
    console.debug("fetchAssetSparklinesForPortfolio url:", url);
    console.debug("fetchAssetSparklinesForPortfolio result sample:", Object.fromEntries(Object.entries(result).slice(0,5)));

    return result;
  } catch (err) {
    console.error("fetchAssetSparklinesForPortfolio error:", err);
    return {};
  }
}

export default function DashboardPage() {
  const { data: portfolio, mutate: mutatePortfolio } = useSWR(
    "/api/user/portfolio",
    fetcher,
    { refreshInterval: 15_000 }
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
      // fetch sparkline map keyed by portfolio asset symbol
      const sparkMap = await fetchAssetSparklinesForPortfolio(assets);
      if (!mounted) return;

      const merged = assets.map((a) => ({
        ...a,
        // either the sparkline from map or fallback empty array
        sparkline: sparkMap[a.symbol] || [],
      }));

      setAssetsWithSparkline(merged);
    })();

    return () => {
      mounted = false;
    };
  }, [portfolio]);

  // compute total asset value for weighting from merged list
  const totalAssetValue = assetsWithSparkline.reduce(
    (acc, a) => acc + ((a.currentPrice ?? a.price) || 0) * (a.quantity || 0),
    0
  );

  const assetsWithMeta = assetsWithSparkline.map((a) => ({
    ...a,
    portfolioValue: totalAssetValue,
  }));

  return (
    <div className="flex bg-black min-h-screen text-white">
      <Sidebar activeTab="dashboard" setActiveTab={() => {}} />

      <div className="flex-1 p-6 ml-22 space-y-6">
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

          <div className="grid grid-cols-3 gap-6">
            {/* left: list takes full width unless expanded */}
            <div className={expandedSymbol ? "col-span-2 space-y-3" : "col-span-3 space-y-3"}>
              {assetsWithMeta.length > 0 ? (
                assetsWithMeta.map((asset) => (
                  <AssetRow
                    key={asset.symbol}
                    asset={asset}
                    isExpanded={expandedSymbol === asset.symbol}
                    onOpenDetail={() =>
                      setExpandedSymbol((prev) => (prev === asset.symbol ? null : asset.symbol))
                    }
                    anySelected={!!expandedSymbol}
                  />
                ))
              ) : (
                <div className="text-gray-400">No assets</div>
              )}
            </div>

            {/* right: detail box (1 col) */}
            {expandedSymbol && (
              <div className="col-span-1 space-y-3">
                <AssetDetailBox asset={assetsWithMeta.find((a) => a.symbol === expandedSymbol)} />
              </div>
            )}
          </div>
        </div>

        {/* Recent trades */}
        <div>
          <h2 className="text-2xl font-bold text-green-400 mb-4">Recent Trades</h2>
          <div className="space-y-4">
            {trades?.length ? (
              trades.slice(0, 10).map((t, i) => (
                <div
                  key={t._id || `${t.symbol}-${i}`}
                  className="backdrop-blur-xl bg-gray-900/60 p-4 rounded-2xl border border-green-500/20 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-bold">{t.symbol}</h3>
                    <div className="text-sm text-gray-400">
                      {t.side} • Qty {t.quantity} • ${t.price}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">{new Date(t.date || t.at).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-400">No recent trades</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
