/* 17 Key-value: find one cart on an unsorted shelf (open boxes one by one), then let the hash function point straight at its bucket. */
(function (DB) {
  var h = DB.h;
  var NB = 40, NK = 28, TARGET = 'c:8812';

  function hash(k) {
    var x = 7, i;
    for (i = 0; i < k.length; i++) x = (x * 31 + k.charCodeAt(i)) % 1000003;
    return x % NB;
  }

  DB.addGame('17', {
    hint: 'Find the key: scan every box, then hash it',
    mount: function (root, api) {
      var rnd = DB.rng(17), keys = [], bucketKey = [], used = {}, i;
      used[hash(TARGET)] = 1;
      while (keys.length < NK - 1) {
        var k = 'usc'.charAt(Math.floor(rnd() * 3)) + ':' + (100 + Math.floor(rnd() * 8900)), b = hash(k);
        if (k === TARGET || used[b]) continue;
        used[b] = 1; keys.push(k);
      }
      keys.splice(24, 0, TARGET);
      keys.forEach(function (key) { bucketKey[hash(key)] = key; });
      var seq = [TARGET, keys[5], keys[17], keys[10]];

      var mode = 'scan', ticket = 0, opened, steps, finished, hashed, sweeping = false, spin = 0;
      var result = { scan: 0, hash: 0 }, solved = false;

      var msg = h('div', { class: 'g-msg' });
      var keyEl = h('b', {}, '');
      var outEl = h('b', { class: 'out' }, '#?');
      var machine = h('button', { class: 'machine', on: { pointerdown: runHash } },
        h('span', { class: 'g-label' }, 'hash(key)'), outEl);
      var stepsB = h('b', {}, '0');
      var shelf = h('div', { class: 'shelf' });
      var scanBdg = h('i', { class: 'bdg' }), hashBdg = h('i', { class: 'bdg' });
      var scanBtn = h('button', { class: 'g-btn on', on: { click: function () { setMode('scan'); } } }, 'Scan the shelf', scanBdg);
      var hashBtn = h('button', { class: 'g-btn alt', on: { click: function () { setMode('hash'); } } }, 'Hash the key', hashBdg);
      var nextBtn = h('button', { class: 'g-btn alt', on: { click: nextKey } }, 'Another key');

      root.append(
        h('div', { class: 'g-row' }, h('span', { class: 'g-label' }, 'Key-value store'), h('div', { class: 'g-grow' }), msg),
        h('div', { class: 'g-row g-grow body' },
          h('div', { class: 'side' },
            h('div', { class: 'g-card g-tint ticket' }, h('span', { class: 'g-label' }, 'Request'), h('div', { class: 'g-mono call' }, 'get(', keyEl, ')')),
            machine,
            h('div', { class: 'g-stat' }, stepsB, h('span', {}, 'boxes opened'))),
          shelf),
        h('div', { class: 'g-row ctl' }, scanBtn, hashBtn, h('div', { class: 'g-grow' }), nextBtn));

      shelf.addEventListener('pointerdown', function (e) { e.preventDefault(); sweeping = true; hit(e); });
      shelf.addEventListener('pointermove', function (e) { if (sweeping) hit(e); });
      function stopSweep() { sweeping = false; }
      window.addEventListener('pointerup', stopSweep);
      window.addEventListener('pointercancel', stopSweep);

      function hit(e) {
        var el = document.elementFromPoint(e.clientX, e.clientY), box = el && el.closest && el.closest('.box');
        if (box && shelf.contains(box)) open(Number(box.dataset.i));
      }

      function keyAt(i) { return mode === 'scan' ? keys[i] : bucketKey[i]; }

      function setMode(m) { mode = m; reset(); }
      function nextKey() { ticket = (ticket + 1) % seq.length; reset(); }

      function reset() {
        clearInterval(spin);
        opened = {}; steps = 0; finished = false; hashed = -1;
        keyEl.textContent = seq[ticket]; stepsB.textContent = '0'; outEl.textContent = '#?';
        shelf.className = 'shelf ' + mode;
        shelf.textContent = '';
        var n = mode === 'scan' ? NK : NB;
        for (var i = 0; i < n; i++) {
          var empty = mode === 'hash' && !bucketKey[i];
          shelf.append(h('div', { class: 'box' + (empty ? ' empty' : ''), data: { i: i } },
            h('i', { class: 'lid' }), h('span', { class: 'no' }, mode === 'hash' ? String(i) : ''), h('span', { class: 'key' })));
        }
        machine.classList.toggle('off', mode !== 'hash');
        machine.classList.toggle('g-pulse', mode === 'hash');
        msg.className = 'g-msg';
        msg.textContent = mode === 'scan' ? 'Open boxes until you find the key.' : 'Tap the hash machine, then open that bucket.';
        paintTabs();
      }

      function paintTabs() {
        scanBtn.className = 'g-btn ' + (mode === 'scan' ? 'on' : 'alt');
        hashBtn.className = 'g-btn ' + (mode === 'hash' ? 'on' : 'alt') + (result.scan && !result.hash && mode === 'scan' ? ' g-pulse' : '');
        scanBdg.textContent = result.scan || ''; hashBdg.textContent = result.hash || '';
        scanBdg.style.display = result.scan ? '' : 'none'; hashBdg.style.display = result.hash ? '' : 'none';
      }

      function open(i) {
        if (finished || opened[i]) return;
        if (mode === 'hash' && hashed < 0) {
          machine.classList.remove('g-shake'); void machine.getBoundingClientRect(); machine.classList.add('g-shake');
          msg.className = 'g-msg bad'; msg.textContent = 'Hash the key first.';
          return;
        }
        opened[i] = true; steps++; stepsB.textContent = steps;
        var box = shelf.children[i], key = keyAt(i), isHit = key === seq[ticket];
        box.classList.add('open', isHit ? 'hit' : 'miss');
        box.querySelector('.key').textContent = key || '';
        if (!isHit) { msg.className = 'g-msg'; msg.textContent = mode === 'scan' ? 'Not this one…' : 'Wrong bucket.'; return; }
        finished = true; result[mode] = steps;
        msg.className = 'g-msg good';
        msg.textContent = steps === 1 ? 'Found with 1 box opened.' : 'Found after ' + steps + ' boxes.';
        paintTabs();
        if (result.scan && result.hash && !solved) {
          solved = true; api.done(true);
          msg.textContent = result.scan + ' boxes vs ' + result.hash + ': hash goes straight there.';
        }
      }

      function runHash(e) {
        if (e) e.preventDefault();
        if (mode !== 'hash' || hashed >= 0 || finished) return;
        var b = hash(seq[ticket]), n = 0;
        machine.classList.remove('g-pulse');
        spin = setInterval(function () {
          n++;
          if (n < 11) { outEl.textContent = '#' + Math.floor(rnd() * NB); return; }
          clearInterval(spin);
          hashed = b; outEl.textContent = '#' + b; outEl.classList.remove('g-pop'); void outEl.getBoundingClientRect(); outEl.classList.add('g-pop');
          msg.className = 'g-msg'; msg.textContent = 'Bucket ' + b + '. Open that box.';
        }, 55);
      }

      reset();
      return { destroy: function () { clearInterval(spin); window.removeEventListener('pointerup', stopSweep); window.removeEventListener('pointercancel', stopSweep); } };
    }
  });
})(window.DB);
