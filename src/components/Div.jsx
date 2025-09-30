'use client'
import React from 'react';
import { Check } from 'lucide-react';

export default function Div() {


 const features = [
  'Eliminate hours of chart analysis with AI automation',
  'Create your personalized trading strategy in seconds',
  'Never miss a breakout or profit opportunity again'
];


  return (
    <div className="min-h-screen bg-black text-white p-8 mt-10 relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-50"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s infinite`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
    
            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
               Where Trading Meets Intelligence
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                Why trade manually when AI can do it for you? Our automated trading system analyzes market trends, price movements, and real-time data with lightning precision — executing buy and sell orders at the perfect moment. No emotions, no delays, no missed opportunities. Whether you're a beginner or a pro, our AI adapts to your strategy, learns from historical patterns, and continuously optimizes your portfolio. Just set your preferences, sit back, and watch your investments grow — 24/7, even while you sleep.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-gray-300 text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image - Mockup */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-800">
              {/* Browser mockup with chat interface */}
              <div className="aspect-video bg-gray-900 p-4">
                <div className="grid grid-cols-4 gap-2 h-full">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg p-3 space-y-2">
                      <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                      <div className="space-y-1 mt-4">
                        <div className="h-1 bg-gray-700 rounded"></div>
                        <div className="h-1 bg-gray-700 rounded w-5/6"></div>
                        <div className="h-1 bg-gray-700 rounded w-4/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}