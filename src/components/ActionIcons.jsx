import { useState } from "react";
import { ThumbsUp, ThumbsDown, Copy } from "lucide-react";

export default function ActionIcons({ textToCopy }) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => alert("Failed to copy"));
  };

  const buttonBaseClasses =
    "p-3 rounded-xl transition-all duration-200 shadow-md hover:scale-110 hover:shadow-xl";

  return (
    <div>
      <div className="rounded-2xl  p-3">
        <div className="flex items-center gap-6">
          {/* Like */}
          <button
            onClick={() => {
              setLiked(!liked);
              if (disliked) setDisliked(false);
            }}
            className={`${buttonBaseClasses} ${
              liked
                ? "bg-blue-600 shadow-blue-500/50"
                : "bg-slate-700/30 hover:bg-slate-700/50"
            }`}
          >
            <ThumbsUp
              className={`w-6 h-6 transition-colors duration-200 ${
                liked ? "text-white fill-white" : "text-gray-400 hover:text-gray-300"
              }`}
            />
          </button>

          {/* Dislike */}
          <button
            onClick={() => {
              setDisliked(!disliked);
              if (liked) setLiked(false);
            }}
            className={`${buttonBaseClasses} ${
              disliked
                ? "bg-red-600 shadow-red-500/50"
                : "bg-slate-700/30 hover:bg-slate-700/50"
            }`}
          >
            <ThumbsDown
              className={`w-6 h-6 transition-colors duration-200 ${
                disliked
                  ? "text-white fill-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            />
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className={`${buttonBaseClasses} ${
              copied
                ? "bg-emerald-600 shadow-emerald-500/50"
                : "bg-slate-700/30 hover:bg-slate-700/50"
            } relative`}
          >
            <Copy
              className={`w-6 h-6 transition-colors duration-200 ${
                copied ? "text-white" : "text-gray-400 hover:text-gray-300"
              }`}
            />
            {copied && (
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap animate-fadeIn">
                Copied!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tailwind animation keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}