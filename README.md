[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451) [![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Flowjack94/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451) [![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Flowjack94/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# The Lighthouse Keeper's Evening — spot the difference

A complete spot-the-difference game for the [make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451). Two pictures of Gull Rock stand side by side — a lighthouse, a cottage, a little boat — and they are not quite the same. Click every difference in either picture before the time runs out.

Three rounds, one evening: **Dusk at Gull Rock** (7 differences), **Night Watch** (9), **First Light** (10). A wrong click costs 5 seconds and 25 points; a hint rings the difference in gold (3 per round); clearing a round banks the remaining seconds as bonus points. All art is drawn in code on a canvas and all sounds are synthesised with WebAudio — the game ships no assets and makes no network request.

## Play

```sh
node serve.ts   # serves game/ on http://localhost:8080
```

Open `game/index.html` in desktop Chrome (or the local server above). Mouse to click, `H` for a hint, `M` to mute, `R` to restart, `Enter` to start / continue.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `game/index.html` + `game/src/` — the game itself: `main.js` (loop and input), `game.js` (rules, timer, score, screens), `draw.js` (the scene renderer), `scenes.js` (the three rounds and their differences), `shots.js` (the staged screenshot states), `audio.js` (synthesised sounds), `random.js` (seeded random).
- `screenshots/` — real renders of the game, staged by `shots.json` (`?shot=play|mid|almost|win`).
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
