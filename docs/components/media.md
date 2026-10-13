# Media-Komponenten

Gruppe «media»: Wiedergabeleiste, Medienkarten, Ersatz-Cover, Karussell und Audio-Visualisierungen. Alle Komponenten sind rein darstellend: kein `<audio>`, kein Web Audio, kein Store, keine API. Zustand und Callbacks kommen aus der App. Farben ausschliesslich über semantische Tokens (`primary`, `muted-foreground`, `chart-1..5`, `background`, `ring`).

Demo: `apps/docs/app/_components/demos/media-demo.tsx` (`MediaDemo`).

---

## MediaBar

Datei: `packages/core/src/ui/media-bar.tsx`
Herkunft: `radiox/apps/frontend/components/MediaPlayer/PersistentMiniBar.tsx`, `WaveTransport.tsx`, `PlayAnchor.tsx`

**Zweck.** Persistente Wiedergabeleiste mit drei Zonen: Info (Cover, Titel), Transport (PlayButton, Timeline), Aktionen.

**Teile und Props.**

| Teil | Props |
| --- | --- |
| `MediaBar` | `position: 'static' \| 'sticky' \| 'fixed'` (Standard `static`), `label` (Landmark-Name, Standard «Wiedergabe»), `status` (Text der höflichen Live-Region) |
| `MediaBarInfo` | Layout-Container links |
| `MediaBarArtwork` | `src`, `alt` (Standard leer), `title` (für Ersatz-Cover), `fallback`, `size: 'sm' \| 'md' \| 'lg'` |
| `MediaBarMeta` | `title`, `subtitle`, `eyebrow`, `badge` (Slot für Live-Badge/StatusDot) |
| `MediaBarTransport` | `label` (Gruppenname, Standard «Wiedergabesteuerung»), `playButton` (Props für den Atlas-`PlayButton`), `before` (Knöpfe vor dem PlayButton), `children` (Timeline) |
| `MediaBarTimeline` | `value`, `duration` (Sekunden), `onSeek(seconds)`, `step` (Standard 5 s; Bild auf/ab sechsfach), `live`, `liveLabel`, `label` (Standard «Position»), `waveform?: number[]`, `disabled` |
| `MediaBarActions` | Container rechts |
| Helfer | `formatMediaTime(s)` → «m:ss», `spokenMediaTime(s)` → «1 Minute 5 Sekunden» |

**A11y.** `section` mit `aria-label` (Region). Transport als `role="group"`. Timeline ist ein natives `<input type="range">` (Rolle slider, Tastatur, Touch) unsichtbar über der Spur, mit `aria-valuetext` «X Minuten Y Sekunden von …». Fokus sichtbar über `has-[input:focus-visible]:outline` am Spur-Container. Trefferhöhe 44 px. `status` wird über einen `Announcer` (höfliche Live-Region, 300 ms entprellt, Start-Stand still) angesagt (Verbindungswechsel, Pufferung). Bei `live` gibt es keinen Regler, nur «Live».

**Do.** Eine MediaBar pro Seite. Den `announce` des eingebetteten PlayButton auf `false` setzen, wenn `status` dieselbe Information ansagt. Zeitwerte in Sekunden liefern.
**Don't.** Kein `<audio>` in die Leiste legen. Keinen Titel in den Alt-Text des Covers wiederholen.

**Abweichungen von RadioX.** Ohne Fahrmodus, Geo-Sperre, Like-Knopf, Kapitel, Tastenkürzel und Sprecher-Avatar im Knopf (App-Logik). Die RadioX-Welle mit mittigem Knopf ist hier eine Spur mit optionaler `waveform`; der Knopf steht darüber. Die Steuerung nutzt `PlayButton` der Gruppe «controls» (fester Name + `aria-pressed`) statt RadioX `GlassPlayButton` mit wechselndem Label.

---

## MediaCard

Datei: `packages/core/src/ui/media-card.tsx`
Herkunft: `radiox/apps/frontend/components/WideContentCard.tsx`, `ShowCard.tsx`, `ShowWideCard/ShowWideCard.tsx`

