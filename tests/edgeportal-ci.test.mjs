import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const ci = JSON.parse(await read('brands/rapold/edgeportal/edgeportal.json'));
const rapold = JSON.parse(await read('packages/brands/src/rapold.json'));
const stage = await read('brands/rapold/edgeportal/tv/stage.css');

test('the TV copies name their source commit and stay the product stylesheets', async () => {
  for (const file of ['stage', 'presence', 'screen-nav', 'tv-power']) {
    const text = await read(`brands/rapold/edgeportal/tv/${file}.css`);
    assert.match(text, new RegExp(`mra-edgeportal @ ${ci.reference.commit}`), `${file}.css names commit ${ci.reference.commit}`);
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
