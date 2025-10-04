// src/app/api/user/trades/route.js
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("❌ No userId found in Clerk auth");
      return new Response("Unauthorized", { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId: userId }).lean();

    if (!user) {
      console.warn("❌ No user found for clerkId:", userId);
      return new Response("User not found", { status: 404 });
    }

    console.log("✅ Found user:", userId);
    console.log("🔎 Raw trades from DB:", user.trades);

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const symbol = searchParams.get("symbol");

    console.log("👉 Query params => symbol:", symbol, "limit:", limit);

    let trades = user.trades || [];

    // If symbol filter applied
    if (symbol) {
      trades = trades.filter((t) => {
        const match = t.symbol?.toUpperCase() === symbol.toUpperCase();
        if (!match) {
          console.log("⏭️ Skipping trade for different symbol:", t.symbol);
        }
        return match;
      });
    }

    console.log("📊 Trades after symbol filter:", trades);

    // Normalize date/time
    trades = trades.map((t) => {
      const normalized = {
        ...t,
        date: t.date ? new Date(t.date).toISOString() : null,
      };
      console.log("🛠 Normalized trade:", normalized);
      return normalized;
    });

    // Sort by most recent
    trades = trades.sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log("📅 Sorted trades:", trades);

    // Limit
    if (limit > 0) {
      trades = trades.slice(0, limit);
      console.log("✂️ Limited trades:", trades);
    }

    return new Response(JSON.stringify(trades), { status: 200 });
  } catch (err) {
    console.error("❌ trades route error:", err);
    return new Response(err.message, { status: 500 });
  }
}
