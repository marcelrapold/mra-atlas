'use client';
import Link from 'next/link';
import {Layers,Download} from 'lucide-react';
import SygnumShowcase from './sygnum-showcase';
import RapoldShowcase from './rapold-showcase';
import {useActiveBrand} from './framework-shell';

export default function BrandShowcase() {
  const {brand}=useActiveBrand();
  if(brand.id==='sygnum')return <SygnumShowcase/>;
  if(brand.id==='rapold')return <RapoldShowcase/>;
  const goldbach=brand.id==='goldbach';
  return <>
    <section className="active-brand-card" aria-label="Aktives Theme">
      <div className="active-brand-mark">{brand.assets?.logo?<img src={`/${brand.assets.logo.path}`} width={168} height={29} alt={`${brand.name}-Logo`}/>:<Layers size={32} aria-hidden="true"/>}</div>
      <div><p className="eyebrow">Aktives Theme</p><h2>{brand.id==='neutral'?'Default-Preset':`${brand.name}-Theme`}</h2><p>{goldbach?'Passion Red · Inter · Original-Assets':`${brand.name} · ${brand.modes.dark?'Hell und Dunkel':'Hell'}`}</p></div>
    </section>
    {goldbach?<>
      <section className="doc-section" id="logos"><h2>Original-Logo und Varianten</h2><p>Die Wortmarke stammt direkt aus deinem Design-Paket. Alle Varianten behalten die Original-Pfade und Proportionen bei.</p>
        <div className="brand-logo-grid">{[
          ['logo.svg','Passion Red auf Weiss','Standard auf hellem Hintergrund','#ffffff'],
          ['logo-white.svg','Weiss auf Passion Red','Hauptvariante für Kampagnen','#b61f34'],
          ['logo-black.svg','Schwarz auf Weiss','Zurückhaltend auf Inhaltsseiten','#ffffff'],
          ['logo-white.svg','Weiss auf Schwarz','Für dunkle Hintergründe','#000000'],
        ].map(([file,title,description,background])=><article className="brand-logo-card" key={title}>
          <div className="brand-logo-stage" style={{background}}><img src={`/brands/goldbach/${file}`} width={283} height={48} alt={`Goldbach-Logo · ${title}`}/></div>
          <div className="brand-logo-caption"><h3>{title}</h3><p>{description}</p><a href={`/brands/goldbach/${file}`} download><Download size={14}/>SVG herunterladen</a></div>
        </article>)}</div>
        <p className="muted">Schutzraum auf allen Seiten: mindestens eine H-Höhe. Digitale Mindestbreite: 75 px. Das Logo proportional skalieren und als SVG einsetzen.</p>
      </section>
      <section className="doc-section"><h2>Farben und Typografie</h2><div className="brand-colours">{[['Passion Red','#b61f34'],['Weiss','#ffffff'],['Schwarz','#000000'],['Black Soft 1','#575757'],['Background Light','#f2f2f2']].map(([name,color])=><div key={name}><span style={{background:color}}/><strong>{name}</strong><code>{color}</code></div>)}</div><div className="brand-type-sample"><p>Inter Light · 300</p><span>Menschen verbinden.<br/>Ideen sichtbar machen.</span><p>Inter Bold · 700</p><strong>Eine klare Aussage.</strong></div></section>
      <section className="doc-section"><h2>Vorlagen und Gestaltungsvorgaben</h2><p>Website, Diagramme und Präsentationen verwenden dieselbe Brand. Die PowerPoint-Vorlagen enthalten das Original-Logo.</p><div className="download-row"><Link href="/praesentation">Präsentationsgalerie</Link><a href="/brands/goldbach/decks/muster-deck.pptx" download>Goldbach · Muster-Deck · PPTX</a><a href="/brands/goldbach/reference/muster-deck.pdf" download>Muster-Deck · PDF</a><a href="/brands/goldbach/DESIGN.md">DESIGN.md</a><a href="/brands/goldbach/IMAGERY.md">IMAGERY.md</a><a href="/brands/goldbach/rules.md">Adapter-Regeln</a></div><p className="muted">Das gelieferte ZIP enthält die Gestaltungs- und Bildrichtlinien. Fotografien, ein separater Firmen-Icon-Satz und Original-Folienmaster sind darin nicht enthalten.</p></section>
    </>:brand.id==='neutral'?<section className="doc-section"><h2>Die neutrale Basis</h2><p>Das Default-Preset verwendet die neutralen Framework-Tokens, unterstützt Hell und Dunkel und enthält keine Firmenlogos oder unternehmensspezifischen CI-Vorgaben.</p><div className="download-row"><Link href="/tokens">Default-Tokens</Link><Link href="/praesentation">Neutrale Präsentationsvorlagen</Link></div></section>:<section className="doc-section"><h2>{brand.name}: Farben und Vorlagen</h2><p>Die aktive Brand definiert semantische Rollen, Typografie und Formen. Der Adapter ist als CI-Entwurf gekennzeichnet.</p><div className="brand-colours">{Object.entries(brand.palette??{}).map(([name,color])=><div key={name}><span style={{background:color}}/><strong>{name}</strong><code>{color}</code></div>)}</div><div className="download-row"><Link href={`/tokens?brand=${brand.id}`}>Brand-Tokens</Link><Link href={`/praesentation?brand=${brand.id}`}>Präsentationsvorlagen</Link></div></section>}
    <div className="download-row"><a href={`/brands/${brand.id}/brand.json`}>Brand-Vertrag · JSON</a><a href={`/brand?brand=${brand.id}`}>Direktlink zu dieser Brand</a></div>
  </>;
}
