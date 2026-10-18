'use client';

import {Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react';
import {Clapperboard, EyeOff, OctagonX, Radio, ScanFace, Tv, Volume2, VolumeX} from 'lucide-react';
import identity from '../../../../brands/rapold/identity.json';
import ci from '../../../../brands/rapold/edgeportal/edgeportal.json';
// Der TV-Stand kommt als Kopie aus dem Produkt (brands/rapold/edgeportal/tv), geladen mit der Brand-Seite.
import '../../../../brands/rapold/edgeportal/tv/stage.css';
import '../../../../brands/rapold/edgeportal/tv/presence.css';
import '../../../../brands/rapold/edgeportal/tv/screen-nav.css';
import '../../../../brands/rapold/edgeportal/tv/tv-power.css';
import '../../../../brands/rapold/edgeportal/edgeportal.css';

type Level = 'bereit' | 'arbeitet' | 'frage' | 'dialog' | 'haengt' | 'aus';
type DemoAgent = {name: string; color: string; role: string; level: Level; since: string; model: string; fallback?: string; autonomy: 'fragt' | 'meldet' | 'voll'};
const base = identity.publicBase;
const signet = (id: string) => base + (identity.products.find(product => product.id === id)?.variants.dark ?? '');
const level = Object.fromEntries(ci.tv.states.agent.map(state => [state.id, state])) as unknown as Record<Level, {word: string; shape: string}>;
const css = (vars: Record<string, string | number>) => vars as CSSProperties;

// Platzhalter-Porträt: eine Büste in Agentfarbe. Die echten Kino-Porträts kommen aus dem Agents-System und sind nicht Teil von Atlas.
const portrait = (color: string) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"><defs><radialGradient id="g" cx="50%" cy="34%" r="70%"><stop offset="0" stop-color="#142741"/><stop offset="1" stop-color="#02060F"/></radialGradient><linearGradient id="r" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${color}" stop-opacity=".05"/><stop offset="1" stop-color="${color}" stop-opacity=".7"/></linearGradient></defs><rect width="600" height="800" fill="url(#g)"/><path d="M300 150c-72 0-122 60-122 146 0 66 31 121 72 144v40c-96 20-178 76-206 168v152h512V648c-28-92-110-148-206-168v-40c41-23 72-78 72-144 0-86-50-146-122-146z" fill="#0B1528" stroke="url(#r)" stroke-width="5"/><path d="M214 278c26-18 60-26 86-26s60 8 86 26" fill="none" stroke="${color}" stroke-opacity=".45" stroke-width="10" stroke-linecap="round"/></svg>`);

const AEON: DemoAgent = {name: 'ÆON', color: '#009DFF', role: 'AI-Operator', level: 'bereit', since: 'seit 4 h 20 min', model: 'gemma4 31b', fallback: 'Einstellung', autonomy: 'voll'};
const AETHRA: DemoAgent = {name: 'ÆTHRA', color: '#7C5CFF', role: 'AI-Operatorin', level: 'bereit', since: 'seit 4 h 15 min', model: 'gemma4 31b', fallback: 'Einstellung', autonomy: 'voll'};

function Poster({agent}: {agent: DemoAgent}) {
  const waiting = agent.level === 'frage' || agent.level === 'dialog';
  return <article className="stage-agent is-poster" data-level={agent.level} data-speaking="false" data-compact="false" style={css({'--agent': agent.color})}>
    <div className="stage-agent-head">
      <div className="stage-avatar is-poster" data-level={agent.level} data-speaking="false" data-kind="kino" style={css({'--agent': agent.color})}>
        <span className="stage-avatar-ring" aria-hidden="true"/>
        <div className="stage-avatar-media"><div className="stage-avatar-layer is-top"><img src={portrait(agent.color)} alt=""/></div></div>
      </div>
      <div className="stage-agent-id">
        <h2>{agent.name}</h2>
        <div className="stage-model"><span className="stage-model-name">{agent.model}</span>{agent.fallback && <span className="stage-model-fallback">Ersatz<span> · {agent.fallback}</span></span>}</div>
        <p>{agent.role}</p>
        <span className="stage-state" data-level={agent.level}><span className="stage-state-form" aria-hidden="true">{level[agent.level].shape}</span><span>{level[agent.level].word}</span><span className="stage-state-since">{agent.since}</span></span>
        <div className="stage-autonomy" data-level={agent.autonomy}><span className="stage-autonomy-level" aria-hidden="true">{agent.autonomy}</span></div>
      </div>
    </div>
    {waiting && <p className="stage-agent-flag" data-level={agent.level}>{agent.level === 'dialog' ? 'Braucht dich' : 'Frage an dich'}</p>}
  </article>;
}

function Stage({agents, guest = false, attention, children}: {agents: DemoAgent[]; guest?: boolean; attention?: DemoAgent; children?: ReactNode}) {
  return <section className="stage ambience-aurora radio-leiste" data-preview="false" data-attention={attention ? 'true' : 'false'} data-lowpower="false" data-mode="dark" data-motion="full" data-overscan="false" data-agents="true"
    style={css({'--accent': '#38B8FF', '--agent-a': agents[0].color, '--agent-b': agents[1]?.color ?? '#38B8FF', '--overscan': 0})}>
    <div className="stage-ambience" aria-hidden="true"><span/><span/><span/></div>
    <header className="stage-header">
      <div className="stage-brand">
        <img className="signet" src={signet('edgeportal')} width={48} height={48} alt=""/>
        <div><span className="stage-eyebrow">Agents · Home</span><strong>AI Fabric<span className="stage-glut" aria-hidden="true">◆</span></strong></div>
      </div>
      {attention && <div className="stage-attention" role="alert"><span data-level={attention.level} style={css({'--agent': attention.color})}><span className="stage-attention-form" aria-hidden="true">{level[attention.level].shape}</span><strong>{attention.name}</strong> {attention.level === 'dialog' ? 'braucht dich' : 'hat eine Frage'}</span></div>}
      <div className="stage-status">
        <span className="stage-voice"><Volume2 aria-hidden="true"/>Stimme an</span>
        <time className="stage-clock"><strong>21:18</strong><span>Sonntag, 18. Oktober</span></time>
      </div>
    </header>
    <div className="stage-body">
      <div className="stage-agents view-buehne" data-count={agents.length} style={css({'--count': agents.length})}>{agents.map(agent => <Poster key={agent.name} agent={agent}/>)}</div>
      <section className="stage-radio placement-leiste" data-state="live" aria-label="RadioX">
        <div className="stage-radio-cover"><Radio aria-hidden="true"/></div>
        <div className="stage-radio-main">
          <div className="stage-radio-kicker"><span className="stage-eyebrow">RadioX · 2026</span><span className="stage-live"><span className="stage-live-dot" aria-hidden="true"/>Live</span></div>
          <h3>Midnight Signal (Extended Mix)</h3>
          <p className="stage-radio-artist">Glass Harbour</p>
          <div className="stage-radio-progress" aria-hidden="true"><span style={{transform: 'scaleX(.9)'}}/><small>3:54</small><small>4:20</small></div>
          <div className="stage-radio-meta"><span>Danach: <strong>Northern Lights</strong> · Tidewater</span><span>On Air: <strong>ÆON</strong></span></div>
        </div>
        <div className="stage-radio-stream" data-state="aus" title="Stream"><VolumeX aria-hidden="true"/><span>Stream auf dem Screen</span></div>
      </section>
    </div>
    {guest && <div className="presence-dock" aria-label="Anwesenheit"><span className="presence-badge" data-kind="private"><EyeOff aria-hidden="true"/>Gast im Raum · Privates ausgeblendet</span></div>}
    <span className="presence-camera"><ScanFace aria-hidden="true"/>Kamera mit Gesichtserkennung aktiv</span>
    {children}
  </section>;
}

// Virtueller TV in Originalauflösung, als Ganzes auf die Rahmenbreite verkleinert.
const TV_WIDTH = 3840;
function Frame({label, caption, wide = false, children}: {label: string; caption: ReactNode; wide?: boolean; children: ReactNode}) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(wide ? 1200 / TV_WIDTH : 600 / TV_WIDTH);
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / TV_WIDTH));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <figure className={`ep-ci-figure${wide ? ' ep-ci-wide' : ''}`}>
    <div className="ep-tv-frame" ref={frame} role="img" aria-label={label}><div className="ep-tv-screen" style={{transform: `scale(${scale})`}}>{children}</div></div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

