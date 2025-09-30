// src/app/api/user/strategy/route.js
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

    const body = await req.json();
    const { url } = body;
    if (!url) return new Response(JSON.stringify({ error: "Missing url" }), { status: 400, headers: { "Content-Type": "application/json" } });

    await connectDB();
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      // If you want to auto-create user record:
      user = await User.create({ clerkId: userId, strategyUrl: url });
    } else {
      user.strategyUrl = url;
      await user.save();
    }

    // Optional: quick validation ping to URL omitted here for speed
    return new Response(JSON.stringify({ ok: true, url }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err.message || err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

    await connectDB();
    const user = await User.findOne({ clerkId: userId }, "strategyUrl");
    if (!user) return new Response(JSON.stringify({ url: null }), { status: 200, headers: { "Content-Type": "application/json" } });

    return new Response(JSON.stringify({ url: user.strategyUrl || null }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err.message || err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
