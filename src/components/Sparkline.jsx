"use client";

import React from "react";
import { ResponsiveContainer, LineChart, Line, Area, XAxis, YAxis, Tooltip } from "recharts";

function PriceTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const { price, time } = payload[0].payload;
    
    // Dynamic formatting: small numbers get more decimals
    const formattedPrice =
      price >= 1 ? price.toFixed(2) : price >= 0.01 ? price.toFixed(4) : price.toFixed(8);

    return (
      <div className="bg-gray-800 text-white text-xs p-2 rounded shadow">
        <div>{new Date(time).toLocaleString()}</div>
        <div>${formattedPrice}</div>
      </div>
    );
  }
  return null;
}


export default function Sparkline({ prices = [], up = true }) {
  

  if (!prices || prices.length === 0) return <div className="text-gray-500 text-xs">No data</div>;

  const data = Array.isArray(prices) && typeof prices[0] === "number"
    ? (() => {
        const now = Date.now();
        const start = now - 7 * 24 * 60 * 60 * 1000;
        const step = (7 * 24 * 60 * 60 * 1000) / prices.length;
        const mapped = prices.map((p, i) => ({
          time: start + i * step,
          price: p,
        }));
        
        return mapped;
      })()
    : prices.map((p) => {
        const mapped = { time: p.time ?? p[0], price: p.price ?? p[1] ?? p };
        ("Mapped object:", mapped); // 🔥 debug
        return mapped;
      });

  const stroke = up ? "#22c55e" : "#ef4444";

  return (
    <div className="h-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, bottom: 0, left: 0, right: 0 }}>
          <defs>
            <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis dataKey="time" hide />
          <YAxis hide domain={["dataMin", "dataMax"]} />

          <Area type="monotone" dataKey="price" stroke="none" fill="url(#sparklineGrad)" />
          <Line type="monotone" dataKey="price" stroke={stroke} dot={false} strokeWidth={2} />

          <Tooltip content={<PriceTooltip />} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
