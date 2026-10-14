# Controls

Bedienelemente aus dem RadioX-Import: Button-Erweiterungen, IconButton, PlayButton, Toggle/LikeToggle, Switch, RadioGroup. Dazu die Atlas-Basisprimitive ToggleGroup und Progress. Alle Komponenten nutzen nur semantische Tokens (`primary`, `background`, `input`, `ring`, `muted-foreground` …) und `var(--brand-radius)`; das Aussehen einer Marke kommt aus dem Brand-Paket.

Gemeinsame Regeln:

- Fokus immer als Outline: `focus-visible:outline-2 outline-offset-2 outline-ring`, nie nur als box-shadow-Ring.
- Trefferfläche mindestens 44 × 44 px. Kleinere sichtbare Knöpfe erweitern sie über ein unsichtbares `::after`.
- Bewegung (Scale, Spinner, Thumb-Gleiten) nur unter `motion-safe:`.
- Deutsche Default-Texte (Schweizer Schreibweise) sind per Prop überschreibbar.

## Button (Erweiterung)

**Zweck:** Bestehender Atlas-Button, ergänzt um Ladezustand und volle Breite.

**Props:** `variant` default | destructive | outline | secondary | ghost | link · `size` default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg · `fullWidth` boolean · `loading` boolean · `asChild` boolean.

**A11y:** `loading` setzt `aria-busy` und `aria-disabled` (nicht `disabled`, damit der Tastaturfokus erhalten bleibt), ignoriert Klicks und zeigt einen `aria-hidden`-Spinner (`Loader2`). Bei Icon-Grössen ersetzt der Spinner das Icon. Mit `asChild` wird kein Spinner eingefügt (Slot verlangt genau ein Kind), nur `aria-busy`/`data-loading`. Fokus neu als Outline (Audit P1), vorher `outline-none` + Ring.

**Do:** Beschriftung während des Ladens anpassen («Wird gespeichert»), Ergebnis über eine Live-Region melden. **Don't:** `loading` für lange Hintergrundprozesse ohne Statusmeldung verwenden.

**Herkunft:** `radiox/apps/frontend/components/ui/Button.tsx`

## IconButton

**Zweck:** Quadratischer oder runder Button nur mit Icon (Teilen, Schliessen, Einstellungen).

**Props:** `aria-label` (TS-Pflicht) · `variant` default | secondary | outline | ghost (Default) | destructive | glass · `size` sm 32 px | md 40 px | lg 48 px · `shape` square | round · `loading` · alle Button-Props ausser `size`/`variant`/`fullWidth`.

**A11y:** Name ausschliesslich über `aria-label`; Lucide-Icons sind `aria-hidden`. Trefferfläche über `::after` immer ≥ 44 px. `glass` nutzt `backdrop-blur` nur unter `@supports (backdrop-filter)`, sonst deckendes `bg-background`.

**Do:** Tooltip ergänzen, wenn das Icon nicht eindeutig ist. **Don't:** Glas auf unruhigem Hintergrund ohne Kontrollprüfung einsetzen.

**Herkunft:** `radiox/apps/frontend/components/ui/IconButton.tsx`

## PlayButton

**Zweck:** Ein Play/Pause-Knopf für alle Ansichten (Karte, Mini-Player, Player, Fahrmodus). Ersetzt GlassPlayButton und PlayPill.

**Props:** `label` (Pflicht, fester Name) · `state` idle | loading | playing | paused · `size` sm 36 | md 44 | lg 64 | xl 112 px · `material` glass | solid · `onPlay` (bei idle/paused) · `onPause` (bei playing) · `announce` (Live-Region, Default an) · `statusLabels` (Texte der Live-Region, Default «Wird geladen», «Wiedergabe läuft», «Pausiert») · `iconClassName` · `children` (dekorative Ebene unter dem Symbol, z. B. Cover).

**A11y:** Fester Name plus `aria-pressed` (true bei playing/loading), `aria-busy` bei loading, Klicks bei loading werden ignoriert. Zustandswechsel über einen `Announcer` (sr-only, Geschwister-Element; Stand beim Einhängen still, 400 ms entprellt). sm erweitert die Trefferfläche auf 44 px. Scale-Hover/-Active nur `motion-safe`, Spinner dreht nur `motion-safe`.

