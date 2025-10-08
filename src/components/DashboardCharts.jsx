"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState, useEffect } from "react";

// Color palette
const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-gray-900/80 backdrop-blur-md border border-green-500/30 text-white p-2 text-xs rounded-xl shadow-md">
        <div>{d.name}</div>
        <div>
          {d.value.toLocaleString()} {d.isQuantity ? "units" : "$"}
        </div>
      </div>
    );
  }
  return null;
}

// 💫 Shimmer Loader
function ShimmerCard() {
  return (
    <div className="bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-2xl p-6 animate-pulse">
      <div className="h-6 bg-gray-700/50 rounded w-1/3 mb-4"></div>
      <div className="h-64 bg-gray-800/60 rounded"></div>
    </div>
  );
}

export default function DashboardCharts({
  equityCurve = [],
  assets = [],
  cash = 0,
  equityHistory = [],
}) {
  const [loading, setLoading] = useState(true);

  // Simulate shimmer loader (remove in production if you have actual async data)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // 🟩 Prepare chart data
  const equityData =
    (equityCurve.length > 0 ? equityCurve : equityHistory).map((p) => ({
      time: new Date(p.at).toISOString(),
      total: Number(p.total),
    }));

  if (equityData.length === 0) {
    equityData.push({
      time: new Date().toISOString(),
      total:
        Number(cash) +
        assets.reduce(
          (acc, a) =>
            acc + (Number(a.currentPrice || 0) * Number(a.quantity || 0)),
          0
        ),
    });
  }

  const pieByValue = assets.map((a, i) => ({
    name: a.symbol,
    value: (a.currentPrice || 0) * (a.quantity || 0),
    color: COLORS[i % COLORS.length],
    isQuantity: false,
  }));

  const pieByQty = assets.map((a, i) => ({
    name: a.symbol,
    value: a.quantity || 0,
    color: COLORS[i % COLORS.length],
    isQuantity: true,
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <ShimmerCard />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ShimmerCard />
          <ShimmerCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 📈 Total Value Over Time */}
      <div className="bg-gray-900/30 backdrop-blur-xl border border-green-500/20 p-6 rounded-2xl shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300">
        <h2 className="text-xl font-bold text-green-400 mb-4 drop-shadow-[0_0_10px_#22c55e90]">
          📊 Total Account Value Over Time
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={equityData}>
            <defs>
              <linearGradient id="greenShadow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="time"
              tickFormatter={(t) =>
                new Date(t).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
              tick={{ fill: "#ccc", fontSize: 10 }}
            />
            <YAxis
              tick={{ fill: "#ccc", fontSize: 10 }}
              domain={["auto", "auto"]}
              width={70}
            />
            <Tooltip
              labelFormatter={(t) => new Date(t).toLocaleString()}
              formatter={(val) => `$${Number(val).toFixed(2)}`}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#greenShadow)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 🥧 Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 💰 Distribution by Value */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-green-500/20 p-6 rounded-2xl shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300 flex">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-green-400 mb-4 drop-shadow-[0_0_6px_#22c55e80]">
              💰 Distribution by Value
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieByValue} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                  {pieByValue.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-2 pl-6">
            {pieByValue.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <span
                  className="w-3 h-3 rounded shadow-sm"
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span>{entry.name}</span>
                <span className="text-gray-400">${entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 📦 Distribution by Quantity */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-green-500/20 p-6 rounded-2xl shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300 flex">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-green-400 mb-4 drop-shadow-[0_0_6px_#22c55e80]">
              📦 Distribution by Quantity
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieByQty} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                  {pieByQty.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-2 pl-6">
            {pieByQty.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <span
                  className="w-3 h-3 rounded shadow-sm"
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span>{entry.name}</span>
                <span className="text-gray-400">{entry.value} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
