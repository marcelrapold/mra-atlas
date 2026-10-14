# RadioX

Brand-Paket für RadioX (https://radiox.cloud), das KI-Radio mit News und Musik von Marcel Rapold. Es zeigt die Atlas-Komponenten, insbesondere die aus RadioX übernommenen Medien-, Status- und Player-Bausteine, im Look von radiox.cloud. Der neutrale Core bleibt unverändert: Farben, Tokens und der Deck-Vertrag stehen in `packages/brands/src/radiox.json`, Material, Glas und Licht in `brands/radiox/theme.css`.

**Status: `draft`, Version 0.2.0.** Kanonische Grundlage ist die Design-DNA: [`DESIGN-DNA.md`](./DESIGN-DNA.md) (Begründung, Belege, Entscheide E1–E39) und [`dna.json`](./dna.json) (maschinenlesbar). Quelle der DNA ist der Code von `marcelrapold/radiox` (`apps/frontend/index.css`, `@theme`) und die gerenderte Produktion. Die visuelle Abnahme durch Marcel Rapold steht aus.

## Abbildung der DNA auf den Brand-Vertrag

| DNA | Wert | Atlas |
|---|---|---|
| surface-0 | `#050505` | dark `background`, Deckflächen, `palette.black` |
| Weiss 3 % auf #050505 | `#0C0C0C` | dark `card`, `muted` (deckende Näherung) |
| Weiss 6 % auf #050505 | `#141414` | dark `accent` |
| Weiss 10 % auf #050505 | `#1E1E1E` | dark `secondary`, `border` |
| Fenster-Basis | `#10161E` | dark `popover`, `palette.window` |
| fg / fg-2 / fg-3 / fg-4 | `#FFFFFF` / `#CBD5E1` / `#94A3B8` / `#64748B` | `foreground`, `palette.fg-2`, `muted-foreground`, `input` |
| primary-fill | `#06B6D4` | dark `primary` (Füllung, schwarze Schrift), `palette.cyan-fill` |
| primary-fill-hover / accent | `#22D3EE` | dark `primary-hover`, `ring`, `palette.cyan`; Deck-Akzent und Primärserie |
| primary-fill-active | `#0891B2` | `palette.cyan-fill-active` (Brand-CSS) |
| accent-strong / accent-soft | `#67E8F9` / `#A5F3FC` | `palette.cyan-strong`, `palette.cyan-soft`, dark `accent-foreground` |
| onair (nur Live) | `#EF4444` | `palette.onair`; Brand-CSS setzt den Core-Ton `live` lokal auf Rot |
| danger (Fehler) | `#FB7185` | dark `destructive`, `palette.danger`, Deck-`signal` |
| community | `#34D399` | dark `success`, Deckserie 3 |
| news | `#FBBF24` | dark `warning`, Deckserie 4 |
| ai / dna | `#A78BFA` / `#F472B6` | Paletten-Schlüssel, Deckserien 2 und 5 |

Die opaken Werte sind die rechnerische Komposition der RadioX-Schleier über `#050505` (5 + a · 250 je Kanal) und dienen Kontrastprüfungen und Exporten. Im Browser setzt `theme.css` die durchscheinenden Originale. Teal- oder Grau-Tönungen gibt es nicht.

**Rollen, die Atlas zusammenlegt.** Der Core kennt eine Primärfarbe. RadioX trennt Linie (`#22D3EE`: Fokus, Links, Tab-Linie, Eyebrows, Diagramme) und Füllung (`#06B6D4`: gefüllte Buttons). `primary` trägt deshalb die Füllung, `ring` und `chart-1` die Linie. Die Atlas-Rollen `success` und `warning` nutzen Smaragd und Amber, weil RadioX keine eigenen Statusfarben hat; im Produkt bedeuten diese Farben Hörer und News.

**Live ist nicht Fehler.** Der Core-Ton `live` liest `destructive`. Für RadioX sind das zwei Farben: `destructive` ist Rose (Fehler), Live ist Rot. `theme.css` setzt `--destructive` auf Elementen mit `data-tone="live"` lokal auf `#EF4444` und zeigt Live-Badges als Scrim mit rotem Rand und Punkt, nie als rote Fläche (E2, E32).

## Abgeleitet, keine RadioX-Vorgabe

RadioX hat kein Light-Theme (DNA 1, `dna.json` `theme.lightMode`). Atlas verlangt `modes.light`; er ist **von Atlas abgeleitet** und darf RadioX nie repräsentieren, auch nicht im Deck (`deck.mode` ist `dark`):

- Primärfarbe `#0E7490` (cyan-700), weil Cyan-400 auf Weiss nur 1,8:1 erreicht.
- Grund `#F4FBFD`, Karten Weiss, Linien `#CFE3E8`, Nebentext slate-600.
- Status in AA-tauglichen dunklen Stufen: Erfolg emerald-700, Warnung amber-800, Fehler rose-700.
- Die hellen Logo-Varianten (`wordmark-light.svg`, `icon-light.svg`, `deck/wordmark-on-light.png`) haben ein flaches cyan-700-X.

## Tokens (`tokens`)

Nur Schlüssel, die die Foundation führt: `duration.normal` 250 ms, `duration.slow` 600 ms, `easing.standard` `cubic-bezier(0.22, 1, 0.36, 1)`, `zIndex.modal` 60, `toast` 70, `tooltip` 80, `layout.header` 56 px, `icon.stroke` 2. Morph, Szene, `ease.ios` und die Radius-Skala 4/6/8/12/16/28 stehen als `--rx-*`-Variablen in `theme.css`. Schrift: Systemstack ohne Webfont, Überschriften 700, nie 800.

## Material (`theme.css`)

- Karten Schwarz 25 %, Haarlinie Weiss 10 %, 16 px, **ohne Blur und Schatten**. Inset Weiss 6 %, 12 px.
- Glas nur für Chrome: `.rx-glass-header` (Schwarz 50 %, blur 24), `.rx-glass-bar` und Media-Bar (Schwarz 85 %, blur 24), `.rx-glass-chip` (Schwarz 60 %, blur 12), Play-Orb `.rx-glass-play` bzw. `PlayButton` mit `material="glass"` (blur 14 + saturate 170 %, Glanzkappe, Hover/Active), `.rx-window` (Fenster mit den Fensterlichtern `#58DDD3`/`#BC9CFA`).
- Bei `prefers-reduced-transparency` oder `[data-flat]` fällt jeder Blur weg; Bars `#050505`, Glas `rgba(10,14,22,.8)`, Fenster `#10161E`.
- Glow nur Cyan, vier Stufen (rest, interactive, hover, line). Primär-Buttons interactive → hover. Fokus bleibt immer eine Outline (2 px `#22D3EE`, auf Glow-Elementen 3 px Abstand, in Fenstern `#67E8F9`).
- Buttons 8 px (gross 12 px), Pillen nur für Badges und Chips. Danger-Button in Rose.
- Eyebrows 11 px, 600, Versalien, 0.16em. Auswahl `rgba(34,211,238,.35)` mit weisser Schrift.
- Aurora `.rx-aurora` (drei Blobs: Cyan, Violett, Cyan, `screen`, blur 120/120/140, 25/30/15 s) und Desktop-Wash `.rx-backdrop-wash`. Bei `prefers-reduced-motion` stehen alle Loops; Animationen werden zu einem 160-ms-Opazitäts-Fade (E39).

## Präsentation (`deck`)

`deck.mode` ist `dark`, jede Folie steht auf `#050505`. Die Hintergründe sind Standbilder der DNA (5.3), erzeugt von `scripts/brand-radiox-deck-src.mjs` nach `assets/deck-src/` und gerastert mit `scripts/build-deck-assets.mjs`:

| Rolle | Hintergrund | Logo |
|---|---|---|
| Cover | `aurora-cover.png`: Cyan oben links, Violett unten rechts, Mitte Cyan schwach, Fade nach Schwarz | Wortmarke oben links, 0.74 cm |
| Kapitel | `matrix-edges-aurora.png`: Aurora etwas kräftiger, X-Regen am rechten Rand (8 %) und schmal links ausserhalb des Textrands | oben links, 0.48 cm |
| Inhalt | `wash-content.png`: Desktop-Wash, Footer-Band Schwarz 85 % unter der Fusslinie | oben rechts, 0.48 cm |
| Abschluss | `aurora-cover.png` | unten zentriert, 1.06 cm |

Materialien: `panel` = RadioX-Karte, `panelRaised` = Inset, `window` = Fenster-Material für ein Heldenpanel. Glow Cyan 0.35 / 12 pt. Akzente nach Bedeutung: Primär Cyan, Signal Rose (Fehler; Rot bleibt Live), Serien Cyan, KI-Violett, Smaragd, Amber, Pink, Vorperiode Slate. Schrift Segoe UI wie radiox.cloud unter Windows (Segoe UI Black für Display, Segoe UI Semibold für Labels; auf jedem Windows-Office vorhanden), Versalien 0.16em, Display-Faktor 1.6. Die Linux-Referenzbilder ersetzen Segoe per Fontconfig-Alias durch die metrisch nahe Inter (`scripts/prepare-render-fonts.py`); ohne Segoe (z. B. macOS) setzt PowerPoint eine Systemschrift ein. Wortmarke als PNG ohne Platte.

**Abweichungen von der DNA im Deck:** Die Cover-Aurora läuft mit 80 % der DNA-Deckkraft (0.36 statt 0.45), damit das Cyan-Eyebrow auf dem Cyan-Feld und der Untertitel (`#94A3B8`) auf dem Violett-Feld 4.5:1 halten (geprüft in `tests/radiox-dna.test.mjs`). Der X-Regen steht links nur im Streifen ausserhalb des Textrands (0.93 cm), weil Titel, Kapitelnummer und Logo dort beginnen; die DNA verlangt «nie hinter Text». Die Regendichte des Standbilds ist höher als ein Einzelbild des Canvas, damit die Textur lesbar wird.

## Logos und Hintergrund

Wortmarke und RX-Zeichen unter `assets/logos/` sind Vektorpfade aus Inter (600 für «Radio», 900 für «X»), weil das Original Text in Systemschrift ist. Auf Dunkel trägt das X den Aurora-Verlauf (145°, `#A5F3FC` 12 % → `#22D3EE` 45 % → `#A78BFA` 80 %), die Wortmarke zusätzlich einen leisen Cyan-Glow. Mono-Varianten bleiben flach. Das Aurora-App-Icon und die Favicons unter `assets/icons/` sind unveränderte Kopien aus `apps/frontend/public`. Der Hintergrund der Markenseite portiert `MatrixBackground.tsx` (fallende X) über der Marken-Aurora.

Nicht übernommen: StarCraft-Effekte, Produktlogik (Admin-Purple, Staging-X, Cover-Paletten-Heuristik).
