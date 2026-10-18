'use client';

// Überlagerungen und Navigation am EdgePortal-TV. Markup, Klassen und Texte nach mra-edgeportal @ e46563c:
// components/stage/voice-assistant.tsx, components/stage/perception-indicator.tsx (Texte aus src/perception.mjs),
// components/screen-nav.tsx mit lib/screen-nav.ts (Szenen aus src/scenes.mjs) und components/mirror-view.tsx mit
// mirror-screen.tsx. Styles aus tv/voice.css, tv/perception.css, tv/screen-nav.css und tv/mirror.css. Daten sind neutrale Beispiele.
import {useEffect, useRef, type CSSProperties, type ReactNode, type RefObject} from 'react';
import {Camera, ChevronLeft, Clapperboard, Eye, LayoutGrid, Maximize2, Mic, OctagonX, Pause, Play, Radio, Square, Tv, VolumeX} from 'lucide-react';
import {Stage, css, placeholder, type ViewEntry} from './shared';
import '../../../../../brands/rapold/edgeportal/tv/voice.css';
import '../../../../../brands/rapold/edgeportal/tv/perception.css';
import '../../../../../brands/rapold/edgeportal/tv/mirror.css';

/* ---------- Stimme: Sprachassistent (voice-assistant.tsx) ---------- */

type VoicePhase = 'idle' | 'starting' | 'listening' | 'recording' | 'thinking' | 'speaking';
type VoiceTurn = {you: string; reply: string | null; note?: string};
/** src/voice.mjs limit.maxSeconds, vom Server über /api/screen/voice gemeldet. */
const VOICE_MAX_SECONDS = 30;
const TURN: VoiceTurn = {you: 'Was läuft gerade im Radio?', reply: 'Midnight Signal von Glass Harbour, danach kommt Northern Lights von Tidewater.'};

/** Dock (Knopf oder offenes Mikrofon) und Untertitel, wie voice-assistant.tsx sie in die Bühne legt. */
function Voice({phase = 'idle', mode = 'tippen', elapsed = 0, turn, error = ''}: {phase?: VoicePhase; mode?: 'tippen' | 'automatisch'; elapsed?: number; turn?: VoiceTurn; error?: string}) {
  const open = phase === 'starting' || phase === 'listening' || phase === 'recording';
  return <>
    <div className="voice-dock" data-phase={phase}>
      {open ? <div className="voice-live" role="status" aria-live="assertive">
        <span className="voice-dot" aria-hidden="true"/>
        <strong>Mikrofon an</strong>
        <span>{phase === 'listening' ? 'Ich höre zu …' : phase === 'starting' ? 'Mikrofon wird geöffnet …' : `Aufnahme ${elapsed} / ${VOICE_MAX_SECONDS} s`}</span>
        <button type="button" className="voice-stop" tabIndex={-1}><Square aria-hidden="true"/>Stopp</button>
      </div> : <button type="button" className="voice-button" disabled={phase !== 'idle'} tabIndex={-1} aria-label="Sprachassistent: sprechen">
        <Mic aria-hidden="true"/>
        <span>{phase === 'thinking' ? 'Denke nach …' : phase === 'speaking' ? 'Antwort läuft' : 'Frag die Bühne'}</span>
        {phase === 'idle' && <small>{mode === 'automatisch' ? 'antippen oder OK lang drücken · hört danach kurz weiter' : 'antippen oder OK lang drücken'}</small>}
      </button>}
    </div>
    {(turn || error) && <div className="voice-caption" aria-live="polite">
      {error && <p className="voice-error">{error}</p>}
      {turn?.note && <p className="voice-note">{turn.note}</p>}
      {turn?.you && <p className="voice-you"><strong>Du</strong>{turn.you}</p>}
      {turn?.reply && <p className="voice-reply"><strong>Bühne</strong>{turn.reply}</p>}
    </div>}
  </>;
}

/* ---------- Wahrnehmung (perception-indicator.tsx) ---------- */

type WakePhase = 'hoert' | 'versteht' | 'sendet' | 'gesendet' | 'verworfen' | 'fehler';
/** Was /api/stage über die Wahrnehmung meldet (src/perception.mjs summary), auf die sichtbaren Felder reduziert. */
type PerceptionSummary = {
  vision: boolean; listening: boolean; paused?: boolean; lastScene?: string; notice?: string;
  mode?: 'weckwort' | 'ausschnitte'; agents?: boolean;
  wake?: {label: string; phase: WakePhase; heard?: string; targets?: string[]};
  answer?: {heard: string; reply: string};
};
const WAKE_STATUS: Record<WakePhase, string> = {
  hoert: 'Sprich weiter …',
  versteht: 'Wird verstanden …',
  sendet: 'Wird gesendet …',
  gesendet: 'Gesendet',
  verworfen: 'Nicht an ÆON oder ÆTHRA gerichtet – verworfen',
  fehler: 'Nicht angekommen',
};
const SCENE = 'Zwei Personen sitzen auf dem Sofa und schauen fern.';

