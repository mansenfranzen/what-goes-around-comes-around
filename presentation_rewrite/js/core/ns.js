/* Global namespace, constants and tiny helpers. Loaded first by boot.js. */
window.DB = window.DB || {};

(function (DB) {
  DB.milestones = [];   // filled by content/milestones/*.js in manifest order
  DB.games = {};        // id -> { hint, mount(root, api) }   (js/games/*.js)
  DB.views = {};        // kind -> factory(slide, director)   (js/views/*.js)
  DB.transitions = DB.transitions || [];

  DB.CATEGORIES = {
    primitives: { label: 'Primitives', ask: 'how we store & find' },
    language: { label: 'Language', ask: 'how we ask' },
    model: { label: 'Model', ask: 'how we shape' },
    synthesis: { label: 'All three', ask: 'how it fits together' }
  };

  DB.addMilestone = function (m) { DB.milestones.push(m); };
  DB.addGame = function (id, game) { DB.games[id] = game; };
  DB.addView = function (kind, factory) { DB.views[kind] = factory; };

  DB.symbolURL = function (m) { return 'assets/symbols/' + m.id + '-' + m.slug + '.svg'; };
  DB.byId = function (id) { return DB.milestones.find(function (m) { return m.id === id; }); };

  /* ---------- DOM helpers ---------- */
  function apply(el, attrs) {
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.setAttribute('class', v);
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'data') Object.keys(v).forEach(function (d) { el.dataset[d] = v[d]; });
      else if (k === 'on') Object.keys(v).forEach(function (e) { el.addEventListener(e, v[e]); });
      else el.setAttribute(k, v === true ? '' : v);
    });
  }
  function append(el, kids) {
    kids.forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      if (Array.isArray(c)) append(el, c);
      else el.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
    });
  }
  /** h('div', {class:'x', on:{click:fn}}, child, 'text', [more]) */
  DB.h = function (tag, attrs) {
    var el = document.createElement(tag);
    apply(el, attrs);
    append(el, Array.prototype.slice.call(arguments, 2));
    return el;
  };
  var SVGNS = 'http://www.w3.org/2000/svg';
  DB.svg = function (tag, attrs) {
    var el = document.createElementNS(SVGNS, tag);
    apply(el, attrs);
    append(el, Array.prototype.slice.call(arguments, 2));
    return el;
  };
  DB.$ = function (sel, root) { return (root || document).querySelector(sel); };
  DB.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  DB.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  DB.lerp = function (a, b, t) { return a + (b - a) * t; };
  DB.ease = {
    inOut: function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    out: function (t) { return 1 - Math.pow(1 - t, 3); }
  };

  /** tween({from, to, ms, ease, onUpdate, onDone}) -> {cancel()} ; from/to are numbers or arrays */
  DB.tween = function (o) {
    var start = performance.now(), ms = o.ms || 600, ease = o.ease || DB.ease.inOut, dead = false;
    var arr = Array.isArray(o.from);
    function frame(now) {
      if (dead) return;
      var t = Math.min(1, (now - start) / ms), e = ease(t);
      o.onUpdate(arr ? o.from.map(function (f, i) { return f + (o.to[i] - f) * e; }) : o.from + (o.to - o.from) * e);
      if (t < 1) requestAnimationFrame(frame); else if (o.onDone) o.onDone();
    }
    requestAnimationFrame(frame);
    return { cancel: function () { dead = true; } };
  };

  /** Toggle `.on` on every [data-at] element depending on the current step (shared reveal mechanism). */
  DB.applySteps = function (root, step) {
    DB.$$('[data-at]', root).forEach(function (n) {
      n.classList.toggle('on', step >= Number(n.dataset.at));
    });
    root.dataset.step = step;
  };

  /** Seeded random (mulberry32) so games look the same on every reset. */
  DB.rng = function (seed) {
    var a = seed || 1;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };
})(window.DB);
