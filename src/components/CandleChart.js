"use client";

import {
  ChartCanvas,
  Chart,
  CandlestickSeries,
  XAxis,
  YAxis,
  OHLCTooltip,
} from "react-financial-charts";
import { scaleTime } from "d3-scale";
import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

export default function CandleChart({ data }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: 800,
    height: 400,
  });

  // Resize dynamically based on parent container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 400,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Guard against missing/empty data
  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl border border-slate-800/50 shadow-2xl p-8">
        <div className="flex items-center justify-center h-64 text-slate-500">
          <div className="text-center space-y-3">
            <BarChart3 className="w-12 h-12 mx-auto opacity-40" />
            <p className="text-lg font-medium">No candlestick data available</p>
          </div>
        </div>
      </div>
    );
  }

  const xAccessor = (d) => new Date(d.openTime);
  
  // Calculate price change
  const firstPrice = data[0].open;
  const lastPrice = data[data.length - 1].close;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = ((priceChange / firstPrice) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  return (
    <div
      ref={containerRef}
      className="w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl border border-slate-800/50 shadow-2xl overflow-hidden"
    >
      {/* Header with stats */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-800/50 bg-gradient-to-r from-slate-900/50 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">OHLC Chart</h3>
              <p className="text-xs text-slate-400">Candlestick Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
            <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? '+' : ''}{priceChangePercent}%
            </span>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <p className="text-xs text-slate-400 mb-0.5">Open</p>
            <p className="text-sm font-semibold text-white">
  {typeof firstPrice === "number" ? firstPrice.toFixed(2) : "N/A"}
</p>

          </div>
          <div className="px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <p className="text-xs text-slate-400 mb-0.5">Close</p>
            <p className="text-sm font-semibold text-white">
  {typeof lastPrice === "number" ? lastPrice.toFixed(2) : "N/A"}
</p>

          </div>
          <div className="px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <p className="text-xs text-slate-400 mb-0.5">High</p>
            <p className="text-sm font-semibold text-white">{Math.max(...data.map(d => d.high)).toFixed(2)}</p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <p className="text-xs text-slate-400 mb-0.5">Low</p>
            <p className="text-sm font-semibold text-white">{Math.min(...data.map(d => d.low)).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <ChartCanvas
          width={dimensions.width}
          height={dimensions.height}
          ratio={1}
          margin={{ left: 40, right: 100, top: 20, bottom: 30 }}
          data={data}
          xAccessor={xAccessor}
          xScale={scaleTime()}
          xExtents={[
            new Date(data[0].openTime),
            new Date(data[data.length - 1].openTime),
          ]}
        >
          <Chart id={1} yExtents={(d) => [d.high, d.low]}>
            <XAxis
              tickStroke="#64748b"
              tickLabelFill="#94a3b8"
              stroke="#334155"
              showGridLines
              gridLinesStroke="#1e293b"
            />
            <YAxis
              tickStroke="#64748b"
              tickLabelFill="#94a3b8"
              stroke="#334155"
              showGridLines
              gridLinesStroke="#1e293b"
            />

            <CandlestickSeries
              wickStroke={(d) => (d.close > d.open ? "#10b981" : "#ef4444")}
              fill={(d) => (d.close > d.open ? "#10b981" : "#ef4444")}
              stroke={(d) => (d.close > d.open ? "#059669" : "#dc2626")}
              opacity={0.9}
            />

            <OHLCTooltip
              origin={[10, 10]}
              textFill="#f1f5f9"
              labelFill="#94a3b8"
              fontSize={13}
              fontFamily="system-ui, -apple-system, sans-serif"
              accessor={(d) => ({
                date: new Date(d.openTime).toLocaleDateString(),
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
                volume: d.volume,
              })}
            />
          </Chart>
        </ChartCanvas>
      </div>
    </div>
  );
}