const launcherTiles = [
  {kind: 'buehne', icon: Tv, eyebrow: 'Start', title: 'Bühne', status: 'Zuletzt hier · Konfigurierte Ansicht', focused: true, current: true},
  {kind: 'radiox', icon: Radio, eyebrow: 'Radio', title: 'RadioX', status: 'Live-Radio im Vollbild'},
  {kind: 'szene', icon: Clapperboard, eyebrow: 'Szene', title: 'Abend mit Radio', status: ''},
  {kind: 'notbremse', icon: OctagonX, eyebrow: 'Agents', title: 'Notbremse', status: 'Alle Agents sofort anhalten · OK zweimal'},
];

function Launcher() {
  return <div className="nav-layer"><section className="nav-overview" aria-label="Übersicht">
    <header className="nav-head"><span className="nav-eyebrow">EdgePortal · Übersicht</span><h1>Übersicht<span className="nav-glut" aria-hidden="true">◆</span></h1></header>
    <div className="nav-grid" style={css({'--cols': 4})} role="list">{launcherTiles.map((tile, index) => {
      const Icon = tile.icon;
      return <div role="listitem" key={tile.kind}><span className="nav-tile" data-focused={tile.focused ? 'true' : 'false'} data-kind={tile.kind} aria-current={tile.current ? 'page' : undefined}>
        <span className="nav-thumb"><span className="nav-thumb-icon"><Icon aria-hidden="true" strokeWidth={1.5}/></span></span>
        <span className="nav-tile-text"><span className="nav-eyebrow">{index + 1} · {tile.eyebrow}</span><strong>{tile.title}</strong><span className="nav-status">{tile.status}</span></span>
      </span></div>;
    })}</div>
    <p className="nav-keys">◀ ▶ ▲ ▼ wählen · OK öffnen · Zurück: «Bühne» · 0: Start</p>
  </section></div>;
}

