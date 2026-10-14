import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { route, serve } from '../scripts/serve-out.mjs';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('every GitHub Action is pinned to a full commit SHA with a version comment', async () => {
  const dir = new URL('.github/workflows/', root);
  let count = 0;
  for (const name of await readdir(dir)) {
    for (const line of (await read(`.github/workflows/${name}`)).split('\n')) {
      const m = /^\s*(?:-\s+)?uses:\s*(\S+)(.*)$/.exec(line);
      if (!m || m[1].startsWith('./')) continue;
      count += 1;
      assert.match(m[1], /^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/, `${name}: ${m[1]} is not SHA-pinned`);
      assert.match(m[2], /^\s+# v\d+\.\d+\.\d+$/, `${name}: ${m[1]} lacks a "# vX.Y.Z" comment`);
    }
  }
  assert.ok(count > 0);
});

test('check workflow keeps least privilege and mirrors npm run check', async () => {
  const yml = await read('.github/workflows/check.yml');
  assert.match(yml, /^permissions:\n  contents: read$/m);
  assert.doesNotMatch(yml, /write/, 'no write permissions');
  assert.equal(yml.match(/persist-credentials: false/g)?.length, yml.match(/actions\/checkout@/g)?.length);
  assert.match(yml, /cancel-in-progress: true/);
  assert.match(yml, /node-version-file: \.nvmrc/);
  for (const step of ['npm ci --no-audit --no-fund', 'npm audit signatures', 'npm run test:coverage', 'npm run typecheck', 'npm run build', 'npm run test:e2e']) assert.ok(yml.includes(step), step);
  assert.equal((await read('.nvmrc')).trim(), '22');
});

test('package scripts keep the Vercel build contract and pin the e2e stack', async () => {
  const pkg = JSON.parse(await read('package.json'));
  const vercel = JSON.parse(await read('vercel.json'));
  assert.equal(vercel.buildCommand, 'npm run check');
  assert.equal(pkg.scripts.check, 'npm run test && npm run typecheck && npm run build');
  assert.equal(pkg.scripts.typecheck, 'tsc --noEmit && tsc -p packages/core --noEmit');
  assert.equal(pkg.scripts.postbuild, 'node scripts/check-build.mjs');
  assert.match(pkg.engines.node, /^>=22\.(1[89]|[2-9]\d)/, 'module.registerHooks for the core-lib .ts hook needs Node >= 22.15; floor is the tested 22.18');
  for (const dep of ['@playwright/test', '@axe-core/playwright', 'playwright-core']) assert.match(pkg.devDependencies[dep] ?? '', /^\d+\.\d+\.\d+$/, `${dep} exact pin`);
  assert.equal(pkg.devDependencies['playwright-core'], pkg.devDependencies['@playwright/test'], 'axe and test runner share one playwright-core');
  const core = JSON.parse(await read('packages/core/tsconfig.json'));
  for (const flag of ['noImplicitOverride', 'verbatimModuleSyntax', 'noFallthroughCasesInSwitch', 'noImplicitReturns', 'noUncheckedIndexedAccess']) assert.equal(core.compilerOptions[flag], true, flag);
});

test('Dependabot never bumps the hash-locked deck render stack', async () => {
  const yml = await read('.github/dependabot.yml');
  const ignore = yml.slice(yml.indexOf('ignore:'), yml.indexOf('package-ecosystem: github-actions'));
  for (const dep of ['pptxgenjs', 'jszip', 'sharp', '@fontsource/inter']) assert.match(ignore, new RegExp(`dependency-name: '?${dep.replace('/', '\\/')}'?\\n`), dep);
  assert.match(yml, /semver-major-days: 14/);
  assert.match(yml, /prefix: chore\(deps\)/);
});

test('serve-out mirrors Vercel cleanUrls and segment prefetch paths', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'atlas-out-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await mkdir(join(dir, 'tokens', '__next.$d$section'), { recursive: true });
  await mkdir(join(dir, 'brands', 'atlas'), { recursive: true });
  for (const file of ['index.html', '404.html', 'tokens.html', 'tokens/__next.$d$section/__PAGE__.txt', 'brands/atlas/brand.json']) await writeFile(join(dir, file), file);

  assert.deepEqual(await route(dir, '/'), [200, join(dir, 'index.html')]);
  assert.deepEqual(await route(dir, '/tokens'), [200, join(dir, 'tokens.html')]);
  assert.deepEqual(await route(dir, '/tokens.html'), [308, '/tokens']);
  assert.deepEqual(await route(dir, '/index.html'), [308, '/']);
  assert.deepEqual(await route(dir, '/tokens/'), [308, '/tokens']);
  assert.deepEqual(await route(dir, '/tokens/__next.$d$section.__PAGE__.txt'), [200, join(dir, 'tokens', '__next.$d$section', '__PAGE__.txt')]);
  assert.deepEqual(await route(dir, '/brands/atlas/brand.json'), [200, join(dir, 'brands', 'atlas', 'brand.json')]);
  assert.deepEqual(await route(dir, '/missing'), [404, join(dir, '404.html')]);
  assert.deepEqual(await route(dir, '/%2e%2e/%2e%2e/index.html'), [308, '/'], 'redirects stay inside the root');
  assert.deepEqual(await route(dir, '//evil.example.html'), [308, '/evil.example'], 'no protocol-relative redirect');
  assert.deepEqual(await route(dir, '/brands/atlas/'), [308, '/brands/atlas']);
  assert.deepEqual(await route(dir, '/%2e%2e/%2e%2e/tokens'), [200, join(dir, 'tokens.html')], 'dot segments stay inside the root');
  assert.equal((await route(dir, '/%E0%A4%A'))[0], 400);

  const server = await serve({ root: dir, port: 0 });
  t.after(() => new Promise((done) => server.close(done)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(`${base}/tokens`);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /^text\/html/);
  assert.equal(await page.text(), 'tokens.html');
  const redirect = await fetch(`${base}/tokens.html?brand=atlas`, { redirect: 'manual' });
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get('location'), '/tokens?brand=atlas');
  const missing = await fetch(`${base}/nope`);
  assert.equal(missing.status, 404);
  assert.equal(await missing.text(), '404.html');
  assert.equal((await fetch(`${base}/`, { method: 'POST' })).status, 405);
});
