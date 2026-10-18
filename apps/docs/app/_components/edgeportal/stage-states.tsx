'use client';

// Bühne: Zustände der Agents, Kopfzeilen-Chips, Notbremse, Untertitel, Fernbedienung, Ambience und Autopilot.
// Markup nach components/stage/stage-view.tsx und agent-card.tsx; Styles aus tv/stage.css und tv/autopilot.css.
import {Volume2} from 'lucide-react';
import '../../../../../brands/rapold/edgeportal/tv/autopilot.css';
import {AEON, AETHRA, Stage, css, placeholder, type ViewEntry} from './shared';

const area = 'Bühne: Zustände';

export const stageStateViews: ViewEntry[] = [
  {id: 'stage-arbeitet', area, title: 'Agent arbeitet', caption: 'Stand «arbeitet»: Zustandslicht wandert an der Oberkante, Chip mit «seit …».',
    node: <Stage agents={[{...AEON, level: 'arbeitet', since: 'seit 12 min', fallback: undefined, autonomy: 'meldet'}, AETHRA]}/>},
  {id: 'stage-dialog', area, title: 'Agent braucht dich', caption: 'Offene Freigabe: Tonrahmen, Hinweis in der Kopfzeile und Banner «braucht dich: …» mit «Antworten im Leitstand».',
    node: <Stage agents={[AEON, {...AETHRA, level: 'dialog', since: 'seit 3 min', fallback: undefined, approval: 'Release-Notizen veröffentlichen?'}]} attention={[{...AETHRA, level: 'dialog'}]}/>},
  {id: 'stage-haengt', area, title: 'Agent hängt', caption: 'Stand «hängt»: dicker Tonrahmen in Rot, Form ‼, kein Pulsieren.',
    node: <Stage agents={[{...AEON, level: 'haengt', since: 'seit 6 min', fallback: undefined}, AETHRA]}/>},
  {id: 'stage-aus', area, title: 'Agent läuft nicht', caption: 'Stand «läuft nicht»: Bild entsättigt und abgedunkelt, Form ■.',
    node: <Stage agents={[AEON, {...AETHRA, level: 'aus', since: undefined, fallback: undefined}]}/>},
  {id: 'stage-gesperrt', area, title: 'Autonomie gesperrt', caption: 'Hermes hat den Agent gesperrt: Marke «gesperrt: Budget» neben der Autonomie.',
    node: <Stage agents={[{...AEON, autonomy: 'fragt', lock: 'gesperrt: Budget', fallback: undefined}, AETHRA]}/>},
  {id: 'stage-spricht', area, title: 'Agent spricht', caption: 'Ein Agent spricht: «spricht» mit fünf Pegelbalken, Azure-Glow; die anderen treten auf 62 % zurück; Untertitel unten.',
    node: <Stage agents={[{...AEON, speaking: true}, AETHRA]} autopilot={{speaking: true}}>
      <div className="stage-caption" style={css({'--agent': AEON.color})} data-spoken="true" aria-hidden="true"><strong>ÆON</strong><p>Der Deploy ist durch. Alle Checks sind grün.</p></div>
    </Stage>},
  {id: 'stage-gespraech', area, title: 'Gespräch sichtbar', caption: 'Bekannte Person im Raum und Gespräch eingeschaltet: Sprechblasen mit der letzten Antwort, bei einer Frage mit Kicker.',
    node: <Stage conversation agents={[{...AEON, bubble: 'Die Sicherung von heute Nacht ist vollständig.'}, {...AETHRA, level: 'frage', since: 'seit 2 min', fallback: undefined, bubble: 'Soll ich die Wochenübersicht vorbereiten?'}]} attention={[{...AETHRA, level: 'frage'}]}/>},
  {id: 'stage-untertitel-text', area, title: 'Untertitel ohne Ton', caption: 'Antwort nur als Text (nicht gesprochen): Untertitel mit gestricheltem Rand.',
    node: <Stage><div className="stage-caption" style={css({'--agent': AETHRA.color})} data-spoken="false" aria-hidden="true"><strong>ÆTHRA</strong><p>Ich habe die Notizen zusammengefasst und abgelegt.</p></div></Stage>},
  {id: 'stage-offline', area, title: 'Verbindung unterbrochen', caption: 'Abfrage fehlgeschlagen oder Daten veraltet: Chip «Verbindung unterbrochen · letzter Stand», der letzte Inhalt bleibt.',
    node: <Stage offline/>},
  {id: 'stage-notbremse', area, title: 'Notbremse gezogen', caption: 'Notbremse aktiv: Band zwischen Kopfzeile und Inhalt, ruhig, ohne Blinken.',
    node: <Stage brake="Notbremse gezogen — alle Agents angehalten" agents={[{...AEON, autonomy: 'fragt', lock: 'gesperrt: Notbremse', fallback: undefined}, {...AETHRA, autonomy: 'fragt', lock: 'gesperrt: Notbremse', fallback: undefined}]}/>},
  {id: 'stage-ton-aus', area, title: 'Ton aus', caption: 'Ton am Screen aus: eine ruhige Zeile mit Grund und Weg zurück, hier durch die Szene «Nacht».',
    node: <Stage soundOff="Ton aus · Nacht — ⏯ für Ton"/>},
  {id: 'stage-stimme-aus', area, title: 'Stimme aus', caption: 'Stimme in der Steuerung aus, RadioX läuft weiter.',
    node: <Stage soundOff="Stimme aus (Steuerung) — ⏯ für Ton"/>},
  {id: 'stage-ton-aktivieren', area, title: 'Ton aktivieren', caption: 'Der Browser blockiert Ton bis zur ersten Eingabe: Knopf unten rechts.',
    node: <Stage><button type="button" className="stage-unlock" tabIndex={-1}><Volume2 aria-hidden="true"/>Ton aktivieren: Taste drücken oder antippen</button></Stage>},
  {id: 'stage-tastenhilfe', area, title: 'Tastenhilfe', caption: 'Erste Taste der Fernbedienung: Legende für 7 s.',
    node: <Stage><div className="stage-remote-hint" data-help="true" role="status">Fernbedienung: ◀ ▶ Agent · ▲ ▼ Ansicht · OK Ton / lang: Sprechen · ⏯ Ton an / RadioX · Zurück: Übersicht · 0: Start</div></Stage>},
  {id: 'stage-tastenhinweis', area, title: 'Hinweis nach einer Taste', caption: 'Kurzer Hinweis für 2,2 s, etwa nach ▲ ▼.',
    node: <Stage><div className="stage-remote-hint" data-help="false" role="status">Ansicht: Fokus</div></Stage>},
  {id: 'stage-ambience-ruhig', area, title: 'Ambience ruhig', caption: 'Ambience «ruhig»: Verläufe stehen, Deckkraft 0,3.',
    node: <Stage ambience="ruhig"/>},
  {id: 'stage-ambience-kino', area, title: 'Ambience Kino', caption: 'Ambience «kino»: Szenenbild mit 0,36 Deckkraft driftet über 90 s. Szenenbild hier als Platzhalter.',
    node: <Stage ambience="kino" scene={placeholder('Szene', '#1E1C2F')}/>},
  {id: 'stage-ambience-aus', area, title: 'Ambience aus', caption: 'Ambience «aus»: nur Grund und Körnung.',
    node: <Stage ambience="aus"/>},
  {id: 'stage-nacht', area, title: 'Nacht', caption: 'Szene «Nacht»: Autopilot dunkelt um 60 % ab, die Aurora driftet langsamer, Ton aus.',
    node: <Stage autopilot={{dim: 60, slow: true}} soundOff="Ton aus · Nacht — ⏯ für Ton"/>},
  {id: 'stage-gedimmt', area, title: 'Gedimmt', caption: 'Autopilot dimmt in 5-%-Schritten mit 4 s Übergang, hier 30 %.',
    node: <Stage autopilot={{dim: 30}}/>},
];
