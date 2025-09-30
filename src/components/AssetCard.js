'use client';

import { useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";

const fetcher = (url) => fetch(url).then((r) => r.json());

// --- ICONS ---
const TrendingUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

export default function AssetCard({ item, openChart }) {
  const [tradeSide, setTradeSide] = useState(null); // "BUY" or "SELL"
  const [tradeQty, setTradeQty] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [tradeLoading, setTradeLoading] = useState(false);

  const { data: marketData, isLoading } = useSWR(
    item?.symbol ? `/api/binance/${item.symbol}` : null,
    fetcher
  );

  if (isLoading || !marketData) {
    return (
      <div
        className="animate-pulse backdrop-blur-xl rounded-3xl p-6 
        border border-gray-700 bg-gray-900/40"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-700 rounded-2xl" />
            <div>
              <div className="h-5 w-24 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-16 bg-gray-700 rounded"></div>
            </div>
          </div>
          <div className="h-6 w-16 bg-gray-700 rounded-2xl" />
        </div>
  
        {/* Price */}
        <div className="mb-4">
          <div className="h-8 w-28 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-20 bg-gray-700 rounded"></div>
        </div>
  
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-3"
            >
              <div className="h-3 w-12 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-16 bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
  
        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <div className="h-10 w-full bg-gray-700 rounded-2xl"></div>
          <div className="flex gap-4">
            <div className="h-10 w-full bg-gray-700 rounded-2xl"></div>
            <div className="h-10 w-full bg-gray-700 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }
  

  if (!marketData || isNaN(marketData.Open) || isNaN(marketData.Close)) {
    return (
      <div className="p-6 rounded-2xl border border-gray-700 text-gray-400">
        No chart data available
      </div>
    );
  }
  

  const isPositive = marketData.Close > marketData.Open;
  const changeAmount = marketData.Close - marketData.Open;
  const changePercent = ((changeAmount / marketData.Open) * 100).toFixed(2);

  const openTradePopup = (side) => {
    setTradeSide(side);
    setTradeQty("");
    setPopupOpen(true);
  };

  const closeTradePopup = () => {
    setPopupOpen(false);
    setTradeSide(null);
  };

  const handleTrade = async () => {
    if (!tradeQty || tradeQty <= 0) return toast.error("Enter a valid quantity");

    try {
      setTradeLoading(true);
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: item.symbol,
          side: tradeSide,
          quantity: Number(tradeQty),
          price: marketData.Close
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Trade executed: ${tradeSide} ${tradeQty} ${item.symbol}`);
        closeTradePopup();
      } else {
        toast.error(`Trade failed: ${data}`);
      }
    } catch (err) {
      toast.error("Trade error: " + err.message);
    } finally {
      setTradeLoading(false);
    }
  };

  return (
    <div
      className={`
        group relative overflow-hidden backdrop-blur-xl rounded-3xl p-6 transition-all duration-500
        border ${isPositive ? 'border-green-500/20 hover:border-emerald-500' : 'border-red-500/30 hover:border-red-500'}
        bg-gradient-to-br ${isPositive ? 'from-green-900/30 via-gray-900/30 to-slate-800/50' : 'from-red-900/30 via-gray-900/30 to-slate-800/50'}
        hover:shadow-2xl ${isPositive ? 'hover:shadow-emerald-500/10' : 'hover:shadow-red-500/10'}
      `}
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">{item.symbol?.charAt(0) || '?'}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{item.symbol}</h3>
              <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
            </div>
          </div>

          <div className={`flex items-center gap-1 px-3 py-1 rounded-2xl font-bold text-sm ${
            isPositive 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
            {changePercent}%
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="text-3xl font-black text-white mb-1">${marketData.Close?.toFixed(2)}</div>
          <div className={`text-sm font-semibold flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            <span>{isPositive ? '+' : ''}{changeAmount.toFixed(2)}</span>
            <span className="text-gray-500">from open</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: 'Open', value: `$${marketData.Open}` },
            { label: 'High', value: `$${marketData.High}` },
            { label: 'Low', value: `$${marketData.Low}` },
            { label: 'Volume', value: marketData.Volume || '—' }
          ].map((metric, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2">
              <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{metric.label}</div>
              <div className="text-white font-bold text-sm">{metric.value}</div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => openChart({ ...marketData, symbol: item.symbol })}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-2 px-4 rounded-2xl transition shadow-lg"
          >
            <span>View Analytics</span>
          </button>

          <div className="flex flex-row gap-4">
          <button
            onClick={() => openTradePopup("BUY")}
            className="w-full bg-green-400 hover:bg-green-300 text-white font-bold py-2 px-4 rounded-2xl transition"
          >
            Buy
          </button>

          <button
            onClick={() => openTradePopup("SELL")}
            className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-2xl transition"
          >
            Sell
          </button>
          </div>
        </div>
      </div>

      {/* Trade Popup */}
      {popupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900/80 rounded-3xl p-8 w-full max-w-md mx-4 relative border border-green-500/20 shadow-2xl">
            <button onClick={closeTradePopup} className="absolute top-4 right-4 text-white text-2xl font-bold">×</button>
            <h2 className="text-2xl font-bold text-white mb-4">{tradeSide} {item.symbol}</h2>

            <input
              type="number"
              step="any"
              placeholder="Quantity"
              value={tradeQty}
              onChange={(e) => setTradeQty(e.target.value)}
              className="w-full p-2 mb-4 rounded-xl bg-gray-800 text-white border border-gray-700"
            />

            <button
              onClick={handleTrade}
              disabled={tradeLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-2 px-4 rounded-2xl transition"
            >
              {tradeLoading ? "Processing..." : tradeSide}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
