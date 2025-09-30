// src/app/api/strategy/live/start/route.js
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import LiveRun from "@/lib/models/LiveRun";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" }});

    const body = await req.json();
    const { symbol, interval = "1m", allocatedCapital } = body;
    if (!symbol || !allocatedCapital) return new Response(JSON.stringify({ error: "Missing params" }), { status: 400, headers: { "Content-Type": "application/json" }});

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: { "Content-Type": "application/json" }});

    if (!user.strategyUrl) return new Response(JSON.stringify({ error: "Strategy URL not set. Put it in dashboard." }), { status: 400, headers: { "Content-Type": "application/json" }});

    // Check user has enough virtual cash
    if (user.cash < allocatedCapital) {
      return new Response(JSON.stringify({ error: "Insufficient cash to allocate" }), { status: 400, headers: { "Content-Type": "application/json" }});
    }

    // Deduct allocated from user.cash and create a LiveRun
    user.cash -= Number(allocatedCapital);
    await user.save();

    const run = await LiveRun.create({
      user: user._id,
      clerkId: user.clerkId,
      symbol,
      interval,
      allocatedCapital: Number(allocatedCapital),
      remainingCapital: Number(allocatedCapital),
      status: "running",
      positions: {},
    });

    return new Response(JSON.stringify({ ok: true, runId: run._id }), { status: 200, headers: { "Content-Type": "application/json" }});
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err.message || err) }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}
