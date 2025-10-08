import mongoose from "mongoose";

let isConnected = false;

export default async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;

  // ✅ Prevent build crash if no MongoDB URI during build
  if (!uri) {
    console.warn("⚠️ MONGODB_URI not found — skipping DB connection (likely build time)");
    return;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // prevent hang if DB unreachable
    });
    isConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}
