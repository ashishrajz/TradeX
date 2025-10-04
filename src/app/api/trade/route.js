// /api/trade/route.js
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Trade from "@/lib/models/Trade";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { symbol, side, quantity, price } = body;

    if (!symbol || !side || !quantity || !price) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return new Response(
        JSON.stringify({ ok: false, error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const qty = Number(quantity);
    const tradePrice = Number(price);
    const cost = qty * tradePrice;

    // --- Update user cash and positions ---
    if (side === "BUY") {
      if (user.cash < cost) {
        return new Response(
          JSON.stringify({ ok: false, error: "Insufficient funds" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      user.cash -= cost;
      const prev = user.positions.get(symbol) || 0;
      user.positions.set(symbol, prev + qty);
    } else if (side === "SELL") {
      const prev = user.positions.get(symbol) || 0;
      if (prev < qty) {
        return new Response(
          JSON.stringify({ ok: false, error: "Insufficient asset" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      user.positions.set(symbol, prev - qty);
      user.cash += cost;
    } else {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid side" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- Create trade doc (with date auto from schema) ---
    const tradeDoc = await Trade.create({
      user: user._id,
      symbol,
      side,
      quantity: qty,
      price: tradePrice,
      date: new Date(), // ensure stored properly
    });

    // --- Push trade into user's local trades array too ---
    user.trades = user.trades || [];
    user.trades.push({
      symbol,
      side,
      quantity: qty,
      price: tradePrice,
      date: new Date(), // ✅ add date so it sorts correctly
    });

    await user.save();

    console.log("✅ Saved trade:", tradeDoc);
    console.log("📊 Updated user trades:", user.trades.slice(-5)); // log last 5 trades

    return new Response(
      JSON.stringify({
        ok: true,
        cash: user.cash,
        positions: Object.fromEntries(user.positions),
        trade: tradeDoc,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ Error in /api/trade POST:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
