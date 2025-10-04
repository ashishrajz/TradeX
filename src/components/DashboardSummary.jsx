// src/components/DashboardSummary.jsx
"use client";

import React from "react";

export default function DashboardSummary({ portfolio }) {
  // portfolio.totalValue, portfolio.assets (array), portfolio.cash
  const assets = portfolio?.assets || [];
  const assetCount = assets.length;
  const stocksCount = assets.filter(a => a.quantity && a.quantity > 0).length;
  const totalAssetsValue = assets.reduce((acc, a) => {
    const price = a.currentPrice ?? a.price ?? 0;
    return acc + price * (a.quantity ?? 0);
  }, 0);

  return (
    <div className="backdrop-blur-xl bg-gray-900/60 p-6 rounded-2xl border border-green-500/20 shadow-md">
      <h2 className="text-2xl font-bold text-green-400 mb-4">Portfolio Summary</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-green-500/10">
          <p className="text-gray-400 text-sm">Total Amount</p>
          <p className="text-2xl font-bold text-green-400">
            ${Number(portfolio?.totalValue ?? 0).toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-green-500/10">
          <p className="text-gray-400 text-sm">No. of Stocks</p>
          <p className="text-2xl font-bold text-green-400">{stocksCount}</p>
        </div>

        <div className="p-4 rounded-xl border border-green-500/10">
          <p className="text-gray-400 text-sm">No. of Assets</p>
          <p className="text-2xl font-bold text-green-400">{assetCount}</p>
        </div>

        <div className="p-4 rounded-xl border border-green-500/10">
          <p className="text-gray-400 text-sm">Total Asset Cost</p>
          <p className="text-2xl font-bold text-green-400">
            ${Number(totalAssetsValue).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
