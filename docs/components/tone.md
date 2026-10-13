# Tone: Tonrollen, Badge-Töne, LiveDot, Eyebrow, Inset, KI-Kennzeichnung

Import aus RadioX (Audit /live, September 2026), auf Atlas-Rollen übertragen. Keine neuen Brand-Farbrollen, keine Hexwerte; alle Töne liegen auf bestehenden, kontrastgeprüften Rollen.

## Tonrollen (`lib/tone.ts`)

**Zweck:** eine Farbe pro Bedeutung, damit dieselbe Farbe nie zwei Bedeutungen trägt.

| Tone | Atlas-Rolle | Bedeutung |
| --- | --- | --- |
| `neutral` | `muted` / `muted-foreground` | kein Akzent |
| `primary` | `primary` | Interaktion, Markenakzent, «läuft» |
| `info` | `info` | Hinweis, wartet |
| `success` | `success` | erledigt, gesund |
| `warning` | `warning` | beobachten |
| `danger` | `destructive` | Fehler |
| `live` | `destructive` | nur «jetzt live» |
| `highlight` | `accent` | ausgewählt, hervorgehoben, KI |

**API:** `TONES`, `type Tone`, `toneText`, `toneFill`, `toneBorder`, `toneTint`, `toneSolid`, `toneClasses(tone, 'soft' | 'solid' | 'outline')`, `statusTone(status)`, `statusToneClasses(status) → { tone, chip, solid, dot }` mit `StatusRole = success | info | progress | warning | error | neutral | active`.

**A11y:** Text in `soft`/`outline` nutzt die Rolle selbst (`text-success` …), `solid` nutzt `*-foreground`. Farbe nie als einziges Merkmal: immer Text daneben.

**Do:** Status über `statusToneClasses` abbilden. **Don't:** Produktbedeutungen (z. B. «News», «Klang-DNA») in Core-Töne giessen; die gehören ins Produkt bzw. Brand-Paket.

**Hinweis:** `highlight` liegt auf `accent`, nicht auf `chart-4`: Die Foundation setzt `chart-4 = destructive`, `highlight` wäre sonst von `danger` nicht zu unterscheiden. `info` ist in der Foundation standardmässig gleich `primary`.

**Herkunft:** `radiox/apps/frontend/components/ui/tone.ts`, `radiox/apps/frontend/components/ui/statusTone.ts`.

## Fokus (`lib/focus.ts`)

**Zweck:** einheitlich sichtbarer Tastaturfokus.

**API:** `focusRing` (Outline 2 px, Abstand 2 px, `ring`), `focusRingInset` (nach innen, für `overflow: hidden`), `focusRingOnMedia` (Outline `background` + innerer Rand `foreground`, für Bilder/Video).

**A11y:** Outline statt box-shadow, damit Forced-Colors-Modus und Brand-Schatten den Fokus nicht verschlucken.

**Herkunft:** `radiox/apps/frontend/components/ui/focusRing.ts`.

## Badge (Erweiterung `ui/badge.tsx`)

**Zweck:** Pillen-Label für Status, Live, Zähler. Bestehende `variant`s bleiben unverändert.

**Props (neu):** `tone?: Tone` (ersetzt die Farbe von `variant`), `appearance?: 'soft' | 'solid' | 'outline'`, `size?: 'default' | 'sm' | 'md'` (sm 20 px, md 24 px), `dot?: boolean`, `pulse?: boolean` (nur `tone="live"`), `icon?: ReactNode`, `onMedia?: boolean` (`bg-foreground/80 text-background`), `numeric?: boolean` (`tabular-nums`). `data-tone`, `data-size`, `data-appearance`, `data-on-media`.

**A11y:** `tone="live"` setzt automatisch einen dekorativen LiveDot; das Wort «Live» muss als Text stehen. Icons `aria-hidden`. Fokus (nur bei `asChild` als Link) über `focusRing`. Badges sind keine Touch-Ziele; als Link verwendet ist die 44-px-Zielgrösse nicht erfüllt, dann eine grössere Fläche verlinken.

