/* Landing view. Steps: 0 title | 1 idea 1 (pain creates inventions) | 2 idea 2 (what goes around comes around). */
DB.addView('landing', function () {
  var h = DB.h, raf = 0, sats = [];

  /* ----- idea 1: chain of inventions linked by pains ----- */
  var chain = [['01', 'of what?'], ['02', 'too many tokens'], ['03', 'find it fast'], ['05', null]];
  var chainEl = h('div', { class: 'ld-chain' });
  chain.forEach(function (c, i) {
    var m = DB.byId(c[0]);
    chainEl.append(h('div', { class: 'link-sym cat-' + m.category }, h('img', { src: DB.symbolURL(m), alt: '' }), h('small', { class: 'mono', text: m.year })));
    if (c[1]) chainEl.append(h('div', { class: 'pain' }, h('span', { class: 'pain-bubble', text: c[1] }), h('i', { html: '&#10140;' })));
  });

  /* ----- idea 2: challengers orbit the SQL core and get absorbed ----- */
  var orbitEl = h('div', { class: 'orbit' },
    h('div', { class: 'core' }, h('img', { src: 'assets/symbols/logo-db.svg', alt: '' }), h('span', { class: 'chip solid', text: 'SQL' })));
  ['08', '09', '12', '13', '14', '17', '18', '19', '22'].forEach(function (id) {
    var m = DB.byId(id), s = h('div', { class: 'sat cat-' + m.category }, h('img', { src: DB.symbolURL(m), alt: '' }));
    orbitEl.append(s); sats.push(s);
  });

  function frame(now) {
    var t = now / 1000, N = sats.length, R = 1; // elliptical orbit, radii in rem below
    sats.forEach(function (s, i) {
      var ang = t * 0.28 + (i / N) * Math.PI * 2, p = (t / 9 + i / N) % 1, r = R, sc = 1, op = 1;
      if (p > 0.72 && p <= 0.9) { var k = DB.ease.inOut((p - 0.72) / 0.18); r = R * (1 - k); sc = 1 - 0.8 * k; op = 1 - k; }
      else if (p > 0.9) { var k2 = (p - 0.9) / 0.1; sc = k2; op = k2; }
      s.style.transform = 'translate(' + (Math.cos(ang) * r * 14) + 'rem,' + (Math.sin(ang) * r * 7.4) + 'rem) scale(' + sc + ')';
      s.style.opacity = op;
    });
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  var el = h('div', { class: 'view-landing grid-bg' },
    h('div', { class: 'ld-head' },
      h('img', { class: 'ld-logo', src: 'assets/symbols/logo-db.svg', alt: '' }),
      h('div', {},
        h('h1', { text: 'DB Time Machine' }),
        h('p', { class: 'ld-sub', text: '20,000 years of keeping records' }))),
    h('div', { class: 'ld-ideas' },
      h('section', { class: 'idea idea-1', 'data-at': 1 },
        h('span', { class: 'idea-num', text: '1' }),
        h('div', { class: 'idea-visual' }, chainEl),
        h('h2', { text: 'Pain creates inventions' }),
        h('p', { text: 'Every database idea answers a real problem.' })),
      h('section', { class: 'idea idea-2', 'data-at': 2 },
        h('span', { class: 'idea-num', text: '2' }),
        h('div', { class: 'idea-visual' }, orbitEl),
        h('h2', { text: 'What goes around comes around… and around' }),
        h('p', {}, 'SQL absorbs its challengers. ', h('span', { class: 'cite mono', text: 'Stonebraker & Pavlo, 2024' })))));

  return {
    el: el,
    setStep: function (step) { DB.applySteps(el, step); },
    destroy: function () { cancelAnimationFrame(raf); }
  };
});
