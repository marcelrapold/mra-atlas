import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,rm,writeFile,readFile,access} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import sharp from 'sharp';
import JSZip from 'jszip';
import {brands,neutral,defineBrand,deckAssetPaths,relativeLuminance} from '../packages/brands/src/index.mjs';
import {presentationTheme,slides} from '../packages/brands/src/presentation.mjs';
import {slideScene} from '../packages/brands/src/slide-scene.mjs';
import {projectScene} from '../packages/presentation/src/project-scene.mjs';
import {renderScenes} from '../packages/presentation/src/render.mjs';
import {referenceDigest} from '../scripts/reference-cache.mjs';
import {inspectDeckSvg,targetSize,rasteriseDeckSvg,buildDeckAssets} from '../scripts/build-deck-assets.mjs';

const id='deck-test',dir=`brands/${id}/assets/deck/`;
const deck={mode:'dark',
 surfaces:{cover:{fill:'#050505',backdrop:dir+'cover.png',logo:true},section:{fill:'#050505',backdrop:dir+'cover.png',logo:{anchor:'top-left',heightCm:.5}},content:{fill:'#F4FAFF',logo:true},closing:{fill:'#050505',logo:{anchor:'bottom-center',heightCm:1.1}}},
 materials:{panel:{fill:'#000000',fillOpacity:.25,border:'#FFFFFF',borderOpacity:.1,borderPt:.75,radiusCm:.42},panelRaised:{fill:'#FFFFFF',fillOpacity:.06,border:'#FFFFFF',borderOpacity:.1,borderPt:.75,radiusCm:.32,highlight:{color:'#FFFFFF',opacity:.12}}},
 glow:{color:'signal',opacity:.35,blurPt:12},
 accents:{primary:'signal',chart:['signal','#A78BFA'],chartPrevious:'#94A3B8'},
 type:{headingFace:'Segoe UI',bodyFace:'Segoe UI',displayFace:'Segoe UI Black',labelFace:'Segoe UI Semibold',capsTrackingEm:.16,displayScale:1.6},
 logo:{onDark:dir+'logo-dark.png',onLight:dir+'logo-light.png',aspectRatio:3.6,heightCm:.74,anchor:'top-right',plate:false},
 supergraphic:{section:{path:dir+'logo-dark.png',x:-4,y:2,w:20,h:5.6,opacity:.5}},
 punctuation:{glyph:'◆',onDark:'#FFA36C',onLight:'#B4511A',append:true}};
const brand=defineBrand({...structuredClone(neutral),id,name:'Deck Test',palette:{signal:'#22D3EE'},deck});
const variant=(change,base=deck)=>{const d=structuredClone(base);change(d);return {...structuredClone(neutral),id,name:'Deck Test',palette:{signal:'#22D3EE'},deck:d};};
let root;
test.before(async()=>{
 root=await mkdtemp(path.join(os.tmpdir(),'atlas-deck-'));await mkdir(path.join(root,dir),{recursive:true});
 const png=(w,h,color)=>sharp({create:{width:w,height:h,channels:4,background:color}}).png().toBuffer();
 await writeFile(path.join(root,dir,'cover.png'),await png(240,135,'#0a1a2a'));
 await writeFile(path.join(root,dir,'logo-dark.png'),await png(360,100,'#ffffff'));
 await writeFile(path.join(root,dir,'logo-light.png'),await png(360,100,'#000000'));
});
test.after(()=>rm(root,{recursive:true,force:true}));

