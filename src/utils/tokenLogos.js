/* ── Dynamic Token Logo System ──
   Fetches logos for ANY Solana token dynamically using TrustWallet & Jupiter CDNs
*/

// Well-known token logos (TrustWallet & Jupiter official CDNs — 100% CORS & hotlink safe)
const STATIC_LOGOS = {
  'SOL': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
  'USDC': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  'USDT': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
  'JUP': 'https://static.jup.ag/jup/icon.png',
  'RAY': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
  'ORCA': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png',
  'BONK': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png',
  'WIF': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm/logo.png',
  'PYTH': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3/logo.png',
  'JTO': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL/logo.png',
  'RENDER': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof/logo.png',
  'HNT': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux/logo.png',
  'TENSOR': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/TNSRxcUxoT9xBG3de7PiJyTDYuBCeYdbXiFiYiMvL65/logo.png',
  'MNDE': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey/logo.png',
  'DRIFT': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/DriFtupTwUdADy77pSuMvuKmTCDMot7XKv4L4txAc4V/logo.png',
  'W': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/85VBFQZCsyStjMC2rCGUWhWrXxAZjzJhWCic532pJKp/logo.png',
  'MEW': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5/logo.png',
  'POPCAT': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/7GCihgDB8Xi6KNjndpEXtx5LRQvN26tNoQPutM8zgpjL/logo.png',
  'KMNO': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS/logo.png',
  'PENGU': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4/logo.png',
  'GRASS': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/Grassz2frJ98d1uQyQc5BfP7Wz1u7G8uQ2Xy9R8P8P8/logo.png',
  'AI16Z': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/HeLp6NuKkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98888/logo.png',
  'MSOL': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
  'JITOSOL': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn/logo.png',
  'BSOL': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1/logo.png',
  'SAMO': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU/logo.png',
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
 * Fetch Jupiter's verified token list
 */
async function fetchJupiterTokenList() {
  if (jupiterTokenList) return jupiterTokenList;
  if (jupiterFetchPromise) return jupiterFetchPromise;

  const TOKEN_LIST_URLS = [
    'https://tokens.jup.ag/tokens?tags=verified',
    'https://token.jup.ag/all',
  ];

  jupiterFetchPromise = (async () => {
    for (const url of TOKEN_LIST_URLS) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const tokens = await res.json();
        if (Array.isArray(tokens) && tokens.length > 0) {
          jupiterTokenList = tokens;
          tokens.forEach(t => {
            if (t.logoURI) {
              const sym = (t.symbol || '').toUpperCase();
              if (!symbolLogoCache.has(sym)) symbolLogoCache.set(sym, t.logoURI);
              if (t.address) mintLogoCache.set(t.address, t.logoURI);
            }
          });
          console.log(`[SolFlow] Loaded ${tokens.length} verified token logos from Jupiter`);
          return tokens;
        }
      } catch (err) {
        continue;
      }
    }
    return [];
  })();

  return jupiterFetchPromise;
}

// Start fetching immediately on module load
fetchJupiterTokenList();

/**
 * Get token logo URL by symbol.
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

  fetchSingleTokenLogo(mint);
  return null;
}

async function fetchSingleTokenLogo(mint) {
  if (failedMints.has(mint) || mintLogoCache.has(mint)) return;

  try {
    const res = await fetch(`https://token.jup.ag/all`);
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

export function registerTokenLogo(symbol, logoUrl) {
  if (symbol && logoUrl) {
    symbolLogoCache.set(symbol.toUpperCase(), logoUrl);
  }
}

export function registerMintLogo(mint, logoUrl) {
  if (mint && logoUrl) {
    mintLogoCache.set(mint, logoUrl);
  }
}

export function markLogoFailed(symbol) {
  if (symbol) failedSymbols.add(symbol.toUpperCase());
}

export function hasTokenLogo(symbol) {
  if (!symbol) return false;
  const upper = symbol.toUpperCase();
  return STATIC_LOGOS[upper] !== undefined || symbolLogoCache.has(upper);
}
