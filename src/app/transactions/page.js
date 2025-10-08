"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;




import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import CandlestickChart from "@/components/CandlestickChart";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export default function TransactionsPage() {
  const [side, setSide] = useState("");
  const [date, setDate] = useState(null);
  const [activeTab, setActiveTab] = useState("transactions");
  const [popupData, setPopupData] = useState(null);

  const [limit, setLimit] = useState(50);
  const [allTrades, setAllTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);

  // 🧠 Build query URL dynamically
  const buildUrl = useCallback(
    (limitOverride) => {
      const q = new URLSearchParams();
      if (side) q.append("side", side.toLowerCase());
      if (date) q.append("date", date.toISOString().split("T")[0]);
      q.append("limit", limitOverride ?? limit);
      return `/api/user/trades?${q.toString()}`;
    },
    [side, date, limit]
  );

  // 🪄 Fetch trades (initial + pagination)
  const loadTrades = useCallback(
    async (append = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const data = await fetcher(buildUrl(limit));
        if (Array.isArray(data)) {
          if (append) {
            setAllTrades((prev) => {
              const newTrades = data.filter(
                (t) => !prev.some((p) => p._id === t._id)
              );
              return [...prev, ...newTrades];
            });
          } else {
            setAllTrades(data);
          }

          if (data.length < limit) setHasMore(false);
        }
      } catch (err) {
        console.error("❌ Error loading trades:", err);
      } finally {
        setLoading(false);
      }
    },
    [limit, buildUrl, loading]
  );

  // 🏁 Initial load
  useEffect(() => {
    loadTrades(false);
  }, [side, date, loadTrades]);

  // ♾ Infinite scroll observer
  useEffect(() => {
    if (loading || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLimit((prev) => prev + 50);
          loadTrades(true);
        }
      },
      { threshold: 0.8 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, loadTrades]);

  // 🧮 Portfolio stats
  const totalValue =
    allTrades.reduce((acc, t) => acc + (t.quantity || 0) * (t.price || 0), 0) || 0;
  const totalShares =
    allTrades.reduce((acc, t) => acc + (t.quantity || 0), 0) || 0;

  // 📊 Open trade chart
  const openChart = async (trade) => {
    try {
      const res = await fetch(`/api/binance/${trade.symbol}`);
      const marketData = await res.json();

      if (!marketData || isNaN(marketData.Open)) {
        alert("No chart data available for this trade");
        return;
      }

      setPopupData({ symbol: trade.symbol, ...marketData });
    } catch (err) {
      console.error("Failed to fetch market data:", err);
      alert("Failed to load chart data");
    }
  };

  const closeChart = () => setPopupData(null);

  return (
    <div className="flex bg-gradient-to-br from-black via-gray-950 to-green-950 min-h-screen text-white relative overflow-hidden">
      {/* background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.1),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.1),transparent_60%)] blur-3xl pointer-events-none"></div>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 p-6 ml-20 relative z-10">
        <h1 className="text-4xl font-bold mb-6 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">
          Transactions
        </h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-3 md:space-y-0 items-center mb-8">
          <div className="flex gap-3">
            {["", "buy", "sell"].map((s, idx) => (
              <button
                key={s || idx}
                onClick={() => {
                  setSide(s);
                  setLimit(50);
                  setAllTrades([]);
                  setHasMore(true);
                }}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 backdrop-blur-md border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.15)] ${
                  side === s
                    ? "bg-green-500/30 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                    : "bg-gray-800/40 text-white hover:bg-gray-700/60"
                }`}
              >
                {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative inline-block">
            <DatePicker
              selected={date}
              onChange={(d) => {
                setDate(d);
                setLimit(50);
                setAllTrades([]);
                setHasMore(true);
              }}
              placeholderText="Select date"
              className="border border-green-500/20 rounded-xl p-2 bg-gray-900/50 text-white pr-8 focus:outline-none focus:ring-2 focus:ring-green-500/40 backdrop-blur-md"
              dateFormat="yyyy-MM-dd"
            />
            {date && (
              <button
                type="button"
                onClick={() => {
                  setDate(null);
                  setLimit(50);
                  setAllTrades([]);
                  setHasMore(true);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-400"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { label: "Total Value", value: `$${totalValue.toLocaleString()}` },
            { label: "Active Positions", value: allTrades.length || 0 },
            { label: "Total Shares", value: totalShares },
          ].map((item, i) => (
            <div
              key={i}
              className="backdrop-blur-xl bg-gray-900/40 rounded-2xl p-5 border border-green-500/20 hover:border-green-400/30 transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.15)] hover:shadow-[0_0_25px_rgba(34,197,94,0.25)]"
            >
              <p className="text-gray-400 text-sm mb-1">{item.label}</p>
              <p className="text-3xl font-bold text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Trades List */}
        <div className="space-y-4">
  {allTrades.length > 0 ? (
    <>
      {/* Render actual trades */}
      {allTrades.map((t, i) => {
        const value = (t.quantity || 0) * (t.price || 0);
        return (
          <div
            key={t._id || i}
            onClick={() => openChart(t)}
            className="cursor-pointer backdrop-blur-lg bg-gray-900/60 hover:bg-gray-800/60 p-5 rounded-2xl border border-green-500/20 hover:border-green-500/40 shadow-md hover:shadow-[0_0_25px_rgba(34,197,94,0.25)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300"
          >
            <div>
              <h2 className="text-2xl font-bold text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]">
                {t.symbol || "N/A"}
              </h2>
              <p
                className={`text-sm font-semibold ${
                  t.side?.toLowerCase() === "buy"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {t.side?.toUpperCase() || "N/A"}
              </p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-300">
                <p>Qty: {t.quantity || 0}</p>
                <p>Price: ${t.price || 0}</p>
                <p>Value: ${value.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-400 md:ml-4">
              {t.date ? new Date(t.date).toLocaleDateString() : "N/A"}
            </div>
          </div>
        );
      })}

      {/* Infinite scroll shimmer */}
      {loading && (
        <div className="space-y-4 mt-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse backdrop-blur-lg bg-gray-800/60 p-5 rounded-2xl border border-green-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex flex-col gap-2 w-full md:w-2/3">
                <div className="h-6 w-32 bg-gray-700 rounded"></div>
                <div className="h-4 w-24 bg-gray-700 rounded"></div>
                <div className="flex gap-4 mt-2">
                  <div className="h-3 w-16 bg-gray-700 rounded"></div>
                  <div className="h-3 w-16 bg-gray-700 rounded"></div>
                  <div className="h-3 w-16 bg-gray-700 rounded"></div>
                </div>
              </div>
              <div className="h-4 w-20 bg-gray-700 rounded md:ml-4"></div>
            </div>
          ))}
        </div>
      )}

      <div ref={observerRef} className="h-10" />
    </>
  ) : loading ? (
    // Initial loading shimmer
    <div className="space-y-4 mt-2">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse backdrop-blur-lg bg-gray-800/60 p-5 rounded-2xl border border-green-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div className="flex flex-col gap-2 w-full md:w-2/3">
            <div className="h-6 w-32 bg-gray-700 rounded"></div>
            <div className="h-4 w-24 bg-gray-700 rounded"></div>
            <div className="flex gap-4 mt-2">
              <div className="h-3 w-16 bg-gray-700 rounded"></div>
              <div className="h-3 w-16 bg-gray-700 rounded"></div>
              <div className="h-3 w-16 bg-gray-700 rounded"></div>
            </div>
          </div>
          <div className="h-4 w-20 bg-gray-700 rounded md:ml-4"></div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center text-gray-500 p-6 backdrop-blur-md bg-gray-900/40 rounded-2xl border border-green-500/10">
      No transactions yet
    </div>
  )}
</div>



        {/* Popup Chart */}
        {popupData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900/90 rounded-3xl p-8 w-full max-w-4xl mx-4 relative border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.3)] transition-all duration-300">
              <button
                onClick={closeChart}
                className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-red-400 transition"
              >
                ×
              </button>
              <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">
                {popupData.symbol} Analytics
              </h2>
              <CandlestickChart data={popupData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
