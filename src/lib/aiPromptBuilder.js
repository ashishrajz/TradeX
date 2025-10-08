// src/lib/aiPromptBuilder.js
// Build a clean structured prompt for the LLM containing:
// - a short summary of the user's account (cash, positions)
// - a short trade summary (from tradeAnalysis)
// - last N trades (compact)
// - the user's question

export function buildAIPrompt({ userSummary = {}, analysis = {}, recentTrades = [], userQuestion = "", intent = "" }) {
    // userSummary: { cash, assetValue, totalValue, positions: {symbol: qty} }
    const lines = [];
  
    lines.push("You are an expert trading coach. You will analyze the user's portfolio and trade history and provide actionable, concise feedback in plain English. Use bullet points when appropriate.");
    lines.push("");
    lines.push("=== QUICK USER SUMMARY ===");
    if (userSummary) {
      lines.push(`Cash: $${(userSummary.cash || 0).toLocaleString()}`);
      lines.push(`Portfolio Value (assets): $${(userSummary.assetValue || 0).toLocaleString()}`);
      lines.push(`Total Account Value: $${(userSummary.totalValue || 0).toLocaleString()}`);
      if (userSummary.positions && Object.keys(userSummary.positions).length) {
        const posLines = Object.entries(userSummary.positions).map(([s, q]) => `  - ${s}: ${q}`);
        lines.push("Open Positions:");
        lines.push(...posLines);
      } else {
        lines.push("Open Positions: none");
      }
    }
    lines.push("");
  
    lines.push("=== AUTO ANALYSIS SUMMARY ===");
    if (analysis) {
      lines.push(`Total trades analyzed: ${analysis.totalTrades || 0}`);
      lines.push(`Buys: ${analysis.buys || 0}, Sells: ${analysis.sells || 0}`);
      lines.push(`Total realized PnL (approx): $${(analysis.totalPnL || 0).toFixed(2)}`);
      lines.push(`Win rate (approx): ${((analysis.winRate || 0) * 100).toFixed(1)}%`);
      if (analysis.topByVolume && analysis.topByVolume.length) {
        lines.push("Top traded symbols (by volume):");
        analysis.topByVolume.forEach((t) => {
          lines.push(`  - ${t.symbol}: $${(t.volume || 0).toLocaleString()} (pnl: $${(t.pnl || 0).toFixed(2)})`);
        });
      }
      if (analysis.exposures && Object.keys(analysis.exposures).length) {
        const exposures = Object.entries(analysis.exposures).map(([s, q]) => `  - ${s}: ${q}`);
        lines.push("Unrealized exposures (remaining buys):");
        lines.push(...exposures);
      }
    }
    lines.push("");
  
    if (recentTrades && recentTrades.length) {
      lines.push("=== RECENT TRADES (latest first) ===");
      recentTrades.slice(-12).reverse().forEach((tr) => {
        const time = new Date(tr.date || tr.at).toLocaleString();
        lines.push(`- ${tr.side} ${tr.quantity || tr.qty} ${tr.symbol} @ $${Number(tr.price).toFixed(2)} (${time})`);
      });
      lines.push("");
    }
  
    if (intent) {
      lines.push(`INTENT: ${intent}`);
      lines.push("");
    }
  
    lines.push("USER QUESTION:");
    lines.push(userQuestion || "Please provide a concise analysis of the user's trading behavior and suggestions to improve risk management, entries/exits, and diversification.");
  
    // Guidance for output format for easier parsing on the frontend:
    lines.push("");
    lines.push("OUTPUT FORMAT GUIDELINES: Provide a short summary paragraph (1-3 sentences), then a bullet list of 5 suggested actions (each 6-12 words), then 2 quick statistics lines (Total PnL, Win-rate). If asked for scenario simulation or benchmarking, include a short labeled section.");
  
    return lines.join("\n");
  }
  