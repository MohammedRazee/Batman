# Project_Batman.md: Arkham Text Adventure, Roadmap & Build Brief

> **Purpose of this file.** This is the single source of truth for the project. Planning happens in a Claude chat; building happens in VS Code with Claude Code. Claude Code cannot see the planning chat, so everything it needs is written here.
>
> **How to read it.** Sections 1-3 are context and rules. **Section 5 is the work to do now (v2.0).** Section 6 is future work: planning only, do not build it yet.

Last updated: 2026-11-23

---

## 1. Project context

A browser-based text adventure set inside a lockdown Arkham Asylum, an imaginative "what if Arkham Asylum was a text adventure?" take. No raster images or audio. Mood comes from typography, colour, motion and writing.

- **Stack:** MERN (MongoDB, Express, React, Node), plain JavaScript with ES modules everywhere (`import`/`export`, `.js` extensions on relative imports), Vite for the client.
- **Architecture:** strict MVC. Models in Mongoose, controllers in Express, the React client is the View.
- **Server is authoritative.** The client sends intents (`choiceId`, an answer), never state. All game rules live in the pure `server/services/engine.js`.
- **Persistence:** local MongoDB (`mongodb://127.0.0.1:27017/arkham_adventure`). Anonymous player ID in `localStorage`, no accounts. Each new game also writes a `PlayLog` document.

### Repo layout (from the v1 build)

```
Batman/            (repo root)
  server/            (ES modules, "type": "module")
    models/        Player.js, Scene.js, PlayLog.js
    controllers/   gameController.js
    routes/        gameRoutes.js
    services/      engine.js   (conditions, effects, transitions, view model)
    data/          scenes/*.js (intake, medical, gardens, sewers, mansion=Records Room, finale, endings), items.js, seed.js
    scripts/       checkScenes.js, simulate.js
    server.js
  client/          (Vite + React)
    src/
      views/       TitleScreen, GameScreen
      components/  Narration, ChoiceList, HUD, SidePanel
      hooks/       useGame.js
      api/         gameApi.js
      styles/      theme.css, effects.css
```

> Claude Code: this layout is from the plan. **Verify it against the real repo before relying on it**, and tell me about any differences.

### Existing game design (v1, already built)

- 30 scenes in 6 areas (Intake, Medical Wing, Botanical Gardens, Sewers, Cell Block / Records, Finale) plus 3 endings, an ambush scene and a death scene. 7 items.
- Choices have optional `requires` (item/flag) and `effects`. Locked choices render dashed with the requirement shown.
- Meters: **Health** and **Alert** (0-100). At Alert 100 the ambush scene fires (-15 Health, Alert resets to 40, return to previous scene). Health 0 ends the run.
- **Detective Mode** (key `D`): re-skins the screen, reveals extra text and hidden choices, auto-journals clues. When something is hidden and the mode is off, the UI hints at it.
- Evidence counter, Case Journal, Gear drawer, typewriter narration (click/space to skip), numbered choices (keys 1-9).
- Palette: near-black `#0a0c0c`, sickly green `#9fd18b`, amber `#c98b2b`, blood `#a02a2a`. Fonts: Special Elite (headings), Courier Prime (body).
- `npm run check` validates the scene graph and runs 3000 random playthroughs through the real engine.

### Status

- **Not yet verified:** the server was only exercised against in-memory fakes (no MongoDB in the build sandbox), and the UI was compiled but never viewed in a browser. **First real run on a machine with MongoDB is the true test.** MongoDB runs in a podman container (`mongodb`, mongo:7.0, port 27017); `server/.env` points at it. Server converted from CommonJS to ES modules (2026-11-23).

---

## 2. Rules for Claude Code

1. **Plain JavaScript.** No TypeScript.
2. **Keep MVC.** Game rules go in `services/engine.js` as pure functions (no DB, no `req/res`). Controllers validate, call the engine, persist, respond. The client only renders what the server returns.
3. **Server authoritative.** Never trust the client for game state. Riddle answers are checked on the server and are **never sent to the client**.
4. **No raster images or audio files.** Any graphic is inline SVG or CSS.
5. **Mongoose strict mode drops unknown fields.** When adding a field to scene data (`trophy`, `timed`, ...), also add it to the `Scene` schema, then re-run `npm run seed`.
6. **Keep `npm run check` green** and extend it for every new feature (see acceptance criteria).
7. **Respect `prefers-reduced-motion`** for every new animation.
8. **Original writing only.** All story text, riddles and tape transcripts must be original. Do not paste text from the Batman: Arkham games or any other copyrighted source. Placeholders marked `TODO(author)` are for me to rewrite.
9. **Work in small commits**, one logical change each. Don't commit `.env` or secrets.
10. When something in this brief is ambiguous or conflicts with the actual code, stop and ask me rather than guessing.

