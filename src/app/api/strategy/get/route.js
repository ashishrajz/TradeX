import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId }).lean();

    return new Response(
      JSON.stringify({ strategyUrl: user?.strategyUrl || "" }),
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error in /api/strategy/get:", err);
    return new Response(err.message, { status: 500 });
  }
}