const swatch = (name: string, value: string) => <li key={name}><i style={{background: value}}/><span>--{name}<code>{value}</code></span></li>;

export default function RapoldEdgePortal() {
  const t = ci.tv;
  return <section className="doc-section" id="edgeportal-ci" aria-labelledby="edgeportal-ci-title">
    <h2 id="edgeportal-ci-title">EdgePortal: der TV, wie er ist</h2>
    <p>{ci.essence}</p>
    <p>{t.rule} Quelle: {ci.reference.repository}, Commit <code>{ci.reference.commit}</code>; die Stylesheets liegen als Kopie in <code>{ci.reference.copies}</code>. {ci.privacy}</p>
    <div className="ep-ci-principles">{ci.principles.map(principle => <div key={principle.id}><h3>{principle.name}</h3><p>{principle.rule}</p></div>)}</div>

    <h3 className="ep-ci-h">Am TV<span>{t.status}</span></h3>
    <p className="ep-ci-lead">Gebaut aus dem echten Markup und den kopierten Stylesheets. Jeder Rahmen ist ein virtueller Fernseher mit 3840 × 2160 Pixeln, als Ganzes verkleinert. Porträts sind Platzhalter, Namen und Titel Beispiele.</p>
    <div className="ep-ci-gallery">
      <Frame wide label="Bühne mit zwei Agents, Gast im Raum, RadioX als Leiste" caption={<><strong>Bühne</strong> · Gast im Raum. So steht der Wohnzimmer-Screen heute da: Poster-Karten, RadioX-Leiste, Präsenz oben, Kamerahinweis unten.</>}>
        <Stage agents={[AEON, AETHRA]} guest/>
      </Frame>
      <Frame label="Bühne mit einer Frage an dich" caption={<><strong>Bühne</strong> · Aufmerksamkeit: Tonrahmen, Hinweis in der Kopfzeile und Wort, ohne Pulsieren.</>}>
        <Stage agents={[{...AEON, level: 'arbeitet', since: 'seit 12 min', fallback: undefined, autonomy: 'meldet'}, {...AETHRA, level: 'frage', since: 'seit 2 min', fallback: undefined}]} attention={{...AETHRA, level: 'frage'}}/>
      </Frame>
      <Frame label="Übersicht mit vier Kacheln" caption={<><strong>Übersicht</strong> · Zurück-Taste. Die Notbremse braucht zweimal OK.</>}>
        <Launcher/>
      </Frame>
      <Frame label="TV an: Grussformel über der Bühne" caption={<><strong>TV an</strong> · {t.greetings.timing}</>}>
        <Stage agents={[AEON, AETHRA]}><div className="tv-power" data-phase="message" data-action="an"><div className="tv-power-black"/><p className="tv-power-message">Guten Abend</p></div></Stage>
      </Frame>
    </div>

    <h3 className="ep-ci-h">Werte am TV<span>aus {ci.reference.files[0]}</span></h3>
    <div className="ep-ci-facts">
      <div><h4>Rollen</h4><ul className="ep-ci-swatches">{Object.entries(t.tokens.roles).map(([name, value]) => swatch(name, value))}</ul></div>
      <div><h4>Flächen und Identität</h4><ul className="ep-ci-swatches">{Object.entries({...t.tokens.surfaces, ...t.tokens.identity}).map(([name, value]) => swatch(name, value))}</ul></div>
      <div><h4>Skalierung</h4><dl>
        <dt>Grundschrift</dt><dd><code>{t.scale.fs}</code></dd>
        <dt>Designpixel</dt><dd>{t.scale.px}</dd>
        <dt>Rand</dt><dd>{t.scale.edgeX}; {t.scale.edgeY}</dd>
        <dt>Abstand</dt><dd>{t.scale.gap}</dd>
        <dt>Beispiele</dt><dd>1080p {t.scale.examples['1080p']}, 4K {t.scale.examples['4K']}</dd>
        <dt>Radien</dt><dd>Karte {t.radii.card}, innen {t.radii.inner}, Pill {t.radii.pill}</dd>
      </dl></div>
      <div><h4>Schrift</h4><dl>{t.type.map(row => <Fragment key={row.element}><dt>{row.element}</dt><dd>{row.size} · {row.weight}</dd></Fragment>)}</dl></div>
    </div>

    <h3 className="ep-ci-h">Zustände am TV<span>Wort und Form, nie nur Farbe</span></h3>
    <div className="ep-ci-tables">{([['agent', 'Agents'], ['autonomy', 'Autonomie'], ['stage', 'Bühne']] as const).map(([id, title]) => <div className="ep-ci-scroll" key={id}><table className="ep-ci-table">
      <caption>{title}</caption>
      <thead><tr><th scope="col">Form</th><th scope="col">Wort</th></tr></thead>
      <tbody>{t.states[id].map(item => <tr key={item.id}><td><span className="ep-glyph" aria-hidden="true">{item.shape}</span><code>{item.id}</code></td><td>{item.word}</td></tr>)}</tbody>
    </table></div>)}</div>

    <h3 className="ep-ci-h">Texte, Tasten, Grüsse</h3>
    <div className="ep-ci-cols">
      <div><h4>Texte am TV</h4><ul className="ep-ci-copy">{t.copy.map(text => <li key={text}>{text}</li>)}</ul></div>
      <div><h4>Fernbedienung</h4><ul>{t.remote.map(entry => <li key={entry.key}><kbd>{entry.key}</kbd> {entry.action}</li>)}</ul>
        <h4 style={{marginTop: 16}}>TV an und aus</h4><ul>{t.greetings.slots.map(slot => <li key={slot.from}>{slot.from}–{slot.to}: «{slot.wake}» · «{slot.goodbye}»</li>)}</ul></div>
      <div><h4>Bewegung</h4><ul>{t.motion.rules.map(rule => <li key={rule}>{rule}</li>)}<li>{t.motion.ambience}.</li><li>Dauern {Object.entries(t.motion.durations).map(([name, ms]) => `${name} ${ms} ms`).join(', ')}, Kurve <code>{t.motion.easing}</code>.</li></ul></div>
      <div><h4>Aufbau</h4><ul>{t.layout.map(line => <li key={line}>{line}</li>)}</ul></div>
    </div>

    <h3 className="ep-ci-h">Steuerung edgeportal.rapold.io<span>{ci.control.status}</span></h3>
    <div className="ep-ci-control">
      <figure className="ep-ci-figure">
        <div className="ep-screen ep-phone" role="img" aria-label="Steuerung auf dem Phone mit drei Screens und ihren Zuständen">
          <div className="ep-phone-ui">
            <div className="ep-phone-bar"><b><img src={signet('edgeportal')} alt=""/>EdgePortal</b><span className="ep-badge" data-tone="success"><span className="ep-shape" aria-hidden="true">●</span>Verbunden</span></div>
            <div><h4>Deine Screens</h4><span>2 von 3 Screens online.</span></div>
            <div className="ep-phone-list">
              {[{name: 'Wohnzimmer', what: 'Bühne: Agents & RadioX', online: true, state: ci.control.render[0], current: true},
                {name: 'Schlafzimmer', what: 'Bühne: RadioX Vollbild', online: true, state: ci.control.render[0]},
                {name: 'Notebook', what: 'Bühne: Agents & RadioX', online: false, state: ci.control.render[3]}].map(screen => <div className="ep-phone-tile" key={screen.name} aria-current={screen.current ? 'true' : undefined}>
                <b>{screen.name}</b><small>{screen.what}</small>
                <span className="ep-badges"><span className="ep-badge" data-tone={screen.online ? 'success' : 'muted'}><span className="ep-shape" aria-hidden="true">●</span>{screen.online ? 'Online' : 'Offline'}</span>{screen.online && <span className="ep-badge" data-tone={screen.state.tone}>{screen.state.word}</span>}</span>
              </div>)}
            </div>
            <div className="ep-publish"><span>Auf Screen anzeigen</span><span>Verwerfen</span></div>
          </div>
        </div>
        <figcaption><strong>Steuerung</strong> · Hand. Beispieldaten.</figcaption>
      </figure>
      <div>
        <p className="ep-ci-lead">{ci.control.rule}</p>
        <div className="ep-ci-cols" style={{gridTemplateColumns: 'minmax(0, 1fr)'}}>
          <div><h4>Regeln</h4><ul>{ci.control.rules.map(rule => <li key={rule}>{rule}</li>)}{ci.control.profiles.map(profile => <li key={profile.id}>{profile.label}: {profile.distance}, Grundschrift {profile.baseMinPx} px, Kontrast {String(profile.contrastMin).replace('.', ',')}:1, Ziele {profile.targetPx} px.</li>)}</ul></div>
        </div>
      </div>
    </div>

    <h3 className="ep-ci-h">Namen<span>{ci.naming.source}</span></h3>
    <p className="ep-ci-lead">{ci.naming.rule}</p>
    <div className="ep-ci-scroll"><table className="ep-ci-table">
      <thead><tr><th scope="col">Am TV heute</th><th scope="col">Name</th><th scope="col">Status</th></tr></thead>
      <tbody>
        {Object.entries(ci.naming.decided).map(([old, name]) => <tr key={old}><td>{old}</td><td><strong>{name}</strong></td><td>entschieden</td></tr>)}
        {Object.entries(ci.naming.fromAudit).map(([old, name]) => <tr key={old}><td>{old}</td><td><strong>{name}</strong></td><td>aus dem Audit</td></tr>)}
        {Object.entries(ci.naming.proposed).map(([old, name]) => <tr key={old}><td>{old}</td><td><strong>{name}</strong></td><td>Vorschlag</td></tr>)}
      </tbody>
    </table></div>

    <details className="ep-ci-note">
      <summary>Ideen: {ci.ideas.status}</summary>
      <p>{ci.ideas.rule}</p>
      <ul>{ci.ideas.items.map(item => <li key={item}>{item}</li>)}</ul>
    </details>
  </section>;
}
