"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
function PriceTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const price = payload[0].value?.toFixed(2);
    return (
      <div className="bg-gray-800 text-white text-xs p-2 rounded shadow">
        <div>{new Date(label).toLocaleString()}</div>
        <div>${price}</div>
      </div>
    );
  }
  return null;
}

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function FeaturedCoins({ query, onSelect }) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // ✅ debounce
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 600);
    return () => clearTimeout(handler);
  }, [query]);

  const url =
    debouncedQuery && debouncedQuery.trim() !== ""
      ? `/api/coins?q=${encodeURIComponent(debouncedQuery)}`
      : `/api/coins?per_page=10`;

  const { data, error, isLoading } = useSWR(url, fetcher);

  if (error) return <div>Error loading coins</div>;
  if (isLoading) return <div>Loading coins...</div>;

  const coins = Array.isArray(data) ? data : [];
  if (coins.length === 0) return <div>No coins found</div>;

  return (
    <div className="bg-gray-950 rounded-2xl border border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">🔥 Featured Coins</h3>

      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => onSelect(e.target.value)}
          placeholder="Search coins..."
          className="w-full border border-blue-500 rounded-xl p-2 pr-10 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Table header */}
      <div className="grid grid-cols-6 text-gray-400 text-sm font-medium border-b border-gray-700 pb-2 mb-2">
        <div>Coin</div>
        <div>Price</div>
        <div>Change (24h)</div>
        <div>% Change</div>
        <div className="hidden md:block">7d Trend</div>
        <div></div>
      </div>

      {/* Table rows */}
      <div className="space-y-2">
        {coins.map((coin) => {
          const isUp = coin.price_change_percentage_24h >= 0;

          // Generate time-series data with real timestamps
          let sparkData = [];
          if (coin.sparkline_in_7d?.price) {
            const now = Date.now();
            const start = now - 7 * 24 * 60 * 60 * 1000; // 7 days ago
            const step = (7 * 24 * 60 * 60 * 1000) / coin.sparkline_in_7d.price.length;
            sparkData = coin.sparkline_in_7d.price.map((p, i) => ({
              time: start + i * step,
              price: p,
            }));
          }

          return (
            <div
              key={coin.id}
              onClick={() => onSelect(coin)}
              className="grid grid-cols-6 items-center text-white py-2 px-2 rounded-lg hover:bg-gray-800 cursor-pointer transition"
            >
              {/* Coin info */}
              <div className="flex items-center gap-2">
                <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                <div>
                  <div className="font-semibold">{coin.symbol.toUpperCase()}</div>
                  <div className="text-xs text-gray-400">{coin.name}</div>
                </div>
              </div>

              {/* Price */}
              <div className="font-semibold">${coin.current_price?.toLocaleString()}</div>

              {/* Price Change */}
              <div className={isUp ? "text-green-400" : "text-red-400"}>
                {coin.price_change_24h?.toFixed(2)}
              </div>

              {/* Percentage Change */}
              <div className={isUp ? "text-green-400" : "text-red-400"}>
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </div>

              {/* Sparkline (7d trend with shadow + tooltip) */}
<div className="hidden md:block h-16">
  {coin.sparkline_in_7d?.price && coin.sparkline_in_7d.price.length > 0 ? (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={coin.sparkline_in_7d.price.map((p, i) => {
          const now = Date.now();
          const start = now - 7 * 24 * 60 * 60 * 1000; // 7 days ago
          const timestamp = start + (i * 7 * 24 * 60 * 60 * 1000) / coin.sparkline_in_7d.price.length;
          return { time: timestamp, price: p };
        })}
        margin={{ top: 5, bottom: 0, left: 0, right: 0 }}
      >
        {/* gradient for shadow */}
        <defs>
          <linearGradient id={`grad-${coin.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={isUp ? "#22c55e" : "#ef4444"}
              stopOpacity={0.3}
            />
            <stop
              offset="100%"
              stopColor={isUp ? "#22c55e" : "#ef4444"}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>

        <XAxis dataKey="time" hide />
        <YAxis hide domain={["dataMin", "dataMax"]} />

        {/* translucent shadow */}
        <Area
          type="monotone"
          dataKey="price"
          stroke="none"
          fill={`url(#grad-${coin.id})`}
        />

        {/* line */}
        <Line
          type="monotone"
          dataKey="price"
          stroke={isUp ? "#22c55e" : "#ef4444"}
          dot={false}
          strokeWidth={2}
        />

        {/* tooltip */}
        <Tooltip content={<PriceTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  ) : (
    <div className="text-gray-500 text-xs">No data</div>
  )}
</div>



              {/* Action */}
              <div className="text-right">
                <button className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 text-sm">
                  Trade
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
