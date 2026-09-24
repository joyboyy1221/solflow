export default function ConnectionStatus({ mirageStatus, blurStatus, rpcLatency }) {
  const mirageConnected = mirageStatus?.connected;
  const blurConnected = blurStatus?.connected;
  const blurLive = blurStatus?.live;

  return (
    <div className="header-right">
      <div className="connection-group">
        <div className={`conn-pill ${blurConnected ? (blurLive ? 'conn-live' : 'conn-sim') : 'conn-connecting'}`}>
          <div className={`status-dot ${blurConnected ? 'connected' : 'connecting'}`} />
          <span className="conn-label">Blur</span>
          <span className="conn-state">
            {blurConnected ? (blurLive ? 'Live' : 'Sim') : '...'}
          </span>
        </div>
        <div className={`conn-pill ${mirageConnected ? 'conn-live' : 'conn-connecting'}`}>
          <div className={`status-dot ${mirageConnected ? 'connected' : 'connecting'}`} />
          <span className="conn-label">Mirage</span>
          <span className="conn-state">{mirageConnected ? 'Live' : '...'}</span>
        </div>
        {rpcLatency !== null && (
          <div className={`conn-pill ${rpcLatency < 100 ? 'conn-live' : rpcLatency < 500 ? 'conn-connecting' : 'conn-error'}`}>
            <div className={`status-dot ${rpcLatency < 100 ? 'connected' : rpcLatency < 500 ? 'connecting' : 'disconnected'}`} />
            <span className="conn-label">RPC</span>
            <span className="conn-latency mono">{rpcLatency}ms</span>
          </div>
        )}
      </div>
      <a
        href="https://solami.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="solami-brand-link"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        Solami
      </a>
    </div>
  );
}
