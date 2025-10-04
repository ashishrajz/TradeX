// src/app/api/copilot/stop/route.js
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import LiveRun from "@/lib/models/LiveRun";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const { runId } = await req.json();

    await connectDB();
    const run = await LiveRun.findOne({ _id: runId, clerkId: userId });
    if (!run) return new Response("Run not found", { status: 404 });

    run.status = "stopped";
    await run.save();

    return Response.json({ success: true });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
