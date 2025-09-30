'use client';

import { useState, useEffect } from "react";
import useSWR from "swr";
import Sidebar from "@/components/Sidebar";
import CandleChart from "@/components/CandleChart";
import BuySellForm from "@/components/BuySellForm";
import FeaturedCoins from "@/components/FeaturedCoins";
import Header from "@/components/Header";
import StockLoader from "@/components/ChartStockLoader";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function HomePage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState("24h");
  const [activeTab, setActiveTab] = useState("home");


  const intervalMap = {
    "24h": "1h",
    "1m": "1d",
    "1y": "1w",
  };

  const interval = intervalMap[timeframe];

  const { data: ticker } = useSWR(`/api/ticker?symbol=${selectedSymbol}`, fetcher, { refreshInterval: 5000 });
  const { data: klines } = useSWR(`/api/klines?symbol=${selectedSymbol}&interval=${interval}`, fetcher);

  useEffect(() => {
    if (selectedCoin) {
      setSelectedSymbol((selectedCoin.symbol + "USDT").toUpperCase());
    }
  }, [selectedCoin]);

  // Dummy user data for now
  const user = { name: "User", cash: 100 };

  return (
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
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold">{selectedSymbol}</h2>
      <select
        value={timeframe}
        onChange={(e) => setTimeframe(e.target.value)}
        className="border rounded p-1 text-sm bg-gray-800 text-white"
      >
        <option value="24h">Weekly</option>
        <option value="1m">Monthly</option>
        <option value="1y">Yearly</option>
      </select>
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
  <div className="col-span-1">
    <div className="bg-gray-950 rounded-2xl border border-gray-800 p-6 h-[500px] flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">
        Stock Details
      </h3>

      {klines && ticker && (
        <div className="space-y-4 flex-1">
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
                <span className="text-gray-400 font-medium">{key}</span>
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
      )}
    

      <div className="mt-auto space-y-3">
        {/* Keep your form here */}
        <BuySellForm
          symbol={selectedSymbol}
          price={ticker ? ticker.lastPrice : 0}
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
  );
}
