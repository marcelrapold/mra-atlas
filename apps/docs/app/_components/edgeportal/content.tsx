'use client';

// Inhalte, Screen-Client und die lokalen Pi-Seiten des EdgePortal-TVs. Markup und Klassen folgen dem Produkt
// (mra-edgeportal @ e46563c: components/content-view.tsx, operations-dashboard.tsx, argus-view.tsx, app-host.tsx,
// screen-client.tsx, adoption-code.tsx, deploy/kiosk/bootstrap.py, deploy/pi-setup/web/app/page.tsx und ambient.tsx).
// Styles als Kopie in brands/rapold/edgeportal/tv: screen.css (globals.css), pi-setup.css, bootstrap.css.
// Alle Daten sind neutrale Beispiele; QR-Codes sind Attrappen, Kamerabild und App-Inhalt Platzhalter.
// Links tragen kein Ziel und Knöpfe lösen nichts aus: der Rahmen ist ein Bild des TVs.
import type {ReactNode} from 'react';
import {ArrowRight, ExternalLink, Footprints, LayoutGrid, LogOut, Maximize2, Monitor, Music2, Radio, ScanFace, ScanLine, Shield, ShieldCheck, Smartphone, UserRound, Volume2, Wifi} from 'lucide-react';
import 'sonner/dist/styles.css';
import '../../../../../brands/rapold/edgeportal/tv/screen-nav.css';
import '../../../../../brands/rapold/edgeportal/tv/screen.css';
import '../../../../../brands/rapold/edgeportal/tv/pi-setup.css';
import '../../../../../brands/rapold/edgeportal/tv/bootstrap.css';
import identity from '../../../../../brands/rapold/identity.json';
import {css, placeholder, signet, type ViewEntry} from './shared';

/** Screen-Client und Pi-Seiten sind für 1080p gebaut: bei 1920 px ergibt die html-Schriftformel der globals.css genau 16 px. */
const TV = {width: 1920, height: 1080};

/** Feste QR-Attrappe: drei Suchmuster, Taktlinien und pseudozufällige Module. Sie codiert nichts. */
function fakeQr(seed: number, size: number) {
  let state = seed;
  const random = () => (state = state * 48271 % 2147483647) / 2147483647;
  const reserved = (x: number, y: number) => (x < 8 || x >= size - 8) && y < 8 || x < 8 && y >= size - 8;
  let path = [[0, 0], [size - 7, 0], [0, size - 7]].map(([x, y]) => `M${x + 4} ${y + 4}h7v7h-7zM${x + 5} ${y + 5}v5h5v-5zM${x + 6} ${y + 6}h3v3h-3z`).join('');
  for (let y = 0; y < size; y++) {
    let run = 0;
    for (let x = 0; x <= size; x++) {
      const dark = x < size && !reserved(x, y) && (x === 6 || y === 6 ? (x + y) % 2 === 0 : random() < .48);
      if (dark) run++;
      else if (run) { path += `M${x - run + 4} ${y + 4}h${run}v1h-${run}z`; run = 0; }
    }
  }
  const box = size + 8;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box} ${box}" shape-rendering="crispEdges"><rect width="${box}" height="${box}" fill="#fff"/><path fill="#000" fill-rule="evenodd" d="${path}"/></svg>`);
}
const ADOPTION_QR = fakeQr(20261018, 37);
const HOTSPOT_QR = fakeQr(8090, 33);
const CAMERA_IMAGE = placeholder('Kamerabild');
const APP_IMAGE = placeholder('App-Inhalt', '#0F2239');
const SIGNET_LIGHT = identity.publicBase + (identity.products.find(product => product.id === 'edgeportal')?.variants.light ?? '');

/* ---------- Bausteine aus components/shell.tsx und components/ui ---------- */

/** Signet ohne Variante: hell und dunkel übereinander, .dark entscheidet (globals.css). */
function Signet({size = 32}: {size?: number}) {
  const px = Math.max(24, size);
  return <span className="signet" style={{width: px, height: px}} aria-hidden="true">
    <img src={SIGNET_LIGHT} alt="" width={px} height={px} className="signet-light"/>
    <img src={signet('edgeportal')} alt="" width={px} height={px} className="signet-dark"/>
  </span>;
}

const Mark = () => <span className="brand"><Signet/><span>EdgePortal<span className="brand-domain">rapold.io</span></span></span>;

/** components/ui/button.tsx: die Tailwind-Klassen stehen als .ep-tw-* in tv/screen.css (Block «Übersetzung»). */
function Button({variant = 'default', extra, disabled, pressed, children}: {variant?: 'default' | 'outline' | 'ghost'; extra?: string; disabled?: boolean; pressed?: boolean; children: ReactNode}) {
  return <button type="button" tabIndex={-1} disabled={disabled} aria-pressed={pressed} className={`ep-tw-button ep-tw-${variant}${extra ? ` ${extra}` : ''}`}>{children}</button>;
}

/** components/ui/input.tsx, als .ep-tw-input. */
const Input = ({id, name, placeholder: hint, required}: {id: string; name: string; placeholder: string; required?: boolean}) =>
  <input id={id} name={name} required={required} maxLength={80} placeholder={hint} className="ep-tw-input" readOnly tabIndex={-1}/>;

