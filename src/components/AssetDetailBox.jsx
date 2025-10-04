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

// Custom tooltip
function PriceTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const { price, time } = payload[0].payload;
    return (
      <div className="bg-gray-800 text-white text-xs p-2 rounded shadow">
        <div>{new Date(time).toLocaleString()}</div>
        <div>${price.toFixed(2)}</div>
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

  console.log("Raw trades for symbol", symbol, trades);

  const invested = ((asset.currentPrice ?? asset.price) || 0) * (asset.quantity || 0);
  const avgCost =
    asset.avgCost ??
    (asset.costBasis ? asset.costBasis / (asset.quantity || 1) : null);

  const priceChangePercent = asset.priceChangePercent ?? 0;
  const isUp = priceChangePercent >= 0;

  // Prepare sparkline data
  const sparkData = asset.sparkline?.length
    ? (() => {
        const now = Date.now();
        const start = now - 7 * 24 * 60 * 60 * 1000;
        const lastPrice = asset.currentPrice ?? asset.price ?? 1;
        const sparkline = asset.sparkline;
        const factor = lastPrice / sparkline[sparkline.length - 1];

        return sparkline.map((p, i) => ({
          time: start + (i * 7 * 24 * 60 * 60 * 1000) / sparkline.length,
          price: p * factor,
        }));
      })()
    : [];

  const summaryItems = [
    { label: "Portfolio Weight", value: `${((invested / (asset.portfolioValue ?? invested)) * 100).toFixed(2)}%` },
    { label: "Capital Invested", value: `$${invested.toFixed(2)}` },
    { label: "No. of Shares", value: asset.quantity },
    { label: "Avg Cost Price", value: avgCost ? `$${avgCost.toFixed(4)}` : "—" },
  ];

  // Normalize trades: filter by symbol, pick last 5, fix date
  const recentTrades = (trades || [])
    .filter(t => t.symbol?.toUpperCase() === symbol)
    .map(t => ({
      ...t,
      date: t.date ?? t.time ?? null,
    }))
    .filter(t => t.date) // remove invalid dates
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  console.log("Normalized recent trades", recentTrades);

  return (
    <div className="p-4 bg-gray-900 rounded-2xl border border-green-500/20 mt-3 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{asset.name} ({symbol})</h2>
        <div className="text-gray-400 mt-1">
          ${Number(asset.currentPrice ?? asset.price).toLocaleString()}{" "}
          <span className={isUp ? "text-green-400" : "text-red-400"}>
            ({priceChangePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-40">
        {sparkData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="sparkShadow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0} />
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
                width={70}
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
          <div className="text-gray-500 text-center mt-16">No data</div>
        )}
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-800 rounded-xl grid grid-cols-2 gap-x-6 gap-y-2">
        {summaryItems.map((item, idx) => (
          <div key={idx} className="flex justify-between">
            <div className="text-gray-400 text-sm">{item.label}:</div>
            <div className="text-white text-sm font-semibold">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Trades */}
      <div className="p-4 bg-gray-800 rounded-xl space-y-2">
        <div className="text-sm text-gray-400 font-semibold">Recent Trades</div>
        {recentTrades.length ? (
          recentTrades.map((t, i) => (
            <div key={t._id || i} className="flex justify-between text-sm">
              <div className={t.side === "BUY" ? "text-green-400" : "text-red-400"}>
                {t.side}
              </div>
              <div>{t.quantity} @ ${t.price.toFixed(2)}</div>
              <div className="text-gray-500">{new Date(t.date).toLocaleString()}</div>
            </div>
          ))
        ) : (
          <div className="text-gray-500">No trades</div>
        )}
      </div>
    </div>
  );
}
