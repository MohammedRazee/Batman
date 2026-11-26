# Project_Batman.md: Arkham Text Adventure, State and Plan

> **Purpose.** Source of truth for current state: status, roadmap, decisions, contracts and the active brief. Planning happens in a Claude chat; building happens in VS Code with Claude Code, which cannot see the chat, so everything it needs is here or linked below.
>
> **Where things live.** Rules and commands: `CLAUDE.md` (loaded automatically). Stable design (pitch, story, mechanics, UI): `docs/design.md`. Built feature briefs: `docs/archive/`. Future feature briefs: `docs/features/`.
>
> **Owners.** Chat side: roadmap, decisions, design, briefs. Claude Code: Status, Contracts, deviations. Update your own sections; if you must change the other side's, say so in the Decisions log.

Last updated: 2026-11-26 (v2.0 built; next: fear-meter design doc)

---

## 1. Context

A browser-based text adventure set inside a lockdown Arkham Asylum. No raster images or audio.

- **Stack:** MERN, plain JavaScript, ES modules everywhere, Vite for the client. Strict MVC: Mongoose models, Express controllers, React client as the View.
- **Server is authoritative.** The client sends intents (`choiceId`, an answer), never state. Game rules live in the pure `server/services/engine.js`.
- **Persistence:** local MongoDB (`mongodb://127.0.0.1:27017/arkham_adventure`), anonymous player ID in `localStorage`, no accounts. Each new game also writes a `PlayLog`.
- **Layout (repo root `Batman/`):** `server/` (models, controllers, routes, `services/engine.js`, `data/` for scenes, items, riddles and seed, `scripts/`, `test/`), `client/` (Vite + React: views, components, hooks, api, styles). Run `ls` for the real tree; do not trust this summary for details. Cell Block scene `cell_01` lives in `mansion.js`.

---

## 2. Status (2026-11-26)

**Done and committed:** ESM conversion, docs correction, Feature 1 (Riddler trophies), Feature 2 (timed choices). `npm run check` is green. MongoDB runs in a podman container (`mongodb`, mongo:7.0, port 27017); `server/.env` points at it.

**User-tested:** trophy core flow in the browser (appear in Detective Mode, riddle modal, claiming, journal).

**Open checks (not yet confirmed in a browser):**
- [ ] Timed-choice UI: countdown bar, tab-switch accuracy, hang/flash animations, input locks, assist setting, reload mid-countdown.
- [ ] Keyboard-only trophy flow (Tab, `T`, `Enter`, `Esc`).
- [ ] `prefers-reduced-motion` for both features.
- Server-side behaviour of both features is verified (curl + `npm run check`).

**Skipped:** edit-distance-1 riddle matching (stretch goal).

**Deviations from the v2 brief:**
- `checkRiddle(riddle, answer)` has no `player` argument.
- A solved riddle's recap returns its first accepted answer; unsolved riddles never expose answers.
- `scene.ending.epilogue.trophies` carries the all-trophies epilogue.
- `PlayLog` gained `choices[]` and `trophiesSolved`.

**Placeholders:** riddles, journal entries, epilogue lines and one `medical_02` sentence carry `TODO(author)`. The author rewrites them.

**Next:** Feature 3 (fear meter): write `docs/features/fear-meter-design.md` (Section 5), then wait for approval. No code before approval.

---

## 3. Roadmap

| # | Feature | Target | State | Brief |
|---|---|---|---|---|
| 1 | Riddler trophies | v2.0 | Built, user-tested | `docs/archive/v2-brief.md` (5.1) |
| 2 | Timed choices | v2.0 | Built, UI test pending. Foundation for #4 | `docs/archive/v2-brief.md` (5.2) |
| 3 | Fear meter, Scarecrow sections only | v3 | Next: design doc first | Section 5 below |
| 4 | Boss duel sequence (Detroit: Become Human style) | v4 | Future | Section 6 below |

---

## 4. Contracts (Claude Code keeps these current)

