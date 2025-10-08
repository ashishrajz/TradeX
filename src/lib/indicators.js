// src/lib/indicators.js

// Basic Moving Averages
export function sma(values, period) {
    if (values.length < period) return null;
    const slice = values.slice(-period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
  }
  
  export function ema(values, period) {
    if (values.length < period) return null;
    const k = 2 / (period + 1);
    return values.reduce((prev, curr, i) => {
      if (i === 0) return curr;
      return curr * k + prev * (1 - k);
    });
  }
  
  // --- RSI ---
  export function rsi(candles, period = 14) {
    if (candles.length < period + 1) return null;
    const closes = candles.map(c => c.close);
    let gains = 0, losses = 0;
  
    for (let i = closes.length - period; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }
  
    const rs = gains / (losses || 1);
    return 100 - 100 / (1 + rs);
  }
  
  // --- Rule Evaluator ---
  export function evaluateRule(rule, candles) {
    const closes = candles.map(c => c.close);
    const last = candles[candles.length - 1];
    let lhs = null;
  
    switch (rule.indicator) {
      case "PRICE":
        lhs = last[rule.params.field || "close"];
        break;
      case "SMA":
        lhs = sma(closes, rule.params.period || 20);
        break;
      case "EMA":
        lhs = ema(closes, rule.params.period || 20);
        break;
      case "RSI":
        lhs = rsi(candles, rule.params.period || 14);
        break;
      default:
        lhs = null;
    }
  
    const rhs = rule.value;
  
    switch (rule.condition) {
      case "<": return lhs < rhs;
      case ">": return lhs > rhs;
      case "<=": return lhs <= rhs;
      case ">=": return lhs >= rhs;
      case "==": return lhs == rhs;
      default: return false;
    }
  }
  