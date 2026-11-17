# DB Time Machine

A dependency-free, browser-based presentation built only from the material in
[`../docs`](../docs/README.md). The presentation has three versions:

- **v1**: The original, with minimal changes to file paths. Run with `npm start --prefix presentation/v1`.
- **v2**: Enhanced version with dedicated game views, landing page, hidden top navigation, and historical images for each milestone from Wikimedia Commons. Run with `npm start --prefix presentation/v2`.
- **v3**: Major redesign with full-screen games, landing page featuring the two core ideas (Environment → Invention and What Goes Around Comes Around), integrated era categories in timeline, transition pages between milestones, and backspace navigation. Run with `npm start --prefix presentation/v3`.

## Present

From the repository root, with Node.js 22 or newer, choose your version:

```sh
node presentation/v3/serve.mjs   # Latest v3 with core ideas landing & fullscreen games
node presentation/v2/serve.mjs   # Enhanced v2 with games & images
node presentation/v1/serve.mjs   # Original v1
```

Or use `npm start --prefix presentation/v3` (etc.); no install is required.

Open **http://127.0.0.1:8765/presentation/{v1|v2|v3}/**. The local-only server exposes just
`presentation/` and `docs/`, so the speaker-note links work too. Set `PORT` to
choose another port. Stop with Ctrl+C. Alternatively, serve the repository with
an existing static HTTP server. Do not open the HTML via `file://`: ES modules
require HTTP. There is no build step, CDN, tracking, remote font, or image fetch.
After the files are available locally, presenting needs no internet connection.
The paper and other external reference links naturally require internet.

### V3 Features (Latest)

The landing page prominently displays the two core ideas:
1. **Environment → Invention**: Every database idea solves a concrete record-keeping pain.
2. **What Goes Around Comes Around**: Since 1970, SQL keeps winning; challengers die, stay niche, or get absorbed.

Gameplay and navigation improvements:
- **Fullscreen game views**: Experiments span the entire viewport with no return link; press Escape to exit.
- **Game button layout**: "Play the experiment" button appears after "TAKE THIS WITH YOU" in milestone views.
- **Backspace navigation**: Press Backspace to return to the previous view, complementing browser back/forward.
- **Restructured milestone layout**: Image on the left, text sections (pressure, breakthrough, takeaway) stacked on the right.
- **No footer**: Removed the bottom bar; focus is entirely on the presentation content.

### V2 & V1 Controls (Still Available)

- **F** or the top-right button: fullscreen (browser permission permitting).
- Move the pointer to the top edge, scroll back to the top, or focus and
  activate **Show navigation** to reveal the hidden menu. It hides when you
  scroll away; the control also works by touch.
- **← / →**: focus neighboring timeline milestones, or change milestone views.
- **Enter**: open a focused timeline milestone.
- **Home / End**: first / last milestone.
- **+ / −**: zoom the timeline around the viewport center.
- **T / S**: timeline / summary. **?**: shortcut help. **Backspace**: back to previous view. **Escape**: return from
  an experiment to its milestone, or otherwise return to the timeline (the
  browser handles leaving fullscreen first).
- Scroll or swipe horizontally along the timeline. Beginning/present buttons
  reach either end in one click. Chapter cards jump to their first stop.
- Use **Play the experiment** to open its dedicated view and **Reset** to repeat
  it. Leaving the experiment resets its demo;
  timeline scale, zoom and scroll are retained while navigating.
- Long experiments scroll with their own view.

**Story spacing** follows the notes' narrative order, including overlapping
movements (e.g. key-value stores after columnar warehouses). **True time**
positions every stop in direct proportion to its numeric year anchor. Crowded
events cluster; click a cluster to zoom. **All 23 stops** opens a chronological-
anchor-labeled narrative list, including events with identical years that
cannot be separated by any metric zoom. Dates such as “1980s” use an explicitly
approximate anchor, not a historically precise instant. Logical spacing is the
default because the prehistoric span otherwise compresses the modern story.

The summary is a layered database: change storage layout and compute workers
while keeping the query and answer fixed. Its inheritance links revisit every
milestone.

## Edit without reading a giant HTML file

