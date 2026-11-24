/* Hidden-by-default menus: they slide in only when the pointer approaches their screen edge. */
(function (DB) {
  var M = DB.menus = {};
  var reveals = [], mouse = { x: -1, y: -1 }, queued = false;
  var top, corner, edgeL, edgeR, progress = [], modeBtns = [], fsBtn;

  /** Register a hidden element; `test(x, y, w, h)` says when the pointer is "near". Returns an unregister fn. */
  M.edgeReveal = function (el, test) {
    var r = { el: el, test: test };
    reveals.push(r);
    return function () { reveals = reveals.filter(function (x) { return x !== r; }); el.classList.remove('show'); };
  };

  function check() {
    queued = false;
    var w = innerWidth, h = innerHeight;
    reveals.forEach(function (r) {
      var on = r.el.matches(':hover') || r.test(mouse.x, mouse.y, w, h);
      r.el.classList.toggle('show', on);
    });
  }
  function onMove(e) {
    mouse.x = e.clientX; mouse.y = e.clientY;
    if (!queued) { queued = true; requestAnimationFrame(check); }
  }

  var ICON = {
    present: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 4l14 8-14 8z" fill="currentColor"/></svg>',
    explore: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="currentColor"/></svg>',
    full: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    left: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    gift: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<path class="menu-gift-fill" d="M4.5 12.5h13v8a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM3 9h16v3.5H3z"/>' +
      '<path d="M11 9v12.5M11 9C9.6 5.6 5.8 5.2 5.8 7.4S9.2 9 11 9zM11 9c1.4-3.4 5.2-3.8 5.2-1.6S12.8 9 11 9z"/>' +
      '<path class="menu-gift-spark" d="M20.5 .5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" stroke-width=".8"/></svg>'
  };
  M.ICON = ICON;

  M.toggleFullscreen = function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  };

  function navBtn(label, onClick, extra) {
    return DB.h('button', { class: 'menu-btn', on: { click: onClick }, title: label }, extra || label);
  }

  M.init = function (slides) {
    var root = DB.$('#menus'), D = DB.director;

    /* top bar: logo, jump buttons, row of milestone symbols (quick jump) */
    progress = DB.milestones.map(function (m) {
      return DB.h('button', {
        class: 'prog cat-' + m.category, title: m.id + ' ' + m.title, 'data-id': m.id,
        on: { click: function () { D.goTo('m' + m.id); } }
      }, DB.h('img', { src: DB.symbolURL(m), alt: '' }));
    });
    top = DB.h('nav', { class: 'menu menu-top' },
      DB.h('button', { class: 'menu-logo', title: 'Start (L)', on: { click: function () { D.goTo('landing'); } } },
        DB.h('img', { src: 'assets/symbols/logo-db.svg', alt: 'DB Time Machine' })),
      navBtn('Timeline', function () { D.goTo('timeline', D.mode === 'presentation' ? slides[1].steps : 0); }),
      DB.h('div', { class: 'prog-row' }, progress),
      navBtn('Big picture', function () { D.goTo('big'); }),
      D.slideById('pitch') ? DB.h('button', {
        class: 'menu-btn menu-pitch', title: 'Bonus: Pitch', html: ICON.gift + '<span>Pitch</span>',
        on: { click: function () { D.goTo('pitch'); } }
      }) : null
    );

    /* corner: mode toggle + fullscreen (hidden until the pointer reaches the top-right corner) */
    modeBtns = [['presentation', 'Present', ICON.present], ['exploration', 'Explore', ICON.explore]].map(function (b) {
      return DB.h('button', {
        class: 'mode-btn', 'data-mode': b[0], title: b[1] + ' mode (E)', html: b[2] + '<span>' + b[1] + '</span>',
        on: { click: function () { if (D.mode !== b[0]) D.setMode(b[0]); } }
      });
    });
    fsBtn = DB.h('button', { class: 'mode-btn fs-btn', title: 'Fullscreen (F)', html: ICON.full, on: { click: M.toggleFullscreen } });
    corner = DB.h('div', { class: 'menu menu-corner' }, DB.h('div', { class: 'mode-switch' }, modeBtns), fsBtn);

    edgeL = DB.h('button', { class: 'edge-nav left menu', 'data-no-advance': '' });
    edgeR = DB.h('button', { class: 'edge-nav right menu', 'data-no-advance': '' });

    root.append(top, corner, edgeL, edgeR);

    M.edgeReveal(top, function (x, y, w) { return y >= 0 && y < 46 && x < w - 340; });
    M.edgeReveal(corner, function (x, y, w) { return y >= 0 && y < 78 && x > w - 340; });
    M.edgeReveal(edgeL, function (x, y) { return x >= 0 && x < 60 && y > 100 && !edgeL.hidden; });
    M.edgeReveal(edgeR, function (x, y, w) { return x > w - 60 && y > 100 && !edgeR.hidden; });

    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', function () {
      reveals.forEach(function (r) { r.el.classList.remove('show'); });
    });
    document.addEventListener('fullscreenchange', function () { fsBtn.classList.toggle('active', !!document.fullscreenElement); });
    M.syncMode();
  };

  M.syncMode = function () {
    modeBtns.forEach(function (b) { b.classList.toggle('active', b.dataset.mode === DB.director.mode); });
  };

  function fillEdge(btn, e, side) {
    btn.hidden = !e;
    btn.innerHTML = '';
    if (!e) return;
    var label = DB.h('span', { class: 'en-label' }, DB.h('small', { text: e.small }), DB.h('b', { text: e.label }));
    var sym = e.sym ? DB.h('img', { src: e.sym, alt: '' }) : null;
    btn.append.apply(btn, (side === 'left'
      ? [DB.h('span', { class: 'en-arrow', html: ICON.left }), sym, label]
      : [label, sym, DB.h('span', { class: 'en-arrow', html: ICON.right })]).filter(Boolean));
    btn.onclick = function () { DB.director.goTo(e.id, e.step); };
  }

  /** Called by the director after every navigation. */
  M.update = function (slide, step, idx, slides) {
    var mid = slide.kind === 'milestone' ? slide.ref.id : slide.kind === 'transition' ? slide.from.id : null;
    progress.forEach(function (p) { p.classList.toggle('current', p.dataset.id === mid); });
    var e = DB.director.edgesFor(slide);
    fillEdge(edgeL, e.prev, 'left');
    fillEdge(edgeR, e.next, 'right');
    document.body.dataset.slide = slide.kind;
  };
})(window.DB);
