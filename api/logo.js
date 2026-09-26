/**
 * Image proxy — fetches external images server-side to bypass CORS.
 * Usage: /api/logo?url=https://example.com/logo.png
 */
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 SolFlow/1.0',
        'Accept': 'image/*,*/*',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Upstream ${response.status}` });
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
