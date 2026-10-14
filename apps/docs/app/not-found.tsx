import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {siteViewport} from './_seo/seo';
// Root not-found also answers every unmatched URL of the static export (404.html).
// No canonical and no sharing block: an error page must not claim another URL.
// Next emits <meta name="robots" content="noindex"> for not-found itself; a
// second robots tag here would only duplicate it (scripts/checks/web-metadata.mjs).
export const metadata:Metadata={title:'Seite nicht gefunden · Atlas',description:'Die angeforderte Adresse existiert in Atlas nicht.',alternates:null,openGraph:null,twitter:null};
export const viewport=siteViewport;
const links=[
 {href:'/',eyebrow:'Einstieg',title:'Übersicht',text:'Aufbau von Atlas, Brands und die wichtigsten Einstiege.'},
 {href:'/components',eyebrow:'Komponenten',title:'Komponenten',text:'Alle UI-Module mit Beispielen, Zuständen und Verträgen.'},
 {href:'/tokens',eyebrow:'Marke',title:'Design-Tokens',text:'Farbrollen, Skalen und Exporte der aktiven Brand.'},
 {href:'/llms.txt',eyebrow:'Agenten',title:'llms.txt',text:'Maschinenlesbarer Einstieg mit allen Verträgen.'},
];
export default function NotFound(){
 return <><div className="page-heading"><div className="eyebrow">Fehler 404</div><h1>Seite nicht gefunden</h1><p>Unter dieser Adresse ist keine Seite veröffentlicht. Möglicherweise wurde sie umbenannt oder der Link ist unvollständig.</p></div>
 <div className="entry-grid">{links.map(l=>{const body=<><span className="eyebrow">{l.eyebrow}</span><h2>{l.title}<ArrowUpRight size={20} aria-hidden/></h2><p>{l.text}</p></>;return l.href.endsWith('.txt')?<a href={l.href} key={l.href}>{body}</a>:<Link href={l.href} key={l.href}>{body}</Link>;})}</div></>;
}
