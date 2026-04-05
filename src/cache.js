const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, '../data/cache.json');
const CACHE_TTL_HOURS = 23;

let memoryCache = null;

// Load from disk on startup
function loadFromDisk() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf8');
      memoryCache = JSON.parse(raw);
      console.log(`[Cache] Loaded from disk — ${memoryCache.players?.length} players, updated ${memoryCache.updatedAt}`);
    }
  } catch (err) {
    console.warn('[Cache] Could not load disk cache:', err.message);
  }
}

function saveToCache(data) {
  memoryCache = data;
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
    console.log(`[Cache] Saved to disk — ${data.players.length} players`);
  } catch (err) {
    console.warn('[Cache] Could not write disk cache:', err.message);
  }
}

function getCache() {
  if (!memoryCache) loadFromDisk();
  return memoryCache;
}

function isCacheStale() {
  const cache = getCache();
  if (!cache?.updatedAt) return true;
  const ageMs = Date.now() - new Date(cache.updatedAt).getTime();
  return ageMs > CACHE_TTL_HOURS * 60 * 60 * 1000;
}

function clearCache() {
  memoryCache = null;
  try { fs.unlinkSync(CACHE_FILE); } catch (_) {}
}

module.exports = { getCache, saveToCache, isCacheStale, clearCache };