test('deck contract validates paths, modes, materials and rejects SVG with a clear error',()=>{
 assert.deepEqual(deckAssetPaths(brand),[dir+'cover.png',dir+'logo-dark.png',dir+'logo-light.png']);
 assert.throws(()=>defineBrand(variant(d=>{d.logo.onDark=dir+'logo.svg';})),/SVG.*build-deck-assets/);
 for(const change of [d=>{d.surfaces.cover.backdrop='brands/other/x.png';},d=>{d.surfaces.cover.backdrop=`brands/${id}/../x.png`;},d=>{d.logo.plate=true;},d=>{d.mode='sepia';},d=>{delete d.surfaces.content;},d=>{d.materials.panel.fillOpacity=2;},d=>{d.accents.chart=[];},d=>{d.accents.primary='unknown-key';},d=>{d.type.headingFace='Arial; color:red';},d=>{d.unknown=1;},d=>{d.punctuation.glyph='X';},d=>{d.surfaces.cover.logo={size:2};},d=>{d.surfaces.content.logo={anchor:'top-left'};},d=>{d.surfaces.cover.logo={anchor:'center'};}])assert.throws(()=>defineBrand(variant(change)),/deck/);
 const lightOnly=variant(()=>{});lightOnly.modes={light:lightOnly.modes.light};lightOnly.deck.mode='light';
 assert.throws(()=>defineBrand(lightOnly),/modes\.dark is missing/);
});

test('presentation theme follows deck.mode and resolves palette accents',()=>{
 const theme=presentationTheme(brand);
 assert.equal(theme.colors.text,neutral.modes.dark.foreground);
 assert.equal(theme.colors.primary,'#22D3EE');assert.equal(theme.colors['chart-2'],'#A78BFA');
 assert.equal(theme.deck.glow.color,'#22D3EE');assert.deepEqual(theme.deck.accents.chart,['#22D3EE','#A78BFA']);
 assert.equal(theme.deck.surfaces.cover.mode,'dark');assert.equal(theme.deck.surfaces.content.mode,'light');
 assert.equal(theme.deck.colors.light.text,neutral.modes.light.foreground);
 for(const b of brands)assert.equal(presentationTheme(b).colors.accent,b.deck?.accents.primary?presentationTheme(b).deck.accents.primary:b.modes[b.deck?.mode??'light'].primary);
});

test('deck scenes stage surfaces, materials, caps, glow and logos instead of the neutral base',()=>{
 const theme=presentationTheme(brand);
 for(const s of slides){
  const scene=slideScene(s.id,theme),layout=s.id==='cover-foto'?'cover':s.id==='foto-schluss'?'closing':s.id==='kapitel-trenner'?'section':'content';
  assert.equal(scene.background.color,deck.surfaces[layout].fill,s.id);
  assert.ok(!scene.nodes.some(n=>n.kind==='rect'&&n.w>30&&n.h>17),`${s.id}: no opaque base rect`);
  const logos=scene.nodes.filter(n=>n.kind==='brand');assert.equal(logos.length,1,s.id);
  assert.equal(logos[0].path,theme.deck.surfaces[layout].mode==='dark'?deck.logo.onDark:deck.logo.onLight);
  for(const n of scene.nodes)for(const k of ['x','y','w','h'])assert.ok(Number.isFinite(n[k])&&n[k]>=0,`${s.id}/${k}`);
 }
 const cover=slideScene('cover-foto',theme);
 assert.equal(cover.background.path,deck.surfaces.cover.backdrop);
 const display=cover.nodes.find(n=>n.text==='Projektübersicht');assert.equal(display.pt,48);assert.equal(display.face,'Segoe UI Black');assert.equal(display.punctuation.color,'#FFA36C');
 const logo=cover.nodes.find(n=>n.kind==='brand');assert.ok(Math.abs(logo.x+logo.w-(33.867-.93))<1e-9&&logo.plate===false);
 assert.equal(slideScene('kapitel-trenner',theme).background.graphics[0].path,deck.supergraphic.section.path);
 const closing=slideScene('foto-schluss',theme).nodes.find(n=>n.kind==='brand');assert.ok(Math.abs(closing.x+closing.w/2-33.867/2)<1e-9);
 const kpi=slideScene('kpi-board',theme).nodes;
 const tiles=kpi.filter(n=>n.kind==='rect'&&n.radius===.32&&!n.glow);assert.equal(tiles.length,5,"five raised KPI tiles");
 assert.equal(kpi.filter(n=>n.glow).length,1,'one glow per slide');const plate=kpi.find(n=>n.glow);assert.ok((plate.opacity??1)===1&&plate.x===tiles[0].x&&kpi.indexOf(plate)<kpi.indexOf(tiles[0]),'translucent tiles glow from an opaque plate underneath');assert.equal(tiles[0].opacity,.06);assert.equal(tiles[0].stroke,'#FFFFFF');
 assert.ok(kpi.some(n=>n.kind==='rect'&&n.h===.03&&n.opacity===.12),'raised material highlight');
 const chart=kpi.find(n=>n.kind==='chart');assert.equal(chart.axisColor,theme.deck.colors.light['text-secondary']);
 const heads=slideScene('textbox-tabelle',theme).nodes.filter(n=>n.caps);assert.ok(heads.some(n=>n.text==='KENNZAHL'&&n.trackingEm===.16&&n.face==='Segoe UI Semibold'));
 const project=projectScene({type:'kapitel-trenner',title:'Kapitel mit Punkt.'},theme);assert.equal(project.background.color,'#050505');assert.equal(project.nodes.find(n=>n.kind==='text').text,'Kapitel mit Punkt');
});

