import type {Metadata, ResolvingMetadata} from 'next';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
 const title='Dramaturgie & Logik · Design Framework';
 const inherited=await parent;
 return {
  title,
  alternates:{canonical:'/praesentationslogik'},
  openGraph:{...inherited.openGraph,title,url:'/praesentationslogik'},
 };
}
export default async function Page(){
 const raw=await readFile(path.resolve(process.cwd(),'../../docs/presentation-logic.md'),'utf8');
 const blocks=raw.split('\n\n');
 return <><div className="page-heading"><div className="eyebrow">Agenten / Verbindlicher Vertrag</div><h1>Dramaturgie & Logik</h1><p>Die inhaltliche Konstruktion einer Management-Präsentation aus Atlas, als lesbare Anleitung und prüfbarer Vertrag.</p><div className="download-row"><a href="/contracts/presentation-logic.md">Vollständiger Markdown-Vertrag</a><a href="/praesentation/deck-input.schema.json">Eingabeschema</a></div></div><article className="logic-doc">{blocks.filter(b=>!b.startsWith('# ')).map((b,i)=>b.startsWith('## ')?<h2 key={i}>{b.slice(3)}</h2>:b.startsWith('- ')?<ul key={i}>{b.split('\n').map((l,j)=><li key={j}>{l.replace(/^- /,'')}</li>)}</ul>:/^\d\. /.test(b)?<ol key={i}>{b.split('\n').map((l,j)=><li key={j}>{l.replace(/^\d\. /,'')}</li>)}</ol>:<p key={i}>{b}</p>)}</article></>;
}