| What to change | File |
|---|---|
| Wording, dates, year anchors, categories, transitions, caveats, notes links | [`v2/content/milestones.js`](v2/content/milestones.js) |
| App shell, navigation header, help dialog | [`v2/index.html`](v2/index.html) |
| Routing, milestone layout, keyboard shortcuts, fullscreen | [`v2/js/app.js`](v2/js/app.js) |
| Timeline coordinates, zoom, collision clustering, era picker | [`v2/js/timeline.js`](v2/js/timeline.js) |
| Modern database synthesis and its controls | [`v2/js/summary.js`](v2/js/summary.js) |
| Games 01–13 | [`v2/js/games-early.js`](v2/js/games-early.js) |
| Games 14–23 | [`v2/js/games-modern.js`](v2/js/games-modern.js) |
| Game registry and reset entry point | [`v2/js/games.js`](v2/js/games.js) |
| Shared small UI helpers and keyboard-focus preservation | [`v2/js/ui.js`](v2/js/ui.js) |
| Layout, theme, responsive and compact projector styles | [`v2/styles.css`](v2/styles.css) |
| Experiment-specific styling | [`v2/styles/games.css`](v2/styles/games.css) |
| All 23 original diagram/symbol illustrations | [`v2/assets/symbols.svg`](v2/assets/symbols.svg) |
| Photograph metadata and credits | [`v2/content/images.js`](v2/content/images.js) |
| Locally stored photographs | [`v2/assets/photos/`](v2/assets/photos/) |

Start with the relevant row, not the whole directory. Narrative content is
trusted author-written text interpolated into templates, **not an input channel
for user-provided HTML**. Game input uses fixed choices, bounded numbers and
range controls. Don't add unsanitized arbitrary HTML input.

### Change or add an experiment

The `game` field selects a named function in one of the game modules. Its only
argument is its DOM root. Keep state inside that function. Use `painter(root)`
to preserve keyboard focus across redraws. Keep the ancestor structure around
range inputs stable: the painter leaves an active slider attached so dragging
continues across live updates. Attach handlers to the root, not to
`window` or `document`. Avoid timers unless you also add explicit teardown.
`mountGame()` clears root handlers before starting; the Reset button remounts
the game. Keep games meaningfully different and demonstrate the concept, not
just a fact-recall question.

Changing the milestone count also requires updating the shell's “23” labels,
chapter ranges, progress denominator, the absorption game if relevant, and the
content tests. Keep IDs stable: URLs use `#milestone/<id>`.

### Illustrations

The icons are original schematic SVGs. Each milestone also includes a local,
resized Wikimedia Commons photograph with the creator, license and source
linked in its caption. Where no image of the specific idea is available, the
caption identifies the pictured related object or person rather than implying
it is the milestone itself. Image metadata is in `content/images.js`. Each
milestone chooses a `<symbol id>` from the SVG sprite. Add symbols with
`viewBox="0 0 120 100"`. All assets remain external to the HTML.

### Historical accuracy and simulation boundaries

Use the corresponding notes in `docs/milestones/` as the narrative source.
Keep contested origins, approximate dates and the paper's opinions visible in
the collapsible notes. Do not turn the authors' position into an uncontested
verdict or imply that an SQL standard is implemented in every engine.

Games deliberately use tiny datasets and illustrative cost models. They do
not execute SQL, benchmark engines, implement cryptographic consensus or ANN,
or promise linear cloud speedup. Current catalog prices in the document demo
are intentionally **not historical order prices**. The vector map is an
invented 2-D exact-distance illustration. These limits appear in the UI.

## Validate

No dependency install is needed:

```sh
node --test presentation/v2/tests/content.test.mjs
node --test presentation/v1/tests/content.test.mjs
```

With the presentation served and open in a real browser, run this in the
browser's developer console (also suitable for Playwright `page.evaluate`):

```js
await (await import('./tests/browser-checks.js')).runBrowserChecks()
```

Expected: **25 / 25 passed**. It exercises all 23 games and their resets, exact
metric proportions, equal narrative spacing, overlapping-year access, timeline
endpoints, bounded zoom, and the summary's invariant answer.

To check the v2 routes, local photographs, reset and return navigation:

```js
await (await import('./tests/navigation-checks.js')).runNavigationChecks()
```

Expected: **3 / 3 passed**. This check navigates between views.

For Playwright visual checks, inspect at least:

1. Timeline at 1440 × 900: story spacing, true time, zoom, both endpoints.
2. `#milestone/relational` → experiment: change customer and storage order; result is stable.
3. `#milestone/documents` → experiment: three embedded updates vs. one shared update.
4. `#summary`: row/column and worker controls.
5. A 390 × 844 phone viewport: no page-wide horizontal overflow; timeline,
   tables and code may scroll within their own panels.
6. Tab/Enter, range-input arrow keys, shortcut help, browser back/forward,
   fullscreen, and browser console/network errors.

Use semantic DOM queries for behavior and screenshots for appearance. Add
focused regression checks to the existing test files when changing behavior.
