"use client";
import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, BarChart3 } from "lucide-react";

const ChartStockLoader = () => {
  const [progress, setProgress] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(1234.56);
  const [priceChange, setPriceChange] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      const change = (Math.random() - 0.5) * 20;
      setCurrentPrice((prev) => Math.max(1000, prev + change));
      setPriceChange(change);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => price.toFixed(2);

  return (
    <div className="relative flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-800 rounded-xl overflow-hidden h-104 w-full">
      {/* floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400/60 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* live price */}
      <div className="text-center mb-4">
        <div className="text-xl font-mono font-bold text-green-400">
          ${formatPrice(currentPrice)}
        </div>
        <div
          className={`text-xs font-semibold ${
            priceChange >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {priceChange >= 0 ? "+" : ""}
          {formatPrice(priceChange)}
          <TrendingUp
            className={`inline w-3 h-3 ml-1 ${
              priceChange >= 0 ? "" : "rotate-180"
            }`}
          />
        </div>
      </div>

      {/* loading bar */}
      <div className="relative w-48">
        <div className="w-full h-3 bg-slate-800/50 rounded-full overflow-hidden border border-green-400/20">
          <div
            className="h-full bg-gradient-to-r from-green-400 via-green-300 to-emerald-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-green-400/70">
          <span>Loading...</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default ChartStockLoader;
