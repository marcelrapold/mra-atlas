import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {buildComponentManifest,readSpecs,analyseModule,propRows,propName,namedOptions,optionMentions,slug,SPEC_PAGES} from '../scripts/build-component-manifest.mjs';

const manifest=await buildComponentManifest();
const indexFile=fileURLToPath(new URL('../packages/core/src/index.ts',import.meta.url));

/** Public surface of the core package as the compiler sees it, independent of the manifest parser. */
function compilerExports(){
 const program=ts.createProgram([indexFile],{module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,skipLibCheck:true,noEmit:true});
 const checker=program.getTypeChecker(),symbol=checker.getSymbolAtLocation(program.getSourceFile(indexFile));
 return checker.getExportsOfModule(symbol).map(s=>s.name);
}

test('every export of the core index appears in the component manifest',()=>{
 const listed=new Set(manifest.components.flatMap(c=>[...c.exports,...c.types]));
 const missing=compilerExports().filter(name=>!listed.has(name));
 assert.deepEqual(missing,[],'Exports without a manifest entry');
});

test('the manifest describes every core module with its contract surface',async()=>{
 assert.equal(manifest.schemaVersion,1);
 assert.equal(manifest.import,'@rapold/framework-core');
 assert.equal(manifest.stylesheet,'@rapold/framework-core/styles.css');
 assert.equal(manifest.version,JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8')).version);
 const ids=manifest.components.map(c=>c.module);
 assert.equal(new Set(ids).size,ids.length,'Module ids are unique');
 for(const c of manifest.components){
  assert.match(c.source,/^packages\/core\/src\/.+\.tsx?$/);
  for(const key of ['name','kind','exports','types','variants','slots','dependencies','docsUrl'])assert.ok(key in c,`${c.module}: ${key}`);
  for(const pkg of Object.keys(c.dependencies.external))assert.ok(['radix-ui','lucide-react','cmdk','sonner'].includes(pkg));
  for(const dep of c.dependencies.internal)assert.ok(ids.includes(dep)||dep.startsWith('lib/'),`${c.module}: unknown internal dependency ${dep}`);
  for(const [name,variants] of Object.entries(c.variants)){
   for(const [key,v] of Object.entries(variants)){
    assert.ok(Array.isArray(v.options)&&v.options.length,`${c.module}.${name}.${key}: options`);
    if(v.default!=null)assert.ok(v.options.includes(v.default),`${c.module}.${name}.${key}: default ${v.default} is an option`);
   }
  }
  if(c.spec)assert.equal(c.docsUrl,`https://atlas.rapold.io/${SPEC_PAGES[c.spec.group]??'components'}#${slug(c.name)}`);
 }
 const button=manifest.components.find(c=>c.module==='ui/button');
 assert.deepEqual(button.variants.buttonVariants.variant.options,['default','destructive','outline','secondary','ghost','link']);
 assert.equal(button.variants.buttonVariants.size.default,'default');
 assert.ok(button.slots.includes('button'));
 assert.deepEqual(button.dependencies.external['radix-ui'],['Slot']);
 assert.ok(manifest.components.find(c=>c.module==='ui/command').dependencies.internal.includes('ui/dialog'));
});

test('every component module exported from the core index has a spec heading',async()=>{
 // Read the index at test time: a module added by another package needs its spec section too.
 const index=analyseModule('index.ts',await readFile(indexFile,'utf8'));
 const exported=index.reexports.map(s=>s.replace(/^\.\//,'')).filter(id=>id.startsWith('ui/'));
 assert.ok(exported.length>=40,'Core index re-exports its UI modules');
 const missing=exported.filter(id=>!manifest.components.find(c=>c.module===id)?.spec);
 assert.deepEqual(missing,[],'UI modules without a section in docs/components/*.md');
 for(const id of exported){
  const {spec}=manifest.components.find(c=>c.module===id);
  assert.ok(spec.purpose,`${id}: Zweck`);
  assert.ok(spec.a11y,`${id}: A11y`);
 }
});

test('variant options named in a spec exist in the cva object of the module',()=>{
 let checked=0;
 for(const c of manifest.components){
  if(!c.spec)continue;
  const keys={};
  for(const variants of Object.values(c.variants))for(const [key,v] of Object.entries(variants))for(const option of v.options)(keys[key]??=new Set()).add(option);
  for(const {prop,options} of optionMentions(c.spec.props)){
   if(!keys[prop])continue;
   for(const option of options){
    assert.ok(keys[prop].has(option),`${c.module}: spec names ${prop}="${option}", cva offers ${[...keys[prop]].join(' | ')}`);
    checked++;
   }
  }
 }
 assert.ok(checked>=40,`Only ${checked} spec variant options were checked`);
});

test('new spec groups document their props against the real code',()=>{
 for(const group of ['primitives','overlays'])assert.ok(manifest.components.some(c=>c.spec?.group===group),group);
 const tabs=manifest.components.find(c=>c.module==='ui/tabs');
 assert.deepEqual(optionMentions(tabs.spec.props).find(m=>m.prop==='variant').options,tabs.variants.tabsListVariants.variant.options);
 for(const id of ['ui/dialog','ui/sheet','ui/command'])assert.match(manifest.components.find(c=>c.module===id).spec.props,/`closeLabel` \(Standard «Schliessen»\)/,`${id}: close label default`);
});

test('spec sections parse into fields and prop rows',async()=>{
 const sections=await readSpecs();
 assert.ok(!sections.some(s=>/^Offen/.test(s.heading)),'Internal sections are not specs');
 const card=sections.find(s=>s.group==='primitives'&&s.heading==='Card');
 for(const field of ['purpose','props','a11y','do','dont'])assert.ok(card[field],`Card: ${field}`);
 assert.doesNotMatch(card.dont,/\*\*/);
 assert.deepEqual(propRows("`variant` default | line · `size` sm 32 px | md 40 px · `tone?: Tone` (Rolle)").map(r=>[propName(r.prop),namedOptions(r.values)]),[['variant',['default','line']],['size',['sm','md']],['tone',[]]]);
 assert.deepEqual(propRows('| Prop | Typ |\n| --- | --- |\n| `tone` | `info \\| danger` |').map(r=>[r.prop,r.values]),[['`tone`','`info | danger`']]);
 assert.deepEqual(optionMentions("`TabsList` mit `variant` default | line · `size` `xs | sm` · `tone?: 'a' | 'b'`\n| `role` | `status \\| alert` |"),[{prop:'size',options:['xs','sm']},{prop:'tone',options:['a','b']},{prop:'variant',options:['default','line']},{prop:'role',options:['status','alert']}]);
 assert.deepEqual(propRows('`Dialog` (Radix-Root: `open`) · `DialogContent` mit `closeLabel`\n\nAlle Teile sind Radix-Teile.').map(r=>[r.prop,r.values,r.note]),[['`Dialog`','Radix-Root: `open`',''],['`DialogContent`','`closeLabel`',''],['','','Alle Teile sind Radix-Teile.']]);
 assert.equal(slug('Toggle / LikeToggle'),'toggle-liketoggle');
 assert.equal(slug('Audio-Visualisierungen'),'audio-visualisierungen');
});
