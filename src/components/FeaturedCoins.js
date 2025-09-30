'use client';

import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function FeaturedCoins({ query, onSelect }) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // ✅ debounce exactly as before
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 600);
    return () => clearTimeout(handler);
  }, [query]);

  const url =
    debouncedQuery && debouncedQuery.trim() !== ""
      ? `/api/coins?q=${encodeURIComponent(debouncedQuery)}`
      : `/api/coins?per_page=10`;

  const { data, error, isLoading } = useSWR(url, fetcher);

  if (error) return <div>Error loading coins</div>;
  if (isLoading) return <div>Loading coins...</div>;

  // ✅ always array
  const coins = Array.isArray(data) ? data : [];

  return (
    <div className="bg-gray-950 rounded-2xl border border-gray-800 p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Search Coins</h3>

      {/* Search box */}
      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => onSelect(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          placeholder="Search coins..."
          className="w-full border border-blue-500 rounded-xl p-2 pr-10 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => onSelect("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 font-bold"
          >
            ×
          </button>
        )}
      </div>

      {/* Quick-access buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["BTC", "ETH", "BNB", "SOL", "DOGE", "XRP"].map((symbol) => (
          <button
            key={symbol}
            onClick={() => onSelect({ symbol })}
            className="px-4 py-2 bg-gray-800 border border-grey-500 rounded-lg text-grey-400 font-medium hover:bg-blue-500 hover:text-black transition"
          >
            {symbol}
          </button>
        ))}
      </div>

      {/* Coins grid OR 'No coins found' */}
      {coins.length === 0 ? (
        <div className="text-gray-400 text-center py-4">No coins found</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {coins.map((coin) => (
            <div
              key={coin.id}
              onClick={() => onSelect(coin)}
              className="cursor-pointer border border-grey-500 rounded-xl p-4 flex flex-col items-center justify-center transition-transform transform hover:scale-105 hover:shadow-lg hover:border-blue-400 bg-black"
            >
              <img src={coin.image} alt={coin.name} className="w-10 h-10 mb-2" />
              <div className="text-sm font-semibold text-white">
                {coin.symbol.toUpperCase()}
              </div>
              <div className="text-xs text-gray-400">${coin.current_price}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
