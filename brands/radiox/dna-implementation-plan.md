# RadioX-DNA – Umsetzungsplan für Atlas

Stand: 14.10.2026 · Branch `feat/radiox-dna` · Grundlage: [`DESIGN-DNA.md`](./DESIGN-DNA.md), [`dna.json`](./dna.json)

Aufwand: **S** ≤ ½ Tag · **M** ½–2 Tage · **L** > 2 Tage. Die Reihenfolge ist die empfohlene Umsetzungsreihenfolge. Ziel: `/praesentation?brand=radiox` und die PPTX-Referenzen sehen aus wie radiox.cloud – schwarz, Aurora, Glas-Chrome, Aurora-X-Wortmarke, Systemschrift.

---

## (a) Token-Änderungen in `packages/brands/src/radiox.json`

| # | Änderung | Aufwand |
|---|---|---|
| a1 | `typography.family` → `-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, Inter, sans-serif` (System zuerst, Inter spät). | S |
| a2 | `typography.headingWeight` 800 → **700**. Neue Felder (Schema b/d): `displayWeight: 900`, `monoFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"`, `trackingCaps: "0.16em"`, `trackingDisplay: "-0.025em"`. | S |
| a3 | `modes.dark` neutralisieren (opake Teal-Grau-Näherungen raus, Komposition über #050505 rein): `primary #22D3EE` und `primary-hover #67E8F9` bleiben (Linien-/Fokus-Rolle; Fill-Rolle siehe a4), `card #0C0C0C` (white .03), `popover #10161E` (Fenster-Flachwert), `secondary #151515` (white .06), `muted #0C0C0C`, `accent #151515` (white .06, `accent-foreground #A5F3FC`), `border #1E1E1E` (white .10). Diese opaken Werte sind nur Fallback; das Brand-CSS (b) setzt die rgba-Originale. | M |
| a4 | Neue Palette-Keys: `cyan-fill #06B6D4`, `cyan-fill-active #0891B2`, `cyan-soft #A5F3FC`, `cyan-strong #67E8F9`, `fg-2 #CBD5E1`, `fg-4 #64748B`, `window #10161E`, `window-light-a #58DDD3`, `window-light-b #BC9CFA`. (`slate #94A3B8` = fg-3 existiert.) | S |
| a5 | `modes.light` als **abgeleitet** markieren (README + `derived: ["modes.light"]` falls Schema erweitert) und nie als RadioX-Referenz rendern. Nicht löschen (Contract verlangt light). | S |
| a6 | `shape.radius` 16px bleibt; `tokens`-Overrides nur auf Keys, die `foundation.json` tatsächlich führt (geprüft 14.10.2026): `duration.fast` 150ms (= Foundation), `duration.normal` 200ms → **250ms**, `duration.slow` 300ms → **600ms**, `easing.standard` `cubic-bezier(0.2,0,0,1)` → **`cubic-bezier(0.22,1,0.36,1)`**, `zIndex.overlay` 40 (= Foundation), `zIndex.modal` 50 → **60**, `zIndex.toast` 60 → **70**, `zIndex.tooltip` 70 → **80** (muss über Toast bleiben), `layout.header` 48px → **56px** (64 px ab lg ist kein Foundation-Key → Brand-CSS), `icon.stroke` 1.5 → **2**. Keine Keys `duration.base`, `morph`, `scene`, `ease.ios` in der Foundation → diese nur als Brand-CSS-Variablen (b2). | S |
| a7 | `presentation.logoOnCover` false → **true**. `editorialDarkSurfaces` entfernen, sobald `deck.mode` existiert (d). | S |
| a8 | Neue Keys `assets.logo` (PNG, siehe e) und `deck` (siehe d). `version` 0.1.0 → 0.2.0. | S |

## (b) Ergänzungen in `brands/radiox/theme.css`

| # | Änderung | Aufwand |
|---|---|---|
| b1 | **Entfernen:** globale Karten-Glas-Regel (`--radiox-glass-blur: 16px`, white .03 + Blur auf card/media-card/demo-panel), `.rx-aurora` mit purple-500/blue-500 und 16-s-Drift, Seiten-Radials bei 85 %/−10 %, Pill-Zwang auf `[data-slot=button]`, Glow `0 0 24px -6px .55`, `.rx-hero` Radius 24 und `h2`/`.rx-type-display` 800/−0.04em. | S |
| b2 | **Variablen** (alle aus dna.json): `--rx-surface-0..3`, `--rx-surface-card rgba(0,0,0,.25)`, `--rx-line`, `--rx-line-strong`, `--rx-scrim`, `--rx-fg-2..4`, Signalfarben, `--rx-glow-rest/interactive/hover/line/orb`, `--rx-ease-out`, `--rx-ease-ios`, `--rx-dur-fast/base/slow/morph/scene`, `--rx-radius-thumb/chip/button/inset/card/window`, `--rx-tracking-caps/display/poster`, `--rx-font-mono`. | S |
| b3 | **Karten:** `[data-slot=card]` → `background: rgba(0,0,0,.25); border:1px solid rgba(255,255,255,.10); border-radius:16px; backdrop-filter:none; box-shadow:none`. | S |
| b4 | **Glas-Klassen:** `.rx-glass-header`, `.rx-glass-bar`, `.rx-glass-chip`, `.rx-glass-play` (vollständiges Orb-Rezept inkl. Hover/Active/Fokus/Flat-Fallback), `.rx-window` (Fenster-Material mit `--rx-window-light`/`-2`). Fallbacks unter `@media (prefers-reduced-transparency: reduce)` und `[data-flat]`. | M |
| b5 | **Buttons:** Primär `#06B6D4` / hover `#22D3EE` / active `#0891B2`, Text `#000` 600, Glow interactive → hover, Radius 8 (lg 12), Höhen 32/40/48. Sekundär, Ghost, Outline nach dna.json. Destructive in **Rose `#FB7185`** (nicht Rot, E32). | S |
| b6 | **Badge/Eyebrow:** 11px/600/Caps/0.16em; Badge Scrim `.70` + Ton-Rand 50 %; `onMedia` → Scrim statt `bg-foreground/80`. | S |
| b7 | **Backdrops:** `.rx-backdrop-wash` (Desktop-Wash, statisch), `.rx-backdrop-aurora` (3 Blobs, screen, 120/120/140 px, .5/.5/.15, 25/30r/15 s, Live-Fade), Reduced Motion friert ein. Matrix bleibt Komponente (c). | M |
| b8 | **Logo:** `.rx-x-aurora` (145deg-Verlauf, Fallback `#67E8F9`, Drop-Shadow), `.rx-x-glitch` (7-s-Keyframes, aus bei Reduced Motion). | S |
| b9 | **Nav-Tab-Variante:** `[data-variant=nav]` 12px/700/Caps/0.16em, aktiv `#A5F3FC` auf Cyan 6 % + 2-px-Indikator mit Glow line. | S |
| b10 | Motion: Keyframes `rx-mini-bar-enter`, `rx-modal-arrive`, `rx-cover-sheen`; globale Reduced-Motion-Regel ersetzt Animationen durch 160-ms-Fade. Achtung: RadioX selbst setzt global `0.01ms` (index.css:834–841); der 160-ms-Fade ist ein bewusster Atlas-Entscheid (E39, Frage g11). | S |

## (c) Core-Komponenten-Lücken (markenneutral)

Nur Fähigkeiten, die jede Marke nutzen kann; RadioX-Werte kommen über Tokens/Brand-CSS.

| # | Lücke | Aufwand |
|---|---|---|
| c1 | **Panel** (`Card`-Variante oder neue Komponente): fester Kopf (Höhe-Token), Ton-Punkt-Slot, Titel, Aktions-Slot mit 44-px-Hit-Area, Body mit Clip-Maske, optional Maximize-to-Dialog. | M |
| c2 | **Tone-Rollen** erweitern: `ai`, `community`, `news`, `dna`, `onair` (zusätzlich zu success/warning/danger/live). Brands mappen auf Palette; `live` darf ≠ `destructive` sein. `AiDisclosureBadge` Standardton → `ai`. | M |
| c3 | **Badge** Grössen sm/md (20/24) mit Caps-Option und Scrim-Variante `onMedia`; Lead-Dot/Icon-Slot. | S |
| c4 | **Tabs** Variante `nav` (Caps, Icon, Indikator-Linie in Primärfarbe mit optionalem Glow-Token). | S |
| c5 | **PlayButton/MediaBar/BottomNav**: Material-Tokens statt fixer `background/80 + blur-md` (Blur, Füllung, Schatten aus Brand-Variablen). | M |
| c6 | **StatPill**, **TickerStrip**, **Terminal**-Strip als generische Daten-Chips (Mono-Werte, Teiler). | M |
| c7 | **Radar-Chart-Preset** (Ringe, Achsen, Primär-/Vergleichs-Polygon, gestrichelte Vergleichsserie). | M |
| c8 | **Backdrop-Komponenten:** `MatrixBackdrop` (Port von `apps/docs/app/_components/radiox-matrix.tsx` mit Tier-Konzept 0/24/30/45/60 fps, `edgesOnly`-Maske, Still-Frame bei Reduced Motion, Pause bei Unsichtbarkeit) und `AuroraBackdrop` (3 Blobs, Farben per Prop/Token). Markenneutral, Glyphe und Farben konfigurierbar. | M |
| c9 | **Inset** Radius über Token (`--radius-inset`) statt `min(radius, 8px)`; Radius-Skala um `chip 6` und `window 28` erweitern. | S |
| c10 | **Fokus**: Offset-Token und Fenster-Fokusfarbe. | S |
| c11 | **Fallback-Cover** (generierte Kachel mit Paar-Liste, Wasserzeichen, Initialen) als MediaCard-Placeholder. | S |
| c12 | `/praesentation`-Seite: Backdrop je Slide-Rolle (Aurora für Cover/Kapitel/Abschluss, Matrix-Ränder für Statement, Wash für Inhalt), Print-Stylesheet tauscht Canvas gegen PNG-Standbilder. | M |

## (d) Brand-Contract + Deck-Renderer

### d1 Neuer optionaler Top-Level-Key `deck` (Render-Vertrag) – **M**

`presentation` bleibt Agenten-Leitplanke, `deck` ist renderrelevant. Validierung in `packages/brands/src/index.mjs` (`optionalBrandKeys` + Validator), `brand.schema.json`, `index.d.ts`. Bildpfade nur png/jpg, relativ, ohne `..`; Accents sind Palette-Keys (Existenz geprüft) oder Hex.

```json
"deck": {
  "mode": "dark",
  "surfaces": {
    "cover":     { "fill": "#050505", "backdrop": "brands/radiox/assets/deck/aurora-cover.png", "logo": "cover" },
    "section":   { "fill": "#050505", "backdrop": "brands/radiox/assets/deck/matrix-edges-aurora.png", "logo": "small" },
    "content":   { "fill": "#050505", "backdrop": "brands/radiox/assets/deck/wash-content.png", "logo": "small" },
    "statement": { "fill": "#050505", "backdrop": "brands/radiox/assets/deck/matrix-edges.png", "logo": "small" },
    "closing":   { "fill": "#050505", "backdrop": "brands/radiox/assets/deck/aurora-cover.png", "logo": "closing" }
  },
  "bands": {
    "header": { "fill": "#000000", "fillOpacity": 0.5, "heightPx": 56, "rule": { "color": "#FFFFFF", "opacity": 0.10, "pt": 0.75, "edge": "bottom" } },
    "footer": { "fill": "#000000", "fillOpacity": 0.85, "heightPx": 56, "rule": { "color": "#FFFFFF", "opacity": 0.10, "pt": 0.75, "edge": "top" } }
  },
  "materials": {
    "panel":       { "fill": "#000000", "fillOpacity": 0.25, "border": "#FFFFFF", "borderOpacity": 0.10, "borderPt": 0.75, "radiusCm": 0.423 },
    "panelFlat":   { "fill": "#FFFFFF", "fillOpacity": 0.03, "border": "#FFFFFF", "borderOpacity": 0.10, "borderPt": 0.75, "radiusCm": 0.423 },
    "inset":       { "fill": "#FFFFFF", "fillOpacity": 0.06, "border": "#FFFFFF", "borderOpacity": 0.10, "borderPt": 0.75, "radiusCm": 0.317 },
    "window":      { "fill": "#0F151D", "fillOpacity": 0.88, "border": "#E2F1FF", "borderOpacity": 0.18, "borderPt": 0.75, "radiusCm": 0.741, "topHighlight": { "color": "#FFFFFF", "opacity": 0.12 } },
    "scrim":       { "fill": "#000000", "fillOpacity": 0.70 }
  },
  "glow": { "color": "#22D3EE", "opacity": 0.35, "blurPt": 12 },
  "accents": { "primary": "cyan", "primaryFill": "cyan-fill", "onPrimary": "#000000", "signal": "onair", "chart": ["cyan", "ai", "community", "news", "dna"], "chartPrevious": "slate", "zone": { "now": "cyan", "ai": "ai", "community": "community", "news": "news", "dna": "dna", "neutral": "slate" } },
  "text": { "primary": "#FFFFFF", "secondary": "#CBD5E1", "muted": "#94A3B8" },
  "type": {
    "faces": { "regular": "Segoe UI", "semibold": "Segoe UI Semibold", "bold": "Segoe UI", "black": "Segoe UI Black", "mono": "Consolas" },
    "capsTrackingEm": 0.16,
    "displayTrackingEm": -0.025,
    "titleLineSpacing": 0.92
  },
  "logo": { "onDark": "brands/radiox/assets/deck/wordmark-on-dark.png", "onLight": "brands/radiox/assets/deck/wordmark-light.png", "aspectRatio": 3.594, "anchor": "top-left", "heightPx": { "cover": 28, "small": 18, "closing": 40 }, "plate": false },
  "grid": { "marginPx": 32, "gapPx": 16, "contentTopPx": 116, "contentBottomPx": 648, "cardHeadPx": 44 },
  "transitions": { "default": { "type": "fade", "s": 0.25 }, "section": { "type": "fade", "s": 0.6 } }
}
```

### d2 `presentationTheme()` (`packages/brands/src/presentation.mjs`) – **M**
- `const c = brand.modes[brand.deck?.mode ?? 'light']` statt fix `modes.light`.
- Theme exportiert `surfaces`, `bands`, `materials`, `glow`, `accents` (aus Palette aufgelöst), `text`, `type.faces`, `logo`, `grid`. `chart-2…` aus `accents.chart`, `signal` aus `accents.signal`.
- Brands ohne `deck` erzeugen **bytegleichen** Output (Regressionstest).

### d3 Szenen (`slide-scene.mjs`, `atlas-slide-content.mjs`, `project-scene.mjs`) – **L**
- Opakes Basis-Rect ersetzen durch `scene.background = { fill, backdrop }` nach Layout-Rolle (cover-foto/foto-schluss → cover bzw. closing, kapitel-trenner → section, Zitat → statement, sonst content).
- Bei deklariertem Backdrop: Cover/Section volle Höhe (kein 17.524-cm-Block, kein weisses Band), kein Primär-Rect.
- Header-/Footer-Bänder aus `deck.bands` statt 2.25-pt-Primär-Fusslinie; Logo top-left statt top-right, wenn `logo.anchor` gesetzt.
- Rect-Nodes erhalten optional `opacity`, `stroke`, `strokeOpacity`, `strokePt`, `radius`, `glow`; `card()` und KPI-Tiles nutzen `materials.panel`/`inset`; Kartenkopf mit Ton-Punkt.
- Text-Nodes erhalten `face` (Rollen → Schnittname), `caps`, `trackingEm`, `lineSpacing`.
- `project-scene.mjs` an `slide-scene.mjs` angleichen (Brand-Node-Farbe, Cover-Band → Glas-Panel `#050505` 50 % statt Primär-Band).
- Platzhaltertexte («Projektübersicht», «Illustrative Beispieldaten») für RadioX durch brand-eigene Beispielinhalte ersetzen, sobald `voice`/`sampleContent` existiert (siehe g).

### d4 Renderer (`packages/presentation/src/render.mjs`) – **M**
- `slide.background = { color }` bzw. `{ path }` (oder `defineSlideMaster` je Rolle).
- Rect: `fill: { color, transparency: round((1-opacity)*100) }`, `line: { color, transparency, width }` bei `stroke`, `ShapeType.roundRect` + `rectRadius = radiusCm / 2.54`, `shadow: { type:'outer', color, opacity, blur, offset:0, angle:0 }` bei `glow`.
- Text: `fontFace` aus Rolle (`Segoe UI Semibold`, `Segoe UI Black`, `Consolas`), `bold` nur für 700, `charSpacing = trackingEm × pt`, `lineSpacingMultiple`.
- Charts: `catAxisLabelColor`, `valAxisLabelColor`, `dataLabelColor`, `legendColor`, `legendFontFace`, `catAxisLabelFontFace`, Gitter `#FFFFFF` Transparenz 94; `dataLabelFormatCode` de-CH (`#'##0`).
- Logo: Variante nach Flächenluminanz (onDark/onLight), `plate:false` → keine Platte, `.svg` für Decks ablehnen (pptxgenjs IMG_BROKEN in Node).
- Übergänge aus `deck.transitions` (falls pptxgenjs unterstützt; sonst dokumentieren).
- Windows-Pfadfehler `build-decks.mjs:14` (`new URL().pathname` → `fileURLToPath`) mitbeheben.

### d5 HTML-Vorschau-Parität (`apps/docs/app/_components/slide-preview.tsx`) – **M**
Opazität (rgba), Stroke (border), Radius, Glow (box-shadow), `scene.background` (background-image), Schnitt/Laufweite mappen, damit `/praesentation` und Referenz-PNGs übereinstimmen.

### d6 Reference-Digest (`scripts/reference-cache.mjs`) – **S**
`deck` in `renderedBrandKeys`, Bytes aller `deck.surfaces.*.backdrop` und `deck.logo.*` hashen. `tests/deck-contract.test.mjs:19` verlangt `deck`, `presentation` bleibt ausgeschlossen (Z. 18). Danach `npm run deck:reference` (soffice + pdftoppm vorhanden) – alle Referenzen aller Brands bekommen neue `sourceHash`.

## (e) Assets aus `radiox/apps/frontend/public` (und abgeleitet)

| # | Asset | Ziel | Aufwand |
|---|---|---|---|
| e1 | `rx-aurora-master.png` (1254², geprüft) + vorhandene Aurora-Exporte `android-chrome-192x192.png`, `android-chrome-512x512.png`, `apple-touch-icon.png` (alle `?v=aurora-1` im Manifest) | `brands/radiox/assets/icons/` + daraus `rx-aurora-1024.png` (sharp, Lanczos) | S |
| e2 | `speakers/aeon.png`, `speakers/aeon-96.webp` | `brands/radiox/assets/persona/` (Persona, nicht Logo) | S |
| e3 | Wortmarke neu: `wordmark-dark.svg` mit 145deg-Aurora-Verlauf auf dem X (`#A5F3FC 12% / #22D3EE 45% / #A78BFA 80%`) + `feDropShadow` 5 px Cyan .25, Laufweite −0.05em, «Radio» 600 / «X» 900 | `brands/radiox/assets/logos/wordmark-dark.svg` (ersetzt flaches Cyan-X) | S |
| e4 | `icon-dark.svg` korrigieren: R vollweiss `#FEFEFE`, X `#00FCFD → #3E5FFB → #9725FC → #FE79FC`, Grund `#000`, rx 24 % | `brands/radiox/assets/logos/icon-dark.svg` | S |
| e5 | Rasterisierte Deck-Logos (sharp, ≥ 1200 px breit): `wordmark-on-dark.png`, `wordmark-mono-white.png`, `wordmark-light.png` (abgeleitet) | `brands/radiox/assets/deck/` + `apps/docs/public/brands/radiox/assets/deck/` | S |
| e6 | Backdrop-Standbilder 2400 × 1350 PNG: `aurora-cover.png`, `wash-content.png`, `matrix-edges.png` (echter Matrix-Algorithmus, 24 Schritte, Dichte 1.0, fixer Seed, Ränder je 8 %), `matrix-edges-aurora.png`; Generator `scripts/build-radiox-backdrops.mjs` (Playwright-Canvas oder node-canvas + sharp), reproduzierbar | `brands/radiox/assets/deck/` | M |
| e7 | OG-Vorlage neu (1200 × 630 aus Aurora-Master + Wortmarke, Wash wie `api/og-live.tsx`) – optional | `brands/radiox/assets/og/` | S |
| **Nicht kopieren** | `og-default.png`, `favicon.svg`, `icons/*` (Fremdlogos, zwei 0-Byte-Dateien), `sources/*` (Publisher-Rechte), `aeon-sample.mp3`, Produktions-Covers | – | – |

## (f) Tests und Checks

| # | Test | Aufwand |
|---|---|---|
| f1 | `tests/brands.test.mjs:31` → vergleicht mit `modes[deck.mode ?? 'light'].primary`. | S |
| f2 | DNA-Sync-Test (inkl. Destructive ≠ `#EF4444`, Aurora-Default ≠ fuchsia/blue): `brands/radiox/dna.json` ↔ `radiox.json` (Palette-Hex, Radius 16, Caps 0.16em, headingWeight 700, keine 800) und ↔ `theme.css` (Variablen vorhanden, kein `backdrop-filter` auf `[data-slot=card]`, kein `rgb(168 85 247)`, kein `rgb(59 130 246)`). | M |
| f3 | Kontrast: Deck-Text über komposit. Material (Panel black .25 über #050505 bzw. white .03 → #0C0C0C): fg-3 `#94A3B8` ≥ 4.5:1, fg-2/fg ≥ 7:1; Chart-Labels gesetzt. | S |
| f4 | Deck-Contract: dunkle Deck-Brand → kein Node mit Weissfläche, alle Nodes finite Geometrie, Cover ohne 17.524-Band, Logo-Node ist Bild (kein Text), keine `.svg` im Deck. | M |
| f5 | Digest: geändertes Backdrop-PNG ändert `sourceHash`. | S |
| f6 | Regression: neutral/rapold/dominicano-express rendern bytegleich, solange sie kein `deck` deklarieren. | S |
| f7 | Copy-Lint für RadioX-Brand-Texte (README, Beispieldecks): kein Eszett, kein «Radio X», keine Emoji, Guillemets, de-CH-Zahlen. | S |
| f8 | Visueller Check: Playwright-Screenshot `/praesentation?brand=radiox` (1440 × 900) neben `radiox.cloud/live` ablegen; Abnahme durch Marcel. | S |

## (g) Offene Fragen an Marcel

1. **CTA-Form:** Button-Komponente 8 px Radius (Code, Login live) oder Pill (Library-CTA, 404)? Vorschlag: 8 px für Buttons, Pill nur Chips/Badges.
2. **Deck-Schrift:** Segoe UI-Familie als Standard (exakt wie radiox.cloud auf Windows) und Inter nur für Mac/Google-Slides-Empfänger – einverstanden? Oder Inter überall (einbettbar, aber nicht RadioX-Rendering)?
3. **Wide-Eyebrow:** Die 0.3em-Kicker (Changelog, Login) sind auffällig. Ganz streichen (Vorschlag) oder als einzige Hero-Variante zulassen?
4. **Aurora-Paar in Decks:** Marken-Paar `#22D3EE` + `#A78BFA` (Logo) – oder das weichere Fensterlicht `#58DDD3` + `#BC9CFA`?
5. **Light-Mode:** Darf Atlas den abgeleiteten Light-Mode für RadioX überhaupt anbieten (z. B. Druck), oder soll RadioX `modes.light` nur pro forma führen und überall Dark erzwingen?
6. **Kartenfüllung im Deck:** black .25 über Backdrop (RadioX-treu, Karte lebt fast nur vom Rand) oder white .03 (sichtbarere Fläche)?
7. **Produktvokabular in Atlas:** README schliesst Klang-DNA/Battles aus. Sollen Zonennamen, Ton-Punkte und Vote-/Radar-Rezepte jetzt in den Brand-Layer (Vorschlag: ja, als Rezepte, nicht als Core-Komponenten)?
8. **Voice im Contract:** Neuer Key `voice` (Locale, Separatoren, Zahlformat, Taglines, Glossar) im Brand-Schema – gewünscht, damit Decks keine Atlas-Platzhalter mehr zeigen?
9. **Fixes in RadioX selbst** (nicht in diesem Branch): `/icon-192.png?v=aurora-1` liefert die SPA-HTML-Seite (HTTP 200 `text/html`) statt eines Bildes – `RadioXLogo.tsx` LogoIcon zeigt damit ein kaputtes Bild; Eszett-Reste, «Radio X» auf der Team-Seite, Login-Grün, «0 Stimmen», en-US-Zahlen und englische Hero-Copy im Changelog (E36), Danger-Button in Rot (E32), Manifest `background_color #0a0a0a` (E33), Panel-Punkte und Header in Tailwind-Palette statt Tokens (E1) – als Backlog im radiox-Repo anlegen?
10. **Aurora-Default ausserhalb /live:** Der Code nennt `#58DDD3`/`#BC9CFA` «RadioX aurora defaults» (LiveBackgroundGlow.tsx:12), die Blob-Defaults sind cyan-500/fuchsia-600/blue-900, die DNA setzt `#22D3EE`/`#A78BFA` (E7). Bestätigen (gehört zu Frage 4)?
11. **Reduced Motion:** Atlas mit 160-ms-Opazitäts-Fade (DNA-Vorschlag) oder 1:1 wie RadioX global `0.01ms` (E39)?
