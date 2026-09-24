/* ═══════════════════════════════════
   Solami API Service Layer
   Handles RPC, Mirage, and Blur
   Real data with simulation fallback
   ═══════════════════════════════════ */

import { registerTokenLogo } from '../utils/tokenLogos.js';

const API_KEY = import.meta.env.VITE_SOLAMI_API_KEY || '';
const DATA_KEY = import.meta.env.VITE_SOLAMI_DATA_KEY || API_KEY;

// Solami endpoint configuration
const ENDPOINTS = {
  rpc: `https://rpc.solami.dev/sol`,
  mirageWs: `wss://ws.solami.dev/ws/sol`,
  blurWs: `wss://ws.solami.dev/data/subscribe`,
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
      const res = await fetch('/api/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: this.requestId,
          method,
          params,
        }),
      });

      if (!res.ok) {
        if (this.apiKey) {
          const directRes = await fetch(this.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: this.requestId,
              method,
              params,
            }),
          });
          const data = await directRes.json();
          const latency = Math.round(performance.now() - start);
          if (data.error) throw new Error(data.error.message);
          return { result: data.result, latency };
        }
        throw new Error(`Server RPC proxy error: ${res.status}`);
      }

      const data = await res.json();
      const latency = Math.round(performance.now() - start);
      if (data.error) throw new Error(data.error.message);
      return { result: data.result, latency };
    } catch (err) {
      console.warn(`RPC ${method} failed:`, err.message);
      throw err;
    }
  }

  async getSlot() {
    return this.call('getSlot');
  }

  async getBalance(pubkey) {
    return this.call('getBalance', [pubkey]);
  }

  async getEpochInfo() {
    return this.call('getEpochInfo');
  }
}

/* ── Mirage WebSocket ── */
export class SolamiMirage {
  constructor(apiKey = API_KEY) {
    this.apiKey = apiKey;
    this.url = apiKey ? `${ENDPOINTS.mirageWs}?api_key=${apiKey}` : '';
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.connected = false;
    this._shouldReconnect = true;
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (!this.apiKey) {
        console.log('[SolFlow] Mirage running in server proxy mode');
        this.connected = true;
        this._emit('status', { connected: true });
        return resolve();
      }

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
            if (data.result?.slot) this._emit('slot', data.result);
          } catch (e) { /* binary/non-JSON */ }
        };

        this.ws.onclose = () => {
          this.connected = false;
          this._emit('status', { connected: false });
          // Don't spam reconnects — Mirage is optional
          if (this._shouldReconnect && this.reconnectAttempts < 2) this._reconnect();
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

  subscribe() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        jsonrpc: '2.0', id: Date.now(), method: 'slotSubscribe', params: [],
      }));
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
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
    setTimeout(() => this.connect().catch(() => { }), delay);
  }

  disconnect() {
    this._shouldReconnect = false;
    this.ws?.close();
  }
}

/* ════════════════════════════════════════════════
   Blur — Real-time DEX trade data
   Tries real WebSocket first, falls back to sim
   ════════════════════════════════════════════════ */

// Known DEX token definitions for simulation fallback
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
const DEX_WEIGHTS = { 'Jupiter': 60, 'Raydium': 15, 'Orca': 10, 'Meteora': 6, 'Pump.fun': 4, 'Phoenix': 3, 'Lifinity': 2 };

// Token & DEX state for tracking
const tokenState = new Map();
DEX_TOKENS.forEach(t => {
  tokenState.set(t.symbol, {
    ...t,
    price: t.basePrice,
    volume24h: Math.random() * 50_000_000 + 1_000_000,
    trades24h: Math.floor(Math.random() * 50_000 + 5_000),
    change24h: (Math.random() - 0.5) * 20,
    buyPressure: 0.45 + Math.random() * 0.1,
    priceHistory: Array.from({ length: 24 }, () => t.basePrice * (0.95 + Math.random() * 0.1)),
  });
});

const dexVolume = new Map();
DEX_NAMES.forEach(d => {
  dexVolume.set(d, {
    volume: Math.random() * 20_000_000 + 2_000_000,
    trades: Math.floor(Math.random() * 10_000 + 1_000),
    buyVolume: 0, sellVolume: 0,
  });
});

let previousMetrics = null;

function pickWeightedDex() {
  const total = Object.values(DEX_WEIGHTS).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [dex, w] of Object.entries(DEX_WEIGHTS)) {
    r -= w;
    if (r <= 0) return dex;
  }
  return 'Jupiter';
}

