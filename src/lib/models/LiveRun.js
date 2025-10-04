// src/lib/models/LiveRun.js
import mongoose from "mongoose";

const LiveRunSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clerkId: { type: String, required: true }, // match with Clerk user

  // Either custom URL strategy OR saved strategyId
  strategyUrl: { type: String }, 
  strategyId: { type: mongoose.Schema.Types.ObjectId, ref: "User.strategies" },

  symbol: { type: String, required: true },
  interval: { type: String, default: "1m" }, // strategy execution interval
  capital: { type: Number, required: true },
  remainingCapital: { type: Number, required: true },
  stopLoss: { type: Number, default: null }, // e.g., -10% threshold

  tradeHistory: [
    {
      side: String,
      quantity: Number,
      price: Number,
      at: { type: Date, default: Date.now },
    },
  ],

  equityCurve: {
    type: [
      {
        at: { type: Date, default: Date.now },
        equity: Number,
      },
    ],
    default: [],
  },

  status: { type: String, enum: ["running", "stopped"], default: "running" },
  positions: { type: Map, of: Number, default: {} }, // symbol -> qty
  lastRunAt: Date,
});

export default mongoose.models.LiveRun || mongoose.model("LiveRun", LiveRunSchema);
