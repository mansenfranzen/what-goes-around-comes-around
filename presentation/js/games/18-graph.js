/* 18 Graph: slide the hops to reach the star through friends of friends; compare edges followed with a chain of joins over the whole friend table. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var W = 140, H = 120, COLS = 8, ROWS = 7, MAX_HOPS = 4;
  var STAR = 'M0 -4.6L1.3 -1.5L4.6 -1.4L2 0.7L2.9 3.9L0 2.1L-2.9 3.9L-2 0.7L-4.6 -1.4L-1.3 -1.5Z';

  DB.addGame('18', {
    hint: 'Slide the hops: reach the star, compare joins with edges',
    mount: function (root, api) {
      var rnd = DB.rng(18), nodes = [], edges = [], adj = [], i, c, r;
      var cw = W / COLS, rh = H / ROWS;

      for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) {
        nodes.push({ x: cw * (c + 0.5) + (rnd() - 0.5) * cw * 0.5, y: rh * (r + 0.5) + (rnd() - 0.5) * rh * 0.5, c: c, r: r });
        adj.push([]);
      }
      function link(a, b) {
        if (a === b || adj[a].indexOf(b) >= 0) return;
        adj[a].push(b); adj[b].push(a); edges.push({ a: a, b: b });
      }
      function at(c, r) { return c >= 0 && c < COLS && r >= 0 && r < ROWS ? r * COLS + c : -1; }
      for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) {
        i = at(c, r);
        if (at(c + 1, r) >= 0 && rnd() < 0.78) link(i, at(c + 1, r));
        if (at(c, r + 1) >= 0 && rnd() < 0.72) link(i, at(c, r + 1));
        if (at(c + 1, r + 1) >= 0 && rnd() < 0.28) link(i, at(c + 1, r + 1));
        if (at(c + 1, r - 1) >= 0 && rnd() < 0.2) link(i, at(c + 1, r - 1));
        if (at(c + 2, r + 1) >= 0 && rnd() < 0.05) link(i, at(c + 2, r + 1));
      }
      nodes.forEach(function (n, k) {
        if (adj[k].length) return;
        link(k, at(n.c + 1, n.r) >= 0 ? at(n.c + 1, n.r) : at(n.c - 1, n.r));
      });

      function bfs(s) {
        var d = nodes.map(function () { return 99; }), q = [s], k;
        d[s] = 0;
        for (k = 0; k < q.length; k++) adj[q[k]].forEach(function (m) { if (d[m] === 99) { d[m] = d[q[k]] + 1; q.push(m); } });
        return d;
      }

      var start = at(2, 3), star = -1, dist = bfs(start), hops = 1, solved = false;
      nodes.forEach(function (n, k) { if (dist[k] === 3 && (star < 0 || n.c > nodes[star].c)) star = k; });
      var rows = edges.length * 2, maxCost = MAX_HOPS * rows;

      var msg = h('div', { class: 'g-msg' }, 'Slide the hops until the star lights up.');
      var gE = S('g'), gN = S('g'), edgeEls = [], nodeEls = [];
      edges.forEach(function (e) {
        var el = S('line', { class: 'edge', x1: nodes[e.a].x.toFixed(2), y1: nodes[e.a].y.toFixed(2), x2: nodes[e.b].x.toFixed(2), y2: nodes[e.b].y.toFixed(2) });
        edgeEls.push(el); gE.append(el);
      });
      nodes.forEach(function (n, k) {
        var el = S('circle', { class: 'node', cx: n.x.toFixed(2), cy: n.y.toFixed(2), r: 2.7 });
        el.addEventListener('pointerdown', function (ev) { ev.preventDefault(); setStart(k); });
        nodeEls.push(el); gN.append(el);
      });
      var starG = S('g', { class: 'star' }, S('circle', { class: 'ring', r: 4.6 }), S('path', { d: STAR }));
      starG.setAttribute('transform', 'translate(' + nodes[star].x.toFixed(2) + ' ' + nodes[star].y.toFixed(2) + ')');
      var youG = S('g', { class: 'you' }, S('circle', { class: 'ring', r: 4.3 }), S('text', { class: 'yt', y: -6.2, 'text-anchor': 'middle', 'font-size': 4 }, 'YOU'));
      var scene = S('svg', { viewBox: '0 0 ' + W + ' ' + H }, gE, gN, starG, youG);

      var nSpan = h('span', { class: 'n' }, '1');
      var joinCode = h('div', { class: 'g-code' }), graphCode = h('div', { class: 'g-code' }, 'MATCH (me)-[:FRIEND*1..', nSpan, ']->(x)');
      var joinNum = h('b', {}, '0'), graphNum = h('b', {}, '0'), ratioB = h('b', {}, '1');
      var joinFill = h('i', { class: 'fill' }), graphFill = h('i', { class: 'fill' });
      var range = h('input', { class: 'g-range', type: 'range', min: 1, max: MAX_HOPS, step: 1, value: hops, on: { input: onRange } });
      var hopB = h('b', { class: 'hv' }, '1');

      root.append(
        h('div', { class: 'g-row' }, h('span', { class: 'g-label' }, 'Friends of friends'), h('div', { class: 'g-grow' }), msg),
        h('div', { class: 'g-row g-grow body' },
          h('div', { class: 'net' }, scene),
          h('div', { class: 'side' },
            h('div', { class: 'blk join' }, h('div', { class: 'top' }, h('span', { class: 'g-label' }, 'Joins: rows scanned'), joinNum), joinCode, h('div', { class: 'trk' }, joinFill)),
            h('div', { class: 'g-stat ratio' }, ratioB, h('span', {}, 'times less work')),
            h('div', { class: 'blk graph' }, h('div', { class: 'top' }, h('span', { class: 'g-label' }, 'Graph: edges followed'), graphNum), graphCode, h('div', { class: 'trk' }, graphFill)))),
        h('div', { class: 'g-row ctl' }, h('span', { class: 'g-label' }, 'Hops'), range, hopB));

      function onRange() { hops = Number(range.value); update(); }

      function setStart(k) {
        if (k === star || k === start) return;
        start = k; dist = bfs(start); update();
      }

      function update() {
        var cost = 0, lit = dist[star] <= hops;
        nodeEls.forEach(function (el, k) {
          var d = dist[k];
          el.setAttribute('class', 'node ' + (d <= hops ? 'd' + d : 'dx'));
          el.style.transitionDelay = (d <= hops ? d * 0.09 : 0) + 's';
          if (d < hops) cost += adj[k].length;
        });
        edges.forEach(function (e, k) {
          var da = dist[e.a], db = dist[e.b], on = Math.min(da, db) < hops && Math.max(da, db) <= hops;
          edgeEls[k].setAttribute('class', 'edge' + (on ? ' on' : ''));
        });
        youG.setAttribute('transform', 'translate(' + nodes[start].x.toFixed(2) + ' ' + nodes[start].y.toFixed(2) + ')');
        starG.setAttribute('class', 'star' + (lit ? ' got' : ''));
        hopB.textContent = hops; nSpan.textContent = hops;
        var lines = ['FROM friend f1'];
        for (var j = 2; j <= hops; j++) lines.push('JOIN friend f' + j + ' ON f' + j + '.a=f' + (j - 1) + '.b');
        joinCode.textContent = lines.join('\n');
        var jc = hops * rows;
        joinNum.textContent = jc; graphNum.textContent = cost;
        ratioB.textContent = Math.max(1, Math.round(jc / cost));
        joinFill.style.width = (jc / maxCost * 100) + '%'; graphFill.style.width = Math.max(1.5, cost / maxCost * 100) + '%';
        if (lit && dist[star] < 99) {
          msg.className = 'g-msg good'; msg.textContent = 'Star reached: ' + cost + ' edges, but ' + jc + ' rows by joins.';
          if (hops >= 3 && !solved) { solved = true; api.done(true); }
        } else {
          msg.className = 'g-msg'; msg.textContent = 'Slide the hops until the star lights up.';
        }
      }

      update();
      return { destroy: function () {} };
    }
  });
})(window.DB);
