import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

/**
 * Helper: fetch current ticker via your existing API endpoint.
 */
async function fetchCurrentPrice(symbol) {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ticker?symbol=${encodeURIComponent(symbol)}`;
    
    const r = await fetch(url);

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.warn(`[portfolio] Non-OK response for ${symbol}: status=${r.status} body=${txt.slice(0, 80)}`);
      return null;
    }

    const json = await r.json();
    return {
      lastPrice: Number(json.lastPrice ?? json.price ?? json.close ?? 0),
      priceChangePercent: Number(json.priceChangePercent ?? json.priceChange ?? 0),
    };
  } catch (err) {
    console.error(`[portfolio] fetchPrice error for ${symbol}`, err);
    return null;
  }
}

export async function GET() {
  try {
    
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user) return new Response("User not found", { status: 404 });

    

    // ✅ Normalize positions
    const positions = user.positions || {};
   

    let assetObjects = [];
    let assetValue = 0;

    // Build asset list
    for (const [symbol, qty] of Object.entries(positions)) {
      
      const tick = await fetchCurrentPrice(symbol);

      if (!tick || !tick.lastPrice) {
        console.warn(`[portfolio] No valid price for ${symbol}, defaulting to 0`);
        assetObjects.push({
          symbol,
          quantity: Number(qty),
          currentPrice: 0,
          marketValue: 0,
          priceChangePercent: 0,
        });
        continue;
      }

      const marketValue = Number(qty) * tick.lastPrice;
      assetValue += marketValue;

      assetObjects.push({
        symbol,
        quantity: Number(qty),
        currentPrice: tick.lastPrice,
        marketValue,
        priceChangePercent: tick.priceChangePercent,
      });
    }

    const cash = Number(user.cash || 0);
    const totalValue = cash + assetValue;

    

    // ✅ Fix equity history mapping
    const equityHistory = (user.equityHistory || []).map((e, i) => {
      
      return {
        at: e.at,
        total: Number(e.total),
      };
    });

    
    return new Response(JSON.stringify({
      cash,
      assetValue,
      totalValue,
      assets: assetObjects,
      equityHistory,
    }), { status: 200 });

  } catch (err) {
    console.error("❌ Error in /api/user/portfolio GET", err);
    return new Response(String(err.message || err), { status: 500 });
  }
}
