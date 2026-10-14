'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Download,Pause,Play,Sparkles} from 'lucide-react';
import {Badge,Button,PlayButton,AiDisclosureBadge,Eyebrow,type PlayButtonState} from '@rapold/framework-core';
import {useActiveBrand} from './framework-shell';
import {href} from './catalog';
import RadioxMatrix from './radiox-matrix';

const base='/brands/radiox/assets/';
// One colour, one meaning (brands/radiox/DESIGN-DNA.md 2.2); values come from radiox.json → palette.
const signals:[key:string,label:string,role:string][]=[
 ['cyan','Akzent','Interaktion, Fokus, Links, Primärserie'],
 ['cyan-fill','Primär-Füllung','Gefüllte Primär-Buttons mit schwarzer Schrift'],
 ['onair','Live','Nur Live: genau ein pulsierender Punkt pro Ansicht'],
 ['ai','KI','Alles KI-Generierte, KI-Moderator ÆON'],
 ['community','Hörer','Hörer, Stimmen, «Du wählst»'],
 ['news','News','News und Quellen'],
 ['dna','Klang-DNA','Klang-DNA und Geschmack'],
 ['danger','Fehler','Fehler und Risiken, nie Live'],
 ['black','Bühne','#050505 auf jeder Fläche'],
 ['slate','Nebentext','Kleine Labels, Untergrenze für kleinen Text'],
];
const logos=[
 {file:'logos/wordmark-dark.svg',label:'Wortmarke · Aurora-X',surface:'dark'},
 {file:'logos/wordmark-mono-white.svg',label:'Wortmarke · Weiss',surface:'dark'},
 {file:'logos/icon-dark.svg',label:'RX-Zeichen · Aurora-X',surface:'dark',square:true},
 {file:'icons/app-icon-aurora-1024.webp',label:'App-Icon Aurora · 1024 px',surface:'dark',square:true},
 {file:'logos/wordmark-light.svg',label:'Wortmarke · hell (abgeleitet)',surface:'light'},
 {file:'logos/wordmark-mono-black.svg',label:'Wortmarke · Schwarz',surface:'light'},
 {file:'logos/icon-light.svg',label:'RX-Zeichen · hell (abgeleitet)',surface:'light',square:true},
 {file:'logos/icon-mono-white.svg',label:'RX-Zeichen · Weiss',surface:'dark',square:true},
];
const icons=[['icons/favicon-16x16.png','Favicon 16'],['icons/favicon-32x32.png','Favicon 32'],['icons/apple-touch-icon.png','Apple Touch 180'],['icons/android-chrome-192x192.png','Android 192'],['icons/android-chrome-512x512.png','Android 512']];
const recipes:[cls:string,title:string,text:string,spec:string][]=[
 ['rx-card','Karte','Inhalt. Kein Blur, kein Schatten.','black 25 % · white 10 % · 16 px'],
 ['rx-inset','Inset','Karte in Karte, Kacheln, Zeilen.','white 6 % · white 10 % · 12 px'],
 ['rx-glass-header','Header-Glas','Schwebende Kopfzeile.','black 50 % · blur 24 px · Linie white 10 %'],
 ['rx-glass-bar','Player-Bar','Leiste unten, Footer-Band im Deck.','black 85 % · blur 24 px · 0 −8px 30px'],
 ['rx-glass-chip','Chip über Cover','Hinweise auf Bildern.','black 60 % · blur 12 px · white 20 %'],
 ['rx-window','Fenster','Modal, im Deck einmal als Heldenpanel.','#0F151D 88 % · blur 20 px · 28 px'],
];
const motion:[string,string,string][]=[
 ['fast','150 ms','Farbe, Hover'],['base','250 ms','Struktur, Glow'],['slow','600 ms','Ruhige Fades'],['morph','420 ms','Player-Sheet ↔ Mini-Bar'],['scene','760 ms','Eintritt in /live'],['reduced','160 ms','nur Opazität'],
 ['ease.out','cubic-bezier(0.22, 1, 0.36, 1)','Standard'],['ease.ios','cubic-bezier(0.32, 0.72, 0, 1)','ganze Flächen'],
];
const decks:[file:string,label:string][]=[['cover-foto','Cover · Aurora, Wortmarke ohne Platte'],['kapitel-trenner','Kapitel · Aurora und X-Regen an den Rändern'],['modul-karten-mit-chart','Inhalt · Karten und Chart auf dem Desktop-Wash'],['kpi-board','KPI · Kacheln, Serien nach Signalbedeutung'],['foto-schluss','Abschluss · Wortmarke zentriert']];
const componentPages:[string,string][]=[['media','Medien'],['controls','Steuerelemente'],['status-tones','Status & Töne'],['notices','Hinweise & Protokolle'],['page-structure','Seitenaufbau'],['dialogs','Dialoge & Fehler']];

