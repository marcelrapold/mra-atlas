// First paint of the static export: every route ships the inline theme boot script, the colour-scheme meta
// and a render-blocking link to the build-time token stylesheet; the stylesheet covers every brand x mode,
// the serialised script really resolves the theme, and every palette target exists in the export.
// Run after `npm run build`: node scripts/checks/first-paint.mjs
import {readFile, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {brands, toCssVariables} from '../../packages/brands/src/index.mjs';
import {docsOverrides, themeStylesheet} from '../../apps/docs/app/_components/theme-boot.ts';
import {buildIndex} from '../../apps/docs/app/_components/search-index.ts';
import * as catalog from '../../apps/docs/app/_components/catalog.ts';

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

// The exported stylesheet: generated from the brand registry, complete cascade per brand x mode.
const css = await readFile(new URL('theme.css', out), 'utf8');
assert.equal(css, themeStylesheet(brands, toCssVariables), 'out/theme.css matches the brand registry');
const version = createHash('sha256').update(css).digest('hex').slice(0, 12);
const rules = Object.fromEntries([...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map(([, selector, body]) => [selector.trim(), declarations(body)]));
for (const {brand, mode} of scopes) {
  const block = rules[`:root[data-brand="${brand}"][data-mode="${mode}"]`];
  assert.ok(block, `theme.css: token block for ${brand} x ${mode}`);
  assert.equal(block['color-scheme'], mode, `theme.css: ${brand} x ${mode} colour scheme`);
  // Cascade :root -> [data-brand] -> [data-brand][data-mode] on <html> must equal what the shell sets inline after
  // mount; it includes the motion tokens that ::view-transition-* reads from <html>.
  const resolved = {...rules[':root'], ...rules[`:root[data-brand="${brand}"]`], ...block};
  const expected = {...toCssVariables(brands.find(b => b.id === brand), mode), ...docsOverrides[brand]};
  for (const [name, value] of Object.entries(expected)) assert.equal(resolved[name], String(value), `theme.css: ${brand} x ${mode} ${name}`);
  assert.equal(block['background-color'], String(expected['--background']), `theme.css: ${brand} x ${mode} canvas background`);
}

let inline = 0;
const ids = new Map();
for (const route of routes) {
  const html = await readFile(new URL(route, out), 'utf8');
  const [, htmlTag] = pick(html, /<html([^>]*)>/, '<html>', route);
  assert.match(htmlTag, /lang="de-CH"/, `${route}: language`);
  assert.match(htmlTag, /data-brand="neutral"/, `${route}: server default brand`);
  assert.match(htmlTag, /data-mode="light"/, `${route}: server default mode`);
  const [, head] = pick(html, /<head>([\s\S]*?)<\/head>/, '<head>', route);
  assert.match(head, /<meta name="color-scheme" content="light dark"\/?>/, `${route}: color-scheme meta`);
  // The theme-color values belong to the viewport export (layout or page); this check only requires one.
  assert.ok(/<meta name="theme-color"/.test(head), `${route}: theme-color meta`);
  const [, script] = pick(head, /<script id="theme-boot">([\s\S]*?)<\/script>/, 'boot script in <head>', route);
  const link = pick(head, /<link[^>]*id="theme-tokens"[^>]*>/, 'token stylesheet link in <head>', route)[0];
  assert.match(link, /rel="stylesheet"/, `${route}: token link is a stylesheet`);
  assert.ok(link.includes(`href="/theme.css?v=${version}"`), `${route}: token link carries the current content hash`);
  assert.ok(head.indexOf('id="theme-boot"') < head.indexOf('id="theme-tokens"'), `${route}: boot script before the token stylesheet`);
  assert.doesNotMatch(html, /--background:/, `${route}: no token CSS inline in the HTML or flight data`);
  inline = Math.max(inline, script.length);
  ids.set(route, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1])));
  if (route !== 'index.html') continue;
  // Execute the shipped script, not its source: the build must not have broken the serialisation.
  assert.deepEqual(boot(script), {brand: 'neutral', mode: 'light', colorScheme: 'light'});
  assert.deepEqual(boot(script, {dark: true}), {brand: 'neutral', mode: 'dark', colorScheme: 'dark'});
  assert.deepEqual(boot(script, {search: '?brand=rapold', stored: {brand: 'neutral', mode: 'light', collapsed: true}, dark: true}), {brand: 'rapold', mode: 'light', rail: '', colorScheme: 'light'});
  assert.equal(boot(script, {stored: {brand: 'radiox', mode: 'dark'}}).brand, 'radiox');
}
assert.ok(inline < 2500, `Inline first-paint script grew to ${inline} bytes`);

// Palette targets: every page, module and section opens an exported page; an anchor must resolve to an id there.
let targets = 0;
for (const brand of brands) {
  const index = buildIndex(catalog, brand.id, id => `${catalog.href(id)}?brand=${brand.id}`);
  for (const entry of [...index.pages.flatMap(g => g.entries), ...index.modules, ...index.sections]) {
    const url = new URL(entry.target, 'https://atlas.invalid');
    const file = url.pathname === '/' ? 'index.html' : `${url.pathname.slice(1)}.html`;
    assert.ok(ids.has(file), `${entry.key}: ${entry.target} is not exported`);
    if (url.hash) assert.ok(ids.get(file).has(decodeURIComponent(url.hash.slice(1))), `${entry.key}: ${entry.target} has no matching id`);
    targets++;
  }
}
console.log(`First paint verified on ${routes.length} routes: boot script (${inline} bytes inline), color-scheme meta, theme.css with ${scopes.length} brand x mode blocks (${css.length} bytes, cached); ${targets} palette targets resolve.`);
