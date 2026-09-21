import { useRef, useEffect, useState } from 'react';
import { formatTime, formatUsd } from '../../utils/formatters.js';
import { MAX_TRADE_FEED_ITEMS, WHALE_THRESHOLD_USD } from '../../utils/constants.js';

function TradeRow({ trade }) {
  const sideClass = trade.side;
  const isWhale = trade.sizeUsd >= WHALE_THRESHOLD_USD;
  const rowClass = `trade-row ${sideClass} ${isWhale ? 'whale' : ''}`;

  return (
    <div className={rowClass}>
      <div className="trade-time">{formatTime(trade.timestamp)}</div>
      <div className="trade-token">
        {trade.token}
        <span className="text-muted" style={{ fontSize: '0.6rem', marginLeft: 4 }}>
          {trade.dex}
        </span>
        {isWhale && <span style={{ marginLeft: 4, fontSize: '0.65rem' }}>🐋</span>}
      </div>
      <div className="trade-amount">{formatUsd(trade.sizeUsd, true)}</div>
      <div className={`trade-side ${sideClass}`}>
        {trade.side}
      </div>
    </div>
  );
}

export default function TradeFeed({ trades }) {
  const feedRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to top for newest trades
  useEffect(() => {
    if (autoScroll && feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [trades, autoScroll]);

  const handleScroll = () => {
    if (feedRef.current) {
      setAutoScroll(feedRef.current.scrollTop < 10);
    }
  };

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
    <div className="trade-feed" ref={feedRef} onScroll={handleScroll}>
      <div className="trade-feed-header">
        <span>Time</span>
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
