import type {Metadata, ResolvingMetadata} from 'next';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {articleData,jsonLd,pageDescription,pageMetadata,siteViewport} from '../_seo/seo';
const title='Dramaturgie & Logik',intro='Die inhaltliche Konstruktion einer Management-Präsentation, als lesbare Anleitung und prüfbarer Vertrag.',description=pageDescription('praesentationslogik',intro);
export const viewport=siteViewport;
export function generateMetadata(_props:unknown,parent:ResolvingMetadata):Promise<Metadata>{return pageMetadata(parent,{title,description,path:'/praesentationslogik'});}
export default async function Page(){
 const raw=await readFile(path.resolve(process.cwd(),'../../docs/presentation-logic.md'),'utf8');
 const blocks=raw.split('\n\n');
 return <>{jsonLd(articleData('praesentationslogik',{title,description}))}<div className="page-heading"><div className="eyebrow">Agenten / Verbindlicher Vertrag</div><h1>{title}</h1><p>{intro}</p><div className="download-row"><a href="/contracts/presentation-logic.md">Vollständiger Markdown-Vertrag</a><a href="/praesentation/deck-input.schema.json">Eingabeschema</a></div></div><article className="logic-doc">{blocks.filter(b=>!b.startsWith('# ')).map((b,i)=>b.startsWith('## ')?<h2 key={i}>{b.slice(3)}</h2>:b.startsWith('- ')?<ul key={i}>{b.split('\n').map((l,j)=><li key={j}>{l.replace(/^- /,'')}</li>)}</ul>:/^\d\. /.test(b)?<ol key={i}>{b.split('\n').map((l,j)=><li key={j}>{l.replace(/^\d\. /,'')}</li>)}</ol>:<p key={i}>{b}</p>)}</article></>;
}
