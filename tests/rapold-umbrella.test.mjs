import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {brands,contrast,deckAssetPaths} from '../packages/brands/src/index.mjs';
import {presentationTheme} from '../packages/brands/src/presentation.mjs';
import {slideScene} from '../packages/brands/src/slide-scene.mjs';

const read=path=>readFile(new URL('../'+path,import.meta.url));
const rapold=brands.find(b=>b.id==='rapold'),theme=presentationTheme(rapold);
const provenance=JSON.parse(await read('brands/rapold/sources/provenance.json'));
const umbrella=JSON.parse(await read('brands/rapold/assets/umbrella/umbrella.json'));

test('umbrella «Der First» stays a labelled proposal and leaves the approved signets untouched',()=>{
 assert.equal(provenance.approval.umbrellaSymbol,'none');
 assert.equal(provenance.approval.umbrellaProposal.status,'proposal');
 assert.equal(umbrella.status,'proposal');assert.equal(umbrella.label,'Vorschlag Dachmarke');
});

test('umbrella masters are byte copies without Firstglut, text or active content',async()=>{
 for(const name of ['mark-dark','mark-light','mark-mono-white','mark-mono-black','wordmark-dark','wordmark-light','lockup-horizontal-dark','lockup-horizontal-light']){
  const copy=await read(`brands/rapold/assets/umbrella/${name}.svg`),master=await read(`brands/rapold-io/assets/logos/${name}.svg`);
  assert.equal(createHash('sha256').update(copy).digest('hex'),createHash('sha256').update(master).digest('hex'),name);
  assert.equal(umbrella.files[name],master.toString('utf8'),name);
 }
 for(const [name,svg] of Object.entries(umbrella.files)){
  assert.doesNotMatch(svg,/#FFA36C|#FFE2CC|#B4511A/i,`${name}: no Firstglut in logo files`);
  assert.doesNotMatch(svg,/<(?:text|script|image|foreignObject)\b|\bon[a-z]+\s*=|href=/i,name);
 }
 for(const v of ['dark','light'])assert.match(umbrella.files['mark-'+v],/viewBox="0 0 256 256"/);
});

test('deck: navy plates, paper content, compact lockup and one rhombus point per slide',async()=>{
 const d=theme.deck;
 assert.equal(d.surfaces.cover.mode,'dark');assert.equal(d.surfaces.section.mode,'dark');assert.equal(d.surfaces.closing.mode,'dark');assert.equal(d.surfaces.content.mode,'light');
 assert.equal(d.punctuation.glyph,'◆');assert.equal(d.punctuation.onDark,'#FFA36C');assert.equal(d.punctuation.onLight,'#B4511A');
 for(const path of deckAssetPaths(rapold)){const meta=await sharp(await read(path)).metadata();assert.equal(meta.format,'png',path);}
 const logo=await sharp(await read(rapold.deck.logo.onDark)).metadata();
 assert.ok(Math.abs(logo.width/logo.height-rapold.deck.logo.aspectRatio)<.01,'aspectRatio matches the lockup PNG');
 for(const s of theme.slides){
  const nodes=slideScene(s.id,theme).nodes;
  assert.ok(nodes.filter(n=>n.punctuation).length<=1,`${s.id}: at most one rhombus point`);
  assert.ok(!nodes.some(n=>[n.color,n.fill].some(v=>/^#(FFA36C|B4511A)$/i.test(v??''))),`${s.id}: Firstglut only as the rhombus point`);
 }
 assert.equal(slideScene('cover-foto',theme).nodes.filter(n=>n.kind==='brand').length,1,'cover carries the lockup');
 for(const id of ['cover-foto','kapitel-trenner','foto-schluss'])for(const n of slideScene(id,theme).nodes.filter(n=>n.kind==='text'))assert.ok(n.x+n.w<=.93+21.5+1e-9,`${id}: text stays left of the glass mark`);
});

test('umbrella colour pairs reach AA where they carry text',()=>{
 for(const [fg,bg] of [['#FFA36C','#050B19'],['#B4511A','#F4FAFF'],['#A8EDFF','#050B19'],['#009DFF','#050B19'],['#9AADC7','#050B19'],['#0066B3','#F4FAFF'],['#46617E','#F4FAFF']])assert.ok(contrast(fg,bg)>=4.5,`${fg} on ${bg}`);
 for(const mode of ['light','dark']){const c=theme.deck.colors[mode];assert.ok(contrast(c.text,mode==='dark'?'#050B19':'#F4FAFF')>=7,mode);assert.ok(contrast(c['text-secondary'],mode==='dark'?'#050B19':'#F4FAFF')>=4.5,mode);}
 assert.ok(contrast(theme.colors.signal,'#F4FAFF')>=4.5,'signal');
 assert.ok(contrast(theme.colors['chart-2'],'#F4FAFF')>=4.5&&contrast(theme.colors['on-color'],theme.colors['chart-2'])>=4.5,'chart-2 carries labels and pill text');
 assert.ok(contrast('#FFFFFF','#009DFF')<4.5,'white on azure stays forbidden for text');
});
