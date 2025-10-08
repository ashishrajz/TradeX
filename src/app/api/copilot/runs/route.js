// src/app/api/copilot/runs/route.js
import redis from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import LiveRun from "@/lib/models/LiveRun";
import User from "@/lib/models/User";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    await connectDB();

    // Get all runs for this user
    const runs = await LiveRun.find({ clerkId: userId }).lean();

    // Fetch user's strategies once for mapping
    const user = await User.findOne({ clerkId: userId }, { strategies: 1 }).lean();
    const strategyMap = new Map(
      (user?.strategies || []).map((s) => [String(s._id), s.name])
    );

    // Enrich each run
    const enrichedRuns = await Promise.all(
      runs.map(async (r) => {
        try {
          // Add strategy info
          if (r.strategyId) {
            r.strategyName = strategyMap.get(String(r.strategyId)) || "Unnamed Strategy";
          } else if (r.strategyUrl) {
            r.strategyName = r.strategyUrl;
          } else {
            r.strategyName = "N/A";
          }

          // Fetch klines
          const url = `https://api.binance.com/api/v3/klines?symbol=${r.symbol}&interval=${r.interval}&limit=100`;
          const res = await fetch(url);
          const data = await res.json();
          r.klines = Array.isArray(data)
            ? data.map((d) => ({
                openTime: d[0],
                open: parseFloat(d[1]),
                high: parseFloat(d[2]),
                low: parseFloat(d[3]),
                close: parseFloat(d[4]),
                volume: parseFloat(d[5]),
                closeTime: d[6],
              }))
            : [];
        } catch (err) {
          console.warn(`[copilot] Error fetching klines for ${r.symbol}:`, err);
          r.klines = [];
        }

        return r;
      })
    );

    return Response.json(enrichedRuns);
  } catch (err) {
    console.error("❌ Copilot runs error", err);
    return new Response(err.message, { status: 500 });
  }
}
