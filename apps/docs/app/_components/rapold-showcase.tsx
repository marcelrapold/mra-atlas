'use client';

import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {Check, Copy, Download, ExternalLink, RefreshCw} from 'lucide-react';
import identity from '../../../../brands/rapold/identity.json';
import {useActiveBrand} from './framework-shell';
import RapoldWorlds from './rapold-worlds';

type Product = typeof identity.products[number];
type Variant = keyof Product['variants'];
type Asset = {id: string; path: string; url: string; product: string; category: string; format: string; variant: string; width: number | null; height: number | null; bytes: number; layout?: string};
type AssetManifest = {brandId: string; schemaVersion: number; assets: Asset[]};
const base = identity.publicBase;
const categories: Record<string, string> = {'all': 'Alle Dateien', 'logo': 'Logos', 'favicon': 'Favicons', 'app-icon': 'App-Icons', 'banner': 'Banner', 'web-manifest': 'Web-Manifest', 'documentation': 'Anwendungshinweise', 'bundle': 'Komplettpaket'};
const variantLabels: Record<string, string> = {'dark': 'Dunkle Fläche', 'light': 'Helle Fläche', 'mono-white': 'Weiss', 'mono-black': 'Schwarz', 'current-color': 'currentColor', 'adaptive': 'Automatisch', 'maskable': 'Maskable', 'app': 'App', 'web': 'Web', 'usage': 'Anleitung', 'complete': 'Komplett'};
const layouts = [{id: 'og', name: 'Link-Vorschau', size: '1200 × 630'}, {id: 'landscape', name: 'Querformat', size: '1920 × 1080'}, {id: 'portrait', name: 'Hochformat', size: '1080 × 1920'}, {id: 'social-square', name: 'Quadrat', size: '1080 × 1080'}, {id: 'portrait-4x5', name: 'Social 4:5', size: '1080 × 1350'}, {id: 'wide', name: 'Breites Banner', size: '1584 × 396'}];
const familyGroups = [
  {status: 'approved', title: 'Freigegebene Signets', note: 'Raumfalten-Familie, freigegeben am 11. und 12.10.2026.', products: identity.products.filter(item => item.status === 'approved')},
  {status: 'proposal', title: 'Vorschläge', note: 'Aus den bestehenden Produktzeichen abgeleitet, noch nicht freigegeben.', products: identity.products.filter(item => item.status === 'proposal')},
];
const matrixVariants: Variant[] = ['dark', 'light', 'mono-white', 'mono-black'];
const fileSize = (bytes: number) => new Intl.NumberFormat('de-CH', {maximumFractionDigits: 1}).format(bytes / 1024) + ' KB';

function readManifest(value: unknown): AssetManifest {
  if (!value || typeof value !== 'object') throw new Error('Invalid manifest');
  const document = value as AssetManifest;
  if (document.brandId !== identity.brandId || document.schemaVersion !== 1 || !Array.isArray(document.assets) || !document.assets.length) throw new Error('Invalid manifest');
  for (const asset of document.assets) {
    if (typeof asset.url !== 'string' || !asset.url.startsWith(base + 'exports/') || asset.url.includes('..') || typeof asset.id !== 'string' || typeof asset.path !== 'string' || typeof asset.bytes !== 'number') throw new Error('Invalid asset');
  }
  return document;
}

