import WebSocket from 'ws';

export const config = {
  supportsResponseStreaming: true,
};

export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const dataKey = process.env.SOLAMI_DATA_KEY || process.env.VITE_SOLAMI_DATA_KEY || '';
  if (!dataKey) {
    res.write(`data: ${JSON.stringify({ error: 'Missing SOLAMI_DATA_KEY environment variable' })}\n\n`);
    return res.end();
  }

  const wsUrl = `wss://ws.solami.dev/data/subscribe?chain=solana&api_key=${dataKey}`;
  const ws = new WebSocket(wsUrl);

  ws.on('open', () => {
    ws.send(JSON.stringify({
      filter: {
        types: ['swap'],
        min_volume_usd: 1.0,
      }
    }));
    res.write(`data: ${JSON.stringify({ status: 'connected', live: true })}\n\n`);
  });

  ws.on('message', (data) => {
    try {
      const str = data.toString();
      res.write(`data: ${str}\n\n`);
    } catch (e) {
      /* ignore */
    }
  });

  ws.on('error', (err) => {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  });

  ws.on('close', () => {
    res.write(`data: ${JSON.stringify({ status: 'disconnected' })}\n\n`);
    res.end();
  });

  req.on('close', () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  });
}
