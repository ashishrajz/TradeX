"use client";

import React from "react";

export default function DashboardSummary({ portfolio }) {
  const assets = portfolio?.assets || [];
  const assetCount = assets.length;
  const stocksCount = assets.filter((a) => a.quantity && a.quantity > 0).length;
  const totalAssetsValue = assets.reduce((acc, a) => {
    const price = a.currentPrice ?? a.price ?? 0;
    return acc + price * (a.quantity ?? 0);
  }, 0);

  const isLoading = !portfolio || Object.keys(portfolio).length === 0;

  // Shimmer placeholder
  const Shimmer = () => (
    <div className="h-6 w-24 bg-gray-700/40 rounded-md animate-pulse" />
  );

  return (
    <div className="backdrop-blur-2xl bg-gradient-to-br from-gray-900/70 via-gray-800/50 to-gray-900/70 p-6 rounded-3xl border border-green-500/20 shadow-[0_0_35px_rgba(34,197,94,0.1)] hover:shadow-[0_0_45px_rgba(34,197,94,0.25)] transition-all duration-500">
      {/* Header */}
      <h2 className="text-3xl font-extrabold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] mb-6">
        Portfolio <span className="text-green-400">Summary</span>
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Amount */}
        <div className="group p-5 rounded-2xl border border-green-500/20 bg-gray-900/60 backdrop-blur-lg shadow-[inset_0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_25px_rgba(34,197,94,0.3)] transition-all duration-300">
          <p className="text-gray-400 text-sm mb-1">Total Amount</p>
          {isLoading ? (
            <Shimmer />
          ) : (
            <p className="text-2xl font-bold text-green-400 drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]">
              ${Number(portfolio?.totalValue ?? 0).toLocaleString()}
            </p>
          )}
        </div>

        {/* No. of Stocks */}
        <div className="group p-5 rounded-2xl border border-green-500/20 bg-gray-900/60 backdrop-blur-lg shadow-[inset_0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_25px_rgba(34,197,94,0.3)] transition-all duration-300">
          <p className="text-gray-400 text-sm mb-1">No. of Stocks</p>
          {isLoading ? (
            <Shimmer />
          ) : (
            <p className="text-2xl font-bold text-green-400 drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]">
              {stocksCount}
            </p>
          )}
        </div>

        {/* No. of Assets */}
        <div className="group p-5 rounded-2xl border border-green-500/20 bg-gray-900/60 backdrop-blur-lg shadow-[inset_0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_25px_rgba(34,197,94,0.3)] transition-all duration-300">
          <p className="text-gray-400 text-sm mb-1">No. of Assets</p>
          {isLoading ? (
            <Shimmer />
          ) : (
            <p className="text-2xl font-bold text-green-400 drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]">
              {assetCount}
            </p>
          )}
        </div>

        {/* Total Asset Cost */}
        <div className="group p-5 rounded-2xl border border-green-500/20 bg-gray-900/60 backdrop-blur-lg shadow-[inset_0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_25px_rgba(34,197,94,0.3)] transition-all duration-300">
          <p className="text-gray-400 text-sm mb-1">Total Asset Cost</p>
          {isLoading ? (
            <Shimmer />
          ) : (
            <p className="text-2xl font-bold text-green-400 drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]">
              ${Number(totalAssetsValue).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
