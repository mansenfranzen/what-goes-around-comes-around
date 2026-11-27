/* Timeline view: two blendable scales (linear = real distances, logical = equal spacing), zoom, pan, jump to start/end,
   world events, a year scale, step-by-step reveal (presentation) or everything at once (exploration).
   Presentation starts linear and moves/zooms the camera to each newly revealed milestone (presentFrame); its last step switches
   to logical. Exploration starts logical. The axis labels the years in DB.timelineYears on both scales; the linear scale adds
   a light ruler between them. World events (DB.markers) are grey milestones above the lanes.
   Milestone data: DB.milestones, events and years: content/markers.js.
   Positions: x = lerp(linearX, logicalX, t). Each scale keeps its own view {c: center, k: px per year | px per milestone}. */
DB.addView('timeline', function (slide, director) {
  var h = DB.h, S = DB.svg, ms = DB.milestones, N = ms.length;
  var YEARS = (DB.timelineYears || []).slice().sort(function (a, b) { return a - b; });
  var pos = ms.map(function (m) { return m.pos; });
  var W = 1920, H = 1080, R = 18;
  var st = { t: 1, target: 1, lin: null, log: null, touched: false, step: 0 };
  var anim = null, tScaleTween = null, unreveal = null;
  function revealed(i) {
    if (!st.present) return true;
    if (slide.review) return st.step === 0 ? i < slide.review.past : i >= slide.review.past;
    return i < st.step;
  }

  /* ----- DOM ----- */
  var svg = S('svg', { class: 'tl-svg' }), svgTop = S('svg', { class: 'tl-svg' }); // svgTop: year labels drawn over the stems
  var gMarks = S('g'), gTickLines = S('g'), gTicks = S('g'), gEvDots = S('g'), gPills = S('g');
  var axis = S('line', { class: 'tl-axis' }), arrow = S('path', { class: 'tl-arrow' });
  svg.append(gMarks, gTickLines, axis, arrow, gEvDots, gPills);
  svgTop.append(gTicks);
  var nodesEl = h('div', { class: 'tl-nodes' }), evEl = h('div', { class: 'tl-events' });

  // World events: fixed row (alternating by year) so they never hop between rows; placed in prio order (drawEvents).
  var events = (DB.markers || []).slice().sort(function (a, b) { return a.year - b.year; }).map(function (mk, j) {
    var e = h('div', { class: 'tl-event hid', title: mk.label + ' (' + fmtYear(mk.year) + ')' },
      h('small', { class: 'nm', text: mk.label }),
      h('span', { class: 'badge' }, h('img', { src: 'assets/symbols/event-' + mk.id + '.svg', alt: '', draggable: false })));
    evEl.append(e);
    return { mk: mk, el: e, row: j % 2, w: 0, x: 0 };
  });
  var eventsByPrio = events.slice().sort(function (a, b) { return b.mk.prio - a.mk.prio; });

  var nodes = ms.map(function (m, i) {
    var label = m.short || m.title;
    if (slide.review && director.mode === 'presentation' && i === slide.review.past) label = 'Up next: ' + label;
    var plus = h('span', { class: 'plus', title: 'Zoom in', on: { click: function (e) { e.stopPropagation(); zoomCluster(nd); } } });
    var btn = h('button', {
      class: 'tl-node off cat-' + m.category + (i % 2 ? ' below' : ' above'), 'data-id': m.id, title: m.title + ' (' + m.year + ')',
      on: { click: function () { if (performance.now() < (DB.suppressClick || 0)) return; director.goTo('m' + m.id); } }
    },
      h('i', { class: 'stem' }),
      h('span', { class: 'badge' }, h('img', { src: DB.symbolURL(m), alt: '', draggable: false })),
      h('span', { class: 'txt' }, h('small', { class: 'nm', text: label })),
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

  var el = h('div', { class: 'view-timeline grid-bg' }, svg, evEl, nodesEl, svgTop, dock);

  /* ----- geometry ----- */
  function measure() {
    W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight;
    R = parseFloat(getComputedStyle(document.documentElement).fontSize) || 18;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svgTop.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    events.forEach(function (ev) { ev.w = 0; }); // re-measured on the next render (labels scale with the root font size)
    measureLanes();
  }
  function pad() { return 6 * R; }
  var YMIN = -20000, YMAX = 2030; // linear axis range; the view never zooms or pans past it (beyond the edge padding)
  function fitLin() { return { c: (YMIN + YMAX) / 2, k: (W - 2 * pad()) / (YMAX - YMIN) }; }
  function clampLin(v) {
    var k = DB.clamp(v.k, fitLin().k, MAXK.lin), half = (W / 2 - pad()) / k;
    return { c: DB.clamp(v.c, YMIN + half, YMAX - half), k: k, anchor: v.anchor };
  }
  function fitLog() { return { c: (N - 1) / 2, k: (W - 2 * pad()) / (N - 1) }; }
  function logicalFrame(step) {
    if (!st.present || !slide.review) return fitLog();
    // Leave a slot for the next milestone in the recap; pan that slot to the left for the preview.
    var next = slide.review.past, first = step === 0 ? 0 : next, last = step === 0 ? next : N - 1;
    return { c: (first + last) / 2, k: (W - 2 * pad()) / Math.max(1, last - first), anchor: next };
  }
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
  var NODE_W = 6.8, TXT_H = 1.4, BADGE = 4.7, LEVELS = 3, LANES = 2 * LEVELS;
  var MAXS = 1.55, CROSS = .55; // CROSS: min distance (in node widths) from a far node's stem to a nearer node beside it
  /* Every milestone keeps a fixed lane (i % 6: above/below × near/mid/far), so icons never hop between rows when zooming or
     panning. Same-lane neighbours are i, i+6; same-side neighbours on other levels are i, i+2, i+4.
     Vertically (rem): the event rows stay above TOP, the year labels within SCALE_H under the axis; the lanes spread over
     the rest of the height, and the node scale is capped (maxSV) so three lanes per side always fit. */
  var V = { TOP: 10.4, BOT: .5, GAP: 1.3, SCALE_H: 3.8, LANE_GAP: .45 };
  var axisY = 0, maxSV = MAXS;
  function measureLanes() {
    axisY = (H + (V.TOP + V.GAP - V.BOT - V.SCALE_H) * R) / 2; // leaves the same room above and below
    maxSV = DB.clamp((axisY - (V.TOP + V.GAP + 2 * V.LANE_GAP) * R) / (LEVELS * (BADGE + TXT_H) * R), 1, MAXS);
  }
  // Stem length per lane (axis to badge edge).
  function laneStems(S) {
    var hn = (BADGE + TXT_H) * R * S, minPitch = hn + V.LANE_GAP * R, inA = V.GAP * R, inB = V.SCALE_H * R;
    var pA = Math.max(minPitch, (axisY - V.TOP * R - inA - hn) / (LEVELS - 1));
    var pB = Math.max(minPitch, (H - V.BOT * R - axisY - inB - hn) / (LEVELS - 1));
    var stems = [];
    for (var L = 0; L < LANES; L++) stems.push(L % 2 ? inB + (L >> 1) * pB : inA + (L >> 1) * pA);
    return stems;
  }
  function edgeRoom() { return NODE_W * R * MAXS / 2; } // view margin in which nodes must not fold while they could be seen
  // Grow the nodes as far as the lane neighbours (and the height) allow. Pairs outside the view count less
  // the farther out they are (gently, over a few hundred px), so the size changes smoothly while panning.
  function nodeScale() {
    var w0 = edgeRoom(), u = NODE_W * R * 1.08, s = maxSV, xs = [];
    for (var i = 0; i < N; i++) if (revealed(i)) xs.push(xOf(i));
    function room(a, b, f) {
      var out = Math.max(0, -w0 - xs[b], xs[a] - W - w0) * .15;
      s = Math.min(s, (xs[b] - xs[a] + out) / (f * u));
    }
    for (var a = 0; a + 2 < xs.length; a++) { room(a, a + 2, CROSS); if (a + LANES < xs.length) room(a, a + LANES, 1); }
    return Math.max(1, s);
  }
  function render() {
    var S = nodeScale(), w = NODE_W * R * S;
    nodesEl.style.setProperty('--s', S.toFixed(3));
    layoutNodes(axisY, w, S);
    drawAxis(axisY);
    drawYears(axisY);
    drawEvents(axisY);
    drawPills(axisY);
    segBtns.forEach(function (b) { b.classList.toggle('on', Number(b.dataset.s) === st.target); });
  }

  function layoutNodes(axisY, w, S) {
    var hn = (BADGE + TXT_H) * R * S, gap = .35 * R, w0 = edgeRoom(), stems = laneStems(S);
    var right = [], lastX = [], last = null;
    for (var l = 0; l < LANES; l++) { right.push(-1e9); lastX.push(-1e9); }
    function crosses(L, x) { // a farther stem would pass too close to a nearer node on the same side
      for (var o = L % 2; o < LANES; o += 2) if (o !== L && x - lastX[o] < CROSS * w) return true;
      return false;
    }
    // Folding runs over all revealed nodes (not just the visible ones), so it never depends on the pan position.
    nodes.forEach(function (nd) {
      var L = nd.i % LANES, x = nd.x = xOf(nd.i), el = nd.el, visible = revealed(nd.i);
      nd.cluster = [];
      nd.shown = visible && x > -w && x < W + w;
      // fold into the previous visible node as "+N" if it overlaps its lane, or a stem would cross a node on another level
      nd.folded = visible && (x - w / 2 < right[L] + gap || crosses(L, x));
      if (visible && !nd.folded) { right[L] = x + w / 2; lastX[L] = x; last = nd; }
      else if (nd.folded && last && x > -w0 && x < W + w0) last.cluster.push(nd); // folds far outside the view are not counted
      el.classList.toggle('off', !nd.shown);
      el.classList.toggle('hid', nd.shown && nd.folded);
      el.style.setProperty('--stem', stems[L] + 'px');
      var top = L % 2 ? axisY : axisY - stems[L] - hn, bw = BADGE * R * S / 2;
      nd.box = nd.shown && !nd.folded && !(L % 2) ? [x - bw, x + bw, top, top + hn, x] : null; // above-axis badge, for event stems
      el.style.transform = 'translate(' + (DB.clamp(x, -W, 2 * W) - w / 2) + 'px,' + top + 'px)';
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

  /* Year scale (content/markers.js: DB.timelineYears) on both scales: an ink tick across the axis leads to a dark pill under it.
     Pills that would overlap spread sideways around their group's centre and keep a slanted leader to their year, so every
     year on screen stays readable. When none is on screen, the nearest one on each side is pinned to that edge ("← 1950").
     The linear scale adds a light ruler of regular years in the gaps. */
  var YEAR = { CW: .63, PAD: .9, Y: 2.4, H: 1.7, GAP: .5 }; // rem: char width, pill padding, pill centre below the axis, height, gap
  function spreadLabels(items, gap, lo, hi) { // items sorted by x, each {x, w}; sets c (label centre)
    var gs = [];
    items.forEach(function (it) {
      var g = { list: [it], w: it.w, sum: it.x - it.w / 2, n: 1 };
      g.left = g.sum;
      while (gs.length && gs[gs.length - 1].left + gs[gs.length - 1].w + gap > g.left) { // touching: merge, centre on the mean
        var p = gs.pop(), shift = p.w + gap;
        g = { list: p.list.concat(g.list), w: shift + g.w, sum: p.sum + g.sum - shift * g.n, n: p.n + g.n };
        g.left = g.sum / g.n;
      }
      gs.push(g);
    });
    var minL = lo, maxR = hi, i;
    gs.forEach(function (g) { g.left = Math.max(g.left, minL); minL = g.left + g.w + gap; });
    for (i = gs.length - 1; i >= 0; i--) { gs[i].left = Math.min(gs[i].left, maxR - gs[i].w); maxR = gs[i].left - gap; }
    gs.forEach(function (g) {
      var l = g.left;
      g.list.forEach(function (it) { it.c = l + it.w / 2; l += it.w + gap; });
    });
  }
  function drawYears(axisY) {
    clear(gTicks); clear(gTickLines);
    var py = axisY + YEAR.Y * R, ph = YEAR.H * R, gap = YEAR.GAP * R, lo = .4 * R, hi = W - .4 * R, before = null, after = null;
    function item(y, t) { return { y: y, t: t, x: xOfYear(y), w: (t.length * YEAR.CW + YEAR.PAD) * R }; }
    var items = [];
    YEARS.forEach(function (y) {
      var it = item(y, fmtYear(y));
      if (it.x < -1) before = y; else if (it.x > W + 1) { if (after === null) after = y; } else items.push(it);
    });
    if (!items.length) {
      if (before !== null) { var a = item(before, '← ' + fmtYear(before)); a.pin = true; a.x = lo + a.w / 2; items.push(a); }
      if (after !== null) { var b = item(after, fmtYear(after) + ' →'); b.pin = true; b.x = hi - b.w / 2; items.push(b); }
    }
    spreadLabels(items, gap, lo, hi);
    items.forEach(function (it) {
      if (!it.pin) gTickLines.append(S('path', { class: 'tl-year-line', d: 'M' + it.x + ' ' + (axisY - .7 * R) + 'V' + axisY + 'L' + it.c + ' ' + (py - ph / 2) }));
      gTicks.append(S('g', { class: 'tl-year' + (it.pin ? ' pin' : '') },
        S('rect', { x: it.c - it.w / 2, y: py - ph / 2, width: it.w, height: ph, rx: .4 * R }),
        S('text', { x: it.c, y: py + .37 * R, 'text-anchor': 'middle' }, it.t)));
    });

    var o = 1 - DB.clamp(st.t * 1.8, 0, 1); // light ruler: linear scale only
    if (o <= .02) return;
    var cw = .55 * R, gl = S('g', { opacity: o }), gt = S('g', { opacity: o });
    var k = st.lin.k, y0 = Math.max(YMIN, st.lin.c - W / 2 / k), y1 = Math.min(YMAX, st.lin.c + W / 2 / k);
    var raw = ((y0 < 0 ? 10 : 4) * cw + 6 * R) / k, p = Math.pow(10, Math.floor(Math.log10(raw))), step = p;
    [1, 2, 5, 10].some(function (m) { step = m * p; return step >= raw; });
    step = Math.max(1, step);
    for (var y = Math.ceil(y0 / step) * step; y <= y1; y += step) {
      var x = xLin(y), t = fmtYear(Math.round(y)), half = t.length * cw / 2 + gap;
      if (items.some(function (it) { return it.y === y || (x + half > it.c - it.w / 2 && x - half < it.c + it.w / 2); })) continue;
      gt.append(S('line', { class: 'tl-tick', x1: x, x2: x, y1: axisY, y2: axisY + .7 * R }));
      if (x - half + gap > 0 && x + half - gap < W) gl.append(S('text', { class: 'tl-tick-label', x: x, y: py + .3 * R, 'text-anchor': 'middle' }, t));
    }
    gTickLines.append(gt);
    gTicks.append(gl);
  }

  /* World events (content/markers.js): grey milestones in two fixed rows above the lanes (EV, in rem), with a dotted stem and
     a grey dot on the axis. In prio order, an event shows only if its row has room and no stem of the upper row would cross it;
     otherwise only its stem is drawn (from the bottom of the event rows). Stems pause behind milestones above the axis. */
  var EV = { Y0: .5, ROW: 5, NM: 1.3, BADGE: 3.2 }; // first row top, row pitch, label height, badge size
  function drawEvents(axisY) {
    clear(gMarks); clear(gEvDots);
    var boxes = [[], []], stems = [], m = .5 * R;
    eventsByPrio.forEach(function (ev) {
      var x = ev.x = xOfYear(ev.mk.year);
      if (!ev.w) ev.w = ev.el.offsetWidth; // 0 until the view is in the document
      var w = ev.bw = ev.w || Math.max(EV.BADGE, ev.mk.label.length * .5) * R;
      var l = x - w / 2 - m, r = x + w / 2 + m, on = r > 0 && l < W;
      ev.shown = on && boxes[ev.row].every(function (b) { return r < b[0] || l > b[1]; }) &&
        (ev.row ? stems.every(function (sx) { return sx < l || sx > r; }) : boxes[1].every(function (b) { return x < b[0] || x > b[1]; }));
      if (ev.shown) { boxes[ev.row].push([l, r]); if (!ev.row) stems.push(x); }
    });
    events.forEach(function (ev) {
      var x = ev.x, top = (EV.Y0 + ev.row * EV.ROW) * R;
      ev.el.classList.toggle('hid', !ev.shown);
      ev.el.style.transform = 'translate(' + (DB.clamp(x, -W, 2 * W) - ev.bw / 2) + 'px,' + top + 'px)';
    });
    var drawn = events.filter(function (ev) { return ev.shown; }).map(function (ev) { return ev.x; });
    events.forEach(function (ev) {
      var x = ev.x, p = .4 * R;
      if (x < -20 || x > W + 20) return;
      gEvDots.append(S('circle', { class: 'ev-dot', cx: x, cy: axisY, r: .38 * R }));
      // a hidden event's stem is left out where a shown one already runs; the stem ends at a milestone it would run alongside
      if (!ev.shown && drawn.some(function (sx) { return Math.abs(sx - x) < 1.2 * R; })) return;
      if (!ev.shown) drawn.push(x);
      var y = ev.shown ? (EV.Y0 + ev.row * EV.ROW + EV.NM + EV.BADGE) * R : V.TOP * R - .4 * R, d = '';
      nodes.map(function (nd) { return nd.box; }).filter(function (b) { return b && x > b[0] - p && x < b[1] + p; })
        .sort(function (a, b) { return a[2] - b[2]; })
        .forEach(function (b) {
          if (b[2] - p > y) d += 'M' + x + ' ' + y + 'V' + (b[2] - p);
          y = Math.abs(x - b[4]) < R ? axisY : Math.max(y, b[3] + p);
        });
      if (y < axisY) d += 'M' + x + ' ' + y + 'V' + axisY;
      if (d) gMarks.append(S('path', { class: 'ev-line', d: d }));
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
    if (!st.touched) {
      st.lin = st.present && !slide.review ? presentFrame(st.step) : fitLin();
      st.log = logicalFrame(st.step);
    }
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
        if (st.present) st.t = st.target = slide.review || step > N ? 1 : 0; // recap uses logical spacing; the opening timeline reveals on the linear scale
        st.lin = st.present && !slide.review ? presentFrame(step) : fitLin();
        st.log = logicalFrame(step);
        inited = true;
      }
      var prev = st.step;
      st.step = step;
      if (st.present && !opts.instant && step !== prev) {
        st.touched = false;
        if (slide.review) {
          setScale(1);
          animateTo('log', logicalFrame(step), 800);
        }
        else {
          var logical = step > N;
          setScale(logical ? 1 : 0);
          if (logical) animateTo('log', fitLog(), 800); else animateTo('lin', presentFrame(step), 1100);
        }
      }
      render();
      if (st.present && !opts.instant && step > prev && step <= N) {
        var nd = nodes[slide.review ? slide.review.past : step - 1];
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