### API

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/game/new` | Body `{name}`. Create a Player and PlayLog, return the first scene |
| GET | `/api/game/:playerId` | Resume: current scene + state |
| POST | `/api/game/:playerId/choose` | Body `{choiceId, timedOut?}`. Applies effects, returns the next scene. `timedOut` is accepted only for a timed scene and only with its default choice, else 400 |
| POST | `/api/game/:playerId/detective` | Toggle Detective Mode |
| POST | `/api/game/:playerId/use` | Body `{itemId}`. Use a consumable item |
| GET | `/api/game/:playerId/riddle/:riddleId` | Riddle text, claimed flag, tries, hint if tries >= 2. 403 unless the trophy is in the current scene and Detective Mode is on |
| POST | `/api/game/:playerId/riddle/:riddleId` | Body `{answer}`. Returns `{correct, tries, hint?, journalEntry?, trophyProgress}` |

Riddle answers are never in any response.

### Scene data shape (`server/data/scenes/*.js`)

```js
{
  id: 'medical_01',
  area: 'Medical Wing',
  title: 'The Atrium',
  text: '...',
  detectiveText: '...',
  clue: { id, title, text },                // auto-journaled in Detective Mode
  onEnter: [{ type: 'alert', delta: 5 }],   // first visit only unless repeat: true
  trophy: { riddleId, x, y },               // x/y in % of .scene-stage
  timed: { seconds, defaultChoice, prompt },// defaultChoice = index, no `requires`; seconds 3-15
  choices: [
    { label: '...', goto: 'medical_02', requires: { item: 'grapnel' } },
    { label: '...', goto: 'medical_03', effects: [{ type: 'alert', delta: 15 }] },
    { label: '...', goto: 'medical_04', detective: true },
  ],
}
```

Choice ids are positional (`c0`, `c1`, ...), never authored. Any new scene field must also be added to the `Scene` schema, then `npm run seed`.

### Models

- **Player:** name, scene, health, alert, inventory[], flags{}, journal[], visited[], detectiveMode, over, trophies[], riddleTries (Mixed).
- **Scene:** mirrors the scene data shape above.
- **PlayLog:** name, start/end, outcome, ending, choices[] (with `timedOut`), last scene, trophiesSolved.

### View model additions

`trophy: { riddleId, x, y, claimed }` (Detective Mode on), `hasHiddenTrophy` (mode off, unclaimed), `trophyProgress: { claimed, total }`, `timed: { seconds, defaultChoiceId, prompt }` or `null`.

---

## 5. Active brief: Feature 3, Fear meter, Scarecrow sections only (v3)

**Planning only. Do not implement.** First task: write `docs/features/fear-meter-design.md` that settles the open questions below, then wait for approval.

**Intent.** A third meter that exists only during the Scarecrow/fear-toxin sequences (the Botanical Gardens set piece, plus any later nightmare chapters). It appears when the player enters such a section, fades out when they leave, and never exists elsewhere. Text-only suits it: the narrator and even the choices can lie. Timed choices are not used in these sequences.

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
4. How are tiers authored cheaply, so every scene does not need three versions?
5. How does `simulate.js` test lying choices and tier text?
6. Is fear reset on exit, or does it leave a lasting flag that affects later scenes or endings?
7. How does the HUD swap or show the meter without cluttering Alert and Health?

---

## 6. Future: Feature 4, Boss duel, Detroit: Become Human style (v4)

**Planning only.** Write `docs/features/boss-duel-design.md` first (pacing, number of beats, how failure branches reconverge, how `check`/`simulate` test it).

- A boss fight told as a fast chain of decisions, not a combat system. Each beat is a short narrated action plus 2-4 options with a 2-4s timer. Nothing game-overs mid-fight; failing forward changes the fight and the ending.
- Reuse the timed-choice primitive from Feature 2. New scene type `duel` made of ordered `beats` that branch on what you chose or whether you timed out.
- Duel state, for example `edge` (your advantage) and `composure` (boss), sets flags that feed the existing ending logic.
- Detective Mode can show a one-line "tell" about the boss's next move, at a cost.
- Optional flowchart recap after the fight (path taken and branches not taken), built from `PlayLog` choices.

---

## 7. Decisions log

| Date | Decision |
|---|---|
| 2026-11-21 | Local MongoDB, anonymous player ID, plain JS, no audio. Plan-in-chat, build-in-VS-Code. |
| 2026-11-23 | v2.0 = Riddler trophies + timed choices. Fear meter (Scarecrow sections only) and boss duel are future work. |
| 2026-11-23 | Trophy art is an original inline SVG, not a raster image. All riddles are original text. |
| 2026-11-23 | Timed-choice resolution: no screen cut; others gray out, picked choice hangs (about 1.1s), timeout flashes the default (about 1.5s total). |
| 2026-11-23 | Trophy rewards stay cosmetic (journal, counter, epilogue line). |
| 2026-11-23 | Repo root is `Batman/`. Server converted to ES modules. MongoDB runs in podman. Tests use `node:test`. |
| 2026-11-23 | Timed scenes: medical_02, sewers_02, cell_01, finale_02, finale_03. Assist setting (normal / x1.5 / off) included. |
| 2026-11-23 | `CLAUDE.md` and `Project_Batman.md` are tracked in git; `.gitignore` follows normal Node standards. |
| 2026-11-26 | Docs split: rules and commands in `CLAUDE.md`; design in `docs/design.md`; briefs in `docs/features/` and `docs/archive/`; this file holds status, roadmap, decisions and contracts. Master copy is in the repo; the Claude Project copy is a snapshot that is re-uploaded after build sessions. |
| 2026-11-26 | v2.0 brief archived to `docs/archive/v2-brief.md`. Open v2 checks moved into Section 2. |
| 2026-11-26 | `ponytail` skill is used for all coding tasks (via `CLAUDE.md`); the brief's rules and acceptance criteria count as asked-for. |