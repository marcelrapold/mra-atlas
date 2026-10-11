import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {brands,sygnum,neutral,goldbach,dominicanoExpress,defineBrand,toCssVariables,tokenDocument,dtcgTokens,contrast} from '../packages/brands/src/index.mjs';
import {compilePrompt} from '../packages/brands/src/prompt-compiler.mjs';

test('Sygnum has an isolated, explicitly draft, light-only identity',()=>{
 assert.ok(brands.includes(sygnum));
 assert.equal(new Set(brands.map(b=>b.id)).size,brands.length);
 assert.equal(sygnum.status,'draft');assert.deepEqual(Object.keys(sygnum.modes),['light']);
 assert.equal(toCssVariables(sygnum,'dark')['--background'],sygnum.modes.light.background);
 for(const b of [neutral,goldbach])assert.equal(b.palette,undefined);
});
test('measured identity palette is exported separately from contrast refinements',()=>{
 assert.equal(sygnum.palette.coral,'#F04E69');assert.equal(sygnum.palette.ink,'#4C495F');
 assert.equal(sygnum.modes.light.primary,'#C32D4F');
 assert.ok(contrast(sygnum.palette.coral,'#FFFFFF')<4.5);
 assert.ok(contrast(sygnum.modes.light.primary,'#FFFFFF')>=4.5);
 assert.equal(toCssVariables(sygnum)['--brand-color-coral'],sygnum.palette.coral);
 assert.equal(tokenDocument(sygnum).palette.coral,sygnum.palette.coral);
 assert.equal(dtcgTokens(sygnum).palette.coral.$value.hex,sygnum.palette.coral);
 assert.ok(contrast(sygnum.modes.light['accent-foreground'],sygnum.modes.light.accent)>=4.5);
});
test('brand palette cannot inject CSS or override semantic variables',()=>{
 for(const palette of [{x:'url(https://example.com)'},{'x; color:red':'#FFFFFF'},[],{}, {'x':'#FFF'}])assert.throws(()=>defineBrand({...structuredClone(sygnum),palette}));
 const custom=defineBrand({...structuredClone(neutral),palette:{primary:'#123456'}});
 assert.equal(toCssVariables(custom)['--primary'],neutral.modes.light.primary);
 assert.equal(toCssVariables(custom)['--brand-color-primary'],'#123456');
});
test('short task targets only the active Sygnum management contract',()=>{
 const prompt=compilePrompt({idea:'Analysiere owner/repo.',format:'Präsentation',brand:sygnum});
 assert.match(prompt,/brands\/sygnum\/management\.md/);assert.doesNotMatch(prompt,/goldbach|brands\/neutral/i);
});
test('source manifest records gaps and does not invent gated-source access',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../brands/sygnum/sources/sources.json',import.meta.url),'utf8'));
 assert.equal(manifest.status,'draft');assert.equal(manifest.sources.find(s=>s.id==='q2-2026').status,'landing-only');
 assert.equal(manifest.sources.find(s=>s.id==='outlook-2025').status,'measured');
 const observations=JSON.parse(await readFile(new URL('../brands/sygnum/sources/observations.json',import.meta.url),'utf8'));
 assert.equal(observations.sources[0].pages,31);assert.ok(observations.sources[0].fonts.some(f=>f.includes('NeusaNext')));
 assert.ok(observations.sources[0].fonts.some(f=>f.includes('BentonSans')));
});

test('Dominicano Express is registered as an isolated draft brand',()=>{
 assert.equal(dominicanoExpress.status,'draft');
 assert.deepEqual(Object.keys(dominicanoExpress.modes),['light','dark']);
 assert.ok(contrast(dominicanoExpress.modes.light.primary,dominicanoExpress.modes.light['primary-foreground'])>=4.5);
 assert.equal(toCssVariables(dominicanoExpress)['--brand-color-navy'],dominicanoExpress.palette.navy);
});
