import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user || !user.strategyUrl) {
      return new Response("No strategy URL registered", { status: 400 });
    }

    // Parse body for market data (sent from frontend)
    const body = await req.json();
    const { symbol, price } = body;

   

    // Call user’s strategy API
    const r = await fetch(user.strategyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, price }),
    });

    if (!r.ok) {
      throw new Error(`Strategy API error: ${r.status}`);
    }

    const decision = await r.json();

    // Save log in user’s DB
    await User.updateOne(
      { clerkId: userId },
      {
        $push: {
          strategyLogs: {
            payload: { symbol, price },
            response: decision,
          },
        },
      }
    );

    return new Response(JSON.stringify(decision), { status: 200 });
  } catch (err) {
    console.error("❌ Strategy run error:", err);
    return new Response(err.message || "Error", { status: 500 });
  }
}