test('every project recipe stages a deck brand with bounded geometry and a logo only where declared',async()=>{
 const input=JSON.parse(await readFile(new URL('../examples/framework-review.json',import.meta.url),'utf8')),theme=presentationTheme(brand),evidence=input.slides[1].sources;
 const claims=Array.from({length:4},(_,i)=>({title:`Befund ${i+1}`,text:'Eine belegte Aussage.',kind:'fact',sourceId:evidence[0].id})),metrics=Array.from({length:3},(_,i)=>({label:`Messpunkt ${i+1}`,value:9+i,comparison:7+i,unit:'Fälle',period:'2026',comparisonPeriod:'2025',sourceId:evidence[0].id}));
 for(const recipe of slides){
  const scene=projectScene({...input.slides[2],type:recipe.id,title:'Prüfbare Inhalte.',claims:claims.slice(0,recipe.id==='zwei-grosskarten'?2:recipe.id==='phasen-karten-gate'?4:3),metrics,sources:evidence,items:['Stand'],resolution:{kind:'open-question',text:'Welcher Nachweis fehlt?'},content:{chart:true,image:{path:'photo.png',alt:'Motiv',credit:'Test'},gates:['Kriterium'],timeline:[{label:'Beginn',date:'Jan',kind:'past'},{label:'Review',date:'Jun',kind:'current'}],columns:['Q1','Q2'],rows:[{label:'Pilot',start:0,span:1}]}},theme,2);
  assert.ok(scene.background?.color,recipe.id);assert.ok(!scene.nodes.some(n=>n.kind==='rect'&&n.w>30&&n.h>17&&(n.opacity??1)===1),`${recipe.id}: opaque base`);
  for(const n of scene.nodes){for(const k of ['x','y','w','h'])assert.ok(Number.isFinite(n[k])&&n[k]>=0,`${recipe.id}/${k}`);assert.ok(n.x+n.w<=scene.width+.01&&n.y+n.h<=scene.height+.01,recipe.id);}
  assert.equal(scene.nodes.filter(n=>n.kind==='brand').length,1,recipe.id);
  assert.ok(scene.nodes.filter(n=>n.punctuation).length<=1,`${recipe.id}: one brand full stop`);
 }
});

test('renderer writes backdrops, transparency, round corners, glow, tracking and tinted chart labels',async()=>{
 const theme=presentationTheme(brand),scenes=['cover-foto','kapitel-trenner','kpi-board','textbox-tabelle'].map(s=>slideScene(s,theme));
 const zip=await JSZip.loadAsync(await renderScenes(brand,scenes,{deckRoot:root,assetRoot:root}));
 const xml=await Promise.all([1,2,3,4].map(i=>zip.file(`ppt/slides/slide${i}.xml`).async('string')));
 assert.match(xml[0],/<p:bg>[\s\S]*<a:blip/);assert.match(xml[0],/typeface="Segoe UI Black"/);assert.match(xml[0],/◆/);
 assert.match(xml[1],/<p:pic>/);assert.match(xml[2],/prstGeom prst="roundRect"/);assert.match(xml[2],/<a:alpha val="6000"\/>/);assert.match(xml[2],/outerShdw/);
 assert.match(xml[3],/spc="\d+"/);
 const chart=Object.keys(zip.files).find(p=>/^ppt\/charts\/chart\d+\.xml$/.test(p));
 assert.match(await zip.file(chart).async('string'),/<a:rPr lang="de-CH" sz="900" b="1"><a:solidFill><a:srgbClr val="[0-9A-F]{6}"\/>/);
 const svg=structuredClone(scenes[0]);svg.background.path=dir+'cover.svg';
 await assert.rejects(()=>renderScenes(brand,[svg],{deckRoot:root,assetRoot:root}),/PNG or JPG, not SVG/);
});

