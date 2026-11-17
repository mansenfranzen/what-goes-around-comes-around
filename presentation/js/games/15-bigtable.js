/* 15 BigTable: add columns to a crawl table; a fixed-column row table fills the disk with NULLs, a wide-column store only pays for what exists. */
(function (DB) {
  var h = DB.h;
  var ROWS = ['com.apple', 'com.bbc', 'com.cnn', 'com.ebay', 'io.github', 'net.php', 'org.mozilla', 'org.wiki'];
  var NAMES = ['cnn', 'bbc', 'nyt', 'wsj', 'npr', 'vox', 'ign', 'cbs', 'abc', 'pbs', 'fox', 'dpa', 'efe'];
  var START_COLS = 6, MAX_COLS = 14, CAP = 84, SCALE = ROWS.length * MAX_COLS;

  DB.addGame('15', {
    hint: 'Add columns, then flip the layout and watch the disk',
    mount: function (root, api) {
      var rnd = DB.rng(15), mode = 'row', cols = [], fresh = null, touched = null;
      var sawFull = false, sawFit = false, solved = false;

      function sparse(name, fam, all) {
        var c = { name: name, fam: fam, cells: ROWS.map(function () { return !!all; }) };
        if (!all) {
          var n = 1 + Math.floor(rnd() * 2);
          while (n--) c.cells[Math.floor(rnd() * ROWS.length)] = true;
        }
        return c;
      }
      cols.push(sparse('html', 'contents', true));
      for (var i = 0; i < START_COLS - 1; i++) cols.push(sparse(NAMES[i], 'anchor', false));

      var msg = h('div', { class: 'g-msg' }, 'Every page gets new anchors. Add some columns.');
      var grid = h('div', { class: 'grid mode-row' });
      var usedSeg = h('div', { class: 'seg used' }), nullSeg = h('div', { class: 'seg null' });
      var fullTag = h('div', { class: 'full' }, 'FULL');
      var bar = h('div', { class: 'bar' }, nullSeg, usedSeg, h('div', { class: 'cap' }, h('span', {}, 'disk')), fullTag);
      var storedB = h('b', {}, '0'), wastedB = h('b', {}, '0');
      var gauge = h('div', { class: 'gauge' },
        h('span', { class: 'g-label' }, 'Storage'), bar,
        h('div', { class: 'g-stat' }, storedB, h('span', {}, 'cells stored')),
        h('div', { class: 'g-stat waste' }, wastedB, h('span', {}, 'wasted')));

      var rowBtn = h('button', { class: 'g-btn on', on: { click: function () { setMode('row'); } } }, 'Row table');
      var wideBtn = h('button', { class: 'g-btn alt', on: { click: function () { setMode('wide'); } } }, 'Wide-column');
      var addBtn = h('button', { class: 'g-btn', on: { click: addColumn } }, '+ New column');

      root.append(
        h('div', { class: 'g-row' }, h('span', { class: 'g-label' }, 'Web crawl table'), h('div', { class: 'g-grow' }), msg),
        h('div', { class: 'g-row g-grow body' }, h('div', { class: 'tbl' }, grid), gauge),
        h('div', { class: 'g-row g-wrap ctl' }, rowBtn, wideBtn, h('div', { class: 'g-grow' }), addBtn));

      function setMode(m) {
        mode = m; fresh = null; touched = null; render();
      }

      function addColumn() {
        if (cols.length >= MAX_COLS) return;
        cols.push(sparse(NAMES[cols.length - 1], 'anchor', false));
        fresh = cols.length - 1; touched = null; render();
      }

      function writeCell(c, r) {
        if (cols[c].cells[r]) return;
        cols[c].cells[r] = true; touched = { c: c, r: r }; fresh = null; render();
      }

      function render() {
        var n = cols.length, filled = 0, i, r;
        cols.forEach(function (c) { c.cells.forEach(function (v) { if (v) filled++; }); });
        var stored = mode === 'row' ? ROWS.length * n : filled, wasted = stored - filled;

        grid.className = 'grid mode-' + mode;
        grid.style.gridTemplateColumns = '6.4em 4.4em repeat(' + (n - 1) + ', minmax(0, 1fr))';
        grid.textContent = '';
        grid.append(h('div', { class: 'fam key' }),
          h('div', { class: 'fam f-c' }, 'contents:'),
          h('div', { class: 'fam f-a', style: { gridColumn: '3 / span ' + (n - 1) } }, 'anchor:'));
        grid.append(h('div', { class: 'hd key' }, 'row key'));
        cols.forEach(function (c, ci) { grid.append(h('div', { class: 'hd' + (ci === fresh ? ' fresh' : '') }, c.name)); });
        for (r = 0; r < ROWS.length; r++) {
          grid.append(h('div', { class: 'rk' }, ROWS[r]));
          for (i = 0; i < n; i++) grid.append(cell(i, r));
        }

        usedSeg.style.height = (filled / SCALE * 100) + '%';
        nullSeg.style.bottom = (filled / SCALE * 100) + '%';
        nullSeg.style.height = (wasted / SCALE * 100) + '%';
        storedB.textContent = stored; wastedB.textContent = wasted;
        gauge.classList.toggle('has-waste', wasted > 0);
        var over = stored > CAP;
        bar.classList.toggle('over', over);
        if (over) { fullTag.classList.remove('g-shake'); void fullTag.getBoundingClientRect(); fullTag.classList.add('g-shake'); }

        rowBtn.className = 'g-btn ' + (mode === 'row' ? 'on' : 'alt');
        wideBtn.className = 'g-btn ' + (mode === 'wide' ? 'on' : 'alt') + (sawFull && mode === 'row' && !solved ? ' g-pulse' : '');
        addBtn.disabled = n >= MAX_COLS;

        var rowTotal = ROWS.length * n;
        if (mode === 'row' && over) {
          sawFull = true;
          wideBtn.className = 'g-btn alt g-pulse';
          msg.className = 'g-msg bad'; msg.textContent = 'Disk full: ' + wasted + ' cells hold nothing but NULL.';
        } else if (mode === 'wide' && rowTotal > CAP) {
          sawFit = true;
          msg.className = 'g-msg good'; msg.textContent = 'Same data, ' + filled + ' cells. Empty means absent.';
        } else if (mode === 'row') {
          msg.className = 'g-msg'; msg.textContent = fresh !== null ? 'A new column means a NULL in every row.' : 'Every page gets new anchors. Add some columns.';
        } else {
          msg.className = 'g-msg'; msg.textContent = 'Only cells that exist are stored.';
        }
        if (sawFull && sawFit && !solved) { solved = true; api.done(true); }
      }

      function cell(c, r) {
        var on = cols[c].cells[r], cls = 'cell ' + (on ? 'f' : 'e') + (c === 0 ? ' html' : '');
        if (fresh === c) cls += ' fresh';
        if (touched && touched.c === c && touched.r === r) cls += ' pop';
        return h('button', { class: cls, 'aria-label': on ? 'value' : 'empty', on: { pointerdown: function (e) { e.preventDefault(); writeCell(c, r); } } });
      }

      bar.style.setProperty('--cap', (CAP / SCALE * 100) + '%');
      render();
      return { destroy: function () {} };
    }
  });
})(window.DB);