/** Badge, Chips und Zeilen oben links; im Spiegel ohne Pause-Knopf. */
function Perception({perception: p, mirror = false}: {perception: PerceptionSummary; mirror?: boolean}) {
  const stop = (resume = false) => mirror ? null : <button type="button" className="perception-stop" tabIndex={-1}>
    {resume ? <Play aria-hidden="true"/> : <Pause aria-hidden="true"/>}{resume ? 'Fortsetzen' : 'Pause'}</button>;
  return <>
    <div className="perception-dock" data-listening={p.listening ? 'true' : 'false'}>
      {p.listening ? <div className="perception-live" role="status" aria-live="assertive" data-wake={p.wake ? 'true' : undefined}>
        <span className="perception-dot" aria-hidden="true"/>
        <Mic aria-hidden="true"/>
        <strong>{p.wake ? `Hört zu: ${p.wake.label}` : 'Hört zu'}</strong>
        <span>{p.wake ? WAKE_STATUS[p.wake.phase]
          : p.mode === 'weckwort'
            ? `Sag «ÆON …» oder «ÆTHRA …» · nur der Satz danach wird ausgewertet${p.agents ? ' und an die Agents gesendet' : ''}`
            : 'Sag «ÆON …» · alles andere wird sofort verworfen'}</span>
        {stop()}
      </div> : p.vision ? <div className="perception-chip" role="status">
        <Eye aria-hidden="true"/><span>Kamera wird ausgewertet</span>{stop()}
      </div> : p.paused ? <div className="perception-chip" role="status">
        <Pause aria-hidden="true"/><span>Wahrnehmung pausiert</span>{stop(true)}
      </div> : null}
      {p.listening && p.wake?.heard && <p className="perception-heard" aria-live="polite">
        <strong>Du</strong>{p.wake.heard}{p.wake.targets?.length ? <em>→ {p.wake.targets.join(' und ')}</em> : null}</p>}
      {p.lastScene && <p className="perception-scene">{p.lastScene}</p>}
      {p.notice && <p className="perception-notice">{p.notice}</p>}
    </div>
    {p.answer && <div className="voice-caption perception-answer" aria-live="polite">
      {p.answer.heard && <p className="voice-you"><strong>Du</strong>{p.answer.heard}</p>}
      <p className="voice-reply"><strong>Bühne</strong>{p.answer.reply}</p>
    </div>}
  </>;
}

/* ---------- Übersicht und Kameras (screen-nav.tsx, lib/screen-nav.ts) ---------- */

type NavKind = 'buehne' | 'kamera' | 'kameras' | 'szene' | 'radiox' | 'notbremse';
type FrameState = 'bild' | 'laedt' | 'fehlt';
type NavTile = {id: string; kind: NavKind; title: string; detail?: string; count?: number; own?: boolean; image?: string};
const EYEBROW: Record<NavKind, string> = {buehne: 'Start', kamera: 'Kamera · Totale', kameras: 'Alle Kameras', szene: 'Szene', radiox: 'Radio', notbremse: 'Agents'};
const ICON = {buehne: Tv, kamera: Camera, kameras: LayoutGrid, szene: Clapperboard, radiox: Radio, notbremse: OctagonX} as const;
/** lib/screen-nav.ts columnsFor: eine Reihe bis vier Kacheln, dann Reihen zu drei oder vier; Breite des TVs in CSS-Pixeln. */
const columnsFor = (count: number, width = 3840) => Math.max(1, Math.min(count <= 4 ? Math.max(1, count) : count <= 6 ? 3 : 4, Math.floor(width / 280) || 1));

const HOME: NavTile = {id: 'home', kind: 'buehne', title: 'Bühne'};
const RADIOX: NavTile = {id: 'radiox', kind: 'radiox', title: 'RadioX', detail: 'Live-Radio im Vollbild'};
/** Kameras in der Reihenfolge von buildViews: die eigene zuerst. Titel wie cameraTitle(): «Gerät · Kamera»; Geräte und Bilder sind Beispiele. */
const CAMERAS: NavTile[] = [
  {id: 'kamera:eins-eingang', kind: 'kamera', title: 'eins · Eingang', own: true, image: placeholder('Kamerabild · Eingang')},
  {id: 'kamera:eins-garten', kind: 'kamera', title: 'eins · Garten', image: placeholder('Kamerabild · Garten')},
  {id: 'kamera:zwei-einfahrt', kind: 'kamera', title: 'zwei · Einfahrt', image: placeholder('Kamerabild · Einfahrt')},
  {id: 'kamera:zwei-terrasse', kind: 'kamera', title: 'zwei · Terrasse', image: placeholder('Kamerabild · Terrasse')},
];
const ALL_CAMERAS: NavTile = {id: 'kameras', kind: 'kameras', title: 'Alle Kameras', count: CAMERAS.length};
/** Die eingebauten Szenen (src/scenes.mjs BUILTIN_SCENES) als Kacheln (lib/scenes.ts sceneTiles); aktiv ist «Abend mit Radio». */
const SCENES: NavTile[] = ([
  ['abend', 'Abend mit Radio', 'Kino-Avatare, RadioX als Karte mit bewegtem Cover'],
  ['arbeit', 'Arbeit: Terminals', 'Terminals gross, RadioX schmal in der Leiste'],
  ['fokus', 'Fokus', 'Ein Agent im Zentrum mit Verlauf, RadioX in der Leiste'],
  ['gaeste', 'Gäste: nur Radio', 'Keine Agents, nichts Privates, RadioX mit Stream'],
  ['nacht', 'Nacht', 'Stumm, 60 % dunkler, Aurora langsam, Stream und Terminals aus'],
  ['morgen', 'Morgen: ruhig', 'Karten mit Kernsätzen statt Terminals'],
  ['radiox-vollbild', 'RadioX Vollbild', 'RadioX füllt den Screen: Cover, Titel, Danach, Moderation'],
  ['stack', 'Hermes-Stack', 'Agents, Aufträge, Leitplanken und Modelle als lebende Schichten'],
] as const).map(([id, title, text]): NavTile => ({id: `szene:${id}`, kind: 'szene', title, detail: id === 'abend' ? `Aktiv · ${text}` : text}));
type BrakePhase = 'bereit' | 'senden' | 'gezogen' | 'fehler';
/** lib/screen-nav.ts notbremseTile: `detail` sagt, was OK als Nächstes tut oder wie der letzte Zug ausging. */
export const brakeTile = (phase: BrakePhase, message = ''): NavTile => ({id: 'notbremse', kind: 'notbremse', title: 'Notbremse',
  detail: phase === 'senden' ? 'Wird gezogen …' : phase === 'gezogen' ? message || 'Gezogen. Lösen nur im Leitstand'
    : phase === 'fehler' ? message || 'Nicht bestätigt. Bitte im Leitstand ziehen' : 'Alle Agents sofort anhalten · OK zweimal'});
