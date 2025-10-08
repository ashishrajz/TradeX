import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId");

    if (!clerkId)
      return NextResponse.json({ error: "Missing clerkId" }, { status: 400 });

    const user = await User.findOne({ clerkId }).lean();
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const balance = user.cash || 0;
    const activeTrades = Array.isArray(user.trades) ? user.trades.length : 0;

    // estimate total asset value
    const positions = user.positions || {};
    let assetValue = 0;
    for (const qty of Object.values(positions)) {
      assetValue += Number(qty) || 0;
    }

    return NextResponse.json({
      balance,
      assetValue,
      activeTrades,
      strategyUrl: user.strategyUrl || "",
    });
  } catch (err) {
    console.error("❌ Profile API error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
