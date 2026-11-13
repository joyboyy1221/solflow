export const config = {
  supportsResponseStreaming: true,
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const dataKey = process.env.SOLAMI_DATA_KEY || process.env.VITE_SOLAMI_DATA_KEY
    || process.env.SOLAMI_API_KEY || process.env.VITE_SOLAMI_API_KEY;
  if (!dataKey) {
    // A non-200 reply makes the browser's EventSource fail, so the client
    // never mistakes a keyless server for a live stream.
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'SOLAMI_DATA_KEY / SOLAMI_API_KEY is not set on the server' }));
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  const wsUrl = `wss://ws.solami.dev/data/subscribe?chain=solana&api_key=${dataKey}`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    // Subscribe to ALL event types — swap, surge, radar, graduation, token_create, liquidity
    ws.send(JSON.stringify({
      filter: {
        types: ['swap', 'surge', 'radar', 'graduation', 'token_create', 'liquidity'],
        min_volume_usd: 0.5,
      }
    }));
    res.write(`data: ${JSON.stringify({ status: 'connected', live: true })}\n\n`);
  };

  ws.onmessage = (event) => {
    try {
      const str = typeof event.data === 'string' ? event.data : String(event.data);
      res.write(`data: ${str}\n\n`);
    } catch (e) {
      /* ignore */
    }
  };

  ws.onerror = () => {
    res.write(`data: ${JSON.stringify({ status: 'error', error: 'Upstream Solami WebSocket error' })}\n\n`);
  };

  ws.onclose = () => {
    res.write(`data: ${JSON.stringify({ status: 'disconnected' })}\n\n`);
    res.end();
  };

  req.on('close', () => {
    if (ws.readyState === 1 || ws.readyState === 0) {
      ws.close();
    }
  });
}
