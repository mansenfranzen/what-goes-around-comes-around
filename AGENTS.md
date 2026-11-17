# Instructions for agents

## Repository overview

This repository contains an interactive, full-screen browser presentation about the history of databases. Its two central ideas are that practical problems drive inventions and that SQL and the relational model have absorbed ideas from competing approaches.

- `presentation/` is the current presentation. Treat it as the source of truth for the app; do not refer to an older version.
- `docs/` contains the speaker notes, milestone research, sources, and glossary. Use it as the source material for presentation content.
- `presentation/README.md` is the detailed guide to the architecture, conventions, content schemas, and presentation controls. Consult it for task-specific changes.

## Making changes

- Keep changes focused. Start with the file map in `presentation/README.md` and edit the file or files responsible for the requested behavior.
- The presentation uses classic JavaScript scripts and CSS, without a build step. Preserve the script load order documented in `presentation/README.md`.
- Milestones are listed in `presentation/content/manifest.js`. When adding one, update the manifest, milestone content, transition content, symbol, and big-picture piece; add an image and game only when needed.
- Keep view CSS under its view prefix and game CSS scoped to `.game-NN`. Stylesheets load globally, so avoid unscoped selectors that could affect other views or games.
- Mini-games must work both in the panel and expanded view, use pointer-based controls (the presentation director owns keyboard navigation), and clean up timers, animation frames, and listeners when destroyed. Use `DB.rng(seed)` rather than `Math.random`.
- Preserve image attribution in `presentation/assets/images/CREDITS.md`. Do not add people to presentation images, external libraries, or external fonts.
- Some historical details are flagged as unverified in the presentation guide. Check the cited source material before presenting those details as established fact.
- Follow existing code and formatting patterns. Avoid unrelated refactors.

## Run and verify

From `presentation/`, start the local server with:

```bash
node tools/serve.mjs
```

It serves the presentation at <http://127.0.0.1:8765>. The app can also run by opening `presentation/index.html` directly in a browser.

For browser screenshots and interaction checks, use `node tools/shot.mjs` as documented in `presentation/README.md`. After changing presentation behavior, verify the affected view or interaction and check for browser console errors.
