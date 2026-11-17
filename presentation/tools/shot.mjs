// Headless visual check, independent of the Playwright MCP browser (safe to run in parallel).
// Needs the dev server: node tools/serve.mjs   (http://127.0.0.1:8765)
// Usage: node tools/shot.mjs '#/m/05/1' '[["wait",500],["click",".game-05 .g-btn"],["shot","/tmp/shots/a.png"]]'
// Actions: ["wait",ms] ["click",sel] ["move",x,y] ["key",name] ["eval",js] ["shot",path] ["goto",hash]
// Prints eval results, page errors and console errors (404s of optional files are ignored).
// Env: SIZE=1280x720 (default 1920x1080), BASE=<url of another page to screenshot>.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const root = execSync('npm root -g').toString().trim();
const { chromium } = createRequire(import.meta.url)(root + '/@playwright/mcp/node_modules/playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:8765/index.html';
const [hash = '', rawActions = '[]'] = process.argv.slice(2);
const actions = JSON.parse(rawActions);

const browser = await chromium.launch();
const [vw, vh] = (process.env.SIZE || '1920x1080').split('x').map(Number);
const page = await browser.newPage({ viewport: { width: vw, height: vh } });
const problems = [];
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/404/.test(m.text())) problems.push('console: ' + m.text()); });

await page.goto(BASE + hash);
await page.waitForTimeout(1500);
for (const [op, a, b] of actions) {
  if (op === 'wait') await page.waitForTimeout(a);
  else if (op === 'click') await page.click(a);
  else if (op === 'move') await page.mouse.move(a, b);
  else if (op === 'key') await page.keyboard.press(a);
  else if (op === 'goto') { await page.goto(BASE + a); await page.waitForTimeout(1200); }
  else if (op === 'eval') console.log('eval:', JSON.stringify(await page.evaluate(a)));
  else if (op === 'shot') { mkdirSync(dirname(a), { recursive: true }); await page.screenshot({ path: a }); console.log('shot:', a); }
}
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'no page errors');
await browser.close();
