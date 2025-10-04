import { updateEquitySnapshots } from "./updateEquitySnapshots.js";

async function run() {
  console.log("[equityTracker] Starting equity tracker...");

  // Run immediately
  await updateEquitySnapshots();

  // Run every 1 min
  setInterval(async () => {
    console.log("\n[equityTracker] Interval tick --- running snapshot");
    await updateEquitySnapshots();
  }, 60_000);
}

run().catch((err) => {
  console.error("[equityTracker] Fatal error", err);
  process.exit(1);
});
