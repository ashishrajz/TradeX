import React from "react";
import { Loader2 } from "lucide-react";
import { RiGeminiFill } from "react-icons/ri";

export default function Loader() {
  return (
    <div className="inline-flex items-center justify-center p-4 bg-gray-900/60 rounded-2xl shadow-md">
      <div className="relative w-10 h-10">
        {/* Rotating circle */}
        <div className="absolute inset-0 flex items-center justify-center animate-spin">
          <Loader2 className="w-full h-full text-blue-400" strokeWidth={1.5} />
        </div>

        {/* Center Gemini/Sparkles icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <RiGeminiFill className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}