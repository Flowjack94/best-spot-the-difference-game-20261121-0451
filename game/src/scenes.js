// The three rounds of "The Lighthouse Keeper's Evening". Each round names its
// palette, its time limit and its differences: every difference is a circle in
// panel coordinates (600 x 520, horizon at y 320) that is drawn one way in the
// left panel and another way in the right panel. The labels are what the
// found-list shows the player, never the answer in advance.
export const PANEL = { width: 600, height: 520, horizon: 320 };

export const ROUNDS = [
  {
    name: 'Round 1 — Dusk at Gull Rock',
    short: 'Dusk',
    timeLimit: 150,
    palette: {
      skyTop: '#2b2a55',
      skyMid: '#7a4a7d',
      skyLow: '#e8805a',
      seaTop: '#3d4a7a',
      seaDeep: '#232c52',
      celestial: '#ffb347',
      celestialGlow: 'rgba(255, 179, 71, 0.35)',
      sand: '#8a6f4d',
      grass: '#4a6b3a',
    },
    stars: 26,
    differences: [
      { id: 'window-light', label: 'The cottage window', x: 470, y: 255, r: 26 },
      { id: 'gull-extra', label: 'An extra gull', x: 330, y: 90, r: 26 },
      { id: 'sail-stripe', label: 'The boat sail', x: 255, y: 385, r: 30 },
      { id: 'smoke', label: 'Chimney smoke', x: 415, y: 175, r: 28 },
      { id: 'beam', label: 'The lighthouse beam', x: 150, y: 105, r: 30 },
      { id: 'star-lone', label: 'A lonely star', x: 205, y: 62, r: 22 },
      { id: 'flowers', label: 'The cottage flowers', x: 520, y: 305, r: 26 },
    ],
  },
  {
    name: 'Round 2 — Night Watch',
    short: 'Night',
    timeLimit: 150,
    palette: {
      skyTop: '#05081f',
      skyMid: '#101a44',
      skyLow: '#1d2f63',
      seaTop: '#0e1a3d',
      seaDeep: '#060a20',
      celestial: '#f4f1de',
      celestialGlow: 'rgba(244, 241, 222, 0.28)',
      sand: '#5d5346',
      grass: '#2c4630',
    },
    stars: 70,
    differences: [
      { id: 'moon-crater', label: 'A crater on the moon', x: 505, y: 72, r: 26 },
      { id: 'window-light', label: 'The cottage window', x: 470, y: 255, r: 26 },
      { id: 'flag', label: 'The lighthouse flag', x: 92, y: 62, r: 24 },
      { id: 'buoy', label: 'The buoy light', x: 430, y: 400, r: 26 },
      { id: 'fish', label: 'A jumping fish', x: 300, y: 420, r: 26 },
      { id: 'cat', label: 'The cat on the roof', x: 505, y: 200, r: 26 },
      { id: 'beam-left', label: 'Where the beam points', x: 60, y: 120, r: 30 },
      { id: 'lantern', label: 'The boat lantern', x: 255, y: 360, r: 26 },
      { id: 'star-lone', label: 'A lonely star', x: 205, y: 62, r: 22 },
    ],
  },
  {
    name: 'Round 3 — First Light',
    short: 'Dawn',
    timeLimit: 180,
    palette: {
      skyTop: '#7d9bd6',
      skyMid: '#f2a56b',
      skyLow: '#ffd98a',
      seaTop: '#5f7fae',
      seaDeep: '#33507a',
      celestial: '#ffe9a8',
      celestialGlow: 'rgba(255, 233, 168, 0.4)',
      sand: '#a8895f',
      grass: '#5d7d43',
    },
    stars: 8,
    differences: [
      { id: 'sun-rays', label: 'The sun rays', x: 505, y: 72, r: 28 },
      { id: 'cloud', label: 'An extra cloud', x: 300, y: 80, r: 30 },
      { id: 'window-light', label: 'The cottage window', x: 470, y: 255, r: 26 },
      { id: 'gull-extra', label: 'An extra gull', x: 330, y: 90, r: 26 },
      { id: 'sail-stripe', label: 'The boat sail', x: 255, y: 385, r: 30 },
      { id: 'smoke', label: 'Chimney smoke', x: 415, y: 175, r: 28 },
      { id: 'flowers', label: 'The cottage flowers', x: 520, y: 305, r: 26 },
      { id: 'door', label: 'The cottage door', x: 430, y: 285, r: 24 },
      { id: 'buoy', label: 'The buoy light', x: 430, y: 400, r: 26 },
      { id: 'bird', label: 'A bird in the sky', x: 205, y: 62, r: 22 },
    ],
  },
];

export const SCORE_FIND = 100;
export const SCORE_WRONG = 25;
export const WRONG_TIME_PENALTY = 5;
export const TIME_BONUS_PER_SECOND = 5;
export const HINTS_PER_ROUND = 3;
export const HINT_SHOW_MS = 2600;
