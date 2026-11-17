/* 07 RAMAC disk: wind a tape to account 73 (sequential, slow), then jump straight to it on a disk (random access). */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var TARGET = 73, W = 15, SPEED = 18, MAXT = 10;
  var CX = 52, CY = 45, R0 = 34, DR = 2.6, HUB = 8, PIVOT = [100, 76], PARK = [89, 69];

  function f(n) { return n.toFixed(2); }
  function two(n) { return n < 10 ? '0' + n : String(n); }
  function pol(r, deg) { var a = deg * Math.PI / 180; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; }
  function cellPath(t, s) {
    var ro = R0 - t * DR, ri = ro - DR + 0.25, a0 = -90 + s * 36 + 0.7, a1 = a0 + 34.6;
    var p1 = pol(ro, a0), p2 = pol(ro, a1), p3 = pol(ri, a1), p4 = pol(ri, a0);
    return 'M' + f(p1[0]) + ' ' + f(p1[1]) + 'A' + ro + ' ' + ro + ' 0 0 1 ' + f(p2[0]) + ' ' + f(p2[1]) +
      'L' + f(p3[0]) + ' ' + f(p3[1]) + 'A' + ri + ' ' + ri + ' 0 0 0 ' + f(p4[0]) + ' ' + f(p4[1]) + 'Z';
  }
  function cellCenter(t, s) { return pol(R0 - t * DR - DR / 2, -90 + s * 36 + 18); }

  DB.addGame('07', {
    hint: 'Wind the tape to account 73, then try the disk',
    mount: function (root, api) {
      var raf = 0, last = 0, tweens = [];
      var phase = 1, pos = 0, v = 0, hold = 0, clock = false, tapeT = 0, found = false;
      var diskT = 0, head = PARK.slice(), seeking = false, lastRead = -1, i, j;

      var msg = h('div', { class: 'g-msg' });

      /* tape scene */
      var pool = [];
      var ribbon = S('svg', { x: 0, y: 30, width: 160, height: 18, viewBox: '0 0 160 18' });
      for (j = 0; j < 13; j++) {
        var rt = S('text', { class: 'rc-t', x: (W - 1.4) / 2, y: 11.6, 'font-size': 5.6 }, '');
        var rg = S('g', { class: 'rcg' }, S('rect', { class: 'rc', x: 0, y: 1, width: W - 1.4, height: 16, rx: 1.4 }), rt);
        ribbon.append(rg); pool.push({ g: rg, t: rt, id: -1 });
      }
      function spool(cx) {
        return S('g', { class: 'spool' }, S('circle', { cx: cx, cy: 66, r: 7.4 }), S('circle', { class: 'sp-hub', cx: cx, cy: 66, r: 1.6 }),
          [0, 120, 240].map(function (a) { var p = [cx + 6 * Math.cos(a * Math.PI / 180), 66 + 6 * Math.sin(a * Math.PI / 180)]; return S('line', { x1: cx, y1: 66, x2: f(p[0]), y2: f(p[1]) }); }));
      }
      var spA = spool(34), spB = spool(126);
      var posT = S('text', { class: 'big', x: 154, y: 20, 'font-size': 10 }, '#00');
      var tBar = S('rect', { class: 'tm-bar', x: 22, y: 77.6, width: 0, height: 4, rx: 2 });
      var tTxt = S('text', { class: 'ln-t', x: 138, y: 81, 'font-size': 3.4 }, '0.0 s');
      var tape = S('g', { class: 'p1' },
        S('rect', { class: 'target', x: 6, y: 5, width: 44, height: 18, rx: 2 }), S('text', { class: 'cap', x: 10, y: 11, 'font-size': 3 }, 'FIND'),
        S('text', { class: 'big tg', x: 10, y: 20.2, 'font-size': 9 }, '#' + TARGET),
        S('text', { class: 'cap end', x: 154, y: 10, 'font-size': 3 }, 'HEAD AT'), posT,
        S('rect', { class: 'band', x: 0, y: 29, width: 160, height: 20, rx: 1 }), ribbon,
        S('rect', { class: 'win', x: 70.5, y: 26.5, width: 19, height: 25, rx: 2.2 }),
        S('text', { class: 'cap mid', x: 80, y: 56, 'font-size': 3 }, 'READ HEAD'),
        spA, spB,
        S('text', { class: 'ln-t', x: 6, y: 81, 'font-size': 3.4 }, 'TIME'), S('rect', { class: 'ln-bg', x: 22, y: 77.6, width: 112, height: 4, rx: 2 }), tBar, tTxt);

      /* disk scene */
      var cellEls = [];
      var platter = S('g', {}, S('circle', { class: 'rim', cx: CX, cy: CY, r: R0 + 0.8 }));
      var hubT = S('text', { class: 'hub-t', x: CX, y: CY + 1.8, 'font-size': 5.2 }, '');
      function paintHub(id) { hubT.textContent = id < 0 ? '' : '#' + two(id); }
      for (i = 0; i < 100; i++) (function (id) {
        var t = Math.floor(id / 10), s = id % 10;
        var p = S('path', { class: 'dc' + ((t + s) % 2 ? ' alt' : ''), d: cellPath(t, s) });
        p.addEventListener('pointerdown', function (e) { e.preventDefault(); seek(id); });
        p.addEventListener('pointerenter', function () { paintHub(id); });
        p.addEventListener('pointerleave', function () { paintHub(lastRead); });
        cellEls.push(p); platter.append(p);
      })(i);
      var labels = S('g', { class: 'axis' });
      for (i = 0; i < 10; i++) {
        var q = pol(R0 + 3.4, -90 + i * 36 + 18);
        labels.append(S('text', { class: 'sc-t', x: f(q[0]), y: f(q[1] + 1.1), 'font-size': 3.2 }, String(i)));
        labels.append(S('text', { class: 'tr-t', x: CX, y: f(CY - (R0 - i * DR - DR / 2) + 0.9), 'font-size': 2.5 }, String(i)));
      }
      var sheen = S('circle', { class: 'sheen', cx: CX, cy: CY, r: 17, 'stroke-width': 34, 'stroke-dasharray': '15 92' });
      var hubC = S('circle', { class: 'hub', cx: CX, cy: CY, r: HUB });
      var hub = S('g', {}, hubC, hubT);
      var armL = S('line', { class: 'arm', x1: PIVOT[0], y1: PIVOT[1], x2: head[0], y2: head[1] });
      var armH = S('circle', { class: 'arm-h', cx: head[0], cy: head[1], r: 2 });
      var dTxt = S('text', { class: 'ln-t end', x: 156, y: 54, 'font-size': 3.4 }, '0.0 s');
      var kTxt = S('text', { class: 'ln-t end', x: 156, y: 42, 'font-size': 3.4 }, '0.0 s');
      var dBar = S('rect', { class: 'dk-bar', x: 104, y: 56, width: 0, height: 4, rx: 2 });
      var disk = S('g', { class: 'p2' }, platter, sheen, labels, armL, hub,
        S('rect', { class: 'target', x: 104, y: 5, width: 52, height: 26, rx: 2 }), S('text', { class: 'cap', x: 108, y: 11.4, 'font-size': 3 }, 'FIND'),
        S('text', { class: 'big tg', x: 108, y: 25.6, 'font-size': 11 }, '#' + TARGET),
        S('text', { class: 'cap end', x: 152, y: 17.4, 'font-size': 3.2 }, 'TRACK ' + Math.floor(TARGET / 10)), S('text', { class: 'cap end', x: 152, y: 24.2, 'font-size': 3.2 }, 'SECTOR ' + TARGET % 10),
        S('text', { class: 'ln-t', x: 104, y: 42, 'font-size': 3.4 }, 'TAPE'), S('rect', { class: 'tm-bar', x: 104, y: 44, width: 52, height: 4, rx: 2 }), kTxt,
        S('text', { class: 'ln-t', x: 104, y: 54, 'font-size': 3.4 }, 'DISK'), S('rect', { class: 'ln-bg', x: 104, y: 56, width: 52, height: 4, rx: 2 }), dBar, dTxt,
        S('circle', { class: 'pivot', cx: PIVOT[0], cy: PIVOT[1], r: 3 }), armH);

      var svg = S('svg', { class: 'field ph1', viewBox: '0 0 160 86' }, tape, disk);

      function holdBtn(label, dir) {
        var b = h('button', { class: 'g-btn alt hold' }, label);
        b.addEventListener('pointerdown', function (e) {
          e.preventDefault(); if (found || phase !== 1) return;
          try { b.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointer */ }
          hold = dir; clock = true; b.classList.add('is-held'); say('Winding past every record in between...'); kick();
        });
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) {
          b.addEventListener(ev, function () { if (hold === dir) { hold = 0; b.classList.remove('is-held'); } });
        });
        return b;
      }
      var back = holdBtn('<< Rewind', -1), fwd = holdBtn('Wind >>', 1);
      var act = h('button', { class: 'g-btn cat is-off', on: { click: onAct } });
      var bot = h('div', { class: 'g-row g-center bot' }, back, fwd, act);

      root.append(h('div', { class: 'g-row top' }, h('span', { class: 'g-label' }, 'Account ledger, 1956'), h('div', { class: 'g-grow' }), msg), svg, bot);

      function say(t, cls) { msg.className = 'g-msg' + (cls ? ' ' + cls : ''); msg.textContent = t; }
      function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }

      function render() {
        var c = Math.round(pos);
        pool.forEach(function (p, k) {
          var id = c + k - 6;
          if (id < 0 || id > 99) { p.g.style.display = 'none'; return; }
          p.g.style.display = '';
          p.g.setAttribute('transform', 'translate(' + f(80 + (id - pos) * W - (W - 1.4) / 2) + ' 0)');
          if (p.id !== id) { p.id = id; p.t.textContent = two(id); p.g.setAttribute('class', 'rcg' + (id === TARGET ? ' is-target' : '')); }
          p.g.classList.toggle('is-hit', found && id === TARGET);
        });
        posT.textContent = '#' + two(c);
        spA.setAttribute('transform', 'rotate(' + f(pos * 12) + ' 34 66)'); spB.setAttribute('transform', 'rotate(' + f(pos * 12) + ' 126 66)');
        tBar.setAttribute('width', f(112 * Math.min(1, tapeT / MAXT))); tTxt.textContent = tapeT.toFixed(1) + ' s';
      }
      function tick(now) {
        raf = 0;
        var dt = Math.min(0.05, (now - last) / 1000); last = now;
        v += (hold * SPEED - v) * (1 - Math.exp(-dt * 6));
        if (!hold && Math.abs(v) < 2) { v = 0; pos += (Math.round(pos) - pos) * (1 - Math.exp(-dt * 14)); }
        pos += v * dt;
        if (pos <= 0) { pos = 0; if (v < 0) v = 0; } else if (pos >= 99) { pos = 99; if (v > 0) v = 0; }
        if (clock && !found) tapeT += dt;
        var settled = !hold && v === 0 && Math.abs(pos - Math.round(pos)) < 0.02;
        if (settled) pos = Math.round(pos);
        if (settled && Math.round(pos) === TARGET && !found) tapeFound();
        render();
        if (phase === 1 && !found && (clock || hold || v)) raf = requestAnimationFrame(tick);
      }
      function tapeFound() {
        found = true; hold = 0; back.classList.add('is-off'); fwd.classList.add('is-off');
        say('Found #' + TARGET + ' after ' + tapeT.toFixed(1) + ' s, past every record before it.', 'good');
        act.textContent = 'Now try the disk'; act.classList.remove('is-off');
      }
      function onAct() { if (phase === 1) toDisk(); else toTape(); }

      function drawArm() {
        armL.setAttribute('x2', f(head[0])); armL.setAttribute('y2', f(head[1]));
        armH.setAttribute('cx', f(head[0])); armH.setAttribute('cy', f(head[1]));
      }
      function paintTimes() {
        kTxt.textContent = tapeT.toFixed(1) + ' s'; dTxt.textContent = diskT.toFixed(1) + ' s';
        dBar.setAttribute('width', f(52 * Math.min(1, diskT / Math.max(tapeT, 0.1))));
      }
      function toDisk() {
        phase = 2; svg.setAttribute('class', 'field ph2'); act.classList.add('is-off');
        api.hint('Tap a spot on the platter to jump there');
        diskT = 0; lastRead = -1; head = PARK.slice(); drawArm(); paintHub(-1); paintTimes();
        say('Same account. Track 7, sector 3: jump straight to it.');
      }
      function toTape() {
        phase = 1; svg.setAttribute('class', 'field ph1');
        pos = 0; v = 0; hold = 0; clock = false; tapeT = 0; found = false;
        pool.forEach(function (p) { p.id = -1; });
        cellEls.forEach(function (c) { c.classList.remove('is-seen', 'is-read', 'is-hit'); }); hubC.classList.remove('is-hit');
        back.classList.remove('is-off'); fwd.classList.remove('is-off'); act.classList.add('is-off');
        api.hint('Wind the tape to account 73, then try the disk');
        say('Find account 73. Hold Wind.'); render();
      }
      function seek(id) {
        if (phase !== 2 || seeking) return;
        var c = cellCenter(Math.floor(id / 10), id % 10), d = Math.sqrt(Math.pow(c[0] - head[0], 2) + Math.pow(c[1] - head[1], 2)), ms = 160 + d * 6;
        seeking = true;
        tweens.push(DB.tween({
          from: head.slice(), to: c, ms: ms,
          onUpdate: function (p) { head = p; drawArm(); },
          onDone: function () {
            seeking = false; diskT += ms / 1000; lastRead = id; paintHub(id); paintTimes();
            if (id === TARGET) {
              cellEls[id].classList.add('is-hit'); hubC.classList.add('is-hit');
              say('Found #' + TARGET + ' in ' + diskT.toFixed(1) + ' s. The tape needed ' + tapeT.toFixed(1) + ' s.', 'good');
              act.textContent = 'Play again'; act.classList.remove('is-off'); api.done(true);
            } else {
              cellEls[id].classList.add('is-seen');
              say('#' + two(id) + ', not it. That guess cost ' + (ms / 1000).toFixed(1) + ' s.');
            }
          }
        }));
      }

      say('Find account 73. Hold Wind.'); render();
      return {
        destroy: function () {
          if (raf) cancelAnimationFrame(raf);
          tweens.forEach(function (t) { if (t && t.cancel) t.cancel(); });
        }
      };
    }
  });
})(window.DB);
