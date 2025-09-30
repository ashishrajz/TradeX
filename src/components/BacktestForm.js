// src/components/BacktestForm.js
"use client";
import { useState } from "react";
import axios from "axios";
import BacktestResults from "./BacktestResults";
import toast from "react-hot-toast";

export default function BacktestForm() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState("1d");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [capital, setCapital] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function runBacktest() {
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post("/api/strategy/backtest", { symbol, interval, startDate, endDate, startingCapital: Number(capital) });
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input className="border p-2" value={symbol} onChange={e=>setSymbol(e.target.value)} />
        <select className="border p-2" value={interval} onChange={e=>setInterval(e.target.value)}>
          <option value="1m">1m</option>
          <option value="5m">5m</option>
          <option value="1h">1h</option>
          <option value="1d">1d</option>
        </select>
        <input type="number" className="border p-2" value={capital} onChange={e=>setCapital(e.target.value)} />
      </div>

      <div className="flex space-x-2">
        <input type="date" className="border p-2" value={startDate} onChange={e=>setStartDate(e.target.value)} />
        <input type="date" className="border p-2" value={endDate} onChange={e=>setEndDate(e.target.value)} />
        <button disabled={loading} onClick={runBacktest} className="bg-blue-600 text-white px-3 py-1 rounded">{loading ? "Running..." : "Run Backtest"}</button>
      </div>

      {result && <BacktestResults data={result} />}
    </div>
  );
}
