# Arkham Text Adventure

Read `Project_Batman.md` first: it is the source of truth for scope, rules and status.

- MERN + MVC, plain JavaScript, ES modules (`import`/`export`, `.js` extensions). Repo root is `Batman/`. Server is authoritative; engine in `server/services/engine.js` stays pure.
- No raster images or audio. Inline SVG/CSS only.
- Run `npm run check` after any scene, engine or schema change. It must stay green.
- Only build what Section 5 of Project_Batman.md says. Section 6 is planning-only.
- When a feature is finished, update the Status section and tick the acceptance boxes in Project_Batman.md.