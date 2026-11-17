/* 22 Vectors: keyword search only finds the exact word; in embedding space meaning is distance, so nearest neighbours are similar things. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var W = 120, H = 80, VY = 1.15, MAXK = 8;
  var GROUPS = [
    { name: 'animals', col: '#F76707', ink: '#B84500', tint: '#FFE8D1' },
    { name: 'vehicles', col: '#1971C2', ink: '#0F4F8F', tint: '#DCEBFA' },
    { name: 'food', col: '#2F9E44', ink: '#1B6F2D', tint: '#DDF3E2' },
    { name: 'music', col: '#9C36B5', ink: '#6F2084', tint: '#F1E1F6' }
  ];
  var ITEMS = [
    ['cat', 0, 24, 19], ['kitten', 0, 13, 26], ['dog', 0, 40, 18], ['puppy', 0, 34, 28], ['lion', 0, 38, 7], ['tiger', 0, 20, 8], ['wolf', 0, 50, 26],
    ['car', 1, 82, 18], ['taxi', 1, 70, 26], ['truck', 1, 98, 12], ['bus', 1, 100, 24], ['van', 1, 86, 29], ['bike', 1, 76, 8], ['train', 1, 104, 34],
    ['apple', 2, 12, 46], ['pear', 2, 26, 45], ['bread', 2, 40, 47], ['cheese', 2, 11, 58], ['pizza', 2, 28, 56], ['soup', 2, 42, 58],
    ['guitar', 3, 76, 48], ['piano', 3, 92, 44], ['flute', 3, 104, 52], ['jazz', 3, 88, 56], ['violin', 3, 100, 62], ['drums', 3, 74, 62]
  ].map(function (a) { return { w: a[0], g: a[1], x: a[2], y: Math.round(a[3] * VY * 10) / 10 }; });

  function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }

  DB.addGame('22', {
    hint: 'Switch to Meaning, then drag the query point',
    mount: function (root, api) {
      var mode = 'kw', K = 3, kw = 0, q = { x: ITEMS[0].x, y: ITEMS[0].y }, drag = false, doneFlag = false, seen = {}, dragged = false, i;

      /* ---------- scene ---------- */
      var ringEl = S('circle', { class: 'rg', r: 10 });
      var lineEls = [], lineG = S('g');
      for (i = 0; i < MAXK; i++) { var ln = S('line', { class: 'ln' }); lineEls.push(ln); lineG.append(ln); }
      var itemEls = [], itemG = S('g');
      ITEMS.forEach(function (it, n) {
        var halo = S('circle', { class: 'ih', cx: it.x, cy: it.y, r: 3.4 });
        var dot = S('circle', { class: 'id', cx: it.x, cy: it.y, r: 1.5 });
        var txt = S('text', { class: 'it', x: it.x + 2.6, y: it.y + 1.15, 'font-size': 3.3 }, it.w);
        var g = S('g', { class: 'item' }, halo, dot, txt);
        g.style.setProperty('--g', GROUPS[it.g].col); g.style.setProperty('--gi', GROUPS[it.g].ink);
        itemEls.push(g); itemG.append(g);
      });
      var pulse = S('circle', { class: 'rp', r: 4.5 });
      var ret = S('g', { class: 'ret hid' },
        pulse,
        S('circle', { class: 'rr', r: 3.1 }),
        S('circle', { class: 'rc', r: 1 }),
        S('path', { class: 'rt', d: 'M0 -3.1V-5.4M0 3.1V5.4M-3.1 0H-5.4M3.1 0H5.4' }));
      var svg = S('svg', { class: 'scene', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMid meet' }, ringEl, lineG, ret, itemG);

      /* ---------- controls ---------- */
      var btnKw = h('button', { class: 'g-btn on', on: { click: function () { setMode('kw'); } } }, 'Keyword');
      var btnMe = h('button', { class: 'g-btn alt nudge', on: { click: function () { setMode('me'); } } }, 'Meaning');
      var msg = h('div', { class: 'g-msg msg' });
      var kVal = h('b', {}, String(K));
      var range = h('input', { type: 'range', class: 'g-range', min: 1, max: MAXK, step: 1, value: K });
      range.addEventListener('input', function () { K = +range.value; kVal.textContent = K; paint(); });
      var kbar = h('div', { class: 'kbar' }, h('span', { class: 'kn' }, 'K'), kVal, range);

      var code = h('div', { class: 'g-code code' });
      var hdr = h('div', { class: 'hdr' });
      var rows = [];
      var list = h('div', { class: 'list' });
      for (i = 0; i < MAXK; i++) {
        var r = { rk: h('span', { class: 'rk' }), wd: h('span', { class: 'wd' }), bar: h('i') };
        r.el = h('div', { class: 'row' }, r.rk, r.wd, h('span', { class: 'bt' }, r.bar));
        rows.push(r); list.append(r.el);
      }
      var side = h('div', { class: 'side' }, code, h('div', { class: 'g-card res' }, hdr, list));

      root.append(
        h('div', { class: 'g-row' }, h('div', { class: 'modes' }, btnKw, btnMe), msg),
        h('div', { class: 'body' }, svg, kbar, side));

      /* ---------- input ---------- */
      function toPt(e) {
        var p = svg.createSVGPoint();
        p.x = e.clientX; p.y = e.clientY;
        p = p.matrixTransform(svg.getScreenCTM().inverse());
        return { x: DB.clamp(p.x, 2, W - 2), y: DB.clamp(p.y, 3, H - 2) };
      }
      function nearestItem(pt) {
        var best = 0, bd = 1e9;
        ITEMS.forEach(function (it, n) { var d = dist(it, pt); if (d < bd) { bd = d; best = n; } });
        return { i: best, d: bd };
      }
      svg.addEventListener('pointerdown', function (e) {
        var pt = toPt(e);
        if (mode === 'kw') {
          var n = nearestItem(pt);
          if (n.d < 7) { kw = n.i; paint(); }
          return;
        }
        drag = true; dragged = true;
        svg.classList.add('held');
        try { svg.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointer */ }
        q = pt; paint();
      });
      svg.addEventListener('pointermove', function (e) { if (drag) { q = toPt(e); paint(); } });
      function release() { drag = false; svg.classList.remove('held'); }
      svg.addEventListener('pointerup', release);
      svg.addEventListener('pointercancel', release);

      paint();

      /* ---------- logic ---------- */
      function setMode(m) {
        if (m === mode) return;
        mode = m;
        if (m === 'me') { q = { x: ITEMS[kw].x, y: ITEMS[kw].y }; dragged = false; btnMe.classList.remove('nudge'); }
        else kw = nearestItem(q).i;
        paint();
      }
      function say(t, cls) { msg.className = 'g-msg msg' + (cls ? ' ' + cls : ''); msg.textContent = t; }
      function paint() {
        var me = mode === 'me', top, n, it, g;
        btnKw.className = 'g-btn ' + (me ? 'alt' : 'on');
        btnMe.className = 'g-btn ' + (me ? 'on' : 'alt') + (btnMe.classList.contains('nudge') && !me ? ' nudge' : '');
        range.disabled = !me; kbar.classList.toggle('off', !me);

        if (me) {
          top = ITEMS.map(function (x, j) { return { i: j, d: dist(x, q) }; }).sort(function (a, b) { return a.d - b.d; }).slice(0, K);
        } else top = [{ i: kw, d: 0 }];

        var lit = {};
        top.forEach(function (t) { lit[t.i] = true; });
        itemEls.forEach(function (el, j) {
          el.classList.toggle('lit', !!lit[j]);
          el.classList.toggle('dim', !lit[j]);
        });

        ret.classList.toggle('hid', !me);
        svg.classList.toggle('me', me);
        ret.classList.toggle('calm', dragged);
        ret.setAttribute('transform', 'translate(' + q.x.toFixed(2) + ' ' + q.y.toFixed(2) + ')');
        ringEl.classList.toggle('hid', !me);
        if (me) {
          ringEl.setAttribute('cx', q.x.toFixed(2)); ringEl.setAttribute('cy', q.y.toFixed(2));
          ringEl.setAttribute('r', (top[top.length - 1].d + 2.6).toFixed(2));
        }
        lineEls.forEach(function (ln, j) {
          var t = me ? top[j] : null;
          ln.classList.toggle('hid', !t);
          if (t) {
            it = ITEMS[t.i];
            ln.setAttribute('x1', q.x.toFixed(2)); ln.setAttribute('y1', q.y.toFixed(2)); ln.setAttribute('x2', it.x); ln.setAttribute('y2', it.y);
            ln.style.stroke = GROUPS[it.g].col;
          }
        });

        code.textContent = '';
        if (me) {
          code.append(h('span', { class: 'k' }, 'SELECT'), ' word\n', h('span', { class: 'k' }, 'FROM'), ' items\n', h('span', { class: 'k' }, 'ORDER BY'),
            ' distance(v, :q)\n', h('span', { class: 'k' }, 'LIMIT'), ' ', h('span', { class: 'n' }, String(K)), ';');
        } else {
          code.append(h('span', { class: 'k' }, 'SELECT'), ' word\n', h('span', { class: 'k' }, 'FROM'), ' items\n', h('span', { class: 'k' }, 'WHERE'),
            ' word = ', h('span', { class: 's' }, "'" + ITEMS[kw].w + "'"), ';');
        }

        hdr.textContent = me ? K + (K === 1 ? ' nearest' : ' nearest, by distance') : '1 hit, exact word';
        rows.forEach(function (r, j) {
          var t = top[j];
          r.el.classList.toggle('hid', !t);
          if (!t) return;
          it = ITEMS[t.i]; g = GROUPS[it.g];
          r.rk.textContent = j + 1; r.rk.style.background = g.col;
          r.wd.textContent = it.w; r.wd.style.color = g.ink;
          r.bar.style.width = (me ? DB.clamp(100 - t.d * 2.4, 8, 100) : 100) + '%'; r.bar.style.background = g.col;
        });

        status(me, top);
      }

      function status(me, top) {
        if (!me) { say('Keyword "' + ITEMS[kw].w + '": 1 hit. Its neighbours stay dark.'); return; }
        var gid = ITEMS[top[0].i].g;
        var same = top.every(function (t) { return ITEMS[t.i].g === gid; });
        if (same && K >= 3) {
          seen[gid] = true;
          if (!doneFlag && Object.keys(seen).length >= 2) { doneFlag = true; api.done(true); }
        }
        if (doneFlag && same && K >= 3) say('The ' + K + ' nearest are all ' + GROUPS[gid].name + '. Meaning became distance.', 'good');
        else if (!dragged) say('Drag the query point across the map.');
        else if (K < 3) say('Raise K: more neighbours light up.');
        else if (same) say('The ' + K + ' nearest are all ' + GROUPS[gid].name + '. Now try another topic.');
        else say('Between topics: the neighbours are mixed.', 'bad');
      }

      return { destroy: function () { drag = false; } };
    }
  });
})(window.DB);
