# DB Time Machine: agent guide

Interactive, full-screen, browser-based talk about the history of databases.
Two ideas: **(1) pain creates inventions** and **(2) "What Goes Around Comes Around … And Around"** (Stonebraker & Pavlo: SQL/relational absorbs its challengers).
Source material lives in `../docs/`.

**You almost never need to open a whole file.** Find the task below, edit the one file it names.

## Run and test

```bash
node tools/serve.mjs                       # http://127.0.0.1:8765 (no-store cache; python http.server is not available here)
node tools/shot.mjs '#/m/05/1' '[["wait",500],["click",".game-05 .g-btn"],["shot","/tmp/shots/a.png"]]'
```

- The app is plain classic scripts + CSS, so `index.html` also works from `file://`.
- `tools/shot.mjs` runs its own headless Chromium at 1920×1080 (safe to run in parallel; `SIZE=1280x720` changes the viewport, `BASE=file:///…` screenshots any other page). Actions: `wait ms`, `click sel`, `move x y`, `key name`, `eval js`, `shot path`, `goto hash`. It prints page and console errors. Prefix the hash with `?mode=explore` to open in exploration mode.
- Hash routes: `#/landing/N`, `#/timeline/N`, `#/m/NN/N` (milestone), `#/t/NN/N` (transition after milestone NN), `#/big/N`. `N` is the reveal step (omitted in exploration mode).
- Playwright MCP also works for visual checks; give it a fresh `page.goto` and wait ~1 s before screenshotting.

## File map

