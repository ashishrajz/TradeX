"use client";
import { useState } from "react";

export default function BacktestStrategy() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState(null);

  const runBacktest = async () => {
    const res = await fetch("/api/strategy/backtest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, startDate, endDate }),
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Backtest Strategy</h2>
      <input
        type="text"
        className="border rounded p-2 w-full"
        placeholder="Symbol e.g. BTCUSDT"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />
      <div className="flex space-x-2">
        <input
          type="date"
          className="border rounded p-2"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border rounded p-2"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <button
        onClick={runBacktest}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Run Backtest
      </button>

      {result && (
        <div className="p-4 bg-white shadow rounded">
          <div className="font-bold">Final Value: ${result.finalValue.toFixed(2)}</div>
          <div>Capital: ${result.capital.toFixed(2)}</div>
          <div>Position: {result.position}</div>
        </div>
      )}
    </div>
  );
}
