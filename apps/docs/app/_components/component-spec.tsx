import {Fragment,type ReactNode} from 'react';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import './component-spec.css';

// Spec sections from the component manifest (scripts/build-component-manifest.mjs), rendered at
// build time: the sections and their ids are in the static HTML, so manifest deep links
// (docsUrl #anchor) land on first load. Server component, read once per build.
type Row={prop:string;name:string|null;values:string;note:string};
type Spec={group:string;position:number;purpose:string|null;propTable:Row[];a11y:string|null;do:string|null;dont:string|null};
type Variant={options:string[]|null;default:string|null};
type Entry={name:string;module:string;anchor:string|null;variants:Record<string,Record<string,Variant>>;slots:string[];spec:Spec|null};
type Manifest={import:string;pages:Record<string,string[]>;components:Entry[]};

// prebuild (scripts/build-contracts.mjs) writes the manifest before next build; process.cwd() is apps/docs.
let manifestRead:Promise<Manifest>|null=null;
const loadManifest=()=>manifestRead??=readFile(join(process.cwd(),'public/contracts/components.json'),'utf8').then(text=>JSON.parse(text) as Manifest);

/** Inline markdown of the specs: code spans and bold, nothing else. */
function inline(text:string):ReactNode{
 return text.replaceAll('\\|','|').split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean).map((part,i)=>part.length>2&&part.startsWith('`')?<code key={i}>{part.slice(1,-1)}</code>:part.startsWith('**')&&part.endsWith('**')&&part.length>4?<strong key={i}>{part.slice(2,-2)}</strong>:<Fragment key={i}>{part}</Fragment>);
}
const paragraphs=(text:string)=>text.split(/\n{2,}/).map((p,i)=><p key={i}>{inline(p.replace(/\n/g,' '))}</p>);

/** Spec rows plus every cva variant the spec does not list, so no option goes undocumented. */
function rows(entry:Entry):Row[]{
 const table=entry.spec?.propTable??[],named=new Set(table.map(r=>r.name));
 const variants=Object.values(entry.variants).flatMap(group=>Object.entries(group)).filter(([key,v])=>v.options&&!named.has(key)).map(([key,v])=>{named.add(key);return {prop:'`'+key+'`',name:key,values:v.options!.join(' | '),note:v.default?`Standard: ${v.default}`:''};});
 return [...table,...variants];
}

function SpecSection({entry,importPath}:{entry:Entry;importPath:string}){
 const spec=entry.spec!,id=entry.anchor!,table=rows(entry);
 return <section className="doc-section component-spec" id={id} aria-labelledby={`${id}-title`}>
  <h2 id={`${id}-title`}>{entry.name}</h2>
  <p className="component-spec-meta"><code>{importPath}</code><span>{entry.module}</span>{entry.slots.length>0&&<span>{entry.slots.length===1?'1 Teil':`${entry.slots.length} Teile`} mit <code>data-slot</code></span>}</p>
  {spec.purpose&&<div className="component-spec-purpose">{paragraphs(spec.purpose)}</div>}
  {table.length>0&&<div className="component-spec-table"><table><thead><tr><th scope="col">Prop</th><th scope="col">Werte</th></tr></thead><tbody>{table.map((row,i)=>row.prop
   ?<tr key={i}><th scope="row">{inline(row.prop)}</th><td>{row.values?inline(row.values):'–'}{row.note&&<small>{inline(row.note)}</small>}</td></tr>
   :<tr key={i} className="component-spec-note"><td colSpan={2}>{inline(row.note)}</td></tr>)}</tbody></table></div>}
  {spec.a11y&&<div className="component-spec-block"><h3>Barrierefreiheit</h3>{paragraphs(spec.a11y)}</div>}
  {(spec.do||spec.dont)&&<div className="component-spec-dos">
   {spec.do&&<div data-kind="do"><h3>Do</h3>{paragraphs(spec.do)}</div>}
   {spec.dont&&<div data-kind="dont"><h3>Don&apos;t</h3>{paragraphs(spec.dont)}</div>}
  </div>}
 </section>;
}

/** Spec sections of one reference page, in the group order the manifest declares. Renders nothing for other pages. */
export async function ComponentSpec({section}:{section:string}){
 const manifest=await loadManifest(),groups=manifest.pages[section];
 if(!groups)return null;
 const entries=manifest.components.filter(c=>c.spec&&c.anchor&&groups.includes(c.spec.group)).sort((a,b)=>groups.indexOf(a.spec!.group)-groups.indexOf(b.spec!.group)||a.spec!.position-b.spec!.position);
 if(!entries.length)return null;
 return <>{entries.map(entry=><SpecSection key={entry.module} entry={entry} importPath={manifest.import}/>)}</>;
}
