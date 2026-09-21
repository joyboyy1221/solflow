import { formatUsd, formatPrice, formatNumber, formatPercent } from '../../utils/formatters.js';
import { getTokenColor, MAX_LEADERBOARD_ITEMS } from '../../utils/constants.js';

function TokenRow({ token }) {
  const changeDir = token.change24h >= 0 ? 'up' : 'down';

  return (
    <div className="token-row" title={`${token.name} — ${formatPrice(token.price)}`}>
      <div className={`token-rank ${token.rank <= 3 ? 'top-3' : ''}`}>
        {token.rank}
      </div>
      <div className="token-info">
        <div
          className="token-avatar"
          style={{
            background: `linear-gradient(135deg, ${getTokenColor(token.symbol)}20, ${getTokenColor(token.symbol)}40)`,
            color: getTokenColor(token.symbol),
          }}
        >
          {token.symbol.slice(0, 2)}
        </div>
        <div>
          <div className="token-name">{token.symbol}</div>
          <div className="token-symbol">{formatPrice(token.price)}</div>
        </div>
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
  );
}

export default function TokenLeaderboard({ leaderboard }) {
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
        <span style={{ textAlign: 'right' }}>Volume</span>
        <span style={{ textAlign: 'right' }}>24h</span>
      </div>
      {items.map(token => (
        <TokenRow key={token.symbol} token={token} />
      ))}
    </div>
  );
}
