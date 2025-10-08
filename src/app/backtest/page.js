"use client";

import { useState } from "react";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Activity,
  PlayCircle,
  Database,
} from "lucide-react";

const CandleChart = dynamic(() => import("@/components/CandleChart"), { ssr: false });

const fetcher = (url) => fetch(url).then((res) => res.json());

async function runBacktest(url, { arg }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  return res.json();
}

export default function BacktestPage() {
  const [form, setForm] = useState({
    symbol: "BTCUSDT",
    interval: "1d",
    startDate: "2023-01-01",
    endDate: "2023-03-01",
    capital: 10000,
    strategyId: "",
    strategyUrl: "",
  });

  const [activeTab, setActiveTab] = useState("backtest");

  const { data: strategies } = useSWR("/api/strategy/list", fetcher);
  const { data: user } = useSWR("/api/user/me", fetcher);
  const { trigger, data, isMutating } = useSWRMutation("/api/strategy/backtest", runBacktest);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex bg-black min-h-screen text-white">
      {/* Sidebar */}
      <Sidebar activeTab="backtest" setActiveTab={setActiveTab} />

      {/* Main content */}
      <div className="flex-1 p-6 ml-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-green-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
              Backtesting Lab
            </h1>
          </div>
          <p className="text-gray-400">Test your trading strategies with historical data</p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-green-900/10 p-8 rounded-3xl border border-green-500/20 shadow-2xl shadow-green-500/5 mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-green-400" />
            Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Symbol Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Trading Pair
              </label>
              <input
                type="text"
                name="symbol"
                value={form.symbol}
                onChange={handleChange}
                placeholder="Symbol (BTCUSDT)"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
              />
            </div>

            {/* Interval */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Time Interval</label>
              <select
                name="interval"
                value={form.interval}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="1m">1m</option>
                <option value="1h">1h</option>
                <option value="1d">1d</option>
                <option value="1w">1w</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-400" />
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all [color-scheme:dark]"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-400" />
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all [color-scheme:dark]"
              />
            </div>

            {/* Capital */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                Capital Allocation ($)
              </label>
              <input
                type="number"
                name="capital"
                value={form.capital}
                onChange={handleChange}
                placeholder="Capital Allocation ($)"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
              />
            </div>

            {/* Strategy Dropdown */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-300">📊 Saved No-Code Strategy</label>
              <select
                name="strategyId"
                value={form.strategyId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Select Saved Strategy --</option>
                {strategies?.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Saved URL */}
            {user?.strategyUrl && (
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-300">🌐 Use Saved Strategy URL</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, strategyUrl: user.strategyUrl })}
                  className={`w-full p-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all font-medium truncate ${
                    form.strategyUrl === user.strategyUrl ? "opacity-70 ring-2 ring-blue-400" : ""
                  }`}
                >
                  {user.strategyUrl}
                </button>
              </div>
            )}

            {/* Custom URL Box */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-300">Custom Strategy URL</label>
              <input
                type="text"
                name="strategyUrl"
                value={form.strategyUrl}
                onChange={handleChange}
                placeholder="Custom Strategy URL (optional)"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
              />
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={() => trigger(form)}
            disabled={isMutating}
            className="mt-8 w-full bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-black font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            <PlayCircle className="w-6 h-6" />
            {isMutating ? "Running..." : "Run Backtest"}
          </button>
        </div>

        {/* Results Section */}
        {data && (
          <div className="space-y-6">
            {/* Equity Curve */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-green-900/10 p-6 rounded-3xl border border-green-500/20 shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-green-400">Equity Curve</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data.equityCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #22c55e",
                      borderRadius: "0.5rem",
                      color: "#fff",
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Win/Loss Pie */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-green-900/10 p-6 rounded-3xl border border-green-500/20 shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-green-400">Trade Outcomes</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Buys", value: data.trades.filter((t) => t.type === "BUY").length },
                      { name: "Sells", value: data.trades.filter((t) => t.type === "SELL").length },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                    dataKey="value"
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #22c55e",
                      borderRadius: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Candles with markers */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-green-900/10 p-6 rounded-3xl border border-green-500/20 shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-green-400">Candlestick Chart with Trades</h2>
              <CandleChart data={data.candles} />
            </div>

            {/* Trades List */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-green-900/10 p-6 rounded-3xl border border-green-500/20 shadow-xl overflow-hidden">
              <h2 className="text-2xl font-bold mb-6 text-green-400">Executed Trades</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-green-500/20">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Time</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Qty</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.trades.map((t, i) => (
                      <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                        <td className="py-4 px-4 text-gray-300">{new Date(t.time).toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              t.type === "BUY"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-300">{t.qty}</td>
                        <td className="py-4 px-4 text-gray-300 font-mono">${t.price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
