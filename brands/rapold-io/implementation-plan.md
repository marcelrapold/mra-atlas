# rapold.io – Umsetzungsplan in Atlas

Stand: 14.10.2026. Grundlagen: [`DESIGN-DNA.md`](DESIGN-DNA.md) und [`dna.json`](dna.json). Grössen: S (unter 2 h), M (ein halber bis ein Tag), L (mehr als ein Tag).

## Grundsatzentscheid: Brand `rapold` weiterentwickeln, keine neue Brand `rapold-io`

**Empfehlung:** Die bestehende Atlas-Brand `rapold` bekommt die Dachmarke als fehlendes Elternzeichen. Eine zweite Brand `rapold-io` wird nicht angelegt. `brands/rapold-io/` bleibt bis zur Freigabe ein Vorschlagsordner.

Begründung:

1. **Eine Tokenquelle.** Palette, Modi, Schrift und Signets der Dachmarke sind identisch mit `packages/brands/src/rapold.json`. Neu sind nur Firstglut, die Licht-Rezepte und die Deck-Platten. Eine zweite Brand würde rund 95 % der Werte doppelt führen und auseinanderdriften lassen.
2. **Die Lücke liegt in `rapold`.** `provenance.json` meldet `umbrellaSymbol: "none"`, und `presentation.logoOnCover` steht auf `false`. Genau dort fehlt die Dachmarke.
3. **Produkte bleiben stabil.** Die zehn Produkte und ihre Repos verweisen auf `rapold`. Eine neue Brand würde die Frage aufwerfen, welches Theme für Produkt-Decks gilt.
4. **Der Theme-Umschalter bleibt eindeutig.** Es gibt keine zwei fast gleichen Blau-Themes.

Einwand: Die Freigabe von `rapold` 1.0.0 soll nicht berührt werden. Lösung: Die Dachmarke kommt als eigener Block `umbrella` mit `status: "proposal"` in `identity.json`. Erst die Freigabe setzt ihn auf `approved` und hebt die Version auf 1.1.0. Bis dahin rendert die Referenz-App den Block mit einem Vorschlags-Badge.

## Schritte

