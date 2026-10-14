# Dialoge: ConfirmDialog, Wischen zum Schliessen, ErrorBoundary

Gruppe «dialogs» aus dem RadioX-Import. Alle Komponenten nutzen ausschliesslich semantische Tokens; das Aussehen kommt aus dem aktiven Brand-Paket.

## ConfirmDialog (`ui/confirm-dialog.tsx`)

**Zweck.** Promise-basierter Ersatz für `window.confirm`, `window.prompt` und `window.alert`, gebaut auf den bestehenden Atlas-Exporten von `Dialog`.

**API.**

- `ConfirmDialogProvider` – einmal nahe der Wurzel einbinden. Props: `children`, `labels?: Partial<ConfirmDialogLabels>`.
- `useConfirm()` → `(string | ConfirmOptions) => Promise<boolean>`
- `usePrompt()` → `(string | PromptOptions) => Promise<string | null>` (null = abgebrochen)
- `useInform()` → `(string | InformOptions) => Promise<void>`
- Gemeinsame Optionen: `title?`, `message` (Zeilenumbrüche bleiben erhalten).
- `ConfirmOptions`: `confirmLabel?`, `cancelLabel?`, `tone?: 'default' | 'destructive'`.
- `PromptOptions`: `defaultValue?`, `inputLabel?`, `placeholder?`, `inputType?`, `required?`, `confirmLabel?`, `cancelLabel?`.
- `InformOptions`: `confirmLabel?`, `tone?`.
- Standardbeschriftungen (`defaultConfirmDialogLabels`): Bestätigen, Eingabe, Hinweis, Abbrechen, Übernehmen, Verstanden, Schliessen.
- Das Wurzelelement trägt `data-slot="confirm-dialog"`, `data-kind`, `data-tone`.

**Verhalten.** Immer nur ein Dialog; eine zweite Anfrage, während einer offen ist, wird sofort als abgebrochen aufgelöst (`false` / `null`), eine angezeigte Entscheidung wird also nie ersetzt. Das Promise löst auf, nachdem der Dialog geschlossen ist und der Fokus zum zuvor fokussierten Element zurückgekehrt ist (`onCloseAutoFocus`, Rückfall nach 1 s). Escape, Klick auf das Overlay und der Schliessen-Knopf gelten als Abbruch.

**Barrierefreiheit.** `role="alertdialog"` für Bestätigen und Hinweis, `role="dialog"` für Eingabe. Titel und Text sind über Radix `aria-labelledby` / `aria-describedby` verknüpft. Anfangsfokus: Abbrechen beim Bestätigen (sichere Vorgabe), das Feld (markiert) bei der Eingabe, der Bestätigungsknopf beim Hinweis. Enter sendet über ein natives Formular. Aktionen erreichen bei groben Zeigern 44 px und zeigen einen Outline-Fokusring.

**Empfohlen.** `tone: 'destructive'` mit einem konkreten Verb («Endgültig löschen»). Texte kurz halten.
**Vermeiden.** Dialoge stapeln oder lange Formulare damit abbilden (dafür `Dialog` oder `Sheet`). Nicht in Server-Komponenten verwenden.

**Herkunft RadioX.** `radiox/apps/frontend/components/ui/useAppDialog.tsx`.

## Wischen zum Schliessen (`lib/use-swipe-to-dismiss.ts`, `ui/sheet.tsx`)

**Zweck.** Ein Bottom-Sheet mit einem Finger nach unten ziehen und so schliessen.

**API.**

- Neue Props von `SheetContent`: `swipeToClose?: boolean` (Standard `false`, Opt-in; wirkt nur bei `side="bottom"`), `showGrabber?: boolean` (Standard `true`). Setzt `data-side` und `data-swipe-to-close` auf den Inhalt; der Griff hat `data-slot="sheet-grabber"`.
- `useSwipeToDismiss(element: HTMLElement | null, { enabled, onDismiss })` für eigene Flächen. Das Element aus einem Callback-Ref im State übergeben (der Inhalt im Portal wird verzögert gemountet).
- Reine Hilfsfunktionen (getestet in `tests/swipe-to-dismiss.test.mjs`): `releaseVelocity`, `shouldDismiss`, `classifyGestureStart`, `trimSamples`, `isTopmostOpenDialog`, Konstanten `SWIPE_DISMISS_RATIO` (0.25), `SWIPE_DISMISS_VELOCITY` (0.5 px/ms), `FLICK_MIN_DISTANCE` (24 px), `FLICK_WINDOW_MS` (100 ms), `SWIPE_SLOP` (8 px), `NO_SWIPE_SELECTOR`.

**Verhalten.** Folgt dem Finger nach unten; schliesst bei 25 % der Höhe oder bei einem schnellen Wisch, gemessen über die letzten 100 ms. Scrollen hat Vorrang (Inhalt nicht ganz oben oder erste Bewegung nach oben bzw. seitwärts). Eingabefelder, Textareas, Selects, contenteditable, `role="slider"` und `[data-no-swipe-dismiss]` starten nie ein Wischen. Nur der oberste offene Radix-Dialog (`data-state="open"`) reagiert. Das Schliessen läuft über ein verborgenes `Dialog.Close`, `onOpenChange` feuert also genau wie beim Schliessen-Knopf.

