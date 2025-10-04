import redis from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import LiveRun from "@/lib/models/LiveRun";


export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    await connectDB();
    const runs = await LiveRun.find({ clerkId: userId }).lean();

    // fetch klines for each run (optional optimization: only for running runs)
    const enrichedRuns = await Promise.all(
      runs.map(async (r) => {
        try {
          const url = `https://api.binance.com/api/v3/klines?symbol=${r.symbol}&interval=${r.interval}&limit=100`;
          const res = await fetch(url);
          const data = await res.json();
          r.klines = data.map((d) => ({
            openTime: d[0],
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
            volume: parseFloat(d[5]),
            closeTime: d[6],
          }));
        } catch {
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
