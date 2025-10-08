import { updateEquitySnapshots } from "./updateEquitySnapshots.js";

async function run() {
  

  // Run immediately
  await updateEquitySnapshots();

  // Run every 1 min
  setInterval(async () => {
    
    await updateEquitySnapshots();
  }, 60_000);
}

run().catch((err) => {
  console.error("[equityTracker] Fatal error", err);
  process.exit(1);
});
