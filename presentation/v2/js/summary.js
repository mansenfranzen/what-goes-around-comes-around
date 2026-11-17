import { milestones, categories, paper } from '../content/milestones.js';
import { icon, painter } from './ui.js';

export function mountSummary(root) {
  root.innerHTML = `<section class="summary-page">
    <p class="eyebrow">THE BIG PICTURE / NOTHING REPLACED SQL. EVERYTHING CHANGED INSIDE IT.</p>
    <h1>Old ideas.<br><em>New possibilities.</em></h1>
    <p class="summary-intro">A modern database is a collaboration, not a single invention.<br>Change the engine. Keep the question.</p>
    <div class="summary-layout">
      <section class="database-machine" aria-label="Interactive database layers">
        <div class="machine-query"><span class="mini-label">YOUR QUESTION</span><code>SELECT SUM(price) FROM sales;</code></div>
        <div class="machine-layer language"><div><span class="layer-number">01</span><h2>Language</h2><p>Say what, not how.</p></div><div class="layer-links"><a href="#milestone/sql">SQL</a><a href="#milestone/graph">Graph patterns</a><a href="#milestone/mapreduce">Distributed queries</a></div></div>
        <div class="machine-layer model"><div><span class="layer-number">02</span><h2>Model</h2><p>Relations, keys & extensible types.</p></div><div class="layer-links"><a href="#milestone/relational">Tables & joins</a><a href="#milestone/documents">JSON</a><a href="#milestone/arrays">Arrays</a><a href="#milestone/vectors">Vectors</a></div></div>
        <div class="independence-line"><span>LOGICAL / PHYSICAL INDEPENDENCE</span></div>
        <div class="machine-layer primitives"><div><span class="layer-number">03</span><h2>Primitives</h2><p>Choose the engine for the job.</p></div><div id="engine-controls"></div></div>
        <div id="machine-result"></div>
      </section>
      <aside class="summary-story">${icon('database')}<h2>The trick is<br>keeping them apart.</h2><p>New layouts, indexes and hardware can evolve beneath a stable logical interface.</p><div class="summary-callout"><span>TRY IT</span><p>Switch row to column storage. Add workers. The result stays the same.</p></div><p class="simulation-note">Toy cost model: 6 rows × 5 fields, perfect parallelism. Real query costs include I/O, coordination and selectivity.</p></aside>
    </div>
    <section class="inheritance"><div><p class="eyebrow">A LITTLE OF EVERYTHING CAME ALONG</p><h2>Trace the inheritance.</h2></div><div class="inheritance-grid">${milestones.map((m, i) => `<a href="#milestone/${m.id}" class="${m.category}">${icon(m.icon)}<span><small>${String(i + 1).padStart(2, '0')} · ${categories[m.category].label}</small>${m.title}</span><span aria-hidden="true">↗</span></a>`).join('')}</div></section>
    <section class="closing-note"><span>↻</span><div><h2>A lens, not a law.</h2><p>Stonebraker & Pavlo argue that the relational model keeps absorbing good ideas. Specialist systems still have real strengths. What would count as evidence against the thesis?</p><a href="${paper}" target="_blank" rel="noopener">Read the 2024 position paper ↗</a></div><a class="primary-link" href="#timeline">Back to the beginning ↗</a></section>
  </section>`;
  let columnar = false, workers = 1;
  const controls = root.querySelector('#engine-controls');
  const paint = painter(controls);
  function render() {
    paint(`<div class="game-actions"><button data-action="row" aria-pressed="${!columnar}">Row layout</button><button data-action="column" aria-pressed="${columnar}">Column layout</button></div><label class="range-label" for="summary-workers">Compute workers <output>${workers}</output></label><input id="summary-workers" type="range" min="1" max="6" value="${workers}">`);
    const reads = columnar ? 6 : 30;
    root.querySelector('#machine-result').innerHTML = `<div class="machine-output" role="status"><div><small>VALUES READ</small><strong>${reads}</strong></div><div><small>TOY WORK / WORKER</small><strong>${(reads / workers).toFixed(1)}</strong></div><div class="stable-answer"><small>THE ANSWER, ALWAYS</small><strong>88</strong></div></div>`;
  }
  controls.onclick = e => {
    const action = e.target.closest('button')?.dataset.action;
    if (!['row', 'column'].includes(action)) return;
    columnar = action === 'column'; render();
  };
  controls.oninput = e => { if (e.target.id === 'summary-workers') { workers = Number(e.target.value); render(); } };
  render();
}
