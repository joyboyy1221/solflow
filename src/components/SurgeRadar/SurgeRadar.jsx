import { useState, useEffect, useRef } from 'react';
import TokenIcon from '../TokenIcon/TokenIcon.jsx';
import { formatCompactNumber, formatPercent } from '../../utils/formatters.js';

export default function SurgeRadar({ surgeAlerts = [] }) {
  const [flash, setFlash] = useState(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (surgeAlerts.length > prevCountRef.current && surgeAlerts.length > 0) {
      setFlash(surgeAlerts[0]?.id);
      const t = setTimeout(() => setFlash(null), 2000);
      return () => clearTimeout(t);
    }
    prevCountRef.current = surgeAlerts.length;
  }, [surgeAlerts.length]);

  if (surgeAlerts.length === 0) {
    return (
      <div className="surge-radar-panel">
        <div className="surge-header">
          <div className="surge-title">
            <span className="surge-icon">⚡</span>
            <span>Surge Radar</span>
            <span className="surge-badge-live">SCANNING</span>
          </div>
          <span className="surge-subtitle">Volume breakouts from Blur</span>
        </div>
        <div className="surge-empty">
          <div className="surge-empty-icon">📡</div>
          <div className="surge-empty-text">Scanning for breakouts...</div>
          <div className="surge-empty-sub">Surges fire at 3× volume / 5min window</div>
        </div>
      </div>
    );
  }

  return (
    <div className="surge-radar-panel">
      <div className="surge-header">
        <div className="surge-title">
          <span className="surge-icon">⚡</span>
          <span>Surge Radar</span>
          <span className="surge-badge-count">{surgeAlerts.length}</span>
        </div>
        <span className="surge-subtitle">Live volume breakouts</span>
      </div>

      <div className="surge-list">
        {surgeAlerts.slice(0, 8).map((alert) => {
          const isSurge = alert.type === 'surge';
          const timeDiff = Math.floor((Date.now() - alert.timestamp) / 1000);
          const timeStr = timeDiff < 60 ? `${timeDiff}s ago` : `${Math.floor(timeDiff / 60)}m ago`;

          return (
            <div
              key={alert.id}
              className={`surge-item ${isSurge ? 'surge-type' : 'radar-type'} ${flash === alert.id ? 'surge-flash' : ''}`}
            >
              <div className="surge-item-left">
                <div className="surge-item-icon-wrap">
                  <TokenIcon symbol={alert.symbol} size={28} />
                  <span className={`surge-type-badge ${isSurge ? 'badge-surge' : 'badge-radar'}`}>
                    {isSurge ? '⚡' : '📡'}
                  </span>
                </div>
                <div className="surge-item-info">
                  <div className="surge-item-symbol">
                    {alert.symbol}
                    <span className={`surge-multiplier ${isSurge ? 'mult-surge' : 'mult-radar'}`}>
                      {alert.multiplier ? `${alert.multiplier.toFixed(1)}×` : isSurge ? '3×' : '1.8×'}
                    </span>
                  </div>
                  <div className="surge-item-meta">
                    <span className="surge-item-type">{isSurge ? 'SURGE' : 'RADAR'}</span>
                    <span className="surge-item-time">{timeStr}</span>
                  </div>
                </div>
              </div>
              <div className="surge-item-right">
                <div className="surge-item-vol">${formatCompactNumber(alert.volumeUsd)}</div>
                {alert.priceChange !== 0 && (
                  <div className={`surge-item-change ${alert.priceChange >= 0 ? 'change-up' : 'change-down'}`}>
                    {alert.priceChange >= 0 ? '▲' : '▼'} {Math.abs(alert.priceChange).toFixed(1)}%
                  </div>
                )}
                {alert.trades > 0 && (
                  <div className="surge-item-trades">{alert.trades} trades</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
