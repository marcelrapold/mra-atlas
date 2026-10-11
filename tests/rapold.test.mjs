import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { brands, neutral, rapold, contrast, toCssVariables, tokenDocument, dtcgTokens, resolveFoundation } from '../packages/brands/src/index.mjs';
import source from '../brands/rapold/sources/brand-tokens.json' with { type: 'json' };
import provenance from '../brands/rapold/sources/provenance.json' with { type: 'json' };

test('Rapold is one optional brand while the neutral default and product identities stay separate', () => {
  assert.equal(brands[0], neutral);
  assert.equal(brands.filter(brand => brand.id === 'rapold').length, 1);
  assert.equal(brands.find(brand => brand.id === 'rapold'), rapold);
  assert.equal(new Set(brands.map(brand => brand.id)).size, brands.length);
  for (const { id } of source.products) assert.ok(!brands.some(brand => brand.id === id), `${id} must remain a product signet`);
  assert.equal(Object.hasOwn(rapold, 'assets'), false, 'No product signet may become the umbrella logo');
  assert.equal(rapold.presentation.logoOnCover, false);
  assert.deepEqual(Object.keys(rapold.modes), ['light', 'dark']);
});

test('the supplied identity palette is preserved across CSS, JSON and DTCG exports', () => {
  for (const [name, value] of Object.entries(source.color.brand)) {
    assert.equal(rapold.palette[name], value, name);
    for (const mode of ['light', 'dark']) {
      assert.equal(toCssVariables(rapold, mode)[`--brand-color-${name}`], value);
      assert.equal(tokenDocument(rapold, mode).palette[name], value);
      assert.equal(dtcgTokens(rapold, mode).palette[name].$value.hex, value);
    }
  }
  assert.equal(rapold.palette['logo-light-primary'], source.color.lightLogo.primary);
  assert.equal(rapold.palette['logo-light-facet'], source.color.lightLogo.facet);
});

test('readable UI actions are exported independently from the logo Azure', () => {
  assert.ok(contrast(rapold.palette.azure, '#FFFFFF') < 4.5, 'The identity Azure cannot carry small white text');
  for (const mode of ['light', 'dark']) {
    const colors = rapold.modes[mode];
    assert.equal(colors.primary, source.color[mode].accent);
    assert.equal(colors['primary-foreground'], source.color[mode].accentInk);
    assert.notEqual(colors.primary, rapold.palette.azure);
    assert.equal(toCssVariables(rapold, mode)['--primary'], colors.primary);
    assert.equal(tokenDocument(rapold, mode).semantic.primary, colors.primary);
    assert.equal(dtcgTokens(rapold, mode).primary.$value.hex, colors.primary);
  }
});

test('Rapold accent, popover and status text remain readable on their actual surfaces', () => {
  // The shared brands test already covers all action labels, body text, inputs
  // and focus rings. These additional pairs cover the Rapold source mappings.
  for (const [mode, colors] of Object.entries(rapold.modes)) {
    for (const [foreground, background] of [['accent-foreground', 'accent'], ['popover-foreground', 'popover']]) {
      assert.ok(contrast(colors[foreground], colors[background]) >= 4.5, `${mode}/${foreground}/${background}`);
    }
    for (const role of ['success', 'warning', 'destructive']) {
      for (const surface of ['background', 'card']) {
        assert.ok(contrast(colors[role], colors[surface]) >= 4.5, `${mode}/${role} used as status text on ${surface}`);
      }
    }
  }
});

test('Geist and the supplied control and motion values are scoped to Rapold', () => {
  assert.equal(rapold.typography.family, `${source.typography.sans.family}, Arial, sans-serif`);
  assert.equal(rapold.typography.bodyFamily, source.typography.sans.family);
  assert.equal(rapold.typography.headingFamily, source.typography.sans.family);
  assert.equal(rapold.typography.bodyWeight, source.typography.scale.body.weight);
  assert.equal(rapold.typography.headingWeight, source.typography.scale.heading.weight);
  assert.equal(rapold.shape.radius, `${source.radiusPx.control}px`);
  assert.equal(toCssVariables(rapold)['--brand-font'], rapold.typography.family);
  assert.equal(toCssVariables(neutral)['--brand-font'], neutral.typography.family);
  const tokens = resolveFoundation(rapold);
  assert.equal(tokens.duration.normal, `${source.motion.durationMs}ms`);
  assert.equal(tokens.easing.standard, source.motion.easing);
  assert.equal(tokens.radius.lg, `${source.radiusPx.card}px`);
  assert.equal(tokens.radius.xl, `${source.radiusPx.panel}px`);
});

test('signet approval does not imply UI approval and the source snapshot is traceable', async () => {
  assert.equal(rapold.status, 'draft');
  assert.equal(rapold.status, provenance.approval.uiAdapter.status);
  assert.equal(provenance.approval.date, '2026-10-11');
  assert.equal(provenance.approval.signets.status, 'approved');
  assert.deepEqual(provenance.approval.signets.scope, source.products.map(product => product.id));
  assert.equal(provenance.approval.umbrellaSymbol, 'none');
  const suppliedTokens = provenance.sources.find(item => item.id === 'brand-tokens');
  const bytes = await readFile(new URL(`../${suppliedTokens.path}`, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), suppliedTokens.sha256);
  for (const path of ['brands/rapold/README.md', 'brands/rapold/DESIGN.md', suppliedTokens.path, 'brands/rapold/sources/provenance.json']) {
    assert.ok(rapold.sources.includes(path), `Missing source registration: ${path}`);
  }
});
