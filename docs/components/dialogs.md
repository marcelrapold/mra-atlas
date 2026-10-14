# Dialogs: ConfirmDialog, Swipe-to-dismiss, ErrorBoundary

Group "dialogs" of the RadioX import. All components use semantic tokens only; brand looks come from the active brand package.

## ConfirmDialog (`ui/confirm-dialog.tsx`)

**Purpose.** Promise-based replacement for `window.confirm`, `window.prompt` and `window.alert`, built on the existing Atlas `Dialog` exports.

**API.**

- `ConfirmDialogProvider` – mount once near the root. Props: `children`, `labels?: Partial<ConfirmDialogLabels>`.
- `useConfirm()` → `(string | ConfirmOptions) => Promise<boolean>`
- `usePrompt()` → `(string | PromptOptions) => Promise<string | null>` (null = cancelled)
- `useInform()` → `(string | InformOptions) => Promise<void>`
- Common options: `title?`, `message` (line breaks kept).
- `ConfirmOptions`: `confirmLabel?`, `cancelLabel?`, `tone?: 'default' | 'destructive'`.
- `PromptOptions`: `defaultValue?`, `inputLabel?`, `placeholder?`, `inputType?`, `required?`, `confirmLabel?`, `cancelLabel?`.
- `InformOptions`: `confirmLabel?`, `tone?`.
- Default labels (`defaultConfirmDialogLabels`): Bestätigen, Eingabe, Hinweis, Abbrechen, Übernehmen, Verstanden, Schliessen.
- Root carries `data-slot="confirm-dialog"`, `data-kind`, `data-tone`.

**Behaviour.** One dialog at a time; a second request while one is shown resolves immediately as cancelled (`false` / `null`), so an on-screen decision is never replaced. The promise resolves after the dialog closed and focus returned to the previously focused element (`onCloseAutoFocus`, 1 s fallback). Escape, overlay click and the close button count as cancel.

**Accessibility.** `role="alertdialog"` for confirm and inform, `role="dialog"` for prompt. Title and message wired via Radix `aria-labelledby` / `aria-describedby`. Initial focus: Cancel for confirm (safe default), the field (selected) for prompt, the acknowledge button for inform. Enter submits via a native form. Actions reach 44 px on coarse pointers and show an outline focus ring.

**Do.** Use `tone: 'destructive'` with a specific verb (“Endgültig löschen”). Keep messages short.
**Don't.** Stack dialogs, or use it for long forms (use `Dialog` or `Sheet`). Don't rely on it inside server components.

**RadioX origin.** `radiox/apps/frontend/components/ui/useAppDialog.tsx`.

## Swipe-to-dismiss (`lib/use-swipe-to-dismiss.ts`, `ui/sheet.tsx`)

**Purpose.** Drag a bottom sheet down with one finger to close it.

**API.**

- `SheetContent` new props: `swipeToClose?: boolean` (default `false`, opt-in; only effective for `side="bottom"`), `showGrabber?: boolean` (default `true`). Adds `data-side` and `data-swipe-to-close` on the content; the grabber has `data-slot="sheet-grabber"`.
- `useSwipeToDismiss(element: HTMLElement | null, { enabled, onDismiss })` for custom surfaces. Pass the element from a callback ref kept in state (portalled content mounts lazily).
- Pure helpers (tested in `tests/swipe-to-dismiss.test.mjs`): `releaseVelocity`, `shouldDismiss`, `classifyGestureStart`, `trimSamples`, `isTopmostOpenDialog`, constants `SWIPE_DISMISS_RATIO` (0.25), `SWIPE_DISMISS_VELOCITY` (0.5 px/ms), `FLICK_MIN_DISTANCE` (24 px), `FLICK_WINDOW_MS` (100 ms), `SWIPE_SLOP` (8 px), `NO_SWIPE_SELECTOR`.

**Behaviour.** Follows the finger downward; closes at 25 % of the height or on a flick measured over the last 100 ms. Scrolling wins (content scrolled away from top, or first move up/sideways). Inputs, textareas, selects, contenteditable, `role="slider"` and `[data-no-swipe-dismiss]` never start a swipe. Only the topmost open Radix dialog (`data-state="open"`) reacts. Closing goes through a hidden `Dialog.Close`, so `onOpenChange` fires exactly as with the close button.

**Accessibility.** The gesture is an addition, never the only way: Escape and the close button keep working. The grabber is `aria-hidden` and only visible on coarse pointers. With `prefers-reduced-motion: reduce` there is no spring or exit animation; the sheet snaps back or closes immediately.

**Do.** Give long bottom sheets `max-h-[85dvh] overflow-y-auto`; mark horizontal carousels or canvases with `data-no-swipe-dismiss`.
**Don't.** Enable it for sheets with unsaved input without confirming first.

