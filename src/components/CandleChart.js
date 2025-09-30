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
import { useEffect, useState } from "react";

export default function CandleChart({ data }) {
  const [dimensions, setDimensions] = useState({
    width: 800,
    height: 400,
  });

  // Resize dynamically
  useEffect(() => {
    const updateSize = () => {
      setDimensions({
        width: window.innerWidth * 0.65, // ~65% of screen
        height: 400,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const xAccessor = (d) => new Date(d.openTime);

  return (
    <div className="w-full bg-[#0B0E11] rounded-2xl border border-gray-800 shadow-lg p-4">
      <ChartCanvas
        width={dimensions.width}
        height={dimensions.height}
        ratio={1}
        margin={{ left: 50, right: 80, top: 20, bottom: 30 }}
        data={data}
        xAccessor={xAccessor}
        xScale={scaleTime()}
        xExtents={[
          new Date(data[0].openTime),
          new Date(data[data.length - 1].openTime),
        ]}
      >
        <Chart id={1} yExtents={(d) => [d.high, d.low]}>
          {/* X and Y axis with white ticks */}
          <XAxis
  tickStroke="#fff"           // tick numbers
  tickLabelFill="#fff"        // some versions need this
  stroke="#fff"               // axis line
  showGridLines
  gridLinesStroke="#333"
/>
<YAxis
  tickStroke="#fff"
  tickLabelFill="#fff"
  stroke="#fff"
  showGridLines
  gridLinesStroke="#333"
/>


          {/* Candlesticks */}
          <CandlestickSeries
            wickStroke={(d) => (d.close > d.open ? "#22c55e" : "#ef4444")}
            fill={(d) => (d.close > d.open ? "#22c55e" : "#ef4444")}
            stroke={(d) => (d.close > d.open ? "#22c55e" : "#ef4444")}
          />

          {/* Tooltip on hover/click */}
          <OHLCTooltip
            origin={[10, 10]}
            textFill="#fff"
            labelFill="#aaa"
            fontSize={12}
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
  );
}