/** Eine Bühne mit Kameraansichten: Start, RadioX, Kameras, Szenen, Notbremse (nur bekannte Personen vor dem Screen). */
const WITH_CAMERAS: NavTile[] = [HOME, RADIOX, ALL_CAMERAS, ...CAMERAS, ...SCENES, brakeTile('bereit')];
export const withoutCameras = (brake?: NavTile) => [HOME, RADIOX, ...SCENES, ...(brake ? [brake] : [])];
export const NOTE = {
  aus: 'Kameraansichten sind für diesen Screen ausgeschaltet (Steuerung → Screen → Kamera).',
  privat: 'Kamerabilder sind ausgeblendet: Die Anwesenheit erlaubt gerade keine privaten Inhalte.',
  keine: 'Keine Kamera online.',
};

function CameraImage({tile, state = 'bild', cover = false}: {tile: NavTile; state?: FrameState; cover?: boolean}) {
  return <span className="nav-frame" data-cover={cover ? 'true' : 'false'}>
    {state === 'bild' && <img src={tile.image} alt={tile.title}/>}
    {state !== 'bild' && <span className="nav-frame-state" role={state === 'fehlt' ? 'alert' : 'status'}>{state === 'fehlt' ? 'Kein Bild von dieser Kamera' : 'Bild wird geladen …'}</span>}
  </span>;
}

/** Ebene über dem Inhalt mit Datenschutzhinweis und Zeigerknopf (erscheint nur bei Bewegung von Maus oder Touch). */
function NavLayer({overview, live, pointer = false, pointerLabel, layer, children}: {overview: boolean; live: boolean; pointer?: boolean; pointerLabel: string; layer?: RefObject<HTMLDivElement | null>; children: ReactNode}) {
  return <div className="nav-layer" data-overview={overview ? 'true' : 'false'} ref={layer}>
    {children}
    {live && <div className="nav-live" role="status"><span className="nav-live-dot" aria-hidden="true"/>Kamera live</div>}
    <button type="button" className="nav-pointer" data-shown={pointer ? 'true' : 'false'} tabIndex={-1}><ChevronLeft aria-hidden="true"/>{pointerLabel}</button>
  </div>;
}

function Tile({tile, index, focused, from, armed}: {tile: NavTile; index: number; focused: boolean; from: boolean; armed: boolean}) {
  const Icon = ICON[tile.kind];
  const status = armed ? 'Nochmals OK: jetzt ziehen' : tile.detail ?? (tile.kind === 'buehne' ? 'Konfigurierte Ansicht' : tile.kind === 'kameras' ? `${tile.count} Kameras online`
    : tile.kind === 'kamera' ? tile.own ? 'Kamera an diesem Screen' : 'online' : '');
  return <button type="button" className="nav-tile" data-focused={focused ? 'true' : 'false'} data-kind={tile.kind} data-armed={armed ? 'true' : undefined}
    aria-current={from ? 'page' : undefined} tabIndex={-1}>
    <span className="nav-thumb">
      {tile.kind === 'kamera' ? <CameraImage tile={tile} cover/> : <span className="nav-thumb-icon"><Icon aria-hidden="true" strokeWidth={1.5}/></span>}
    </span>
    <span className="nav-tile-text">
      <span className="nav-eyebrow">{index < 9 ? `${index + 1} · ` : ''}{EYEBROW[tile.kind]}</span>
      <strong>{tile.title}</strong>
      <span className="nav-status">{from ? 'Zuletzt hier · ' : ''}{status}</span>
    </span>
  </button>;
}

/** Übersicht wie Overview in screen-nav.tsx. Wie focus() im Produkt scrollt die Ebene die fokussierte Kachel in die Mitte, wenn sie nicht ganz sichtbar ist. */
export function Overview({tiles, focus = 0, from = HOME.id, note = '', armed = false, pointer = false}: {tiles: NavTile[]; focus?: number; from?: string; note?: string; armed?: boolean; pointer?: boolean}) {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = layer.current;
    const tile = box?.querySelectorAll<HTMLElement>('.nav-tile')[focus];
    if (!box || !tile) return;
    const top = tile.offsetTop;
    const bottom = top + tile.offsetHeight;
    if (top < box.scrollTop || bottom > box.scrollTop + box.clientHeight) box.scrollTop = top + tile.offsetHeight / 2 - box.clientHeight / 2;
  }, [focus]);
  const fromTitle = tiles.find(tile => tile.id === from)?.title ?? HOME.title;
  return <NavLayer overview live={tiles.some(tile => tile.kind === 'kamera' || tile.kind === 'kameras')} pointer={pointer} pointerLabel={`Zurück zu «${fromTitle}»`} layer={layer}>
    <section className="nav-overview" aria-label="Übersicht">
      <header className="nav-head">
        <span className="nav-eyebrow">EdgePortal · Übersicht</span>
        <h1>Übersicht<span className="nav-glut" aria-hidden="true">◆</span></h1>
      </header>
      <div className="nav-grid" style={css({'--cols': columnsFor(tiles.length)})} role="list">
        {tiles.map((tile, index) => <div role="listitem" key={tile.id}>
          <Tile tile={tile} index={index} focused={index === focus} from={tile.id === from} armed={armed && tile.kind === 'notbremse'}/>
        </div>)}
      </div>
      {note && <p className="nav-note">{note}</p>}
      <p className="nav-keys">◀ ▶ ▲ ▼ wählen · OK öffnen · Zurück: «{fromTitle}» · 0: Start</p>
    </section>
  </NavLayer>;
}

