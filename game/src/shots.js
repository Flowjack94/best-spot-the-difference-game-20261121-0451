// The screenshot scenes behind ?shot=play|mid|almost|win. Each one sets a real
// game state — a round in play with some differences found and the rest still
// hidden — so the frame is what a player really sees, and the same shot
// always gives the same frame. The timer is frozen while a shot is staged.
import { ROUNDS } from './scenes.js';

function foundSet(roundIndex, count) {
  const round = ROUNDS[roundIndex];
  return new Set(round.differences.slice(0, count).map((d) => d.id));
}

/**
 * Stage the named shot on `game` and return the state to draw. Unknown names
 * stage the opening shot. The shots are named by the files in shots.json.
 */
export function stageShot(name, game) {
  const state = game.state;
  state.frozen = true;
  if (name === 'mid') {
    game.startRound(0);
    state.found = foundSet(0, 4);
    state.timeLeft = 98;
    state.score = 400;
    state.message = 'Found: The boat sail! (4/7)';
    state.screen = 'playing';
    return { screen: 'playing' };
  }
  if (name === 'almost') {
    game.startRound(1);
    state.found = foundSet(1, 8);
    state.timeLeft = 21;
    state.score = 800;
    state.message = 'Found: The buoy light! (8/9) — one left!';
    state.screen = 'playing';
    return { screen: 'playing' };
  }
  if (name === 'win') {
    game.startRound(2);
    state.found = foundSet(2, ROUNDS[2].differences.length);
    state.timeLeft = 64;
    state.score = 2840;
    state.totalFound = 26;
    state.screen = 'win';
    return { screen: 'win' };
  }
  // The opening shot: round 1 in play, 2 found, 5 still hidden.
  game.startRound(0);
  state.found = foundSet(0, 2);
  state.timeLeft = 131;
  state.score = 200;
  state.message = 'Found: The cottage window! (2/7)';
  state.screen = 'playing';
  return { screen: 'playing' };
}
