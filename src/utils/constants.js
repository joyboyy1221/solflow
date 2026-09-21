/* ── Constants ── */

// Color palette for DEX nodes in the flow map
export const DEX_COLORS = {
  'Jupiter': '#4ade80',
  'Raydium': '#a78bfa',
  'Orca': '#22d3ee',
  'Meteora': '#fbbf24',
  'Pump.fun': '#f87171',
  'Phoenix': '#60a5fa',
  'Lifinity': '#f472b6',
};

// Token avatar colors (consistent per symbol)
export function getTokenColor(symbol) {
  const colors = [
    '#22d3ee', '#a78bfa', '#4ade80', '#fbbf24', '#f87171',
    '#60a5fa', '#f472b6', '#34d399', '#fb923c', '#818cf8',
  ];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Trade size thresholds
export const WHALE_THRESHOLD_USD = 10_000;
export const LARGE_TRADE_THRESHOLD_USD = 5_000;

// Refresh intervals
export const METRICS_REFRESH_MS = 2000;
export const LEADERBOARD_REFRESH_MS = 3000;
export const FLOW_REFRESH_MS = 1000;

// Max items in feed
export const MAX_TRADE_FEED_ITEMS = 100;
export const MAX_LEADERBOARD_ITEMS = 20;
