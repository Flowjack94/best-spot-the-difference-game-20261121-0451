// The game itself: rounds, clicks, timer, hints, score and every screen.
// One canvas, 1280 x 720: a top bar, two 600 x 520 panels side by side and a
// bottom bar. A click on either panel counts — that is how spot the difference
// is played — and a click that hits nothing costs 5 seconds and 25 points.
import { ROUNDS, PANEL, SCORE_FIND, SCORE_WRONG, WRONG_TIME_PENALTY, TIME_BONUS_PER_SECOND, HINTS_PER_ROUND, HINT_SHOW_MS } from './scenes.js';
import { drawPanel } from './draw.js';
import { playFound, playWrong, playClick, playHint, playRoundClear, playWin, playTick, toggleMuted, isMuted } from './audio.js';

export const LAYOUT = {
  canvasWidth: 1280,
  canvasHeight: 720,
  panelY: 76,
  panelX: [20, 660],
  panelWidth: PANEL.width,
  panelHeight: PANEL.height,
  bottomY: 604,
};

const BUTTONS = {
  hint: { x: 20, y: 640, w: 150, h: 40 },
  mute: { x: 182, y: 640, w: 150, h: 40 },
  restart: { x: 344, y: 640, w: 150, h: 40 },
};

function formatTime(seconds) {
  const whole = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
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

export function createGame() {
  const state = {
    screen: 'title',
    roundIndex: 0,
    found: new Set(),
    score: 0,
    timeLeft: ROUNDS[0].timeLimit,
    hintsLeft: HINTS_PER_ROUND,
    hint: null,
    wrongMarks: [],
    message: 'Find every difference — click it in either picture.',
    messageAt: 0,
    totalFound: 0,
    frozen: false,
    lastTickSecond: -1,
    roundBonus: 0,
  };

  function round() {
    return ROUNDS[state.roundIndex];
  }

  function startRound(index) {
    state.roundIndex = index;
    state.found = new Set();
    state.timeLeft = round().timeLimit;
    state.hintsLeft = HINTS_PER_ROUND;
    state.hint = null;
    state.wrongMarks = [];
    state.message = `${round().name} — find ${round().differences.length} differences.`;
    state.screen = 'playing';
  }

  function start() {
    state.score = 0;
    state.totalFound = 0;
    startRound(0);
    playClick();
  }

  function nextRound() {
    if (state.roundIndex + 1 < ROUNDS.length) {
      startRound(state.roundIndex + 1);
    } else {
      state.screen = 'win';
      playWin();
    }
  }

  function useHint(nowMs) {
    if (state.screen !== 'playing' || state.frozen) return;
    if (state.hintsLeft <= 0) {
      state.message = 'No hints left this round.';
      return;
    }
    const remaining = round().differences.filter((d) => !state.found.has(d.id));
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    state.hintsLeft -= 1;
    state.hint = { id: pick.id, until: nowMs + HINT_SHOW_MS };
    state.message = 'Hint: look where the gold ring pulses.';
    playHint();
  }

  function panelAt(x, y) {
    if (y < LAYOUT.panelY || y > LAYOUT.panelY + LAYOUT.panelHeight) return null;
    for (let variant = 0; variant < 2; variant += 1) {
      const px = LAYOUT.panelX[variant];
      if (x >= px && x <= px + LAYOUT.panelWidth) {
        return { variant, localX: x - px, localY: y - LAYOUT.panelY };
      }
    }
    return null;
  }

  function buttonAt(x, y) {
    for (const [name, rect] of Object.entries(BUTTONS)) {
      if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) return name;
    }
    return null;
  }

  function clickAt(x, y, nowMs) {
    if (state.screen === 'title') {
      start();
      return;
    }
    if (state.screen === 'roundClear') {
      nextRound();
      return;
    }
    if (state.screen === 'win' || state.screen === 'over') {
      start();
      return;
    }
    const button = buttonAt(x, y);
    if (button === 'hint') {
      useHint(nowMs);
      return;
    }
    if (button === 'mute') {
      toggleMuted();
      state.message = isMuted() ? 'Sound off. Press M to turn it back on.' : 'Sound on.';
      return;
    }
    if (button === 'restart') {
      start();
      return;
    }
    const panel = panelAt(x, y);
    if (!panel) return;
    const hit = round().differences.find(
      (d) => !state.found.has(d.id) && Math.hypot(panel.localX - d.x, panel.localY - d.y) <= d.r + 8,
    );
    if (hit) {
      state.found.add(hit.id);
      state.totalFound += 1;
      state.score += SCORE_FIND;
      state.message = `Found: ${hit.label}! (${state.found.size}/${round().differences.length})`;
      playFound();
      if (state.found.size === round().differences.length) {
        state.roundBonus = Math.ceil(state.timeLeft) * TIME_BONUS_PER_SECOND;
        state.score += state.roundBonus;
        state.screen = 'roundClear';
        playRoundClear();
      }
    } else {
      state.wrongMarks.push({ x: panel.localX, y: panel.localY, variant: panel.variant, at: nowMs });
      state.timeLeft = Math.max(0, state.timeLeft - WRONG_TIME_PENALTY);
      state.score = Math.max(0, state.score - SCORE_WRONG);
      state.message = `Not there — minus 5 seconds. ${round().differences.length - state.found.size} remain.`;
      playWrong();
    }
  }

  function update(dt, nowMs) {
    if (state.frozen || state.screen !== 'playing') return;
    state.timeLeft -= dt;
    if (state.hint && nowMs > state.hint.until) state.hint = null;
    state.wrongMarks = state.wrongMarks.filter((mark) => nowMs - mark.at < 700);
    const second = Math.ceil(state.timeLeft);
    if (state.timeLeft <= 10.5 && second !== state.lastTickSecond && state.timeLeft > 0) {
      state.lastTickSecond = second;
      playTick();
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = 'over';
    }
  }

  function drawHud(ctx) {
    ctx.fillStyle = '#141824';
    ctx.fillRect(0, 0, LAYOUT.canvasWidth, 64);
    ctx.fillStyle = '#f2e3c2';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText("The Lighthouse Keeper's Evening", 20, 22);
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillStyle = '#9fb6d8';
    ctx.fillText(round().name, 20, 48);
    // The counter: the number the judge looks for.
    const remaining = round().differences.length - state.found.size;
    ctx.textAlign = 'center';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillStyle = remaining === 0 ? '#7fd08a' : '#ffd76a';
    ctx.fillText(
      `FOUND ${state.found.size}/${round().differences.length}  ·  ${remaining} REMAIN`,
      LAYOUT.canvasWidth / 2,
      32,
    );
    ctx.textAlign = 'right';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillStyle = state.timeLeft <= 10 ? '#ff6b5e' : '#f2e3c2';
    ctx.fillText(formatTime(state.timeLeft), LAYOUT.canvasWidth - 20, 24);
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillStyle = '#9fb6d8';
    ctx.fillText(`SCORE ${state.score}`, LAYOUT.canvasWidth - 20, 50);
  }

  function drawBottomBar(ctx) {
    ctx.fillStyle = '#141824';
    ctx.fillRect(0, LAYOUT.bottomY, LAYOUT.canvasWidth, LAYOUT.canvasHeight - LAYOUT.bottomY);
    for (const [name, rect] of Object.entries(BUTTONS)) {
      const label =
        name === 'hint'
          ? `Hint (${state.hintsLeft} left) [H]`
          : name === 'mute'
            ? isMuted()
              ? 'Sound: off [M]'
              : 'Sound: on [M]'
            : 'Restart [R]';
      ctx.fillStyle = name === 'hint' && state.hintsLeft === 0 ? '#3a3f4d' : '#2c3242';
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
      ctx.fill();
      ctx.fillStyle = '#f2e3c2';
      ctx.font = '15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
    }
    ctx.fillStyle = '#d8cdb4';
    ctx.font = '16px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(state.message, 520, 660);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#9fb6d8';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Click a difference in either picture', LAYOUT.canvasWidth - 20, 660);
  }

  function drawOverlay(ctx, title, lines, accent) {
    ctx.fillStyle = 'rgba(10, 12, 22, 0.72)';
    ctx.fillRect(0, 0, LAYOUT.canvasWidth, LAYOUT.canvasHeight);
    ctx.fillStyle = '#1d2338';
    roundRect(ctx, 340, 190, 600, 340, 16);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    roundRect(ctx, 340, 190, 600, 340, 16);
    ctx.stroke();
    ctx.fillStyle = '#f2e3c2';
    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, LAYOUT.canvasWidth / 2, 250);
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillStyle = '#d8cdb4';
    lines.forEach((line, index) => {
      ctx.fillText(line, LAYOUT.canvasWidth / 2, 300 + index * 30);
    });
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.fillStyle = accent;
    ctx.fillText(lines.prompt, LAYOUT.canvasWidth / 2, 300 + lines.length * 30 + 18);
  }

  function draw(ctx, nowMs) {
    ctx.fillStyle = '#0c0f18';
    ctx.fillRect(0, 0, LAYOUT.canvasWidth, LAYOUT.canvasHeight);
    drawHud(ctx);
    const activeHint = state.hint && nowMs <= state.hint.until ? state.hint : null;
    for (let variant = 0; variant < 2; variant += 1) {
      const marks = state.wrongMarks.filter((mark) => mark.variant === variant);
      drawPanel(ctx, LAYOUT.panelX[variant], LAYOUT.panelY, round(), state.roundIndex, variant, state.found, activeHint, marks, nowMs);
    }
    drawBottomBar(ctx);
    if (state.screen === 'title') {
      const lines = [
        'Two pictures of Gull Rock. Only one thing is true:',
        'they are not quite the same.',
        'Click every difference in either picture before the time runs out.',
        'Three rounds: Dusk, Night, First Light. A wrong click costs 5 seconds.',
      ];
      lines.prompt = 'Click or press Enter to start';
      drawOverlay(ctx, "The Lighthouse Keeper's Evening", lines, '#ffd76a');
    } else if (state.screen === 'roundClear') {
      const last = state.roundIndex + 1 >= ROUNDS.length;
      const lines = [
        `Every difference found — ${round().differences.length} of ${round().differences.length}.`,
        `Time bonus: +${state.roundBonus} points. Score: ${state.score}.`,
        last ? 'That was the last round.' : `Next: ${ROUNDS[state.roundIndex + 1].name}.`,
      ];
      lines.prompt = last ? 'Click or press Enter for the ending' : 'Click or press Enter for the next round';
      drawOverlay(ctx, 'Round clear!', lines, '#7fd08a');
    } else if (state.screen === 'win') {
      const lines = [
        `Every round cleared — ${state.totalFound} differences found.`,
        `Final score: ${state.score}. The keeper lights the lamp,`,
        'the gulls come home, and Gull Rock sleeps.',
      ];
      lines.prompt = 'Press R to play again';
      drawOverlay(ctx, 'The lamp is lit!', lines, '#ffd76a');
    } else if (state.screen === 'over') {
      const lines = [
        `Time ran out with ${round().differences.length - state.found.size} differences still hidden.`,
        `You found ${state.found.size} of ${round().differences.length} in ${round().name}. Score: ${state.score}.`,
      ];
      lines.prompt = 'Press R to try again';
      drawOverlay(ctx, "Out of time", lines, '#ff6b5e');
    }
  }

  return {
    state,
    start,
    nextRound,
    useHint,
    clickAt,
    update,
    draw,
    startRound,
    round,
  };
}
