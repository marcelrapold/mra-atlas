'use client';

// TV an und aus. Markup nach components/tv-power.tsx; Styles aus tv/tv-power.css; Texte aus src/tv.mjs.
import type {CSSProperties} from 'react';
import {Stage, type ViewEntry} from './shared';

const area = 'TV an und aus';

function Power({phase, action, text, black, message}: {phase: string; action: 'an' | 'aus'; text?: string; black?: number; message?: number}) {
  // `black` und `message` halten eine Momentaufnahme mitten in einer Blende fest (im Produkt läuft sie über 3 s bzw. 12 s).
  const still = (opacity?: number) => opacity === undefined ? undefined : {opacity, transition: 'none', animation: 'none'} as CSSProperties;
  return <div className="tv-power" data-phase={phase} data-action={action}>
    <div className="tv-power-black" style={still(black)}/>
    {text && <p className="tv-power-message" style={still(message)}>{text}</p>}
  </div>;
}

export const powerViews: ViewEntry[] = [
  {id: 'tv-an-morgen', area, title: 'TV an am Morgen', caption: '05–11 Uhr: «Guten Morgen» über dem langsam erscheinenden Bild.',
    node: <Stage><Power phase="message" action="an" text="Guten Morgen"/></Stage>},
  {id: 'tv-an-tag', area, title: 'TV an am Tag', caption: '11–17 Uhr: «Hallo».',
    node: <Stage><Power phase="message" action="an" text="Hallo"/></Stage>},
  {id: 'tv-an-nacht', area, title: 'TV an in der Nacht', caption: '22–05 Uhr: «Gute Nacht».',
    node: <Stage><Power phase="message" action="an" text="Gute Nacht"/></Stage>},
  {id: 'tv-aus-gruss', area, title: 'TV aus: Gruss', caption: 'Vor dem Ausschalten: Gruss auf 55 % abgedunkeltem Bild, mindestens 3,5 s.',
    node: <Stage><Power phase="message" action="aus" text="Schönen Abend"/></Stage>},
  {id: 'tv-aus-blende', area, title: 'TV aus: Ausblendung', caption: 'Momentaufnahme der 3-s-Blende bei 60 %: Schwarz von 0,55 auf 1, der Gruss im gleichen Takt aus.',
    node: <Stage><Power phase="fading-out" action="aus" text="Schönen Abend" black={.82} message={.4}/></Stage>},
  {id: 'tv-dunkel', area, title: 'TV dunkel', caption: 'Ausgeschaltet: ganz schwarz und still, auch nach einem Neuladen.',
    node: <Stage><Power phase="dark" action="aus"/></Stage>},
  {id: 'tv-an-einblende', area, title: 'TV an: Einblendung', caption: 'Momentaufnahme der 12-s-Blende aus Schwarz, bevor der Gruss kommt.',
    node: <Stage><Power phase="fading-in" action="an" black={.6}/></Stage>},
];
