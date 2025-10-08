'use client';
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import FullScreenLoader from "./FullScreenLoader";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Bell,
  User,
  BarChart3,
  LayoutDashboard,
  LogOut,
  ArrowRightLeft,
  UserRoundCog,
  Home,
  ChevronRight,
  Sparkle,
  FlaskConical,
  Brain,
  Wrench
} from "lucide-react";
import { RiGeminiLine } from "react-icons/ri";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loadingId, setLoadingId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Navigation items
  const navItems = [
    { id: "Home", icon: Home, label: "Home", link: "/" },
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", link: "/dashboard" },
    { id: "opus", icon: Sparkle, label: "OpusAI", link: "/opus" },
    { id: "backtest", icon: FlaskConical, label: "Backtest", link: "/backtest" },
    { id: "copilotmode", icon: Brain, label: "Copilot Mode", link: "/copilot-mode" },
    { id: "strategybuilder", icon: Wrench, label: "Strategy Builder", link: "/strategy-builder" },
    { id: "transactions", icon: ArrowRightLeft, label: "Transactions", link: "/transactions" },
    { id: "profile", icon: UserRoundCog, label: "Profile", link: "/profile" },
  ];

  const logoutItem = { id: "logout", icon: LogOut, label: "Logout", link: "/" };

  // Sync activeTab with pathname on page load
  useEffect(() => {
    if (pathname.includes("/home")) setActiveTab("Home");
    else if (pathname.includes("/dashboard")) setActiveTab("dashboard");
    else if (pathname.includes("/profile")) setActiveTab("profile");
    else if (pathname.includes("/transactions")) setActiveTab("transactions");
    else if (pathname.includes("/notifications")) setActiveTab("notifications");
    else setActiveTab("Home");
    setLoadingId(null);
  }, [pathname, setActiveTab]);

  const handleNavigation = (item) => {
    setActiveTab(item.id);
    setLoadingId(item.id);
    router.push(item.link);
  };

  return (
    <>
      {loadingId && <FullScreenLoader />}

      <div 
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col border-r border-slate-800/50 z-50 transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        
        {/* Logo Section */}
        <div className="relative px-5 py-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl blur-lg opacity-50"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-2xl">
                <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
              <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent whitespace-nowrap">
                TradeX
              </h1>
              <p className="text-xs text-slate-500 whitespace-nowrap">Trade Smarter. Grow Faster</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1 px-3 py-8 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`group relative flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 shadow-lg shadow-emerald-500/5" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
                onClick={() => handleNavigation(item)}
              >
                {/* Active indicator - left bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-400 rounded-r-full shadow-lg shadow-emerald-400/50" />
                )}

                {/* Icon container */}
                <div className={`relative flex items-center justify-center transition-all duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}>
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  
                  {/* Icon glow effect when active */}
                  {isActive && (
                    <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full"></div>
                  )}
                </div>

                {/* Label */}
                <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
                }`}>
                  {item.label}
                </span>

                {/* Arrow indicator when expanded and active */}
                {isActive && isExpanded && (
                  <ChevronRight className="w-4 h-4 ml-auto text-emerald-400 animate-pulse" />
                )}

                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-teal-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : ''
                }`}></div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 pb-6 pt-4 border-t border-slate-800/50 space-y-3">
          
          {/* User Profile */}
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/30 border border-slate-700/50 overflow-hidden ${
            isExpanded ? 'justify-start' : 'justify-center'
          }`}>
            <SignedIn>
              <div className="flex items-center gap-3 w-full">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-400/20 blur-md rounded-full"></div>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 ring-2 ring-emerald-400/30"
                      }
                    }}
                  />
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                  <p className="text-sm font-medium text-slate-200 whitespace-nowrap">Account</p>
                  <p className="text-xs text-slate-500 whitespace-nowrap">Manage profile</p>
                </div>
              </div>
            </SignedIn>
            <SignedOut>
              <div className="flex items-center justify-center w-8 h-8">
                <User className="w-5 h-5 text-slate-500" />
              </div>
            </SignedOut>
          </div>

          {/* Collapse indicator */}
          <div className={`flex items-center justify-center text-slate-600 transition-all duration-300 ${
            isExpanded ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50"></div>
              <span>Hover to expand</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Sidebar;