**Do:** `numeric` für Zähler. Pro Ansicht höchstens ein `pulse`. **Don't:** `live` für Fehler verwenden, obwohl beide auf `destructive` liegen.

**Herkunft:** `radiox/apps/frontend/components/ui/Badge.tsx`.

## LiveDot / StatusDot (`ui/live-indicator.tsx`)

**Zweck:** farbiger Punkt; `LiveDot` ist der «auf Sendung»-Punkt.

**Props:** `StatusDot`: `tone?`, `size?: 'sm' | 'md'`, `pulse?`, `label?`. `LiveDot`: dieselben ohne `tone`.

**A11y:** ohne `label` `aria-hidden`; mit `label` `role="img"` und `aria-label`. Ping nur mit `motion-safe:` (bei «Bewegung reduzieren» existiert die Animation nicht).

**Do:** eine pulsierende Stelle pro Ansicht. **Don't:** Punkt ohne Textäquivalent.

**Herkunft:** `radiox/apps/frontend/components/ui/LiveDot.tsx` (Fahrmodus entfernt).

## Eyebrow (`ui/eyebrow.tsx`)

**Zweck:** Versal-Label über Titeln, Zonen und Kennzahlen.

**Props:** `as?: 'span' | 'p' | 'div' | 'h2'…'h6' | 'dt' | 'label' | 'legend'`, `tone?: Tone`. Export `eyebrowClassName` für Elemente, die kein Eyebrow sein können.

**A11y:** 12 px (RadioX: 11 px) mit `muted-foreground`, damit kleine Schrift AA hält. Für Abschnittstitel `as="h2"`/`h3` wählen, damit die Gliederung stimmt.

**Do:** kurz, ein bis drei Wörter. **Don't:** ganze Sätze in Versalien.

**Herkunft:** `radiox/apps/frontend/components/ui/Eyebrow.tsx`.

## Inset (`ui/inset.tsx`)

**Zweck:** Innenfläche, Karte in einer Karte.

**Props:** `as?: 'div' | 'section' | 'li' | 'article' | 'figure' | 'aside'`, `padding?: 'none' | 'sm' | 'md'`, `tone?: Tone`. Radius `rounded-md` (folgt `--brand-radius`, max. 8 px).

**A11y:** Ton tönt nur Rahmen und Grund, Schrift bleibt `foreground`. Semantik über `as` (z. B. `li` in Listen).

**Do:** für gruppierte Zusatzinfos innerhalb einer Card. **Don't:** Insets verschachteln oder als Klickfläche ohne Button/Link verwenden.

**Herkunft:** `radiox/apps/frontend/components/ui/Inset.tsx`.

## AiDisclosureBadge (`ui/ai-disclosure-badge.tsx`)

**Zweck:** sichtbare Kennzeichnung KI-generierter oder KI-veränderter Inhalte (Transparenzpflicht EU AI Act Art. 50, z. B. Deepfakes, synthetische Bilder, KI-Texte zu Angelegenheiten von öffentlichem Interesse).

**Props:** `label?` (Standard «KI-generiert»), `shortLabel?` («KI»), `compact?`, `onMedia?`, `size?: 'sm' | 'md'`, `tone?` (Standard `highlight`), `decorative?`.

**A11y:** Text plus Sparkles-Icon (`aria-hidden`). `compact` zeigt «KI», Screenreader hören `label`. `decorative` blendet das Badge aus, nur wenn dieselbe Angabe schon im Alt-Text bzw. Namen des Bildes steht.

**Do:** Die Anwendung entscheidet, ob ein Inhalt KI-generiert ist, und rendert das Badge dann. **Don't:** das Badge als einzige Kennzeichnung in Metadaten oder Downloads verstehen; maschinenlesbare Kennzeichnung bleibt Aufgabe der Anwendung.

**Herkunft:** `radiox/apps/frontend/components/LivePlayer/AiBadge.tsx` (Erkennungslogik `isAiCoverUrl` bleibt in RadioX).
