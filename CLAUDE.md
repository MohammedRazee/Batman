# Arkham Text Adventure

Read `Project_Batman.md` first: scope, roadmap, status and decisions. Build only the target its Status section names. Sections marked planning-only are not to be built. Feature briefs and design docs in `docs/` are read when `Project_Batman.md` points to them.

## Stack and architecture
- MERN + MVC, plain JavaScript, ES modules (`import`/`export`, `.js` extensions on relative imports). No TypeScript, no CommonJS. Repo root is `Batman/`.
- Game rules live in `server/services/engine.js` as pure functions (no DB, no `req/res`). Controllers validate, call the engine, persist and respond. The client only renders what the server returns.
- Server is authoritative: the client sends intents, never state. Riddle answers are checked on the server and never sent to the client.
- No raster images or audio. Inline SVG/CSS only.
- Respect `prefers-reduced-motion` for every new animation.

## Commands
`npm run install:all | seed | dev | check | build`
- Run `npm run check` after any scene, engine or schema change. It must stay green. It runs the scene checks, the `node:test` suite (`server/test/*.test.js`) and the simulation. Extend it for every new feature.
- New scene fields also go in the `Scene` schema (Mongoose strict mode drops unknown fields), then run `npm run seed`.
- MongoDB runs in a podman container (`mongodb`, port 27017). `server/.env` holds the URI.

## Workflow
- Use the `ponytail` skill (full) for all coding tasks. The acceptance criteria and rules in `Project_Batman.md` count as asked-for, so ponytail must not cut them.
- Small commits, one logical change each. Never commit `.env` or secrets.
- If the brief is ambiguous or conflicts with the actual code, stop and ask.
- When a feature is finished, update the Status section and the contracts (API routes, scene data shape, model fields) in `Project_Batman.md`, and tick the acceptance boxes.
- Original writing only. Placeholders marked `TODO(author)` are for the author to rewrite.