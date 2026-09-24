import { useRef, useEffect, useState } from 'react';
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
          <linearGradient id={`spark-${color?.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
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
          fill={`url(#spark-${color?.replace('#', '')})`}
        />
      </svg>
    </div>
  );
}

/* ── Animated Counter ── */
function AnimatedValue({ value, className }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevRef = useRef(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (value !== prevRef.current) {
      prevRef.current = value;
      setDisplayValue(value);
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 400);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span className={`${className} ${flash ? 'value-flash' : ''}`}>
      {displayValue}
    </span>
  );
}

/* ── Individual Metric Card ── */
function MetricCard({ label, value, change, icon, accentColor, sparkData }) {
  const changeClass = change >= 0 ? 'up' : 'down';

  return (
    <div className="metric-card glass-card">
      <div className="metric-card-inner">
        <div className="metric-icon-wrap" style={{ color: accentColor || 'var(--accent-cyan)' }}>
          {icon}
        </div>
        <div className="metric-content">
          <div className="metric-label">{label}</div>
          <AnimatedValue value={value} className="metric-value" />
          {change !== undefined && (
            <div className={`metric-change ${changeClass}`}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                {change >= 0
                  ? <path d="M5 1L9 7H1L5 1Z" />
                  : <path d="M5 9L1 3H9L5 9Z" />
                }
              </svg>
              {formatPercent(Math.abs(change))}
            </div>
          )}
        </div>
      </div>
      <Sparkline data={sparkData} color={accentColor || '#22d3ee'} />
    </div>
  );
}

/* ── Skeleton Loading State ── */
function MetricsBarSkeleton() {
  return (
    <div className="metrics-bar">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="metric-card glass-card">
          <div className="metric-card-inner">
            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <div className="metric-content">
              <div className="skeleton" style={{ width: '60%', height: 10, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: '80%', height: 20, marginBottom: 4 }} />
              <div className="skeleton" style={{ width: '40%', height: 10 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MetricsBar({ metrics }) {
  // Sparkline data simulation (rolling history)
  const sparkRefs = useRef({
    volume: Array.from({ length: 20 }, (_, i) => 50 + Math.sin(i * 0.5) * 20 + Math.random() * 10),
    trades: Array.from({ length: 20 }, (_, i) => 40 + Math.cos(i * 0.3) * 15 + Math.random() * 8),
    pools: Array.from({ length: 20 }, (_, i) => 60 + Math.sin(i * 0.4) * 10 + Math.random() * 5),
    launches: Array.from({ length: 20 }, (_, i) => 30 + Math.sin(i * 0.6) * 20 + Math.random() * 12),
    wallets: Array.from({ length: 20 }, (_, i) => 45 + Math.cos(i * 0.5) * 18 + Math.random() * 8),
    buy: Array.from({ length: 20 }, (_, i) => 50 + Math.sin(i * 0.3) * 5 + Math.random() * 3),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      Object.keys(sparkRefs.current).forEach(key => {
        const arr = sparkRefs.current[key];
        const last = arr[arr.length - 1];
        arr.push(last + (Math.random() - 0.48) * 5);
        if (arr.length > 20) arr.shift();
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <MetricsBarSkeleton />;

  return (
    <div className="metrics-bar">
      <MetricCard
        label="24h Volume"
        value={formatUsd(metrics.totalVolume24h, true)}
        change={metrics.volumeChange}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20V10M18 20V4M6 20v-4"/>
          </svg>
        }
        accentColor="var(--accent-cyan)"
        sparkData={sparkRefs.current.volume}
      />
      <MetricCard
        label="Total Trades"
        value={formatNumber(metrics.totalTrades24h, true)}
        change={metrics.tradesChange}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        }
        accentColor="var(--accent-purple)"
        sparkData={sparkRefs.current.trades}
      />
      <MetricCard
        label="Active Pools"
        value={formatNumber(metrics.activePools)}
        change={metrics.poolsChange}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/>
          </svg>
        }
        accentColor="var(--accent-blue)"
        sparkData={sparkRefs.current.pools}
      />
      <MetricCard
        label="New Launches"
        value={formatNumber(metrics.newLaunches)}
        change={12.5}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
          </svg>
        }
        accentColor="var(--accent-gold)"
        sparkData={sparkRefs.current.launches}
      />
      <MetricCard
        label="Unique Wallets"
        value={formatNumber(metrics.uniqueWallets, true)}
        change={metrics.walletsChange}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 7V4a1 1 0 00-1-1H5a2 2 0 00-2 2v14a2 2 0 002 2h13a1 1 0 001-1v-3"/><path d="M16 7h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a2 2 0 01-2-2V9a2 2 0 012-2z"/>
          </svg>
        }
        accentColor="var(--accent-green)"
        sparkData={sparkRefs.current.wallets}
      />
      <MetricCard
        label="Buy / Sell"
        value={`${(metrics.buyRatio * 100).toFixed(0)}% / ${((1 - metrics.buyRatio) * 100).toFixed(0)}%`}
        change={metrics.buyRatio > 0.5 ? 1.5 : -1.5}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v18M3 12h18"/>
          </svg>
        }
        accentColor={metrics.buyRatio > 0.5 ? 'var(--accent-green)' : 'var(--accent-red)'}
        sparkData={sparkRefs.current.buy}
      />
    </div>
  );
}
