import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    await connectDB();
    const { url } = await req.json();

    if (!url || !url.startsWith("http")) {
      return new Response("Invalid URL", { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { strategyUrl: url },
      { new: true, upsert: true }
    ).lean();

    return new Response(
      JSON.stringify({ strategyUrl: user.strategyUrl }),
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error in /api/strategy/register:", err);
    return new Response(err.message, { status: 500 });
  }
}
