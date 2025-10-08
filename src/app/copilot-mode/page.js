"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;




import { useState } from "react";
import useSWR from "swr";
import Sidebar from "@/components/Sidebar";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ChevronDown,
  ChevronRight,
  StopCircle,
  History,
  BarChart3,
  PlayCircle,
  Wallet,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import CandleChart from "@/components/CandleChart";
import CopilotStart from "@/components/CopilotStart";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function CopilotDashboard() {
  const { data: runs, mutate } = useSWR("/api/copilot/runs", fetcher, {
    refreshInterval: 15_000,
  });
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("copilotmode");

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

  if (!runs) {
    return (
      <div className="flex min-h-screen">
        <Sidebar activeTab="copilotmode" setActiveTab={setActiveTab} />
        <div className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div>
            <p className="text-slate-400 text-lg font-medium">Loading Copilot Runs...</p>
          </div>
        </div>
      </div>
    );
  }

  const runningRuns = runs.filter((r) => r.status === "running");
  const stoppedRuns = runs.filter((r) => r.status !== "running");

  const renderRun = (run) => {
    const equityHistory = (run.equityCurve || []).map((pt) => ({
      time: new Date(pt.at).toLocaleTimeString(),
      equity: pt.equity,
    }));

    const totalEquity = equityHistory.at(-1)?.equity || run.capital;
    const totalPnL = totalEquity - run.capital;
    const pnlPercent = ((totalPnL / run.capital) * 100).toFixed(2);
    const isProfit = totalPnL >= 0;

    return (
      <div
        key={run._id}
        className="bg-slate-900/60 backdrop-blur-lg rounded-2xl border border-slate-800/40 hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/40 flex flex-col md:flex-row justify-between gap-4">
          {/* Left */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 rounded-xl shadow-md">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
              <div className="flex flex-col">
  <h2 className="text-2xl font-bold text-white">{run.symbol}</h2>
  <p className="text-sm text-slate-400">
    Strategy:{" "}
    {run.strategyUrl ? (
      <a
        href={run.strategyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-emerald-400 hover:underline"
      >
        {run.strategyName}
      </a>
    ) : (
      <span className="text-slate-300">{run.strategyName}</span>
    )}
  </p>
</div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    run.status === "running"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-700/50 text-slate-400 border border-slate-600/30"
                  }`}
                >
                  {run.status === "running" ? (
                    <span className="flex items-center gap-1">
                      <PlayCircle className="w-3 h-3" /> Running
                    </span>
                  ) : (
                    "Stopped"
                  )}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Wallet className="w-4 h-4" /> Capital: ${run.capital.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> Remaining: ${run.remainingCapital.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className={`text-2xl font-bold flex items-center gap-2 ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
              {isProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              ${Math.abs(totalPnL).toFixed(2)}
            </div>
            <div className={`text-sm font-medium ${isProfit ? "text-emerald-400/70" : "text-red-400/70"}`}>
              {isProfit ? "+" : ""}{pnlPercent}%
            </div>

            {run.status === "running" && (
              <button
                onClick={() => stopRun(run._id)}
                disabled={loading}
                className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <StopCircle className="w-4 h-4" /> Stop
              </button>
            )}

            <button
              onClick={() => toggleExpand(run._id)}
              className="p-2 bg-slate-800/50 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all"
            >
              {expanded[run._id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded[run._id] && (
          <div className="p-6 space-y-6 bg-slate-950/50 backdrop-blur-lg rounded-b-2xl border-t border-slate-800/30">
            {/* Equity Curve */}
<DetailCard
  icon={<BarChart3 className="w-5 h-5 text-emerald-400" />}
  title="Equity Curve"
>
  {equityHistory.length > 0 ? (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={equityHistory}>
          <XAxis
            dataKey="time"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="equity"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <p className="text-slate-500 text-sm py-8 text-center">
      No equity data yet
    </p>
  )}
</DetailCard>


            {/* Trade Log */}
            <DetailCard icon={<History className="w-5 h-5 text-cyan-400" />} title="Trade History">
              {run.tradeHistory?.length > 0 ? (
                <div className="max-h-64 overflow-y-auto custom-scrollbar rounded-md border border-slate-800/20">
                  <table className="w-full text-sm border-separate border-spacing-0">
                    <thead className="text-slate-400 border-b border-slate-800 sticky top-0 bg-slate-950/90 backdrop-blur-sm">
                      <tr>
                        <th className="p-3 text-left font-medium">Side</th>
                        <th className="p-3 text-left font-medium">Quantity</th>
                        <th className="p-3 text-left font-medium">Price</th>
                        <th className="p-3 text-left font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {run.tradeHistory.map((t, i) => (
                        <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                              t.side === "BUY"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/10 text-red-400 border border-red-500/30"
                            }`}>
                              {t.side}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 font-medium">{t.quantity}</td>
                          <td className="p-3 text-slate-300">${t.price.toFixed(2)}</td>
                          <td className="p-3 text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(t.at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 text-sm py-8 text-center">No trades yet</p>
              )}
            </DetailCard>

            {/* Candlestick */}
            <DetailCard icon={<Activity className="w-5 h-5 text-violet-400" />} title="Candlestick Chart">
              <CandlestickSection run={run} isExpanded={expanded[run._id]} />
            </DetailCard>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab="copilotmode" setActiveTab={setActiveTab} />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl shadow-md">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Copilot Dashboard
              </h1>
            </div>
            <p className="text-slate-400 ml-14">Manage and monitor your automated trading runs</p>
          </div>

          <div className="mb-8">
            <CopilotStart onStarted={() => window.location.reload()} />
          </div>

          {/* Running Runs */}
          <RunSection icon={<PlayCircle className="w-6 h-6" />} color="emerald" title="Running" runs={runningRuns} renderRun={renderRun} />

          {/* Stopped Runs */}
          <RunSection icon={<StopCircle className="w-6 h-6" />} color="slate" title="Stopped" runs={stoppedRuns} renderRun={renderRun} />
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1e293b;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #475569;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #64748b;
          }
        `}</style>
      </div>
    </div>
  );
}

// ---------------- Helper Components ----------------
function DetailCard({ icon, title, children }) {
  return (
    <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800/30 shadow-sm">
      <div className="flex items-center gap-2 mb-4">{icon}<h3 className="text-sm font-semibold text-slate-300">{title}</h3></div>
      {children}
    </div>
  );
}

function RunSection({ icon, color, title, runs, renderRun }) {
  return (
    <div className="mb-8">
      <h2 className={`text-2xl font-bold text-${color}-400 mb-4 flex items-center gap-2`}>
        {icon} {title}
      </h2>
      {runs.length > 0 ? <div className="space-y-4">{runs.map(renderRun)}</div> : (
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-8 text-center">
          <p className="text-slate-500">No {title.toLowerCase()} runs</p>
        </div>
      )}
    </div>
  );
}

// Candlestick Section
function CandlestickSection({ run, isExpanded }) {
  const intervalMap = { "1m": "1m", "5m": "5m", "60": "1h", "1h": "1h", "1d": "1d" };
  const safeInterval = intervalMap[run.interval] || "1m";

  const { data: klines, error: klinesError } = useSWR(
    isExpanded ? `/api/klines?symbol=${run.symbol}&interval=${safeInterval}&limit=100` : null,
    fetcher
  );

  if (klinesError) return <div className="py-8 text-center text-red-400">Error loading chart</div>;
  if (!klines) return <div className="py-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div>;

  return <CandleChart data={klines} />;
}
