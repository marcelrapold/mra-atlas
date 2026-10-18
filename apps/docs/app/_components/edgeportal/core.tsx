'use client';

// Die meistgesehenen Ansichten: Bühne mit Gast, Bühne mit Frage, Übersicht, TV an. Die Übersicht kommt aus overlays.tsx.
import {AEON, AETHRA, Stage, type ViewEntry} from './shared';
import {NOTE, Overview, brakeTile, withoutCameras} from './overlays';

export const coreViews: ViewEntry[] = [
  {id: 'buehne-gast', area: 'Bühne', title: 'Bühne, Gast im Raum', wide: true,
    caption: 'So steht der Wohnzimmer-Screen heute da: Poster-Karten, RadioX-Leiste, Präsenz oben, Kamerahinweis unten.',
    node: <Stage guest/>},
  {id: 'buehne-frage', area: 'Bühne', title: 'Bühne mit einer Frage an dich',
    caption: 'Aufmerksamkeit: Tonrahmen, Hinweis in der Kopfzeile und Wort, ohne Pulsieren.',
    node: <Stage agents={[{...AEON, level: 'arbeitet', since: 'seit 12 min', fallback: undefined, autonomy: 'meldet'}, {...AETHRA, level: 'frage', since: 'seit 2 min', fallback: undefined}]} attention={[{...AETHRA, level: 'frage'}]}/>},
  {id: 'uebersicht', area: 'Bühne', title: 'Übersicht',
    caption: 'Zurück-Taste: Kachelmenü mit Bühne, RadioX, den acht eingebauten Szenen und der Notbremse (zweimal OK). Hier ohne Kameraansichten.',
    node: <Overview tiles={withoutCameras(brakeTile('bereit'))} note={NOTE.aus}/>},
  {id: 'tv-an-abend', area: 'Bühne', title: 'TV an am Abend',
    caption: '17–22 Uhr: «Guten Abend» über dem Bild, das über 12 s aus Schwarz kommt.',
    node: <Stage><div className="tv-power" data-phase="message" data-action="an"><div className="tv-power-black"/><p className="tv-power-message">Guten Abend</p></div></Stage>},
];
