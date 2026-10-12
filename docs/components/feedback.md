# Feedback: Alert, Announcer, Hooks, LogView

Gruppe «feedback» aus dem RadioX-Import. Alle Komponenten verwenden nur semantische Tokens (`info`, `success`, `warning`, `destructive`, `muted`, `card`, `ring`, `chart-1…5`) und `var(--brand-radius)`. Texte sind deutsch (Schweizer Schreibweise) und per Props überschreibbar. Demo: `apps/docs/app/_components/demos/feedback-demo.tsx`.

## Alert

Datei: `packages/core/src/ui/alert.tsx` · Exporte: `Alert`, `AlertTitle`, `AlertDescription`, `AlertActions`, `alertVariants`, Typen `AlertProps`, `AlertTone`.

**Zweck.** Hinweis- oder Statusbanner im Seitenfluss: Sperrhinweise, Wartungsmeldungen, Ergebnis eines Hintergrundjobs, «geteilt»-Hinweise. Kein Toast, keine Überlagerung.

**Props.**

| Prop | Typ | Standard | Hinweis |
| --- | --- | --- | --- |
| `tone` | `info \| success \| warning \| danger \| neutral` | `info` | setzt `data-variant` |
| `size` | `default \| sm` | `default` | `sm` für einzeilige Pillen |
| `role` | `status \| alert \| none` | `alert` bei `danger`, sonst `status` | `none` für statische Hinweise |
| `icon` | `ReactNode \| null` | Icon je Ton | `null` blendet aus; Spinner mit `motion-safe:animate-spin` |
| `dismissible` | `boolean` | `false` | Schliessen-Knopf 44×44 px |
| `dismissLabel` | `string` | «Meldung schliessen» | |
| `onDismiss` | `() => void` | – | auch nach `autoHideMs` |
| `autoHideMs` | `number` | – | pausiert bei Hover/Fokus, startet danach neu |
| `open` | `boolean` | intern | kontrollierte Sichtbarkeit |

**A11y.** Live-Region nur, wenn der Hinweis dynamisch erscheint oder wechselt; Screenreader melden Regionen, die schon beim Laden im DOM stehen, nicht. Statische Hinweise mit `role="none"`. Text immer `text-foreground`/`text-muted-foreground`, der Ton färbt nur Rahmen, Fläche und Icon (Kontrast unabhängig von der Brand). Icon `aria-hidden`. Fokus-Outline über `outline-ring`. Ein laufender Job kann `aria-busy` tragen.

**Do.** Titel kurz und konkret («Fertig nach 4:12 min»), Handlung in `AlertActions`. Für Jobstatus den Ton mitwechseln (info → success/danger) und neu mounten (`key={status}`), damit die Änderung angesagt wird.
**Don't.** Kein `autoHideMs` für Fehler oder Inhalte mit Handlung. Keine Brandfarben per Klasse auf den Alert legen. Nicht mehrere `role="alert"` gleichzeitig.

**RadioX-Herkunft.** `apps/frontend/components/LivePlayer/GeoBlockNotice.tsx` (statischer Hinweis), `IdleLiveNotice.tsx` (Pille, verzögerte Ansage), `SharedArrivalBanner.tsx` (Auto-Hide mit Pause, 44-px-Schliessen), `components/StationGenerationStatus.tsx` (Jobstatus mit Tönen und Rollen).

## Announcer

Datei: `packages/core/src/ui/announcer.tsx` · Exporte: `Announcer`, Typen `AnnouncerProps`, `AnnouncerPoliteness`.

**Zweck.** Unsichtbare Live-Region, die Screenreadern einen **Wechsel** meldet (WCAG 4.1.3), z. B. neuer Titel, neue Schlagzeile, Jobende.

**Props.** `message` (Text; leer bricht eine wartende Ansage ab), `announceKey` (Wechselschlüssel, Standard der Text), `politeness` (`polite` | `assertive`, Standard `polite`), `settleMs` (Entprellung, Standard 1000), `announceInitial` (Standard `false`). Weitere `div`-Props werden durchgereicht.

**A11y.** Region ist immer gemountet (`sr-only`, `aria-atomic`); jede Ansage bekommt einen neuen Kind-`key`, damit zwei gleiche Texte nacheinander gesprochen werden. Kurze Zwischenzustände gehen in der Entprellung unter.

**Do.** Nur kurze Inhalte (Titel · Artist), nie Fliesstext. Eine Region pro Thema.
**Don't.** Kein `assertive` für Routinewechsel. Keinen Ticker ansagen.

**RadioX-Herkunft.** `apps/frontend/components/LivePlayer/LiveNowAnnouncer.tsx`.

## Hooks

Datei: `packages/core/src/lib/hooks.ts`. Alle SSR-sicher (kein Zugriff auf `window`/`document` beim Server-Render).

