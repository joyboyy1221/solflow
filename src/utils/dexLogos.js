/* ── DEX Logo URLs ── */
/* All logos go through /api/logo proxy to bypass CORS completely */

// Original source URLs for each DEX
const RAW_LOGOS = {
  'Jupiter': 'https://static.jup.ag/jup/icon.png',
  'Raydium': 'https://img.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
  'Orca': 'https://arweave.net/SIwmEVqRUCGOVPyRp6W01yErbO0iDfmJIEotzX-dTUQ',
  'Meteora': 'https://app.meteora.ag/icons/logo.svg',
  'Pump.fun': 'https://pump.fun/icon.png',
  'Phoenix': 'https://shdw-drive.genesysgo.net/5ECTMZ9xTxgLB6MXZyBLYwcnL4sN2JMdquNtBJnKxEv/PhoenixLogo.png',
  'Lifinity': 'https://lifinity.io/logo-filled.svg',
};

// Backup URLs
const BACKUP_LOGOS = {
  'Jupiter': 'https://assets.coingecko.com/coins/images/33835/small/jup.png',
  'Raydium': 'https://assets.coingecko.com/coins/images/13928/small/PSigc4ie_400x400.jpg',
  'Orca': 'https://assets.coingecko.com/coins/images/17547/small/Orca_Logo.png',
  'Meteora': 'https://assets.coingecko.com/coins/images/30344/small/logo_%281%29.png',
  'Pump.fun': 'https://dd.dexscreener.com/ds-data/dexes/pumpfun.png',
  'Phoenix': 'https://assets.coingecko.com/markets/images/1210/small/phoenix.png',
  'Lifinity': 'https://assets.coingecko.com/coins/images/25670/small/lfnty.png',
};

// Build proxied URL through our /api/logo endpoint
function proxyUrl(url) {
  return `/api/logo?url=${encodeURIComponent(url)}`;
}

// Exported logo URLs (all go through proxy)
export const DEX_LOGOS = Object.fromEntries(
  Object.entries(RAW_LOGOS).map(([name, url]) => [name, proxyUrl(url)])
);

export const DEX_LOGOS_BACKUP = Object.fromEntries(
  Object.entries(BACKUP_LOGOS).map(([name, url]) => [name, url ? proxyUrl(url) : null])
);

/**
 * Preload DEX logos — since they go through our own proxy,
 * there are zero CORS issues. Standard Image loading works.
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
      try {
        const img = await loadImage(url);
        loaded.set(name, img);
        return;
      } catch { /* primary failed */ }

      // Try backup
      const backup = DEX_LOGOS_BACKUP[name];
      if (backup) {
        try {
          const img = await loadImage(backup);
          loaded.set(name, img);
        } catch { /* backup also failed */ }
      }
    })
  );

  return loaded;
}

/**
 * Sync preload (returns map immediately, loads async in background)
 */
export function preloadDexLogos() {
  const loaded = new Map();

  Object.entries(DEX_LOGOS).forEach(([name, url]) => {
    const img = new Image();
    img.onload = () => { loaded.set(name, img); };
    img.onerror = () => {
      // Try backup
      const backup = DEX_LOGOS_BACKUP[name];
      if (backup) {
        const img2 = new Image();
        img2.onload = () => { loaded.set(name, img2); };
        img2.src = backup;
      }
    };
    img.src = url;
  });

  return loaded;
}
