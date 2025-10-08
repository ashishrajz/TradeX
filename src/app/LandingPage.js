"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import Div from "@/components/Div";
import Div2 from "@/components/Div2";
import HowBar from "@/components/HowBar";
import Accordion from "@/components/Accordian";
import { SignInButton } from "@clerk/nextjs";

function Changer() {
  const [index, setIndex] = useState(0);
  const words = ["Revolutionary.", "Intelligent.", "Lightning Fast."];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span className="inline-block bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent">
      {words[index]}
    </span>
  );
}

// Scroll with offset for fixed navbar
const scrollWithOffset = (id) => {
  const element = document.getElementById(id);
  const offset = 100; // adjust based on navbar height
  if (element) {
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};

export default function StarryGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random(),
      speed: Math.random() * 0.015 + 0.005,
      direction: Math.random() > 0.5 ? 1 : -1,
    }));

    const drawGrid = () => {
      ctx.strokeStyle = "rgba(100, 150, 200, 0.15)";
      ctx.lineWidth = 1;
      const gridSize = 80;

      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const drawStars = () => {
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });
    };

    let animationId;
    const animate = () => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGrid();

      stars.forEach((star) => {
        star.opacity += star.speed * star.direction;
        if (star.opacity <= 0 || star.opacity >= 1) star.direction *= -1;
      });

      drawStars();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="flex flex-col">
      <canvas ref={canvasRef} className="fixed inset-0 z-0" />
      <div className="w-full min-h-screen bg-black overflow-hidden">
        <style>{`
          @keyframes liquidRotate {
            0%, 100% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(90deg) scale(1.1); }
            50% { transform: rotate(180deg) scale(1); }
            75% { transform: rotate(270deg) scale(1.1); }
          }
          @keyframes liquidPulse {
            0%, 100% { transform: translate(0%, 0%) scale(1); opacity: 0.6; }
            50% { transform: translate(20%, 20%) scale(1.2); opacity: 0.8; }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%) translateY(-100%); }
            100% { transform: translateX(100%) translateY(100%); }
          }
        `}</style>

        {/* Navbar */}
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 border border-blue-200/20 rounded-full px-10 py-4 text-xl bg-gray-200/5 backdrop-blur-xl flex items-center space-x-10 shadow-2xl shadow-black/20 text-blue-200 z-20">
          <button
            onClick={() => scrollWithOffset("features")}
            className="hover:underline transition-all hover:text-white/80"
          >
            Features
          </button>
          <button
            onClick={() => scrollWithOffset("faqs")}
            className="hover:underline transition-all hover:text-white/80"
          >
            FAQs
          </button>
          <button
            onClick={() => scrollWithOffset("how-it-works")}
            className="hover:underline transition-all hover:text-white/80"
          >
            How It Works
          </button>
        </nav>

        {/* Login Button */}
<div className="fixed top-6 right-6 z-20">
  <SignInButton mode="modal">
    <button className="relative overflow-hidden px-12 py-3 rounded-full font-bold text-2xl text-white transition-transform hover:scale-105 active:scale-95 shadow-2xl group border border-blue-200/20">
      <div
        className="absolute inset-0 opacity-100"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(0, 150, 200, 0.8) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(0, 200, 150, 0.8) 0%, transparent 50%),
            radial-gradient(circle at 50% 20%, rgba(50, 150, 200, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 50% 80%, rgba(0, 180, 180, 0.6) 0%, transparent 50%),
            linear-gradient(135deg, #0a4d5c 0%, #afafc5ff 50%, #0f3d3e 100%)
          `,
          animation: "liquidRotate 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 60%)",
          animation: "liquidPulse 4s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)",
          animation: "shimmer 3s ease-in-out infinite",
        }}
      />
      <span className="relative z-10 flex items-center gap-3">
        login
        <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  </SignInButton>
</div>
        {/* Hero Section */}
        <section className="min-h-screen flex z-10 pt-32 relative">
          {/* Left */}
          <div className="w-1/2 flex items-center px-16">
            <div className="max-w-2xl">
              <h1 className="text-7xl font-bold text-white mb-6 leading-tight">
                World&apos;s Most
                <br />
                Powerful Trading App.
                <br />
                <Changer />
              </h1>
              <p className="text-gray-400 text-xl mb-12 leading-relaxed">
                Stop switching between charts, news, and analytics. InvestSmart
                brings all your trading tools into one place. With AI-powered
                insights, real-time analytics, and a sleek dashboard, you can
                track, buy, and sell stocks effortlessly.
              </p>
              <SignInButton mode="modal">
  <button className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-green-500 text-white text-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all flex items-center gap-3">
    Get Started Now
    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
  </button>
</SignInButton>
              <p className="text-gray-500 text-sm mt-8">
                Experience smarter & more accurate answers
              </p>
            </div>
          </div>
          {/* Right */}
          <div className="w-1/2 flex items-center justify-center px-16">
            <div className="w-full max-w-4xl aspect-[9/11] rounded-2xl flex items-center justify-center shadow-2xl">
            <video 
      src="/login.mp4" 
      autoPlay 
      loop 
      muted 
      playsInline 
      className="w-full h-full object-cover rounded-2xl"
    />
            </div>
          </div>
        </section>
      </div>

      {/* SECOND PAGE / NEW SECTION */}
      <div className="w-full min-h-screen bg-transparent flex flex-col justify-center py-10 relative">
        {/* Features Section */}
        <div id="features" className="flex flex-col items-center">
          <Div />
          <Div2 />
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="flex flex-col mt-20">
          <HowBar />
        </div>

        {/* FAQs Section */}
        <div id="faqs" className="flex flex-col mt-20">
          <Accordion />
        </div>
      </div>
    </div>
  );
}