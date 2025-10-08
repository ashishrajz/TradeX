import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req) {
  try {
    const body = await req.json();
    const { clerkId, phone, strategyUrl } = body;

    if (!clerkId) {
      return NextResponse.json({ error: "Missing clerkId" }, { status: 400 });
    }

    await connectDB();

    const update = {};
    if (phone) update.phone = phone;
    if (strategyUrl) update.strategyUrl = strategyUrl;

    const user = await User.findOneAndUpdate({ clerkId }, { $set: update }, { new: true });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("❌ Profile update failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
