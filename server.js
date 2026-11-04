const express = require('express');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const path = require('node:path');

const app = express();
const port = Number(process.env.PORT) || 3000;
const apiKey = process.env.BRAVE_API_KEY;

// Render and similar hosts terminate HTTPS at their proxy.
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1 hour' }));

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many searches. Please wait a minute and try again.' }
});

app.get('/api/search', searchLimiter, async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  if (!query || query.length > 200) {
    return res.status(400).json({ error: 'Enter a search of 1–200 characters.' });
  }

  if (!apiKey) {
    return res.status(503).json({ error: 'Search is not configured yet. Add the BRAVE_API_KEY environment variable.' });
  }

  try {
    const url = new URL('https://api.search.brave.com/res/v1/web/search');
    url.searchParams.set('q', query);
    url.searchParams.set('count', '10');

    const upstream = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'X-Subscription-Token': apiKey
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!upstream.ok) {
      console.error(`Search provider returned HTTP ${upstream.status}`);
      return res.status(502).json({ error: 'The search provider could not complete this search.' });
    }

    const data = await upstream.json();
    const results = (data.web?.results || []).slice(0, 10).map((item) => ({
      title: typeof item.title === 'string' ? item.title : 'Untitled result',
      url: typeof item.url === 'string' ? item.url : '',
      description: typeof item.description === 'string' ? item.description : ''
    })).filter((item) => {
      try {
        return ['http:', 'https:'].includes(new URL(item.url).protocol);
      } catch {
        return false;
      }
    });

    res.set('Cache-Control', 'no-store');
    return res.json({ query, results });
  } catch (error) {
    console.error('Search request failed:', error.name || 'unknown error');
    return res.status(502).json({ error: 'Search is temporarily unavailable. Please try again.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Ohio Search listening on port ${port}`);
});
