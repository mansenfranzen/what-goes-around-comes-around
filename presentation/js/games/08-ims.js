/* 08 IMS: records hang in a tree, so every record can only be reached by walking down through its parent. */
(function (DB) {
  var h = DB.h, S = DB.svg;
  var W = 246, H = 138, NW = 46, NH = 10, XS = [2, 62, 122, 182], LEAF0 = 4, LEAF_DY = 13.5;

  DB.addGame('08', {
    hint: 'Records hide behind their parent: open the tree from the root',
    mount: function (root, api) {
      var nodes = [], leaf = 0, calls = 0, round = 1, finished = false;

      var edgeG = S('g'), nodeG = S('g'), copyG = S('g');
      var tree = S('svg', { class: 'tree', viewBox: '0 0 ' + W + ' ' + H }, edgeG, nodeG, copyG);

      function branch(name, owners) {
        return { n: name, k: Object.keys(owners).map(function (owner) {
          return { n: owner, k: owners[owner].map(function (part) { return { n: part }; }) };
        }) };
      }
      function make(spec, depth, parent) {
        var n = { name: spec.n, depth: depth, parent: parent, kids: [], shown: false, visited: false };
        nodes.push(n);
        (spec.k || []).forEach(function (c) { n.kids.push(make(c, depth + 1, n)); });
        n.y = n.kids.length ? (n.kids[0].y + n.kids[n.kids.length - 1].y) / 2 : LEAF0 + leaf++ * LEAF_DY;
        n.x = XS[depth];
        return n;
      }
      var catalog = DB.partsCatalog();
      var top = make({ n: 'Parts catalog', k: [branch('Suppliers', catalog.sup), branch('Assemblies', catalog.use)] }, 0, null);
      var target = nodes.find(function (n) { return n.name === 'pump' && n.parent.name === 'Acme'; });

      nodes.forEach(function (n) {
        if (n.parent) {
          var px = n.parent.x + NW, py = n.parent.y + NH / 2, mx = (px + n.x) / 2, cy = n.y + NH / 2;
          n.edge = S('path', { class: 'edge hid', d: 'M' + px + ' ' + py + 'C' + mx + ' ' + py + ' ' + mx + ' ' + cy + ' ' + n.x + ' ' + cy });
          edgeG.append(n.edge);
        }
        n.el = S('g', { class: 'nd d' + n.depth + ' hid' },
          S('rect', { class: 'box', width: NW, height: NH, rx: 2.4 }),
          S('text', { class: 'lbl', 'font-size': 4.6, x: NW / 2, y: NH / 2 + 1.65, 'text-anchor': 'middle' }, n.name));
        if (n.kids.length) n.el.append(S('circle', { class: 'plus', cx: NW, cy: NH / 2, r: 2.6 }), S('path', { class: 'plus-mark', d: 'M' + (NW - 1.3) + ' ' + NH / 2 + 'H' + (NW + 1.3) + 'M' + NW + ' ' + (NH / 2 - 1.3) + 'V' + (NH / 2 + 1.3) }));
        var wrap = S('g', { class: 'hit', transform: 'translate(' + n.x + ' ' + n.y + ')' }, n.el);
        wrap.addEventListener('click', function () { visit(n); });
        nodeG.append(wrap);
      });

      var title = h('span', { class: 'g-label' }, 'Mission 1 / 2');
      var msg = h('div', { class: 'g-msg g-grow' }, 'Which assembly uses Acme’s pump? First find it under Suppliers.');
      var slots = [0, 1].map(function () { return h('i', { class: 'slot' }); });
      var callsEl = h('b', {}, '0');
      root.append(
        h('div', { class: 'g-row' }, title, msg,
          h('div', { class: 'slots' }, slots),
          h('div', { class: 'g-stat' }, callsEl, h('span', {}, 'calls'))),
        tree);

      function reveal(n, instant) {
        if (n.shown) return;
        n.shown = true;
        n.el.classList.remove('hid');
        if (!instant) { n.el.classList.add('pop'); n.edge.classList.add('fresh'); }
        if (n.edge) n.edge.classList.remove('hid');
      }
      reveal(top, true);
      top.el.classList.add('hint');

      function visit(n) {
        if (!n.shown || finished) return;
        if (n.visited) return pulse(n);
        n.visited = true; calls++; callsEl.textContent = calls;
        n.el.classList.remove('hint');
        n.el.classList.add('seen');
        if (n.edge) n.edge.classList.add('walked');
        if (n.kids.length) { n.el.classList.add('open'); n.kids.forEach(function (k) { reveal(k); }); }
        if (round === 1 && n === target) return endRound1();
        if (round === 2) progress();
      }

      function pulse(n) { n.el.classList.remove('shake'); void n.el.getBoundingClientRect(); n.el.classList.add('shake'); }

      function endRound1() {
        round = 2;
        msg.className = 'g-msg g-grow good';
        msg.textContent = 'Found Acme’s pump. Now find its copy under Assemblies.';
        title.textContent = 'Mission 2 / 2';
        api.hint('The supplier copy has no link to its assembly. Search the other branch.');
        calls = 0; callsEl.textContent = '0';
        progress(true);
      }

      function progress(quiet) {
        var f = nodes.filter(function (n) { return n.name === 'pump' && n.visited; });
        slots.forEach(function (s, i) { s.classList.toggle('on', i < f.length); });
        f.forEach(function (n) { n.el.classList.add('found'); });
        if (f.length === 2) return finish(f);
        if (!quiet) { msg.className = 'g-msg g-grow'; msg.textContent = 'Which assembly contains the other pump record?'; }
      }

      function finish(f) {
        finished = true;
        var ys = f.map(function (n) { return n.y + NH / 2; }).sort(function (a, b) { return a - b; });
        var x0 = XS[3] + NW, x1 = x0 + 5, cy = (ys[0] + ys[1]) / 2;
        copyG.append(
          S('path', { class: 'copy-line', d: 'M' + x0 + ' ' + ys[0] + 'H' + x1 + 'V' + ys[1] + 'H' + x0 }),
          S('text', { class: 'copy-lbl', 'font-size': 4.2, x: 0, y: 0, 'text-anchor': 'middle', transform: 'translate(' + (x1 + 6) + ' ' + cy + ') rotate(-90)' }, 'one part, two copies'));
        msg.className = 'g-msg g-grow good';
        msg.textContent = 'Tank uses Acme’s pump. Two branches, two copies of one part.';
        api.hint('Fast along one path, stuck everywhere else');
        api.done(true);
      }

      return { destroy: function () {} };
    }
  });
})(window.DB);
