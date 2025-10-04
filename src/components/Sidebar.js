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
} from "lucide-react";
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loadingId, setLoadingId] = useState(null);

  // Navigation items
  const navItems = [
    { id: "Home", icon: Home, label: "Home", link: "/" },
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", link: "/dashboard" },
    { id: "profile", icon: UserRoundCog, label: "Profile", link: "/profile" },
    { id: "transactions", icon: ArrowRightLeft, label: "Transactions", link: "/transactions" },
    { id: "notifications", icon: Bell, label: "Notifications", link: "/notifications" },
  ];

  const logoutItem = { id: "logout", icon: LogOut, label: "Logout", link: "/" };

  // Sync activeTab with pathname on page load
  useEffect(() => {
    if (pathname.includes("/home")) setActiveTab("Home");
    else if (pathname.includes("/dashboard")) setActiveTab("dashboard");
    else if (pathname.includes("/profile")) setActiveTab("profile");

    else if (pathname.includes("/transactions")) setActiveTab("transactions");
    else if (pathname.includes("/notifications")) setActiveTab("notifications");
    else setActiveTab("Home"); // default fallback
    setLoadingId(null); // hide loader on route change
  }, [pathname, setActiveTab]);

  const handleNavigation = (item) => {
    setActiveTab(item.id);
    setLoadingId(item.id);
    router.push(item.link);
  };

  return (
    <>
      {loadingId && <FullScreenLoader />}

      <div className="fixed top-0 left-0 h-screen w-24 bg-gray-950/95 backdrop-blur-sm flex flex-col items-center border-r border-gray-800/50 z-50">
        
        {/* Logo */}
        <div className="pt-8 pb-12">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-6 flex-1 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`group relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-200 ${
                activeTab === item.id 
                  ? "bg-gray-800/60 text-white shadow-lg shadow-gray-900/20" 
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/30"
              }`}
              onClick={() => handleNavigation(item)}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium tracking-tight">{item.label}</span>

              {activeTab === item.id && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="pb-8 px-2">
          <button
            className="group flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            onClick={() => handleNavigation(logoutItem)}
          >
            <SignedIn>
              <UserButton />
            </SignedIn>
            
          </button>
        </div>

      </div>
    </>
  );
};

export default Sidebar;
