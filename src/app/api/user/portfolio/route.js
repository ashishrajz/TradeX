import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

// Helper: fetch live ticker price
async function fetchPrice(symbol) {
  try {
    // Call Binance directly for live price
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error("Failed fetching ticker");
    const data = await res.json();

    return parseFloat(data.price) || 0;
  } catch (err) {
    console.error(`❌ Failed fetching price for ${symbol}:`, err.message);
    return 0;
  }
}


export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user) return new Response("User not found", { status: 404 });

    const cash = user.cash || 0;
    let assetValue = 0;

    // Convert positions map to array
    const assets = await Promise.all(
      Object.entries(user.positions || {}).map(async ([symbol, qty]) => {
        const price = await fetchPrice(symbol);
        const value = qty * price;
        assetValue += value;
        return { symbol, quantity: qty, currentPrice: price, value };
      })
    );

    // Net total portfolio value = cash + asset value
    const totalValue = cash + assetValue;

    return new Response(
      JSON.stringify({
        cash,
        assetValue,
        totalValue,
        assets,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error in /api/user/portfolio GET", err);
    return new Response(String(err.message || err), { status: 500 });
  }
}
