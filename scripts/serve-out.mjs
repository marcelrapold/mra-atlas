#!/usr/bin/env node
// Static server for apps/docs/out with Vercel's cleanUrls semantics, so e2e
// tests see the same routes as production: /x serves x.html, /x.html and
// /x/index.html redirect (308) to the clean URL, unknown paths get 404.html.
// Segment prefetches (`__next.<a>.<b>.txt`) resolve to the exported nested
// files (`__next.<a>/<b>.txt`) as on Vercel.
// Usage: node scripts/serve-out.mjs [--port 4173] [--root apps/docs/out]
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { basename, dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.otf': 'font/otf', '.pdf': 'application/pdf', '.zip': 'application/zip', '.webmanifest': 'application/manifest+json',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4',
};

const isFile = async (path) => (await stat(path).catch(() => null))?.isFile() ?? false;

/** Resolve a URL pathname to [status, file | redirect location] under `root`. */
export async function route(dir, pathname) {
  const root = resolve(dir);
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return [400, null]; }
  const rel = normalize(decoded).replace(/^[/\\]+/, '');
  const base = resolve(root, rel);
  if (base !== root && !base.startsWith(root + sep)) return [403, null];
  // Redirect targets are rebuilt from the normalised path: always same-origin.
  const clean = `/${rel.split(sep).join('/')}`.replace(/(?:^|\/)index\.html$|\.html$|\/+$/, '') || '/';
  if (/\.html$/.test(decoded) || (decoded !== '/' && decoded.endsWith('/'))) return [308, encodeURI(clean)];
  const segment = /^(__next\.[^.]+)\.(.+\.txt)$/.exec(basename(base));
  const candidates = [base, `${base}.html`, join(base, 'index.html')];
  if (segment) candidates.push(join(dirname(base), segment[1], ...segment[2].replace(/\.txt$/, '').split('.')) + '.txt');
  for (const candidate of candidates) {
    if (await isFile(candidate)) return [200, candidate];
  }
  return [404, join(root, '404.html')];
}

export function serve({ root = 'apps/docs/out', port = 4173, host = '127.0.0.1' } = {}) {
  const dir = resolve(root);
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { allow: 'GET, HEAD' }).end();
      return;
    }
    const [status, target] = await route(dir, url.pathname);
    if (status === 308) {
      res.writeHead(308, { location: target + url.search }).end();
      return;
    }
    if (!target || !(await isFile(target))) {
      res.writeHead(status === 200 ? 404 : status, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
      return;
    }
    res.writeHead(status, {
      'content-type': TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream',
      'x-content-type-options': 'nosniff',
      'cache-control': 'no-store',
    });
    if (req.method === 'HEAD') res.end();
    else createReadStream(target).pipe(res);
  });
  return new Promise((done) => server.listen(port, host, () => done(server)));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { port: { type: 'string', default: process.env.PORT ?? '4173' }, root: { type: 'string', default: 'apps/docs/out' } } });
  const server = await serve({ root: values.root, port: Number(values.port) });
  const { port } = server.address();
  console.log(`Serving ${values.root} on http://127.0.0.1:${port}`);
}
