/* 06 Punch cards: punch two census cards by hand, then let a tabulator filter and count a whole deck while a clerk counts by hand. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var CELLS = [
    { x: 50, g: 0, v: 0, lab: 'OH' }, { x: 62.5, g: 0, v: 1, lab: 'NY' }, { x: 75, g: 0, v: 2, lab: 'TX' },
    { x: 90, g: 1, v: 0, lab: '<40' }, { x: 102.5, g: 1, v: 1, lab: '40+' }
  ];
  var CW = 11, CY = 41, CH = 11;
  var STATES = ['OH', 'NY', 'TX'], FULL = ['Ohio', 'New York', 'Texas'];
  var PEOPLE = [{ s: 0, a: 1, age: 52 }, { s: 2, a: 0, age: 31 }];
  var N = 40, STEP = 70, FLIGHT = 320, FROM = [76, 42], TO = { ok: [134, 36], no: [134, 67] };

  function hasHole(c, k) { return CELLS[k].g === 0 ? c.s === CELLS[k].v : c.a === CELLS[k].v; }

  DB.addGame('06', {
    hint: 'Punch the form onto two cards, then feed the deck',
    mount: function (root, api) {
      var tweens = [], timers = [], raf = 0, last = 0;
      var phase = 1, pi = 0, locked = false, punched = [-1, -1], pins = [-1, -1];
      var run = null, hand = null, flyers = [], counted = 0, rested = 0, deck = [];
      var rnd = DB.rng(11), i;
      for (i = 0; i < N; i++) deck.push({ s: Math.floor(rnd() * 3), a: rnd() < 0.5 ? 0 : 1, mine: false });
      deck[11] = { s: 0, a: 1, mine: true }; deck[27] = { s: 2, a: 0, mine: true };

      var msg = h('div', { class: 'g-msg' });
      var code = h('div', { class: 'g-code' });
      var runBtn = h('button', { class: 'g-btn cat', on: { click: start } }, 'Run the deck');

      /* card */
      var cells = CELLS.map(function (c, k) {
        var rect = S('rect', { class: 'cl', x: c.x, y: CY, width: CW, height: CH, rx: 1 });
        var g = S('g', { class: 'cell' }, rect, S('text', { class: 'cl-t', x: c.x + CW / 2, y: CY + CH / 2 + 1.3, 'font-size': 3.6 }, c.lab));
        g.addEventListener('pointerdown', function (e) { e.preventDefault(); onCell(k); });
        return g;
      });
      var card = S('g', { class: 'card' },
        S('polygon', { class: 'cd-body', points: '52,28 112,28 114,30 114,60 112,62 48,62 46,60 46,34' }),
        S('text', { class: 'cd-grp', x: 50, y: 39.2, 'font-size': 3 }, 'STATE'),
        S('text', { class: 'cd-grp', x: 90, y: 39.2, 'font-size': 3 }, 'AGE'),
        S('line', { class: 'cd-sep', x1: 88, y1: 37, x2: 88, y2: 55 }),
        cells,
        S('text', { class: 'cd-head', x: 50, y: 59, 'font-size': 3 }, 'CENSUS 1890'));

      /* phase 1: the person */
      var hat = S('g', { class: 'hat is-off' }, S('ellipse', { cx: 22, cy: 35, rx: 9.5, ry: 1.8 }), S('path', { d: 'M17 35 Q17 28 22 28 Q27 28 27 35 Z' }));
      var shirt = S('path', { class: 'shirt', d: 'M10 66 Q10 49 22 49 Q34 49 34 66 Z' });
      var who1 = S('text', { class: 'who', x: 22, y: 73, 'font-size': 5 }, '');
      var who2 = S('text', { class: 'who2', x: 22, y: 79.5, 'font-size': 3.8 }, '');
      var person = S('g', { class: 'p1' }, shirt, S('circle', { class: 'head', cx: 22, cy: 41, r: 6 }), hat, who1, who2);

      var arrow = S('polygon', { class: 'arrow', points: '37,40.5 43,45 37,49.5' });

      /* phase 2: hopper, pins, bins, lanes */
      var hopL = [];
      for (i = 5; i >= 0; i--) hopL.push(S('rect', { class: 'hp', x: 8 - i * 0.8, y: 30 + i * 0.8, width: 24, height: 30, rx: 1.2 }));
      var hopN = S('text', { class: 'hp-n', x: 20, y: 48.5, 'font-size': 9 }, String(N));
      var hopper = S('g', { class: 'p2' }, S('text', { class: 'bin-t', x: 20, y: 25.5, 'font-size': 3 }, 'DECK'), S('rect', { class: 'hp-ghost', x: 8, y: 30, width: 24, height: 30, rx: 1.2 }), hopL, hopN);

      var pinEls = CELLS.map(function (c, k) {
        var cx = c.x + CW / 2;
        var g = S('g', { class: 'pin' },
          S('rect', { class: 'pn-stem', x: cx - 0.9, y: 11, width: 1.8, height: 26 }),
          S('circle', { class: 'pn-head', cx: cx, cy: 10, r: 2.6 }),
          S('rect', { class: 'pz', x: c.x - 0.6, y: 5, width: CW + 1.2, height: 50 }));
        g.addEventListener('pointerdown', function (e) { e.preventDefault(); onCell(k); });
        return g;
      });
      var pinsG = S('g', { class: 'p2' }, S('text', { class: 'bin-t where', x: 6, y: 11.2, 'font-size': 3.4 }, 'WHERE'), pinEls);

      var cntT = S('text', { class: 'cnt', x: 138, y: 49, 'font-size': 14 }, '0');
      var restT = S('text', { class: 'rest-n', x: 138, y: 75.4, 'font-size': 5 }, '0');
      var bins = S('g', { class: 'p2' },
        S('rect', { class: 'bin ok', x: 120, y: 24, width: 36, height: 36, rx: 2 }), S('text', { class: 'bin-t', x: 138, y: 30, 'font-size': 3.2 }, 'COUNTED'), cntT,
        S('rect', { class: 'bin', x: 120, y: 63, width: 36, height: 16, rx: 2 }), S('text', { class: 'bin-t', x: 138, y: 68.6, 'font-size': 3.2 }, 'REST'), restT);

      var mBar = S('rect', { class: 'ln-m', x: 30, y: 69, width: 0, height: 3.6, rx: 1.8 });
      var hBar = S('rect', { class: 'ln-h', x: 30, y: 77, width: 0, height: 3.6, rx: 1.8 });
      var mTxt = S('text', { class: 'ln-t', x: 96, y: 72, 'font-size': 3.2 }, '0 / ' + N);
      var hTxt = S('text', { class: 'ln-t', x: 96, y: 80, 'font-size': 3.2 }, '0 / ' + N);
      var lanes = S('g', { class: 'p2' },
        S('text', { class: 'ln-t', x: 6, y: 72, 'font-size': 3.2 }, 'MACHINE'), S('rect', { class: 'ln-bg', x: 30, y: 69, width: 64, height: 3.6, rx: 1.8 }), mBar, mTxt,
        S('text', { class: 'ln-t', x: 6, y: 80, 'font-size': 3.2 }, 'BY HAND'), S('rect', { class: 'ln-bg', x: 30, y: 77, width: 64, height: 3.6, rx: 1.8 }), hBar, hTxt);

      var flyL = S('g', {});
      var svg = S('svg', { class: 'field ph1', viewBox: '0 0 160 86' }, person, hopper, arrow, card, pinsG, bins, lanes, flyL);
      var bot = h('div', { class: 'g-row bot is-off' }, code, h('div', { class: 'g-grow' }), runBtn);

      root.append(h('div', { class: 'g-row top' }, h('span', { class: 'g-label' }, 'US Census, 1890'), h('div', { class: 'g-grow' }), msg), svg, bot);

      function say(t, cls) { msg.className = 'g-msg' + (cls ? ' ' + cls : ''); msg.textContent = t; }
      function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
      function tw(ms, fn, done) { tweens.push(DB.tween({ from: 0, to: 1, ms: ms, onUpdate: fn, onDone: done })); }
      function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }
      function restart(el, cls) { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); }

      /* phase 1 */
      function setPerson() {
        var p = PEOPLE[pi];
        who1.textContent = FULL[p.s]; who2.textContent = 'age ' + p.age;
        hat.classList.toggle('is-off', p.s !== 2);
        shirt.classList.toggle('alt', pi === 1);
        say('Card ' + (pi + 1) + ' of 2: punch what the form says.');
      }
      function clearCard() {
        punched = [-1, -1];
        cells.forEach(function (c) { c.classList.remove('is-hole', 'is-bad'); });
        card.removeAttribute('transform'); card.style.opacity = 1;
      }
      function punch(k) {
        var c = CELLS[k], chad = S('rect', { class: 'chad', x: c.x + 2, y: CY + 3, width: CW - 4, height: CH - 6 });
        cells[k].classList.add('is-hole'); cells[k].append(chad);
        chad.addEventListener('animationend', function () { chad.remove(); });
      }
      function wrong(k) {
        cells[k].classList.add('is-bad'); restart(card, 'g-shake');
        say('Not that hole. Read the form.', 'bad');
        later(function () { cells[k].classList.remove('is-bad'); }, 500);
      }
      function cardDone() {
        say('One person, one card.', 'good');
        tw(450, function (t) { card.setAttribute('transform', 'translate(0 ' + (-8 * t).toFixed(2) + ')'); card.style.opacity = 1 - t; }, function () {
          pi++; clearCard();
          if (pi < PEOPLE.length) { setPerson(); locked = false; restart(card, 'g-pop'); } else toTabulator();
        });
      }
      function toTabulator() {
        phase = 2; svg.setAttribute('class', 'field ph2'); bot.classList.remove('is-off');
        api.hint('Tap a column to set a pin, then run the deck'); renderCode(); showBlank();
        say('Two cards are in the deck of ' + N + '. Set a pin, then run.');
        restart(card, 'g-pop');
      }

      /* phase 2 */
      function onCell(k) {
        if (phase === 1) {
          if (locked) return;
          var c = CELLS[k], p = PEOPLE[pi], want = c.g === 0 ? p.s : p.a;
          if (c.v !== want) return wrong(k);
          if (punched[c.g] === c.v) return;
          punched[c.g] = c.v; punch(k); say('Hole punched.', 'good');
          if (punched[0] >= 0 && punched[1] >= 0) { locked = true; later(cardDone, 450); }
        } else if (!run) {
          var cl = CELLS[k];
          pins[cl.g] = pins[cl.g] === cl.v ? -1 : cl.v;
          paintPins(); renderCode();
        }
      }
      function paintPins() {
        CELLS.forEach(function (c, k) { pinEls[k].classList.toggle('is-on', pins[c.g] === c.v); pinEls[k].classList.remove('is-pass', 'is-block'); });
      }
      function renderCode() {
        var parts = [h('span', { class: 'k' }, 'COUNT(*)')], cond = [];
        if (pins[0] >= 0) cond.push(['state', '=', "'" + STATES[pins[0]] + "'", 's']);
        if (pins[1] >= 0) cond.push(['age', pins[1] ? '>=' : '<', '40', 'n']);
        cond.forEach(function (c, j) { parts.push(' ', h('span', { class: 'k' }, j ? 'AND' : 'WHERE'), ' ' + c[0] + ' ' + c[1] + ' ', h('span', { class: c[3] }, c[2])); });
        code.textContent = ''; code.append.apply(code, parts);
      }
      function showCard(c) {
        cells.forEach(function (el, k) { el.classList.toggle('is-hole', hasHole(c, k)); });
        card.classList.toggle('is-mine', !!c.mine);
      }
      function showBlank() { cells.forEach(function (el) { el.classList.remove('is-hole'); }); card.classList.remove('is-mine'); }
      function hopper2(rem) {
        hopN.textContent = rem;
        hopL.forEach(function (r, j) { r.style.visibility = (5 - j) <= Math.ceil(rem / 8) - 1 ? 'visible' : 'hidden'; });
      }

      function start() {
        if (run || phase !== 2) return;
        flyers.forEach(function (f) { f.el.remove(); }); flyers = [];
        counted = 0; rested = 0; cntT.textContent = '0'; restT.textContent = '0'; mBar.setAttribute('width', 0); hBar.setAttribute('width', 0);
        mTxt.textContent = '0 / ' + N; hTxt.textContent = '0 / ' + N; hopper2(N);
        run = { t: 0, i: 0 }; hand = { t: 0 }; runBtn.disabled = true;
        say('Reading ' + N + ' cards...'); kick();
      }
      function read(idx, now) {
        var c = deck[idx], ok = true;
        showCard(c);
        CELLS.forEach(function (cl, k) {
          var on = pins[cl.g] === cl.v, pass = hasHole(c, k);
          pinEls[k].classList.toggle('is-pass', on && pass); pinEls[k].classList.toggle('is-block', on && !pass);
          if (on && !pass) ok = false;
        });
        var el = S('g', { class: 'fly ' + (ok ? 'ok' : 'no') + (c.mine ? ' mine' : '') }, S('rect', { x: 0, y: 0, width: 8, height: 5.6, rx: 0.9 }));
        flyL.append(el); flyers.push({ el: el, t0: now, ok: ok });
        hopper2(N - idx - 1);
      }
      function arrive(f) {
        f.el.remove();
        if (f.ok) { counted++; cntT.textContent = counted; } else { rested++; restT.textContent = rested; }
      }
      function finish() {
        var secs = (run.t / 1000).toFixed(1), byHand = Math.floor(hand.t / 1000);
        run = null; runBtn.disabled = false; runBtn.textContent = 'Run again'; paintPins(); showBlank();
        if (pins[0] >= 0 || pins[1] >= 0) {
          say('Counted ' + counted + ' of ' + N + ' in ' + secs + ' s. By hand: ' + byHand + ' cards.', 'good'); api.done(true);
        } else say('No pin counts every card. Set a pin and run again.');
      }
      function tick(now) {
        raf = 0;
        var dt = Math.min(100, now - last); last = now;
        if (run) {
          run.t += dt;
          while (run.i < N && run.t >= run.i * STEP) read(run.i++, now);
          mBar.setAttribute('width', (64 * (run.i / N)).toFixed(2)); mTxt.textContent = run.i + ' / ' + N;
        }
        if (hand) {
          hand.t += dt;
          var hc = Math.min(N, hand.t / 1000);
          hBar.setAttribute('width', (64 * hc / N).toFixed(2)); hTxt.textContent = Math.floor(hc) + ' / ' + N;
          if (hc >= N) hand = null;
        }
        flyers = flyers.filter(function (f) {
          var p = (now - f.t0) / FLIGHT;
          if (p >= 1) { arrive(f); return false; }
          var to = f.ok ? TO.ok : TO.no, e = p * p * (3 - 2 * p);
          f.el.setAttribute('transform', 'translate(' + (FROM[0] + (to[0] - FROM[0]) * e).toFixed(2) + ' ' + (FROM[1] + (to[1] - FROM[1]) * e).toFixed(2) + ')');
          return true;
        });
        if (run && run.i >= N && !flyers.length) finish();
        if (run || flyers.length || hand) raf = requestAnimationFrame(tick);
      }

      setPerson(); hopper2(N); paintPins();
      return {
        destroy: function () {
          if (raf) cancelAnimationFrame(raf);
          timers.forEach(clearTimeout); tweens.forEach(function (t) { if (t && t.cancel) t.cancel(); });
        }
      };
    }
  });
})(window.DB);