/* ---------- Verbundener Screen (screen-client.tsx) ---------- */

type Bar = {name?: string; place?: string; online?: boolean};
const BAR: Bar = {name: 'Office-Display', place: 'Empfang'};

/** Verbundener Screen: Inhalt, darunter immer die Leiste (ausser auf der Bühne, die sie ausblendet). */
function ScreenView({bar = BAR, children}: {bar?: Bar; children: ReactNode}) {
  const online = bar.online ?? true;
  return <div className="ep-app dark">
    <main className="screen-view" data-toolbar={online ? 'hidden' : 'shown'}>
      {children}
      <footer className="screen-toolbar">
        <span><strong>{bar.name ?? 'Office-Display'}</strong><span>{bar.place || 'Eigenständiger Screen'}</span></span>
        <div>
          <span className={`connection ${online ? '' : 'offline'}`}>{online ? 'Verbunden' : 'Offline — letzter Inhalt'}</span>
          <Button variant="ghost"><Maximize2/><span>Vollbild</span></Button>
          <Button variant="ghost"><LogOut/><span>Verlassen</span></Button>
        </div>
      </footer>
    </main>
  </div>;
}

/** ScreenNavigator auf der Startansicht: nur der Zeiger-Knopf «Übersicht», unsichtbar bis sich die Maus bewegt (tv/screen-nav.css). */
const NavHome = () => <button type="button" tabIndex={-1} className="nav-pointer nav-pointer-home" data-shown="false"><LayoutGrid aria-hidden="true"/>Übersicht</button>;

/* ---------- Text (content-view.tsx, ContentBody) ---------- */

type Text = {theme?: 'ocean' | 'paper' | 'forest'; size?: 'compact' | 'normal' | 'large'; align?: 'left' | 'center'; title?: string; body?: string; link?: boolean; model?: string};
const WELCOME = {title: 'Willkommen zurück.', body: 'Heute um 14 Uhr: Rückblick auf das Quartal.\nKaffee steht im Besprechungsraum bereit.', link: true};

function TextContent({theme = 'ocean', size = 'normal', align = 'left', title = '', body = '', link = false, model}: Text) {
  return <div className={`display-content theme-${theme} text-${size} align-${align}`}>
    <span className="display-wordmark"><Signet size={28}/>EdgePortal</span>
    <div className="display-copy">
      <h2>{title || 'Platz für deinen nächsten Gedanken.'}</h2>
      <p>{body}</p>
      {link ? <a className="content-link">Inhalt öffnen <ExternalLink size={14}/></a> : null}
    </div>
    <div className="display-caption">{model ? <span>Modell: {model}</span> : <span>Dein Screen. Dein Kontext.</span>}</div>
  </div>;
}
const textScreen = (text: Text, bar?: Bar) => <ScreenView bar={bar}><TextContent {...text}/><NavHome/></ScreenView>;

/* ---------- Dashboard (operations-dashboard.tsx, argus-view.tsx) ---------- */

type Track = {title: string; artist: string};
type Radiox = {status: 'live' | 'stale' | 'unavailable'; checkedAt: string; failedAt?: string; playing?: Track; next?: Track};
type ArgusEvent = {type: 'start' | 'end' | 'face' | 'verdict'; person: true | null; at: string};
type Argus = {status: 'not-configured' | 'unavailable'; message: string}
  | {status: 'live' | 'stale'; camera: {key: string; device: string; camera: string; motion: boolean; since: string; imageStale?: boolean}; events: ArgusEvent[]};
const EVENT_TEXT: Record<ArgusEvent['type'], string> = {start: 'Bewegung', end: 'Ruhe', face: 'Gesicht', verdict: 'Person geprüft'};
const PLAYING: Pick<Radiox, 'playing' | 'next'> = {playing: {title: 'Midnight Signal (Extended Mix)', artist: 'Glass Harbour'}, next: {title: 'Northern Lights', artist: 'Tidewater'}};
const EVENTS: ArgusEvent[] = [
  {type: 'face', person: true, at: '21:16'}, {type: 'start', person: true, at: '21:15'},
  {type: 'end', person: null, at: '21:02'}, {type: 'verdict', person: null, at: '20:58'},
];
const CAMERA = {key: 'kamera-1', device: 'Gerät A', camera: 'Kamera 1'};

