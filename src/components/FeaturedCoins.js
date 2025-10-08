"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  LoaderCircle,
  TrendingUp,
  MousePointerClick, 
  Dot
} from "lucide-react";
import Image from "next/image";

function PriceTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const price = payload[0].value?.toFixed(2);
    return (
      <div className="bg-gradient-to-br from-emerald-900/95 to-green-900/95 backdrop-blur-xl text-white text-xs px-4 py-3 rounded-xl border border-emerald-400/30 shadow-2xl">
        <div className="text-emerald-200 text-[10px] uppercase tracking-wider">
          {new Date(label).toLocaleString()}
        </div>
        <div className="font-bold mt-1 text-lg">${price}</div>
      </div>
    );
  }
  return null;
}

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function FeaturedCoins({ query, onSelect }) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 600);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const url =
      debouncedQuery && debouncedQuery.trim() !== ""
        ? `/api/coins?q=${encodeURIComponent(debouncedQuery)}`
        : `/api/coins?per_page=10`;

    setIsLoading(true);
    fetcher(url)
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setData(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [debouncedQuery]);

  const handleCoinSelect = (coin) => {
  if (typeof coin === "string") {
    onSelect(coin);
  } else {
    setSelectedCoin(coin);
    setTimeout(() => setSelectedCoin(null), 2000);
    onSelect(coin);

    // Scroll to top smoothly
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
};


  if (error) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="text-center py-20">
          <div className="text-red-400 text-xl">Error loading coins</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-4 animate-spinner">
            <LoaderCircle className="w-10 h-10 text-emerald-400" />
          </div>

          <div className="text-gray-400 text-xl">
            Hold tight... smart trades loading!
          </div>
        </div>
      </div>
    );
  }

  const coins = Array.isArray(data) ? data : [];

  return (
    <div className="min-h-screen bg-black p-4 sm:p-8">
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-full border border-emerald-400/30 mb-4">
            <Dot className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-sm font-medium">
              Live Market Data
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold mb-4 text-white">
            Featured Cryptos
          </h1>
          <p className="text-gray-400 text-lg">
            Track the hottest cryptocurrencies in real-time
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleCoinSelect(e.target.value)}
                placeholder="Search for Bitcoin, Ethereum, Solana..."
                className="w-full bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl pl-14 pr-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition-all duration-300 text-lg"
              />
            </div>
          </div>
        </div>

        {/* Coins Grid */}
        {coins.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-4">
             Sorry
            </div>
            <p className="text-gray-400 text-xl">No coins found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {coins.map((coin, index) => {
              const isUp = coin.price_change_percentage_24h >= 0;
              const isSelected = selectedCoin?.id === coin.id;

              return (
                <div
                  key={coin.id}
                  onClick={() => handleCoinSelect(coin)}
                  className="group relative animate-slideUp cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Glow effect on hover */}
                  <div
                    className={`absolute -inset-0.5 bg-gradient-to-r ${
                      isUp
                        ? "from-emerald-600 to-teal-600"
                        : "from-rose-600 to-pink-600"
                    } rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500`}
                  ></div>

                  <div
                    className={`relative grid grid-cols-12 gap-4 items-center bg-slate-900/60 backdrop-blur-xl border ${
                      isSelected
                        ? "border-emerald-400/50 scale-[1.02]"
                        : "border-white/5 group-hover:border-white/20"
                    } rounded-3xl p-6 transition-all duration-300 ${
                      isSelected ? "shadow-2xl shadow-emerald-500/20" : ""
                    }`}
                  >
                    {/* Coin Info */}
                    <div className="col-span-12 sm:col-span-4 flex items-center gap-4">
                      <div className="relative">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${
                            isUp
                              ? "from-emerald-400 to-teal-400"
                              : "from-rose-400 to-pink-400"
                          } rounded-full blur-md opacity-50`}
                        ></div>
                        <Image
                          src={coin.image}
                          alt={coin.name}
                          width={56}
                          height={56}
                          className="relative w-14 h-14 rounded-full ring-2 ring-white/10 group-hover:ring-white/30 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xl">
                            {coin.symbol.toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isUp
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {isUp ? "BULL" : "BEAR"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">{coin.name}</div>
                      </div>
                    </div>

                    {/* Price & Change */}
                    <div className="col-span-6 sm:col-span-3">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Price
                      </div>
                      <div className="font-bold text-white text-xl">
                        ${coin.current_price?.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {isUp ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-rose-400" />
                        )}
                        <span
                          className={`font-semibold text-sm ${
                            isUp ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {Math.abs(
                            coin.price_change_percentage_24h || 0
                          ).toFixed(2)}
                          %
                        </span>
                      </div>
                    </div>

                    {/* Sparkline Chart */}
                    <div className="col-span-6 sm:col-span-4 h-20">
                      {coin.sparkline_in_7d?.price &&
                      coin.sparkline_in_7d.price.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={coin.sparkline_in_7d.price.map((p, i) => {
                              const now = Date.now();
                              const start = now - 7 * 24 * 60 * 60 * 1000;
                              const timestamp =
                                start +
                                (i * 7 * 24 * 60 * 60 * 1000) /
                                  coin.sparkline_in_7d.price.length;
                              return { time: timestamp, price: p };
                            })}
                            margin={{ top: 5, bottom: 5, left: 0, right: 0 }}
                          >
                            <defs>
                              <linearGradient
                                id={`grad-${coin.id}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor={isUp ? "#34d399" : "#fb7185"}
                                  stopOpacity={0.4}
                                />
                                <stop
                                  offset="100%"
                                  stopColor={isUp ? "#34d399" : "#fb7185"}
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>

                            <XAxis dataKey="time" hide />
                            <YAxis hide domain={["dataMin", "dataMax"]} />

                            <Area
                              type="monotone"
                              dataKey="price"
                              stroke="none"
                              fill={`url(#grad-${coin.id})`}
                            />

                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke={isUp ? "#34d399" : "#fb7185"}
                              dot={false}
                              strokeWidth={2}
                            />

                            <Tooltip content={<PriceTooltip />} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-gray-600 text-xs flex items-center justify-center h-full">
                          No data
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="col-span-12 sm:col-span-1 flex justify-end">
                      <button className="relative group/btn overflow-hidden px-6 py-3 rounded-xl ">
                        <span className="relative z-10"><MousePointerClick /></span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out backwards;
        }
      `}</style>
    </div>
  );
}