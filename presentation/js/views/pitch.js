/* Pitch view (bonus slide after the big picture): why to try DuckDB on commodity compute.
   Steps: 0 hook | 1..N-2 evidence scenes | N-1 the ask (N = scenes in content/pitch.js).
   The rail on the left lists the argument and fills in each takeaway as it is reached; the stage shows one scene.
   Charts are schematic SVGs (viewBox 1000×500) drawn from the values in content/pitch.js. */
DB.addView('pitch', function () {
  var h = DB.h, S = DB.svg, P = DB.pitch, scenes = P.scenes, LAST = scenes.length - 1;
  var W = 1000, H = 500, selected = -1, explore = false;

  /* ---------- SVG helpers ---------- */
  function log10(v) { return Math.log(v) / Math.LN10; }
  function fig() { return S('svg', { class: 'pt-svg', viewBox: '0 0 ' + W + ' ' + H }); }
  function delay(s) { return '--d:' + s.toFixed(2) + 's'; }
  function txt(x, y, s, cls, anchor, style) {
    return S('text', { x: x, y: y, class: cls, 'text-anchor': anchor || 'start', style: style }, s);
  }
  function grid(svg, b, yTicks, xTicks) {
    yTicks.forEach(function (t) {
      svg.append(S('line', { class: 'pt-grid', x1: b.x0, x2: b.x1, y1: t[0], y2: t[0] }), txt(b.x0 - 14, t[0] + 6, t[1], 'pt-tick', 'end'));
    });
    xTicks.forEach(function (t) { svg.append(txt(t[0], b.y1 + 32, t[1], 'pt-tick', 'middle')); });
    svg.append(S('line', { class: 'pt-axis', x1: b.x0, x2: b.x1, y1: b.y1, y2: b.y1 }));
  }
  function vline(x, y0, y1, cls) { return S('line', { class: cls, x1: x, x2: x, y1: y0, y2: y1 }); }
  function bar(x, y, w, hgt, cls, d) {
    return S('rect', { class: 'pt-grow ' + cls, x: x, y: y, width: w, height: Math.max(hgt, 3), rx: 4, style: delay(d) });
  }

  /* ---------- one renderer per `chart` in content/pitch.js ---------- */
  var charts = {
    hook: function (s) {
      var svg = fig();
      s.sides.forEach(function (side, k) {
        var x = k ? 540 : 20, w = 440, cx = x + w / 2, g = S('g', { class: 'pt-' + side.kind });
        g.append(S('rect', { class: 'pt-card', x: x, y: 6, width: w, height: 488, rx: 26 }),
          txt(cx, 52, side.name, 'pt-card-title', 'middle'));
        var cols, size, gap, top;
        if (side.cores > 12) {
          cols = 10; size = 30; gap = 8; top = 92;
          var gw = cols * (size + gap) - gap, gh = Math.ceil(side.cores / cols) * (size + gap) - gap;
          g.append(S('rect', { class: 'pt-device', x: cx - gw / 2 - 18, y: top - 18, width: gw + 36, height: gh + 36, rx: 14 }));
        } else {
          cols = 2; size = 52; gap = 16; top = 160;
          g.append(S('rect', { class: 'pt-device', x: cx - 92, y: 74, width: 184, height: 336, rx: 34 }),
            S('rect', { class: 'pt-notch', x: cx - 28, y: 88, width: 56, height: 14, rx: 7 }),
            txt(cx, 390, 'DuckDB', 'pt-phone-app', 'middle'));
        }
        var gx = cx - (cols * (size + gap) - gap) / 2;
        for (var i = 0; i < side.cores; i++) {
          g.append(S('rect', {
            class: 'pt-core pt-fade', x: gx + (i % cols) * (size + gap), y: top + Math.floor(i / cols) * (size + gap),
            width: size, height: size, rx: 6, style: delay(0.2 + i * (side.cores > 12 ? 0.012 : 0.12))
          }));
        }
        g.append(txt(cx, 446, side.cores + ' CPUs · ' + side.ram, 'pt-card-spec', 'middle'),
          txt(cx, 478, side.price, 'pt-card-price', 'middle'));
        svg.append(g);
      });
      svg.append(S('circle', { class: 'pt-vs-dot', cx: 500, cy: 250, r: 36 }), txt(500, 260, 'vs', 'pt-vs', 'middle'));
      return svg;
    },

    sizes: function (s) {
      var svg = fig(), b = { x0: 90, x1: 960, y0: 70, y1: 430 }, dec = (b.x1 - b.x0) / 8, ymax = 16;
      function X(mb) { return b.x0 + log10(mb) * dec; }
      function Y(p) { return b.y1 - p / ymax * (b.y1 - b.y0); }
      var xp = X(s.p999), xv = X(s.vendor);
      svg.append(S('rect', { class: 'pt-zone pt-fade', x: b.x0, y: b.y0 - 46, width: xp - b.x0, height: b.y1 - b.y0 + 46, style: delay(0.9) }),
        txt(b.x0 + 12, b.y0 - 18, 'fits on one machine', 'pt-zone-label pt-fade', 'start', delay(0.9)));
      grid(svg, b, [0, 5, 10, 15].map(function (p) { return [Y(p), p + ' %']; }),
        ['1 MB', '10 MB', '100 MB', '1 GB', '10 GB', '100 GB', '1 TB', '10 TB', '100 TB'].map(function (l, i) { return [b.x0 + i * dec, l]; }));
      s.bins.forEach(function (bn, i) {
        var xa = X(bn[0]) + 2, xb = X(bn[0] * 2) - 2;
        svg.append(bar(xa, Y(bn[1]), xb - xa, b.y1 - Y(bn[1]), 'pt-fill-ink', 0.15 + i * 0.03));
      });
      var xm = X(s.median);
      svg.append(vline(xm, b.y0 - 6, b.y1, 'pt-mark pt-fade'), txt(xm + 8, b.y0 + 8, 'median ≈ 100 MB', 'pt-note pt-fade', 'start', delay(0.7)));
      svg.append(vline(xp, b.y0 - 46, b.y1, 'pt-mark-good pt-fade'), txt(xp + 10, b.y0 - 18, '99.9 % ≤ 300 GB', 'pt-note-good pt-fade', 'start', delay(1)));
      svg.append(vline(xv - 2, b.y0 - 46, b.y1, 'pt-mark-bad pt-fade'),
        txt(xv - 12, b.y0 + 110, 'vendor benchmarks', 'pt-note-bad pt-fade', 'end', delay(1.3)),
        txt(xv - 12, b.y0 + 136, 'use 100 TB', 'pt-note-bad pt-fade', 'end', delay(1.3)));
      svg.append(S('path', { class: 'pt-gap pt-fade', d: 'M' + (xp + 8) + ' 300 H' + (xv - 10), style: delay(1.5) }),
        txt((xp + xv) / 2, 290, '≈ 330× larger', 'pt-note-bad pt-fade', 'middle', delay(1.5)));
      return svg;
    },

    capacity: function (s) {
      var svg = fig(), b = { x0: 110, x1: 960, y0: 40, y1: 430 }, Y0 = 2005, Y1 = 2027;
      function X(y) { return b.x0 + (y - Y0) / (Y1 - Y0) * (b.x1 - b.x0); }
      function Y(gb) { return b.y1 - (log10(gb) + 2) / 7 * (b.y1 - b.y0); }
      grid(svg, b, [[0.01, '10 MB'], [0.1, '100 MB'], [1, '1 GB'], [10, '10 GB'], [100, '100 GB'], [1000, '1 TB'], [10000, '10 TB'], [100000, '100 TB']]
        .map(function (t) { return [Y(t[0]), t[1]]; }), [2006, 2010, 2014, 2018, 2022, 2026].map(function (y) { return [X(y), String(y)]; }));
      var pts = s.points.map(function (p) { return [X(p.year), Y(p.gb)]; }), last = pts[pts.length - 1];
      var line = 'M' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L') + ' H' + b.x1;
      svg.append(S('path', { class: 'pt-area pt-fade', d: line + ' V' + b.y1 + ' H' + pts[0][0] + 'Z', style: delay(1) }),
        S('path', { class: 'pt-line-good pt-draw', d: line, pathLength: 1 }));
      s.lines.forEach(function (l) {
        var y = Y(l.gb);
        svg.append(S('line', { class: 'pt-ref pt-fade', x1: b.x0, x2: b.x1, y1: y, y2: y, style: delay(1.2) }),
          txt(b.x1 - 10, y - 10, l.label, 'pt-note pt-fade', 'end', delay(1.2)));
      });
      s.points.forEach(function (p, i) {
        var x = pts[i][0], y = pts[i][1], first = i < 2, d = delay(0.3 + i * 0.3);
        svg.append(S('circle', { class: 'pt-dot pt-fade', cx: x, cy: y, r: 9, style: d }),
          txt(first ? x + 16 : x - 16, first ? y + 34 : y - 38, p.label, 'pt-val pt-fade', first ? 'start' : 'end', d),
          txt(first ? x + 16 : x - 16, first ? y + 58 : y - 14, p.cpu + ' · ' + p.name, 'pt-small pt-fade', first ? 'start' : 'end', d));
      });
      var ph = s.phone, px = X(ph.year), py = Y(ph.gb);
      svg.append(S('rect', { class: 'pt-phone-dot pt-fade', x: px - 8, y: py - 8, width: 16, height: 16, transform: 'rotate(45 ' + px + ' ' + py + ')', style: delay(1.5) }),
        txt(px - 18, py + 6, ph.label, 'pt-note-good pt-fade', 'end', delay(1.5)));
      return svg;
    },

    price: function (s) {
      var svg = fig(), b = { x0: 110, x1: 960, y0: 50, y1: 420 }, Y0 = 2013.5, Y1 = 2027, top = 0.1, bottom = 0.005;
      function X(y) { return b.x0 + (y - Y0) / (Y1 - Y0) * (b.x1 - b.x0); }
      function Y(v) { return b.y0 + (log10(top) - log10(v)) / (log10(top) - log10(bottom)) * (b.y1 - b.y0); }
      grid(svg, b, [[0.1, '$0.10'], [0.05, '$0.05'], [0.02, '$0.02'], [0.01, '$0.01'], [0.005, '$0.005']].map(function (t) { return [Y(t[0]), t[1]]; }),
        [2014, 2016, 2018, 2020, 2022, 2024, 2026].map(function (y) { return [X(y), String(y)]; }));
      var st = s.steps, d = 'M' + X(st[0][0]) + ' ' + Y(st[0][1]);
      st.slice(1).forEach(function (p) { d += ' H' + X(p[0]) + ' V' + Y(p[1]); });
      d += ' H' + X(s.end);
      var first = st[0], fin = st[st.length - 1];
      svg.append(S('path', { class: 'pt-trend pt-fade', d: 'M' + X(first[0]) + ' ' + Y(first[1]) + ' L' + X(fin[0]) + ' ' + Y(fin[1]), style: delay(1.6) }),
        S('path', { class: 'pt-line-good pt-draw', d: d, pathLength: 1 }));
      st.forEach(function (p, i) {
        if (!p[2]) return;
        var x = X(p[0]), y = Y(p[1]), dl = delay(0.2 + i * 0.1);
        svg.append(S('circle', { class: 'pt-dot pt-fade', cx: x, cy: y, r: 6, style: dl }),
          i ? txt(x + 8, y + 28, p[2], 'pt-small pt-fade', 'start', dl) : txt(x - 10, y + 28, p[2], 'pt-small pt-fade', 'end', dl));
      });
      svg.append(txt(X(first[0]) + 14, Y(first[1]) - 14, '≈ $0.083', 'pt-val pt-fade', 'start', delay(0.2)),
        txt(X(fin[0]) - 4, Y(fin[1]) - 48, '≈ $0.007', 'pt-val pt-fade', 'end', delay(1.4)),
        txt(X(2023.2), Y(0.05), '≈ 12× cheaper', 'pt-big-good pt-fade', 'middle', delay(1.7)));
      return svg;
    },

    markup: function (s) {
      var svg = fig(), b = { x0: 110, x1: 960, y0: 40, y1: 400 }, ymax = 0.4;
      function Y(v) { return b.y1 - v / ymax * (b.y1 - b.y0); }
      grid(svg, b, [0, 0.1, 0.2, 0.3, 0.4].map(function (v) { return [Y(v), '$' + v.toFixed(2)]; }), []);
      s.pairs.forEach(function (p, k) {
        var c = k ? 745 : 335, xp = c - 185, xr = c + 15, w = 170, yp = Y(p.premium), yr = Y(p.raw), dl = 0.3 + k * 0.5;
        svg.append(bar(xp, yp, w, b.y1 - yp, 'pt-fill-bad', dl), bar(xr, yr, w, b.y1 - yr, 'pt-fill-good', dl + 0.2),
          txt(xp + w / 2, yp - 12, '$' + p.premium.toFixed(2), 'pt-val pt-fade', 'middle', delay(dl + 0.4)),
          txt(xr + w / 2, yr - 12, '$' + p.raw.toFixed(3), 'pt-val-good pt-fade', 'middle', delay(dl + 0.4)),
          txt(xp + w / 2, b.y1 + 32, p.name, 'pt-cat', 'middle'), txt(xp + w / 2, b.y1 + 58, 'on-demand', 'pt-small', 'middle'),
          txt(xr + w / 2, b.y1 + 32, 'same CPUs on EC2', 'pt-cat-good', 'middle'), txt(xr + w / 2, b.y1 + 58, p.rawName + ', 3-yr', 'pt-small', 'middle'));
        // the markup: a dashed "ghost" from the raw bar up to the premium price, holding the ratio badge and the cents note
        var gy = yp, gh = yr - 34 - yp, note = gh > 110, top = gy + (gh - (note ? 92 : 64)) / 2;
        svg.append(S('rect', { class: 'pt-ghost pt-fade', x: xr, y: gy, width: w, height: gh, rx: 6, style: delay(dl + 0.8) }),
          S('rect', { class: 'pt-badge pt-pop', x: xr + 10, y: top, width: w - 20, height: 64, rx: 14, style: delay(dl + 1) }),
          txt(xr + w / 2, top + 47, p.ratio, 'pt-badge-text pt-pop', 'middle', delay(dl + 1)));
        if (note) svg.append(txt(xr + w / 2, top + 88, 'CPUs: ' + p.cents + ' per $1', 'pt-tiny-bad pt-fade', 'middle', delay(dl + 1.1)));
      });
      return svg;
    },

    bench: function (s) {
      var svg = fig(), b = { x0: 90, x1: 960, y0: 100, y1: 420 }, ymax = 8, n = s.series.length;
      function Y(v) { return b.y1 - v / ymax * (b.y1 - b.y0); }
      var gw = (b.x1 - b.x0) / s.scales.length, bw = 40, gap = 8, inner = n * bw + (n - 1) * gap;
      s.series.forEach(function (se, k) {
        var x = b.x0 + k * 220;
        svg.append(S('rect', { class: 'pt-swatch ' + sCls(se), x: x, y: 10, width: 20, height: 20, rx: 4 }),
          txt(x + 30, 27, se.name, se.kind === 'commodity' ? 'pt-cat-good' : 'pt-cat'), txt(x + 30, 52, se.note, 'pt-small'));
      });
      svg.append(S('rect', { class: 'pt-zone pt-fade', x: b.x0 + 4, y: b.y0 - 12, width: gw * 3 - 8, height: b.y1 - b.y0 + 12, style: delay(1.4) }),
        txt(b.x0 + 18, b.y0 + 16, 'phone fastest', 'pt-zone-label pt-fade', 'start', delay(1.4)));
      grid(svg, b, [0, 2, 4, 6, 8].map(function (v) { return [Y(v), v + ' s']; }),
        s.scales.map(function (l, i) { return [b.x0 + gw * (i + 0.5), l]; }));
      s.scales.forEach(function (l, i) {
        var x0 = b.x0 + gw * i + (gw - inner) / 2, vals = s.series.map(function (se) { return se.v[i]; });
        var best = vals.indexOf(Math.min.apply(null, vals));
        s.series.forEach(function (se, k) {
          var v = se.v[i], x = x0 + k * (bw + gap), dl = 0.2 + i * 0.25 + k * 0.06, good = se.kind === 'commodity';
          svg.append(bar(x, Y(v), bw, b.y1 - Y(v), sCls(se), dl),
            txt(x + bw / 2, Y(v) - 10, v.toFixed(2), (good ? 'pt-tiny-good' : 'pt-tiny') + ' pt-fade', 'middle', delay(dl + 0.4)));
          if (k === best) svg.append(txt(x + bw / 2, Y(v) - 34, 'fastest', (good ? 'pt-tiny-good' : 'pt-tiny-bad') + ' pt-fade', 'middle', delay(dl + 0.5)));
        });
      });
      return svg;
    },

    aws: function (s) {
      var flow = S('svg', { class: 'pt-flow', viewBox: '0 0 1000 170' });
      function org(x, name, sub) {
        return [S('rect', { class: 'pt-org', x: x, y: 26, width: 270, height: 118, rx: 18 }),
          txt(x + 135, 80, name, 'pt-org-name', 'middle'), txt(x + 135, 114, sub, 'pt-small', 'middle')];
      }
      flow.append.apply(flow, org(10, 'DuckLabs', 'Amsterdam · creators of DuckDB').concat(org(720, 'AWS', 'S3 · Athena · Redshift · EMR · Glue')));
      flow.append(S('path', { class: 'pt-flow-line pt-draw', d: 'M290 85 H700', pathLength: 1 }),
        S('path', { class: 'pt-flow-head pt-fade', d: 'M690 72 L712 85 L690 98Z', style: delay(1) }));
      s.deal.forEach(function (e, i) {
        var x = i ? 600 : 400, dl = delay(0.5 + i * 0.4);
        flow.append(S('circle', { class: 'pt-flow-dot pt-fade', cx: x, cy: 85, r: 12, style: dl }),
          txt(x, 56, e.date, 'pt-val pt-fade', 'middle', dl), txt(x, 126, e.text, 'pt-small pt-fade', 'middle', dl));
      });
      var facts = h('div', { class: 'pt-facts' }, s.facts.map(function (f, i) {
        return h('div', { class: 'pt-fact pt-fade', style: delay(1.2 + i * 0.15) }, h('b', { text: f.big }), h('span', { text: f.text }));
      }));
      var quote = h('blockquote', { class: 'pt-quote pt-fade', style: delay(1.9) }, h('span', { text: s.quote }), h('small', { text: s.quoteBy }));
      return h('div', { class: 'pt-aws' }, flow, facts, quote);
    },

    ask: function (s) {
      var steps = h('ol', { class: 'pt-steps' }, s.steps.map(function (st, i) {
        return h('li', { class: 'pt-step pt-fade', style: delay(0.2 + i * 0.25) },
          h('span', { class: 'pt-step-n', text: st.n }), h('h3', { text: st.title }), h('p', { text: st.text }));
      }));
      var trade = h('div', { class: 'pt-trade' },
        h('div', { class: 'pt-risk pt-fade', style: delay(1.1) }, h('small', { text: 'Risk' }), h('b', { text: s.risk })),
        h('div', { class: 'pt-upside pt-fade', style: delay(1.3) }, h('small', { text: 'Upside' }), h('b', { text: s.upside })));
      return h('div', { class: 'pt-ask' }, steps, trade);
    }
  };
  function sCls(se) { return se.kind === 'commodity' ? 'pt-fill-good' : 'pt-fill-bad pt-shade-' + se.shade; }

  /* ---------- stage: one scene per step ---------- */
  function actOf(sc) { return P.acts.filter(function (a) { return a.n === sc.act; })[0]; }
  var sceneEls = scenes.map(function (sc, i) {
    var a = actOf(sc), label = a ? 'Act ' + a.n + ' · ' + a.title : sc.rail;
    return h('section', { class: 'pt-scene pt-' + sc.chart, 'data-i': i },
      h('header', { class: 'pt-scene-head' },
        h('span', { class: 'pt-act-chip' + (a ? '' : ' pt-act-chip-alt'), text: label }),
        h('h2', { text: sc.title }),
        h('p', { class: 'pt-sub', text: sc.sub })),
      h('div', { class: 'pt-figure' }, charts[sc.chart](sc)),
      h('footer', { class: 'pt-scene-foot' },
        h('p', { class: 'pt-take' }, h('i', { html: '&#10140;' }), h('span', { text: sc.takeaway })),
        h('small', { class: 'pt-src', text: 'Source: ' + sc.source })));
  });
  var stage = h('div', { class: 'pt-stage' }, sceneEls);

  /* ---------- rail: the argument, grouped by act ---------- */
  var items = [], lastAct = null;
  var rail = h('nav', { class: 'pt-rail' });
  scenes.forEach(function (sc, i) {
    var a = actOf(sc);
    if (a && a !== lastAct) rail.append(h('div', { class: 'pt-rail-act' }, h('span', { text: a.n }), a.title));
    if (!a && lastAct) rail.append(h('div', { class: 'pt-rail-gap' }));
    lastAct = a || null;
    var it = h('button', {
      class: 'pt-item', 'data-i': i, title: sc.title,
      on: { click: function () { if (explore) show(i); else DB.director.goTo('pitch', i); } }
    }, h('span', { class: 'pt-mark-dot', html: '&#10003;' }), h('span', { class: 'pt-item-text' }, h('b', { text: sc.rail }), h('small', { text: sc.line })));
    items.push(it);
    rail.append(it);
  });

  var el = h('div', { class: 'view-pitch grid-bg' },
    h('header', { class: 'pt-head' },
      h('div', { class: 'pt-title' },
        h('span', { class: 'chip pt-bonus', text: P.kicker }),
        h('h1', { text: P.title }),
        h('p', { text: P.subtitle })),
      h('span', { class: 'pt-cite mono', text: P.cite })),
    h('div', { class: 'pt-body' }, rail, stage));

  function show(i) {
    selected = i;
    sceneEls.forEach(function (s, k) {
      if (k === i && !s.classList.contains('active')) {
        s.getBoundingClientRect(); // flush styles so the chart animation replays
        s.classList.add('active');
      } else if (k !== i) s.classList.remove('active');
    });
    items.forEach(function (it, k) {
      it.classList.toggle('pt-cur', k === i);
      it.classList.toggle('pt-past', explore ? k !== i : k < i);
      it.classList.toggle('pt-next', !explore && k > i);
    });
  }

  return {
    el: el,
    setStep: function (step, opts) {
      explore = !!(opts && opts.explore);
      el.classList.toggle('pt-explore', explore);
      show(explore ? (selected < 0 ? LAST : selected) : DB.clamp(step, 0, LAST));
    }
  };
});
