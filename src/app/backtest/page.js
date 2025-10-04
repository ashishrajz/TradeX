"use client";

import { useState } from "react";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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

  const { data: strategies } = useSWR("/api/strategy/list", fetcher);
  const { data: user } = useSWR("/api/user/me", fetcher); // ✅ fetch saved URL
  const { trigger, data, isMutating } = useSWRMutation("/api/strategy/backtest", runBacktest);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-8 bg-black min-h-screen text-white space-y-6">
      <h1 className="text-3xl font-bold text-green-400">Backtesting Lab</h1>

      {/* Form */}
      <div className="bg-gray-900/80 p-6 rounded-2xl border border-green-500/20 grid grid-cols-2 gap-4">
        <input
          type="text"
          name="symbol"
          value={form.symbol}
          onChange={handleChange}
          placeholder="Symbol (BTCUSDT)"
          className="p-2 rounded bg-gray-800 text-white"
        />

        <select
          name="interval"
          value={form.interval}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white"
        >
          <option value="1m">1m</option>
          <option value="1h">1h</option>
          <option value="1d">1d</option>
          <option value="1w">1w</option>
        </select>

        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white"
        />

        <input
          type="number"
          name="capital"
          value={form.capital}
          onChange={handleChange}
          placeholder="Capital Allocation ($)"
          className="p-2 rounded bg-gray-800 text-white col-span-2"
        />

        {/* ✅ Strategy Dropdown */}
        <div className="col-span-2 space-y-2">
          <label className="text-sm text-gray-400">📊 Saved No-Code Strategy</label>
          <select
            name="strategyId"
            value={form.strategyId}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white"
          >
            <option value="">-- Select Saved Strategy --</option>
            {strategies?.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ Saved URL */}
        {user?.strategyUrl && (
          <div className="col-span-2 space-y-2">
            <label className="text-sm text-gray-400">🌐 Use Saved Strategy URL</label>
            <button
              type="button"
              onClick={() => setForm({ ...form, strategyUrl: user.strategyUrl })}
              className={`w-full p-2 rounded bg-blue-600 hover:bg-blue-500 ${
                form.strategyUrl === user.strategyUrl ? "opacity-70" : ""
              }`}
            >
              {user.strategyUrl}
            </button>
          </div>
        )}

        {/* ✅ Custom URL Box */}
        <input
          type="text"
          name="strategyUrl"
          value={form.strategyUrl}
          onChange={handleChange}
          placeholder="Custom Strategy URL (optional)"
          className="col-span-2 p-2 rounded bg-gray-800 text-white"
        />

        <button
          onClick={() => trigger(form)}
          disabled={isMutating}
          className="col-span-2 bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-4 rounded-xl"
        >
          {isMutating ? "Running..." : "Run Backtest"}
        </button>
      </div>

      {/* Results */}
      {data && (
        <div className="space-y-6">
          {/* Equity Curve */}
          <div className="bg-gray-900/70 p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Equity Curve</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.equityCurve}>
                <XAxis dataKey="time" hide />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Win/Loss Pie */}
          <div className="bg-gray-900/70 p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Trade Outcomes</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Buys", value: data.trades.filter((t) => t.type === "BUY").length },
                    { name: "Sells", value: data.trades.filter((t) => t.type === "SELL").length },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                  dataKey="value"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Candles with markers */}
          <div className="bg-gray-900/70 p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Candlestick Chart with Trades</h2>
            <CandleChart data={data.candles} />
          </div>

          {/* Trades List */}
          <div className="bg-gray-900/70 p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Executed Trades</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {data.trades.map((t, i) => (
                  <tr key={i} className="border-t border-gray-700">
                    <td>{new Date(t.time).toLocaleString()}</td>
                    <td className={t.type === "BUY" ? "text-green-400" : "text-red-400"}>{t.type}</td>
                    <td>{t.qty}</td>
                    <td>${t.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
