import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {resolveTheme, applyTheme, themeBootScript, themeStylesheet, docsOverrides, preferencesKey} from '../apps/docs/app/_components/theme-boot.ts';
import {brands, toCssVariables} from '../packages/brands/src/index.mjs';

// Parses the generated stylesheet into {selector: {property: value}}.
const parseRules = css => Object.fromEntries([...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map(([, selector, body]) =>
  [selector.trim(), Object.fromEntries(body.split(';').filter(Boolean).map(d => [d.slice(0, d.indexOf(':')), d.slice(d.indexOf(':') + 1)]))]));

test('token stylesheet: the :root cascade equals the inline set of every brand x mode', () => {
  const rules = parseRules(themeStylesheet(brands, toCssVariables));
  for (const brand of brands) for (const mode of Object.keys(brand.modes)) {
    const block = rules[`:root[data-brand="${brand.id}"][data-mode="${mode}"]`];
    assert.ok(block, `${brand.id} x ${mode} block`);
    assert.equal(block['color-scheme'], mode);
    const resolved = {...rules[':root'], ...rules[`:root[data-brand="${brand.id}"]`], ...block};
    const expected = {...toCssVariables(brand, mode), ...docsOverrides[brand.id]};
    for (const [name, value] of Object.entries(expected)) assert.equal(resolved[name], String(value), `${brand.id} x ${mode} ${name}`);
    assert.equal(block['background-color'], String(expected['--background']), `${brand.id} x ${mode} canvas`);
  }
  assert.equal(rules[':root[data-brand="neutral"][data-mode="dark"]'] !== undefined, Boolean(brands.find(b => b.id === 'neutral').modes.dark));
});

const list = [{id: 'neutral', dark: true}, {id: 'rapold', dark: true}, {id: 'paper', dark: false}];

test('defaults: neutral, light, system, expanded rail', () => {
  assert.deepEqual(resolveTheme(list, null, null, false), {brand: 'neutral', mode: 'light', appearance: 'system', collapsed: false});
  assert.equal(resolveTheme(list, null, undefined, true).mode, 'dark', 'system dark applies without stored preference');
});

test('query beats storage beats default', () => {
  assert.equal(resolveTheme(list, 'rapold', {brand: 'paper'}, false).brand, 'rapold');
  assert.equal(resolveTheme(list, null, {brand: 'paper'}, false).brand, 'paper');
  assert.equal(resolveTheme(list, 'unknown', {brand: 'rapold'}, false).brand, 'rapold', 'unknown query falls through to storage');
  assert.equal(resolveTheme(list, 'unknown', {brand: 'retired'}, false).brand, 'neutral', 'unknown ids fall back to the default brand');
  assert.equal(resolveTheme([{id: 'solo', dark: false}], null, null, false).brand, 'solo', 'without neutral the first brand is the default');
});

test('stored mode beats system preference', () => {
  assert.equal(resolveTheme(list, null, {mode: 'light'}, true).mode, 'light');
  assert.equal(resolveTheme(list, null, {mode: 'dark'}, false).mode, 'dark');
  assert.equal(resolveTheme(list, null, {mode: 'system'}, true).mode, 'dark');
  assert.deepEqual(resolveTheme(list, null, {mode: 'sepia'}, true), {brand: 'neutral', mode: 'dark', appearance: 'system', collapsed: false}, 'invalid mode means system');
});

test('dark is ignored for light-only brands, the appearance choice is kept', () => {
  assert.deepEqual(resolveTheme(list, 'paper', {mode: 'dark'}, true), {brand: 'paper', mode: 'light', appearance: 'dark', collapsed: false});
  assert.equal(resolveTheme(list, null, {brand: 'paper'}, true).mode, 'light');
});

test('collapsed rail only for an explicit true; malformed storage is ignored', () => {
  assert.equal(resolveTheme(list, null, {collapsed: true}, false).collapsed, true);
  assert.equal(resolveTheme(list, null, {collapsed: 'true'}, false).collapsed, false);
  for (const stored of [42, 'rapold', ['rapold'], true]) assert.deepEqual(resolveTheme(list, null, stored, false), resolveTheme(list, null, null, false));
});

test('every registered brand resolves to its own id', () => {
  const registry = brands.map(b => ({id: b.id, dark: Boolean(b.modes.dark)}));
  for (const brand of registry) assert.equal(resolveTheme(registry, brand.id, null, true).mode, brand.dark ? 'dark' : 'light');
});

function fakeRoot() {
  return {dataset: {}, style: {}};
}
function runBoot({search = '', storage = null, dark = false, throwStorage = false, throwMedia = false} = {}) {
  const root = fakeRoot();
  const context = {
    document: {documentElement: root},
    location: {search},
    URLSearchParams,
    localStorage: {getItem: key => {if (throwStorage) throw new Error('blocked'); return key === preferencesKey ? storage : null;}},
    matchMedia: query => {if (throwMedia) throw new Error('unsupported'); return {matches: dark && query === '(prefers-color-scheme: dark)'};},
  };
  vm.runInNewContext(themeBootScript(list), context);
  return root;
}

test('applyTheme writes brand, mode, rail and colour scheme', () => {
  const root = fakeRoot();
  applyTheme(root, {brand: 'rapold', mode: 'dark', collapsed: true});
  assert.deepEqual({...root.dataset}, {brand: 'rapold', mode: 'dark', rail: ''});
  assert.equal(root.style.colorScheme, 'dark');
  applyTheme(root, {brand: 'neutral', mode: 'light', collapsed: false});
  assert.equal('rail' in root.dataset, false);
});

test('boot script: serialised resolver sets <html> before paint', () => {
  const root = runBoot({search: '?brand=rapold', storage: JSON.stringify({brand: 'paper', mode: 'system', collapsed: true}), dark: true});
  assert.deepEqual({...root.dataset}, {brand: 'rapold', mode: 'dark', rail: ''});
  assert.equal(root.style.colorScheme, 'dark');
  assert.deepEqual({...runBoot({dark: true}).dataset}, {brand: 'neutral', mode: 'dark'});
});

test('boot script survives blocked storage, broken JSON and missing matchMedia', () => {
  assert.deepEqual({...runBoot({search: '?brand=rapold', throwStorage: true}).dataset}, {brand: 'rapold', mode: 'light'});
  assert.deepEqual({...runBoot({storage: '{not json', dark: true}).dataset}, {brand: 'neutral', mode: 'dark'});
  assert.deepEqual({...runBoot({storage: JSON.stringify({mode: 'dark'}), throwMedia: true}).dataset}, {brand: 'neutral', mode: 'dark'});
});

test('boot script is inline-safe and carries only ids and modes', () => {
  const script = themeBootScript([{id: '</script><x', dark: false}]);
  assert.equal(script.includes('</script'), false, 'no closing tag can end the inline script');
  const real = themeBootScript(brands.map(b => ({id: b.id, dark: Boolean(b.modes.dark)})));
  for (const brand of brands) assert.ok(real.includes(JSON.stringify(brand.id)));
  assert.doesNotMatch(real, /#[0-9a-f]{6}/i, 'colours live in the token style, not in the script');
  assert.ok(real.length < 2500, `boot script stays small (${real.length} bytes)`);
});