function ArgusPanel({data}: {data?: Argus}) {
  if (!data) return <div className="argus-panel"><p className="argus-note">Argus wird geprüft …</p></div>;
  if (!('camera' in data)) return <div className="argus-panel argus-empty">
    <span className="argus-orbit" aria-hidden="true"><Shield size={56}/></span>
    <h3>{data.status === 'not-configured' ? 'Noch nicht verbunden' : 'Argus gerade nicht erreichbar'}</h3>
    <p>{data.status === 'not-configured' ? 'Der Argus-Dienstzugang für EdgePortal ist noch nicht eingerichtet.' : data.message}</p>
  </div>;
  const {camera, events} = data;
  return <div className="argus-panel" data-motion={camera.motion}>
    <div className="argus-frame" data-failed={false}><img src={CAMERA_IMAGE} alt={`Kamerabild ${camera.key}`}/>{camera.imageStale ? <em>Bild veraltet</em> : null}</div>
    <div className="argus-meta">
      <span className="argus-cam"><span className="argus-dot" data-on={true}/>{`${camera.device} · ${camera.camera}`}</span>
      <span className="argus-motion" data-on={camera.motion}><Footprints aria-hidden="true"/>{camera.motion ? 'Bewegung' : 'ruhig'}{` seit ${camera.since}`}</span>
    </div>
    {events.length ? <ol className="argus-events" aria-label="Letzte Ereignisse">
      {events.map((event, index) => <li key={`${event.at}-${index}`}>
        {event.type === 'face' ? <ScanFace aria-hidden="true"/> : event.person === true ? <UserRound aria-hidden="true"/> : <Footprints aria-hidden="true"/>}
        <span>{EVENT_TEXT[event.type]}{event.type === 'face' ? (event.person === true ? ': bekannt' : ': unbekannt') : event.person === true ? ' mit Person' : ''}</span>
        <time>{event.at}</time>
      </li>)}
    </ol> : null}
  </div>;
}

/** Layout «operations». since: der Screen ist offline (stale) oder die Daten sind älter als 30 s. */
function OperationsDashboard({radio, argus, since}: {radio?: Radiox; argus?: Argus; since?: string}) {
  const state = !radio ? 'loading' : since !== undefined ? 'disconnected' : radio.status;
  const label = {loading: 'Wird geladen', live: 'Live-Daten', stale: 'Veraltet', unavailable: 'Nicht erreichbar', disconnected: 'Verbindung unterbrochen'}[state];
  const showTracks = radio && radio.status !== 'unavailable';
  return <section className="operations-dashboard">
    <header><span>EdgePortal · Office</span><h2>Dein Überblick.</h2>
      <p>RadioX &amp; Argus</p></header>
    <div className="operations-grid">
      <article className="radio-dashboard" data-state={state}>
        <div className="operations-heading"><Radio/><h3>RadioX Top</h3><span className="radio-state">{label}</span></div>
        <div className="radio-track"><Music2 aria-hidden="true"/><p>{state === 'live' ? 'Jetzt auf RadioX' : 'Zuletzt gemeldet'}</p>
          <h3>{!radio ? 'Verbindung wird geprüft …' : !showTracks ? 'Quelle momentan nicht erreichbar' : radio.playing?.title || 'Aktuell kein Titel gemeldet'}</h3>
          {showTracks && radio.playing?.artist ? <p>{radio.playing.artist}</p> : null}</div>
        {showTracks ? <div className="radio-next"><span>Danach</span>
          {radio.next?.title ? <><strong>{radio.next.title}</strong><p>{radio.next.artist}</p></> : <p>Noch nicht bekannt</p>}</div> : null}
        <footer>{!radio ? 'Live-Daten werden abgerufen'
          : state === 'disconnected' ? `Dieser Screen hat seit ${since} keine Verbindung. Angezeigt wird der letzte Stand.`
            : radio.status === 'stale' ? `Quelle seit ${radio.failedAt} nicht erreichbar · Stand ${radio.checkedAt}`
              : radio.status === 'unavailable' ? `Quelle nicht erreichbar · zuletzt versucht ${radio.failedAt}`
                : `Zuletzt geprüft: ${radio.checkedAt}`}
          <span>Automatisch alle 15 Sekunden · ohne Audio</span></footer>
      </article>
      <article className="argus-dashboard"><div className="operations-heading"><Shield/><h3>Argus</h3>
        <span className="radio-state">{!argus ? 'Wird geladen' : 'camera' in argus ? (argus.status === 'live' ? 'Live' : 'Veraltet') : 'Nicht verbunden'}</span></div>
        <ArgusPanel data={argus}/></article>
    </div>
  </section>;
}
const dashboardScreen = (props: Parameters<typeof OperationsDashboard>[0], bar?: Bar) =>
  <ScreenView bar={bar}><OperationsDashboard {...props}/><NavHome/></ScreenView>;

/* ---------- App-Host (app-host.tsx) ---------- */

type AppStatus = 'starting' | 'ready' | 'error' | 'stopped';
/** Beispiel-App mit der Fähigkeit input.navigation (Pfeiltasten). An der Stelle des iframes steht ein Platzhalter. */
function AppHost({status, sameOrigin = false}: {status: AppStatus; sameOrigin?: boolean}) {
  const text = {starting: 'App startet …', ready: 'App bereit', error: 'App nicht erreichbar oder Handshake fehlgeschlagen', stopped: 'App gestoppt'}[status];
  return <section className="app-host">
    <header><h2>Beispiel-App</h2><p role="status">{sameOrigin ? 'App benötigt einen separaten Origin.' : text}</p></header>
    {!sameOrigin && (status === 'starting' || status === 'ready') ? <div className="ep-app-frame" style={{backgroundImage: `url("${APP_IMAGE}")`}}/> : null}
    <div className="app-controls">
      <Button disabled={status !== 'ready'}>App bedienen</Button>
      <Button disabled={status === 'stopped'}>Stop</Button>
      <Button>Neu laden</Button>
      <Button pressed>Ton einschalten</Button>
      {['↑', '↓', '←', '→', 'Bestätigen', 'Zurück'].map(key => <Button key={key} disabled>{key}</Button>)}
    </div>
  </section>;
}
const appScreen = (status: AppStatus, sameOrigin = false) => <ScreenView><AppHost status={status} sameOrigin={sameOrigin}/></ScreenView>;

