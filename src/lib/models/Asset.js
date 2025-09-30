// models/Asset.js
import mongoose from "mongoose";

const AssetSchema = new mongoose.Schema({
  symbol: { type: String, unique: true },
  name: String,
  logo: String,
  lastPrice: Number,
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Asset || mongoose.model("Asset", AssetSchema);
