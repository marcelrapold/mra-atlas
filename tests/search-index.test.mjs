import test from 'node:test';
import assert from 'node:assert/strict';
import {fold, aliases, buildIndex, search} from '../apps/docs/app/_components/search-index.ts';
import * as catalog from '../apps/docs/app/_components/catalog.ts';
import {brands} from '../packages/brands/src/index.mjs';

const themedHref = brandId => id => `${catalog.href(id)}?brand=${brandId}`;
const index = (brandId = 'neutral') => buildIndex(catalog, brandId, themedHref(brandId));
const labels = results => ({pages: results.groups.flatMap(g => g.entries.map(e => e.label)), modules: results.modules.map(e => e.label), sections: results.sections.map(e => e.label)});

test('fold: case, umlaut spelling and diacritics do not matter', () => {
  assert.equal(fold('Präsentation'), 'praesentation');
  assert.equal(fold('ÖFFNEN Über'), 'oeffnen ueber');
  assert.equal(fold('Café'), 'cafe');
});

test('aliases point at real pages and add terms the id and title do not already contain', () => {
  for (const [id, terms] of Object.entries(aliases)) {
    const page = catalog.pages.find(p => p.id === id);
    assert.ok(page, `alias for unknown page ${id}`);
    for (const term of terms) assert.ok(!fold(`${page.id} ${page.title}`).includes(fold(term)), `${id}: alias «${term}» is redundant`);
  }
});

test('empty query lists every page and nothing else', () => {
  const results = search(index(), '');
  assert.equal(labels(results).pages.length, catalog.pages.length);
  assert.deepEqual([results.modules.length, results.sections.length], [0, 0]);
});

test('umlaut spelling is folded the same way for every entry kind', () => {
  for (const [a, b] of [['Präsentation', 'praesentation'], ['Abstände', 'abstaende'], ['PRÄSENTATION', 'präsentation']]) assert.deepEqual(search(index(), a), search(index(), b), `${a} = ${b}`);
  assert.ok(labels(search(index(), 'Präsentation')).pages.includes('Dramaturgie & Logik'));
});

test('acceptance: Switch, Breadcrumb and Kontrast', () => {
  const sw = search(index('rapold'), 'Switch');
  assert.equal(sw.modules[0].label, 'Switch');
  assert.equal(sw.modules[0].target, '/controls?brand=rapold');
  assert.equal(search(index(), 'breadcrumb').modules[0].target, '/page-structure?brand=neutral');
  const contrast = labels(search(index(), 'Kontrast')).pages;
  assert.ok(contrast.includes('Design-Tokens') && contrast.includes('Barrierefreiheit'));
  assert.ok(!contrast.includes('Raster & Abstände'), 'no fuzzy subsequence hits');
  assert.deepEqual(labels(search(index(), 'qzx')), {pages: [], modules: [], sections: []});
});

test('every word must match; label hits rank first', () => {
  assert.deepEqual(labels(search(index(), 'radio group')).modules, ['Radio Group']);
  const button = search(index(), 'button').modules.map(e => e.label);
  assert.equal(button[0], 'Button', 'prefix match before other label matches');
  assert.ok(button.includes('Icon Button') && button.includes('Play Button'));
});

test('every target opens an existing page of the active brand; no anchors without heading ids', () => {
  for (const brand of brands) {
    const {pages, modules, sections} = index(brand.id);
    const entries = [...pages.flatMap(g => g.entries), ...modules, ...sections];
    assert.equal(new Set(entries.map(e => e.key)).size, entries.length, `${brand.id}: unique keys`);
    for (const entry of entries) {
      assert.ok(catalog.pages.some(p => p.id === entry.page), `${entry.key}: unknown page ${entry.page}`);
      assert.equal(entry.target, themedHref(brand.id)(entry.page), `${entry.key}: target`);
    }
  }
});
