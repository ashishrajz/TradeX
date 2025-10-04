"use client";

import { useState } from "react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function CopilotModal({ open, onClose, selectedSymbol }) {
  const { data: strategies } = useSWR("/api/strategy/list", fetcher);
  const { data: user } = useSWR("/api/user/me", fetcher); // ✅ get saved strategyUrl

  const [form, setForm] = useState({
    capital: 10000,
    stopLoss: 5,
    interval: 60,
    strategyId: "",
    strategyUrl: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const startCopilot = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/copilot/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          symbol: selectedSymbol,
          capital: Number(form.capital),
          stopLoss: Number(form.stopLoss),
          interval: Number(form.interval),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Copilot started successfully!");
        onClose();
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) {
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-green-500/20 shadow-xl space-y-4">
        <h2 className="text-2xl font-bold text-green-400 mb-2">🤖 Run with Copilot</h2>

        {/* Capital */}
        <label className="block text-gray-400 text-sm">Capital Allocation ($)</label>
        <input
          type="number"
          name="capital"
          value={form.capital}
          onChange={handleChange}
          className="w-full mb-2 p-2 rounded bg-gray-800 text-white border border-gray-700"
        />

        {/* Stop Loss */}
        <label className="block text-gray-400 text-sm">Stop Loss (%)</label>
        <input
          type="number"
          name="stopLoss"
          value={form.stopLoss}
          onChange={handleChange}
          className="w-full mb-2 p-2 rounded bg-gray-800 text-white border border-gray-700"
        />

        {/* Interval */}
        <label className="block text-gray-400 text-sm">Decision Interval (seconds)</label>
        <input
          type="number"
          name="interval"
          value={form.interval}
          onChange={handleChange}
          className="w-full mb-4 p-2 rounded bg-gray-800 text-white border border-gray-700"
        />

        {/* Saved Strategy Dropdown */}
        <div>
          <label className="block text-gray-400 text-sm">📊 Saved Strategy</label>
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

        {/* Saved URL */}
        {user?.strategyUrl && (
          <div>
            <label className="block text-gray-400 text-sm">🌐 Saved Strategy URL</label>
            <button
              type="button"
              onClick={() => setForm({ ...form, strategyUrl: user.strategyUrl })}
              className={`w-full p-2 rounded bg-blue-600 hover:bg-blue-500 mt-1 ${
                form.strategyUrl === user.strategyUrl ? "opacity-70" : ""
              }`}
            >
              {user.strategyUrl}
            </button>
          </div>
        )}

        {/* Custom URL */}
        <div>
          <label className="block text-gray-400 text-sm">🔗 Custom Strategy URL (optional)</label>
          <input
            type="text"
            name="strategyUrl"
            value={form.strategyUrl}
            onChange={handleChange}
            placeholder="https://example.com/strategy"
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
          >
            Cancel
          </button>
          <button
            onClick={startCopilot}
            disabled={loading}
            className="px-4 py-2 rounded bg-green-500 hover:bg-green-400 text-white font-bold"
          >
            {loading ? "Starting..." : "Start Copilot"}
          </button>
        </div>
      </div>
    </div>
  );
}
