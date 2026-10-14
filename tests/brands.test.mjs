import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { brands, neutral, dominicanoExpress, defineBrand, contrast, toCssVariables, colorKeys, requiredBrandKeys, optionalBrandKeys, contrastPairs, auditBrand, apcaContrast, semanticTokens, derivedColorKeys, foundation } from '../packages/brands/src/index.mjs';
import brandSchema from '../packages/brands/src/brand.schema.json' with { type: 'json' };
import { presentationTheme } from '../packages/brands/src/presentation.mjs';
import known from './fixtures/contrast-exceptions.json' with { type: 'json' };

const pairId = r => `${r.brand}/${r.mode}/${r.fg} on ${r.bg}`;
test('every brand, mode and rendered pair meets WCAG 2.x, derived roles included', () => {
  const exceptions = new Map(known.exceptions.map(e => [pairId(e), e]));
  const roles = new Set([...colorKeys, ...derivedColorKeys]);
  for (const {fg,bg} of contrastPairs) assert.ok(roles.has(fg) && roles.has(bg), `${fg}/${bg} must be semantic roles`);
  let checked = 0;
  for (const brand of brands) for (const mode of Object.keys(brand.modes)) for (const {fg,bg,min,use} of contrastPairs) {
    const c = semanticTokens(brand,mode), ratio = contrast(c[fg],c[bg]), id = pairId({brand:brand.id,mode,fg,bg}), gap = exceptions.get(id);
    checked++;
    if (!gap) { assert.ok(ratio >= min, `${id}: ${ratio.toFixed(2)} < ${min} (${use}). Fix the colour with the owner or record it in tests/fixtures/contrast-exceptions.json`); continue; }
    exceptions.delete(id);
    assert.ok(ratio < min, `${id} passes now (${ratio.toFixed(2)}); remove the exception`);
    assert.equal(Number(ratio.toFixed(2)), gap.ratio, `${id}: recorded gap ${gap.ratio} changed to ${ratio.toFixed(2)}`);
    assert.equal(gap.min, min); assert.equal(gap.use, use);
    assert.equal(gap.status, 'Owner-Freigabe offen');
  }
  assert.deepEqual([...exceptions.keys()], [], 'exceptions for pairs that are no longer audited');
  assert.equal(checked, brands.reduce((n,b) => n + Object.keys(b.modes).length, 0) * contrastPairs.length);
});
test('auditBrand reports the same verdicts as the contract test', () => {
  for (const brand of brands) {
    const audit = auditBrand(brand);
    assert.equal(audit.length, Object.keys(brand.modes).length * contrastPairs.length);
    for (const r of audit) assert.equal(r.pass, r.ratio >= r.min, pairId(r));
    assert.deepEqual(audit.filter(r => !r.pass).map(pairId), known.exceptions.filter(e => e.brand === brand.id).map(pairId));
  }
});
test('APCA advisory: body-text pairs keep at least Lc 45', t => {
  // Reference values of APCA 0.0.98G-4g; the sign marks polarity.
  for (const [fg,bg,lc] of [['#888888','#ffffff',63.056469930209424],['#ffffff','#888888',-68.54146436644962],['#000000','#aaaaaa',58.146262578561334],['#aaaaaa','#000000',-56.24113336839742]]) assert.ok(Math.abs(apcaContrast(fg,bg) - lc) < 1e-9, `${fg} on ${bg}`);
  assert.equal(apcaContrast('#777777','#777777'), 0);
  const low = [];
  for (const brand of brands) for (const r of auditBrand(brand).filter(r => r.use === 'text')) {
    assert.ok(Math.abs(r.apca) >= 45, `${pairId(r)}: Lc ${r.apca.toFixed(1)}`);
    if (Math.abs(r.apca) < 60) low.push(`${pairId(r)} Lc ${Math.abs(r.apca).toFixed(1)}`);
  }
  if (low.length) t.diagnostic(`APCA below Lc 60 (advisory, WCAG 2.x passes): ${low.join('; ')}`);
});
test('brand schema rejects missing colors, unknown roles and CSS injection', () => {
  const missing = structuredClone(neutral);delete missing.modes.light.primary;
  assert.throws(() => defineBrand(missing));
  const extra = structuredClone(neutral);extra.modes.light.secret='#123456';assert.throws(() => defineBrand(extra));
  const injected = structuredClone(neutral);injected.typography.family='Arial; background:url(https://example.com)';assert.throws(() => defineBrand(injected));
});
test('new brands require no core changes and unsupported dark mode falls back', () => {
  const custom = defineBrand({...structuredClone(neutral),id:'next-company',name:'Next Company'});
  assert.equal(toCssVariables(custom)['--primary'],neutral.modes.light.primary);
  const lightOnly=defineBrand({...structuredClone(custom),modes:{light:structuredClone(custom.modes.light)}});
  assert.equal(toCssVariables(lightOnly,'dark')['--background'],lightOnly.modes.light.background);
  assert.equal(Object.isFrozen(custom.modes.light),true);
});
test('presentation and UI derive their identity from the same source', () => {
  for(const brand of brands) {
    const deck = presentationTheme(brand);
    assert.equal(deck.colors.accent,deck.deck?.accents.primary??brand.modes[brand.deck?.mode??'light'].primary);
    assert.equal(deck.typography.bodyWeight,brand.typography.bodyWeight);
    assert.equal(deck.evidence.required,true);
  }
});
test('core contains no organisation bindings, fonts or application infrastructure', async () => {
  const root = new URL('../packages/core/src/',import.meta.url);
  const walk = async dir => { for (const entry of await readdir(dir,{withFileTypes:true})) { const path=new URL(entry.name+(entry.isDirectory()?'/':''),dir); if(entry.isDirectory()) await walk(path); else { const text=await readFile(path,'utf8'); assert.doesNotMatch(text,/zvv|goldbach|sygnum|Brown Narrow|x-atlas-pin|supabase|next\/|framer-motion/i,entry.name); } } };
  await walk(root);
});
test('Dominicano Express remains an isolated draft brand with both modes', () => {
  assert.ok(brands.includes(dominicanoExpress));
  assert.equal(dominicanoExpress.status,'draft');
  assert.deepEqual(Object.keys(dominicanoExpress.modes),['light','dark']);
  assert.equal(toCssVariables(dominicanoExpress)['--brand-color-navy'],dominicanoExpress.palette.navy);
});
test('brand palettes cannot inject CSS or override semantic variables', () => {
  for(const palette of [{x:'url(https://example.com)'},{'x; color:red':'#FFFFFF'},[],{}, {x:'#FFF'}])assert.throws(()=>defineBrand({...structuredClone(neutral),palette}));
  const custom=defineBrand({...structuredClone(neutral),palette:{primary:'#123456'}});
  assert.equal(toCssVariables(custom)['--primary'],neutral.modes.light.primary);
  assert.equal(toCssVariables(custom)['--brand-color-primary'],'#123456');
});
test('the published brand schema cannot drift from the validator it documents', () => {
  assert.deepEqual(brandSchema.required,[...requiredBrandKeys],'schema required keys');
  assert.deepEqual(Object.keys(brandSchema.properties).sort(),[...requiredBrandKeys,...optionalBrandKeys].sort(),'schema property list');
  assert.deepEqual(brandSchema.$defs.mode.required,[...colorKeys],'schema colour roles');
  assert.equal(brandSchema.additionalProperties,false,'unknown brand keys must stay rejected');
  for (const brand of brands) {
    for (const key of Object.keys(brand)) assert.ok(key in brandSchema.properties,`${brand.id}: ${key} missing from the schema`);
    for (const key of requiredBrandKeys) assert.ok(key in brand,`${brand.id}: ${key} missing from the brand`);
    for (const colors of Object.values(brand.modes)) assert.deepEqual(Object.keys(colors).sort(),[...colorKeys].sort(),`${brand.id}: colour roles`);
  }
  // Runtime acceptance and the published schema must describe the same contract.
  assert.throws(()=>defineBrand({...structuredClone(neutral),unknownBlock:{}}),/invalid keys/);
});
test('the schema token groups mirror foundation.json key by key', () => {
  const tokens = brandSchema.properties.tokens, groups = Object.entries(foundation).filter(([,v]) => typeof v === 'object');
  assert.equal(tokens.additionalProperties, false);
  assert.deepEqual(Object.keys(tokens.properties), groups.map(([g]) => g), 'token groups');
  const css = new RegExp(brandSchema.$defs.tokenCss.pattern);
  for (const [group,values] of groups) {
    const schema = tokens.properties[group];
    assert.equal(schema.additionalProperties, false, group);
    assert.deepEqual(Object.keys(schema.properties), Object.keys(values), `${group} keys`);
    for (const [key,value] of Object.entries(values)) {
      assert.equal(schema.properties[key].$ref, typeof value === 'number' ? '#/$defs/tokenNumber' : '#/$defs/tokenCss', `${group}.${key}`);
      if (typeof value === 'string') assert.match(value, css, `${group}.${key} baseline must satisfy its own schema`);
    }
  }
  for (const brand of brands) for (const [group,values] of Object.entries(brand.tokens ?? {})) for (const key of Object.keys(values)) assert.ok(tokens.properties[group]?.properties[key], `${brand.id}: tokens.${group}.${key}`);
  assert.throws(() => defineBrand({...structuredClone(neutral),tokens:{spacing:{7:'28px'}}}), /Invalid token/);
  assert.throws(() => defineBrand({...structuredClone(neutral),tokens:{notAGroup:{sm:'1px'}}}), /Unknown token group/);
});
