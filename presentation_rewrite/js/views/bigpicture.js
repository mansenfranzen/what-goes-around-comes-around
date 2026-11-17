/* Big Picture view: the mascot "Rowie" is built piece by piece from all milestone symbols.
   Steps: 0 empty blueprint | 1..N one piece per milestone (timeline order) | N+1 Rowie comes alive and runs a query.
   Piece positions, roles and query stages live in content/bigpicture.js. Silhouette geometry is below. */
DB.addView('bigpicture', function () {
  var h = DB.h, S = DB.svg, BP = DB.bigpicture, ms = DB.milestones, N = ms.length;
  var timers = [], tweens = [], selected = null, lastStep = 0;

  /* ----- mascot SVG ----- */
  var svg = S('svg', { class: 'bp-svg', viewBox: '0 0 1000 1020' });
  var sil = S('g', { class: 'sil' });
  function tube(d) { return [S('path', { class: 'tube-o', d: d }), S('path', { class: 'tube-i', d: d })]; }
  [
    S('path', { class: 'sil-shape cloud', d: 'M330 1002 C280 1002 262 942 312 927 C300 882 365 860 405 886 C425 837 520 832 548 882 C590 857 665 882 655 927 C712 932 722 1002 668 1002 Z' }),
    tube('M290 440 C 215 440 168 490 150 590'), tube('M710 440 C 785 440 832 490 850 590'),
    S('line', { class: 'sil-line', x1: 500, y1: 114, x2: 500, y2: 70 }),
    S('rect', { class: 'sil-shape', x: 462, y: 322, width: 76, height: 50 }),
    S('rect', { class: 'sil-shape', x: 322, y: 114, width: 356, height: 212, rx: 56 }),
    S('rect', { class: 'sil-shape', x: 262, y: 188, width: 60, height: 90, rx: 24 }),
    S('rect', { class: 'sil-shape', x: 678, y: 188, width: 60, height: 90, rx: 24 }),
    S('path', { class: 'sil-shape torso', d: 'M286 376 V744 A214 40 0 0 0 714 744 V376 A214 40 0 0 0 286 376Z' }),
    S('ellipse', { class: 'sil-top', cx: 500, cy: 376, rx: 214, ry: 40 }),
    S('path', { class: 'sil-ring', d: 'M286 512 A214 40 0 0 0 714 512' }),
    S('path', { class: 'sil-ring', d: 'M286 636 A214 40 0 0 0 714 636' }),
    S('rect', { class: 'sil-shape', x: 336, y: 800, width: 328, height: 92, rx: 46 })
  ].forEach(function (n) { sil.append.apply(sil, [].concat(n)); });

  var halo = S('ellipse', { class: 'bp-halo', cx: 500, cy: 520, rx: 478, ry: 500 });
  var slots = S('g', { class: 'slots' }), piecesG = S('g', { class: 'pieces' }), pulse = S('circle', { class: 'bp-pulse', r: 10, cx: -50, cy: -50 });
  var pieces = {};
  ms.forEach(function (m) {
    var p = BP.pieces[m.id]; if (!p) return;
    slots.append(S('circle', { class: 'bp-slot', cx: p.x, cy: p.y, r: p.r }));
    var g = S('g', { class: 'piece cat-' + m.category, transform: 'translate(' + p.x + ' ' + p.y + ')', 'data-id': m.id },
      S('g', { class: 'pop' },
        S('circle', { class: 'ring', r: p.r }),
        S('image', { href: DB.symbolURL(m), x: -p.r * .74, y: -p.r * .74, width: p.r * 1.48, height: p.r * 1.48 })));
    g.addEventListener('click', function (e) {
      if (!document.body.classList.contains('mode-exploration')) return;
      e.stopPropagation(); select(m.id);
    });
    piecesG.append(g);
    pieces[m.id] = g;
  });
  svg.append(halo, sil, slots, piecesG, pulse);

  /* ----- side panel ----- */
  var calloutSym = h('img', { alt: '' }), calloutYear = h('span', { class: 'chip year' }), calloutCat = h('span', { class: 'chip' });
  var calloutTitle = h('h2'), calloutRole = h('p', { class: 'role' }), calloutConcept = h('span', { class: 'chip solid' });
  var callout = h('div', { class: 'bp-callout' },
    h('div', { class: 'co-sym' }, calloutSym),
    h('div', { class: 'co-text' },
      h('div', { class: 'co-chips' }, calloutYear, calloutCat),
      calloutTitle, calloutRole, h('div', { class: 'co-concept' }, calloutConcept)));

  var legend = h('div', { class: 'bp-legend' }, BP.layers.map(function (l) {
    return h('span', { class: 'lg cat-' + l.cat }, h('i'), h('b', { text: DB.CATEGORIES[l.cat].label }), ' ' + l.text);
  }));

  var dots = h('div', { class: 'bp-dots' }, ms.map(function (m) { return h('i', { class: 'cat-' + m.category, title: m.title }); }));

  /* query panel */
  var stageEls = BP.query.stages.map(function (s) {
    var m = DB.byId(s.id);
    return h('li', { class: 'qs cat-' + m.category, 'data-id': s.id }, h('img', { src: DB.symbolURL(m), alt: '' }), h('span', { text: s.label }), h('i', { class: 'tick', html: '&#10003;' }));
  });
  var resultEl = h('table', { class: 'q-result mono' }, BP.query.result.map(function (r) { return h('tr', {}, h('td', { text: r[0] }), h('td', { text: r[1] })); }));
  var replay = h('button', { class: 'g-btn alt q-replay', text: '↻ Run again', on: { click: function () { runQuery(true); } } });
  var query = h('div', { class: 'bp-query' },
    h('pre', { class: 'g-code q-sql' }, BP.query.sql.join('\n')),
    h('ol', { class: 'q-stages' }, stageEls),
    h('div', { class: 'q-end' }, resultEl, replay));
  var closing = h('div', { class: 'bp-closing' }, BP.closing.map(function (c) { return h('p', { class: 'cat-' + c.cat }, h('i'), c.text); }));

  var side = h('aside', { class: 'bp-side' }, legend, callout, query, closing, dots);
  var el = h('div', { class: 'view-bigpicture grid-bg' }, h('div', { class: 'bp-mascot' }, svg), side);

  /* ----- behaviour ----- */
  function select(id) {
    var m = DB.byId(id), p = BP.pieces[id];
    selected = id;
    callout.className = 'bp-callout cat-' + m.category;
    calloutSym.src = DB.symbolURL(m);
    calloutYear.textContent = m.year; calloutCat.textContent = DB.CATEGORIES[m.category].label;
    calloutTitle.textContent = m.title; calloutRole.textContent = p.role; calloutConcept.textContent = m.concept;
    DB.$$('.piece', svg).forEach(function (g) { g.classList.toggle('sel', g.dataset.id === id); });
  }

  function clearTimers() { timers.forEach(clearTimeout); timers = []; tweens.forEach(function (t) { t.cancel(); }); tweens = []; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function stageEl(id) { return stageEls.filter(function (e) { return e.dataset.id === id; })[0]; }

  function movePulse(from, to, ms) {
    var a = BP.pieces[from], b = BP.pieces[to];
    tweens.push(DB.tween({ from: [a.x, a.y], to: [b.x, b.y], ms: ms, onUpdate: function (v) { pulse.setAttribute('cx', v[0]); pulse.setAttribute('cy', v[1]); } }));
  }

  function resetQuery() {
    DB.$$('.piece', svg).forEach(function (g) { g.classList.remove('hot'); });
    stageEls.forEach(function (e) { e.classList.remove('hot', 'done'); });
    query.classList.remove('finished'); closing.classList.remove('on');
    pulse.classList.remove('on');
  }
  function showFinished() {
    stageEls.forEach(function (e) { e.classList.remove('hot'); e.classList.add('done'); });
    DB.$$('.piece', svg).forEach(function (g) { g.classList.remove('hot'); });
    pulse.classList.remove('on');
    query.classList.add('finished'); closing.classList.add('on');
  }
  function runQuery(animate) {
    clearTimers(); resetQuery();
    if (!animate) return showFinished();
    var st = BP.query.stages, STEP = 620, prev = null;
    pulse.classList.add('on');
    st.forEach(function (s, i) {
      later(function () {
        if (prev) { pieces[prev.id].classList.remove('hot'); stageEl(prev.id).classList.replace('hot', 'done'); movePulse(prev.id, s.id, 360); }
        else { pulse.setAttribute('cx', BP.pieces[s.id].x); pulse.setAttribute('cy', BP.pieces[s.id].y); }
        pieces[s.id].classList.add('hot'); stageEl(s.id).classList.add('hot');
        prev = s;
      }, i * STEP);
    });
    later(showFinished, st.length * STEP + 300);
  }

  return {
    el: el,
    setStep: function (step, opts) {
      opts = opts || {};
      var presenting = !opts.explore, alive = step > N, shown = Math.min(step, N);
      ms.forEach(function (m, i) { if (pieces[m.id]) pieces[m.id].classList.toggle('on', i < shown); });
      dots.childNodes.forEach(function (d, i) { d.classList.toggle('on', i < shown); });
      halo.classList.toggle('on', shown >= N);
      svg.classList.toggle('alive', alive);
      el.classList.toggle('stage-query', alive && presenting);
      el.classList.toggle('stage-explore', !presenting);
      if (shown >= 1 && presenting && !alive) select(ms[shown - 1].id);
      else if (!presenting && !selected) select('10');
      if (shown >= 1 && presenting && !alive) {
        DB.$$('.piece', svg).forEach(function (g) { g.classList.remove('fresh'); });
        pieces[ms[shown - 1].id].classList.add('fresh');
      }
      if (alive && lastStep <= N) runQuery(presenting && !opts.instant);
      if (!alive) { clearTimers(); resetQuery(); }
      lastStep = step;
    },
    destroy: clearTimers
  };
});
