"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  CircleDollarSign,
  ShieldAlert,
  Clock,
  BookMarked,
  Link,
  Rocket,
  Loader2,
  Globe,
  TrendingUp,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

export default function StartCopilot() {
  const [form, setForm] = useState({
    symbol: "",
    interval: "1h",
    capital: "",
    stopLoss: "",
    strategyId: "",
    strategyUrl: "",
  });
  const [strategies, setStrategies] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/strategy/list")
      .then((res) => res.json())
      .then(setStrategies)
      .catch(() => {});
    fetch("/api/user/me")
      .then((res) => res.json())
      .then(setUser)
      .catch(() => {});
  }, []);

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
      if (res.ok) {
        toast.success("🚀 Copilot started!");
      } else {
        toast.error("Start failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      toast.error("Start failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/20 rounded-3xl shadow-2xl w-full max-w-7xl text-white p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
          <Bot className="w-7 h-7 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
            AI Trading Copilot
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Configure and start your trading AI
          </p>
        </div>
      </div>

      {/* Symbol */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Symbol
        </label>
        <input
          type="text"
          name="symbol"
          value={form.symbol}
          onChange={handleChange}
          placeholder="e.g., BTCUSDT"
          className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-white placeholder-slate-500 transition-all"
        />
      </div>

      {/* Capital + Stop Loss */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Capital ($)
          </label>
          <div className="relative">
            <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60 w-4 h-4" />
            <input
              type="number"
              name="capital"
              value={form.capital}
              onChange={handleChange}
              placeholder="10000"
              className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-white placeholder-slate-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Stop Loss (%)
          </label>
          <div className="relative">
            <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400/60 w-4 h-4" />
            <input
              type="number"
              name="stopLoss"
              value={form.stopLoss}
              onChange={handleChange}
              placeholder="5"
              className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus:outline-none text-white placeholder-slate-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Interval */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Interval
        </label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/60 w-4 h-4" />
          <select
            name="interval"
            value={form.interval}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-white cursor-pointer transition-all"
          >
            <option value="1m">1m</option>
            <option value="5m">5m</option>
            <option value="1h">1h</option>
            <option value="1d">1d</option>
          </select>
        </div>
      </div>

      {/* Strategy Section */}
      <div className="space-y-4">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-2">
          <BookMarked className="w-4 h-4" />
          Strategy
        </label>

        {/* Saved Strategies */}
        <div className="relative">
          <select
            name="strategyId"
            value={form.strategyId}
            onChange={handleChange}
            className="w-full pl-3 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-white cursor-pointer transition-all"
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
          <button
            type="button"
            onClick={() =>
              setForm({ ...form, strategyUrl: user.strategyUrl })
            }
            className={`w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-300 border border-blue-500/30 hover:border-blue-500/50 text-sm transition-all ${
              form.strategyUrl === user.strategyUrl ? "opacity-70" : ""
            }`}
          >
            <Globe className="w-4 h-4" />
            {user.strategyUrl}
          </button>
        )}

        {/* Custom URL */}
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/60 w-4 h-4" />
          <input
            type="text"
            name="strategyUrl"
            value={form.strategyUrl}
            onChange={handleChange}
            placeholder="Custom Strategy URL (optional)"
            className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none text-white placeholder-slate-500 transition-all"
          />
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={startRun}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Starting...
          </>
        ) : (
          <>
            <Rocket className="w-5 h-5" />
            Start Copilot
          </>
        )}
      </button>
    </div>
  );
}
