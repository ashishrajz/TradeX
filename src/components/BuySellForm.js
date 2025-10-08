'use client';
import { useState } from "react";
import toast from "react-hot-toast";

export default function BuySellForm({ symbol, price }) {
  const [isOpen, setIsOpen] = useState(false);
  const [side, setSide] = useState(null); // "BUY" or "SELL"
  const [quantity, setQuantity] = useState("");

  const handleTrade = async () => {
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        body: JSON.stringify({
          symbol,
          side,
          quantity,
          price,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();

      if (result.ok) {
        toast.success(`${side} order executed!`);
        setIsOpen(false);
        setQuantity("");
      } else {
        toast.error(`Trade failed: ${result.error}`);
      }
    } catch (err) {
      console.error("Trade error:", err);
      toast.error("Trade failed: " + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Buy button */}
      <button
        onClick={() => {
          setSide("BUY");
          setIsOpen(true);
        }}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        Buy {symbol}
      </button>

      {/* Sell button */}
      <button
        onClick={() => {
          setSide("SELL");
          setIsOpen(true);
        }}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        Sell {symbol}
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99999]">
    <div className="bg-gray-900 rounded-2xl p-6 w-96 border border-gray-700 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">
              {side} {symbol}
            </h2>

            <label className="block text-gray-400 mb-2">Quantity</label>
            <input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleTrade}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  side === "BUY"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                Confirm {side}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
