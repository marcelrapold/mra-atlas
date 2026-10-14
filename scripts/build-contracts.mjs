import { mkdir, writeFile, copyFile, readFile, readdir, access, cp, stat } from 'node:fs/promises';
import { brands, deckAssetPaths } from '../packages/brands/src/index.mjs';
import { mermaidTheme,mermaidThemeCSS,mermaidClassDefs,MERMAID_WRAPPING_WIDTH,MERMAID_NODE_PADDING } from '../packages/brands/src/mermaid-theme.mjs';
import { presentationTheme } from '../packages/brands/src/presentation.mjs';
import { buildBrandAssets } from './build-brand-assets.mjs';
import { buildDeckAssets } from './build-deck-assets.mjs';
import { pruneBrandOutputs } from './prune-brand-outputs.mjs';
import { buildComponentManifest, INTERNAL_SECTION, SITE } from './build-component-manifest.mjs';
const REPOSITORY='https://github.com/marcelrapold/mra-atlas';
// Repository docs published under /contracts/<name>; everything else links to GitHub.
const CONTRACT_DOCS=['repo-to-management.md','brand-contract.md','presentation-logic.md','project-decks.md','mermaid.md','engineering.md','produkte-einbinden.md'];
const isFile=url=>stat(url).then(s=>s.isFile(),()=>false);
/**
 * Relative markdown links of a copied repository file become absolute, keeping anchors.
 * A file Atlas publishes itself links to its served copy: contracts under /contracts/, the
 * brand's own sources under /brands/<id>/<name>, its README as rules.md, and every other
 * file of the brand tree that exists at the same path in the deployable output (logos,
 * identity.json, licence notices). Only unpublished files link to GitHub.
 */
