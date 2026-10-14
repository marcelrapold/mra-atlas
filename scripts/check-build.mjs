import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {brands} from '../packages/brands/src/index.mjs';
import {presets} from '../packages/brands/src/presentation.mjs';
import {compilePrompt} from '../packages/brands/src/prompt-compiler.mjs';
const out=new URL('../apps/docs/out/',import.meta.url);
let css='';
async function collect(dir) {for(const e of await readdir(dir,{withFileTypes:true})) {const p=new URL(e.name+(e.isDirectory()?'/':''),dir); if(e.isDirectory()) await collect(p); else if(e.name.endsWith('.css')) css+=await readFile(p,'utf8');}}
await collect(new URL('_next/static/',out));
for (const selector of ['.bg-primary','.text-primary-foreground','.bg-card','.border-input',String.raw`.hover\:bg-primary-hover`]) assert.ok(css.includes(selector),`Core utility missing in production CSS: ${selector}`);
for(const path of ['index.html','llms.txt','contracts/repo-to-management.md','contracts/mermaid.md']) assert.ok((await readFile(new URL(path,out))).length,`Missing export: ${path}`);
const activeBrandIds=brands.map(brand=>brand.id).sort();
const publishedBrandIds=(await readdir(new URL('brands/',out),{withFileTypes:true})).filter(entry=>entry.isDirectory()||entry.isSymbolicLink()).map(entry=>entry.name).sort();
assert.deepEqual(publishedBrandIds,activeBrandIds,'The deployable output must contain only active brand trees');
const brandIndex=JSON.parse(await readFile(new URL('brands/index.json',out),'utf8'));
assert.deepEqual(brandIndex.brands.map(brand=>brand.id).sort(),activeBrandIds,'Published brand registry');
for(const brand of brands)for(const file of ['brand.json','presentation.json',...Object.keys(brand.modes).map(mode=>`mermaid.${mode}.json`)])assert.ok((await readFile(new URL(`brands/${brand.id}/${file}`,out))).length,`Missing brand contract: ${brand.id}/${file}`);
for(const page of ['praesentation','praesentationslogik','mermaid','charts','tables','organigramm','prompt-compiler','login-pattern','mail-templates'])assert.ok((await readFile(new URL(`${page}.html`,out))).length,`Missing reference page: ${page}`);
const validator=await import(new URL('praesentation/deck-validation.mjs',out));
assert.equal(validator.validateDeck({sections:[],slides:[]}).valid,false,'Served standalone validator must run and reject an empty deck');
assert.equal(JSON.parse(await readFile(new URL('praesentation/deck-input.schema.json',out),'utf8')).type,'object');
for(const brand of brands)for(const set of [{id:'muster-deck',count:18},...presets.map(p=>({id:p.id,count:p.folgen.length}))]){
 const zip=await JSZip.loadAsync(await readFile(new URL(`brands/${brand.id}/decks/${set.id}.pptx`,out)));
 assert.equal(Object.keys(zip.files).filter(p=>/^ppt\/slides\/slide\d+\.xml$/.test(p)).length,set.count,`${brand.id}/${set.id}: slide count`);
 for(const name of Object.keys(zip.files).filter(p=>/^ppt\/charts\/chart\d+\.xml$/.test(p))){
  const xml=await zip.file(name).async('string');
  if(!xml.includes('<c:lineChart>'))assert.match(xml,/<a:t>−?\d+,\d{2}<\/a:t>/,'Native chart labels must preserve decimal commas');
  assert.match(xml,/<c:numCache>/,'Native editable chart data must be retained');
 }
}
console.log(`Production CSS, reference routes, standalone validator and ${brands.length*(presets.length+1)} editable decks verified.`);
const {verifyReferenceCache}=await import('./reference-cache.mjs');
const reference=await verifyReferenceCache();
assert.equal(reference.files.filter(x=>x.path.endsWith('.png')).length,brands.length*18);
assert.equal(reference.files.filter(x=>x.path.endsWith('.pdf')).length,brands.length*(presets.length+1));
for(const item of reference.files)assert.ok((await readFile(new URL(item.path,out))).length,`Missing exported reference: ${item.path}`);
assert.ok((await readFile(new URL('praesentation/project-input.schema.json',out))).length);
const projectValidator=await import(new URL('praesentation/project-validation.mjs',out));
assert.equal(projectValidator.validateProject(JSON.parse(await readFile(new URL('praesentation/framework-review.json',out),'utf8'))).valid,true);
console.log(`All ${brands.length*18} genuine PPTX previews, ${brands.length*(presets.length+1)} PDFs and project-deck contracts verified.`);

