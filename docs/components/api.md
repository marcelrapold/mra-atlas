# API-Konvention der Core-Komponenten

Eine Regel pro Frage, damit eine Komponente ohne Nachschlagen bedienbar ist. Neue Komponenten folgen der Tabelle; ältere Abweichungen sind unten mit ihrem Übergang aufgeführt. Geprüft in `tests/core-api.test.mjs` und `tests/a11y-contract.test.mjs`.

## Konvention

| Frage | Prop | Werte | Regel |
| --- | --- | --- | --- |
| Welche Form, welches Gewicht? | `variant` | z. B. `default`, `outline`, `ghost`, `link` | Nur Gestalt und Betonung, keine Bedeutung. Spiegelt sich in `data-variant`. |
| Welche Bedeutung? | `tone` | `neutral`, `primary`, `info`, `success`, `warning`, `danger`, `live`, `highlight` | Semantische Farbe aus `lib/tone` (siehe [tone.md](tone.md)). Spiegelt sich in `data-tone`. |
| Wie gross? | `size` | `sm`, `md`, `lg` | `md` ist die Standardgrösse. Wo historisch `default` steht, ist `md` ein Alias; `data-size` bleibt dann `default`, damit Brand-Regeln weiter greifen. |
| Welches Element? | `asChild` | `boolean` | Polymorphie über `Slot.Root` aus `radix-ui`: Das einzige Kind wird mit den Klassen und Attributen der Komponente gerendert. `as` ist veraltet. |
| Wer hält den Zustand? | `value` / `defaultValue` / `onValueChange` | je Komponente, z. B. `open` / `defaultOpen` / `onOpenChange` | Kontrolliert mit `value`, unkontrolliert mit `defaultValue`. Der Rückruf meldet jede echte Änderung in beiden Modi. Umsetzung mit `useControllableState` aus `lib/hooks`. |
| Welche Sprache? | `label`, `labels`, `…Label` | deutsche Standardtexte | Jeder sichtbare und vorgelesene Text hat einen deutschen Default in Schweizer Rechtschreibung und ist einzeln überschreibbar. Keine englischen Defaults wie «Close» oder «slide». |
| Wie ansprechen? | `data-slot` | Kebab-Case, z. B. `alert-dismiss` | Jede exportierte Komponente rendert `data-slot`; Brand- und App-Regeln zielen darauf statt auf Klassen. |

## Bausteine

- **Fokus:** `focusRing`, `focusRingInset`, `focusRingOnMedia` aus `lib/focus`. Keine eigenen `focus-visible:outline-*`-Ketten, kein `outline-none` neben einem Fokusrahmen. Ergebnis: 2 px Outline in jeder einbindenden App, auch ohne globale Fokusregeln.
- **Drücken:** Flächen geben mit `motion-safe:…active:scale-[0.97]` nach (Navigationsknöpfe 0.95). Nicht bei Text-Links, nicht im Ladezustand (`aria-busy`), nicht deaktiviert. Übergänge nennen ihre Eigenschaften (`transition-[color,background-color,…,scale]`), nie `transition-all`.
- **Tokens statt Zahlen:** Ebenen über `z-(--z-index-sticky)` usw., Dauer über `duration-(--duration-normal|slow|deliberate)`, Tonflächen über `bg-(--surface-info|success|warning|danger)`.
- **Trefferfläche:** mindestens 24 × 24 px (WCAG 2.5.8), mit grobem Zeiger 44 × 44 px. Kleine Elemente erweitern sie unsichtbar über `after:` (Checkbox, Switch, Toggle, IconButton), die sichtbare Grösse bleibt.
- **Kontrast:** Grenzen von Bedienelementen liegen auf `input` oder `ring`, die für jede Brand gegen `background` und `card` auf 3:1 geprüft sind (WCAG 1.4.11).
- **Typen:** Jede Komponente exportiert ihren Props-Typ (`ButtonProps`, `CardProps`, `TabsTriggerProps` …). Funktionskomponenten nach React 19: kein `forwardRef`, kein `React.FC`, keine `defaultProps`.
- **Client-Grenze:** Dateien mit Hooks oder zustandsbehafteten Radix-Primitiven beginnen mit `'use client'`. Komponenten, die nur `Slot` verwenden (Button, Badge, Breadcrumb, Eyebrow, Inset), bleiben ohne Direktive, damit `buttonVariants` oder `eyebrowClassName` auch in Server Components aufrufbar sind.

## Übergänge

| Komponente | Bisher | Neu | Bis wann |
| --- | --- | --- | --- |
| `Alert` | `onDismiss` | `onOpenChange(false)`; `defaultOpen` für den unkontrollierten Start | `onDismiss` bleibt als veralteter Alias und feuert im selben Ablauf. |
| `Alert` | `data-variant` | `data-tone` | `data-variant` entfällt mit dem nächsten Release. |
| `Eyebrow`, `Inset` | `as="h2"` | `asChild` mit dem Element als Kind | `as` bleibt bis zum nächsten Major, als `@deprecated` markiert. |
| `Button`, `Toggle`, `Switch` | `size="default"` | `size="md"` | Beide Schlüssel bleiben; `md` ist ein Alias. |
| `Badge` | `size="default"` (Inhaltshöhe), `sm` 20 px, `md` 24 px | unverändert | `md` ist hier bereits eine eigene Stufe und kein Alias. |
| `Carousel` | `aria-roledescription` «carousel»/«slide» | `labels.roledescription` «Karussell», `labels.slideRoledescription` «Folie» | sofort, überschreibbar über `labels`. |

## Beispiel

```tsx
<Alert tone="warning" defaultOpen dismissible onOpenChange={(open) => !open && track('hinweis-geschlossen')}>
  <AlertTitle>Wartung am Sonntag</AlertTitle>
  <AlertDescription>Von 06:00 bis 08:00 ist der Export nicht verfügbar.</AlertDescription>
</Alert>

<Eyebrow asChild tone="primary">
  <h2>Nächste Schritte</h2>
</Eyebrow>

<Button size="md" asChild>
  <a href="/bericht">Bericht öffnen</a>
</Button>
```