/* ---------- Nicht verbundener Screen (screen-client.tsx, adoption-code.tsx) ---------- */

function Onboarding({children, overlay}: {children: ReactNode; overlay?: ReactNode}) {
  return <div className="ep-app dark">
    <div className="login-page onboarding-page dark">
      <header className="login-header"><a aria-label="EdgePortal Steuerung"><Mark/></a></header>
      <main className="pair-page"><section className="pair-card">{children}</section></main>
    </div>
    {overlay}
  </div>;
}

const boot = (online: boolean, error?: string) => <Onboarding>
  <h1>Screen startet …</h1>
  <p>{online ? 'Verbindung wird geprüft.' : 'Server nicht erreichbar. Verbindung wird erneut geprüft.'}</p>
  {error ? <p role="alert" className="error-message">{error}</p> : null}
  <Button variant="outline">Neue Kopplung</Button>
</Onboarding>;

/** Wartet auf Übernahme (status «pending»), im Kiosk ohne «Zurück». */
const claim = ({open = false, online = true}: {open?: boolean; online?: boolean}) => <Onboarding>
  <p className="onboarding-ready">Netzwerk verbunden</p>
  <h1>Dein Screen.<br/>Ein Scan entfernt.</h1>
  <div className="adoption-qr">
    <img src={ADOPTION_QR} width={320} height={320} alt="QR-Code zum Übernehmen dieses Screens"/>
    <p>Mit dem Handy scannen, anmelden und diesen Screen übernehmen.</p>
    <a className="back-link">Übernahme-Link öffnen</a>
  </div>
  <details className="onboarding-details" open={open}><summary>Ohne Kamera verbinden</summary>
    <p>In deiner Steuerung diesen Screen hinzufügen:</p>
    <div className="pair-code">7F3A9C</div></details>
  <p className="small muted">Nach dem Hinzufügen erscheint dein Inhalt automatisch. Abgelaufene Codes werden automatisch erneuert.</p>
  {!online ? <p role="status">Verbindung unterbrochen. Ein neuer Versuch läuft automatisch.</p> : null}
</Onboarding>;

/** /screen im Browser ohne Kiosk: Name und Standort. Einzige Abweichung vom Text: der Platzhalter des Standorts nennt im Produkt
 *  einen realen Ort und steht hier neutral. Die ids tragen ein Präfix, weil die Ansicht zweimal auf der Seite steht. */
const nameForm = (prefix: string, overlay?: ReactNode) => <Onboarding overlay={overlay}>
  <h1>Dieser Screen gehört dazu.</h1>
  <p>Gib ihm einen Namen, damit du ihn in deiner Steuerung wiedererkennst.</p>
  <form onSubmit={event => event.preventDefault()}>
    <label htmlFor={`${prefix}-screen-name`}>Name des Screens</label>
    <Input id={`${prefix}-screen-name`} name="name" required placeholder="Office-Display"/>
    <label htmlFor={`${prefix}-screen-location`}>Standort <span className="muted">optional</span></label>
    <Input id={`${prefix}-screen-location`} name="location" placeholder="Büro"/>
    <Button extra="ep-tw-w-full ep-tw-mt-5">Kopplung starten</Button>
  </form>
  <a className="back-link">Zur Steuerung</a>
</Onboarding>;

/** Fehlermeldung über sonner (components/providers.tsx: oben rechts, richColors), Markup wie sonner 2.0.8, Stile aus dessen styles.css.
 *  Lage inline: die Phone-Regel von sonner richtet sich nach dem Atlas-Fenster, nicht nach dem TV. */
const RevokedToast = () => <section aria-label="Notifications alt+T" tabIndex={-1}>
  <ol dir="ltr" tabIndex={-1} data-sonner-toaster="true" data-sonner-theme="dark" data-y-position="top" data-x-position="right"
    style={css({'--front-toast-height': '54px', '--width': '356px', '--gap': '14px', '--offset-top': '24px', '--offset-right': '24px', '--offset-bottom': '24px', '--offset-left': '24px',
      '--mobile-offset-top': '0px', '--mobile-offset-right': '0px', '--mobile-offset-bottom': '0px', '--mobile-offset-left': '0px', top: 'var(--offset-top)', right: 'var(--offset-right)', left: 'auto', width: 'var(--width)'})}>
    <li tabIndex={-1} data-sonner-toast="" data-rich-colors="true" data-styled="true" data-mounted="true" data-promise="false" data-swiped="false" data-removed="false"
      data-visible="true" data-y-position="top" data-x-position="right" data-index="0" data-front="true" data-swiping="false" data-dismissible="true" data-type="error"
      data-invert="false" data-swipe-out="false" data-expanded="false" style={css({'--index': 0, '--toasts-before': 0, '--z-index': 1, '--offset': '0px', '--initial-height': '54px'})}>
      <div data-icon=""><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg></div>
      <div data-content=""><div data-title="">Kopplung abgelaufen oder aufgehoben. Bitte neu koppeln.</div></div>
    </li>
  </ol>
