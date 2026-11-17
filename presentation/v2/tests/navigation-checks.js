import { milestones } from '../content/milestones.js';

// Run on the v2 presentation page; this intentionally navigates between views.
export async function runNavigationChecks() {
  const originalHash = location.hash;
  const results = [];
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const navigate = async hash => {
    if (location.hash === `#${hash}`) return;
    const changed = new Promise(resolve => window.addEventListener('hashchange', resolve, { once: true }));
    location.hash = hash;
    await changed;
  };
  const run = async (name, fn) => {
    try { await fn(); results.push({ name, passed: true }); }
    catch (error) { results.push({ name, passed: false, error: error.message }); }
  };
  try {
    await run('landing and timeline are separate', async () => {
      await navigate('home');
      assert(document.querySelector('.landing')?.textContent.includes('How do we remember'), 'Landing has opening remarks');
      await navigate('timeline');
      assert(!document.querySelector('#main').textContent.includes('How do we remember'), 'Timeline omits opening remarks');
      assert(document.querySelectorAll('.timeline-node').length === 23, 'Timeline has all milestones');
    });
    await run('all milestone photos and experiment routes', async () => {
      for (const m of milestones) {
        await navigate(`milestone/${m.id}`);
        const photo = document.querySelector('.historical-image img');
        assert(photo, `${m.id} has a photograph`);
        await photo.decode();
        assert(photo.naturalWidth > 0, `${m.id} photograph loads`);
        assert(!document.querySelector('#game-root'), `${m.id} detail does not mount a game`);
        assert(document.querySelector(`a[href="#game/${m.id}"]`), `${m.id} links to its game`);
        await navigate(`game/${m.id}`);
        assert(document.querySelector('#game-root')?.children.length, `${m.id} game renders`);
        assert(document.querySelector(`a[href="#milestone/${m.id}"]`), `${m.id} game links back`);
      }
    });
    await run('experiment reset and Escape return', async () => {
      await navigate('game/tally');
      const root = document.querySelector('#game-root');
      const initial = root.innerHTML;
      root.querySelector('[data-action="carve"]').click();
      assert(root.innerHTML !== initial, 'Game changes after playing');
      document.querySelector('#reset-game').click();
      assert(root.innerHTML === initial, 'Reset restores game state');
      const changed = new Promise(resolve => window.addEventListener('hashchange', resolve, { once: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await changed;
      assert(location.hash === '#milestone/tally', 'Escape returns to the matching milestone');
    });
  } finally {
    if (originalHash) await navigate(originalHash.slice(1));
    else location.hash = '';
  }
  return { passed: results.filter(r => r.passed).length, total: results.length, results };
}
