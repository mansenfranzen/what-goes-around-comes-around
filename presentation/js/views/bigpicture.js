/* Big Picture view: the mascot "Rowie" is built from selected milestone symbols.
   Steps: 0 empty blueprint | 1..N one piece per step (assembly order) | N+1 Rowie comes alive and runs a query.
   Piece positions, roles and query stages live in content/bigpicture.js. Silhouette geometry is below. */
DB.addView('bigpicture', function () {
  var h = DB.h, S = DB.svg, BP = DB.bigpicture, build = BP.pieces, N = build.length;
  var timers = [], tweens = [], selected = null, lastStep = 0;

  /* ----- mascot SVG ----- */
  var svg = S('svg', { class: 'bp-svg', viewBox: '0 0 1000 1020' });
  var sil = S('g', { class: 'sil' });
  function tube(d) { return [S('path', { class: 'tube-o', d: d }), S('path', { class: 'tube-i', d: d })]; }
  [
    tube('M412 746 L360 938'), tube('M588 746 L640 938'),
    S('rect', { class: 'sil-shape', x: 280, y: 927, width: 130, height: 62, rx: 29 }),
    S('rect', { class: 'sil-shape', x: 590, y: 927, width: 130, height: 62, rx: 29 }),
    tube('M290 424 Q186 420 144 625'), tube('M710 424 Q814 420 856 625'),
    S('line', { class: 'sil-line', x1: 500, y1: 114, x2: 500, y2: 70 }),
    S('rect', { class: 'sil-shape', x: 462, y: 322, width: 76, height: 50 }),
    S('rect', { class: 'sil-shape', x: 322, y: 114, width: 356, height: 212, rx: 56 }),
    S('path', { class: 'sil-line bp-eyes', d: 'M430 169 v16 M570 169 v16' }),
    S('rect', { class: 'sil-shape', x: 262, y: 188, width: 60, height: 90, rx: 24 }),
    S('rect', { class: 'sil-shape', x: 678, y: 188, width: 60, height: 90, rx: 24 }),
    S('path', { class: 'sil-shape torso', d: 'M286 376 V744 A214 40 0 0 0 714 744 V376 A214 40 0 0 0 286 376Z' }),
    S('ellipse', { class: 'sil-top', cx: 500, cy: 376, rx: 214, ry: 40 }),
    S('path', { class: 'sil-ring', d: 'M286 512 A214 40 0 0 0 714 512' }),
    S('path', { class: 'sil-ring', d: 'M286 636 A214 40 0 0 0 714 636' })
  ].forEach(function (n) { sil.append.apply(sil, [].concat(n)); });

  var halo = S('ellipse', { class: 'bp-halo', cx: 500, cy: 520, rx: 478, ry: 500 });
  var slots = S('g', { class: 'slots' }), piecesG = S('g', { class: 'pieces' }), pulse = S('circle', { class: 'bp-pulse', r: 10, cx: -50, cy: -50 });
  var pieces = {}, positions = {};
  build.forEach(function (p) {
    var m = DB.byId(p.id), pos = 'translate(' + p.x + ' ' + p.y + ')';
    function badge(cls) {
      return p.id === '10'
        ? S('path', { class: cls, d: 'M0 -44 C-42 -86 -98 -42 -66 10 Q-46 42 0 73 Q46 42 66 10 C98 -42 42 -86 0 -44Z' })
        : S('circle', { class: cls, r: p.r });
    }
    slots.append(S('g', { transform: pos }, badge('bp-slot')));
    var g = S('g', { class: 'piece cat-' + m.category, transform: pos, 'data-id': m.id },
      S('g', { class: 'pop' },
        badge('ring'),
        S('image', { href: DB.symbolURL(m), x: -p.r * .74, y: -p.r * .74, width: p.r * 1.48, height: p.r * 1.48 })));
    g.addEventListener('click', function (e) {
      if (!document.body.classList.contains('mode-exploration')) return;
      e.stopPropagation(); select(m.id);
    });
    piecesG.append(g);
    pieces[m.id] = g;
    positions[m.id] = p;
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

  var dots = h('div', { class: 'bp-dots' }, build.map(function (p) {
    var m = DB.byId(p.id);
    return h('i', { class: 'cat-' + m.category, title: m.title });
  }));

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
    var m = DB.byId(id), p = positions[id];
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
    var a = positions[from], b = positions[to];
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
        else { pulse.setAttribute('cx', positions[s.id].x); pulse.setAttribute('cy', positions[s.id].y); }
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
      build.forEach(function (p, i) {
        pieces[p.id].classList.toggle('on', i < shown);
        pieces[p.id].classList.toggle('fresh', presenting && !alive && i === shown - 1);
      });
      dots.childNodes.forEach(function (d, i) { d.classList.toggle('on', i < shown); });
      halo.classList.toggle('on', shown >= N);
      svg.classList.toggle('alive', alive);
      el.classList.toggle('stage-query', alive && presenting);
      el.classList.toggle('stage-explore', !presenting);
      callout.hidden = !shown;
      if (shown >= 1 && presenting && !alive) select(build[shown - 1].id);
      else if (!presenting && !selected) select('10');
      if (alive && lastStep <= N) runQuery(presenting && !opts.instant);
      if (!alive) { clearTimers(); resetQuery(); }
      lastStep = step;
    },
    destroy: clearTimers
  };
});
