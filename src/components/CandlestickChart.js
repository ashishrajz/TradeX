'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts';

export default function CandlestickChart({ data }) {
  if (!data) return <div className="text-gray-400">No chart data available</div>;

  // Transform data to array of OHLC objects
  const chartData = Array.isArray(data)
    ? data
    : [
        {
          date: data.symbol || 'T1',
          open: data.Open,
          high: data.High,
          low: data.Low,
          close: data.Close,
        },
      ];

  // Filter out invalid entries
  const validData = chartData.filter(
    (d) =>
      ![d.open, d.high, d.low, d.close].some(
        (v) => v === undefined || v === null || isNaN(v)
      )
  );

  if (validData.length === 0)
    return <div className="text-gray-400">No chart data available</div>;

  // Prepare bar data for candlestick: Recharts Bar can represent OHLC via top/height
  const bars = validData.map((d) => ({
    date: d.date,
    // top: min(open, close), height: abs(close - open)
    y: Math.min(d.open, d.close),
    height: Math.max(Math.abs(d.close - d.open), 1),
    fill: d.close >= d.open ? '#10B981' : '#EF4444',
    stroke: d.close >= d.open ? '#059669' : '#DC2626',
    high: d.high,
    low: d.low,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={bars}>
          <XAxis dataKey="date" tick={{ fill: 'white' }} />
          <YAxis tick={{ fill: 'white' }} domain={['dataMin', 'dataMax']} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              borderRadius: '8px',
              border: 'none',
            }}
            labelStyle={{ color: 'white' }}
            itemStyle={{ color: 'white' }}
          />

          {/* High-Low lines */}
          {bars.map((d, i) => (
            <line
              key={`hl-${i}`}
              x1={(i * 100) / bars.length + '%'}
              x2={(i * 100) / bars.length + '%'}
              y1={d.high}
              y2={d.low}
              stroke={d.fill}
              strokeWidth={1}
            />
          ))}

          {/* Open-Close bars */}
          {bars.map((d, i) => (
            <rect
              key={`bar-${i}`}
              x={`${(i * 100) / bars.length - 1.5}%`}
              y={d.y}
              width="3%"
              height={d.height}
              fill={d.fill}
              stroke={d.stroke}
              strokeWidth={1}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
