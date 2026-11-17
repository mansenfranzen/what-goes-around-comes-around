/* Transition view: a dedicated "what is still unsolved?" page between two milestones.
   Steps: 0 question + exhibit | 1 why the current milestone is stuck | 2 spark -> next milestone revealed.
   Copy comes from content/transitions.js (entry with from === current milestone id). */
DB.addView('transition', function (slide) {
  var h = DB.h, from = slide.from, to = slide.to, t = slide.ref || {};
  var isLast = !to;

  var fromCard = h('div', { class: 'tr-card tr-from cat-' + from.category },
    h('div', { class: 'tr-sym' },
      h('img', { src: DB.symbolURL(from), alt: '' }),
      h('span', { class: 'tr-x', 'data-at': 1, html: '&#10005;' })),
    h('b', { text: from.short || from.title }),
    h('small', { class: 'mono', text: from.year }));

  var toSym = isLast ? 'assets/symbols/logo-db.svg' : DB.symbolURL(to);
  var toCard = h('div', { class: 'tr-card tr-to ' + (isLast ? 'cat-synthesis' : 'cat-' + to.category) },
    h('div', { class: 'tr-sym ghost' },
      h('img', { src: toSym, alt: '' }),
      h('span', { class: 'tr-q', text: '?' })),
    h('b', { class: 'tr-to-title', text: isLast ? 'Big picture' : (to.short || to.title) }),
    h('small', { class: 'mono tr-to-year', text: isLast ? 'all together' : to.year }));

  var lines = String(t.exhibit || '').split('\n').map(function (l) { return h('span', { text: l || ' ' }); });

  var el = h('div', { class: 'view-transition grid-bg' },
    fromCard,
    h('div', { class: 'tr-center' },
      h('h1', { class: 'tr-question', text: t.question || '…' }),
      h('div', { class: 'tr-exhibit mono' }, lines),
      h('div', { class: 'tr-banner tr-stuck', 'data-at': 1 },
        h('i', { html: '&#10005;' }), h('p', { text: t.stuck || '' })),
      h('div', { class: 'tr-banner tr-trigger', 'data-at': 2 },
        h('i', { html: '&#10140;' }), h('p', { text: t.trigger || '' }))),
    toCard);

  return {
    el: el,
    setStep: function (step) {
      DB.applySteps(el, step);
      toCard.classList.toggle('revealed', step >= 2);
      fromCard.classList.toggle('stuck', step >= 1);
    }
  };
});
