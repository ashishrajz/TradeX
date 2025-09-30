// src/components/DecisionButton.js
"use client";
import { useState } from "react";
import axios from "axios";

export default function DecisionButton({ symbol = "BTCUSDT", interval = "1m" }) {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState(null);

  async function ask() {
    setLoading(true);
    setDecision(null);
    try {
      const res = await axios.post("/api/strategy/decision", { symbol, interval, lastN: 100 });
      setDecision(res.data.decision);
    } catch (err) {
      setDecision({ error: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button onClick={ask} className="bg-indigo-600 text-white px-3 py-1 rounded" disabled={loading}>
          {loading ? "Asking..." : "Get Strategy Decision"}
        </button>
      </div>

      {decision && (
        <div className="p-2 bg-white border rounded shadow-sm">
          {decision.error ? (
            <div className="text-red-600">Error: {decision.error}</div>
          ) : (
            <>
              <div><strong>Action:</strong> {decision.action}</div>
              {decision.quantity !== undefined && <div><strong>Qty:</strong> {decision.quantity}</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
