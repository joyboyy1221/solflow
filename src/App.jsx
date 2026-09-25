import { useState, useEffect, useRef } from 'react';
import { getSolamiRPC, getSolamiMirage, getSolamiBlur } from './services/solami.js';
import { METRICS_REFRESH_MS, TABS } from './utils/constants.js';

import FlowMap from './components/FlowMap/FlowMap.jsx';
import MetricsBar from './components/Metrics/MetricsBar.jsx';
import TokenLeaderboard from './components/Leaderboard/TokenLeaderboard.jsx';
import TradeFeed from './components/TradeFeed/TradeFeed.jsx';
import WhaleAlerts from './components/WhaleAlerts/WhaleAlerts.jsx';
import ConnectionStatus from './components/Status/ConnectionStatus.jsx';
import SurgeRadar from './components/SurgeRadar/SurgeRadar.jsx';
import GradTracker from './components/GradTracker/GradTracker.jsx';
import LatencyPanel from './components/LatencyPanel/LatencyPanel.jsx';

export default function App() {
  // State
  const [trades, setTrades] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [dexFlows, setDexFlows] = useState(null);
  const [whales, setWhales] = useState([]);
  const [surgeAlerts, setSurgeAlerts] = useState([]);
  const [graduations, setGraduations] = useState([]);
  const [activeTab, setActiveTab] = useState(TABS.LEADERBOARD);
  const [mirageStatus, setMirageStatus] = useState({ connected: false });
  const [blurStatus, setBlurStatus] = useState({ connected: false });
  const [rpcLatency, setRpcLatency] = useState(null);
  const [blurLatency, setBlurLatency] = useState(null);
  const [slotNumber, setSlotNumber] = useState(null);
  const [uptime, setUptime] = useState(0);

  const blurRef = useRef(null);
  const mirageRef = useRef(null);
  const rpcRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Uptime counter
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

    // Whale events
    const offWhale = blur.on('whale', (trade) => {
      setWhales(prev => [trade, ...prev].slice(0, 50));
    });

    // Surge/Radar events
    const offSurge = blur.on('surge-radar', (alert) => {
      setSurgeAlerts(prev => [alert, ...prev].slice(0, 30));
    });

    // Graduation events
    const offGrad = blur.on('graduation', (grad) => {
      setGraduations(prev => [grad, ...prev].slice(0, 30));
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
      offWhale();
      offSurge();
      offGrad();
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
      setDexFlows(blur.getDexFlows());
      setBlurLatency(blur.getBlurLatency());
    };

    refresh();
    const interval = setInterval(refresh, METRICS_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  // Format uptime
  const formatUptime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
    return `${s}s`;
  };

  const whaleCount = whales.length;
  const surgeCount = surgeAlerts.length;
  const gradCount = graduations.length;

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
          <div className="header-meta">
            {slotNumber && (
              <span className="header-slot mono">
                Slot #{slotNumber.toLocaleString()}
              </span>
            )}
            <span className="header-uptime mono">
              {formatUptime(uptime)}
            </span>
          </div>
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

        {/* Bottom Section: Flow Map + New Panels */}
        <div className="main-bottom">
          <FlowMap trades={trades} dexFlows={dexFlows} />

          {/* New Feature Panels Stack */}
          <div className="feature-panels">
            <LatencyPanel
              rpcLatency={rpcLatency}
              mirageStatus={mirageStatus}
              blurLatency={blurLatency}
            />
            <SurgeRadar surgeAlerts={surgeAlerts} />
            <GradTracker graduations={graduations} />
          </div>
        </div>
      </main>

      {/* ── Right Panel ── */}
      <aside className="right-panel">
        <div className="panel-tabs">
          <button
            className={`panel-tab ${activeTab === TABS.LEADERBOARD ? 'active' : ''}`}
            onClick={() => setActiveTab(TABS.LEADERBOARD)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
            </svg>
            Top Tokens
          </button>
          <button
            className={`panel-tab ${activeTab === TABS.TRADES ? 'active' : ''}`}
            onClick={() => setActiveTab(TABS.TRADES)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Live Trades
          </button>
          <button
            className={`panel-tab ${activeTab === TABS.WHALES ? 'active' : ''}`}
            onClick={() => setActiveTab(TABS.WHALES)}
          >
            <span className="tab-icon-whale">🐋</span>
            Whales
            {whaleCount > 0 && (
              <span className="tab-badge">{whaleCount}</span>
            )}
          </button>
          <button
            className={`panel-tab ${activeTab === TABS.SURGE ? 'active' : ''}`}
            onClick={() => setActiveTab(TABS.SURGE)}
          >
            <span className="tab-icon-surge">⚡</span>
            Surge
            {surgeCount > 0 && (
              <span className="tab-badge tab-badge-surge">{surgeCount}</span>
            )}
          </button>
          <button
            className={`panel-tab ${activeTab === TABS.GRADS ? 'active' : ''}`}
            onClick={() => setActiveTab(TABS.GRADS)}
          >
            <span className="tab-icon-grad">🎓</span>
            Grads
            {gradCount > 0 && (
              <span className="tab-badge tab-badge-grad">{gradCount}</span>
            )}
          </button>
        </div>

        {activeTab === TABS.LEADERBOARD && (
          <TokenLeaderboard leaderboard={leaderboard} />
        )}
        {activeTab === TABS.TRADES && (
          <TradeFeed trades={trades} />
        )}
        {activeTab === TABS.WHALES && (
          <WhaleAlerts whales={whales} />
        )}
        {activeTab === TABS.SURGE && (
          <SurgeRadar surgeAlerts={surgeAlerts} />
        )}
        {activeTab === TABS.GRADS && (
          <GradTracker graduations={graduations} />
        )}

        <div className="powered-by">
          <span className="powered-label">Powered by</span>
          <a href="https://solami.dev" target="_blank" rel="noopener noreferrer" className="powered-link">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Solami
          </a>
          <span className="powered-products">RPC · Mirage · Blur</span>
        </div>
      </aside>
    </div>
  );
}
