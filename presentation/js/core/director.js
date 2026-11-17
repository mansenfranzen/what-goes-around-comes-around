/* Director: owns the slide list, the current step, presentation/exploration mode,
   hash routing, keyboard and click handling. Views only render and react to setStep(). */
(function (DB) {
  var D = DB.director = { mode: 'presentation' };
  var slides = [], idx = -1, step = 0, current = null, stage;

  /* ---------- slide list: landing, timeline, (milestone, transition)*, big picture ---------- */
  function build() {
    var ms = DB.milestones;
    slides = [
      { id: 'landing', kind: 'landing', hash: '#/landing', steps: 2 },
      { id: 'timeline', kind: 'timeline', hash: '#/timeline', steps: ms.length + 1 } // last step: switch to the logical scale
    ];
    ms.forEach(function (m, i) {
      slides.push({ id: 'm' + m.id, kind: 'milestone', hash: '#/m/' + m.id, steps: 3, ref: m, n: i });
      slides.push({
        id: 't' + m.id, kind: 'transition', hash: '#/t/' + m.id, steps: 2,
        from: m, to: ms[i + 1] || null,
        ref: DB.transitions.find(function (t) { return t.from === m.id; }) || {}
      });
    });
    slides.push({ id: 'big', kind: 'bigpicture', hash: '#/big', steps: ms.length + 1 });
  }

  D.slides = function () { return slides; };
  D.current = function () { return current; };
  D.index = function () { return idx; };
  D.step = function () { return step; };
  D.slideById = function (id) { return slides.find(function (s) { return s.id === id; }); };

  /* ---------- showing a slide ---------- */
  function show(i, s, opts) {
    opts = opts || {};
    i = DB.clamp(i, 0, slides.length - 1);
    var slide = slides[i], explore = D.mode === 'exploration';
    var st = explore ? slide.steps : DB.clamp(s || 0, 0, slide.steps);
    var dir = opts.dir || (i >= idx ? 1 : -1);

    if (!current || current.slide !== slide || opts.remount) {
      if (DB.gameShell) DB.gameShell.close();
      if (current) { if (current.view.destroy) current.view.destroy(); current.view.el.remove(); }
      var view = DB.views[slide.kind](slide, D);
      view.el.classList.add('slide', 'enter-' + (dir > 0 ? 'fwd' : 'back'));
      stage.appendChild(view.el);
      current = { slide: slide, view: view };
      idx = i;
      view.setStep(st, { instant: true, explore: explore });
    } else {
      current.view.setStep(st, { instant: false, explore: explore, from: step });
    }
    step = st;
    try { history.replaceState(null, '', location.pathname + location.search + slide.hash + (explore ? '' : (st ? '/' + st : ''))); } catch (e) { /* file:// quirks */ }
    DB.menus.update(slide, step, idx, slides);
  }

  D.next = function () {
    var slide = slides[idx];
    if (D.mode === 'presentation' && step < slide.steps) return show(idx, step + 1);
    if (idx < slides.length - 1) show(idx + 1, 0, { dir: 1 });
  };
  D.prev = function () {
    var slide = slides[idx];
    if (D.mode === 'presentation' && step > 0) return show(idx, step - 1);
    if (idx > 0) show(idx - 1, slides[idx - 1].steps, { dir: -1 }); // landing on the previous slide fully revealed
  };
  /** goTo('m05') / goTo('timeline', 3) / goTo('m05', 'end') */
  D.goTo = function (id, s) {
    var i = slides.findIndex(function (x) { return x.id === id; });
    if (i < 0) return;
    show(i, s === 'end' ? slides[i].steps : (s || 0), { dir: i >= idx ? 1 : -1 });
  };

  D.setMode = function (m) {
    D.mode = m;
    document.body.classList.toggle('mode-presentation', m === 'presentation');
    document.body.classList.toggle('mode-exploration', m === 'exploration');
    try { localStorage.setItem('dbtm.mode', m); } catch (e) { /* ignore */ }
    if (DB.menus) DB.menus.syncMode();
    if (current) show(idx, m === 'exploration' ? slides[idx].steps : 0, { remount: true, dir: 1 });
  };

  /* ---------- adjacent links for the edge menus ---------- */
  D.edgesFor = function (slide) {
    var ms = DB.milestones;
    function ref(m, kindLabel, step) { return m ? { id: 'm' + m.id, label: m.short || m.title, sym: DB.symbolURL(m), small: kindLabel, step: step } : null; }
    if (slide.kind === 'milestone') {
      var i = slide.n;
      return {
        prev: i > 0 ? ref(ms[i - 1], 'Previous', 0) : { id: 'timeline', label: 'Timeline', small: 'Back to', step: 'end' },
        next: i < ms.length - 1 ? ref(ms[i + 1], 'Next', 0) : { id: 'big', label: 'Big picture', small: 'Next', step: 0 }
      };
    }
    if (slide.kind === 'transition') {
      return {
        prev: ref(slide.from, 'Back to', 'end'),
        next: slide.to ? ref(slide.to, 'Next', 0) : { id: 'big', label: 'Big picture', small: 'Next', step: 0 }
      };
    }
    return {};
  };

  /* ---------- input ---------- */
  function onClick(e) {
    if (D.mode !== 'presentation' || e.button !== 0) return;
    if (!e.target.isConnected) return; // a handler re-rendered the clicked control (e.g. icon swap)
    if (e.target.closest('[data-no-advance],button,a,input,select,textarea,label,.menu,.edge-nav,.game-panel')) return;
    if (DB.suppressClick && performance.now() < DB.suppressClick) return;
    D.next();
  }

  function onKey(e) {
    if (e.target.matches && e.target.matches('input,textarea,select,[contenteditable]')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (DB.gameShell && DB.gameShell.isFull()) {
      if (k === 'Escape' || k === 'g' || k === 'G') { DB.gameShell.close(); e.preventDefault(); }
      return;
    }
    if (current && current.view.onKey && current.view.onKey(e)) { e.preventDefault(); return; }
    var handled = true;
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'Enter') D.next();
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') D.prev();
    else if (k === 'e' || k === 'E') D.setMode(D.mode === 'presentation' ? 'exploration' : 'presentation');
    else if (k === 'f' || k === 'F') DB.menus.toggleFullscreen();
    else if (k === 't' || k === 'T') D.goTo('timeline', D.mode === 'presentation' ? slides[1].steps : 0);
    else if (k === 'b' || k === 'B') D.goTo('big');
    else if (k === 'l' || k === 'L') D.goTo('landing');
    else if ((k === 'g' || k === 'G') && DB.gameShell) DB.gameShell.toggleCurrent();
    else if (k === 'Escape' && current && (current.slide.kind === 'milestone' || current.slide.kind === 'transition' || current.slide.kind === 'bigpicture')) D.goTo('timeline', D.mode === 'presentation' ? slides[1].steps : 0);
    else handled = false;
    if (handled) e.preventDefault();
  }

  function fromHash() {
    var parts = location.hash.replace(/^#\/?/, '').split('/'); // ['m','05','2']
    var key = parts[0] === 'm' || parts[0] === 't' ? '#/' + parts[0] + '/' + parts[1] : '#/' + (parts[0] || 'landing');
    var n = parts[0] === 'm' || parts[0] === 't' ? parts[2] : parts[1];
    var i = slides.findIndex(function (s) { return s.hash === key; });
    if (i < 0) i = 0;
    show(i, Number(n) || 0, { dir: i >= idx ? 1 : -1 });
  }

  D.init = function () {
    stage = DB.$('#stage');
    build();
    var q = new URLSearchParams(location.search), saved = null;
    try { saved = localStorage.getItem('dbtm.mode'); } catch (e) { /* ignore */ }
    var mode = q.get('mode') || saved || 'presentation';
    D.mode = mode === 'explore' || mode === 'exploration' ? 'exploration' : 'presentation';
    document.body.className = 'mode-' + D.mode;
    DB.menus.init(slides);
    window.addEventListener('hashchange', fromHash);
    window.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    fromHash();
  };
})(window.DB);
