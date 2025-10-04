"use client";

import { useState } from "react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function CopilotStart({ onStarted }) {
  const { data: strategies } = useSWR("/api/strategy/list", fetcher);
  const { data: user } = useSWR("/api/user/me", fetcher); // ✅ fetch saved URL

  const [form, setForm] = useState({
    symbol: "BTCUSDT",
    interval: "1m",
    capital: 1000,
    stopLoss: 10,
    strategyId: "",
    strategyUrl: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const startRun = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/copilot/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || JSON.stringify(data));
      alert("✅ Copilot run started!");
      onStarted && onStarted(data.run);
    } catch (err) {
      console.error("Copilot start error", err);
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-2xl text-white space-y-4">
      <h2 className="text-xl font-bold">🚀 Start Copilot</h2>

      {/* Symbol */}
      <input
        type="text"
        name="symbol"
        value={form.symbol}
        onChange={handleChange}
        placeholder="Symbol (e.g., BTCUSDT)"
        className="w-full p-2 rounded bg-gray-800"
      />

      {/* Interval */}
      <select
        name="interval"
        value={form.interval}
        onChange={handleChange}
        className="w-full p-2 rounded bg-gray-800"
      >
        <option value="1m">1m</option>
        <option value="5m">5m</option>
        <option value="1h">1h</option>
        <option value="1d">1d</option>
      </select>

      {/* Capital */}
      <input
        type="number"
        name="capital"
        value={form.capital}
        onChange={handleChange}
        placeholder="Capital ($)"
        className="w-full p-2 rounded bg-gray-800"
      />

      {/* Stop Loss */}
      <input
        type="number"
        name="stopLoss"
        value={form.stopLoss}
        onChange={handleChange}
        placeholder="Stop Loss %"
        className="w-full p-2 rounded bg-gray-800"
      />

      {/* Strategy Selector */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">📊 No-Code Strategies</label>
        <select
          name="strategyId"
          value={form.strategyId}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-800"
        >
          <option value="">-- Select Saved Strategy --</option>
          {strategies?.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Saved URL Selector */}
      {user?.strategyUrl && (
        <div className="space-y-2">
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

      {/* OR Custom Strategy URL */}
      <input
        type="text"
        name="strategyUrl"
        value={form.strategyUrl}
        onChange={handleChange}
        placeholder="Custom Strategy URL (optional)"
        className="w-full p-2 rounded bg-gray-800"
      />

      {/* Start Button */}
      <button
        onClick={startRun}
        disabled={loading}
        className="w-full py-2 bg-green-600 rounded-lg font-bold hover:bg-green-500"
      >
        {loading ? "Starting..." : "Start Copilot"}
      </button>
    </div>
  );
}
