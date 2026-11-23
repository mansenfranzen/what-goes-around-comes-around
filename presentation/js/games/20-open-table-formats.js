/* 20 Open table formats: two engines plan the same point query over the same 24 Parquet files.
   A only has the folder, so it lists it and opens every footer to learn each file's ID range.
   B follows Iceberg metadata (metadata.json -> manifest list -> one manifest) and opens a single file. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var COLS = 4, ROWS = 6, SPAN = 40, PER = ROWS * SPAN;   // 4 manifests x 6 files, 40 sale IDs per file
  var TARGETS = [742, 166, 508, 333];
  var REQ = 300, THINK = 520;                            // ms per storage request, per pruning pass
  var VW = 1000, VH = 530, LW = 480;
  var FW = 104, FH = 28, FOOT = 18, RY0 = 302, RSTEP = 34;
  var ENG = { x: 180, y: 46, w: 120, h: 40 }, FOLD = { y: 290, b: 512 };
  var MJ = { x: 165, y: 110, w: 150, h: 30 }, ML = { x: 14, y: 180, w: 452, h: 38 }, MF = { y: 242, h: 30 };
  var MID = LW / 2, ENG_B = ENG.y + ENG.h;

  function mid(y, hh) { return y + hh / 2 + 5.5; }   // text baseline centred in a box (16-unit text)
  function colX(k) { return 20 + k * 112; }
  function span(lo, hi) { return lo + '\u2013' + hi; }
  function T(cls, x, y, size, str, anchor) { return S('text', { class: cls, x: x, y: y, 'font-size': size, 'text-anchor': anchor || 'start' }, str); }
  function pts(p) { return p.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '); }

  /* point at fraction t along a polyline, plus the polyline up to that point */
  function along(p, t) {
    var lens = [], total = 0, i;
    for (i = 1; i < p.length; i++) { lens.push(Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); total += lens[i - 1]; }
    var d = t * total, out = [p[0]];
    for (i = 1; i < p.length; i++) {
      if (d <= lens[i - 1] || i === p.length - 1) {
        var f = lens[i - 1] ? Math.min(1, d / lens[i - 1]) : 1;
        var q = [DB.lerp(p[i - 1][0], p[i][0], f), DB.lerp(p[i - 1][1], p[i][1], f)];
        out.push(q);
        return { at: q, path: out };
      }
      d -= lens[i - 1]; out.push(p[i]);
    }
    return { at: p[p.length - 1], path: p };
  }

  DB.addGame('20', {
    hint: 'Run both engines: open every footer, or follow the table metadata',
    mount: function (root, api) {
      var rnd = DB.rng(20), perm = [], k, r;
      for (k = 0; k < COLS; k++) {
        var a = []; for (r = 0; r < ROWS; r++) a.push(r);
        for (r = ROWS - 1; r > 0; r--) { var j = Math.floor(rnd() * (r + 1)), t = a[r]; a[r] = a[j]; a[j] = t; }
        perm.push(a);
      }
      var ti = 0, target = TARGETS[0], lanes = [], scene = null, raf = 0, running = false, ran = false, solved = false;

      var code = h('div', { class: 'g-code' });
      var runBtn = h('button', { class: 'g-btn cat run', on: { click: run } }, 'Run query');
      var msg = h('div', { class: 'g-msg msg', 'aria-live': 'polite' });
      root.append(
        h('div', { class: 'g-row top' }, code, h('div', { class: 'g-grow' }),
          h('div', { class: 'legend' }, swatch('opened'), 'footer read', swatch(''), 'never opened'), runBtn),
        h('div', { class: 'scene-slot' }),
        msg);
      build();
      say('Same 24 Parquet files, same query. Only engine B can read Iceberg metadata.');

      function swatch(cls) {
        return S('svg', { class: 'sw ' + cls, viewBox: '0 0 34 22' },
          S('rect', { class: 'fb', x: 1, y: 1, width: 32, height: 20, rx: 4 }), S('rect', { class: 'ft', x: 19, y: 4, width: 11, height: 14, rx: 2 }));
      }
      function say(t, cls) { msg.className = 'g-msg msg' + (cls ? ' ' + cls : ''); msg.textContent = t; }

      /* ---------- scene ---------- */
      function build() {
        code.innerHTML = '';
        code.append(h('span', { class: 'k' }, 'SELECT'), ' * ', h('span', { class: 'k' }, 'FROM'), ' sales ',
          h('span', { class: 'k' }, 'WHERE'), ' sale_id = ', h('span', { class: 'n' }, String(target)));
        lanes = [laneA(), laneB()];
        var svg = S('svg', { class: 'scene', viewBox: '0 0 ' + VW + ' ' + VH, role: 'img',
          'aria-label': 'Engine A opens every Parquet footer; engine B follows table metadata to one file' },
          S('line', { class: 'split', x1: VW / 2, y1: 6, x2: VW / 2, y2: VH - 6 }), lanes[0].g, lanes[1].g);
        var slot = scene || root.querySelector('.scene-slot');
        slot.replaceWith(svg); scene = svg;
      }

      function lane(id, x0, title, sub) {
        var L = { id: id, steps: [], i: 0, t0: 0, started: false, req: 0, opened: 0, files: [], cols: [], done: false };
        L.reqN = T('num', 58, ENG.y + 31, 30, '0', 'end'); L.reqU = T('unit', 66, ENG.y + 29, 16, 'requests');
        L.opN = T('num', 360, ENG.y + 31, 30, '0', 'end'); L.opU = T('unit', 368, ENG.y + 29, 16, 'files opened');
        L.engT = T('eng-t', ENG.x + ENG.w / 2, mid(ENG.y, ENG.h), 17, 'engine', 'middle');
        L.eng = S('g', { class: 'eng' }, S('rect', { x: ENG.x, y: ENG.y, width: ENG.w, height: ENG.h, rx: 9 }), L.engT);
        L.fold = S('rect', { class: 'fold', x: 8, y: FOLD.y, width: LW - 16, height: FOLD.b - FOLD.y, rx: 10 });
        L.under = S('g'); L.nodes = S('g'); L.trails = S('g'); L.fx = S('g');
        L.g = S('g', { class: 'lane lane-' + id, transform: 'translate(' + x0 + ' 0)' },
          S('rect', { class: 'tag', x: 0, y: 4, width: 30, height: 28, rx: 7 }), T('tag-t', 15, 24.5, 18, id.toUpperCase(), 'middle'),
          T('ttl', 40, 26, 20, title), T('sub', LW, 26, 16, sub, 'end'),
          L.reqN, L.reqU, L.opN, L.opU,
          L.fold, S('rect', { class: 'fold-bg', x: 16, y: FOLD.b - 10, width: 238, height: 20, rx: 4 }),
          T('fold-t', 24, FOLD.b + 5, 15, 'sales/ \u00b7 24 Parquet files'),
          L.under, L.nodes, L.eng, L.trails, L.fx);
        for (k = 0; k < COLS; k++) { L.cols.push(S('g', { class: 'col' })); L.under.append(L.cols[k]); }
        for (k = 0; k < COLS; k++) for (r = 0; r < ROWS; r++) {
          var idx = k * ROWS + perm[k][r];
          var f = { k: k, r: r, lo: idx * SPAN + 1, hi: (idx + 1) * SPAN, x: colX(k), y: RY0 + r * RSTEP };
          f.t = T('fr', (FW - FOOT) / 2, mid(0, FH), 16, '?', 'middle');
          f.g = S('g', { class: 'file', transform: 'translate(' + f.x + ' ' + f.y + ')' },
            S('rect', { class: 'fb', width: FW, height: FH, rx: 5 }),
            S('rect', { class: 'ft', x: FW - FOOT - 3, y: 3, width: FOOT, height: FH - 6, rx: 3 }), f.t);
          f.hit = f.lo <= target && target <= f.hi;
          if (f.hit) L.hit = f;
          L.cols[k].append(f.g); L.files.push(f);
        }
        return L;
      }

      function stats(L) {
        L.reqN.textContent = L.req; L.reqU.textContent = L.req === 1 ? 'request' : 'requests';
        L.opN.textContent = L.opened; L.opU.textContent = L.opened === 1 ? 'file opened' : 'files opened';
      }
      function seen(f) { f.t.textContent = span(f.lo, f.hi); f.g.classList.add('seen'); }
      function judge(f) { f.g.classList.add(f.hit ? 'match' : 'skip'); }
      function open(L, f) { if (!f.g.classList.contains('opened')) { f.g.classList.add('opened'); L.opened++; } }
      function footer(f) { return [f.x + FW - FOOT / 2 - 3, f.y + FH / 2]; }
      function edge(parent, p) { parent.append(S('polyline', { class: 'edge', points: pts(p) })); }

      /* one storage request: a dot travels the path, then the path stays behind as a trail */
      function req(L, path, kind, arrive, trail) {
        var line, dot;
        return {
          ms: REQ,
          start: function () {
            line = S('polyline', { class: 'live ' + kind }); dot = S('circle', { class: 'dot ' + kind, r: 7 });
            L.fx.append(line, dot);
          },
          tick: function (p) {
            var q = along(path, DB.ease.inOut(p));
            line.setAttribute('points', pts(q.path)); dot.setAttribute('cx', q.at[0]); dot.setAttribute('cy', q.at[1]);
          },
          end: function () {
            line.remove(); dot.remove();
            L.trails.append(S('polyline', { class: 'trail ' + kind, points: pts(trail || path) }));
            L.req++; arrive(); stats(L);
          }
        };
      }
      function pause(fn) { return { ms: THINK, start: fn }; }
      function finish(L) { return { ms: 0, start: function () { laneDone(L); } }; }

      /* A: list the folder, then open every footer (the fan is clipped at the folder edge) */
      function laneA() {
        var L = lane('a', 10, 'Plain Parquet folder', 'reads every footer');
        var E = [MID, ENG_B];
        function fan(p) { var f = (FOLD.y - E[1]) / (p[1] - E[1]); return [E, [DB.lerp(E[0], p[0], f), FOLD.y]]; }
        L.steps.push(req(L, [E, [MID, FOLD.y]], 'meta', function () { L.fold.classList.add('flash'); }));
        for (r = 0; r < ROWS; r++) for (k = 0; k < COLS; k++) (function (f) {
          L.steps.push(req(L, [E, footer(f)], 'file', function () { open(L, f); seen(f); judge(f); }, fan(footer(f))));
        })(L.files[k * ROWS + r]);
        L.steps.push(req(L, [E, footer(L.hit)], 'file data', function () { L.hit.g.classList.add('read'); }, fan(footer(L.hit))));
        L.steps.push(finish(L));
        return L;
      }

      /* B: metadata.json -> manifest list -> one manifest -> one data file */
      function laneB() {
        var L = lane('b', 510, 'Iceberg table', 'metadata as an index');
        var hk = Math.floor((target - 1) / PER), cells = [], mfs = [];
        var mj = S('g', { class: 'meta' }, S('rect', { class: 'box', x: MJ.x, y: MJ.y, width: MJ.w, height: MJ.h, rx: 6 }),
          T('meta-t', MJ.x + MJ.w / 2, mid(MJ.y, MJ.h), 16, 'metadata.json', 'middle'));
        var ml = S('g', { class: 'ml' }, S('rect', { class: 'box', x: ML.x, y: ML.y, width: ML.w, height: ML.h, rx: 7 }));
        edge(L.nodes, [[MID, ENG_B], [MID, MJ.y]]);
        edge(L.nodes, [[MID, MJ.y + MJ.h], [MID, ML.y]]);
        L.nodes.append(T('cap', 16, mid(MJ.y, MJ.h), 15, 'SNAPSHOT'), T('cap', 16, ML.y - 10, 15, 'MANIFEST LIST'), mj, ml);
        for (k = 0; k < COLS; k++) {
          var x = colX(k), cx = x + FW / 2;
          var c = { t: T('cell-t', cx, mid(ML.y, ML.h), 16, '?', 'middle') };
          c.g = S('g', { class: 'cell' }, S('rect', { x: x, y: ML.y + 4, width: FW, height: ML.h - 8, rx: 4 }), c.t,
            S('line', { class: 'strike', x1: x + 10, y1: ML.y + ML.h / 2, x2: x + FW - 10, y2: ML.y + ML.h / 2 }));
          ml.append(c.g); cells.push(c);
          var mf = S('g', { class: 'mf' }, S('rect', { class: 'box', x: x, y: MF.y, width: FW, height: MF.h, rx: 5 }),
            T('mf-t', cx, mid(MF.y, MF.h), 15, 'manifest ' + (k + 1), 'middle'));
          mfs.push(mf);
          L.cols[k].insertBefore(S('rect', { class: 'band', x: x - 7, y: MF.y - 6, width: FW + 14, height: FOLD.b - MF.y + 2, rx: 8 }), L.cols[k].firstChild);
          edge(L.cols[k], [[cx, ML.y + ML.h], [cx, MF.y]]);
          L.cols[k].append(mf);
        }
        var hx = colX(hk), hcx = hx + FW / 2, f = L.hit, gx = hx - 3.5;

        L.steps.push(req(L, [[MID, ENG_B], [MID, MJ.y]], 'meta', function () { mj.classList.add('read'); }));
        L.steps.push(req(L, [[MID, MJ.y + MJ.h], [MID, ML.y]], 'meta', function () {
          ml.classList.add('read');
          cells.forEach(function (c, i) { c.t.textContent = span(i * PER + 1, (i + 1) * PER); });
        }));
        L.steps.push(pause(function () {
          cells.forEach(function (c, i) { c.g.classList.add(i === hk ? 'hit' : 'out'); if (i !== hk) L.cols[i].classList.add('pruned'); });
          L.cols[hk].classList.add('chosen');
        }));
        L.steps.push(req(L, [[hcx, ML.y + ML.h], [hcx, MF.y]], 'meta', function () {
          mfs[hk].classList.add('read');
          L.files.forEach(function (g) { if (g.k === hk) seen(g); });
        }));
        L.steps.push(pause(function () { L.files.forEach(function (g) { if (g.k === hk) judge(g); }); }));
        L.steps.push(req(L, [[hx, MF.y + MF.h / 2], [gx, MF.y + MF.h / 2], [gx, f.y + FH / 2], [hx, f.y + FH / 2]], 'file data', function () {
          open(L, f); f.g.classList.add('read');
        }));
        L.steps.push(finish(L));
        return L;
      }

      /* ---------- run loop ---------- */
      function advance(L, now) {
        while (L.i < L.steps.length) {
          var st = L.steps[L.i];
          if (!L.started) { L.started = true; if (st.start) st.start(); }
          var p = st.ms ? DB.clamp((now - L.t0) / st.ms, 0, 1) : 1;
          if (st.tick) st.tick(p);
          if (p < 1) return true;
          if (st.end) st.end();
          L.t0 += st.ms; L.i++; L.started = false;
        }
        return false;
      }
      function frame(now) {
        raf = 0;
        var busy = false;
        lanes.forEach(function (L) { if (advance(L, now)) busy = true; });
        if (busy) raf = requestAnimationFrame(frame);
      }

      function run() {
        if (running) return;
        if (ran) { ti = (ti + 1) % TARGETS.length; target = TARGETS[ti]; build(); }
        running = true; ran = true; runBtn.disabled = true;
        var now = performance.now();
        lanes.forEach(function (L) { L.t0 = now; L.eng.classList.add('busy'); L.engT.textContent = 'planning'; });
        say('A opens every footer to learn the ranges. B follows the metadata.');
        raf = requestAnimationFrame(frame);
      }

      function laneDone(L) {
        L.done = true;
        L.eng.classList.remove('busy'); L.eng.classList.add('fin'); L.engT.textContent = 'found';
        L.g.classList.add('fin');
        var A = lanes[0], B = lanes[1];
        if (!A.done || !B.done) {
          if (B.done) say('B found sale ' + target + ' after ' + B.req + ' requests. A is still opening footers\u2026');
          return;
        }
        running = false; runBtn.disabled = false;
        runBtn.textContent = 'Find sale ' + TARGETS[(ti + 1) % TARGETS.length];
        say('Same answer. A opened ' + A.opened + ' files to plan the scan; B read ' + (B.req - 1) + ' metadata files and opened ' + B.opened + '.', 'good');
        if (!solved) { solved = true; api.done(true); }
      }

      return { destroy: function () { if (raf) cancelAnimationFrame(raf); raf = 0; } };
    }
  });
})(window.DB);