function generateSimulatedTrade() {
  const tokens = Array.from(tokenState.values());
  const weights = tokens.map((_, i) => Math.max(1, 20 - i));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  let idx = 0;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) { idx = i; break; }
  }

  const token = tokens[idx];
  const isBuy = Math.random() > 0.48;
  const isWhale = Math.random() < 0.03;

  token.price = Math.max(token.price * 0.5, token.price + (Math.random() - 0.5) * 0.004 * token.price);
  token.priceHistory.push(token.price);
  if (token.priceHistory.length > 24) token.priceHistory.shift();

  const sizeUsd = isWhale ? Math.random() * 200_000 + 10_000 : Math.random() * 5_000 + 10;
  const dex = pickWeightedDex();

  token.volume24h += sizeUsd;
  token.trades24h += 1;
  token.change24h += (isBuy ? 0.01 : -0.01);
  token.buyPressure = Math.max(0.1, Math.min(0.9, token.buyPressure + (isBuy ? 0.002 : -0.002)));

  const ds = dexVolume.get(dex);
  if (ds) {
    ds.volume += sizeUsd;
    ds.trades += 1;
    if (isBuy) ds.buyVolume += sizeUsd; else ds.sellVolume += sizeUsd;
  }

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
    source: 'simulation',
  };
}

/**
 * Safely extract a string field from an object, checking multiple possible keys
 */
function safeStr(obj, ...keys) {
  if (!obj || typeof obj !== 'object') return '';
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null) return String(v);
  }
  return '';
}

function safeNum(obj, ...keys) {
  if (!obj || typeof obj !== 'object') return 0;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null) {
      const n = parseFloat(v);
      if (!isNaN(n)) return n;
    }
  }
  return 0;
}

// DEX name normalization map
const DEX_NAME_MAP = {
  'jup': 'Jupiter', 'jupiter': 'Jupiter', 'jupiterv6': 'Jupiter', 'jupiter_v6': 'Jupiter',
  'ray': 'Raydium', 'raydium': 'Raydium', 'raydium_amm': 'Raydium', 'raydium_clmm': 'Raydium', 'raydium_cp': 'Raydium',
  'orca': 'Orca', 'whirlpool': 'Orca', 'orca_whirlpool': 'Orca', 'orca_v2': 'Orca',
  'meteora': 'Meteora', 'meteora_dlmm': 'Meteora', 'meteora_pools': 'Meteora',
  'pump': 'Pump.fun', 'pump.fun': 'Pump.fun', 'pumpfun': 'Pump.fun', 'pump_amm': 'Pump.fun',
  'phoenix': 'Phoenix', 'phoenix_v1': 'Phoenix',
  'lifinity': 'Lifinity', 'lifinity_v2': 'Lifinity',
};

function normalizeDexName(raw) {
  if (!raw) return 'Jupiter';
  const key = String(raw).toLowerCase().trim();
  return DEX_NAME_MAP[key] || (key.charAt(0).toUpperCase() + key.slice(1));
}

/**
 * Parse a real Blur WebSocket swap event into our trade format.
 * Handles multiple event formats robustly without crashing.
 */
let _debugLogCount = 0;

