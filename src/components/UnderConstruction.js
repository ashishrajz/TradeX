"use client";

import { Hammer, Wrench } from "lucide-react";

export default function UnderConstruction({ title = "Page Under Construction" }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
      
      {/* Animated illustration */}
      <div className="relative w-64 h-64 mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-yellow-400/20 animate-pulse"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Hammer className="w-24 h-24 text-yellow-400 animate-bounce" />
        </div>
        <div className="absolute bottom-6 right-8">
          <Wrench className="w-16 h-16 text-gray-300 animate-spin-slow" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-3">{title}</h1>
      <p className="text-gray-400 text-center max-w-md mb-8">
        We’re working hard to bring this page to life. Please check back soon!
      </p>

      {/* Animated dots loader */}
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce delay-150"></div>
        <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce delay-300"></div>
      </div>
    </div>
  );
}
