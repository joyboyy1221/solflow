export const config = {
  supportsResponseStreaming: true,
};

export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const dataKey = process.env.SOLAMI_DATA_KEY || process.env.VITE_SOLAMI_DATA_KEY || 'sk_0_h0c-ej0GMLeICeCJTRB0BHJW1oXK7PnZVeKb8Z_KQ';

  const wsUrl = `wss://ws.solami.dev/data/subscribe?chain=solana&api_key=${dataKey}`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({
      filter: {
        types: ['swap'],
        min_volume_usd: 1.0,
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

  ws.onerror = (err) => {
    res.write(`data: ${JSON.stringify({ error: 'WebSocket error' })}\n\n`);
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
