import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return new Response("User not found", { status: 404 });

    const body = await req.json();
    const { name = "New Strategy", rules = [] } = body;

    const strategy = {
      name,
      rules,
      createdAt: new Date(),
    };

    // Push into user's strategies
    user.strategies.push(strategy);
    await user.save();

    return Response.json({ success: true, strategy });
  } catch (err) {
    console.error("❌ Strategy save error", err);
    return new Response(err.message, { status: 500 });
  }
}
