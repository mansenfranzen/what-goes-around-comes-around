import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { milestones, categories } from '../content/milestones.js';
import { gameNames } from '../js/games.js';
import { images } from '../content/images.js';

const base = new URL('../', import.meta.url);

test('all 23 documented milestones have complete narrative and a unique working game registration', async () => {
  assert.equal(milestones.length, 23);
  assert.equal(new Set(milestones.map(m => m.id)).size, 23);
  assert.equal(new Set(milestones.map(m => m.game)).size, 23);
  assert.deepEqual([...gameNames].sort(), milestones.map(m => m.game).sort());
  for (const [i, m] of milestones.entries()) {
    for (const key of ['title', 'date', 'problem', 'invention', 'takeaway', 'gameTitle', 'gameIntro', 'next', 'note']) {
      assert.equal(typeof m[key], 'string', `${m.id}.${key}`);
      assert.ok(m[key].length, `${m.id}.${key} must not be empty`);
    }
    assert.ok(categories[m.category], `${m.id} category`);
    assert.ok(Number.isFinite(m.year), `${m.id} metric anchor`);
    assert.ok(m.source.startsWith(String(i + 1).padStart(2, '0')), `${m.id} source sequence`);
    await access(new URL(`../../docs/milestones/${m.source}`, base));
  }
});

test('every milestone has a local, credited historical image', async () => {
  assert.deepEqual(Object.keys(images).sort(), milestones.map(m => m.id).sort());
  for (const [id, image] of Object.entries(images)) {
    for (const key of ['file', 'alt', 'caption', 'artist', 'license', 'source']) {
      assert.ok(image[key], `${id}.${key}`);
    }
    assert.match(image.source, /^https:\/\/commons\.wikimedia\.org\//);
    await access(new URL(image.file, base));
  }
});

test('every milestone illustration resolves to a local SVG symbol', async () => {
  const svg = await readFile(new URL('assets/symbols.svg', base), 'utf8');
  for (const m of milestones) assert.ok(svg.includes(`id="${m.icon}"`), `${m.id} illustration`);
  assert.equal(new Set(milestones.map(m => m.icon)).size, 23);
});

test('presentation entry is small and separates styles, behavior and content', async () => {
  const html = await readFile(new URL('index.html', base), 'utf8');
  assert.ok(html.length < 5000);
  assert.ok(!/<style\b/.test(html));
  assert.ok(!/<script[^>]*>[^<\s]/.test(html));
  assert.ok(html.includes('src="js/app.js"'));
  assert.ok(html.includes('href="styles.css"'));
});
