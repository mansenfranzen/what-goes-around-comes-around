/* 20 Blockchain: rewrite one block, watch every later block break, re-mine the chain, and meet the majority. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var N = 5, DIFF = 0x1000;
  var TX = [['Ana', 'Bo', 40], ['Bo', 'Cy', 15], ['Cy', 'Di', 30], ['Di', 'Ed', 25], ['Ed', 'Fay', 10]];
  var ALT = [900, 1, 250, 777, 5000, 60, 333, 12];
  var PEERS = ['A', 'B', 'C'];

  function fnv(s) {
    var x = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); }
    x ^= x >>> 15; x = Math.imul(x, 0x2c1b3c6d); x ^= x >>> 12;
    return (x >>> 0) & 0xffff;
  }
  function hex(n) { return ('000' + n.toString(16)).slice(-4); }
  function data(i, amt) { return TX[i][0] + '>' + TX[i][1] + ':' + amt; }
  function digest(prev, d, nonce) { return fnv(prev + '|' + d + '|' + nonce); }
  function mine(prev, d) { var n = 0; while (digest(prev, d, n) >= DIFF) n++; return n; }
  function fingerprint(prevs, hs) { return fnv(prevs.join('.') + hs.join('.')); }
  function swatch(hx) { var v = parseInt(hx, 16); return 'hsl(' + ((v * 47) % 360) + ' 72% 56%)'; }

  function icon() {
    return S('svg', { class: 'ico', viewBox: '0 0 24 24' },
      S('circle', { class: 'ic-bg', cx: 12, cy: 12, r: 11 }),
      S('path', { class: 'ic ok', d: 'M6.5 12.5l3.8 3.8 7.2-8' }),
      S('path', { class: 'ic bad', d: 'M7.5 7.5l9 9M16.5 7.5l-9 9' }),
      S('path', { class: 'ic stale', d: 'M9.2 9.6a2.9 2.9 0 1 1 4 2.6c-.8.4-1.2.9-1.2 1.8M12 17.2v.2' }),
      S('path', { class: 'ic mining', d: 'M12 6v6l4 2.5' }));
  }
  function linkSvg() {
    return S('svg', { class: 'lk', viewBox: '0 0 30 16' },
      S('g', { class: 'whole' }, S('rect', { x: 2, y: 3, width: 16, height: 10, rx: 5 }), S('rect', { x: 12, y: 3, width: 16, height: 10, rx: 5 })),
      S('g', { class: 'snap' }, S('rect', { x: 1, y: 3, width: 11, height: 10, rx: 5 }), S('rect', { x: 18, y: 3, width: 11, height: 10, rx: 5 }),
        S('path', { d: 'M14 1.5l-1 3.5M16 15l1-3.5' })));
  }
  function pencil() {
    return S('svg', { class: 'pen', viewBox: '0 0 24 24' }, S('path', { d: 'M4 20l1.2-4.6L16.4 4.2l3.4 3.4L8.6 18.8zM14 6.6l3.4 3.4' }));
  }

  DB.addGame('20', {
    hint: 'Rewrite history: tap an amount, then try to cover your tracks',
    mount: function (root, api) {
      var blocks = [], hashes = [], sealed = [], opts = [], status = [], mineIdx = -1, busy = false, tries = 0, cur = null;
      var snap = [];

      var prev = '0000';
      for (var i = 0; i < N; i++) {
        var d = data(i, TX[i][2]), nonce = mine(prev, d), hv = digest(prev, d, nonce);
        blocks.push({ idx: 0, prev: prev, nonce: nonce }); sealed.push(hv); snap.push({ prev: prev, nonce: nonce });
        var list = [TX[i][2]];
        for (var a = 0; a < ALT.length && list.length < 4; a++) if (digest(prev, data(i, ALT[a]), nonce) >= DIFF) list.push(ALT[a]);
        opts.push(list); prev = hex(hv);
      }
      var peerTip = fingerprint(snap.map(function (x) { return x.prev; }), sealed);

      var msg = h('div', { class: 'g-msg' }, 'Tap an amount to change a block.');
      var rule = h('span', { class: 'rule' }, 'valid hash = starts with 0');
      var chainEl = h('div', { class: 'lchain' });
      var el = [], links = [];
      for (i = 0; i < N; i++) {
        if (i) { var lk = h('div', { class: 'link' }, linkSvg()); links[i] = lk; chainEl.append(lk); }
        var b = {};
        b.amtBtn = h('button', { class: 'amt', title: 'Change the amount', on: { click: tamper.bind(null, i) } },
          h('span', { class: 'who' }, TX[i][0] + ' \u2192 ' + TX[i][1]),
          h('span', { class: 'val' }, b.old = h('s', { class: 'old' }), b.now = h('b', {}), pencil()));
        b.prevV = h('span', { class: 'v' }); b.prevSw = h('i', { class: 'sw' });
        b.nonceV = h('span', { class: 'v n' });
        b.hashV = h('span', { class: 'v' }); b.hashSw = h('i', { class: 'sw' }); b.hashLead = h('em', {}); b.hashRest = h('span', {});
        b.hashV.append(b.hashLead, b.hashRest);
        b.root = h('div', { class: 'blk' },
          h('div', { class: 'bh' }, h('span', { class: 'no' }, 'BLOCK ' + (i + 1)), icon()),
          b.amtBtn,
          h('div', { class: 'f' }, h('span', { class: 'k' }, 'prev'), h('span', { class: 'val2' }, b.prevSw, b.prevV)),
          h('div', { class: 'f' }, h('span', { class: 'k' }, 'nonce'), b.nonceV),
          h('div', { class: 'f hf' }, h('span', { class: 'k' }, 'hash'), h('span', { class: 'val2' }, b.hashSw, b.hashV)));
        el.push(b); chainEl.append(b.root);
      }

      var youCells = [], youTip = h('span', { class: 'tip' }), youSw = h('i', { class: 'sw' });
      var you = h('div', { class: 'peer you' }, h('span', { class: 'who2' }, 'YOU'),
        h('span', { class: 'cells' }, (function () { for (var c = 0; c < N; c++) youCells.push(h('i', { class: 'cell' })); return youCells; })()),
        h('span', { class: 'tipw' }, youSw, youTip));
      var verdict = h('div', { class: 'verdict' });
      var peerEls = PEERS.map(function (p) {
        var cells = []; for (var c = 0; c < N; c++) cells.push(h('i', { class: 'cell ok' }));
        return h('div', { class: 'peer' }, h('span', { class: 'who2' }, 'PEER ' + p), h('span', { class: 'cells' }, cells),
          h('span', { class: 'tipw' }, h('i', { class: 'sw', style: { background: swatch(hex(peerTip)) } }), h('span', { class: 'tip' }, hex(peerTip))));
      });
      var peersRow = h('div', { class: 'peers' }, you, h('span', { class: 'vs' }, 'vs'), peerEls, verdict);

      var mineBtn = h('button', { class: 'g-btn cat', disabled: true, on: { click: remine } }, 'Re-mine the chain');
      var undoBtn = h('button', { class: 'g-btn alt', disabled: true, on: { click: restore } }, 'Restore original');
      var work = h('span', { class: 'work' });

      root.append(
        h('div', { class: 'g-row' }, rule, h('div', { class: 'g-grow' }), msg),
        chainEl, peersRow,
        h('div', { class: 'g-row g-center' }, h('span', { class: 'work' }), mineBtn, undoBtn, work));

      function amtOf(i) { return opts[i][blocks[i].idx]; }

      function recalc() {
        for (var i = 0; i < N; i++) hashes[i] = digest(blocks[i].prev, data(i, amtOf(i)), blocks[i].nonce);
        var broken = false;
        for (i = 0; i < N; i++) {
          if (broken) status[i] = 'stale';
          else if (i === mineIdx) { status[i] = 'mining'; broken = true; }
          else if (hashes[i] >= DIFF || (i > 0 && blocks[i].prev !== hex(hashes[i - 1]))) { status[i] = 'bad'; broken = true; }
          else status[i] = 'ok';
        }
      }
      function firstBad() { for (var i = 0; i < N; i++) if (status[i] !== 'ok') return i; return -1; }

      function render() {
        var fb = firstBad();
        for (var i = 0; i < N; i++) {
          var b = el[i], bl = blocks[i], hx = hex(hashes[i]);
          b.root.className = 'blk ' + status[i];
          b.root.style.transitionDelay = status[i] === 'stale' ? Math.max(0, i - fb) * 130 + 'ms' : '0ms';
          b.now.textContent = '$' + amtOf(i);
          b.old.textContent = bl.idx ? '$' + TX[i][2] : '';
          b.prevV.textContent = bl.prev; b.prevSw.style.background = swatch(bl.prev);
          b.prevV.classList.toggle('diff', i > 0 && bl.prev !== hex(hashes[i - 1]));
          b.nonceV.textContent = bl.nonce;
          b.hashLead.textContent = hx.charAt(0); b.hashRest.textContent = hx.slice(1); b.hashSw.style.background = swatch(hx);
          b.hashLead.className = hashes[i] < DIFF ? 'pass' : 'fail';
          if (i) links[i].className = 'link ' + (status[i] === 'ok' || status[i] === 'mining' ? 'ok' : status[i]);
          youCells[i].className = 'cell ' + status[i];
        }
        var fp = fingerprint(blocks.map(function (x) { return x.prev; }), hashes), tip = hex(fp), agree = fb < 0 && fp === peerTip;
        youTip.textContent = tip; youSw.style.background = swatch(tip);
        you.classList.toggle('out', !agree);
        verdict.className = 'verdict ' + (agree ? 'good' : 'bad');
        verdict.textContent = agree ? 'same ledger: 4 / 4 agree' : 'your copy differs: 3 vs 1';
        var edited = false;
        for (i = 0; i < N; i++) if (blocks[i].idx || blocks[i].prev !== snap[i].prev || blocks[i].nonce !== snap[i].nonce) edited = true;
        mineBtn.disabled = busy || fb < 0;
        undoBtn.disabled = busy || !edited;
        work.textContent = tries ? tries + ' hashes tried' : '';
      }

      function say(text, cls) { msg.className = 'g-msg' + (cls ? ' ' + cls : ''); msg.textContent = text; }

      function tamper(i) {
        if (busy) return;
        var bl = blocks[i];
        bl.idx = (bl.idx + 1) % opts[i].length;
        tries = 0; recalc(); render();
        var amt = el[i].amtBtn; amt.classList.remove('g-shake'); void amt.offsetWidth; amt.classList.add('g-shake');
        var fb = firstBad();
        if (fb < 0) say('Back to the original: every block checks out.', 'good');
        else {
          say(fb === N - 1 ? 'Block ' + (fb + 1) + ' changed: its hash no longer fits.' : 'Block ' + (fb + 1) + ' changed: every block after it breaks.', 'bad');
        }
      }

      function restore() {
        if (busy) return;
        for (var i = 0; i < N; i++) { blocks[i].idx = 0; blocks[i].prev = snap[i].prev; blocks[i].nonce = snap[i].nonce; }
        tries = 0; mineIdx = -1; recalc(); render();
        say('Original chain restored.', '');
      }

      function remine() {
        var i = firstBad();
        if (busy || i < 0) return;
        busy = true; tries = 0;
        say('Re-mining ' + (N - i) + ' block' + (N - i > 1 ? 's' : '') + '\u2026', '');
        step(i);
      }
      function step(i) {
        if (i >= N) {
          mineIdx = -1; busy = false; recalc(); render();
          if (youTip.textContent !== hex(peerTip)) { say('Chain valid again, but 3 of 4 copies disagree. Rejected.', 'bad'); api.done(true); }
          else say('Every block checks out.', 'good');
          return;
        }
        var bl = blocks[i];
        bl.prev = i ? hex(hashes[i - 1]) : '0000';
        var d = data(i, amtOf(i)), finalN = mine(bl.prev, d), last = 0;
        mineIdx = i;
        cur = DB.tween({
          from: 0, to: finalN, ms: Math.max(320, Math.min(900, finalN * 30)), ease: function (t) { return t; },
          onUpdate: function (v) {
            var n = Math.round(v); tries += n - last; last = n;
            bl.nonce = n; recalc(); render();
          },
          onDone: function () { bl.nonce = finalN; mineIdx = -1; recalc(); render(); step(i + 1); }
        });
      }

      recalc(); render();
      return { destroy: function () { if (cur) cur.cancel(); } };
    }
  });
})(window.DB);
