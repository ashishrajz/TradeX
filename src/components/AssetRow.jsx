"use client";

import React from "react";
import dynamic from "next/dynamic";

const Sparkline = dynamic(() => import("./Sparkline"), { ssr: false });

export default function AssetRow({ asset, onOpenDetail, isExpanded, anySelected }) {
  const isUp = (asset.priceChangePercent ?? 0) >= 0;

  // ✅ Scale sparkline to actual current price
  const sparkData = asset.sparkline?.length
    ? (() => {
        const now = Date.now();
        const start = now - 7 * 24 * 60 * 60 * 1000; // 7 days
        const lastPrice = asset.currentPrice ?? asset.price ?? 1; // fallback
        const sparkline = asset.sparkline;
        const factor = lastPrice / sparkline[sparkline.length - 1]; // scale to current price

        return sparkline.map((p, i) => ({
          time: start + i * (7 * 24 * 60 * 60 * 1000) / sparkline.length,
          price: p * factor,
        }));
      })()
    : [];

  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(asset)}
      className={`grid items-center text-white py-3 px-3 rounded-lg cursor-pointer transition
        ${isExpanded ? "bg-gray-800 border border-green-500/40 shadow-lg" : "hover:bg-gray-800/60"}
        ${anySelected ? "grid-cols-4" : "grid-cols-5"}
      `}
    >
      {/* Coin info + Quantity */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-semibold text-sm">
            {asset.symbol?.slice(0, 3)}
          </div>
          <div className="font-semibold">{asset.symbol}</div>
        </div>
        <div className="text-xs text-gray-400">Qty: {asset.quantity}</div>
      </div>

      {/* Current price */}
      <div className="font-semibold">
        ${Number(asset.currentPrice ?? 0).toLocaleString()}
      </div>

      {/* Market value */}
      <div className="text-gray-300">
        ${Number(asset.marketValue ?? 0).toLocaleString()}
      </div>

      {/* 24h % Change */}
      <div className={isUp ? "text-green-400" : "text-red-400"}>
        {Number(asset.priceChangePercent ?? 0).toFixed(2)}%
      </div>

      {/* Sparkline (only show if no asset selected) */}
      {!anySelected && (
        <div className="hidden md:block h-12">
          {sparkData.length > 0 ? (
            <Sparkline prices={sparkData} up={isUp} />
          ) : (
            <div className="text-gray-500 text-xs">No data</div>
          )}
        </div>
      )}
    </div>
  );
}