async function absoluteLinks(markdown,sourcePath,brand){
 const link=/\]\(([^)\s]+)\)/g,links=new Map();
 for(const [,target] of markdown.matchAll(link)){
  if(links.has(target)||/^(?:[a-z][\w+.-]*:|#|\/)/i.test(target))continue;
  const [path,hash='']=target.split(/(?=#)/),resolved=decodeURI(new URL(path,new URL(sourcePath,'https://repo.invalid/')).pathname.slice(1));
  const doc=resolved.match(/^docs\/([^/]+)$/)?.[1],own=`brands/${brand.id}/`,rest=resolved.startsWith(own)?resolved.slice(own.length):null;
  let url=`${REPOSITORY}/blob/main/${resolved}`;
  if(doc&&CONTRACT_DOCS.includes(doc))url=`${SITE}/contracts/${doc}`;
  else if(rest==='README.md'&&brand.sources.length)url=`${SITE}/brands/${brand.id}/rules.md`;
  else if(rest&&brand.sources.includes(resolved))url=`${SITE}/brands/${brand.id}/${encodeURI(resolved.split('/').at(-1))}`;
  else if(rest&&await isFile(new URL(`brands/${brand.id}/${rest}`,root)))url=`${SITE}/brands/${brand.id}/${encodeURI(rest)}`;
  links.set(target,url+hash);
 }
 return markdown.replace(link,(all,target)=>links.has(target)?`](${links.get(target)})`:all);
}
// Source assets and their reproducible exports must exist before documentation
// and presentation contracts reference them.
await pruneBrandOutputs();
await buildBrandAssets();
await buildDeckAssets();
const {version}=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
const root = new URL('../apps/docs/public/',import.meta.url);
const sharedAgentGuide = (await readFile(new URL('../llms.txt',import.meta.url),'utf8')).replace(/\r\n/g,'\n');
const themeLabel=brand=>brand.id==='neutral'?'Default-Preset':brand.name+'-Theme';
// Repository docs that /llms.txt advertises under /contracts/, read once for the isolation rule.
const contractSources=new Map(await Promise.all(CONTRACT_DOCS.map(async name=>[name,(await readFile(new URL(`../docs/${name}`,import.meta.url),'utf8')).replace(/\r\n/g,'\n')])));
/** A contract that addresses another brand's tree is bound to that brand and stays out of this theme. */
const boundElsewhere=(text,brand)=>brands.some(other=>other.id!==brand.id&&text.replaceAll('{brand}',brand.id).includes(`/brands/${other.id}/`));
const DEFAULT_LINKS_NOTE='Die Theme-Links unten zeigen das Default-Preset';
/**
 * Theme entry in llmstxt.org form: own H1, the shared summary, the theme scope, its sources before
 * «Optional». The Default-Preset links of /llms.txt point at this theme; the theme-free full
 * context and contracts bound to another brand are left out, by the same rule as llms-full.txt.
 */
function themeGuide(brand){
 const keep=line=>{
  if(line.startsWith('- [')&&line.includes(`](${SITE}/llms-full.txt)`))return false;
  const contract=line.startsWith('- [')?line.match(/\]\(https:\/\/atlas\.rapold\.io\/contracts\/([^)#]+)\)/)?.[1]:null;
  return !(contract&&contractSources.has(contract)&&boundElsewhere(contractSources.get(contract),brand));
 };
 const shared=sharedAgentGuide.split('\n\n').filter(part=>!part.startsWith(DEFAULT_LINKS_NOTE)).join('\n\n').split('\n').filter(keep).join('\n')
  .replaceAll(`${SITE}/brands/neutral/`,`${SITE}/brands/${brand.id}/`).replaceAll('{brand}',brand.id).replace(/^# .*\n/,`# Atlas · ${themeLabel(brand)}\n`);
 const scope=`Aktive Brand: ${brand.id} · Status: ${brand.status}\nNur die folgenden Theme-Vorgaben und die gemeinsamen Framework-Regeln verwenden.\n\n`;
 const [head,optional='']=shared.replace(/(^> .*\n\n)/m,`$1${scope}`).split(/(?=^## Optional$)/m);
 const files=[...brand.sources.map(source=>source.split('/').at(-1)),...brand.sources.length?['rules.md']:[]];
 const logo=brand.assets?.logo?[`- [Original-Logo](${SITE}/${brand.assets.logo.path}): unverändert verwenden`]:[];
 const items=[...files.map(name=>`- [${name}](${SITE}/brands/${brand.id}/${name})`),...logo];
 return head+(items.length?`## Quellen dieses Themes\n\n${items.join('\n')}\n\n`:'')+optional;
}
const managementContract = await readFile(new URL('../docs/repo-to-management.md',import.meta.url),'utf8');
await mkdir(new URL('contracts/',root),{recursive:true});
await copyFile(new URL('../docs/repo-to-management.md',import.meta.url),new URL('contracts/repo-to-management.md',root));
await copyFile(new URL('../docs/brand-contract.md',import.meta.url),new URL('contracts/brand-contract.md',root));
await copyFile(new URL('../packages/brands/src/brand.schema.json',import.meta.url),new URL('contracts/brand.schema.json',root));
await writeFile(new URL('llms.txt',root),sharedAgentGuide);
await mkdir(new URL('brands/',root),{recursive:true});
await writeFile(new URL('brands/index.json',root),JSON.stringify({schemaVersion:1,brands:brands.map(b=>({id:b.id,name:b.name,status:b.status,version:b.version,brand:`/brands/${b.id}/brand.json`,presentation:`/brands/${b.id}/presentation.json`}))},null,2)+'\n');
for (const brand of brands) {
  const directory = new URL(`brands/${brand.id}/`,root);
  await mkdir(directory,{recursive:true});
  const sourceNames=new Set();
  const markdownSources=[];
  for(const source of brand.sources){
    if(!source.startsWith(`brands/${brand.id}/`) || source.split('/').includes('..'))throw new Error(`Invalid brand source path: ${source}`);
    const name=source.split('/').at(-1);
    if(sourceNames.has(name))throw new Error(`Duplicate public source name: ${name}`);
    sourceNames.add(name);
    if(name.endsWith('.md'))markdownSources.push([source,name]);
    else await copyFile(new URL('../'+source,import.meta.url),new URL(name,directory));
  }
  if(brand.sources.length)markdownSources.push([`brands/${brand.id}/README.md`,'rules.md']);
  // Brand packages with their own static assets (logos, icons) publish them unchanged.
  // Rapold has a dedicated export pipeline (build-brand-assets.mjs) and is excluded here.
  const staticAssets=new URL(`../brands/${brand.id}/assets/`,import.meta.url);
  if(brand.id!=='rapold'&&await access(staticAssets).then(()=>true,()=>false))await cp(staticAssets,new URL('assets/',directory),{recursive:true});
  // Deck contract images (backdrops, raster logos, supergraphics) keep their repository path.
  for(const file of deckAssetPaths(brand)){await mkdir(new URL(file.replace(/[^/]+$/,''),root),{recursive:true});await copyFile(new URL('../'+file,import.meta.url),new URL(file,root));}
  if(brand.assets?.logo){
    const original=new URL('../'+brand.assets.logo.path,import.meta.url);
    if(await access(original).then(()=>true,()=>false))await copyFile(original,new URL(brand.assets.logo.path,root));
  }
  // Markdown last: its links point at published copies, so every asset of the brand is in place.
  for(const [source,name] of markdownSources)await writeFile(new URL(name,directory),await absoluteLinks(await readFile(new URL('../'+source,import.meta.url),'utf8'),source,brand));
  const brandSources=brand.sources.map(source=>`- /brands/${brand.id}/${source.split('/').at(-1)}`).join('\n');
  await writeFile(new URL('llms.txt',directory),themeGuide(brand));
  const managementGuide=`# Management-Präsentation · ${brand.id==='neutral'?'Default':brand.name}\n\nAktive Brand: ${brand.id} · Status: ${brand.status} · Framework: ${version}\nDieser verlinkte Einstieg ist die Theme-Wahl des Auftrags. Nur die aktiven Brand-Quellen und Original-Assets verwenden. Explizite abweichende Nutzerangaben haben Vorrang.\n\n${managementContract.replaceAll('{brand}',brand.id)}\n${brandSources?'## Pflichtquellen der aktiven Brand\n'+brandSources+'\n- /brands/'+brand.id+'/rules.md\n':''}${brand.assets?.logo?'\nOriginal-Logo: /'+brand.assets.logo.path+'\n':''}`;
  await writeFile(new URL('management.md',directory),managementGuide.replace(/(^|[\s(`])\/(brands|contracts|praesentation)\//gm,'$1https://atlas.rapold.io/$2/'));
  await writeFile(new URL('brand.json',directory),JSON.stringify(brand,null,2)+'\n');
  await writeFile(new URL('presentation.json',directory),JSON.stringify(presentationTheme(brand),null,2)+'\n');
}
console.log(`Generated contracts for ${brands.length} brands.`);


const {tokenDocument,dtcgTokens,toCssVariables}=await import('../packages/brands/src/index.mjs');
for(const brand of brands)for(const mode of Object.keys(brand.modes)) {
 const directory=new URL(`brands/${brand.id}/`,root);
 await writeFile(new URL(`mermaid.${mode}.json`,directory),JSON.stringify({schemaVersion:1,brand:brand.id,mode,theme:'base',look:'classic',themeVariables:mermaidTheme(brand,mode),themeCSS:mermaidThemeCSS(brand,mode),flowchart:{wrappingWidth:MERMAID_WRAPPING_WIDTH,padding:MERMAID_NODE_PADDING},classDefs:mermaidClassDefs(brand)},null,2)+'\n');
 await writeFile(new URL(`tokens.${mode}.json`,directory),JSON.stringify(tokenDocument(brand,mode),null,2)+'\n');
 await writeFile(new URL(`tokens.${mode}.dtcg.json`,directory),JSON.stringify(dtcgTokens(brand,mode),null,2)+'\n');
 await writeFile(new URL(`tokens.${mode}.css`,directory),`[data-brand="${brand.id}"][data-mode="${mode}"] {\n${Object.entries(toCssVariables(brand,mode)).map(([k,v])=>`  ${k}: ${v};`).join('\n')}\n}\n`);
}
await mkdir(new URL('praesentation/',root),{recursive:true});
await copyFile(new URL('../docs/repo-to-management.md',import.meta.url),new URL('praesentation/llms.txt',root));
await copyFile(new URL('../docs/presentation-logic.md',import.meta.url),new URL('contracts/presentation-logic.md',root));
const validator=await readFile(new URL('../packages/brands/src/deck-validation.mjs',import.meta.url),'utf8');
const {slides,presets}=await import('../packages/brands/src/presentation.mjs');
await writeFile(new URL('praesentation/deck-validation.mjs',root),validator.replace("import {slides as catalog} from './presentation.mjs';",'const catalog='+JSON.stringify(slides)+';'));
await import('./build-icons.mjs');
await import('./build-decks.mjs');
await copyFile(new URL('../packages/brands/src/deck-input.schema.json',import.meta.url),new URL('praesentation/deck-input.schema.json',root));
const uiModules=(await readdir(new URL('../packages/core/src/ui/',import.meta.url))).filter(name=>name.endsWith('.tsx')).length;
await writeFile(new URL('build-info.json',root),JSON.stringify({version,builtAt:new Date().toISOString(),commit:process.env.VERCEL_GIT_COMMIT_SHA??process.env.GITHUB_SHA??'local-build',uiModules,slideTypes:slides.length,deckPresets:presets.length},null,2)+'\n');
await copyFile(new URL('../packages/presentation/src/project-input.schema.json',import.meta.url),new URL('praesentation/project-input.schema.json',root));
await copyFile(new URL('../examples/framework-review.json',import.meta.url),new URL('praesentation/framework-review.json',root));
const projectValidator=await readFile(new URL('../packages/presentation/src/validate-project.mjs',import.meta.url),'utf8');
await writeFile(new URL('praesentation/project-validation.mjs',root),projectValidator.replace('../../brands/src/deck-validation.mjs','./deck-validation.mjs'));
await copyFile(new URL('../docs/project-decks.md',import.meta.url),new URL('contracts/project-decks.md',root));

await copyFile(new URL('../docs/mermaid.md',import.meta.url),new URL('contracts/mermaid.md',root));
await copyFile(new URL('../docs/engineering.md',import.meta.url),new URL('contracts/engineering.md',root));
await copyFile(new URL('../docs/produkte-einbinden.md',import.meta.url),new URL('contracts/produkte-einbinden.md',root));
// One component contract for agents: import path plus every group spec under docs/components.
// Internal tracking sections («Offen», «Offene Punkte») stay in the repository.
const withoutInternalSections=markdown=>markdown.replace(/\r\n/g,'\n').split(/(?=^## )/m).filter(part=>!INTERNAL_SECTION.test(part.match(/^## (.*)/)?.[1]??'')).join('').trimEnd()+'\n';
{const dir=new URL('../docs/components/',import.meta.url);const specs=(await readdir(dir)).filter(n=>n.endsWith('.md')).sort();
 const body=await Promise.all(specs.map(async n=>withoutInternalSections(await readFile(new URL(n,dir),'utf8'))));
 const intro=['# Atlas-Komponenten','',"Import: `import { Button } from '@rapold/framework-core'` und einmalig `@rapold/framework-core/styles.css`. Alle Komponenten nutzen nur semantische Tokens der aktiven Brand. Showcase: https://atlas.rapold.io/components",'',`Maschinenlesbar (Exporte, Varianten, data-slot, Abhängigkeiten, Spezifikation): ${SITE}/contracts/components.json`,''].join('\n');
 await writeFile(new URL('contracts/components.md',root),intro+'\n'+body.join('\n'));
 await writeFile(new URL('contracts/components.json',root),JSON.stringify(await buildComponentManifest({version}),null,2)+'\n');}

// llms-full.txt: the entry plus every contract in one file. Theme files keep per-brand
// isolation: {brand} resolves to the active brand, and a contract that addresses another
// brand's tree is listed as omitted instead of leaking into the theme.
{const docs=['brand-contract.md','components.md','produkte-einbinden.md','engineering.md','mermaid.md','presentation-logic.md'];
 const contracts=await Promise.all(docs.map(async name=>({name,text:(await readFile(new URL(`contracts/${name}`,root),'utf8')).replace(/\r\n/g,'\n').trim()})));
 const full=(entry,brand)=>{
  const resolved=contracts.map(c=>({...c,text:brand?c.text.replaceAll('{brand}',brand.id):c.text}));
  const included=resolved.filter(c=>!brand||!boundElsewhere(c.text,brand)),omitted=resolved.filter(c=>!included.includes(c)).map(c=>c.name);
  const index=`## Enthaltene Verträge\n\n${included.map(c=>`- [${c.name}](${SITE}/contracts/${c.name})`).join('\n')}\n${omitted.length?`\nNicht enthalten, weil an eine andere Brand gebunden: ${omitted.join(', ')}.\n`:''}`;
  return `${entry.trimEnd()}\n\n${index}\n${included.map(c=>`---\n\nQuelle: ${SITE}/contracts/${c.name}\n\n${c.text}\n`).join('\n')}`;
 };
 await writeFile(new URL('llms-full.txt',root),full(sharedAgentGuide));
 for(const brand of brands)await writeFile(new URL(`brands/${brand.id}/llms-full.txt`,root),full(themeGuide(brand),brand));}
