import { milestones, categories } from '../content/milestones.js';
import { icon } from './ui.js';

export function mountTimeline(root, state) {
  root.innerHTML = `
    <section class="timeline-intro">
      <div><p class="eyebrow"><span class="live-dot"></span> 23 INVENTIONS. ONE VERY HUMAN PROBLEM.</p>
        <h1>How do we <em>remember</em><br>more than we can hold?</h1>
        <p class="intro-copy">A journey through the ideas that became the database.<br>Follow the problems. Play with the breakthroughs.</p>
      </div>
      <div class="intro-aside"><span class="orbit-text">STORE → ASK → SHAPE →</span>${icon('database')}<p>New problems.<br>Familiar ideas.</p></div>
    </section>
    <section class="timeline-section" aria-label="Interactive database history">
      <div class="timeline-toolbar">
        <div class="segmented" aria-label="Timeline scale">
          <button data-scale="logical" aria-pressed="${state.scale === 'logical'}">Story spacing</button>
          <button data-scale="metric" aria-pressed="${state.scale === 'metric'}">True time</button>
        </div>
        <p id="scale-caption"></p>
        <button id="all-stops" class="text-button">All 23 stops ↗</button>
        <div class="zoom-controls"><button id="zoom-out" aria-label="Zoom out">−</button><output id="zoom-level"></output><button id="zoom-in" aria-label="Zoom in">+</button></div>
      </div>
      <div class="timeline-viewport" id="timeline-viewport" tabindex="0" aria-label="Scrollable timeline. Arrow keys focus milestones; plus and minus zoom.">
        <div class="timeline-track" id="timeline-track"></div>
      </div>
      <div class="timeline-bottom">
        <button id="go-start" class="text-button">← The beginning</button>
        <div class="legend">${Object.entries(categories).filter(([key]) => key !== 'all').map(([key, c]) => `<span><i class="dot ${key}"></i>${c.label}<small>${c.verb}</small></span>`).join('')}</div>
        <button id="go-end" class="text-button">The present →</button>
      </div>
    </section>
    <section class="chapter-nav" aria-label="Story chapters">
      <button data-jump="0"><span>01 — 07</span><strong>Before the machine</strong><small>A count becomes a record <span>↗</span></small></button>
      <button data-jump="7"><span>08 — 13</span><strong>The model wars</strong><small>Paths, tables & independence <span>↗</span></small></button>
      <button data-jump="13"><span>14 — 23</span><strong>Scale & convergence</strong><small>New engines. Familiar questions. <span>↗</span></small></button>
    </section>
    <p class="timeline-footnote">Story spacing follows the speaker’s narrative; eras overlap. True time uses approximate start-year anchors.<br>Inspired by Stonebraker & Pavlo’s 2024 position paper. A lens on history, not its only reading.</p>`;
  const viewport = root.querySelector('#timeline-viewport');
  const track = root.querySelector('#timeline-track');
  let positions = [];
  function draw(anchorIndex = null) {
    const previousWidth = Number(track.dataset.width) || 1;
    const centerFraction = (viewport.scrollLeft + viewport.clientWidth / 2 - 100) / previousWidth;
    const metric = state.scale === 'metric';
    const width = metric ? Math.max(viewport.clientWidth - 200, 900) * state.metricZoom : 220 * (milestones.length - 1) * state.logicalZoom;
    positions = milestones.map((m, i) => 110 + (metric ? (m.year + 20000) / 22023 : i / (milestones.length - 1)) * width);
    track.style.width = `${width + 220}px`;
    track.dataset.width = width;
    track.innerHTML = `<div class="time-axis"></div>${metric ? Array.from({ length: 6 }, (_, i) => {
      const year = -20000 + i * 4400;
      return `<div class="axis-tick" style="left:${110 + (year + 20000) / 22023 * width}px"><span>${year < 0 ? `${Math.abs(year).toLocaleString('en')} BCE` : year}</span></div>`;
    }).join('') : ''}
      ${milestones.map((m, i) => `<a href="#milestone/${m.id}" class="timeline-node ${i % 2 ? 'below' : 'above'} ${m.category}" style="left:${positions[i]}px;z-index:${i + 1}" data-index="${i}" aria-label="${m.date}: ${m.title}">
        <span class="node-connector"></span><span class="node-dot"></span>
        <span class="node-body"><span class="node-art">${icon(m.icon)}</span><span class="node-date">${m.date}</span><strong>${m.title}</strong><small>${String(i + 1).padStart(2, '0')} / ${categories[m.category].label}</small></span>
      </a>`).join('')}`;
    // At geological scale, keep colliding modern markers as an explicit cluster,
    // rather than suggesting false equal spacing. Individual stops remain accessible.
    const hidden = new Set();
    if (metric) {
      let group = [];
      function cluster() {
        if (group.length > 1) {
          const first = group[0], last = group.at(-1);
          group.forEach(i => hidden.add(i));
          const el = document.createElement('button');
          el.className = 'time-cluster';
          el.style.left = `${positions[first]}px`;
          const years = [...new Set(group.map(i => milestones[i].year))].sort((a, b) => a - b);
          el.innerHTML = `<span>+${group.length} ideas</span><strong>${milestones[first].date} – ${milestones[last].date}</strong><small>${years.length === 1 ? 'Shared year · choose an idea' : 'Zoom into this era'} ↗</small>`;
          el.onclick = () => {
            if (years.length === 1) { showEra(first); return; }
            const smallestGap = years.length > 1 ? Math.min(...years.slice(1).map((year, i) => year - years[i])) : 1;
            const baseWidth = Math.max(viewport.clientWidth - 200, 900);
            state.metricZoom = Math.min(16384, Math.max(state.metricZoom * 4, 220 * 22023 / (baseWidth * smallestGap)));
            draw(last);
          };
          track.append(el);
        }
      }
      [...milestones.keys()].sort((a, b) => positions[a] - positions[b]).forEach(i => {
        if (group.length && positions[i] - positions[group.at(-1)] > 175) { cluster(); group = []; }
        group.push(i);
      });
      cluster();
    }
    track.querySelectorAll('.timeline-node').forEach(el => { el.hidden = hidden.has(Number(el.dataset.index)); });
    root.querySelector('#scale-caption').textContent = metric ? 'Distance = elapsed years · clustered stops zoom apart' : 'Equal steps · follow the narrative, not elapsed time';
    root.querySelector('#zoom-level').textContent = `${(metric ? state.metricZoom : state.logicalZoom).toLocaleString('en', { maximumFractionDigits: 1 })}×`;
    root.querySelector('#zoom-out').disabled = metric ? state.metricZoom <= 1 : state.logicalZoom <= 0.6;
    root.querySelector('#zoom-in').disabled = metric ? state.metricZoom >= 16384 : state.logicalZoom >= 3;
    if (anchorIndex !== null) viewport.scrollLeft = positions[anchorIndex] - viewport.clientWidth / 2;
    else viewport.scrollLeft = centerFraction * width + 110 - viewport.clientWidth / 2;
    state.scroll = viewport.scrollLeft;
  }
  function zoom(factor) {
    const key = state.scale === 'metric' ? 'metricZoom' : 'logicalZoom';
    state[key] = Math.max(key === 'metricZoom' ? 1 : 0.6, Math.min(key === 'metricZoom' ? 16384 : 3, state[key] * factor));
    draw();
  }
  function jump(index, focus = false) {
    state.selected = index;
    if (state.scale === 'metric' && track.querySelector(`[data-index="${index}"]`).hidden) {
      // True-year anchors can coincide, so expose the complete era in a
      // separate list without inventing metric distance between tied dates.
      showEra(index);
      return;
    }
    viewport.scrollLeft = positions[index] - viewport.clientWidth / 2;
    if (focus) track.querySelector(`[data-index="${index}"]`).focus({ preventScroll: true });
  }
  function showEra(index) {
    let picker = root.querySelector('.era-picker');
    if (!picker) {
      picker = document.createElement('div');
      picker.className = 'era-picker';
      picker.setAttribute('aria-label', 'All milestones, including overlapping dates');
      picker.innerHTML = `<div><strong>Every idea, including overlapping dates</strong><button class="text-button" data-close-picker>Close ×</button></div>${milestones.map((m, i) => `<a href="#milestone/${m.id}" data-picker-index="${i}"><span>${m.date}</span>${m.title}</a>`).join('')}`;
      root.querySelector('.timeline-section').append(picker);
      picker.querySelector('[data-close-picker]').onclick = () => { picker.remove(); viewport.focus(); };
    }
    picker.querySelector(`[data-picker-index="${index}"]`).focus();
    picker.scrollIntoView({ block: 'nearest' });
  }
  root.querySelectorAll('[data-scale]').forEach(button => {
    button.onclick = () => {
      state.scale = button.dataset.scale;
      root.querySelectorAll('[data-scale]').forEach(b => b.setAttribute('aria-pressed', b === button));
      draw(0);
    };
  });
  root.querySelector('#zoom-in').onclick = () => zoom(1.5);
  root.querySelector('#zoom-out').onclick = () => zoom(1 / 1.5);
  root.querySelector('#all-stops').onclick = () => showEra(state.selected);
  root.querySelector('#go-start').onclick = () => { viewport.scrollLeft = 0; state.selected = 0; };
  root.querySelector('#go-end').onclick = () => { viewport.scrollLeft = track.scrollWidth; state.selected = milestones.length - 1; };
  root.querySelectorAll('[data-jump]').forEach(el => { el.onclick = () => jump(Number(el.dataset.jump), true); });
  track.addEventListener('focusin', e => {
    const node = e.target.closest('[data-index]');
    if (node) state.selected = Number(node.dataset.index);
  });
  viewport.addEventListener('scroll', () => { state.scroll = viewport.scrollLeft; }, { passive: true });
  draw();
  viewport.scrollLeft = state.scroll;
  return { zoom, jump, showEra };
}
