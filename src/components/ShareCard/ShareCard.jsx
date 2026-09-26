import { useRef, useCallback } from 'react';
import TokenIcon from '../TokenIcon/TokenIcon.jsx';
import { formatPrice, formatCompactNumber } from '../../utils/formatters.js';
import { getTokenColor } from '../../utils/constants.js';

/**
 * Shareable Token Card — renders a visually rich card
 * that can be screenshot/shared on social media
 */
export default function ShareCard({ token, onClose }) {
  const cardRef = useRef(null);

  if (!token) return null;

  const isUp = token.change24h >= 0;
  const color = getTokenColor(token.symbol);

  // Mini price chart in the card
  const chartData = token.priceHistory || [];
  const w = 200, h = 50;
  const max = Math.max(...chartData, 1);
  const min = Math.min(...chartData, 0);
  const range = max - min || 1;
  const lineD = chartData.map((v, i) => {
    const x = (i / Math.max(1, chartData.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');

  const handleCopyLink = useCallback(() => {
    const text = `🔥 ${token.symbol} — ${formatPrice(token.price)} (${isUp ? '↑' : '↓'}${Math.abs(token.change24h).toFixed(2)}%)\n📊 24h Vol: $${formatCompactNumber(token.volume24h)}\n⚡ Trades: ${token.trades24h?.toLocaleString() || '0'}\n\nTracked on SolFlow — powered by @SolamiDev\n#Solana #DeFi`;
    navigator.clipboard?.writeText(text).then(() => {
      alert('Copied to clipboard! 📋');
    }).catch(() => {
      // Fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      alert('Copied to clipboard! 📋');
    });
  }, [token]);

  const handleTweet = useCallback(() => {
    const text = encodeURIComponent(
      `🔥 $${token.symbol} — ${formatPrice(token.price)} (${isUp ? '↑' : '↓'}${Math.abs(token.change24h).toFixed(2)}%)\n📊 Vol: $${formatCompactNumber(token.volume24h)}\n\nTracked on SolFlow ⚡ powered by @SolamiDev #Solana`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  }, [token]);

  return (
    <div className="share-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="share-modal">
        <div className="share-card" ref={cardRef}>
          {/* Card Background Gradient */}
          <div className="share-card-bg" style={{
            background: `linear-gradient(135deg, ${color}15 0%, rgba(6,10,19,0.95) 40%, rgba(6,10,19,0.98) 100%)`,
          }} />

          {/* Card Content */}
          <div className="share-card-content">
            <div className="share-card-header">
              <div className="share-card-token">
                <TokenIcon symbol={token.symbol} size={48} />
                <div>
                  <div className="share-card-symbol">{token.symbol}</div>
                  <div className="share-card-name">{token.name}</div>
                </div>
              </div>
              <div className="share-card-price-section">
                <div className="share-card-price">{formatPrice(token.price)}</div>
                <div className={`share-card-change ${isUp ? 'up' : 'down'}`}>
                  {isUp ? '▲' : '▼'} {Math.abs(token.change24h).toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Mini Chart */}
            {chartData.length > 1 && (
              <div className="share-card-chart">
                <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="shareGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isUp ? '#4ade80' : '#f87171'} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={isUp ? '#4ade80' : '#f87171'} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={lineD + ` L${w},${h} L0,${h} Z`} fill="url(#shareGrad)" />
                  <path d={lineD} fill="none" stroke={isUp ? '#4ade80' : '#f87171'} strokeWidth="2" />
                </svg>
              </div>
            )}

            {/* Stats */}
            <div className="share-card-stats">
              <div className="share-stat">
                <span className="share-stat-label">24h Volume</span>
                <span className="share-stat-value">${formatCompactNumber(token.volume24h)}</span>
              </div>
              <div className="share-stat">
                <span className="share-stat-label">Trades</span>
                <span className="share-stat-value">{token.trades24h?.toLocaleString() || '0'}</span>
              </div>
              <div className="share-stat">
                <span className="share-stat-label">Buy Pressure</span>
                <span className="share-stat-value">{Math.round((token.buyPressure || 0.5) * 100)}%</span>
              </div>
            </div>

            {/* Footer */}
            <div className="share-card-footer">
              <div className="share-card-brand">
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" stroke="#22d3ee" strokeWidth="1.5" fill="none" opacity="0.7" />
                  <path d="M10 20 C12 12, 16 8, 22 12 C18 16, 14 20, 10 20Z" fill="#22d3ee" opacity="0.6" />
                </svg>
                <span>SolFlow</span>
              </div>
              <span className="share-card-powered">Powered by Solami</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="share-actions">
          <button className="share-action-btn share-tweet" onClick={handleTweet}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Tweet
          </button>
          <button className="share-action-btn share-copy" onClick={handleCopyLink}>
            📋 Copy Text
          </button>
          <button className="share-action-btn share-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
