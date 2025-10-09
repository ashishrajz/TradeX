// server/equityTracker.js
import { updateEquitySnapshots } from "./updateEquitySnapshots.js";

async function run() {
  console.log("🚀 [equityTracker] Starting equity tracker process...");
  console.log("🕒 Running every 60 seconds...");

  // Run immediately once
  await updateEquitySnapshots();

  // Schedule recurring updates
  setInterval(async () => {
    console.log("⏱️ [equityTracker] Running scheduled update...");
    await updateEquitySnapshots();
  }, 60_000);
}

run().catch((err) => {
  console.error("[equityTracker] ❌ Fatal error:", err);
  process.exit(1);
});
