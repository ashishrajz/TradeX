import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Trade from "@/lib/models/Trade";
import User from "@/lib/models/User";

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return new Response("User not found", { status: 404 });

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "0");
    const side = searchParams.get("side")?.toUpperCase() || "";
    const date = searchParams.get("date") || "";

    const filter = { user: user._id };
    if (side) filter.side = side;

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    let q = Trade.find(filter).sort({ date: -1 });
    if (limit > 0) q = q.limit(limit);

    const trades = await q.lean();

    return new Response(JSON.stringify(trades), { status: 200 });
  } catch (err) {
    console.error("❌ Error in /api/user/trades GET", err);
    return new Response(String(err.message || err), { status: 500 });
  }
}
