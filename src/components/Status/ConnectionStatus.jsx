export default function ConnectionStatus({ mirageStatus, blurStatus, rpcLatency }) {
  const mirageConnected = mirageStatus?.connected;
  const blurConnected = blurStatus?.connected;

  return (
    <div className="header-right">
      <div className="connection-status">
        <div className={`status-dot ${blurConnected ? 'connected' : 'connecting'}`} />
        <span>Blur {blurConnected ? 'Live' : '...'}</span>
      </div>
      <div className="connection-status">
        <div className={`status-dot ${mirageConnected ? 'connected' : 'connecting'}`} />
        <span>Mirage {mirageConnected ? 'Live' : '...'}</span>
      </div>
      {rpcLatency !== null && (
        <div className="connection-status">
          <div className={`status-dot ${rpcLatency < 100 ? 'connected' : rpcLatency < 500 ? 'connecting' : 'disconnected'}`} />
          <span className="mono" style={{ fontSize: '0.68rem', color: rpcLatency < 100 ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
            {rpcLatency}ms
          </span>
          <span>RPC</span>
        </div>
      )}
    </div>
  );
}
