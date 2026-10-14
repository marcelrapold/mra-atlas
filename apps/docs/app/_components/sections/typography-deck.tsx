'use client';
// Loaded on /typography only: keeps the presentation contract out of the shared reference chunk.
import {presentationTheme} from '../../../../../packages/brands/src/presentation.mjs';
import {useActiveBrand} from '../framework-shell';
import {AnchoredHeading} from '../page-toc';
import {slug} from '../catalog';
const ID=slug('Präsentationen');
export default function TypographyDeck(){
 const {brand}=useActiveBrand();const scale=presentationTheme(brand).typography.scale;
 return <section className="doc-section" id={ID}><AnchoredHeading id={ID}>Präsentationen: {Object.keys(scale).length} vermessene Rollen</AnchoredHeading><p>Die PPT-Skala ist auf das Folienraster vermessen. Die Brand liefert Schriftfamilie und Gewichte. Ihre Grösse wird auf der Folie massstabsgetreu angewendet.</p><div className="token-table">{Object.entries(scale).map(([k,v]:[string,any])=><div key={k}><code>{k}</code><span>{v.pt} pt · {v.weight}</span></div>)}</div></section>;
}
