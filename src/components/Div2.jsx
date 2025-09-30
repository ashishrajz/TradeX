"use client";
import React, { useState, useEffect } from "react";
import { BarChart2, Radio, FileText, Globe2, Lightbulb, Sparkle } from "lucide-react";

// Card component
const TradingCard = ({ icon, title, badge, description }) => (
  <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
    <div className="flex items-start gap-4 mb-3">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>
        <span className="inline-block bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-700">
          {badge}
        </span>
      </div>
    </div>
    <p className="text-gray-400 text-sm leading-relaxed mt-3">{description}</p>
  </div>
);

// Main Trading Section
const TradingDiv = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // ensures animations only run client-side
  }, []);

  const features = [
    {
      icon: <BarChart2 className="w-7 h-7 text-white" />,
      title: "Real-Time Analysis",
      badge: "Instant Data",
      description: "Track market trends and stock performance in real-time."
    },
    {
      icon: <FileText className="w-7 h-7 text-white" />,
      title: "Candlestick Graphs",
      badge: "Visual Insights",
      description: "Analyze stock behavior with interactive candlestick charts."
    },
    {
      icon: <Radio className="w-7 h-7 text-white" />,
      title: "Buy & Sell Easily",
      badge: "Quick Trades",
      description: "Execute trades instantly and manage your investments seamlessly."
    },
    {
      icon: <Globe2 className="w-7 h-7 text-white" />,
      title: "View Wallet",
      badge: "Your Portfolio",
      description: "Keep track of all your assets and holdings in one place."
    },
    {
      icon: <Lightbulb className="w-7 h-7 text-white" />,
      title: "AI Recommendations",
      badge: "Smart Decisions",
      description: "Get personalized AI-driven trading suggestions and insights."
    },
    {
      icon: <Sparkle className="w-7 h-7 text-white" />,
      title: "Automation & Strategies",
      badge: "Maximize Gains",
      description: "Set up automated strategies to trade efficiently and confidently."
    }
  ];

  return (
    <div className="min-h-screen bg-black flex  justify-center p-8 relative flex-col">
        <h1 className="text-6xl text-white text-center font-bold mb-10">What we offer</h1>
      <div className="max-w-7xl w-full relative">
        {/* Center glowing orb - behind cards */}
        {mounted && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 pointer-events-none z-0">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full blur-3xl opacity-30"></div>
              <div className="absolute inset-8 border border-cyan-500/30 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-16 border border-cyan-500/50 rounded-full animate-spin-reverse"></div>
              <div className="absolute inset-24 bg-gradient-to-br from-gray-900 to-black rounded-full border border-cyan-500/70 flex items-center justify-center">
                <BarChart2 className="w-16 h-16 text-cyan-400 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Grid layout - on top */}
        <div className="grid grid-cols-2 gap-6 relative z-10">
          <div className="space-y-6">
            <TradingCard {...features[0]} />
            <TradingCard {...features[1]} />
            <TradingCard {...features[2]} />
          </div>
          <div className="space-y-6">
            <TradingCard {...features[3]} />
            <TradingCard {...features[4]} />
            <TradingCard {...features[5]} />
          </div>
        </div>

        {/* Decorative dots */}
        <div className="absolute top-4 right-1/4 w-1 h-1 bg-gray-600 rounded-full z-10"></div>
        <div className="absolute bottom-8 left-1/3 w-1 h-1 bg-gray-600 rounded-full z-10"></div>
        <div className="absolute top-1/3 right-8 w-1 h-1 bg-gray-600 rounded-full z-10"></div>
      </div>
    </div>
  );
};

export default TradingDiv;