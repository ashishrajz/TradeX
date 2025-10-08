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
  X,
  TrendingUp,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CopilotModal({ open, onClose, selectedSymbol }) {
  const [strategies, setStrategies] = useState([]);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    capital: 10000,
    stopLoss: 5,
    interval: 60,
    strategyId: "",
    strategyUrl: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/strategy/list")
      .then((r) => r.json())
      .then((data) => setStrategies(data))
      .catch(() => {});

    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => setUser(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (form.strategyId) {
      setForm((prev) => ({ ...prev, strategyUrl: "" }));
    }
  }, [form.strategyId]);

  useEffect(() => {
    if (form.strategyUrl) {
      setForm((prev) => ({ ...prev, strategyId: "" }));
    }
  }, [form.strategyUrl]);

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
        toast.success("🚀 Copilot started!");
        onClose();
      } else {
        toast.error("Start failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      toast.error("Start failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/20 rounded-3xl shadow-2xl w-full max-w-2xl text-white overflow-hidden">
        {/* Modal Header with Gradient */}
        <div className="relative bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-b border-slate-800/50 p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <Bot className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
                  AI Trading Copilot
                 
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Launch automated trading for{" "}
                  <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {selectedSymbol}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Risk Management Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-red-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300">Risk Parameters</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Trading Capital
                </label>
                <div className="relative group">
                  <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/50 w-4 h-4 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="number"
                    name="capital"
                    value={form.capital}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-white placeholder-slate-500 transition-all"
                    placeholder="10000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                    USD
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Stop Loss
                </label>
                <div className="relative group">
                  <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500/50 w-4 h-4 group-focus-within:text-red-400 transition-colors" />
                  <input
                    type="number"
                    name="stopLoss"
                    value={form.stopLoss}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus:outline-none text-white placeholder-slate-500 transition-all"
                    placeholder="5"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interval Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300">Execution Speed</h3>
            </div>
            <div className="relative group">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500/50 w-4 h-4 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="number"
                name="interval"
                value={form.interval}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-white placeholder-slate-500 transition-all"
                placeholder="60"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                seconds
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 py-1 text-slate-500 font-medium rounded-full border border-slate-800">
                Trading Strategy
              </span>
            </div>
          </div>

          {/* Strategy Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <BookMarked className="w-3.5 h-3.5" />
                Saved Strategies
              </label>
              <div className="relative group">
                <BookMarked className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500/50 w-4 h-4 z-10 group-focus-within:text-purple-400 transition-colors" />
                <select
                  name="strategyId"
                  value={form.strategyId}
                  onChange={handleChange}
                  className="w-full appearance-none pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-white cursor-pointer transition-all"
                >
                  <option value="" className="bg-slate-900">
                    -- Select a Strategy --
                  </option>
                  {strategies?.map((s) => (
                    <option key={s._id} value={s._id} className="bg-slate-900">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-2 text-slate-600 font-medium">
                  OR
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <Link className="w-3.5 h-3.5" />
                Custom Strategy URL
              </label>

              {user?.strategyUrl && (
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      strategyUrl: user.strategyUrl,
                      strategyId: "",
                    })
                  }
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-300 border border-blue-500/30 hover:border-blue-500/50 hover:from-blue-500/20 hover:to-purple-500/20 text-sm transition-all group"
                >
                  <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="truncate flex-1 text-left">
                    <span className="text-slate-400 text-xs">Use saved:</span>{" "}
                    {user.strategyUrl}
                  </span>
                </button>
              )}

              <div className="relative group">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/50 w-4 h-4 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  name="strategyUrl"
                  value={form.strategyUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/strategy.js"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none text-white placeholder-slate-600 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 pt-0 border-t border-slate-800/50 bg-gradient-to-t from-slate-950/50 to-transparent">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white border border-slate-700/50 font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={startCopilot}
            disabled={loading || (!form.strategyId && !form.strategyUrl)} className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold flex items-center gap-2 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Starting...
              </>
            ) : (
               <>
                <Rocket size={16} />
                Start Copilot
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}