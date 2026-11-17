import { milestones, categories, paper } from '../content/milestones.js';
import { icon } from './ui.js';
import { mountGame } from './games.js';
import { mountTimeline } from './timeline.js';
import { mountSummary } from './summary.js';
import { images } from '../content/images.js';

const main = document.querySelector('#main');
const help = document.querySelector('#help-dialog');
const timelineState = { scale: 'logical', logicalZoom: 1, metricZoom: 1, scroll: 0, selected: 0 };
let timeline = null;
let currentIndex = -1;
let view = '';

function landingView() {
  main.innerHTML = `<section class="landing">
    <div class="landing-core-ideas">
      <h1>How do we remember more than we can hold?</h1>
      <p class="landing-subtitle">A journey through the ideas that became the database.</p>
      <div class="core-ideas">
        <div class="core-idea">
          <span class="idea-number">1</span>
          <h2>Environment → Invention</h2>
          <p>Every database idea is a response to a concrete record-keeping pain: a count that must outlive memory, a catalog that must absorb new books, a census that must finish on time, a web crawl that must run on failing machines.</p>
        </div>
        <div class="core-idea">
          <span class="idea-number">2</span>
          <h2>What Goes Around Comes Around</h2>
          <p>Since 1970, every challenger to the relational model either died, stayed niche, or had its good idea absorbed into SQL. The relational model keeps winning.</p>
        </div>
      </div>
      <a class="primary-link landing-link" href="#timeline">Follow the problems. Play with the breakthroughs. →</a>
    </div>
    <div class="landing-aside"><span class="orbit-text">STORE → ASK → SHAPE →</span>${icon('database')}<p>New problems.<br>Familiar ideas.</p></div>
  </section>`;
}

function milestoneView(index) {
  const m = milestones[index], category = categories[m.category], image = images[m.id];
  main.innerHTML = `<article class="milestone-page ${m.category}">
    <div class="milestone-breadcrumb"><a href="#timeline">← All milestones</a><span>${m.era}</span><span>${String(index + 1).padStart(2, '0')} <span class="muted">/ 23</span></span></div>
    <div class="milestone-heading"><div class="heading-title">${icon(m.icon)}<div><p class="eyebrow"><i class="dot ${m.category}"></i> ${category.label.toUpperCase()} / ${category.verb.toUpperCase()}</p><h1>${m.title}</h1></div></div><span class="milestone-date">${m.date}</span></div>
    <div class="milestone-layout">
      <figure class="historical-image"><img src="${image.file}" alt="${image.alt}"><figcaption>${image.caption}<br>Photo: ${image.artist} · resized · <a href="${image.source}" target="_blank" rel="noopener">Source</a> · ${image.licenseUrl ? `<a href="${image.licenseUrl}" target="_blank" rel="noopener">${image.license}</a>` : image.license}</figcaption></figure>
      <section class="milestone-text">
        <div class="problem-invention">
          <div><span class="mini-label">THE PRESSURE</span><p>${m.problem}</p></div>
          <div><span class="mini-label">THE BREAKTHROUGH</span><p>${m.invention}</p></div>
        </div>
        <div class="takeaway"><span class="mini-label">TAKE THIS WITH YOU</span><p>${m.takeaway}</p></div>
        <section class="experiment-invitation" aria-label="Interactive experiment">
          <button class="primary-link game-button" data-game-id="${m.id}">▶ Play the experiment</button>
        </section>
      </section>
    </div>
    <details class="speaker-notes"><summary>For the curious · speaker notes & sources</summary><p>${m.note}</p><a href="../../docs/milestones/${m.source}" target="_blank" rel="noopener">Full speaker notes ↗</a><a href="${paper}" target="_blank" rel="noopener">The 2024 position paper ↗</a>${m.id === 'documents' || m.id === 'cloud' ? '<a href="../../docs/sql-nosql-newsql.md" target="_blank" rel="noopener">SQL / NoSQL / NewSQL deep dive ↗</a>' : ''}</details>
    <nav class="milestone-pagination" aria-label="Adjacent milestones">
      <a href="${index ? `#transition/${milestones[index - 1].id}/${m.id}` : '#timeline'}"><small>← ${index ? 'PREVIOUS IDEA' : 'THE MAP'}</small><strong>${index ? milestones[index - 1].title : 'Back to the timeline'}</strong></a>
      <p>${m.next}</p>
      <a href="${index < milestones.length - 1 ? `#transition/${m.id}/${milestones[index + 1].id}` : '#summary'}"><small>${index < milestones.length - 1 ? 'NEXT IDEA' : 'CONNECT THE DOTS'} →</small><strong>${index < milestones.length - 1 ? milestones[index + 1].title : 'The big picture'}</strong></a>
    </nav>
  </article>`;
  
  main.querySelector('.game-button').onclick = (e) => {
    e.preventDefault();
    location.hash = `#game/${m.id}`;
  };
}

