'use client';

import { PortfolioSnapshot, PortfolioState, getPnL } from '@/lib/portfolio';

interface Props {
  portfolio: PortfolioState;
  currentValueMXN: number;
}

export default function PortfolioChart({ portfolio, currentValueMXN }: Props) {
  const { snapshots, initialCapitalMXN } = portfolio;
  const { diffMXN, pct } = getPnL(portfolio, currentValueMXN);
  const isPositive = diffMXN >= 0;

  // Build chart data: add current value as the last point
  const allPoints = [
    ...snapshots,
    { timestamp: Date.now(), valueMXN: currentValueMXN },
  ];

  // Deduplicate by timestamp proximity (keep unique)
  const chartData = allPoints.filter((p, i, arr) =>
    i === 0 || p.timestamp - arr[i - 1].timestamp > 60_000
  );

  // SVG dimensions
  const W = 280;
  const H = 80;
  const PAD = 8;

  const values = chartData.map(p => p.valueMXN);
  const minVal = Math.min(...values, initialCapitalMXN) * 0.995;
  const maxVal = Math.max(...values, initialCapitalMXN) * 1.005;
  const range = maxVal - minVal || 1;

  const toX = (i: number) => PAD + (i / Math.max(chartData.length - 1, 1)) * (W - PAD * 2);
  const toY = (v: number) => H - PAD - ((v - minVal) / range) * (H - PAD * 2);

  // Build SVG path
  const points = chartData.map((p, i) => `${toX(i)},${toY(p.valueMXN)}`).join(' ');
  const polyline = `M ${chartData.map((p, i) => `${toX(i)} ${toY(p.valueMXN)}`).join(' L ')}`;

  // Fill path (area under the line)
  const fillPath = `${polyline} L ${toX(chartData.length - 1)} ${H - PAD} L ${toX(0)} ${H - PAD} Z`;

  // Initial capital baseline
  const baselineY = toY(initialCapitalMXN);

  // Gradient ids
  const gradId = `grad-${isPositive ? 'up' : 'down'}`;

  // Format date label
  const startDate = new Date(portfolio.initialDate).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short'
  });

  return (
    <div className="p-3 rounded-xl bg-black/30 border border-[var(--border)] space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-500">Capital inicial: ${initialCapitalMXN.toLocaleString()} MXN</p>
          <p className="text-base font-bold">${Math.round(currentValueMXN).toLocaleString()} MXN</p>
        </div>
        <div className={`text-right ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          <p className="text-sm font-bold">{isPositive ? '+' : ''}{pct.toFixed(2)}%</p>
          <p className="text-xs">{isPositive ? '+' : ''}{Math.round(diffMXN).toLocaleString()} MXN</p>
        </div>
      </div>

      {/* SVG Chart */}
      {chartData.length > 1 ? (
        <svg width={W} height={H} className="w-full" viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? '#00ff88' : '#ff4444'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isPositive ? '#00ff88' : '#ff4444'} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Baseline (capital inicial) */}
          <line
            x1={PAD} y1={baselineY} x2={W - PAD} y2={baselineY}
            stroke="#ffffff22"
            strokeWidth="1"
            strokeDasharray="4,4"
          />

          {/* Fill area */}
          <path d={fillPath} fill={`url(#${gradId})`} />

          {/* Line */}
          <path
            d={polyline}
            fill="none"
            stroke={isPositive ? '#00ff88' : '#ff4444'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Last point dot */}
          <circle
            cx={toX(chartData.length - 1)}
            cy={toY(currentValueMXN)}
            r="3"
            fill={isPositive ? '#00ff88' : '#ff4444'}
          />
        </svg>
      ) : (
        <div className="h-16 flex items-center justify-center text-xs text-gray-500">
          La gráfica aparece cuando haya más datos ⏳
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between text-[10px] text-gray-600">
        <span>Desde {startDate}</span>
        <span>{chartData.length} puntos de datos</span>
      </div>
    </div>
  );
}
