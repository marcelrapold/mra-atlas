# RadioX

Brand-Paket für RadioX (https://radiox.cloud), die KI-gestützte 24/7-Radioplattform von Marcel Rapold. Es zeigt die Atlas-Komponenten, insbesondere die aus RadioX übernommenen Medien-, Status- und Player-Bausteine, im Look von radiox.cloud. Der neutrale Core bleibt unverändert; Farben stehen in `packages/brands/src/radiox.json`, Material und Licht in `brands/radiox/theme.css`.

**Status: `draft`, Version 0.1.0.** Quelle ist der Code von `marcelrapold/radiox` (`apps/frontend/index.css`, `@theme`). Eine visuelle Abnahme der Atlas-Darstellung durch Marcel Rapold steht aus.

## Quellen

| Bereich | RadioX-Quelle | Atlas |
|---|---|---|
| Grund | `--color-surface-0` `#050505` | dark `background` |
| Text | `--color-fg` `#FFFFFF`, `--color-fg-3` `#94A3B8` | dark `foreground`, `muted-foreground` |
| Interaktion | `--color-accent` `#22D3EE` (cyan-400), Brand-Skala cyan-50 … cyan-950 | dark `primary`, `ring`; `palette.cyan` |
| Live | `--color-onair` `#EF4444` | `palette.onair`; Core-Ton `live` nutzt `destructive` |
| KI | `--color-ai` `#A78BFA` | `palette.ai` |
| Community | `--color-community` `#34D399` | dark `success` |
| News | `--color-news` `#FBBF24` | dark `warning` |
| Fehler | `--color-danger` `#FB7185` | dark `destructive` |
| Radien | `--radius-card` 16px, `--radius-pill` | `shape.radius` 16px; Buttons als Pille in `theme.css` |
| Glas | `--color-surface-1..3` (Weiss 3–10 %), `--color-line` (Weiss 10 %) | Glasflächen in `theme.css` |
| Schrift | Systemschrift (`ui-sans-serif, system-ui …`), Laufweite Versalien 0.16em | `typography.family` mit Inter als gemeinsamer Fallback; `eyebrow` mit 0.16em |

## Ableitungen

RadioX ist ein reines Dark-Theme. Atlas verlangt einen hellen Modus; er ist **abgeleitet**, nicht Teil der RadioX-Vorgabe:

- Primärfarbe `#0E7490` (cyan-700) statt cyan-400, weil Cyan-400 auf Weiss nur 1,8:1 erreicht. Mit Weiss als Schrift 5,4:1.
- Grund `#F4FBFD`, Karten Weiss, Linien `#CFE3E8`, Nebentext slate-600.
- Status in AA-tauglichen dunklen Stufen: Erfolg emerald-700, Warnung amber-800, Fehler rose-700.

Im dunklen Modus sind die Rollen `card`, `popover`, `secondary` und `muted` deckende Näherungen der RadioX-Glasflächen auf Schwarz, damit Kontrastprüfungen deterministisch bleiben. Die eigentliche Transparenz liefert `theme.css`.

## Kontrast (geprüft durch `tests/brands.test.mjs`)

| Paar | Hell | Dunkel |
|---|---|---|
| Text auf Grund | 18,3:1 | 20,4:1 |
| Nebentext auf Muted | 6,9:1 | 7,2:1 |
| Schrift auf Primär | 5,4:1 | 11,3:1 |
| Fokusring auf Grund | 5,1:1 | 11,3:1 |
| Eingabekontur auf Karte | 4,8:1 | 4,0:1 |

## Material (`theme.css`)

- Aurora-Licht hinter dem Inhalt (Cyan oben rechts, Violett unten links), nur dunkel.
- Glasflächen für Karten, Panels, Medienkarten und Player-Leiste mit 16px Unschärfe; ohne `backdrop-filter` oder bei `prefers-reduced-transparency` deckend.
- Cyan-Glow auf Primäraktionen und dem Play-Button. Der Tastaturfokus bleibt eine Outline und wird nie durch den Glow ersetzt.
- Buttons als Pille, Versalien-Labels mit 0.16em Laufweite.

## Logos und Hintergrund

Wortmarke und RX-Zeichen sind unter `assets/logos/` als Vektorpfade aus Inter (600 für «Radio», 900 für «X») nachgebaut, weil das Original Text in Systemschrift ist. Das Aurora-App-Icon und die Favicons unter `assets/icons/` sind unveränderte Kopien aus `apps/frontend/public`. Der Hintergrund der Markenseite portiert `MatrixBackground.tsx` (fallende X) und ergänzt Aurora-Licht in CSS.

Nicht übernommen: StarCraft-Effekte und produktspezifische Bedeutungen (Klang-DNA, Battles).
