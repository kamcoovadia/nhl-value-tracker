const axios = require('axios');
const { CAP_DATA, CORSI_DATA, WAR_DATA } = require('./capData');
const { saveToCache } = require('./cache');

const NHL_API = 'https://api-web.nhle.com/v1';
const SEASON = '20242025';

function normalisePos(pos) {
  if (!pos) return '—';
  const map = { F: 'F', C: 'C', L: 'LW', R: 'RW', D: 'D', G: 'G',
                LW: 'LW', RW: 'RW', Left: 'LW', Right: 'RW', Center: 'C' };
  return map[pos] || pos.toUpperCase();
}

// Primary: api.nhle.com stats endpoint (more stable)
async function fetchFromStatsAPI() {
  const url = `https://api.nhle.com/stats/rest/en/skater/summary?isAggregate=false&isGame=false&sort=%5B%7B%22property%22%3A%22points%22%2C%22direction%22%3A%22DESC%22%7D%5D&start=0&limit=100&cayenneExp=seasonId=${SEASON}%20and%20gameTypeId=2`;
  try {
    const { data } = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      }
    });
    return data.data || [];
  } catch (err) {
    console.error('[Stats API] Failed:', err.message);
    return [];
  }
}

// Fallback: api-web.nhle.com summary endpoint
async function fetchFromWebAPI() {
  const url = `${NHL_API}/skater/summary?cayenneExp=seasonId=${SEASON}%20and%20gameTypeId=2&sort=points&dir=DESC&start=0&limit=100`;
  try {
    const { data } = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });
    return data.data || [];
  } catch (err) {
    console.error('[Web API] Failed:', err.message);
    return [];
  }
}

async function fetchAndCacheAllData() {
  console.log('[Fetcher] Starting NHL data pull...');

  // Try stats API first (most reliable)
  let skaters = await fetchFromStatsAPI();
  console.log(`[Fetcher] Stats API returned: ${skaters.length} skaters`);

  // Fallback to web API
  if (skaters.length < 10) {
    console.log('[Fetcher] Trying web API fallback...');
    skaters = await fetchFromWebAPI();
    console.log(`[Fetcher] Web API returned: ${skaters.length} skaters`);
  }

  // Last resort: seed from cap data so site isn't empty
  if (skaters.length < 5) {
    console.log('[Fetcher] Both APIs failed — seeding from cap data...');
    skaters = Object.entries(CAP_DATA).map(([id, info]) => ({
      playerId: Number(id),
      skaterFullName: info.name,
      teamAbbrevs: '—',
      positionCode: 'F',
      gamesPlayed: 0,
      goals: 0,
      assists: 0,
      points: 0,
      plusMinus: 0,
    }));
  }

  // Normalise into a common shape
  const playerMap = {};
  skaters.forEach(p => {
    const id = String(p.playerId || p.id);
    const firstName = p.firstName?.default || p.firstName || '';
    const lastName  = p.lastName?.default  || p.lastName  || '';
    const fullName  = p.skaterFullName || `${firstName} ${lastName}`.trim();

    playerMap[id] = {
      id,
      name:        fullName,
      team:        p.teamAbbrevs || p.teamAbbrev || '—',
      position:    normalisePos(p.positionCode || p.position),
      gamesPlayed: p.gamesPlayed || 0,
      goals:       p.goals       || 0,
      assists:     p.assists     || 0,
      points:      p.points      || 0,
      plusMinus:   p.plusMinus   || 0,
    };
  });

  // Merge cap/corsi/WAR and compute value metrics
  const players = Object.values(playerMap).map(p => {
    const capInfo = CAP_DATA[p.id];
    const capHit  = capInfo?.cap ?? null;
    const capM    = capHit ? capHit / 1_000_000 : null;
    const corsi   = CORSI_DATA[p.id] ?? null;
    const war     = WAR_DATA[p.id]   ?? null;

    return {
      id:            p.id,
      name:          p.name,
      team:          p.team,
      position:      p.position,
      gamesPlayed:   p.gamesPlayed,
      goals:         p.goals,
      assists:       p.assists,
      points:        p.points,
      plusMinus:     p.plusMinus,
      corsi,
      war,
      capHit,
      capHitM:       capM ? parseFloat(capM.toFixed(4)) : null,
      contractType:  capInfo?.type   ?? null,
      contractYears: capInfo?.years  ?? null,
      contractExpiry:capInfo?.expiry ?? null,
      gpValue:  capM && p.goals    ? parseFloat((p.goals    / capM).toFixed(2)) : null,
      apValue:  capM && p.assists  ? parseFloat((p.assists  / capM).toFixed(2)) : null,
      ptValue:  capM && p.points   ? parseFloat((p.points   / capM).toFixed(2)) : null,
      warPerM:  capM && war        ? parseFloat((war        / capM).toFixed(2)) : null,
    };
  });

  const withCap = players
    .filter(p => p.capHit)
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0));

  console.log(`[Fetcher] Done — ${withCap.length} players with cap data`);

  const payload = { updatedAt: new Date().toISOString(), season: SEASON, players: withCap };
  saveToCache(payload);
  return payload;
}

module.exports = { fetchAndCacheAllData };
