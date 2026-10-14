// Machine-readable component contract for agents: every core module with its
// exports, cva variants, data-slot anatomy, dependencies and the matching spec
// section from docs/components. Read with the TypeScript compiler API, never
// with regular expressions over source code, so the manifest follows the code.
import {readFile,readdir} from 'node:fs/promises';
import {sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';

const repo=new URL('../',import.meta.url);
const coreSrc=new URL('packages/core/src/',repo);
const specDir=new URL('docs/components/',repo);
const docsApp=new URL('apps/docs/app/',repo);
export const SITE='https://atlas.rapold.io';
export const EXTERNAL_PACKAGES=['radix-ui','lucide-react','cmdk','sonner'];
// Spec group (docs/components/<group>.md) → reference page that renders it.
export const SPEC_PAGES={tone:'status-tones',controls:'controls',dialogs:'dialogs',layout:'page-structure',media:'media',feedback:'notices',primitives:'components',overlays:'components'};
// H2 sections that track internal work and never belong in a public contract.
export const INTERNAL_SECTION=/^(Offen|Offene Punkte)\s*$/i;
/** Anchor id of a spec section. The docs page reads it from the manifest (`anchor`), never recomputes it. */
export const slug=value=>value.normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const parse=(name,text)=>ts.createSourceFile(name,text,ts.ScriptTarget.Latest,true,name.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
const hasExport=node=>ts.getCombinedModifierFlags(node)&ts.ModifierFlags.Export;
const nameOf=node=>ts.isIdentifier(node)||ts.isStringLiteralLike(node)||ts.isNumericLiteral(node)?node.text:null;
const unwrap=node=>{while(node&&(ts.isAsExpression(node)||ts.isSatisfiesExpression(node)||ts.isParenthesizedExpression(node)))node=node.expression;return node;};
function literal(node){
 node=unwrap(node);
 if(!node)return undefined;
 if(ts.isStringLiteralLike(node))return node.text;
 if(ts.isNumericLiteral(node))return Number(node.text);
 if(node.kind===ts.SyntaxKind.TrueKeyword)return true;
 if(node.kind===ts.SyntaxKind.FalseKeyword)return false;
 if(node.kind===ts.SyntaxKind.NullKeyword)return null;
 return undefined;
}
/** Resolves `{…}` or an identifier bound to a top-level object literal in the same file. */
function objectLiteral(node,scope){
 node=unwrap(node);
 if(node&&ts.isIdentifier(node))node=unwrap(scope.get(node.text));
 return node&&ts.isObjectLiteralExpression(node)?node:null;
}
const property=(object,key)=>object?.properties.find(p=>ts.isPropertyAssignment(p)&&nameOf(p.name)===key);

/** Structural facts of one module (ui/*.tsx, lib/*.ts, brand-provider.tsx). */
export function analyseModule(fileName,text){
 const source=parse(fileName,text);
 const scope=new Map(),values=[],types=[],reexports=[],external={},internal=new Set(),variants={},slots=[];
 const client=source.statements[0]&&ts.isExpressionStatement(source.statements[0])&&literal(source.statements[0].expression)==='use client';
 for(const statement of source.statements){
  if(ts.isVariableStatement(statement))for(const d of statement.declarationList.declarations)if(ts.isIdentifier(d.name)&&d.initializer)scope.set(d.name.text,d.initializer);
 }
 const add=(list,name)=>{if(name&&!list.includes(name))list.push(name);};
 for(const statement of source.statements){
  if(ts.isImportDeclaration(statement)){
   const from=statement.moduleSpecifier.text,bindings=statement.importClause?.namedBindings;
   if(EXTERNAL_PACKAGES.includes(from)){
    const names=external[from]??=[];
    if(bindings&&ts.isNamedImports(bindings))for(const el of bindings.elements)if(!el.isTypeOnly&&!statement.importClause.isTypeOnly)add(names,(el.propertyName??el.name).text);
    if(statement.importClause?.name)add(names,'default');
   }else if(from.startsWith('.')){
    const target=new URL(from,new URL(fileName,coreSrc)).href.slice(coreSrc.href.length);
    if(target!=='lib/utils')internal.add(target);
   }
  }else if(ts.isExportDeclaration(statement)){
   if(statement.moduleSpecifier){reexports.push(statement.moduleSpecifier.text);continue;}
   if(statement.exportClause&&ts.isNamedExports(statement.exportClause))for(const el of statement.exportClause.elements)add(statement.isTypeOnly||el.isTypeOnly?types:values,el.name.text);
  }else if(hasExport(statement)){
   if(ts.isInterfaceDeclaration(statement)||ts.isTypeAliasDeclaration(statement))add(types,statement.name.text);
   else if(ts.isVariableStatement(statement))for(const d of statement.declarationList.declarations)add(values,nameOf(d.name));
   else if(statement.name)add(values,statement.name.text);
  }
 }
 (function visit(node){
  if(ts.isVariableDeclaration(node)&&ts.isIdentifier(node.name)&&node.initializer){
   const call=unwrap(node.initializer);
   if(call&&ts.isCallExpression(call)&&ts.isIdentifier(call.expression)&&call.expression.text==='cva'){
    const config=objectLiteral(call.arguments[1],scope),defaults=objectLiteral(property(config,'defaultVariants')?.initializer,scope),result={};
    for(const entry of objectLiteral(property(config,'variants')?.initializer,scope)?.properties??[]){
     if(!ts.isPropertyAssignment(entry))continue;
     const key=nameOf(entry.name),options=objectLiteral(entry.initializer,scope);
     const fallback=literal(property(defaults,key)?.initializer);
     result[key]={options:options?options.properties.map(p=>p.name&&nameOf(p.name)).filter(v=>v!=null):null,default:fallback===undefined?null:String(fallback)};
    }
    variants[node.name.text]=result;
   }
  }
  if(ts.isJsxAttribute(node)&&nameOf(node.name)==='data-slot'){
   const init=node.initializer,value=init&&(ts.isStringLiteral(init)?init.text:ts.isJsxExpression(init)?literal(init.expression):undefined);
   if(typeof value==='string')add(slots,value);
  }
  if(ts.isPropertyAssignment(node)&&nameOf(node.name)==='data-slot'&&typeof literal(node.initializer)==='string')add(slots,literal(node.initializer));
  ts.forEachChild(node,visit);
 })(source);
 return {client:Boolean(client),values,types,reexports,variants,slots,dependencies:{external,internal:[...internal].sort()}};
}

const LABEL=/\*\*(Zweck|Purpose|Teile und Props|Props[^*\n]{0,30}|API|Komponenten|A11y|Accessibility|Barrierefreiheit|Don't|Dont|Do|Herkunft|RadioX-Herkunft|RadioX origin|Abweichungen[^*\n]{0,30}|Verhalten|Behaviour|Hinweis)\s*[:.]?\*\*[:.]?/g;
const FIELD=label=>{
 const l=label.replace(/[:.]\s*$/,'').trim().toLowerCase();
 if(/^(zweck|purpose)$/.test(l))return 'purpose';
 if(/^(props|teile und props|api|komponenten)/.test(l))return 'props';
 if(/^(a11y|accessibility|barrierefreiheit)$/.test(l))return 'a11y';
 if(l==='do')return 'do';
 if(/^don'?t$/.test(l))return 'dont';
 return null;
};
const tidy=text=>text.split('\n').filter(line=>line.trim()!=='---').join('\n').trim();

/** Splits a prose props line at ` · ` and at `, `/`. ` before a code span, outside parentheses and code. */
function splitProse(line){
 const parts=[];let depth=0,code=false,start=0;
 for(let i=0;i<line.length;i++){
  const c=line[i];
  if(c==='`'){code=!code;continue;}
  if(code)continue;
  if(c==='(')depth++;else if(c===')')depth=Math.max(0,depth-1);
  else if(!depth){
   const sep=line.startsWith(' · ',i)?3:/^[,.] `/.test(line.slice(i,i+3))?2:0;
   if(sep){parts.push(line.slice(start,i));start=i+sep;i+=sep-1;}
  }
 }
 parts.push(line.slice(start));
 return parts;
}
/** Value text without connective lead-ins (`: …`, `mit …`) or one pair of enclosing parentheses. */
function bare(values){
 const v=values.replace(/^(?:[:–]\s*|mit\s+)/,'').trim();
 if(!/^\(.*\)$/.test(v))return v;
 let depth=0;
 for(let i=0;i<v.length;i++){if(v[i]==='(')depth++;else if(v[i]===')'&&--depth===0&&i<v.length-1)return v;}
 return v.slice(1,-1);
}
/** Rows `{prop, values, note}` from a prose (`a` x | y · `b` …), bullet or table props block. */
export function propRows(markdown){
 if(!markdown)return [];
 const rows=[],cells=line=>line.trim().replace(/^\||\|$/g,'').split(/(?<!\\)\|/).map(c=>c.trim().replaceAll('\\|','|'));
 const lines=markdown.split('\n');
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();
  if(!line)continue;
  if(line.startsWith('|')){
   if(/^\|[\s:|-]+\|$/.test(line)||/^\|[\s:|-]+\|$/.test(lines[i+1]?.trim()??''))continue;
   const [prop,values='',...note]=cells(line);
   rows.push({prop,values,note:note.filter(cell=>cell&&cell!=='–'&&cell!=='-').join(' · ')});
  }else if(/^[-*] /.test(line)){
   const body=line.slice(2),split=body.match(/^(.+?)(?::| –| →) (.+)$/);
   rows.push(split?{prop:split[1].trim(),values:split[2].trim().replace(/\.$/,''),note:''}:{prop:body,values:'',note:''});
  }else{
   // A sentence that is no list of props (`Alle Teile …`) stays a note of the block.
   if(!line.startsWith('`')&&!/\s·\s/.test(line)){rows.push({prop:'',values:'',note:line});continue;}
   for(const segment of splitProse(line)){
    const s=segment.replace(/\.$/,'').trim(),m=s.match(/^(`[^`]+`(?:\s*(?:,|\/|und)\s*`[^`]+`)*)\s*(.*)$/);
    if(!s)continue;
    if(!m){rows.push({prop:s,values:'',note:''});continue;}
    const code=m[1],typed=code.match(/^`([\w-]+)\??:\s*(.+)`$/);
    rows.push(typed?{prop:'`'+typed[1]+'`',values:'`'+typed[2]+'`'+(m[2]?' '+m[2]:''),note:''}:{prop:code,values:bare(m[2]),note:''});
   }
  }
 }
 return rows;
}
/** Option tokens named in a props value (`default | sm`, `'soft' | 'solid'`, `sm 32 px | md 40 px`). */
export const namedOptions=values=>values.includes('|')?values.split(/\s+·\s+/)[0].split('|').map(part=>part.replace(/[`'"]/g,'').trim().match(/^[\w-]+/)?.[0]).filter(Boolean):[];
/**
 * Every option list a props block names, wherever it stands: `` `size` sm | lg ``,
 * `` `size` `sm | lg` ``, `` `size?: 'sm' | 'lg'` `` and table rows, also nested in parts
 * (`` `TabsList` mit `variant` default | line ``). Returns `[{prop, options}]`.
 */
export function optionMentions(markdown){
 if(!markdown)return [];
 const text=markdown.replaceAll('\\|','|'),found=[];
 const push=(prop,values)=>{const options=namedOptions(values);if(options.length)found.push({prop,options});};
 for(const m of text.matchAll(/`([\w-]+)`\s+`([^`]*\|[^`]*)`/g))push(m[1],m[2]);
 for(const m of text.matchAll(/`([\w-]+)\??:\s*([^`]*\|[^`]*)`/g))push(m[1],m[2]);
 for(const m of text.matchAll(/`([\w-]+)`\s+((?:[\w-]+(?:\s+[\w ]+?)?(?:\s*\([^)]*\))?\s*\|\s*)+[\w-]+)/g))push(m[1],m[2]);
 for(const m of text.matchAll(/^\|\s*`([\w-]+)`\s*\|\s*`([^`]*\|[^`]*)`/gm))push(m[1],m[2]);
 return found;
}
/** Bare prop identifier of a row (`size?: …` → size). */
export const propName=prop=>prop.replace(/`/g,'').trim().match(/^[\w-]+/)?.[0]??null;

/** All H2 sections of the component specs, with heading names and declared module paths. */
export async function readSpecs(){
 const files=(await readdir(specDir)).filter(n=>n.endsWith('.md')).sort(),sections=[];
 for(const file of files){
  const group=file.replace(/\.md$/,''),text=(await readFile(new URL(file,specDir),'utf8')).replace(/\r\n/g,'\n');
  const parts=text.split(/^## /m).slice(1);
  parts.forEach((part,position)=>{
   const [headingLine,...rest]=part.split('\n'),heading=headingLine.trim();
   if(INTERNAL_SECTION.test(heading))return;
   const body=rest.join('\n'),names=heading.replace(/\([^)]*\)/g,'').replace(/`/g,'').split(/[,/·]/).map(s=>s.trim()).filter(Boolean);
   const modulePaths=text=>[...text.matchAll(/(?:packages\/core\/src\/)?\b((?:ui|lib)\/[\w-]+)\.tsx?\b/g)].map(m=>m[1]);
   const intro=body.split('\n').map(l=>l.trim()).filter(Boolean).slice(0,2).filter(l=>/^(Datei:|`packages\/core\/src\/)/.test(l)).join(' ');
   const chunks={purpose:[],props:[],a11y:[],do:[],dont:[]},labels=[...body.matchAll(LABEL)];
   labels.forEach((m,i)=>{
    const field=FIELD(m[1]),value=tidy(body.slice(m.index+m[0].length,labels[i+1]?.index??body.length));
    if(field&&value)chunks[field].push({label:m[1].replace(/[:.]\s*$/,'').trim(),value});
   });
   // A section that documents its API only as a table (Hooks, Audio-Visualisierungen) still has props.
   const table=chunks.props.length?null:body.match(/^\|.*\|$(?:\n^\|.*\|$)+/m)?.[0];
   if(table){
    chunks.props.push({label:'Props',value:table});
    for(const list of Object.values(chunks))for(const c of list)if(c!==chunks.props[0])c.value=c.value.replace(table,'').replace(/\n{3,}/g,'\n\n').trim();
   }
   // Several props blocks (`Props Toggle`, `Props LikeToggle`) keep their label.
   const join=list=>list.length?list.length>1?list.map(c=>`${c.label}: ${c.value}`).join('\n\n'):list[0].value:null;
   const fields=Object.fromEntries(Object.entries(chunks).map(([k,v])=>[k,join(v)]));
   sections.push({group,file:`docs/components/${file}`,heading:heading.replace(/`/g,''),position,names,headingModules:modulePaths(heading),introModules:modulePaths(intro),...fields,propTable:chunks.props.flatMap(c=>[...chunks.props.length>1?[{prop:'',values:'',note:c.label.replace(/^Props\s+/,'')}]:[],...propRows(c.value)]).map(row=>({...row,name:row.prop?propName(row.prop):null}))});
  });
 }
 return sections;
}

/** Best spec section for a module: a heading naming one of its exports beats a declared file path. */
function matchSpec(id,exports,sections){
 const ranked=sections.map(s=>{
  const named=s.names.find(n=>exports.includes(n));
  return {s,named,rank:named?1:s.headingModules.includes(id)?2:s.introModules.includes(id)?3:0};
 }).filter(x=>x.rank).sort((a,b)=>a.rank-b.rank);
 return ranked[0]??null;
}
/**
 * Spec sections reach the static HTML only where a docs route renders `<ComponentSpec>`.
 * Until then docsUrl names the page without a fragment, so no manifest link points at a missing id.
 */
export async function specsRendered(){
 const files=(await readdir(docsApp,{recursive:true})).filter(n=>/\.tsx$/.test(n)&&!/component-spec\.tsx$/.test(n));
 for(const file of files)if(/<ComponentSpec\b/.test(await readFile(new URL(file.split(sep).join('/'),docsApp),'utf8')))return true;
 return false;
}
const pascal=id=>id.split('/').at(-1).replace(/(^|-)(\w)/g,(_,__,c)=>c.toUpperCase());

export async function buildComponentManifest({version}={}){
 version??=JSON.parse(await readFile(new URL('package.json',repo),'utf8')).version;
 const index=analyseModule('index.ts',await readFile(new URL('index.ts',coreSrc),'utf8'));
 const exported=index.reexports.map(s=>s.replace(/^\.\//,''));
 const ui=(await readdir(new URL('ui/',coreSrc))).filter(n=>n.endsWith('.tsx')).map(n=>'ui/'+n.replace(/\.tsx$/,'')).sort();
 const ids=[...exported,...ui.filter(id=>!exported.includes(id))];
 const sections=await readSpecs(),components=[],anchors=await specsRendered();
 for(const id of ids){
  const file=(await readdir(new URL(id.replace(/[^/]+$/,''),coreSrc))).find(n=>n.replace(/\.tsx?$/,'')===id.split('/').at(-1));
  if(!file)throw new Error(`Core module not found: ${id}`);
  const path=id.replace(/[^/]+$/,'')+file,facts=analyseModule(path,await readFile(new URL(path,coreSrc),'utf8'));
  const match=matchSpec(id,facts.values,sections),spec=match?.s;
  const name=match?.named??(spec?spec.names[0]:facts.values.includes(pascal(id))?pascal(id):facts.values.find(v=>/^[A-Z]/.test(v))??pascal(id));
  const page=spec?SPEC_PAGES[spec.group]??'components':id.startsWith('ui/')?'components':null;
  components.push({
   name,module:id,source:`packages/core/src/${path}`,kind:id.startsWith('ui/')?'component':id.startsWith('lib/')?'utility':'provider',
   exported:exported.includes(id),client:facts.client,exports:facts.values,types:facts.types,variants:facts.variants,slots:facts.slots,
   dependencies:facts.dependencies,
   spec:spec?{group:spec.group,file:spec.file,heading:spec.heading,position:spec.position,purpose:spec.purpose,props:spec.props,propTable:spec.propTable,a11y:spec.a11y,do:spec.do,dont:spec.dont}:null,
   anchor:spec?slug(name):null,
   docsUrl:page?`${SITE}/${page}${spec&&anchors?'#'+slug(name):''}`:null,
  });
 }
 // Reference page → spec groups in reading order, so the docs page needs no copy of SPEC_PAGES.
 const pages={};
 for(const [group,page] of Object.entries(SPEC_PAGES))(pages[page]??=[]).push(group);
 return {schemaVersion:1,version,import:'@rapold/framework-core',stylesheet:'@rapold/framework-core/styles.css',specs:`${SITE}/contracts/components.md`,pages,components};
}

if(import.meta.url===pathToFileURL(process.argv[1]??'').href)process.stdout.write(JSON.stringify(await buildComponentManifest(),null,2)+'\n');
