// First paint of the static export: every route ships the theme boot script, the colour-scheme meta
// and build-time token CSS for every brand x mode, and the serialised script really resolves the theme.
// Run after `npm run build`: node scripts/checks/first-paint.mjs
import {readFile, readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {brands, toCssVariables} from '../../packages/brands/src/index.mjs';
import {docsOverrides} from '../../apps/docs/app/_components/theme-boot.ts';

const out = new URL('../../apps/docs/out/', import.meta.url);
const routes = (await readdir(out)).filter(name => name.endsWith('.html')).sort();
assert.ok(routes.includes('index.html') && routes.length > 30, `Static export incomplete (${routes.length} HTML files); run npm run build first`);
const scopes = brands.flatMap(brand => Object.keys(brand.modes).map(mode => ({brand: brand.id, mode})));
const declarations = body => Object.fromEntries(body.split(';').filter(Boolean).map(d => [d.slice(0, d.indexOf(':')), d.slice(d.indexOf(':') + 1)]));
const pick = (html, re, what, route) => {const m = html.match(re); assert.ok(m, `${route}: ${what} missing`); return m;};

function boot(script, {search = '', stored = null, dark = false} = {}) {
  const root = {dataset: {}, style: {}};
  vm.runInNewContext(script, {document: {documentElement: root}, location: {search}, URLSearchParams,
    localStorage: {getItem: () => stored === null ? null : JSON.stringify(stored)}, matchMedia: q => ({matches: dark && q.includes('dark')})});
  return {...root.dataset, colorScheme: root.style.colorScheme};
}

let bytes = 0;
for (const route of routes) {
  const html = await readFile(new URL(route, out), 'utf8');
  const [, htmlTag] = pick(html, /<html([^>]*)>/, '<html>', route);
  assert.match(htmlTag, /lang="de-CH"/, `${route}: language`);
  assert.match(htmlTag, /data-brand="neutral"/, `${route}: server default brand`);
  assert.match(htmlTag, /data-mode="light"/, `${route}: server default mode`);
  const [, head] = pick(html, /<head>([\s\S]*?)<\/head>/, '<head>', route);
  assert.match(head, /<meta name="color-scheme" content="light dark"\/?>/, `${route}: color-scheme meta`);
  assert.equal((head.match(/<meta name="theme-color"/g) ?? []).length, 2, `${route}: light and dark theme-color`);
  const [, script] = pick(head, /<script id="theme-boot">([\s\S]*?)<\/script>/, 'boot script in <head>', route);
  const [, style] = pick(head, /<style id="theme-tokens">([\s\S]*?)<\/style>/, 'token style in <head>', route);
  const rules = Object.fromEntries([...style.matchAll(/([^{}]+)\{([^}]*)\}/g)].map(([, selector, body]) => [selector.trim(), declarations(body)]));
  for (const {brand, mode} of scopes) {
    const block = rules[`:root[data-brand="${brand}"][data-mode="${mode}"]`];
    assert.ok(block, `${route}: token block for ${brand} x ${mode}`);
    assert.equal(block['color-scheme'], mode, `${route}: ${brand} x ${mode} colour scheme`);
    // Cascade :root -> [data-brand] -> [data-brand][data-mode] on <html> must equal what the shell sets inline after
    // mount; it includes the motion tokens that ::view-transition-* reads from <html>.
    const resolved = {...rules[':root'], ...rules[`:root[data-brand="${brand}"]`], ...block};
    const expected = {...toCssVariables(brands.find(b => b.id === brand), mode), ...docsOverrides[brand]};
    for (const [name, value] of Object.entries(expected)) assert.equal(resolved[name], String(value), `${route}: ${brand} x ${mode} ${name}`);
    assert.equal(block['background-color'], String(expected['--background']), `${route}: ${brand} x ${mode} canvas background`);
  }
  bytes = Math.max(bytes, script.length + style.length);
  if (route !== 'index.html') continue;
  // Execute the shipped script, not its source: the build must not have broken the serialisation.
  assert.deepEqual(boot(script), {brand: 'neutral', mode: 'light', colorScheme: 'light'});
  assert.deepEqual(boot(script, {dark: true}), {brand: 'neutral', mode: 'dark', colorScheme: 'dark'});
  assert.deepEqual(boot(script, {search: '?brand=rapold', stored: {brand: 'neutral', mode: 'light', collapsed: true}, dark: true}), {brand: 'rapold', mode: 'light', rail: '', colorScheme: 'light'});
  assert.equal(boot(script, {stored: {brand: 'radiox', mode: 'dark'}}).brand, 'radiox');
}
assert.ok(bytes < 24000, `Inline first-paint payload grew to ${bytes} bytes`);
console.log(`First paint verified on ${routes.length} routes: boot script, color-scheme meta and ${scopes.length} brand x mode token blocks (${bytes} bytes inline).`);
