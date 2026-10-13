'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Download,Pause,Play} from 'lucide-react';
import {Badge,PlayButton,AiDisclosureBadge,Eyebrow,type PlayButtonState} from '@rapold/framework-core';
import {useActiveBrand} from './framework-shell';
import {href} from './catalog';
import RadioxMatrix from './radiox-matrix';

const base='/brands/radiox/assets/';
// Meaning of each RadioX signal colour; values come from the brand contract (radiox.json → palette).
const signals:[key:string,label:string,role:string][]=[
 ['cyan','Cyan','Interaktion, Fokus, Primäraktion'],
 ['onair','On Air','Nur live: Live-Badge, Sendepunkt'],
 ['ai','KI','KI-Moderation und KI-generierte Inhalte'],
 ['community','Community','Hörerinnen, Stimmen, Votes'],
 ['news','News','Nachrichten und Quellen'],
 ['dna','Klang-DNA','Musikalisches Profil eines Tracks'],
 ['danger','Fehler','Fehler und Ausfälle'],
 ['black','Schwarz','Grund aller Ansichten'],
 ['slate','Slate','Nebentext, Metadaten'],
];
const logos=[
 {file:'logos/wordmark-dark.svg',label:'Wortmarke · dunkle Fläche',surface:'dark'},
 {file:'logos/wordmark-light.svg',label:'Wortmarke · helle Fläche',surface:'light'},
 {file:'logos/wordmark-mono-white.svg',label:'Wortmarke · Weiss',surface:'dark'},
 {file:'logos/wordmark-mono-black.svg',label:'Wortmarke · Schwarz',surface:'light'},
 {file:'logos/icon-dark.svg',label:'RX-Zeichen · dunkel',surface:'dark',square:true},
 {file:'logos/icon-light.svg',label:'RX-Zeichen · hell',surface:'light',square:true},
 {file:'logos/icon-mono-white.svg',label:'RX-Zeichen · Weiss',surface:'dark',square:true},
 {file:'icons/app-icon-aurora-1024.webp',label:'App-Icon Aurora · 1024 px',surface:'dark',square:true},
];
const icons=[['icons/favicon-16x16.png','Favicon 16'],['icons/favicon-32x32.png','Favicon 32'],['icons/apple-touch-icon.png','Apple Touch 180'],['icons/android-chrome-192x192.png','Android 192'],['icons/android-chrome-512x512.png','Android 512']];
const componentPages:[string,string][]=[['media','Medien'],['controls','Steuerelemente'],['status-tones','Status & Töne'],['notices','Hinweise & Protokolle'],['page-structure','Seitenaufbau'],['dialogs','Dialoge & Fehler']];

