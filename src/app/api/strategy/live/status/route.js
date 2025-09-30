// src/app/api/strategy/live/status/route.js
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import LiveRun from "@/lib/models/LiveRun";

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" }});
    await connectDB();
    const runs = await LiveRun.find({ clerkId: userId }).sort({ createdAt: -1 }).lean();
    return new Response(JSON.stringify({ runs }), { status: 200, headers: { "Content-Type": "application/json" }});
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err.message || err) }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}
