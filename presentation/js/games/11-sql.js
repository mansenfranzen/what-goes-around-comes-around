/* 11 SQL: say WHAT you want; the optimizer decides HOW (full scan or index) and the rows touched collapse. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var COLS = 10, ROWS = 6, T = 20, G = 22, TOPY = 24, W = COLS * G, H = TOPY + ROWS * G, N = COLS * ROWS;
  var CITIES = [
    { n: 'Paris', k: 22, c: '#E8590C', s: 'circle' },
    { n: 'Rome', k: 17, c: '#2F9E44', s: 'square' },
    { n: 'Oslo', k: 12, c: '#1971C2', s: 'tri' },
    { n: 'Lima', k: 7, c: '#7048E8', s: 'dia' },
    { n: 'Kyiv', k: 2, c: '#C2255C', s: 'hex' }
  ];
  var BX0 = 44, BW = 35;

  function glyph(kind, cx, cy, r, attrs) {
    var el, pts;
    if (kind === 'circle') el = S('circle', { cx: cx, cy: cy, r: r });
    else if (kind === 'square') el = S('rect', { x: cx - r * 0.85, y: cy - r * 0.85, width: r * 1.7, height: r * 1.7, rx: r * 0.18 });
    else {
      if (kind === 'tri') pts = [[0, -1], [1, 0.78], [-1, 0.78]];
      else if (kind === 'dia') pts = [[0, -1.15], [1, 0], [0, 1.15], [-1, 0]];
      else pts = [[0.5, -0.87], [1, 0], [0.5, 0.87], [-0.5, 0.87], [-1, 0], [-0.5, -0.87]];
      el = S('polygon', { points: pts.map(function (p) { return (cx + p[0] * r).toFixed(2) + ',' + (cy + p[1] * r).toFixed(2); }).join(' ') });
    }
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  DB.addGame('11', {
    hint: 'Run the query, then switch the index on and run it again',
    mount: function (root, api) {
      var rnd = DB.rng(31), rows = [], sel = 2, vipOn = false, idxOn = false;
      var timer = null, ranScan = false, ranIdx = false, lastIdx = 0, doneSent = false, touched = 0, found = 0;

      var deck = [], i, j, t;
      CITIES.forEach(function (c, ci) { for (var k = 0; k < c.k; k++) deck.push(ci); });
      for (i = deck.length - 1; i > 0; i--) { j = Math.floor(rnd() * (i + 1)); t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
      deck.forEach(function (ci, n) {
        rows.push({ n: n, ci: ci, vip: rnd() < 0.3, x: (n % COLS) * G + 1, y: TOPY + Math.floor(n / COLS) * G });
      });

      var bgG = S('g'), lineG = S('g'), glG = S('g'), stripG = S('g');
      rows.forEach(function (r) {
        var c = CITIES[r.ci];
        r.bg = S('rect', { class: 'bg', x: r.x, y: r.y, width: T, height: T, rx: 3 });
        r.bg.setAttribute('style', '--tc:' + c.c);
        r.gl = glyph(c.s, r.x + T / 2, r.y + T / 2 + 0.4, 6.4, { class: 'gl', fill: c.c });
        bgG.append(r.bg); glG.append(r.gl);
        if (r.vip) { r.dot = S('circle', { class: 'vip', cx: r.x + T - 3.8, cy: r.y + 3.8, r: 2.5 }); glG.append(r.dot); }
      });

      var strip = S('g', { class: 'strip' }, S('rect', { class: 'sbg', x: 0.5, y: 1, width: W - 1, height: 17, rx: 3 }),
        S('text', { class: 'slab', x: 4, y: 11.2, 'font-size': 4.6 }, 'INDEX'));
      CITIES.forEach(function (c, ci) {
        c.b = S('g', { class: 'bk' }, S('rect', { class: 'bkbg', x: BX0 + ci * BW, y: 3.5, width: BW - 3, height: 12, rx: 2.4 }),
          glyph(c.s, BX0 + ci * BW + 5.6, 9.5, 3.4, { fill: c.c }),
          S('text', { class: 'bkt', x: BX0 + ci * BW + 11, y: 11.1, 'font-size': 4.4 }, c.n));
        strip.append(c.b);
      });
      stripG.append(strip);
      var svg = S('svg', { class: 'grid', viewBox: '0 0 ' + W + ' ' + H }, stripG, bgG, lineG, glG);

      /* ---------- UI ---------- */
      var msg = h('div', { class: 'g-msg g-grow' }, 'Pick a city and press Run.');
      var chips = CITIES.map(function (c, ci) {
        var b = h('button', { class: 'pk', on: { click: function () { pick(ci); } } },
          h('span', { class: 'cb' }, S('svg', { class: 'gly', viewBox: '-7 -7 14 14' }, glyph(c.s, 0, 0.3, 5.6, { fill: c.c }))), c.n);
        b.setAttribute('style', '--tc:' + c.c);
        return b;
      });
      var vipChip = h('button', { class: 'pk vippk', on: { click: toggleVip } },
        h('span', { class: 'cb' }, S('svg', { class: 'gly', viewBox: '-7 -7 14 14' }, S('circle', { cx: 0, cy: 0, r: 4.6, fill: '#F59F00' }))), 'AND vip');
      var q = h('div', { class: 'q' }, h('span', { class: 'kw' }, 'SELECT * FROM customer WHERE city ='), h('span', { class: 'pks' }, chips), vipChip);

      var planEl = h('div', { class: 'plan' }, '-');
      var touchedB = h('b', {}, '0'), foundB = h('b', {}, '0');
      var barFill = h('i', {});
      var sw = h('span', { class: 'sw' }, h('span', { class: 'knob' }));
      var idxBtn = h('button', { class: 'idxcard', on: { click: toggleIdx } }, h('span', {}, 'Index on city'), sw);
      var runBtn = h('button', { class: 'g-btn cat', on: { click: start } }, 'Run');
      var side = h('div', { class: 'side' },
        h('div', { class: 'g-card box' }, h('div', { class: 'g-label' }, 'Optimizer picks'), planEl),
        h('div', { class: 'g-card box' }, h('div', { class: 'g-label' }, 'Rows touched'),
          h('div', { class: 'big' }, touchedB, h('span', {}, ' / ' + N)), h('div', { class: 'bar' }, barFill)),
        h('div', { class: 'g-card box' }, h('div', { class: 'g-label' }, 'Rows found'), h('div', { class: 'big' }, foundB)),
        idxBtn, runBtn);
      root.append(h('div', { class: 'g-row' }, h('span', { class: 'g-label' }, 'Declarative'), msg), q, h('div', { class: 'main' }, h('div', { class: 'view' }, svg), side));
      refreshChips();

      function refreshChips() {
        chips.forEach(function (b, ci) { b.classList.toggle('sel', ci === sel); });
        vipChip.classList.toggle('sel', vipOn);
        sw.classList.toggle('on', idxOn);
        idxBtn.classList.remove('nudge');
        strip.classList.toggle('on', idxOn);
      }
      function matches(r) { return r.ci === sel && (!vipOn || r.vip); }
      function paint(r, st) {
        r.bg.setAttribute('class', 'bg ' + st);
        r.gl.setAttribute('class', 'gl ' + st);
      }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }
      function clear() {
        stop();
        rows.forEach(function (r) { paint(r, ''); });
        while (lineG.firstChild) lineG.removeChild(lineG.firstChild);
        CITIES.forEach(function (c) { c.b.classList.remove('lit'); });
        touched = 0; found = 0; stats(); planEl.textContent = '-'; planEl.className = 'plan';
        barFill.className = '';
      }
      function stats() {
        touchedB.textContent = touched; foundB.textContent = found;
        barFill.style.width = (touched / N * 100) + '%';
      }
      function pick(ci) { sel = ci; clear(); refreshChips(); msg.className = 'g-msg g-grow'; msg.textContent = 'Press Run.'; }
      function toggleVip() { vipOn = !vipOn; clear(); refreshChips(); msg.className = 'g-msg g-grow'; msg.textContent = 'Press Run.'; }
      function toggleIdx() {
        idxOn = !idxOn; clear(); refreshChips();
        msg.className = 'g-msg g-grow'; msg.textContent = idxOn ? 'Index on. Same query: press Run.' : 'Index off. Press Run.';
      }

      function start() {
        clear();
        var order = [], plan = idxOn ? 'idx' : 'scan', k = 0, prev = null;
        rows.forEach(function (r) { if (!idxOn || r.ci === sel) order.push(r); });
        planEl.textContent = idxOn ? 'INDEX LOOKUP' : 'FULL SCAN';
        planEl.className = 'plan ' + plan;
        barFill.className = plan;
        msg.className = 'g-msg g-grow'; msg.textContent = idxOn ? 'Jumping straight to the rows...' : 'Reading every row...';
        if (idxOn) CITIES[sel].b.classList.add('lit');
        timer = setInterval(function () {
          if (prev) paint(prev, matches(prev) ? 'hit' : 'touch');
          if (k >= order.length) return finish(plan);
          var r = order[k++];
          touched++;
          if (matches(r)) found++;
          paint(r, 'cur'); prev = r;
          if (idxOn) {
            var bx = BX0 + sel * BW + (BW - 3) / 2;
            var ln = S('path', { class: 'ln', pathLength: 1, d: 'M' + bx + ' 16.5L' + (r.x + T / 2) + ' ' + (r.y + 2) });
            ln.setAttribute('stroke', CITIES[sel].c);
            lineG.append(ln);
          }
          stats();
        }, idxOn ? 55 : 26);
      }

      function finish(plan) {
        stop();
        barFill.className = plan;
        if (plan === 'scan') {
          ranScan = true;
          msg.className = 'g-msg g-grow'; msg.textContent = found + ' found, but all ' + N + ' rows were read.';
          if (!ranIdx) { idxBtn.classList.add('nudge'); msg.textContent += ' Try the index.'; }
        } else {
          ranIdx = true; lastIdx = touched;
          msg.className = 'g-msg g-grow good'; msg.textContent = 'Same SQL. Only ' + touched + ' rows touched.';
        }
        if (ranScan && ranIdx) {
          msg.className = 'g-msg g-grow good';
          msg.textContent = 'Same SQL, different plan: ' + N + ' -> ' + lastIdx + ' rows touched.';
          if (!doneSent) { doneSent = true; api.done(true); api.hint('You said what. The optimizer chose how'); }
        }
      }

      return { destroy: function () { stop(); } };
    }
  });
})(window.DB);