**RadioX origin.** `radiox/apps/frontend/components/ui/useSwipeToDismiss.ts` (+ `.test.tsx`).

## ErrorBoundary (`ui/error-boundary.tsx`)

**Purpose.** Contain render errors of one area and offer a retry instead of a blank page.

**API.** Class component `ErrorBoundary` with props `children`, `scope?`, `onError?(error, info, scope)`, `resetKey?` (any value; a change resets a shown error, e.g. pathname), `onReset?`, `fallback?: ReactNode | ({ error, reset, scope }) => ReactNode`, `labels?: Partial<{ title, description, retry }>`, `showDetails?` (shows `error.message`, development only), `className?`. Also exports `ErrorBoundaryFallback` and `defaultErrorBoundaryLabels` (Etwas ist schiefgelaufen / Erneut versuchen).

**Accessibility.** Default fallback is an `EmptyState` inside `role="alert"` (`data-slot="error-boundary"`), so the failure is announced. Retry is a native button with 44 px on coarse pointers.

**Do.** Wrap independent regions (widgets, routes) and pass `resetKey` for navigation. Report errors through `onError`.
**Don't.** Expect it to catch errors in event handlers or promises (React limitation).

**RadioX origin.** `radiox/apps/frontend/components/ErrorBoundary.tsx`.

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

**Reduzierte Bewegung.** Unter `prefers-reduced-motion: reduce` entfallen Verschiebung und Zoom (`--atlas-motion: 0`), Überlagerungen blenden nur noch. Alle Dauern sind auf `--duration-reduced` begrenzt. Endlos-Animationen in Core sind an `motion-safe:` gebunden, Spinner stehen dann still und der Status bleibt über `aria-busy` lesbar.

**Ebenen.** `z-overlay` (Overlays), `z-modal` (Dialog- und Sheet-Inhalt), `z-dropdown` (Popover, Select, DropdownMenu), `z-tooltip` (Tooltip). Die Utilities kompilieren zu `var(--z-index-*)`; die Brand-Werte am Scope gewinnen. Popover, Select und Menüs, die aus einem offenen Dialog oder Sheet aufgehen, werden auf Modal-Ebene gehoben. Overlays verwenden `bg-overlay/50` statt `bg-black/50`.

**Vorgaben.** `closeLabel` ist «Schliessen» (DialogContent, DialogFooter, SheetContent, CommandDialog). CommandDialog: Titel «Befehlspalette», Beschreibung «Befehl suchen …». Toaster: `containerAriaLabel` «Benachrichtigungen», Schliessen-Knopf «Meldung schliessen», Lade-Icon nur mit `motion-safe:` animiert. Titel von Dialog, Sheet und ConfirmDialog brechen mit `text-balance`, Beschreibungen mit `text-pretty`. Der Schliessen-Knopf des Dialogs nutzt den gemeinsamen `focusRing`. `SelectTrigger` zeigt `aria-invalid` mit 2 px Rand in `destructive` und rotem Chevron; die `Select*Props`-Typen sind exportiert.

**Darstellungsmodi.** Unter `forced-colors: active` stehen hervorgehobene Menü-, Select- und Command-Einträge, der aktive Tab, `Toggle` im Zustand an, die markierte Checkbox und der eingeschaltete Switch auf `Highlight`/`HighlightText`; der Radio-Punkt und der Switch-Daumen auf `CanvasText`, deaktivierte Elemente auf `GrayText`. Unter `prefers-reduced-transparency: reduce` werden Glas-IconButton, Glas-PlayButton, MediaBar, BottomNav und `[data-slot=lightbox-backdrop]` deckend in `--background`, ohne `backdrop-filter`. Unter `prefers-contrast: more` zeigt `--border` auf `--input` und `--muted-foreground` auf `--foreground`; es ändern sich nur Rollen, keine Farbwerte.

**Kaskade.** Brand-Vorgaben für Core-Komponenten (Schatten, Default-Buttongrösse, Gewichte) liegen in `@layer components` mit Spezifität 0. Die Default-Grösse gilt für alle Elemente mit `[data-variant][data-size=default]` aus Button, auch wenn ein Slot-Trigger (`dialog-trigger` …) das `data-slot` überschreibt. Eigene Utilities in `className` (etwa `px-3`) gewinnen.

## Abweichungen von RadioX

- No telemetry, logger or stale-chunk auto-reload in ErrorBoundary (app/deploy specific); the full-screen dark fallback became a token-based `EmptyState` with one retry action instead of Reload/Reset.
- ConfirmDialog is a provider plus three hooks instead of one hook returning a `dialog` element; adds `title`, `cancelLabel`, prompt field options and a `destructive` tone name (RadioX: `danger`).
- Swipe hook uses Radix `data-state` instead of the RadioX modal stack, moves the content element itself (no `data-modal-sheet` resolution) and fades the sheet instead of a separate backdrop.
