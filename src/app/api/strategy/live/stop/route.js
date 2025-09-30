// src/app/api/strategy/live/stop/route.js
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import LiveRun from "@/lib/models/LiveRun";
import User from "@/lib/models/User";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" }});
    const { runId, liquidate = false } = await req.json();
    if (!runId) return new Response(JSON.stringify({ error: "Missing runId" }), { status: 400, headers: { "Content-Type": "application/json" }});

    await connectDB();
    const run = await LiveRun.findById(runId);
    if (!run) return new Response(JSON.stringify({ error: "Run not found" }), { status: 404, headers: { "Content-Type": "application/json" }});

    if (run.status !== "running") {
      return new Response(JSON.stringify({ ok: true, message: "Already stopped" }), { status: 200, headers: { "Content-Type": "application/json" }});
    }

    run.status = "stopped";
    await run.save();

    // Optionally return remaining capital to user (we won't auto-liquidate positions here)
    if (liquidate) {
      // naive: return remainingCapital to user's cash (positions not liquidated)
      const user = await User.findOne({ clerkId: run.clerkId });
      if (user) {
        user.cash += run.remainingCapital || 0;
        await user.save();
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" }});
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err.message || err) }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}
