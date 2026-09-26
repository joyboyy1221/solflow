import { useState } from 'react';

export default function HowItWorks({ onClose }) {
  const [activeProduct, setActiveProduct] = useState('blur');

  const products = {
    blur: {
      name: 'Blur',
      icon: '🔮',
      color: '#f97316',
      tagline: 'Real-time decoded DEX data',
      latency: '~80ms',
      description: 'Blur provides pre-decoded Solana DEX trades, token launches, and volume data. No instruction parsing needed — just subscribe and get clean trade events.',
      usedFor: ['Live trade feed', 'Token leaderboard', 'Whale detection ($10K+)', 'DEX volume tracking', 'Buy/sell pressure calculation'],
    },
    mirage: {
      name: 'Mirage',
      icon: '⚡',
      color: '#22d3ee',
      tagline: 'gRPC → WebSocket bridge',
      latency: '~100ms',
      description: 'Mirage bridges Solana\'s gRPC transaction stream to WebSocket — no gRPC toolchain required. Get raw transaction data in the browser with minimal latency.',
      usedFor: ['Real-time slot updates', 'Transaction streaming', 'Network health monitoring', 'Latency benchmarking'],
    },
    rpc: {
      name: 'RPC',
      icon: '🔗',
      color: '#a78bfa',
      tagline: 'Standard JSON-RPC 2.0',
      latency: '~400ms',
      description: 'Solami RPC provides reliable Solana JSON-RPC access with high rate limits. Used for on-demand queries and as a fallback data source.',
      usedFor: ['Slot number queries', 'Account balance lookups', 'Network health pings', 'Latency baseline comparison'],
    },
  };

  const p = products[activeProduct];

  return (
    <div className="hiw-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="hiw-modal">
        <div className="hiw-header">
          <div className="hiw-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            How SolFlow Works
          </div>
          <button className="dd-btn dd-btn-close" onClick={onClose}>✕</button>
        </div>

        {/* One API Key tagline */}
        <div className="hiw-tagline">
          <span className="hiw-tagline-key">🔑 One Solami API Key</span>
          <span className="hiw-tagline-arrow">→</span>
          <span className="hiw-tagline-paths">Three Data Paths</span>
          <span className="hiw-tagline-arrow">→</span>
          <span className="hiw-tagline-result">Complete Solana Visibility</span>
        </div>

        {/* Product selector */}
        <div className="hiw-products">
          {Object.entries(products).map(([key, prod]) => (
            <button
              key={key}
              className={`hiw-product-btn ${activeProduct === key ? 'active' : ''}`}
              style={{ '--prod-color': prod.color }}
              onClick={() => setActiveProduct(key)}
            >
              <span className="hiw-product-icon">{prod.icon}</span>
              <span className="hiw-product-name">{prod.name}</span>
              <span className="hiw-product-latency">{prod.latency}</span>
            </button>
          ))}
        </div>

        {/* Active product detail */}
        <div className="hiw-detail" style={{ borderColor: p.color + '40' }}>
          <div className="hiw-detail-header">
            <span className="hiw-detail-icon" style={{ color: p.color }}>{p.icon}</span>
            <div>
              <div className="hiw-detail-name" style={{ color: p.color }}>{p.name}</div>
              <div className="hiw-detail-tagline">{p.tagline}</div>
            </div>
          </div>
          <p className="hiw-detail-desc">{p.description}</p>
          <div className="hiw-detail-used">
            <span className="hiw-used-label">Used in SolFlow for:</span>
            <ul className="hiw-used-list">
              {p.usedFor.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Architecture summary */}
        <div className="hiw-arch">
          <div className="hiw-arch-row">
            <div className="hiw-arch-node hiw-arch-app">SolFlow Dashboard</div>
          </div>
          <div className="hiw-arch-arrows">
            <div className="hiw-arch-line" style={{ background: '#a78bfa' }}></div>
            <div className="hiw-arch-line" style={{ background: '#22d3ee' }}></div>
            <div className="hiw-arch-line" style={{ background: '#f97316' }}></div>
          </div>
          <div className="hiw-arch-row hiw-arch-services">
            <div className="hiw-arch-node" style={{ borderColor: '#a78bfa40', color: '#a78bfa' }}>🔗 RPC</div>
            <div className="hiw-arch-node" style={{ borderColor: '#22d3ee40', color: '#22d3ee' }}>⚡ Mirage</div>
            <div className="hiw-arch-node" style={{ borderColor: '#f9731640', color: '#f97316' }}>🔮 Blur</div>
          </div>
        </div>

        {/* Keyboard shortcuts */}
        <div className="hiw-shortcuts">
          <span className="hiw-shortcuts-title">⌨️ Keyboard Shortcuts</span>
          <div className="hiw-shortcut-grid">
            <kbd>1</kbd><span>Top Tokens</span>
            <kbd>2</kbd><span>Live Trades</span>
            <kbd>3</kbd><span>Whales</span>
            <kbd>Esc</kbd><span>Close Modal</span>
            <kbd>?</kbd><span>This Panel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
