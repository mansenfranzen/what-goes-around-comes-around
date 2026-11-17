// Run in a served browser:
// await (await import('./tests/browser-checks.js')).runBrowserChecks()
import { mountGame } from '../js/games.js';
import { milestones } from '../content/milestones.js';
import { mountTimeline } from '../js/timeline.js';
import { mountSummary } from '../js/summary.js';

export function runBrowserChecks() {
  const host = document.createElement('section');
  host.style.cssText = 'position:fixed;left:-20000px;top:0;width:1200px;background:white';
  document.body.append(host);
  const results = [];
  function assert(value, message) { if (!value) throw new Error(message); }
  function click(action) {
    const el = host.querySelector(`[data-action="${action}"]`);
    assert(el && !el.disabled, `Action ${action} must exist and be enabled`);
    el.click();
  }
  function input(id, value) {
    const el = host.querySelector(`#${id}`);
    assert(el, `Input ${id} exists`);
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function text(selector, expected) {
    assert(host.querySelector(selector)?.textContent.includes(expected), `${selector} must contain "${expected}"`);
  }
  function success() { assert(host.querySelector('.feedback.success'), 'Experiment should report success'); }
  function run(name, fn) {
    try { fn(); results.push({ name, passed: true }); }
    catch (error) { results.push({ name, passed: false, error: error.message }); }
  }
  const scenarios = {
    tally() { for (let i = 0; i < 7; i++) click('carve'); text('.metric', '7'); success(); click('undo'); text('.metric', '6'); },
    tokens() { for (let i = 0; i < 3; i++) click('grain'); for (let i = 0; i < 2; i++) click('sheep'); click('seal'); success(); assert(host.querySelector('.sealed'), 'Sealed envelope'); click('break'); text('.feedback', 'destroyed'); },
    ledger() { click('grain'); text('.metric', '50'); success(); click('sheep'); text('.metric', '16'); click('all'); text('.metric', 'Do not add different units'); },
    catalog() { for (let i = 0; i < 7; i++) click('scan'); text('.comparison', '7'); click('index'); text('.code-line', 'B-7'); success(); },
    cards() { click('insert'); assert(host.querySelectorAll('.index-card').length === 3, 'Insert adds one card'); text('.index-card', 'Euclid'); click('title'); text('.index-card', 'Elements'); success(); },
    punch() { click('0-4'); click('1-2'); click('2-7'); text('.code-line', '4 · 2 · 7'); success(); click('0-5'); assert(!host.querySelector('.feedback.success'), 'Wrong digit clears success'); },
    disk() { for (let i = 0; i < 9; i++) click('tape'); assert(host.querySelectorAll('.record-strip .read').length === 9, 'Tape visits nine'); click('seek'); assert(host.querySelector('.disk-demo.found'), 'Seek finds record'); success(); },
    tree() { click('Stage 1'); click('F-1'); click('Fuel valve (F-1)'); assert(!host.querySelector('.feedback.success'), 'Wrong engine does not win'); click('back'); click('back'); click('back'); click('Stage 2'); click('J-2'); click('Fuel valve'); success(); },
    network() { click('Valve'); click('Supplier B'); success(); text('.code-line', 'Supplier A → Valve → Supplier B'); },
    join() { const before = host.querySelector('.result-chips').textContent; click('reorder'); assert(before === host.querySelector('.result-chips').textContent, 'Storage reorder preserves joined result'); success(); click('bob'); text('.result-chips', 'Bob → Lamp'); assert(host.querySelectorAll('.result-chips > span').length === 1, 'No Ada orders leak into Bob join'); },
    sql() { click('Rome'); const before = host.querySelector('.result-chips').textContent; click('index'); assert(before === host.querySelector('.result-chips').textContent, 'Index preserves query result'); text('.plan', '2 row visits'); success(); click('index'); text('.plan', '6 row visits'); },
    array() { for (let t = 0; t < 3; t++) { input('array-time', t); const cells = [...host.querySelectorAll('.heatmap button')]; cells.reduce((a, c) => Number(a.textContent) > Number(c.textContent) ? a : c).click(); text('.code-line', `, ${t}]`); success(); } },
    objects() { click('toggle'); text('.query-code', 'customer_id=1'); success(); click('toggle'); text('.query-code', 'Customer {'); },
    mapreduce() { click('next'); click('fail'); text('.feedback', 'retried'); click('next'); click('next'); text('.word-tiles', '2'); text('.word-tiles', '1'); success(); },
    sparse() { click('toggle'); text('.metric', '4'); assert(host.querySelectorAll('.family-row').length === 2, 'Sparse rows rendered'); success(); click('toggle'); assert(host.querySelectorAll('.null').length === 2, 'Missing values visible'); },
    columns() { click('run'); text('.comparison', '30'); text('.comparison', '88'); click('column'); click('run'); text('.comparison', '6'); text('.comparison', '88'); assert(host.querySelectorAll('.touched').length === 6, 'Only six prices read'); success(); },
    kv() { click('key'); text('.metric', '1'); click('scan'); text('.metric', '4'); assert(host.querySelectorAll('.inspected').length === 4, 'Application reads every blob'); success(); },
    graph() {
      const slider = host.querySelector('#graph-hops');
      slider.focus();
      input('graph-hops', 2);
      assert(slider === host.querySelector('#graph-hops'), 'Live slider node survives redraw during a drag');
      input('graph-hops', 3);
      assert(host.querySelectorAll('.reached').length === 4, 'Dee reached in three hops');
      success();
    },
    documents() { click('update-0'); text('.metric', '2 old prices'); click('update-1'); click('update-2'); text('.metric', '3'); success(); click('normalized'); click('product'); text('.metric', '1'); assert([...host.querySelectorAll('.wishlist-grid strong')].every(e => e.textContent.includes('€3')), 'All shared prices updated'); success(); },
    chain() { click('tamper'); assert(host.querySelector('.invalid-block'), 'Tamper invalidates link'); success(); click('tamper'); assert(!host.querySelector('.invalid-block'), 'Restoring data restores link'); },
    cloud() { input('cloud-workers', 6); assert(host.querySelectorAll('.compute-workers > span').length === 6, 'Six workers'); text('.comparison', '2.0 s'); text('.comparison', '0 GB'); success(); },
    vectors() {
      input('vector-x', 80); input('vector-y', 70);
      const nearest = host.querySelector('.result-chips').textContent;
      assert(['truck', 'car', 'bus'].every(name => nearest.includes(name)), 'Geometric neighbors change with query');
      assert(!nearest.includes('cat'), 'Distant cat excluded');
      const slider = host.querySelector('#vector-x');
      slider.focus();
      const map = host.querySelector('.vector-map'), bounds = map.getBoundingClientRect();
      map.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: bounds.left + bounds.width / 2, clientY: bounds.top + bounds.height / 2 }));
      assert(slider === host.querySelector('#vector-x') && slider.value === '50', 'Map clicks synchronize a still-focused slider without detaching it');
    },
    absorption() { click('layer-language'); assert(!host.querySelector('.feedback.success'), 'Wrong main role gives useful feedback'); click('layer-model'); click('layer-primitives'); click('layer-language'); click('layer-primitives'); text('.metric', '4 / 4'); success(); },
  };
  try {
    for (const m of milestones) run(`${m.id}: interaction + reset`, () => {
      mountGame(m.game, host);
      const initial = host.innerHTML;
      assert(scenarios[m.game], `Scenario for ${m.game}`);
      scenarios[m.game]();
      mountGame(m.game, host);
      assert(host.innerHTML === initial, 'Reset restores the complete initial state');
    });
    run('timeline: equal story intervals, metric proportions, endpoints and coincident dates', () => {
      const state = { scale: 'logical', logicalZoom: 1, metricZoom: 1, scroll: 0, selected: 0 };
      const timeline = mountTimeline(host, state);
      const positions = () => [...host.querySelectorAll('.timeline-node')].map(e => parseFloat(e.style.left));
      const story = positions();
      assert(story.every((p, i) => i === 0 || Math.abs(p - story[i - 1] - 220) < .01), 'Story intervals are equal');
      assert([...host.querySelectorAll('.timeline-node')].every(el => el.getBoundingClientRect().height > 0), 'Milestone links have real mouse hit areas, not just positioned child artwork');
      host.querySelector('#go-end').click();
      const viewport = host.querySelector('.timeline-viewport');
      assert(viewport.scrollLeft > 3000, 'End button reaches present');
      host.querySelector('#go-start').click();
      assert(viewport.scrollLeft === 0, 'Beginning button reaches first stop');
      host.querySelector('[data-scale="metric"]').click();
      const metric = positions();
      const unit = (metric[1] - metric[0]) / (milestones[1].year - milestones[0].year);
      metric.forEach((p, i) => assert(Math.abs((p - metric[0]) - (milestones[i].year - milestones[0].year) * unit) < .02, `${milestones[i].id} uses elapsed years`));
      assert(metric[18] === metric[19], 'Same-year events occupy exactly the same metric position');
      assert(host.querySelector('.time-cluster'), 'Recent events visibly clustered');
      host.querySelector('#all-stops').click();
      assert(host.querySelectorAll('.era-picker a').length === 23, 'All overlapping milestones remain accessible');
      host.querySelector('[data-close-picker]').click();
      host.querySelector('.time-cluster').click();
      assert(state.metricZoom > 1, 'Cluster actually zooms in');
      timeline.zoom(1e8);
      assert(state.metricZoom === 16384, 'Zoom bounded below browser layout limits');
    });
    run('summary: layout and compute change work, never the answer', () => {
      mountSummary(host);
      text('.machine-output', '30');
      click('column');
      text('.machine-output', '6');
      input('summary-workers', 6);
      text('.machine-output', '1.0');
      text('.stable-answer', '88');
      assert(host.querySelectorAll('.inheritance-grid a').length === 23, 'Every milestone linked from synthesis');
    });
  } finally { host.remove(); }
  return { passed: results.filter(r => r.passed).length, total: results.length, results };
}
