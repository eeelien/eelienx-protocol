// Portfolio tracking - stores initial capital and snapshots over time

export interface Holding {
  symbol: string;
  amount: number;
}

export interface PortfolioSnapshot {
  timestamp: number; // unix ms
  valueMXN: number;
}

export interface PortfolioState {
  initialCapitalMXN: number;
  initialDate: number; // unix ms
  holdings: Holding[];
  snapshots: PortfolioSnapshot[];
}

const KEY = 'eelienx_portfolio';

export function loadPortfolio(): PortfolioState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePortfolio(state: PortfolioState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function initPortfolio(initialCapitalMXN: number, holdings: Holding[]): PortfolioState {
  const state: PortfolioState = {
    initialCapitalMXN,
    initialDate: Date.now(),
    holdings,
    snapshots: [{ timestamp: Date.now(), valueMXN: initialCapitalMXN }],
  };
  savePortfolio(state);
  return state;
}

export function addSnapshot(state: PortfolioState, valueMXN: number): PortfolioState {
  // Keep max 100 snapshots, one per 30-min interval
  const now = Date.now();
  const last = state.snapshots[state.snapshots.length - 1];

  // Only add if >5 min since last snapshot
  if (last && now - last.timestamp < 5 * 60 * 1000) {
    return state;
  }

  const newSnapshots = [...state.snapshots, { timestamp: now, valueMXN }];
  // Keep last 100
  const trimmed = newSnapshots.slice(-100);
  const updated = { ...state, snapshots: trimmed };
  savePortfolio(updated);
  return updated;
}

export function computeCurrentValue(
  holdings: Holding[],
  prices: Record<string, { price: number }>,
  mxnRate = 17.5
): number {
  return holdings.reduce((total, h) => {
    if (h.symbol === 'MXN') return total + h.amount;
    const price = prices[h.symbol]?.price || 0;
    return total + h.amount * price * mxnRate;
  }, 0);
}

export function getPnL(state: PortfolioState, currentValueMXN: number) {
  const diff = currentValueMXN - state.initialCapitalMXN;
  const pct = (diff / state.initialCapitalMXN) * 100;
  return { diffMXN: diff, pct };
}

// Parse user message like "tengo 0.05 BTC, 1.2 ETH y $5000 MXN"
export function parseHoldings(text: string): Holding[] {
  const holdings: Holding[] = [];

  // Match patterns like "0.05 BTC", "1.2 ETH", "$5000 MXN", "5000 MXN"
  const pattern = /(\d+\.?\d*)\s*(BTC|ETH|USDT|USDC|SOL|XRP|BNB|MXN)/gi;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    holdings.push({ symbol: match[2].toUpperCase(), amount: parseFloat(match[1]) });
  }

  return holdings;
}

// Parse capital like "empecé con $10,000" or "capital inicial 15000"
export function parseCapital(text: string): number | null {
  const pattern = /\$?([\d,]+(?:\.\d+)?)\s*(MXN|pesos)?/i;
  const match = text.match(pattern);
  if (!match) return null;
  return parseFloat(match[1].replace(/,/g, ''));
}
