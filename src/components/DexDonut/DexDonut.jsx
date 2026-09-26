import { useMemo } from 'react';

const DEX_COLORS = {
  'Jupiter': '#4ade80',
  'Raydium': '#a78bfa',
  'Orca': '#22d3ee',
  'Meteora': '#fbbf24',
  'Pump.fun': '#f87171',
  'Phoenix': '#60a5fa',
  'Lifinity': '#f472b6',
};

function formatVol(v) {
  if (!v || v <= 0) return '$0';
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

export default function DexDonut({ dexFlows }) {
  const data = useMemo(() => {
    if (!dexFlows) return [];
    const entries = Object.entries(dexFlows)
      .map(([name, info]) => ({
        name,
        volume: info?.volume || 0,
        trades: info?.trades || 0,
        buyVolume: info?.buyVolume || 0,
        sellVolume: info?.sellVolume || 0,
        color: DEX_COLORS[name] || '#94a3b8',
      }))
      .filter(d => d.volume > 0)
      .sort((a, b) => b.volume - a.volume);
    return entries;
  }, [dexFlows]);

  const total = data.reduce((s, d) => s + d.volume, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="dex-donut-panel">
        <div className="dex-donut-title">
          <span className="dex-donut-icon">📊</span>
          <span>DEX Volume Split</span>
        </div>
        <div className="dex-donut-empty">Loading DEX data...</div>
      </div>
    );
  }

  // SVG donut calculations
  const cx = 70, cy = 70, r = 52, strokeW = 18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const arcs = data.map(d => {
    const pct = d.volume / total;
    const dashLen = pct * circumference;
    const gap = circumference - dashLen;
    const arc = {
      ...d,
      pct,
      dasharray: `${dashLen} ${gap}`,
      dashoffset: -offset,
    };
    offset += dashLen;
    return arc;
  });

  return (
    <div className="dex-donut-panel">
      <div className="dex-donut-header">
        <div className="dex-donut-title">
          <span className="dex-donut-icon">📊</span>
          <span>DEX Volume Split</span>
        </div>
        <span className="dex-donut-total">{formatVol(total)}</span>
      </div>

      <div className="dex-donut-body">
        {/* Donut Chart */}
        <div className="dex-donut-chart">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Background ring */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth={strokeW} />
            {/* Data arcs */}
            {arcs.map((arc) => (
              <circle
                key={arc.name}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeW}
                strokeDasharray={arc.dasharray}
                strokeDashoffset={arc.dashoffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease' }}
              />
            ))}
            {/* Center text */}
            <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">
              {data.length}
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" fill="var(--text-muted)" fontSize="8">
              DEXes
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="dex-donut-legend">
          {arcs.slice(0, 7).map(d => (
            <div key={d.name} className="dex-legend-item">
              <div className="dex-legend-dot" style={{ background: d.color }} />
              <div className="dex-legend-info">
                <span className="dex-legend-name">{d.name}</span>
                <span className="dex-legend-pct">{(d.pct * 100).toFixed(1)}%</span>
              </div>
              <span className="dex-legend-vol">{formatVol(d.volume)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Buy vs Sell breakdown */}
      <div className="dex-donut-buysell">
        {data.slice(0, 4).map(d => {
          const totalDS = d.buyVolume + d.sellVolume;
          const buyPct = totalDS > 0 ? Math.round((d.buyVolume / totalDS) * 100) : 50;
          return (
            <div key={d.name} className="dex-bs-row">
              <span className="dex-bs-name" style={{ color: d.color }}>{d.name}</span>
              <div className="dex-bs-bar">
                <div className="dex-bs-buy" style={{ width: `${buyPct}%` }} />
              </div>
              <span className="dex-bs-label">{buyPct}/{100 - buyPct}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
