# Arkham Text Adventure: Design Bible

Owner: planning chat. This file holds the stable design: pitch, story, mechanics and look. Build status, roadmap and decisions live in `Project_Batman.md`. Per-feature briefs live in `docs/features/` and `docs/archive/`.

## 1. Pitch

You are the Bat, locked in with the inmates on a dark island. The game is a choice-driven story, but the screen is a real interface: a HUD, an inventory drawer, a Detective Mode toggle, a case journal and keyboard shortcuts. The text does the heavy lifting; the UI makes it feel like operating a piece of tactical hardware in the dark.

An imaginative "what if Arkham Asylum was a text adventure?" take. No raster images or audio. Mood comes from typography, colour, motion and writing. All writing is original.

## 2. Scope guardrails

**In:** about 30-40 scenes across 5-6 areas, one main story path with branches that reconverge, a handful of items, meters, save/continue, atmospheric CSS.
**Out:** images, audio, accounts/login, combat minigames, more than 2-3 endings.

Larger scope (fear meter, boss duel) is added as separate features, each with its own design doc first. See the roadmap in `Project_Batman.md`.

## 3. Story spine (original take, loosely Arkham-flavoured)

1. **Intake**: the transfer goes wrong, the lockdown starts.
2. **Medical Wing**: first thugs, first gadget, the first sign something is off.
3. **Botanical Gardens**: overgrown, humid, hostile. A toxin-hallucination set piece told in unreliable text.
4. **Sewers**: a stalk-in-the-dark chapter, a creature you can't fight head-on.
5. **Cell Block / Mansion Records**: the investigation chapter that unlocks the truth. Detective Mode is the main tool here. (In code, the Records Room and Cell Block are both in `mansion.js`.)
6. **Finale**: confrontation on the Tower stage, with three endings (**Case Closed**, **The Long Night**, **Ashes**) driven by evidence found and flags set earlier.

Text-only suits the fear-toxin sequences: the narrator lies to you and the choices lie too. That idea becomes the fear meter (Feature 3).

## 4. Core mechanics

- **Choices:** 2-4 per scene. Each can have conditions (needs an item or flag) and effects (add item, set flag, change Health or Alert). A choice with an unmet requirement shows as locked ("Requires: Grapnel Gun") rather than hidden, so players learn what to look for.
- **Health** (0-100): reaching 0 ends the run.
- **Alert** (0-100): stealth-style tension. At 100 an ambush scene hits you for 15 Health, resets Alert to 40 and returns you to where you were.
- **Inventory:** seven items act as keys: Batarang, Explosive Gel, Grapnel, Cryptographic Sequencer, Keycard, Medkit, Antidote. The Medkit is usable from the Gear drawer.
- **Detective Mode** (key `D`): a toggle that re-skins the screen, reveals extra text and hidden choices, and auto-records clues in the journal. When something is hidden and the mode is off, the UI hints at it.
- **Evidence counter:** four evidence sources (terminal, ledger, safe, hidden room). The best ending needs three, plus having found the charges.
- **Case Journal:** auto-collected clues and notes the player can re-read.

### Added in v2.0 (details in `docs/archive/v2-brief.md`)

- **Riddler trophies:** 8 optional riddles. A glowing trophy appears in Detective Mode; clicking it opens a riddle popup. Solving one adds a journal entry and raises the `◆ n/8` counter. All 8 add an epilogue line to every ending. Rewards are cosmetic.
- **Timed choices:** five set-piece scenes with a countdown. Picking makes the others gray out and the pick hangs briefly; a timeout flashes the default choice tagged `NO RESPONSE`. An assist setting (normal / x1.5 / off) is in the FILE panel. The Scarecrow/toxin sequence is deliberately not timed.

## 5. UI and atmosphere

| Element | Approach |
|---|---|
| Palette | Near-black `#0a0c0c`, sickly green `#9fd18b`, bruised amber `#c98b2b`, blood `#a02a2a` for danger. Riddle green (`--riddle-green`, about `#5dff7a`) for trophies only |
| Type | Special Elite for headings, Courier Prime for body text (Google Fonts, with monospace fallbacks) |
| Narration | Typewriter reveal, click or press space to skip |
| Texture | CSS-only: vignette, film grain overlay, scanlines, flicker on high Alert, red pulse on low Health |
| Detective Mode | Palette swaps to cold blue-green, scan-line sweep, extra text and hidden options |
| HUD | Top bar: location label, operative name, Health bar, Alert bar, trophy counter in Detective Mode, Detective / File / Exit buttons. Right drawer: Gear / Journal tabs (the Journal includes the Enigma Archive) |
| Choices | Numbered buttons (keys 1-9), locked options dashed with the requirement shown. Timed scenes add a draining bar above the choices |
| Microcopy | In-world: "RESUME CASE FILE", "BURN IT", errors read like system faults ("SIGNAL LOST"). Riddle popup: `TRANSMIT`, `ABORT`, `SIGNAL ACCEPTED`, `SIGNAL REJECTED` |
| Motion | Every animation has a `prefers-reduced-motion` fallback |
| Graphics | Inline SVG or CSS only. No raster images or audio files |

## 6. Design principles

- **The server decides.** The client sends intents, never state. Hidden things (riddle answers, lying-choice targets later) never reach the client.
- **Text first.** The interface supports the writing; it does not replace it.
- **Locked, not hidden.** Players should see what they lack, so they know what to look for.
- **No hard cuts.** Scene changes fade; timed-choice outcomes play out before the next scene.
- **Failing forward.** Penalties cost health, alert or endings, but play continues wherever possible.