export default function RadioxShowcase(){
 const {brand}=useActiveBrand();
 const [running,setRunning]=useState(true);
 const [play,setPlay]=useState<PlayButtonState>('idle');
 const [copied,setCopied]=useState('');
 const palette=(brand.palette??{}) as Record<string,string>;
 async function copy(value:string,label:string){try{await navigator.clipboard.writeText(value);setCopied(`${label} ${value} kopiert.`);}catch{setCopied('Kopieren ist hier nicht verfügbar.');}}
 const aurora=<div className="rx-aurora" data-running={running} aria-hidden="true"><span/><span/><span/></div>;
 return <div className="rx-showcase">
  <section className="rx-hero" aria-labelledby="rx-hero-title">
   <RadioxMatrix running={running}/>
   {aurora}
   <div className="rx-hero-content">
    <div className="rx-hero-brand"><img src={`${base}icons/app-icon-aurora-1024.webp`} width={72} height={72} alt=""/><img className="rx-hero-wordmark" src={`${base}logos/wordmark-dark.svg`} width={158} height={44} alt="RadioX"/></div>
    <Eyebrow tone="primary">RadioX · Zürich · 2026</Eyebrow>
    <h2 id="rx-hero-title">Ein Radio, das sich selbst sendet.</h2>
    <p>KI-Radio mit News und Musik, rund um die Uhr. Eine schwarze Bühne, beleuchtet von Licht statt von Flächen: Aurora, Cyan-Glow und das Aurora-X im Logo.</p>
    <div className="rx-hero-row">
     <Badge tone="live" appearance="solid">Live</Badge>
     <AiDisclosureBadge/>
     <PlayButton label="Livestream abspielen" state={play} onPlay={()=>setPlay('playing')} onPause={()=>setPlay('paused')} size="lg"/>
     <Button>Jetzt live hören</Button>
    </div>
   </div>
   <button type="button" className="rx-motion-toggle rx-glass-chip" aria-pressed={!running} onClick={()=>setRunning(v=>!v)}>{running?<Pause size={16} aria-hidden="true"/>:<Play size={16} aria-hidden="true"/>}{running?'Hintergrund pausieren':'Hintergrund abspielen'}</button>
  </section>
  <p className="muted">Hintergrund: Port des RadioX-Matrix-Regens (fallende, aufleuchtende X in drei Tiefen) über der Marken-Aurora Cyan + Violett. Er läuft nur sichtbar und im aktiven Tab; bei «Bewegung reduzieren» erscheint ein Standbild, die Aurora steht still.</p>

  <section className="doc-section" id="rx-surfaces" aria-labelledby="rx-surfaces-title">
   <h2 id="rx-surfaces-title">Flächen und Glas</h2>
   <p>Flächen bleiben neutral und durchscheinend: Weiss mit 3, 6 oder 10 %, Schwarz mit 25 bis 85 %. Glas gibt es nur für schwebende Chrome-Elemente, nie für Inhaltskarten. Die Rezepte stehen als Klassen in <code>brands/radiox/theme.css</code>.</p>
   <div className="rx-stage rx-backdrop-wash">
    <div className="rx-recipes">{recipes.map(([cls,title,text,spec])=><div key={cls} className={`rx-recipe ${cls}`}><h3>{title}</h3><p>{text}</p><code>{spec}</code></div>)}</div>
    <div className="rx-orb-row" style={{marginTop:16}}>
     <button type="button" className="rx-orb rx-glass-play" aria-label="Glas-Play-Knopf (Beispiel)"><Play size={24} aria-hidden="true"/></button>
     <p className="muted" style={{margin:0,color:'var(--rx-fg-2)',fontSize:12}}>Play-Orb: Glanzkappe, Cyan-Unterlicht, blur 14 px + saturate 170 %, Hover Glanz 0.34 und Glow 0.55, Fokus als Outline.</p>
    </div>
    <nav className="rx-tabs" aria-label="Nav-Tabs (Beispiel)" style={{marginTop:16}}>
     <a className="rx-nav-tab" aria-current="page" href="#rx-surfaces">Live</a><a className="rx-nav-tab" href="#rx-surfaces">Sammlung</a><a className="rx-nav-tab" href="#rx-surfaces">Sendungen</a>
    </nav>
   </div>
  </section>

  <section className="doc-section" id="rx-colours" aria-labelledby="rx-colours-title">
   <h2 id="rx-colours-title">Signalfarben</h2>
   <p>Jede Farbe hat genau eine Bedeutung. Cyan ist die einzige Interaktionsfarbe: <code>#22D3EE</code> für Linien, Fokus und Daten, <code>#06B6D4</code> als Füllung mit schwarzer Schrift. Rot gehört ausschliesslich dem Live-Zustand, Fehler sind Rose.</p>
   <div className="rx-swatches">{signals.filter(([key])=>palette[key]).map(([key,label,role])=><button type="button" key={key} onClick={()=>copy(palette[key],label)} aria-label={`${label} ${palette[key]} kopieren`}>
    <span className="rx-swatch" style={{background:palette[key]}}/><strong>{label}</strong><code>{palette[key]}</code><span>{role}</span>
   </button>)}</div>
   <p className="copy-status" role="status">{copied}</p>
   <div className="rx-stage rx-compare">
    <div className="rx-signal rx-card"><strong><span className="rx-dot" style={{background:palette.onair}}/>Live · <code>onair</code></strong><span className="rx-tone-badge" style={{borderColor:'rgb(239 68 68 / .5)',justifySelf:'start'}}><span className="rx-dot" style={{background:palette.onair}}/>Live</span><span>Punkt oder Badge auf Scrim. Keine vollroten Flächen, ein Ping pro Ansicht.</span></div>
    <div className="rx-signal rx-card"><strong><span className="rx-dot" style={{background:palette.danger}}/>Fehler · <code>danger</code></strong><span className="rx-tone-badge" style={{borderColor:'rgb(251 113 133 / .5)',justifySelf:'start',color:palette.danger}}>Verbindung unterbrochen</span><span>Atlas-Rolle <code>destructive</code>. Ursache und Hilfe nennen, «Nochmal» anbieten.</span></div>
   </div>
   <div className="rx-stage rx-signals" style={{marginTop:16}}>
    {([['ai','KI-generiert',<Sparkles key="i" size={12} aria-hidden="true"/>],['community','42 hören zu',null],['news','Quellen',null],['dna','Klang-DNA',null]] as const).map(([key,label,icon])=><div key={key} className="rx-signal rx-inset"><span className="rx-tone-badge" style={{borderColor:`color-mix(in srgb, ${palette[key]} 50%, transparent)`,justifySelf:'start'}}>{icon??<span className="rx-dot" style={{background:palette[key]}}/>}{label}</span><span>Ton {palette[key]} · Rand 50 %</span></div>)}
   </div>
  </section>

  <section className="doc-section" id="rx-motion" aria-labelledby="rx-motion-title">
   <h2 id="rx-motion-title">Bewegung und Hintergründe</h2>
   <p>Bewegung landet weich und schiesst nie über. Jeder Hintergrund hat eine bewegte Form und ein Standbild für Folien und PDF; die Standbilder erzeugt <code>scripts/brand-radiox-deck-src.mjs</code>.</p>
   <div className="rx-motion">
    <div className="rx-stage">{aurora}<Eyebrow tone="primary">Aurora</Eyebrow><p style={{margin:0,color:'var(--rx-fg-2)',fontSize:12}}>Cyan oben links, Violett unten rechts, screen, blur 120/120/140 px, 25/30/15 s.</p></div>
    <div className="rx-stage rx-backdrop-wash"><Eyebrow>Desktop-Wash</Eyebrow><p style={{margin:0,color:'var(--rx-fg-2)',fontSize:12}}>Statisch: Cyan-900 20 % → Purple-900 10 %, dazu Cyan-Licht von oben.</p></div>
   </div>
   <table className="rx-tokens"><thead><tr><th scope="col">Token</th><th scope="col">Wert</th><th scope="col">Einsatz</th></tr></thead><tbody>{motion.map(([k,v,u])=><tr key={k}><td><code>{k}</code></td><td><code>{v}</code></td><td>{u}</td></tr>)}</tbody></table>
   <p className="muted">Bei «Bewegung reduzieren» ersetzt ein 160-ms-Opazitäts-Fade jede Bewegung, Loops stehen, der X-Regen zeigt ein Standbild. Bei «Transparenz reduzieren» fällt jeder Blur weg; Glas wird deckend.</p>
  </section>

  <section className="doc-section" id="rx-logos" aria-labelledby="rx-logos-title">
   <h2 id="rx-logos-title">Logos</h2>
   <p>«Radio» weiss in 600, das «X» in 900 mit dem Aurora-Verlauf (145°, <code>#A5F3FC</code> → <code>#22D3EE</code> → <code>#A78BFA</code>) und einem leisen Cyan-Glow. Immer ein Wort, nie mit Platte auf Dunkel. Die Mono-Varianten bleiben flach; die hellen Varianten sind von Atlas abgeleitet und keine RadioX-Vorgabe.</p>
   <div className="rx-logo-grid">{logos.map(logo=><figure key={logo.file}>
    <div className="rx-logo-surface" data-surface={logo.surface} data-square={logo.square??false}><img src={base+logo.file} alt={`RadioX · ${logo.label}`}/></div>
    <figcaption><span>{logo.label}</span><a href={base+logo.file} download aria-label={`${logo.label} herunterladen`}><Download size={15} aria-hidden="true"/>{logo.file.split('.').at(-1)?.toUpperCase()}</a></figcaption>
   </figure>)}</div>
   <div className="rx-icon-strip">{icons.map(([file,label])=><a key={file} href={base+file} download><img src={base+file} width={48} height={48} alt=""/><span>{label}</span></a>)}</div>
  </section>

  <section className="doc-section" id="rx-type" aria-labelledby="rx-type-title">
   <h2 id="rx-type-title">Schrift und Labels</h2>
   <div className="rx-type">
    <div><Eyebrow tone="primary">Läuft jetzt</Eyebrow><p className="rx-type-display">Das Radio läuft trotzdem.</p><p className="muted">Systemschrift, leise 400/600 mit lauten Momenten: Display in 900, Titel in 700, nie 800. Versalien-Labels 11 px mit 0.16em.</p></div>
    <div className="rx-type-mono"><Eyebrow>Klang-DNA</Eyebrow><p>radiox@live ~ tail -f<br/>req/min 84 · p50 212 ms · hörer 1'742</p><span className="muted">Monospace mit Tabellenziffern für Messwerte, Zeiten und Systemzeilen.</span></div>
   </div>
  </section>

  <section className="doc-section" id="rx-deck" aria-labelledby="rx-deck-title">
   <h2 id="rx-deck-title">Präsentation</h2>
   <p>Jede Folie ist dunkel: Aurora auf Cover, Kapitel und Abschluss, X-Regen nur an den Rändern, Desktop-Wash mit Footer-Band auf Inhaltsfolien. Karten in Schwarz 25 % mit Haarlinie, Glow nur auf einem Element. Die Wortmarke steht als Rasterbild ohne Platte.</p>
   <div className="rx-decks">{decks.map(([file,label])=><figure key={file}><img src={`/brands/radiox/reference/${file}.png`} width={1280} height={720} loading="lazy" alt={`RadioX-Folie: ${label}`}/><figcaption>{label}</figcaption></figure>)}</div>
   <div className="download-row"><Link href="/praesentation?brand=radiox">Präsentation mit RadioX</Link><a href="/brands/radiox/decks/muster-deck.pptx">Muster-Deck · PPTX</a><a href="/brands/radiox/presentation.json">Deck-Vertrag · JSON</a></div>
  </section>

  <section className="doc-section" id="rx-components" aria-labelledby="rx-components-title">
   <h2 id="rx-components-title">Komponenten im RadioX-Look</h2>
   <p>Die aus RadioX übernommenen Bausteine liegen neutral im Atlas-Core. Mit dieser Brand erscheinen sie wie auf radiox.cloud.</p>
   <div className="download-row">{componentPages.map(([id,title])=><Link key={id} href={`${href(id)}?brand=radiox`}>{title}</Link>)}</div>
  </section>

  <section className="doc-section" id="rx-usage" aria-labelledby="rx-usage-title">
   <h2 id="rx-usage-title">Einbinden</h2>
   <pre><code>{`<BrandProvider brand={radiox} mode="dark">\n  <img src="/brands/radiox/assets/logos/wordmark-dark.svg" alt="RadioX" height="28" />\n</BrandProvider>`}</code></pre>
   <div className="download-row"><a href="/brands/radiox/brand.json">Brand-Vertrag · JSON</a><a href="/brands/radiox/rules.md">Quellen und Ableitungen</a><a href="/brands/radiox/dna.json">Design-DNA · JSON</a><a href="/brands/radiox/tokens.dark.css">Tokens dunkel · CSS</a><a href="https://radiox.cloud">radiox.cloud</a></div>
  </section>
 </div>;
}
