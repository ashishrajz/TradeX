// lib/models/LiveRun.js
import mongoose from "mongoose";

const LiveRunSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  symbol: String,
  interval: String,
  capital: Number,
  strategyUrl: String,
  status: { type: String, default: "active" }, // active, stopped, finished
  equityCurve: [{ time: Date, value: Number }],
  trades: [{
    date: Date,
    action: String,
    quantity: Number,
    price: Number
  }],
}, { timestamps: true });

export default mongoose.models.LiveRun || mongoose.model("LiveRun", LiveRunSchema);
