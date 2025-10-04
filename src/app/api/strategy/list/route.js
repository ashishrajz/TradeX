import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user) return new Response("User not found", { status: 404 });

    return Response.json(user.strategies || []);
  } catch (err) {
    console.error("❌ Strategy list error", err);
    return new Response(err.message, { status: 500 });
  }
}
