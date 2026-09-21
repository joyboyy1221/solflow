import { useEffect, useRef, useCallback } from 'react';
import { DEX_COLORS } from '../../utils/constants.js';

/* ── Flow Map Node / Particle definitions ── */

const DEX_NODES = [
  { id: 'Jupiter',  x: 0.50, y: 0.30, radius: 45, icon: 'J' },
  { id: 'Raydium',  x: 0.20, y: 0.50, radius: 38, icon: 'R' },
  { id: 'Orca',     x: 0.80, y: 0.50, radius: 36, icon: 'O' },
  { id: 'Meteora',  x: 0.35, y: 0.75, radius: 32, icon: 'M' },
  { id: 'Pump.fun', x: 0.65, y: 0.75, radius: 30, icon: 'P' },
  { id: 'Phoenix',  x: 0.15, y: 0.25, radius: 28, icon: 'Ph' },
  { id: 'Lifinity', x: 0.85, y: 0.25, radius: 26, icon: 'L' },
];

// Connections between DEXes (flow paths)
const CONNECTIONS = [
  ['Jupiter', 'Raydium'],
  ['Jupiter', 'Orca'],
  ['Jupiter', 'Meteora'],
  ['Jupiter', 'Pump.fun'],
  ['Jupiter', 'Phoenix'],
  ['Jupiter', 'Lifinity'],
  ['Raydium', 'Orca'],
  ['Raydium', 'Meteora'],
  ['Orca', 'Pump.fun'],
  ['Meteora', 'Pump.fun'],
];

class Particle {
  constructor(fromNode, toNode, canvas, color, speed) {
    this.from = fromNode;
    this.to = toNode;
    this.canvas = canvas;
    this.color = color;
    this.progress = 0;
    this.speed = speed || (0.003 + Math.random() * 0.008);
    this.size = 1.5 + Math.random() * 2.5;
    this.opacity = 0.4 + Math.random() * 0.6;
    this.trail = [];
    this.maxTrail = 8;
  }

  update() {
    this.progress += this.speed;
    const x = this.from._x + (this.to._x - this.from._x) * this.progress;
    const y = this.from._y + (this.to._y - this.from._y) * this.progress;

    // Slight curve via sine wave
    const perpX = -(this.to._y - this.from._y);
    const perpY = (this.to._x - this.from._x);
    const len = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
    const curve = Math.sin(this.progress * Math.PI) * 15;

    this.x = x + (perpX / len) * curve;
    this.y = y + (perpY / len) * curve;

    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) this.trail.shift();

    return this.progress < 1;
  }

  draw(ctx) {
    // Trail
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = this.opacity * 0.3;
      ctx.lineWidth = this.size * 0.5;
      ctx.stroke();
    }

    // Particle head
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.fill();

    // Glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(
      this.x, this.y, 0, this.x, this.y, this.size * 3
    );
    grad.addColorStop(0, this.color);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.globalAlpha = this.opacity * 0.3;
    ctx.fill();

    ctx.globalAlpha = 1;
  }
}

