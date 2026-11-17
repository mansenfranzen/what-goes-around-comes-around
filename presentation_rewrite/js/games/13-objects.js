/* 13 Objects: save() shreds one object into rows and load() glues it back; an object store keeps it whole. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var W = 232, H = 108, ZY = 12, ZH = 92;
  var MEMX = 2, MEMW = 60, TABX = 68, TABW = 90, STOX = 164, STOW = 66;
  var HOME = { x: 6, y: 28 }, STORE = { x: 171, y: 28 };
  var TX = 72, TW = 82, RH = 9.5, HD = 6.5;
  var COL = { c: ['#6741D9', '#E9E0FF'], o: ['#F76707', '#FFE8CC'], i: ['#099268', '#D3F9E8'] };
  var TABLES = [
    { name: 'customer', cols: ['id', 'name'], y: 17, rows: 1 },
    { name: 'order', cols: ['id', 'customer_id'], y: 40, rows: 1 },
    { name: 'item', cols: ['order_id', 'name'], y: 63, rows: 2 }
  ];
  var PIECES = [
    { col: COL.c, lr: { x: 0, y: 0, w: 52, h: 64 }, ry: 23.5, o: [['Customer', 3.5, 7, 4.8], ['name: Ada', 3.5, 13.4, 3.8]], r: [['1', 3, 6.4], ['Ada', 26, 6.4]] },
    { col: COL.o, lr: { x: 4, y: 18, w: 44, h: 42 }, ry: 46.5, o: [['orders[0]', 3.5, 7, 4.4], ['', 0, 0, 4]], r: [['1', 3, 6.4], ['1', 26, 6.4]] },
    { col: COL.i, lr: { x: 8, y: 31, w: 36, h: 12 }, ry: 69.5, o: [['pen', 3.5, 8.2, 4.6], ['', 0, 0, 4]], r: [['1', 3, 6.4], ['pen', 26, 6.4]] },
    { col: COL.i, lr: { x: 8, y: 46, w: 36, h: 12 }, ry: 79, o: [['ink', 3.5, 8.2, 4.6], ['', 0, 0, 4]], r: [['1', 3, 6.4], ['ink', 26, 6.4]] }
  ];

  function T(cls, x, y, size, str, anchor) { return S('text', { class: cls, x: x, y: y, 'font-size': size, 'text-anchor': anchor || 'start' }, str); }

  DB.addGame('13', {
    hint: 'Drag the object into the tables',
    mount: function (root, api) {
      var ox = HOME.x, oy = HOME.y, state = 'fresh', unlocked = false, drag = null, busy = false, tweens = [], timers = [];

      /* ---------- zones ---------- */
      function zone(cls, x, w, title) {
        return S('g', { class: 'zone ' + cls }, S('rect', { class: 'zr', x: x, y: ZY, width: w, height: ZH, rx: 3 }), T('zt', x + w / 2, 8.4, 4, title, 'middle'));
      }
      var zMem = zone('mem', MEMX, MEMW, 'IN MEMORY'), zTab = zone('tab', TABX, TABW, 'TABLES'), zSto = zone('sto locked', STOX, STOW, 'OBJECT STORE');
      var ghost = S('rect', { class: 'ghost hid', x: HOME.x, y: HOME.y, width: 52, height: 64, rx: 3 });

      var tabG = S('g');
      TABLES.forEach(function (t) {
        tabG.append(T('tn', TX, t.y - 1.4, 3.6, t.name),
          S('rect', { class: 'th', x: TX, y: t.y, width: TW, height: HD, rx: 1.2 }),
          T('tc', TX + 3, t.y + 4.6, 3.4, t.cols[0]), T('tc', TX + 26, t.y + 4.6, 3.4, t.cols[1]));
        for (var i = 0; i < t.rows; i++) tabG.append(S('rect', { class: 'rs', x: TX, y: t.y + HD + i * RH, width: TW, height: RH, rx: 0.8 }));
      });
      var joins = S('g', { class: 'joins' });
      function joinPath(y1, y2, side) {
        var x = side === 'l' ? TX : TX + TW, dx = side === 'l' ? -4.5 : 4.5;
        return S('path', { class: 'jn', d: 'M' + x + ' ' + y1 + 'C' + (x + dx) + ' ' + y1 + ' ' + (x + dx) + ' ' + y2 + ' ' + x + ' ' + y2 });
      }
      joins.append(joinPath(51.2, 28.2, 'l'), joinPath(74.2, 51.2, 'r'), joinPath(83.7, 51.2, 'r'));
      var tn1 = T('note', TX, 96.6, 3.8, ''), tn2 = T('note bad', TX, 102, 3.8, '');
      var sn1 = T('note', STOX + STOW / 2, 96.6, 3.8, '', 'middle'), sn2 = T('note good', STOX + STOW / 2, 102, 3.8, '', 'middle');

      var lock = S('g', { class: 'lock' },
        S('path', { class: 'shk', d: 'M193.4 54V50.4a3.6 3.6 0 0 1 7.2 0V54' }),
        S('rect', { class: 'lbody', x: 190.5, y: 54, width: 13, height: 10, rx: 1.6 }),
        T('note', STOX + STOW / 2, 72, 3.6, 'try tables first', 'middle'));

      var pcs = PIECES.map(function (d, i) {
        var p = { d: d, mode: 'obj', cur: null };
        p.rect = S('rect', { class: 'pc', rx: 2.2, fill: d.col[1], stroke: d.col[0] });
        p.t1 = S('text', { class: 'pt', 'font-weight': 800 }); p.t2 = S('text', { class: 'pt mono' });
        p.g = S('g', { class: 'piece' }, p.rect, p.t1, p.t2);
        p.rect.addEventListener('pointerdown', grab);
        return p;
      });
      var rowsG = S('g', { class: 'hid' });
      PIECES.forEach(function (d) {
        var r = { x: TX + 0.6, y: d.ry + 0.6, w: TW - 1.2, h: RH - 1.2 };
        rowsG.append(S('rect', { class: 'pc row', rx: 2.2, fill: d.col[1], stroke: d.col[0], x: r.x, y: r.y, width: r.w, height: r.h }),
          T('pt', r.x + d.r[0][1], r.y + d.r[0][2], 4, d.r[0][0]), T('pt mono', r.x + d.r[1][1], r.y + d.r[1][2], 4, d.r[1][0]));
      });
      var objG = S('g', { class: 'obj' }, pcs.map(function (p) { return p.g; }));

      var svg = S('svg', { class: 'world', viewBox: '0 0 ' + W + ' ' + H }, zMem, zTab, zSto, tabG, rowsG, joins, ghost, lock, tn1, tn2, sn1, sn2, objG);

      /* ---------- panels ---------- */
      var msg = h('div', { class: 'g-msg g-grow' }, 'Ada lives in memory as one object. Save her.');
      var code = h('div', { class: 'g-code cap' }, 'ada = new Customer("Ada")');
      var loadBtn = h('button', { class: 'g-btn cat hid', on: { click: load } }, 'load()');
      root.append(h('div', { class: 'g-row' }, h('span', { class: 'g-label' }, 'Object'), msg), svg, h('div', { class: 'g-row foot' }, code, h('div', { class: 'g-grow' }), loadBtn));

      /* ---------- drawing ---------- */
      function objRect(p) { var l = p.d.lr; return { x: ox + l.x, y: oy + l.y, w: l.w, h: l.h }; }
      function rowRect(p) { return { x: TX + 0.6, y: p.d.ry + 0.6, w: TW - 1.2, h: RH - 1.2 }; }
      function draw(p) {
        var r = p.cur, cfg = p.mode === 'obj' ? p.d.o : p.d.r;
        p.rect.setAttribute('x', r.x.toFixed(2)); p.rect.setAttribute('y', r.y.toFixed(2));
        p.rect.setAttribute('width', r.w.toFixed(2)); p.rect.setAttribute('height', r.h.toFixed(2));
        [p.t1, p.t2].forEach(function (t, n) {
          var c = cfg[n];
          t.setAttribute('x', (r.x + c[1]).toFixed(2)); t.setAttribute('y', (r.y + c[2]).toFixed(2));
          t.setAttribute('font-size', p.mode === 'obj' ? c[3] : 4);
        });
      }
      function setMode(p, mode) {
        p.mode = mode;
        var cfg = mode === 'obj' ? p.d.o : p.d.r;
        p.t1.textContent = cfg[0][0]; p.t2.textContent = cfg[1][0];
        p.rect.classList.toggle('row', mode === 'row');
        if (p.cur) draw(p);
      }
      function place() { pcs.forEach(function (p) { p.cur = objRect(p); draw(p); }); }
      pcs.forEach(function (p) { setMode(p, 'obj'); });
      place();

      function fly(p, to, ms, delay, onEnd) {
        var from = p.cur;
        var id = setTimeout(function () {
          tweens.push(DB.tween({
            from: [from.x, from.y, from.w, from.h], to: [to.x, to.y, to.w, to.h], ms: ms,
            onUpdate: function (v) { p.cur = { x: v[0], y: v[1], w: v[2], h: v[3] }; draw(p); },
            onDone: onEnd
          }));
        }, delay);
        timers.push(id);
      }
      function say(text, cls) { msg.className = 'g-msg g-grow' + (cls ? ' ' + cls : ''); msg.textContent = text; }
      function setCode(str) { code.textContent = str; }
      function restart(el, cls) { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); }

      /* ---------- dragging ---------- */
      function toSvg(e) {
        var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        return pt.matrixTransform(svg.getScreenCTM().inverse());
      }
      function grab(e) {
        e.preventDefault();
        if (busy || drag || (state !== 'fresh' && state !== 'loaded')) return;
        var p = toSvg(e);
        drag = { dx: p.x - ox, dy: p.y - oy, sx: p.x, sy: p.y, moved: false };
        objG.classList.add('lift');
        window.addEventListener('pointermove', move); window.addEventListener('pointerup', drop); window.addEventListener('pointercancel', drop);
      }
      function unlisten() {
        window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', drop); window.removeEventListener('pointercancel', drop);
      }
      function zoneAt(x) {
        if (x >= TABX && x <= TABX + TABW) return 'tab';
        if (x >= STOX && x <= STOX + STOW) return 'sto';
        return null;
      }
      function move(e) {
        if (!drag) return;
        var p = toSvg(e);
        if (Math.abs(p.x - drag.sx) + Math.abs(p.y - drag.sy) > 1.5) drag.moved = true;
        ox = p.x - drag.dx; oy = p.y - drag.dy; place();
        var z = zoneAt(p.x);
        zTab.classList.toggle('over', z === 'tab');
        zSto.classList.toggle('over', z === 'sto' && unlocked);
      }
      function drop(e) {
        if (!drag) return;
        unlisten();
        var p = toSvg(e), d = drag, z = zoneAt(p.x);
        drag = null; objG.classList.remove('lift'); zTab.classList.remove('over'); zSto.classList.remove('over');
        if (!d.moved) z = state === 'fresh' ? 'tab' : 'sto';
        if (z === 'tab') return save();
        if (z === 'sto') {
          if (unlocked) return store();
          restart(zSto, 'shake'); say('Try the tables first, then it unlocks.', 'bad');
        }
        goHome();
      }
      function goHome() {
        busy = true;
        tweens.push(DB.tween({
          from: [ox, oy], to: [HOME.x, HOME.y], ms: 350, ease: DB.ease.out,
          onUpdate: function (v) { ox = v[0]; oy = v[1]; place(); }, onDone: function () { busy = false; }
        }));
      }

      /* ---------- the three acts ---------- */
      function save() {
        busy = true; state = 'saving';
        ghost.classList.remove('hid'); loadBtn.classList.add('hid');
        say('save(): cutting the object into rows...');
        setCode('ada.save()   // INSERT x4');
        pcs.forEach(function (p, i) {
          timers.push(setTimeout(function () { setMode(p, 'row'); }, i * 200));
          fly(p, rowRect(p), 650, i * 200, i === pcs.length - 1 ? afterSave : null);
        });
      }
      function afterSave() {
        busy = false; state = 'saved';
        rowsG.classList.remove('hid');
        tn1.textContent = '4 rows in 3 tables'; tn2.textContent = '';
        say('One object became 4 rows. Now get her back.', '');
        loadBtn.classList.remove('hid'); restart(loadBtn, 'g-pop');
        api.hint('Press load() to read the object back');
      }
      function load() {
        if (busy || state !== 'saved') return;
        busy = true; state = 'loading'; loadBtn.classList.add('hid');
        ox = HOME.x; oy = HOME.y;
        joins.classList.add('on');
        say('load(): gluing the rows back with JOINs...');
        setCode('Customer.load(1)   // JOIN x2');
        var order = [2, 3, 1, 0];
        order.forEach(function (idx, n) {
          var p = pcs[idx];
          fly(p, objRect(p), 700, n * 220, function () {
            setMode(p, 'obj'); p.cur = objRect(p); draw(p);
            if (idx === 0) afterLoad();
          });
        });
      }
      function afterLoad() {
        busy = false; state = 'loaded'; unlocked = true;
        joins.classList.remove('on'); ghost.classList.add('hid');
        tn2.textContent = '2 joins to read it back';
        zSto.classList.remove('locked'); lock.classList.add('hid'); restart(zSto, 'pulse');
        say('Rebuilt with 2 joins. Now try the object store.');
        setCode('ada = Customer.load(1)');
        api.hint('Drag the object into the object store');
      }
      function store() {
        busy = true; state = 'storing'; loadBtn.classList.add('hid');
        setCode('store.put(ada)   // as is');
        tweens.push(DB.tween({
          from: [ox, oy], to: [STORE.x, STORE.y], ms: 600, ease: DB.ease.out,
          onUpdate: function (v) { ox = v[0]; oy = v[1]; place(); },
          onDone: function () {
            busy = false; state = 'stored';
            ghost.classList.remove('hid');
            sn1.textContent = '1 object'; sn2.textContent = '0 joins';
            say('Stored as is: nothing to cut, nothing to glue.', 'good');
            api.done(true); api.hint('Tables learned objects; objects did not replace tables');
          }
        }));
      }

      return {
        destroy: function () {
          unlisten();
          tweens.forEach(function (t) { t.cancel(); });
          timers.forEach(clearTimeout);
        }
      };
    }
  });
})(window.DB);
