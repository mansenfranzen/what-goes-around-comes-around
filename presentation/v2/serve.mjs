import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export function startServer(version = 'v2') {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const port = Number(process.env.PORT ?? 8765);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535.');
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.md': 'text/plain; charset=utf-8' };
  const server = createServer(async (req, res) => {
    let path;
    try { path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400); res.end('Invalid request path'); return; }
    if (path === '/' || path === '/presentation' || path === '/presentation/') {
      res.writeHead(302, { Location: `/presentation/${version}/` }); res.end(); return;
    }
    if (path.endsWith('/')) path += 'index.html';
    const file = resolve(root, `.${path}`);
    const allowed = ['presentation/v1', 'presentation/v2', 'presentation/v3', 'docs'].some(folder => file.startsWith(resolve(root, folder) + sep));
    if (!allowed) { res.writeHead(404); res.end('Not found'); return; }
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(body);
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'EISDIR' || error.code === 'ENOTDIR') { res.writeHead(404); res.end('Not found'); }
      else { console.error('File request failed:', error); res.writeHead(500); res.end('File request failed'); }
    }
  });
  server.on('error', error => { console.error('Presentation server failed:', error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`DB Time Machine: http://127.0.0.1:${port}/presentation/${version}/`));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) startServer();
