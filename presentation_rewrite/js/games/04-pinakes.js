/* 04 Pinakes: find a scroll by opening them one by one, then by looking it up in a sorted catalogue. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var GENRES = [
    { id: 'Poetry', color: '#D6336C', names: ['Alcaeus', 'Archilochus', 'Bacchylides', 'Callimachus', 'Hesiod', 'Homer', 'Pindar', 'Sappho', 'Theocritus'] },
    { id: 'Drama', color: '#7048E8', names: ['Aeschylus', 'Agathon', 'Aristophanes', 'Cratinus', 'Eupolis', 'Euripides', 'Menander', 'Sophocles', 'Thespis'] },
    { id: 'Science', color: '#1971C2', names: ['Archimedes', 'Aristarchus', 'Aristotle', 'Ctesibius', 'Eratosthenes', 'Euclid', 'Herophilus', 'Hippocrates', 'Theophrastus'] },
    { id: 'History', color: '#2B8A3E', names: ['Berossus', 'Ephorus', 'Hecataeus', 'Herodotus', 'Manetho', 'Philochorus', 'Thucydides', 'Timaeus', 'Xenophon'] }
  ];
  var N = 6, COLS = 'ABCDEF';
  var TARGETS = [{ name: 'Euclid', at: 27 }, { name: 'Sappho', at: 31 }];

  function mark(i) { return (Math.floor(i / N) + 1) + COLS.charAt(i % N); }

  DB.addGame('04', {
    hint: 'Find the scroll. First by opening scrolls, then with the catalogue',
    mount: function (root, api) {
      var rnd = DB.rng(7), round = 0, opened, steps = [0, 0], over = false, genre = null, down = false, ptr = null, scrolls = [];

      GENRES.forEach(function (g) { g.names.forEach(function (n) { scrolls.push({ name: n, genre: g }); }); });
      for (var i = scrolls.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = scrolls[i]; scrolls[i] = scrolls[j]; scrolls[j] = t; }
      TARGETS.forEach(function (tg) {
        var from = scrolls.findIndex(function (s) { return s.name === tg.name; }), t2 = scrolls[tg.at];
        scrolls[tg.at] = scrolls[from]; scrolls[from] = t2;
      });
      var tgIdx = TARGETS.map(function (tg) { return tg.at; });

      var label = h('span', { class: 'g-label' }, 'Library of Alexandria');
      var msg = h('div', { class: 'g-msg' });
      var act = h('button', { class: 'g-btn cat', on: { click: onAct } });

      var shelf = h('div', { class: 'shelf' });
      shelf.append(h('i'));
      for (var c = 0; c < N; c++) shelf.append(h('i', { class: 'ax' }, COLS.charAt(c)));
      var cells = [];
      for (var r = 0; r < N; r++) {
        shelf.append(h('i', { class: 'ax' }, String(r + 1)));
        for (c = 0; c < N; c++) {
          var cell = h('button', { class: 'sc', 'data-i': r * N + c },
            S('svg', { class: 'sv', viewBox: '0 0 40 40' },
              S('circle', { class: 'roll', cx: 20, cy: 20, r: 16 }), S('circle', { class: 'coil', cx: 20, cy: 20, r: 10 }),
              S('circle', { class: 'coil', cx: 20, cy: 20, r: 4.5 }), S('text', { class: 'ini', x: 20, y: 26, 'font-size': 18 })));
          cells.push(cell); shelf.append(cell);
        }
      }

      var wName = h('b', { class: 'w-name' }), wGenre = h('span', { class: 'w-genre' }), last = h('div', { class: 'last' });
      var wanted = h('div', { class: 'wanted g-card g-tint' }, h('span', { class: 'lbl' }, 'Wanted'), h('div', { class: 'g-row' }, wName, wGenre), last);
      var statScan = h('b', {}, '0'), statCat = h('b', {}, '–');
      var stats = h('div', { class: 'stats' }, h('div', { class: 'stat' }, statScan, h('span', {}, 'Scanning')), h('div', { class: 'stat cat' }, statCat, h('span', {}, 'Catalogue')));

      var tabs = h('div', { class: 'tabs' }), list = h('div', { class: 'list' });
      GENRES.forEach(function (g) {
        var tb = h('button', { class: 'tab', 'data-g': g.id, on: { click: function () { pickGenre(g); } } }, h('i'), g.id);
        tb.style.setProperty('--g', g.color); tabs.append(tb);
      });
      var cat = h('div', { class: 'catalog g-card' }, h('span', { class: 'lbl' }, 'Pinakes: by genre, then author'), tabs, list);

      root.append(h('div', { class: 'g-row top' }, label, h('div', { class: 'g-grow' }), msg, act),
        h('div', { class: 'main' }, h('div', { class: 'shelf-wrap' }, shelf), h('div', { class: 'side' }, wanted, stats, cat)));

      function say(t, cls) { msg.className = 'g-msg' + (cls ? ' ' + cls : ''); msg.textContent = t; }

      function start(r) {
        round = r; opened = {}; over = false; genre = null; steps[r] = 0; ptr = null;
        cells.forEach(function (el, i) {
          el.className = 'sc'; el.style.removeProperty('--g');
          el.querySelector('.ini').textContent = '';
        });
        var tg = TARGETS[r], gen = scrolls[tg.at].genre;
        wName.textContent = tg.name; wGenre.textContent = gen.id; wGenre.style.background = gen.color;
        last.textContent = ''; last.className = 'last';
        cat.classList.toggle('is-open', r === 1);
        stats.classList.toggle('both', r === 1);
        DB.$$('.tab', tabs).forEach(function (b) { b.classList.remove('is-on'); });
        list.textContent = ''; list.append(h('span', { class: 'empty' }, 'Pick a genre'));
        statScan.textContent = r === 0 ? '0' : String(steps[0]); statCat.textContent = r === 1 ? '0' : '–';
        act.classList.add('is-off');
        say(r === 0 ? 'No catalogue yet: open scrolls until you find ' + tg.name + '.' : 'Now use the catalogue to find ' + tg.name + '.');
      }

      function pickGenre(g) {
        if (over || round !== 1 || genre === g) return;
        genre = g; steps[1]++; statCat.textContent = String(steps[1]);
        DB.$$('.tab', tabs).forEach(function (b) { b.classList.toggle('is-on', b.dataset.g === g.id); });
        list.textContent = '';
        g.names.forEach(function (n) {
          var idx = scrolls.findIndex(function (s) { return s.name === n; });
          var e = h('button', { class: 'ent', on: { pointerenter: function () { point(idx); }, click: function () { point(idx); } } }, h('span', {}, n), h('b', {}, mark(idx)));
          e.style.setProperty('--g', g.color); list.append(e);
        });
        say('Sorted A to Z. Each entry says where its scroll sits.');
      }

      function point(idx) {
        if (ptr !== null) cells[ptr].classList.remove('ptr');
        ptr = idx; cells[idx].classList.add('ptr');
      }

      function openAt(i) {
        if (over || opened[i]) return;
        opened[i] = true;
        var s = scrolls[i], el = cells[i];
        steps[round]++;
        (round === 0 ? statScan : statCat).textContent = String(steps[round]);
        el.classList.add('seen'); el.style.setProperty('--g', s.genre.color);
        el.querySelector('.ini').textContent = s.name.charAt(0);
        var tg = TARGETS[round];
        if (s.name === tg.name) {
          el.classList.add('hit'); over = true;
          last.className = 'last good'; last.textContent = s.name + ': found!';
          found();
        } else {
          last.className = 'last bad'; last.textContent = s.name + ': not it';
        }
      }

      function found() {
        if (round === 0) {
          say(steps[0] < 12 ? 'Lucky! Usually you open half the shelf.' : steps[0] + ' scrolls opened, and that is only 36. Alexandria had hundreds of thousands.', 'bad');
          act.textContent = 'Write a catalogue'; act.classList.remove('is-off');
        } else {
          say(steps[1] + ' steps, not ' + steps[0] + '. Look it up, don\'t read everything.', 'good');
          act.textContent = 'Play again'; act.classList.remove('is-off'); api.done(true);
        }
      }

      function onAct() { start(round === 0 ? 1 : 0); }

      function cellFromEvent(e) {
        var el = document.elementFromPoint(e.clientX, e.clientY);
        el = el && el.closest ? el.closest('.sc') : null;
        return el && shelf.contains(el) ? Number(el.dataset.i) : -1;
      }
      function onDown(e) { var i = cellFromEvent(e); if (i < 0) return; e.preventDefault(); down = true; openAt(i); }
      function onMove(e) { if (!down) return; var i = cellFromEvent(e); if (i >= 0) openAt(i); }
      function onUp() { down = false; }
      shelf.addEventListener('pointerdown', onDown);
      shelf.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);

      start(0);
      return {
        destroy: function () {
          shelf.removeEventListener('pointerdown', onDown); shelf.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerup', onUp); document.removeEventListener('pointercancel', onUp);
        }
      };
    }
  });
})(window.DB);