const {createHash}=await import('node:crypto');
// Check the actual deployable asset tree, not just its source manifest.
const rapoldAssets=JSON.parse(await readFile(new URL('brands/rapold/assets-manifest.json',out),'utf8'));
assert.equal(rapoldAssets.brandId,'rapold');
assert.equal(rapoldAssets.products.length,10,'Ten approved Rapold signets');
assert.equal(rapoldAssets.assets.length,52*rapoldAssets.products.length);
assert.equal(rapoldAssets.resources.length,5*rapoldAssets.products.length+7);
for(const entry of [...rapoldAssets.assets,...rapoldAssets.resources]){
 assert.ok(entry.url.startsWith('/brands/rapold/'),'Unexpected asset URL');
 const data=await readFile(new URL(entry.url.slice(1),out));
 assert.equal(data.length,entry.bytes,`Published asset size: ${entry.path}`);
 assert.equal(createHash('sha256').update(data).digest('hex'),entry.sha256,`Published asset hash: ${entry.path}`);
}
console.log(`Rapold exports: ${rapoldAssets.assets.length} deliverables and ${rapoldAssets.resources.length} canonical resources verified in the deployable output.`);
const echarts=await readFile(new URL('vendor/echarts-6.0.0.min.js',out));
assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${echarts.length}\0`),echarts])).digest('hex'),'22b33ffe0548465757267dc03ca8656d7cfef643','ECharts must match the Apache upstream bundle');
for(const file of ['vendor/echarts-LICENSE.txt','vendor/echarts-NOTICE.txt','contracts/engineering.md'])assert.ok((await readFile(new URL(file,out))).length);
const publishedBrandSchema=JSON.parse(await readFile(new URL('contracts/brand.schema.json',out),'utf8'));
const {requiredBrandKeys,optionalBrandKeys}=await import('../packages/brands/src/index.mjs');
assert.deepEqual(Object.keys(publishedBrandSchema.properties).sort(),[...requiredBrandKeys,...optionalBrandKeys].sort(),'Published brand schema must match the validator');
for(const brand of brands)for(const key of Object.keys(brand))assert.ok(key in publishedBrandSchema.properties,`${brand.id}: ${key} is undocumented in the published schema`);
console.log('Pinned ECharts bundle, attribution and engineering contract verified.');

// Inspect the published output: inactive corporate content must not become part
// of the Default preset through a shared FAQ, introduction or agent contract.
for (const file of (await readdir(out)).filter(name=>name.endsWith('.html'))) {
 const html=await readFile(new URL(file,out),'utf8');
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]??'';
 assert.doesNotMatch(main.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),/goldbach|sygnum/i,`Retired brand content in a published page: ${file}`);
}
for(const brand of brands){
 const guide=await readFile(new URL(`brands/${brand.id}/llms.txt`,out),'utf8');
 assert.ok(guide.includes(`/brands/${brand.id}/brand.json`));
 for(const other of brands.filter(b=>b.id!==brand.id))assert.ok(!guide.includes(`/brands/${other.id}/`),`Foreign brand contract in ${brand.id} guide`);
 if(brand.assets?.logo)assert.ok(guide.includes(brand.assets.logo.path));
 const prompt=compilePrompt({idea:'Analysiere owner/repo.',format:'Präsentation',brand});
 const entry=prompt.match(/https:\/\/atlas.rapold.io\/(brands\/[^\s]+\/management\.md)/)?.[1];
 assert.ok(entry,'Short presentation task must resolve to a published management contract');
 const management=await readFile(new URL(entry,out),'utf8');
 assert.ok(guide.includes(`https://atlas.rapold.io/${entry}`),'General agent entry must discover the short-task contract');
 assert.ok(management.includes(`Aktive Brand: ${brand.id}`));
 assert.ok(management.includes(`"brand": "${brand.id}"`),'Source manifest example must use the selected brand');
 for(const other of brands.filter(b=>b.id!==brand.id))assert.ok(!management.includes(`/brands/${other.id}/`),`Foreign brand in ${brand.id} management contract`);
 for(const match of management.matchAll(/https:\/\/atlas.rapold.io\/([\w./-]+)/g)){
  const path=match[1].replace(/[.,]+$/,'');
  assert.ok((await readFile(new URL(path,out))).length,`Broken management contract dependency: ${path}`);
 }
}
for(const file of ['llms.txt','brands/neutral/llms.txt','brands/neutral/management.md','contracts/repo-to-management.md','contracts/brand-contract.md'])
 assert.doesNotMatch(await readFile(new URL(file,out),'utf8'),/goldbach|sygnum/i,`Corporate default in shared contract: ${file}`);
