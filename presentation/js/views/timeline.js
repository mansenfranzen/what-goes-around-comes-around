/* Timeline view: two blendable scales (linear = real distances, logical = equal spacing), zoom, pan, jump to start/end,
   vertical markers, step-by-step reveal (presentation) or everything at once (exploration).
   Presentation starts linear and moves/zooms the camera to each newly revealed milestone (presentFrame); its last step switches
   to logical. Exploration starts logical. Years are labelled on the axis only (linear: regular ticks, logical: milestone years).
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
  var svg = S('svg', { class: 'tl-svg' }), svgTop = S('svg', { class: 'tl-svg' }); // svgTop: year labels drawn over the stems
  var gMarks = S('g'), gTicks = S('g'), gPills = S('g');
  var axis = S('line', { class: 'tl-axis' }), arrow = S('path', { class: 'tl-arrow' });
  svg.append(gMarks, axis, arrow, gPills);
  svgTop.append(gTicks);
  var nodesEl = h('div', { class: 'tl-nodes' });

  var nodes = ms.map(function (m, i) {
    var plus = h('span', { class: 'plus', title: 'Zoom in', on: { click: function (e) { e.stopPropagation(); zoomCluster(nd); } } });
    var btn = h('button', {
      class: 'tl-node off cat-' + m.category + (i % 2 ? ' below' : ' above'), 'data-id': m.id, title: m.title + ' (' + m.year + ')',
      on: { click: function () { if (performance.now() < (DB.suppressClick || 0)) return; director.goTo('m' + m.id); } }
    },
      h('i', { class: 'stem' }),
      h('span', { class: 'badge' }, h('img', { src: DB.symbolURL(m), alt: '', draggable: false })),
      h('span', { class: 'txt' }, h('small', { class: 'nm', text: m.short || m.title })),
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

  var el = h('div', { class: 'view-timeline grid-bg' }, svg, nodesEl, svgTop, dock);

  /* ----- geometry ----- */
  function measure() {
    W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight;
    R = parseFloat(getComputedStyle(document.documentElement).fontSize) || 18;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svgTop.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    assignYearRows();
  }
  function pad() { return 6 * R; }
  var YMIN = -20000, YMAX = 2030; // linear axis range; the view never zooms or pans past it (beyond the edge padding)
  function fitLin() { return { c: (YMIN + YMAX) / 2, k: (W - 2 * pad()) / (YMAX - YMIN) }; }
  function clampLin(v) {
    var k = DB.clamp(v.k, fitLin().k, MAXK.lin), half = (W / 2 - pad()) / k;
    return { c: DB.clamp(v.c, YMIN + half, YMAX - half), k: k, anchor: v.anchor };
  }
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

  /* Presentation camera (linear scale): follow the newest revealed milestone. The window covers it and the two before it,
     but never widens again, so the view moves forward and zooms in as milestones cluster; FLOOR keeps ~30 years (2000–2030 at the end). */
  var CAM = { FLOOR: 30, FILL: .62, AT: .72 };
  function presentFrame(step) {
    var i = DB.clamp(step - 1, 0, N - 1), span = Infinity;
    for (var j = 0; j <= i; j++) {
      var b = Math.max(j, Math.min(2, N - 1)); // the first steps share the frame of the third milestone
      span = Math.min(span, (pos[b] - pos[Math.max(0, b - 2)]) / CAM.FILL);
    }
    span = Math.max(CAM.FLOOR, span);
    // newest milestone sits at AT of the usable width
    return clampLin({ c: pos[i] + (.5 - CAM.AT) * span, k: (W - 2 * pad()) / span, anchor: pos[i] });
  }

  /* ----- rendering ----- */
  var NODE_W = 6.8, TXT_H = 1.4, BADGE = 4.7, STEM0 = 1.5;
  var MAXS = 1.55, CROSS = .55; // CROSS: min distance (in node widths) from a far node's stem to the near node beside it
  /* Every milestone keeps a fixed lane (i % 4: above-near, below-near, above-far, below-far), so icons never hop between rows
     when zooming or panning. Same-lane neighbours are i, i+4; same-side neighbours (near/far) are i, i+2. */
  function edgeRoom() { return NODE_W * R * MAXS / 2; } // view margin in which nodes must not fold while they could be seen
  // Grow the nodes as far as the lane neighbours allow, so the timeline fills the screen. Pairs outside the view count less
  // the farther out they are (gently, over a few hundred px), so the size changes smoothly while panning.
  function nodeScale() {
    var n = Math.min(st.step, N), w0 = edgeRoom(), u = NODE_W * R * 1.08, s = MAXS, xs = [];
    for (var i = 0; i < n; i++) xs.push(xOf(i));
    function room(a, b, f) {
      var out = Math.max(0, -w0 - xs[b], xs[a] - W - w0) * .15;
      s = Math.min(s, (xs[b] - xs[a] + out) / (f * u));
    }
    for (var a = 0; a + 2 < n; a++) { room(a, a + 2, CROSS); if (a + 4 < n) room(a, a + 4, 1); }
    return Math.max(1, s);
  }
  function render() {
    var axisY = H * 0.545, S = nodeScale(), w = NODE_W * R * S;
    nodesEl.style.setProperty('--s', S.toFixed(3));
    layoutNodes(axisY, w, S);
    drawAxis(axisY);
    drawTicks(axisY);
    drawMarkers();
    drawPills(axisY);
    segBtns.forEach(function (b) { b.classList.toggle('on', Number(b.dataset.s) === st.target); });
  }

  function layoutNodes(axisY, w, S) {
    var hn = (BADGE + TXT_H) * R * S, gap = .35 * R, s0 = STEM0 * R * S, w0 = edgeRoom();
    var sb = Math.max(s0, DB.lerp(2.6, 3.9, st.t) * R); // below the axis, leave room for the year labels (2 rows on logical)
    var stems = [s0, sb, s0 + hn + .45 * R, sb + hn + .45 * R]; // per lane
    var right = [-1e9, -1e9, -1e9, -1e9], lastX = right.slice(), last = null;
    // Folding runs over all revealed nodes (not just the visible ones), so it never depends on the pan position.
    nodes.forEach(function (nd) {
      var L = nd.i % 4, x = nd.x = xOf(nd.i), el = nd.el, revealed = nd.i < st.step;
      nd.cluster = [];
      nd.shown = revealed && x > -w && x < W + w;
      // fold into the previous visible node as "+N" if it overlaps its lane, or a far stem would cross the near node beside it
      nd.folded = revealed && (x - w / 2 < right[L] + gap || x - lastX[(L + 2) % 4] < CROSS * w);
      if (revealed && !nd.folded) { right[L] = x + w / 2; lastX[L] = x; last = nd; }
      else if (nd.folded && last && x > -w0 && x < W + w0) last.cluster.push(nd); // folds far outside the view are not counted
      el.classList.toggle('off', !nd.shown);
      el.classList.toggle('hid', nd.shown && nd.folded);
      el.style.setProperty('--stem', stems[L] + 'px');
      el.style.transform = 'translate(' + (DB.clamp(x, -W, 2 * W) - w / 2) + 'px,' + (L % 2 ? axisY : axisY - stems[L] - hn) + 'px)';
    });
    nodes.forEach(function (nd) {
      var n = nd.cluster.length;
      nd.plus.textContent = n ? '+' + n : '';
      nd.plus.classList.toggle('on', n > 0);
    });
  }

  function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
  function fmtYear(y) { return y < 0 ? Math.abs(y).toLocaleString('en') + ' BCE' : y === 0 ? '0' : String(y); }

  function drawAxis(axisY) { // linear: from YMIN to the arrow at YMAX; logical: full width
    var x0 = DB.lerp(Math.max(0, xLin(YMIN)), 0, st.t), tip = DB.lerp(Math.min(W - .5 * R, xLin(YMAX) + .7 * R), W - .5 * R, st.t);
    axis.setAttribute('x1', x0); axis.setAttribute('x2', tip - .7 * R); axis.setAttribute('y1', axisY); axis.setAttribute('y2', axisY);
    arrow.setAttribute('d', 'M' + (tip - 1.3 * R) + ' ' + (axisY - .7 * R) + 'L' + tip + ' ' + axisY + 'L' + (tip - 1.3 * R) + ' ' + (axisY + .7 * R) + 'Z');
  }

  var YEAR_CW = .66 * 1.1; // year label character width (in rem)
  // Logical-scale year labels use 2 rows under the axis. Each milestone's row is fixed (assigned at the fitted zoom), so labels never hop.
  var yearRow = [];
  function assignYearRows() {
    var k = fitLog().k, cw = YEAR_CW * R, right = [-1e9, -1e9];
    yearRow = ms.map(function (m, i) {
      var x = i * k, half = m.year.length * cw / 2;
      var r = right[0] < x - half ? 0 : right[1] < x - half ? 1 : right[0] <= right[1] ? 0 : 1;
      right[r] = x + half + .6 * R;
      return r;
    });
  }
  // Year labels under the axis: regular ticks on the linear scale, each milestone's year on the logical one (cross-faded).
  function drawTicks(axisY) {
    clear(gTicks);
    var cw = YEAR_CW * R, ys = [axisY + 1.85 * R, axisY + 3.2 * R];
    function tick(g, x, y, txt) {
      g.append(S('line', { class: 'tl-tick', x1: x, x2: x, y1: axisY - .6 * R, y2: axisY + .6 * R }),
        S('text', { class: 'tl-tick-label', x: x, y: y, 'text-anchor': 'middle' }, txt));
    }
    var oLin = 1 - DB.clamp(st.t * 1.8, 0, 1), oLog = DB.clamp((st.t - .45) / .55, 0, 1);
    if (oLin > .02) {
      var gl = S('g', { opacity: oLin }), k = st.lin.k, y0 = Math.max(YMIN, st.lin.c - W / 2 / k), y1 = Math.min(YMAX, st.lin.c + W / 2 / k);
      var raw = ((y0 < 0 ? 10 : 4) * cw + 1.6 * R) / k, p = Math.pow(10, Math.floor(Math.log10(raw))), step = p;
      [1, 2, 5, 10].some(function (m) { step = m * p; return step >= raw; });
      step = Math.max(1, step);
      for (var y = Math.ceil(y0 / step) * step; y <= y1; y += step) tick(gl, xLin(y), ys[0], fmtYear(Math.round(y)));
      gTicks.append(gl);
    }
    if (oLog > .02) {
      var gm = S('g', { opacity: oLog }), right = [-1e9, -1e9];
      nodes.forEach(function (nd) { // collisions over all revealed nodes (pan-independent); only when zoomed out past the fit
        if (nd.i >= st.step || nd.folded) return;
        var txt = nd.m.year, half = txt.length * cw / 2, r = yearRow[nd.i];
        if (nd.x - half < right[r]) return;
        right[r] = nd.x + half + .6 * R;
        if (nd.shown) tick(gm, nd.x, ys[r], txt);
      });
      gTicks.append(gm);
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
    if (key === 'lin') { var t = clampLin(v); v.c = t.c; v.k = t.k; return; }
    v.k = DB.clamp(v.k, fitLog().k * .6, MAXK.log);
    v.c = DB.clamp(v.c, 0, N - 1);
  }
  // With target.anchor (a value on screen before and after), that value glides straight to its new x while zooming.
  function animateTo(key, target, ms) {
    if (anim) anim.cancel();
    var v = st[key], c0 = v.c, k0 = v.k, a = target.anchor;
    var xa0 = W / 2 + (a - c0) * k0, xa1 = W / 2 + (a - target.c) * target.k;
    var anchored = a != null && xa0 > -W && xa0 < 2 * W;
    anim = DB.tween({
      from: 0, to: 1, ms: ms || 650,
      onUpdate: function (e) {
        v.k = k0 * Math.pow(target.k / k0, e);
        v.c = anchored ? a - (DB.lerp(xa0, xa1, e) - W / 2) / v.k : DB.lerp(c0, target.c, e);
        render();
      },
      onDone: function () { anim = null; }
    });
  }
  function zoomAt(px, f, animate) {
    var key = activeKey(), v = st[key], lim = (key === 'lin' ? fitLin() : fitLog()).k * .6;
    var val = v.c + (px - W / 2) / v.k, nk = DB.clamp(v.k * f, lim, MAXK[key]);
    var target = { c: val - (px - W / 2) / nk, k: nk };
    st.touched = true;
    if (animate) animateTo(key, key === 'lin' ? clampLin(target) : { c: DB.clamp(target.c, 0, N - 1), k: nk }, 350);
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
    if (key === 'lin') t = clampLin(where === 'start' ? { c: YMIN, k: span / 21000 } : { c: YMAX, k: span / 70 });
    else t = where === 'start' ? { c: 3, k: span / 6 } : { c: N - 4, k: span / 6 };
    animateTo(key, t, 900);
  }
  function zoomCluster(nd) {
    var key = activeKey(), group = [nd].concat(nd.cluster);
    var vals = group.map(function (g) { return key === 'lin' ? pos[g.i] : g.i; });
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), range = Math.max(hi - lo, key === 'lin' ? .5 : .5);
    var k = DB.clamp((W - 2 * pad()) * .7 / range, st[key].k * 1.8, MAXK[key]);
    st.touched = true;
    var t = { c: (lo + hi) / 2, k: k };
    animateTo(key, key === 'lin' ? clampLin(t) : t, 700);
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
  function onResize() {
    measure();
    if (!st.touched) { st.lin = st.present ? presentFrame(st.step) : fitLin(); st.log = fitLog(); }
    render();
  }
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
      opts = opts || {};
      if (!inited) {
        measure();
        st.present = !opts.explore;
        if (st.present) st.t = st.target = step > N ? 1 : 0; // presentation reveals on the linear scale, then switches to logical
        st.lin = st.present ? presentFrame(step) : fitLin(); st.log = fitLog();
        inited = true;
      }
      var prev = st.step;
      st.step = step;
      if (st.present && !opts.instant && step !== prev) {
        var logical = step > N;
        st.touched = false;
        setScale(logical ? 1 : 0);
        if (logical) animateTo('log', fitLog(), 800); else animateTo('lin', presentFrame(step), 1100);
      }
      render();
      if (!opts.instant && step > prev && step <= N) {
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
