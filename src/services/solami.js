/* ═══════════════════════════════════
   Solami API Service Layer
   Handles RPC, Mirage, and Blur
   ═══════════════════════════════════ */

const API_KEY = import.meta.env.VITE_SOLAMI_API_KEY || '';

// Solami endpoint configuration
const ENDPOINTS = {
  rpc: `https://rpc.solami.fast/sol`,
  mirageWs: `wss://rpc.solami.fast/ws/sol`,
  blurRest: `https://api.solami.fast`,
  blurWs: `wss://api.solami.fast/ws`,
};

/* ── Solami RPC Client ── */
export class SolamiRPC {
  constructor(apiKey = API_KEY) {
    this.apiKey = apiKey;
    this.url = `${ENDPOINTS.rpc}?api_key=${apiKey}`;
    this.requestId = 0;
  }

  async call(method, params = []) {
    this.requestId++;
    const start = performance.now();
    try {
      const res = await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: this.requestId,
          method,
          params,
        }),
      });
      const data = await res.json();
      const latency = Math.round(performance.now() - start);
      if (data.error) throw new Error(data.error.message);
      return { result: data.result, latency };
    } catch (err) {
      console.error(`RPC ${method} failed:`, err);
      throw err;
    }
  }

  async getSlot() {
    return this.call('getSlot');
  }

  async getBalance(pubkey) {
    return this.call('getBalance', [pubkey]);
  }

  async getTokenSupply(mint) {
    return this.call('getTokenSupply', [mint]);
  }

  async getEpochInfo() {
    return this.call('getEpochInfo');
  }

  async getRecentBlockhash() {
    return this.call('getLatestBlockhash');
  }
}

/* ── Mirage WebSocket (Yellowstone data over WS) ── */
export class SolamiMirage {
  constructor(apiKey = API_KEY) {
    this.apiKey = apiKey;
    this.url = `${ENDPOINTS.mirageWs}?api_key=${apiKey}`;
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.connected = false;
    this._shouldReconnect = true;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          this._emit('status', { connected: true });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this._emit('message', data);

            // Route specific message types
            if (data.result?.slot) {
              this._emit('slot', data.result);
            }
            if (data.result?.transaction) {
              this._emit('transaction', data.result);
            }
          } catch (e) {
            // Binary or non-JSON message
          }
        };

        this.ws.onclose = () => {
          this.connected = false;
          this._emit('status', { connected: false });
          if (this._shouldReconnect) this._reconnect();
        };

        this.ws.onerror = (err) => {
          this._emit('error', err);
          if (!this.connected) reject(err);
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  subscribe(params) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'slotSubscribe',
        params: [],
      }));
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  _emit(event, data) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }

  _reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this._emit('status', { connecting: true, attempt: this.reconnectAttempts });
    setTimeout(() => this.connect().catch(() => {}), delay);
  }

  disconnect() {
    this._shouldReconnect = false;
    this.ws?.close();
  }
}

/* ── Blur Market Data (simulated with realistic data patterns) ── */

// Major Solana DEX tokens for realistic simulation
const DEX_TOKENS = [
  { symbol: 'SOL', name: 'Solana', basePrice: 145.50 },
  { symbol: 'JUP', name: 'Jupiter', basePrice: 0.82 },
  { symbol: 'RAY', name: 'Raydium', basePrice: 2.35 },
  { symbol: 'ORCA', name: 'Orca', basePrice: 0.45 },
  { symbol: 'BONK', name: 'Bonk', basePrice: 0.0000238 },
  { symbol: 'WIF', name: 'dogwifhat', basePrice: 1.85 },
  { symbol: 'PYTH', name: 'Pyth Network', basePrice: 0.38 },
  { symbol: 'JTO', name: 'Jito', basePrice: 3.12 },
  { symbol: 'RENDER', name: 'Render', basePrice: 7.45 },
  { symbol: 'HNT', name: 'Helium', basePrice: 5.20 },
  { symbol: 'TENSOR', name: 'Tensor', basePrice: 0.52 },
  { symbol: 'MNDE', name: 'Marinade', basePrice: 0.11 },
  { symbol: 'DRIFT', name: 'Drift Protocol', basePrice: 0.72 },
  { symbol: 'W', name: 'Wormhole', basePrice: 0.28 },
  { symbol: 'MEW', name: 'cat in a dogs world', basePrice: 0.0035 },
  { symbol: 'POPCAT', name: 'Popcat', basePrice: 0.68 },
  { symbol: 'KMNO', name: 'Kamino', basePrice: 0.085 },
  { symbol: 'PENGU', name: 'Pudgy Penguins', basePrice: 0.012 },
  { symbol: 'GRASS', name: 'Grass', basePrice: 1.95 },
  { symbol: 'AI16Z', name: 'ai16z', basePrice: 0.42 },
];

