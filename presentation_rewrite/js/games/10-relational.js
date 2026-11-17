/* 10 Relational: data lives once in tables, linked by matching keys; a join builds the answer, whatever the storage order. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var W = 222, H = 94, RH = 17, HEAD = 8, TOP = 15;
  var CX = 4, CW = 58, OX = 84, OW = 74, RX = 168, RW = 52;
  var KEY = { 1: '#6741D9', 2: '#F76707', 3: '#099268' };
  var CUST = [{ id: 1, name: 'Ada' }, { id: 2, name: 'Bo' }, { id: 3, name: 'Cy' }];
  var ORD = [{ id: 101, cust: 2, item: 'pen' }, { id: 102, cust: 1, item: 'ink' }, { id: 103, cust: 3, item: 'cup' }, { id: 104, cust: 1, item: 'map' }];

  DB.addGame('10', {
    hint: 'Drag each order\'s key to the customer with the same key',
    mount: function (root, api) {
      var rnd = DB.rng(10), links = 0, joined = false, usedDemo = false, drag = null, tw = null, timers = [];
      var cust = CUST.map(function (c, i) { return { id: c.id, name: c.name, slot: i, y: TOP + HEAD + i * RH }; });
      var ord = ORD.map(function (o, i) { return { id: o.id, cust: o.cust, item: o.item, slot: i, y: TOP + HEAD + i * RH, linked: false, res: null, wire: null }; });
      var ptr = { move: null, up: null };

      function txt(cls, x, y, size, str, anchor) { return S('text', { class: cls, 'font-size': size, x: x, y: y, 'text-anchor': anchor || 'start' }, str); }
      function frame(x, w, rows, title, cols) {
        var g = S('g', { class: 'tbl' },
          txt('ttl', x, TOP - 3.4, 4.2, title),
          S('rect', { class: 'th', x: x, y: TOP, width: w, height: HEAD, rx: 1.4 }));
        cols.forEach(function (c) { g.append(txt('col', x + c[0], TOP + 5.3, 3.5, c[1])); });
        g.append(S('rect', { class: 'tb', x: x, y: TOP + HEAD, width: w, height: rows * RH, rx: 1.4 }));
        return g;
      }

      var wires = S('g'), customersG = S('g'), ordersG = S('g'), resultG = S('g');
      var AY = TOP + HEAD + 2 * RH;
      var arrow = S('path', { class: 'join-arrow', d: 'M' + (OX + OW + 2) + ' ' + AY + 'H' + (RX - 4) + 'M' + (RX - 6.5) + ' ' + (AY - 2.5) + 'L' + (RX - 3.6) + ' ' + AY + 'L' + (RX - 6.5) + ' ' + (AY + 2.5) });
      var svg = S('svg', { class: 'rel', viewBox: '0 0 ' + W + ' ' + H },
        frame(CX, CW, 3, 'CUSTOMER', [[4, 'id'], [16, 'name']]),
        frame(OX, OW, 4, 'ORDER', [[4, 'id'], [17, 'customer_id'], [47, 'item']]),
        frame(RX, RW, 4, 'ANSWER', [[6.5, 'name'], [31, 'item']]),
        arrow, resultG, customersG, ordersG, wires);

      for (var i = 0; i < 4; i++) resultG.append(S('rect', { class: 'slt', x: RX + 1, y: TOP + HEAD + i * RH + 1, width: RW - 2, height: RH - 2, rx: 1.6 }));

      cust.forEach(function (c) {
        c.sock = S('circle', { class: 'sock', cx: CX + CW, cy: RH / 2, r: 2 });
        c.name$ = txt('nm', 16, RH / 2 + 1.8, 5, c.name);
        c.el = S('g', { class: 'row crow' }, S('rect', { class: 'bg', x: 0, y: 0, width: CW, height: RH, rx: 0 }),
          S('circle', { class: 'badge', cx: 7.5, cy: RH / 2, r: 4.8, fill: KEY[c.id] }), txt('bn', 7.5, RH / 2 + 1.5, 4.4, String(c.id), 'middle'),
          c.name$, c.sock);
        c.sock.addEventListener('pointerdown', function (e) { begin(e, 'c', c); });
        var chit = S('rect', { class: 'grab', x: 0, y: 0, width: CW + 4, height: RH });
        chit.addEventListener('pointerdown', function (e) { begin(e, 'c', c); });
        c.el.append(chit);
        customersG.append(c.el);
      });
      ord.forEach(function (o) {
        o.sock = S('circle', { class: 'sock', cx: 0, cy: RH / 2, r: 2 });
        var hit = S('rect', { class: 'grab', x: -4, y: 0, width: OW + 4, height: RH });
        o.el = S('g', { class: 'row orow' }, S('rect', { class: 'bg', x: 0, y: 0, width: OW, height: RH }),
          txt('oid', 4, RH / 2 + 1.6, 4.4, '#' + o.id),
          S('circle', { class: 'badge', cx: 28, cy: RH / 2, r: 4.8, fill: KEY[o.cust] }), txt('bn', 28, RH / 2 + 1.5, 4.4, String(o.cust), 'middle'),
          txt('it', 47, RH / 2 + 1.8, 5, o.item), o.sock, hit);
        o.sock.addEventListener('pointerdown', function (e) { begin(e, 'o', o); });
        hit.addEventListener('pointerdown', function (e) { begin(e, 'o', o); });
        ordersG.append(o.el);
      });
      function place() {
        cust.forEach(function (c) { c.el.setAttribute('transform', 'translate(' + CX + ' ' + c.y.toFixed(2) + ')'); });
        ord.forEach(function (o) { o.el.setAttribute('transform', 'translate(' + OX + ' ' + o.y.toFixed(2) + ')'); });
        ord.forEach(function (o) { if (o.wire) o.wire.setAttribute('d', wirePath(o)); });
      }
      function oSock(o) { return { x: OX, y: o.y + RH / 2 }; }
      function cSock(c) { return { x: CX + CW, y: c.y + RH / 2 }; }
      function curve(a, b) { var d = Math.max(8, Math.abs(a.x - b.x) * 0.5); return 'M' + a.x.toFixed(2) + ' ' + a.y.toFixed(2) + 'C' + (a.x + (a.x < b.x ? d : -d)).toFixed(2) + ' ' + a.y.toFixed(2) + ' ' + (b.x + (a.x < b.x ? -d : d)).toFixed(2) + ' ' + b.y.toFixed(2) + ' ' + b.x.toFixed(2) + ' ' + b.y.toFixed(2); }
      function wirePath(o) { var c = byId(o.cust); return curve(cSock(c), oSock(o)); }
      function byId(id) { return cust.filter(function (c) { return c.id === id; })[0]; }
      place();

      /* ---------- panels ---------- */
      var msg = h('div', { class: 'g-msg g-grow' }, 'Drag a key from an order to its customer.');
      var count = h('span', { class: 'g-label' }, '0 / 4 linked');
      var caption = h('div', { class: 'g-code cap' }, 'order.customer_id = customer.id');
      var renameBtn = h('button', { class: 'g-btn alt hid', on: { click: rename } }, 'Rename Ada');
      var shuffleBtn = h('button', { class: 'g-btn alt hid', on: { click: shuffle } }, 'Move the storage');
      root.append(h('div', { class: 'g-row' }, count, msg), svg, h('div', { class: 'g-row foot' }, caption, h('div', { class: 'g-grow' }), renameBtn, shuffleBtn));

      /* ---------- dragging a wire ---------- */
      function toSvg(e) {
        var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
        return p.matrixTransform(svg.getScreenCTM().inverse());
      }
      function begin(e, side, row) {
        e.preventDefault();
        if (drag || tw || (side === 'o' && row.linked)) return;
        if (side === 'c' && ord.every(function (o) { return o.linked || o.cust !== row.id; })) return;
        var key = side === 'o' ? row.cust : row.id;
        drag = { side: side, row: row, el: S('path', { class: 'wire drag', stroke: KEY[key] }) };
        wires.append(drag.el);
        ptr.move = onMove; ptr.up = onUp;
        window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onUp);
        onMove(e);
      }
      function onMove(e) {
        if (!drag) return;
        var p = toSvg(e), a = drag.side === 'o' ? oSock(drag.row) : cSock(drag.row);
        drag.el.setAttribute('d', curve(a, p));
      }
      function stopListening() {
        window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp);
      }
      function nearest(list, y, side) {
        var best = null;
        list.forEach(function (r) { if (Math.abs(r.y + RH / 2 - y) <= RH / 2 + 0.5) best = r; });
        return best;
      }
      function onUp(e) {
        if (!drag) return;
        stopListening();
        var p = toSvg(e), d = drag; drag = null;
        var other = d.side === 'o' ? (p.x < OX - 2 ? nearest(cust, p.y) : null) : (p.x > CX + CW + 2 && p.x < OX + OW ? nearest(ord, p.y) : null);
        if (!other) return fade(d.el);
        var o = d.side === 'o' ? d.row : other, c = d.side === 'o' ? other : d.row;
        if (o.linked) return fade(d.el);
        if (o.cust !== c.id) {
          fade(d.el);
          [o.el, c.el].forEach(function (el) { el.classList.remove('bad'); void el.getBoundingClientRect(); el.classList.add('bad'); });
          msg.className = 'g-msg g-grow bad'; msg.textContent = 'Keys differ (' + o.cust + ' vs ' + c.id + '). Try again.';
          return;
        }
        d.el.remove();
        link(o, c);
      }
      function fade(el) { el.classList.add('gone'); timers.push(setTimeout(function () { el.remove(); }, 300)); }

      function link(o, c) {
        o.linked = true; links++;
        o.wire = S('path', { class: 'wire done', stroke: KEY[o.cust], pathLength: 1, d: wirePath(o) });
        wires.append(o.wire);
        o.el.classList.add('linked');
        var r = S('g', { class: 'res' },
          S('rect', { class: 'bg', x: 1, y: 1, width: RW - 2, height: RH - 2, rx: 1.6 }),
          S('rect', { class: 'stripe', x: 1, y: 1, width: 2.4, height: RH - 2, fill: KEY[o.cust] }),
          o.rname = txt('nm', 6.5, RH / 2 + 1.8, 5, c.name), txt('it', 31, RH / 2 + 1.8, 5, o.item));
        resultG.append(S('g', { transform: 'translate(' + RX + ' ' + (TOP + HEAD + ord.indexOf(o) * RH) + ')' }, r)); o.res = r;
        count.textContent = links + ' / 4 linked';
        msg.className = 'g-msg g-grow'; msg.textContent = links < 4 ? 'Linked. The answer row appeared by itself.' : '';
        caption.classList.add('on');
        if (links === 4) complete();
      }

      function complete() {
        joined = true;
        arrow.classList.add('on');
        msg.className = 'g-msg g-grow good'; msg.textContent = 'Joined! Ada is stored once, yet appears twice.';
        renameBtn.classList.remove('hid'); shuffleBtn.classList.remove('hid');
        renameBtn.classList.add('g-pop'); shuffleBtn.classList.add('g-pop');
        api.hint('Now change the data or its storage: the answer follows');
      }

      function demoDone() {
        if (usedDemo) return;
        usedDemo = true; api.done(true);
        api.hint('Programs should never break when storage changes');
      }

      function rename() {
        if (!joined) return;
        var c = byId(1);
        c.name = c.name === 'Ada' ? 'Ada L.' : 'Ada';
        c.name$.textContent = c.name;
        ord.forEach(function (o) {
          if (o.cust !== 1) return;
          o.rname.textContent = c.name;
          o.res.classList.remove('flash'); void o.res.getBoundingClientRect(); o.res.classList.add('flash');
        });
        c.el.classList.remove('flash'); void c.el.getBoundingClientRect(); c.el.classList.add('flash');
        msg.className = 'g-msg g-grow good'; msg.textContent = 'One change in one place: every answer row follows.';
        demoDone();
      }

      function shuffle() {
        if (!joined || tw) return;
        function perm(n) {
          var a = [], i;
          for (i = 0; i < n; i++) a.push(i);
          for (i = n - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
          return a;
        }
        var pc = perm(cust.length), po = perm(ord.length);
        var from = cust.concat(ord).map(function (r) { return r.y; });
        cust.forEach(function (c, i) { c.slot = pc[i]; });
        ord.forEach(function (o, i) { o.slot = po[i]; });
        var to = cust.concat(ord).map(function (r) { return TOP + HEAD + r.slot * RH; });
        msg.className = 'g-msg g-grow'; msg.textContent = 'Rows moved on disk...';
        tw = DB.tween({
          from: from, to: to, ms: 900, onUpdate: function (v) {
            cust.concat(ord).forEach(function (r, i) { r.y = v[i]; });
            place();
          }, onDone: function () {
            tw = null;
            msg.className = 'g-msg g-grow good'; msg.textContent = 'Storage moved, same answer. No program broke.';
            demoDone();
          }
        });
      }

      return { destroy: function () { stopListening(); if (tw) tw.cancel(); timers.forEach(clearTimeout); } };
    }
  });
})(window.DB);
