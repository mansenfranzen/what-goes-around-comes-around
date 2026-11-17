/* 09 CODASYL: records sit in owner/member sets; a program reaches data by hopping pointer to pointer, so it must know the path. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var W = 176, H = 118, PART_Y = 56, SLOTS = [16, 49, 82, 114, 147];
  var COLOR = { sup: '#6741D9', use: '#F76707' };
  var SETNAME = { sup: 'supplies', use: 'used-in' };
  var BASE = {
    acme: { kind: 'owner', set: 'sup', name: 'Acme', x: 49, y: 13, hw: 14, hh: 5 },
    orbit: { kind: 'owner', set: 'sup', name: 'Orbit', x: 130.5, y: 13, hw: 14, hh: 5 },
    engine: { kind: 'owner', set: 'use', name: 'Engine', x: 30, y: 101, hw: 14, hh: 5 },
    tank: { kind: 'owner', set: 'use', name: 'Tank', x: 88, y: 101, hw: 14, hh: 5 },
    hull: { kind: 'owner', set: 'use', name: 'Hull', x: 146, y: 101, hw: 14, hh: 5 }
  };
  ['valve', 'pump', 'seal', 'nut', 'bolt'].forEach(function (p) { BASE[p] = { kind: 'part', name: p, y: PART_Y, hw: 11, hh: 4.6 }; });
  var CMDS = [
    { verb: 'NEXT', set: 'sup' }, { verb: 'OWNER', set: 'sup' },
    { verb: 'NEXT', set: 'use' }, { verb: 'OWNER', set: 'use' }
  ];
  var PACE = 650;

  function clip(c, to, hw, hh, gap) {
    var dx = to.x - c.x, dy = to.y - c.y;
    if (!dx && !dy) return { x: c.x, y: c.y };
    var t = Math.min(dx ? (hw + gap) / Math.abs(dx) : 1e9, dy ? (hh + gap) / Math.abs(dy) : 1e9);
    return { x: c.x + dx * t, y: c.y + dy * t };
  }

  DB.addGame('09', {
    hint: 'You are the query planner: hop along the pointers',
    mount: function (root, api) {
      var chains, pos = {}, cur = 'acme', program = [], stage = 'play', reorganised = false;
      var busy = false, tw = null, timers = [];
      chains = { sup: { acme: ['valve', 'pump', 'seal'], orbit: ['nut', 'bolt'] }, use: { engine: ['valve', 'nut'], tank: ['pump', 'bolt'], hull: ['seal'] } };

      function layout() {
        var i = 0;
        ['acme', 'orbit'].forEach(function (o) { chains.sup[o].forEach(function (p) { pos[p] = { x: SLOTS[i++], y: PART_Y }; }); });
        Object.keys(BASE).forEach(function (id) { if (BASE[id].kind === 'owner') pos[id] = { x: BASE[id].x, y: BASE[id].y }; });
      }
      layout();

      function ownerOf(set, part) {
        var o = null;
        Object.keys(chains[set]).forEach(function (k) { if (chains[set][k].indexOf(part) >= 0) o = k; });
        return o;
      }
      function nextOf(set, id) {
        var r = BASE[id];
        if (r.kind === 'owner') return r.set === set ? chains[set][id][0] : null;
        var o = ownerOf(set, id), ch = chains[set][o], i = ch.indexOf(id);
        return i + 1 < ch.length ? ch[i + 1] : o;
      }
      function target(cmd, id) { return cmd.verb === 'NEXT' ? nextOf(cmd.set, id) : (BASE[id].kind === 'part' ? ownerOf(cmd.set, id) : null); }
      function ctrl(set, a, b) {
        var pa = pos[a], pb = pos[b], mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2;
        if (BASE[a].kind === 'part' && BASE[b].kind === 'part') return { x: mx, y: my + (set === 'sup' ? -1 : 1) * Math.min(20, 5 + Math.abs(pa.x - pb.x) * 0.28) };
        return { x: mx, y: my };
      }

      /* ---------- scene ---------- */
      var ringG = S('g'), jumpG = S('g'), nodeG = S('g'), curG = S('rect', { class: 'cur', width: 34, height: 15, rx: 3.5 });
      var net = S('svg', { class: 'net', viewBox: '0 0 ' + W + ' ' + H },
        S('text', { class: 'ax sup', 'font-size': 3.4, x: 3, y: 5 }, 'SUPPLIERS'),
        S('text', { class: 'ax use', 'font-size': 3.4, x: 3, y: 115.5 }, 'ASSEMBLIES'),
        ringG, jumpG, nodeG, curG);
      var nodeEl = {};
      Object.keys(BASE).forEach(function (id) {
        var r = BASE[id];
        var g = S('g', { class: 'rec ' + r.kind + (r.set ? ' ' + r.set : '') },
          S('rect', { class: 'box', x: -r.hw, y: -r.hh, width: r.hw * 2, height: r.hh * 2, rx: 2.2 }),
          S('text', { class: 'lbl', 'font-size': 4.2, x: 0, y: 1.5, 'text-anchor': 'middle' }, r.name));
        nodeEl[id] = g; nodeG.append(g);
      });

      function drawRings() {
        ringG.textContent = '';
        ['sup', 'use'].forEach(function (set) {
          Object.keys(chains[set]).forEach(function (o) {
            var order = [o].concat(chains[set][o], [o]);
            for (var i = 0; i < order.length - 1; i++) seg(set, order[i], order[i + 1]);
          });
        });
        Object.keys(nodeEl).forEach(function (id) { nodeEl[id].setAttribute('transform', 'translate(' + pos[id].x.toFixed(2) + ' ' + pos[id].y.toFixed(2) + ')'); });
      }
      function seg(set, a, b) {
        var c = ctrl(set, a, b), ra = BASE[a], rb = BASE[b];
        var p0 = clip(pos[a], c, ra.hw, ra.hh, 1.2), p1 = clip(pos[b], c, rb.hw, rb.hh, 1.6);
        var ang = Math.atan2(p1.y - c.y, p1.x - c.x), ax = 2.6, col = COLOR[set];
        function pt(da, d) { return (p1.x - Math.cos(ang + da) * d).toFixed(2) + ',' + (p1.y - Math.sin(ang + da) * d).toFixed(2); }
        ringG.append(
          S('path', { class: 'ring ' + set, d: 'M' + p0.x.toFixed(2) + ' ' + p0.y.toFixed(2) + 'Q' + c.x.toFixed(2) + ' ' + c.y.toFixed(2) + ' ' + p1.x.toFixed(2) + ' ' + p1.y.toFixed(2), stroke: col }),
          S('polygon', { class: 'arrow', fill: col, points: p1.x.toFixed(2) + ',' + p1.y.toFixed(2) + ' ' + pt(0.45, ax) + ' ' + pt(-0.45, ax) }));
      }
      function placeCursor(p) { curG.setAttribute('x', (p.x - 17).toFixed(2)); curG.setAttribute('y', (p.y - 7.5).toFixed(2)); }
      function markCur() { Object.keys(nodeEl).forEach(function (id) { nodeEl[id].classList.toggle('here', id === cur); }); }
      drawRings(); placeCursor(pos[cur]); markCur();

      /* ---------- panels ---------- */
      var msg = h('div', { class: 'g-msg g-grow' }, 'Reach the answer by hopping along pointers.');
      var cmdBtns = CMDS.map(function (c) {
        return h('button', { class: 'cmd ' + c.set, on: { click: function () { press(c); } } },
          h('b', {}, 'FIND ' + c.verb), h('span', {}, 'WITHIN ' + SETNAME[c.set]));
      });
      var listing = h('div', { class: 'g-code listing' });
      var missionText = h('p', {}, 'Which assembly uses Acme\'s 2nd part?');
      var startBtn = h('button', { class: 'g-btn alt', on: { click: restart } }, 'Start over');
      var stageBtn = h('button', { class: 'g-btn cat hid', on: { click: stageAction } }, '');
      root.append(
        h('div', { class: 'g-row' }, h('span', { class: 'g-label' }, 'Network database'), msg),
        h('div', { class: 'main' },
          h('div', { class: 'left' }, net, h('div', { class: 'cmds' }, cmdBtns)),
          h('div', { class: 'side' },
            h('div', { class: 'g-card g-tint mission' }, h('span', { class: 'g-label' }, 'Mission'), missionText),
            h('div', { class: 'g-label' }, 'Your program'), listing,
            stageBtn, startBtn)));

      function renderListing(active, bad) {
        listing.textContent = '';
        ['FIND ' + BASE.acme.name.toUpperCase()].concat(program.map(function (c) { return 'FIND ' + c.verb + ' WITHIN ' + SETNAME[c.set]; })).forEach(function (t, i) {
          listing.append(h('div', { class: 'ln' + (i === active ? ' run' : '') + (bad && i === program.length ? ' bad' : '') }, t));
        });
        listing.scrollTop = listing.scrollHeight;
      }
      renderListing(-1);

      function setMsg(t, cls) { msg.className = 'g-msg g-grow' + (cls ? ' ' + cls : ''); msg.textContent = t; }
      function setCmds(on) { cmdBtns.forEach(function (b) { b.classList.toggle('off', !on); }); }

      /* ---------- moving the cursor ---------- */
      function moveTo(c, to, done) {
        var a = pos[cur], b = pos[to], k = ctrl(c.set, cur, to), from = cur;
        busy = true;
        if (c.verb === 'OWNER') {
          var jp = S('path', { class: 'jump', d: 'M' + a.x + ' ' + a.y + 'L' + b.x + ' ' + b.y, stroke: COLOR[c.set] });
          jumpG.append(jp);
          timers.push(setTimeout(function () { jp.remove(); }, 1400));
        }
        tw = DB.tween({
          from: 0, to: 1, ms: 420, onUpdate: function (t) {
            var u = 1 - t;
            placeCursor({ x: u * u * a.x + 2 * u * t * k.x + t * t * b.x, y: u * u * a.y + 2 * u * t * k.y + t * t * b.y });
          }, onDone: function () { cur = to; markCur(); busy = false; tw = null; if (done) done(from); }
        });
      }
      function shake(t) {
        curG.classList.remove('bad'); void curG.getBoundingClientRect(); curG.classList.add('bad');
        setMsg(t, 'bad');
      }

      function press(c) {
        if (busy || stage !== 'play') return;
        var to = target(c, cur);
        if (!to) return shake('No such pointer from ' + BASE[cur].name + '. Try another command.');
        curG.classList.remove('bad');
        program.push(c);
        renderListing(-1);
        setMsg('FIND ' + c.verb + ' WITHIN ' + SETNAME[c.set] + ' -> ' + BASE[to].name);
        moveTo(c, to, function () { if (cur === 'tank') found(); });
      }

      function found() {
        if (reorganised) {
          setMsg('Rewritten by hand. And so must every other program be.', 'good');
          return;
        }
        stage = 'saved'; setCmds(false);
        setMsg('Found it: Tank, with ' + program.length + ' commands. Program saved.', 'good');
        stageBtn.textContent = 'Reorganise storage'; stageBtn.classList.remove('hid'); stageBtn.classList.add('g-pop');
      }

      function stageAction() {
        if (busy) return;
        if (stage === 'saved') reorganise();
        else if (stage === 'reorg') run();
      }

      function reorganise() {
        busy = true; stageBtn.classList.add('hid');
        var old = {};
        Object.keys(pos).forEach(function (k) { old[k] = { x: pos[k].x, y: pos[k].y }; });
        chains.sup.acme = ['pump', 'valve', 'seal'];
        layout();
        var goal = {};
        Object.keys(pos).forEach(function (k) { goal[k] = { x: pos[k].x, y: pos[k].y }; });
        missionText.textContent = 'Still wanted: the assembly that uses the pump.';
        setMsg('Storage reorganised: Acme\'s parts were re-sorted.');
        tw = DB.tween({
          from: 0, to: 1, ms: 900, onUpdate: function (t) {
            Object.keys(goal).forEach(function (k) { pos[k] = { x: DB.lerp(old[k].x, goal[k].x, t), y: DB.lerp(old[k].y, goal[k].y, t) }; });
            drawRings(); placeCursor(pos[cur]);
          }, onDone: function () {
            busy = false; tw = null; reorganised = true; stage = 'reorg';
            stageBtn.textContent = 'Run saved program'; stageBtn.classList.remove('hid'); stageBtn.classList.add('g-pop');
            setMsg('Same data, new layout. Run your program again.');
          }
        });
      }

      function run() {
        stage = 'run'; stageBtn.classList.add('hid'); startBtn.classList.add('off');
        cur = 'acme'; markCur(); placeCursor(pos.acme);
        renderListing(0);
        setMsg('Running ' + program.length + ' saved commands...');
        var i = 0;
        (function step() {
          if (i >= program.length) return end();
          var c = program[i], to = target(c, cur);
          timers.push(setTimeout(function () {
            if (!to) return end();
            renderListing(i + 1);
            moveTo(c, to, function () { i++; step(); });
          }, PACE * 0.6));
        })();
      }

      function end() {
        stage = 'ran'; startBtn.classList.remove('off'); startBtn.classList.remove('alt'); startBtn.classList.add('cat'); startBtn.textContent = 'Rewrite the program';
        var ok = cur === 'tank';
        renderListing(-1, !ok);
        if (ok) setMsg('Still works (lucky!). Rewrite it anyway.', 'good');
        else { setMsg('Wanted Tank, got ' + BASE[cur].name + '. The program is broken.', 'bad'); curG.classList.add('bad'); }
        api.hint('The programmer is the query planner');
        api.done(true);
      }

      function restart() {
        if (busy && stage === 'run') return;
        if (tw) tw.cancel();
        tw = null; busy = false; cur = 'acme'; program = []; stage = 'play';
        curG.classList.remove('bad'); startBtn.classList.add('alt'); startBtn.classList.remove('cat'); startBtn.textContent = 'Start over';
        stageBtn.classList.add('hid'); setCmds(true);
        placeCursor(pos[cur]); markCur(); renderListing(-1);
        setMsg(reorganised ? 'Find the pump\'s assembly again, in the new layout.' : 'Reach the answer by hopping along pointers.');
      }

      return { destroy: function () { if (tw) tw.cancel(); timers.forEach(clearTimeout); } };
    }
  });
})(window.DB);
