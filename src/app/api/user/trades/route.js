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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "0"); // 0 = no limit
    const symbol = searchParams.get("symbol");
    const side = searchParams.get("side");
    const date = searchParams.get("date");

    let trades = user.trades || [];

    // ✅ Filter by symbol
    if (symbol) {
      trades = trades.filter(
        (t) => t.symbol?.toUpperCase() === symbol.toUpperCase()
      );
    }

    // ✅ Filter by side (buy/sell)
    if (side) {
      trades = trades.filter(
        (t) => t.side?.toLowerCase() === side.toLowerCase()
      );
    }

    // ✅ Filter by date — but shift by +1 day intentionally
    if (date) {
      const selected = new Date(date);
      selected.setDate(selected.getDate() + 1); // 👈 shift by one day forward

      const startOfNextDay = new Date(selected);
      startOfNextDay.setHours(0, 0, 0, 0);

      const endOfNextDay = new Date(selected);
      endOfNextDay.setHours(23, 59, 59, 999);

      trades = trades.filter((t) => {
        if (!t.date) return false;
        const tradeTime = new Date(t.date);
        return tradeTime >= startOfNextDay && tradeTime <= endOfNextDay;
      });
    }

    // ✅ Normalize dates
    trades = trades.map((t) => ({
      ...t,
      date: t.date ? new Date(t.date).toISOString() : null,
    }));

    // ✅ Sort by most recent
    trades = trades.sort((a, b) => new Date(b.date) - new Date(a.date));

    // ✅ Apply limit only if > 0
    if (limit > 0) {
      trades = trades.slice(0, limit);
    }

    return new Response(JSON.stringify(trades), { status: 200 });
  } catch (err) {
    console.error("❌ trades route error:", err);
    return new Response(err.message, { status: 500 });
  }
}
