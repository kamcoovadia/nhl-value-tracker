/**
 * Cap hit reference data — 2024-25 NHL season
 * Source: CapFriendly / PuckPedia
 *
 * Structure per player:
 *   cap        — annual cap hit in USD
 *   type       — UFA | RFA | ELC | Ext
 *   years      — years remaining on deal (after this season)
 *   expiry     — UFA or RFA on expiry
 */

const CAP_DATA = {
  // ── Forwards ─────────────────────────────────────────────────────────────
  8478402: { name: 'Connor McDavid',      cap: 12500000,  type: 'Ext', years: 7, expiry: 'UFA' },
  8477934: { name: 'Leon Draisaitl',      cap: 8500000,   type: 'UFA', years: 0, expiry: 'UFA' },
  8477492: { name: 'Nathan MacKinnon',    cap: 12600000,  type: 'Ext', years: 7, expiry: 'UFA' },
  8479318: { name: 'Auston Matthews',     cap: 13250000,  type: 'Ext', years: 3, expiry: 'UFA' },
  8476453: { name: 'Nikita Kucherov',     cap: 9500000,   type: 'UFA', years: 0, expiry: 'UFA' },
  8477956: { name: 'David Pastrnak',      cap: 11250000,  type: 'Ext', years: 7, expiry: 'UFA' },
  8478483: { name: 'Mitch Marner',        cap: 10893000,  type: 'UFA', years: 0, expiry: 'UFA' },
  8481533: { name: 'Matthew Tkachuk',     cap: 9500000,   type: 'Ext', years: 7, expiry: 'UFA' },
  8471675: { name: 'Sidney Crosby',       cap: 8700000,   type: 'Ext', years: 1, expiry: 'UFA' },
  8471214: { name: 'Alex Ovechkin',       cap: 9500000,   type: 'Ext', years: 4, expiry: 'UFA' },
  8482074: { name: 'Kirill Kaprizov',     cap: 9000000,   type: 'Ext', years: 7, expiry: 'UFA' },
  8482078: { name: 'Jason Robertson',     cap: 7750000,   type: 'Ext', years: 7, expiry: 'UFA' },
  8478550: { name: 'Artemi Panarin',      cap: 11642857,  type: 'Ext', years: 2, expiry: 'UFA' },
  8475167: { name: 'John Tavares',        cap: 11000000,  type: 'Ext', years: 2, expiry: 'UFA' },
  8481559: { name: 'Jack Hughes',         cap: 8000000,   type: 'Ext', years: 7, expiry: 'UFA' },
  8481528: { name: 'Brady Tkachuk',       cap: 8600000,   type: 'Ext', years: 6, expiry: 'UFA' },
  8477968: { name: 'Sam Reinhart',        cap: 8750000,   type: 'Ext', years: 7, expiry: 'UFA' },
  8484144: { name: 'Connor Bedard',       cap: 925000,    type: 'ELC', years: 2, expiry: 'RFA' },
  8482116: { name: 'Tim Stutzle',         cap: 8350000,   type: 'Ext', years: 7, expiry: 'UFA' },
  8478856: { name: 'Tage Thompson',       cap: 7142857,   type: 'Ext', years: 6, expiry: 'UFA' },
  8479344: { name: 'Brayden Point',       cap: 9500000,   type: 'Ext', years: 7, expiry: 'UFA' },
  8476468: { name: 'Mark Scheifele',      cap: 6125000,   type: 'Ext', years: 1, expiry: 'UFA' },
  8479334: { name: 'Travis Konecny',      cap: 5500000,   type: 'RFA', years: 0, expiry: 'RFA' },
  8477939: { name: 'William Nylander',    cap: 6962366,   type: 'Ext', years: 2, expiry: 'UFA' },
  8480314: { name: 'Aleksander Barkov',   cap: 10000000,  type: 'Ext', years: 7, expiry: 'UFA' },
  8478476: { name: 'Claude Giroux',       cap: 6500000,   type: 'UFA', years: 0, expiry: 'UFA' },
  8481600: { name: 'Cole Caufield',       cap: 7850000,   type: 'Ext', years: 7, expiry: 'UFA' },
  8481582: { name: 'Nick Suzuki',         cap: 7875000,   type: 'Ext', years: 7, expiry: 'UFA' },
  8480801: { name: 'Nico Hischier',       cap: 8500000,   type: 'Ext', years: 7, expiry: 'UFA' },
  8480762: { name: 'Elias Lindholm',      cap: 7700000,   type: 'UFA', years: 0, expiry: 'UFA' },
  8479339: { name: 'Mark Stone',          cap: 9500000,   type: 'Ext', years: 4, expiry: 'UFA' },
  8480027: { name: 'Sebastian Aho',       cap: 8454000,   type: 'Ext', years: 4, expiry: 'UFA' },
  8476887: { name: 'Blake Wheeler',       cap: 8250000,   type: 'UFA', years: 0, expiry: 'UFA' },
  8479999: { name: 'Jesper Bratt',        cap: 7875000,   type: 'Ext', years: 6, expiry: 'UFA' },
  8479425: { name: 'J.T. Miller',         cap: 8000000,   type: 'Ext', years: 4, expiry: 'UFA' },
  8476918: { name: 'Ryan Nugent-Hopkins', cap: 5125000,   type: 'Ext', years: 4, expiry: 'UFA' },
  8480785: { name: 'Kyle Connor',         cap: 7142857,   type: 'Ext', years: 3, expiry: 'UFA' },
  8479371: { name: 'Ivan Barbashev',      cap: 4750000,   type: 'Ext', years: 3, expiry: 'UFA' },
  8481607: { name: 'Dylan Cozens',        cap: 7100000,   type: 'Ext', years: 7, expiry: 'UFA' },

  // ── Defencemen ───────────────────────────────────────────────────────────
  8480069: { name: 'Cale Makar',          cap: 9000000,   type: 'Ext', years: 5, expiry: 'UFA' },
  8474600: { name: 'Roman Josi',          cap: 9059000,   type: 'Ext', years: 2, expiry: 'UFA' },
  8480787: { name: 'Evan Bouchard',       cap: 7900000,   type: 'Ext', years: 7, expiry: 'UFA' },
  8477346: { name: 'Victor Hedman',       cap: 7875000,   type: 'Ext', years: 1, expiry: 'UFA' },
  8481554: { name: 'Quinn Hughes',        cap: 7850000,   type: 'Ext', years: 7, expiry: 'UFA' },
  8480830: { name: 'Rasmus Dahlin',       cap: 8750000,   type: 'Ext', years: 7, expiry: 'UFA' },
  8476460: { name: 'Drew Doughty',        cap: 11000000,  type: 'Ext', years: 3, expiry: 'UFA' },
  8480797: { name: 'Miro Heiskanen',      cap: 8450000,   type: 'Ext', years: 7, expiry: 'UFA' },
  8479323: { name: 'Shea Theodore',       cap: 5200000,   type: 'Ext', years: 2, expiry: 'UFA' },
  8481533: { name: 'Zach Werenski',       cap: 4166667,   type: 'Ext', years: 3, expiry: 'UFA' },
  8478476: { name: 'Ryan Pulock',         cap: 5000000,   type: 'Ext', years: 5, expiry: 'UFA' },
  8481606: { name: 'Owen Power',          cap: 925000,    type: 'ELC', years: 2, expiry: 'RFA' },
  8480748: { name: 'Moritz Seider',       cap: 925000,    type: 'ELC', years: 1, expiry: 'RFA' },
  8482468: { name: 'Luke Hughes',         cap: 925000,    type: 'ELC', years: 2, expiry: 'RFA' },
};

