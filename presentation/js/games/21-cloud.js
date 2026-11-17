/* 21 Cloud: a provisioned cluster is slow to resize and bills while idle; storage + elastic compute fixes both. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var NC = 24, TC = 0.5, RATE = 0.1, WARM = 0.35, MAXN = 8;
  var CL = { w: 6.4, h: 5.8, px: 8, py: 7.2, y0: 33 };
  var CD = { w: 7.4, h: 6.2, px: 9.6, py: 8.2, y0: 50 };

  function nodeX(k, n) { var sw = 152 / n; return 4 + sw * (k + 0.5); }
  function money(v) { return '$' + v.toFixed(2); }

  /* chunk rectangles + disk boxes for a mode / node count / ownership */
  function layout(mode, n, own) {
    var pos = [], disks = [], c;
    if (mode === 'cloud') {
      for (c = 0; c < NC; c++) pos.push({ x: 6 + (148 - 12 * CD.px) / 2 + (c % 12) * CD.px + (CD.px - CD.w) / 2, y: CD.y0 + Math.floor(c / 12) * CD.py, w: CD.w, h: CD.h });
      return { pos: pos, disks: disks };
    }
    var cnt = [], idx = [], k, maxCnt = 0;
    for (k = 0; k < n; k++) { cnt[k] = 0; idx[k] = 0; }
    for (c = 0; c < NC; c++) cnt[own[c]]++;
    for (k = 0; k < n; k++) maxCnt = Math.max(maxCnt, cnt[k]);
    var cols = Math.ceil(maxCnt / 4), rows = Math.ceil(maxCnt / cols);
    for (k = 0; k < n; k++) disks.push({ x: nodeX(k, n) - (cols * CL.px + 4) / 2, w: cols * CL.px + 4, h: 4 + rows * CL.py - 1 });
    for (c = 0; c < NC; c++) {
      k = own[c]; var m = idx[k]++;
      pos.push({ x: nodeX(k, n) - cols * CL.px / 2 + (m % cols) * CL.px + (CL.px - CL.w) / 2, y: CL.y0 + Math.floor(m / cols) * CL.py, w: CL.w, h: CL.h });
    }
    return { pos: pos, disks: disks };
  }

  DB.addGame('21', {
    hint: 'Make the query fast, without paying for idle servers',
    mount: function (root, api) {
      var rnd = DB.rng(21);
      var mode = 'cluster', dial = { cluster: 3, cloud: 2 }, clusterN = 3, lay;
      var owner = [], pos = [], done = [], claimed = [], W = [], chunkCls = [], ncx = [], coinT = [];
      var running = false, rebal = false, switching = false, query = { t: 0, cost: 0 }, bill = 0, doneFlag = false;
      var raf = 0, last = null, mv = null, c, k;

      for (c = 0; c < NC; c++) { owner.push(c % clusterN); done.push(false); claimed.push(-1); chunkCls.push(''); }
      for (k = 0; k < MAXN; k++) { W.push({ on: k < clusterN, warm: 0, chunk: -1, p: 0 }); coinT.push(rnd()); ncx.push(0); }
      lay = layout('cluster', clusterN, owner);
      pos = lay.pos.map(function (p) { return { x: p.x, y: p.y, w: p.w, h: p.h }; });

      /* ---------- scene ---------- */
      var zone = S('text', { class: 'zl', x: 3, y: 5.2, 'font-size': 3.1 }, 'CLUSTER: compute + data together');
      var bucket = S('g', { class: 'bucket' }, S('rect', { class: 'bx', x: 6, y: 41, width: 148, height: 26, rx: 3 }),
        S('text', { class: 'zl', x: 10, y: 46.2, 'font-size': 3.1 }, 'OBJECT STORAGE: cheap, open files'));
      var diskEls = [], diskG = S('g', { class: 'disks' });
      for (k = 0; k < MAXN; k++) { var dk = S('rect', { class: 'disk', y: 30, rx: 1.8 }); diskEls.push(dk); diskG.append(dk); }
      var lineEls = [], lineG = S('g');
      for (k = 0; k < MAXN; k++) { var ln = S('line', { class: 'rd' }); lineEls.push(ln); lineG.append(ln); }
      var chunkEls = [], chunkG = S('g');
      for (c = 0; c < NC; c++) { var ce = S('rect', { class: 'ck', rx: 1.1 }); chunkEls.push(ce); chunkG.append(ce); placeChunk(c); }
      var nodeEls = [], nodeG = S('g');
      for (k = 0; k < MAXN; k++) {
        var n = {};
        n.bar = S('rect', { class: 'bar', x: -5, y: 21, width: 0, height: 2.6, rx: 1.1 });
        n.g = S('g', { class: 'node' },
          S('rect', { class: 'nbody', x: -7, y: 9, width: 14, height: 16, rx: 2.4 }),
          S('circle', { class: 'led', cx: -3.8, cy: 12.4, r: 1 }), S('circle', { class: 'led', cx: -1.2, cy: 12.4, r: 1 }), S('circle', { class: 'led', cx: 1.4, cy: 12.4, r: 1 }),
          S('rect', { class: 'nslot', x: -5, y: 15.4, width: 10, height: 1.6, rx: .8 }),
          S('rect', { class: 'bbg', x: -5, y: 21, width: 10, height: 2.6, rx: 1.1 }), n.bar);
        nodeEls.push(n); nodeG.append(n.g);
      }
      var coinG = S('g');
      var svg = S('svg', { class: 'scene', viewBox: '0 0 160 68', preserveAspectRatio: 'xMidYMid meet' }, bucket, diskG, lineG, chunkG, nodeG, coinG, zone);

      /* ---------- controls ---------- */
      var btnCluster = h('button', { class: 'g-btn on', on: { click: function () { setMode('cluster'); } } }, 'Cluster');
      var btnCloud = h('button', { class: 'g-btn alt', on: { click: function () { setMode('cloud'); } } }, 'Cloud');
      var msg = h('div', { class: 'g-msg msg' }, '3 nodes, always on. Run the query.');
      var range = h('input', { type: 'range', class: 'g-range', min: 2, max: MAXN, step: 1, value: 3 });
      range.addEventListener('input', onInput); range.addEventListener('change', onChange);
      var dialName = h('span', { class: 'dn' }, 'NODES'), dialVal = h('b', {}, '3');
      var tStat = h('b', {}, '0.0s'), rStat = h('b', {}, '$0.00'), bStat = h('b', {}, '$0.00');
      var rateBox = h('div', { class: 'g-stat' }, rStat, h('span', {}, 'per second'));
      var billBox = h('div', { class: 'g-stat' }, bStat, h('span', {}, 'total bill'));
      var runBtn = h('button', { class: 'g-btn cat run', on: { click: run } }, 'Run query');

      root.append(
        h('div', { class: 'g-row' }, h('div', { class: 'modes' }, btnCluster, btnCloud), msg),
        svg,
        h('div', { class: 'ctl' },
          h('div', { class: 'dial' }, h('div', { class: 'g-row' }, dialName, dialVal), range),
          h('div', { class: 'g-stat' }, tStat, h('span', {}, 'query time')), rateBox, billBox, runBtn));

      applyStatic(); paint();
      raf = requestAnimationFrame(frame);

      /* ---------- helpers ---------- */
      function say(t, cls) { msg.className = 'g-msg msg' + (cls ? ' ' + cls : ''); msg.textContent = t; }
      function placeChunk(i) {
        var p = pos[i], e = chunkEls[i];
        e.setAttribute('x', p.x.toFixed(2)); e.setAttribute('y', p.y.toFixed(2)); e.setAttribute('width', p.w.toFixed(2)); e.setAttribute('height', p.h.toFixed(2));
      }
      function applyStatic() {
        var cl = mode === 'cluster';
        bucket.setAttribute('class', 'bucket' + (cl ? ' off' : ''));
        diskG.setAttribute('class', 'disks' + (cl ? '' : ' off'));
        zone.textContent = cl ? 'CLUSTER: compute + data together' : 'COMPUTE: rented only while it runs';
        for (var i = 0; i < MAXN; i++) {
          var d = lay.disks[i];
          diskEls[i].classList.toggle('hide', !d);
          if (d) { diskEls[i].setAttribute('x', d.x.toFixed(2)); diskEls[i].setAttribute('width', d.w.toFixed(2)); diskEls[i].setAttribute('height', d.h.toFixed(2)); }
        }
        range.min = cl ? 2 : 1; range.value = dial[mode]; dialVal.textContent = dial[mode];
        dialName.textContent = cl ? 'NODES' : 'WORKERS';
        btnCluster.className = 'g-btn ' + (cl ? 'on' : 'alt'); btnCloud.className = 'g-btn ' + (cl ? 'alt' : 'on');
      }
      function moveTo(target, ms, cb) {
        if (mv) mv.cancel();
        var from = pos.map(function (p) { return { x: p.x, y: p.y, w: p.w, h: p.h }; });
        mv = DB.tween({
          from: 0, to: 1, ms: ms,
          onUpdate: function (e) {
            for (var i = 0; i < NC; i++) {
              var a = from[i], b = target[i];
              pos[i] = { x: DB.lerp(a.x, b.x, e), y: DB.lerp(a.y, b.y, e), w: DB.lerp(a.w, b.w, e), h: DB.lerp(a.h, b.h, e) };
              placeChunk(i);
            }
          },
          onDone: function () { mv = null; if (cb) cb(); }
        });
      }
      function clearRun() {
        running = false;
        for (var i = 0; i < NC; i++) { done[i] = false; claimed[i] = -1; }
        for (var j = 0; j < MAXN; j++) W[j] = { on: mode === 'cluster' && j < clusterN, warm: 0, chunk: -1, p: 0 };
        query.t = 0; query.cost = 0;
      }

      /* ---------- interaction ---------- */
      function setMode(m) {
        if (m === mode || running || rebal || switching) return;
        mode = m; clearRun(); switching = true;
        if (m === 'cluster') {
          clusterN = dial.cluster;
          for (c = 0; c < NC; c++) owner[c] = c % clusterN;
          for (k = 0; k < MAXN; k++) W[k].on = k < clusterN;
        }
        lay = layout(mode, clusterN, owner); applyStatic();
        moveTo(lay.pos, 1000, function () { switching = false; });
        say(m === 'cloud' ? 'Data stays in object storage. Compute is just a dial.' : 'Back to nodes that own their data.', '');
      }
      function onInput() {
        var v = Number(range.value);
        dialVal.textContent = v;
        if (mode === 'cloud') dial.cloud = v;
      }
      function onChange() {
        var v = Number(range.value);
        if (mode === 'cloud') { dial.cloud = v; return; }
        if (v === clusterN || running || rebal) return;
        dial.cluster = v;
        var old = owner.slice();
        clusterN = v;
        for (c = 0; c < NC; c++) owner[c] = c % clusterN;
        var moved = 0; for (c = 0; c < NC; c++) if (old[c] !== owner[c]) moved++;
        for (c = 0; c < NC; c++) { done[c] = false; claimed[c] = -1; }
        for (k = 0; k < MAXN; k++) W[k] = { on: k < clusterN, warm: 0, chunk: -1, p: 0 };
        lay = layout('cluster', clusterN, owner); applyStatic();
        rebal = true;
        say('Rebalancing: ' + moved + ' of ' + NC + ' shards on the move. The meter keeps running.', 'bad');
        moveTo(lay.pos, 2400, function () { rebal = false; say(clusterN + ' nodes ready. Run the query again.', ''); });
      }
      function run() {
        if (running || rebal || switching) return;
        clearRun();
        var n = mode === 'cluster' ? clusterN : dial.cloud;
        for (k = 0; k < MAXN; k++) W[k] = { on: k < n, warm: mode === 'cloud' && k < n ? WARM : 0, chunk: -1, p: 0 };
        running = true; range.disabled = true;
        say(mode === 'cloud' ? n + ' workers spinning up\u2026' : n + ' nodes scanning their own shards\u2026', '');
      }
      function nextChunk(kk) {
        for (var i = 0; i < NC; i++) if (!done[i] && claimed[i] < 0 && (mode === 'cloud' || owner[i] === kk)) return i;
        return -1;
      }
      function finish() {
        running = false;
        var n = mode === 'cluster' ? clusterN : dial.cloud, t = query.t.toFixed(1) + ' s';
        if (mode === 'cluster') {
          say(n + ' nodes: ' + t + '. Slow? Add nodes and watch the data move.', '');
        } else {
          for (k = 0; k < MAXN; k++) W[k].on = false;
          if (n >= 6) { say(n + ' workers: ' + t + ' for ' + money(query.cost) + '. Now scaled to zero: $0/s.', 'good'); if (!doneFlag) { doneFlag = true; api.done(true); } }
          else say(n + ' workers: ' + t + ' for ' + money(query.cost) + '. Turn the dial up and run again.', '');
        }
      }

      /* ---------- simulation + drawing ---------- */
      function coin(i) {
        var t = S('text', { class: 'coin', x: (ncx[i] + 5).toFixed(2), y: 11, 'font-size': 4 }, '$');
        t.addEventListener('animationend', function () { t.remove(); });
        coinG.append(t);
      }
      function frame(now) {
        raf = requestAnimationFrame(frame);
        var dt = last === null ? 0 : Math.min(0.1, (now - last) / 1000); last = now;
        var rate = 0, i;
        if (running) {
          query.t += dt;
          var alive = 0;
          for (i = 0; i < MAXN; i++) {
            var w = W[i]; if (!w.on) continue;
            alive++;
            if (w.warm > 0) { w.warm -= dt; continue; }
            if (w.chunk < 0) { var nc = nextChunk(i); if (nc >= 0) { w.chunk = nc; w.p = 0; claimed[nc] = i; } }
            if (w.chunk >= 0) { w.p += dt / TC; if (w.p >= 1) { done[w.chunk] = true; w.chunk = -1; w.p = 0; } }
          }
          rate = mode === 'cloud' ? alive * RATE : 0;
          if (done.every(Boolean)) finish();
        }
        if (mode === 'cluster') rate = clusterN * RATE;
        bill += rate * dt; if (running) query.cost += rate * dt;
        for (i = 0; i < MAXN; i++) {
          var billed = W[i].on && (mode === 'cluster' ? i < clusterN : running);
          if (billed) { coinT[i] += dt; if (coinT[i] > 1) { coinT[i] = rnd() * 0.3; coin(i); } }
        }
        paint(rate);
      }
      function paint(rate) {
        var cl = mode === 'cluster', cnt = cl ? clusterN : MAXN, i;
        for (i = 0; i < MAXN; i++) {
          var w = W[i], vis = cl ? i < clusterN : true, cx = nodeX(i, cnt), st;
          ncx[i] = cx;
          if (!vis) st = 'hide';
          else if (cl) st = rebal ? 'rebal' : 'on';
          else st = i >= dial.cloud ? 'ghost' : w.on ? 'on' : 'idle';
          nodeEls[i].g.setAttribute('class', 'node ' + st + (w.on && w.warm > 0 ? ' warm' : ''));
          nodeEls[i].g.style.transform = 'translate(' + cx.toFixed(2) + 'px, 0px)';
          nodeEls[i].bar.setAttribute('width', (w.chunk >= 0 ? 10 * Math.min(1, w.p) : 0).toFixed(2));
          var ln = lineEls[i];
          if (w.on && w.chunk >= 0 && vis) {
            var p = pos[w.chunk];
            ln.setAttribute('x1', cx.toFixed(2)); ln.setAttribute('y1', 25); ln.setAttribute('x2', (p.x + p.w / 2).toFixed(2)); ln.setAttribute('y2', p.y.toFixed(2));
            ln.setAttribute('class', 'rd on');
          } else ln.setAttribute('class', 'rd');
        }
        for (i = 0; i < NC; i++) {
          var cls = 'ck' + (done[i] ? ' done' : claimed[i] >= 0 && W[claimed[i]].chunk === i ? ' busy' : '');
          if (cls !== chunkCls[i]) { chunkCls[i] = cls; chunkEls[i].setAttribute('class', cls); }
        }
        tStat.textContent = query.t.toFixed(1) + 's';
        rStat.textContent = money(rate || 0);
        rateBox.classList.toggle('burn', cl && !running && !rebal);
        bStat.textContent = money(bill);
        runBtn.disabled = running || rebal || switching;
        btnCluster.disabled = btnCloud.disabled = running || rebal || switching;
        range.disabled = running || rebal || switching;
      }

      return { destroy: function () { cancelAnimationFrame(raf); if (mv) mv.cancel(); } };
    }
  });
})(window.DB);
