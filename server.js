require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { fetchAndCacheAllData } = require('./src/dataFetcher');
const { getCache, isCacheStale } = require('./src/cache');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────

// Main endpoint – returns merged player data
app.get('/api/players', async (req, res) => {
  try {
    let data = getCache();

    // If cache is empty or stale (>23h old), refresh now
    if (!data || isCacheStale()) {
      console.log('[API] Cache stale or empty — refreshing...');
      data = await fetchAndCacheAllData();
    }

    // Query params for server-side filtering
    const { pos, contract, minCap, maxCap, search, sortBy, sortDir, limit } = req.query;
    let players = [...data.players];

    if (pos) players = players.filter(p => p.position === pos);
    if (contract) players = players.filter(p => p.contractType === contract);
    if (minCap) players = players.filter(p => p.capHit >= Number(minCap));
    if (maxCap) players = players.filter(p => p.capHit <= Number(maxCap));
    if (search) {
      const s = search.toLowerCase();
      players = players.filter(p =>
        p.name.toLowerCase().includes(s) || p.team.toLowerCase().includes(s)
      );
    }

    const col = sortBy || 'points';
    const dir = sortDir === 'asc' ? 1 : -1;
    players.sort((a, b) => {
      const av = a[col] ?? -Infinity;
      const bv = b[col] ?? -Infinity;
      return typeof av === 'string' ? av.localeCompare(bv) * dir : (av - bv) * dir;
    });

    if (limit) players = players.slice(0, Number(limit));

    res.json({
      ok: true,
      updatedAt: data.updatedAt,
      season: data.season,
      count: players.length,
      players,
    });
  } catch (err) {
    console.error('[/api/players]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Force a manual refresh (useful for testing / manual trigger)
app.post('/api/refresh', async (req, res) => {
  const secret = req.headers['x-refresh-secret'];
  if (process.env.REFRESH_SECRET && secret !== process.env.REFRESH_SECRET) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  try {
    console.log('[API] Manual refresh triggered');
    const data = await fetchAndCacheAllData();
    res.json({ ok: true, updatedAt: data.updatedAt, count: data.players.length });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const cache = getCache();
  res.json({
    ok: true,
    uptime: process.uptime(),
    cacheAge: cache ? Math.round((Date.now() - new Date(cache.updatedAt).getTime()) / 60000) + ' min' : 'no cache',
    playerCount: cache?.players?.length ?? 0,
  });
});

// ─── Cron: refresh daily at 7am ET ────────────────────────────────────────
cron.schedule('0 7 * * *', async () => {
  console.log('[CRON] Daily refresh starting...');
  try {
    const data = await fetchAndCacheAllData();
    console.log(`[CRON] Done — ${data.players.length} players cached at ${data.updatedAt}`);
  } catch (err) {
    console.error('[CRON] Refresh failed:', err.message);
  }
}, { timezone: 'America/Toronto' });

// ─── Boot ─────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🏒 NHL Value Tracker API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Data:   http://localhost:${PORT}/api/players\n`);

  // Warm cache on startup
  if (!getCache()) {
    console.log('[Boot] No cache found — warming up...');
    try {
      await fetchAndCacheAllData();
    } catch (err) {
      console.warn('[Boot] Initial fetch failed:', err.message);
    }
  }
});