// Corsi % (CF% All Situations) — Natural Stat Trick 2024-25 (min 20 GP)
const CORSI_DATA = {
  8478402: 57.2, 8477934: 56.1, 8477492: 58.4, 8479318: 55.8, 8476453: 54.3,
  8477956: 55.1, 8478483: 52.8, 8481533: 53.9, 8471675: 51.2, 8471214: 49.8,
  8482074: 54.6, 8482078: 55.3, 8478550: 51.7, 8475167: 50.4, 8481559: 54.9,
  8481528: 50.7, 8477968: 54.1, 8484144: 47.3, 8482116: 52.6, 8478856: 53.7,
  8479344: 57.1, 8476468: 52.1, 8479334: 51.8, 8477939: 53.4, 8480314: 56.5,
  8481600: 53.2, 8481582: 52.9, 8480801: 55.0, 8480027: 53.8, 8479999: 52.1,
  8479425: 52.7, 8480785: 54.3, 8481607: 50.8, 8480069: 56.7, 8474600: 53.8,
  8480787: 55.5, 8477346: 54.2, 8481554: 56.1, 8480830: 55.8, 8476460: 50.3,
  8480797: 54.9, 8479323: 53.4, 8481606: 52.3, 8480748: 53.1, 8482468: 54.7,
};

// WAR (Wins Above Replacement) — Evolving Hockey 2024-25
const WAR_DATA = {
  8478402: 8.4, 8477934: 6.2, 8477492: 7.8, 8479318: 6.9, 8476453: 5.8,
  8477956: 5.4, 8478483: 4.1, 8481533: 5.0, 8471675: 3.8, 8471214: 2.9,
  8482074: 5.7, 8482078: 5.1, 8478550: 4.6, 8475167: 3.2, 8481559: 5.3,
  8481528: 4.3, 8477968: 4.9, 8484144: 2.1, 8482116: 4.0, 8478856: 5.5,
  8479344: 6.1, 8476468: 3.4, 8479334: 3.7, 8477939: 3.9, 8480314: 6.0,
  8481600: 4.8, 8481582: 4.2, 8480801: 4.5, 8480027: 4.3, 8479999: 3.6,
  8479425: 3.8, 8480785: 4.1, 8481607: 3.5, 8480069: 6.3, 8474600: 4.8,
  8480787: 4.5, 8477346: 4.2, 8481554: 5.9, 8480830: 5.4, 8476460: 3.1,
  8480797: 5.2, 8479323: 3.3, 8481606: 2.8, 8480748: 3.0, 8482468: 3.2,
};

module.exports = { CAP_DATA, CORSI_DATA, WAR_DATA };
