import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, unique: true, required: true },
  email: String,
  name: String,
  image: String,
  cash: { type: Number, default: 10000 },
  positions: { type: Map, of: Number, default: {} },
  trades: { type: Array, default: [] }, // <-- Add this
  strategyUrl: { type: String, default: "" },
  strategyLogs: [
    {
      at: { type: Date, default: Date.now },
      payload: mongoose.Schema.Types.Mixed,
      response: mongoose.Schema.Types.Mixed,
      error: String,
    },
  ],
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
