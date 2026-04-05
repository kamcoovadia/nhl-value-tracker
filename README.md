# 🏒 NHL Value Tracker — Backend API

A Node.js/Express backend that pulls live player stats from the NHL public API,
merges them with curated cap hit data, and exposes a clean JSON endpoint for the
NHL Value Tracker frontend. The data refreshes automatically every morning at 7am ET.

---

## Project Structure

```
nhl-backend/
├── server.js              # Express app + cron scheduler
├── src/
│   ├── dataFetcher.js     # NHL API fetch + data merge logic
│   ├── capData.js         # Cap hits, Corsi, WAR reference data
│   └── cache.js           # In-memory + disk cache manager
├── data/
│   └── cache.json         # Auto-generated cache file (gitignored)
├── public/
│   └── index.html         # Frontend (copy of the NHL Value Tracker UI)
├── render.yaml            # One-click Render.com deploy config
├── .env.example           # Environment variable template
└── README.md
```

---

## Quick Start (Local)

**Requirements:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env if needed (defaults work fine locally)

# 3. Start the server
npm start

# Dev mode (auto-restarts on file changes):
npm run dev
```

The API will be available at `http://localhost:3001`.

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/players` | All player data (supports query params) |
| GET | `/api/health` | Server status + cache age |
| POST | `/api/refresh` | Force a data refresh (requires `x-refresh-secret` header) |

**Query params for `/api/players`:**

| Param | Example | Description |
|-------|---------|-------------|
| `pos` | `C`, `LW`, `RW`, `D` | Filter by position |
| `contract` | `UFA`, `RFA`, `ELC`, `Ext` | Filter by contract type |
| `minCap` | `5000000` | Minimum cap hit (USD) |
| `maxCap` | `10000000` | Maximum cap hit (USD) |
| `search` | `McDavid` | Search by name or team |
| `sortBy` | `points`, `ptValue`, `capHit` | Sort column |
| `sortDir` | `asc`, `desc` | Sort direction |
| `limit` | `25` | Max results returned |

---

## Deploy to Render (Free — Recommended)

Render's free tier is perfect for this — 750 hours/month, auto-deploys from GitHub.

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/nhl-value-tracker.git
git push -u origin main
```

### Step 2 — Deploy on Render

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` — just click **Create Web Service**
5. Your API will be live at `https://nhl-value-tracker-api.onrender.com`

> **Note:** Free tier spins down after 15 min of inactivity. First request after idle takes ~30s.
> To avoid this, use [UptimeRobot](https://uptimerobot.com) (free) to ping `/api/health` every 10 min.

### Step 3 — Point the frontend at your API

Open `public/index.html` and find this line near the top of the `<script>` block:

```js
const API_BASE = window.NHL_API_BASE || 'http://localhost:3001';
```

Change it to your Render URL:

```js
const API_BASE = window.NHL_API_BASE || 'https://YOUR-APP.onrender.com';
```

Or, if you host the frontend separately (Vercel, GitHub Pages, Netlify), you can
set `window.NHL_API_BASE` in a separate config script before loading the page.

---

## Alternative: Deploy to Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

Railway also has a free tier and doesn't spin down.

---

## How Daily Updates Work

The cron job in `server.js` runs at **7:00am ET every day**:

```js
cron.schedule('0 7 * * *', async () => {
  await fetchAndCacheAllData();
}, { timezone: 'America/Toronto' });
```

On each refresh:
1. Pulls goals/assists/points leaderboards from `api-web.nhle.com`
2. Merges with cap data in `src/capData.js`
3. Computes value metrics (G/$M, A/$M, Pts/$M, WAR/$M)
4. Writes to memory cache + `data/cache.json` on disk

The disk cache means the server survives restarts without needing to re-fetch.

---

## Updating Cap Data

Cap hits don't change mid-season, but you'll want to update `src/capData.js` each offseason.

**Sources:**
- Cap hits & contract types → [PuckPedia.com](https://puckpedia.com) (free, no scraping needed — just look up)
- Corsi (CF%) → [NaturalStatTrick.com](https://naturalstattrick.com) → Skaters → All Situations
- WAR → [EvolvingHockey.com](https://evolving-hockey.com) → Models → WAR

Each player entry in `CAP_DATA` looks like:

```js
8478402: { name: 'Connor McDavid', cap: 12500000, type: 'Ext', years: 7, expiry: 'UFA' },
```

The key is the **NHL player ID** — find it in any `api-web.nhle.com` response or from the
player's page URL on `nhl.com/player/connor-mcdavid-8478402`.

---

## Force a Manual Refresh

```bash
curl -X POST http://localhost:3001/api/refresh \
  -H "x-refresh-secret: your-secret-from-env"
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `REFRESH_SECRET` | — | Protects the `/api/refresh` endpoint |

---

## Tech Stack

- **Express** — HTTP server + routing
- **node-cron** — Daily refresh scheduler
- **axios** — NHL API requests
- **cors** — Cross-origin headers for the frontend
- **dotenv** — Environment config
