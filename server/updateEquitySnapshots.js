import connectDB from "../src/lib/db.js";
import User from "../src/lib/models/User.js";
import { fetchCurrentPrice } from "../src/lib/fetchPrice.js";

export async function updateEquitySnapshots() {
  await connectDB();

  console.log("[equityTracker] Fetching all users...");
  const users = await User.find({});
  console.log(`[equityTracker] Found ${users.length} users`);

  for (const user of users) {
    try {
     

      // ✅ normalize positions
      const positions =
        user.positions instanceof Map
          ? Object.fromEntries(user.positions)
          : user.positions?.toObject?.() || user.positions || {};

      

      let positionsValue = 0;

      for (const [symbol, qty] of Object.entries(positions)) {
        

        if (!qty || qty <= 0) {
          
          continue;
        }

        try {
          const tick = await fetchCurrentPrice(symbol);
          

          if (tick && tick.lastPrice) {
            const value = Number(qty) * Number(tick.lastPrice);
            positionsValue += value;
           
          } else {
            console.warn(`[equityTracker] No price for ${symbol}, using 0`);
          }
        } catch (err) {
          console.error(`[equityTracker] Error fetching ${symbol}:`, err);
        }
      }

      const total = Number(user.cash || 0) + positionsValue;
      

      const lastEntry = user.equityHistory?.[user.equityHistory.length - 1];
      

      if (!lastEntry || lastEntry.total !== total) {
        user.equityHistory.push({ at: new Date(), total });

        if (user.equityHistory.length > 500) {
          user.equityHistory = user.equityHistory.slice(-500);
        }

        await user.save();
        
      } else {
       
      }
    } catch (err) {
      console.error(`[equityTracker] ❌ Failed snapshot for user ${user.email}`, err);
    }
  }
}
