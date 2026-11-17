/* 19 Documents: rename a customer copied into six order documents (six edits), then kept in one referenced record (one edit), and weigh duplication against one-read fetches. */
(function (DB) {
  var h = DB.h;
  var OLD = 'Ada', NEW = 'Ada King', IDS = [1041, 1042, 1045, 1049, 1050, 1054], N = IDS.length;

  DB.addGame('19', {
    hint: 'Ada changed her name: update every order, then try Referenced',
    mount: function (root, api) {
      var rnd = DB.rng(19), mode = 'emb', solved = false;
      var names = IDS.map(function () { return OLD; }), custName = OLD;
      var edits = { emb: 0, ref: 0 }, seen = { emb: true, ref: false }, finished = { emb: false, ref: false };

      var msg = h('div', { class: 'g-msg' });
      var editsB = h('b', {}, '0');
      var docs = IDS.map(function (id, i) {
        var lines = [], k;
        for (k = 0; k < 3; k++) lines.push(h('i', { style: { width: (34 + Math.floor(rnd() * 56)) + '%' } }));
        var who = h('button', { class: 'who', on: { pointerdown: function (e) { e.preventDefault(); renameDoc(i); } } });
        var res = h('span', { class: 'res' }), tag = h('span', { class: 'tag' });
        var el = h('div', { class: 'doc' },
          h('div', { class: 'dh' }, h('b', {}, 'order ' + id), tag),
          h('div', { class: 'dl' }, h('span', { class: 'k' }, 'customer'), who, h('span', { class: 'ref' }, '#7'), res),
          h('div', { class: 'its' }, h('span', { class: 'k' }, 'items'), h('div', { class: 'ls' }, lines)));
        return { el: el, who: who, res: res, tag: tag };
      });

      var custWho = h('button', { class: 'who', on: { pointerdown: function (e) { e.preventDefault(); renameCust(); } } });
      var cust = h('div', { class: 'cust' }, h('b', {}, 'customer #7'), h('span', { class: 'k' }, 'name'), custWho);
      var grid = h('div', { class: 'grid' }, docs.map(function (d) { return d.el; }));
      var stage = h('div', { class: 'stage emb' }, cust, grid);

      function bar(name, tone) {
        var fill = h('i', { class: 'fill ' + tone }), val = h('b', {}, '–');
        return { fill: fill, val: val, el: h('div', { class: 'cb' }, h('span', { class: 'cn' }, name), h('div', { class: 'trk' }, fill), val) };
      }
      var eEmb = bar('Embedded', 'bad'), eRef = bar('Referenced', 'good'), rEmb = bar('Embedded', 'good'), rRef = bar('Referenced', 'bad');

      var embBtn = h('button', { class: 'g-btn on', on: { click: function () { setMode('emb'); } } }, h('i', { class: 'ico emb' }), 'Embedded');
      var refBtn = h('button', { class: 'g-btn alt', on: { click: function () { setMode('ref'); } } }, h('i', { class: 'ico ref' }), 'Referenced');
      var againBtn = h('button', { class: 'g-btn alt', on: { click: reset } }, 'Again');

      root.append(
        h('div', { class: 'g-row' },
          h('div', { class: 'g-code' }, 'name: ', h('span', { class: 's' }, '"' + OLD + '"'), ' -> ', h('span', { class: 's' }, '"' + NEW + '"')),
          h('div', { class: 'g-grow' }), msg),
        h('div', { class: 'g-row g-grow body' },
          stage,
          h('div', { class: 'side' },
            h('div', { class: 'g-stat' }, editsB, h('span', {}, 'edits made')),
            h('div', { class: 'cmp' }, h('span', { class: 'g-label' }, 'Edits to rename'), eEmb.el, eRef.el),
            h('div', { class: 'cmp' }, h('span', { class: 'g-label' }, 'Reads per order'), rEmb.el, rRef.el))),
        h('div', { class: 'g-row ctl' }, embBtn, refBtn, h('div', { class: 'g-grow' }), againBtn));

      function say(t, cls) { msg.textContent = t; msg.className = 'g-msg' + (cls ? ' ' + cls : ''); }
      function flash(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

      function paint() {
        var anyNew = names.some(function (n) { return n === NEW; });
        stage.className = 'stage ' + mode;
        docs.forEach(function (d, i) {
          var cur = mode === 'emb' ? names[i] : custName, fresh = cur === NEW, stale = mode === 'emb' && anyNew && !fresh;
          d.who.textContent = '"' + cur + '"';
          d.who.className = 'who ' + (fresh ? 'new' : 'old');
          d.res.textContent = cur;
          d.el.className = 'doc' + (fresh ? ' fresh' : '') + (stale ? ' stale' : '');
          d.tag.textContent = fresh ? 'fixed' : stale ? 'stale' : '';
        });
        custWho.textContent = '"' + custName + '"';
        custWho.className = 'who ' + (custName === NEW ? 'new' : 'old');
        editsB.textContent = edits[mode];
        embBtn.className = 'g-btn ' + (mode === 'emb' ? 'on' : 'alt');
        refBtn.className = 'g-btn ' + (mode === 'ref' ? 'on' : 'alt');
        if (finished.emb) { eEmb.fill.style.width = '100%'; eEmb.val.textContent = N; }
        if (finished.ref) { eRef.fill.style.width = (100 / N) + '%'; eRef.val.textContent = 1; }
        if (seen.emb) { rEmb.fill.style.width = '50%'; rEmb.val.textContent = 1; }
        if (seen.ref) { rRef.fill.style.width = '100%'; rRef.val.textContent = 2; }
      }

      function finish(m) {
        finished[m] = true;
        paint();
        if (finished.emb && finished.ref) {
          say('One edit or one read: duplication buys speed.', 'good');
          if (!solved) { solved = true; api.done(true); }
        } else if (m === 'emb') {
          say(N + ' edits for one name. Try Referenced.', 'good');
          flash(refBtn, 'g-pulse');
        } else {
          say('1 edit, every order follows. But 2 reads per order.', 'good');
          flash(embBtn, 'g-pulse');
        }
      }

      function renameDoc(i) {
        if (mode !== 'emb' || names[i] === NEW) return;
        names[i] = NEW; edits.emb++;
        var left = names.filter(function (n) { return n === OLD; }).length;
        paint(); flash(docs[i].who, 'pop');
        if (left) say(left === 1 ? '1 stale copy left.' : left + ' stale copies left.', 'bad');
        else finish('emb');
      }

      function renameCust() {
        if (mode !== 'ref' || custName === NEW) return;
        custName = NEW; edits.ref++;
        paint(); flash(custWho, 'pop');
        docs.forEach(function (d, i) { d.res.style.animationDelay = (i * 70) + 'ms'; flash(d.res, 'rip'); });
        finish('ref');
      }

      function setMode(m) {
        if (m === mode) return;
        mode = m; seen[m] = true; paint();
        if (m === 'ref') say(custName === NEW ? 'One record holds the name.' : 'Same change: tap the customer.');
        else say(names.indexOf(OLD) < 0 ? 'Each order holds its own copy.' : 'Each order holds its own copy. Fix them all.');
      }

      function reset() {
        if (mode === 'emb') { names = IDS.map(function () { return OLD; }); edits.emb = 0; say('Ada is now "' + NEW + '". Fix every order.'); }
        else { custName = OLD; edits.ref = 0; say('Same change: tap the customer.'); }
        paint();
      }

      say('Ada is now "' + NEW + '". Fix every order.');
      paint();

      return { destroy: function () {} };
    }
  });
})(window.DB);
