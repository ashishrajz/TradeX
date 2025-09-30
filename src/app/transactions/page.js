'use client';

import { useState } from "react";
import useSWR from "swr";
import Sidebar from "@/components/Sidebar";
import CandlestickChart from "@/components/CandlestickChart";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function TransactionsPage() {
  const [side, setSide] = useState("");
  const [date, setDate] = useState(null);
  const [activeTab, setActiveTab] = useState("transactions");
  const [popupData, setPopupData] = useState(null);

  const query = new URLSearchParams();
  if (side) query.append("side", side.toLowerCase());
  if (date) query.append("date", date.toISOString().split("T")[0]);

  const { data: trades, isLoading } = useSWR(`/api/user/trades?${query.toString()}`, fetcher);

  const totalValue = trades?.reduce((acc, t) => acc + t.quantity * t.price, 0) || 0;
  const totalShares = trades?.reduce((acc, t) => acc + t.quantity, 0) || 0;

  // --- Open chart popup ---
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
        ...marketData,
      });
    } catch (err) {
      console.error("Failed to fetch market data:", err);
      alert("Failed to load chart data");
    }
  };

  const closeChart = () => setPopupData(null);

  return (
    <div className="flex bg-black min-h-screen text-white">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main content */}
      <div className="flex-1 p-6 ml-20">
        <h1 className="text-3xl font-bold mb-4 text-green-400">Transactions</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 items-center mb-6">
          <div className="flex gap-2">
            {["", "buy", "sell"].map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                className={`px-4 py-2 rounded-xl font-semibold transition ${
                  side === s
                    ? "bg-green-500 text-black"
                    : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
              >
                {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative inline-block">
            <DatePicker
              selected={date}
              onChange={(d) => setDate(d)}
              placeholderText="Select date"
              className="border rounded p-2 bg-gray-800 text-white pr-8"
              dateFormat="yyyy-MM-dd"
            />
            {date && (
              <button
                type="button"
                onClick={() => setDate(null)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-red-400"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="backdrop-blur-md bg-gray-900/40 rounded-xl p-4 border border-green-500/20">
            <p className="text-gray-400 text-sm">Total Value</p>
            <p className="text-2xl font-bold text-green-400">${totalValue.toLocaleString()}</p>
          </div>
          <div className="backdrop-blur-md bg-gray-900/40 rounded-xl p-4 border border-green-500/20">
            <p className="text-gray-400 text-sm">Active Positions</p>
            <p className="text-2xl font-bold text-green-400">{trades?.length || 0}</p>
          </div>
          <div className="backdrop-blur-md bg-gray-900/40 rounded-xl p-4 border border-green-500/20">
            <p className="text-gray-400 text-sm">Total Shares</p>
            <p className="text-2xl font-bold text-green-400">{totalShares}</p>
          </div>
        </div>

        {/* Trades Cards */}
        <div className="space-y-4">
          {isLoading ? (
            <div>Loading transactions...</div>
          ) : trades && trades.length > 0 ? (
            trades.map((t) => {
              const value = t.quantity * t.price;
              return (
                <div
                  key={t._id}
                  className="backdrop-blur-xl bg-gray-900/60 p-4 rounded-2xl border border-green-500/20 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  {/* Trade info */}
                  <div>
                    <h2 className="text-2xl font-bold text-white">{t.symbol}</h2>
                    <p className={`text-sm font-semibold ${t.side.toLowerCase() === "buy" ? "text-green-400" : "text-red-400"}`}>
                      {t.side.toUpperCase()}
                    </p>
                    <div className="flex gap-4 mt-1 text-sm">
                      <p>Qty: {t.quantity}</p>
                      <p>Price: ${t.price}</p>
                      <p>Value: ${value.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => openChart(t)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-bold hover:from-emerald-400 hover:to-teal-400 transition"
                    >
                      View Chart
                    </button>
                  </div>

                  {/* Date */}
                  <div className="text-right text-sm text-gray-400 md:ml-4">
                    {new Date(t.date).toLocaleDateString()}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-400 p-4">No transactions yet</div>
          )}
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
  );
}