**Barrierefreiheit.** Die Geste ist eine Ergänzung, nie der einzige Weg: Escape und der Schliessen-Knopf funktionieren weiter. Der Griff ist `aria-hidden` und nur bei groben Zeigern sichtbar. Unter `prefers-reduced-motion: reduce` gibt es weder Federung noch Ausblend-Animation; das Sheet springt zurück oder schliesst sofort.

**Empfohlen.** Langen Bottom-Sheets `max-h-[85dvh] overflow-y-auto` geben; horizontale Karussells oder Canvas-Flächen mit `data-no-swipe-dismiss` markieren.
**Vermeiden.** Für Sheets mit ungespeicherten Eingaben ohne vorherige Rückfrage aktivieren.

**Herkunft RadioX.** `radiox/apps/frontend/components/ui/useSwipeToDismiss.ts` (+ `.test.tsx`).

## ErrorBoundary (`ui/error-boundary.tsx`)

**Zweck.** Renderfehler eines Bereichs eingrenzen und statt einer leeren Seite einen neuen Versuch anbieten.

**API.** Klassenkomponente `ErrorBoundary` mit den Props `children`, `scope?`, `onError?(error, info, scope)`, `resetKey?` (beliebiger Wert; eine Änderung setzt einen angezeigten Fehler zurück, z. B. der Pfad), `onReset?`, `fallback?: ReactNode | ({ error, reset, scope }) => ReactNode`, `labels?: Partial<{ title, description, retry }>`, `showDetails?` (zeigt `error.message`, nur in der Entwicklung), `className?`. Exportiert ausserdem `ErrorBoundaryFallback` und `defaultErrorBoundaryLabels` (Etwas ist schiefgelaufen / Erneut versuchen).

**Barrierefreiheit.** Der Standard-Ersatz ist ein `EmptyState` in `role="alert"` (`data-slot="error-boundary"`), der Fehler wird also angesagt. «Erneut versuchen» ist ein nativer Knopf mit 44 px bei groben Zeigern.

**Empfohlen.** Unabhängige Bereiche (Widgets, Routen) einzeln umschliessen und für die Navigation `resetKey` übergeben. Fehler über `onError` melden.
**Vermeiden.** Erwarten, dass Fehler in Event-Handlern oder Promises abgefangen werden (Einschränkung von React).

**Herkunft RadioX.** `radiox/apps/frontend/components/ErrorBoundary.tsx`.

## Überlagerungen: Bewegung, Ebenen und Vorgaben (`styles.css`, `ui/dialog.tsx`, `ui/sheet.tsx` …)

**Bewegung.** Atlas bringt eine eigene, API-kompatible Teilmenge der tw-animate-Klassen mit (`animate-in`, `animate-out`, `fade-in-0`, `fade-out-0`, `zoom-in-95`, `zoom-out-95`, `slide-in-from-{top,bottom,left,right}-2`, `slide-in-from-*` und `slide-out-to-*` mit 100 %), ohne zusätzliche Abhängigkeit. Die Klassen setzen nur Variablen; die Keyframes `atlas-enter` und `atlas-exit` lesen sie. Dauer und Kurve kommen aus den Foundation-Tokens der aktiven Brand, `duration-*` und `ease-*` am Element übersteuern sie. Radix Presence erhält weiterhin `animationend`, Exit-Animationen laufen also vollständig.

| Komponente | Einblenden | Ausblenden | Bewegung, Ursprung |
| --- | --- | --- | --- |
| Dialog, ConfirmDialog, CommandDialog | `--duration-normal`, `--easing-enter` | `--duration-exit`, `--easing-exit` | Blende und Zoom 95 %, Bildschirmmitte |
| Dialog-Overlay | `--duration-normal`, `--easing-enter` | `--duration-exit`, `--easing-exit` | nur Blende |
| Sheet | `--duration-deliberate`, `--easing-drawer` | `--duration-slow`, `--easing-drawer` | Schub um 100 % von der Seite `side`, Overlay im gleichen Takt |
| Popover, Select, DropdownMenu | `--duration-normal`, `--easing-enter` | `--duration-exit`, `--easing-exit` | Blende, Zoom 95 % und 8 px vom Trigger weg, Ursprung `--radix-*-content-transform-origin` |
| Tooltip | `--duration-normal`, `--easing-enter` | `--duration-exit`, `--easing-exit` | wie Popover; `instant-open` ohne Animation |

Werte der Brands: neutral 200 ms, Rapold 180 ms, RadioX 250 ms für `--duration-normal`; `--duration-exit` 150 ms, `--easing-drawer` `cubic-bezier(0.32, 0.72, 0, 1)` und `--duration-reduced` 160 ms aus `foundation.json`. `transition`-Utilities ohne Dauer nutzen `--duration-fast` und `--easing-standard`.