test('reference digest covers the deck block and every referenced image byte',async()=>{
 const before=await referenceDigest({brands:[brand],deckRoot:pathToFileURL(root+path.sep)});
 await writeFile(path.join(root,dir,'logo-light.png'),await sharp({create:{width:360,height:100,channels:4,background:'#111111'}}).png().toBuffer());
 assert.notEqual(await referenceDigest({brands:[brand],deckRoot:pathToFileURL(root+path.sep)}),before,'a changed logo must invalidate the previews');
 const repainted=defineBrand(variant(d=>{d.glow.opacity=.5;}));
 assert.notEqual(await referenceDigest({brands:[repainted],deckRoot:pathToFileURL(root+path.sep)}),await referenceDigest({brands:[brand],deckRoot:pathToFileURL(root+path.sep)}));
});

test('deck SVG sources rasterise deterministically to backdrop and logo sizes',async()=>{
 const backdrop='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><radialGradient id="a"><stop offset="0" stop-color="#22D3EE"/><stop offset="1" stop-color="#050505"/></radialGradient></defs><rect width="1600" height="900" fill="url(#a)"/></svg>';
 assert.deepEqual([targetSize(backdrop,'x.svg').width,targetSize(backdrop,'x.svg').height],[2400,1350]);
 const logo='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 100"><path d="M0 0h360v100H0z" fill="#fff"/></svg>';
 assert.deepEqual([targetSize(logo,'w.svg').width,targetSize(logo,'w.svg').height],[1200,333]);assert.equal(targetSize(logo,'w@2000w.svg').width,2000);
 for(const bad of ['<svg><script>x</script></svg>','<svg><image href="https://x/y.png"/></svg>','<svg onload="x"></svg>'])assert.throws(()=>inspectDeckSvg(bad,'t'));
 const a=await rasteriseDeckSvg(backdrop,targetSize(backdrop,'x.svg')),b=await rasteriseDeckSvg(backdrop,targetSize(backdrop,'x.svg'));
 assert.ok(a.equals(b));const meta=await sharp(a).metadata();assert.deepEqual([meta.width,meta.height,meta.format],[2400,1350,'png']);
 await mkdir(path.join(root,'brands','t','assets','deck-src'),{recursive:true});await writeFile(path.join(root,'brands','t','assets','deck-src','wordmark.svg'),logo);
 assert.equal((await buildDeckAssets({root}))[0].written,true);assert.equal((await buildDeckAssets({root}))[0].written,false,'unchanged sources are not re-encoded');
 assert.equal(JSON.parse(await readFile(path.join(root,'brands','t','assets','deck','deck-assets.json'),'utf8')).files[0].output,'deck/wordmark.png');
});

test('registered deck brands ship every referenced raster file and a dark deck carries no white plate',async()=>{
 for(const b of brands.filter(b=>b.deck)){
  for(const file of deckAssetPaths(b))await access(new URL('../'+file,import.meta.url));
  const theme=presentationTheme(b);
  for(const s of slides){const scene=slideScene(s.id,theme);if(theme.deck.surfaces[s.id==='kapitel-trenner'?'section':s.id==='cover-foto'?'cover':s.id==='foto-schluss'?'closing':'content']?.mode!=='dark')continue;
   for(const n of scene.nodes)if(n.kind==='rect'&&(n.opacity??1)>.5)assert.ok(relativeLuminance(n.fill)<.6||n.w*n.h<4,`${b.id}/${s.id}: light plate on a dark deck`);}
 }
});
