# Fear Meter: Design (Feature 3, v3)

Status: **built and shipped (v3 tester), 2026-11-26.** Author browser testing in progress.
Scope: Scarecrow / fear-toxin sections only (today: the four `garden_*` scenes). Timed choices are never used here.

## 1. Mechanics chosen

| Candidate | Decision | Why |
|---|---|---|
| A. Text tiers | **In** | Cheap, and the core of "the narrator lies". |
| B. Lying choices | **In** | Uses the one thing only text can do. |
| C. UI corruption | **In, CSS only** | A tier class on the narration. No scrambling logic. |
| D. False journal entries | **Out** | Extra journal/schema work for four scenes. Revisit if more nightmare chapters appear. |
| E. Detective Mode as grounding | **In** | Unmasks lies and shows true text, at a cost. |

## 2. Answers to the open questions

**1. What changes fear?** Only authored effects: a new effect `{ type: 'fear', delta }` on `onEnter` or on a choice. No time-based change (it would reward idling). Items do not lower it: the Antidote is only picked up at the end of the section (`garden_04`), so it cannot help inside it. Calming is done by choices such as "Stand still. Count your breaths." Value is clamped 0-100.

Tiers: `calm` 0-33, `uneasy` 34-66, `terrified` 67-100.

**2. Max fear (100).** Not death. Same pattern as the existing alert-100 ambush in `enterScene` (`server/services/engine.js`): when fear reaches 100 on entering a scene, the engine records `returnTo` and diverts to one nightmare scene (`garden_nightmare`, `fear: true`). It costs health, resets fear to 60, then `goto: '__return'` rejoins the scene the player was heading to. Depth guard as with ambush. `returnTo` is shared with ambush, so the two cannot nest: fear is not checked once an ambush is in progress (`depth > 0`).

**3. Section boundaries.** Scene field `fear: true`. For a whole area, `checkScenes` / seed expands `area`-level declarations so authors do not repeat it: every scene whose `area` is `Botanical Gardens` gets `fear: true`. The view model's `fear` is non-null only on a `fear: true` scene.

**4. Cheap tiers.** `text` is the calm baseline. Optional `fearText: { uneasy, terrified }` replaces it only where authored; a missing tier falls back to the nearest lower one. Authored for `garden_02`, `garden_03` and `garden_nightmare` only. Every other fear scene still reads differently through the tier CSS class (C), so nothing needs three versions. `detectiveText` is always the truth and is never tiered.

**5. Testing in `simulate.js`.**
- `newPlayer()` gains `fear: 0`.
- Golden path: fear stays under 100 and finishes with the expected exit flag.
- Random walks: fear always within 0-100; the nightmare diversion fires and never dead-ends; every `lies` choice resolves to an existing scene at every tier; fallback tier text always resolves to a string.
- `checkScenes.js`: `lies.actualGoto` targets exist; `fearText` and `lies` appear only on `fear: true` scenes; `fear: true` scenes have no `timed`; the nightmare scene exists.
- `node:test` unit tests for tier boundaries, clamp, the 100 diversion and the lie resolution.

**6. On exit.** The meter disappears and `player.fear` resets to 0. One lasting flag is set, read only by the finale epilogue: `lucid` (already set in `garden_02`) if the player never reached `terrified`, otherwise `shaken`. No mechanical penalty carries on.

**7. HUD.** A third bar, mounted only while the view model `fear` is non-null, styled like Alert and Health and placed after them. It fades in and out. Under `prefers-reduced-motion` the fade and the flicker are disabled and only the tier colour and label remain.

## 3. Lying choices

```js
{ label: 'Run toward the light.', goto: 'garden_03',
  lies: { actualGoto: 'garden_nightmare', minTier: 'uneasy' } }
```

- Below `minTier` the choice goes to `goto`. At or above it, the server resolves to `actualGoto`.
- The client never receives `actualGoto`. In Detective Mode the choice shows a "false" marker and the true destination's scene title, and costs +5 Alert once per scene (**proposal; confirm**).
- The authored label is the lie, so it must read as plausible.

## 4. Contracts (to add to `Project_Batman.md` §4 on build)

- `Scene`: `fear` (Boolean), `fearText` ({ uneasy, terrified }), `choices[].lies` ({ actualGoto, minTier }).
- `Player`: `fear` (Number, default 0).
- Effect: `{ type: 'fear', delta }`.
- View model: `fear: { value, tier }` or `null`. Choices in Detective Mode may carry `lie: { title }`.
- API: no new routes.

## 5. Build phases (after approval)

1. Schema, engine (effect, tier, diversion, lies, exit flag), `checkScenes`, `simulate`, unit tests. `npm run check` green.
2. Author the garden scenes (tier text, lies, effects) and `garden_nightmare`. Add `TODO(author)` on the new prose.
3. HUD bar and tier CSS. Reduced-motion handling.
4. `npm run seed`, browser check, update Status and tick acceptance boxes.

## 6. Acceptance

- [x] Meter appears only in `fear: true` scenes and never elsewhere.
- [x] Narration changes by tier where authored; falls back correctly elsewhere.
- [x] At least one lying choice, unmasked by Detective Mode.
- [x] Reaching 100 diverts to the nightmare scene and play continues.
- [ ] Exit resets fear and sets `lucid` or `shaken`; finale epilogue reads it. *(Exit and flags done; the epilogue does not read them yet.)*
- [x] No timed choices in fear scenes.
- [x] `npm run check` green; reduced-motion respected.

## 7. Resolved points

- Detective unmask cost: **+5 Alert**, once per scene with an active lie (confirmed 2026-11-26).
- Scope: v3 is a **tester**. The meter lives only in the Botanical Gardens (four scenes plus `garden_nightmare`; lies in two of them) to prove the mechanic.

## 8. Future expansion

The fear mechanic will be expanded into additional scenes in a later version to make it more viable. Four scenes are too few for the meter to build, fall and matter. Candidates: more Scarecrow/nightmare chapters, or toxin moments in other areas. The engine already supports this: a new section only needs `fear: true` (or an area entry in `scenes/index.js`), fear effects, optional `fearText` and `lies`. Things to decide then:
- whether `garden_nightmare` becomes a per-section nightmare (`fear` sections naming their own diversion scene);
- whether the `lucid`/`shaken` exit flags become per-section;
- whether false journal entries (mechanic D) become worth adding at the larger scale.
