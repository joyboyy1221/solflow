# SolFlow ⚡ — Real-Time Solana Money Flow Visualizer

![SolFlow](https://img.shields.io/badge/Solana-Live-00FFA3?style=for-the-badge&logo=solana) ![Solami](https://img.shields.io/badge/Powered%20by-Solami-22d3ee?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-a78bfa?style=for-the-badge)

**SolFlow** is a stunning, real-time web dashboard that visualizes capital flowing through Solana DEXes. Watch live trades, track token volume leaderboards, monitor whale activity, and see animated money flow between Jupiter, Raydium, Orca, Meteora, Pump.fun and more — all powered by [Solami](https://solami.dev) infrastructure.

🔗 **Live Demo**: [https://solflow-gamma.vercel.app/](https://solflow-gamma.vercel.app/)

## ✨ Features

- 🌊 **Live Flow Visualization** — Animated canvas showing capital moving between DEX protocols in real-time with hover tooltips, volume-proportional nodes, and curved gradient connections
- 📊 **Real-Time Metrics** — 6 live metric cards: 24h volume, trade counts, active pools, new launches, unique wallets, and buy/sell pressure — all with sparklines and animated delta percentages
- 🏆 **Token Leaderboard** — Top 20 tokens ranked by volume with inline sparkline charts, volume bars, price changes, and hot badges for volatile tokens
- ⚡ **Trade Feed** — Scrolling feed of every trade with visual hierarchy: whale banners (🐋 $10K+), large trade highlights, token avatars, and side indicators
- 🐋 **Whale Alerts** — Dedicated whale trade panel with dramatic cards showing token, size, DEX, and time for $10K+ trades
- 🔗 **Connection Health** — Live status pills for all Solami service connections (Blur, Mirage, RPC) with latency display
- 🎨 **Premium Dark UI** — Glassmorphism, neon glows, smooth animations, responsive layout for desktop/tablet/mobile
- ⏱️ **Uptime Counter** — Live session timer and Solana slot number tracking

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
git clone https://github.com/joyboyy1221/solflow.git
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
│   ├── App.jsx                        # Main dashboard layout (3-tab sidebar)
│   ├── index.css                      # Design system v3.0 (dark theme, glassmorphism, responsive)
│   ├── services/
│   │   └── solami.js                  # Solami API client (RPC, Mirage, Blur + DEX tracking)
│   ├── components/
│   │   ├── FlowMap/FlowMap.jsx        # Interactive Canvas flow visualization with tooltips
│   │   ├── Metrics/MetricsBar.jsx     # Animated real-time metrics cards with sparklines
│   │   ├── Leaderboard/              # Token ranking with volume bars & sparklines
│   │   ├── TradeFeed/                # Live trade stream with whale detection
│   │   ├── WhaleAlerts/              # Dedicated whale trade alert panel
│   │   └── Status/                   # Connection health indicators with Solami branding
│   └── utils/
│       ├── formatters.js              # Number/currency/time/relative formatting
│       └── constants.js               # Colors, thresholds, tabs, config
├── .env.example
├── package.json
└── vite.config.js
```

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│             Frontend (Vite + React)              │
│                                                  │
│  FlowMap ← Interactive Canvas with hover tooltips│
│  MetricsBar ← 6 animated cards with sparklines  │
│  Leaderboard ← Volume bars + inline charts      │
│  TradeFeed ← Visual hierarchy + whale banners    │
│  WhaleAlerts ← Dramatic $10K+ trade cards        │
│                                                  │
│              ┌─────────────┐                     │
│              │  Data Layer  │                     │
│              └──────┬──────┘                     │
└─────────────────────┼────────────────────────────┘
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
- **Effects**: Glassmorphism cards, neon glow animations, particle trails, hover tooltips
- **Responsive**: Full dashboard on desktop, stacked layout on tablet, optimized for mobile
- **Components**: 6 metric cards, interactive flow map, 3-tab sidebar (Leaderboard/Trades/Whales)

## 📜 License

MIT — free to use, modify, and distribute.

## 🙏 Credits

Built with [Solami](https://solami.dev) — high-performance Solana infrastructure for builders and traders.
