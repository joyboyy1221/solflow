# SolFlow ⚡ — Real-Time Solana Money Flow Visualizer

![SolFlow](https://img.shields.io/badge/Solana-Live-00FFA3?style=for-the-badge&logo=solana) ![Solami](https://img.shields.io/badge/Powered%20by-Solami-22d3ee?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-a78bfa?style=for-the-badge)

**SolFlow** is a stunning, real-time web dashboard that visualizes capital flowing through Solana DEXes. Watch live trades, track token volume leaderboards, and see animated money flow between Jupiter, Raydium, Orca, Meteora, Pump.fun and more — all powered by [Solami](https://solami.dev) infrastructure.

## ✨ Features

- 🌊 **Live Flow Visualization** — Animated canvas showing capital moving between DEX protocols in real-time
- 📊 **Real-Time Metrics** — 24h volume, trade counts, active pools, new launches, and buy/sell pressure
- 🏆 **Token Leaderboard** — Top 20 tokens ranked by volume with live price changes
- ⚡ **Trade Feed** — Scrolling feed of every trade with whale detection (🐋 for $10K+ trades)
- 🔗 **Connection Health** — Live status for all Solami service connections
- 🎨 **Premium Dark UI** — Glassmorphism, neon glows, smooth animations, responsive layout

## 🔧 Solami Products Used

| Product | Usage |
|---------|-------|
| **Mirage** (WebSocket) | Real-time transaction & slot streaming in the browser — no gRPC toolchain required |
| **Blur** (REST + WebSocket) | Decoded DEX trades, token launches, liquidity events, candles — no instruction parsing |
| **RPC** | Account balance lookups, slot queries, transaction details, network health pings |

## 🚀 Getting Started

### 1. Get a Solami API Key

Sign up for **free Pro access** (7 days):
👉 [https://solami.dev/signup?ref=st-earn-sep-26](https://solami.dev/signup?ref=st-earn-sep-26)

Pro includes: 2 unmetered gRPC streams, 1 TB Blur data, 200 RPS on RPC.

### 2. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/solflow.git
cd solflow
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Solami API key:
```
VITE_SOLAMI_API_KEY=your_api_key_here
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll see live Solana data streaming in immediately.

## 📁 Project Structure

```
solflow/
├── src/
│   ├── App.jsx                    # Main dashboard layout
│   ├── index.css                  # Design system (dark theme, glassmorphism)
│   ├── services/
│   │   └── solami.js              # Solami API client (RPC, Mirage, Blur)
│   ├── components/
│   │   ├── FlowMap/FlowMap.jsx    # Animated Canvas flow visualization
│   │   ├── Metrics/MetricsBar.jsx # Real-time metrics cards
│   │   ├── Leaderboard/          # Token ranking by volume
│   │   ├── TradeFeed/            # Live trade stream
│   │   └── Status/               # Connection health indicators
│   └── utils/
│       ├── formatters.js          # Number/currency/time formatting
│       └── constants.js           # Colors, thresholds, config
├── .env.example
├── package.json
└── vite.config.js
```

## 🏗️ Architecture

```
┌──────────────────────────────────────────────┐
│             Frontend (Vite + React)          │
│                                              │
│  FlowMap ← Canvas    MetricsBar ← Cards     │
│  Leaderboard ← Rows  TradeFeed ← Scroll     │
│                                              │
│              ┌─────────────┐                 │
│              │  Data Layer  │                 │
│              └──────┬──────┘                 │
└─────────────────────┼────────────────────────┘
                      │
         ┌────────────┼──────────────┐
    ┌────┴─────┐ ┌────┴─────┐ ┌─────┴─────┐
    │  Mirage  │ │   Blur   │ │   RPC     │
    │  (WS)   │ │ (REST+WS)│ │ (JSON-RPC)│
    └──────────┘ └──────────┘ └───────────┘
           Solami Infrastructure
```

## 🎨 Design

- **Color Palette**: Deep navy background (#060a13), cyan/purple gradients, green/red for buy/sell
- **Typography**: Inter for UI, JetBrains Mono for data values
- **Effects**: Glassmorphism cards, neon glow animations, particle trails
- **Responsive**: Full dashboard on desktop, stacked layout on tablet

## 📜 License

MIT — free to use, modify, and distribute.

## 🙏 Credits

Built with [Solami](https://solami.dev) — high-performance Solana infrastructure for builders and traders.