export default function FlowMap({ trades }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const nodesRef = useRef([]);
  const animFrameRef = useRef(null);
  const lastTradeCountRef = useRef(0);

  // Resolve node positions when canvas resizes
  const updateNodePositions = useCallback((canvas) => {
    const w = canvas.width;
    const h = canvas.height;
    nodesRef.current = DEX_NODES.map(n => ({
      ...n,
      _x: n.x * w,
      _y: n.y * h,
      _radius: n.radius * (Math.min(w, h) / 600),
      _pulseRadius: 0,
      _pulseOpacity: 0,
    }));
  }, []);

  // Spawn particles from new trades
  useEffect(() => {
    if (!trades || trades.length === lastTradeCountRef.current) return;
    const newTrades = trades.slice(lastTradeCountRef.current);
    lastTradeCountRef.current = trades.length;

    const nodes = nodesRef.current;
    if (nodes.length === 0) return;

    newTrades.forEach(trade => {
      const fromIdx = Math.floor(Math.random() * nodes.length);
      let toIdx = Math.floor(Math.random() * nodes.length);
      while (toIdx === fromIdx) toIdx = Math.floor(Math.random() * nodes.length);

      // Find the actual DEX node if trade has dex info
      const dexNode = nodes.find(n => n.id === trade.dex);
      const from = dexNode || nodes[fromIdx];
      const to = nodes[toIdx];

      const color = trade.side === 'buy' ? '#4ade80' : '#f87171';
      const speed = trade.isWhale ? 0.004 : 0.005 + Math.random() * 0.01;

      particlesRef.current.push(new Particle(from, to, canvasRef.current, color, speed));

      // Pulse effect on destination node
      if (trade.isWhale && dexNode) {
        dexNode._pulseRadius = 0;
        dexNode._pulseOpacity = 0.6;
      }
    });

    // Cap particles
    if (particlesRef.current.length > 300) {
      particlesRef.current = particlesRef.current.slice(-200);
    }
  }, [trades]);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let running = true;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
      updateNodePositions(canvas);
    }

    resize();
    window.addEventListener('resize', resize);

    // Background particles for ambient effect
    const bgParticles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.3 + 0.05,
    }));

    function drawFrame() {
      if (!running) return;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      // Clear with slight fade for trails
      ctx.fillStyle = 'rgba(6, 10, 19, 0.15)';
      ctx.fillRect(0, 0, w, h);

      // Background stars
      bgParticles.forEach(p => {
        p.y -= p.speed;
        if (p.y < 0) { p.y = h; p.x = Math.random() * w; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 163, 184, ${p.opacity})`;
        ctx.fill();
      });

      const nodes = nodesRef.current;

      // Draw connections
      CONNECTIONS.forEach(([fromId, toId]) => {
        const from = nodes.find(n => n.id === fromId);
        const to = nodes.find(n => n.id === toId);
        if (!from || !to) return;

        ctx.beginPath();
        ctx.moveTo(from._x, from._y);
        ctx.lineTo(to._x, to._y);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Update & draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        const alive = p.update();
        if (alive) p.draw(ctx);
        return alive;
      });

      // Draw nodes
      nodes.forEach(node => {
        const color = DEX_COLORS[node.id] || '#22d3ee';
        const r = node._radius;

        // Pulse effect
        if (node._pulseOpacity > 0) {
          node._pulseRadius += 1.5;
          node._pulseOpacity -= 0.01;
          ctx.beginPath();
          ctx.arc(node._x, node._y, r + node._pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.globalAlpha = node._pulseOpacity;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Outer glow
        const glowGrad = ctx.createRadialGradient(
          node._x, node._y, r * 0.5,
          node._x, node._y, r * 2
        );
        glowGrad.addColorStop(0, color + '25');
        glowGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(node._x, node._y, r * 2, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(node._x, node._y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.85)';
        ctx.fill();
        ctx.strokeStyle = color + '60';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner ring
        ctx.beginPath();
        ctx.arc(node._x, node._y, r - 4, 0, Math.PI * 2);
        ctx.strokeStyle = color + '30';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Icon text
        ctx.fillStyle = color;
        ctx.font = `600 ${Math.max(10, r * 0.35)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.icon, node._x, node._y - 2);

        // Label below
        ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
        ctx.font = `500 ${Math.max(9, r * 0.25)}px Inter, sans-serif`;
        ctx.fillText(node.id, node._x, node._y + r + 14);
      });

      // Ambient spawning (background flow)
      if (Math.random() < 0.08 && nodes.length > 1) {
        const fi = Math.floor(Math.random() * nodes.length);
        let ti = Math.floor(Math.random() * nodes.length);
        while (ti === fi) ti = Math.floor(Math.random() * nodes.length);
        const colors = ['#22d3ee', '#a78bfa', '#4ade80', '#60a5fa'];
        particlesRef.current.push(
          new Particle(nodes[fi], nodes[ti], canvas,
            colors[Math.floor(Math.random() * colors.length)],
            0.002 + Math.random() * 0.004)
        );
      }

      animFrameRef.current = requestAnimationFrame(drawFrame);
    }

    // Initial clear
    ctx.fillStyle = 'rgba(6, 10, 19, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawFrame();

    return () => {
      running = false;
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [updateNodePositions]);

  const particleCount = particlesRef.current.length;

  return (
    <div className="flow-map-container glass-card">
      <canvas ref={canvasRef} className="flow-map-canvas" />
      <div className="flow-map-overlay">
        <div className="flow-map-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          Live Capital Flow
        </div>
        <div className="flow-legend">
          <div className="flow-legend-item">
            <div className="flow-legend-dot" style={{ background: '#4ade80' }} />
            Buy Flow
          </div>
          <div className="flow-legend-item">
            <div className="flow-legend-dot" style={{ background: '#f87171' }} />
            Sell Flow
          </div>
          <div className="flow-legend-item">
            <div className="flow-legend-dot" style={{ background: '#22d3ee' }} />
            Routing
          </div>
        </div>
      </div>
      <div className="flow-stats">
        <div className="flow-stat-pill">
          {DEX_NODES.length} DEXes
        </div>
        <div className="flow-stat-pill">
          {CONNECTIONS.length} routes
        </div>
        <div className="flow-stat-pill text-cyan">
          {trades.length} trades
        </div>
      </div>
    </div>
  );
}
