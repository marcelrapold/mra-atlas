'use client';

import {Fragment} from 'react';
import ci from '../../../../brands/rapold/edgeportal/edgeportal.json';
import catalog from '../../../../brands/rapold/edgeportal/views.json';
// Der TV-Stand kommt als Kopie aus dem Produkt (brands/rapold/edgeportal/tv), geladen mit der Brand-Seite.
import '../../../../brands/rapold/edgeportal/tv/base.css';
import '../../../../brands/rapold/edgeportal/tv/stage.css';
import '../../../../brands/rapold/edgeportal/tv/presence.css';
import '../../../../brands/rapold/edgeportal/tv/screen-nav.css';
import '../../../../brands/rapold/edgeportal/tv/tv-power.css';
import '../../../../brands/rapold/edgeportal/edgeportal.css';
import {signet, ViewFigure, type ViewEntry} from './edgeportal/shared';
import {coreViews} from './edgeportal/core';
import {stageStateViews} from './edgeportal/stage-states';
import {presenceViews} from './edgeportal/presence';
import {powerViews} from './edgeportal/power';
import {modesViews} from './edgeportal/modes';
import {radioxViews} from './edgeportal/radiox';
import {overlayViews} from './edgeportal/overlays';
import {contentViews} from './edgeportal/content';

// Jede Gruppe liefert Ansichten mit Markup; Titel, Bereich, Auslöser und Quelle kommen aus views.json.
const views = new Map<string, ViewEntry>([...coreViews, ...stageStateViews, ...modesViews, ...presenceViews, ...overlayViews, ...radioxViews, ...powerViews, ...contentViews].map(view => [view.id, view]));
type Item = (typeof catalog.items)[number] & {reason?: string};
const items: Item[] = catalog.items;
const built = items.filter(item => item.status === 'nachgebaut');
const documented = items.filter(item => item.status === 'dokumentiert');
const inArea = (area: string) => items.filter(item => item.area === area);

const swatch = (name: string, value: string) => <li key={name}><i style={{background: value}}/><span>--{name}<code>{value}</code></span></li>;

export default function RapoldEdgePortal() {
  const t = ci.tv;
  return <section className="doc-section" id="edgeportal-ci" aria-labelledby="edgeportal-ci-title">
    <h2 id="edgeportal-ci-title">EdgePortal: der TV, wie er ist</h2>
    <p>{ci.essence}</p>
    <p>{t.rule} Quelle: {ci.reference.repository}, Commit <code>{ci.reference.commit}</code>; die Stylesheets liegen als Kopie in <code>{ci.reference.copies}</code>. {ci.privacy}</p>
    <div className="ep-ci-principles">{ci.principles.map(principle => <div key={principle.id}><h3>{principle.name}</h3><p>{principle.rule}</p></div>)}</div>

    <h3 className="ep-ci-h">Am TV<span>{t.status} · {built.length} Ansichten nachgebaut{documented.length ? `, ${documented.length} dokumentiert` : ''}</span></h3>
    <p className="ep-ci-lead">Gebaut aus dem echten Markup und den kopierten Stylesheets. Jeder Rahmen ist ein virtueller Fernseher mit 3840 × 2160 Pixeln, als Ganzes verkleinert. Porträts, Cover und Szenenbilder sind Platzhalter, Namen und Titel Beispiele.</p>
    <nav className="ep-ci-areas" aria-label="Bereiche am TV">{catalog.areas.map(area => {
      const count = inArea(area.id).length;
      return count ? <a key={area.id} href={`#ep-area-${area.id}`}>{area.name}<span>{count}</span></a> : null;
    })}</nav>
    <details className="ep-ci-note">
      <summary>Abdeckung: alle Ansichten mit Auslöser und Quelle</summary>
      <p>{catalog.rule}</p>
      <div className="ep-ci-scroll"><table className="ep-ci-table ep-ci-coverage">
        <thead><tr><th scope="col">Ansicht</th><th scope="col">Auslöser</th><th scope="col">Quelle</th><th scope="col">Stand</th></tr></thead>
        <tbody>{catalog.areas.map(area => <Fragment key={area.id}>{inArea(area.id).map(item => <tr key={item.id}>
          <td>{item.status === 'nachgebaut' ? <a href={`#ep-view-${item.id}`}>{item.title}</a> : item.title}<small>{area.name}</small></td>
          <td>{item.trigger}{item.reason && <small>{item.reason}</small>}</td><td><code>{item.source}</code></td><td>{item.status}</td>
        </tr>)}</Fragment>)}</tbody>
      </table></div>
    </details>
    {catalog.areas.map(area => {
      const list = inArea(area.id);
      if (!list.length) return null;
      const rest = list.filter(item => item.status === 'dokumentiert');
      return <section className="ep-ci-area" id={`ep-area-${area.id}`} key={area.id} aria-labelledby={`ep-area-${area.id}-title`}>
        <h4 className="ep-ci-h" id={`ep-area-${area.id}-title`}>{area.name}<span>{area.note}</span></h4>
        <div className="ep-ci-gallery">{list.map(item => {
          const view = item.status === 'nachgebaut' ? views.get(item.id) : undefined;
          return view ? <ViewFigure key={item.id} view={{...view, title: item.title}}/> : null;
        })}</div>
        {rest.length > 0 && <ul className="ep-ci-documented">{rest.map(item => <li key={item.id}><strong>{item.title}</strong> · {item.trigger}{item.reason ? `. ${item.reason}` : ''}</li>)}</ul>}
      </section>;
    })}

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
