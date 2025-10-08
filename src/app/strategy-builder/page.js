export const dynamic = "force-dynamic";

"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import toast from "react-hot-toast";

const indicators = ["RSI", "SMA", "EMA", "Price"];
const conditions = ["<", ">", "<=", ">=", "=", "crossesAbove", "crossesBelow"];
const actions = ["BUY", "SELL", "HOLD"];

export default function StrategyBuilderPage() {
  const [activeTab, setActiveTab] = useState("strategybuilder");
  const [name, setName] = useState("My Strategy");
  const [rules, setRules] = useState([]);

  const addRule = () => {
    setRules([
      ...rules,
      {
        indicator: "RSI",
        params: { period: 14 },
        condition: "<",
        value: 30,
        action: "BUY",
        quantity: 1,
      },
    ]);
  };

  const updateRule = (index, field, value) => {
    const updated = [...rules];
    updated[index][field] = value;
    setRules(updated);
  };

  const updateParams = (index, params) => {
    const updated = [...rules];
    updated[index].params = params;
    setRules(updated);
  };

  const saveStrategy = async () => {
    const res = await fetch("/api/strategy/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, rules }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Strategy saved!");
      setName("My Strategy");
      setRules([]);
    } else {
      toast.error("Save failed: " + (data.error || "Unknown error"));
    }
  };

  function ParamsEditor({ rule, index }) {
    if (rule.indicator === "RSI" || rule.indicator === "SMA" || rule.indicator === "EMA") {
      return (
        <input
          type="number"
          value={rule.params?.period || 14}
          onChange={(e) =>
            updateParams(index, { ...rule.params, period: Number(e.target.value) })
          }
          className="bg-gray-900/60 backdrop-blur-md p-2 rounded-lg w-20 border border-green-400/30 focus:ring-2 focus:ring-green-400/60 text-white"
          placeholder="period"
        />
      );
    }
    if (rule.indicator === "Price") {
      return (
        <select
          value={rule.params?.field || "close"}
          onChange={(e) => updateParams(index, { ...rule.params, field: e.target.value })}
          className="bg-gray-900/60 backdrop-blur-md p-2 rounded-lg border border-green-400/30 focus:ring-2 focus:ring-green-400/60 text-white"
        >
          <option value="close">close</option>
          <option value="open">open</option>
          <option value="high">high</option>
          <option value="low">low</option>
        </select>
      );
    }
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Sidebar */}
      <Sidebar activeTab="strategybuilder" setActiveTab={setActiveTab} />

      {/* Main content */}
      <div className="flex-1 p-8 ml-24">
        <h1 className="text-4xl font-bold mb-8 text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]">
          🛠️ No-Code Strategy Builder
        </h1>

        {/* Strategy Name */}
        <div className="mb-6 bg-gray-900/60 backdrop-blur-xl rounded-2xl p-4 border border-green-400/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          <label className="block text-gray-400 text-sm mb-2">Strategy Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter strategy name"
            className="w-full p-3 rounded-xl bg-gray-800/70 border border-green-400/20 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 transition"
          />
        </div>

        {/* Rules */}
        <div className="space-y-4">
          {rules.map((rule, i) => (
            <div
              key={i}
              className="bg-gray-900/70 backdrop-blur-xl border border-green-400/30 shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] p-5 rounded-2xl transition-all duration-300 flex flex-wrap gap-4 items-center"
            >
              <select
                value={rule.indicator}
                onChange={(e) =>
                  updateRule(i, "indicator", e.target.value) || updateParams(i, {})
                }
                className="bg-gray-900/60 backdrop-blur-md p-2 rounded-lg border border-green-400/30 focus:ring-2 focus:ring-green-400/60 text-white"
              >
                {indicators.map((ind) => (
                  <option key={ind}>{ind}</option>
                ))}
              </select>

              <ParamsEditor rule={rule} index={i} />

              <select
                value={rule.condition}
                onChange={(e) => updateRule(i, "condition", e.target.value)}
                className="bg-gray-900/60 backdrop-blur-md p-2 rounded-lg border border-green-400/30 focus:ring-2 focus:ring-green-400/60 text-white"
              >
                {conditions.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <input
                type="number"
                value={rule.value}
                onChange={(e) => updateRule(i, "value", Number(e.target.value))}
                className="bg-gray-900/60 backdrop-blur-md p-2 rounded-lg w-24 border border-green-400/30 focus:ring-2 focus:ring-green-400/60 text-white"
              />

              <select
                value={rule.action}
                onChange={(e) => updateRule(i, "action", e.target.value)}
                className="bg-gray-900/60 backdrop-blur-md p-2 rounded-lg border border-green-400/30 focus:ring-2 focus:ring-green-400/60 text-white"
              >
                {actions.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>

              <input
                type="number"
                value={rule.quantity}
                onChange={(e) => updateRule(i, "quantity", Number(e.target.value))}
                className="bg-gray-900/60 backdrop-blur-md p-2 rounded-lg w-24 border border-green-400/30 focus:ring-2 focus:ring-green-400/60 text-white"
              />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={addRule}
            className="px-6 py-3 bg-green-500/80 hover:bg-green-500 text-black font-semibold rounded-xl transition shadow-[0_0_15px_rgba(34,197,94,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.8)]"
          >
            ➕ Add Rule
          </button>

          <button
            onClick={saveStrategy}
            className="px-6 py-3 bg-blue-500/80 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.8)]"
          >
            💾 Save Strategy
          </button>
        </div>

        {/* Preview JSON */}
        <div className="mt-10 bg-gray-900/70 backdrop-blur-xl p-6 rounded-2xl border border-green-400/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          <h2 className="text-lg mb-3 text-gray-300 font-semibold">📜 Strategy JSON</h2>
          <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono">
            {JSON.stringify({ name, rules }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
