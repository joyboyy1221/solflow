import { useEffect, useRef, useCallback, useState } from 'react';
import { DEX_COLORS } from '../../utils/constants.js';
import { formatUsd, formatNumber } from '../../utils/formatters.js';
import { DEX_LOGOS, DEX_LOGO_FALLBACKS } from '../../utils/dexLogos.js';

/* ── Flow Map Node / Particle definitions ── */

const DEX_NODES = [
  { id: 'Jupiter',  x: 0.50, y: 0.28, baseRadius: 48, icon: 'J' },
  { id: 'Raydium',  x: 0.18, y: 0.50, baseRadius: 38, icon: 'R' },
  { id: 'Orca',     x: 0.82, y: 0.50, baseRadius: 36, icon: 'O' },
  { id: 'Meteora',  x: 0.32, y: 0.76, baseRadius: 32, icon: 'M' },
  { id: 'Pump.fun', x: 0.68, y: 0.76, baseRadius: 30, icon: 'P' },
  { id: 'Phoenix',  x: 0.13, y: 0.24, baseRadius: 28, icon: 'Ph' },
  { id: 'Lifinity', x: 0.87, y: 0.24, baseRadius: 26, icon: 'L' },
];

const CONNECTIONS = [
  ['Jupiter', 'Raydium'], ['Jupiter', 'Orca'], ['Jupiter', 'Meteora'],
  ['Jupiter', 'Pump.fun'], ['Jupiter', 'Phoenix'], ['Jupiter', 'Lifinity'],
  ['Raydium', 'Orca'], ['Raydium', 'Meteora'], ['Orca', 'Pump.fun'],
  ['Meteora', 'Pump.fun'],
];

