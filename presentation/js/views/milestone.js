/* Milestone view: identical layout for every milestone.
   Presentation steps: 0 header + photo | 1 game | 2 takeaway below the photo.
   Exploration shows the three detailed sections under the photo and the takeaway in the footer.
   All copy comes from content/milestones/NN-slug.js; the game from js/games/NN-slug.js. */
DB.addView('milestone', function (slide, director) {
  var ICON_CODE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var KEYWORDS = {
    java: ['public', 'private', 'static', 'class', 'implements', 'extends', 'int', 'return', 'if', 'else', 'new'],
    sql: ['SELECT', 'FROM', 'WHERE', 'ORDER', 'GROUP', 'BY', 'AS']
  };
  var FWD = ['ArrowRight', 'PageDown', ' ', 'Enter'], BACK = ['ArrowLeft', 'PageUp', 'Backspace'], LAST = 2;

  /* Minimal highlighter: keywords, types (Java: Capitalised), calls, numbers, annotations. */
  function codeEl(code, lang) {
    var kw = KEYWORDS[lang] || [], pre = DB.h('pre', { class: 'ms-cmp-code' });
    var re = /@\w+|\b\d+\b|\b[A-Za-z_]\w*\b/g, at = 0, mt;
    while ((mt = re.exec(code))) {
      var w = mt[0];
      var cls = w[0] === '@' ? 'ca' : /^\d/.test(w) ? 'cn' : kw.indexOf(w) >= 0 ? 'ck'
        : code[re.lastIndex] === '(' ? 'cf' : lang === 'java' && /^[A-Z]/.test(w) ? 'ct' : '';
      if (!cls) continue;
      pre.append(code.slice(at, mt.index), DB.h('span', { class: cls, text: w }));
      at = re.lastIndex;
    }
    pre.append(code.slice(at));
    return pre;
  }

  /* Optional full-screen comparison (m.compare), opened from the milestone. It lives on <body> like an
     expanded game and has its own reveal steps: 0 goal + hard side | 1 easy side | 2 verdict. */
  function compareOverlay(m) {
    var c = m.compare, h = DB.h, step = 0, el = null;

    function side(s, kind, at) {
      var blocks = [];
      s.blocks.forEach(function (b, i) {
        if (i && s.joiner) blocks.push(h('span', { class: 'ms-cmp-or', text: s.joiner }));
        blocks.push(h('figure', { class: 'ms-cmp-block' },
          h('figcaption', {}, h('b', { text: b.title }), b.tag ? h('span', { text: b.tag }) : null),
          codeEl(b.code, s.lang)));
      });
      return h('section', { class: 'ms-cmp-side ' + kind, 'data-at': at },
        h('header', {},
          h('div', { class: 'rec-label' }, h('i'), h('span', { text: s.label })),
          s.note ? h('small', { text: s.note }) : null,
          s.stat ? h('b', { class: 'ms-cmp-stat', text: s.stat }) : null),
        h('div', { class: 'ms-cmp-blocks' }, blocks),
        s.needs ? h('div', { class: 'ms-cmp-needs' },
          h('span', { class: 'ms-cmp-needs-label', text: s.needsLabel || '' }),
          s.needs.map(function (n) { return h('span', { text: n }); })) : null);
    }

    function build() {
      return h('div', {
        class: 'ms-cmp grid-bg cat-' + m.category, role: 'dialog', 'aria-modal': 'true', 'aria-label': c.title,
        tabindex: '-1', 'data-no-advance': '',
        on: { click: function (e) { if (DB.director.mode === 'presentation' && !e.target.closest('button')) go(step + 1); } }
      },
        h('header', { class: 'ms-cmp-head' },
          h('div', { class: 'ms-cmp-title' },
            h('span', { class: 'chip solid', text: c.kicker }),
            h('h2', { text: c.title }),
            c.intro ? h('p', { text: c.intro }) : null),
          h('button', { class: 'ms-cmp-close', title: 'Close (Esc)', 'aria-label': 'Close', html: ICON_CLOSE, on: { click: close } })),
        h('div', { class: 'ms-cmp-goal' },
          h('div', { class: 'rec-label' }, h('i'), h('span', { text: 'The goal' })),
          h('p', { text: c.goal }),
          h('div', { class: 'ms-cmp-sample' },
            h('div', { class: 'ms-cmp-rows' }, c.input.map(function (r) { return h('code', { text: r }); })),
            h('span', { class: 'ms-cmp-arrow', text: '→' }),
            h('div', { class: 'ms-cmp-rows out' }, c.output.map(function (r) { return h('code', { text: r }); })))),
        side(c.hard, 'hard', 0),
        h('div', { class: 'ms-cmp-foot' },
          side(c.easy, 'easy', 1),
          h('div', { class: 'ms-cmp-verdict', 'data-at': 2 },
            h('span', { class: 'chip solid', text: 'VERDICT' }),
            h('p', { text: c.verdict }))));
    }

    function go(s) {
      step = DB.clamp(s, 0, LAST);
      DB.applySteps(el, step);
    }
    function open() {
      if (!el) el = build();
      document.body.appendChild(el);
      go(DB.director.mode === 'presentation' ? 0 : LAST);
      el.focus({ preventScroll: true });
    }
    function close() { if (el && el.isConnected) el.remove(); }

    return {
      button: h('button', { class: 'ms-cmp-btn', 'aria-haspopup': 'dialog', title: c.title, on: { click: open } },
        h('span', { class: 'ms-cmp-ico', html: ICON_CODE }), h('span', { text: c.button })),
      close: close,
      /** Director key hook while open: forward/back walk the reveal steps and close at either end. */
      onKey: function (e) {
        if (!el || !el.isConnected) return false;
        var k = e.key, explore = DB.director.mode !== 'presentation';
        if (k === 'Escape') close();
        else if (FWD.indexOf(k) >= 0) { if (!explore && step < LAST) go(step + 1); else close(); }
        else if (BACK.indexOf(k) >= 0) { if (!explore && step > 0) go(step - 1); else close(); }
        else if (k !== 'g' && k !== 'G') return false; // keep the game from expanding underneath
        return true;
      }
    };
  }

  var m = slide.ref, h = DB.h;
  var present = director.mode === 'presentation';
  var game = DB.gameShell.create(m);
  var cmp = m.compare ? compareOverlay(m) : null;
  game.el.setAttribute('data-at', '1');

  function imageSrc(img) { return img.file.indexOf('/') >= 0 ? img.file : 'assets/images/' + img.file; }

  var photo;
  if (m.image) {
    var contain = m.image.contain || /\.(png|svg)$/i.test(m.image.file);
    photo = h('figure', { class: 'ms-photo' + (contain ? ' contain' : ''), title: m.image.credit || '' },
      h('img', { src: imageSrc(m.image), alt: m.image.alt || m.title }),
      m.image.credit ? h('figcaption', { text: m.image.credit }) : null);
  } else {
    photo = h('figure', { class: 'ms-photo contain' }, h('img', { src: DB.symbolURL(m), alt: '' }));
  }

  function rec(kind, label, text, extra) {
    return h('div', { class: 'ms-rec rec-' + kind },
      h('div', { class: 'rec-label' }, h('i'), h('span', { text: label })),
      h('p', { text: text }),
      extra);
  }

  var takeaway = h(present ? 'section' : 'footer', { class: 'ms-take', 'data-at': present ? 2 : null },
    h('span', { class: 'chip solid', text: 'TAKEAWAY' }),
    h('p', { text: m.takeaway }),
    present && cmp ? cmp.button : null);

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
        present ? takeaway : [
          rec('problem', 'Problem', m.problem),
          rec('solution', 'Solution', m.solution),
          rec('relevance', 'Relevance', m.relevance, h('div', { class: 'rec-concept' },
            h('span', { class: 'chip solid', text: m.concept }),
            m.today ? h('code', { text: m.today }) : null,
            cmp ? cmp.button : null))
        ]),
      h('div', { class: 'ms-right' }, game.el)),
    present ? null : takeaway);

  return {
    el: el,
    setStep: function (step) {
      DB.applySteps(el, step);
      if (step >= 1) { game.mount(); game.el.classList.add('shown'); } else game.el.classList.remove('shown');
    },
    onKey: function (e) { return cmp ? cmp.onKey(e) : false; },
    destroy: function () { if (cmp) cmp.close(); game.destroy(); }
  };
});