function gameView(index) {
  const m = milestones[index];
  main.innerHTML = `<article class="game-page ${m.category}">
    <div class="experiment-panel" aria-label="Interactive experiment">
      <div class="experiment-top"><span class="eyebrow">THE LITTLE EXPERIMENT / ${m.title}</span><button class="text-button" id="reset-game" aria-label="Reset experiment">↻ Reset</button></div>
      <h1>${m.gameTitle}</h1><p class="game-intro">${m.gameIntro}</p><div id="game-root" class="game-root"></div>
    </div>
  </article>`;
  const gameRoot = main.querySelector('#game-root');
  mountGame(m.game, gameRoot);
  main.querySelector('#reset-game').onclick = () => {
    mountGame(m.game, gameRoot);
    document.querySelector('#app-status').textContent = 'Experiment reset.';
  };
}

function render() {
  const hash = location.hash.slice(1) || 'home';
  document.querySelector('#app-status').textContent = '';
  timeline = null;
  currentIndex = -1;
  if (hash === 'home') {
    view = 'home';
    landingView();
  } else if (hash === 'timeline') {
    view = 'timeline';
    const savedScroll = timelineState.scroll;
    timeline = mountTimeline(main, timelineState);
    main.querySelector('#timeline-viewport').scrollLeft = savedScroll;
  } else if (hash === 'summary') {
    view = 'summary';
    mountSummary(main);
function transitionView(fromIndex, toIndex) {
  const fromM = milestones[fromIndex], toM = milestones[toIndex];
  const transitions = {
    '01→02': 'A count has no "what" | Farming and trade: many goods to track',
    '02→03': 'Tokens in sealed envelopes cannot be checked without breaking them | Press the marks on the outside; then drop the tokens',
    '03→04': 'Tablets pile up in archives | Large collections need finding aids',
    '04→05': 'A catalog written as a book has one fixed order and cannot absorb new entries | One entry per card: insert, remove, re-sort, several drawers',
    '05→06': 'Cards are read by humans; populations grow | Hole patterns that machines can read',
    '06→07': 'Card decks and tape are sequential | Spinning disk gives random access',
    '07→08': 'Random access reaches an address, but says nothing about how records relate | Apollo parts lists: parent → child pointers, trees of segments',
    '08→09': 'Trees cannot express many-to-many | Pointer sets: networks',
    '09→10': 'Programmers must navigate by hand, and programs break when data layout changes | Codd: tables, data independence',
    '10→11': 'Relational algebra is hard to use | SEQUEL/SQL',
    '11→12': 'Business records fit tables; scientific grids do not | Array models for science and images',
    '12→13': 'Arrays serve a niche; mainstream developers have objects | Object databases',
    '13→14': 'OODBs lose; absorbed as object-relational + ORMs. The next pain is volume, not shape | Google\'s MapReduce',
    '14→15': 'MapReduce is batch-only | Bigtable for interactive updates',
    '15→16': '"Column family" is not columnar; real analytics needed real columns | Column stores for warehouses',
    '16→17': 'Warehouses solve analytics; online apps need speed and uptime | Simple key-value stores',
    '17→18': 'A blob per key hides relationships | Graph databases add edges',
    '18→19': 'Two ways to add structure back to KV: edges or nesting | Document databases (and the NoSQL/NewSQL debate)',
    '19→20': 'The same 2009 "rethink the DB" mood, in the trust dimension | Blockchain (thematic, not causal)',
    '20→21': 'Blockchain removes the trusted operator; the market chose the opposite. Shared-nothing clusters (warehouses, NewSQL) are costly to run; networks beat disks | Cloud, object stores, lakehouse',
    '21→22': 'Lakehouses serve SQL and ML; ML brings embeddings | Vector databases',
    '22→23': 'New data type, new "model" | A new SQL index and type: the loop repeats'
  };
  const key = `${String(fromIndex + 1).padStart(2, '0')}→${String(toIndex + 1).padStart(2, '0')}`;
  const [problem, solution] = (transitions[key] || 'Problem → Solution').split(' | ');
  
  main.innerHTML = `<article class="transition-page">
    <div class="transition-breadcrumb"><a href="#milestone/${fromM.id}">← ${fromM.title}</a><span>Transition</span><a href="#milestone/${toM.id}">${toM.title} →</a></div>
    <section class="transition-content">
      <div class="transition-problem">
        <h2>${fromM.title} reached a limit:</h2>
        <p class="transition-text">${problem}</p>
        <div class="transition-icon">${icon(fromM.icon)}</div>
      </div>
      <div class="transition-arrow">↓</div>
      <div class="transition-solution">
        <h2>${toM.title} solved it:</h2>
        <p class="transition-text">${solution}</p>
        <div class="transition-icon">${icon(toM.icon)}</div>
      </div>
    </section>
    <nav class="transition-nav">
      <a href="#milestone/${fromM.id}" class="primary-link">Explore ${fromM.title}</a>
      <a href="#milestone/${toM.id}" class="primary-link">Explore ${toM.title}</a>
    </nav>
  </article>`;
}

  } else if (hash.startsWith('milestone/') || hash.startsWith('game/') || hash.startsWith('transition/')) {
    const isGame = hash.startsWith('game/');
    const isTransition = hash.startsWith('transition/');
    let id, fromId, toId;
    if (isTransition) {
      [, fromId, toId] = hash.split('/');
      fromIndex = milestones.findIndex(m => m.id === fromId);
      const toIndex = milestones.findIndex(m => m.id === toId);
      if (fromIndex === -1 || toIndex === -1) { invalidRoute(); return; }
      view = 'transition';
      transitionView(fromIndex, toIndex);
    } else {
      id = hash.slice(isGame ? 'game/'.length : 'milestone/'.length);
      currentIndex = milestones.findIndex(m => m.id === id);
      if (currentIndex === -1) { invalidRoute(); return; }
      view = isGame ? 'game' : 'milestone';
      timelineState.selected = currentIndex;
      if (isGame) gameView(currentIndex);
      else milestoneView(currentIndex);
    }
  } else { invalidRoute(); return; }
  document.querySelectorAll('[data-nav]').forEach(link => {
    const active = link.dataset.nav === (view === 'milestone' || view === 'game' || view === 'transition' ? 'timeline' : view);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = `${currentIndex >= 0 ? milestones[currentIndex].title : view === 'summary' ? 'The big picture' : 'A history of remembering'} — DB Time Machine`;
  window.scrollTo(0, 0);
  lastScroll = window.scrollY;
  document.body.classList.remove('nav-open');
  navReveal.setAttribute('aria-expanded', 'false');
  main.focus({ preventScroll: true });
}

function invalidRoute() {
  view = 'error';
  main.innerHTML = '<section class="error-page"><p class="eyebrow">THIS RECORD WAS NOT FOUND</p><h1>A missing link.</h1><p>This presentation address does not match a milestone.</p><a class="primary-link" href="#timeline">Return to the timeline →</a></section>';
}

async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.fullscreenEnabled) await document.documentElement.requestFullscreen();
    else document.querySelector('#app-status').textContent = 'Fullscreen is unavailable here. Use your browser’s fullscreen command (usually F11).';
  } catch (error) {
    console.error('Unable to change fullscreen mode:', error);
    document.querySelector('#app-status').textContent = 'Fullscreen was blocked by the browser. Try the browser’s fullscreen command (usually F11).';
  }
}

