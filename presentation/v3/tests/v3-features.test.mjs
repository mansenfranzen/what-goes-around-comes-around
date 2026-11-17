import assert from 'node:assert';
import { readFile } from 'node:fs/promises';

const readHTML = async (file) => {
  const path = new URL(`../${file}`, import.meta.url);
  return await readFile(path, 'utf-8');
};

export async function runV3Tests() {
  const indexHTML = await readHTML('index.html');
  const appJS = await readHTML('js/app.js');
  const stylesCSS = await readHTML('styles.css');

  const results = [];

  // Test 1: Footer removed from HTML
  try {
    assert(!indexHTML.includes('<footer class="footer">'), 'Footer element should be removed');
    results.push({ test: 'Footer removed from HTML', passed: true });
  } catch (e) {
    results.push({ test: 'Footer removed from HTML', passed: false, error: e.message });
  }

  // Test 2: Landing page has two core ideas
  try {
    assert(appJS.includes('Environment → Invention'), 'Should contain first core idea');
    assert(appJS.includes('What Goes Around Comes Around'), 'Should contain second core idea');
    assert(appJS.includes('landing-core-ideas'), 'Should have landing-core-ideas class');
    results.push({ test: 'Landing page shows 2 core ideas', passed: true });
  } catch (e) {
    results.push({ test: 'Landing page shows 2 core ideas', passed: false, error: e.message });
  }

  // Test 3: Game view fullscreen (no return link)
  try {
    const gameViewCode = appJS.substring(appJS.indexOf('function gameView'));
    assert(!gameViewCode.includes('game-return'), 'Game view should not have game-return link');
    assert(gameViewCode.includes('class="game-page'), 'Game should have game-page class');
    assert(gameViewCode.includes('experiment-panel'), 'Game should have experiment-panel');
    results.push({ test: 'Game view fullscreen without return link', passed: true });
  } catch (e) {
    results.push({ test: 'Game view fullscreen without return link', passed: false, error: e.message });
  }

  // Test 4: Backspace navigation
  try {
    assert(appJS.includes("e.key === 'Backspace'"), 'Should handle Backspace key');
    assert(appJS.includes('previousHash'), 'Should track previousHash');
    results.push({ test: 'Backspace key navigation implemented', passed: true });
  } catch (e) {
    results.push({ test: 'Backspace key navigation implemented', passed: false, error: e.message });
  }

  // Test 5: Help dialog mentions Backspace
  try {
    assert(indexHTML.includes('Backspace'), 'Help dialog should mention Backspace key');
    results.push({ test: 'Help dialog updated for Backspace', passed: true });
  } catch (e) {
    results.push({ test: 'Help dialog updated for Backspace', passed: false, error: e.message });
  }

  // Test 6: Milestone layout has text on right
  try {
    assert(appJS.includes('milestone-text'), 'Should have milestone-text container');
    assert(stylesCSS.includes('.milestone-text'), 'CSS should define milestone-text styles');
    results.push({ test: 'Milestone layout restructured (text on right)', passed: true });
  } catch (e) {
    results.push({ test: 'Milestone layout restructured (text on right)', passed: false, error: e.message });
  }

  // Test 7: Game button instead of link
  try {
    assert(appJS.includes('data-game-id'), 'Should have game button with data-game-id');
    assert(appJS.includes('.game-button'), 'Should have game-button click handler');
    results.push({ test: 'Game button in milestone view', passed: true });
  } catch (e) {
    results.push({ test: 'Game button in milestone view', passed: false, error: e.message });
  }

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`\n=== V3 Feature Tests (${passed}/${total} passed) ===\n`);
  for (const result of results) {
    const icon = result.passed ? '✓' : '✗';
    console.log(`${icon} ${result.test}`);
    if (!result.passed) console.log(`  Error: ${result.error}`);
  }
  
  return passed === total;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const success = await runV3Tests();
  process.exit(success ? 0 : 1);
}
