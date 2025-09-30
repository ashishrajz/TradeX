// src/components/BacktestResults.js
"use client";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function BacktestResults({ data }) {
  if (!data) return null;
  const labels = data.equityCurve.map(pt => new Date(pt.time).toLocaleString());
  const values = data.equityCurve.map(pt => pt.value);
  const chartData = { labels, datasets: [{ label: "Equity", data: values, fill: false, tension: 0.2 }] };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <div className="text-lg font-bold">Backtest Summary</div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>Start Capital: ${Number(data.startingCapital).toLocaleString()}</div>
          <div>Final Value: ${Number(data.finalValue).toLocaleString()}</div>
          <div>Return: {data.metrics.totalReturnPct}%</div>
          <div>Max Drawdown: {data.metrics.maxDrawdownPct}%</div>
          <div>Number of Trades: {data.metrics.tradesCount}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <Line data={chartData} />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Trades</div>
        {data.trades.length === 0 ? <div>No trades</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr><th>Date</th><th>Action</th><th>Qty</th><th>Price</th></tr>
            </thead>
            <tbody>
              {data.trades.map((t, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{new Date(t.date).toLocaleString()}</td>
                  <td className="p-2">{t.action}</td>
                  <td className="p-2">{t.quantity}</td>
                  <td className="p-2">${t.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
