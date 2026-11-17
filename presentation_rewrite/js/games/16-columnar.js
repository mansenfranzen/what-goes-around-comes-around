/* 16 Columnar: sum one column in a row store (every row is a disk page) and in a column store (one page), counting the cells read. */
(function (DB) {
  var h = DB.h;
  var HEAD = ['id', 'name', 'price', 'qty', 'country', 'date'], PRICE = 2, N = 10, ALL = N * HEAD.length;

  DB.addGame('16', {
    hint: 'Sum the prices: tap to read from disk, in each layout',
    mount: function (root, api) {
      var rnd = DB.rng(16), mode = 'row', hover = null, solved = false;
      var prices = [], widths = [], total = 0, r, c;
      for (r = 0; r < N; r++) {
        prices.push(5 + Math.floor(rnd() * 40)); total += prices[r]; widths.push([]);
        for (c = 0; c < HEAD.length; c++) widths[r].push(38 + Math.floor(rnd() * 46));
      }
      var readRows, readCols, cells, sum, got, finished, result = { row: 0, col: 0 };

      var msg = h('div', { class: 'g-msg' });
      var sumB = h('b', {}, '–'), cellsB = h('b', {}, '0');
      var grid = h('div', { class: 'grid' }), headEls = [], cellEls = [];
      HEAD.forEach(function (t, ci) {
        var el = h('div', { class: 'hd', data: { r: -1, c: ci } }, t); headEls.push(el); grid.append(el);
      });
      for (r = 0; r < N; r++) {
        cellEls.push([]);
        for (c = 0; c < HEAD.length; c++) {
          var el = h('div', { class: 'cell', data: { r: r, c: c } },
            c === PRICE ? h('b', { class: 'v' }, String(prices[r])) : h('i', { class: 'ln', style: { width: widths[r][c] + '%' } }));
          cellEls[r].push(el); grid.append(el);
        }
      }
      grid.addEventListener('pointerdown', function (e) { var t = target(e); if (t) { e.preventDefault(); hover = t; read(t); } });
      grid.addEventListener('pointerover', function (e) { var t = target(e); hover = t; paint(); });
      grid.addEventListener('pointerleave', function () { hover = null; paint(); });

      var cmpRow = bar('Row store'), cmpCol = bar('Column store');
      var rowBtn = h('button', { class: 'g-btn on', on: { click: function () { setMode('row'); } } }, h('i', { class: 'ico rows' }), 'Row store');
      var colBtn = h('button', { class: 'g-btn alt', on: { click: function () { setMode('col'); } } }, h('i', { class: 'ico cols' }), 'Column store');
      var againBtn = h('button', { class: 'g-btn alt', on: { click: function () { newQuery(); } } }, 'Again');

      root.append(
        h('div', { class: 'g-row' }, h('div', { class: 'g-code' }, 'SELECT SUM(price) FROM sales'), h('div', { class: 'g-grow' }), msg),
        h('div', { class: 'g-row g-grow body' },
          h('div', { class: 'tbl' }, grid),
          h('div', { class: 'side' },
            h('div', { class: 'g-stat' }, sumB, h('span', {}, 'sum so far')),
            h('div', { class: 'g-stat cells' }, cellsB, h('span', {}, 'cells read')),
            h('div', { class: 'cmp' }, h('span', { class: 'g-label' }, 'Cells read to finish'), cmpRow.el, cmpCol.el))),
        h('div', { class: 'g-row ctl' }, rowBtn, colBtn, h('div', { class: 'g-grow' }), againBtn));

      function bar(name) {
        var fill = h('i', { class: 'fill' }), val = h('b', {}, '–');
        return { fill: fill, val: val, el: h('div', { class: 'cb' }, h('span', { class: 'nm' }, name), h('div', { class: 'trk' }, fill), val) };
      }

      function target(e) {
        var el = e.target.closest && e.target.closest('.cell, .hd');
        return el ? { r: Number(el.dataset.r), c: Number(el.dataset.c) } : null;
      }

      function newQuery() {
        readRows = []; readCols = []; cells = 0; sum = 0; got = 0; finished = false;
        msg.className = 'g-msg';
        msg.textContent = mode === 'row' ? 'Each row is one disk page. Tap a row to read it.' : 'Each column is one disk page. Tap the one you need.';
        paint();
      }

      function setMode(m) { mode = m; hover = null; newQuery(); }

      function read(t) {
        if (finished) return;
        if (mode === 'row') {
          if (t.r < 0 || readRows[t.r]) return;
          readRows[t.r] = true; cells += HEAD.length; sum += prices[t.r]; got++;
          if (got === N) complete();
        } else {
          if (readCols[t.c]) return;
          readCols[t.c] = true; cells += N;
          if (t.c === PRICE) { sum = total; got = N; complete(); }
          else { msg.className = 'g-msg bad'; msg.textContent = 'Wrong column: ' + N + ' cells wasted.'; }
        }
        paint();
      }

      function complete() {
        finished = true; result[mode] = cells;
        msg.className = 'g-msg good';
        msg.textContent = 'SUM = ' + total + ', but ' + cells + ' cells came off the disk.';
        if (mode === 'col') msg.textContent = 'SUM = ' + total + ' from just ' + cells + ' cells.';
        if (result.row && result.col && !solved) {
          solved = true; api.done(true);
          msg.textContent = result.row + ' cells vs ' + result.col + ': same SQL, same answer.';
        }
      }

      function paint() {
        var r, c, rd, cls;
        for (r = 0; r < N; r++) for (c = 0; c < HEAD.length; c++) {
          rd = mode === 'row' ? !!readRows[r] : !!readCols[c];
          cls = 'cell' + (c === PRICE ? ' tgt' : '') + (rd ? (c === PRICE ? ' got' : ' waste') : '');
          if (hover && !finished && (mode === 'row' ? hover.r === r : hover.c === c)) cls += ' hv';
          cellEls[r][c].className = cls;
        }
        for (c = 0; c < HEAD.length; c++) {
          cls = 'hd' + (c === PRICE ? ' tgt' : '') + (mode === 'col' && readCols[c] ? ' on' : '');
          if (hover && !finished && mode === 'col' && hover.c === c) cls += ' hv';
          headEls[c].className = cls;
        }
        grid.className = 'grid ' + mode;
        sumB.textContent = got ? sum : '–'; cellsB.textContent = cells;
        rowBtn.className = 'g-btn ' + (mode === 'row' ? 'on' : 'alt');
        colBtn.className = 'g-btn ' + (mode === 'col' ? 'on' : 'alt') + (finished && mode === 'row' && !result.col ? ' g-pulse' : '');
        [[cmpRow, result.row], [cmpCol, result.col]].forEach(function (p) {
          p[0].fill.style.width = (p[1] / ALL * 100) + '%'; p[0].val.textContent = p[1] || '–';
        });
      }

      setMode('row');
      return { destroy: function () {} };
    }
  });
})(window.DB);
