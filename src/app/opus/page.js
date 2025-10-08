"use client"; // 👈 must always be the first line
export const dynamic = "force-dynamic"; // 👈 next, directly after

import { useState, useRef } from "react";
import { Lightbulb, TrendingUp, BarChart2 } from "lucide-react";
import { FaCircleNotch } from "react-icons/fa";
import { RiGeminiFill } from "react-icons/ri";
import ChatInterface from "@/components/ChatInterface";
import Sidebar from "@/components/Sidebar";

export default function OpusPage() {
  const [tradeText, setTradeText] = useState("");
  const [activeTab, setActiveTab] = useState("opus");
  const chatRef = useRef(null);

  const handleOptionClick = (id) => {
    if (id === 1) {
      setTradeText(
        "Based on my last 50 trades and portfolio, what suggestions do you have?"
      );
      scrollToChat();
    } else if (id === 3) {
      setTradeText("Analyze my portfolio and prepare a detailed report.");
      scrollToChat();
    } else if (id === 2) {
      window.location.href = "/news";
    }
  };

  const scrollToChat = () => {
    setTimeout(() => {
      chatRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const options = [
    {
      name: "Suggestions",
      id: 1,
      icon: <Lightbulb className="w-5 h-5 text-yellow-400" />,
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      hoverBg: "hover:bg-yellow-500/15",
    },
    {
      name: "Current Trade News",
      id: 2,
      icon: <TrendingUp className="w-5 h-5 text-green-400" />,
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      hoverBg: "hover:bg-green-500/15",
    },
    {
      name: "Generate Report",
      id: 3,
      icon: <BarChart2 className="w-5 h-5 text-blue-400" />,
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      hoverBg: "hover:bg-blue-500/15",
    },
  ];

  return (
    <div className="w-full flex bg-black min-h-screen">
      {/* Sidebar */}
      <Sidebar activeTab="opus" setActiveTab={setActiveTab} />

      <div className="flex-1 relative min-h-screen flex flex-col ml-20">
        {/* Background glow */}
        <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 flex-1 flex flex-col max-w-6xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <RiGeminiFill className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-1">
                <FaCircleNotch className="text-blue-400 w-5 h-5" />
                <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                  Opus
                </span>
              </h1>
            </div>

            <div className="text-sm text-gray-500 font-medium">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          {/* Welcome */}
          <div className="mb-14">
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight leading-tight">
              Welcome,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                Ansh
              </span>
            </h1>
            <p className="text-lg text-gray-400">
              What would you like to explore today?
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {options.map((item) => (
              <button
                key={item.id}
                onClick={() => handleOptionClick(item.id)}
                className={`relative overflow-hidden ${item.bgColor} ${item.hoverBg} backdrop-blur-sm rounded-xl p-5 border ${item.borderColor} transition-all duration-200 hover:scale-[1.02] text-left shadow-lg`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-white/5 backdrop-blur-sm flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <h3 className="text-base font-semibold text-white leading-snug">
                      {item.name}
                    </h3>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Chat Interface */}
          <div ref={chatRef} className="flex-1 flex flex-col">
            <ChatInterface initialMessage={tradeText} />
          </div>
        </div>
      </div>
    </div>
  );
}
