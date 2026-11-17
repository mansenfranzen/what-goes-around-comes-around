/* Timeline view: two blendable scales (linear = real distances, logical = equal spacing), zoom, pan, jump to start/end,
   vertical markers, step-by-step reveal (presentation) or everything at once (exploration).
   Milestone data: DB.milestones, markers: DB.markers (content/markers.js).
   Positions: x = lerp(linearX, logicalX, t). Each scale keeps its own view {c: center, k: px per year | px per milestone}. */
DB.addView('timeline', function (slide, director) {
  var h = DB.h, S = DB.svg, ms = DB.milestones, N = ms.length;
  var markers = (DB.markers || []).slice();
  var pos = ms.map(function (m) { return m.pos; });
  var W = 1920, H = 1080, R = 18;
  var st = { t: 1, target: 1, lin: null, log: null, touched: false, step: 0 };
  var anim = null, tScaleTween = null, unreveal = null;

  /* ----- DOM ----- */
  var svg = S('svg', { class: 'tl-svg' });
  var gMarks = S('g'), gTicks = S('g'), gPills = S('g');
  var axis = S('line', { class: 'tl-axis' }), arrow = S('path', { class: 'tl-arrow' });
  svg.append(gMarks, gTicks, axis, arrow, gPills);
  var nodesEl = h('div', { class: 'tl-nodes' });

  var nodes = ms.map(function (m, i) {
    var plus = h('span', { class: 'plus', title: 'Zoom in', on: { click: function (e) { e.stopPropagation(); zoomCluster(nd); } } });
    var btn = h('button', {
      class: 'tl-node off cat-' + m.category, 'data-id': m.id, title: m.title,
      on: { click: function () { if (performance.now() < (DB.suppressClick || 0)) return; director.goTo('m' + m.id); } }
    },
      h('i', { class: 'stem' }),
      h('span', { class: 'badge' }, h('img', { src: DB.symbolURL(m), alt: '', draggable: false })),
      h('span', { class: 'txt' }, h('b', { class: 'yr', text: m.year }), h('small', { class: 'nm', text: m.short || m.title })),
      plus);
    var nd = { m: m, i: i, el: btn, plus: plus, x: 0, cluster: [] };
    nodesEl.append(btn);
    return nd;
  });

  /* dock (bottom menu) */
  function dockBtn(label, title, fn, cls) { return h('button', { class: 'dock-btn ' + (cls || ''), title: title, on: { click: fn } }, label); }
  var segBtns = [
    h('button', { class: 'seg-btn', 'data-s': 1, text: 'Logical', title: 'Equal spacing (S)', on: { click: function () { setScale(1); } } }),
    h('button', { class: 'seg-btn', 'data-s': 0, text: 'Linear', title: 'True distances (S)', on: { click: function () { setScale(0); } } })
  ];
  var legend = ['primitives', 'language', 'model'].map(function (c) {
    return h('span', { class: 'lg cat-' + c }, h('i'), DB.CATEGORIES[c].label);
  });
  var dock = h('div', { class: 'tl-dock menu' },
    h('div', { class: 'tl-seg' }, segBtns),
    h('span', { class: 'sep' }),
    dockBtn('−', 'Zoom out (-)', function () { zoomAt(W / 2, 1 / 1.7, true); }),
    dockBtn('+', 'Zoom in (+)', function () { zoomAt(W / 2, 1.7, true); }),
    dockBtn('Fit', 'Show everything (0)', function () { fit(true); }),
    h('span', { class: 'sep' }),
    dockBtn('⏮ Start', 'Jump to the start (Home)', function () { jump('start'); }),
    dockBtn('End ⏭', 'Jump to the end (End)', function () { jump('end'); }),
    h('span', { class: 'sep' }),
    h('div', { class: 'legend' }, legend));
  unreveal = DB.menus.edgeReveal(dock, function (x, y, w, hh) { return y > hh - 84; });

  var el = h('div', { class: 'view-timeline grid-bg' }, svg, nodesEl, dock);

  /* ----- geometry ----- */
  function measure() {
    W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight;
    R = parseFloat(getComputedStyle(document.documentElement).fontSize) || 18;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  }
  function pad() { return 6 * R; }
  function fitLin() { return { c: (pos[0] + pos[N - 1]) / 2, k: (W - 2 * pad()) / (pos[N - 1] - pos[0]) }; }
  function fitLog() { return { c: (N - 1) / 2, k: (W - 2 * pad()) / (N - 1) }; }
  var MAXK = { lin: 600, log: 700 };

  function xLin(year) { return W / 2 + (year - st.lin.c) * st.lin.k; }
  function xLog(u) { return W / 2 + (u - st.log.c) * st.log.k; }
  function uOfYear(y) { // year -> logical unit by piecewise-linear interpolation between milestones
    var i = 0;
    while (i < N - 2 && y > pos[i + 1]) i++;
    return i + (y - pos[i]) / (pos[i + 1] - pos[i]);
  }
  function xOf(i) { return DB.lerp(xLin(pos[i]), xLog(i), st.t); }
  function xOfYear(y) { return DB.lerp(xLin(y), xLog(uOfYear(y)), st.t); }
  function activeKey() { return st.target >= 0.5 ? 'log' : 'lin'; }

  /* ----- rendering ----- */
  var NODE_W = 6.8, TXT_H = 2.5, BADGE = 4.7, STEM0 = 1.5;
  var MAXS = 1.55;
  // Grow the nodes until every third neighbour would touch, so the timeline fills the screen.
  function nodeScale() {
    var xs = [];
    nodes.forEach(function (nd) { var x = xOf(nd.i); if (x > -NODE_W * R && x < W + NODE_W * R) xs.push(x); });
    var m3 = Infinity;
    for (var i = 0; i + 3 < xs.length; i++) m3 = Math.min(m3, xs[i + 3] - xs[i]);
    return DB.clamp(m3 / (NODE_W * R * 1.08), 1, MAXS);
  }
  function render() {
    var axisY = H * 0.545, S = nodeScale(), w = NODE_W * R * S;
    nodesEl.style.setProperty('--s', S.toFixed(3));
    layoutNodes(axisY, w, S);
    drawAxis(axisY);
    drawMarkers();
    drawPills(axisY);
    segBtns.forEach(function (b) { b.classList.toggle('on', Number(b.dataset.s) === st.target); });
  }

  function layoutNodes(axisY, w, S) {
    var hn = (BADGE + TXT_H) * R * S, gap = .35 * R, s0 = STEM0 * R * S;
    var lanes = [
      { above: true, stem: s0, right: -1e9 }, { above: false, stem: s0, right: -1e9 },
      { above: true, stem: s0 + hn + .45 * R, right: -1e9 }, { above: false, stem: s0 + hn + .45 * R, right: -1e9 }
    ];
    var last = null;
    nodes.forEach(function (nd) {
      nd.cluster = []; nd.x = xOf(nd.i);
      nd.shown = nd.i < st.step && nd.x > -w && nd.x < W + w;
    });
    nodes.forEach(function (nd) {
      var el = nd.el;
      if (!nd.shown) { el.classList.add('off'); el.classList.remove('hid'); return; }
      el.classList.remove('off');
      var lane = null, li = -1;
      for (var j = 0; j < lanes.length; j++) {
        if (nd.x - w / 2 < lanes[j].right + gap) continue;
        // near lanes first; within a tier take the least recently used lane so nodes alternate
        var better = li < 0 || ((j < 2) !== (li < 2) ? j < 2 : lanes[j].right < lanes[li].right);
        if (better) { lane = lanes[j]; li = j; }
      }
      if (!lane) { // no room: fold into the previous visible node as "+N"
        el.classList.add('hid');
        if (last) last.cluster.push(nd);
        return;
      }
      el.classList.remove('hid');
      lane.right = nd.x + w / 2;
      last = nd;
      el.classList.toggle('above', lane.above);
      el.classList.toggle('below', !lane.above);
      el.style.setProperty('--stem', lane.stem + 'px');
      el.style.transform = 'translate(' + (nd.x - w / 2) + 'px,' + (lane.above ? axisY - lane.stem - hn : axisY) + 'px)';
    });
    nodes.forEach(function (nd) {
      var n = nd.cluster.length;
      nd.plus.textContent = n ? '+' + n : '';
      nd.plus.classList.toggle('on', n > 0);
    });
  }

  function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
  function fmtYear(y) { return y < 0 ? Math.abs(y).toLocaleString('en') + ' BCE' : y === 0 ? '0' : String(y); }

  function drawAxis(axisY) {
    axis.setAttribute('x1', 0); axis.setAttribute('x2', W - 1.2 * R); axis.setAttribute('y1', axisY); axis.setAttribute('y2', axisY);
    arrow.setAttribute('d', 'M' + (W - 1.8 * R) + ' ' + (axisY - .7 * R) + 'L' + (W - .5 * R) + ' ' + axisY + 'L' + (W - 1.8 * R) + ' ' + (axisY + .7 * R) + 'Z');
    clear(gTicks);
    var o = 1 - DB.clamp(st.t * 1.8, 0, 1);
    if (o <= 0.02) return;
    gTicks.setAttribute('opacity', o);
    var k = st.lin.k, raw = 130 / k, p = Math.pow(10, Math.floor(Math.log10(raw))), step = p;
    [1, 2, 5, 10].some(function (m) { step = m * p; return step >= raw; });
    var y0 = st.lin.c - W / 2 / k, y1 = st.lin.c + W / 2 / k;
    for (var y = Math.ceil(y0 / step) * step; y <= y1; y += step) {
      var x = xLin(y);
      gTicks.append(S('line', { class: 'tl-tick', x1: x, x2: x, y1: axisY - .45 * R, y2: axisY + .45 * R }),
        S('text', { class: 'tl-tick-label', x: x, y: axisY + 1.5 * R, 'text-anchor': 'middle' }, fmtYear(Math.round(y))));
    }
  }

  function drawMarkers() {
    clear(gMarks);
    var rows = [[], []], fs = .95 * R, ys = [2.9 * R, 5.2 * R];
    markers.slice().sort(function (a, b) { return b.prio - a.prio; }).forEach(function (mk) {
      var x = xOfYear(mk.year);
      if (x < -20 || x > W + 20) return;
      var tw = mk.label.length * fs * .56 + 1.6 * R, row = -1;
      for (var r = 0; r < 2 && row < 0; r++) {
        if (rows[r].every(function (b) { return x + tw / 2 + .4 * R < b[0] || x - tw / 2 - .4 * R > b[1]; })) row = r;
      }
      var top = row >= 0 ? ys[row] + 1.1 * R : 2 * R;
      gMarks.append(S('line', { class: 'mk-line' + (mk.strong ? ' strong' : ''), x1: x, x2: x, y1: top, y2: H }));
      if (row < 0) return;
      rows[row].push([x - tw / 2, x + tw / 2]);
      var g = S('g', { class: 'mk-label' + (mk.strong ? ' strong' : '') },
        S('rect', { x: x - tw / 2, y: ys[row] - 1.05 * R, width: tw, height: 2.1 * R, rx: 1.05 * R }),
        S('text', { x: x, y: ys[row] + .34 * R, 'text-anchor': 'middle' }, mk.label));
      gMarks.append(g);
    });
  }

  function gapText(a, b) {
    var d = Math.round(pos[b] - pos[a]);
    return d >= 2000 ? Math.round(d / 1000) + 'k yrs' : d >= 1000 ? (d / 1000).toFixed(1) + 'k yrs' : d + ' yrs';
  }
  function drawPills(axisY) {
    clear(gPills);
    if (st.t < 0.25) return;
    gPills.setAttribute('opacity', DB.clamp((st.t - .25) / .5, 0, 1));
    for (var i = 0; i < N - 1; i++) {
      var a = nodes[i], b = nodes[i + 1];
      if (!a.shown || !b.shown || b.x - a.x < 5.6 * R) continue;
      var txt = gapText(i, i + 1), x = (a.x + b.x) / 2, tw = txt.length * .72 * R * .6 + 1.2 * R;
      gPills.append(S('g', { class: 'gap-pill' },
        S('rect', { x: x - tw / 2, y: axisY - .85 * R, width: tw, height: 1.7 * R, rx: .85 * R }),
        S('text', { x: x, y: axisY + .27 * R, 'text-anchor': 'middle' }, txt)));
    }
  }

  /* ----- view control ----- */
  function clampView(key) {
    var v = st[key];
    v.k = DB.clamp(v.k, (key === 'lin' ? fitLin() : fitLog()).k * .6, MAXK[key]);
    v.c = key === 'lin' ? DB.clamp(v.c, pos[0], pos[N - 1]) : DB.clamp(v.c, 0, N - 1);
  }
  function animateTo(key, target, ms) {
    if (anim) anim.cancel();
    var v = st[key], c0 = v.c, k0 = v.k;
    anim = DB.tween({
      from: 0, to: 1, ms: ms || 650,
      onUpdate: function (e) { v.c = DB.lerp(c0, target.c, e); v.k = k0 * Math.pow(target.k / k0, e); render(); },
      onDone: function () { anim = null; }
    });
  }
  function zoomAt(px, f, animate) {
    var key = activeKey(), v = st[key], lim = (key === 'lin' ? fitLin() : fitLog()).k * .6;
    var val = v.c + (px - W / 2) / v.k, nk = DB.clamp(v.k * f, lim, MAXK[key]);
    var target = { c: val - (px - W / 2) / nk, k: nk };
    st.touched = true;
    if (animate) animateTo(key, { c: DB.clamp(target.c, key === 'lin' ? pos[0] : 0, key === 'lin' ? pos[N - 1] : N - 1), k: nk }, 350);
    else { if (anim) anim.cancel(); v.c = target.c; v.k = nk; clampView(key); render(); }
  }
  function fit(animate) {
    var key = activeKey(), t = key === 'lin' ? fitLin() : fitLog();
    st.touched = false;
    if (animate) animateTo(key, t, 600); else { st[key].c = t.c; st[key].k = t.k; render(); }
  }
  function jump(where) {
    var key = activeKey(), span = W - 2 * pad(), t;
    st.touched = true;
    if (key === 'lin') t = where === 'start' ? { c: -10100, k: span / 21000 } : { c: 1995, k: span / 70 };
    else t = where === 'start' ? { c: 3, k: span / 6 } : { c: N - 4, k: span / 6 };
    animateTo(key, t, 900);
  }
  function zoomCluster(nd) {
    var key = activeKey(), group = [nd].concat(nd.cluster);
    var vals = group.map(function (g) { return key === 'lin' ? pos[g.i] : g.i; });
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), range = Math.max(hi - lo, key === 'lin' ? .5 : .5);
    var k = DB.clamp((W - 2 * pad()) * .7 / range, st[key].k * 1.8, MAXK[key]);
    st.touched = true;
    animateTo(key, { c: (lo + hi) / 2, k: k }, 700);
  }
  function setScale(target) {
    if (st.target === target) return;
    st.target = target;
    if (tScaleTween) tScaleTween.cancel();
    var from = st.t;
    tScaleTween = DB.tween({ from: from, to: target, ms: 800, onUpdate: function (v) { st.t = v; render(); } });
    render();
  }

  /* ----- pointer: wheel zoom + drag pan ----- */
  el.addEventListener('wheel', function (e) {
    if (e.target.closest('.tl-dock')) return;
    e.preventDefault();
    zoomAt(e.clientX, Math.exp(-e.deltaY * (e.ctrlKey ? .01 : .0016)));
  }, { passive: false });

  var drag = null;
  el.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || e.target.closest('.tl-dock')) return;
    drag = { x: e.clientX, moved: false, id: e.pointerId };
  });
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  function onMove(e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) < 5) return;
    if (!drag.moved) { drag.moved = true; if (anim) anim.cancel(); el.classList.add('panning'); }
    var key = activeKey(), v = st[key];
    v.c -= dx / v.k; drag.x = e.clientX; st.touched = true;
    clampView(key); render();
  }
  function onUp() {
    if (drag && drag.moved) DB.suppressClick = performance.now() + 250;
    drag = null; el.classList.remove('panning');
  }
  function onResize() { measure(); if (!st.touched) { st.lin = fitLin(); st.log = fitLog(); } render(); }
  window.addEventListener('resize', onResize);

  /* ----- keys (called by the director before its own handling) ----- */
  function onKey(e) {
    var k = e.key;
    if (k === '+' || k === '=') zoomAt(W / 2, 1.7, true);
    else if (k === '-' || k === '_') zoomAt(W / 2, 1 / 1.7, true);
    else if (k === '0') fit(true);
    else if (k === 'Home') jump('start');
    else if (k === 'End') jump('end');
    else if (k === 's' || k === 'S') setScale(st.target ? 0 : 1);
    else return false;
    return true;
  }

  /* ----- director hook ----- */
  var inited = false;
  return {
    el: el, onKey: onKey,
    setStep: function (step, opts) {
      if (!inited) { measure(); st.lin = fitLin(); st.log = fitLog(); inited = true; }
      var prev = st.step;
      st.step = step;
      render();
      if (opts && !opts.instant && step > prev) {
        var nd = nodes[step - 1];
        nd.el.classList.remove('pulse'); void nd.el.offsetWidth; nd.el.classList.add('pulse');
      }
    },
    destroy: function () {
      if (anim) anim.cancel(); if (tScaleTween) tScaleTween.cancel();
      window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('resize', onResize);
      if (unreveal) unreveal();
    }
  };
});
