'use client';

import useSWR from "swr";
import CandleChart from "@/components/CandleChart";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ChartLoader({ symbol }) {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/klines?symbol=${symbol}&interval=1h` : null,
    fetcher,
    { refreshInterval: 30000 } // 30s refresh
  );

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center text-gray-400">
        Loading chart...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-[400px] flex items-center justify-center text-red-400">
        Failed to load chart
      </div>
    );
  }

  return <CandleChart data={data} />;
}
