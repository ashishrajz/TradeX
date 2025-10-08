"use client";

import React from "react";
import useSWR from "swr";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const fetcher = (url) => fetch(url).then((r) => r.json());

// Custom Tooltip
function PriceTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const { price, time } = payload[0].payload;
    return (
      <div className="bg-gray-900/90 border border-green-500/30 text-white text-xs p-2 rounded-xl shadow-[0_0_12px_rgba(34,197,94,0.3)] backdrop-blur-md">
        <div>{new Date(time).toLocaleString()}</div>
        <div className="text-green-400 font-semibold">${price.toFixed(2)}</div>
      </div>
    );
  }
  return null;
}

export default function AssetDetailBox({ asset }) {
  const symbol = asset.symbol?.toUpperCase();
  const { data: trades } = useSWR(
    symbol ? `/api/user/trades?symbol=${symbol}&limit=100` : null,
    fetcher
  );

  // --- Financial Calculations ---
  const currentPrice = asset.currentPrice ?? asset.price ?? 0;
  const invested = currentPrice * (asset.quantity || 0);

  // 🧠 Improved avgCost calculation
  const avgCost =
    asset.avgCost && asset.avgCost > 0
      ? asset.avgCost
      : asset.costBasis && asset.quantity
      ? asset.costBasis / asset.quantity
      : trades?.length
      ? trades.reduce((acc, t) => acc + (t.price * t.quantity || 0), 0) /
        trades.reduce((acc, t) => acc + (t.quantity || 0), 0)
      : null;

  const priceChangePercent = asset.priceChangePercent ?? 0;
  const isUp = priceChangePercent >= 0;

  // --- Sparkline Data ---
  const sparkData = asset.sparkline?.length
    ? (() => {
        const now = Date.now();
        const start = now - 7 * 24 * 60 * 60 * 1000;
        const lastPrice = currentPrice || 1;
        const factor = lastPrice / asset.sparkline[asset.sparkline.length - 1];
        return asset.sparkline.map((p, i) => ({
          time: start + (i * 7 * 24 * 60 * 60 * 1000) / asset.sparkline.length,
          price: p * factor,
        }));
      })()
    : [];

  // --- Summary Items ---
  const summaryItems = [
    {
      label: "Portfolio Weight",
      value: `${(
        (invested / (asset.portfolioValue ?? invested)) *
        100
      ).toFixed(2)}%`,
    },
    { label: "Capital Invested", value: `$${invested.toFixed(2)}` },
    { label: "No. of Shares", value: asset.quantity },
    {
      label: "Avg Cost Price",
      value: avgCost ? `$${avgCost.toFixed(2)}` : "—",
    },
  ];

  // --- Recent Trades ---
  const recentTrades = (trades || [])
    .filter((t) => t.symbol?.toUpperCase() === symbol)
    .map((t) => ({ ...t, date: t.date ?? t.time ?? null }))
    .filter((t) => t.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="p-6 mt-4 rounded-3xl border border-green-500/20 bg-gradient-to-br from-gray-900/70 via-gray-800/50 to-gray-900/70 backdrop-blur-2xl shadow-[0_0_35px_rgba(34,197,94,0.15)] hover:shadow-[0_0_45px_rgba(34,197,94,0.25)] transition-all duration-300 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
          {asset.name} ({symbol})
        </h2>
        <div className="text-gray-400 mt-1 text-sm">
          ${Number(currentPrice).toLocaleString()}{" "}
          <span className={isUp ? "text-green-400" : "text-red-400"}>
            ({priceChangePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-40 rounded-xl overflow-hidden border border-green-500/20 bg-gray-900/60 backdrop-blur-md p-2">
        {sparkData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="sparkShadow" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isUp ? "#22c55e" : "#ef4444"}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="100%"
                    stopColor={isUp ? "#22c55e" : "#ef4444"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="time"
                tickFormatter={(t) => new Date(t).toLocaleDateString()}
                tick={{ fill: "#ccc", fontSize: 10 }}
              />
              <YAxis
                tick={{ fill: "#ccc", fontSize: 10 }}
                domain={["dataMin", "dataMax"]}
                width={60}
              />
              <Tooltip content={<PriceTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isUp ? "#22c55e" : "#ef4444"}
                strokeWidth={2}
                fill="url(#sparkShadow)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-500 text-center mt-14">No data</div>
        )}
      </div>

      {/* Summary */}
      <div className="p-4 rounded-2xl bg-gray-800/60 border border-green-500/10 backdrop-blur-md grid grid-cols-2 gap-x-6 gap-y-2">
        {summaryItems.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <div className="text-gray-400">{item.label}:</div>
            <div className="text-white font-semibold">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Trades */}
      <div className="p-4 rounded-2xl bg-gray-800/60 border border-green-500/10 backdrop-blur-md space-y-2">
        <div className="text-sm text-gray-400 font-semibold">Recent Trades</div>
        {recentTrades.length ? (
          recentTrades.map((t, i) => (
            <div
              key={t._id || i}
              className="flex justify-between text-sm border-b border-gray-700/40 pb-1 last:border-none"
            >
              <div
                className={
                  t.side?.toUpperCase() === "BUY"
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {t.side?.toUpperCase()}
              </div>
              <div>
                {t.quantity} @ ${t.price.toFixed(2)}
              </div>
              <div className="text-gray-500">
                {new Date(t.date).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500">No trades</div>
        )}
      </div>
    </div>
  );
}
