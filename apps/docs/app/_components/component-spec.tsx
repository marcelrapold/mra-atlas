'use client';
import {Fragment,useEffect,useState,type ReactNode} from 'react';
import './component-spec.css';

// Spec sections as published in /contracts/components.json (scripts/build-component-manifest.mjs).
type Row={prop:string;values:string;note:string};
type Spec={group:string;heading:string;position:number;purpose:string|null;propTable:Row[];a11y:string|null;do:string|null;dont:string|null};
type Variant={options:string[]|null;default:string|null};
type Entry={name:string;module:string;variants:Record<string,Record<string,Variant>>;slots:string[];spec:Spec|null};
type Manifest={import:string;components:Entry[]};

// Reference page → spec groups (docs/components/<group>.md), in reading order.
const sectionGroups:Record<string,string[]>={components:['primitives','overlays'],'status-tones':['tone'],controls:['controls'],dialogs:['dialogs'],'page-structure':['layout'],media:['media'],notices:['feedback']};

// One request per page load, shared by every section; a failure may be retried on the next mount.
let manifestRequest:Promise<Manifest|null>|null=null;
const loadManifest=()=>manifestRequest??=fetch('/contracts/components.json').then(r=>r.ok?r.json() as Promise<Manifest>:null).catch(()=>null).then(m=>{if(!m)manifestRequest=null;return m;});

const slug=(value:string)=>value.normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const propName=(prop:string)=>prop.replace(/`/g,'').trim().match(/^[\w-]+/)?.[0]??null;

/** Inline markdown of the specs: code spans and bold, nothing else. */
function inline(text:string):ReactNode{
 return text.replaceAll('\\|','|').split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean).map((part,i)=>part.length>2&&part.startsWith('`')?<code key={i}>{part.slice(1,-1)}</code>:part.startsWith('**')&&part.endsWith('**')&&part.length>4?<strong key={i}>{part.slice(2,-2)}</strong>:<Fragment key={i}>{part}</Fragment>);
}
const paragraphs=(text:string)=>text.split(/\n{2,}/).map((p,i)=><p key={i}>{inline(p.replace(/\n/g,' '))}</p>);

/** Spec rows plus every cva variant the spec does not list, so no option goes undocumented. */
function rows(entry:Entry):Row[]{
 const table=entry.spec?.propTable??[],named=new Set(table.map(r=>propName(r.prop)));
 const variants=Object.values(entry.variants).flatMap(group=>Object.entries(group)).filter(([key,v])=>v.options&&!named.has(key)).map(([key,v])=>{named.add(key);return {prop:'`'+key+'`',values:v.options!.join(' | '),note:v.default?`Standard: ${v.default}`:''};});
 return [...table,...variants];
}

function SpecSection({entry,importPath}:{entry:Entry;importPath:string}){
 const spec=entry.spec!,id=slug(entry.name),table=rows(entry);
 return <section className="doc-section component-spec" id={id} aria-labelledby={`${id}-title`}>
  <h2 id={`${id}-title`}>{entry.name}</h2>
  <p className="component-spec-meta"><code>{importPath}</code><span>{entry.module}</span>{entry.slots.length>0&&<span>{entry.slots.length} data-slot</span>}</p>
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

/** Spec sections of one reference page, read from the published component manifest. Renders nothing without it. */
export function ComponentSpec({section}:{section:string}){
 const groups=sectionGroups[section];
 const [manifest,setManifest]=useState<Manifest|null>(null);
 useEffect(()=>{
  if(!groups)return;
  let live=true;
  loadManifest().then(m=>{if(live)setManifest(m);});
  return()=>{live=false;};
 },[groups]);
 if(!groups||!manifest)return null;
 const entries=manifest.components.filter(c=>c.spec&&groups.includes(c.spec.group)).sort((a,b)=>groups.indexOf(a.spec!.group)-groups.indexOf(b.spec!.group)||a.spec!.position-b.spec!.position);
 if(!entries.length)return null;
 return <>{entries.map(entry=><SpecSection key={entry.module} entry={entry} importPath={manifest.import}/>)}</>;
}
export default ComponentSpec;
