// Bootstrap: one fixed 1280 x 720 canvas, scaled by CSS to the window. The
// game loop ticks the timer and draws every frame; ?shot=<name> stages a
// frozen screenshot scene instead of starting at the title screen.
import { createGame, LAYOUT } from './game.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');
const game = createGame();
// Exposed for play-testing only (the test driver reads the live state).
window.__game = game;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  stageShot(shot, game);
}

function toCanvasCoords(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * LAYOUT.canvasWidth,
    y: ((event.clientY - rect.top) / rect.height) * LAYOUT.canvasHeight,
  };
}

canvas.addEventListener('pointerdown', (event) => {
  const { x, y } = toCanvasCoords(event);
  game.clickAt(x, y, performance.now());
  event.preventDefault();
});

window.addEventListener('keydown', (event) => {
  const now = performance.now();
  if (event.key === 'h' || event.key === 'H') game.useHint(now);
  if (event.key === 'm' || event.key === 'M') game.clickAt(257, 660, now);
  if (event.key === 'r' || event.key === 'R') game.start();
  if (event.key === 'Enter') {
    if (game.state.screen === 'title') game.start();
    else if (game.state.screen === 'roundClear') game.nextRound();
    else if (game.state.screen === 'win' || game.state.screen === 'over') game.start();
  }
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  game.update(dt, now);
  game.draw(ctx, now);
  const state = game.state;
  status.textContent =
    state.screen === 'playing'
      ? `${state.message} Score ${state.score}.`
      : state.screen === 'title'
        ? "The Lighthouse Keeper's Evening. Press Enter to start."
        : state.message;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
