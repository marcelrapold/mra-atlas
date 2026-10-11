'use client';
import Link from 'next/link';
import {Layers} from 'lucide-react';
import RapoldShowcase from './rapold-showcase';
import {useActiveBrand} from './framework-shell';

export default function BrandShowcase() {
  const {brand}=useActiveBrand();
  if(brand.id==='rapold')return <RapoldShowcase/>;
  return <>
    <section className="active-brand-card" aria-label="Aktives Theme">
      <div className="active-brand-mark">{brand.assets?.logo?<img src={`/${brand.assets.logo.path}`} width={168} height={29} alt={`${brand.name}-Logo`}/>:<Layers size={32} aria-hidden="true"/>}</div>
      <div><p className="eyebrow">Aktives Theme</p><h2>{brand.id==='neutral'?'Default-Preset':`${brand.name}-Theme`}</h2><p>{brand.name} · {brand.modes.dark?'Hell und Dunkel':'Hell'}</p></div>
    </section>
    {brand.id==='neutral'?<section className="doc-section"><h2>Die neutrale Basis</h2><p>Das Default-Preset verwendet die neutralen Framework-Tokens, unterstützt Hell und Dunkel und enthält keine Firmenlogos oder unternehmensspezifischen CI-Vorgaben.</p><div className="download-row"><Link href="/tokens">Default-Tokens</Link><Link href="/praesentation">Neutrale Präsentationsvorlagen</Link></div></section>:<section className="doc-section"><h2>{brand.name}: Farben und Vorlagen</h2><p>Die aktive Brand definiert semantische Rollen, Typografie und Formen. Der Adapter ist als CI-Entwurf gekennzeichnet.</p><div className="brand-colours">{Object.entries(brand.palette??{}).map(([name,color])=><div key={name}><span style={{background:color}}/><strong>{name}</strong><code>{color}</code></div>)}</div><div className="download-row"><Link href={`/tokens?brand=${brand.id}`}>Brand-Tokens</Link><Link href={`/praesentation?brand=${brand.id}`}>Präsentationsvorlagen</Link></div></section>}
    <div className="download-row"><a href={`/brands/${brand.id}/brand.json`}>Brand-Vertrag · JSON</a><a href={`/brand?brand=${brand.id}`}>Direktlink zu dieser Brand</a></div>
  </>;
}