**Do:** `onClick` mit `event.stopPropagation()` nutzen, wenn der Knopf auf einer klickbaren Karte liegt (`preventDefault()` unterdrückt onPlay/onPause). **Don't:** den Namen je Zustand wechseln und gleichzeitig `aria-pressed` setzen.

**Herkunft:** `radiox/apps/frontend/components/ui/GlassPlayButton.tsx`, `radiox/apps/frontend/index.css` (`.rx-glass-play`), `radiox/apps/frontend/components/MediaPlayer/PlayPill.tsx`

## Toggle / LikeToggle

**Zweck:** Zweizustands-Knopf (Radix Toggle). LikeToggle ist ein Preset mit Herz, gefüllt wenn aktiv.

**Props Toggle:** Radix-Toggle-Props (`pressed`, `defaultPressed`, `onPressedChange`, `disabled`) · `variant` default | outline · `size` sm | default | lg.

**Props LikeToggle:** `label` (Default «Gefällt mir») · `showLabel` · `count` (de-CH formatiert) · `size` sm | default | lg · Radix-Toggle-Props.

**A11y:** `aria-pressed` durch Radix. Fester Name, der Zustand wird nicht in den Namen geschrieben. Kleine Grössen erweitern die Trefferfläche auf 44 px.

**Do:** Optimistisch umschalten und bei Fehler zurücksetzen (in der App). **Don't:** API-Aufrufe oder Persistenz in die Komponente legen.

**Herkunft:** `radiox/apps/frontend/components/TrackVoteHeart.tsx`

## Switch

**Zweck:** Ein/Aus-Schalter für Einstellungen mit sofortiger Wirkung (Radix Switch).

**Props:** Radix-Switch-Props (`checked`, `defaultChecked`, `onCheckedChange`, `disabled`, `name`, `required`) · `size` default (44 × 24) | sm (36 × 20).

**A11y:** `role="switch"` und `aria-checked` durch Radix; mit `<Label htmlFor>` verbinden. Unsichtbare Trefferfläche vertikal 44 px. `border-2 border-transparent` bleibt in Forced Colors als Kontur sichtbar.

**Do:** Sichtbares «An/Aus» nur ergänzend und `aria-hidden`. **Don't:** Switch für Aktionen verwenden, die erst mit «Speichern» wirksam werden (dafür Checkbox).

**Herkunft:** `radiox/apps/frontend/components/MediaPlayer/AutoFollowToggle.tsx` (Persistenz `useAutoFollowPreference` bleibt in RadioX)

## RadioGroup

**Zweck:** Einzelauswahl aus wenigen Optionen (Radix RadioGroup), mit Label und Beschreibung.

**Komponenten:** `RadioGroup` (Root, Radix-Props) · `RadioGroupItem` (nur der Kreis) · `RadioGroupOption` (`value`, `label`, `description`, `variant` plain | card, `optionClassName`, `disabled`).

**A11y:** Pfeiltasten-Navigation und Roving Focus durch Radix. `RadioGroupOption` ist ein natives `<label for>`, ganze Zeile/Karte klickbar, `min-h-11`. Name per `aria-labelledby`, Beschreibung per `aria-describedby`. Gruppe immer benennen (`aria-label` oder `aria-labelledby`).

**Do:** card-Variante für Optionen mit Erklärung (Audioqualität). **Don't:** mehr als etwa sieben Optionen (dann Select).

**Herkunft:** `radiox/apps/frontend/components/MediaPlayer/AudioQualityControl.tsx`

## ToggleGroup

**Zweck:** Mehrere Toggles als eine Gruppe (Radix ToggleGroup): Einzelauswahl (`type="single"`, z. B. Ausrichtung, Ansicht Liste/Raster) oder Mehrfachauswahl (`type="multiple"`, z. B. Textformat).

**Komponenten:** `ToggleGroup` (Root) · `ToggleGroupItem` (Eintrag, Pflicht `value`). Datei: `packages/core/src/ui/toggle-group.tsx` (`'use client'`).

