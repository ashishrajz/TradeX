"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function StrategyPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch current saved strategy URL
  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        const res = await fetch("/api/strategy/get");
        if (res.ok) {
          const data = await res.json();
          setUrl(data.strategyUrl || "");
        }
      } catch (err) {
        console.error("❌ Fetch strategy failed:", err);
      }
    };
    fetchStrategy();
  }, []);

  const saveStrategy = async () => {
    if (!url) return toast.error("Please enter a URL");

    try {
      setLoading(true);
      const res = await fetch("/api/strategy/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Strategy URL saved!");
        setUrl(data.strategyUrl);
      } else {
        const txt = await res.text();
        toast.error(`Failed: ${txt}`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-gray-900/70 p-8 rounded-2xl border border-green-500/20 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-green-400 mb-6">
          Register Your Strategy
        </h1>

        {/* Show current saved strategy */}
        {url && (
          <div className="mb-4 p-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300">
            <p className="font-semibold text-green-400">Current Strategy URL:</p>
            <p>{url}</p>
          </div>
        )}

        <input
          type="url"
          placeholder="https://your-strategy-api.com/webhook"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-gray-800 border border-gray-700 text-white"
        />

        <button
          onClick={saveStrategy}
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 px-6 rounded-xl transition"
        >
          {loading ? "Saving..." : "Save Strategy"}
        </button>
      </div>
    </div>
  );
}
