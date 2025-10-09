#!/bin/sh
echo "🚀 Starting TradeX (web + worker + tracker)..."

# Start the Next.js web server in background
nohup npm run start > web.log 2>&1 &

# Start background worker
nohup node server/liveWorker.js > worker.log 2>&1 &

# Start equity tracker
nohup node server/equityTracker.js > tracker.log 2>&1 &

echo "✅ All processes launched"
tail -f web.log
