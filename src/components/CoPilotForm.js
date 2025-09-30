// src/components/CoPilotForm.js
"use client";
import { useState } from "react";
import axios from "axios";

export default function CoPilotForm({ defaultSymbol = "BTCUSDT" }) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [interval, setInterval] = useState("1m");
  const [capital, setCapital] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [runId, setRunId] = useState(null);
  const [msg, setMsg] = useState("");

  async function start() {
    setLoading(true);
    try {
      const res = await axios.post("/api/strategy/live/start", { symbol, interval, allocatedCapital: Number(capital) });
      setRunId(res.data.runId);
      setMsg("Started live co-pilot");
    } catch (err) {
      setMsg(err.response?.data?.error || err.message);
    } finally { setLoading(false); }
  }

  async function stop() {
    if (!runId) { setMsg("No run id"); return; }
    setLoading(true);
    try {
      await axios.post("/api/strategy/live/stop", { runId });
      setRunId(null);
      setMsg("Stopped run");
    } catch (err) {
      setMsg(err.response?.data?.error || err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input value={symbol} onChange={e=>setSymbol(e.target.value)} className="border p-2" />
        <select value={interval} onChange={e=>setInterval(e.target.value)} className="border p-2">
          <option value="1m">1m</option>
          <option value="5m">5m</option>
          <option value="1h">1h</option>
          <option value="1d">1d</option>
        </select>
      </div>

      <div className="flex gap-2">
        <input type="number" value={capital} onChange={e=>setCapital(e.target.value)} className="border p-2" />
        <button onClick={start} className="bg-green-600 text-white px-3 py-1 rounded" disabled={loading || runId}>Start Co-Pilot</button>
        <button onClick={stop} className="bg-red-600 text-white px-3 py-1 rounded" disabled={loading || !runId}>Stop</button>
      </div>

      {msg && <div className="text-sm text-gray-700">{msg}</div>}
      {runId && <div className="text-sm text-blue-700">Run ID: {runId}</div>}
    </div>
  );
}
