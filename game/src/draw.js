// Draws one panel of the scene: a hand-placed coastal view (lighthouse, cottage,
// boat, gulls, pines) rendered from the round's palette. The left panel is the
// base scene; the right panel applies the round's differences, one per circle
// the round defines in scenes.js. Both panels share one seeded star field, so
// only the listed differences ever differ between them.
import { PANEL } from './scenes.js';
import { mulberry32, range } from './random.js';

const LIGHTHOUSE_X = 92;
const COTTAGE = { x: 385, y: 240, w: 175, h: 80 };
const BOAT = { x: 255, y: 400 };

function isRight(variant) {
  return variant === 1;
}

function differs(round, id, variant) {
  return isRight(variant) && round.differences.some((d) => d.id === id);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawSky(ctx, round, rng) {
  const { width, height, horizon } = PANEL;
  const gradient = ctx.createLinearGradient(0, 0, 0, horizon);
  gradient.addColorStop(0, round.palette.skyTop);
  gradient.addColorStop(0.55, round.palette.skyMid);
  gradient.addColorStop(1, round.palette.skyLow);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, horizon + 1);
  // Stars, one seeded field for both panels.
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < round.stars; i += 1) {
    const x = range(rng, 12, width - 12);
    const y = range(rng, 10, horizon - 70);
    const size = range(rng, 0.8, 2.2);
    ctx.globalAlpha = range(rng, 0.4, 1);
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;
}

function drawLoneStar(ctx, round, variant) {
  // Rounds 1 and 2 argue about a lonely star at (205, 62): present left, gone right.
  if (!round.differences.some((d) => d.id === 'star-lone')) return;
  if (differs(round, 'star-lone', variant)) return;
  ctx.fillStyle = '#fff8d0';
  const x = 205;
  const y = 62;
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 4; i += 1) {
    ctx.rotate(Math.PI / 2);
    ctx.moveTo(0, 0);
    ctx.lineTo(-2.5, -9);
    ctx.lineTo(0, -13);
    ctx.lineTo(2.5, -9);
    ctx.closePath();
  }
  ctx.fill();
  ctx.restore();
}

function drawBird(ctx, round, variant) {
  // Round 3 argues about a bird at the same spot instead: absent left, present right.
  if (!round.differences.some((d) => d.id === 'bird')) return;
  if (!differs(round, 'bird', variant)) return;
  drawGull(ctx, 205, 62, 1);
}

