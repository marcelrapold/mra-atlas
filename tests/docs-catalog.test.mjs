import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {componentNames,componentPages,deckCatalog,guidance,neighbours,pagerPages,pages,slug} from '../apps/docs/app/_components/catalog.ts';
import {slides,presets} from '../packages/brands/src/presentation.mjs';

const core=new URL('../packages/core/src/',import.meta.url);
const read=async url=>{for(const ext of ['.tsx','.ts'])try{return await readFile(new URL(url+ext),'utf8');}catch(error){if(error.code!=='ENOENT')throw error;}throw new Error(`Modul fehlt: ${url}`);};
// Regex scan of the public surface: every `export * from './x'` in index.ts and the names those modules export.
async function coreSurface(){
 const index=await readFile(new URL('index.ts',core),'utf8');
 const modules=[...index.matchAll(/export \* from '\.\/([^']+)'/g)].map(m=>m[1]);
 const names=new Set();
 for(const m of modules){
  const source=await read(new URL(m,core).href);
  for(const [,name] of source.matchAll(/export\s+(?:declare\s+)?(?:const|let|function|class)\s+([A-Za-z0-9_]+)/g))names.add(name);
  for(const [,list] of source.matchAll(/export\s*\{([^}]*)\}/g))for(const item of list.split(','))if(!/^\s*type\s/.test(item)){const name=item.trim().split(/\s+as\s+/).pop()?.trim();if(name)names.add(name);}
 }
 return {modules:new Set(modules.map(m=>m.split('/').pop())),names};
}

test('every documented component maps to a core export', async()=>{
 const {modules,names}=await coreSurface();
 const lower=new Set([...names].map(n=>n.toLowerCase()));
 for(const name of componentNames){
  const identifier=name.replace(/\s+/g,'').toLowerCase();
  assert.ok(lower.has(identifier)||modules.has(slug(name)),`«${name}» ist weder als Export noch als Modul in packages/core/src/index.ts erreichbar`);
 }
});

test('component names are unique and their pages exist', ()=>{
 assert.equal(new Set(componentNames).size,componentNames.length);
 assert.equal(new Set(componentNames.map(slug)).size,componentNames.length,'Fragment-IDs der Komponenten kollidieren');
 const ids=new Set(pages.map(p=>p.id));
 for(const [name,page] of Object.entries(componentPages)){
  assert.ok(componentNames.includes(name),`componentPages nennt unbekannte Komponente «${name}»`);
  assert.ok(ids.has(page),`Seite «${page}» für «${name}» fehlt`);
 }
});

test('slug produces stable ascii ids for umlauts and punctuation', ()=>{
 assert.equal(slug('Präsentationen'),'prasentationen');
 assert.equal(slug('Grössen & Töne'),'grossen-tone');
 assert.equal(slug('Übersicht'),'ubersicht');
 assert.equal(slug('Eine Brand, alle Ausprägungen'),'eine-brand-alle-auspragungen');
 assert.equal(slug('  Bewegung und Skalierung  '),'bewegung-und-skalierung');
 assert.equal(slug('Release und Produktionsnachweis'),'release-und-produktionsnachweis');
 assert.equal(slug('AI Disclosure Badge'),'ai-disclosure-badge');
 for(const value of ['Fokus und Dialoge','Status & Töne','Dropdown Menu'])assert.equal(slug(slug(value)),slug(value),'slug ist idempotent');
});

test('guidance headings yield unique, non-empty ids per page', ()=>{
 for(const [section,entry] of Object.entries(guidance)){
  const ids=entry.sections.map(s=>slug(s.title));
  assert.ok(ids.every(Boolean),`${section}: leere ID`);
  assert.equal(new Set(ids).size,ids.length,`${section}: doppelte Abschnitts-IDs`);
 }
});

test('guidance copy uses Swiss spelling and no hard-coded catalogue counts', ()=>{
 const text=JSON.stringify(guidance);
 assert.doesNotMatch(text,/\u00df/);
 assert.doesNotMatch(text,/\b18 Typen\b/);
});

test('overview deck counts match the presentation catalogue', ()=>{
 assert.equal(deckCatalog.slides,slides.length,'deckCatalog.slides an slide-catalog.json angleichen');
 assert.equal(deckCatalog.presets,presets.length,'deckCatalog.presets an deck-presets.json angleichen');
});

test('pager chain skips pages without a pager and reaches every reference page', ()=>{
 for(const id of ['praesentation','praesentationslogik']){
  assert.equal(neighbours(id),null,`${id} hat ein eigenes Layout ohne Seitenwechsel`);
  assert.ok(!pagerPages.some(p=>p.id===id));
 }
 const seen=[];let at=pagerPages[0];
 while(at){seen.push(at.id);at=neighbours(at.id)?.next;}
 assert.deepEqual(seen,pagerPages.map(p=>p.id),'Weiter führt lückenlos durch alle Referenzseiten');
 assert.equal(neighbours(pagerPages[0].id).prev,undefined);
 for(const p of pagerPages.slice(1))assert.equal(neighbours(neighbours(p.id).prev.id).next.id,p.id,`Zurück und Weiter sind bei ${p.id} symmetrisch`);
});
