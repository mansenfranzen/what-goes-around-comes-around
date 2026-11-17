/* 02 Clay tokens: seal tokens in a clay envelope. Breaking it open to audit destroys it; marks pressed on the outside don't. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var TYPES = ['grain', 'sheep', 'oil'];
  var ROUNDS = [
    { need: { grain: 3, sheep: 2, oil: 0 }, marks: false },
    { need: { grain: 2, sheep: 1, oil: 2 }, marks: true }
  ];
  var CX = 50, CY = 54, R = 40;
  var CRACK = 'L53 84 L46 74 L55 62 L45 50 L54 38 L46 26 Z';

  function shapes(type) {
    if (type === 'grain') return [S('path', { class: 'tk-body', d: 'M20 4 L34 31 A14 5 0 0 1 6 31 Z' })];
    if (type === 'sheep') return [S('rect', { class: 'tk-body', x: 10, y: 7, width: 20, height: 26, rx: 4 }), S('line', { class: 'tk-cut', x1: 10, y1: 16, x2: 30, y2: 16 }), S('line', { class: 'tk-cut', x1: 10, y1: 24, x2: 30, y2: 24 })];
    return [S('ellipse', { class: 'tk-body', cx: 20, cy: 21, rx: 11, ry: 15 }), S('circle', { class: 'tk-cut', cx: 20, cy: 21, r: 2.6 })];
  }
  function icon(type) { return S.apply(null, ['svg', { class: 'tk tk-' + type, viewBox: '0 0 40 40' }].concat(shapes(type))); }

  DB.addGame('02', {
    hint: 'Seal the tokens in clay, then audit the envelope',
    mount: function (root, api) {
      var timers = [], tw = null, round = 0, phase = 'fill', counts, slots, rowOf, marksG, flying = 0, markList = [];

      var label = h('span', { class: 'g-label' });
      var msg = h('div', { class: 'g-msg' });
      var orderList = h('div', { class: 'order-list' });
      var order = h('div', { class: 'order g-card g-tint' }, h('span', { class: 'g-label' }, 'Owed'), orderList);

      var bodyFill = S('circle', { class: 'ball-body', cx: CX, cy: CY, r: R });
      var hole = S('ellipse', { class: 'hole', cx: CX, cy: 22, rx: 17, ry: 5.6 });
      var lid = S('g', { class: 'lid' }, S('ellipse', { class: 'lid-top', cx: CX, cy: 22, rx: 17, ry: 5.6 }), S('path', { class: 'seam', d: 'M36 22 Q50 26 64 22' }));
      var qmark = S('text', { class: 'qmark', x: CX, y: 70, 'font-size': 30 }, '?');
      marksG = S('g', { class: 'marks' });
      var whole = S('g', { class: 'whole' }, bodyFill, S('path', { class: 'shine', d: 'M24 44 A30 30 0 0 1 40 24' }), hole, lid, marksG, qmark);
      var halfL = S('path', { class: 'half', d: 'M50 14 A40 40 0 0 0 50 94 ' + CRACK });
      var halfR = S('path', { class: 'half', d: 'M50 14 A40 40 0 0 1 50 94 ' + CRACK });
      var halves = S('g', { class: 'halves' }, halfL, halfR);
      var spill = S('g', { class: 'spill' });
      var ball = S('svg', { class: 'ball', viewBox: '0 9 100 105' },
        S('defs', {}, S('radialGradient', { id: 'g02-clay', cx: '.35', cy: '.3', r: '.85' }, S('stop', { offset: '0', 'stop-color': '#FBE0BD' }), S('stop', { offset: '1', 'stop-color': '#DA9760' }))),
        S('ellipse', { class: 'shadow', cx: CX, cy: 98, rx: 30, ry: 3 }), whole, halves, spill);

      var tray = h('div', { class: 'tray g-card' });
      var trayBtns = {};
      TYPES.forEach(function (t) {
        trayBtns[t] = h('button', { class: 'tray-btn', title: t, on: { click: function () { add(t); } } }, icon(t), h('span', { class: 'tray-lbl' }, t));
        tray.append(trayBtns[t]);
      });

      var layer = h('div', { class: 'layer' });
      var stage = h('div', { class: 'stage' }, order, h('div', { class: 'ball-wrap' }, ball), tray, layer);
      var act = h('button', { class: 'g-btn cat', on: { click: onAct } });
      root.append(h('div', { class: 'g-row' }, label, h('div', { class: 'g-grow' }), msg), stage, h('div', { class: 'g-row g-center' }, act));

      function say(t, cls) { msg.className = 'g-msg' + (cls ? ' ' + cls : ''); msg.textContent = t; }
      function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

      function start(r) {
        timers.forEach(clearTimeout); timers = []; if (tw) tw.cancel();
        round = r; phase = 'fill'; flying = 0;
        var cfg = ROUNDS[r];
        counts = { grain: 0, sheep: 0, oil: 0 };
        slots = [];
        orderList.textContent = '';
        TYPES.forEach(function (t) {
          for (var i = 0; i < cfg.need[t]; i++) { var s = h('span', { class: 'cs' }, icon(t)); orderList.append(s); slots.push({ type: t, el: s, on: false }); }
        });
        rowOf = {}; var k = 0; TYPES.forEach(function (t) { if (cfg.need[t]) rowOf[t] = k++; });
        marksG.textContent = ''; spill.textContent = ''; markList = [];
        whole.setAttribute('class', 'whole'); halves.setAttribute('class', 'halves');
        halfL.removeAttribute('style'); halfR.removeAttribute('style');
        lid.classList.remove('on'); qmark.classList.remove('on');
        label.textContent = 'Debt ' + (r + 1) + ' / 2';
        say(cfg.marks ? 'Press each token into the clay: it leaves a mark.' : 'Pay the debt: drop the tokens into the envelope.');
        setAct('Seal the envelope', true);
        tray.classList.remove('off');
        TYPES.forEach(function (t) { trayBtns[t].classList.toggle('none', !cfg.need[t]); trayBtns[t].classList.remove('spent'); });
      }

      function setAct(text, disabled) { act.textContent = text; act.disabled = !!disabled; act.classList.remove('g-pulse'); if (!disabled) { void act.offsetWidth; act.classList.add('g-pulse'); } }

      function filled() { return slots.every(function (s) { return s.on; }); }

      function ballPoint(x, y) {
        var p = ball.createSVGPoint(); p.x = x; p.y = y;
        var q = p.matrixTransform(ball.getScreenCTM()), sr = stage.getBoundingClientRect();
        return [(q.x - sr.left) / sr.width * 100, (q.y - sr.top) / sr.height * 100];
      }

      function add(type) {
        if (phase !== 'fill' || flying) return;
        var cfg = ROUNDS[round], btn = trayBtns[type];
        if (counts[type] >= cfg.need[type]) { btn.classList.remove('g-shake'); void btn.offsetWidth; btn.classList.add('g-shake'); say('Not owed: ' + type + ' is full.', 'bad'); return; }
        var j = counts[type]++;
        var slot = slots.filter(function (s) { return s.type === type && !s.on; })[0];
        var sr = stage.getBoundingClientRect(), br = btn.getBoundingClientRect();
        var from = [(br.left + br.width / 2 - sr.left) / sr.width * 100, (br.top + br.height / 2 - sr.top) / sr.height * 100];
        var mx = CX + (j - (cfg.need[type] - 1) / 2) * 13, my = 42 + rowOf[type] * 17;
        var to = ballPoint(cfg.marks ? mx : CX, cfg.marks ? my : 22);
        var fl = h('div', { class: 'fly' }, icon(type)); layer.append(fl); flying++;
        tw = DB.tween({
          from: [from[0], from[1], 1], to: [to[0], to[1], cfg.marks ? 0.8 : 0.35], ms: 520, ease: DB.ease.out,
          onUpdate: function (v) { fl.style.left = v[0] + '%'; fl.style.top = v[1] + '%'; fl.style.transform = 'translate(-50%,-50%) scale(' + v[2] + ')'; },
          onDone: function () {
            fl.remove(); flying--;
            slot.on = true; slot.el.classList.add('on');
            if (cfg.marks) stamp(type, mx, my);
            else { hole.classList.remove('g-pulse'); void hole.getBoundingClientRect(); hole.classList.add('g-pulse'); }
            if (counts[type] >= cfg.need[type]) btn.classList.add('spent');
            if (filled()) { say(cfg.marks ? 'Marks match the tokens. Seal it.' : 'Enough tokens. Seal it.'); setAct('Seal the envelope', false); }
          }
        });
      }

      function stamp(type, x, y) {
        var m = S('g', { class: 'mark' }, shapes(type));
        marksG.append(S('g', { transform: 'translate(' + (x - 6) + ' ' + (y - 6) + ') scale(.3)' }, m));
        markList.push({ el: m, type: type });
      }

      function onAct() {
        if (phase === 'fill' && filled()) seal();
        else if (phase === 'sealed') audit();
        else if (phase === 'broken') start(1);
        else if (phase === 'ok') start(0);
      }

      function seal() {
        phase = 'sealed';
        lid.classList.add('on'); hole.classList.add('closed');
        tray.classList.add('off');
        if (!ROUNDS[round].marks) qmark.classList.add('on');
        say(ROUNDS[round].marks ? 'Sealed. The marks stay on the outside.' : 'Sealed. Is it right? Audit it!');
        setAct('Audit it', false);
      }

      function audit() {
        if (ROUNDS[round].marks) {
          phase = 'checking'; setAct('Auditing…', true);
          var ms = markList, n = ms.length;
          ms.forEach(function (m, i) {
            later(function () {
              m.el.classList.add('hl');
              var s = slots.filter(function (x) { return x.type === m.type && !x.ok; })[0];
              if (s) { s.ok = true; s.el.classList.add('ok'); }
            }, 350 + i * 320);
          });
          later(function () {
            phase = 'ok'; say('Read from the outside. Nothing broken!', 'good'); setAct('Play again', false); api.done(true);
          }, 600 + n * 320);
        } else {
          phase = 'breaking'; setAct('Auditing…', true); say('Cracking it open…');
          whole.classList.add('shake');
          later(function () {
            whole.setAttribute('class', 'whole gone'); halves.classList.add('on');
            var tokens = [];
            TYPES.forEach(function (t) { for (var i = 0; i < ROUNDS[0].need[t]; i++) tokens.push(t); });
            tokens.forEach(function (t, i) {
              var x = 50 + (i - (tokens.length - 1) / 2) * 14;
              spill.append(S('g', { transform: 'translate(' + (x - 6) + ' 100) scale(.3)' }, S('g', { class: 'drop', style: 'animation-delay:' + (i * 70) + 'ms' }, S('g', { class: 'tk tk-' + t }, shapes(t)))));
            });
          }, 600);
          later(function () { phase = 'broken'; say('Checked… but the envelope is destroyed.', 'bad'); setAct('Again, marked outside', false); }, 1500);
        }
      }

      start(0);
      return { destroy: function () { timers.forEach(clearTimeout); if (tw) tw.cancel(); } };
    }
  });
})(window.DB);