</section>;

/* ---------- Kiosk-Startseite (deploy/kiosk/bootstrap.py) ---------- */

const kioskBoot = (late: boolean) => <div className="ep-boot"><main><small>EDGEPORTAL</small><h1>Dein Screen startet.</h1>
  <p>{late ? 'Der WLAN-Dienst ist noch nicht erreichbar. EdgePortal versucht es weiter. Diagnose: edgeportal-setup.log auf der SD-Karte.'
    : 'Der lokale WLAN-Dienst wird vorbereitet. Beim ersten Start kann das einige Minuten dauern.'}</p>
  <p>Die Einrichtung geht automatisch weiter, sobald der Dienst bereit ist.</p></main></div>;

/* ---------- Pi-Einrichtung auf dem TV (deploy/pi-setup/web/app) ---------- */

// ambient.tsx: feste Geometrie wie im Produkt; die Farbe ist hier fest auf 16 Uhr (daylight.ts), nicht auf die Uhr des Betrachters.
const NODES = [[70, 130], [260, 70], [420, 240], [160, 360], [30, 600], [340, 720], [570, 570], [750, 110], [910, 280], [1130, 80], [1390, 190], [1530, 420], [1300, 580], [1460, 790], [1080, 750], [830, 640], [660, 850]];
const EDGES = [[0, 1], [0, 3], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 15], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [12, 14], [14, 15], [15, 16]];
const DAYLIGHT = ['#167dcc42', '#7b54df30', '#22bfa526'];