const DEX_NAMES = ['Jupiter', 'Raydium', 'Orca', 'Meteora', 'Pump.fun', 'Phoenix', 'Lifinity'];

// State for price simulation
const tokenState = new Map();
DEX_TOKENS.forEach(t => {
  tokenState.set(t.symbol, {
    ...t,
    price: t.basePrice,
    volume24h: Math.random() * 50000000 + 1000000,
    trades24h: Math.floor(Math.random() * 50000 + 5000),
    change24h: (Math.random() - 0.5) * 20,
    buyPressure: 0.45 + Math.random() * 0.1,
  });
});

function generateTrade() {
  const tokens = Array.from(tokenState.values());
  // Weighted random — top tokens trade more
  const weights = tokens.map((_, i) => Math.max(1, 20 - i));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;
  let tokenIdx = 0;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) { tokenIdx = i; break; }
  }

  const token = tokens[tokenIdx];
  const isBuy = Math.random() > 0.48; // Slight buy bias
  const isWhale = Math.random() < 0.03; // 3% whale trades

  // Random walk the price
  const priceChange = (Math.random() - 0.5) * 0.004 * token.price;
  token.price = Math.max(token.price * 0.5, token.price + priceChange);

  const sizeUsd = isWhale
    ? Math.random() * 200000 + 10000
    : Math.random() * 5000 + 10;

  const dex = DEX_NAMES[Math.floor(Math.random() * DEX_NAMES.length)];

  // Update state
  token.volume24h += sizeUsd;
  token.trades24h += 1;
  token.change24h += (isBuy ? 0.01 : -0.01);
  token.buyPressure = Math.max(0.1, Math.min(0.9,
    token.buyPressure + (isBuy ? 0.002 : -0.002)));

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    token: token.symbol,
    tokenName: token.name,
    side: isBuy ? 'buy' : 'sell',
    price: token.price,
    sizeUsd,
    sizeTokens: sizeUsd / token.price,
    dex,
    isWhale,
  };
}

export class SolamiBlur {
  constructor(apiKey = API_KEY) {
    this.apiKey = apiKey;
    this.listeners = new Map();
    this.streamInterval = null;
    this.connected = false;
  }

  // Start simulated real-time trade stream
  startStream(tradesPerSecond = 8) {
    this.connected = true;
    this._emit('status', { connected: true });

    const interval = 1000 / tradesPerSecond;
    this.streamInterval = setInterval(() => {
      // Generate 1-3 trades per tick for burst effect
      const count = Math.random() < 0.2 ? 3 : Math.random() < 0.4 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const trade = generateTrade();
        this._emit('trade', trade);
      }
    }, interval);
  }

  stopStream() {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
    }
    this.connected = false;
    this._emit('status', { connected: false });
  }

  // Get current token leaderboard
  getLeaderboard() {
    return Array.from(tokenState.values())
      .sort((a, b) => b.volume24h - a.volume24h)
      .map((t, i) => ({
        rank: i + 1,
        symbol: t.symbol,
        name: t.name,
        price: t.price,
        volume24h: t.volume24h,
        trades24h: t.trades24h,
        change24h: t.change24h,
        buyPressure: t.buyPressure,
      }));
  }

  // Get aggregated metrics
  getMetrics() {
    const tokens = Array.from(tokenState.values());
    const totalVolume = tokens.reduce((sum, t) => sum + t.volume24h, 0);
    const totalTrades = tokens.reduce((sum, t) => sum + t.trades24h, 0);
    const avgBuyPressure = tokens.reduce((sum, t) => sum + t.buyPressure, 0) / tokens.length;

    return {
      totalVolume24h: totalVolume,
      totalTrades24h: totalTrades,
      activeTokens: tokens.length,
      activePools: Math.floor(tokens.length * 2.5),
      buyRatio: avgBuyPressure,
      newLaunches: Math.floor(Math.random() * 5 + 15),
    };
  }

  // Get flow data (aggregated by DEX for visualization)
  getFlowData() {
    return DEX_NAMES.map(dex => ({
      name: dex,
      volume: Math.random() * 10000000 + 500000,
      trades: Math.floor(Math.random() * 5000 + 500),
      buyPressure: 0.4 + Math.random() * 0.2,
    }));
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  _emit(event, data) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

// Singleton instances
let _rpc, _mirage, _blur;

export function getSolamiRPC() {
  if (!_rpc) _rpc = new SolamiRPC();
  return _rpc;
}

export function getSolamiMirage() {
  if (!_mirage) _mirage = new SolamiMirage();
  return _mirage;
}

export function getSolamiBlur() {
  if (!_blur) _blur = new SolamiBlur();
  return _blur;
}
