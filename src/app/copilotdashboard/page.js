"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import CandleChart from "@/components/CandleChart"; // reuse your existing candle component
import CopilotStart from "@/components/CopilotStart";
const fetcher = (url) => fetch(url).then((r) => r.json());

export default function CopilotDashboard() {
  const { data: runs, mutate } = useSWR("/api/copilot/runs", fetcher, {
    refreshInterval: 15_000,
  });
  const [expanded, setExpanded] = useState({}); // track which run is expanded
  const [loading, setLoading] = useState(false);

  const toggleExpand = (runId) => {
    setExpanded((prev) => ({ ...prev, [runId]: !prev[runId] }));
  };

  const stopRun = async (runId) => {
    setLoading(true);
    await fetch("/api/copilot/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId }),
    });
    mutate();
    setLoading(false);
  };

  if (!runs) return <div className="text-gray-400 p-6">Loading Copilot Runs...</div>;

  // split into running vs stopped
  const runningRuns = runs.filter((r) => r.status === "running");
  const stoppedRuns = runs.filter((r) => r.status !== "running");

  const renderRun = (run) => {
    const equityHistory = (run.equityCurve || []).map((pt) => ({
      time: new Date(pt.at).toLocaleTimeString(), // formatted x-axis
      equity: pt.equity,
    }));

    const totalEquity = equityHistory.at(-1)?.equity || run.capital;
    const totalPnL = totalEquity - run.capital;
    const pnlPercent = ((totalPnL / run.capital) * 100).toFixed(2);

    return (
      <div
        key={run._id}
        className="bg-gray-900 p-6 mb-6 rounded-2xl shadow-lg border border-green-500/20"
      >
        {/* Header Row */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{run.symbol}</h2>
            <p className="text-gray-400">
              Capital: ${run.capital.toLocaleString()} | Remaining: $
              {run.remainingCapital.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`font-bold ${
                totalPnL >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {totalPnL.toFixed(2)} USD ({pnlPercent}%)
            </span>
            {run.status === "running" && (
              <button
                onClick={() => stopRun(run._id)}
                disabled={loading}
                className="px-4 py-2 bg-red-500 rounded-lg text-white font-semibold hover:bg-red-400"
              >
                Stop
              </button>
            )}
            <button
              onClick={() => toggleExpand(run._id)}
              className="px-3 py-1 bg-gray-700 rounded-lg text-sm text-white hover:bg-gray-600"
            >
              {expanded[run._id] ? "Hide ▼" : "Expand ▶"}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded[run._id] && (
          <div className="mt-6 space-y-6">
            {/* Equity Curve */}
            <div className="bg-gray-800 p-4 rounded-xl">
              <h3 className="text-sm text-gray-400 mb-2">Equity Curve</h3>
              {equityHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={equityHistory}>
                    <XAxis dataKey="time" stroke="#aaa" tick={{ fill: "#aaa", fontSize: 12 }} />
                    <YAxis stroke="#aaa" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="equity"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-sm">No equity data yet</p>
              )}
            </div>

            {/* Trade Log */}
            <div className="bg-gray-800 p-4 rounded-xl">
              <h3 className="text-sm text-gray-400 mb-2">Trade History</h3>
              {run.tradeHistory?.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-gray-400 border-b border-gray-700 sticky top-0 bg-gray-800">
                      <tr>
                        <th className="p-2">Side</th>
                        <th className="p-2">Quantity</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {run.tradeHistory.map((t, i) => (
                        <tr key={i} className="border-b border-gray-700">
                          <td className={t.side === "BUY" ? "text-green-400 p-2" : "text-red-400 p-2"}>
                            {t.side}
                          </td>
                          <td className="p-2">{t.quantity}</td>
                          <td className="p-2">${t.price.toFixed(2)}</td>
                          <td className="p-2 text-gray-500">
                            {new Date(t.at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No trades yet</p>
              )}
            </div>

            {/* Candlestick */}
            <div className="bg-gray-800 p-4 rounded-xl">
              <h3 className="text-sm text-gray-400 mb-2">Candlestick Chart</h3>
              <CandlestickSection run={run} isExpanded={expanded[run._id]} />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">🤖 Copilot Dashboard</h1>
      <CopilotStart onStarted={() => window.location.reload()} />

      <h2 className="text-2xl font-semibold text-green-400 mb-4">Running</h2>
      {runningRuns.length > 0 ? runningRuns.map(renderRun) : <p>No running runs</p>}

      <h2 className="text-2xl font-semibold text-gray-400 mt-8 mb-4">Stopped</h2>
      {stoppedRuns.length > 0 ? stoppedRuns.map(renderRun) : <p>No stopped runs</p>}
    </div>
  );
}

// ✅ Candlestick sub-component
function CandlestickSection({ run, isExpanded }) {
  const intervalMap = {
    "1m": "1m",
    "5m": "5m",
    "60": "1m", // map bad "60" to Binance-supported "1h"
    "1h": "1h",
    "1d": "1d",
  };

  const safeInterval = intervalMap[run.interval] || "1m";

  const { data: klines, error: klinesError } = useSWR(
    isExpanded
      ? `/api/klines?symbol=${run.symbol}&interval=${safeInterval}&limit=100`
      : null,
    fetcher
  );

  if (klinesError) return <p className="text-red-400">Error loading chart</p>;
  if (!klines) return <p className="text-gray-500">Loading candlestick data...</p>;

  return <CandleChart data={klines} />;
}
