import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,symlink,rm,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import JSZip from 'jszip';
import {validateProject,createProjectDeck,projectScene} from '../packages/presentation/src/index.mjs';
import {assetPath} from '../packages/presentation/src/render.mjs';
import {brands,neutral,defineBrand} from '../packages/brands/src/index.mjs';
import {presentationTheme,slides} from '../packages/brands/src/presentation.mjs';
const input=JSON.parse(await readFile(new URL('../examples/framework-review.json',import.meta.url),'utf8'));
test('real repository briefing preserves claims, tables and provenance in editable PowerPoint',async()=>{
 assert.equal(validateProject(input).valid,true);
 const result=await createProjectDeck(input),zip=await JSZip.loadAsync(result.pptx);
 const names=Object.keys(zip.files).filter(p=>/^ppt\/slides\/slide\d+\.xml$/.test(p));assert.equal(names.length,input.slides.length);
 const xml=(await Promise.all(names.map(p=>zip.file(p).async('string')))).join('\n');
 for(const slide of input.slides)assert.ok(xml.includes(slide.title),slide.title);
 assert.ok(xml.includes('Editierbare PPTX'));assert.ok(xml.includes('Dokumentierte Regeln'));
 assert.ok(!xml.includes('Illustrative Beispieldaten'));assert.ok(!xml.includes('Modul M1'));
 assert.equal(result.manifest.slides[2].metrics[0].value,19);
 assert.equal(result.manifest.slides[2].metrics[0].comparison,5);
 const note=await zip.file('ppt/notesSlides/notesSlide3.xml').async('string');assert.ok(note.includes(input.commit));assert.ok(note.includes('docs/extraction.md'));
 assert.ok(xml.includes('typeface="Inter"'),'The neutral project deck must preserve its configured Inter family');
});
test('renderer rejects over-capacity content, inconsistent evidence, unknown brands and impossible charts',async()=>{
 for(const change of [d=>{d.slides[1].sources.push({...d.slides[1].sources[0],id:'fourth'});},d=>{d.slides[2].metrics[0].comparisonSourceId='unknown';},d=>{d.slides[2].sources[0].commit='0'.repeat(40);},d=>{d.slides[2].type='kpi-board';d.slides[2].content={chart:true};},d=>{d.slides[2].metrics[0].label='x'.repeat(90);}]){const bad=structuredClone(input);change(bad);assert.equal(validateProject(bad).valid,false);await assert.rejects(()=>createProjectDeck(bad));}
 await assert.rejects(()=>createProjectDeck({...input,brand:'unknown'}),/Unknown/);
});
test('all 18 project recipes construct finite bounded scenes without importing demonstration content',()=>{
 const evidence=input.slides[1].sources,claims=Array.from({length:4},(_,i)=>({title:`Befund ${i+1}`,text:'Eine konkrete belegte Aussage.',kind:'fact',sourceId:evidence[0].id}));
 const metrics=Array.from({length:3},(_,i)=>({label:`Messpunkt ${i+1}`,value:9+i,comparison:7+i,unit:'Fälle',period:'2026',comparisonPeriod:'2025',sourceId:evidence[0].id}));
 for(const brand of brands)for(const recipe of slides){
  const s={...input.slides[2],type:recipe.id,title:'Prüfbare Projektinhalte',claims:claims.slice(0,recipe.id==='phasen-karten-gate'?4:recipe.id==='zwei-grosskarten'?2:3),metrics,sources:evidence,items:['Projektstand'],resolution:{kind:'open-question',text:'Welcher Nachweis fehlt?'},content:{chart:true,image:{path:'local-photo.png',alt:'Lokales Prüfmotiv',credit:'Test'},gates:['Abnahmekriterium'],timeline:[{label:'Beginn',date:'Jan',kind:'past'},{label:'Review',date:'Jun',kind:'current'}],columns:['Q1','Q2','Q3','Q4'],rows:[{label:'Pilot',start:0,span:2}]}};
  const scene=projectScene(s,presentationTheme(brand));
  for(const n of scene.nodes){for(const k of ['x','y','w','h'])assert.ok(Number.isFinite(n[k])&&n[k]>=0,`${recipe.id}/${k}`);assert.ok(n.x+n.w<=scene.width+.01,recipe.id);assert.ok(n.y+n.h<=scene.height+.01,recipe.id);}
 }
});
test('brand assets remain configurable and local image resolution cannot escape via traversal or symlinks',async()=>{
 const custom=defineBrand({...structuredClone(neutral),id:'test-brand',name:'Test Brand',assets:{logo:{path:'brands/test/logo.svg',aspectRatio:3,background:'#ffffff',padding:.1}}});assert.equal(custom.assets.logo.path,'brands/test/logo.svg');
 const directory=await mkdtemp(path.join(os.tmpdir(),'framework-asset-test-'));try{await writeFile(path.join(directory,'outside.svg'),'test');await import('node:fs/promises').then(m=>m.mkdir(path.join(directory,'inside')));await symlink(path.join(directory,'outside.svg'),path.join(directory,'inside','escape.svg'));await assert.rejects(()=>assetPath(path.join(directory,'inside'),'../outside.svg'));await assert.rejects(()=>assetPath(path.join(directory,'inside'),'escape.svg'));}finally{await rm(directory,{recursive:true,force:true});}
});
test('photographic recipes embed a supplied local image using proportional sizing',async()=>{
 const {renderScenes}=await import('../packages/presentation/src/render.mjs');
 const root=new URL('../apps/docs/public/',import.meta.url).pathname;
 const pptx=await renderScenes(neutral,[{nodes:[{kind:'image',x:0,y:0,w:33.867,h:17.524,path:'brands/neutral/reference/cover-foto.png',fit:'cover',alt:'Test asset'}]}],{assetRoot:root});
 const zip=await JSZip.loadAsync(pptx);assert.ok((await zip.file('ppt/slides/slide1.xml').async('string')).includes('<p:pic>'));
});
