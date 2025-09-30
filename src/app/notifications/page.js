"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Bell,
  TrendingUp,
  AlertTriangle,
  Newspaper,
  X,
  ChevronRight,
} from "lucide-react";

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [activeFilter, setActiveFilter] = useState("all");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "profit",
      title: "Trade Executed",
      subtitle: "BTC/USD",
      body: "Your limit order has been filled at $67,432. Position opened successfully.",
      value: "+$2,345",
      percentage: "+3.2%",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      type: "alert",
      title: "Price Alert",
      subtitle: "ETH/USD",
      body: "Ethereum has reached your target price of $3,500. Consider reviewing your position.",
      time: "15 min ago",
      unread: true,
    },
    {
      id: 3,
      type: "news",
      title: "Market Update",
      subtitle: "Crypto Markets",
      body: "Federal Reserve announces new policy changes affecting digital assets regulation.",
      time: "1 hour ago",
      unread: false,
    },
    {
      id: 4,
      type: "profit",
      title: "Position Closed",
      subtitle: "AAPL",
      body: "Take profit target reached. Position closed automatically with profit.",
      value: "+$892",
      percentage: "+1.8%",
      time: "2 hours ago",
      unread: false,
    },
    {
      id: 5,
      type: "alert",
      title: "Stop Loss Triggered",
      subtitle: "TSLA",
      body: "Stop loss executed at $242.50 to protect your capital.",
      value: "-$156",
      percentage: "-0.5%",
      time: "3 hours ago",
      unread: false,
    },
  ]);

  const filterTabs = ["all", "trades", "alerts", "news"];

  const getFilteredNotifications = () => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "trades")
      return notifications.filter((n) => n.type === "profit");
    if (activeFilter === "alerts")
      return notifications.filter((n) => n.type === "alert");
    if (activeFilter === "news")
      return notifications.filter((n) => n.type === "news");
    return notifications;
  };

  const getIcon = (type) => {
    switch (type) {
      case "profit":
        return <TrendingUp size={16} />;
      case "alert":
        return <AlertTriangle size={16} />;
      case "news":
        return <Newspaper size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const getIconStyles = (type) => {
    switch (type) {
      case "profit":
        return "bg-green-400/10 border-green-400/30 text-green-400";
      case "alert":
        return "bg-amber-400/10 border-amber-400/30 text-amber-400";
      case "news":
        return "bg-blue-400/10 border-blue-400/30 text-blue-400";
      default:
        return "bg-green-400/10 border-green-400/30 text-green-400";
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="flex bg-black min-h-screen text-white">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 ml-20 p-6">
        <div className="w-full max-w-4xl mx-auto bg-gradient-to-b from-zinc-900 to-black border border-green-400/10 rounded-2xl shadow-2xl shadow-green-400/5">
          {/* Header */}
          <div className="p-6 border-b border-green-400/10 bg-gradient-to-r from-green-400/5 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-green-400">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-green-500 text-black text-xs font-bold rounded-full">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <button className="text-gray-400 hover:text-green-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === tab
                      ? "bg-green-400/15 text-green-400 border border-green-400/30"
                      : "bg-zinc-800/50 text-gray-400 border border-zinc-700 hover:text-gray-300 hover:bg-zinc-800"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="p-3 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-green-400/20 scrollbar-track-transparent">
            {getFilteredNotifications().map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`mb-3 p-4 rounded-xl border cursor-pointer transition-all hover:translate-x-1 ${
                  notification.unread
                    ? "bg-green-400/5 border-green-400/20 border-l-4 border-l-green-400"
                    : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900"
                }`}
              >
                {/* Notification Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg border ${getIconStyles(
                        notification.type
                      )}`}
                    >
                      {getIcon(notification.type)}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">
                        {notification.title}
                      </h3>
                      <p className="text-gray-500 text-xs mt-1">
                        {notification.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-green-400/60 text-xs">
                    {notification.time}
                  </span>
                </div>

                {/* Notification Body */}
                <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                  {notification.body}
                </p>

                {/* Notification Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {notification.value && (
                      <>
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-semibold border ${
                            notification.value.startsWith("+")
                              ? "bg-green-400/10 border-green-400/20 text-green-400"
                              : "bg-red-400/10 border-red-400/20 text-red-400"
                          }`}
                        >
                          {notification.value}
                        </span>
                        {notification.percentage && (
                          <span
                            className={`text-xs ${
                              notification.percentage.startsWith("+")
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {notification.percentage}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <button className="flex items-center gap-1 px-3 py-1.5 text-green-400 text-xs font-semibold border border-green-400/30 rounded-lg hover:bg-green-400/10 transition-colors">
                    VIEW
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-green-400/10">
            <button className="w-full py-3 bg-gradient-to-r from-green-400/10 to-green-500/10 text-green-400 font-semibold rounded-lg border border-green-400/20 hover:from-green-400/20 hover:to-green-500/20 transition-all">
              Mark All as Read
            </button>
          </div>
        </div>

        {/* Floating Action Button */}
        <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-400/30 hover:scale-105 transition-transform">
          <Bell size={24} className="text-black" />
        </button>
      </div>
    </div>
  );
};

export default NotificationsPage;
