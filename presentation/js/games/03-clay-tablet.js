/* 03 Clay tablet: rows and columns make a ledger you can filter (WHERE what = barley), sort and total (SUM). */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var GOODS = ['barley', 'sheep', 'oil'];
  var ROWS = [
    { who: 'Ur-Nam', hue: '#F76707', what: 'barley', qty: 6 },
    { who: 'Ama', hue: '#1971C2', what: 'sheep', qty: 3 },
    { who: 'Lugal', hue: '#099268', what: 'barley', qty: 4 },
    { who: 'Dumu', hue: '#6741D9', what: 'oil', qty: 2 },
    { who: 'Ama', hue: '#1971C2', what: 'barley', qty: 5 },
    { who: 'Enki', hue: '#C2255C', what: 'sheep', qty: 7 },
    { who: 'Lugal', hue: '#099268', what: 'oil', qty: 3 },
    { who: 'Dumu', hue: '#6741D9', what: 'barley', qty: 2 }
  ];

  function glyph(kind) {
    var k = [];
    if (kind === 'barley') {
      k.push(S('path', { class: 'gl-line', d: 'M20 36 V9' }));
      [10, 16, 22, 28].forEach(function (y) {
        k.push(S('ellipse', { class: 'gl-fill gl-gold', cx: 14.5, cy: y, rx: 3, ry: 5.2, transform: 'rotate(-32 14.5 ' + y + ')' }));
        k.push(S('ellipse', { class: 'gl-fill gl-gold', cx: 25.5, cy: y, rx: 3, ry: 5.2, transform: 'rotate(32 25.5 ' + y + ')' }));
      });
      k.push(S('ellipse', { class: 'gl-fill gl-gold', cx: 20, cy: 6.5, rx: 2.8, ry: 5 }));
    } else if (kind === 'sheep') {
      [[11, 8], [16, 8], [25, 8], [30, 8]].forEach(function (p) { k.push(S('path', { class: 'gl-line', d: 'M' + (p[0] + 2) + ' 27 V35' })); });
      k.push(S('ellipse', { class: 'gl-fill gl-wool', cx: 19, cy: 22, rx: 13, ry: 9 }));
      k.push(S('circle', { class: 'gl-fill gl-dark', cx: 32.5, cy: 18, r: 4.6 }));
      k.push(S('path', { class: 'gl-line', d: 'M31 13.6 L29.6 10.4' }));
    } else {
      k.push(S('path', { class: 'gl-fill gl-olive', d: 'M15 6 H25 V11 C32 14 35 20 35 27 C35 33 29 36 20 36 C11 36 5 33 5 27 C5 20 8 14 15 11 Z' }));
      k.push(S('path', { class: 'gl-line', d: 'M13 18 C18 21 22 21 27 18' }));
      k.push(S('path', { class: 'gl-line', d: 'M13 24 C18 27 22 27 27 24' }));
    }
    return S.apply(null, ['svg', { class: 'gl', viewBox: '0 0 40 40' }].concat(k));
  }

  DB.addGame('03', {
    hint: 'Ask the tablet: how much barley is owed?',
    mount: function (root, api) {
      var timers = [], tw = null, filter = null, sortDir = 0, total = null, busy = false, order = ROWS.map(function (r, i) { return i; });

      var msg = h('div', { class: 'g-msg' }, 'How much barley is owed? Filter, then total.');
      var rowsBox = h('div', { class: 'rows' });
      var rowEls = ROWS.map(function (r, i) {
        var el = h('div', { class: 'rw' },
          h('span', { class: 'c-who' }, h('i', { class: 'av', style: { background: r.hue } }, r.who.charAt(0)), r.who),
          h('span', { class: 'c-what' }, glyph(r.what)),
          h('span', { class: 'c-qty' }, String(r.qty)));
        rowsBox.append(el);
        return el;
      });

      var sortBtn = h('button', { class: 'th c-qty sortbtn', title: 'Sort', on: { click: sortRows } }, 'How much', h('i', { class: 'arrow' }));
      var head = h('div', { class: 'th-row' }, h('span', { class: 'th' }, 'Who'), h('span', { class: 'th' }, 'What'), sortBtn);
      var totalEl = h('b', { class: 'total' }, '–');
      var sumBtn = h('button', { class: 'g-btn cat sum', on: { click: runSum } }, h('span', { class: 'sigma' }, '\u03A3'), ' Total');
      var foot = h('div', { class: 'foot' }, sumBtn, h('span', { class: 'g-grow' }), totalEl);
      var tablet = h('div', { class: 'tablet' }, head, rowsBox, foot);

      var fbs = {};
      var fbBox = h('div', { class: 'fbs' });
      GOODS.forEach(function (g) {
        fbs[g] = h('button', { class: 'fb', on: { click: function () { setFilter(filter === g ? null : g); } } }, glyph(g), h('span', {}, g));
        fbBox.append(fbs[g]);
      });
      var qWhere = h('span', { class: 'k' }, 'WHERE'), qVal = h('span', { class: 's' });
      var code = h('div', { class: 'g-code' }, h('span', { class: 'k' }, 'SUM'), '(qty)\n', qWhere, ' what = ', qVal);
      var side = h('div', { class: 'side g-card g-tint' }, h('span', { class: 'lbl' }, 'Where what ='), fbBox, code);

      root.append(h('div', { class: 'g-row' }, h('span', { class: 'g-label' }, 'Temple ledger'), h('div', { class: 'g-grow' }), msg), h('div', { class: 'main' }, tablet, side));

      function say(t, cls) { msg.className = 'g-msg' + (cls ? ' ' + cls : ''); msg.textContent = t; }
      function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
      function matches(r) { return !filter || r.what === filter; }

      function layout() {
        order.forEach(function (ri, pos) { rowEls[ri].style.setProperty('--i', pos); });
        rowEls.forEach(function (el, i) { el.classList.toggle('hit', !!filter && matches(ROWS[i])); el.classList.toggle('dim', !!filter && !matches(ROWS[i])); });
        Object.keys(fbs).forEach(function (g) { fbs[g].classList.toggle('is-on', filter === g); });
        qWhere.style.opacity = filter ? 1 : 0.3; qVal.textContent = filter ? "'" + filter + "'" : '…';
        sortBtn.classList.toggle('up', sortDir === 1); sortBtn.classList.toggle('down', sortDir === -1);
      }

      function resetTotal() {
        timers.forEach(clearTimeout); timers = []; if (tw) tw.cancel(); busy = false; sumBtn.disabled = false;
        total = null; totalEl.textContent = '–'; totalEl.classList.remove('is-final');
        rowEls.forEach(function (el) { el.classList.remove('add'); });
      }

      function setFilter(g) {
        resetTotal(); filter = g; layout();
        say(g ? 'Only ' + g + ' rows are left. Now total them.' : 'How much barley is owed? Filter, then total.');
      }

      function sortRows() {
        resetTotal();
        sortDir = sortDir === -1 ? 1 : -1;
        order = ROWS.map(function (r, i) { return i; }).sort(function (a, b) { return (ROWS[b].qty - ROWS[a].qty) * -sortDir || a - b; });
        layout();
        say(sortDir === -1 ? 'Biggest debts first.' : 'Smallest debts first.');
      }

      function runSum() {
        if (busy) return;
        resetTotal(); busy = true; sumBtn.disabled = true;
        var vis = order.filter(function (ri) { return matches(ROWS[ri]); }), run = 0;
        total = vis.reduce(function (a, ri) { return a + ROWS[ri].qty; }, 0);
        vis.forEach(function (ri, k) {
          later(function () {
            run += ROWS[ri].qty; rowEls[ri].classList.add('add');
            totalEl.textContent = String(run); totalEl.classList.remove('g-pop'); void totalEl.offsetWidth; totalEl.classList.add('g-pop');
          }, 250 + k * 330);
        });
        later(function () {
          busy = false; sumBtn.disabled = false; totalEl.classList.add('is-final');
          if (filter === 'barley') { say(total + ' barley owed. Read, filter, total: it is a table.', 'good'); api.done(true); }
          else if (filter) say(total + ' ' + filter + '. Try barley instead.', 'bad');
          else say(total + ' of everything mixed. Filter first.', 'bad');
        }, 400 + vis.length * 330);
      }

      layout();
      return { destroy: function () { timers.forEach(clearTimeout); if (tw) tw.cancel(); } };
    }
  });
})(window.DB);
