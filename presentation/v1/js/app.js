import { milestones, categories, paper } from '../content/milestones.js';
import { icon } from './ui.js';
import { mountGame } from './games.js';
import { mountTimeline } from './timeline.js';
import { mountSummary } from './summary.js';

const main = document.querySelector('#main');
const help = document.querySelector('#help-dialog');
const timelineState = { scale: 'logical', logicalZoom: 1, metricZoom: 1, scroll: 0, selected: 0 };
let timeline = null;
let currentIndex = -1;
let view = '';

function milestoneView(index) {
  const m = milestones[index], category = categories[m.category];
  main.innerHTML = `<article class="milestone-page ${m.category}">
    <div class="milestone-breadcrumb"><a href="#timeline">← All milestones</a><span>${m.era}</span><span>${String(index + 1).padStart(2, '0')} <span class="muted">/ 23</span></span></div>
    <div class="milestone-heading"><div><p class="eyebrow"><i class="dot ${m.category}"></i> ${category.label.toUpperCase()} / ${category.verb.toUpperCase()}</p><h1>${m.title}</h1></div><span class="milestone-date">${m.date}</span></div>
    <div class="milestone-layout">
      <section class="milestone-context" aria-label="Problem and invention">
        <div class="artifact-frame ${m.category}">${icon(m.icon)}<span class="artifact-caption">AN IDEA, ILLUSTRATED / ${String(index + 1).padStart(2, '0')}</span></div>
        <div class="problem-invention"><div><span class="mini-label">THE PRESSURE</span><p>${m.problem}</p></div><div><span class="mini-label">THE BREAKTHROUGH</span><p>${m.invention}</p></div></div>
      </section>
      <section class="experiment-panel" aria-label="Interactive experiment">
        <div class="experiment-top"><span class="eyebrow">THE LITTLE EXPERIMENT</span><button class="text-button" id="reset-game" aria-label="Reset experiment">↻ Reset</button></div>
        <h2>${m.gameTitle}</h2><p class="game-intro">${m.gameIntro}</p><div id="game-root" class="game-root"></div>
      </section>
    </div>
    <div class="takeaway"><span class="mini-label">TAKE THIS WITH YOU</span><p>${m.takeaway}</p><span aria-hidden="true">↗</span></div>
    <details class="speaker-notes"><summary>For the curious · speaker notes & sources</summary><p>${m.note}</p><a href="../../docs/milestones/${m.source}" target="_blank" rel="noopener">Full speaker notes ↗</a><a href="${paper}" target="_blank" rel="noopener">The 2024 position paper ↗</a>${m.id === 'documents' || m.id === 'cloud' ? '<a href="../../docs/sql-nosql-newsql.md" target="_blank" rel="noopener">SQL / NoSQL / NewSQL deep dive ↗</a>' : ''}</details>
    <nav class="milestone-pagination" aria-label="Adjacent milestones">
      <a href="${index ? `#milestone/${milestones[index - 1].id}` : '#timeline'}"><small>← ${index ? 'PREVIOUS IDEA' : 'THE MAP'}</small><strong>${index ? milestones[index - 1].title : 'Back to the timeline'}</strong></a>
      <p>${m.next}</p>
      <a href="${index < milestones.length - 1 ? `#milestone/${milestones[index + 1].id}` : '#summary'}"><small>${index < milestones.length - 1 ? 'NEXT IDEA' : 'CONNECT THE DOTS'} →</small><strong>${index < milestones.length - 1 ? milestones[index + 1].title : 'The big picture'}</strong></a>
    </nav>
  </article>`;
  const gameRoot = main.querySelector('#game-root');
  mountGame(m.game, gameRoot);
  main.querySelector('#reset-game').onclick = () => {
    mountGame(m.game, gameRoot);
    document.querySelector('#app-status').textContent = 'Experiment reset.';
  };
}

function render() {
  const hash = location.hash.slice(1) || 'timeline';
  document.querySelector('#app-status').textContent = '';
  timeline = null;
  currentIndex = -1;
  if (hash === 'timeline') {
    view = 'timeline';
    const savedScroll = timelineState.scroll;
    timeline = mountTimeline(main, timelineState);
    main.querySelector('#timeline-viewport').scrollLeft = savedScroll;
  } else if (hash === 'summary') {
    view = 'summary';
    mountSummary(main);
  } else if (hash.startsWith('milestone/')) {
    const id = hash.slice('milestone/'.length);
    currentIndex = milestones.findIndex(m => m.id === id);
    if (currentIndex === -1) { invalidRoute(); return; }
    view = 'milestone';
    timelineState.selected = currentIndex;
    milestoneView(currentIndex);
  } else { invalidRoute(); return; }
  document.querySelectorAll('[data-nav]').forEach(link => {
    const active = link.dataset.nav === (view === 'milestone' ? 'timeline' : view);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = `${currentIndex >= 0 ? milestones[currentIndex].title : view === 'summary' ? 'The big picture' : 'A history of remembering'} — DB Time Machine`;
  window.scrollTo(0, 0);
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
document.addEventListener('fullscreenchange', () => {
  document.querySelector('#fullscreen-button').setAttribute('aria-label', document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen');
});
document.addEventListener('keydown', e => {
  if (help.open) return;
  if (e.key === 'Escape') {
    if (!document.fullscreenElement) location.hash = 'timeline';
    return;
  }
  const target = e.target;
  if (target.closest('input, select, textarea, [contenteditable="true"]')) return;
  // Interactive experiments own their keys; global shortcuts must not steal
  // arrow keys from a slider or change slides during keyboard play.
  const inExperiment = target.closest('.game-root, #engine-controls');
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
window.addEventListener('hashchange', render);
render();
