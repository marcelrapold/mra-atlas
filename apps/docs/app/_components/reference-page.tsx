'use client';
import {useState,type ComponentType,type ReactNode} from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {ArrowUpRight,Play} from 'lucide-react';
import {Button,Input,Tabs,TabsList,TabsTrigger,TabsContent} from '@rapold/framework-core';
import {resolveFoundation,semanticTokens,contrast} from '@rapold/framework-brands';
import {useActiveBrand} from './framework-shell';
import {pages,guidance,guidanceFor,href,slug,componentNames,componentPages,deckCatalog} from './catalog';
import {PageToc,AnchoredHeading,type TocEntry} from './page-toc';
// The measured PPT type scale only; presentation.mjs (slide catalogue, deck theme) stays out of the shared chunk.
import deckFoundation from '../../../../packages/brands/src/deck-foundation.json';
import {Pager} from './pager';
// Loading placeholder of a lazily loaded block. While one is present the pager stays hidden (pager.css), so it appears in place instead of jumping.
const Loading=({children}:{children:ReactNode})=><p className="lazy-loading">{children}</p>;
const sectionDemos:Record<string,ComponentType>={
 'status-tones':dynamic(()=>import('./demos/tone-demo').then(m=>m.ToneDemo),{loading:()=> <Loading>Komponenten werden geladen …</Loading>}),
 controls:dynamic(()=>import('./demos/controls-demo').then(m=>m.ControlsDemo),{loading:()=> <Loading>Komponenten werden geladen …</Loading>}),
 dialogs:dynamic(()=>import('./demos/dialogs-demo').then(m=>m.DialogsDemo),{loading:()=> <Loading>Komponenten werden geladen …</Loading>}),
 'page-structure':dynamic(()=>import('./demos/layout-demo').then(m=>m.LayoutDemo),{loading:()=> <Loading>Komponenten werden geladen …</Loading>}),
 media:dynamic(()=>import('./demos/media-demo').then(m=>m.MediaDemo),{loading:()=> <Loading>Komponenten werden geladen …</Loading>}),
 notices:dynamic(()=>import('./demos/feedback-demo').then(m=>m.FeedbackDemo),{loading:()=> <Loading>Komponenten werden geladen …</Loading>}),
};
const ComponentDemo=dynamic(()=>import('./component-demo').then(m=>m.ComponentDemo),{loading:()=> <Loading>Komponenten werden geladen …</Loading>});
const BrandShowcase=dynamic(()=>import('./brand-showcase'));
const MermaidShowcase=dynamic(()=>import('./mermaid-showcase'),{loading:()=> <Loading>Diagrammgalerie wird geladen …</Loading>});
const PatternShowcase=dynamic(()=>import('./pattern-showcase'),{loading:()=> <Loading>Beispiel wird geladen …</Loading>});
const TableShowcase=dynamic(()=>import('./table-showcase'),{loading:()=> <Loading>Tabelle wird geladen …</Loading>});
const DataShowcase=dynamic(()=>import('./data-showcase'),{loading:()=> <Loading>Datenbeispiel wird geladen …</Loading>});
const EChartsShowcase=dynamic(()=>import('./echarts-showcase'),{loading:()=> <Loading>ECharts wird geladen …</Loading>});
const OrgchartEditor=dynamic(()=>import('./orgchart-editor'),{loading:()=> <Loading>Organigramm wird geladen …</Loading>});
const IconGallery=dynamic(()=>import('./icon-gallery'),{loading:()=> <Loading>Icon-Katalog wird geladen …</Loading>});
const ChangelogInfographic=dynamic(()=>import('./changelog-infographic'),{loading:()=> <Loading>Infografik wird geladen …</Loading>});
// The prompt compiler loads with /agenten only.
const AgentenSection=dynamic(()=>import('./sections/agenten-section'),{loading:()=> <Loading>Prompt wird geladen …</Loading>});
const deckScale=deckFoundation.typeScale as Record<string,{pt:number;weight:number|string}>;
// Sections rendered above the guidance, in page order: id and heading text, so the on-page navigation is part of the server render.
const fixedSections:Record<string,TocEntry[]>={overview:[{id:slug('Eine Brand, alle Ausprägungen'),label:'Eine Brand, alle Ausprägungen'}],typography:[{id:slug('Präsentationen'),label:`Präsentationen: ${Object.keys(deckScale).length} vermessene Rollen`}],layout:['Abstandsskala','Shell-Geometrie','Responsives Raster'].map(label=>({id:slug(label),label}))};
// Pages that bring their own anchor bar.
const ownToc=new Set(['mermaid']);
const descriptions:Record<string,string>={'status-tones':'Tonrollen, Statuspunkte, Live-Anzeige, Eyebrow, Inset und KI-Kennzeichnung auf semantischen Tokens.',controls:'Buttons mit Ladezustand, Icon-Buttons, Play-Button, Toggle, Switch und Radio-Gruppe.',dialogs:'Bestätigen, Eingeben und Informieren als Promise-Dialog, Wischen zum Schliessen und Fehlergrenzen.','page-structure':'Seitenkopf, Breadcrumb, Abschnitte, mobile Bottom-Navigation und Avatare.',media:'Player-Leiste, Medienkarten, Karussell und Audio-Visualisierung ohne Produktlogik.',notices:'Hinweise und Banner, Live-Ansagen für Screenreader und ein Protokoll-Viewer.',mermaid:'Architektur, Abläufe und Zusammenhänge als Diagramm. Fünf ausführbare Muster mit Brand-Farben, Vollbild und eigenem Editor.',brand:'Original-Assets, Farben, Schriften und Vorlagen der aktiven Marke.',overview:'Die Referenz für Interfaces, Präsentationen und markenfähige Anwendungen.',tokens:'Semantische Rollen, vollständige Skalen und maschinenlesbare Exporte aus derselben Quelle.',typography:'Schriftrollen für Interfaces und Präsentationen. Die aktive Brand bestimmt Schrift und Gewichte.',layout:'Wiederholbare Abstände, konsistente Proportionen und das vermessene Seitenraster.',icons:'Der vollständige neutrale Lucide-Satz mit Suche, Code und SVG-Download.',components:`${componentNames.length} dokumentierte UI-Module, neutral gehalten und an die aktive Brand gebunden.`,motion:'Dauer, Easing und Bewegungsverhalten als gemeinsame Design-Tokens.',tables:'Kompakte Datentabellen: klare Typografie, Status-Badges, Suche, Sortierung und Pagination.',feedback:'Lade-, Leer-, Fehler- und Erfolgszustände aus denselben Komponenten.',infografik:'Ein markenfähiges Infografik-Muster für operative Changelogs. Die aktive Brand steuert Farben, Typografie und Geometrie.'};
// Brands whose showcase opens with its own hero: the generic heading steps back.
const compactBrandHeading=new Set(['rapold','radiox']);
export default function ReferencePage({section='overview'}:{section?:string}){
 const {brand,mode}=useActiveBrand();const page=pages.find(p=>p.id===section)!;const pageGuidance=guidanceFor(section,brand.id);const tokens=resolveFoundation(brand),colors=semanticTokens(brand,mode);
 const [query,setQuery]=useState(''),[copied,setCopied]=useState(''),[motionKey,setMotionKey]=useState(0);
 const copy=async(text:string)=>{try{await navigator.clipboard.writeText(text);setCopied('Kopiert');}catch{setCopied('Kopieren nicht verfügbar. Text bitte direkt markieren.');}};
 const themed=(id:string)=>`${href(id)}?brand=${encodeURIComponent(brand.id)}`;
 const headingClass=`page-heading${section==='overview'?' page-heading--home':section==='brand'&&compactBrandHeading.has(brand.id)?' page-heading--compact':''}`;

 const toc=[...fixedSections[section]??[],...pageGuidance?.sections.map(s=>({id:slug(s.title),label:s.title}))??[]];
 const describe=(id:string)=>id==='praesentation'?`${deckCatalog.slides} Folientypen, ${deckCatalog.presets} Deck-Presets und ein gemeinsames Fünf-Zonen-Gerüst. Mit vermessener Geometrie und prüfbarem Inhaltsvertrag.`:descriptions[id]??guidance[id]?.intro;

 return <><div className={headingClass}><div className="eyebrow">{page.group} <span>/ {brand.name}</span></div><h1>{page.title}</h1><p>{descriptions[section]??pageGuidance?.intro}</p><div className="page-meta"><span className="status-label">{brand.status==='draft'?'CI-Entwurf':'Framework-Standard'}</span><a href={section==='brand'?`/brands/${brand.id}/brand.json`:section==='mermaid'?`/brands/${brand.id}/mermaid.${mode}.json`:section==='praesentation'?`/brands/${brand.id}/presentation.json`:`/brands/${brand.id}/tokens.${mode}.json`}>Vertrag als JSON <ArrowUpRight size={13} aria-hidden="true"/></a></div></div>
 {!ownToc.has(section)&&<PageToc key={section} initial={toc}/>}
 {section==='overview'&&<><div className="metrics"><div><strong>{componentNames.length}</strong><span>UI-Module</span></div><div><strong>{Object.keys(colors).length}</strong><span>Farbrollen pro Modus</span></div><div><strong>{deckCatalog.slides}</strong><span>Folientypen</span></div><div><strong>{deckCatalog.presets}</strong><span>Deck-Presets</span></div></div>
 <div className="entry-grid">{pages.filter(p=>['tokens','components','praesentation','icons','techstack','agenten'].includes(p.id)).map(p=><Link href={themed(p.id)} key={p.id}><span className="eyebrow">{p.group}</span><h2>{p.title}<ArrowUpRight size={20} aria-hidden="true"/></h2><p>{describe(p.id)}</p></Link>)}</div>
 <section className="doc-section" id={fixedSections.overview[0].id}><AnchoredHeading id={fixedSections.overview[0].id}>{fixedSections.overview[0].label}</AnchoredHeading><p>Der Brand-Wechsel aktualisiert Navigation, Komponenten und Präsentationen gemeinsam. Atlas bestimmt Struktur und Muster. Gelieferte CI-Vorgaben bestimmen die Markenidentität.</p></section></>}
 {section==='tokens'&&<><div className="download-row"><a href={`/brands/${brand.id}/tokens.${mode}.json`}>JSON</a><a href={`/brands/${brand.id}/tokens.${mode}.css`}>CSS Custom Properties</a><a href={`/brands/${brand.id}/tokens.${mode}.dtcg.json`}>DTCG</a></div><Tabs defaultValue="semantic"><TabsList><TabsTrigger value="semantic">Farbrollen</TabsTrigger><TabsTrigger value="foundation">Skalen</TabsTrigger><TabsTrigger value="contrast">Kontraste</TabsTrigger></TabsList><TabsContent value="semantic"><Input aria-label="Token suchen" value={query} placeholder="Token suchen …" onChange={e=>setQuery(e.target.value)}/><div className="token-grid">{Object.entries(colors).filter(([k])=>k.includes(query.toLowerCase())).map(([key,value])=><button className="token-card" key={key} onClick={()=>copy(`var(--${key})`)} title="CSS-Variable kopieren"><div className="swatch" style={{background:value}}/><code>--{key}</code><span>{value}</span></button>)}</div></TabsContent><TabsContent value="foundation">{Object.entries(tokens).filter(([,v])=>typeof v==='object').map(([group,values])=><section className="doc-section" id={slug(group)} key={group}><AnchoredHeading id={slug(group)}>{group}</AnchoredHeading><div className="token-table">{Object.entries(values as Record<string,string|number>).map(([k,v])=><button key={k} onClick={()=>copy(`var(--${group.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}-${k})`)}><code>{k}</code><span>{v}</span></button>)}</div></section>)}</TabsContent><TabsContent value="contrast"><div className="data-table"><table><thead><tr><th>Vordergrund</th><th>Hintergrund</th><th>Verhältnis</th><th>AA Text</th></tr></thead><tbody>{[['foreground','background'],['muted-foreground','muted'],['primary-foreground','primary'],['primary-hover-foreground','primary-hover'],['success-foreground','success'],['warning-foreground','warning'],['destructive-foreground','destructive']].map(([fg,bg])=><tr key={fg}><td>{fg}</td><td>{bg}</td><td>{contrast(colors[fg],colors[bg]).toFixed(2)}:1</td><td>{contrast(colors[fg],colors[bg])>=4.5?'Bestanden':'Prüfen'}</td></tr>)}</tbody></table></div></TabsContent></Tabs><p role="status" className="copy-status">{copied}</p></>}
 {section==='typography'&&<><div className="notice">{brand.typography.family} · Text {brand.typography.bodyWeight} · Titel {brand.typography.headingWeight}</div>{Object.entries(tokens.fontSize as Record<string,string>).map(([role,size])=><div className="type-row" key={role}><code>{role}<small>{size}</small></code><span style={{fontSize:size,fontWeight:brand.typography.headingWeight}}>Klare Aussagen. Präzise Hierarchie.</span></div>)}<section className="doc-section" id={fixedSections.typography[0].id}><AnchoredHeading id={fixedSections.typography[0].id} label="Präsentationen">{fixedSections.typography[0].label}</AnchoredHeading><p>Die PPT-Skala ist auf das Folienraster vermessen. Die Brand liefert Schriftfamilie und Gewichte. Ihre Grösse wird auf der Folie massstabsgetreu angewendet.</p><div className="token-table">{Object.entries(deckScale).map(([k,v])=><div key={k}><code>{k}</code><span>{v.pt} pt · {v.weight}</span></div>)}</div></section></>}
 {section==='layout'&&<><section className="doc-section" id="abstandsskala"><AnchoredHeading id="abstandsskala">Abstandsskala</AnchoredHeading>{Object.entries(tokens.spacing as Record<string,string>).map(([key,value])=><div className="spacing-row" key={key}><code>space-{key}</code><div style={{width:value}}/><span>{value}</span></div>)}</section><section className="doc-section" id="shell-geometrie"><AnchoredHeading id="shell-geometrie">Shell-Geometrie</AnchoredHeading><div className="token-table">{Object.entries(tokens.layout).map(([k,v])=><div key={k}><code>{k}</code><span>{String(v)}</span></div>)}</div></section><section className="doc-section" id="responsives-raster"><AnchoredHeading id="responsives-raster">Responsives Raster</AnchoredHeading><div className="grid-demo">{Array.from({length:12},(_,i)=><div key={i}>{i+1}</div>)}</div><p>12 Spalten. Inhalt maximal {tokens.layout.content}, Lesebreite {tokens.layout.reading}. Abstandsskalen sind neutrale Ergänzungen; Brand-Overrides bleiben möglich.</p></section></>}
 {section==='icons'&&<IconGallery/>}
 {section==='mermaid'&&<MermaidShowcase/>}
 {section==='brand'&&<BrandShowcase/>}
 {section==='infografik'&&<ChangelogInfographic/>}
 {section==='organigramm'&&<OrgchartEditor/>}
 {(section==='components'||section==='feedback')&&<><div className="component-index">{componentNames.map(n=>componentPages[n]?<Link key={n} href={themed(componentPages[n])} prefetch={false}>{n}</Link>:<span key={n}>{n}</span>)}</div><p className="muted">Import: <code>{"import { Button } from '@rapold/framework-core'"}</code> plus <code>@rapold/framework-core/styles.css</code>. Verwendung und Varianten jeder Komponente: <a href="/contracts/components.md">Komponentenvertrag</a>.</p><ComponentDemo/></>}
 {sectionDemos[section]&&<div className="notice">Aus RadioX übernommen und neutralisiert. Im Original-Look von radiox.cloud: <Link href={`${href(section)}?brand=radiox`} prefetch={false}>mit der Brand RadioX ansehen</Link>.</div>}
 {sectionDemos[section]&&(()=>{const Demo=sectionDemos[section];return <Demo/>;})()}
 {section==='motion'&&<><div className="notice">Bewegung unterstützt Orientierung. Bei prefers-reduced-motion werden Animationen unterdrückt.</div><Button onClick={()=>setMotionKey(k=>k+1)}><Play size={16} aria-hidden="true"/>Beispiele abspielen</Button><div className="motion-grid" key={motionKey}>{['fast','normal','slow'].map(k=><div key={k}><div className="motion-sample" style={{animationDuration:tokens.duration[k]}}/><h2>{k}</h2><code>{tokens.duration[k]}</code></div>)}</div><div className="token-table">{Object.entries(tokens.easing).map(([k,v])=><div key={k}><code>{k}</code><span>{String(v)}</span></div>)}</div></>}
 {section==='tables'&&<TableShowcase/>}
 {section==='dashboard'&&<DataShowcase section={section}/>}
 {section==='charts'&&<Tabs defaultValue="recharts"><TabsList aria-label="Diagrammbibliothek"><TabsTrigger value="recharts">Recharts</TabsTrigger><TabsTrigger value="echarts">Apache ECharts</TabsTrigger></TabsList><TabsContent value="recharts"><DataShowcase section="charts"/></TabsContent><TabsContent value="echarts"><EChartsShowcase/></TabsContent></Tabs>}
 {['toasts','empty-states','skeletons','lightbox','forms','auth-flow','login-pattern','mail-templates','prompt-compiler','prompt-vorlagen','health-status','marketing-hero'].includes(section)&&<PatternShowcase section={section}/>}
 {pageGuidance&&pageGuidance.sections.map(s=>{const id=slug(s.title);return <section key={id} id={id} className="doc-section"><AnchoredHeading id={id}>{s.title}</AnchoredHeading><p>{s.body}</p>{s.items&&<ul>{s.items.map(x=><li key={x}>{x}</li>)}</ul>}</section>;})}
 {section==='engineering'&&<div className="download-row"><a href="/contracts/engineering.md">Vollständiger Engineering-Vertrag</a><a href="https://github.com/marcelrapold/mra-atlas/blob/main/CHANGELOG.md">Changelog</a></div>}
 {section==='agenten'&&<AgentenSection/>}
 <Pager section={section} brandId={brand.id}/>
 </>;
}
