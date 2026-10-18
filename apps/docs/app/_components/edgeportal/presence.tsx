'use client';

// Präsenz: Ankunft, Gast-Moment, Ruhemodus, Badges. Markup nach components/stage/presence-layer.tsx; Styles aus tv/presence.css.
import {EyeOff, Moon, Radio} from 'lucide-react';
import {AEON, AETHRA, Stage, css, type ViewEntry} from './shared';

const area = 'Präsenz';

function Arrival({quiet = false}: {quiet?: boolean}) {
  return <div className="presence-arrival" data-leaving="false" role="status">
    <div className="presence-arrival-card">
      <span className="presence-kicker">Sonntag · 21:18</span>
      <h2>Guten Abend, Alex<span className="presence-glut" aria-hidden="true">◆</span></h2>
      {quiet ? <p className="presence-quiet">Alles ruhig. Nichts wartet auf dich.</p> : <ul className="presence-brief">
        <li data-kind="frage" style={css({'--agent': AETHRA.color})}><span className="presence-brief-form" aria-hidden="true">?</span>ÆTHRA hat eine Frage an dich</li>
        <li data-kind="antwort" style={css({'--agent': AEON.color})}><span className="presence-brief-form" aria-hidden="true">✓</span>Neue Antwort von ÆON</li>
        <li data-kind="radio"><span className="presence-brief-form" aria-hidden="true">♪</span>Midnight Signal · Glass Harbour</li>
      </ul>}
    </div>
  </div>;
}

export const presenceViews: ViewEntry[] = [
  {id: 'presence-ankunft', area, title: 'Ankunft', caption: 'Eine bekannte Person kommt: Gruss mit Kurzbriefing für 6 s, danach klappt er zum Badge zusammen. Name als Beispiel.',
    node: <Stage><Arrival/></Stage>},
  {id: 'presence-ankunft-ruhig', area, title: 'Ankunft, nichts offen', caption: 'Ankunft ohne offene Punkte.',
    node: <Stage><Arrival quiet/></Stage>},
  {id: 'presence-gast-moment', area, title: 'Gast-Moment', caption: 'Eine unbekannte Person kommt: «Willkommen» und «Privates ausgeblendet» für 4,5 s.',
    node: <Stage><div className="presence-guest" data-leaving="false" role="status"><strong>Willkommen</strong><span><EyeOff aria-hidden="true"/>Privates ausgeblendet</span></div></Stage>},
  {id: 'presence-badge', area, title: 'Präsenz-Badge', caption: 'Bekannte Person im Raum: Badge mit Initiale, Name und dem Stand des eigenen Agents.',
    node: <Stage presence={<span className="presence-badge" data-kind="person"><span className="presence-initial" aria-hidden="true">A</span><span>Alex</span>
      <span className="presence-mine" style={css({'--agent': AEON.color})}>ÆON bereit</span></span>}/>},
  {id: 'presence-privat', area, title: 'Privates ausgeblendet', caption: 'Bekannte Person, Privates trotzdem ausgeblendet (Richtlinie): Chip ohne Gast.',
    node: <Stage presence={<span className="presence-badge" data-kind="private"><EyeOff aria-hidden="true"/>Privates ausgeblendet</span>}/>},
  {id: 'presence-ruhemodus', area, title: 'Ruhemodus', caption: 'Niemand im Raum: grosse Uhr, Datum und Titel im Radio; nichts Privates, keine Stimme.',
    node: <Stage><div className="presence-ambient" role="status">
      <div className="presence-ambient-center"><span className="presence-kicker"><Moon aria-hidden="true"/>Ruhemodus</span><time>21:18</time><p>Sonntag, 18. Oktober</p></div>
      <p className="presence-ambient-radio"><Radio aria-hidden="true"/><span>RadioX</span><strong>Midnight Signal</strong><em>Glass Harbour</em></p>
    </div></Stage>},
];
