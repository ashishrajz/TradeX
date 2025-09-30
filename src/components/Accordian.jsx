"use client";
import React, { useState } from "react";
import { ChevronDown, Info } from "lucide-react";

const faqs = [
  {
    q: "Is TradeX safe to use?",
    a: "Yes! TradeX uses bank-level encryption and secure authentication to protect your account and trading data.",
  },
  {
    q: "Can I trade in real-time?",
    a: "Absolutely. TradeX provides real-time market data, live stock prices, and instant buy/sell execution.",
  },
  {
    q: "Does TradeX offer AI trading suggestions?",
    a: "Yes — our AI analyzes market trends and provides personalized insights to help you make smarter trading decisions.",
  },
  {
    q: "How can I track my portfolio?",
    a: "Your portfolio dashboard in TradeX displays all your investments, gains, and losses in real-time, with detailed analytics and visual graphs.",
  },
  {
    q: "Are there fees for trading?",
    a: "TradeX charges minimal transaction fees depending on the stock exchange. There are no hidden charges.",
  },
  {
    q: "Can I set automated trading strategies?",
    a: "Yes! You can set up automated buy/sell strategies on TradeX based on your preferences and risk appetite to maximize gains.",
  },
];

export default function Accordion({ className = "", compact = false }) {
  const [openIndex, setOpenIndex] = useState(null);

  function toggle(i) {
    setOpenIndex((prev) => (prev === i ? null : i));
  }

  return (
    <section
      className={`w-full max-w-4xl mx-auto p-6 rounded-2xl shadow-2xl bg-gradient-to-br mt-[60px] from-gray-900 to-black text-white ${className}`}
      aria-label="Frequently asked questions"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-white/6 rounded-lg">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
          <p className="text-sm text-white/70 mt-1">
            Have questions about trading on TradeX? We’ve got you covered.
          </p>
        </div>
      </div>

      <div className={`space-y-3 ${compact ? "text-sm" : "text-base"}`}>
        {faqs.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="border border-white/6 rounded-xl overflow-hidden bg-white/2 backdrop-blur-sm"
            >
              <button
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                className="w-full flex items-center justify-between gap-4 p-4 text-left"
              >
                <div>
                  <p className="font-medium">{item.q}</p>
                  <p className="mt-1 text-sm text-white/70">
                    {isOpen ? "Open" : "Tap to view answer"}
                  </p>
                </div>

                <span
                  className={`ml-auto transition-transform duration-300 ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <ChevronDown className="w-6 h-6" />
                </span>
              </button>

              {isOpen && (
                <div id={`faq-${i}`} className="px-4 pb-4 pt-0">
                  <p className="text-white/80">{item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-sm text-white/60">
        <em>Still have questions? Contact TradeX support for trading assistance.</em>
      </div>
    </section>
  );
}