**Props ToggleGroup:** Radix-ToggleGroup-Props (`type`, `value`, `defaultValue`, `onValueChange`, `disabled`, `rovingFocus`, `loop`, `orientation`) · `variant` default | outline · `size` sm | default | lg · `spacing` (Tailwind-Schritte, Standard `0`). Variante und Grösse gehen per Kontext an alle Einträge; nur wenn die Gruppe sie nicht setzt, gilt die Angabe am Eintrag.

**Darstellung:** `ToggleGroupItem` verwendet dieselben `toggleVariants` wie `Toggle`. Mit `spacing={0}` bilden die Einträge eine verbundene Leiste (nur äussere Ecken gerundet, Rahmen nicht doppelt, bei `outline` ein gemeinsamer Schatten am Root); mit `spacing` > 0 stehen sie frei. `data-variant`, `data-size` und `data-spacing` stehen auf Root und Einträgen, `data-orientation` auf dem Root.

**A11y:** Radix setzt bei `single` `role="radiogroup"` mit `role="radio"`/`aria-checked`, bei `multiple` `role="toolbar"` mit `aria-pressed`. Pfeiltasten und Roving Focus durch Radix. Gruppe immer benennen (`aria-label` oder `aria-labelledby`); Einträge nur mit Icon brauchen ein eigenes `aria-label`. Kleine Grössen erweitern die Trefferfläche auf 44 px: freistehend als Quadrat, in der verbundenen Leiste nur quer zur Leiste, damit sich Nachbarn nicht überdecken. Der fokussierte Eintrag liegt oben (`z-10`), damit der Nachbar die Outline nicht verdeckt.

**Do:** Für zwei bis etwa fünf gleichrangige Optionen mit sofortiger Wirkung. **Don't:** Als Ersatz für Tabs (Inhalt wechseln) oder für eine Formularauswahl, die erst mit «Speichern» gilt (dafür RadioGroup).

**Herkunft:** Atlas-Basisprimitive auf Radix ToggleGroup, kein RadioX-Vorbild.

## Progress

**Zweck:** Fortschritt eines Vorgangs mit bekannter Dauer (Upload, Export, Import) oder, unbestimmt, einer laufenden Arbeit ohne Prozentangabe.

**Props:** `value` (Zahl; `null` oder weggelassen = unbestimmt) · `max` (Standard 100, ungültige Werte fallen auf 100 zurück) · `getValueLabel(value, max)` (Standard `formatProgressValue`: gerundeter Prozentwert mit geschütztem Leerzeichen, «42 %») · `tone` (`Tone`, Standard `primary`) · `size` sm | default | lg (4/8/12 px) · `indicatorClassName` · alle Radix-Progress-Props. Datei: `packages/core/src/ui/progress.tsx` (`'use client'`).

**Verhalten:** Der Balken gleitet bei Wertänderung (`motion-safe:transition-transform`, 300 ms). Unbestimmt (`data-state="indeterminate"`) läuft ein Drittelbalken durch die Spur; bei reduzierter Bewegung steht stattdessen ein voller, halbtransparenter Balken. Die Keyframes kommen aus der internen Ressource `CoreKeyframes` (`motion-keyframes.tsx`), nicht aus `styles.css`.

**A11y:** `role="progressbar"`, `aria-valuemin`/`aria-valuemax`/`aria-valuenow` und `aria-valuetext` durch Radix; unbestimmt ohne `aria-valuenow`. Der Name kommt vom Aufrufer (`aria-label` oder `aria-labelledby` auf ein sichtbares Label). Die Spur ist `bg-muted`, die Füllung eine Tonrolle (`toneFill`). Damit der Stand nicht nur über die Fläche lesbar ist, den Wert bei wichtigen Vorgängen zusätzlich als Text zeigen.

**Do:** Bei langen Vorgängen den Stand in grösseren Schritten aktualisieren und den Abschluss über eine Live-Region melden (`Announcer`, Toast). **Don't:** Den Balken selbst als Live-Region verwenden oder für Messwerte ohne Vorgang nutzen (dafür ein Diagramm oder eine Kennzahl).

**Herkunft:** Atlas-Basisprimitive auf Radix Progress, kein RadioX-Vorbild.
