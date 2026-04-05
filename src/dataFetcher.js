const axios = require('axios');
const { CAP_DATA, CORSI_DATA, WAR_DATA } = require('./capData');
const { saveToCache } = require('./cache');

const NHL_API = 'https://api-web.nhle.com/v1';
const SEASON = '20242025';
const GAME_TYPE = 2; // Regular season

// Fetch the top N leaders for a given stat category
async function fetchLeaders(category, limit = 50) {
  const url = `${NHL_API}/skater-stats-leaders/${SEASON}/${GAME_TYPE}?categories=${category}&limit=${limit}`;
  try {
    const { data } = await axios.get(url, { timeout: 10000 });
    // NHL API returns { [category]: [...players] }
    return data[category] || [];
  } catch (err) {
    console.error(`[NHL API] Failed to fetch ${category}:`, err.message);
    return [];
  }
}

// Fetch individual player profile (position etc) – used as fallback
async function fetchPlayerProfile(playerId) {
  try {
    const { data } = await axios.get(`${NHL_API}/player/${playerId}/landing`, { timeout: 8000 });
    return data;
  } catch (_) {
    return null;
  }
}

// Normalise position codes from the API
function normalisePos(pos) {
  if (!pos) return '—';
  const map = { F: 'F', C: 'C', L: 'LW', R: 'RW', D: 'D', G: 'G',
                 LW: 'LW', RW: 'RW', Left: 'LW', Right: 'RW', Center: 'C' };
  return map[pos] || pos.toUpperCase();
}

async function fetchAndCacheAllData() {
  console.log('[Fetcher] Starting NHL API pull...');

  // Pull three leaderboards in parallel
  const [goalLeaders, assistLeaders, pointLeaders] = await Promise.all([
    fetchLeaders('goals', 50),
    fetchLeaders('assists', 50),
    fetchLeaders('points', 50),
  ]);

  // Build unified player map keyed by playerId
  const playerMap = {};

  const merge = (leaders, statKey) => {
    leaders.forEach(p => {
      const id = String(p.playerId);
      if (!playerMap[id]) {
        playerMap[id] = {
          id,
          name: `${p.firstName?.default || ''} ${p.lastName?.default || ''}`.trim(),
          team: p.teamAbbrev || '—',
          position: normalisePos(p.position),
          gamesPlayed: p.gamesPlayed || 0,
          goals: 0,
          assists: 0,
          points: 0,
          plusMinus: 0,
        };
      }
      playerMap[id][statKey] = p[statKey] ?? 0;
      // Prefer the most complete gamesPlayed/plusMinus from any endpoint
      if ((p.gamesPlayed || 0) > playerMap[id].gamesPlayed) {
        playerMap[id].gamesPlayed = p.gamesPlayed;
      }
      playerMap[id].plusMinus = p.plusMinus ?? playerMap[id].plusMinus;
    });
  };

  merge(goalLeaders, 'goals');
  merge(assistLeaders, 'assists');
  merge(pointLeaders, 'points');

  console.log(`[Fetcher] Raw players from NHL API: ${Object.keys(playerMap).length}`);

  // Merge cap, corsi, WAR, and compute value metrics
  const players = Object.values(playerMap).map(p => {
    const capInfo = CAP_DATA[p.id];
    const capHit = capInfo?.cap ?? null;
    const capM = capHit ? capHit / 1_000_000 : null;
    const corsi = CORSI_DATA[p.id] ?? null;
    const war = WAR_DATA[p.id] ?? null;

    // Value metrics: per $1M of cap space
    const gpValue = capM && p.goals ? parseFloat((p.goals / capM).toFixed(2)) : null;
    const apValue = capM && p.assists ? parseFloat((p.assists / capM).toFixed(2)) : null;
    const ptValue = capM && p.points ? parseFloat((p.points / capM).toFixed(2)) : null;
    // WAR per $1M
    const warPerM = capM && war !== null ? parseFloat((war / capM).toFixed(2)) : null;

    return {
      id: p.id,
      name: p.name,
      team: p.team,
      position: p.position,
      gamesPlayed: p.gamesPlayed,
      goals: p.goals,
      assists: p.assists,
      points: p.points,
      plusMinus: p.plusMinus,
      corsi,
      war,
      capHit,
      capHitM: capM ? parseFloat(capM.toFixed(4)) : null,
      contractType: capInfo?.type ?? null,
      contractYears: capInfo?.years ?? null,
      contractExpiry: capInfo?.expiry ?? null,
      // Value metrics
      gpValue,
      apValue,
      ptValue,
      warPerM,
    };
  });

  // Sort by points desc by default
  players.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));

  const payload = {
    updatedAt: new Date().toISOString(),
    season: SEASON,
    players,
  };

  saveToCache(payload);
  console.log(`[Fetcher] Done — ${players.length} players cached.`);
  return payload;
}

module.exports = { fetchAndCacheAllData };