export default function RapoldShowcase() {
  const {mode} = useActiveBrand();
  const [productId, setProductId] = useState(identity.products[0].id);
  const [layout, setLayout] = useState('og');
  const [category, setCategory] = useState('all');
  const [format, setFormat] = useState('all');
  const [limit, setLimit] = useState(12);
  const [manifest, setManifest] = useState<AssetManifest | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [copyStatus, setCopyStatus] = useState('');
  const [wordmarkTreatment, setWordmarkTreatment] = useState<'cut' | 'spectrum'>('cut');
  const previewHeading = useRef<HTMLHeadingElement>(null);
  const copyVersion = useRef(0);
  useEffect(() => {copyVersion.current += 1; setCopyStatus('');}, [mode, productId]);
  const product = identity.products.find(item => item.id === productId) ?? identity.products[0];

  useEffect(() => {
    const controller = new AbortController();
    setLoadState('loading');
    fetch(base + 'assets-manifest.json', {signal: controller.signal})
      .then(response => {if (!response.ok) throw new Error('Manifest unavailable'); return response.json();})
      .then(value => {setManifest(readManifest(value)); setLoadState('ready');})
      .catch(() => {if (!controller.signal.aborted) setLoadState('error');});
    return () => controller.abort();
  }, [attempt]);

  const selectProduct = (id: string) => {setProductId(id); setLimit(12); setCopyStatus('');};
  const copy = async (value: string, label: string) => {
    const version = ++copyVersion.current;
    try {await navigator.clipboard.writeText(value); if (copyVersion.current === version) setCopyStatus(`${label} kopiert.`);}
    catch {if (copyVersion.current === version) setCopyStatus('Kopieren ist hier nicht verfügbar. Markiere den sichtbaren Wert und kopiere ihn manuell.');}
  };
  const assets = manifest?.assets.filter(item => item.product === product.id) ?? [];
  const filtered = assets.filter(item => (category === 'all' || item.category === category) && (format === 'all' || item.format === format));
  const bannerMode = (layout === 'og' || layout === 'landscape') ? mode : 'dark';
  const preview = assets.find(item => item.category === 'banner' && item.layout === layout && item.variant === bannerMode && item.format === 'png');
  const vectorPreview = assets.find(item => item.category === 'banner' && item.layout === layout && item.variant === bannerMode && item.format === 'svg');
  const bundle = assets.find(item => item.category === 'bundle');
  const snippet = `<div class="product-identity">\n  <img src="${base + product.variants[mode]}"\n       width="32" height="32" alt="" />\n  <span>${product.name}</span>\n</div>`;

  return <div className="rapold-showcase" data-wordmark={wordmarkTreatment}>
    <section className="rapold-intro" aria-labelledby="rapold-family-title">
      <div><p className="eyebrow">Rapold / Raumfalten</p><h2 id="rapold-family-title">Eine Familie.<br/><span>Viele Perspektiven.</span></h2><p>Gemeinsame Farbe, Typografie und Geometrie. Jedes Produkt trägt ein eigenes Zeichen.</p></div>
      <div className="rapold-intro-meta"><strong>01—{String(identity.products.length).padStart(2, '0')}</strong><span>Signets als reine Vektoren</span><span>Geist + Geist Mono</span><span>Hell / Dunkel / Monochrom</span></div>
    </section>

    {familyGroups.filter(group => group.products.length).map(group => <div className="rapold-family-group" key={group.status}>
      <h3 className="rapold-family-heading" id={`rapold-family-${group.status}`}>{group.title}<span>{group.note}</span></h3>
      <div className="rapold-family" data-status={group.status} role="group" aria-labelledby={`rapold-family-${group.status}`}>
        {group.products.map(item => <button type="button" className="rapold-product" key={item.id} aria-pressed={item.id === product.id} onClick={() => selectProduct(item.id)}>
          <span className="rapold-product-number">{String(identity.products.indexOf(item) + 1).padStart(2, '0')}{item.status === 'proposal' && <span className="rapold-product-status">{identity.statusLabels.proposal}</span>}{item.id === product.id && <Check size={18} aria-label="Ausgewählt"/>}</span>
          <img src={base + item.variants[mode]} width={128} height={128} alt=""/>
          <span className="rapold-wordmark">{item.shortName}</span>
          <span className="rapold-product-domain">{item.domain ?? 'Produktzeichen'}</span>
        </button>)}
      </div>
    </div>)}
    <p className="rapold-selection" role="status">Ausgewählt: <strong>{product.name}</strong> · {identity.statusLabels[product.status as keyof typeof identity.statusLabels]}. {product.purpose}</p>
    {product.status === 'proposal' && 'origin' in product && product.origin && <p className="muted">Vorschlag auf Basis des bisherigen Zeichens in {product.origin.repository} ({product.origin.previousMark}). Das Produkt verwendet sein bisheriges Zeichen, bis die Freigabe dokumentiert ist.</p>}
    {'namingNote' in product && <p className="muted">{product.name}: {product.namingNote}.</p>}

    <nav className="rapold-section-links" aria-label="Markenreferenz"><a href="#rapold-all-signets">Alle Zeichen</a><a href="/contracts/produkte-einbinden.md">Einbindungsanleitung</a><a href="#rapold-worlds">Produktwelten</a><a href="#rapold-signets">Signets</a><a href="#rapold-formats">Formate</a><a href="#rapold-colours">Farbe & Schrift</a><a href="#rapold-downloads">Downloads</a><a href="#rapold-usage">Einbindung</a></nav>

    <section className="doc-section" id="rapold-all-signets" aria-labelledby="rapold-all-signets-title">
      <h2 id="rapold-all-signets-title">Alle Zeichen auf einen Blick</h2><p>{identity.products.length} Signets in allen Varianten. Ein Klick lädt das jeweilige SVG; Produktpakete stehen weiter unten bei den Downloads.</p>
      <div className="rapold-signet-matrix" tabIndex={0} role="region" aria-label="Alle Signets, horizontal scrollbar"><table>
        <caption className="sr-only">Alle Rapold-Signets nach Variante</caption>
        <thead><tr><th scope="col">Produkt</th>{matrixVariants.map(variant => <th scope="col" key={variant}>{variantLabels[variant]}</th>)}</tr></thead>
        <tbody>{identity.products.map(item => <tr key={item.id} aria-current={item.id === product.id ? 'true' : undefined}>
          <th scope="row"><button type="button" className="rapold-matrix-product" onClick={() => selectProduct(item.id)}><span className="rapold-wordmark">{item.shortName}</span><small>{item.domain ?? 'Produktzeichen'}</small></button></th>
          {matrixVariants.map(variant => <td key={variant}><a className="rapold-matrix-cell" data-artwork-mode={variant === 'dark' || variant === 'mono-white' ? 'dark' : 'light'} href={base + item.variants[variant]} download aria-label={`${item.name}, ${variantLabels[variant]}, SVG herunterladen`}><img src={base + item.variants[variant]} width={64} height={64} alt=""/></a></td>)}
        </tr>)}</tbody>
      </table></div>
    </section>

    <RapoldWorlds productId={product.id} onProductChange={selectProduct} wordmarkTreatment={wordmarkTreatment} onWordmarkChange={setWordmarkTreatment}/>

    <section className="doc-section" id="rapold-signets">
      <h2>Das Zeichen in jeder Umgebung</h2><p>Alle Varianten verwenden dieselben Pfade und Proportionen. Die Produktnamen bleiben editierbarer Text ausserhalb der SVGs.</p>
      <div className="rapold-variant-grid">{(['dark', 'light', 'mono-white', 'mono-black'] as Variant[]).map(variant => <figure key={variant}>
        <div className="rapold-artwork" data-artwork-mode={variant === 'dark' || variant === 'mono-white' ? 'dark' : 'light'}><img src={base + product.variants[variant]} width={152} height={152} alt={`${product.name} · ${variantLabels[variant]}`}/></div>
        <figcaption><span>{variantLabels[variant]}</span><a href={base + product.variants[variant]} download aria-label={`${product.name}, ${variantLabels[variant]}, SVG herunterladen`}><Download size={16} aria-hidden="true"/>SVG</a></figcaption>
      </figure>)}</div>
      <div className="rapold-rules"><div className="rapold-clearspace" aria-label="Zeichenfläche mit 24 Einheiten Schutzraum"><img src={base + product.variants[mode]} width={192} height={192} alt=""/></div><div><h3>Raum gehört zum Zeichen.</h3><p>Mindestens {identity.geometry.clearSpaceUnits} Einheiten Schutzraum innerhalb der 256er Zeichenfläche. Die transparenten Ränder bleiben erhalten. Für die Oberfläche beginnt die Zeichenfläche bei {identity.geometry.minimumUiCanvasPx} px; die separaten Favicons decken kleinere Grössen ab.</p><p>Proportional skalieren, die Facetten unverändert verwenden und auf ruhigen Flächen platzieren.</p><a href={base + product.variants['current-color']} download>currentColor-SVG herunterladen</a></div></div>
    </section>

    <section className="doc-section" id="rapold-formats">
      <div className="rapold-section-heading"><div><h2 ref={previewHeading} tabIndex={-1}>Von der Registerkarte bis zum Banner</h2><p>Die Vorschau zeigt die tatsächlichen Exportdateien.</p></div><label>Format<select value={layout} onChange={event => setLayout(event.target.value)}>{layouts.map(item => <option key={item.id} value={item.id}>{item.name} · {item.size}</option>)}</select></label></div>
      {loadState === 'loading' && <p role="status" className="rapold-load-state">Exportvorschau wird geladen …</p>}
      {loadState === 'error' && <div className="rapold-load-state" role="alert"><p>Die Exportliste konnte nicht geladen werden. Die SVG-Master oben bleiben verfügbar.</p><button type="button" onClick={() => {previewHeading.current?.focus(); setAttempt(value => value + 1);}}><RefreshCw size={16} aria-hidden="true"/>Erneut laden</button></div>}
      {loadState === 'ready' && preview && <figure className="rapold-banner-preview"><div data-layout={layout}><img src={preview.url} width={preview.width!} height={preview.height!} alt={`${product.name} · ${layouts.find(item => item.id === layout)?.name} · ${variantLabels[bannerMode]}`}/></div><figcaption><span>{preview.width} × {preview.height} px · {variantLabels[bannerMode]}</span><span><a href={preview.url} download>PNG herunterladen</a>{vectorPreview && <a href={vectorPreview.url} download>SVG herunterladen</a>}</span></figcaption></figure>}
      {loadState === 'ready' && !preview && <p role="status">Für diese Kombination ist keine Vorschau vorhanden. Die verfügbaren Dateien stehen im Downloadbereich.</p>}
      {bannerMode !== mode && <p className="muted">Dieses Format ist als dunkle Markenfläche gestaltet. Helle Fassungen sind für Link-Vorschau und Querformat vorhanden.</p>}
      <div className="rapold-icon-strip"><div className="rapold-icon-sizes">{[16, 32, 48].map(size => <figure key={size}><img src={`${base}exports/${product.id}/icons/favicon-${size}x${size}.png`} width={size} height={size} alt={`${product.name} Favicon ${size} Pixel`}/><figcaption>{size} px</figcaption></figure>)}</div><figure><img src={`${base}exports/${product.id}/icons/apple-touch-icon.png`} width={80} height={80} alt={`${product.name} Apple Touch Icon`}/><figcaption>Apple Touch · 180 px</figcaption></figure><figure><img src={`${base}exports/${product.id}/icons/maskable-icon-512x512.png`} width={80} height={80} alt={`${product.name} Maskable Icon`}/><figcaption>Maskable · 192 / 512 px</figcaption></figure></div>
    </section>

    <section className="doc-section" id="rapold-colours">
      <h2>Farbe mit Funktion. Schrift mit Charakter.</h2><p>Die Identitätsfarben bestimmen die Signets. Text, Fokus, Aktionen und Status verwenden daraus abgeleitete semantische Rollen für die jeweilige Darstellung.</p>
      <div className="rapold-palette">{Object.entries(identity.palette).map(([name, color]) => <button type="button" key={name} onClick={() => copy(color, identity.paletteLabels[name as keyof typeof identity.paletteLabels])} aria-label={`${identity.paletteLabels[name as keyof typeof identity.paletteLabels]} ${color} kopieren`}><span style={{background: color}}/><strong>{identity.paletteLabels[name as keyof typeof identity.paletteLabels]}</strong><code>{color}</code></button>)}</div>
      <div className="rapold-wordmark-specimen"><div><p className="eyebrow">Geist / 700 / −0.052 em</p><h3>Farbe gehört zum Namen.</h3></div><div className="rapold-wordmark-options" role="group" aria-label="Farbbehandlung der Wortmarken"><button type="button" aria-pressed={wordmarkTreatment === 'cut'} onClick={() => setWordmarkTreatment('cut')}>Facetten</button><button type="button" aria-pressed={wordmarkTreatment === 'spectrum'} onClick={() => setWordmarkTreatment('spectrum')}>Spektrum</button></div><p className="rapold-wordmark rapold-wordmark-large">{product.name}</p><p>Der diagonale Farbwechsel greift die Raumfalte auf. Das Spektrum ist die lebendigere Fassung für grosse digitale Anwendungen. Lesetext bleibt ruhig und kontrastreich.</p><a href={base + 'wordmarks.css'} download>Wortmarken-CSS herunterladen</a></div>
      <div className="rapold-type"><div><p className="eyebrow">Geist / 650</p><p className="rapold-type-display">Verbindungen<br/><span>schaffen.</span></p><p>Klare Hierarchie, farbige Akzente und ruhiger Mengentext.</p></div><div className="rapold-type-mono"><p className="eyebrow">Geist Mono / 400</p><p>ÆON / ARGUS<br/>FABRIC / EDGE<br/>0123456789<br/>ä ö ü & →</p><span>Für Code, Messwerte und technische Kennungen.</span></div></div>
      <div className="download-row"><Link href="/tokens?brand=rapold">Semantische Tokens</Link><Link href="/typography?brand=rapold">Typografieskala</Link><a href={base + identity.fonts.stylesheet}>Lokales Font-CSS</a><a href={base + identity.fonts.licenseFiles[0]}>Schriftlizenz · OFL</a></div>
      <p className="copy-status" role="status">{copyStatus}</p>
    </section>

    <section className="doc-section" id="rapold-downloads">
      <div className="rapold-section-heading"><div><h2>Alle Assets für {product.name}</h2><p>Einzeldateien oder das vollständige Produktpaket.</p></div>{bundle && <a className="rapold-primary-action" href={bundle.url} download><Download size={18} aria-hidden="true"/>Produktpaket · ZIP</a>}</div>
      <div className="rapold-filters"><label>Produkt<select value={product.id} onChange={event => selectProduct(event.target.value)}>{identity.products.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Kategorie<select value={category} onChange={event => {setCategory(event.target.value); setLimit(12);}}>{Object.entries(categories).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><label>Dateityp<select value={format} onChange={event => {setFormat(event.target.value); setLimit(12);}}>{['all', 'svg', 'png', 'ico', 'webmanifest', 'txt', 'zip'].map(item => <option key={item} value={item}>{item === 'all' ? 'Alle Dateitypen' : item.toUpperCase()}</option>)}</select></label></div>
      <p role="status" className="muted">{loadState === 'ready' ? `${filtered.length} Dateien für diese Auswahl, ${Math.min(limit, filtered.length)} angezeigt.` : loadState === 'loading' ? 'Dateiliste wird geladen …' : 'Dateiliste derzeit nicht verfügbar; oben erneut laden.'}</p>
      {loadState === 'ready' && filtered.length > 0 && <><div className="rapold-assets-table" tabIndex={0} role="region" aria-label="Downloadtabelle, horizontal scrollbar"><table><caption className="sr-only">Dateien für {product.name}</caption><thead><tr><th scope="col">Datei</th><th scope="col">Variante</th><th scope="col">Abmessungen</th><th scope="col">Download</th></tr></thead><tbody>{filtered.slice(0, limit).map(item => <tr key={item.id}><td><strong>{categories[item.category] ?? item.category}</strong><code>{item.path.split('/').at(-1)}</code></td><td>{variantLabels[item.variant] ?? item.variant}</td><td>{item.width && item.height ? `${item.width} × ${item.height}` : '—'}</td><td><a href={item.url} download aria-label={`${item.path.split('/').at(-1)} herunterladen`}><Download size={16} aria-hidden="true"/>{item.format.toUpperCase()}<span>{fileSize(item.bytes)}</span></a></td></tr>)}</tbody></table></div>{filtered.length > 12 && <button className="rapold-more" type="button" aria-disabled={limit >= filtered.length} onClick={() => {if (limit < filtered.length) setLimit(value => value + 12);}}>{limit < filtered.length ? `Weitere Dateien anzeigen (${filtered.length - limit} verbleibend)` : 'Alle Dateien angezeigt'}</button>}</>}
      {loadState === 'ready' && !filtered.length && <div className="rapold-load-state"><p>Keine Dateien für diese Kombination. Wähle eine andere Kategorie oder einen anderen Dateityp.</p></div>}
    </section>

    <section className="doc-section" id="rapold-usage"><h2>In dein Produkt einbauen</h2><p className="notice">Schritt für Schritt mit Favicon, Manifest, Tokens und Schrift: <a href="/contracts/produkte-einbinden.md">Vollständige Einbindungsanleitung</a>.</p><p>Zeichen und Name sind getrennte Elemente. Ist der Name direkt daneben sichtbar, erhält das Bild einen leeren Alternativtext. Ein alleinstehendes Zeichen braucht den Produktnamen als Alternativtext.</p><pre><code>{snippet}</code></pre><button type="button" className="rapold-copy" onClick={() => copy(snippet, 'HTML-Beispiel')}><Copy size={16} aria-hidden="true"/>HTML kopieren</button><p className="muted">Die currentColor-Fassung als Inline-SVG verwenden, damit sie CSS-Farbe erbt. Ein externes SVG im img-Element erbt die Textfarbe seiner Umgebung nicht.</p><div className="download-row"><a href={base + 'identity.json'}>Produktkatalog · JSON</a><a href={base + 'assets-manifest.json'}>Assetmanifest · JSON</a><a href={base + 'brand.json'}>Brand-Vertrag · JSON</a><a href={base + 'DESIGN.md'}>Gestaltungsregeln</a><Link href="/praesentation?brand=rapold">Präsentationsvorlagen</Link>{product.domain && <a href={`https://${product.domain}`}><ExternalLink size={14} aria-hidden="true"/>{product.domain}</a>}</div></section>
  </div>;
}
