// src/app/api/copilot/start/route.js
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import LiveRun from "@/lib/models/LiveRun";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const { symbol, capital, stopLoss, interval, strategyId, strategyUrl } = await req.json();
    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) return new Response("User not found", { status: 404 });

    if (!strategyUrl && !strategyId) {
      return new Response("No strategy specified", { status: 400 });
    }

    const run = await LiveRun.create({
      userId: user._id,
      clerkId: userId,
      strategyUrl: strategyUrl || null,
      strategyId: strategyId || null,
      symbol,
      interval: interval || "1m",
      capital,
      remainingCapital: capital,
      stopLoss,
      positions: {},
      status: "running",
    });

    return Response.json({ success: true, run });
  } catch (err) {
    console.error("❌ Copilot start error", err);
    return new Response(err.message, { status: 500 });
  }
}
