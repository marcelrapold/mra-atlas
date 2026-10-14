import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { brands, neutral, radiox, defineBrand, toCssVariables, cssVariableSets, toCssText, semanticTokens, dtcgFoundation, dtcgColors, dtcgResolver } from '../packages/brands/src/index.mjs';
import { writeTokenExports } from '../scripts/build-token-exports.mjs';

/** Declarations of the first `:where(...) { … }` block as [name, value]. */
const declarations = css => [...css.slice(css.indexOf('{') + 1, css.indexOf('}')).matchAll(/^\s+([-\w]+): (.+);$/gm)].map(m => [m[1], m[2]]);
const lightOnly = defineBrand({...structuredClone(neutral), id:'light-only', modes:{light:structuredClone(neutral.modes.light)}});

test('cssVariableSets splits toCssVariables without losing or changing a value', () => {
  for (const brand of [...brands, lightOnly]) {
    const {shared, modes} = cssVariableSets(brand), roles = Object.keys(semanticTokens(brand)).map(k => `--${k}`);
    assert.deepEqual(Object.keys(modes), Object.keys(brand.modes));
    for (const [mode, vars] of Object.entries(modes)) {
      assert.deepEqual({...shared, ...vars}, toCssVariables(brand, mode), `${brand.id}/${mode}`);
      for (const role of roles) assert.ok(role in vars, `${brand.id}/${mode}: ${role} is per mode`);
    }
  }
});
test('tokens.css: light-dark() arguments equal the light and dark values of every role', () => {
  for (const brand of brands.filter(b => b.modes.dark)) {
    const css = toCssText(brand), decl = new Map(declarations(css)), light = toCssVariables(brand, 'light'), dark = toCssVariables(brand, 'dark');
    assert.equal(decl.get('color-scheme'), 'light dark');
    for (const key of Object.keys(semanticTokens(brand))) {
      const m = /^light-dark\((#[0-9a-f]{6}), (#[0-9a-f]{6})\)$/i.exec(decl.get(`--${key}`) ?? '');
      assert.ok(m, `${brand.id}: --${key} uses light-dark()`);
      assert.deepEqual([m[1], m[2]], [light[`--${key}`], dark[`--${key}`]], `${brand.id}: --${key}`);
    }
    for (const [key, value] of decl) if (key.startsWith('--') && !value.startsWith('light-dark(')) assert.equal(value, String(light[key]), `${brand.id}: ${key}`);
    assert.equal(decl.size - 1, Object.keys(light).length, `${brand.id}: every variable once`);
    assert.ok(css.startsWith(`/* Atlas tokens · ${brand.id} ·`));
    assert.match(css, new RegExp(`^:where\\(\\[data-brand="${brand.id}"\\]\\) \\{$`, 'm'), 'zero-specificity scope on data-brand alone');
    for (const mode of ['light', 'dark']) assert.ok(css.includes(`:where([data-brand="${brand.id}"][data-mode="${mode}"], [data-brand="${brand.id}"] [data-mode="${mode}"]) { color-scheme: ${mode}; }`), `${brand.id}: data-mode=${mode} forces the scheme`);
  }
  assert.equal(toCssText(radiox).match(/light-dark\(/g).length, Object.keys(semanticTokens(radiox)).length);
});
test('tokens.css for a light-only brand uses plain values and color-scheme light', () => {
  const css = toCssText(lightOnly), decl = new Map(declarations(css));
  assert.equal(decl.get('color-scheme'), 'light');
  assert.doesNotMatch(css, /light-dark\(|data-mode/);
  for (const [key, value] of Object.entries(toCssVariables(lightOnly))) assert.equal(decl.get(key), String(value), key);
});
test('writeTokenExports writes the four file kinds, matching the API byte for byte', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'atlas-tokens-'));
  try {
    for (const brand of [...brands, lightOnly]) {
      const out = join(dir, brand.id), modes = Object.keys(brand.modes);
      const written = await writeTokenExports(brand, out);
      assert.deepEqual(written, ['tokens.css', 'tokens.foundation.dtcg.json', ...modes.map(m => `tokens.color.${m}.dtcg.json`), 'tokens.resolver.json'].sort());
      assert.deepEqual((await readdir(out)).sort(), written);
      const read = async name => readFile(join(out, name), 'utf8');
      assert.equal(await read('tokens.css'), toCssText(brand));
      assert.deepEqual(JSON.parse(await read('tokens.resolver.json')), dtcgResolver(brand));
      assert.deepEqual(JSON.parse(await read('tokens.foundation.dtcg.json')), dtcgFoundation(brand));
      for (const m of modes) assert.deepEqual(JSON.parse(await read(`tokens.color.${m}.dtcg.json`)), dtcgColors(brand, m));
      for (const name of written) assert.doesNotMatch(await read(name), /\r/, `${name}: LF only`);
    }
  } finally { await rm(dir, {recursive:true, force:true}); }
});