document.querySelector('#fullscreen-button').onclick = fullscreen;
document.querySelector('#help-button').onclick = () => help.showModal();
const navReveal = document.querySelector('.nav-reveal');
let lastScroll = window.scrollY;
navReveal.onclick = () => {
  const open = document.body.classList.toggle('nav-open');
  navReveal.setAttribute('aria-expanded', String(open));
};
window.addEventListener('scroll', () => {
  if (window.scrollY > 0) document.body.classList.remove('nav-open');
  else if (lastScroll > 0) document.body.classList.add('nav-open');
  lastScroll = window.scrollY;
  navReveal.setAttribute('aria-expanded', String(document.body.classList.contains('nav-open')));
}, { passive: true });
document.addEventListener('fullscreenchange', () => {
  document.querySelector('#fullscreen-button').setAttribute('aria-label', document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen');
});
let previousHash = '';

document.addEventListener('keydown', e => {
  if (help.open) return;
  if (e.key === 'Escape') {
    if (!document.fullscreenElement) location.hash = view === 'game' ? `milestone/${milestones[currentIndex].id}` : 'timeline';
    return;
  }
  if (e.key === 'Backspace') {
    e.preventDefault();
    if (previousHash) location.hash = previousHash;
    return;
  }
  const target = e.target;
  if (target.closest('input, select, textarea, [contenteditable="true"]')) return;
  // Interactive experiments own their keys; global shortcuts must not steal
  // arrow keys from a slider or change slides during keyboard play.
  const inExperiment = view === 'game' || target.closest('.game-root, #engine-controls');
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.key.toLowerCase() === 'f') { e.preventDefault(); fullscreen(); }
  else if (e.key === '?') { e.preventDefault(); help.showModal(); }
  else if (e.key.toLowerCase() === 't') location.hash = 'timeline';
  else if (e.key.toLowerCase() === 's') location.hash = 'summary';
  else if (!inExperiment && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
    e.preventDefault();
    const delta = e.key === 'ArrowLeft' ? -1 : 1;
    if (view === 'milestone') {
      if (e.key === 'Home') location.hash = `milestone/${milestones[0].id}`;
      else if (e.key === 'End') location.hash = `milestone/${milestones.at(-1).id}`;
      else if (currentIndex + delta >= milestones.length) location.hash = 'summary';
      else if (currentIndex + delta < 0) location.hash = 'timeline';
      else location.hash = `milestone/${milestones[currentIndex + delta].id}`;
    } else if (timeline) {
      const index = e.key === 'Home' ? 0 : e.key === 'End' ? milestones.length - 1 : Math.max(0, Math.min(milestones.length - 1, timelineState.selected + delta));
      timeline.jump(index, true);
    }
  } else if (timeline && ['+', '=', '-'].includes(e.key)) {
    e.preventDefault(); timeline.zoom(e.key === '-' ? 1 / 1.5 : 1.5);
  }
});
window.addEventListener('hashchange', () => {
  previousHash = location.hash;
  render();
});
render();
