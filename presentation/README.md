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
- Hash routes: `#/landing/N`, `#/timeline/N`, `#/m/NN/N` (milestone), `#/t/NN/N` (transition after milestone NN), `#/big/N`, `#/pitch/N` (bonus). `N` is the reveal step (omitted in exploration mode).
- Playwright MCP also works for visual checks; give it a fresh `page.goto` and wait ~1 s before screenshotting.

## File map

| Need to change | Edit only |
|---|---|
| Wording of a milestone (problem / solution / relevance / takeaway / year / concept chip) | `content/milestones/NN-slug.js` |
| Optional code-comparison overlay (button in the Relevance box, e.g. MapReduce "Java vs SQL") | `compare` in `content/milestones/NN-slug.js`; layout in `js/views/milestone.js` + `css/views/milestone.css` |
| Wording of a transition page between milestones | `content/transitions.js` (entry with `from: 'NN'`) |
| Vertical timeline markers (0 BCE, writing, …) | `content/markers.js` |
| Real photo / diagram of a milestone | drop file in `assets/images/`, register in `content/images.js`, credit in `assets/images/CREDITS.md` |
| Milestone symbol | `assets/symbols/NN-slug.svg` (96×96 viewBox, ink outline #0B1B33, category colours) |
| Mini game | `js/games/NN-slug.js` + `css/games/NN-slug.css` |
| Mascot pieces, roles, query animation | `content/bigpicture.js` (silhouette is drawn in `js/views/bigpicture.js`) |
| Bonus "Pitch" slide (DuckDB on commodity compute): copy, chart data, sources | `content/pitch.js` (charts are drawn in `js/views/pitch.js`) |
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
js/views/             landing · timeline · milestone · transition · bigpicture · pitch
js/games/             one file per milestone, DB.addGame('NN', …)
js/main.js            attaches images to milestones, starts the director (runs last)
css/                  base.css · menus.css · game-shell.css · views/*.css · games/*.css
content/              manifest · markers · images · transitions · bigpicture · pitch · milestones/*.js
assets/symbols|images generated SVG symbols and real images (+ CREDITS.md)
tools/                serve.mjs · shot.mjs · icon-sheet.html (all symbols on one page)
```

**Load order (`js/boot.js`)**: `ns.js` → `manifest.js` → CSS (menus, game-shell, views, games) → `images` → `markers` → `transitions` → `bigpicture` → `pitch` → milestones → `director` → `menus` → `game-shell` → views → games → `main.js`. A missing optional file only logs a warning.

## Presentation flow, steps and modes

Slides: `landing` (2 steps) → `timeline` (one reveal per milestone on the linear scale, then the switch to the logical scale) → for each milestone `m` (3 steps) then `t` transition (2 steps) → `bigpicture` (one step per mascot piece, then a query run) → bonus `pitch` (one step per scene after the opening question). MapReduce is a timeline milestone, not a mascot piece. After RAMAC, the timeline first shows the milestones covered so far. Advance once to pan to IMS and fit all remaining milestones to its right, then continue to the existing RAMAC→IMS transition.

- **Presentation mode**: content appears step by step. Forward = click, →, Space, Enter, PageDown. Back = ←, PageUp, Backspace. Going back onto the previous slide shows it fully revealed.
- **Exploration mode**: everything visible, free navigation. Switch with the corner toggle (hidden; appears when the pointer nears the top-right corner) or `E`. The choice is stored in `localStorage.dbtm.mode`; `?mode=explore` overrides.
- Reveal mechanism: any element with `data-at="N"` is hidden until step ≥ N (`DB.applySteps`, `css/base.css`). Views just put `data-at` on things.
- Milestone steps: 0 header + photo, 1 Problem (+ game appears), 2 Solution, 3 Relevance + takeaway.
- Transition steps: 0 question + exhibit, 1 "stuck" banner, 2 trigger and the next milestone revealed.
- Hidden menus appear near the edges: top bar (logo, Timeline, progress dots, Big picture, bonus Pitch with a gift icon), bottom dock on the timeline (Logical/Linear scale, zoom −/+/Fit, Start/End), left/right edge arrows (adjacent milestones), top-right corner (mode toggle and fullscreen).

Keys: `→ ← Space Enter PageUp/Down Backspace` navigate · `E` mode · `F` fullscreen · `T` timeline · `B` big picture · `L` landing · `G` expand/close current game · `Esc` closes an expanded game or comparison overlay, otherwise returns to the timeline (from milestone, transition, big picture and pitch). Timeline only: `+ - 0` zoom, `Home End` jump to start/end, `S` toggle linear/logical scale.

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
  problem: '…', solution: '…', relevance: '…', takeaway: '…',
  compare: {                 // optional: adds a button to the Relevance box that opens a full-screen comparison
    button: 'Java vs SQL', kicker: '…', title: '…', intro: '…', goal: '…',
    input: ['…'], output: ['…'],           // tiny example shown next to the goal
    hard: { label, note, stat, lang: 'java', blocks: [{ title, tag, code }], needsLabel, needs: ['…'] },
    easy: { label, note, stat, lang: 'sql', joiner: 'or', blocks: [{ title, code }] },
    verdict: '…'
  }
});

// content/transitions.js: question + exhibit are on screen at step 0
DB.transitions.push({ from: '05', question: '…', exhibit: '…', stuck: '…', trigger: '…' });

// content/images.js
DB.images['05'] = { file: 'assets/images/05-card-catalog.jpg', alt: '…', credit: '…', source: 'https://…' };
// .png/.svg are shown with "contain", .jpg with "cover" unless contain: true. No images of people.
// `file` must be a local path; `source` is attribution metadata only and is never fetched.
```

**Offline**: the presentation must run without an internet connection. Keep every image, symbol, script and stylesheet under `presentation/`, and never hotlink images, fonts, or CDN scripts.

**Add a milestone**: append the slug to `content/manifest.js`, then create `content/milestones/NN-slug.js`, `content/transitions.js` entry (`from` = the new id, and update the previous entry's `trigger` to point to it), `assets/symbols/NN-slug.svg`, image (optional) and game files. The timeline, progress dots and edges derive from the manifest. If the milestone belongs on the summary chart, add a piece in `content/bigpicture.js`.

When removing a milestone, also check the challenger list in `js/games/23-sql-absorbs.js`. Each token uses its milestone's title and symbol.

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

- **timeline** (`js/views/timeline.js`): DOM nodes (symbol + label) over an SVG axis. Each node has a fixed lane (`i % 4`: above/below the axis, near/far), so icons never hop between rows when zooming or panning; nodes that don't fit fold into a "+N" badge that zooms in, and the node size (`nodeScale`) grows smoothly with the available room. Years appear only as axis labels (`drawTicks`, drawn above the stems): regular ticks on the linear scale, each milestone's `year` on the logical scale (in fixed rows). `st.t` blends linear (0) and logical (1) scale; the linear axis runs from 20,000 BCE to 2030 (`YMIN`/`YMAX`) and zoom/pan stay inside it; markers come from `content/markers.js`. Wheel/drag/buttons zoom and pan; clicking a node opens the milestone. Presentation mode starts on the linear scale and reveals one node per step; each step animates the camera (`presentFrame`) forward to the newest milestone and zooms in as milestones cluster into shorter time spans (the zoom never widens again; tune `CAM`); the last step switches to the logical scale before the first milestone. The post-RAMAC review uses logical spacing for both its recap and its preview. Exploration mode starts on the logical scale, fitted.
- **milestone**: identical layout for all: symbol next to the title, photo, three sections, game, takeaway, adjacent links via edge menus. A milestone with `compare` (MapReduce) gets a button in the Relevance box that opens a full-screen overlay on `<body>` with its own reveal: goal + `hard` code, then `easy` code, then the verdict. While it is open, forward/back keys and clicks walk those steps, either end (or `Esc`) closes it, and leaving the slide removes it.
- **transition**: the issue the previous milestone cannot solve, then the trigger for the next one.
- **bigpicture**: mascot "Rowie" (SVG viewBox 1000×1020). The `pieces` array in `content/bigpicture.js` sets assembly order independently of the timeline: primitives build the legs, then the arms; models fill the torso around the relational heart; SQL is the voice. The synthesis badge completes the mascot, and the last step runs a query through it.
- **pitch** (bonus, after the big picture): a management pitch for trying DuckDB on commodity compute, after Fraser's Fivetran post (see `docs/sources.md`). A left rail accumulates the argument in three acts (data is small → premium compute is a markup → proof & momentum) and the stage shows one animated SVG scene per step: hook (cluster vs phone), query-size histogram, largest-EC2-machine growth, EC2 price drop, premium-vs-EC2 markup, TPC-H benchmark, AWS/DuckLabs acquisition, the ask. Scenes, copy and chart values live in `content/pitch.js`; each `chart` key maps to a renderer in `js/views/pitch.js`. Rail items jump to a scene (exploration mode starts on the last one). Red = premium compute, green = commodity compute / DuckDB. Chart values are schematic (read off published charts); re-check them before presenting.

## Gotchas

- Click-to-advance ignores `button, a, input, select, textarea, label, .menu, .edge-nav, .game-panel, [data-no-advance]`, and also ignores clicks whose target was detached by its own handler (icon swaps).
- First screenshot right after `page.reload()` can be blank (entry animation); wait ~1 s.
- Keep per-game CSS under `.game-NN`. View classes carry a view prefix so they cannot leak into game DOM: `ld-` landing, `tl-` timeline (`tl-tick`, `tl-seg`), `ms-` milestone (`ms-rec`), `tr-` transition, `bp-` big picture (`bp-slot`, `bp-halo`), `pt-` pitch. Keep that prefix when adding view classes.
- `Esc` closes the expanded game, otherwise returns to the timeline. Games therefore must not use `Esc` or any other key.
- Some facts in the copy are flagged as unverified by the content author: the 1974 SEQUEL date, IMS 1966, the vector-index timing, the 1890 census "63 million", the card-catalog playing-card origin story. Re-check before presenting.
- Image credits (CC BY / CC BY-SA require attribution) are in `assets/images/CREDITS.md`; each photo also reveals its credit as a caption on hover.
