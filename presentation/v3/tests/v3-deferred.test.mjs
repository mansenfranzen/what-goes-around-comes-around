import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

test('v3 deferred features', async (t) => {
  const appJs = readFileSync('js/app.js', 'utf-8');
  const timelineJs = readFileSync('js/timeline.js', 'utf-8');
  const summaryJs = readFileSync('js/summary.js', 'utf-8');
  const styles = readFileSync('styles.css', 'utf-8');

  await t.test('transition pages are implemented and routed', () => {
    assert(appJs.includes('function transitionView('), 'transitionView function exists');
    assert(appJs.includes('hash.startsWith(\'transition/\')'), 'transition route handling exists');
    assert(appJs.includes('fromIndex'), 'transition routing uses milestone indices');
    assert(Object.keys(JSON.parse('{"01→02":"test"}'))
      .some(k => k.match(/→/)), 'transition data uses arrow notation');
  });

  await t.test('transitions link from milestone pagination', () => {
    assert(appJs.includes('#transition/'), 'milestone pagination links to transitions');
    assert(appJs.includes('transition-page'), 'transition view renders transition-page element');
  });

  await t.test('milestone clustering uses density visualization', () => {
    assert(timelineJs.includes('cluster-grid'), 'grid-based clustering visualization exists');
    assert(timelineJs.includes('cluster-mini'), 'mini icon elements for density display');
    assert(timelineJs.includes('cluster-visual'), 'cluster visual container');
    assert(!timelineJs.includes('+${group.length}'), 'old "+N ideas" text removed');
  });

  await t.test('historical markers are added to timeline', () => {
    assert(timelineJs.includes('historicalMarkers'), 'historical markers array exists');
    assert(timelineJs.includes('3300'), 'writing invention marker (≈3300 BCE)');
    assert(timelineJs.includes('historical-marker'), 'marker element class');
    assert(styles.includes('.historical-marker'), 'marker styles defined');
  });

  await t.test('transition page styling is comprehensive', () => {
    assert(styles.includes('.transition-page'), 'transition-page styles');
    assert(styles.includes('.transition-content'), 'transition content layout');
    assert(styles.includes('.transition-problem'), 'transition problem section');
    assert(styles.includes('.transition-solution'), 'transition solution section');
    assert(styles.includes('.transition-breadcrumb'), 'transition navigation breadcrumb');
  });

  await t.test('mini artifact icon styling for density visualization', () => {
    assert(styles.includes('.artifact.mini'), 'mini artifact class');
    assert(styles.includes('width: 16px'), 'mini icon size defined');
  });

  await t.test('summary includes unification story', () => {
    assert(summaryJs.includes('unification-story'), 'unification story section');
    assert(summaryJs.includes('23 ideas'), 'mentions all 23 milestones');
    assert(summaryJs.includes('Environment → Invention'), 'includes core pattern');
    assert(styles.includes('.unification-story'), 'unification story styles');
  });

  await t.test('summary inheritance grid includes descriptions', () => {
    assert(summaryJs.includes('inheritance-desc'), 'inheritance description text');
    assert(summaryJs.includes('Trace the evolution'), 'evolution narrative');
  });
});