| Need to change | Edit only |
|---|---|
| Wording of a milestone (problem / solution / relevance / takeaway / year / concept chip) | `content/milestones/NN-slug.js` |
| Wording of a transition page between milestones | `content/transitions.js` (entry with `from: 'NN'`) |
| Vertical timeline markers (0 BCE, writing, …) | `content/markers.js` |
| Real photo / diagram of a milestone | drop file in `assets/images/`, register in `content/images.js`, credit in `assets/images/CREDITS.md` |
| Milestone symbol | `assets/symbols/NN-slug.svg` (96×96 viewBox, ink outline #0B1B33, category colours) |
| Mini game | `js/games/NN-slug.js` + `css/games/NN-slug.css` |
| Mascot pieces, roles, query animation | `content/bigpicture.js` (silhouette is drawn in `js/views/bigpicture.js`) |
| Order / list of milestones | `content/manifest.js` |
| Colours, fonts, global look | `css/base.css` (CSS variables at the top) |
| Layout of a view | `css/views/<view>.css` + `js/views/<view>.js` |
| Slide order, steps, keys, modes | `js/core/director.js` |
| Hidden menus (top bar, mode toggle, edge arrows, progress) | `js/core/menus.js` + `css/menus.css` |
| Game panel chrome (hint, reset, full screen) | `js/core/game-shell.js` + `css/game-shell.css` |

```
index.html            tiny shell: loads css/base.css and js/boot.js, nothing else
js/boot.js            loads everything listed in content/manifest.js (order below)
js/core/              ns.js (DB namespace + helpers) · director · menus · game-shell
js/views/             landing · timeline · milestone · transition · bigpicture
js/games/             one file per milestone, DB.addGame('NN', …)
js/main.js            attaches images to milestones, starts the director (runs last)
css/                  base.css · menus.css · game-shell.css · views/*.css · games/*.css
content/              manifest · markers · images · transitions · bigpicture · milestones/*.js
assets/symbols|images generated SVG symbols and real images (+ CREDITS.md)
tools/                serve.mjs · shot.mjs · icon-sheet.html (all symbols on one page)
```

**Load order (`js/boot.js`)**: `ns.js` → `manifest.js` → CSS (menus, game-shell, views, games) → `images` → `markers` → `transitions` → `bigpicture` → milestones → `director` → `menus` → `game-shell` → views → games → `main.js`. A missing optional file only logs a warning.

## Presentation flow, steps and modes

Slides: `landing` (2 steps) → `timeline` (23 steps, one milestone per step) → for each milestone `m` (3 steps) then `t` transition (2 steps) → `bigpicture` (24 steps: 23 pieces, then a query run).

- **Presentation mode**: content appears step by step. Forward = click, →, Space, Enter, PageDown. Back = ←, PageUp, Backspace. Going back onto the previous slide shows it fully revealed.
- **Exploration mode**: everything visible, free navigation. Switch with the corner toggle (hidden; appears when the pointer nears the top-right corner) or `E`. The choice is stored in `localStorage.dbtm.mode`; `?mode=explore` overrides.
- Reveal mechanism: any element with `data-at="N"` is hidden until step ≥ N (`DB.applySteps`, `css/base.css`). Views just put `data-at` on things.
- Milestone steps: 0 header + photo, 1 Problem (+ game appears), 2 Solution, 3 Relevance + takeaway.
- Transition steps: 0 question + exhibit, 1 "stuck" banner, 2 trigger and the next milestone revealed.
- Hidden menus appear near the edges: top bar (logo, progress dots), bottom dock on the timeline (Logical/Linear scale, zoom −/+/Fit, Start/End), left/right edge arrows (adjacent milestones), top-right corner (mode toggle and fullscreen).

Keys: `→ ← Space Enter PageUp/Down Backspace` navigate · `E` mode · `F` fullscreen · `T` timeline · `B` big picture · `L` landing · `G` expand/close current game · `Esc` closes expanded game, otherwise returns to the timeline (from milestone, transition and big picture). Timeline only: `+ - 0` zoom, `Home End` jump to start/end, `S` toggle linear/logical scale.

## Content schemas

```js
// content/milestones/NN-slug.js
DB.addMilestone({
  id: '05', slug: 'card-catalog', title: 'Card Catalog', short: 'Card catalog',
  year: '1791',              // label shown with the symbol
  pos: 1791,                 // numeric year for the linear scale (BCE negative)
  category: 'primitives',    // primitives | language | model | synthesis → colour set (--cat, --cat-ink, --cat-tint)
  verdict: 'Ancestor',       // chip next to the title
  concept: 'INSERT·INDEX',   // relevance chip
  today: 'INSERT INTO cards VALUES (…)',   // optional code line next to the chip
  problem: '…', solution: '…', relevance: '…', takeaway: '…'
});

// content/transitions.js: question + exhibit are on screen at step 0
DB.transitions.push({ from: '05', question: '…', exhibit: '…', stuck: '…', trigger: '…' });

// content/images.js
DB.images['05'] = { file: 'assets/images/05-card-catalog.jpg', alt: '…', credit: '…', source: 'https://…' };
// .png/.svg are shown with "contain", .jpg with "cover". No images of people.
```

**Add a milestone**: append the slug to `content/manifest.js`, then create `content/milestones/NN-slug.js`, `content/transitions.js` entry (`from` = the new id, and update the previous entry's `trigger` to point to it), `assets/symbols/NN-slug.svg`, image (optional), game files and a piece in `content/bigpicture.js`. Nothing else changes: the timeline, progress dots, edges and big picture derive from the list.

## Mini games (`js/games/NN-slug.js`)

```js
(function (DB) {
  DB.addGame('05', {
    hint: 'One short instruction',
    mount: function (root, api) {          // root = .game-root.game-05 ; api = { hint(text), done(bool), full(), root }
      // build UI into root with DB.h / DB.svg
      return { destroy: function () { /* cancel rAF, timers, document/window listeners */ } };
    }
  });
})(window.DB);
```

Rules (the same game runs in a ~1100×640 panel and full screen):
- **Scale with `em`, `%`, flex/grid or an SVG `viewBox`, never `px/vw/vh/rem`.** `.game-root` sets `font-size: calc(2.8cqmin)` (≈18 px in the panel, ≈28 px expanded). Text ≥ `.8em`, buttons ≥ `2.2em` tall.
- **Scope all CSS to `.game-NN`** (`css/games/NN-slug.css`). Every stylesheet is loaded globally, so a bare class collides across views and games (a bare `.pulse` once hid timeline nodes). Avoid the shared global names `.chip`, `.on`, `.seg-btn`, `.dock-btn` and anything `g-` prefixed unless you mean the shared style.
- **No keyboard.** The director owns arrows, Space, Enter and Backspace. Use pointer events, buttons or `input.g-range`. Never add window/document key listeners.
- Reset = `destroy` then `mount` again, so `mount` must start clean. Use `DB.rng(seed)`, not `Math.random`.
- Call `api.done(true)` when the key insight is reached (green tick in the panel header).
- Visuals are SVG/CSS, white background, high contrast, no emoji, no external libs or fonts. Colours: `--ink --cat --cat-ink --cat-tint --good --bad --muted --line --paper --mono`.
- Reuse helpers from `css/game-shell.css` (all `g-` prefixed): `g-row g-col g-grow g-center g-wrap g-mono g-label g-msg(.good/.bad) g-btn(.alt/.cat/.on) g-card g-tint g-stat g-code g-range g-table g-pop g-shake g-pulse g-hl g-draggable`.
- `DB` helpers: `h(tag, attrs, …children)` (`class text html style data on:{evt:fn}`), `svg`, `$`, `$$`, `clamp`, `lerp`, `ease`, `tween`, `rng`, `symbolURL(m)`, `byId`.
- Clicks inside `.game-panel` never advance the slide. Reference implementation: `js/games/01-tally-bone.js`.

## Views, in one paragraph each

- **timeline** (`js/views/timeline.js`): DOM nodes (symbol + year + label, 4 lanes, overflow folds into a "+N" badge that zooms in) over an SVG axis. `st.t` blends linear (0) and logical (1) scale; markers come from `content/markers.js`. Wheel/drag/buttons zoom and pan; clicking a node opens the milestone. Presentation mode reveals one node per step.
- **milestone**: identical layout for all: symbol next to the title, photo, three sections, game, takeaway, adjacent links via edge menus.
- **transition**: the issue the previous milestone cannot solve, then the trigger for the next one.
- **bigpicture**: mascot "Rowie" (SVG viewBox 1000×1020). Pieces pop in per step in timeline order; the last step runs a query through the pieces. All geometry and wording are in `content/bigpicture.js`.

## Gotchas

- Click-to-advance ignores `button, a, input, select, textarea, label, .menu, .edge-nav, .game-panel, [data-no-advance]`, and also ignores clicks whose target was detached by its own handler (icon swaps).
- First screenshot right after `page.reload()` can be blank (entry animation); wait ~1 s.
- Keep per-game CSS under `.game-NN`. View classes carry a view prefix so they cannot leak into game DOM: `ld-` landing, `tl-` timeline (`tl-tick`, `tl-seg`), `ms-` milestone (`ms-rec`), `tr-` transition, `bp-` big picture (`bp-slot`, `bp-halo`). Keep that prefix when adding view classes.
- `Esc` closes the expanded game, otherwise returns to the timeline. Games therefore must not use `Esc` or any other key.
- Some facts in the copy are flagged as unverified by the content author: the 1974 SEQUEL date, IMS 1966, the vector-index timing, the 1890 census "63 million", the card-catalog playing-card origin story. Re-check before presenting.
- Image credits (CC BY / CC BY-SA require attribution) are in `assets/images/CREDITS.md`; each photo also reveals its credit as a caption on hover.
