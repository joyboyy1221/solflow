import { useState, useEffect } from 'react';
import { getTokenLogo, markLogoFailed } from '../../utils/tokenLogos.js';
import { getTokenColor } from '../../utils/constants.js';

/**
 * Token avatar with real logo image and colored letter fallback.
 * Re-checks for logos periodically (for when Jupiter data loads async).
 */
export default function TokenIcon({ symbol, size = 26, className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [logoUrl, setLogoUrl] = useState(() => getTokenLogo(symbol));
  const color = getTokenColor(symbol || '');

  // Re-check for logo when symbol changes or periodically (Jupiter loads async)
  useEffect(() => {
    setImgFailed(false);
    const url = getTokenLogo(symbol);
    setLogoUrl(url);

    // If no logo yet, retry after Jupiter list loads
    if (!url) {
      const timer = setTimeout(() => {
        const newUrl = getTokenLogo(symbol);
        if (newUrl) setLogoUrl(newUrl);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [symbol]);

  const wrapStyle = {
    width: size,
    height: size,
    minWidth: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  };

  // Show logo image if available
  if (logoUrl && !imgFailed) {
    return (
      <div className={`token-icon ${className}`} style={wrapStyle}>
        <img
          src={logoUrl}
          alt={symbol}
          width={size}
          height={size}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          onError={() => {
            setImgFailed(true);
            markLogoFailed(symbol);
          }}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback: colored letter avatar
  return (
    <div
      className={`token-icon ${className}`}
      style={{
        ...wrapStyle,
        background: `linear-gradient(135deg, ${color}20, ${color}40)`,
        color: color,
        border: `1px solid ${color}30`,
        fontSize: Math.max(8, size * 0.38),
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
      }}
    >
      {(symbol || '??').slice(0, 2)}
    </div>
  );
}
