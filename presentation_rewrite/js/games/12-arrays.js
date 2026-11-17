/* 12 Arrays: when the position is the key, cells need no coordinates; slices read a few chunks. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var N = 8, CS = 12, GX = 9, GY = 12, CHX = 113, BW = 40, W = 174, H = GY + N * CS + 3;
  var TOWN = { r: 2, c: 4 }, HIT = 80;
  var STOPS = [[0, [243, 240, 255]], [0.35, [208, 191, 255]], [0.62, [255, 169, 77]], [1, [224, 49, 49]]];

  function color(v) {
    var x = v / 100, i = 1;
    while (i < STOPS.length - 1 && x > STOPS[i][0]) i++;
    var a = STOPS[i - 1], b = STOPS[i], k = DB.clamp((x - a[0]) / (b[0] - a[0]), 0, 1);
    return 'rgb(' + [0, 1, 2].map(function (n) { return Math.round(DB.lerp(a[1][n], b[1][n], k)); }).join(',') + ')';
  }
  function T(cls, x, y, size, str, anchor) { return S('text', { class: cls, x: x, y: y, 'font-size': size, 'text-anchor': anchor || 'start' }, str); }

  DB.addGame('12', {
    hint: 'Slide time until the storm is over the town, then tap the town',
    mount: function (root, api) {
      var rnd = DB.rng(12), base = [], field = [], track = [];
      var t = 0, mode = 'time', sel = null, visited = [true], doneSent = false, r, c, k;

      for (r = 0; r < N; r++) { base.push([]); track.push([]); for (c = 0; c < N; c++) { base[r].push(6 + Math.floor(rnd() * 20)); track[r].push(0); } }
      for (k = 0; k < N; k++) {
        field.push([]);
        for (r = 0; r < N; r++) {
          field[k].push([]);
          for (c = 0; c < N; c++) {
            var d2 = Math.pow(r - (4 - 0.5 * k), 2) + Math.pow(c - k, 2);
            var v = Math.min(99, Math.round(base[r][c] + 75 * Math.exp(-d2 / (2 * 1.4 * 1.4))));
            field[k][r].push(v);
            if (v > track[r][c]) track[r][c] = v;
          }
        }
        visited.push(false);
      }
      visited.length = N;

      /* ---------- SVG ---------- */
      var gridG = S('g'), cells = [], i;
      for (r = 0; r < N; r++) {
        cells.push([]);
        for (c = 0; c < N; c++) {
          var cell = {
            r: r, c: c,
            rect: S('rect', { class: 'cell', x: GX + c * CS + 0.4, y: GY + r * CS + 0.4, width: CS - 0.8, height: CS - 0.8, rx: 1.2 }),
            num: T('num', GX + c * CS + CS / 2, GY + r * CS + CS / 2 + 1.9, 4.8, '', 'middle')
          };
          cell.rect.addEventListener('click', (function (cc) { return function () { pickCell(cc); }; })(cell));
          cells[r].push(cell);
          gridG.append(cell.rect);
        }
      }
      cells.forEach(function (row) { row.forEach(function (cl) { gridG.append(cl.num); }); });
      for (i = 0; i < N; i++) {
        gridG.append(T('tk', GX + i * CS + CS / 2, GY - 2.2, 3.6, String(i), 'middle'));
        gridG.append(T('tk', GX - 2, GY + i * CS + CS / 2 + 1.3, 3.6, String(i), 'end'));
      }
      gridG.append(T('axis', GX + N * CS / 2, 4.4, 3.8, 'LON', 'middle'));
      var lat = T('axis', 3.4, GY + N * CS / 2 + 1.3, 3.8, 'LAT', 'middle');
      lat.setAttribute('transform', 'rotate(-90 3.4 ' + (GY + N * CS / 2) + ')');
      gridG.append(lat);

      var dims = [], frames = [];
      for (i = 0; i < 4; i++) {
        var cx0 = GX + (i % 2) * 4 * CS, cy0 = GY + Math.floor(i / 2) * 4 * CS;
        dims.push(S('rect', { class: 'dim', x: cx0, y: cy0, width: 4 * CS, height: 4 * CS }));
        frames.push(S('rect', { class: 'frame', x: cx0, y: cy0, width: 4 * CS, height: 4 * CS, rx: 1.4 }));
      }
      var tx = GX + TOWN.c * CS, ty = GY + TOWN.r * CS;
      var town = S('g', { class: 'town' },
        S('rect', { class: 'tring', x: tx + 0.2, y: ty + 0.2, width: CS - 0.4, height: CS - 0.4, rx: 1.4 }),
        S('polygon', { class: 'house', points: [[0.9, 2.9], [2.4, 1.3], [3.9, 2.9], [3.9, 4.3], [0.9, 4.3]].map(function (p) { return (tx + p[0]).toFixed(1) + ',' + (ty + p[1]).toFixed(1); }).join(' ') }));
      var ring = S('rect', { class: 'selring hid', width: CS, height: CS, rx: 1.4 });

      var chart = S('g', { class: 'chart' }, T('axis', CHX, 7.6, 3.8, 'THE TOWN A[2, 4, t]'));
      var rowsC = [];
      for (i = 0; i < N; i++) {
        var ry = GY + i * CS;
        var bar = S('rect', { class: 'bar', x: CHX + 11, y: ry + 2.6, width: 0, height: CS - 5.2, rx: 1.2 });
        var rc = {
          bg: S('rect', { class: 'rbg', x: CHX - 2, y: ry + 0.4, width: W - CHX, height: CS - 0.8, rx: 1.6 }),
          lab: T('tk', CHX, ry + CS / 2 + 1.3, 3.8, 't' + i),
          slot: S('rect', { class: 'slt', x: CHX + 11, y: ry + 2.6, width: BW, height: CS - 5.2, rx: 1.2 }),
          q: T('tk', CHX + 14, ry + CS / 2 + 1.3, 3.8, '?'),
          bar: bar,
          val: T('rnum', CHX + 11, ry + CS / 2 + 1.5, 4.2, '')
        };
        rowsC.push(rc);
        chart.append(rc.bg, rc.lab, rc.slot, rc.q, rc.bar, rc.val);
      }
      var svg = S('svg', { class: 'cube', viewBox: '0 0 ' + W + ' ' + H }, gridG, dims, frames, town, ring, chart);

      /* ---------- panels ---------- */
      var msg = h('div', { class: 'g-msg g-grow' }, 'A storm crosses the grid. When does it hit the town?');
      var code = h('div', { class: 'g-code ro' });
      var tb = [h('i', {}), h('i', {}), h('i', {}), h('i', { class: 'val' })];
      var rowT = h('div', { class: 'nums' }, h('span', { class: 'nl' }, 'table'), tb[0], tb[1], tb[2], tb[3]);
      var arrV = h('i', { class: 'val' });
      var rowA = h('div', { class: 'nums' }, h('span', { class: 'nl' }, 'array'), h('i', { class: 'imp' }), h('i', { class: 'imp' }), h('i', { class: 'imp' }), arrV);
      var mini = [0, 1, 2, 3].map(function () { return h('i', {}); });
      var chunkTxt = h('b', {}, '0 / 4');
      var trackBtn = h('button', { class: 'g-btn alt', on: { click: toggleTrack } }, 'Storm track');
      var side = h('div', { class: 'side' },
        h('div', { class: 'g-card box' }, h('div', { class: 'g-label' }, 'Read a cell'), code),
        h('div', { class: 'g-card box' }, h('div', { class: 'g-label' }, 'Numbers stored'), rowT, rowA),
        h('div', { class: 'g-card box chk' }, h('div', {}, h('div', { class: 'g-label' }, 'Chunks read'), chunkTxt), h('div', { class: 'mini' }, mini)),
        trackBtn);
      var slider = h('input', { class: 'g-range', type: 'range', min: 0, max: N - 1, step: 1, value: 0, on: { input: onSlide } });
      var tLab = h('span', { class: 'tlab' }, 't = 0');
      root.append(h('div', { class: 'g-row' }, h('span', { class: 'g-label' }, 'Array'), msg),
        h('div', { class: 'main' }, h('div', { class: 'view' }, svg), side),
        h('div', { class: 'g-row timebar' }, h('span', { class: 'g-label' }, 'Time'), slider, tLab));

      /* ---------- behaviour ---------- */
      function stormOver() { return mode === 'time' && field[t][TOWN.r][TOWN.c] >= HIT; }
      function render() {
        var rr, cc, v, cl;
        for (rr = 0; rr < N; rr++) for (cc = 0; cc < N; cc++) {
          cl = cells[rr][cc]; v = mode === 'track' ? track[rr][cc] : field[t][rr][cc];
          cl.rect.setAttribute('fill', color(v));
          cl.num.textContent = v;
          cl.num.setAttribute('class', v >= 70 ? 'num hi' : 'num');
        }
        town.classList.toggle('storm', stormOver());
        rowsC.forEach(function (row, n) {
          var seen = visited[n] || mode === 'track', val = field[n][TOWN.r][TOWN.c];
          row.bg.classList.toggle('now', n === t && mode === 'time');
          row.q.setAttribute('class', seen ? 'tk hid' : 'tk');
          row.bar.setAttribute('width', seen ? (val / 100 * BW).toFixed(1) : 0);
          row.bar.setAttribute('fill', color(val));
          row.val.setAttribute('x', CHX + 11 + (seen ? val / 100 * BW : 0) + 1.8);
          row.val.textContent = seen ? val : '';
          row.val.setAttribute('class', 'rnum' + (val >= HIT ? ' hot' : ''));
        });
        var chunk = -1, rr2;
        if (sel) {
          rr2 = sel.r; chunk = (rr2 >= 4 ? 2 : 0) + (sel.c >= 4 ? 1 : 0);
          ring.setAttribute('x', GX + sel.c * CS); ring.setAttribute('y', GY + sel.r * CS); ring.classList.remove('hid');
          v = mode === 'track' ? track[sel.r][sel.c] : field[t][sel.r][sel.c];
          code.innerHTML = mode === 'track' ? 'max<sub>t</sub> A[<b>' + sel.r + '</b>, <b>' + sel.c + '</b>, t] = <b>' + v + '</b>'
            : 'A[<b>' + sel.r + '</b>, <b>' + sel.c + '</b>, <b>' + t + '</b>] = <b>' + v + '</b>';
          [sel.r, sel.c, mode === 'track' ? '*' : t, v].forEach(function (x, n) { tb[n].textContent = x; });
          arrV.textContent = v;
        } else {
          ring.classList.add('hid');
          code.innerHTML = 'A[ <b>?</b>, <b>?</b>, <b>' + t + '</b> ]';
          tb.forEach(function (b) { b.textContent = '-'; }); arrV.textContent = '-';
        }
        dims.forEach(function (d, n) { d.classList.toggle('on', sel !== null && n !== chunk); });
        mini.forEach(function (m, n) { m.classList.toggle('on', n === chunk); });
        chunkTxt.textContent = (sel ? 1 : 0) + ' / 4';
        tLab.textContent = mode === 'track' ? 't = all' : 't = ' + t;
      }
      function onSlide() {
        t = +slider.value; visited[t] = true;
        if (!doneSent) {
          msg.className = 'g-msg g-grow' + (stormOver() ? ' good' : '');
          msg.textContent = stormOver() ? 'The storm is over the town. Tap the town!' : 'Keep sliding. Where is the storm now?';
        }
        render();
      }
      function pickCell(cl) {
        sel = { r: cl.r, c: cl.c };
        if (!doneSent && cl.r === TOWN.r && cl.c === TOWN.c && stormOver()) {
          doneSent = true; api.done(true);
          msg.className = 'g-msg g-grow good'; msg.textContent = 'Found it: one cell, one chunk, no coordinates stored.';
          api.hint('Position is the key: slice by index, read only what you need');
        }
        render();
      }
      function toggleTrack() {
        mode = mode === 'time' ? 'track' : 'time';
        trackBtn.classList.toggle('on', mode === 'track');
        slider.disabled = mode === 'track';
        if (mode === 'track') { msg.className = 'g-msg g-grow'; msg.textContent = 'Max over all times: the storm leaves a track.'; }
        else if (!doneSent) { msg.className = 'g-msg g-grow'; msg.textContent = 'Slide time. When does the storm hit the town?'; }
        render();
      }
      render();
      return { destroy: function () {} };
    }
  });
})(window.DB);
