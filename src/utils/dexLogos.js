/* ── DEX Logo URLs ── */
/* Using reliable CDN sources that don't get blocked by CORS */

export const DEX_LOGOS = {
  'Jupiter': 'https://img.fotofolio.xyz/?url=https%3A%2F%2Fstatic.jup.ag%2Fjup%2Ficon.png',
  'Raydium': 'https://img.fotofolio.xyz/?url=https%3A%2F%2Fraydium.io%2Flogo%2Flogo-only-icon.svg',
  'Orca': 'https://img.fotofolio.xyz/?url=https%3A%2F%2Forca.so%2Fimg%2Forca_symbol_color.svg',
  'Meteora': 'https://img.fotofolio.xyz/?url=https%3A%2F%2Fapp.meteora.ag%2Ficons%2Flogo.svg',
  'Pump.fun': 'https://img.fotofolio.xyz/?url=https%3A%2F%2Fpump.fun%2Ficon.png',
  'Phoenix': 'https://img.fotofolio.xyz/?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolana-labs%2Ftoken-list%2Fmain%2Fassets%2Fmainnet%2FPhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY%2Flogo.png',
  'Lifinity': 'https://img.fotofolio.xyz/?url=https%3A%2F%2Flifinity.io%2Flogo-filled.svg',
};

/**
 * Inline SVG fallback logos for DEXes.
 * Used when external images fail to load on the canvas.
 * These are data:image/svg+xml URIs that always work.
 */
export const DEX_LOGO_FALLBACKS = {
  'Jupiter': `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#1E1E2E"/><path d="M32 12C20.954 12 12 20.954 12 32s8.954 20 20 20c3.5 0 6.78-.9 9.64-2.48l-6.98-12.08a8 8 0 1 1 0-11l6.98-12.08A19.9 19.9 0 0 0 32 12z" fill="#4ade80"/><circle cx="38" cy="32" r="6" fill="#22c55e"/></svg>')}`,
  'Raydium': `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#1E1E2E"/><path d="M18 18h12v12H18zM34 18h12v28H34zM18 34h12v12H18z" fill="#a78bfa"/></svg>')}`,
  'Orca': `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#1E1E2E"/><ellipse cx="32" cy="32" rx="18" ry="14" fill="#22d3ee"/><circle cx="24" cy="28" r="4" fill="#1E1E2E"/><circle cx="24" cy="28" r="2" fill="white"/><path d="M38 26c4 2 6 6 4 10s-6 6-10 4" stroke="#1E1E2E" stroke-width="2" fill="none"/></svg>')}`,
  'Meteora': `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#1E1E2E"/><path d="M32 14L16 50h32L32 14z" fill="#fbbf24"/><path d="M32 26L24 46h16L32 26z" fill="#f59e0b"/></svg>')}`,
  'Pump.fun': `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#1E1E2E"/><path d="M22 44V28c0-6 4-10 10-10s10 4 10 10v2c0 4-3 7-7 7h-6v7" stroke="#f87171" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="29" cy="44" r="3" fill="#f87171"/></svg>')}`,
  'Phoenix': `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#1E1E2E"/><path d="M20 44c4-8 8-20 12-26 4 6 8 18 12 26-4-2-8-3-12-3s-8 1-12 3z" fill="#60a5fa"/><path d="M26 38c2-4 4-10 6-14 2 4 4 10 6 14-2-1-4-1.5-6-1.5s-4 .5-6 1.5z" fill="#3b82f6"/></svg>')}`,
  'Lifinity': `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#1E1E2E"/><path d="M16 32c0-8.8 7.2-16 16-16s16 7.2 16 16" stroke="#f472b6" stroke-width="4" fill="none"/><path d="M20 32c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke="#ec4899" stroke-width="3" fill="none"/><circle cx="32" cy="32" r="4" fill="#f472b6"/><path d="M32 36v12" stroke="#f472b6" stroke-width="3" stroke-linecap="round"/></svg>')}`,
};

/**
 * Preload DEX logo images for canvas rendering.
 * Tries external URL first, falls back to inline SVG.
 */
export function preloadDexLogos() {
  const loaded = new Map();

  Object.entries(DEX_LOGOS).forEach(([name, url]) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loaded.set(name, img);
    };
    img.onerror = () => {
      // Load inline SVG fallback
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        loaded.set(name, fallbackImg);
      };
      fallbackImg.src = DEX_LOGO_FALLBACKS[name] || '';
    };
    img.src = url;
  });

  return loaded;
}