function drawCelestial(ctx, round, variant) {
  const cx = 505;
  const cy = 72;
  const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, 90);
  glow.addColorStop(0, round.palette.celestialGlow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - 90, cy - 90, 180, 180);
  // Sun rays, round 3: present left, gone right.
  if (round.differences.some((d) => d.id === 'sun-rays') && !differs(round, 'sun-rays', variant)) {
    ctx.strokeStyle = round.palette.celestial;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2;
      const x1 = cx + Math.cos(angle) * 40;
      const y1 = cy + Math.sin(angle) * 40;
      const x2 = cx + Math.cos(angle) * 52;
      const y2 = cy + Math.sin(angle) * 52;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
  ctx.fillStyle = round.palette.celestial;
  ctx.beginPath();
  ctx.arc(cx, cy, 30, 0, Math.PI * 2);
  ctx.fill();
  // Moon crater, round 2: present left, gone right.
  if (round.differences.some((d) => d.id === 'moon-crater') && !differs(round, 'moon-crater', variant)) {
    ctx.fillStyle = 'rgba(180, 175, 150, 0.8)';
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 6, 6, 0, Math.PI * 2);
    ctx.arc(cx + 9, cy + 9, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawClouds(ctx, round, variant, rng) {
  const clouds = [
    { x: 140, y: 60, s: 1 },
    { x: 430, y: 130, s: 0.8 },
  ];
  ctx.fillStyle = 'rgba(255, 244, 230, 0.75)';
  for (const cloud of clouds) drawCloud(ctx, cloud.x, cloud.y, cloud.s);
  // Extra cloud, round 3: present left, gone right.
  if (round.differences.some((d) => d.id === 'cloud') && !differs(round, 'cloud', variant)) {
    ctx.fillStyle = 'rgba(255, 244, 230, 0.85)';
    drawCloud(ctx, 300, 80, 1.1);
  }
}

function drawCloud(ctx, x, y, s) {
  ctx.beginPath();
  ctx.arc(x, y, 16 * s, 0, Math.PI * 2);
  ctx.arc(x + 18 * s, y - 6 * s, 14 * s, 0, Math.PI * 2);
  ctx.arc(x + 36 * s, y, 15 * s, 0, Math.PI * 2);
  ctx.arc(x + 18 * s, y + 6 * s, 14 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawGull(ctx, x, y, s) {
  ctx.strokeStyle = '#20242e';
  ctx.lineWidth = 2.2 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 9 * s, y);
  ctx.quadraticCurveTo(x - 4 * s, y - 6 * s, x, y);
  ctx.quadraticCurveTo(x + 4 * s, y - 6 * s, x + 9 * s, y);
  ctx.stroke();
}

function drawGulls(ctx, round, variant) {
  drawGull(ctx, 150, 130, 1);
  drawGull(ctx, 250, 70, 0.85);
  drawGull(ctx, 420, 110, 0.9);
  // Extra gull: present left, gone right.
  if (round.differences.some((d) => d.id === 'gull-extra') && !differs(round, 'gull-extra', variant)) {
    drawGull(ctx, 330, 90, 1);
  }
}

function drawSea(ctx, round, rng) {
  const { width, height, horizon } = PANEL;
  const gradient = ctx.createLinearGradient(0, horizon, 0, height);
  gradient.addColorStop(0, round.palette.seaTop);
  gradient.addColorStop(1, round.palette.seaDeep);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, horizon, width, height - horizon);
  // Moon/sun glitter on the water.
  ctx.fillStyle = round.palette.celestial;
  for (let i = 0; i < 14; i += 1) {
    const y = horizon + 12 + i * 12;
    const w = 26 + range(rng, 0, 60) * (1 - i / 18);
    ctx.globalAlpha = 0.5 - i * 0.03;
    ctx.fillRect(505 - w / 2, y, w, 2.5);
  }
  ctx.globalAlpha = 1;
  // Wave lines.
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i += 1) {
    const y = horizon + 34 + i * 22;
    const x = range(rng, 20, 420);
    const len = range(rng, 40, 130);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len / 2, y - 4, x + len, y);
    ctx.stroke();
  }
}

function drawLand(ctx, round) {
  const { width, horizon } = PANEL;
  // The headland the lighthouse and cottage stand on.
  ctx.fillStyle = round.palette.grass;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(0, 296);
  ctx.quadraticCurveTo(180, 272, 330, 292);
  ctx.quadraticCurveTo(470, 306, width, 288);
  ctx.lineTo(width, horizon);
  ctx.closePath();
  ctx.fill();
  // Sandy shore at the waterline.
  ctx.fillStyle = round.palette.sand;
  ctx.fillRect(0, horizon - 2, width, 8);
}