export default function RadioxShowcase(){
 const {brand}=useActiveBrand();
 const [running,setRunning]=useState(true);
 const [play,setPlay]=useState<PlayButtonState>('idle');
 const [copied,setCopied]=useState('');
 const palette=(brand.palette??{}) as Record<string,string>;
 async function copy(value:string,label:string){try{await navigator.clipboard.writeText(value);setCopied(`${label} ${value} kopiert.`);}catch{setCopied('Kopieren ist hier nicht verfügbar.');}}
 return <div className="rx-showcase">
  <section className="rx-hero" aria-labelledby="rx-hero-title">
   <RadioxMatrix running={running}/>
   <div className="rx-aurora" data-running={running} aria-hidden="true"/>
   <div className="rx-hero-content">
    <div className="rx-hero-brand"><img src={`${base}icons/app-icon-aurora-1024.webp`} width={72} height={72} alt=""/><img className="rx-hero-wordmark" src={`${base}logos/wordmark-dark.svg`} width={236} height={66} alt="RadioX"/></div>
    <h2 id="rx-hero-title">KI-Radio. 24/7 live.</h2>
    <p>Nachrichten, Musik und Moderation aus einer eigenen GPU-Fabric. Schwarz als Bühne, Cyan für jede Interaktion, fallende X als Signal im Hintergrund.</p>
    <div className="rx-hero-row">
     <Badge tone="live" appearance="solid">Live</Badge>
     <AiDisclosureBadge/>
     <PlayButton label="Livestream abspielen" state={play} onPlay={()=>setPlay('playing')} onPause={()=>setPlay('paused')} size="lg"/>
    </div>
   </div>
   <button type="button" className="rx-motion-toggle" aria-pressed={!running} onClick={()=>setRunning(v=>!v)}>{running?<Pause size={16} aria-hidden="true"/>:<Play size={16} aria-hidden="true"/>}{running?'Hintergrund pausieren':'Hintergrund abspielen'}</button>
  </section>
  <p className="muted">Hintergrund: Port des RadioX-Matrix-Regens (fallende, aufleuchtende X in drei Tiefen) über Aurora-Licht. Er läuft nur sichtbar und im aktiven Tab; bei «Bewegung reduzieren» erscheint ein Standbild.</p>

  <section className="doc-section" id="rx-logos" aria-labelledby="rx-logos-title">
   <h2 id="rx-logos-title">Logos</h2>
   <p>Die Wortmarke setzt «Radio» in Inter 600 mit −0.05em Laufweite und ein schwereres «X» (900) in Cyan. Das RX-Zeichen ist die Kurzform für Icons. Alle Formen sind Vektorpfade, unabhängig von der Systemschrift.</p>
   <div className="rx-logo-grid">{logos.map(logo=><figure key={logo.file}>
    <div className="rx-logo-surface" data-surface={logo.surface} data-square={logo.square??false}><img src={base+logo.file} alt={`RadioX · ${logo.label}`}/></div>
    <figcaption><span>{logo.label}</span><a href={base+logo.file} download aria-label={`${logo.label} herunterladen`}><Download size={15} aria-hidden="true"/>{logo.file.split('.').at(-1)?.toUpperCase()}</a></figcaption>
   </figure>)}</div>
   <div className="rx-icon-strip">{icons.map(([file,label])=><a key={file} href={base+file} download><img src={base+file} width={48} height={48} alt=""/><span>{label}</span></a>)}</div>
  </section>

  <section className="doc-section" id="rx-colours" aria-labelledby="rx-colours-title">
   <h2 id="rx-colours-title">Signalfarben</h2>
   <p>Jede Farbe hat genau eine Bedeutung. Cyan ist die einzige Interaktionsfarbe; Rot gehört ausschliesslich dem Live-Zustand.</p>
   <div className="rx-swatches">{signals.filter(([key])=>palette[key]).map(([key,label,role])=><button type="button" key={key} onClick={()=>copy(palette[key],label)} aria-label={`${label} ${palette[key]} kopieren`}>
    <span className="rx-swatch" style={{background:palette[key]}}/><strong>{label}</strong><code>{palette[key]}</code><span>{role}</span>
   </button>)}</div>
   <p className="copy-status" role="status">{copied}</p>
  </section>

  <section className="doc-section" id="rx-type" aria-labelledby="rx-type-title">
   <h2 id="rx-type-title">Schrift und Labels</h2>
   <div className="rx-type">
    <div><Eyebrow tone="primary">Jetzt live</Eyebrow><p className="rx-type-display">Reflect</p><p className="muted">Titel kräftig (800), Metadaten in Slate, Versalien-Labels mit 0.16em Laufweite.</p></div>
    <div className="rx-type-mono"><Eyebrow>Klang-DNA</Eyebrow><p>ENERGIE 67 · TEMPO 62<br/>req/min 0 · p50 – · hörer 1</p><span className="muted">Monospace für Messwerte und Systemzeilen.</span></div>
   </div>
  </section>

  <section className="doc-section" id="rx-components" aria-labelledby="rx-components-title">
   <h2 id="rx-components-title">Komponenten im RadioX-Look</h2>
   <p>Die aus RadioX übernommenen Bausteine liegen neutral im Atlas-Core. Mit dieser Brand erscheinen sie wie auf radiox.cloud.</p>
   <div className="download-row">{componentPages.map(([id,title])=><Link key={id} href={`${href(id)}?brand=radiox`}>{title}</Link>)}</div>
  </section>

  <section className="doc-section" id="rx-usage" aria-labelledby="rx-usage-title">
   <h2 id="rx-usage-title">Einbinden</h2>
   <pre><code>{`<BrandProvider brand={radiox} mode="dark">\n  <img src="/brands/radiox/assets/logos/wordmark-dark.svg" alt="RadioX" height="28" />\n</BrandProvider>`}</code></pre>
   <div className="download-row"><a href="/brands/radiox/brand.json">Brand-Vertrag · JSON</a><a href="/brands/radiox/rules.md">Quellen und Ableitungen</a><a href="/brands/radiox/tokens.dark.css">Tokens dunkel · CSS</a><a href="https://radiox.cloud">radiox.cloud</a></div>
  </section>
 </div>;
}
