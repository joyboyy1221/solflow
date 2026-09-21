import { useRef, useEffect, useCallback } from 'react';
import { formatUsd, formatNumber, formatPercent } from '../../utils/formatters.js';

/* ── Sparkline SVG ── */
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;

  const width = 120;
  const height = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="metric-sparkline">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#spark-${color})`}
        />
      </svg>
    </div>
  );
}

/* ── Individual Metric Card ── */
function MetricCard({ label, value, change, icon, accentColor }) {
  const changeClass = change >= 0 ? 'up' : 'down';
  const valueClass = change >= 0 ? 'positive' : change < 0 ? 'negative' : '';
  const prevValueRef = useRef(value);
  const popRef = useRef(false);

  // Detect value change for pop animation
  if (prevValueRef.current !== value) {
    prevValueRef.current = value;
    popRef.current = true;
    setTimeout(() => { popRef.current = false; }, 350);
  }

  // Generate simple sparkline data (random walk seeded by label)
  const sparkData = useRef(
    Array.from({ length: 20 }, (_, i) => 50 + Math.sin(i * 0.5) * 20 + Math.random() * 10)
  );

  // Update sparkline with new "ticks"
  useEffect(() => {
    const interval = setInterval(() => {
      const last = sparkData.current[sparkData.current.length - 1];
      sparkData.current = [
        ...sparkData.current.slice(1),
        last + (Math.random() - 0.48) * 5
      ];
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="metric-card glass-card">
      <div className="metric-label">
        {icon && <span style={{ color: accentColor || 'var(--accent-cyan)' }}>{icon}</span>}
        {label}
      </div>
      <div className={`metric-value ${valueClass}`}>
        {value}
      </div>
      {change !== undefined && (
        <div className={`metric-change ${changeClass}`}>
          {change >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(change))}
        </div>
      )}
      <Sparkline data={sparkData.current} color={accentColor || '#22d3ee'} />
    </div>
  );
}

/* ── Skeleton Loading State ── */
function MetricsBarSkeleton() {
  return (
    <div className="metrics-bar">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="metric-card glass-card">
          <div className="skeleton" style={{ width: '60%', height: 12, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: '80%', height: 22, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: '40%', height: 12 }} />
        </div>
      ))}
    </div>
  );
}

export default function MetricsBar({ metrics }) {
  if (!metrics) return <MetricsBarSkeleton />;

  return (
    <div className="metrics-bar">
      <MetricCard
        label="24h Volume"
        value={formatUsd(metrics.totalVolume24h, true)}
        change={2.4}
        icon="📊"
        accentColor="var(--accent-cyan)"
      />
      <MetricCard
        label="Total Trades"
        value={formatNumber(metrics.totalTrades24h, true)}
        change={5.1}
        icon="⚡"
        accentColor="var(--accent-purple)"
      />
      <MetricCard
        label="Active Pools"
        value={formatNumber(metrics.activePools)}
        change={1.2}
        icon="🏊"
        accentColor="var(--accent-blue)"
      />
      <MetricCard
        label="New Launches"
        value={formatNumber(metrics.newLaunches)}
        change={12.5}
        icon="🚀"
        accentColor="var(--accent-gold)"
      />
      <MetricCard
        label="Buy / Sell"
        value={`${(metrics.buyRatio * 100).toFixed(0)}% / ${((1 - metrics.buyRatio) * 100).toFixed(0)}%`}
        change={metrics.buyRatio > 0.5 ? 1.5 : -1.5}
        icon="⚖️"
        accentColor={metrics.buyRatio > 0.5 ? 'var(--accent-green)' : 'var(--accent-red)'}
      />
    </div>
  );
}