**Zweck.** Karte für Episoden, Sendungen, Beiträge – als Kachel oder im Breitformat.

**Props.** `variant: 'tile' \| 'wide'`, `title`, `eyebrow`, `description`, `meta`, `imageSrc`, `imageAlt` (Standard leer), `fallback` (Standard `GeneratedCover`), `coverTitle`, `overlayTag`, `action` (Slot), `active`, `activeLabel` (Standard «Wird gerade abgespielt»), `href`, `linkComponent` (z. B. Next `Link`), `linkProps`, `headingLevel: 'h2' \| 'h3' \| 'h4'`. Export `mediaCardVariants`.

**A11y.** `<article>`; Stretched-Link-Muster: nur der Titel ist ein Link, sein `::after` deckt die Karte ab. Der Fokusring liegt auf dem Pseudo-Element (Kartenkante). Aktionen im `action`-Slot liegen mit `z-10` darüber und bleiben eigene Tab-Stopps – keine verschachtelten interaktiven Elemente. `active` setzt `aria-current="true"` und einen sr-only-Hinweis. Bildfehler fallen auf das Ersatz-Cover zurück.

**Do.** Pro Karte genau ein Ziel (`href`) und höchstens wenige Aktionen. Überschriftsebene an die Seite anpassen.
**Don't.** Keine `onClick`-Karten ohne Link (RadioX-Muster `div onClick` ist nicht tastaturbedienbar). Keine Buttons in den Titel legen.

**Abweichungen von RadioX.** Dekor (Raster, Ecken, Schimmer, Cyan-Schein) entfernt – gehört in Brand-Pakete. `emojiFallback` → `GeneratedCover`. `dateLabel`/`metaTopLeft`/`metaTopRight` zu `meta` zusammengefasst; `primaryActionLabel`+`onPrimaryActionClick` → freier `action`-Slot.

---

## GeneratedCover

Datei: `packages/core/src/ui/media-card.tsx`
Herkunft: `radiox/apps/frontend/components/MediaPlayer/GeneratedMiniCover.tsx`

**Zweck.** Deterministisches Ersatz-Cover ohne Bild.

**Props.** `title`, `seed` (Standard `title`), `eyebrow`, `index` (0-basiert, angezeigt als 01…), `compact` (nur Initialen, für < 64 px), `decorative` (aria-hidden), `label` (Standard «Generiertes Cover für {title}»). Helfer `coverPalette(seed)`; Initialen über `getInitials` aus `avatar.tsx` (eine gemeinsame Ableitung für Avatar und Cover).

**A11y.** Ohne `decorative` `role="img"` mit Label; neben einem sichtbaren Titel `decorative` setzen. Initialen stehen auf einer `bg-background/85`-Plakette, damit der Kontrast unabhängig von den Chart-Farben der Brand hält.

**Do.** Stabilen Seed verwenden (ID statt Titel, wenn Titel wechseln).
**Don't.** Nicht als Bild mit Informationsgehalt einsetzen.

**Abweichungen von RadioX.** Feste Hex-Paletten → zwei Chart-Tokens (`--chart-1..5`) der aktiven Brand. «RX»-Wasserzeichen und «RadioX»-Fallback entfernt.

---

## Carousel

Datei: `packages/core/src/ui/carousel.tsx`
Herkunft: `radiox/apps/frontend/components/HeroSlider.tsx`, `hooks/useSliderEngine.ts`

**Zweck.** Horizontal blätternde Folien (Hero, Empfehlungen) ohne Fremdbibliothek.

**Teile und Props.**

| Teil | Props |
| --- | --- |
| `Carousel` | `label` (Pflicht), `autoplay?: boolean \| number` (ms, `true` = 6000), `loop`, `defaultIndex`, `onIndexChange`, `labels` (Texte, einzeln überschreibbar) |
| `CarouselContent` | Scroll-Snap-Viewport, fokussierbar; ←/→/Pos1/Ende |
| `CarouselItem` | Folie; Breite über `className` (z. B. `sm:basis-1/2`) |
| `CarouselPrevious` / `CarouselNext` | 44-px-Knöpfe, `aria-controls` |
| `CarouselDots` | Punkte mit `aria-current`; aktive Marke zeigt Autoplay-Fortschritt |
| `CarouselAutoplayToggle` | Pause/Play, nur bei aktivem Autoplay |
| `CarouselControls` | Zurück · Punkte · Pause · Weiter in einer Reihe |
| `useCarousel()` | Zugriff auf Index, Anzahl, `scrollTo` |

