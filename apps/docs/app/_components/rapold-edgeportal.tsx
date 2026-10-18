'use client';

import type {ReactNode} from 'react';
import identity from '../../../../brands/rapold/identity.json';
import ci from '../../../../brands/rapold/edgeportal/edgeportal.json';
// EdgePortal-CI-Styles laden mit der Brand-Seite (wie worlds.css), nicht global.
import '../../../../brands/rapold/edgeportal/edgeportal.css';

type Tone = 'accent' | 'ok' | 'warn' | 'danger' | 'muted';
type StateItem = {id: string; word: string; shape: string; tone: string; note?: string};
const base = identity.publicBase;
const signet = (id: string) => base + (identity.products.find(product => product.id === id)?.variants.dark ?? '');
const toneLabel: Record<Tone, string> = {accent: 'Hinweis', ok: 'Gut', warn: 'Achtung', danger: 'Fehler', muted: 'Ruhig'};
const agent = Object.fromEntries(ci.states.agent.map(state => [state.id, state as StateItem]));
const render = Object.fromEntries(ci.states.render.map(state => [state.id, state as StateItem]));
const stateGroups: {id: keyof typeof ci.states; title: string}[] = [
  {id: 'agent', title: 'Agents'}, {id: 'render', title: 'Anzeige eines Screens'}, {id: 'room', title: 'Raum'}, {id: 'capture', title: 'Mikrofon und Kamera'},
];

// Fester Beispiel-QR für die Claim-Ansicht. Er kodiert nichts.
const qrModules = (() => {
  const size = 25, cells: [number, number][] = [];
  let seed = 7;
  const random = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const finder = (fx: number, fy: number, x: number, y: number) => {
    const dx = x - fx, dy = y - fy;
    if (dx < -1 || dy < -1 || dx > 7 || dy > 7) return -1;
    if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return 0;
    return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) ? 1 : 0;
  };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const f = Math.max(finder(0, 0, x, y), finder(size - 7, 0, x, y), finder(0, size - 7, x, y));
    if (f === -1 ? random() > .52 : f === 1) cells.push([x, y]);
  }
  return cells;
})();

function State({item, className = 'ep-state'}: {item: StateItem; className?: string}) {
  return <span className={className} data-tone={item.tone}><span className="ep-shape" aria-hidden="true">{item.shape}</span>{item.word}</span>;
}

