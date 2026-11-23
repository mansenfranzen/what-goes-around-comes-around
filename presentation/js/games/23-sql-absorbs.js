/* 23 SQL absorbs: every challenger that "will replace SQL" ends up as a type, index or clause inside it. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var CH = [
    { id: '19', sql: 'doc JSONB', msg: 'Document store: now a JSON column.' },
    { id: '17', sql: 'INDEX USING hash', msg: 'Key-value store: now a hash index.' },
    { id: '18', sql: 'MATCH (a)-[e]->(b)', msg: 'Graph database: now a MATCH clause.' },
    { id: '16', sql: 'USING columnar', msg: 'Column store: now a table storage option.' },
    { id: '12', sql: 'tags INT[]', msg: 'Array database: now an ARRAY type.' },
    { id: '22', sql: 'emb VECTOR(3)', msg: 'Vector database: now a column type and index.' },
    { id: '14', sql: 'GROUP BY word', msg: 'MapReduce: now a parallel GROUP BY.' },
    { id: '13', sql: 'CREATE TYPE addr', msg: 'Object database: now a user-defined type.' },
    { id: '15', sql: 'PARTITION BY HASH', msg: 'NoSQL and distributed SQL can both route records by key.' },
    { id: '21', sql: "FROM 's3://lake'", msg: 'Cloud data lake: now a table over object storage.' }
  ];
  var FINAL = 'Nothing replaced SQL, but everything changed inside it.';

  function icon(id) { return h('img', { src: DB.symbolURL(DB.byId(id)), alt: '', draggable: false }); }

  DB.addGame('23', {
    hint: 'Drag every challenger into the SQL core',
    mount: function (root, api) {
      var count = 0, nextSlot = 0, timers = [], toks = [], slots = [], i;

      var msg = h('div', { class: 'g-msg msg' }, 'Each one was going to replace SQL. Drag it in.');
      var counter = h('span', { class: 'sqn' }, '0 / ' + CH.length);
      var slotBox = h('div', { class: 'slots' });
      for (i = 0; i < CH.length; i++) { var sl = h('div', { class: 'slt' }); slots.push(sl); slotBox.append(sl); }
      var sq = h('div', { class: 'sq' },
        h('div', { class: 'sqh' }, h('img', { class: 'sqi', src: DB.symbolURL(DB.byId('23')), alt: '', draggable: false }), h('span', { class: 'sqt' }, 'SQL'), counter),
        slotBox);

      var colL = h('div', { class: 'tkc' }), colR = h('div', { class: 'tkc' });
      CH.forEach(function (c, n) {
        var check = S('svg', { class: 'tkv', viewBox: '0 0 10 10' }, S('circle', { cx: 5, cy: 5, r: 5 }), S('path', { d: 'M2.6 5.2l1.7 1.7 3.1-3.5' }));
        var el = h('div', { class: 'tk' }, icon(c.id), h('span', { class: 'tl' }, DB.byId(c.id).short), check);
        el.style.setProperty('--d', (n % 5) * -.5 + 's');
        toks.push({ el: el, done: false, busy: false });
        (n < 5 ? colL : colR).append(el);
      });
      var arena = h('div', { class: 'arena' }, colL, sq, colR);
      root.append(h('div', { class: 'g-row' }, msg), arena);

      toks.forEach(bind);

      /* ---------- helpers ---------- */
      function say(t, cls) { msg.className = 'g-msg msg' + (cls ? ' ' + cls : ''); msg.textContent = t; }
      function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
      function fs() { return parseFloat(getComputedStyle(arena).fontSize) || 16; }
      function rel(r) { var a = arena.getBoundingClientRect(); return { x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height, cx: r.left - a.left + r.width / 2, cy: r.top - a.top + r.height / 2 }; }
      function place(g, x, y) { var f = fs(); g.style.left = (x / f).toFixed(3) + 'em'; g.style.top = (y / f).toFixed(3) + 'em'; }
      function over(e) {
        var r = sq.getBoundingClientRect(), m = fs() * .6;
        return e.clientX > r.left - m && e.clientX < r.right + m && e.clientY > r.top - m && e.clientY < r.bottom + m;
      }
      function makeGhost(i) {
        var t = toks[i], r = rel(t.el.getBoundingClientRect()), f = fs();
        var g = h('div', { class: 'tk gh' }, icon(CH[i].id), h('span', { class: 'tl' }, DB.byId(CH[i].id).short));
        g.style.width = (r.w / f).toFixed(3) + 'em'; g.style.height = (r.h / f).toFixed(3) + 'em';
        place(g, r.x, r.y);
        arena.append(g);
        t.el.classList.add('lift');
        return { el: g, w: r.w, h: r.h, x: r.x, y: r.y };
      }

      function springBack(i, g) {
        g.el.classList.add('fly');
        void g.el.offsetWidth;
        place(g.el, g.x, g.y);
        later(function () { g.el.remove(); toks[i].el.classList.remove('lift'); toks[i].busy = false; }, 380);
      }

      function absorb(i, g) {
        var t = toks[i];
        t.busy = true;
        if (!g) g = makeGhost(i);
        var slot = slots[nextSlot++], r = rel(slot.getBoundingClientRect());
        g.el.classList.add('fly');
        void g.el.offsetWidth;
        place(g.el, r.cx - g.w / 2, r.cy - g.h / 2);
        g.el.style.transform = 'scale(.4)';
        g.el.style.opacity = '.15';
        later(function () {
          g.el.remove();
          var feat = h('div', { class: 'feat g-pop' }, icon(CH[i].id), h('code', {}, CH[i].sql));
          slot.classList.add('fill'); slot.append(feat);
          t.el.classList.remove('lift'); t.el.classList.add('gone');
          t.done = true; t.busy = false; count++;
          counter.textContent = count + ' / ' + CH.length;
          sq.classList.remove('gulp'); void sq.offsetWidth; sq.classList.add('gulp');
          if (count === CH.length) {
            sq.classList.add('full');
            say(FINAL, 'good');
            api.done(true);
          } else say(CH[i].msg);
        }, 460);
      }

      function bind(t, i) {
        var st = null;
        t.el.addEventListener('pointerdown', function (e) {
          if (t.done || t.busy) return;
          e.preventDefault();
          try { t.el.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointer */ }
          var r = t.el.getBoundingClientRect();
          st = { x0: e.clientX, y0: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, g: null };
        });
        t.el.addEventListener('pointermove', function (e) {
          if (!st) return;
          if (!st.g) {
            if (Math.abs(e.clientX - st.x0) + Math.abs(e.clientY - st.y0) < 6) return;
            st.g = makeGhost(i);
          }
          var a = arena.getBoundingClientRect();
          place(st.g.el, e.clientX - st.dx - a.left, e.clientY - st.dy - a.top);
          sq.classList.toggle('hot', over(e));
        });
        function end(e, cancel) {
          if (!st) return;
          var s = st; st = null;
          sq.classList.remove('hot');
          if (!s.g) { if (!cancel) absorb(i, null); return; }
          if (!cancel && over(e)) absorb(i, s.g); else springBack(i, s.g);
        }
        t.el.addEventListener('pointerup', function (e) { end(e, false); });
        t.el.addEventListener('pointercancel', function (e) { end(e, true); });
      }

      return { destroy: function () { timers.forEach(clearTimeout); timers = []; } };
    }
  });
})(window.DB);
