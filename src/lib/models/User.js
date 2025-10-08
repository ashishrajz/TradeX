// /src/lib/models/User.js
import mongoose from "mongoose";

const RuleSchema = new mongoose.Schema({
  indicator: { type: String, required: true }, // RSI, SMA, EMA, PRICE
  params: { type: mongoose.Schema.Types.Mixed, default: {} }, 
  condition: { type: String, required: true }, // <, >, <=, >=, ==
  value: { type: mongoose.Schema.Types.Mixed, required: true }, 
  action: { type: String, enum: ["BUY", "SELL", "HOLD"], required: true },
  quantity: { type: Number, default: 0 },
});

const StrategySchema = new mongoose.Schema({
  name: { type: String, default: "My Strategy" },
  rules: { type: [RuleSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  lastRunAt: Date,
});

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, unique: true, required: true },
  email: String,
  name: String,
  image: String,
  cash: { type: Number, default: 100000 },
  positions: { type: Map, of: Number, default: {} },
  trades: { type: Array, default: [] },

  
  strategyUrl: { type: String, default: "" },

  
  strategyLogs: [
    {
      at: { type: Date, default: Date.now },
      payload: mongoose.Schema.Types.Mixed,
      response: mongoose.Schema.Types.Mixed,
      error: String,
    },
  ],
  equityHistory: {
    type: [
      {
        at: { type: Date, default: Date.now },
        total: Number, 
      },
    ],
    default: [],
  },
  

  
  strategies: { type: [StrategySchema], default: [] },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