**A11y.** `section` mit `aria-roledescription="carousel"`, Folien `role="group"` + `aria-roledescription="slide"` + «2 von 5». Viewport `aria-live="polite"` bei manuellem Wechsel, `off` während Autoplay. Autoplay stoppt bei Hover, Fokus im Karussell und verdecktem Tab; bei `prefers-reduced-motion` startet es nicht (und Scrollen ist sofort statt weich). Sichtbarer Pause-Knopf erfüllt WCAG 2.2.2. Punkte sind Knöpfe mit `aria-current` statt `role="tab"` (keine Tabpanels).

**Do.** Bei `autoplay` immer `CarouselControls` oder `CarouselAutoplayToggle` rendern. Mindestens 5 s Intervall.
**Don't.** Keine wichtigen Inhalte nur im Karussell. Kein Autoplay für Folien mit Formularen.

**Abweichungen von RadioX.** Embla + Autoplay-Plugin ersetzt durch CSS Scroll-Snap, IntersectionObserver und einen 100-ms-Takt. Ken-Burns-Zoom, LCARS-Formen und Show-spezifische CTAs entfernt (Brand bzw. App). RadioX nutzte `role="tablist"` für Punkte ohne Tabpanels – hier `aria-current`.

---

## Audio-Visualisierungen

Datei: `packages/core/src/ui/audio-visual.tsx`
Herkunft: `radiox/apps/frontend/components/MediaPlayer/Waveform.tsx`, `RadialWaveform.tsx`, `SpeakingRing.tsx`, `components/LivePlayer/LiveAudioWave.tsx`

**Zweck.** Datengetriebene SVG-Visualisierungen (`values: number[]`, 0..1). Werte liefert die App (Analyser, vorberechnete Peaks, synthetisch).

| Komponente | Props |
| --- | --- |
| `BarWaveform` | `values`, `barCount`, `progress` (gespielter Anteil in `tone`, Rest gedämpft), `anchor: 'center' \| 'bottom'`, `live`, `label`, `tone` |
| `RadialBars` | `values`, `barCount` (36), `size` (88), `innerRadius` (24), `strength` (0..1), `strokeWidth`, `live`, `label`, `tone` |
| `ActivityRing` | `mode: 'speech' \| 'music' \| 'off'`, `diameter` (44), `values`, `intensity` (Schein), `tone`, `musicTone`, `label`, `children` (Avatar/Knopf) |

`tone`: `current \| primary \| muted \| chart-1..5`. Helfer: `staticEnvelope`, `radialBarGeometry`, `activityRingGeometry`, `visualToneVariants`.

**A11y.** Ohne `label` dekorativ (`aria-hidden`); mit `label` `role="img"`. `ActivityRing` setzt das Label auf die Kranz-Ebene, damit `children` (z. B. ein Knopf) bedienbar bleiben. Bei `prefers-reduced-motion` zeigen `live`-Visualisierungen eine stehende Hüllkurve; Übergänge nur unter `motion-safe`.

**Do.** Werte drosseln (≤ 30 fps), Visualisierung nur rendern, solange sie sichtbar ist.
**Don't.** Keine Information nur über die Welle vermitteln.

**Abweichungen von RadioX.** Kein Web Audio, kein geteilter Analyser, keine rAF-Schleife und kein Fahrmodus im Core. Farbe über `currentColor`/Tokens statt Sprecher-RGB und Cyan. Schein über weichgezeichnete Fläche statt `box-shadow` mit RGB-Werten.

---

## Offene Punkte

- Visuelle Prüfung im Browser (hell/dunkel, alle Brands) steht aus.
- Export über `packages/core/src/index.ts` erfolgt bei der Integration.
- Carousel unterstützt nur horizontale Ausrichtung.
