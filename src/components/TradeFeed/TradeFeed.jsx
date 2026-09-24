import { useRef, useEffect } from 'react';
import { formatUsd, relativeTime } from '../../utils/formatters.js';
import { MAX_TRADE_FEED_ITEMS, WHALE_THRESHOLD_USD, LARGE_TRADE_THRESHOLD_USD } from '../../utils/constants.js';
import TokenIcon from '../TokenIcon/TokenIcon.jsx';

function TradeRow({ trade }) {
  const isBuy = trade.side === 'buy';
  const isWhale = trade.sizeUsd >= WHALE_THRESHOLD_USD;
  const isLarge = trade.sizeUsd >= LARGE_TRADE_THRESHOLD_USD;
  const timeStr = relativeTime(trade.timestamp);

  let rowClass = 'trade-row';
  if (isWhale) rowClass += ' whale';
  else if (isLarge) rowClass += ' large';
  rowClass += isBuy ? ' buy' : ' sell';

  // Clickable if we have a transaction signature
  const hasTx = !!trade.txSignature;
  const txUrl = hasTx ? `https://solscan.io/tx/${trade.txSignature}` : null;

  const handleClick = () => {
    if (txUrl) {
      window.open(txUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={`${rowClass} ${hasTx ? 'clickable' : ''}`}
      onClick={handleClick}
      title={hasTx ? `View on Solscan: ${trade.txSignature.slice(0, 12)}...` : `${trade.token} ${trade.side}`}
    >
      <div className="trade-side-bar" />
      <div className="trade-main">
        <div className="trade-token-info">
          <TokenIcon symbol={trade.token} size={22} />
          <div className="trade-token-col">
            <span className="trade-token-name">
              {trade.token}
              {isWhale && <span className="whale-icon">🐋</span>}
            </span>
            <span className="trade-dex-name">{trade.dex}</span>
          </div>
        </div>
        <div className="trade-data">
          <span className="trade-amount">{formatUsd(trade.sizeUsd, true)}</span>
          <span className="trade-time">{timeStr}</span>
        </div>
        <div className={`trade-side-pill ${trade.side}`}>
          {trade.side}
          {hasTx && (
            <svg className="tx-link-icon" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TradeFeed({ trades }) {
  const feedRef = useRef(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [trades?.length]);

  if (!trades || trades.length === 0) {
    return (
      <div className="trade-feed">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Waiting for trades...</span>
        </div>
      </div>
    );
  }

  const displayTrades = trades.slice(0, MAX_TRADE_FEED_ITEMS);

  return (
    <div className="trade-feed" ref={feedRef}>
      <div className="trade-feed-header">
        <span>Token</span>
        <span style={{ textAlign: 'right' }}>Size</span>
        <span style={{ textAlign: 'right' }}>Side</span>
      </div>
      {displayTrades.map(trade => (
        <TradeRow key={trade.id} trade={trade} />
      ))}
    </div>
  );
}
