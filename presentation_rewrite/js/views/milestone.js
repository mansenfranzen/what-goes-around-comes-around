/* Milestone view: identical layout for every milestone.
   Steps: 0 header + photo | 1 Problem (+ game) | 2 Solution | 3 Relevance + takeaway.
   All copy comes from content/milestones/NN-slug.js; the game from js/games/NN-slug.js. */
DB.addView('milestone', function (slide) {
  var m = slide.ref, h = DB.h;
  var game = DB.gameShell.create(m);
  game.el.setAttribute('data-at', '1');

  function imageSrc(img) { return img.file.indexOf('/') >= 0 ? img.file : 'assets/images/' + img.file; }

  var photo;
  if (m.image) {
    var contain = /\.(png|svg)$/i.test(m.image.file);
    photo = h('figure', { class: 'ms-photo' + (contain ? ' contain' : ''), title: m.image.credit || '' },
      h('img', { src: imageSrc(m.image), alt: m.image.alt || m.title }),
      m.image.credit ? h('figcaption', { text: m.image.credit }) : null);
  } else {
    photo = h('figure', { class: 'ms-photo contain' }, h('img', { src: DB.symbolURL(m), alt: '' }));
  }

  function rec(kind, at, label, text, extra) {
    return h('div', { class: 'ms-rec rec-' + kind, 'data-at': at },
      h('div', { class: 'rec-label' }, h('i'), h('span', { text: label })),
      h('p', { text: text }),
      extra);
  }

  var relevanceExtra = h('div', { class: 'rec-concept' },
    h('span', { class: 'chip solid', text: m.concept }),
    m.today ? h('code', { text: m.today }) : null);

  var hero = h('div', { class: 'ms-hero' }, h('img', { src: DB.symbolURL(m), alt: '' }));

  var el = h('div', { class: 'view-milestone grid-bg cat-' + m.category },
    h('header', { class: 'ms-head' },
      h('div', { class: 'ms-symbol' }, h('img', { src: DB.symbolURL(m), alt: '' })),
      h('div', { class: 'ms-title' },
        h('div', { class: 'ms-kicker' },
          h('span', { class: 'chip year', text: m.year }),
          h('span', { class: 'chip', text: DB.CATEGORIES[m.category].label }),
          h('span', { class: 'chip verdict v-' + m.verdict.toLowerCase().replace(/\s+/g, '-'), text: m.verdict })),
        h('h1', { text: m.title }))),
    h('div', { class: 'ms-body' },
      h('div', { class: 'ms-left' },
        photo,
        rec('problem', 1, 'Problem', m.problem),
        rec('solution', 2, 'Solution', m.solution),
        rec('relevance', 3, 'Relevance', m.relevance, relevanceExtra)),
      h('div', { class: 'ms-right' }, hero, game.el)),
    h('footer', { class: 'ms-take', 'data-at': 3 },
      h('span', { class: 'chip solid', text: 'TAKEAWAY' }),
      h('p', { text: m.takeaway })));

  return {
    el: el,
    setStep: function (step) {
      DB.applySteps(el, step);
      hero.classList.toggle('gone', step >= 1);
      if (step >= 1) { game.mount(); game.el.classList.add('shown'); } else game.el.classList.remove('shown');
    },
    destroy: function () { game.destroy(); }
  };
});
