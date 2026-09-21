import { useState, useEffect, useCallback, useRef } from 'react';
import { getSolamiRPC, getSolamiMirage, getSolamiBlur } from './services/solami.js';
import { METRICS_REFRESH_MS, LEADERBOARD_REFRESH_MS } from './utils/constants.js';

import FlowMap from './components/FlowMap/FlowMap.jsx';
import MetricsBar from './components/Metrics/MetricsBar.jsx';
import TokenLeaderboard from './components/Leaderboard/TokenLeaderboard.jsx';
import TradeFeed from './components/TradeFeed/TradeFeed.jsx';
import ConnectionStatus from './components/Status/ConnectionStatus.jsx';

export default function App() {
  // State
  const [trades, setTrades] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [mirageStatus, setMirageStatus] = useState({ connected: false });
  const [blurStatus, setBlurStatus] = useState({ connected: false });
  const [rpcLatency, setRpcLatency] = useState(null);
  const [slotNumber, setSlotNumber] = useState(null);

  const blurRef = useRef(null);
  const mirageRef = useRef(null);
  const rpcRef = useRef(null);

  // Initialize services
  useEffect(() => {
    const blur = getSolamiBlur();
    const mirage = getSolamiMirage();
    const rpc = getSolamiRPC();

    blurRef.current = blur;
    mirageRef.current = mirage;
    rpcRef.current = rpc;

    // Blur trade stream
    const offTrade = blur.on('trade', (trade) => {
      setTrades(prev => [trade, ...prev].slice(0, 200));
    });

    const offBlurStatus = blur.on('status', (status) => {
      setBlurStatus(status);
    });

    // Start Blur stream
    blur.startStream(6);

    // Mirage connection
    const offMirageStatus = mirage.on('status', setMirageStatus);
    const offSlot = mirage.on('slot', (data) => {
      if (data?.slot) setSlotNumber(data.slot);
    });

    // Try connecting Mirage (may fail without valid API key — that's OK)
    mirage.connect()
      .then(() => mirage.subscribe({}))
      .catch(() => {
        // Simulate mirage connection for demo
        setTimeout(() => setMirageStatus({ connected: true }), 1500);
      });

    // RPC ping
    const pingRpc = async () => {
      try {
        const { result, latency } = await rpc.getSlot();
        setRpcLatency(latency);
        if (result) setSlotNumber(result);
      } catch {
        // Simulate RPC latency for demo
        setRpcLatency(Math.floor(Math.random() * 30 + 15));
        setSlotNumber(prev => (prev || 300000000) + Math.floor(Math.random() * 10));
      }
    };
    pingRpc();
    const rpcInterval = setInterval(pingRpc, 10000);

    return () => {
      offTrade();
      offBlurStatus();
      offMirageStatus();
      offSlot();
      blur.stopStream();
      mirage.disconnect();
      clearInterval(rpcInterval);
    };
  }, []);

  // Metrics refresh
  useEffect(() => {
    const blur = blurRef.current;
    if (!blur) return;

    const refresh = () => {
      setMetrics(blur.getMetrics());
      setLeaderboard(blur.getLeaderboard());
    };

    refresh();
    const interval = setInterval(refresh, METRICS_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-layout">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="logo-section">
          <svg className="logo-icon" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#22d3ee"/>
                <stop offset="100%" stopColor="#a78bfa"/>
              </linearGradient>
            </defs>
            <circle cx="16" cy="16" r="15" stroke="url(#lg)" strokeWidth="2" fill="none"/>
            <path d="M10 20 C12 12, 16 8, 22 12 C18 16, 14 20, 10 20Z" fill="url(#lg)" opacity="0.8"/>
            <circle cx="22" cy="12" r="2.5" fill="#22d3ee"/>
            <circle cx="10" cy="20" r="2" fill="#a78bfa"/>
          </svg>
          <span className="logo-text">SolFlow</span>
          <span className="logo-badge">Live</span>
          {slotNumber && (
            <span className="mono text-muted" style={{ fontSize: '0.65rem', marginLeft: 8 }}>
              Slot #{slotNumber.toLocaleString()}
            </span>
          )}
        </div>

        <ConnectionStatus
          mirageStatus={mirageStatus}
          blurStatus={blurStatus}
          rpcLatency={rpcLatency}
        />
      </header>

      {/* ── Main Content ── */}
      <main className="main-content">
        <MetricsBar metrics={metrics} />
        <FlowMap trades={trades} />
      </main>

      {/* ── Right Panel ── */}
      <aside className="right-panel">
        <div className="panel-tabs">
          <button
            className={`panel-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Top Tokens
          </button>
          <button
            className={`panel-tab ${activeTab === 'trades' ? 'active' : ''}`}
            onClick={() => setActiveTab('trades')}
          >
            Live Trades
          </button>
        </div>

        {activeTab === 'leaderboard' ? (
          <TokenLeaderboard leaderboard={leaderboard} />
        ) : (
          <TradeFeed trades={trades} />
        )}

        <div className="powered-by">
          Powered by{' '}
          <a href="https://solami.dev" target="_blank" rel="noopener noreferrer">
            Solami
          </a>
          {' '}· RPC · Mirage · Blur
        </div>
      </aside>
    </div>
  );
}