function drawPines(ctx) {
  const pines = [
    { x: 305, y: 296, s: 1 },
    { x: 345, y: 300, s: 0.8 },
  ];
  for (const pine of pines) {
    ctx.fillStyle = '#2c4a2a';
    ctx.beginPath();
    ctx.moveTo(pine.x, pine.y - 52 * pine.s);
    ctx.lineTo(pine.x - 20 * pine.s, pine.y);
    ctx.lineTo(pine.x + 20 * pine.s, pine.y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#37592f';
    ctx.beginPath();
    ctx.moveTo(pine.x, pine.y - 72 * pine.s);
    ctx.lineTo(pine.x - 14 * pine.s, pine.y - 28 * pine.s);
    ctx.lineTo(pine.x + 14 * pine.s, pine.y - 28 * pine.s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5d4026';
    ctx.fillRect(pine.x - 3 * pine.s, pine.y - 8, 6 * pine.s, 10);
  }
}

function drawLighthouse(ctx, round, variant) {
  const x = LIGHTHOUSE_X;
  const base = PANEL.horizon;
  // Beam first, behind the tower: on in the left panel, off in the right
  // (round 1), or pointing left vs right (round 2's 'beam-left').
  const beamOff = round.differences.some((d) => d.id === 'beam') && differs(round, 'beam', variant);
  const beamRight = round.differences.some((d) => d.id === 'beam-left') && differs(round, 'beam-left', variant);
  if (!beamOff) {
    const direction = beamRight ? 1 : -1;
    const lampY = 82;
    const beam = ctx.createLinearGradient(x, lampY, x + direction * 230, lampY + 40);
    beam.addColorStop(0, 'rgba(255, 240, 170, 0.55)');
    beam.addColorStop(1, 'rgba(255, 240, 170, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(x, lampY - 8);
    ctx.lineTo(x + direction * 230, lampY - 34);
    ctx.lineTo(x + direction * 230, lampY + 74);
    ctx.lineTo(x, lampY + 8);
    ctx.closePath();
    ctx.fill();
  }
  // Tower: red and white bands.
  ctx.fillStyle = '#e8e2d4';
  ctx.beginPath();
  ctx.moveTo(x - 26, base);
  ctx.lineTo(x - 18, 96);
  ctx.lineTo(x + 18, 96);
  ctx.lineTo(x + 26, base);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.moveTo(x - 23.5, base - 42);
  ctx.lineTo(x - 20.5, base - 84);
  ctx.lineTo(x + 20.5, base - 84);
  ctx.lineTo(x + 23.5, base - 42);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.moveTo(x - 20, 150);
  ctx.lineTo(x - 18, 118);
  ctx.lineTo(x + 18, 118);
  ctx.lineTo(x + 20, 150);
  ctx.closePath();
  ctx.fill();
  // Lamp room and cap.
  ctx.fillStyle = '#2c3242';
  ctx.fillRect(x - 20, 70, 40, 28);
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(x - 15, 74, 30, 20);
  ctx.fillStyle = '#2c3242';
  ctx.beginPath();
  ctx.moveTo(x - 24, 70);
  ctx.lineTo(x, 54);
  ctx.lineTo(x + 24, 70);
  ctx.closePath();
  ctx.fill();
  // Flag, round 2: red left, green right.
  if (round.differences.some((d) => d.id === 'flag')) {
    ctx.strokeStyle = '#2c3242';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 54);
    ctx.lineTo(x, 40);
    ctx.stroke();
    ctx.fillStyle = differs(round, 'flag', variant) ? '#27ae60' : '#c0392b';
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x + 22, 46);
    ctx.lineTo(x, 52);
    ctx.closePath();
    ctx.fill();
  }
  // Door at the tower foot.
  ctx.fillStyle = '#4a3220';
  roundRect(ctx, x - 8, base - 30, 16, 30, 3);
  ctx.fill();
}

function drawCottage(ctx, round, variant) {
  const { x, y, w, h } = COTTAGE;
  const base = y + h;
  // Walls.
  ctx.fillStyle = '#f2e3c2';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#8a6f4d';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  // Roof.
  ctx.fillStyle = '#a8433a';
  ctx.beginPath();
  ctx.moveTo(x - 12, y);
  ctx.lineTo(x + w / 2, y - 38);
  ctx.lineTo(x + w + 12, y);
  ctx.closePath();
  ctx.fill();
  // Chimney.
  ctx.fillStyle = '#7a6a5a';
  ctx.fillRect(x + w - 32, y - 52, 18, 56);
  // Smoke, rounds 1 and 3: present left, gone right.
  if (round.differences.some((d) => d.id === 'smoke') && !differs(round, 'smoke', variant)) {
    ctx.fillStyle = 'rgba(240, 240, 240, 0.75)';
    const puffs = [
      { dx: 4, dy: -62, r: 9 },
      { dx: 12, dy: -76, r: 12 },
      { dx: 24, dy: -92, r: 15 },
    ];
    for (const puff of puffs) {
      ctx.beginPath();
      ctx.arc(x + w - 23 + puff.dx, y + puff.dy, puff.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // The cat on the roof, round 2: present left, gone right.
  if (round.differences.some((d) => d.id === 'cat') && !differs(round, 'cat', variant)) {
    ctx.fillStyle = '#2c2c34';
    ctx.beginPath();
    ctx.ellipse(x + 118, y - 12, 12, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 128, y - 20, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 124, y - 25);
    ctx.lineTo(x + 126, y - 30);
    ctx.lineTo(x + 128, y - 25);
    ctx.closePath();
    ctx.fill();
  }
  // Window: lit left, dark right.
  const lit = !differs(round, 'window-light', variant);
  ctx.fillStyle = lit ? '#ffd76a' : '#2c3242';
  ctx.fillRect(x + 67, y + 12, 36, 30);
  ctx.strokeStyle = '#8a6f4d';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 67, y + 12, 36, 30);
  ctx.beginPath();
  ctx.moveTo(x + 85, y + 12);
  ctx.lineTo(x + 85, y + 42);
  ctx.moveTo(x + 67, y + 27);
  ctx.lineTo(x + 103, y + 27);
  ctx.stroke();
  // Door: closed left, open with light right (round 3); other rounds closed both.
  const doorOpen = round.differences.some((d) => d.id === 'door') && differs(round, 'door', variant);
  ctx.fillStyle = doorOpen ? '#ffd76a' : '#6b4a2f';
  roundRect(ctx, x + 33, y + 38, 26, 42, 3);
  ctx.fill();
  ctx.fillStyle = '#f2e3c2';
  ctx.beginPath();
  ctx.arc(x + 54, y + 60, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Flower bed at the cottage foot: red left, blue right.
  const flowerColour = differs(round, 'flowers', variant) ? '#5b8dd9' : '#d94f4f';
  for (let i = 0; i < 5; i += 1) {
    const fx = x + 128 + i * 10;
    const fy = base - 6 - (i % 2) * 4;
    ctx.strokeStyle = '#3f6b2f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fx, base);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    ctx.fillStyle = flowerColour;
    ctx.beginPath();
    ctx.arc(fx, fy - 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd76a';
    ctx.beginPath();
    ctx.arc(fx, fy - 3, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBoat(ctx, round, variant) {
  const { x, y } = BOAT;
  // Hull.
  ctx.fillStyle = '#6b4a2f';
  ctx.beginPath();
  ctx.moveTo(x - 42, y);
  ctx.lineTo(x + 42, y);
  ctx.lineTo(x + 30, y + 16);
  ctx.lineTo(x - 30, y + 16);
  ctx.closePath();
  ctx.fill();
  // Mast.
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 52);
  ctx.stroke();
  // Sail: white left, red-striped right.
  if (differs(round, 'sail-stripe', variant)) {
    ctx.fillStyle = '#e8e2d4';
    ctx.beginPath();
    ctx.moveTo(x, y - 50);
    ctx.lineTo(x, y - 4);
    ctx.lineTo(x + 34, y - 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(x + 12, y - 38);
    ctx.lineTo(x + 12, y - 28);
    ctx.lineTo(x + 26, y - 16);
    ctx.lineTo(x + 26, y - 26);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 4, y - 46);
    ctx.lineTo(x + 4, y - 36);
    ctx.lineTo(x + 14, y - 27);
    ctx.lineTo(x + 14, y - 37);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = '#f7f3e8';
    ctx.beginPath();
    ctx.moveTo(x, y - 50);
    ctx.lineTo(x, y - 4);
    ctx.lineTo(x + 34, y - 4);
    ctx.closePath();
    ctx.fill();
  }
  // Lantern on the mast, round 2: lit left, dark right.
  if (round.differences.some((d) => d.id === 'lantern')) {
    const lit = !differs(round, 'lantern', variant);
    ctx.fillStyle = lit ? '#ffd76a' : '#3a3f4d';
    ctx.beginPath();
    ctx.arc(x, y - 58, 6, 0, Math.PI * 2);
    ctx.fill();
    if (lit) {
      ctx.fillStyle = 'rgba(255, 215, 106, 0.25)';
      ctx.beginPath();
      ctx.arc(x, y - 58, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Wake.
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 52, y + 18);
  ctx.quadraticCurveTo(x, y + 24, x + 52, y + 18);
  ctx.stroke();
}

function drawBuoyAndFish(ctx, round, variant) {
  // Buoy, rounds 2 and 3: light on left, off right.
  if (round.differences.some((d) => d.id === 'buoy')) {
    const lit = !differs(round, 'buoy', variant);
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(422, 408);
    ctx.lineTo(438, 408);
    ctx.lineTo(434, 392);
    ctx.lineTo(426, 392);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = lit ? '#ffd76a' : '#3a3f4d';
    ctx.beginPath();
    ctx.arc(430, 388, 5, 0, Math.PI * 2);
    ctx.fill();
    if (lit) {
      ctx.fillStyle = 'rgba(255, 215, 106, 0.3)';
      ctx.beginPath();
      ctx.arc(430, 388, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Jumping fish, round 2: present left, gone right.
  if (round.differences.some((d) => d.id === 'fish') && !differs(round, 'fish', variant)) {
    ctx.fillStyle = '#9fb6d8';
    ctx.beginPath();
    ctx.ellipse(300, 420, 14, 5, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(310, 412);
    ctx.lineTo(320, 408);
    ctx.lineTo(314, 418);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(300, 428, 10, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  // Rocks.
  ctx.fillStyle = '#5d6068';
  ctx.beginPath();
  ctx.ellipse(120, 448, 26, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(480, 462, 32, 14, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawMarkers(ctx, round, found, hint, nowMs) {
  // Rings on every difference already found.
  for (const difference of round.differences) {
    if (!found.has(difference.id)) continue;
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(difference.x, difference.y, difference.r + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#2c7a3f';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(difference.x - 9, difference.y);
    ctx.lineTo(difference.x - 2, difference.y + 8);
    ctx.lineTo(difference.x + 11, difference.y - 8);
    ctx.stroke();
  }
  // The hint pulse, if one is showing.
  if (hint) {
    const difference = round.differences.find((d) => d.id === hint.id);
    if (difference && !found.has(difference.id)) {
      const pulse = 1 + 0.18 * Math.sin(nowMs / 130);
      ctx.strokeStyle = `rgba(255, 215, 106, ${0.65 + 0.3 * Math.sin(nowMs / 130)})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(difference.x, difference.y, (difference.r + 8) * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawWrongMarks(ctx, wrongMarks, nowMs) {
  for (const mark of wrongMarks) {
    const age = nowMs - mark.at;
    if (age > 700) continue;
    const alpha = 1 - age / 700;
    ctx.strokeStyle = `rgba(220, 60, 60, ${alpha})`;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const s = 10;
    ctx.beginPath();
    ctx.moveTo(mark.x - s, mark.y - s);
    ctx.lineTo(mark.x + s, mark.y + s);
    ctx.moveTo(mark.x + s, mark.y - s);
    ctx.lineTo(mark.x - s, mark.y + s);
    ctx.stroke();
  }
}

/** Draw one panel at (ox, oy): variant 0 is the left picture, 1 the right one. */
export function drawPanel(ctx, ox, oy, round, roundIndex, variant, found, hint, wrongMarks, nowMs) {
  const { width, height, horizon } = PANEL;
  const rng = mulberry32(1000 + roundIndex * 77);
  ctx.save();
  ctx.translate(ox, oy);
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();
  drawSky(ctx, round, rng);
  drawLoneStar(ctx, round, variant);
  drawBird(ctx, round, variant);
  drawCelestial(ctx, round, variant);
  drawClouds(ctx, round, variant, rng);
  drawGulls(ctx, round, variant);
  drawSea(ctx, round, rng);
  drawLand(ctx, round);
  drawPines(ctx);
  drawLighthouse(ctx, round, variant);
  drawCottage(ctx, round, variant);
  drawBoat(ctx, round, variant);
  drawBuoyAndFish(ctx, round, variant);
  drawMarkers(ctx, round, found, hint, nowMs);
  drawWrongMarks(ctx, wrongMarks, nowMs);
  ctx.restore();
  // Frame and side label.
  ctx.strokeStyle = '#20242e';
  ctx.lineWidth = 4;
  ctx.strokeRect(ox, oy, width, height);
  ctx.fillStyle = variant === 0 ? '#2c7a3f' : '#7a4a9e';
  roundRect(ctx, ox + 10, oy + 10, 74, 30, 6);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(variant === 0 ? 'LEFT' : 'RIGHT', ox + 47, oy + 26);
}