function CameraGrid({focus = 0, frames = []}: {focus?: number; frames?: FrameState[]}) {
  return <NavLayer overview={false} live pointerLabel="Zurück">
    <section className="nav-view nav-cams" aria-label="Alle Kameras">
      <header className="nav-head nav-head-inline"><span className="nav-eyebrow">Alle Kameras · {CAMERAS.length} online</span></header>
      <div className="nav-grid nav-cam-grid" style={css({'--cols': columnsFor(CAMERAS.length)})}>
        {CAMERAS.map((camera, index) => <button type="button" key={camera.id} className="nav-cam" data-focused={index === focus ? 'true' : 'false'} tabIndex={-1}>
          <CameraImage tile={camera} state={frames[index]} cover/>
          <span className="nav-cam-label">{camera.title}</span>
        </button>)}
      </div>
      <p className="nav-keys">◀ ▶ ▲ ▼ Kamera wählen · OK Totale · Zurück: Übersicht</p>
    </section>
  </NavLayer>;
}

function CameraFull({camera = CAMERAS[1], state, pointer = false}: {camera?: NavTile; state?: FrameState; pointer?: boolean}) {
  return <NavLayer overview={false} live pointer={pointer} pointerLabel="Zurück">
    <section className="nav-view nav-totale" aria-label={`Kamera ${camera.title}`}>
      <CameraImage tile={camera} state={state}/>
      <header className="nav-head nav-head-inline"><span className="nav-eyebrow">{EYEBROW.kamera}</span><strong>{camera.title}</strong></header>
      <p className="nav-keys">◀ ▶ andere Kamera · Zurück: zurück</p>
    </section>
  </NavLayer>;
}

/* ---------- Spiegel und Teilen im Browser (mirror-view.tsx, mirror-screen.tsx) ---------- */

type MirrorState = 'verbindet' | 'kein-zugriff' | 'unterbrochen' | 'offline' | 'live';
type Display = {width: number; height: number};
/** Browserfenster der Ansicht (tv 1920 × 1080). Ohne Meldung des Screens gilt DEFAULT_DISPLAY aus mirror-view.tsx. */
const BROWSER: Display = {width: 1920, height: 1080};
const DEFAULT_DISPLAY: Display = {width: 1920, height: 1080};
const TV_DISPLAY: Display = {width: 3840, height: 2160};
/** <body> der Produktseite (app/globals.css): Geist, geglättet; Zeilenhöhe wie Tailwind-Preflight. */
const FONT: CSSProperties = {fontFamily: 'var(--font-geist-sans), sans-serif', WebkitFontSmoothing: 'antialiased', lineHeight: 1.5};
/** Das iframe mit dem Bild: Regel `.mirror-box iframe` aus mirror.css als Inline-Stil, weil Atlas statt eines iframes einen Block rendert. */
const IFRAME: CSSProperties = {position: 'absolute', inset: '0 auto auto 0', border: 0, transformOrigin: '0 0', background: '#000'};
/** Hintergrund und Schrift der Bildseite im dunklen Theme (app/globals.css .dark --background, --foreground). */
const PICTURE_BODY: CSSProperties = {background: '#050b19', color: '#edf5ff'};
/** main.screen-view aus app/globals.css (nicht kopiert): Spalte über die ganze Höhe; 100dvh des iframes ist hier 100 % des Bildes. */
const SCREEN_VIEW: CSSProperties = {display: 'flex', flexDirection: 'column', minHeight: '100%'};
/** Ghost-Knopf aus components/ui/button.tsx (Basis plus variant ghost), dieselben Tailwind-Klassen. */
const GHOST = 'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[8px] border border-transparent px-4 py-2 text-sm font-[650] leading-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(.2,.7,.2,1)] motion-safe:active:scale-[.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground';

