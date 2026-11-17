/* 05 Card catalog: a bound catalogue has no room for a new entry; loose cards can be filed anywhere and re-sorted in another drawer. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var CW = 13.4, CH = 19, PITCH = 14.4, X0 = 6.5, ROW_Y = 47, STAGE_X = 73.3, STAGE_Y = 6, GROUP = 2;
  var BASE = [['Boyle', 'S'], ['Euler', 'S'], ['Hume', 'P'], ['Kant', 'P'], ['Locke', 'P'], ['Pascal', 'S'], ['Swift', 'L']];
  var NEW = [['Defoe', 'L'], ['Newton', 'S'], ['Smith', 'P']];
  var SUBJ_RANK = { P: 0, S: 1, L: 2 };

  function pip(kind, cx, cy, r) {
    if (kind === 'P') return S('polygon', { class: 'pip pip-P', points: [cx, cy - r, cx + r * 0.95, cy + r * 0.8, cx - r * 0.95, cy + r * 0.8].join(' ') });
    if (kind === 'S') return S('polygon', { class: 'pip pip-S', points: [cx, cy - r * 1.1, cx + r * 0.8, cy, cx, cy + r * 1.1, cx - r * 0.8, cy].join(' ') });
    return S('circle', { class: 'pip pip-L', cx: cx, cy: cy, r: r * 0.9 });
  }
  function makeCard(name, subj) {
    var body = S('rect', { class: 'cd-body', x: 0, y: 0, width: CW, height: CH, rx: 1.4 });
    var g = S('g', { class: 'cd' }, body,
      S('text', { class: 'cd-ini', x: 1.5, y: 6.6, 'font-size': 6 }, name.charAt(0)),
      pip(subj, CW - 3.2, 3.8, 1.9), pip(subj, CW / 2, 10.4, 3.4),
      S('text', { class: 'cd-name', x: CW / 2, y: CH - 2.4, 'font-size': 3.2 }, name));
    return { g: g, body: body, name: name, subj: subj, x: 0, y: 0, tx: 0, ty: 0, rot: 0, trot: 0, held: false };
  }

  DB.addGame('05', {
    hint: 'Squeeze a new entry into the book, then file loose cards',
    mount: function (root, api) {
      var timers = [], raf = 0, lastT = 0, phase = 'book', list = [], queue = NEW.slice(), cur = null, order = 'az', all = [], grab = null;

      var msg = h('div', { class: 'g-msg' });
      var cut = h('button', { class: 'g-btn cat', on: { click: cutBook } }, 'Cut the book into cards');
      var tabAZ = h('button', { class: 'g-btn alt is-off', on: { click: function () { sortBy('az'); } } }, 'Drawer: by author');
      var tabSub = h('button', { class: 'g-btn alt is-off', on: { click: function () { sortBy('subj'); } } }, 'Drawer: by subject');

      var rows = BASE.map(function (b, i) { return S('g', {}, S('text', { class: 'bk-row', x: 44, y: 51 + i * 4.8, 'font-size': 3.4 }, b[0]), S('line', { class: 'bk-rule', x1: 41, y1: 52.6 + i * 4.8, x2: 118, y2: 52.6 + i * 4.8 })); });
      var stamp = S('g', { class: 'stamp' }, S('rect', { x: 58, y: 59, width: 44, height: 14, rx: 2 }), S('text', { x: 80, y: 68.6, 'font-size': 8 }, 'NO ROOM'));
      var book = S('g', { class: 'book' },
        S('rect', { class: 'bk-page', x: 36, y: 41, width: 88, height: 43, rx: 1.5 }), S('rect', { class: 'bk-spine', x: 36, y: 41, width: 4, height: 43, rx: 1.2 }),
        S('text', { class: 'bk-head', x: 44, y: 46.4, 'font-size': 2.9 }, 'CATALOGUE, BOUND'), rows, stamp);

      var label = S('text', { class: 'dr-label', x: 80, y: 78.4, 'font-size': 4.6 }, 'A\u2013Z');
      var drawer = S('g', { class: 'drawer' },
        S('rect', { class: 'dr-back', x: 3, y: 38, width: 154, height: 46, rx: 3 }));
      var front = S('g', { class: 'drawer dr-front' },
        S('rect', { class: 'dr-panel', x: 3, y: 68, width: 154, height: 16, rx: 2.4 }),
        S('rect', { class: 'dr-tag', x: 58, y: 71.4, width: 44, height: 9, rx: 1.2 }), label,
        S('circle', { class: 'dr-knob', cx: 22, cy: 76, r: 2.6 }), S('circle', { class: 'dr-knob', cx: 138, cy: 76, r: 2.6 }));
      var cardsLayer = S('g', {});
      var heldLayer = S('g', {});
      var newTag = S('text', { class: 'new-tag', x: STAGE_X - 4, y: STAGE_Y + 11, 'font-size': 3.6 }, 'NEW');
      var legend = S('g', { class: 'legend' });
      [['P', 'Philosophy'], ['S', 'Science'], ['L', 'Fiction']].forEach(function (l, i) {
        legend.append(pip(l[0], 66, 10 + i * 7.5, 2.4), S('text', { x: 71, y: 11.4 + i * 7.5, 'font-size': 3.6 }, l[1]));
      });
      var svg = S('svg', { class: 'field', viewBox: '0 0 160 86' }, book, drawer, cardsLayer, front, legend, newTag, heldLayer);

      root.append(h('div', { class: 'g-row top' }, h('span', { class: 'g-label' }, 'Revolutionary library, 1791'), h('div', { class: 'g-grow' }), msg), svg,
        h('div', { class: 'g-row g-center ctl' }, cut, tabAZ, tabSub));

      function say(t, cls) { msg.className = 'g-msg' + (cls ? ' ' + cls : ''); msg.textContent = t; }
      function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
      function pulse(el) { el.classList.remove('g-pulse'); void el.offsetWidth; el.classList.add('g-pulse'); }

      function place(c) { c.g.setAttribute('transform', 'translate(' + c.x.toFixed(2) + ' ' + c.y.toFixed(2) + ') rotate(' + c.rot.toFixed(2) + ' ' + (CW / 2) + ' ' + (CH / 2) + ')'); }
      function tick(now) {
        raf = 0;
        var dt = Math.min(0.05, (now - lastT) / 1000), k = 1 - Math.exp(-dt * 12), moving = !!grab;
        lastT = now;
        all.forEach(function (c) {
          if (c.held) return place(c);
          c.x += (c.tx - c.x) * k; c.y += (c.ty - c.y) * k; c.rot += (c.trot - c.rot) * k;
          if (Math.abs(c.tx - c.x) > 0.03 || Math.abs(c.ty - c.y) > 0.03 || Math.abs(c.trot - c.rot) > 0.1) moving = true;
          else { c.x = c.tx; c.y = c.ty; c.rot = c.trot; }
          place(c);
        });
        if (moving) raf = requestAnimationFrame(tick);
      }
      function kick() { if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(tick); } }

      function slotX(i, gap) {
        if (order === 'subj') { var extra = 0; for (var j = 1; j <= i; j++) if (list[j].subj !== list[j - 1].subj) extra += GROUP; return X0 + i * PITCH + extra; }
        return X0 + (i + (gap >= 0 && i >= gap ? 1 : 0)) * PITCH;
      }
      function layout(gap) { list.forEach(function (c, i) { c.tx = slotX(i, gap === undefined ? -1 : gap); c.ty = ROW_Y; c.trot = 0; }); kick(); }

      function stage() {
        if (!queue.length) { cur = null; newTag.style.opacity = 0; return; }
        var n = queue.shift(); cur = makeCard(n[0], n[1]);
        cur.x = STAGE_X; cur.y = -22; cur.tx = STAGE_X; cur.ty = STAGE_Y;
        cur.g.classList.add('is-new'); cur.g.addEventListener('pointerdown', onDown);
        all.push(cur); heldLayer.append(cur.g); newTag.style.opacity = 1; kick();
      }

      function toSvg(e) { var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }

      function onDown(e) {
        if (!cur || grab || e.currentTarget !== cur.g) return;
        e.preventDefault(); var p = toSvg(e);
        grab = { dx: cur.x + CW / 2 - p.x, dy: cur.y + CH / 2 - p.y, id: e.pointerId, el: cur.g };
        cur.held = true; cur.trot = 0; cur.rot = -3; cur.g.classList.add('is-lift'); heldLayer.append(cur.g);
        cur.g.setPointerCapture(e.pointerId);
        cur.g.addEventListener('pointermove', onMove); cur.g.addEventListener('pointerup', onUp); cur.g.addEventListener('pointercancel', onUp);
        kick();
      }
      function gapAt(p) {
        if (phase !== 'cards' || order !== 'az' || p.y < 32) return -1;
        return DB.clamp(Math.round((p.x - X0 - CW / 2) / PITCH), 0, list.length);
      }
      function onMove(e) {
        if (!grab) return;
        var p = toSvg(e);
        cur.x = p.x + grab.dx - CW / 2; cur.y = p.y + grab.dy - CH / 2; cur.tx = cur.x; cur.ty = cur.y;
        if (phase === 'cards') layout(gapAt(p));
        kick();
      }
      function onUp(e) {
        if (!grab) return;
        var el = grab.el, p = toSvg(e);
        el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerup', onUp); el.removeEventListener('pointercancel', onUp);
        grab = null; cur.held = false; cur.g.classList.remove('is-lift');
        var inBook = phase === 'book' && p.x > 34 && p.x < 126 && p.y > 38;
        if (inBook) return noRoom();
        var g = gapAt(p);
        if (g < 0) { layout(); return back(); }
        var c = cur, ok = (g === 0 || list[g - 1].name < c.name) && (g === list.length || c.name < list[g].name);
        if (!ok) {
          [list[g - 1], list[g]].forEach(function (nb) { if (nb) { nb.body.classList.add('is-warn'); later(function () { nb.body.classList.remove('is-warn'); }, 900); } });
          layout(); back(); say('Not there: the neighbours must stay A to Z.', 'bad'); return;
        }
        list.splice(g, 0, c); cardsLayer.append(c.g); c.g.classList.remove('is-new'); c.g.removeEventListener('pointerdown', onDown);
        layout();
        say('Filed ' + c.name + '. The others slide apart.');
        if (queue.length) later(stage, 350);
        else {
          cur = null; newTag.style.opacity = 0; legend.classList.add('is-on');
          say('All filed. Now sort the same cards another way.');
          tabAZ.classList.remove('is-off'); tabSub.classList.remove('is-off'); tabAZ.classList.add('on'); pulse(tabSub);
        }
      }
      function back() { cur.tx = STAGE_X; cur.ty = STAGE_Y; cur.trot = 0; kick(); }

      function noRoom() {
        back();
        stamp.classList.remove('is-on'); void stamp.getBoundingClientRect(); stamp.classList.add('is-on');
        book.classList.remove('g-shake'); void book.getBoundingClientRect(); book.classList.add('g-shake');
        say('No room: a bound page cannot grow.', 'bad'); pulse(cut);
      }

      function cutBook() {
        if (phase !== 'book') return;
        phase = 'cards'; cut.classList.add('is-off');
        book.classList.add('is-gone'); drawer.classList.add('is-on'); front.classList.add('is-on');
        BASE.forEach(function (b, i) {
          var c = makeCard(b[0], b[1]); c.x = 70; c.y = 40 + i * 3; c.rot = (i % 2 ? 1 : -1) * 6; list.push(c); all.push(c); cardsLayer.append(c.g);
          c.tx = c.x; c.ty = c.y; c.g.style.opacity = 0;
          later(function () { c.g.style.opacity = 1; c.tx = slotX(i, -1); c.ty = ROW_Y; c.trot = 0; kick(); }, 60 + i * 80);
        });
        say('One record per card. File Defoe in its place.');
      }

      function sortBy(mode) {
        if (phase !== 'cards' || cur || order === mode) return;
        order = mode;
        list.sort(function (a, b) { return mode === 'az' ? (a.name < b.name ? -1 : 1) : (SUBJ_RANK[a.subj] - SUBJ_RANK[b.subj] || (a.name < b.name ? -1 : 1)); });
        list.forEach(function (c) { cardsLayer.append(c.g); });
        layout();
        label.textContent = mode === 'az' ? 'A\u2013Z' : 'SUBJECT';
        tabAZ.classList.toggle('on', mode === 'az'); tabSub.classList.toggle('on', mode === 'subj');
        if (mode === 'subj') { say('Same cards, new order. Nothing recopied.', 'good'); api.done(true); } else say('Back to author order.');
      }

      newTag.style.opacity = 0;
      stage();
      say('Squeeze Defoe in between Boyle and Euler.');
      return {
        destroy: function () {
          timers.forEach(clearTimeout); if (raf) cancelAnimationFrame(raf);
          if (grab) { grab.el.removeEventListener('pointermove', onMove); grab.el.removeEventListener('pointerup', onUp); grab.el.removeEventListener('pointercancel', onUp); }
        }
      };
    }
  });
})(window.DB);
