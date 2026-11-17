/* 14 MapReduce: run a word count on cheap machines, then crash one mid-job and watch the job still come out right. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var W = 240, H = 116;
  var WORDS = [
    { w: 'data', c: '#1971C2' }, { w: 'web', c: '#F76707' }, { w: 'link', c: '#099268' }, { w: 'page', c: '#C2255C' }
  ];
  var N_SPLITS = 8, PER = 5;
  var CARD = { x: 2, w: 38, h: 11, gap: 1.6, y0: 11 };
  var MACH = { x: 64, w: 44, top: 11, bottom: 113 };
  var BIN = { x: 160, w: 78, h: 22, gap: 3.4, laneX: 27, perRow: 12 };
  var DOT_R = 1.5;

  function bez(p0, p1, p2, p3, t) {
    var u = 1 - t;
    return {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
    };
  }

  DB.addGame('14', {
    hint: 'Run the word count, then crash a machine while it works',
    mount: function (root, api) {
      var rnd = DB.rng(14), raf = 0, last = 0, anims = [];
      var splits = [], machines = [], bins = [], expected = [0, 0, 0, 0];
      var nM = 3, run = null, solved = false;

      for (var i = 0; i < N_SPLITS; i++) {
        var words = [];
        for (var j = 0; j < PER; j++) {
          var r = rnd(), wi = r < 0.34 ? 0 : r < 0.64 ? 1 : r < 0.84 ? 2 : 3;
          words.push(wi); expected[wi]++;
        }
        splits.push({ i: i, words: words, dur: 1.3 + rnd() * 0.6, state: 'queued', g: null });
      }

      var msg = h('div', { class: 'g-msg' }, 'Eight pages, a few cheap machines.');
      var gPile = S('g'), gMach = S('g'), gFlight = S('g', { class: 'flight' }), gBins = S('g');
      var scene = S('svg', { viewBox: '0 0 ' + W + ' ' + H },
        S('rect', { class: 'shuf', x: 112, y: 9, width: 44, height: H - 11, rx: 2 }),
        header('PAGES', CARD.x, ''), header('map()', MACH.x, 'fn'), header('SHUFFLE', 116, ''), header('reduce()', BIN.x, 'fn'),
        gPile, gMach, gBins, gFlight);

      var runBtn = h('button', { class: 'g-btn cat', on: { click: start } }, 'Run the job');
      var range = h('input', { class: 'g-range', type: 'range', min: 1, max: 6, step: 1, value: nM, on: { input: onRange } });
      var mLabel = h('b', {}, String(nM));
      var timer = h('b', {}, '0.0');

      root.append(
        h('div', { class: 'g-row' }, h('span', { class: 'g-label' }, 'Word count'), h('div', { class: 'g-grow' }), msg),
        h('div', { class: 'stage' }, scene),
        h('div', { class: 'g-row ctl' }, runBtn,
          h('div', { class: 'g-row mctl' }, h('span', { class: 'g-label' }, 'Machines'), range, mLabel),
          h('div', { class: 'g-grow' }),
          h('div', { class: 'g-stat time' }, timer, h('span', {}, 'seconds'))));

      function header(text, x, kind) {
        return S('text', { class: 'hd ' + kind, x: x, y: 5.6, 'font-size': 3.9 }, text);
      }

      function cardY(i) { return CARD.y0 + i * (CARD.h + CARD.gap); }

      function drawCard(s, flash) {
        if (s.g) s.g.remove();
        var g = S('g', { class: 'card ' + s.state + (flash ? ' ' + flash : '') });
        g.append(S('rect', { class: 'cb', x: CARD.x, y: cardY(s.i), width: CARD.w, height: CARD.h, rx: 1.6 }));
        s.words.forEach(function (wi, k) {
          g.append(S('circle', { class: 'wd', cx: CARD.x + 6 + k * 6.6, cy: cardY(s.i) + CARD.h / 2, r: 1.9, fill: WORDS[wi].c }));
        });
        if (s.state === 'done') g.append(S('path', { class: 'tk', d: 'M' + (CARD.x + CARD.w - 6) + ' ' + (cardY(s.i) + 5.2) + 'l1.5 1.6l3-3.6' }));
        s.g = g; gPile.append(g);
      }

      function buildMachines() {
        gMach.textContent = ''; machines = [];
        var slot = (MACH.bottom - MACH.top) / nM, mh = Math.min(19, slot - 2.4);
        for (var k = 0; k < nM; k++) {
          var y = MACH.top + k * slot + (slot - mh) / 2;
          var m = { k: k, x: MACH.x, y: y, h: mh, state: 'idle', split: -1, p: 0, deadT: 0 };
          m.fill = S('rect', { class: 'fill', x: MACH.x + 7, y: y + mh - 4.2, width: 0, height: 1.8, rx: .9 });
          m.mini = S('g', { class: 'mini' });
          m.g = S('g', { class: 'mach idle' },
            S('rect', { class: 'mb', x: MACH.x, y: y, width: MACH.w, height: mh, rx: 2.4 }),
            S('circle', { class: 'led', cx: MACH.x + 4, cy: y + 4, r: 1.2 }),
            S('line', { class: 'vent', x1: MACH.x + 31, y1: y + 3.4, x2: MACH.x + MACH.w - 3, y2: y + 3.4 }),
            S('line', { class: 'vent', x1: MACH.x + 31, y1: y + 5.6, x2: MACH.x + MACH.w - 3, y2: y + 5.6 }),
            S('rect', { class: 'track', x: MACH.x + 7, y: y + mh - 4.2, width: MACH.w - 14, height: 1.8, rx: .9 }),
            m.fill, m.mini,
            S('path', { class: 'x', d: 'M' + (MACH.x + 17) + ' ' + (y + mh / 2 - 3.6) + 'l10 7.2M' + (MACH.x + 27) + ' ' + (y + mh / 2 - 3.6) + 'l-10 7.2' }));
          m.g.addEventListener('pointerdown', crashHandler(m));
          gMach.append(m.g); machines.push(m);
        }
      }

      function crashHandler(m) { return function (e) { e.preventDefault(); crash(m); }; }

      function buildBins() {
        gBins.textContent = ''; bins = [];
        var y0 = MACH.top + ((MACH.bottom - MACH.top) - (4 * BIN.h + 3 * BIN.gap)) / 2;
        WORDS.forEach(function (wd, k) {
          var y = y0 + k * (BIN.h + BIN.gap);
          var txt = S('text', { class: 'cnt', x: BIN.x + BIN.w - 2.5, y: y + BIN.h / 2 + 3.6, 'text-anchor': 'end', 'font-size': 11.5 }, '0');
          gBins.append(S('g', { class: 'bin' },
            S('rect', { class: 'bb', x: BIN.x, y: y, width: BIN.w, height: BIN.h, rx: 2.4 }),
            S('rect', { class: 'tab', x: BIN.x, y: y, width: 24, height: BIN.h, rx: 2.4, fill: wd.c }),
            S('rect', { class: 'tab', x: BIN.x + 12, y: y, width: 12, height: BIN.h, fill: wd.c }),
            S('text', { class: 'wl', x: BIN.x + 12, y: y + BIN.h / 2 + 1.5, 'text-anchor': 'middle', 'font-size': 4.6 }, wd.w),
            txt));
          bins.push({ y: y, count: 0, reserved: 0, txt: txt });
        });
      }

      function slotPos(b, n) {
        var k = Math.min(n, BIN.perRow * 2 - 1);
        return { x: BIN.x + BIN.laneX + 1.6 + (k % BIN.perRow) * 2.9, y: b.y + 7.4 + Math.floor(k / BIN.perRow) * 7.2 };
      }

      function anim(delay, dur, fn, end) { anims.push({ t0: null, delay: delay * 1000, dur: dur * 1000, fn: fn, end: end }); }

      function setState(m, st) {
        m.state = st;
        m.g.setAttribute('class', 'mach ' + st);
      }

      function onRange() {
        nM = Number(range.value); mLabel.textContent = nM; buildMachines();
      }

      function clearRun() {
        gFlight.textContent = ''; gFlight.classList.remove('merged'); anims = [];
        splits.forEach(function (s) { s.state = 'queued'; drawCard(s); });
        bins.forEach(function (b) { b.count = 0; b.reserved = 0; b.txt.textContent = '0'; b.txt.classList.remove('good'); });
        buildMachines();
      }

      function start() {
        clearRun();
        run = { el: 0, inflight: 0, crashes: 0, finished: false };
        timer.textContent = '0.0';
        runBtn.disabled = true; range.disabled = true; runBtn.textContent = 'Running…';
        msg.className = 'g-msg'; msg.textContent = 'Tap a busy machine to crash it.';
      }

      function schedule() {
        machines.forEach(function (m) {
          if (m.state !== 'idle') return;
          var s = null;
          for (var i = 0; i < splits.length; i++) if (splits[i].state === 'queued') { s = splits[i]; break; }
          if (!s) return;
          s.state = 'running'; drawCard(s); m.split = s.i; m.p = 0;
          setState(m, 'busy');
          m.mini.textContent = '';
          s.words.forEach(function (wi, k) {
            m.mini.append(S('circle', { class: 'wd', cx: m.x + 7 + k * 5.6, cy: m.y + m.h / 2 - 1.4, r: 1.5, fill: WORDS[wi].c }));
          });
          var ghost = S('rect', { class: 'ghost', x: 0, y: 0, width: 10, height: 5.4, rx: 1.2 }); gFlight.append(ghost);
          var from = { x: CARD.x + CARD.w - 6, y: cardY(s.i) + CARD.h / 2 - 2.7 }, to = { x: m.x + 2, y: m.y + m.h / 2 - 4 };
          anim(0, 0.35, function (t) {
            var e = DB.ease.out(t);
            ghost.setAttribute('transform', 'translate(' + DB.lerp(from.x, to.x, e).toFixed(2) + ' ' + DB.lerp(from.y, to.y, e).toFixed(2) + ')');
          }, function () { ghost.remove(); });
        });
      }

      function emit(m) {
        var s = splits[m.split];
        s.state = 'done'; drawCard(s);
        m.split = -1; m.mini.textContent = ''; m.fill.setAttribute('width', 0); setState(m, 'idle');
        var p0 = { x: m.x + MACH.w, y: m.y + m.h / 2 };
        s.words.forEach(function (wi, k) {
          var b = bins[wi], p3 = slotPos(b, b.reserved++), dx = p3.x - p0.x;
          var p1 = { x: p0.x + dx * 0.45, y: p0.y }, p2 = { x: p3.x - dx * 0.45, y: p3.y };
          var dot = S('circle', { class: 'pair', cx: p0.x, cy: p0.y, r: DOT_R, fill: WORDS[wi].c });
          gFlight.append(dot); run.inflight++;
          anim(k * 0.12, 1.1, function (t) {
            var p = bez(p0, p1, p2, p3, DB.ease.inOut(t));
            dot.setAttribute('cx', p.x.toFixed(2)); dot.setAttribute('cy', p.y.toFixed(2));
          }, function () {
            run.inflight--; b.count++; b.txt.textContent = b.count;
            b.txt.classList.remove('bump'); void b.txt.getBoundingClientRect(); b.txt.classList.add('bump');
          });
        });
      }

      function crash(m) {
        if (!run || run.finished || m.state !== 'busy') return;
        var s = splits[m.split];
        s.state = 'queued'; drawCard(s, 'retry');
        m.split = -1; m.mini.textContent = ''; m.p = 0; m.fill.setAttribute('width', 0); m.deadT = 1.8;
        setState(m, 'dead'); run.crashes++;
        msg.className = 'g-msg bad'; msg.textContent = 'Machine lost! Its page goes back in the queue.';
      }

      function finish() {
        run.finished = true;
        gFlight.classList.add('merged');
        bins.forEach(function (b) { b.txt.classList.add('good'); });
        runBtn.disabled = false; range.disabled = false; runBtn.textContent = 'Run again';
        if (run.crashes > 0) {
          msg.className = 'g-msg good';
          msg.textContent = run.crashes + (run.crashes === 1 ? ' machine' : ' machines') + ' died. Same totals, no human involved.';
          if (!solved) { solved = true; api.done(true); }
        } else {
          msg.className = 'g-msg good';
          msg.textContent = 'Counted in ' + run.el.toFixed(1) + ' s. Now run it and crash one!';
        }
      }

      function frame(now) {
        var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
        if (run && !run.finished) {
          run.el += dt; timer.textContent = run.el.toFixed(1);
          machines.forEach(function (m) {
            if (m.state === 'dead') { m.deadT -= dt; if (m.deadT <= 0) setState(m, 'idle'); }
            else if (m.state === 'busy') {
              m.p += dt / splits[m.split].dur;
              m.fill.setAttribute('width', (DB.clamp(m.p, 0, 1) * (MACH.w - 14)).toFixed(2));
              if (m.p >= 1) emit(m);
            }
          });
          schedule();
          var left = splits.some(function (s) { return s.state !== 'done'; });
          if (!left && run.inflight === 0 && !anims.length) finish();
        }
        anims = anims.filter(function (a) {
          if (a.t0 === null) a.t0 = now;
          var t = (now - a.t0 - a.delay) / a.dur;
          if (t < 0) return true;
          if (t >= 1) { a.fn(1); if (a.end) a.end(); return false; }
          a.fn(t); return true;
        });
        raf = requestAnimationFrame(frame);
      }

      buildBins(); splits.forEach(function (s) { drawCard(s); }); buildMachines();
      raf = requestAnimationFrame(frame);
      return { destroy: function () { cancelAnimationFrame(raf); anims = []; run = null; } };
    }
  });
})(window.DB);