| # | Schritt | Dateien | Grösse |
|---|---|---|---|
| 0 | **Freigabe einholen.** Zeichen, Firstglut, Claim und Grafts mit Marcel klären (offene Fragen unten). Ohne Freigabe nur Schritte 1–3 und 7 hinter dem Status `proposal`. | – | S |
| 1 | **Assets übernehmen.** Die acht Master aus `brands/rapold-io/assets/logos/` nach `brands/rapold/assets/logos/umbrella/` kopieren. `current-color.svg` ableiten (fill `currentColor`, Mono-Geometrie mit First-Fuge). Favicon-Satz 16/32/48/64/96 und App-Icon (Navy-Kachel rx 56, Bloom `#0A2A55`, Ice-Haarlinie 14 %) mit `scripts/build-icons.mjs` erzeugen. Den Generator `build.py` und die Konstruktionsparameter als `scripts/build-umbrella.mjs` portieren, damit die Geometrie wie `build-signet-proposals.mjs` reproduzierbar im Repo liegt. | `brands/rapold/assets/logos/umbrella/*`, `scripts/build-umbrella.mjs`, `scripts/build-icons.mjs` | M |
| 2 | **Identität und Herkunft.** `identity.json`: Block `umbrella` mit id `first`, Name «Der First», Varianten-Pfaden, Status, Mindestgrössen, `firstLightMinPx: 400`. `provenance.json`: `umbrellaSymbol` von `"none"` auf `{ "id": "first", "status": "proposal", "source": "brands/rapold-io" }`; bei Freigabe Datum und Belegtext wie bei den Signets. | `brands/rapold/identity.json`, `brands/rapold/sources/provenance.json` | S |
| 3 | **Tokens.** `packages/brands/src/rapold.json`: `palette.firstglut #FFA36C`, `palette.firstglut-light #B4511A`, `palette.abyss #02060F`, `palette.firstglut-core #FFE2CC`. `palette.violet` mit dem Vermerk «nicht Dachmarke» belassen, weil die Produktwelten es nutzen. `presentation.logoOnCover: true`. Kein neuer semantischer UI-Modus-Schlüssel: Firstglut ist eine Marken-, keine UI-Rolle. Kontrastpaare in `tests/brands.test.mjs` ergänzen. | `packages/brands/src/rapold.json`, `packages/brands/src/brand.schema.json` (falls `palette` geschlossen ist) | S |
| 4 | **theme.css.** Neue Utilities nur im Brand-Scope `[data-brand="rapold"]`: `--rp-floor`, `--rp-bloom-*`, `--rp-warm-apex`, `--rp-grid` (Iso-SVG als Data-URI), `--rp-grain`. Klasse `.rp-stage` (Boden, Bloom, Raster, Körnung), `.rp-glass-card` (Panel 70 %, Blur 24, 1 px Weiss 10 %), `.rp-point` (Rautenpunkt per `::after`, `clip-path: polygon(50% 0,100% 50%,50% 100%,0 50%)`), Keyframes `rp-fold`, `rp-ignite`, `rp-breathe` mit `prefers-reduced-motion`-Fallback. Die vorhandenen Animationen in `worlds.css` an die gemeinsamen Token-Komponenten anbinden statt sie zu kopieren. | `brands/rapold/theme.css`, `brands/rapold/worlds.css` | M |
| 5 | **Brand-Seite und Showcase.** In `brand-showcase.tsx` eine Sektion «Dachmarke» vor den Signets: Hero-Stage mit dem Glas-First als inline SVG (Ebenen-Verläufe, Kante, Firstlicht-Filter mit `filterUnits="userSpaceOnUse"`), Reveal-Animation, Lockups dunkel und hell, Mono-Varianten, Grössenleiste 16–96 px, Architektur-Board (First über den zehn Signets, Endorsement-Zeile, RadioX als eigenständige Marke), Do und Don't. Vorschlags-Badge bis zur Freigabe. | `apps/docs/app/_components/brand-showcase.tsx`, neu `rapold-umbrella.tsx` | L |
| 6 | **Deck-Platten und Master.** Generator für `cover-dark.png`, `section-dark.png`, `content-light.png`, `content-dark.png` und `closing-dark.png` (3200 × 1800, sharp) aus den Rezepten in `dna.json` → `deck.backdrops`. Die Muster `brands/rapold-io/sources/deck.py` dienen als Referenz. In `scripts/build-decks.mjs` und `presentation.mjs` für `rapold` Folgendes anbinden: Platten je Surface, PPTX-Theme (`dna.json` → `deck.pptxTheme`, ersetzt die Office-Palette), Theme-Schriften Geist und Geist Mono, eingebettete statische Geist-TTF (Regular, Medium, SemiBold; Mono Regular, Medium; aus dem offiziellen Geist-Release, OFL mitliefern), Lockup-Platzierungen (`deck.logo`), Rautenpunkt als Freiform-Raute am Titelende, Familienleiste auf Cover und Schluss, Balken mit Facettenschnitt in `chart-labels.mjs` oder dem Chart-Renderer. | `scripts/build-decks.mjs`, `packages/brands/src/presentation.mjs`, `packages/brands/src/deck-presets.json`, `brands/rapold/assets/deck/*` | L |
| 7 | **Dokumentation.** `brands/rapold/DESIGN.md` um das Kapitel Dachmarke ergänzen (Kurzfassung mit Verweis auf DESIGN-DNA), README-Tabelle, `docs/repo-to-management.md` mit dem Hinweis auf Cover mit Logo. CHANGELOG-Eintrag (Version 0.10.0). | `brands/rapold/DESIGN.md`, `README.md`, `CHANGELOG.md` | S |
| 8 | **Tests.** `tests/brand-assets.test.mjs`: acht Umbrella-Master vorhanden, keine `<text>`, viewBox 256 beim Zeichen, nur erlaubte Farben pro Variante, kein Firstglut in Logo-Dateien, Tintenbox innerhalb 24–232. `tests/brands.test.mjs`: Kontraste aus `dna.json` → `contrast` (Firstglut/Navy ≥ 4,5, Firstglut Light/Paper ≥ 4,5, Light Facet nie als Text). `tests/deck-contract.test.mjs`: Cover mit Logo, ein Rautenpunkt pro Folie, Metadaten ≥ 8,4 pt, Theme-Akzente ohne `4472C4`. `tests/rapold.test.mjs`: `umbrellaSymbol` ist entweder `none` oder ein Objekt mit Status. Danach `npm run check`. | `tests/*.test.mjs` | M |
| 9 | **Visuelle Abnahme.** Referenz-App unter 1440 × 900 und 390 × 844 mit Playwright prüfen (Brand-Seite rapold, dunkel und hell, reduced-motion). Exportiertes PPTX in PowerPoint und Keynote öffnen: Schrifteinbettung, Platten, Morph, Rautenpunkt. Favicon im Browser-Tab bei 16 px prüfen. | – | M |
| 10 | **Ausrollen (separat, nach Freigabe).** rapold.io-Website: Fraunces, Inter Tight und JetBrains Mono entfernen, den ▮ durch den Lockup ersetzen, Bühne und Tokens aus `@rapold/framework-brands`. Produkt-Repos erhalten nur die Endorsement-Zeile. RadioX bleibt unverändert. | andere Repos | L |

Reihenfolge: 0 → 1 → 2 → 3 → 8 (rot) → 4 → 5 → 6 → 8 (grün) → 7 → 9 → 10.

## Risiken

- **Firstlicht-Filter:** Auf vertikalen Linien ist die Bounding-Box 0 breit. Deshalb immer `filterUnits="userSpaceOnUse"` setzen. Im Muster ist das so umgesetzt.
- **PowerPoint und Variable Fonts:** Variable WOFF2 lässt sich nicht einbetten. Ohne statische TTF fällt PowerPoint auf Calibri zurück. Ein Test sollte das Einbetten im Export prüfen.
- **Glas in PPTX:** backdrop-blur gibt es nicht. Glas und Licht kommen deshalb nur aus den Platten, Karten sind halbtransparente Flächen.
- **Favicon 16 px:** Das ungehintete Zeichen ist lesbar, aber leicht weich. Eine gehintete 16-px-Fassung ist ein eigener Schritt (S).
