"use client";
import dynamic from "next/dynamic";
import { ArrowUpRight, ArrowDownRight, MousePointerClick } from "lucide-react";
import Image from "next/image";

const Sparkline = dynamic(() => import("./Sparkline"), { ssr: false });

export default function AssetRow({ asset, onOpenDetail, isExpanded, anySelected }) {
  const isUp = (asset.priceChangePercent ?? 0) >= 0;

  const sparkData =
    asset.sparkline?.map((p, i) => {
      const now = Date.now();
      const start = now - 7 * 24 * 60 * 60 * 1000;
      return {
        time: start + (i * 7 * 24 * 60 * 60 * 1000) / asset.sparkline.length,
        price: p,
      };
    }) || [];

  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(asset)}
      className="group relative animate-slideUp cursor-pointer transition-all duration-300"
    >
      {/* Glow effect on hover */}
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${
          isUp ? "from-emerald-600 to-teal-600" : "from-rose-600 to-pink-600"
        } rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500`}
      ></div>

      <div
        className={`relative grid ${
          anySelected ? "grid-cols-4" : "grid-cols-5"
        } items-center bg-slate-900/60 backdrop-blur-xl border ${
          isExpanded
            ? "border-emerald-400/50 scale-[1.02] shadow-2xl shadow-emerald-500/20"
            : "border-white/5 group-hover:border-white/20"
        } rounded-3xl p-6 transition-all duration-300`}
      >
        {/* Coin Info + Quantity */}
        <div className="flex items-center gap-4 col-span-1">
          <div className="relative">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                isUp ? "from-emerald-400 to-teal-400" : "from-rose-400 to-pink-400"
              } rounded-full blur-md opacity-50`}
            ></div>
            <Image
              src={asset.image || "/placeholder.png"}
              alt={asset.symbol}
              width={56}
              height={56}
              className="relative w-14 h-14 rounded-full ring-2 ring-white/10 group-hover:ring-white/30 transition-all duration-300"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xl uppercase">{asset.symbol}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  isUp ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {isUp ? "BULL" : "BEAR"}
              </span>
            </div>
            <div className="text-xs text-gray-400">Qty: {asset.quantity}</div>
          </div>
        </div>

        {/* Current Price */}
        <div className="col-span-1">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Price</div>
          <div className="font-bold text-white text-lg">
            ${Number(asset.currentPrice ?? 0).toLocaleString()}
          </div>
        </div>

        {/* Market Value */}
        <div className="col-span-1">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Market Value</div>
          <div className="font-bold text-gray-300 text-lg">
            ${Number(asset.marketValue ?? 0).toLocaleString()}
          </div>
        </div>

        {/* 24h Change */}
        <div className="col-span-1 flex flex-col items-start">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">24h Change</div>
          <div
            className={`flex items-center gap-1.5 font-semibold ${
              isUp ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isUp ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {Number(asset.priceChangePercent ?? 0).toFixed(2)}%
          </div>
        </div>

        {/* Sparkline */}
        {!anySelected && (
          <div className="hidden md:block h-20 col-span-1">
            {sparkData.length > 0 ? (
              <Sparkline prices={sparkData} up={isUp} />
            ) : (
              <div className="text-gray-600 text-xs flex items-center justify-center h-full">
                No data
              </div>
            )}
          </div>
        )}

        {/* Action Button (like in FeaturedCoins) */}
        <div className="hidden sm:flex justify-end col-span-full sm:col-span-1">
          <button className="relative group/btn overflow-hidden px-5 py-3 rounded-xl">
            <span className="relative z-10">
              <MousePointerClick className="w-5 h-5 text-gray-300 group-hover/btn:text-white transition" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      </div>

      {/* Animations (same as FeaturedCoins) */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out backwards;
        }
      `}</style>
    </div>
  );
}
