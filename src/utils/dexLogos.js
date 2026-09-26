/* ── DEX Logo URLs ── */
/* Using multiple fallback sources for reliability */

export const DEX_LOGOS = {
  'Jupiter': 'https://static.jup.ag/jup/icon.png',
  'Raydium': 'https://img.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
  'Orca': 'https://arweave.net/SIwmEVqRUCGOVPyRp6W01yErbO0iDfmJIEotzX-dTUQ',
  'Meteora': 'https://app.meteora.ag/icons/logo.svg',
  'Pump.fun': 'https://pump.fun/icon.png',
  'Phoenix': 'https://shdw-drive.genesysgo.net/5ECTMZ9xTxgLB6MXZyBLYwcnL4sN2JMdquNtBJnKxEv/PhoenixLogo.png',
  'Lifinity': 'https://raw.githubusercontent.com/nicechute/lifinity-lfy/main/logo.png',
};

// Backup URLs if primary ones fail
export const DEX_LOGOS_BACKUP = {
  'Jupiter': 'https://assets.coingecko.com/coins/images/33835/small/jup.png',
  'Raydium': 'https://assets.coingecko.com/coins/images/13928/small/PSigc4ie_400x400.jpg',
  'Orca': 'https://assets.coingecko.com/coins/images/17547/small/Orca_Logo.png',
  'Meteora': 'https://assets.coingecko.com/coins/images/30344/small/logo_%281%29.png',
  'Pump.fun': null,
  'Phoenix': null,
  'Lifinity': 'https://assets.coingecko.com/coins/images/25670/small/lfnty.png',
};

/**
 * Preload DEX logos by fetching as blobs — this bypasses CORS for canvas!
 * Regular Image.crossOrigin='anonymous' fails if server doesn't send CORS headers.
 * But fetch → blob → objectURL always works for canvas.
 */
export async function preloadDexLogosAsync() {
  const loaded = new Map();

  const loadOne = async (name, urls) => {
    for (const url of urls) {
      if (!url) continue;
      try {
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) continue;
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = objectUrl;
        });
        loaded.set(name, img);
        return; // success
      } catch {
        continue; // try next URL
      }
    }
    // All URLs failed — try direct Image load (some work without fetch CORS)
    for (const url of urls) {
      if (!url) continue;
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
        loaded.set(name, img);
        return;
      } catch {
        continue;
      }
    }
  };

  // Load all in parallel
  await Promise.allSettled(
    Object.entries(DEX_LOGOS).map(([name, url]) => {
      const backupUrl = DEX_LOGOS_BACKUP[name];
      return loadOne(name, [url, backupUrl].filter(Boolean));
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
    const backupUrl = DEX_LOGOS_BACKUP[name];
    const urls = [url, backupUrl].filter(Boolean);

    const tryLoad = (idx) => {
      if (idx >= urls.length) return;
      
      // Try fetch → blob → objectURL first
      fetch(urls[idx], { mode: 'cors' })
        .then(res => {
          if (!res.ok) throw new Error('not ok');
          return res.blob();
        })
        .then(blob => {
          const objectUrl = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => loaded.set(name, img);
          img.onerror = () => tryLoad(idx + 1);
          img.src = objectUrl;
        })
        .catch(() => {
          // Fallback: try direct load
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => loaded.set(name, img);
          img.onerror = () => tryLoad(idx + 1);
          img.src = urls[idx];
        });
    };

    tryLoad(0);
  });

  return loaded;
}
