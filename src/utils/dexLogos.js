/* ── DEX Logo URLs ── */
/* All logos go through /api/logo proxy to bypass CORS */
/* Phoenix, Lifinity, Raydium & Orca use embedded SVG data URIs (their CDN URLs are dead) */

// Embedded SVG logos for DEXes with dead CDN URLs
const PHOENIX_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#0f172a"/><path d="M50 15c-3 8-8 14-14 20 6-2 12-2 16 2-4 4-10 8-18 10 10 2 18-1 24-6 2 6 0 14-6 22 8-6 14-14 14-24 4 2 6 6 6 12 2-8-1-16-8-22 4-2 8-2 12 0-6-6-14-8-20-4 2-4 6-6 10-6-6-2-12 0-16 4" fill="#60a5fa"/><path d="M38 45c4 4 10 6 16 4-2 6-6 12-14 16 8-2 14-6 18-12 0 6-2 14-8 20 6-4 10-12 10-20" fill="#3b82f6" opacity="0.7"/><circle cx="54" cy="32" r="3" fill="#93c5fd"/></svg>`;

const LIFINITY_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#0f172a"/><path d="M22 50c0-10 8-18 16-18s12 6 12 12-4 12-12 18c8-6 12-12 12-18s4-12 12-12 16 8 16 18-8 18-16 18-12-6-12-12 4-12 12-18c-8 6-12 12-12 18s-4 12-12 12-16-8-16-18z" fill="none" stroke="#f472b6" stroke-width="4" stroke-linecap="round"/><circle cx="34" cy="44" r="4" fill="#f472b6" opacity="0.6"/><circle cx="66" cy="44" r="4" fill="#ec4899" opacity="0.6"/></svg>`;

const RAYDIUM_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="rayg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#22d3ee"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="#0f172a"/><circle cx="50" cy="50" r="30" fill="url(#rayg)"/><path d="M38 62V38l24 12-24 12z" fill="#0f172a"/></svg>`;

const ORCA_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#0f172a"/><ellipse cx="50" cy="54" rx="30" ry="18" fill="#22d3ee"/><path d="M28 46c6-10 16-16 22-16-4 6-6 10-6 16" fill="#0f172a"/><circle cx="40" cy="50" r="3" fill="#0f172a"/><path d="M74 50c4-2 8-2 10 0-2 4-6 6-10 6z" fill="#67e8f9"/></svg>`;

// Build data URI from SVG string
function svgToDataUri(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Original source URLs
const RAW_LOGOS = {
  'Jupiter': 'https://static.jup.ag/jup/icon.png',
  'Raydium': 'https://raw.githubusercontent.com/raydium-io/media-assets/master/logo.svg',
  'Orca': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png',
  'Meteora': 'https://app.meteora.ag/icons/logo.svg',
  'Pump.fun': 'https://pump.fun/icon.png',
  'Phoenix': null,   // CDN dead — using embedded SVG
  'Lifinity': null,  // CDN dead — using embedded SVG
};

// Embedded fallbacks (always work, zero network)
const EMBEDDED_LOGOS = {
  'Phoenix': svgToDataUri(PHOENIX_SVG),
  'Lifinity': svgToDataUri(LIFINITY_SVG),
  'Raydium': svgToDataUri(RAYDIUM_SVG),
  'Orca': svgToDataUri(ORCA_SVG),
};

// Build proxied URL
function proxyUrl(url) {
  return `/api/logo?url=${encodeURIComponent(url)}`;
}

// Exported logo URLs
export const DEX_LOGOS = Object.fromEntries(
  Object.entries(RAW_LOGOS).map(([name, url]) => [
    name,
    url ? proxyUrl(url) : EMBEDDED_LOGOS[name] || null,
  ])
);

/**
 * Preload DEX logos — proxy URLs for most, data URIs for dead-CDN DEXes.
 */
export async function preloadDexLogosAsync() {
  const loaded = new Map();

  const loadImage = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

  await Promise.allSettled(
    Object.entries(DEX_LOGOS).map(async ([name, url]) => {
      if (!url) return;
      try {
        const img = await loadImage(url);
        loaded.set(name, img);
      } catch {
        // If proxy failed, try embedded fallback
        const fallback = EMBEDDED_LOGOS[name];
        if (fallback) {
          try {
            const img = await loadImage(fallback);
            loaded.set(name, img);
          } catch { /* give up */ }
        }
      }
    })
  );

  return loaded;
}

/**
 * Sync preload (returns map immediately, loads in background)
 */
export function preloadDexLogos() {
  const loaded = new Map();

  Object.entries(DEX_LOGOS).forEach(([name, url]) => {
    if (!url) return;
    const img = new Image();
    img.onload = () => { loaded.set(name, img); };
    img.onerror = () => {
      const fallback = EMBEDDED_LOGOS[name];
      if (fallback) {
        const img2 = new Image();
        img2.onload = () => { loaded.set(name, img2); };
        img2.src = fallback;
      }
    };
    img.src = url;
  });

  return loaded;
}
