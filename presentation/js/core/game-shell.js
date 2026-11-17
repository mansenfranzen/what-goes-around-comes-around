/* Game shell: wraps every mini game in the same panel (hint, reset, expand to full screen).
   Games are registered with DB.addGame(id, { hint, mount(root, api) -> { destroy() } }). */
(function (DB) {
  var S = DB.gameShell = {};
  var fullPanel = null, current = null;

  var ICON_EXPAND = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  var ICON_SHRINK = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
  var ICON_RESET = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5"/></svg>';

  /** create(m) -> { el, mount(), unmount(), expand(), collapse() } for milestone m */
  S.create = function (m) {
    var game = DB.games[m.id];
    var instance = null, mounted = false, placeholder = null;
    var hintEl = DB.h('span', { class: 'game-hint', text: game ? game.hint : '' });
    var doneEl = DB.h('span', { class: 'game-done', title: 'Done!', html: '&#10003;' });
    var root = DB.h('div', { class: 'game-root game-' + m.id });
    var stage = DB.h('div', { class: 'game-stage' }, root);
    var btnReset = DB.h('button', { class: 'game-btn', title: 'Reset', html: ICON_RESET, on: { click: function () { reset(); } } });
    var btnFull = DB.h('button', { class: 'game-btn', title: 'Full screen (G)', html: ICON_EXPAND, on: { click: function () { panel.expand ? panel.expand() : null; } } });
    var panel = DB.h('section', { class: 'game-panel cat-' + m.category, 'data-no-advance': '' },
      DB.h('header', { class: 'game-head' },
        DB.h('span', { class: 'game-badge', text: 'PLAY' }), hintEl, doneEl, btnReset, btnFull),
      stage);

    var api = {
      full: function () { return fullPanel === panel; },
      hint: function (t) { hintEl.textContent = t; },
      done: function (on) { doneEl.classList.toggle('on', on !== false); },
      /** use instead of window keydown if a game ever needs keys while expanded */
      root: root
    };

    function reset() {
      unmount();
      mount();
    }
    function mount() {
      if (mounted) return;
      mounted = true;
      root.innerHTML = '';
      doneEl.classList.remove('on');
      hintEl.textContent = game ? game.hint : '';
      if (!game) {
        root.append(DB.h('div', { class: 'game-missing', text: 'Game coming soon' }));
        return;
      }
      try { instance = game.mount(root, api) || {}; }
      catch (err) {
        console.error('[game ' + m.id + ']', err);
        root.append(DB.h('div', { class: 'game-missing', text: 'Game error: ' + err.message }));
      }
    }
    function unmount() {
      if (instance && instance.destroy) { try { instance.destroy(); } catch (e) { console.error(e); } }
      instance = null; mounted = false; root.innerHTML = '';
    }

    /* The panel is moved to <body> while expanded so no transformed ancestor can break position:fixed. */
    panel.expand = function () {
      if (fullPanel === panel) return panel.collapse();
      if (fullPanel) fullPanel.collapse();
      placeholder = DB.h('div', { class: 'game-placeholder' });
      panel.parentNode.insertBefore(placeholder, panel);
      document.body.appendChild(panel);
      panel.classList.add('is-full');
      document.body.classList.add('game-open');
      btnFull.innerHTML = ICON_SHRINK; btnFull.title = 'Back (Esc)';
      fullPanel = panel;
    };
    panel.collapse = function () {
      if (fullPanel !== panel) return;
      panel.classList.remove('is-full');
      document.body.classList.remove('game-open');
      if (placeholder && placeholder.parentNode) { placeholder.parentNode.insertBefore(panel, placeholder); placeholder.remove(); }
      else panel.remove();
      placeholder = null;
      btnFull.innerHTML = ICON_EXPAND; btnFull.title = 'Full screen (G)';
      fullPanel = null;
    };

    var handle = {
      el: panel, mount: mount, unmount: unmount, reset: reset,
      expand: panel.expand, collapse: panel.collapse,
      destroy: function () { panel.collapse(); unmount(); if (current === handle) current = null; }
    };
    current = handle;
    return handle;
  };

  S.isFull = function () { return !!fullPanel; };
  S.close = function () { if (fullPanel) fullPanel.collapse(); };
  S.toggleCurrent = function () {
    if (fullPanel) fullPanel.collapse();
    else if (current && current.el.isConnected && current.el.classList.contains('shown')) current.expand();
  };
})(window.DB);
