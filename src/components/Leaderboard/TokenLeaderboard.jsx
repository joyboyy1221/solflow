import { useRef, useMemo } from 'react';
import { formatUsd, formatPrice, formatPercent } from '../../utils/formatters.js';
import { getTokenColor, MAX_LEADERBOARD_ITEMS } from '../../utils/constants.js';
import TokenIcon from '../TokenIcon/TokenIcon.jsx';

/* ── Mini Sparkline for token rows ── */
function TokenSparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const w = 48, h = 18;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const d = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="token-sparkline-svg">
      <path d={d} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Volume Bar (background fill) ── */
function VolumeBar({ ratio, color }) {
  return (
    <div className="volume-bar-bg">
      <div
        className="volume-bar-fill"
        style={{
          width: `${Math.min(ratio * 100, 100)}%`,
          background: `linear-gradient(90deg, ${color}08, ${color}18)`,
        }}
      />
    </div>
  );
}

function TokenRow({ token, maxVolume, onClick }) {
  const changeDir = token.change24h >= 0 ? 'up' : 'down';
  const color = getTokenColor(token.symbol);
  const volRatio = maxVolume > 0 ? token.volume24h / maxVolume : 0;
  const isHot = Math.abs(token.change24h) > 10;

  return (
    <div className="token-row" title={`${token.name} — ${formatPrice(token.price)}`} onClick={() => onClick?.(token)} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <VolumeBar ratio={volRatio} color={color} />
      <div className="token-row-inner">
        <div className={`token-rank ${token.rank <= 3 ? 'top-3' : ''}`}>
          {token.rank <= 3 ? (
            <span className="rank-medal">{['🥇', '🥈', '🥉'][token.rank - 1]}</span>
          ) : (
            token.rank
          )}
        </div>
        <div className="token-info">
          <TokenIcon symbol={token.symbol} size={26} />
          <div className="token-name-col">
            <div className="token-name">
              {token.symbol}
              {isHot && <span className="hot-badge">🔥</span>}
            </div>
            <div className="token-symbol">{formatPrice(token.price)}</div>
          </div>
        </div>
        <div className="token-sparkline-cell">
          <TokenSparkline data={token.priceHistory} color={changeDir === 'up' ? '#4ade80' : '#f87171'} />
        </div>
        <div className="token-volume">
          {formatUsd(token.volume24h, true)}
        </div>
        <div className="token-change-cell">
          <span className={`token-price-change ${changeDir}`}>
            {changeDir === 'up' ? '↑' : '↓'} {Math.abs(token.change24h).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TokenLeaderboard({ leaderboard, onTokenClick }) {
  const maxVolume = useMemo(() => {
    if (!leaderboard || leaderboard.length === 0) return 0;
    return Math.max(...leaderboard.map(t => t.volume24h));
  }, [leaderboard]);

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="leaderboard">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading tokens...</span>
        </div>
      </div>
    );
  }

  const items = leaderboard.slice(0, MAX_LEADERBOARD_ITEMS);

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <span>#</span>
        <span>Token</span>
        <span className="hide-mobile">Chart</span>
        <span style={{ textAlign: 'right' }}>Volume</span>
        <span style={{ textAlign: 'right' }}>24h</span>
      </div>
      {items.map(token => (
        <TokenRow key={token.symbol} token={token} maxVolume={maxVolume} onClick={onTokenClick} />
      ))}
    </div>
  );
}
