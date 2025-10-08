'use client';
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Wallet, Activity } from "lucide-react";

export default function Header() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [cash, setCash] = useState(null);
  const [loadingCash, setLoadingCash] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    setLoadingCash(true);
    fetch(`/api/user/${user.id}`)
      .then((res) => res.json())
      .then((data) => setCash(data.cash))
      .catch((err) => console.error("Failed to fetch user cash:", err))
      .finally(() => setLoadingCash(false));
  }, [user, isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="px-8 py-6 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse"></div>
        <div className="h-6 w-32 bg-slate-800 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="px-8 py-6 bg-slate-950 border-b border-red-900/50 flex items-center gap-3 text-red-400">
        <Activity className="w-5 h-5" />
        <span className="font-medium">Please sign in to continue</span>
      </div>
    );
  }

  return (
    <div className="px-8 py-6 backdrop-blur-xl bg-slate-950/40 border-b border-slate-800/60 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
      <div className="flex items-center justify-between">
        {/* Left - Greeting */}
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg shadow-emerald-500/20">
            {user.firstName?.charAt(0) || "U"}
          </div>

          <div>
            <h1 className="text-xl font-semibold text-white">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {user.firstName || "Trader"}
              </span>
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <p>Your trading dashboard</p>
            </div>
          </div>
        </div>

        {/* Right - Balance */}
        <div className="flex items-center gap-4 bg-slate-900/70 border border-slate-800 rounded-xl px-6 py-4 backdrop-blur-md hover:border-emerald-400/40 transition-all shadow-[0_0_15px_rgba(6,182,212,0.08)]">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-emerald-400" />
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase font-medium mb-1 tracking-wide">
              Available Balance
            </p>

            {loadingCash ? (
              <div className="w-32 h-6 bg-slate-800 rounded animate-pulse"></div>
            ) : (
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                $
                {cash !== null
                  ? cash.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"}
              </h2>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
