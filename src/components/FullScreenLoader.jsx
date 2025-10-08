"use client";
import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, BarChart3 } from "lucide-react";

const FullScreenStockLoader = () => {
  const [progress, setProgress] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(1234.56);
  const [priceChange, setPriceChange] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      const change = (Math.random() - 0.5) * 10;
      setCurrentPrice((prev) => Math.max(1000, prev + change));
      setPriceChange(change);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (p) => p.toFixed(2);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black z-50 overflow-hidden">
      {/* Subtle animated gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(34,197,94,0.1),transparent_60%)] animate-pulse-slow" />

      {/* Faint grid */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="grid grid-cols-16 grid-rows-10 h-full w-full">
          {[...Array(160)].map((_, i) => (
            <div key={i} className="border border-emerald-400/40" />
          ))}
        </div>
      </div>

      {/* Main Glass Panel */}
      <div className="relative bg-black/50 backdrop-blur-md border border-emerald-400/10 rounded-3xl p-10 shadow-[0_0_60px_-10px_rgba(16,185,129,0.3)] flex flex-col items-center max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <DollarSign className="w-7 h-7 text-emerald-400 animate-pulse" />
            <h1 className="text-2xl font-semibold text-white tracking-wide">Market Pulse</h1>
            <BarChart3 className="w-7 h-7 text-emerald-400 animate-pulse" />
          </div>

          <div className="text-4xl font-mono font-bold text-emerald-400 mb-1">
            ${formatPrice(currentPrice)}
          </div>

          <div
            className={`text-sm font-medium ${
              priceChange >= 0 ? "text-emerald-400" : "text-red-400"
            } flex items-center justify-center`}
          >
            {priceChange >= 0 ? "+" : ""}
            {formatPrice(priceChange)}
            <TrendingUp
              className={`ml-1 w-4 h-4 ${
                priceChange >= 0 ? "" : "rotate-180"
              }`}
            />
          </div>
        </div>

        {/* Smooth Animated Chart */}
        <div className="relative w-80 h-40 mb-8 bg-gradient-to-b from-slate-900/60 to-black/60 rounded-xl border border-emerald-400/10 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full">
            {/* Gradient fill */}
            <defs>
              <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(34,197,94,0.3)" />
                <stop offset="100%" stopColor="rgba(34,197,94,0.05)" />
              </linearGradient>
            </defs>
            <polygon
              fill="url(#stockGradient)"
              points="0,120 20,100 40,105 60,80 80,85 100,70 120,90 140,75 160,80 180,65 200,85 220,70 240,75 320,75 320,120"
            >
              <animate
                attributeName="points"
                dur="4s"
                repeatCount="indefinite"
                values="
                  0,120 20,100 40,105 60,80 80,85 100,70 120,90 140,75 160,80 180,65 200,85 220,70 240,75 320,75 320,120;
                  0,120 20,95 40,85 60,90 80,70 100,85 120,65 140,80 160,70 180,90 200,65 220,80 240,70 320,70 320,120;
                  0,120 20,100 40,105 60,80 80,85 100,70 120,90 140,75 160,80 180,65 200,85 220,70 240,75 320,75 320,120
                "
              />
            </polygon>

            <polyline
              className="stroke-emerald-400/90 fill-none stroke-[2.5]"
              points="0,100 20,80 40,85 60,60 80,65 100,50 120,70 140,55 160,60 180,45 200,65 220,50 240,55"
            >
              <animate
                attributeName="points"
                dur="4s"
                repeatCount="indefinite"
                values="
                  0,100 20,80 40,85 60,60 80,65 100,50 120,70 140,55 160,60 180,45 200,65 220,50 240,55;
                  0,75 20,85 40,65 60,70 80,50 100,65 120,45 140,60 160,50 180,70 200,45 220,60 240,50;
                  0,100 20,80 40,85 60,60 80,65 100,50 120,70 140,55 160,60 180,45 200,65 220,50 240,55
                "
              />
            </polyline>
          </svg>

          {/* Glowing data points */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse"
              style={{
                left: `${12 + i * 14}%`,
                top: `${40 + Math.sin(i * 1.5) * 10}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="relative w-80 mb-6">
          <div className="h-4 bg-slate-800/70 rounded-full overflow-hidden border border-emerald-400/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-emerald-400/60 font-mono">
            <span>Loading market data</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex justify-center gap-6 text-xs font-medium">
          {[
            ["Live Data", "bg-emerald-400", "text-emerald-400"],
            ["Real-time", "bg-blue-400", "text-blue-400"],
            ["Analyzing", "bg-yellow-400", "text-yellow-400"],
          ].map(([label, dot, text], i) => (
            <div key={i} className={`flex items-center gap-2 ${text}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${dot}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ambient bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30rem] h-48 bg-emerald-400/10 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
};

export default FullScreenStockLoader;