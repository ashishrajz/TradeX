// src/lib/tradeAnalysis.js
// Small trade-analysis helper used to produce a compact summary for the LLM.
// Non-destructive: safe, fast, approximate FIFO matching for PnL.

export function summarizeTrades(trades = [], limit = 200) {
    // keep recent N
    const t = Array.isArray(trades) ? trades.slice(-limit) : [];
  
    const stats = {
      totalTrades: t.length,
      buys: 0,
      sells: 0,
      symbols: {}, // per-symbol summary
      totalPnL: 0,
      winningTrades: 0,
      losingTrades: 0,
    };
  
    // We'll do a simple FIFO inventory map per symbol for matching sells to buys
    const buyQueues = {}; // symbol -> array of { qty, price }
  
    for (const tr of t) {
      const symbol = tr.symbol || "UNKNOWN";
      const side = (tr.side || "").toUpperCase();
      const qty = Number(tr.quantity || tr.qty || 0);
      const price = Number(tr.price || 0);
  
      if (!stats.symbols[symbol]) {
        stats.symbols[symbol] = { trades: 0, buys: 0, sells: 0, pnl: 0, volume: 0 };
        buyQueues[symbol] = [];
      }
  
      stats.symbols[symbol].trades += 1;
      stats.symbols[symbol].volume += qty * price;
  
      if (side === "BUY") {
        stats.buys += 1;
        stats.symbols[symbol].buys += 1;
        // push into buy queue
        buyQueues[symbol].push({ qty, price });
      } else if (side === "SELL") {
        stats.sells += 1;
        stats.symbols[symbol].sells += 1;
  
        // Match sell qty against buy queue FIFO
        let remaining = qty;
        let realizedPnLForThisSell = 0;
        while (remaining > 0 && buyQueues[symbol] && buyQueues[symbol].length) {
          const buy = buyQueues[symbol][0];
          const take = Math.min(remaining, buy.qty);
          const pnl = (price - buy.price) * take;
          realizedPnLForThisSell += pnl;
          buy.qty -= take;
          remaining -= take;
          if (buy.qty <= 0) buyQueues[symbol].shift();
        }
        // If there were no buys to match, we treat it as 0-cost basis (rare) - we'll ignore
        // accumulate stats
        stats.symbols[symbol].pnl += realizedPnLForThisSell;
        stats.totalPnL += realizedPnLForThisSell;
        if (realizedPnLForThisSell > 0) stats.winningTrades += 1;
        else if (realizedPnLForThisSell < 0) stats.losingTrades += 1;
      } else {
        // unknown side: treat as neutral
      }
    }
  
    // compute some derived metrics
    stats.winRate = stats.totalTrades ? (stats.winningTrades / stats.totalTrades) : 0;
    stats.avgTradePnL = stats.totalTrades ? stats.totalPnL / stats.totalTrades : 0;
  
    // compute exposures by symbol (unrealized) from remaining buyQueues
    stats.exposures = {};
    for (const symbol of Object.keys(buyQueues)) {
      const remainingBuys = buyQueues[symbol];
      const remainingQty = remainingBuys.reduce((s, b) => s + (b.qty || 0), 0);
      stats.exposures[symbol] = remainingQty;
    }
  
    // Sort top symbols by trade count/volume
    stats.topByVolume = Object.entries(stats.symbols)
      .map(([symbol, meta]) => ({ symbol, volume: meta.volume, pnl: meta.pnl }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 6);
  
    return stats;
  }
  