'use client';

import { useState } from "react";
import useSWR from "swr";
import Sidebar from "@/components/Sidebar";
import AssetCard from "@/components/AssetCard";

const fetcher = (url) => fetch(url).then((r) => r.json());

const CandlestickChart = ({ data }) => {
  // Guard: If no data, return null
  if (!data || !data.Open || !data.High || !data.Low || !data.Close) {
    return <div className="text-gray-400">No chart data available</div>;
  }

  // Prepare chart data
  const chartData = [
    { time: '09:30', open: data.Open, high: data.High, low: data.Low, close: data.Close },
    { time: '10:00', open: data.Close, high: data.High + 2, low: data.Low - 1, close: data.Close + 1.5 },
    { time: '10:30', open: data.Close + 1.5, high: data.High + 3, low: data.Low, close: data.Close + 2.2 },
    { time: '11:00', open: data.Close + 2.2, high: data.High + 4, low: data.Low + 1, close: data.Close + 1.8 },
    { time: '11:30', open: data.Close + 1.8, high: data.High + 2, low: data.Low + 0.5, close: data.Close + 2.5 },
    { time: '12:00', open: data.Close + 2.5, high: data.High + 5, low: data.Low + 2, close: data.Close + 3.1 },
  ];

  // Filter out invalid candles
  const validCandles = chartData.filter(c =>
    [c.open, c.high, c.low, c.close].every(v => typeof v === 'number' && !isNaN(v))
  );

  if (validCandles.length === 0) {
    return <div className="text-gray-400">No valid chart data</div>;
  }

  // Calculate Y-axis scaling
  const maxPrice = Math.max(...validCandles.map(d => d.high)) + 5;
  const minPrice = Math.min(...validCandles.map(d => d.low)) - 5;
  const priceRange = maxPrice - minPrice;

  const chartHeight = 250;
  const getY = (price) => {
    if (typeof price !== 'number' || isNaN(price)) return chartHeight;
    return ((maxPrice - price) / priceRange) * chartHeight + 20;
  };

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-green-500/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Price Chart</h3>
        <div className="text-sm text-gray-400">Last 6 hours</div>
      </div>
      <svg width="100%" height="300" className="overflow-visible">
        {[0,1,2,3,4].map(i => (
          <line
            key={i}
            x1="0"
            y1={20 + i * (chartHeight / 4)}
            x2="100%"
            y2={20 + i * (chartHeight / 4)}
            stroke="#374151"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}

        {validCandles.map((candle, i) => {
          const x = (i / (validCandles.length - 1)) * 85 + 7.5;
          const isGreen = candle.close > candle.open;
          const bodyTop = getY(Math.max(candle.open, candle.close));
          const bodyBottom = getY(Math.min(candle.open, candle.close));
          const bodyHeight = Math.max(bodyBottom - bodyTop, 2);

          return (
            <g key={i}>
              <line
                x1={`${x}%`}
                y1={getY(candle.high)}
                x2={`${x}%`}
                y2={getY(candle.low)}
                stroke={isGreen ? "#10B981" : "#EF4444"}
                strokeWidth="1"
              />
              <rect
                x={`${x-1.5}%`}
                y={bodyTop}
                width="3%"
                height={bodyHeight}
                fill={isGreen ? "#10B981" : "#EF4444"}
                stroke={isGreen ? "#059669" : "#DC2626"}
                strokeWidth="1"
              />
            </g>
          );
        })}
      </svg>

      <div className="flex justify-between mt-2 px-4">
        {validCandles.map((candle,i) => (
          <span key={i} className="text-xs text-gray-400">{candle.time}</span>
        ))}
      </div>
    </div>
  );
};


export default function DashboardPage() {
  
  const { data: portfolio, isLoading: loadingPortfolio } = useSWR("/api/user/portfolio", fetcher);
  const { data: trades, isLoading: loadingTrades } = useSWR("/api/user/trades?limit=5", fetcher);
  const [popupData, setPopupData] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  

  const openChart = async (trade) => {
    try {
      const res = await fetch(`/api/binance/${trade.symbol}`);
      const marketData = await res.json();
  
      if (!marketData || isNaN(marketData.Open)) {
        alert("No chart data available for this trade");
        return;
      }
  
      setPopupData({
        symbol: trade.symbol,
        ...marketData
      });
    } catch (err) {
      console.error("Failed to fetch market data:", err);
      alert("Failed to load chart data");
    }
  };
  
  const closeChart = () => setPopupData(null);
  const TrendingUpIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
  
  const TrendingDownIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  )
  
  const CandlestickIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )



  return (
    <div className="flex bg-black min-h-screen text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 p-6 ml-22 space-y-10">

        {/* Dashboard Heading */}
        <h1 className="text-4xl font-bold text-green-400 mb-6">Dashboard</h1>

        {/* Portfolio Summary Box */}
<div className="backdrop-blur-xl bg-gray-900/60 p-6 rounded-2xl border border-green-500/20 shadow-md">
  <h2 className="text-2xl font-bold text-green-400 mb-4">Portfolio Summary</h2>

  

  <div className="grid grid-cols-3 gap-4">
    <div className="p-4 rounded-xl border border-green-500/20">
      <p className="text-gray-400 text-sm">Grand Total</p>
      <p className="text-2xl font-bold text-green-400">${portfolio?.totalValue?.toLocaleString() || 0}</p>
    </div>
    <div className="p-4 rounded-xl border border-green-500/20">
      <p className="text-gray-400 text-sm">Assets</p>
      <p className="text-2xl font-bold text-green-400">{portfolio?.assets?.length || 0}</p>
    </div>
    <div className="p-4 rounded-xl border border-green-500/20">
      <p className="text-gray-400 text-sm">Total Assets Value</p>
      <p className="text-2xl font-bold text-green-400">
        $
        {portfolio?.assets
          ?.reduce(
            (acc, asset) =>
              acc + ((asset.currentPrice || asset.price || 0) * (asset.quantity || 0)),
            0
          )
          .toLocaleString() || 0}
      </p>
    </div>
  </div>
</div>


        {/* Assets Box */}
<div className="backdrop-blur-xl bg-gray-900/60 p-6 rounded-2xl border border-green-500/20 shadow-md">
  <h2 className="text-2xl font-bold text-green-400 mb-4">Assets</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {portfolio?.assets?.map((item, idx) => (
      <AssetCard key={idx} item={item} openChart={openChart} />
    ))}
  </div>
</div>

        {/* Recent Trades Section */}
        <div>
          <h2 className="text-3xl font-bold text-green-400 mb-4">Recent Trades</h2>
          <div className="space-y-4">
          {loadingTrades ? (
  // Skeleton Loader
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse backdrop-blur-xl bg-gray-900/60 p-4 rounded-2xl border border-green-500/20 shadow-md flex justify-between items-center"
      >
        <div className="space-y-2">
          <div className="h-6 w-24 bg-gray-700 rounded"></div>
          <div className="h-4 w-12 bg-gray-600 rounded"></div>
          <div className="h-4 w-32 bg-gray-600 rounded"></div>
        </div>
        <div className="h-8 w-24 bg-gray-700 rounded"></div>
      </div>
    ))}
  </div>
) : trades?.length > 0 ? trades.map((t) => (
              <div key={t._id} className="backdrop-blur-xl bg-gray-900/60 p-4 rounded-2xl border border-green-500/20 shadow-md flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">{t.symbol}</h2>
                  <p className={`text-sm font-semibold ${t.side.toLowerCase() === "buy" ? "text-green-400" : "text-red-400"}`}>
                    {t.side.toUpperCase()}
                  </p>
                  <p className="text-gray-400 text-sm">Qty: {t.quantity} • Price: ${t.price}</p>
                </div>
                <button
                  onClick={() => openChart(t)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-bold hover:from-emerald-400 hover:to-teal-400 transition"
                >
                  View Chart
                </button>
              </div>
            )) : <div className="text-gray-400 p-4 text-center">No recent trades</div>}
          </div>
        </div>

        {/* Popup Chart */}
        {popupData && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="bg-gray-900/80 rounded-3xl p-8 w-full max-w-4xl mx-4 relative border border-green-500/20 shadow-2xl">
      <button onClick={closeChart} className="absolute top-4 right-4 text-white text-2xl font-bold">×</button>
      <h2 className="text-3xl font-bold text-white mb-4">{popupData.symbol} Analytics</h2>
      <CandlestickChart data={popupData} />
    </div>
  </div>
)}


      </div>
    </div>
  )
}