---

## 3. Roadmap overview

| # | Feature | Target | Notes |
|---|---|---|---|
| 1 | **Riddler trophies** (clickable trophy in Detective Mode, riddle popup) | **v2.0, build now** | Section 5.1 |
| 2 | **Timed choices** (countdown, gray-out, flash/hang resolution) | **v2.0, build now** | Section 5.2. Built reusable: it is the foundation for #4 |
| 3 | **Fear meter, Scarecrow sections only** | v3, **plan first** | Section 6.1. Needs a design doc before any code |
| 4 | **Boss duel sequence** (Detroit: Become Human style) | v4, future | Section 6.2. Built on top of #2 |

Features 1 and 2 are independent. Recommended order: **1 then 2.** Trophies are additive and low risk; timed choices touch the core choose flow and the check script.

---

## 4. Step 0: before any new feature

- [ ] Start a real MongoDB, run `npm run seed`, start server and client.
- [ ] Play start to finish in a real browser. Fix anything broken (CORS, proxy, fonts, layout, keyboard shortcuts, resume-after-reload).
- [ ] Commit this baseline (`git init` first if there is no repo) so every later change is easy to diff and revert.
- [ ] Record what you fixed in the Status section above.

---

## Status (2026-11-23)

- **Done:** Step 0 ESM conversion, docs correction, Feature 1 (Riddler trophies) fully built and committed. `npm run check` is green (scene graph, 3 node:test normaliser tests, golden path, 3000 random runs including riddle attempts and an answer-leak assertion). Riddle API verified against the real MongoDB with curl.
- **Not verified:** the trophy UI has only been compiled (`vite build`), never viewed in a browser. Step 0's browser playthrough is still the user's to do. Trophy x/y positions are untested against real text layout.
- **Placement:** intake_02, medical_05, garden_04, sewers_03, cell_01, finale_01 (main path); medical_04 (bat, detective-only branch) and mansion_02 (Ledger, file) off the main path.
- **Feature 2 (timed choices) built, UI untested in a browser.** Timed scenes: medical_02 (6s), sewers_02 (5s), cell_01 (6s), finale_02 (8s), finale_03 (8s, a timeout lands the pyrrhic ending). Assist setting (normal / x1.5 / off) is in the FILE panel. Server rejections and the check/simulate timeout paths are verified (curl + `npm run check`); the countdown, hang/flash animations, tab-switch accuracy and reduced-motion are for the user to test. Trophy button, `T`, `D` and `I` are locked while a countdown runs.
- **Skipped:** edit-distance-1 answer matching (stretch).
- **Deviation:** `checkRiddle(riddle, answer)` has no `player` argument (unused). A solved riddle's recap returns its first accepted answer; unsolved riddles never do.

## 5. v2.0 scope (build now)

### 5.1 Feature 1: Riddler trophies

**Player experience.** In Detective Mode, some scenes show a glowing trophy on the screen. Clicking it opens a riddle. The player types an answer. Right answer: the trophy is claimed, a journal entry unlocks, the counter goes up. Trophies are optional collectibles, and a wrong answer costs nothing.

When Detective Mode is **off** and the scene holds an unclaimed trophy, reuse the existing "something is hidden" hint so players know to toggle it.

**Art.** An original inline-SVG component `TrophyIcon`: a glowing angular question-mark emblem in neon green (add `--riddle-green`, around `#5dff7a`, so it stands apart from the cold blue-green Detective palette). It is not game art; draw it from scratch, no asset files.

States:
- **Unclaimed:** soft pulsing glow, slight hover lift, tooltip "Inspect".
- **Claimed:** desaturated outline with a check mark. Clicking it shows the solved riddle and answer as a recap.

**Placement.** Each scene with a trophy declares a position as percentages inside a `.scene-stage` container, so it reads well at any width. It fades in with the Detective Mode scan sweep. The trophy is a real `<button>` (tabbable, 44px minimum tap target). Key `T` opens the riddle when a trophy is present and Detective Mode is on.

**Riddle popup (`RiddleModal`).** Styled as an intercepted transmission: Detective palette, typewriter reveal of the riddle text, one text input, `TRANSMIT` and `ABORT` buttons.
- `Enter` submits, `Esc` closes. Trap focus inside. Number-key choice shortcuts are disabled while it is open.
- Wrong answer: feedback line like `SIGNAL REJECTED`, plus a shake. Show the attempt count.
- After **2 wrong attempts**, show the riddle's hint.
- Correct: `SIGNAL ACCEPTED`, short flash, then close and show the trophy as claimed.

