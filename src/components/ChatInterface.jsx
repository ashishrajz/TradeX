"use client";
import { useEffect, useState, useRef } from "react";
import { Send, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ActionIcons from "./ActionIcons";
import Loader from "./Loader";
import { FaCircleNotch } from "react-icons/fa";
import { useUser } from "@clerk/nextjs";

export default function ChatInterface({ initialMessage = "" }) {
  const { user } = useUser();

  const [messages, setMessages] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("chat_messages_v1") || "null") || [
          {
            role: "ai",
            content:
              "👋 Hi — I’m **Opus**, your AI trading mentor. Ask me about your trades or portfolio!",
          },
        ]
      );
    } catch {
      return [
        {
          role: "ai",
          content:
            "👋 Hi — I’m **Opus**, your AI trading mentor. Ask me about your trades or portfolio!",
        },
      ];
    }
  });

  const [message, setMessage] = useState(initialMessage || "");
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Persist messages
  useEffect(() => {
    localStorage.setItem("chat_messages_v1", JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update message if preset used
  useEffect(() => {
    if (initialMessage) setMessage(initialMessage);
  }, [initialMessage]);

  async function sendMessage() {
    if (!message.trim()) return;
    const userText = message.trim();

    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setMessage("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "ai", content: "" }]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          clerkId: user?.id,
        }),
      });

      const data = await res.json();
      const aiContent =
        typeof data?.result === "object"
          ? JSON.stringify(data.result, null, 2)
          : data?.result ?? data?.message ?? "(no response)";

      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "ai", content: aiContent };
        return copy;
      });
    } catch (err) {
      console.error("AI call failed", err);
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "ai",
          content: "⚠️ Failed to fetch AI response.",
        };
        return copy;
      });
    } finally {
      setLoading(false);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function extractJsonFromText(text) {
    if (!text || typeof text !== "string") return null;
    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/```json\s*([\s\S]*?)```/i);
      if (match && match[1]) {
        try {
          return JSON.parse(match[1].trim());
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  function RenderStructuredAI({ raw }) {
    const parsed = extractJsonFromText(raw);
    if (!parsed) return null;
    const { summary, scores, insights, recommendations } = parsed;

    return (
      <div className="bg-gray-900/60 border border-blue-500/20 rounded-2xl p-5 mt-2 space-y-4">
        {summary && (
          <h3 className="text-lg font-bold text-blue-300">{summary}</h3>
        )}
        {scores && typeof scores === "object" && (
          <div className="flex gap-3">
            {Object.entries(scores).map(([k, v]) => (
              <div
                key={k}
                className="flex-1 bg-gray-800 p-3 rounded-lg text-center"
              >
                <div className="text-xs uppercase text-gray-400">{k}</div>
                <div className="text-xl font-bold text-blue-200">
                  {typeof v === "number" ? v.toFixed(1) : String(v)}
                </div>
              </div>
            ))}
          </div>
        )}
        {insights && (
          <div>
            <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 Insights</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              {insights.map((it, idx) => (
                <li key={idx}>{it}</li>
              ))}
            </ul>
          </div>
        )}
        {recommendations && (
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-2">📈 Recommendations</h4>
            <ol className="list-decimal pl-5 space-y-1 text-gray-300">
              {recommendations.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* ✅ Messages area — scrolls, no padding below */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        {messages.map((msg, index) => {
          const key = `chat-${index}-${msg.role}`;
          if (msg.role === "user") {
            return (
              <div key={key} className="flex items-start gap-3 justify-end">
                <div className="flex-1 flex justify-end">
                  <div className="bg-blue-600 text-white rounded-2xl px-4 py-2 max-w-4xl text-right whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  U
                </div>
              </div>
            );
          }
          if (msg.role === "ai" && !msg.content) {
            return (
              <div key={key} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <FaCircleNotch className="text-white animate-spin" />
                </div>
                <div className="flex-1">
                  <Loader />
                </div>
              </div>
            );
          }
          return (
            <div key={key} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                A
              </div>
              <div className="flex-1">
                <div className="text-blue-400 font-semibold text-lg">Opus</div>
                <RenderStructuredAI raw={msg.content} />
                {!extractJsonFromText(msg.content) && (
                  <div className="text-gray-200 rounded-2xl px-6 py-4 mt-2 max-w-4xl text-base shadow-lg shadow-black/50 prose prose-invert break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {typeof msg.content === "string"
                        ? msg.content
                        : JSON.stringify(msg.content, null, 2)}
                    </ReactMarkdown>
                  </div>
                )}
                <div className="flex items-center gap-2 py-2">
                  <div className="w-[40px] border-t border-blue-200/20"></div>
                  <ActionIcons textToCopy={msg.content} />
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* ✅ Input area - flush bottom */}
      <div className="w-full bg-black border-t border-gray-800 px-6 py-3 flex items-center gap-3 mt-0">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition ${
            showMenu
              ? "bg-blue-600 text-white"
              : "bg-white/5 hover:bg-white/10 text-gray-300"
          }`}
        >
          <Plus
            className={`w-5 h-5 transition-transform ${
              showMenu ? "rotate-45" : ""
            }`}
          />
        </button>

        <textarea
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 mx-3 bg-transparent text-white resize-none outline-none placeholder-gray-500 text-lg py-2 max-h-[70px] overflow-y-auto"
          onKeyDown={(e) =>
            e.key === "Enter" &&
            !e.shiftKey &&
            (e.preventDefault(), sendMessage())
          }
        />

        <button
          onClick={() => sendMessage()}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