function parseBlurSwapEvent(event) {
  try {
    if (!event || typeof event !== 'object') return null;

    // Unwrap nested data field if present
    const data = event.data && typeof event.data === 'object' ? event.data : event;

    // Log first 5 events for debugging
    if (_debugLogCount < 5) {
      console.log(`[Blur] Event #${_debugLogCount + 1} keys:`, Object.keys(data).join(', '));
      console.log(`[Blur] Event #${_debugLogCount + 1} sample:`, JSON.stringify(data).slice(0, 400));
      _debugLogCount++;
    }

    // Skip non-swap events (metadata, stats, heartbeats, etc.)
    const eventType = safeStr(data, 'type', 'event', 'kind', 'action').toLowerCase();
    if (eventType && !['swap', 'trade', 'buy', 'sell', ''].includes(eventType)) {
      return null; // Skip non-trade events silently
    }

    // Extract token info — try many possible field names
    const symbol = safeStr(data, 'token_symbol', 'symbol', 'base_symbol', 'tokenSymbol',
      'base_token_symbol', 'token', 'base') || 'UNKNOWN';
    const tokenName = safeStr(data, 'token_name', 'name', 'tokenName', 'base_token_name',
      'base_name') || symbol;
    const priceUsd = safeNum(data, 'price_usd', 'price', 'priceUsd', 'token_price',
      'base_price', 'swap_price', 'usd_price');
    const volumeUsd = safeNum(data, 'volume_usd', 'amount_usd', 'volumeUsd', 'usd_amount',
      'size_usd', 'trade_size', 'notional', 'value_usd', 'swap_amount_usd');

    // Determine trade side
    const rawSide = safeStr(data, 'side', 'type', 'direction', 'action', 'trade_type').toLowerCase();
    const side = rawSide.includes('buy') || rawSide.includes('long') ? 'buy' : 'sell';

    // Determine DEX
    const rawDex = safeStr(data, 'dex', 'program', 'source', 'exchange', 'amm',
      'program_id', 'market', 'pool_type', 'dex_name');
    const dexName = normalizeDexName(rawDex);

    // Calculate size
    const sizeUsd = volumeUsd > 0 ? volumeUsd : (priceUsd > 0 ? priceUsd * 100 : 50);
    const isWhale = sizeUsd >= 10_000;

    // Update token state if it's a known token
    const ts = tokenState.get(symbol);
    if (ts) {
      if (priceUsd > 0) ts.price = priceUsd;
      ts.volume24h += sizeUsd;
      ts.trades24h += 1;
      ts.buyPressure = Math.max(0.1, Math.min(0.9, ts.buyPressure + (side === 'buy' ? 0.003 : -0.003)));
      ts.priceHistory.push(ts.price);
      if (ts.priceHistory.length > 24) ts.priceHistory.shift();
    }

    // Update DEX volume
    const ds = dexVolume.get(dexName);
    if (ds) {
      ds.volume += sizeUsd;
      ds.trades += 1;
      if (side === 'buy') ds.buyVolume += sizeUsd; else ds.sellVolume += sizeUsd;
    }

    // Register token logo from Blur data if provided
    const logoUrl = safeStr(data, 'logo', 'image', 'icon', 'logo_uri', 'logoURI',
      'token_logo', 'image_uri');
    if (logoUrl && symbol !== 'UNKNOWN') {
      registerTokenLogo(symbol, logoUrl);
    }

    return {
      id: `blur-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: data.timestamp ? (data.timestamp > 1e12 ? data.timestamp : data.timestamp * 1000) : Date.now(),
      token: symbol,
      tokenName,
      side,
      price: priceUsd,
      sizeUsd,
      sizeTokens: priceUsd > 0 ? sizeUsd / priceUsd : 0,
      dex: dexName,
      isWhale,
      txSignature: safeStr(data, 'signature', 'tx', 'txid', 'transaction_id', 'tx_hash', 'txHash') || null,
      mint: safeStr(data, 'mint', 'token_address', 'base_mint', 'tokenAddress', 'token_mint') || null,
      source: 'blur-live',
    };
  } catch (err) {
    // Silently skip unparseable events — don't spam console
    return null;
  }
}

export class SolamiBlur {
  constructor(apiKey = DATA_KEY) {
    this.apiKey = apiKey;
    this.listeners = new Map();
    this.ws = null;
    this.streamInterval = null;
    this.connected = false;
    this.isLive = false;
    this.whaleTradeHistory = [];
    this._shouldReconnect = true;
    this.reconnectAttempts = 0;
  }

  /**
   * Start trade stream — tries real Blur WebSocket first,
   * falls back to simulation if it fails
   */
  async startStream(fallbackTradesPerSecond = 6) {
    // 1. Try server-side stream proxy (/api/stream) first to keep keys hidden
    try {
      console.log('[SolFlow] Connecting via server stream proxy (/api/stream)...');
      await this._connectSseStream();
      console.log('[SolFlow] ✅ Connected to LIVE stream via server proxy!');
      return;
    } catch (sseErr) {
      console.warn('[SolFlow] Server stream proxy unavailable:', sseErr.message);
    }

    // 2. Direct WebSocket fallback if client key configured
    if (this.apiKey) {
      console.log('[SolFlow] Connecting to Solami Blur WebSocket directly...');
      try {
        await this._connectBlurWs();
        console.log('[SolFlow] ✅ Connected to LIVE Blur data via Direct WebSocket!');
        return;
      } catch (err) {
        console.warn('[SolFlow] Direct Blur WebSocket failed:', err.message);
      }
    } else {
      console.warn('[SolFlow] No API key — using simulated data');
    }

    // 3. Fallback to simulation
    this._startSimulation(fallbackTradesPerSecond);
  }

  /**
   * Connect via Server-Sent Events (SSE) server proxy
   */
  _connectSseStream() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.eventSource) this.eventSource.close();
        reject(new Error('Server SSE stream timeout'));
      }, 6000);

      try {
        this.eventSource = new EventSource('/api/stream');

        this.eventSource.onopen = () => {
          clearTimeout(timeout);
          this.connected = true;
          this.isLive = true;
          this.reconnectAttempts = 0;
          this._emit('status', { connected: true, live: true });
          resolve();
        };

        this.eventSource.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.status === 'connected') return;
            if (msg.error) return;

            // Process single or array event
            const processTrade = (evt) => {
              if (!evt || typeof evt !== 'object') return;
              const trade = parseBlurSwapEvent(evt);
              if (trade) {
                this._emit('trade', trade);
                if (trade.isWhale) {
                  this.whaleTradeHistory.unshift(trade);
                  if (this.whaleTradeHistory.length > 50) this.whaleTradeHistory.pop();
                  this._emit('whale', trade);
                }
              }
            };

            if (Array.isArray(msg)) msg.forEach(processTrade);
            else if (msg.data) {
              if (Array.isArray(msg.data)) msg.data.forEach(processTrade);
              else processTrade(msg.data);
            } else if (msg.events && Array.isArray(msg.events)) msg.events.forEach(processTrade);
            else processTrade(msg);
          } catch (e) {
            /* ignore parse errors */
          }
        };

        this.eventSource.onerror = (err) => {
          clearTimeout(timeout);
          this.connected = false;
          this.isLive = false;
          this._emit('status', { connected: false, live: false });
          reject(new Error('Server SSE stream error'));
        };
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    });
  }

  /* REST polling removed — Blur WebSocket is the primary data source */

  /**
   * Connect to real Blur WebSocket
   */
  _connectBlurWs() {
    return new Promise((resolve, reject) => {
      const url = `${ENDPOINTS.blurWs}?chain=solana&api_key=${this.apiKey}`;

      const timeout = setTimeout(() => {
        reject(new Error('Blur WebSocket connection timeout'));
      }, 8000);

      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.connected = true;
          this.isLive = true;
          this.reconnectAttempts = 0;
          this._emit('status', { connected: true, live: true });

          // Send subscription filter to receive swap events
          this.ws.send(JSON.stringify({
            filter: {
              types: ['swap'],
              min_volume_usd: 1.0,
            }
          }));
          console.log('[SolFlow] Sent swap subscription filter');

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            // Log first few messages for debugging
            if (!this._msgCount) this._msgCount = 0;
            this._msgCount++;
            if (this._msgCount <= 3) {
              console.log(`[Blur] Message #${this._msgCount}:`, JSON.stringify(msg).slice(0, 400));
            }

            // Helper to process a single trade event
            const processTrade = (evt) => {
              if (!evt || typeof evt !== 'object') return;
              const trade = parseBlurSwapEvent(evt);
              if (trade) {
                this._emit('trade', trade);
                if (trade.isWhale) {
                  this.whaleTradeHistory.unshift(trade);
                  if (this.whaleTradeHistory.length > 50) this.whaleTradeHistory.pop();
                  this._emit('whale', trade);
                }
              }
            };

            // Handle all possible message formats

            // Array of events
            if (Array.isArray(msg)) {
              msg.forEach(evt => processTrade(evt));
              return;
            }

            // Nested data field (array or object)
            if (msg.data && typeof msg.data === 'object') {
              if (Array.isArray(msg.data)) {
                msg.data.forEach(evt => processTrade(evt));
              } else {
                processTrade(msg.data);
              }
              return;
            }

            // Events wrapper
            if (msg.events && Array.isArray(msg.events)) {
              msg.events.forEach(evt => processTrade(evt));
              return;
            }

            // Trades wrapper
            if (msg.trades && Array.isArray(msg.trades)) {
              msg.trades.forEach(evt => processTrade(evt));
              return;
            }

            // Direct event object — try parsing it
            if (typeof msg === 'object' && msg !== null) {
              processTrade(msg);
            }

          } catch (e) {
            // Silently skip unparseable messages
          }
        };

        this.ws.onclose = () => {
          this.connected = false;
          this.isLive = false;
          this._emit('status', { connected: false, live: false });
          if (this._shouldReconnect && this.reconnectAttempts < 3) {
            this.reconnectAttempts++;
            console.log(`[SolFlow] Blur WS closed, reconnect attempt ${this.reconnectAttempts}...`);
            setTimeout(() => this._connectBlurWs().catch(() => {
              console.warn('[SolFlow] Reconnect failed, switching to simulation');
              this._startSimulation(6);
            }), 2000 * this.reconnectAttempts);
          } else if (this._shouldReconnect) {
            console.warn('[SolFlow] Max reconnects reached, switching to simulation');
            this._startSimulation(6);
          }
        };

        this.ws.onerror = (err) => {
          clearTimeout(timeout);
          this._emit('error', err);
          if (!this.connected) reject(new Error('WebSocket connection error'));
        };
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    });
  }

  /**
   * Fallback simulation mode
   */
  _startSimulation(tradesPerSecond = 6) {
    this.connected = true;
    this.isLive = false;
    this._emit('status', { connected: true, live: false });
    console.log(`[SolFlow] Running in simulation mode (${tradesPerSecond} trades/sec)`);

    const interval = 1000 / tradesPerSecond;
    this.streamInterval = setInterval(() => {
      const count = Math.random() < 0.2 ? 3 : Math.random() < 0.4 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const trade = generateSimulatedTrade();
        this._emit('trade', trade);
        if (trade.isWhale) {
          this.whaleTradeHistory.unshift(trade);
          if (this.whaleTradeHistory.length > 50) this.whaleTradeHistory.pop();
          this._emit('whale', trade);
        }
      }
    }, interval);
  }

  stopStream() {
    this._shouldReconnect = false;
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.isLive = false;
    this._emit('status', { connected: false, live: false });
  }

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
        priceHistory: [...t.priceHistory],
      }));
  }

  getDexFlows() {
    return DEX_NAMES.map(name => {
      const state = dexVolume.get(name) || {};
      return {
        name,
        volume: state.volume || 0,
        trades: state.trades || 0,
        buyVolume: state.buyVolume || 0,
        sellVolume: state.sellVolume || 0,
      };
    });
  }

  getWhaleHistory() {
    return [...this.whaleTradeHistory];
  }

  getMetrics() {
    const tokens = Array.from(tokenState.values());
    const totalVolume = tokens.reduce((sum, t) => sum + t.volume24h, 0);
    const totalTrades = tokens.reduce((sum, t) => sum + t.trades24h, 0);
    const avgBuyPressure = tokens.reduce((sum, t) => sum + t.buyPressure, 0) / tokens.length;
    const uniqueWallets = Math.floor(totalTrades * 0.35 + Math.random() * 1000);
    const activePools = Math.floor(tokens.length * 2.5 + Math.random() * 5);
    const newLaunches = Math.floor(Math.random() * 2 + 18);

    const current = {
      totalVolume24h: totalVolume,
      totalTrades24h: totalTrades,
      activeTokens: tokens.length,
      activePools,
      buyRatio: avgBuyPressure,
      newLaunches,
      uniqueWallets,
      whaleCount: this.whaleTradeHistory.length,
    };

    const deltas = {};
    if (previousMetrics) {
      deltas.volumeChange = previousMetrics.totalVolume24h > 0
        ? ((current.totalVolume24h - previousMetrics.totalVolume24h) / previousMetrics.totalVolume24h) * 100 : 0;
      deltas.tradesChange = previousMetrics.totalTrades24h > 0
        ? ((current.totalTrades24h - previousMetrics.totalTrades24h) / previousMetrics.totalTrades24h) * 100 : 0;
      deltas.poolsChange = previousMetrics.activePools > 0
        ? ((current.activePools - previousMetrics.activePools) / previousMetrics.activePools) * 100 : 0;
      deltas.walletsChange = previousMetrics.uniqueWallets > 0
        ? ((current.uniqueWallets - previousMetrics.uniqueWallets) / previousMetrics.uniqueWallets) * 100 : 0;
    } else {
      deltas.volumeChange = 1.5 + Math.random() * 2;
      deltas.tradesChange = 2.0 + Math.random() * 3;
      deltas.poolsChange = 0.5 + Math.random();
      deltas.walletsChange = 1.0 + Math.random() * 2;
    }

    previousMetrics = { ...current };
    return { ...current, ...deltas };
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
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
  if (!_blur) _blur = new SolamiBlur(DATA_KEY);
  return _blur;
}
