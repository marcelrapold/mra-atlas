'use client';
// Overview body. Loaded on / only: the slide and preset catalogs supply the counts, so they stay out of the shared reference chunk.
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {semanticTokens} from '@rapold/framework-brands';
import {slides,presets} from '../../../../../packages/brands/src/presentation.mjs';
import {useActiveBrand} from '../framework-shell';
import {pages,guidance,href,slug,componentNames} from '../catalog';
import {AnchoredHeading} from '../page-toc';
const BRAND_ID=slug('Eine Brand, alle Ausprägungen');
const ENTRIES=['tokens','components','praesentation','icons','techstack','agenten'];
export default function OverviewSection({descriptions}:{descriptions:Record<string,string>}){
 const {brand,mode}=useActiveBrand();const colors=semanticTokens(brand,mode);
 const describe=(id:string)=>id==='praesentation'?`${slides.length} Folientypen, ${presets.length} Deck-Presets und ein gemeinsames Fünf-Zonen-Gerüst. Mit vermessener Geometrie und prüfbarem Inhaltsvertrag.`:descriptions[id]??guidance[id]?.intro;
 const themed=(id:string)=>`${href(id)}?brand=${encodeURIComponent(brand.id)}`;
 return <><div className="metrics"><div><strong>{componentNames.length}</strong><span>UI-Module</span></div><div><strong>{Object.keys(colors).length}</strong><span>Farbrollen pro Modus</span></div><div><strong>{slides.length}</strong><span>Folientypen</span></div><div><strong>{presets.length}</strong><span>Deck-Presets</span></div></div>
 <div className="entry-grid">{pages.filter(p=>ENTRIES.includes(p.id)).map(p=><Link href={themed(p.id)} key={p.id}><span className="eyebrow">{p.group}</span><h2>{p.title}<ArrowUpRight size={20} aria-hidden="true"/></h2><p>{describe(p.id)}</p></Link>)}</div>
 <section className="doc-section" id={BRAND_ID}><AnchoredHeading id={BRAND_ID}>Eine Brand, alle Ausprägungen</AnchoredHeading><p>Der Brand-Wechsel aktualisiert Navigation, Komponenten und Präsentationen gemeinsam. Atlas bestimmt Struktur und Muster. Gelieferte CI-Vorgaben bestimmen die Markenidentität.</p></section></>;
}
