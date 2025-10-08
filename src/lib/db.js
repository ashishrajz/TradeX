// src/lib/db.js
import mongoose from "mongoose";


const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    "\n❌ MONGODB_URI not found in environment.\n" +
    "Make sure .env.local exists and contains:\n" +
    "MONGODB_URI=your_mongo_connection_string\n"
  );

  process.exit(1);
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => {
      
      return mongoose;
    }).catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
