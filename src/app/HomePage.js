'use client';
export const dynamic = "force-dynamic";



import { useState, useEffect } from "react";
import useSWR from "swr";
import Sidebar from "@/components/Sidebar";
import CandleChart from "@/components/CandleChart";
import BuySellForm from "@/components/BuySellForm";
import FeaturedCoins from "@/components/FeaturedCoins";
import Header from "@/components/Header";
import StockLoader from "@/components/ChartStockLoader";
import RunStrategyButton from "@/components/RunStrategyButton";
import CopilotModal from "@/components/CopilotModal";
import { BotMessageSquare } from 'lucide-react';
import ModernFooter from "@/components/ModernFooter";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function HomePage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState("24h");
  const [activeTab, setActiveTab] = useState("home");
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [view, setView] = useState("details");



  const intervalMap = {
    "1min": "1m",   // new
    "24h": "1h",
    "1m": "1d",
    "1y": "1w",
    "1M": "1M",     // new (1 month candles)
  };
  

  const interval = intervalMap[timeframe];

  const { data: ticker } = useSWR(`/api/ticker?symbol=${selectedSymbol}`, fetcher, { refreshInterval: 30000 });
  const { data: klines } = useSWR(`/api/klines?symbol=${selectedSymbol}&interval=${interval}`, fetcher,{ refreshInterval: 30000 });

  useEffect(() => {
    if (selectedCoin) {
      setSelectedSymbol((selectedCoin.symbol + "USDT").toUpperCase());
    }
  }, [selectedCoin]);

 

  return (
    <div className="flex flex-col">
    <div className="flex bg-black min-h-screen text-white">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />


      {/* Main content */}
      <div className="flex-1 ml-20 flex flex-col">
      <Header />

        {/* Page content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Top Half: Coin info & Buy/Sell */}
          <div className="grid grid-cols-4 gap-6">
  {/* Chart + Price Section (span 3 parts) */}
  <div className="col-span-3 space-y-4">
    {/* Replace your existing div with the select dropdown with this: */}
<div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-700/50">
  {/* Decorative gradient overlay */}
  <div className="absolute inset-0 bg-black rounded-2xl pointer-events-none"></div>
  
  <div className="relative flex items-center justify-between">
    {/* Symbol Display */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-600 flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-sm">{selectedSymbol[0]}</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          {selectedSymbol}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Real-time data</p>
      </div>
    </div>

    {/* Timeframe Selector */}
    <div className="flex items-center gap-2 bg-black rounded-xl p-1.5 backdrop-blur-sm border border-slate-700/50">
      {[
        { value: '1min', label: '1M' },
        { value: '24h', label: '1H' },
        { value: '1m', label: '1D' },
        { value: '1y', label: '1W' },
        { value: '1M', label: '1Mo' }
      ].map((tf) => (
        <button
          key={tf.value}
          onClick={() => setTimeframe(tf.value)}
          className={`
            px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300
            ${timeframe === tf.value
              ? 'bg-gradient-to-r from-blue-500 to-green-600 text-white shadow-lg shadow-blue-500/25 scale-105'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }
          `}
        >
          {tf.label}
        </button>
      ))}
    </div>
  </div>

  {/* Subtle bottom indicator */}
  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-b-2xl opacity-30"></div>
</div>

    {ticker && (
      <div className="bg-gray-900/70 rounded-xl shadow p-4 text-white flex flex-col gap-1">
        <div className="text-2xl font-bold">
          ${parseFloat(ticker.lastPrice).toFixed(2)}
        </div>
        <div
          className={`text-sm ${
            ticker.priceChangePercent > 0
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {ticker.priceChangePercent}% 24h
        </div>
      </div>
    )}

{klines ? (
  <div className="bg-gray-900/70 rounded-xl shadow p-4">
    <CandleChart data={klines} />
  </div>
) : (
    <div className="bg-gray-900/70 rounded-xl shadow p-4">
    <StockLoader />
  </div>
)}

  </div>

 
  {/* Stock Info Panel (span 1 part) */}
  <div className="col-span-1 sticky  self-start h-fit">
  <div className="bg-gray-950 rounded-2xl border border-gray-800 p-6 pb-14 flex flex-col">

    <h3 className="text-lg font-semibold text-white mb-4">Stock Details</h3>

    {/* Toggle Switch */}
    <div className="flex justify-between items-center mb-8">
      <span
        className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition ${
          view === "details"
            ? "bg-emerald-600 text-white"
            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
        }`}
        onClick={() => setView("details")}
      >
        Price Info
      </span>
      <span
        className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition ${
          view === "stats"
            ? "bg-emerald-600 text-white"
            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
        }`}
        onClick={() => setView("stats")}
      >
        24h Stats
      </span>
    </div>

    {klines && ticker && (
      <div className="space-y-3 flex-1 flex flex-col">
        {/* PRICE INFO VIEW */}
        {view === "details" && (
          <>
            <div className="space-y-2">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-4">
                Price Info
              </div>
              {["Open", "High", "Low", "Close"].map((key) => {
                const latest = klines[klines.length - 1];
                const values = {
                  Open: latest.open,
                  High: latest.high,
                  Low: latest.low,
                  Close: ticker.lastPrice,
                };
                return (
                  <div
                    key={key}
                    className="flex justify-between items-center p-3 bg-gray-800 rounded-lg"
                  >
                    <span className="text-gray-400 font-medium text-sm">{key}</span>
                    <span
                      className={`font-semibold ${
                        key === "High"
                          ? "text-green-400"
                          : key === "Low"
                          ? "text-red-500"
                          : "text-white"
                      }`}
                    >
                      ${parseFloat(values[key]).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Trading Range */}
            <div className="space-y-2 pt-3 border-t border-gray-800">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Trading Range
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-red-400">
                    ${parseFloat(ticker.lowPrice).toFixed(2)}
                  </span>
                  <span className="text-green-400">
                    ${parseFloat(ticker.highPrice).toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        ((parseFloat(ticker.lastPrice) -
                          parseFloat(ticker.lowPrice)) /
                          (parseFloat(ticker.highPrice) -
                            parseFloat(ticker.lowPrice))) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* 24H STATS VIEW */}
        {view === "stats" && (
          <div className="space-y-2">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              24h Stats
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <span className="text-gray-400 font-medium text-sm">Change</span>
              <span
                className={`font-semibold ${
                  parseFloat(ticker.priceChange) >= 0
                    ? "text-green-400"
                    : "text-red-500"
                }`}
              >
                ${parseFloat(ticker.priceChange).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <span className="text-gray-400 font-medium text-sm">Change %</span>
              <span
                className={`font-semibold ${
                  parseFloat(ticker.priceChangePercent) >= 0
                    ? "text-green-400"
                    : "text-red-500"
                }`}
              >
                {ticker.priceChangePercent}%
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <span className="text-gray-400 font-medium text-sm">Volume</span>
              <span className="font-semibold text-white">
                {parseFloat(ticker.volume).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <span className="text-gray-400 font-medium text-sm">Quote Volume</span>
              <span className="font-semibold text-white">
                $
                {parseFloat(ticker.quoteVolume).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    )}

    <div className="mt-6 space-y-3 pt-4 border-t border-gray-800">
      <BuySellForm symbol={selectedSymbol} price={ticker ? ticker.lastPrice : 0} />
      <RunStrategyButton
        symbol={selectedSymbol}
        price={ticker ? parseFloat(ticker.lastPrice) : 0}
      />

      {/* Add Copilot Button here */}
      <div className="flex justify-end">
        <button
          onClick={() => setCopilotOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-bold shadow hover:from-emerald-400 hover:to-teal-400 transition flex flex-1 items-center justify-center gap-1"
        >
          <BotMessageSquare /> Run with Copilot
        </button>
      </div>

      {/* Copilot Modal */}
      <CopilotModal
        open={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        selectedSymbol={selectedSymbol}
      />
    </div>
  </div>
</div>

  
</div>


          {/* Bottom Half: Featured Coins */}
          {/* Bottom Half: Featured Coins */}
<FeaturedCoins
  query={searchQuery}
  onSelect={(coinOrQuery) => {
    if (typeof coinOrQuery === "string") setSearchQuery(coinOrQuery);
    else setSelectedCoin(coinOrQuery);
  }}
/>

        </div>
      </div>
     
    </div>
    <ModernFooter/>
    </div>
  );
}