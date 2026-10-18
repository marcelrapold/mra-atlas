import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const ci = JSON.parse(await read('brands/rapold/edgeportal/edgeportal.json'));
const rapold = JSON.parse(await read('packages/brands/src/rapold.json'));
const css = await read('brands/rapold/edgeportal/edgeportal.css');

const luminance = hex => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return .2126 * r + .7152 * g + .0722 * b;
};
const contrast = (a, b) => {const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + .05) / (y + .05);};

test('EdgePortal wall tokens are the dark Rapold roles, in JSON and CSS', () => {
  const dark = rapold.modes.dark, roles = {bg: 'background', surface: 'card', raised: 'popover', fg: 'foreground', muted: 'muted-foreground', line: 'border', accent: 'primary', ok: 'success', warn: 'warning', danger: 'destructive'};
  for (const [token, role] of Object.entries(roles)) {
    assert.equal(ci.wallTokens[token].toUpperCase(), dark[role].toUpperCase(), `${token} drifts from rapold.json ${role}`);
    const declared = css.match(new RegExp(`--ep-${token}:\\s*(#[0-9A-Fa-f]{6})`));
    assert.ok(declared, `edgeportal.css declares --ep-${token}`);
    assert.equal(declared[1].toUpperCase(), dark[role].toUpperCase(), `--ep-${token} drifts from rapold.json ${role}`);
  }
  assert.equal(ci.wallTokens.abyss.toUpperCase(), rapold.palette.abyss.toUpperCase());
});

test('Wall text roles reach 7:1 on every surface they are allowed on', () => {
  const wall = ci.distanceProfiles.find(profile => profile.id === 'wall');
  for (const [surface, roles] of Object.entries(ci.wallTokens.textOn)) for (const role of roles) {
    const ratio = contrast(ci.wallTokens[role], ci.wallTokens[surface]);
    assert.ok(ratio >= wall.contrastMin, `${role} on ${surface}: ${ratio.toFixed(2)}:1`);
  }
});

test('Wall scale meets the 28 px minimum and matches its container units', () => {
  const wall = ci.distanceProfiles.find(profile => profile.id === 'wall');
  for (const [step, size] of Object.entries(wall.scale)) {
    assert.ok(size.px1080 >= wall.baseMinPx1080, `${step} below ${wall.baseMinPx1080} px`);
    assert.ok(Math.abs(size.cqi * 19.2 - size.px1080) < .5, `${step}: ${size.cqi} cqi is not ${size.px1080} px at 1920 px`);
    assert.match(css, new RegExp(`--ep-${step}:\\s*${size.cqi}cqi`), `edgeportal.css uses ${size.cqi}cqi for ${step}`);
  }
});

test('every state speaks with word and shape, and the filled rhombus stays with the umbrella', () => {
  const items = [...Object.values(ci.states).flat(), ...ci.statusScreens];
  for (const item of items) {
    assert.ok(item.shape && item.shape.trim(), `${item.id} has a shape`);
    assert.ok((item.word ?? item.headline)?.trim(), `${item.id} has words`);
    assert.notEqual(item.shape, '◆', `${item.id} must not use the umbrella rhombus`);
    assert.ok(['accent', 'ok', 'warn', 'danger', 'muted'].includes(item.tone), `${item.id} uses a known tone`);
  }
  const ids = ci.surfaces.map(surface => surface.id);
  assert.equal(new Set(ids).size, ids.length, 'surface ids are unique');
});

test('one greeting source covers the whole day', () => {
  const minutes = time => {const [h, m] = time.split(':').map(Number); return h * 60 + m;};
  const total = ci.greetings.slots.reduce((sum, slot) => sum + ((minutes(slot.to) - minutes(slot.from) + 1440) % 1440), 0);
  assert.equal(total, 1440);
});

test('the brand page loads the EdgePortal CI with its own stylesheet', async () => {
  const showcase = await read('apps/docs/app/_components/rapold-showcase.tsx');
  assert.match(showcase, /<RapoldEdgePortal\/>/);
  assert.match(await read('apps/docs/app/_components/rapold-edgeportal.tsx'), /import '\.\.\/\.\.\/\.\.\/\.\.\/brands\/rapold\/edgeportal\/edgeportal\.css';/);
  assert.doesNotMatch(await read('apps/docs/app/globals.css'), /edgeportal\.css|\.ep-/);
});
