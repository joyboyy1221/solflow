import { useState, useEffect, useMemo } from 'react';
import TokenIcon from '../TokenIcon/TokenIcon.jsx';
import { formatUsd, formatPrice, formatPercent, formatCompactNumber } from '../../utils/formatters.js';
import { getTokenColor } from '../../utils/constants.js';

/* ── Price Chart (larger sparkline) ── */
function PriceChart({ data, isUp }) {
  if (!data || data.length < 2) return <div className="dd-chart-empty">No chart data</div>;
  const w = 320, h = 100;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return { x, y };
  });

  const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = lineD + ` L${w},${h} L0,${h} Z`;
  const color = isUp ? '#4ade80' : '#f87171';

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="dd-chart-svg">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGrad)" />
      <path d={lineD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Current price dot */}
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill={color} />
    </svg>
  );
}

/* ── Buy/Sell Pressure Bar ── */
function PressureBar({ buyPressure }) {
  const buyPct = Math.round(buyPressure * 100);
  const sellPct = 100 - buyPct;
  return (
    <div className="dd-pressure">
      <div className="dd-pressure-labels">
        <span className="dd-pressure-buy">Buy {buyPct}%</span>
        <span className="dd-pressure-sell">Sell {sellPct}%</span>
      </div>
      <div className="dd-pressure-bar">
        <div className="dd-pressure-fill-buy" style={{ width: `${buyPct}%` }} />
      </div>
    </div>
  );
}

/* ── Recent Trades List ── */
function RecentTrades({ trades }) {
  if (!trades || trades.length === 0) {
    return <div className="dd-no-trades">No recent trades</div>;
  }
  return (
    <div className="dd-trades-list">
      {trades.slice(0, 8).map((t) => {
        const timeDiff = Math.floor((Date.now() - t.timestamp) / 1000);
        const timeStr = timeDiff < 60 ? `${timeDiff}s` : `${Math.floor(timeDiff / 60)}m`;
        return (
          <div key={t.id} className={`dd-trade-row ${t.side}`}>
            <span className={`dd-trade-side ${t.side}`}>{t.side === 'buy' ? '▲' : '▼'}</span>
            <span className="dd-trade-size">${formatCompactNumber(t.sizeUsd)}</span>
            <span className="dd-trade-dex">{t.dex}</span>
            <span className="dd-trade-time">{timeStr} ago</span>
            {t.isWhale && <span className="dd-trade-whale">🐋</span>}
          </div>
        );
      })}
    </div>
  );
}

export default function TokenDrillDown({ token, trades = [], onClose, onShare }) {
  const [tab, setTab] = useState('overview');

  // Filter trades for this token
  const tokenTrades = useMemo(() =>
    trades.filter(t => t.token === token?.symbol).slice(0, 20),
    [trades, token?.symbol]
  );

  // Whale trades for this token
  const whaleTrades = useMemo(() =>
    tokenTrades.filter(t => t.isWhale),
    [tokenTrades]
  );

  if (!token) return null;

  const isUp = token.change24h >= 0;
  const color = getTokenColor(token.symbol);

  return (
    <div className="dd-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dd-modal">
        {/* Header */}
        <div className="dd-header">
          <div className="dd-header-left">
            <TokenIcon symbol={token.symbol} size={40} />
            <div className="dd-header-info">
              <div className="dd-header-symbol">
                {token.symbol}
                <span className={`dd-header-change ${isUp ? 'up' : 'down'}`}>
                  {isUp ? '↑' : '↓'} {Math.abs(token.change24h).toFixed(2)}%
                </span>
              </div>
              <div className="dd-header-name">{token.name}</div>
            </div>
          </div>
          <div className="dd-header-right">
            <div className="dd-header-price">{formatPrice(token.price)}</div>
            <div className="dd-header-actions">
              {onShare && (
                <button className="dd-btn dd-btn-share" onClick={() => onShare(token)}>
                  📤 Share
                </button>
              )}
              <button className="dd-btn dd-btn-close" onClick={onClose}>✕</button>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="dd-chart-wrap">
          <PriceChart data={token.priceHistory} isUp={isUp} />
        </div>

        {/* Stats Grid */}
        <div className="dd-stats-grid">
          <div className="dd-stat">
            <div className="dd-stat-label">24h Volume</div>
            <div className="dd-stat-value">${formatCompactNumber(token.volume24h)}</div>
          </div>
          <div className="dd-stat">
            <div className="dd-stat-label">24h Trades</div>
            <div className="dd-stat-value">{token.trades24h?.toLocaleString() || '0'}</div>
          </div>
          <div className="dd-stat">
            <div className="dd-stat-label">Whale Trades</div>
            <div className="dd-stat-value">🐋 {whaleTrades.length}</div>
          </div>
          <div className="dd-stat">
            <div className="dd-stat-label">Price</div>
            <div className="dd-stat-value">{formatPrice(token.price)}</div>
          </div>
        </div>

        {/* Buy/Sell Pressure */}
        <PressureBar buyPressure={token.buyPressure || 0.5} />

        {/* Tabs */}
        <div className="dd-tabs">
          <button className={`dd-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
            Recent Trades
          </button>
          <button className={`dd-tab ${tab === 'whales' ? 'active' : ''}`} onClick={() => setTab('whales')}>
            🐋 Whale Activity ({whaleTrades.length})
          </button>
        </div>

        {tab === 'overview' && <RecentTrades trades={tokenTrades} />}
        {tab === 'whales' && <RecentTrades trades={whaleTrades} />}

        {/* Mint address if available */}
        {token.mint && (
          <div className="dd-mint">
            <span className="dd-mint-label">Mint:</span>
            <span className="dd-mint-addr">{token.mint.slice(0, 6)}...{token.mint.slice(-4)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
