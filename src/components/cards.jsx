"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { FaCircleNotch } from "react-icons/fa";
import {
  Lightbulb,
  BarChart3,
  Brain,
  Settings,
  Rocket,
  Trophy,
  Blocks,
  Bot,
} from "lucide-react";

import Image from "next/image";

const cards = [
  {
    id: 1,
    img: "suggestion.jpg",
    title: "Suggestions",
    color: "purple",
    link: "/a",
  },
  { id: 2, img: "news.png", title: "News", color: "blue", link: "/news" },
  { id: 3, img: "report.jpg", title: "Reports", color: "blue", link: "/a" },
];

// Report data
const tradeHistory = [
  {
    text: "Generate Report of",
    symbol: "AAPL",
    type: "BUY",
    quantity: 100,
    price: 150,
    timestamp: "2025-05-01",
    last: "Give smart suggestions",
  },
];

export default function Cards({ onStockSelect }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const colorMap = {
    purple: "bg-purple-500/10",
    blue: "bg-blue-500/10",
  };

  const handleCardClick = (card) => {
    if (card.title === "Reports") {
      setShowReportModal(true);
    } else if (card.title === "Suggestions") {
      setShowSuggestion(true);
    }
  };

  // handle stock select
  const handleStockSelect = (promptText) => {
    if (onStockSelect) {
      onStockSelect(promptText);
    }

    setShowReportModal(false);
    setShowSuggestion(false);
  };

  const portfolioStocks = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "GOOG", name: "Alphabet Inc." },
  ];

const suggestions = [
  {
    icon: <Lightbulb className="w-6 h-6 text-purple-400" />,
    name: "Smart Trade Ideas",
    sub: ["Top 3 Daily Picks", "Swing Trades", "High Volatility Alerts"],
    color: "hover:border-purple-500 hover:bg-purple-500/10",
    prompt:
      "Generate three smart trading ideas for today with reasoning, entry/exit levels, and risk assessment.",
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-blue-400" />,
    name: "Analyze My Portfolio",
    sub: ["Performance Summary", "Risk Breakdown", "Win/Loss Insights"],
    color: "hover:border-blue-500 hover:bg-blue-500/10",
    prompt:
      "Analyze my portfolio performance with a summary of returns, drawdowns, and risk exposure across assets.",
  },
  {
    icon: <Brain className="w-6 h-6 text-pink-400" />,
    name: "Strategy Insights",
    sub: ["Why did a trade fail?", "Pattern Detection", "Profit/Loss Analysis"],
    color: "hover:border-pink-500 hover:bg-pink-500/10",
    prompt:
      "Explain why a specific trading strategy or trade performed poorly or succeeded, including key contributing factors and data patterns.",
  },
  {
    icon: <Settings className="w-6 h-6 text-green-400" />,
    name: "Build Strategy",
    sub: ["No-Code Builder", "Combine Indicators", "Backtest Instantly"],
    color: "hover:border-green-500 hover:bg-green-500/10",
    prompt:
      "Help me design a simple trading strategy using technical indicators like RSI, MACD, or moving averages, and explain how to backtest it effectively.",
  },
  {
    icon: <Rocket className="w-6 h-6 text-yellow-400" />,
    name: "Live Strategy Deployment",
    sub: ["Capital Allocation", "Risk Management", "Automated Live Execution"],
    color: "hover:border-yellow-500 hover:bg-yellow-500/10",
    prompt:
      "Explain how to deploy a backtested trading strategy in live markets with capital allocation, automation setup, and proper risk controls.",
  },
  {
    icon: <Trophy className="w-6 h-6 text-orange-400" />,
    name: "Trading Competitions",
    sub: ["Host or Join Events", "Set Rules & Dates", "Track Leaderboards"],
    color: "hover:border-orange-500 hover:bg-orange-500/10",
    prompt:
      "Design a trading competition by setting rules, duration, scoring methods, and leaderboard tracking for participants.",
  },
  {
    icon: <Blocks className="w-6 h-6 text-emerald-400" />,
    name: "No-Code Strategy Builder",
    sub: ["Create If–Then Rules", "Use Prebuilt Indicators", "Instant Preview"],
    color: "hover:border-emerald-500 hover:bg-emerald-500/10",
    prompt:
      "Guide me to build a trading strategy visually using if–then rules, predefined indicators, and live preview functionality.",
  },
  {
    icon: <Bot className="w-6 h-6 text-indigo-400" />,
    name: "LLM Insights",
    sub: ["Analyze Trade History", "Get Feedback", "AI-Powered Suggestions"],
    color: "hover:border-indigo-500 hover:bg-indigo-500/10",
    prompt:
      "Analyze my past trades and provide AI-driven feedback, highlighting patterns, emotional biases, and actionable improvements.",
  },
];


  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Quick Access</h2>
        <button className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
          View all
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card)}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500 cursor-pointer bg-gray-900/50 backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
            <Image
              width={300}
              height={200}
              src={card.img}
              alt={card.title}
              className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 opacity-60 group-hover:opacity-80"
            />

            <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end">
              <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  Click to explore more
                </p>
              </div>

              <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </div>

            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 ${
                colorMap[card.color]
              }`}
            ></div>

            {/* Wrap other cards with Link */}
            {card.title !== "Reports" && card.title !== "Suggestions" && (
              <Link href={card.link} className="absolute inset-0 z-30" />
            )}
          </div>
        ))}
      </div>

      {/* Suggestions Popup */}
      {showSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg p-4 animate-fadeIn">
          <div className="bg-gray-900/90 backdrop-blur-2xl rounded-3xl p-8 w-full max-w-[700px] md:max-w-[800px] relative border border-white/10 shadow-[0_0_60px_rgba(168,85,247,0.25)] max-h-[85vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setShowSuggestion(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full transition-all duration-300 hover:bg-gray-800 hover:scale-110"
              aria-label="Close suggestions"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4 flex-shrink-0">
              <FaCircleNotch className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white">
                Opus Suggestions Hub
              </h2>
            </div>

            <p className="text-gray-400 text-sm mb-6 flex-shrink-0">
              Select an AI-powered module to explore insights, build strategies,
              or analyze performance.
            </p>

            {/* Scrollable Section */}
            <div
              className="space-y-4 overflow-y-auto pr-2 flex-1"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#4B5563 #1F2937",
              }}
            >
              {suggestions.map((option, i) => (
                <div
                  key={i}
                  onClick={() => handleStockSelect(option.prompt)}
                  className={`group border border-gray-700 bg-gray-800/40 rounded-2xl p-4 transition-all duration-300 cursor-pointer  hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:border-purple-500/50 ${option.color}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {option.icon}
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {option.name}
                      </h3>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>

                  <ul className="pl-9 space-y-1">
                    {option.sub.map((s, j) => (
                      <li
                        key={j}
                        className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors"
                      >
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reports Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 rounded-3xl p-8 w-[400px] relative border border-white/10 shadow-2xl">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaCircleNotch className="w-6 h-6 text-white" />
              Select a Stock
            </h2>

            <div className="space-y-3">
              {portfolioStocks.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleStockSelect(stock.symbol)}
                  className="w-full p-4 rounded-xl border border-gray-700 bg-gray-800/50 text-white flex justify-between hover:border-blue-500 hover:bg-blue-500/10 transition-all"
                >
                  <span>{stock.name}</span>
                  <span className="font-mono">{stock.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}