import connectDB from "../src/lib/db.js";
import User from "../src/lib/models/User.js";
import { fetchCurrentPrice } from "../src/lib/fetchPrice.js";

export async function updateEquitySnapshots() {
  await connectDB();

  
  const users = await User.find({});
  

  for (const user of users) {
    try {
      
      const positions =
        user.positions instanceof Map
          ? Object.fromEntries(user.positions)
          : user.positions?.toObject?.() || user.positions || {};

      let positionsValue = 0;
      let missingPrices = 0;
      let totalSymbols = Object.keys(positions).length;

      for (const [symbol, qty] of Object.entries(positions)) {
        if (!qty || qty <= 0) continue;

        let tick = null;

        try {
          tick = await fetchCurrentPrice(symbol);

          // retry once if failed
          if (!tick || !tick.lastPrice) {
            console.warn(`[equityTracker] ⚠️ Missing price for ${symbol}, retrying...`);
            await new Promise(r => setTimeout(r, 300)); // short pause
            tick = await fetchCurrentPrice(symbol);
          }

          if (tick && tick.lastPrice) {
            const value = Number(qty) * Number(tick.lastPrice);
            positionsValue += value;
          } else {
            missingPrices++;
            console.warn(`[equityTracker] ❌ No valid price for ${symbol}`);
          }
        } catch (err) {
          missingPrices++;
          console.error(`[equityTracker] Error fetching ${symbol}:`, err.message || err);
        }
      }

      
      const failRatio = totalSymbols > 0 ? missingPrices / totalSymbols : 0;
      if (failRatio > 0.4) {
        console.warn(
          `[equityTracker] ⚠️ Skipping snapshot for ${user.email} (${Math.round(
            failRatio * 100
          )}% symbols missing)`
        );
        continue; // skip saving bad data
      }

      const total = Number(user.cash || 0) + positionsValue;
      const lastEntry = user.equityHistory?.[user.equityHistory.length - 1];

      
      if (total <= 0 && positionsValue > 0) {
        console.warn(`[equityTracker] ⚠️ Abnormal total=0 for ${user.email}, keeping last value`);
        continue;
      }

      
      if (!lastEntry || Math.abs(lastEntry.total - total) > 0.001 * total) {
        user.equityHistory.push({ at: new Date(), total });

        if (user.equityHistory.length > 500)
          user.equityHistory = user.equityHistory.slice(-500);

        await user.save();
        
      } else {
        
      }
    } catch (err) {
      console.error(`[equityTracker] ❌ Failed snapshot for user ${user.email}`, err);
    }
  }
}
