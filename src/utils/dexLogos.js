/* ── DEX Logo URLs ── */

export const DEX_LOGOS = {
  'Jupiter': 'https://static.jup.ag/jup/icon.png',
  'Raydium': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
  'Orca': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png',
  'Meteora': 'https://app.meteora.ag/icons/logo.svg',
  'Pump.fun': 'https://pump.fun/icon.png',
  'Phoenix': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY/logo.png',
  'Lifinity': 'https://lifinity.io/logo-filled.svg',
};

/**
 * Preload DEX logo images for canvas rendering.
 * Returns a Map<string, HTMLImageElement> of loaded images.
 */
export function preloadDexLogos() {
  const loaded = new Map();
  const promises = [];

  Object.entries(DEX_LOGOS).forEach(([name, url]) => {
    const promise = new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loaded.set(name, img);
        resolve();
      };
      img.onerror = () => {
        // Failed to load — canvas will use letter fallback
        resolve();
      };
      img.src = url;
    });
    promises.push(promise);
  });

  // Don't block — return the map immediately, images load async
  Promise.all(promises);

  return loaded;
}