console.log('Default pages and theme-specific agent contracts are isolated.');
// Discovery surface: a public contract nobody can find is half a contract.
const sitemap=await readFile(new URL('sitemap.xml',out),'utf8');
const robots=await readFile(new URL('robots.txt',out),'utf8');
assert.match(robots,/Sitemap: https:\/\/atlas.rapold.io\/sitemap\.xml/,'robots.txt must advertise the sitemap');
assert.ok((await readFile(new URL('og.png',out))).length,'Missing social card');
const indexed=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.ok(indexed.length>=30,`sitemap lists only ${indexed.length} routes`);
for(const loc of indexed){
 const route=new URL(loc).pathname;
 const file=route==='/'?'index.html':`${route.replace(/^\//,'')}.html`;
 assert.ok((await readFile(new URL(file,out))).length,`sitemap points at a route that was not exported: ${route}`);
}
const home=await readFile(new URL('index.html',out),'utf8');
for(const tag of [/rel="icon"/,/property="og:title"/,/property="og:image"/,/name="twitter:card"/,/rel="canonical"/])assert.match(home,tag,`Missing discovery tag: ${tag}`);
assert.match(await readFile(new URL('tokens.html',out),'utf8'),/rel="canonical" href="https:\/\/atlas.rapold.io\/tokens"/,'Each page needs its own canonical URL');
console.log(`Discovery verified: ${indexed.length} indexed routes, robots, social card and per-page canonicals.`);


for(const brand of brands){
 for(const source of brand.sources)assert.ok((await readFile(new URL(`brands/${brand.id}/${source.split('/').at(-1)}`,out))).length);
 if(brand.assets?.logo)assert.ok((await readFile(new URL(brand.assets.logo.path,out))).length);
}

const {checkProductWorlds}=await import('./check-product-worlds.mjs');
await checkProductWorlds({directory:new URL('brands/rapold/',out)});

