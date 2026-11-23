# Arkham Text Adventure

Read `Project_Batman.md` first: it is the source of truth for scope, rules and status.

- MERN + MVC, plain JavaScript, ES modules (`import`/`export`, `.js` extensions). Repo root is `Batman/`. Server is authoritative; engine in `server/services/engine.js` stays pure.
- No raster images or audio. Inline SVG/CSS only.
- Run `npm run check` after any scene, engine or schema change. It must stay green. It runs the scene checks, the `node:test` suite (`server/test/*.test.js`) and the simulation.
- New scene fields also go in the `Scene` schema, then `npm run seed`. MongoDB runs in a podman container (`mongodb`, port 27017); `server/.env` holds the URI.
- v2.0 (Section 5: trophies and timed choices) is built. Only build what the current target section of `Project_Batman.md` says. Next up is Section 6.1 (fear meter): write `docs/fear-meter-design.md` and wait for approval before any code. Section 6 is planning-only.
- When a feature is finished, update the Status section and tick the acceptance boxes in `Project_Batman.md`.
- Original writing only; placeholders marked `TODO(author)` are for the author to rewrite.
