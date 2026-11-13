export default function ConnectionStatus({ mirageStatus, blurStatus, rpcLatency, rpcDown }) {
  const mirageUnavailable = mirageStatus?.unavailable;
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
        <div
          className={`conn-pill ${mirageConnected ? 'conn-live' : mirageUnavailable ? 'conn-error' : 'conn-connecting'}`}
          title={mirageUnavailable ? 'Mirage needs VITE_SOLAMI_API_KEY' : undefined}
        >
          <div className={`status-dot ${mirageConnected ? 'connected' : mirageUnavailable ? 'disconnected' : 'connecting'}`} />
          <span className="conn-label">Mirage</span>
          <span className="conn-state">{mirageConnected ? 'Live' : mirageUnavailable ? 'Off' : '...'}</span>
        </div>
        {rpcLatency === null && rpcDown && (
          <div className="conn-pill conn-error" title="Solami RPC request failed">
            <div className="status-dot disconnected" />
            <span className="conn-label">RPC</span>
            <span className="conn-state">Off</span>
          </div>
        )}
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