**Data (static, no new model).** New file `server/data/riddles.js`:

```js
export const riddles = {
  tr_intake_clock: {
    text: '...',
    answers: ['clock', 'wall clock'],   // matched after normalisation
    hint: '...',
    journal: { title: 'Enigma 1', text: '...' },  // added to the journal on solve
  },
};
```

Scene data gains an optional field:

```js
trophy: { riddleId: 'tr_intake_clock', x: 72, y: 38 }   // x/y in % of .scene-stage
```

**Player model.** Add `trophies: [String]` (claimed riddle ids) and `riddleTries: Mixed` (`{ [riddleId]: number }`). **PlayLog** gets `trophiesSolved: Number`, updated when the trophy count changes.

**View model.** For the current scene, return:
- Detective Mode on: `trophy: { riddleId, x, y, claimed }`
- Detective Mode off: `hasHiddenTrophy: true` (only if unclaimed) to feed the existing hint
- Always: `trophyProgress: { claimed, total }`
- Never: the answers.

**API.** All checks are server-side.

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/game/:playerId/riddle/:riddleId` | Riddle text, claimed flag, tries, and the hint only if tries >= 2. 403 unless that trophy is in the player's **current scene** and Detective Mode is on |
| POST | `/api/game/:playerId/riddle/:riddleId` | Body `{ answer }`. Returns `{ correct, tries, hint?, journalEntry?, trophyProgress }` |

**Engine.** A pure `checkRiddle(player, riddle, answer)` in `engine.js`. Normalisation: lowercase, strip accents and punctuation, collapse whitespace, drop a leading "a/an/the", and also try the singular (strip a trailing `s`). Stretch goal: accept an edit distance of 1 for answers of 5+ letters.

**Reward.** Journal entry ("Enigma Archive" section in the Journal tab), the counter (`◆ n/8` in the HUD while Detective Mode is on), and, if all 8 are claimed, one extra epilogue line on every ending (`epilogue.trophies` text in the ending scenes). Keep rewards cosmetic for now.

**Riddle bank (8 trophies).** Original placeholder riddles, all marked `TODO(author)`: rewrite freely, keep the ids and answers consistent.

| id | Area | Riddle | Accepted answers | Hint |
|---|---|---|---|---|
| `tr_intake_clock` | Intake | I have a face, but I never smile; hands, but I never hold. Every man in this building is waiting on me. What am I? | clock, wall clock | Look at the wall. |
| `tr_medical_syringe` | Medical Wing | Small and sharp, but no blade. In the right hand I am mercy; in the wrong hand, a sentence. What am I? | syringe, needle, hypodermic, injection | Think of what a ward is stocked with. |
| `tr_garden_vine` | Botanical Gardens | I climb without legs and strangle without hands. Of all the inmates, I'm the only one who loves the lockdown. What am I? | vine, ivy, creeper | Look at what's taking the room. |
| `tr_sewer_echo` | Sewers | I answer every word you speak, yet I have never said a thing of my own. What am I? | echo | Listen to the tunnel. |
| `tr_records_file` | Records | I'm full of names, but I'm not a crowd. I'm full of sins, but I'm not a priest. Open me, and a man's whole life lies flat. What am I? | file, case file, folder, dossier, record | What do you keep in a cabinet? |
| `tr_cell_cell` | Cell Block | A door that opens one way, a bed no one sleeps in, a window that only looks at walls. What am I? | cell, prison cell, jail cell | Where are you standing? |
| `tr_finale_shadow` | Finale | I'm born the moment light finds you and die the moment it leaves. I follow you everywhere, but you can never hold me. What am I? | shadow | Turn the light around. |
| `tr_extra_bat` | Any (extra, off the main path) | I hang by day and hunt by night. I see with sound, not sight. What am I? | bat | Look up. |

**Placement rules.** Claude Code picks the actual scenes. No two trophies in one scene. None in the ambush, death or ending scenes. At least two must sit **off the main path** (behind a branch) to reward exploring. The riddle should relate to something in the scene where possible.

**Acceptance criteria**
- [ ] Trophy appears only in Detective Mode; the hint appears when the mode is off and a trophy is unclaimed.
- [ ] Clicking opens the modal; correct answer claims it, wrong answers show feedback, and the hint shows after 2 wrong attempts.
- [x] Answers never appear in any API response. Opening a riddle outside its scene or outside Detective Mode is rejected.
- [ ] Claimed state, tries and journal entries survive a page reload.
- [ ] Works with keyboard only (Tab, `T`, `Enter`, `Esc`) and under `prefers-reduced-motion`.
- [x] `npm run check` additionally validates: every `trophy.riddleId` exists, every riddle is used exactly once, trophy scenes exist and none is an ambush/death/ending scene, and trophy x/y are in 0-100.
- [x] Unit tests for the answer normaliser (case, punctuation, articles, plurals, aliases).

---

### 5.2 Feature 2: Timed choices

**Player experience.** A few set-piece scenes force a quick decision. A countdown bar drains. If the player picks, the other choices gray out and the picked one **hangs in the air** for about a second before the next scene fades in. If time runs out, the other choices gray out and the **default choice flashes**, tagged `NO RESPONSE`, before the next scene fades in. There is no hard screen cut in either case.

**Scene data.**

```js
timed: {
  seconds: 6,
  defaultChoice: 1,     // index into `choices`; must have no `requires`
  prompt: 'MOVE.',      // optional banner text
}
```

Use it in **3-5 set pieces** total: for example a collapsing walkway in the Medical Wing, a hostage standoff, the creature lunging in the Sewers, and the Finale. **Not** in the Scarecrow/toxin sequence, which is reserved for the v3 fear mechanic.

**Engine and API.**
- The view model returns `timed: { seconds, defaultChoiceId, prompt }` or `null`.
- `POST /choose` body becomes `{ choiceId, timedOut?: boolean }`. If `timedOut` is true, the server checks the scene is timed and that `choiceId` is the default, otherwise 400. PlayLog `choices[]` entries record `timedOut`.
- Known limitation, accepted for now: the client reports the timeout, so a determined player could stall. Acceptable for a single-player game; note it in the code comments.
- If the page reloads mid-countdown, the timer restarts from full.

**Client state machine.** A hook `useTimedChoice` with phases `idle -> counting -> resolving -> done`.

1. **counting:** a draining bar above the choices, with a numeric seconds readout. Use a **deadline timestamp** (not an interval counter) so the bar is correct after the tab was hidden. In the last 2 seconds the bar turns blood-red and the HUD gets a subtle pulse.
2. **Input:** during `counting`, keys 1-9 and clicks pick a choice. Disable the Gear/Journal drawer and the Detective toggle (no free thinking time).
3. **resolving**, triggered by a pick or by expiry. Store `resolution = { kind: 'chosen' | 'timeout', choiceId }`. Fire the API call immediately, and show the animation below in parallel.
   - **Chosen:** other choices gray out (about 0.25s). The picked choice **hangs**: lifts slightly with a soft amber glow for about 1100ms.
   - **Timeout:** other choices gray out. The default choice **flashes** (3-4 blinks in about 1.2s, blood-red border) with a `NO RESPONSE: DEFAULT` tag, then holds about 300ms more.
4. **Advance** only when **both** the API response has arrived **and** the hold animation has finished. Then use the existing scene fade transition. All input is blocked during `resolving`.
5. **Non-timed scenes are unchanged.**

**CSS classes (suggested):** `.timer-bar` and `.timer-bar--urgent`, `.choice--dimmed`, `.choice--picked`, `.choice--default-flash`, `.choice-tag--no-response`. Under `prefers-reduced-motion`, replace the float and the flashing with a static highlight, keeping the same hold duration.

**Nice to have:** an assist setting (`timerScale`: normal / x1.5 / off), saved in `localStorage`. "Off" means the countdown never expires.

**Design for reuse.** Build the timed list as a generic component (`TimedChoiceList` or an extended `ChoiceList`) that takes `timed`, `choices` and `onResolve`, not hard-wired to a scene. Feature 4 (boss duel) will chain these in quick succession.

**Acceptance criteria**
- [ ] Bar drains accurately and stays correct after switching tabs and back.
- [ ] Picking: others gray out, the pick hangs about 1s, then the next scene fades in. No flash of the old or blank screen.
- [ ] Expiry: others gray out, the default flashes with the `NO RESPONSE` tag, then the next scene fades in.
- [ ] A fast API response does not cut the animation short; a slow one does not break it.
- [ ] Double-presses and clicks during `resolving` are ignored.
- [x] Server rejects `timedOut` with a non-default choice, and rejects it for non-timed scenes.
- [x] `npm run check` validates: `defaultChoice` index exists, has no `requires`, `seconds` is between 3 and 15, and **simulate.js** includes timeout paths in its random playthroughs.
- [ ] Works under `prefers-reduced-motion`.

---

### 5.3 Suggested commit order (v2.0)

1. Step 0 baseline fixes.
2. Schema and engine changes for trophies, plus riddle data and tests.
3. Trophy API and `TrophyIcon`, `RiddleModal`, Journal section, HUD counter.
4. Extend `npm run check` for trophies.
5. Schema and engine changes for timed choices, plus API change.
6. `useTimedChoice`, timed choice list, CSS.
7. Author 3-5 timed scenes; extend `check` and `simulate`.
8. Update the Status section of this file (tick boxes, note anything unfinished).

---

## 6. Future work (planning only, do not build yet)

### 6.1 Feature 3: Fear meter, Scarecrow sections only (v3)

**Intent.** A third meter that exists **only** during the Scarecrow/fear-toxin sequences (the Botanical Gardens set piece, plus any later nightmare chapters). It appears when the player enters such a section, fades out when they leave, and never exists elsewhere. Text-only suits it: the narrator and even the choices can lie.

**This is tricky; do not implement it. First task is to write `docs/fear-meter-design.md`** that settles the open questions below, then wait for my approval.

**Candidate mechanics (pick a subset):**
- **A. Text tiers:** scenes carry `textByFear: { calm, uneasy, terrified }`; the narration changes with the current tier.
- **B. Lying choices:** a choice flagged `lies` shows one label but goes somewhere else (`actualGoto`) at high fear.
- **C. UI corruption:** CSS glitches, flicker and text scrambling that scale with fear.
- **D. False journal entries** at high fear, which Detective Mode can expose.
- **E. Detective Mode as grounding:** it reveals what is real (shows the truth text and unmasks lying choices) at a cost.

**Open questions for the design doc**
1. What raises and lowers fear? (Scenes and choices only, items like the Antidote, time spent?)
2. What happens at max fear? (Not death: a nightmare scene that costs something but lets play continue is the likely answer.)
3. How are section boundaries declared? (Scene or area-level `mechanics: { fear: true }`.)
4. How are tiers authored cheaply, so every scene doesn't need three versions?
5. How does `simulate.js` test lying choices and tier text?
6. Is fear reset on exit, or does it leave a lasting flag that affects later scenes or endings?
7. How does the HUD swap or show the meter without cluttering Alert and Health?

### 6.2 Feature 4: Boss duel sequence, Detroit: Become Human style (v4)

**Intent.** A boss fight told as a fast chain of decisions, not a combat system. Each **beat** is a short narrated action plus 2-4 options with a short timer (about 2-4s). Outcomes cascade: nothing "game overs" mid-fight. Failing forward changes how the fight, and the ending, plays out.

**Plan.**
- Reuse the timed-choice primitive from 5.2 for each beat.
- New scene type `duel` made of ordered `beats`, each with its own options and timer, branching to other beats based on what you chose or whether you timed out.
- Duel state: for example `edge` (your advantage) and `composure` (boss), changed by each beat. The final beat outcome sets flags that feed the existing ending logic.
- Detective Mode can show a one-line "tell" about the boss's next move at a cost, rewarding players who have been studying the enemy.
- After the fight, an optional **flowchart recap** (as in Detroit) showing the path taken and the branches not taken, built from `PlayLog` choices.

**Before building:** write `docs/boss-duel-design.md` covering pacing, how many beats, how failure branches reconverge, and how `check`/`simulate` will test it.

---

## 7. Decisions log

| Date | Decision |
|---|---|
| 2026-11-21 | Local MongoDB, anonymous player ID, plain JS, no audio. Plan-in-chat, build-in-VS-Code. |
| 2026-11-23 | v2.0 = Riddler trophies + timed choices. Fear meter (Scarecrow sections only) and boss duel are future work. |
| 2026-11-23 | Trophy art is an original inline SVG, not a raster image. All riddles are original text. |
| 2026-11-23 | Timed-choice resolution: no screen cut; others gray out, picked choice hangs (about 1.1s), timeout flashes the default (about 1.5s total). |
| 2026-11-23 | Trophy rewards stay cosmetic (journal, counter, epilogue line). |

---

## 8. Appendix: starter `CLAUDE.md`

Put this in the repo root as `CLAUDE.md` (Claude Code loads it automatically at the start of every session):

```markdown
# Arkham Text Adventure

Read `Project_Batman.md` first: it is the source of truth for scope, rules and status.

- MERN + MVC, plain JavaScript. Server is authoritative; engine in `server/services/engine.js` stays pure.
- No raster images or audio. Inline SVG/CSS only.
- Run `npm run check` after any scene, engine or schema change. It must stay green.
- Only build what Section 5 of Project_Batman.md says. Section 6 is planning-only.
- When a feature is finished, update the Status section and tick the acceptance boxes in Project_Batman.md.
```
