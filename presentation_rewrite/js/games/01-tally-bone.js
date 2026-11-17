/* 01 Tally bone: carve one notch per animal that crosses the gate, then learn the bone cannot say "of what". */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var GATE = 80, WIDTH = 160, SPEED = 38, MAX_NOTCHES = 30;
  var NOTCH_X0 = 30, NOTCH_STEP = 4.4, GROUP_W = 23.6;

  function animal(kind) {
    var g = S('g', { class: 'an ' + kind });
    g.append(
      S('line', { class: 'leg', x1: -2.6, y1: 2, x2: -2.8, y2: 6 }), S('line', { class: 'leg', x1: 2.6, y1: 2, x2: 2.8, y2: 6 }),
      S('ellipse', { class: 'body', cx: 0, cy: 0, rx: 5.4, ry: 3.7 }),
      S('circle', { class: 'head', cx: 6, cy: -1.6, r: 2 }));
    if (kind === 'goat') g.append(S('line', { class: 'horn', x1: 5.4, y1: -3.4, x2: 4.6, y2: -6 }), S('line', { class: 'horn', x1: 6.8, y1: -3.4, x2: 7.8, y2: -5.8 }), S('line', { class: 'horn', x1: 6.4, y1: 0, x2: 6.4, y2: 2.6 }));
    return g;
  }

  DB.addGame('01', {
    hint: 'One animal, one notch: carve as each one crosses the gate',
    mount: function (root, api) {
      var rnd = DB.rng(11), round = 1, notches = 0, run = null, raf = 0, last = null;

      var title = h('span', { class: 'g-label' }, 'Herd 1 / 2');
      var msg = h('div', { class: 'g-msg' }, 'Open the gate and count the herd on the bone.');
      var gateG = S('g', { class: 'gate' },
        S('rect', { class: 'zone', x: GATE - 4, y: 4, width: 8, height: 40, rx: 2 }),
        S('line', { class: 'post', x1: GATE - 4, y1: 12, x2: GATE - 4, y2: 42 }), S('line', { class: 'post', x1: GATE + 4, y1: 12, x2: GATE + 4, y2: 42 }),
        S('line', { class: 'rail', x1: GATE - 4, y1: 18, x2: GATE + 4, y2: 18 }), S('line', { class: 'rail', x1: GATE - 4, y1: 26, x2: GATE + 4, y2: 26 }));
      var field = S('g', { class: 'field' });
      var pasture = S('svg', { class: 'pasture', viewBox: '0 0 ' + WIDTH + ' 52' },
        S('rect', { class: 'ground', x: 0, y: 36, width: WIDTH, height: 16 }), gateG, field);

      var notchG = S('g', { class: 'notches' });
      var bone = S('svg', { class: 'bone', viewBox: '0 0 200 36' },
        S('circle', { class: 'knob', cx: 12, cy: 10, r: 7 }), S('circle', { class: 'knob', cx: 12, cy: 26, r: 7 }),
        S('circle', { class: 'knob', cx: 188, cy: 10, r: 7 }), S('circle', { class: 'knob', cx: 188, cy: 26, r: 7 }),
        S('rect', { class: 'shaft', x: 12, y: 8, width: 176, height: 20, rx: 6 }), notchG);

      var startBtn = h('button', { class: 'g-btn alt', on: { click: start } }, 'Open the gate');
      var carveBtn = h('button', { class: 'g-btn cat', disabled: true, on: { pointerdown: carve } }, 'Carve a notch');

      root.append(
        h('div', { class: 'g-row' }, title, h('div', { class: 'g-grow' }), msg), pasture, bone,
        h('div', { class: 'g-row g-center' }, startBtn, carveBtn));
      bone.addEventListener('pointerdown', carve);

      function drawNotches() {
        notchG.textContent = '';
        for (var i = 0; i < notches; i++) {
          var grp = Math.floor(i / 5), pos = i % 5, x0 = NOTCH_X0 + grp * GROUP_W;
          var el = pos < 4
            ? S('line', { class: 'notch', x1: x0 + pos * NOTCH_STEP, y1: 12, x2: x0 + pos * NOTCH_STEP, y2: 24 })
            : S('line', { class: 'notch slash', x1: x0 - 1.4, y1: 25, x2: x0 + 3 * NOTCH_STEP + 1.4, y2: 11 });
          if (i === notches - 1) el.classList.add('fresh');
          notchG.append(el);
        }
      }

      function carve(e) {
        if (e) e.preventDefault();
        if (!run || notches >= MAX_NOTCHES) return;
        notches++; drawNotches();
      }

      function start() {
        cancelAnimationFrame(raf);
        notches = 0; drawNotches(); field.textContent = '';
        var n = round === 1 ? 6 + Math.floor(rnd() * 5) : 10 + Math.floor(rnd() * 6), at = 0.3;
        var animals = [];
        for (var i = 0; i < n; i++) {
          var kind = round === 2 && rnd() < 0.45 ? 'goat' : 'sheep', g = animal(kind);
          field.append(g);
          animals.push({ g: g, at: at, y: 28 + rnd() * 8, crossed: false });
          at += 0.6 + rnd() * 0.55;
        }
        run = { animals: animals, t0: performance.now(), crossed: 0, n: n };
        last = null;
        startBtn.disabled = true; carveBtn.disabled = false;
        msg.className = 'g-msg'; msg.textContent = 'Carve one notch each time an animal crosses the gate.';
        raf = requestAnimationFrame(frame);
      }

      function frame(now) {
        var t = (now - run.t0) / 1000, allGone = true;
        run.animals.forEach(function (a) {
          var x = -10 + (t - a.at) * SPEED;
          if (x < WIDTH + 10) allGone = false;
          a.g.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + (a.y + Math.sin(t * 9 + a.at * 5) * 0.6).toFixed(2) + ')');
          if (!a.crossed && x >= GATE) { a.crossed = true; run.crossed++; a.g.classList.add('through'); gateG.classList.remove('flash'); void gateG.getBoundingClientRect(); gateG.classList.add('flash'); }
        });
        if (allGone) return finish();
        raf = requestAnimationFrame(frame);
      }

      function finish() {
        var diff = notches - run.n;
        run = null; carveBtn.disabled = true; startBtn.disabled = false;
        if (diff !== 0) {
          msg.className = 'g-msg bad g-shake';
          msg.textContent = (diff > 0 ? 'Too many notches (+' : 'Missed ') + Math.abs(diff) + (diff > 0 ? ').' : ' notch' + (diff === -1 ? '' : 'es') + '.') + ' Try again.';
          startBtn.textContent = 'Same herd size, again';
        } else if (round === 1) {
          msg.className = 'g-msg good'; msg.textContent = notches + ' notches = ' + notches + ' sheep. The bone remembers!';
          round = 2; title.textContent = 'Herd 2 / 2'; startBtn.textContent = 'Next: a mixed herd';
        } else {
          msg.className = 'g-msg good'; msg.textContent = notches + ' notches… sheep or goats? The bone cannot say.';
          startBtn.textContent = 'Play again'; round = 2; api.done(true);
        }
      }

      drawNotches();
      return { destroy: function () { cancelAnimationFrame(raf); bone.removeEventListener('pointerdown', carve); } };
    }
  });
})(window.DB);
