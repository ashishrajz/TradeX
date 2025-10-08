"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  User,
  Award,
  Wallet,
  TrendingUp,
  Activity,
  Eye,
  Sparkle,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

export default function Page() {
  const router = useRouter();
  const { user } = useUser();

  const [profile, setProfile] = useState({
    balance: 0,
    assetValue: 0,
    activeTrades: 0,
    strategyUrl: "",
  });

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isFetching, setIsFetching] = useState(true); // 👈 shimmer control

  // Fetch user data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user?.id) return;
        setIsFetching(true);

        const res = await fetch(`/api/profile/get?clerkId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setUrl(data.strategyUrl || "");
        } else {
          console.error("❌ Profile fetch failed:", await res.text());
        }
      } catch (err) {
        console.error("❌ Fetch profile failed:", err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  // Save strategy URL
  const saveStrategy = async () => {
    if (!url.trim()) return alert("Please enter a URL");
    try {
      setLoading(true);
      const res = await fetch("/api/strategy/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, clerkId: user?.id }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Strategy URL saved");
        setUrl(data.strategyUrl);
      } else {
        const txt = await res.text();
        toast.error("Save failed: " + txt);
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Balance",
      value: `$${Number(profile.balance || 0).toLocaleString()}`,
      icon: Wallet,
    },
    {
      label: "Total Stocks",
      value: `$${Number(profile.assetValue || 0).toLocaleString()}`,
      icon: TrendingUp,
    },
    {
      label: "Total Trades",
      value: profile.activeTrades ?? 0,
      icon: Activity,
    },
  ];

  return (
    <div className="flex bg-black min-h-screen text-white">
      {/* ✅ Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ✅ Main content area */}
      <div className="flex-1 p-6 ml-20">
        {/* Header */}
        <div className="relative w-full backdrop-blur-md bg-slate-900/60 border-b border-slate-800/50 rounded-2xl mb-6">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              User Profile
            </h1>
          </div>
        </div>

        {/* Main */}
        <div className="relative p-4 max-w-7xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {isFetching
              ? // 🔄 shimmer placeholders
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 animate-pulse"
                  >
                    <div className="w-10 h-10 bg-slate-800 rounded-lg mb-3" />
                    <div className="h-3 bg-slate-800 rounded w-1/3 mb-2" />
                    <div className="h-5 bg-slate-800 rounded w-1/2" />
                  </div>
                ))
              : // ✅ real stats
                stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 hover:border-emerald-500/30 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                        <stat.icon size={20} className="text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                ))}
          </div>

          {/* Profile + Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Left */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 text-center">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-emerald-500/40 shadow-lg">
                      {user?.imageUrl ? (
                        <Image
                          src={user.imageUrl}
                          alt="Profile"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                          <User size={48} className="text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mt-4">
                    {user?.fullName || "User"}
                  </h2>
                  <div className="flex items-center gap-2 mt-3 px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full">
                    <Award size={14} className="text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">
                      TradeX Elite
                    </span>
                  </div>
                </div>

                {/* Strategy URL */}
                <div className="space-y-4 text-left">
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-2">
                    Strategy URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-strategy-api.com/webhook"
                    className="w-full bg-slate-950/50 border border-slate-800/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <button
                    onClick={saveStrategy}
                    disabled={loading}
                    className="w-full mt-3 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                  >
                    {loading ? "Saving..." : "Save Strategy"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-800/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Quick Actions</h2>
                  <div className="px-3 py-1 bg-emerald-500/10 rounded-full">
                    <span className="text-xs font-medium text-emerald-400">
                      TradeX Platform
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ActionButton
                    router={router}
                    path="/dashboard"
                    icon={<Eye size={24} className="text-emerald-400" />}
                    title="Portfolio Overview"
                    desc="View and manage your portfolio"
                    color="emerald"
                  />
                  <ActionButton
                    router={router}
                    path="/opus"
                    icon={<Sparkle size={24} className="text-purple-400" />}
                    title="AI Assistant"
                    desc="Chat with Opus for insights"
                    color="purple"
                  />
                  <ActionButton
                    router={router}
                    path="/copilot-mode"
                    icon={<TrendingUp size={24} className="text-cyan-400" />}
                    title="Run Copilot Mode"
                    desc="Let AI manage your trades"
                    color="cyan"
                  />
                  <ActionButton
                    router={router}
                    path="/transactions"
                    icon={<Zap size={24} className="text-orange-400" />}
                    title="Trade History"
                    desc="View your past trades and performance"
                    color="orange"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> {/* main */}
    </div>
  );
}

function ActionButton({ router, path, icon, title, desc, color }) {
  return (
    <button
      onClick={() => router.push(path)}
      className={`group p-6 bg-gradient-to-br from-slate-950/50 to-slate-900/50 rounded-2xl border border-slate-800/50 hover:border-${color}-400/30 transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 bg-${color}-500/10 rounded-xl group-hover:bg-${color}-500/20 transition-colors`}
        >
          {icon}
        </div>
        <ArrowUpRight
          size={16}
          className={`text-slate-500 group-hover:text-${color}-400 transition-colors`}
        />
      </div>
      <h3 className="font-semibold text-left mb-2">{title}</h3>
      <p className="text-sm text-slate-400 text-left">{desc}</p>
    </button>
  );
}