// Agent contracts: the component manifest, the full-context files and every link an
// agent entry advertises must exist in the deployable tree.
const manifest=JSON.parse(await readFile(new URL('contracts/components.json',out),'utf8'));
assert.equal(manifest.schemaVersion,1,'Component manifest schema version');
assert.equal(manifest.import,'@rapold/framework-core');
for(const id of (await readdir(new URL('../packages/core/src/ui/',import.meta.url))).filter(n=>n.endsWith('.tsx')).map(n=>'ui/'+n.replace(/\.tsx$/,''))){
 const entry=manifest.components.find(c=>c.module===id);
 assert.ok(entry,`Component manifest misses ${id}`);
 assert.ok(entry.exports.length&&Array.isArray(entry.slots)&&entry.variants&&entry.dependencies,`Incomplete manifest entry: ${id}`);
 assert.match(entry.docsUrl??'',/^https:\/\/atlas\.rapold\.io\//,`Manifest docs URL: ${id}`);
}
// Every module the core index exports (components, providers, utilities) has a spec and a docs page.
// No exemptions: a new export needs its section in docs/components/*.md; components and providers
// also need «Zweck» (utilities such as the hooks table document their API as a table).
for(const entry of manifest.components.filter(c=>c.exported)){
 assert.ok(entry.spec,`Exported module without spec: ${entry.module}`);
 if(entry.kind!=='utility')assert.ok(entry.spec.purpose,`Exported ${entry.kind} without «Zweck»: ${entry.module}`);
 assert.match(entry.docsUrl??'',/^https:\/\/atlas\.rapold\.io\//,`Manifest docs URL: ${entry.module}`);
}
assert.ok(manifest.components.some(c=>Object.keys(c.variants).length)&&manifest.components.some(c=>c.slots.length),'Manifest carries variants and slots');
assert.doesNotMatch(await readFile(new URL('contracts/components.md',out),'utf8'),/^## (Offen|Offene Punkte)\s*$/m,'Internal sections in the public component contract');
/** Ids in a static HTML page: what a #fragment can land on before any script runs. */
const htmlIds=async file=>new Set([...(await readFile(file,'utf8')).matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]));
/**
 * A root-relative path resolves like the host does: file, cleanUrls `x.html`, directory index or
 * directory. A #fragment on an HTML page must name an id in its static HTML.
 */
const resolves=async path=>{
 const clean=decodeURIComponent(path.replace(/[?#].*$/,'').replace(/^\//,'')),fragment=decodeURIComponent(path.match(/#(.+)$/)?.[1]??'');
 for(const candidate of clean===''?['index.html']:[clean,clean+'.html',clean.replace(/\/$/,'')+'/index.html']){
  const file=new URL(candidate,out);
  if(!await readFile(file).then(d=>d.length>0,()=>false))continue;
  return !fragment||!candidate.endsWith('.html')||(await htmlIds(file)).has(fragment);
 }
 return clean.endsWith('/')&&!fragment&&await readdir(new URL(clean,out)).then(()=>true,()=>false);
};
// Manifest deep links: a docsUrl #anchor exists in the static page, and a page that renders spec
// sections is linked with the anchor. Both directions, so neither side can drift alone.
let anchored=0;
for(const entry of manifest.components.filter(c=>c.spec&&c.docsUrl)){
 const url=new URL(entry.docsUrl),ids=await htmlIds(new URL(url.pathname.slice(1)+'.html',out));
 assert.equal(url.hash.slice(1),ids.has(entry.anchor)?entry.anchor:'',`${entry.module}: docsUrl anchor and the static spec section ${entry.anchor} disagree (${entry.docsUrl})`);
 if(url.hash)anchored++;
}
// Root-relative paths count as site links when their first segment is published at the root;
// `/pfad/deck.json` or a product's own `/atlas/` folder in an example are not site links.
const siteRoots=new Set((await readdir(out)).map(name=>name.replace(/\.html$/,'')));
/** Every atlas.rapold.io URL and root-relative site path in an agent file, with {brand} and {mode} expanded. */
async function verifyLinks(file,brandIds){
 const text=await readFile(new URL(file,out),'utf8'),paths=new Set();
 for(const m of text.matchAll(/https:\/\/atlas\.rapold\.io(\/[^\s)<>"'`\]]*)?/g))paths.add(m[1]??'/');
 // Fenced blocks show markup for the consuming product, whose paths are its own.
 for(const m of text.replace(/^```[\s\S]*?^```/gm,'').matchAll(/(?<=^|[\s(`"'[])\/[\w{][\w{}.\/-]*/gm))if(siteRoots.has(m[0].slice(1).split('/')[0].replace(/[.,;:]+$/,'')))paths.add(m[0]);
 let checked=0;
 for(const raw of paths){
  const path=raw.replace(/[.,;:]+$/,'');
  for(const brand of path.includes('{brand}')?brandIds:[null])for(const mode of path.includes('{mode}')?['light','dark']:[null]){
   const expanded=path.replaceAll('{brand}',brand).replaceAll('{mode}',mode);
   if(/[{<]/.test(expanded))continue; // a documented pattern such as icons/<Name>.svg, not a link
   assert.ok(await resolves(expanded),`${file}: advertised link does not resolve: ${expanded}`);checked++;
  }
 }
 return checked;
}
let advertised=0;
for(const file of ['llms.txt','llms-full.txt'])advertised+=await verifyLinks(file,activeBrandIds);
for(const brand of brands)for(const file of ['llms.txt','llms-full.txt','management.md'])advertised+=await verifyLinks(`brands/${brand.id}/${file}`,[brand.id]);
const rootEntry=await readFile(new URL('llms.txt',out),'utf8');
assert.match(rootEntry,/^# .+\n\n> .+/,'llms.txt follows llmstxt.org: H1 and blockquote summary');
assert.ok(rootEntry.includes('](https://atlas.rapold.io/llms-full.txt)'),'llms.txt advertises the root llms-full.txt');
/** llmstxt.org tools fetch every list link literally, so a link target never carries a placeholder. */
const literalLinks=(file,text)=>{for(const m of text.matchAll(/\]\(([^)\s]+)\)/g))assert.doesNotMatch(m[1],/[{}<>]/,`${file}: link target is a template, not a URL: ${m[1]}`);};
literalLinks('llms.txt',rootEntry);
for(const brand of brands){
 const entry=(await readFile(new URL(`brands/${brand.id}/llms.txt`,out),'utf8')).trimEnd(),full=await readFile(new URL(`brands/${brand.id}/llms-full.txt`,out),'utf8');
 literalLinks(`brands/${brand.id}/llms.txt`,entry);
 // Same isolation rule as llms-full.txt: no linked contract addresses another brand's tree.
 for(const [,name] of entry.matchAll(/\]\(https:\/\/atlas\.rapold\.io\/contracts\/([^)#]+\.md)\)/g)){
  const contract=await readFile(new URL(`contracts/${name}`,out),'utf8');
  for(const other of brands.filter(b=>b.id!==brand.id))assert.ok(!contract.replaceAll('{brand}',brand.id).includes(`/brands/${other.id}/`),`${brand.id}/llms.txt links ${name}, which is bound to ${other.id}`);
 }
 assert.ok(!entry.includes('](https://atlas.rapold.io/llms-full.txt)'),`${brand.id}/llms.txt links the theme-free full context`);
 // Published brand markdown links its own published files on Atlas, not as GitHub pages.
 for(const name of (await readdir(new URL(`brands/${brand.id}/`,out))).filter(n=>n.endsWith('.md'))){
  const text=await readFile(new URL(`brands/${brand.id}/${name}`,out),'utf8');
  for(const [,rest] of text.matchAll(new RegExp(`\\]\\(https://github\\.com/marcelrapold/mra-atlas/blob/main/brands/${brand.id}/([^)#\\s]+)`,'g'))){
   const published=await readFile(new URL(`brands/${brand.id}/${rest}`,out)).then(()=>true,()=>false)||brand.sources.includes(`brands/${brand.id}/${rest}`);
   assert.ok(!published,`brands/${brand.id}/${name} links the published ${rest} on GitHub`);
  }
 }
 assert.match(entry,/^# .+\n\n> .+/,`${brand.id}: theme entry follows llmstxt.org`);
 assert.ok(full.startsWith(entry),`${brand.id}: llms-full.txt starts with the theme entry`);
 assert.ok(full.includes('# Atlas-Komponenten'),`${brand.id}: llms-full.txt embeds the component contract`);
 for(const other of brands.filter(b=>b.id!==brand.id))assert.ok(!full.includes(`/brands/${other.id}/`),`Foreign brand in ${brand.id} llms-full.txt`);
 if(brand.sources.length){
  const rules=await readFile(new URL(`brands/${brand.id}/rules.md`,out),'utf8');
  assert.ok(!rules.includes(']('+'../'),`${brand.id}/rules.md keeps a repository-relative link`);
  assert.doesNotMatch(rules,/\]\((?![a-z][\w+.-]*:|#|\/)/i,`${brand.id}/rules.md keeps a relative link`);
 }
}
assert.doesNotMatch(await readFile(new URL('brands/neutral/llms-full.txt',out),'utf8'),/goldbach|sygnum/i,'Corporate default in the neutral full context');
console.log(`Agent contracts verified: ${manifest.components.length} manifest modules (${anchored} docs anchors in static HTML), llms-full.txt per theme and ${advertised} advertised links.`);

// Extension point: every scripts/checks/*.mjs exports `default async function(out)` and
// throws on failure, so a new build check needs no edit of this shared file.
const checks=new URL('checks/',import.meta.url);
for(const name of (await readdir(checks).catch(()=>[])).filter(n=>n.endsWith('.mjs')).sort()){
 const {default:check}=await import(new URL(name,checks));
 assert.equal(typeof check,'function',`scripts/checks/${name} must export a default function`);
 await check(out);
 console.log(`Build check passed: scripts/checks/${name}`);
}
