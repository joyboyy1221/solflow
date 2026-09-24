import { formatUsd, relativeTime } from '../../utils/formatters.js';
import { MAX_WHALE_ALERTS } from '../../utils/constants.js';
import TokenIcon from '../TokenIcon/TokenIcon.jsx';

function WhaleCard({ trade, index }) {
  const isBuy = trade.side === 'buy';
  const sizeFormatted = formatUsd(trade.sizeUsd, true);
  const timeStr = relativeTime(trade.timestamp);
  const delay = Math.min(index * 60, 300);

  return (
    <div
      className={`whale-card ${isBuy ? 'whale-buy' : 'whale-sell'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="whale-card-header">
        <div className="whale-emoji">🐋</div>
        <div className="whale-card-side">
          <span className={`whale-side-badge ${trade.side}`}>
            {trade.side.toUpperCase()}
          </span>
        </div>
        <div className="whale-card-time">{timeStr}</div>
      </div>
      <div className="whale-card-body">
        <div className="whale-card-token">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TokenIcon symbol={trade.token} size={28} />
            <div>
              <span className="whale-token-symbol">{trade.token}</span>
              <span className="whale-token-name">{trade.tokenName}</span>
            </div>
          </div>
        </div>
        <div className="whale-card-amount">{sizeFormatted}</div>
      </div>
      <div className="whale-card-footer">
        <span className="whale-dex-tag">{trade.dex}</span>
        <span className="whale-tokens">
          {trade.sizeTokens >= 1000
            ? `${(trade.sizeTokens / 1000).toFixed(1)}K`
            : trade.sizeTokens.toFixed(2)
          } {trade.token}
        </span>
      </div>
    </div>
  );
}

export default function WhaleAlerts({ whales }) {
  if (!whales || whales.length === 0) {
    return (
      <div className="whale-alerts">
        <div className="whale-empty">
          <div className="whale-empty-icon">🐋</div>
          <div className="whale-empty-text">Waiting for whale trades...</div>
          <div className="whale-empty-sub">Trades over $10K will appear here</div>
        </div>
      </div>
    );
  }

  const display = whales.slice(0, MAX_WHALE_ALERTS);

  return (
    <div className="whale-alerts">
      <div className="whale-alerts-header">
        <span className="whale-alerts-count">
          <span className="whale-count-num">{whales.length}</span>
          <span className="whale-count-label">whale trades</span>
        </span>
      </div>
      <div className="whale-alerts-list">
        {display.map((trade, i) => (
          <WhaleCard key={trade.id} trade={trade} index={i} />
        ))}
      </div>
    </div>
  );
}