| Hook | Signatur | Hinweis |
| --- | --- | --- |
| `useMediaQuery` | `(query, { defaultValue? }) => boolean` | `useSyncExternalStore`; Server-Wert `defaultValue` (Standard `false`) |
| `usePrefersReducedMotion` | `() => boolean` | für JS-Animationen; CSS nutzt `motion-safe:`/`motion-reduce:` |
| `useElementSize` | `(ref, { growOnly? }) => { width, height } \| null` | misst vor dem Paint, `ResizeObserver` |
| `useScrollDirection` | `({ container?, delta?, revealThreshold? }) => 'up' \| 'down'` | passiv, ein Update pro Frame, oben immer `up` |
| `useVisibilityAwareInterval` | `({ interval, onTick, enabled?, fireOnMount? }) => void` | pausiert in verborgenen Tabs, stapelt keine Promises |
| `createVisibilityPoller` | framework-frei | Zeitsteuerung für Tests |
| `useDocumentTitle` | `(title, { restoreOnUnmount? }) => void` | WCAG 2.4.2, stellt den alten Titel wieder her |

**Do.** `useMediaQuery` nur, wenn sich die DOM-Struktur ändert; sonst Tailwind-Breakpoints. Beim Ausblenden per `useScrollDirection` `motion-reduce:transition-none` setzen. `onTick` ein Promise zurückgeben lassen.
**Don't.** `useDocumentTitle` nicht mit Sekunden-Zählern füttern (kein Ticker im Tab). Kein `useMediaQuery` für Inhalte, die beim Server-Render sichtbar sein müssen.

**RadioX-Herkunft.** `apps/frontend/hooks/useMediaQuery.ts`, `usePrefersReducedMotion.ts`, `useElementWidth.ts`, `useScrollDirection.ts`, `useVisibilityAwareInterval.ts`; `components/LivePlayer/liveDocumentTitle.ts`.

## LogView

Datei: `packages/core/src/ui/log-view.tsx` · Exporte: `LogView`, `logLevelVariants`, Typen `LogViewProps`, `LogLine`, `LogLevel`, `LogViewLabels`.

**Zweck.** Monospace-Protokoll für Jobverläufe, Deploy-Logs, Systemereignisse.

**Props.** `lines: { id?, time?, source?, message, level? }[]` (`level`: `debug | info | success | warning | error`), `maxLines` (Standard 500), `follow` (Standard `true`), `live` (`off` | `polite`, Standard `off`), `formatTime` (Standard `HH:MM:SS` de-CH; nicht-ISO-Text bleibt Text), `sourceClassName(source)` (z. B. `text-chart-1`), `showLevel` (Tags für success/warning/error, Standard `true`), `labels` (log, empty, jumpToLatest, newLines(n), levels), `viewportClassName` (Höhe, Standard `h-72`).

**Verhalten.** Neueste Zeile unten; solange niemand hochscrollt, folgt die Ansicht. Hochscrollen pausiert, ein Knopf (44 px) zeigt «n neue Einträge» und springt zurück (sanft nur ohne reduzierte Bewegung). Unter `sm` stehen Zeit und Quelle über der Meldung.

**A11y.** `role="log"` mit `aria-live="off"` als Standard (ein laufendes Log würde Screenreader überfluten); `polite` bewusst opt-in. Der Scrollbereich ist fokussierbar (`tabIndex=0`) und per Tastatur scrollbar. Stufen sind als Text sichtbar (Tags mit `*-foreground`-Kontrast), nicht nur als Farbe; `debug`/`error` ohne Tag bekommen ein `sr-only`-Präfix. `<time dateTime>` für maschinenlesbare Zeit.

**Do.** Stabile `id` mitgeben (sonst zählt «neu» nur die Längendifferenz). Daten vor der Anzeige bereinigen (keine Hosts, Tokens, IPs).
**Don't.** Kein `live="polite"` bei mehr als einer Zeile pro paar Sekunden. Keine xterm-Abhängigkeit.

**RadioX-Herkunft.** `apps/frontend/components/LogConsole.tsx` (xterm, WebSocket), `components/LivePlayer/LiveTerminal.tsx` (Spalten, Follow/Pause, «↓ n neu», `role="log"`).

## Rezept: Fortschritts-Toast

Ein eigenes Toast-System wird nicht importiert; `Toaster` (sonner) deckt es ab. Für einen Job mit Fortschritt dieselbe Toast-ID aktualisieren:

```tsx
import { toast } from 'sonner'

async function exportReport() {
  const id = toast.loading('Bericht wird erstellt …', { description: 'Dauert typisch 2–5 Minuten.' })
  try {
    const url = await startExport((p) => toast.loading(`Bericht wird erstellt … ${p} %`, { id }))
    toast.success('Bericht bereit', { id, action: { label: 'Öffnen', onClick: () => window.open(url) } })
  } catch {
    toast.error('Export fehlgeschlagen', { id, description: 'Bitte erneut versuchen.', duration: Infinity })
  }
}
```

- Fortschritt höchstens alle paar Sekunden aktualisieren (sonner ist eine Live-Region).
- Fehler nicht automatisch ausblenden (`duration: Infinity`), damit die Meldung gelesen werden kann.
- Langlebige Jobs, die die Person später wieder ansieht, gehören in einen `Alert` im Seitenfluss (Jobstatus-Beispiel in der Demo), nicht in einen Toast.
