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
      
      // Simulate price changes
      const change = (Math.random() - 0.5) * 20;
      setCurrentPrice(prev => Math.max(1000, prev + change));
      setPriceChange(change);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => price.toFixed(2);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-800 z-50 overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
          {[...Array(96)].map((_, i) => (
            <div 
              key={i} 
              className="border border-green-400/20 animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400/60 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main content container with glassmorphism */}
      <div className="relative bg-black/40 backdrop-blur-sm border border-green-400/20 rounded-3xl p-8 shadow-2xl">
        
        {/* Header with live price */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <DollarSign className="w-8 h-8 text-green-400 animate-pulse" />
            <h1 className="text-2xl font-bold text-white tracking-wider">MARKET PULSE</h1>
            <BarChart3 className="w-8 h-8 text-green-400 animate-pulse" />
          </div>
          <div className="text-4xl font-mono font-bold text-green-400 mb-2">
            ${formatPrice(currentPrice)}
          </div>
          <div className={`text-sm font-semibold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange >= 0 ? '+' : ''}{formatPrice(priceChange)} 
            <TrendingUp className={`inline w-4 h-4 ml-1 ${priceChange >= 0 ? '' : 'rotate-180'}`} />
          </div>
        </div>

        {/* Enhanced Stock Graph */}
        <div className="relative w-80 h-40 mb-8 bg-black/20 rounded-xl p-4 border border-green-400/10">
          <svg className="w-full h-full">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="20" height="16" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 16" fill="none" stroke="rgb(34 197 94 / 0.1)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Glowing gradient area under the line */}
            <defs>
              <linearGradient id="stockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(34 197 94 / 0.3)" />
                <stop offset="100%" stopColor="rgb(34 197 94 / 0.05)" />
              </linearGradient>
            </defs>
            
            <polygon
              fill="url(#stockGradient)"
              points="0,120 20,100 40,105 60,80 80,85 100,70 120,90 140,75 160,80 180,65 200,85 220,70 240,75 320,75 320,120"
            >
              <animate
                attributeName="points"
                dur="3s"
                repeatCount="indefinite"
                values="
                  0,120 20,100 40,105 60,80 80,85 100,70 120,90 140,75 160,80 180,65 200,85 220,70 240,75 320,75 320,120;
                  0,120 20,95 40,85 60,90 80,70 100,85 120,65 140,80 160,70 180,90 200,65 220,80 240,70 320,70 320,120;
                  0,120 20,100 40,105 60,80 80,85 100,70 120,90 140,75 160,80 180,65 200,85 220,70 240,75 320,75 320,120
                "
              />
            </polygon>
            
            {/* Main trend line */}
            <polyline
              className="stroke-green-400 fill-none stroke-[3] drop-shadow-lg"
              points="0,100 20,80 40,85 60,60 80,65 100,50 120,70 140,55 160,60 180,45 200,65 220,50 240,55"
              filter="url(#glow)"
            >
              <animate
                attributeName="points"
                dur="3s"
                repeatCount="indefinite"
                values="
                  0,100 20,80 40,85 60,60 80,65 100,50 120,70 140,55 160,60 180,45 200,65 220,50 240,55;
                  0,75 20,85 40,65 60,70 80,50 100,65 120,45 140,60 160,50 180,70 200,45 220,60 240,50;
                  0,100 20,80 40,85 60,60 80,65 100,50 120,70 140,55 160,60 180,45 200,65 220,50 240,55
                "
              />
            </polyline>

            {/* Glow effect */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </svg>
          
          {/* Data points with pulse animation */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${30 + Math.sin(i) * 20}%`,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Enhanced coins animation with 3D effect */}
        <div className="relative w-80 h-20 overflow-hidden mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="relative mx-2">
                <div
                  className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg animate-bounce transform hover:scale-110 transition-transform"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "1s"
                  }}
                >
                  <div className="absolute inset-1 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full">
                    <DollarSign className="w-full h-full text-yellow-800 p-1" />
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-8 h-8 bg-yellow-400/30 rounded-full blur-sm animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced loading bar with segments */}
        <div className="relative">
          <div className="w-80 h-6 bg-slate-800/50 rounded-full overflow-hidden border border-green-400/20">
            <div
              className="h-full bg-gradient-to-r from-green-400 via-green-300 to-emerald-400 transition-all duration-100 rounded-full shadow-lg"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full w-full bg-gradient-to-t from-transparent to-white/20 rounded-full" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-green-400/70">
            <span>Loading market data...</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">Live Data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-xs text-blue-400">Real-time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-xs text-yellow-400">Analyzing</span>
          </div>
        </div>
      </div>

      {/* Bottom ambient glow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-32 bg-green-400/10 blur-3xl rounded-full" />
    </div>
  );
};

export default FullScreenStockLoader;