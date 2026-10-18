import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const ci = JSON.parse(await read('brands/rapold/edgeportal/edgeportal.json'));
const rapold = JSON.parse(await read('packages/brands/src/rapold.json'));
const stage = await read('brands/rapold/edgeportal/tv/stage.css');
const catalog = JSON.parse(await read('brands/rapold/edgeportal/views.json'));
const copies = (await readdir(new URL('../brands/rapold/edgeportal/tv/', import.meta.url))).filter(file => file.endsWith('.css'));
const modules = (await readdir(new URL('../apps/docs/app/_components/edgeportal/', import.meta.url))).filter(file => file.endsWith('.tsx'));

test('the TV copies name their source commit and stay the product stylesheets', async () => {
  assert.ok(copies.length >= 4, 'tv/ holds the copied stylesheets');
  for (const file of copies) {
    const text = await read(`brands/rapold/edgeportal/tv/${file}`);
    assert.match(text, new RegExp(`mra-edgeportal @ ${ci.reference.commit}`), `${file} names commit ${ci.reference.commit}`);
    const source = text.match(/@ [0-9a-f]{7} \([^)]*\): ([\w./-]+?)\.?[\s,]/)?.[1];
    assert.ok(source && ci.reference.files.includes(source), `edgeportal.json lists ${source ?? 'the source'} of ${file}`);
  }
  assert.match(stage, /--st-fs: clamp\(16px, min\(1\.9cqi, 1\.9cqb, max\(1\.05cqi, 1\.05cqb\)\), 120px\);/, 'stage.css keeps the product scale');
  assert.equal(ci.tv.scale.fs, 'clamp(16px, min(1.9cqi, 1.9cqb, max(1.05cqi, 1.05cqb)), 120px)');
  assert.doesNotMatch(stage, /\.stage-settings|\.stage-switch/, 'the controller part stays out of the TV copy');
});

test('the documented TV tokens are the values in the copied stage.css', () => {
  for (const group of ['roles', 'surfaces', 'identity']) for (const [name, value] of Object.entries(ci.tv.tokens[group])) {
    const declared = stage.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
    assert.ok(declared, `stage.css declares --${name}`);
    assert.equal(declared[1].toUpperCase(), value.toUpperCase(), `--${name}`);
  }
});

test('the TV already uses the dark Rapold roles of Atlas', () => {
  const dark = rapold.modes.dark;
  for (const [token, role] of Object.entries(ci.tv.tokens.atlasRoles)) {
    assert.equal(ci.tv.tokens.roles[token].toUpperCase(), dark[role].toUpperCase(), `${token} vs rapold.json ${role}`);
  }
});

test('every TV state speaks with word and shape, as in the product', () => {
  assert.deepEqual(ci.tv.states.agent.map(state => state.id).sort(), ['arbeitet', 'aus', 'bereit', 'dialog', 'frage', 'haengt']);
  for (const item of Object.values(ci.tv.states).flat()) {
    assert.ok(item.shape?.trim(), `${item.id} has a shape`);
    assert.ok(item.word?.trim(), `${item.id} has a word`);
  }
});

test('the TV greetings cover the whole day', () => {
  const minutes = time => {const [h, m] = time.split(':').map(Number); return h * 60 + m;};
  const total = ci.tv.greetings.slots.reduce((sum, slot) => sum + ((minutes(slot.to) - minutes(slot.from) + 1440) % 1440), 0);
  assert.equal(total, 1440);
});

test('ideas stay optional and the brand page loads the TV copies', async () => {
  assert.match(ci.ideas.status, /optional/);
  const component = await read('apps/docs/app/_components/rapold-edgeportal.tsx');
  for (const file of ['stage', 'presence', 'screen-nav', 'tv-power']) assert.match(component, new RegExp(`import '\\.\\./\\.\\./\\.\\./\\.\\./brands/rapold/edgeportal/tv/${file}\\.css';`));
  assert.match(await read('apps/docs/app/_components/rapold-showcase.tsx'), /<RapoldEdgePortal\/>/);
  assert.doesNotMatch(await read('apps/docs/app/globals.css'), /edgeportal|\.stage\b|\.nav-layer/);
});

test('every TV view is in the catalog, and every built view is rendered', async () => {
  const ids = catalog.items.map(item => item.id);
  assert.equal(new Set(ids).size, ids.length, 'view ids are unique');
  const areas = new Set(catalog.areas.map(area => area.id));
  for (const item of catalog.items) {
    assert.ok(areas.has(item.area), `${item.id} sits in a known area`);
    assert.ok(item.status in catalog.statuses, `${item.id} has a known status`);
    for (const field of ['title', 'trigger', 'source']) assert.ok(item[field]?.trim(), `${item.id} has a ${field}`);
    if (item.status === 'dokumentiert') assert.ok(item.reason?.trim(), `${item.id} says why it is not built`);
  }
  const rendered = [];
  for (const file of modules) for (const match of (await read(`apps/docs/app/_components/edgeportal/${file}`)).matchAll(/\{\s*id: '([a-z0-9-]+)',\s*area\b/g)) rendered.push(match[1]);
  assert.equal(new Set(rendered).size, rendered.length, 'no view is built twice');
  assert.deepEqual(rendered.sort(), catalog.items.filter(item => item.status === 'nachgebaut').map(item => item.id).sort(), 'built views and catalog agree');
  const component = await read('apps/docs/app/_components/rapold-edgeportal.tsx');
  for (const file of modules.filter(name => name !== 'shared.tsx')) assert.match(component, new RegExp(`from './edgeportal/${file.replace('.tsx', '')}'`), `the brand page uses ${file}`);
});
