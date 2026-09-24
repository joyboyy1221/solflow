/* ── Dynamic Token Logo System ──
   Fetches logos for ANY Solana token dynamically.
   1. Checks local cache first
   2. Falls back to Jupiter Token API
   3. Generates colored avatar as final fallback
*/

// Well-known token logos (instant, no API call needed)
const STATIC_LOGOS = {
  'SOL': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  'USDC': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  'USDT': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
  'JUP': 'https://static.jup.ag/jup/icon.png',
  'RAY': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
  'ORCA': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png',
  'BONK': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png',
  'WIF': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm/logo.png',
  'PYTH': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3/logo.png',
  'JTO': 'https://metadata.jito.network/token/jto/icon.png',
  'RENDER': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof/logo.png',
  'HNT': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux/logo.png',
  'TENSOR': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/TNSRxcUxoT9xBG3de7PiJyTDYuBCeYdbXiFiYiMvL65/logo.png',
  'MNDE': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey/logo.png',
  'DRIFT': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DriFtupTwUdADy77pSuMvuKmTCDMot7XKv4L4txAc4V/logo.png',
  'W': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/85VBFQZCsyStjMC2rCGUWhWrXxAZjzJhWCic532pJKp/logo.png',
  'MEW': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5/logo.png',
  'POPCAT': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7GCihgDB8Xi6KNjndpEXtx5LRQvN26tNoQPutM8zgpjL/logo.png',
  'KMNO': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS/logo.png',
  'PENGU': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4/logo.png',
  'GRASS': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Grassz2frJ98d1uQyQc5BfP7Wz1u7G8uQ2Xy9R8P8P8/logo.png',
  'AI16Z': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HeLp6NuKkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98888/logo.png',
  'MSOL': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
  'JITOSOL': 'https://storage.googleapis.com/token-metadata/JitoSOL-256.png',
  'BSOL': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1/logo.png',
  'SAMO': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU/logo.png',
  'FIDA': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EchesyfXePKdLtoiZSL8pBe8Myagfk7YJGvBGUcfW3uo/logo.png',
  'SRM': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt/logo.png',
  'STEP': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT/logo.png',
  'COPE': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh/logo.png',
  'MEDIA': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/ETAtLmCmsoiEEKfNrHKJ2kYy3MoABhU6NQvpSfij5tDs/logo.png',
  'ATLAS': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx/logo.png',
  'POLIS': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk/logo.png',
  'SLND': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SLNDpmoWTVADgEdndyvWzroNKDyadLDQQsfiRWMnHUSY/logo.png',
  'PORT': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/PoRTjZMPXb9T7dyU7tpLEZRQj7e6ssfAE62j2oQuc6y/logo.png',
};

// Dynamic cache: mint address → logo URL
const mintLogoCache = new Map();

// Symbol → logo URL dynamic cache (from Jupiter API)
const symbolLogoCache = new Map();

// Track failed lookups to avoid retrying
const failedSymbols = new Set();
const failedMints = new Set();

// Jupiter token list cache
let jupiterTokenList = null;
let jupiterFetchPromise = null;

/**
 * Fetch Jupiter's strict token list (top ~500 tokens with verified logos)
 */
async function fetchJupiterTokenList() {
  if (jupiterTokenList) return jupiterTokenList;
  if (jupiterFetchPromise) return jupiterFetchPromise;

  // Try multiple token list sources (Jupiter's old API is deprecated)
  const TOKEN_LIST_URLS = [
    'https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json',
    'https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json',
  ];

  jupiterFetchPromise = (async () => {
    for (const url of TOKEN_LIST_URLS) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const tokens = data.tokens || data;
        if (Array.isArray(tokens) && tokens.length > 0) {
          jupiterTokenList = tokens;
          tokens.forEach(t => {
            if (t.logoURI) {
              symbolLogoCache.set((t.symbol || '').toUpperCase(), t.logoURI);
              if (t.address) mintLogoCache.set(t.address, t.logoURI);
            }
          });
          console.log(`[SolFlow] Loaded ${tokens.length} token logos`);
          return tokens;
        }
      } catch (err) {
        continue;
      }
    }
    console.warn('[SolFlow] All token list sources failed, using built-in logos only');
    return [];
  })();

  return jupiterFetchPromise;
}

// Start fetching immediately on module load
fetchJupiterTokenList();

/**
 * Get token logo URL by symbol.
 * Checks: static map → Jupiter cache → returns null (fallback to avatar)
 */
export function getTokenLogo(symbol) {
  if (!symbol) return null;
  const upper = symbol.toUpperCase();

  // 1. Static logos (instant)
  if (STATIC_LOGOS[upper]) return STATIC_LOGOS[upper];

  // 2. Jupiter cache
  if (symbolLogoCache.has(upper)) return symbolLogoCache.get(upper);

  // 3. Failed before — don't retry
  if (failedSymbols.has(upper)) return null;

  return null;
}

/**
 * Get token logo URL by mint address.
 */
export function getTokenLogoByMint(mint) {
  if (!mint) return null;
  if (mintLogoCache.has(mint)) return mintLogoCache.get(mint);
  if (failedMints.has(mint)) return null;

  // Try fetching single token from Jupiter
  fetchSingleTokenLogo(mint);
  return null;
}

/**
 * Fetch a single token's logo from Jupiter by mint address
 */
async function fetchSingleTokenLogo(mint) {
  if (failedMints.has(mint) || mintLogoCache.has(mint)) return;

  try {
    const res = await fetch(`https://token.jup.ag/strict`);
    const tokens = await res.json();
    const token = tokens.find(t => t.address === mint);
    if (token?.logoURI) {
      mintLogoCache.set(mint, token.logoURI);
      symbolLogoCache.set(token.symbol.toUpperCase(), token.logoURI);
    } else {
      failedMints.add(mint);
    }
  } catch {
    failedMints.add(mint);
  }
}

/**
 * Register a token logo from external data (e.g., Blur events with logo URLs)
 */
export function registerTokenLogo(symbol, logoUrl) {
  if (symbol && logoUrl) {
    symbolLogoCache.set(symbol.toUpperCase(), logoUrl);
  }
}

/**
 * Register a logo by mint address
 */
export function registerMintLogo(mint, logoUrl) {
  if (mint && logoUrl) {
    mintLogoCache.set(mint, logoUrl);
  }
}

/**
 * Mark a logo as failed
 */
export function markLogoFailed(symbol) {
  if (symbol) failedSymbols.add(symbol.toUpperCase());
}

/**
 * Check if a logo exists
 */
export function hasTokenLogo(symbol) {
  if (!symbol) return false;
  const upper = symbol.toUpperCase();
  return STATIC_LOGOS[upper] !== undefined || symbolLogoCache.has(upper);
}