/** Spiegelseite: Bild in der Auflösung des Screens, eingepasst und mit Balken, darüber die Leiste (sichtbar nach Bewegung, 4 s). */
function Mirror({share = false, state, name, place, display = DEFAULT_DISPLAY, children}: {share?: boolean; state: MirrorState; name?: string; place?: string; display?: Display; children: ReactNode}) {
  const scale = Math.min(BROWSER.width / display.width, BROWSER.height / display.height);
  const label = state === 'verbindet' ? 'Verbindet …' : state === 'kein-zugriff' ? (share ? 'Link nicht verfügbar' : 'Kein Zugriff') : state === 'unterbrochen' ? 'Verbindung unterbrochen'
    : state === 'offline' ? 'Screen offline · letzter Stand' : 'Live';
  return <div style={{position: 'absolute', inset: 0, ...FONT}}>
    <div className="mirror-page" data-overlay="shown">
      <div className="mirror-box" style={{width: display.width * scale, height: display.height * scale}}>
        <div style={{...IFRAME, ...FONT, ...PICTURE_BODY, width: display.width, height: display.height, transform: `scale(${scale})`}}>{children}</div>
      </div>
      <header className="mirror-overlay">
        <span className="mirror-title">
          <strong>{share ? 'Geteilter Screen' : name || 'Screen'}</strong>
          <span><Eye aria-hidden="true"/>{share ? 'Öffentlich · nur ansehen' : `Spiegel · nur ansehen${place ? ` · ${place}` : ''}`}</span>
        </span>
        <span className="mirror-state" data-live={state === 'live' ? 'true' : 'false'} role="status">{label}</span>
        <span className="mirror-scale" title={`${display.width} × ${display.height}`}>{display.width}×{display.height} · {Math.round(scale * 100)} %</span>
        <button type="button" data-slot="button" className={GHOST} aria-pressed="false" tabIndex={-1}><VolumeX/><span>Ton an</span></button>
        <button type="button" data-slot="button" className={GHOST} tabIndex={-1}><Maximize2/><span>Vollbild</span></button>
        {!share && <a className="mirror-back">Steuerung</a>}
      </header>
    </div>
  </div>;
}

/** Meldung der Bildseite statt des Inhalts (mirror-screen.tsx, ohne Daten oder mit Fehler). */
function MirrorMessage({heading, alert = true, children}: {heading: string; alert?: boolean; children: ReactNode}) {
  return <div className="mirror-message" data-toolbar="hidden" style={{minHeight: '100%'}}>
    <section role={alert ? 'alert' : 'status'}><h2>{heading}</h2><p>{children}</p></section>
  </div>;
}

/** Inhalt, der nicht gespiegelt wird (App oder über den Link nicht geteilt). Die Fusszeile des Spiegels (.screen-toolbar) fehlt, siehe Bericht. */
function MirrorNotShown({share = false, heading, children}: {share?: boolean; heading: string; children: ReactNode}) {
  return <div data-toolbar="hidden" data-mirror={share ? 'teilen' : 'spiegel'} style={SCREEN_VIEW}>
    <section role="status" className="mirror-message"><h2>{heading}</h2><p>{children}</p></section>
  </div>;
}

/** Bühne im Bild: main.screen-view mit der Bühne über die ganze Höhe. */
function MirrorStage({share = false, children}: {share?: boolean; children: ReactNode}) {
  return <div data-toolbar="hidden" data-mirror={share ? 'teilen' : 'spiegel'} style={{...SCREEN_VIEW, height: '100%'}}>{children}</div>;
}

/* ---------- Katalog ---------- */

const voiceArea = 'Stimme und Wahrnehmung';
const navArea = 'Übersicht und Kameras';
const mirrorArea = 'Spiegel und Teilen';
const WAKE_BASE: PerceptionSummary = {vision: true, listening: true, mode: 'weckwort', agents: true};