**Reduzierte Bewegung.** Unter `prefers-reduced-motion: reduce` entfallen Verschiebung und Zoom (`--atlas-motion: 0`), Überlagerungen blenden nur noch. Alle Dauern sind auf `--duration-reduced` begrenzt. Endlos-Animationen in Core sind an `motion-safe:` gebunden; das Pulsieren von `Skeleton` hält `styles.css` an. Spinner stehen dann still, der Status bleibt über `aria-busy` lesbar.

**Ebenen.** `--z-index-overlay` (Overlays), `--z-index-modal` (Dialog- und Sheet-Inhalt), `--z-index-dropdown` (Popover, Select, DropdownMenu), `--z-index-tooltip` (Tooltip). Die Komponenten setzen sie als `z-(--z-index-*)`; die Brand-Werte am Scope gewinnen. tailwind-merge erkennt diese Schreibweise, ein `z-50` oder `z-[60]` in `className` ersetzt den Default. Die benannten Utilities (`z-modal` …) gibt es ebenfalls, tailwind-merge kennt sie aber nicht; zum Übersteuern daher `z-(--z-index-*)` oder Zahlenwerte verwenden. Popover, Select (auch mit dem Default `position="item-aligned"`) und Menüs, die aus einem offenen Dialog, ConfirmDialog oder Sheet aufgehen, werden auf Modal-Ebene gehoben. Overlays verwenden `bg-overlay/50` statt `bg-black/50`.

**Bekannte Abweichung.** `BottomNav` und `MediaBar` setzen fest `z-40`. Seit Menüs auf `--z-index-dropdown` (30) statt `z-50` liegen, öffnen Popover, Menüs und Select, die über diese Leisten ragen, darunter. Bis die Leisten auf `--z-index-sticky` wechseln, hilft `className="z-50"` am Inhalt.

**Vorgaben.** `closeLabel` ist «Schliessen» (DialogContent, DialogFooter, SheetContent, CommandDialog). CommandDialog: Titel «Befehlspalette», Beschreibung «Befehl suchen …». Toaster: `containerAriaLabel` «Benachrichtigungen», Schliessen-Knopf «Meldung schliessen», Lade-Icon nur mit `motion-safe:` animiert. Titel von Dialog, Sheet und ConfirmDialog brechen mit `text-balance`, Beschreibungen mit `text-pretty`. Der Schliessen-Knopf des Dialogs nutzt den gemeinsamen `focusRing`. `SelectTrigger` zeigt `aria-invalid` mit 2 px Rand in `destructive` und rotem Chevron; die `Select*Props`-Typen sind exportiert.

**Darstellungsmodi.** Unter `forced-colors: active` stehen hervorgehobene Menü-, Select- und Command-Einträge, der aktive Tab, `Toggle` im Zustand an, die markierte Checkbox und der eingeschaltete Switch auf `Highlight`/`HighlightText`; der Radio-Punkt und der Switch-Daumen auf `CanvasText`, deaktivierte Elemente auf `GrayText`. Unter `prefers-reduced-transparency: reduce` werden Glas-IconButton, Glas-PlayButton, MediaBar, BottomNav und `[data-slot=lightbox-backdrop]` deckend in `--background`, ohne `backdrop-filter`. Unter `prefers-contrast: more` zeigt `--border` auf `--input` und `--muted-foreground` auf `--foreground`; es ändern sich nur Rollen, keine Farbwerte.

**Kaskade.** Brand-Vorgaben für Core-Komponenten (Schatten, Default-Buttongrösse, Gewichte) liegen in `@layer components` mit Spezifität 0. Die Default-Grösse gilt für alle Elemente mit `[data-variant][data-size=default]` aus Button, auch wenn ein Slot-Trigger (`dialog-trigger` …) das `data-slot` überschreibt. Ein IconButton als Trigger bleibt wie das eigenständige IconButton ohne Brand-Schatten. Überschriften `h1` bis `h3` mit der Default-Klasse `font-semibold` (DialogTitle, SheetTitle) behalten das Brand-Gewicht. Eigene Utilities in `className` (etwa `px-3`, `font-bold`) gewinnen.

## Abweichungen von RadioX

- Keine Telemetrie, kein Logger und kein automatisches Neuladen bei veralteten Chunks in ErrorBoundary (app- bzw. deploymentspezifisch); der dunkle Vollbild-Ersatz wurde zu einem tokenbasierten `EmptyState` mit einer Aktion «Erneut versuchen» statt Neu laden/Zurücksetzen.
- ConfirmDialog ist ein Provider mit drei Hooks statt eines Hooks, der ein `dialog`-Element zurückgibt; neu sind `title`, `cancelLabel`, Optionen für das Eingabefeld und der Tonname `destructive` (RadioX: `danger`).
- Der Wisch-Hook nutzt Radix `data-state` statt des RadioX-Modal-Stapels, bewegt das Inhaltselement selbst (keine Auflösung über `data-modal-sheet`) und blendet das Sheet aus statt eines separaten Hintergrunds.
