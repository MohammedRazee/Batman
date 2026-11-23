# ARKHAM // Case File

A gritty browser text adventure set in a lockdown Arkham Asylum. MERN stack, MVC layout, no images.

## Run it

Requires Node 18+ and a local MongoDB (default `mongodb://127.0.0.1:27017/arkham_adventure`).

```bash
npm run install:all        # root + server + client deps
cp server/.env.example server/.env   # already created; edit if your Mongo URI differs
npm run seed               # loads the scenes into MongoDB (re-run after editing scenes)
npm run dev                # API on :5000, client on http://localhost:5173
```

`npm run check` validates the scene graph and plays 3000 random runs through the engine (no database needed).

## Controls

| Key | Action |
|---|---|
| `1`-`9` | Pick a choice |
| `Space` / `Enter` | Skip the typewriter |
| `D` | Toggle Detective Mode |
| `I` | Open Gear / Journal |
| `T` | Open the Riddler trophy riddle (Detective Mode, trophy present) |

## Layout (MVC)

```
server/
  models/        Player, Scene, PlayLog          (Model)
  controllers/   gameController.js               (Controller)
  routes/        gameRoutes.js
  services/      engine.js   pure rules: requirements, effects, transitions
  data/          scenes/*.js, items.js, seed.js
  scripts/       checkScenes.js, simulate.js
client/src/
  views/         TitleScreen, GameScreen         (View)
  components/    Narration, ChoiceList, HUD, SidePanel
  hooks/         useGame.js    state + API calls
  styles/        theme.css, effects.css
```

The server is authoritative: the client sends `{ choiceId }` and receives a view model.

## Play log

Every new game writes a `PlayLog` document: `playerName`, start/end time, outcome (`in_progress` / `ending` / `died`), `endingId`, `choicesMade`, `lastScene`. Query it with e.g. `db.playlogs.find().sort({startedAt:-1})`.

## Writing scenes

Add objects to `server/data/scenes/*.js`, then `npm run seed`. A choice supports:
- `requires: { item, flag, minFlag: {key, value}, reason }` shows locked with a reason
- `hideIf: { flag | item }` disappears once done
- `detective: true` only appears in Detective Mode
- `effects: [{type: 'health'|'alert'|'setAlert'|'addItem'|'removeItem'|'flag'|'inc'|'journal', ...}]`

Timed scenes: `timed: { seconds, defaultChoice, prompt }` (default must have no `requires`/`hideIf`/`detective`). The `Scene` schema needs the field, then `npm run seed`.

Scene-level: `onEnter` (first visit only unless `repeat: true`), `detectiveText`, `clue`, `ending`. `{{name}}` in text is replaced with the player's name.
