import { useState, useEffect, useRef } from 'react';
import TokenIcon from '../TokenIcon/TokenIcon.jsx';
import { formatCompactNumber } from '../../utils/formatters.js';

export default function GradTracker({ graduations = [] }) {
  const [flash, setFlash] = useState(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (graduations.length > prevCountRef.current && graduations.length > 0) {
      setFlash(graduations[0]?.id);
      const t = setTimeout(() => setFlash(null), 2500);
      return () => clearTimeout(t);
    }
    prevCountRef.current = graduations.length;
  }, [graduations.length]);

  if (graduations.length === 0) {
    return (
      <div className="grad-tracker-panel">
        <div className="grad-header">
          <div className="grad-title">
            <span className="grad-icon">🎓</span>
            <span>Graduation Tracker</span>
          </div>
          <span className="grad-subtitle">Pump.fun → DEX migrations</span>
        </div>
        <div className="grad-empty">
          <div className="grad-empty-icon">🚀</div>
          <div className="grad-empty-text">Watching for graduations...</div>
          <div className="grad-empty-sub">Tokens completing bonding curves</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grad-tracker-panel">
      <div className="grad-header">
        <div className="grad-title">
          <span className="grad-icon">🎓</span>
          <span>Graduation Tracker</span>
          <span className="grad-badge-count">{graduations.length}</span>
        </div>
        <span className="grad-subtitle">Live bonding curve completions</span>
      </div>

      <div className="grad-list">
        {graduations.slice(0, 6).map((grad) => {
          const isLaunch = grad.type === 'launch';
          const timeDiff = Math.floor((Date.now() - grad.timestamp) / 1000);
          const timeStr = timeDiff < 60 ? `${timeDiff}s ago` : `${Math.floor(timeDiff / 60)}m ago`;
          const progressPct = Math.min(100, Math.max(0, grad.progress || 0));

          return (
            <div
              key={grad.id}
              className={`grad-item ${isLaunch ? 'grad-launch' : 'grad-complete'} ${flash === grad.id ? 'grad-flash' : ''}`}
            >
              <div className="grad-item-top">
                <div className="grad-item-left">
                  <TokenIcon symbol={grad.symbol} size={24} />
                  <div className="grad-item-info">
                    <span className="grad-item-symbol">{grad.symbol}</span>
                    <span className="grad-item-name">{grad.tokenName}</span>
                  </div>
                </div>
                <div className="grad-item-right">
                  <span className={`grad-status ${isLaunch ? 'status-new' : 'status-grad'}`}>
                    {isLaunch ? '🆕 NEW' : '🎓 GRADUATED'}
                  </span>
                  <span className="grad-item-time">{timeStr}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="grad-progress-wrap">
                <div className="grad-progress-bar">
                  <div
                    className={`grad-progress-fill ${progressPct >= 100 ? 'fill-complete' : 'fill-active'}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="grad-progress-label">{progressPct}%</span>
              </div>

              <div className="grad-item-details">
                <span className="grad-detail">
                  <span className="grad-detail-label">From</span>
                  <span className="grad-detail-value">{grad.fromDex}</span>
                </span>
                <span className="grad-detail-arrow">→</span>
                <span className="grad-detail">
                  <span className="grad-detail-label">To</span>
                  <span className="grad-detail-value">{grad.toDex}</span>
                </span>
                {grad.mcap > 0 && (
                  <span className="grad-detail">
                    <span className="grad-detail-label">MCap</span>
                    <span className="grad-detail-value">${formatCompactNumber(grad.mcap)}</span>
                  </span>
                )}
                {grad.liquidity > 0 && (
                  <span className="grad-detail">
                    <span className="grad-detail-label">LP</span>
                    <span className="grad-detail-value">${formatCompactNumber(grad.liquidity)}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