export const overlayViews: ViewEntry[] = [
  // Stimme
  {id: 'voice-frag-die-buehne', area: voiceArea, title: 'Frag die Bühne', caption: 'Ruhezustand, wenn der Server Diktat «tippen» erlaubt: Antippen oder OK lang drücken öffnet das Mikrofon.',
    node: <Stage><Voice/></Stage>},
  {id: 'voice-hoert-danach-weiter', area: voiceArea, title: 'Frag die Bühne · hört danach kurz weiter', caption: 'Diktat «automatisch»: Nach einer Antwort öffnet sich das Mikrofon für eine kurze Nachfrage, nie durch Gesichtserkennung allein.',
    node: <Stage><Voice mode="automatisch"/></Stage>},
  {id: 'voice-mikrofon-oeffnet', area: voiceArea, title: 'Mikrofon an · Mikrofon wird geöffnet …', caption: 'Nach dem Antippen, bis der Browser das Mikrofon freigibt; rot, beschriftet und mit Stopp.',
    node: <Stage><Voice phase="starting"/></Stage>},
  {id: 'voice-aufnahme', area: voiceArea, title: 'Mikrofon an · Aufnahme', caption: 'Aufnahme läuft, mit Sekunden bis zum Limit von 30 s; 1,6 s Stille beenden sie.',
    node: <Stage><Voice phase="recording" elapsed={4}/></Stage>},
  {id: 'voice-ich-hoere-zu', area: voiceArea, title: 'Mikrofon an · Ich höre zu …', caption: 'Automatische Nachfrage nach einer Antwort: wartet bis 12 s auf eine Stimme.',
    node: <Stage><Voice phase="listening" mode="automatisch"/></Stage>},
  {id: 'voice-denke-nach', area: voiceArea, title: 'Denke nach …', caption: 'Die Aufnahme ist gesendet, die Antwort steht noch aus; das Mikrofon-Symbol pulsiert.',
    node: <Stage><Voice phase="thinking"/></Stage>},
  {id: 'voice-antwort-laeuft', area: voiceArea, title: 'Antwort läuft', caption: 'Die Antwort wird gesprochen, solange die Bühnenstimme an ist; Untertitel «Du» und «Bühne» stehen dazu.',
    node: <Stage><Voice phase="speaking" turn={TURN}/></Stage>},
  {id: 'voice-untertitel', area: voiceArea, title: 'Du … · Bühne …', caption: 'Nach der Antwort bleibt der Untertitel 12 s stehen, dann verschwindet er; gespeichert wird nichts.',
    node: <Stage><Voice turn={TURN}/></Stage>},
  {id: 'voice-nichts-verstanden', area: voiceArea, title: 'Nichts verstanden.', caption: 'Der Server liefert kein Transkript; der Hinweis steht 4 s.',
    node: <Stage><Voice turn={{you: '', reply: null, note: 'Nichts verstanden.'}}/></Stage>},
  {id: 'voice-nichts-gehoert', area: voiceArea, title: 'Nichts gehört.', caption: 'Die Aufnahme endet ohne erkannte Stimme (nach 8 s oder zu kurz); Fehler stehen 6 s.',
    node: <Stage><Voice error="Nichts gehört."/></Stage>},
  {id: 'voice-mikrofon-fehlt', area: voiceArea, title: 'Mikrofon nicht verfügbar oder nicht erlaubt.', caption: 'Der Browser gibt kein Mikrofon frei; ebenso erscheinen «Sprachassistent antwortet nicht.» und Fehlertexte des Servers.',
    node: <Stage><Voice error="Mikrofon nicht verfügbar oder nicht erlaubt."/></Stage>},

  // Wahrnehmung
  {id: 'perception-hoert-zu', area: voiceArea, title: 'Hört zu', caption: 'Hören in Ausschnitten: Solange der Server Ton auswertet, steht das rote Badge mit Pause-Knopf.',
    node: <Stage><Perception perception={{vision: true, listening: true, mode: 'ausschnitte'}}/></Stage>},
  {id: 'perception-weckwort', area: voiceArea, title: 'Hört zu · Weckwort', caption: 'Hören mit Weckwort des Pi (Standard): nur der Satz nach «ÆON» oder «ÆTHRA» wird ausgewertet.',
    node: <Stage><Perception perception={{vision: true, listening: true, mode: 'weckwort'}}/></Stage>},
  {id: 'perception-weckwort-agents', area: voiceArea, title: 'Hört zu · an die Agents', caption: 'Weckwort mit eingeschaltetem Weg zu den Agents: der Satz geht als Text an ÆON oder ÆTHRA.',
    node: <Stage><Perception perception={WAKE_BASE}/></Stage>},
  {id: 'perception-wake-hoert', area: voiceArea, title: 'Hört zu: ÆON · Sprich weiter …', caption: 'Das Weckwort kam von der Kamera; das Badge nennt den Agent und wird grösser.',
    node: <Stage><Perception perception={{...WAKE_BASE, wake: {label: 'ÆON', phase: 'hoert'}}}/></Stage>},
  {id: 'perception-wake-versteht', area: voiceArea, title: 'Hört zu: ÆTHRA · Wird verstanden …', caption: 'Der Ausschnitt nach dem Weckwort wird transkribiert.',
    node: <Stage><Perception perception={{...WAKE_BASE, wake: {label: 'ÆTHRA', phase: 'versteht'}}}/></Stage>},
  {id: 'perception-wake-sendet', area: voiceArea, title: 'Hört zu: ÆON · Wird gesendet …', caption: 'Der verstandene Satz geht an den angesprochenen Agent; darunter steht, was ankam und an wen.',
    node: <Stage><Perception perception={{...WAKE_BASE, wake: {label: 'ÆON', phase: 'sendet', heard: 'ÆON, fass mir den Tag kurz zusammen.', targets: ['ÆON']}}}/></Stage>},
  {id: 'perception-wake-gesendet', area: voiceArea, title: 'Hört zu: ÆON und ÆTHRA · Gesendet', caption: 'Die Agents haben den Satz angenommen; «Beide …» spricht ÆON und ÆTHRA an.',
    node: <Stage><Perception perception={{...WAKE_BASE, wake: {label: 'ÆON und ÆTHRA', phase: 'gesendet', heard: 'Beide, macht bitte eine kurze Pause.', targets: ['ÆON', 'ÆTHRA']}}}/></Stage>},
  {id: 'perception-wake-verworfen', area: voiceArea, title: 'Nicht an ÆON oder ÆTHRA gerichtet – verworfen', caption: 'Ein ähnlich klingendes Wort hat den Pi geweckt oder der Ausschnitt war zu lang: der Satz wird verworfen.',
    node: <Stage><Perception perception={{...WAKE_BASE, wake: {label: 'ÆON', phase: 'verworfen'}}}/></Stage>},
  {id: 'perception-wake-fehler', area: voiceArea, title: 'Hört zu: ÆTHRA · Nicht angekommen', caption: 'Die Agents haben die Eingabe nicht angenommen; der feste Hinweis darunter nennt den Grund.',
    node: <Stage><Perception perception={{...WAKE_BASE, notice: 'Die Agents haben die Eingabe gerade nicht angenommen.',
      wake: {label: 'ÆTHRA', phase: 'fehler', heard: 'ÆTHRA, erinnere mich morgen an den Einkauf.', targets: ['ÆTHRA']}}}/></Stage>},
  {id: 'perception-kamera', area: voiceArea, title: 'Kamera wird ausgewertet', caption: 'Nur das Bild wird ausgewertet; mit Erlaubnis für Privates steht die letzte Szene als ein Satz darunter.',
    node: <Stage><Perception perception={{vision: true, listening: false, lastScene: SCENE}}/></Stage>},
  {id: 'perception-pausiert', area: voiceArea, title: 'Wahrnehmung pausiert', caption: 'Nach Pause am Screen: Kamera und Mikrofon werden nicht ausgewertet, bis «Fortsetzen».',
    node: <Stage><Perception perception={{vision: false, listening: false, paused: true}}/></Stage>},
  {id: 'perception-hinweis', area: voiceArea, title: 'Limit der Wahrnehmung erreicht', caption: 'Feste Hinweise des Servers ersetzen jeden Fehler von aussen; hier ist das Kontingent für das Hören aufgebraucht.',
    node: <Stage><Perception perception={{vision: true, listening: false, notice: 'Limit der Wahrnehmung erreicht. Später geht es weiter.'}}/></Stage>},
  {id: 'perception-antwort', area: voiceArea, title: 'Du … · Bühne … (Weckwort)', caption: 'Antwort auf einen Satz nach dem Weckwort: 14 s als Untertitel, einmal gesprochen.',
    node: <Stage><Perception perception={{vision: true, listening: true, mode: 'weckwort', answer: {heard: 'ÆON, wie spät ist es?', reply: 'Es ist 21:18.'}}}/></Stage>},

  // Übersicht und Kameras
  {id: 'nav-zeiger-uebersicht', area: navArea, title: 'Übersicht (Zeigerknopf)', caption: 'Auf der Bühne erscheint bei Bewegung von Maus oder Touch unten links der Knopf zur Übersicht, 4 s lang.',
    node: <><Stage/><button type="button" className="nav-pointer nav-pointer-home" data-shown="true" tabIndex={-1}><LayoutGrid aria-hidden="true"/>Übersicht</button></>},
  {id: 'nav-uebersicht-kameras', area: navArea, title: 'Übersicht mit Kameras', caption: 'Zurück auf der Bühne bei eingeschalteten Kameraansichten: Kacheln mit Vorschaubild, «Alle Kameras» ab zwei Kameras, oben rechts «Kamera live».',
    node: <Overview tiles={WITH_CAMERAS}/>},
  {id: 'nav-zuletzt-hier', area: navArea, title: 'Zuletzt hier', caption: 'Zurück aus einer Kamera öffnet die Übersicht auf deren Kachel; der Zeigerknopf führt dorthin zurück.',
    node: <Overview tiles={WITH_CAMERAS} focus={3} from={CAMERAS[0].id} pointer/>},
  {id: 'nav-szenen', area: navArea, title: 'Szenen', caption: 'Die Szenenbibliothek der Bühne als Kacheln; die gewählte Szene gilt am TV bis zur nächsten Veröffentlichung.',
    node: <Overview tiles={withoutCameras(brakeTile('bereit'))} focus={2} note={NOTE.aus}/>},
  {id: 'nav-hinweis-aus', area: navArea, title: 'Kameraansichten ausgeschaltet', caption: 'Ohne Kameraansichten für diesen Screen steht unter den Kacheln der Weg zum Schalter.',
    node: <Overview tiles={withoutCameras(brakeTile('bereit'))} focus={10} note={NOTE.aus}/>},
  {id: 'nav-hinweis-privat', area: navArea, title: 'Kamerabilder ausgeblendet', caption: 'Die Anwesenheit erlaubt keine privaten Inhalte (etwa ein Gast): Kameras und Notbremse fehlen.',
    node: <Overview tiles={withoutCameras()} focus={9} note={NOTE.privat}/>},
  {id: 'nav-hinweis-keine', area: navArea, title: 'Keine Kamera online', caption: 'Kameraansichten sind an, aber keine Kamera ist online.',
    node: <Overview tiles={withoutCameras(brakeTile('bereit'))} focus={8} note={NOTE.keine}/>},
  {id: 'nav-notbremse-scharf', area: navArea, title: 'Nochmals OK: jetzt ziehen', caption: 'Nach dem ersten OK ist die Notbremse 5 s scharf: Rahmen in Gefahrfarbe, das zweite OK zieht sie.',
    node: <Overview tiles={withoutCameras(brakeTile('bereit'))} focus={10} note={NOTE.aus} armed/>},
  {id: 'nav-notbremse-senden', area: navArea, title: 'Notbremse · Wird gezogen …', caption: 'Nach dem zweiten OK, bis der Server antwortet; die Übersicht bleibt offen.',
    node: <Overview tiles={withoutCameras(brakeTile('senden'))} focus={10} note={NOTE.aus}/>},
  {id: 'nav-notbremse-gezogen', area: navArea, title: 'Notbremse · Gezogen', caption: 'Der Server hat gebremst und meldet, wie viele Agents angehalten sind; lösen nur im Leitstand.',
    node: <Overview tiles={withoutCameras(brakeTile('gezogen', 'Gezogen · 2 angehalten. Lösen nur im Leitstand'))} focus={10} note={NOTE.aus}/>},
  {id: 'nav-notbremse-fehler', area: navArea, title: 'Notbremse · abgelehnt', caption: 'Der Server lehnt ab (hier: inzwischen steht nicht mehr nur Bekanntes vor dem Screen); die Kachel zeigt seine Meldung.',
    node: <Overview tiles={withoutCameras(brakeTile('fehler', 'Notbremse am Screen nur, wenn ausschliesslich bekannte Personen davor stehen.'))} focus={10} note={NOTE.aus}/>},
  {id: 'nav-alle-kameras', area: navArea, title: 'Alle Kameras', caption: 'Alle Kameras im Raster; je mehr sichtbar sind, desto seltener kommt ein Bild pro Kamera.',
    node: <CameraGrid/>},
  {id: 'nav-kein-bild', area: navArea, title: 'Kein Bild von dieser Kamera', caption: 'Eine Kamera liefert kein Bild, eine andere lädt noch; die übrigen laufen weiter.',
    node: <CameraGrid focus={2} frames={['bild', 'bild', 'fehlt', 'laedt']}/>},
  {id: 'nav-totale', area: navArea, title: 'Kamera · Totale', caption: 'Eine Kamera im Vollbild mit bis zu zwei Bildern pro Sekunde; «Kamera live» steht, solange ein Kamerabild zu sehen ist.',
    node: <CameraFull/>},
  {id: 'nav-bild-laedt', area: navArea, title: 'Bild wird geladen …', caption: 'Direkt nach dem Öffnen, bis das erste Bild in voller Breite da ist.',
    node: <CameraFull state="laedt"/>},
  {id: 'nav-zeiger-zurueck', area: navArea, title: 'Zurück (Zeigerknopf)', caption: 'In einer Ansicht über dem Inhalt führt der Zeigerknopf eine Ebene zurück.',
    node: <CameraFull pointer/>},

  // Spiegel und Teilen
  {id: 'mirror-verbindet', area: mirrorArea, title: 'Verbindet …', caption: 'Spiegel im Browser, bevor der erste Stand des Screens da ist.', tv: BROWSER,
    node: <Mirror state="verbindet"><MirrorMessage heading="Verbindet …" alert={false}>Der aktuelle Stand des Screens wird geladen.</MirrorMessage></Mirror>},
  {id: 'mirror-live', area: mirrorArea, title: 'Spiegel · Live', caption: 'Der Spiegel zeigt das Bild in der Auflösung des Screens, eingepasst; Wahrnehmung erscheint ohne Pause-Knopf, die Stimme fehlt.', tv: BROWSER,
    node: <Mirror state="live" name="Screen 1" place="Raum 1" display={TV_DISPLAY}><MirrorStage><Stage><Perception perception={WAKE_BASE} mirror/></Stage></MirrorStage></Mirror>},
  {id: 'mirror-unterbrochen', area: mirrorArea, title: 'Verbindung unterbrochen', caption: 'Der Server antwortet nicht mehr; das letzte Bild bleibt stehen.', tv: BROWSER,
    node: <Mirror state="unterbrochen" name="Screen 1" display={TV_DISPLAY}><MirrorStage><Stage offline/></MirrorStage></Mirror>},
  {id: 'mirror-offline', area: mirrorArea, title: 'Screen offline · letzter Stand', caption: 'Der Server antwortet, der Screen selbst ist offline.', tv: BROWSER,
    node: <Mirror state="offline" name="Screen 1" display={TV_DISPLAY}><MirrorStage><Stage/></MirrorStage></Mirror>},
  {id: 'mirror-nur-steuerung', area: mirrorArea, title: 'Nur für die Steuerung', caption: 'Spiegel ohne Anmeldung (401/403): ein Screen-Schlüssel öffnet keinen Spiegel.', tv: BROWSER,
    node: <Mirror state="kein-zugriff"><MirrorMessage heading="Nur für die Steuerung">Bitte zuerst in der <a>Steuerung</a> anmelden. Ein Screen-Schlüssel öffnet keinen Spiegel.</MirrorMessage></Mirror>},
  {id: 'mirror-nicht-gekoppelt', area: mirrorArea, title: 'Link nicht verfügbar (Spiegel)', caption: 'Spiegel eines Screens, den es nicht (mehr) gibt (404).', tv: BROWSER,
    node: <Mirror state="kein-zugriff"><MirrorMessage heading="Link nicht verfügbar">Dieser Screen ist nicht (mehr) gekoppelt.</MirrorMessage></Mirror>},
  {id: 'mirror-zu-viele', area: mirrorArea, title: 'Zu viele Abrufe', caption: 'Zu viele Abrufe (429): der Spiegel fragt erst nach einer Minute wieder.', tv: BROWSER,
    node: <Mirror state="kein-zugriff"><MirrorMessage heading="Zu viele Abrufe">Bitte in einer Minute erneut versuchen.</MirrorMessage></Mirror>},
  {id: 'mirror-app', area: mirrorArea, title: 'App auf dem Screen', caption: 'Auf dem Screen läuft eine App; Apps laufen nur dort und werden nicht gespiegelt.', tv: BROWSER,
    node: <Mirror state="live" name="Screen 1" display={TV_DISPLAY}><MirrorNotShown heading="App auf dem Screen">Apps laufen nur auf dem Screen selbst und werden nicht gespiegelt.</MirrorNotShown></Mirror>},
  {id: 'mirror-teilen-live', area: mirrorArea, title: 'Geteilter Screen · Live', caption: 'Öffentlicher Link: Gast-Freigabe, neutrale Kopfzeile ohne Namen, ohne Anwesenheit, Kamera und Wahrnehmung.', tv: BROWSER,
    node: <Mirror share state="live" display={TV_DISPLAY}><MirrorStage share><Stage eyebrow="Geteilter Screen" title="EdgePortal" camera={false}/></MirrorStage></Mirror>},
  {id: 'mirror-teilen-ungueltig', area: mirrorArea, title: 'Link nicht verfügbar', caption: 'Öffentlicher Link ungültig, abgelaufen oder widerrufen.', tv: BROWSER,
    node: <Mirror share state="kein-zugriff"><MirrorMessage heading="Link nicht verfügbar">Dieser Link ist ungültig, abgelaufen oder wurde widerrufen.</MirrorMessage></Mirror>},
  {id: 'mirror-nicht-geteilt', area: mirrorArea, title: 'Nicht geteilt', caption: 'Der Inhalt des Screens geht über den öffentlichen Link nicht hinaus.', tv: BROWSER,
    node: <Mirror share state="live" display={TV_DISPLAY}><MirrorNotShown share heading="Nicht geteilt">Dieser Inhalt wird über den öffentlichen Link nicht gezeigt.</MirrorNotShown></Mirror>},
];