function Screen({kind, label, caption, children}: {kind: 'tv' | 'phone' | 'desk'; label: string; caption: ReactNode; children: ReactNode}) {
  return <figure className="ep-ci-figure">
    <div className={`ep-screen ep-${kind}`} role="img" aria-label={label}>{children}{kind === 'tv' && <span className="ep-safe" aria-hidden="true"/>}</div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function AgentsHome({guest = false}: {guest?: boolean}) {
  return <div className="ep-home">
    <div className="ep-home-head">
      <span className="ep-brand"><img src={signet('agents')} alt=""/>Agents Home</span>
      {!guest && <span className="ep-pill" data-tone="warn"><span className="ep-shape" aria-hidden="true">?</span>ÆTHRA: Frage an dich</span>}
      <span className="ep-meta">{guest ? <span className="ep-pill" data-tone="warn"><span className="ep-shape" aria-hidden="true">◇</span>Guest</span> : <span>EdgePortal · Wohnzimmer</span>}<span className="ep-clock">21:04</span></span>
    </div>
    <div className="ep-home-body">
      <article className="ep-card">
        <div className="ep-card-top"><span className="ep-avatar" data-ring="">Æ</span><b>ÆON</b></div>
        <State item={agent.working}/>
        {guest ? <span className="ep-hidden">Privates ausgeblendet</span> : <><p>Prüft den Deploy von Atlas.</p><small>seit 12 min</small></>}
      </article>
      <article className="ep-card" data-attn="" data-tone="warn">
        <div className="ep-card-top"><span className="ep-avatar">Æ</span><b>ÆTHRA</b></div>
        <State item={agent.question}/>
        {guest ? <span className="ep-hidden">Privates ausgeblendet</span> : <><p>Soll ich die Release Notes kürzen?</p><small>Antworten im Agents Terminal</small></>}
      </article>
      <article className="ep-card ep-radio">
        <small><span className="ep-live" aria-hidden="true"/> RadioX · Läuft jetzt</small>
        <b>Midnight Signal</b>
        <small>Danach: Glass Harbour</small>
      </article>
    </div>
    <div className="ep-home-foot"><span>◀ ▶ Agent · ▲ ▼ View · OK lang: sprechen</span><span>View: Stage</span></div>
  </div>;
}

export default function RapoldEdgePortal() {
  const wall = ci.distanceProfiles.find(profile => profile.id === 'wall');
  return <section className="doc-section" id="edgeportal-ci" aria-labelledby="edgeportal-ci-title">
    <h2 id="edgeportal-ci-title">EdgePortal: die ganze Oberfläche</h2>
    <p>{ci.essence}</p>
    <p>Vorschlag vom 18.10.2026 · Welt «{ci.world}» · alle Ansichten mit Beispieldaten, keine Live-Zustände. Spezifikation in <code>brands/rapold/edgeportal/edgeportal.json</code>, der Systemstart in DESIGN-DNA 7.1.</p>
    <div className="ep-ci-principles">{ci.principles.map(principle => <div key={principle.id}><h3>{principle.name}</h3><p>{principle.rule}</p></div>)}</div>

    <h3 className="ep-ci-h">Drei Abstände</h3>
    <p className="ep-ci-lead">Jede Fläche gehört zu einem Distanzprofil. Wall gilt für den TV im Raum und verlangt mehr als jede Bildschirm-Oberfläche.</p>
    <div className="ep-ci-profiles">{ci.distanceProfiles.map(profile => <div className="ep-ci-profile" key={profile.id}>
      <b>{profile.label}</b><span>{profile.distance} · {profile.devices.join(', ')}</span>
      <dl>
        <dt>Grundschrift</dt><dd>{'baseMinPx1080' in profile ? `${profile.baseMinPx1080} px bei 1080p` : `${profile.baseMinPx} px`}</dd>
        <dt>Kontrast</dt><dd>mindestens {String(profile.contrastMin).replace('.', ',')}:1</dd>
        <dt>Bedienung</dt><dd>{'targetPx' in profile ? `Ziele ${profile.targetPx} px` : profile.targets}</dd>
        {'lineMaxChars' in profile && <><dt>Text</dt><dd>höchstens {profile.situationCards} Karten zu {profile.linesPerCard} Zeilen à {profile.lineMaxChars} Zeichen</dd></>}
      </dl>
    </div>)}</div>
    {wall?.scale && <p className="ep-ci-lead" style={{marginTop: 16}}>Wall-Skala bei 1080p: Caption {wall.scale.caption.px1080} px, Text {wall.scale.body.px1080} px, Titel {wall.scale.title.px1080} px, Display {wall.scale.display.px1080} px. In den Ansichten unten skaliert alles mit der Bildbreite, die Proportionen stimmen.</p>}

    <h3 className="ep-ci-h">Flächen</h3>
    <p className="ep-ci-lead">TV-Flächen sind immer dunkel und bleiben im sicheren Rand von 5 % (gestrichelt). Agents Home trägt das Agents-Signet; EdgePortal steht als Plattform in der Statuszeile.</p>
    <div className="ep-ci-gallery">
      <Screen kind="tv" label="Agents Home: zwei Agents und RadioX, Beispieldaten" caption={<><strong>Agents Home</strong> · Wall · View Stage. Aufmerksamkeit über Tonrahmen und Wort, nie über Pulsieren.</>}>
        <AgentsHome/>
      </Screen>
      <Screen kind="tv" label="Launcher mit vier Tiles, Fokus auf Agents Home" caption={<><strong>Launcher</strong> · Zurück-Taste. Halt braucht zweimal OK.</>}>
        <div className="ep-launch">
          <span className="ep-eyebrow">EdgePortal · Launcher</span>
          <h4>Launcher</h4>
          <div className="ep-tiles">
            <div className="ep-tile" data-focus=""><span className="ep-thumb"><img src={signet('agents')} alt=""/></span><b>Agents Home</b><small>1 · Start</small></div>
            <div className="ep-tile"><span className="ep-thumb">X</span><b>RadioX</b><small>2 · Live im Vollbild</small></div>
            <div className="ep-tile"><span className="ep-thumb">○</span><b>Scene Abend</b><small>3 · Aktiv</small></div>
            <div className="ep-tile" data-tone="danger"><span className="ep-thumb">■</span><b>Halt</b><small>OK zweimal</small></div>
          </div>
          <span className="ep-legend">◀ ▶ ▲ ▼ wählen · OK öffnen · Zurück: Agents Home · 0: Start</span>
        </div>
      </Screen>
      <Screen kind="tv" label="Claim mit QR, Pair Code und Restzeit" caption={<><strong>Claim</strong> · Pair Code immer sichtbar, Restzeit als Text.</>}>
        <div className="ep-claim">
          <div>
            <span className="ep-brand"><img src={signet('edgeportal')} alt=""/>EdgePortal</span>
            <h4>Dein Screen. Ein Scan entfernt.</h4>
            <span className="ep-eyebrow">New Screen · edgeportal-3f9a2c41b7d0</span>
          </div>
          <div className="ep-claim-side">
            <div className="ep-qr"><svg viewBox="0 0 25 25" aria-hidden="true">{qrModules.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02"/>)}</svg></div>
            <span className="ep-eyebrow">Pair Code</span>
            <span className="ep-code">3F9A2C</span>
            <span className="ep-state"><span className="ep-shape" aria-hidden="true">●</span>gültig 4:59 · danach neuer Code</span>
          </div>
        </div>
      </Screen>
      <Screen kind="tv" label="TV Wake mit Gruss am Abend" caption={<><strong>TV Wake</strong> · Bild über 12 s aus Schwarz, Ton über 20 s, dann der Gruss.</>}>
        <div className="ep-wake"><strong>Guten Abend</strong><span>Wohnzimmer</span></div>
      </Screen>
      <Screen kind="phone" label="Control auf dem Phone mit vier Screens und ihren Zuständen" caption={<><strong>Control</strong> · Hand. Nichts wirkt ohne «Auf Screen anzeigen».</>}>
        <div className="ep-phone-ui">
          <div className="ep-phone-bar"><b><img src={signet('edgeportal')} alt=""/>Control</b><span className="ep-badge" data-tone="ok"><span className="ep-shape" aria-hidden="true">●</span>Verbunden</span></div>
          <div><h4>Deine Screens</h4><span>3 von 4 Screens online</span></div>
          <div className="ep-phone-list">
            {[{name: 'Wohnzimmer', what: 'Agents Home', online: true, state: render.confirmed, current: true},
              {name: 'Büro', what: 'Content: Dashboard', online: true, state: render.assigned},
              {name: 'Küche', what: 'RadioX', online: true, state: render.stale},
              {name: 'Gästezimmer', what: 'Ambient', online: false, state: render.offline}].map(screen => <div className="ep-phone-tile" key={screen.name} aria-current={screen.current ? 'true' : undefined}>
              <b>{screen.name}</b><small>{screen.what}</small>
              <span className="ep-badges"><span className="ep-badge" data-tone={screen.online ? 'ok' : 'muted'}><span className="ep-shape" aria-hidden="true">{screen.online ? '●' : '■'}</span>{screen.online ? 'Online' : 'Offline'}</span><State item={screen.state} className="ep-badge"/></span>
            </div>)}
          </div>
          <div className="ep-publish"><span>Auf Screen anzeigen</span><span>Verwerfen</span></div>
        </div>
      </Screen>
      <Screen kind="desk" label="Share Link im Browser: Agents Home als Guest, Privates ausgeblendet" caption={<><strong>Share Link</strong> · Desk. Gilt immer als Guest, neutraler Kopf.</>}>
        <div className="ep-desk-bar"><span><b>Geteilter Screen · EdgePortal</b> · nur ansehen</span><span className="ep-badge" data-tone="ok" style={{fontSize: '1.4cqi'}}><span className="ep-shape" aria-hidden="true">●</span>Live</span></div>
        <div className="ep-desk-screen ep-screen ep-tv"><AgentsHome guest/></div>
      </Screen>
    </div>

    <h3 className="ep-ci-h">Status Screens</h3>
    <p className="ep-ci-lead">Jeder Zustand hat festen Wortlaut, eine Form und ein Zeitverhalten. Die Kacheln sind verkleinert; die Grössen gelten wie bei den Flächen oben.</p>
    <div className="ep-ci-status">{ci.statusScreens.map(screen => <figure key={screen.id}>
      <div className="ep-screen ep-status-tile" data-tone={screen.tone} data-chip={screen.id === 'offline-last' ? '' : undefined} data-band={screen.id === 'halt' ? '' : undefined}>
        {screen.id === 'offline-last' || screen.id === 'halt'
          ? <strong><span className="ep-shape" aria-hidden="true">{screen.shape}</span>{screen.headline}</strong>
          : <><span className="ep-shape" aria-hidden="true">{screen.shape}</span><strong>{screen.headline}</strong>{'detail' in screen && screen.detail && <small>{screen.detail}</small>}</>}
      </div>
      <figcaption><code>{screen.id}</code> · {toneLabel[screen.tone as Tone]} · {screen.when}</figcaption>
    </figure>)}</div>

    <h3 className="ep-ci-h">Zustände aus Wort und Form</h3>
    <p className="ep-ci-lead">Farbe allein trägt nie eine Aussage. Die gefüllte Raute gehört als Rautenpunkt der Dachmarke; Warnungen tragen ▲, «braucht dich» die hohle Raute.</p>
    <div className="ep-ci-tables">{stateGroups.map(group => <div className="ep-ci-scroll" key={group.id}><table className="ep-ci-table">
      <caption>{group.title}</caption>
      <thead><tr><th scope="col">Form</th><th scope="col">Wort</th><th scope="col">Ton</th></tr></thead>
      <tbody>{(ci.states[group.id] as StateItem[]).map(item => <tr key={item.id}><td><span className="ep-glyph" aria-hidden="true">{item.shape}</span><code>{item.id}</code></td><td>{item.word}{item.note && <><br/><small className="muted">{item.note}</small></>}</td><td>{toneLabel[item.tone as Tone]}</td></tr>)}</tbody>
    </table></div>)}</div>

    <h3 className="ep-ci-h">Bewegung, Fernbedienung, Gruss</h3>
    <div className="ep-ci-cols">
      <div><h4>Bewegung auf dem Pi</h4><ul>{ci.motion.rules.map(rule => <li key={rule}>{rule}</li>)}<li>Dauern {Object.entries(ci.motion.durations).map(([name, ms]) => `${name} ${ms} ms`).join(', ')}.</li></ul></div>
      <div><h4>Fernbedienung</h4><ul>{ci.remote.map(entry => <li key={entry.key}><kbd>{entry.key}</kbd> {entry.action}</li>)}</ul></div>
      <div><h4>Eine Grussquelle</h4><ul>{ci.greetings.slots.map(slot => <li key={slot.from}>{slot.from}–{slot.to}: «{slot.wake}» · «{slot.goodbye}»</li>)}<li>{ci.greetings.rule}</li></ul></div>
    </div>

    <h3 className="ep-ci-h">Namen</h3>
    <p className="ep-ci-lead">{ci.naming.rule} Grundlage: {ci.naming.source}.</p>
    <div className="ep-ci-scroll"><table className="ep-ci-table">
      <thead><tr><th scope="col">Bisher</th><th scope="col">Name</th><th scope="col">Status</th></tr></thead>
      <tbody>
        {Object.entries(ci.naming.decided).map(([old, name]) => <tr key={old}><td>{old}</td><td><strong>{name}</strong></td><td>entschieden</td></tr>)}
        {Object.entries(ci.naming.fromAudit).map(([old, name]) => <tr key={old}><td>{old}</td><td><strong>{name}</strong></td><td>aus dem Audit</td></tr>)}
        {Object.entries(ci.naming.proposed).map(([old, name]) => <tr key={old}><td>{old}</td><td><strong>{name}</strong></td><td>Vorschlag</td></tr>)}
      </tbody>
    </table></div>

    <details className="ep-ci-note">
      <summary>Quellen, Annahmen und Verfeinerungen</summary>
      <h4>Quellen</h4><ul>{ci.sources.map(item => <li key={item}>{item}</li>)}</ul>
      <h4>Annahmen</h4><ul>{ci.assumptions.map(item => <li key={item}>{item}</li>)}</ul>
      <h4>Verfeinerungen gegenüber dem heutigen Produkt</h4><ul>{ci.refinements.map(item => <li key={item}>{item}</li>)}</ul>
      <h4>Wall-Tokens</h4><ul>{ci.wallTokens.rules.map(item => <li key={item}>{item}</li>)}</ul>
    </details>
  </section>;
}
