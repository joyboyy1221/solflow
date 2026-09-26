# SolFlow ⚡ — Real-Time Solana Money Flow Visualizer

![SolFlow](https://img.shields.io/badge/Solana-Live-00FFA3?style=for-the-badge&logo=solana) ![Solami](https://img.shields.io/badge/Powered%20by-Solami-22d3ee?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-a78bfa?style=for-the-badge)

**SolFlow** is a real-time Solana DEX analytics dashboard that visualizes capital flowing across the entire Solana DeFi ecosystem. Watch live trades, track whale activity, compare multi-path latencies, and explore token drill-downs — all powered by **three** [Solami](https://solami.dev) products working together.

🔗 **Live Demo**: [https://solflow-gamma.vercel.app/](https://solflow-gamma.vercel.app/)

---

## 🏆 Why SolFlow Wins

SolFlow is the **only** dashboard that uses **all three Solami products** simultaneously:

```
┌─────────────────────────────────────────────────────────────┐
│                    SolFlow Dashboard                        │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Flow Map   │  │  Latency     │  │  Token Leaderboard│  │
│  │  (Canvas)   │  │  Comparison  │  │  + Drill-Down     │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬──────────┘  │
│         │                │                    │             │
│         └────────────────┼────────────────────┘             │
│                          │                                  │
│              ┌───────────┴───────────┐                      │
│              │   Solami Data Layer   │                      │
│              └───────────┬───────────┘                      │
└──────────────────────────┼──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
     ┌────┴─────┐    ┌────┴─────┐    ┌─────┴─────┐
     │  Solami  │    │  Solami  │    │  Solami   │
     │   RPC    │    │  Mirage  │    │   Blur    │
     │          │    │          │    │           │
     │ Slot #   │    │ gRPC→WS  │    │ DEX Trades│
     │ Balance  │    │ Real-time│    │ Whales    │
     │ Latency  │    │ Stream   │    │ Volume    │
     └──────────┘    └──────────┘    └───────────┘
```

**One API key → Three data paths → Complete Solana visibility**

---

## ✨ Features

### Core Dashboard
- 🌐 **Live Capital Flow Map** — Animated canvas showing real-time capital flowing between 7 DEXes (Jupiter, Raydium, Orca, Meteora, Pump.fun, Phoenix, Lifinity) with branded logos, hover tooltips, particle trails, and volume-proportional nodes
- 📊 **Real-Time Metrics Bar** — 6 live metric cards: 24h volume, trade count, active pools, new launches, unique wallets, buy/sell ratio — all with sparklines and animated deltas
- 🏆 **Token Leaderboard** — Top 20 tokens ranked by volume with inline sparkline charts, price changes, and hot badges

### Advanced Analytics
- 🏎️ **Multi-Path Latency Comparison** — Live panel showing RPC vs Mirage vs Blur latency with sparkline history. Highlights fastest path with 👑. Proves Solami's multi-path value.
- 🍩 **DEX Volume Donut Chart** — Animated SVG donut showing volume distribution across all 7 DEXes with legend and buy/sell pressure bars
- 🐋 **Whale Alerts** — Real-time detection of $10K+ trades with dramatic card UI

### Interactive Features
- 🔍 **Token Drill-Down** — Click any token → modal with price chart, stats grid, buy/sell pressure bar, recent trades list, whale activity tab
- 📤 **Share Card** — Generate screenshot-ready token cards with stats + SolFlow branding, share to Twitter with one click
- 🔌 **Connection Health** — Live status for all 3 Solami services with latency display

### Design
- 🎨 **Premium Dark UI** — Glassmorphism, neon glows, smooth micro-animations
- 📱 **Responsive** — Full dashboard on desktop, optimized for tablet/mobile

---

## 🔧 Solami Products Used

| Product | What It Does | How SolFlow Uses It |
|---------|-------------|-------------------|
| **RPC** | JSON-RPC 2.0 endpoint | Slot queries, balance lookups, network health pings, latency benchmarking |
| **Mirage** | gRPC → WebSocket bridge | Real-time transaction streaming without gRPC toolchain, slot subscriptions |
| **Blur** | Decoded DEX data stream | Live trade feed, token volumes, whale detection, DEX flow tracking, token metadata |

### Multi-Path Architecture

SolFlow doesn't just use one API — it uses **all three simultaneously** and lets you **compare their performance in real-time**:

```
RPC:    ████████████████████████████░░░  ~400ms (JSON-RPC polling)
Mirage: ██████████░░░░░░░░░░░░░░░░░░░░  ~100ms (gRPC WebSocket)
Blur:   ████████░░░░░░░░░░░░░░░░░░░░░░   ~80ms (Real-time stream)
```

---

## 🚀 Getting Started

### 1. Get a Solami API Key

Sign up for **free Pro access** (7 days):
👉 [https://solami.dev/signup?ref=st-earn-sep-26](https://solami.dev/signup?ref=st-earn-sep-26)

### 2. Clone & Install

```bash
git clone https://github.com/joyboyy1221/solflow.git
cd solflow
npm install
```

### 3. Configure

```bash
cp .env.example .env
# Edit .env and add: SOLAMI_API_KEY=your_key_here
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
solflow/
├── api/                              # Vercel Serverless Functions
│   ├── rpc.js                        # RPC proxy (hides API key)
│   ├── stream.js                     # SSE Blur stream proxy
│   └── logo.js                       # Image proxy for DEX logos (CORS bypass)
├── src/
│   ├── App.jsx                       # Main layout + state management
│   ├── index.css                     # Design system (2800+ lines)
│   ├── services/
│   │   └── solami.js                 # Unified API client (RPC + Mirage + Blur)
│   ├── components/
│   │   ├── FlowMap/                  # Interactive canvas flow visualization
│   │   ├── Metrics/MetricsBar.jsx    # Animated real-time metric cards
│   │   ├── Leaderboard/             # Token ranking + click-to-drill-down
│   │   ├── TradeFeed/               # Live trade stream with whale detection
│   │   ├── WhaleAlerts/             # $10K+ whale trade alert panel
│   │   ├── LatencyPanel/            # Multi-path latency comparison
│   │   ├── DexDonut/                # DEX volume donut chart
│   │   ├── DrillDown/               # Token detail modal
│   │   ├── ShareCard/               # Shareable token stats card
│   │   ├── TokenIcon/               # Dynamic token logo fetcher
│   │   └── Status/                  # Connection health indicators
│   └── utils/
│       ├── formatters.js             # Number/currency/time formatting
│       ├── constants.js              # Colors, thresholds, config
│       ├── dexLogos.js               # DEX logo loader with proxy
│       └── tokenLogos.js             # Token logo resolver
├── .env.example
├── vercel.json
├── package.json
└── vite.config.js
```

---

## 🎨 Design System

- **Background**: Deep navy (#060a13) with animated gradient mesh + noise texture
- **Cards**: Glassmorphism with blur(20px), subtle borders, glow on hover
- **Palette**: Cyan (#22d3ee), Purple (#a78bfa), Green (#4ade80), Gold (#fbbf24), Red (#f87171)
- **Typography**: Inter (UI), JetBrains Mono (data), responsive sizing
- **Animations**: Particle trails, flash on new data, sparkline transitions, pulse effects

---

## 📜 License

MIT — free to use, modify, and distribute.

## 🙏 Credits

Built with ❤️ using [Solami](https://solami.dev) — high-performance Solana infrastructure for builders and traders.