const Ambient = () => <div className="setup-ambient" aria-hidden="true" style={css({'--ambient-a': DAYLIGHT[0], '--ambient-b': DAYLIGHT[1], '--ambient-c': DAYLIGHT[2]})}>
  <div className="setup-aurora setup-aurora-blue"/>
  <div className="setup-aurora setup-aurora-violet"/>
  <div className="setup-aurora setup-aurora-teal"/>
  <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <g className="setup-net-lines">{EDGES.map(([a, b]) => <line key={`${a}-${b}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]}/>)}</g>
    <g className="setup-net-nodes">{NODES.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 3 : 1.8}/>)}</g>
    {EDGES.filter((_, i) => i % 3 === 0).map(([a, b], i) => <circle key={i} className="setup-net-pulse" r="3" style={css({
      '--from-x': `${NODES[a][0]}px`, '--from-y': `${NODES[a][1]}px`, '--to-x': `${NODES[b][0]}px`, '--to-y': `${NODES[b][1]}px`,
      animationDuration: `${12 + i * 2}s`, animationDelay: `${-i * 3}s`})}/>)}
  </svg>
</div>;

type PiMode = 'starting' | 'setup' | 'connecting' | 'connected' | 'offline' | 'error';
/** Die Seite lokal am TV (state.local): Ton wie beim ersten Start aus. Setup-WLAN und Passwort sind Beispielwerte; die Adresse
 *  10.42.0.1 steht so im Produkt (Standard des NetworkManager-Hotspots). Audio-Elemente entfallen. */
function PiSetup({mode, message = '', lost = false}: {mode: PiMode; message?: string; lost?: boolean}) {
  const setup = mode === 'setup';
  const hotspot = setup || mode === 'connecting';
  const statusLabel = setup ? 'Setup-WLAN bereit' : mode === 'connecting' ? 'Verbindung läuft' : mode === 'connected' ? 'Netzwerk verbunden'
    : mode === 'offline' || mode === 'error' ? 'Verbindung prüfen' : 'EdgePortal startet';
  return <div className="ep-app ep-pi dark">
    <Ambient/>
    <main className="setup-shell setup-tv">
      <header className="setup-header"><div className="setup-logo"><span className="setup-logomark"><Monitor aria-hidden="true" size={24}/></span>EdgePortal</div>
        <span className={`setup-status${setup ? ' is-ready' : ''}`}><span aria-hidden="true"/>{statusLabel}</span></header>
      <section className="setup-intro"><div>
        <h1>{mode === 'connected' ? 'WLAN verbunden.' : mode === 'connecting' ? 'Wir verbinden dich.' : 'Handy scannen.\nWLAN verbinden.'}</h1>
        <p>Die Einrichtung erledigst du auf deinem Handy.</p>
        <div className="setup-voice"><button type="button" tabIndex={-1} disabled><Volume2 size={16} aria-hidden="true"/>Setup-Anleitung anhören</button><span>AEON · English</span><a lang="en">Read instructions</a></div>
      </div>
      <ol className="setup-steps" aria-label="Einrichtungsschritte"><li aria-current="step"><span>01</span><Wifi size={17} aria-hidden="true"/>Netzwerk</li><li><span>02</span><ScanLine size={17} aria-hidden="true"/>Übernahme</li><li><span>03</span><Monitor size={17} aria-hidden="true"/>Dein Screen</li></ol></section>
      <div className="setup-voice setup-music">
        <button type="button" tabIndex={-1} aria-pressed={true}>Ton einschalten</button>
        <button type="button" tabIndex={-1} disabled><Volume2 size={16} aria-hidden="true"/>Ambient-Musik abspielen</button>
        <span>Floating Cities · Kevin MacLeod · Loop</span><a>Musik &amp; Lizenz</a>
      </div>
      <div className="setup-grid">
        {hotspot ? <section className="setup-card setup-pairing"><div className="setup-card-heading"><Smartphone size={23} aria-hidden="true"/><div><small>Auf deinem Handy</small><h2>Scannen &amp; verbinden</h2></div></div>
          <div className="setup-qr-stage"><div className="setup-qr-frame"><img className="setup-qr" src={HOTSPOT_QR} alt="QR-Code zum Verbinden mit dem Setup-WLAN" width={224} height={224}/></div><span><ScanLine size={15} aria-hidden="true"/>Handy-Kamera öffnen</span></div>
          <p className="setup-pairing-hint">Bei «Kein Internet» in diesem WLAN bleiben. Die Einrichtung funktioniert auch offline.</p>
          <div className="setup-credentials"><div className="setup-data"><small>Setup-WLAN</small><strong>EdgePortal-Setup-ABC123</strong></div><div className="setup-data"><small>Hotspot-Passwort</small><strong>Beispiel-Passwort</strong></div></div>
          <div className="setup-address"><div><small>Öffnet sich am Handy. Falls nicht, öffne:</small><strong>http://10.42.0.1</strong></div><ArrowRight size={20} aria-hidden="true"/></div>
        </section> : <section className="setup-card setup-pairing setup-connection"><div className="setup-connection-icon"><Radio size={35} aria-hidden="true"/></div>
          <h2>{mode === 'connected' ? 'WLAN verbunden' : 'Verbindung wird geprüft'}</h2>
          <p>{mode === 'connected' ? 'EdgePortal wird geöffnet. Wenn es hier nicht weitergeht, prüfe den Internetzugang dieses WLANs.' : message || 'Der Einrichtungsdienst startet automatisch.'}</p>
          {mode === 'connected' && <p><a>EdgePortal jetzt öffnen</a></p>}
          {(mode === 'offline' || mode === 'connected' || mode === 'error') && <button type="button" tabIndex={-1}>WLAN einrichten oder ändern</button>}
        </section>}
      </div>
      {lost && <p className="setup-message" role="status">Verbindung zum Einrichtungsdienst unterbrochen. Wir versuchen es erneut.</p>}
      <footer className="setup-footer"><span><ShieldCheck size={15} aria-hidden="true"/>Deine WLAN-Daten bleiben auf diesem Pi.</span><span>AI auf jedem Screen.</span></footer>
    </main>
  </div>;
}

/* ---------- Katalog ---------- */

const inhalte = 'Inhalte';
const kopplung = 'Kopplung und Start';
const pi = 'Pi lokal';

export const contentViews: ViewEntry[] = [
  {id: 'content-text-ozean', area: inhalte, tv: TV, title: 'Text, Thema Ozean', caption: 'Inhalt «Text» mit Thema ocean: Wortmarke, Titel, Text, «Inhalt öffnen» bei einem gültigen http(s)-Link und die Leiste des Screens.',
    node: textScreen({...WELCOME})},
  {id: 'content-text-papier', area: inhalte, tv: TV, title: 'Text, Thema Papier', caption: 'Thema paper: helle Fläche mit dunkler Schrift, ohne Link.',
    node: textScreen({theme: 'paper', title: 'Ruhige Woche.', body: 'Keine offenen Freigaben. Die nächste Sitzung beginnt am Montag um 9 Uhr.'})},
  {id: 'content-text-wald', area: inhalte, tv: TV, title: 'Text, Thema Wald', caption: 'Thema forest; stammt der Text von einem Modell, nennt die Fusszeile «Modell: …» statt «Dein Screen. Dein Kontext.».',
    node: textScreen({theme: 'forest', title: 'Alles im grünen Bereich.', body: 'Die Sicherung von heute Nacht ist vollständig. Alle Dienste laufen.', model: 'gemma4 31b'})},
  {id: 'content-text-kompakt', area: inhalte, tv: TV, title: 'Text kompakt', caption: 'Screen-Einstellung Textgrösse «compact»: Titel und Text auf 85 %.',
    node: textScreen({...WELCOME, size: 'compact'})},
  {id: 'content-text-gross', area: inhalte, tv: TV, title: 'Text gross', caption: 'Textgrösse «large»: Titel und Text auf 125 %.',
    node: textScreen({...WELCOME, size: 'large'})},
  {id: 'content-text-zentriert', area: inhalte, tv: TV, title: 'Text zentriert', caption: 'Screen-Einstellung Ausrichtung «center»: Text mittig, der Titelblock zentriert.',
    node: textScreen({...WELCOME, align: 'center'})},
  {id: 'content-text-leer', area: inhalte, tv: TV, title: 'Platz für deinen nächsten Gedanken.', caption: 'Inhalt ohne Titel: der Screen setzt diesen Ersatztitel, ein leerer Text bleibt leer.',
    node: textScreen({})},
  {id: 'content-dashboard-live', area: inhalte, tv: TV, title: 'Dashboard: Live-Daten', caption: 'Layout «operations»: RadioX Top mit laufendem und nächstem Titel, Argus mit Kamerabild, Bewegung und den letzten Ereignissen.',
    node: dashboardScreen({radio: {status: 'live', checkedAt: '21:18', ...PLAYING}, argus: {status: 'live', camera: {...CAMERA, motion: true, since: '21:15'}, events: EVENTS}})},
  {id: 'content-dashboard-laden', area: inhalte, tv: TV, title: 'Dashboard: Wird geladen', caption: 'Vor den ersten Daten: «Verbindung wird geprüft …» und «Argus wird geprüft …».',
    node: dashboardScreen({})},
  {id: 'content-dashboard-veraltet', area: inhalte, tv: TV, title: 'Dashboard: Veraltet', caption: 'RadioX-Quelle seit dem letzten guten Abruf nicht erreichbar, Argus mit alten Daten: Status in Warnfarbe, Titel gedämpft, «Bild veraltet».',
    node: dashboardScreen({radio: {status: 'stale', checkedAt: '21:11', failedAt: '21:12', ...PLAYING}, argus: {status: 'stale', camera: {...CAMERA, motion: false, since: '21:02', imageStale: true}, events: EVENTS.slice(2)}})},
  {id: 'content-dashboard-nicht-erreichbar', area: inhalte, tv: TV, title: 'Dashboard: Nicht erreichbar', caption: 'RadioX ohne letzten guten Stand, Argus gerade nicht erreichbar: keine Titel, Kreis mit Schild und die Meldung des Servers.',
    node: dashboardScreen({radio: {status: 'unavailable', checkedAt: '', failedAt: '21:16'}, argus: {status: 'unavailable', message: 'Argus nicht erreichbar'}})},
  {id: 'content-dashboard-getrennt', area: inhalte, tv: TV, title: 'Dashboard: Verbindung unterbrochen', caption: 'Screen offline oder Daten älter als 30 s: letzter Stand mit Hinweis, Leiste «Offline — letzter Inhalt»; Argus hier noch nicht eingerichtet.',
    node: dashboardScreen({radio: {status: 'live', checkedAt: '21:14', ...PLAYING}, argus: {status: 'not-configured', message: 'Noch nicht verbunden'}, since: '21:14'}, {...BAR, online: false})},
  {id: 'content-app-startet', area: inhalte, tv: TV, title: 'App startet …', caption: 'Zugewiesene App lädt im iframe (hier Platzhalter) und hat 10 s für den Handshake «ready».',
    node: appScreen('starting')},
  {id: 'content-app-bereit', area: inhalte, tv: TV, title: 'App bereit', caption: 'Die App hat «ready» gemeldet: «App bedienen» wird aktiv, Pfeiltasten erst mit Fokus.',
    node: appScreen('ready')},
  {id: 'content-app-fehler', area: inhalte, tv: TV, title: 'App nicht erreichbar oder Handshake fehlgeschlagen', caption: 'Kein «ready» nach 10 s, Ladefehler oder «error» der App: das iframe verschwindet.',
    node: appScreen('error')},
  {id: 'content-app-gestoppt', area: inhalte, tv: TV, title: 'App gestoppt', caption: '«Stop» gedrückt oder die App hat sich selbst beendet.',
    node: appScreen('stopped')},
  {id: 'content-app-origin', area: inhalte, tv: TV, title: 'App benötigt einen separaten Origin.', caption: 'Die App läge auf dem Origin von EdgePortal: kein iframe, kein Handshake.',
    node: appScreen('starting', true)},
  {id: 'content-app-nicht-verfuegbar', area: inhalte, tv: TV, title: 'App nicht verfügbar', caption: 'Die zugewiesene App ist deaktiviert oder entfernt.',
    node: <ScreenView><section role="alert"><h2>App nicht verfügbar</h2><p>Die zugewiesene App wurde deaktiviert oder entfernt. Bitte in der Steuerung neu zuweisen.</p></section></ScreenView>},

  {id: 'screen-start', area: kopplung, tv: TV, title: 'Screen startet …', caption: 'Kiosk (/screen?boot=1) vor der ersten Antwort oder beim Anmelden ohne gespeicherten Schlüssel.',
    node: boot(true)},
  {id: 'screen-start-offline', area: kopplung, tv: TV, title: 'Screen startet … (Server nicht erreichbar)', caption: 'Schlüssel gespeichert, aber /api/screen antwortet nicht; der Screen fragt jede Sekunde neu.',
    node: boot(false)},
  {id: 'screen-start-speicher', area: kopplung, tv: TV, title: 'Browser-Speicher nicht verfügbar', caption: 'Der Browser sperrt den Speicher für den Schlüssel: Hinweis unter dem Starttext.',
    node: boot(true, 'Browser-Speicher ist nicht verfügbar. Bitte Speicher für diese Seite erlauben und neu laden.')},
  {id: 'screen-qr', area: kopplung, tv: TV, title: 'Dein Screen. Ein Scan entfernt.', caption: 'Kopplung angefordert, der Screen wartet auf Übernahme: QR-Code (hier eine Attrappe) und Übernahme-Link.',
    node: claim({})},
  {id: 'screen-qr-code', area: kopplung, tv: TV, title: 'Ohne Kamera verbinden', caption: 'Aufgeklappt: der sechsstellige Kopplungscode zum Eintippen in der Steuerung.',
    node: claim({open: true})},
  {id: 'screen-qr-offline', area: kopplung, tv: TV, title: 'Verbindung unterbrochen', caption: 'Wartet auf Übernahme, der Server ist gerade nicht erreichbar.',
    node: claim({online: false})},
  {id: 'screen-name', area: kopplung, tv: TV, title: 'Dieser Screen gehört dazu.', caption: '/screen im Browser ohne Kiosk und ohne Schlüssel: Name und Standort für die Kopplung.',
    node: nameForm('screen-name')},
  {id: 'screen-aufgehoben', area: kopplung, tv: TV, title: 'Kopplung abgelaufen oder aufgehoben', caption: 'Kopplung in der Steuerung aufgehoben (401): Meldung oben rechts und das Formular; der Kiosk startet stattdessen still mit «Screen startet …» neu.',
    node: nameForm('screen-aufgehoben', <RevokedToast/>)},
  {id: 'screen-leiste', area: kopplung, tv: TV, title: 'Verbunden', caption: 'Leiste unten am verbundenen Screen: Name, Sitzung oder Standort, «Verbunden», Vollbild und Verlassen; hier in einer Sitzung.',
    node: textScreen({...WELCOME}, {name: 'Office-Display', place: 'Wochenstart'})},
  {id: 'screen-leiste-offline', area: kopplung, tv: TV, title: 'Offline — letzter Inhalt', caption: 'Abfrage fehlgeschlagen: Punkt und Text in Rot, der letzte Inhalt bleibt stehen.',
    node: textScreen({...WELCOME}, {...BAR, online: false})},
  {id: 'screen-leiste-eigenstaendig', area: kopplung, tv: TV, title: 'Eigenständiger Screen', caption: 'Weder Sitzung noch Standort gesetzt.',
    node: textScreen({...WELCOME}, {name: 'Office-Display'})},

  {id: 'pi-kiosk-start', area: pi, tv: TV, title: 'Dein Screen startet.', caption: 'Kiosk ohne erreichbares Portal: Startseite auf 127.0.0.1:8091, bis der lokale WLAN-Dienst bereit ist.',
    node: kioskBoot(false)},
  {id: 'pi-kiosk-start-90s', area: pi, tv: TV, title: 'Dein Screen startet. (nach 90 s)', caption: 'Dienst nach 90 s noch nicht bereit: Hinweis auf das Protokoll auf der SD-Karte.',
    node: kioskBoot(true)},
  {id: 'pi-start', area: pi, tv: TV, title: 'EdgePortal startet', caption: 'Einrichtungsseite auf 127.0.0.1:8090, der Netzwerkdienst startet (mode «starting»).',
    node: <PiSetup mode="starting" message="Netzwerk wird gestartet."/>},
  {id: 'pi-setup', area: pi, tv: TV, title: 'Handy scannen. WLAN verbinden.', caption: 'Kein WLAN gespeichert: Setup-WLAN aktiv, QR-Code (Attrappe) mit Netzname und Passwort (Beispielwerte).',
    node: <PiSetup mode="setup"/>},
  {id: 'pi-verbindet', area: pi, tv: TV, title: 'Wir verbinden dich.', caption: 'WLAN-Daten vom Handy übergeben: der Pi wechselt ins gewählte WLAN, die Hotspot-Karte bleibt bis dahin stehen.',
    node: <PiSetup mode="connecting"/>},
  {id: 'pi-verbunden', area: pi, tv: TV, title: 'WLAN verbunden.', caption: 'WLAN steht, EdgePortal antwortet noch nicht; sobald es antwortet, öffnet die Seite /screen?boot=1.',
    node: <PiSetup mode="connected"/>},
  {id: 'pi-offline', area: pi, tv: TV, title: 'Verbindung prüfen', caption: 'Gespeichertes WLAN nicht erreichbar, der Pi versucht es automatisch weiter.',
    node: <PiSetup mode="offline" message="Gespeichertes Netzwerk nicht erreichbar. Verbindung wird automatisch erneut versucht."/>},
  {id: 'pi-fehler', area: pi, tv: TV, title: 'Verbindung prüfen (Fehler)', caption: 'NetworkManager antwortet nicht; ebenso «Setup-WLAN: … fehlgeschlagen» mit neuem Versuch nach 30 s.',
    node: <PiSetup mode="error" message="Netzwerkdienst noch nicht verfügbar. Bitte warten oder LAN anschliessen."/>},
  {id: 'pi-status-weg', area: pi, tv: TV, title: 'Einrichtungsdienst unterbrochen', caption: '/api/status antwortet nicht: Zeile über der Fusszeile, der letzte Stand bleibt stehen.',
    node: <PiSetup mode="setup" lost/>},
];
