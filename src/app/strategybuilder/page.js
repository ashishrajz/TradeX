"use client";

import { useState } from "react";

const indicators = ["RSI", "SMA", "EMA", "Price"];
const conditions = ["<", ">", "<=", ">=", "=", "crossesAbove", "crossesBelow"];
const actions = ["BUY", "SELL", "HOLD"];

export default function StrategyBuilder() {
  const [name, setName] = useState("My Strategy"); // ✅ custom strategy name
  const [rules, setRules] = useState([]);

  const addRule = () => {
    setRules([
      ...rules,
      {
        indicator: "RSI",
        params: { period: 14 }, // default params
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
      body: JSON.stringify({ name, rules }), // ✅ include name
    });
    const data = await res.json();
    if (res.ok) {
      alert("✅ Strategy Saved!");
      setName("My Strategy");
      setRules([]);
    } else {
      alert("❌ Error: " + (data.message || "Save failed"));
    }
  };

  // 👇 Small inline params editor
  function ParamsEditor({ rule, index }) {
    if (rule.indicator === "RSI" || rule.indicator === "SMA" || rule.indicator === "EMA") {
      return (
        <input
          type="number"
          value={rule.params?.period || 14}
          onChange={(e) =>
            updateParams(index, { ...rule.params, period: Number(e.target.value) })
          }
          className="bg-gray-800 p-2 rounded w-20"
          placeholder="period"
        />
      );
    }
    if (rule.indicator === "Price") {
      return (
        <select
          value={rule.params?.field || "close"}
          onChange={(e) => updateParams(index, { ...rule.params, field: e.target.value })}
          className="bg-gray-800 p-2 rounded"
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
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">🛠️ No-Code Strategy Builder</h1>

      {/* ✅ Strategy Name Input */}
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-1">Strategy Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter strategy name"
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
        />
      </div>

      {rules.map((rule, i) => (
        <div
          key={i}
          className="bg-gray-900 p-4 mb-4 rounded-xl shadow border border-gray-700 flex gap-4 items-center"
        >
          {/* Indicator */}
          <select
            value={rule.indicator}
            onChange={(e) =>
              updateRule(i, "indicator", e.target.value) ||
              updateParams(i, {}) // reset params when indicator changes
            }
            className="bg-gray-800 p-2 rounded"
          >
            {indicators.map((ind) => (
              <option key={ind}>{ind}</option>
            ))}
          </select>

          {/* Params Editor */}
          <ParamsEditor rule={rule} index={i} />

          {/* Condition */}
          <select
            value={rule.condition}
            onChange={(e) => updateRule(i, "condition", e.target.value)}
            className="bg-gray-800 p-2 rounded"
          >
            {conditions.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          {/* Value */}
          <input
            type="number"
            value={rule.value}
            onChange={(e) => updateRule(i, "value", Number(e.target.value))}
            className="bg-gray-800 p-2 rounded w-20"
          />

          {/* Action */}
          <select
            value={rule.action}
            onChange={(e) => updateRule(i, "action", e.target.value)}
            className="bg-gray-800 p-2 rounded"
          >
            {actions.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>

          {/* Quantity */}
          <input
            type="number"
            value={rule.quantity}
            onChange={(e) => updateRule(i, "quantity", Number(e.target.value))}
            className="bg-gray-800 p-2 rounded w-20"
          />
        </div>
      ))}

      <button
        onClick={addRule}
        className="px-4 py-2 bg-green-500 rounded-lg font-semibold hover:bg-green-400"
      >
        ➕ Add Rule
      </button>

      <button
        onClick={saveStrategy}
        className="ml-4 px-4 py-2 bg-blue-500 rounded-lg font-semibold hover:bg-blue-400"
      >
        💾 Save Strategy
      </button>

      {/* Preview JSON */}
      <div className="mt-6 bg-gray-800 p-4 rounded-xl">
        <h2 className="text-lg mb-2 text-gray-400">📜 Strategy JSON</h2>
        <pre className="text-xs text-green-400 whitespace-pre-wrap">
          {JSON.stringify({ name, rules }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