class Particle {
  constructor(fromNode, toNode, color, speed) {
    this.from = fromNode;
    this.to = toNode;
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
    const perpX = -(this.to._y - this.from._y);
    const perpY = (this.to._x - this.from._x);
    const len = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
    const curve = Math.sin(this.progress * Math.PI) * 18;
    this.x = x + (perpX / len) * curve;
    this.y = y + (perpY / len) * curve;
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) this.trail.shift();
    return this.progress < 1;
  }

  draw(ctx) {
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) ctx.lineTo(this.trail[i].x, this.trail[i].y);
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = this.opacity * 0.3;
      ctx.lineWidth = this.size * 0.5;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.fill();
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
    grad.addColorStop(0, this.color);
    grad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.globalAlpha = this.opacity * 0.3;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export default function FlowMap({ trades, dexFlows }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const nodesRef = useRef([]);
  const animFrameRef = useRef(null);
  const lastTradeCountRef = useRef(0);
  const dexImagesRef = useRef(new Map());
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  // Preload DEX logo images with fallback
  useEffect(() => {
    Object.entries(DEX_LOGOS).forEach(([name, url]) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        dexImagesRef.current.set(name, img);
      };
      img.onerror = () => {
        // Try inline SVG fallback
        const fallbackUrl = DEX_LOGO_FALLBACKS[name];
        if (fallbackUrl) {
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            dexImagesRef.current.set(name, fallbackImg);
          };
          fallbackImg.src = fallbackUrl;
        }
      };
      img.src = url;
    });
  }, []);

  const updateNodePositions = useCallback((canvas) => {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    nodesRef.current = DEX_NODES.map(n => {
      let volumeScale = 1;
      if (dexFlows) {
        const dexData = dexFlows.find(d => d.name === n.id);
        if (dexData) {
          const maxVol = Math.max(...dexFlows.map(d => d.volume), 1);
          volumeScale = 0.7 + (dexData.volume / maxVol) * 0.6;
        }
      }
      return {
        ...n, _x: n.x * w, _y: n.y * h,
        _radius: n.baseRadius * volumeScale * (Math.min(w, h) / 600),
        _pulseRadius: 0, _pulseOpacity: 0,
      };
    });
  }, [dexFlows]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let found = null;
    for (const node of nodesRef.current) {
      const dx = mx - node._x, dy = my - node._y;
      if (Math.sqrt(dx * dx + dy * dy) < node._radius + 5) { found = node; break; }
    }
    if (found) {
      setHoveredNode(found.id);
      const dexData = dexFlows?.find(d => d.name === found.id);
      setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, node: found, dex: dexData });
    } else {
      setHoveredNode(null);
      setTooltip(null);
    }
  }, [dexFlows]);

  const handleMouseLeave = useCallback(() => {
    setHoveredNode(null);
    setTooltip(null);
  }, []);

  // Spawn particles from new trades
  useEffect(() => {
    if (!trades || trades.length === lastTradeCountRef.current) return;
    lastTradeCountRef.current = trades.length;
    const nodes = nodesRef.current;
    if (nodes.length === 0) return;
    const newTrades = trades.slice(0, Math.min(5, trades.length));
    newTrades.forEach(trade => {
      const dexNode = nodes.find(n => n.id === trade.dex);
      const fi = Math.floor(Math.random() * nodes.length);
      let ti = Math.floor(Math.random() * nodes.length);
      while (ti === fi) ti = Math.floor(Math.random() * nodes.length);
      const from = dexNode || nodes[fi];
      const to = nodes[ti];
      const color = trade.side === 'buy' ? '#4ade80' : '#f87171';
      particlesRef.current.push(new Particle(from, to, color, trade.isWhale ? 0.004 : 0.005 + Math.random() * 0.01));
      if (trade.isWhale && dexNode) { dexNode._pulseRadius = 0; dexNode._pulseOpacity = 0.7; }
    });
    if (particlesRef.current.length > 300) particlesRef.current = particlesRef.current.slice(-200);
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
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      updateNodePositions(canvas);
    }

    resize();
    window.addEventListener('resize', resize);

    const bgParticles = Array.from({ length: 60 }, () => ({
      x: Math.random() * (canvas.width / (window.devicePixelRatio || 1)),
      y: Math.random() * (canvas.height / (window.devicePixelRatio || 1)),
      size: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.2 + 0.03,
    }));

    function drawFrame() {
      if (!running) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

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
      const dexImages = dexImagesRef.current;

      // Draw connections
      CONNECTIONS.forEach(([fromId, toId]) => {
        const from = nodes.find(n => n.id === fromId);
        const to = nodes.find(n => n.id === toId);
        if (!from || !to) return;
        const isHov = hoveredNode === fromId || hoveredNode === toId;
        const midX = (from._x + to._x) / 2, midY = (from._y + to._y) / 2;
        const pX = -(to._y - from._y), pY = (to._x - from._x);
        const len = Math.sqrt(pX * pX + pY * pY) || 1;
        ctx.beginPath();
        ctx.moveTo(from._x, from._y);
        ctx.quadraticCurveTo(midX + (pX / len) * 20, midY + (pY / len) * 20, to._x, to._y);
        if (isHov) {
          const grad = ctx.createLinearGradient(from._x, from._y, to._x, to._y);
          grad.addColorStop(0, (DEX_COLORS[fromId] || '#22d3ee') + '40');
          grad.addColorStop(1, (DEX_COLORS[toId] || '#a78bfa') + '40');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      });

      // Particles
      particlesRef.current = particlesRef.current.filter(p => {
        const alive = p.update();
        if (alive) p.draw(ctx);
        return alive;
      });

      // Draw nodes with DEX logos
      nodes.forEach(node => {
        const color = DEX_COLORS[node.id] || '#22d3ee';
        const r = node._radius;
        const isHov = hoveredNode === node.id;

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
        const glowSize = isHov ? r * 2.5 : r * 2;
        const glowGrad = ctx.createRadialGradient(node._x, node._y, r * 0.5, node._x, node._y, glowSize);
        glowGrad.addColorStop(0, color + (isHov ? '40' : '25'));
        glowGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(node._x, node._y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // Node circle background
        ctx.beginPath();
        ctx.arc(node._x, node._y, r, 0, Math.PI * 2);
        ctx.fillStyle = isHov ? 'rgba(12, 18, 35, 0.95)' : 'rgba(6, 10, 19, 0.85)';
        ctx.fill();
        ctx.strokeStyle = color + (isHov ? '90' : '60');
        ctx.lineWidth = isHov ? 2.5 : 2;
        ctx.stroke();

        // Inner ring
        ctx.beginPath();
        ctx.arc(node._x, node._y, r - 4, 0, Math.PI * 2);
        ctx.strokeStyle = color + '30';
        ctx.lineWidth = 1;
        ctx.stroke();

        // ── Draw DEX logo image or letter fallback ──
        const logoImg = dexImages.get(node.id);
        if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
          // Draw circular clipped logo
          const imgSize = r * 1.1; // Logo slightly smaller than node
          ctx.save();
          ctx.beginPath();
          ctx.arc(node._x, node._y, imgSize * 0.5, 0, Math.PI * 2);
          ctx.clip();
          ctx.globalAlpha = isHov ? 1 : 0.85;
          ctx.drawImage(
            logoImg,
            node._x - imgSize * 0.5,
            node._y - imgSize * 0.5,
            imgSize,
            imgSize
          );
          ctx.globalAlpha = 1;
          ctx.restore();
        } else {
          // Letter fallback
          ctx.fillStyle = color;
          ctx.font = `700 ${Math.max(10, r * 0.38)}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.icon, node._x, node._y - 2);
        }

        // Label below node
        ctx.fillStyle = isHov ? 'rgba(241, 245, 249, 0.95)' : 'rgba(241, 245, 249, 0.7)';
        ctx.font = `600 ${Math.max(9, r * 0.28)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.id, node._x, node._y + r + 14);
      });

      // Ambient particles
      if (Math.random() < 0.08 && nodes.length > 1) {
        const fi = Math.floor(Math.random() * nodes.length);
        let ti = Math.floor(Math.random() * nodes.length);
        while (ti === fi) ti = Math.floor(Math.random() * nodes.length);
        const colors = ['#22d3ee', '#a78bfa', '#4ade80', '#60a5fa'];
        particlesRef.current.push(
          new Particle(nodes[fi], nodes[ti], colors[Math.floor(Math.random() * colors.length)], 0.002 + Math.random() * 0.004)
        );
      }

      animFrameRef.current = requestAnimationFrame(drawFrame);
    }

    ctx.fillStyle = 'rgba(6, 10, 19, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawFrame();

    return () => {
      running = false;
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [updateNodePositions, hoveredNode]);

  return (
    <div className="flow-map-container glass-card">
      <canvas
        ref={canvasRef}
        className="flow-map-canvas"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
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

      {tooltip && tooltip.dex && (
        <div
          className="flow-tooltip"
          style={{
            left: Math.min(tooltip.x + 12, (canvasRef.current?.parentElement?.offsetWidth || 400) - 180),
            top: tooltip.y - 10,
          }}
        >
          <div className="flow-tooltip-header">
            <span className="flow-tooltip-dot" style={{ background: DEX_COLORS[tooltip.node.id] }} />
            <span className="flow-tooltip-name">{tooltip.node.id}</span>
          </div>
          <div className="flow-tooltip-row">
            <span>Volume</span>
            <span className="mono">{formatUsd(tooltip.dex.volume, true)}</span>
          </div>
          <div className="flow-tooltip-row">
            <span>Trades</span>
            <span className="mono">{formatNumber(tooltip.dex.trades, true)}</span>
          </div>
          <div className="flow-tooltip-row">
            <span>Buy Vol</span>
            <span className="mono text-green">{formatUsd(tooltip.dex.buyVolume, true)}</span>
          </div>
          <div className="flow-tooltip-row">
            <span>Sell Vol</span>
            <span className="mono text-red">{formatUsd(tooltip.dex.sellVolume, true)}</span>
          </div>
        </div>
      )}

      <div className="flow-stats">
        <div className="flow-stat-pill">{DEX_NODES.length} DEXes</div>
        <div className="flow-stat-pill">{CONNECTIONS.length} routes</div>
        <div className="flow-stat-pill text-cyan">{trades?.length || 0} trades</div>
      </div>
    </div>
  );
}
