# RadioX – Design-DNA

Stand: 14.10.2026 · Status: kanonischer Entwurf · Maschinenlesbar: [`dna.json`](./dna.json) · Umsetzung: [`dna-implementation-plan.md`](./dna-implementation-plan.md)

Quelle der Wahrheit sind `apps/frontend/index.css` (`@theme static`, Z. 28–118, Kommentar «die eine Quelle» Z. 5–27) im Repo `radiox` und die gerenderte Produktion auf radiox.cloud (Playwright, 1440×900 und 390×844, berechnete Styles). Alles in diesem Dokument ist belegt, nichts ist erfunden. Wo RadioX selbst uneinheitlich ist, steht der kanonische Wert hier und die Abweichung im Kapitel «Abweichungen & Entscheide».

---

## 1. Kern

RadioX ist eine **schwarze Bühne, die von Licht beleuchtet wird, nicht von Flächen**. Die Basis ist fast schwarz (#050505), es gibt kein Light-Theme. Jede Fläche darüber ist durchscheinend: Weiss mit 3/6/10 % oder Schwarz mit 25/50/70/85 %. Farbe kommt aus genau drei Quellen: aus dem Umgebungslicht (auf /live Aurora-Blobs in den Farben des aktuellen Covers, ausserhalb von /live das Marken-Paar Cyan + Violett – siehe 5.3 B und E7 –, dazu der «Matrix-Regen» aus X-Glyphen), aus dem Cyan-Glow interaktiver Elemente und aus dem Aurora-X im Logo. Glas gibt es nur für schwebende Chrome-Elemente (Header, Player-Bar, Play-Orb, Fenster), nie für Inhaltskarten. Jede Signalfarbe hat genau eine Bedeutung. Die Typografie ist leise (Systemschrift, 11–16 px, 400/600) mit lauten Momenten (Logo-X und Display-Headlines in 900, Caps-Eyebrows mit 0.16em, Mono-Zahlen in Signalfarben). Die Bewegung landet weich und schiesst nie über.

**Fünf Prinzipien**

1. **Schwarz zuerst.** #050505 auf jeder Fläche, auch in Präsentationen. Helle oder getönte (Teal-/Grau-)Flächen sind nicht RadioX.
2. **Licht statt Farbe.** Flächen bleiben neutral. Farbe entsteht durch Aurora, Glow und das Logo-X.
3. **Glas nur für Chrome.** Header 24 px Blur, Bar 24 px, Play-Orb 14 px + saturate 170 %, Fenster 20 px. Inhaltskarten haben keinen Blur (Audit D17).
4. **Eine Farbe, eine Bedeutung.** Cyan = Interaktion, Rot = nur Live, Violett = KI, Smaragd = Hörer, Amber = News, Pink = Klang-DNA, Rose = Fehler.
5. **Ruhig und ehrlich.** Ein pulsierendes Element pro Ansicht, ein Glow pro Ansicht, KI wird immer sichtbar gekennzeichnet, keine unbelegten Behauptungen.

---

## 2. Farbe & Oberflächen

### 2.1 Grundpalette

| Token | Wert | Rolle | Beleg |
|---|---|---|---|
| surface-0 | `#050505` | Seiten-/Slide-Hintergrund, theme-color | index.css:57; index.html:98 `theme-color`; body computed rgb(5,5,5) |
| black | `#000000` | Immersive Ebenen, unteres Ende von Fades, BottomStack-Grund | LiveMobileNative computed rgb(0,0,0); BottomStack.tsx:109 `bg-black` |
| fg | `#FFFFFF` | Titel, Primärtext | index.css:69 |
| fg-2 | `#CBD5E1` | Sekundärtext, Untertitel | index.css:70 |
| fg-3 | `#94A3B8` | Kleine Labels, Untergrenze für kleinen Text | index.css:71 |
| fg-4 | `#64748B` | Nur ≥ 18 px oder dekorativ | index.css:72 |
| accent | `#22D3EE` | Links, Fokus, Tab-Linie, Eyebrows, Primärserie | index.css:75 |
| primary-fill | `#06B6D4` | Gefüllte Primär-Buttons (schwarzer Text) | Button.tsx:43 `bg-cyan-500` (= brand-500 index.css:89); live gerendert als Tailwind-v4 `oklch(71.5% .143 215.221)` ≈ #00B8DB → E1 |
| primary-fill-hover | `#22D3EE` | Hover | Button.tsx:43 `hover:bg-cyan-400` |
| primary-fill-active | `#0891B2` | Active | Button.tsx:43 `active:bg-cyan-600` |
| accent-strong | `#67E8F9` | Fokus in Fenstern, aktive Icons, Logo-Fallback | modal.css:142; index.css:808 |
| accent-soft | `#A5F3FC` | Aktiver Tab-Text | AppShellHeader.tsx:415 `text-cyan-200` (live v4 `oklch(91.7% .08 205.041)` ≈ #A2F4FD → E1) |
| selection | `rgba(34,211,238,0.35)` + Text weiss | Textauswahl | index.css:241–244 (PageLayout.tsx:125 setzt zusätzlich `selection:bg-brand-500/30` → E38) |

Cyan-Skala (v3-Hex, kanonisch): 50 `#ECFEFF` · 100 `#CFFAFE` · 200 `#A5F3FC` · 300 `#67E8F9` · 400 `#22D3EE` · 500 `#06B6D4` · 600 `#0891B2` · 700 `#0E7490` · 800 `#155E75` · 900 `#164E63` · 950 `#083344`.

### 2.2 Signalfarben (eine Farbe, eine Bedeutung)

| Token | Wert | Bedeutung | Beleg |
|---|---|---|---|
| onair | `#EF4444` | **Nur Live.** Max. ein pulsierendes Element pro Ansicht | index.css:76 «nur live»; LiveDot.tsx |
| ai | `#A78BFA` | Alles KI-Generierte | index.css:77; Badge.tsx:43 |
| community | `#34D399` | Hörer, Stimmen | index.css:78 |
| news | `#FBBF24` | News, Quellen | index.css:79 |
| dna | `#F472B6` | Klang-DNA, Geschmack | index.css:80 |
| danger | `#FB7185` | Fehler, Risiken | index.css:81 |
| neutral | `#94A3B8` | Neutraler Ton-Punkt (Panel-Kopf) | LivePanel.tsx:41 `bg-slate-400`; tone.ts `TONE_FILL.neutral` nutzt dagegen fg-4 `#64748B` → E31 |

Hinweis: Diese Tokens existieren als Tailwind-Klassen (`text-ai`, `bg-onair` …) und werden in neueren Komponenten (Badge, tone.ts) genutzt. Ältere Komponenten (LivePanel-Punkte, Header, Buttons) nutzen die Tailwind-Palette (`bg-cyan-400`, `bg-violet-400` …) und rendern deshalb live in v4-oklch (E1). Die Hex-Werte oben sind kanonisch.

**Ton-Formel** (tone.ts, statusTone.ts): Füllung = Ton bei 6 % (Chip 8 %), Rand = Ton bei 30 %, Badge-Rand 40–50 %, Text = Ton-200 oder Token, Vollfläche = Ton-500 mit schwarzem Text.

**Panel-Ton-Punkte** (6 px): Was läuft = slate, Du wählst = Smaragd (siehe Entscheid E4), Läuft jetzt = Cyan, Klang-DNA = Pink, Quellen = Amber.

### 2.3 Opazitäts-Skala (alle Transparenzen rasten hier ein)

| Familie | Stufen |
|---|---|
| Weiss-Schleier (Flächen) | 0.03 surface-1 · 0.06 surface-2 · 0.10 surface-3 |
| Weiss-Linien | 0.05 innere Teiler · 0.10 line · 0.18 line-strong · 0.20 Sekundär-Button-Rand |
| Schwarz | 0.25 Karte · 0.50 Header · 0.60 Chips · 0.70 Scrim · 0.85 Bar · 0.90 Mobile-Nav · 0.95 Bildunterkante |
| Ton | 0.06 Tint · 0.08 Status-Chip · 0.15 aiHost-Füllung · 0.30 Rand · 0.40–0.50 Badge-Rand |
| Disabled | 0.5 (Icon-Buttons 0.3) |

### 2.4 Oberflächen

| Oberfläche | Rezept | Beleg |
|---|---|---|
| Karte (Panel) | `rgba(0,0,0,0.25)`, Rand `1px rgba(255,255,255,0.10)`, Radius 16 px, **kein** backdrop-filter, kein Schatten | LivePanel.tsx:253; computed |
| Inset (Karte in Karte) | `rgba(255,255,255,0.06)`, Rand `1px rgba(255,255,255,0.10)`, Radius 12 px, Padding 12 px | Inset.tsx; computed |
| Interaktive Zeile | `rgba(0,0,0,0.25)`, Rand white/10, Radius 12 px | Vote-Rows computed |
| Listenfläche | `rgba(255,255,255,0.03)`, Hover 0.06 | News-Artikel computed (0.02 → eingerastet) |
| Scrim | `rgba(0,0,0,0.70)` unter Text/Badges auf Bildern | index.css:66 |

### 2.5 Glas-Rezepte (nur Chrome)

| Rezept | Werte | Beleg |
|---|---|---|
| **Header** | `rgba(0,0,0,0.50)` + `blur(24px)` + Unterkante `1px rgba(255,255,255,0.10)`. Drive-Modus: `#050505`. Variante `transparent` (Vollbild-Bühnen, PublicShowView.tsx:193): `linear-gradient(to bottom, rgba(0,0,0,0.70), rgba(0,0,0,0.40), transparent)` + `blur(12px)`, Unterkante transparent | AppShellHeader.tsx:300–305; computed `oklab(0 0 0 / .5)` + `blur(24px)`, Höhe 65 px (1440) / 57 px (390, /library) inkl. Linie |
| **Player-Bar** | `rgba(0,0,0,0.85)` + `blur(24px)` + Oberkante white/10 + `0 -8px 30px rgba(0,0,0,0.5)`. **Achtung:** Der fixe Wrapper `BottomStack` hat `bg-black` (z 40), die Bar liegt also auf deckendem `#000` – das Glas ist im Produkt nominell, sichtbar ist eine schwarze Leiste (→ E34) | PersistentMiniBar.tsx:965; BottomStack.tsx:109; computed Bar `oklab(0 0 0 / .85)` + `blur(24px)`, Wrapper `rgb(0,0,0)`, Höhe 70 px (1440) / 82 px (390), `--bottom-stack-h` 70px/82px |
| **Mobile-Nav** | `rgba(0,0,0,0.90)` + `blur(24px)` + `0 -8px 30px rgba(0,0,0,0.7)` | MobileBottomNav.tsx:96 |
| **Chip über Cover** | `rgba(0,0,0,0.60)` + `blur(12px)` + Rand `rgba(255,255,255,0.20)`, Pill | LiveCoverOpenHint computed |
| **Play-Orb** (Signatur) | Hintergrund: `radial-gradient(120% 75% at 50% -12%, rgba(255,255,255,0.24), transparent 62%), linear-gradient(to bottom, transparent 50%, rgba(34,211,238,0.20)), rgba(6,10,18,0.50)`; `backdrop-filter: blur(14px) saturate(170%)`; Schatten: `inset 0 1px 0 rgba(255,255,255,0.5), inset 0 0 0 1px rgba(255,255,255,0.2), inset 0 -1px 0 rgba(34,211,238,0.4), 0 8px 24px -6px rgba(0,0,0,0.6), 0 0 22px -2px rgba(34,211,238,0.35)`; Icon `drop-shadow(0 1px 1px rgba(0,0,0,.45)) drop-shadow(0 0 6px rgba(34,211,238,.55))`; Hover Sheen 0.34, Glow 0.55, scale 1.05; Active 0.95; Flach-Fallback `rgba(10,14,22,0.80)`; Fokus `outline 2px #22D3EE` Offset 3 px; Disabled 0.5; Grössen 36/44/64/112 px | index.css:629–717; computed (44 px Orb auf /live) identisch inkl. `saturate(1.7)` |
| **Fenster** (Modal) | Rahmen-Scrim `rgba(2,5,10,0.58)` ohne Blur. **Solide Basis** (immer): `linear-gradient(145deg, rgba(255,255,255,0.065), transparent 38%), #10161E`. **Glas** (Tier high/ultra): `radial-gradient(ellipse at 0 0, light 13 %, transparent 52%), radial-gradient(ellipse at 100% 100%, light-2 9 %, transparent 52%), linear-gradient(145deg, rgba(255,255,255,0.075), transparent 38%), rgba(15,21,29,0.88)`; `blur(20px)`; Oberkante `color-mix(light 22 %, rgba(226,241,255,0.25))`; Zusatzschatten `-12px -8px 50px -28px light@32 %`, `14px 16px 50px -30px light-2@30 %`. **Soft** (Tier medium): `rgba(15,21,29,0.91)` + `blur(8px)`. Rand `1px rgba(226,241,255,0.18)`; Schatten `0 28px 88px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.12)`; Radius 28 px (< 640 px: 20 px); Kopf/Fuss Padding 16/20 (mobil 12/16), Kopf `rgba(255,255,255,0.025)`, Fuss `rgba(0,0,0,0.12)`, Teiler `rgba(226,241,255,0.10)`; Titel 18 px/1.4 600 −0.025em; Emblem 44 px r16, Text `#B3F2EE`, Rand `rgba(180,235,241,0.24)`, Füllung `linear-gradient(135deg, rgba(88,221,211,.15), rgba(188,156,250,.12))`; Schliessen-Knopf 44 px Pill, `rgba(255,255,255,0.055)` → Hover 0.13, Rand `rgba(226,241,255,.18)` → .30, Text `#E2EAF3`; Licht-Defaults `#58DDD3` / `#BC9CFA` (im Code «RadioX aurora defaults», LiveBackgroundGlow.tsx:12; auf /live Cover-Farben); Tinte `#F8FAFC`, muted `#A9B8CA`; Flach-Fallback `#10161E` (inert, flat, reduced transparency, Drive) | modal.css:1–300; ModalDialog.tsx:75 (Material nach Tier) |

**Blur-Skala:** Bars 24 px · Fenster 20 px (soft 8) · Controls 14 px + saturate 170 % · Chips 12 px · Inhalt: keiner.

### 2.6 Glow und Schatten

| Stufe | Wert |
|---|---|
| rest | `0 0 14px rgba(34,211,238,0.25)` |
| interactive | `0 0 20px rgba(34,211,238,0.30)` |
| hover | `0 0 30px rgba(34,211,238,0.40)` |
| line (Tab-Indikator) | `0 0 14px rgba(34,211,238,0.70)` |
| orb | `0 0 22px -2px rgba(34,211,238,0.35)` |
| chart | `drop-shadow(0 0 24px rgba(34,211,238,0.15))` |

Regel: Glow nur in Cyan, nur ein glühendes Element pro Ansicht/Slide, nie auf Fliesstext oder Inhaltskarten. Tiefe kommt aus schwarzen Schatten (Popover `0 8px 32px rgba(0,0,0,.6)`, Fenster `0 28px 88px rgba(0,0,0,.48)`) plus innerer Lichtkante `inset 0 1px 0 rgba(255,255,255,.12)`.

### 2.7 Verläufe

| Name | Wert |
|---|---|
| Logo-X | `linear-gradient(145deg, #A5F3FC 12%, #22D3EE 45%, #A78BFA 80%)`, Fallback `#67E8F9`, `drop-shadow(0 0 5px rgba(34,211,238,0.25))` |
| Desktop-Wash | `linear-gradient(to bottom right, rgba(22,78,99,0.20), rgba(88,28,135,0.10) 50%, transparent)` + `radial-gradient(ellipse at top, rgba(6,182,212,0.10), transparent)` – PageLayout.tsx:142–143 (`from-cyan-900/20 via-purple-900/10`, `from-cyan-500/10`), nur ausserhalb /live, nur Desktop. Der Purple-Anteil ist der einzige Purple-Ton im Hörer-Chrome (E35) |
| Header-Backdrop | `linear-gradient(to bottom, rgba(0,0,0,0.70), rgba(0,0,0,0.20), transparent)` hinter dem Header (PageLayout.tsx:156) |
| Changelog-Hero-Aurora | Kreis 320 px `radial-gradient(circle, #22D3EE, transparent)` oben rechts, Opazität 0.30, `blur(64px)`; Kreis 384 px `radial-gradient(circle, #A78BFA, transparent)` unten links, 0.20, `blur(64px)` (ChangelogView.tsx:575–582) – neben Logo-X und Station-Glow (stationLogo.css:23) der einzige Ort, an dem das Marken-Paar Cyan + Violett im Produkt als Licht erscheint (Beleg für E7) |
| OG-Wash | `#050505` + `radial-gradient(circle at 20% 20%, rgba(34,211,238,0.18), transparent 55%)` + `radial-gradient(circle at 85% 90%, rgba(139,92,246,0.16), transparent 55%)` (violet-500, kanonisch → `#A78BFA`, E7; api/og-live.tsx:223–225) |
| Cover-Overlay (Text auf Bild) | `linear-gradient(0deg, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.78) calc(100% - 32px), transparent 100%)` |
| Cover-Kopf | `linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.20) 50%, transparent)` |
| Live-Fade | `linear-gradient(to bottom, transparent, rgba(0,0,0,0.20) 50%, #000)` |
| Fallback-Cover | `radial-gradient(circle at 22% 18%, {from}CC 0%, transparent 48%), linear-gradient(135deg, {to} 0%, #020617 78%)`; Paare: [#22D3EE,#1D4ED8] [#F472B6,#7C3AED] [#F59E0B,#DC2626] [#34D399,#0F766E] [#A78BFA,#4338CA] [#FB7185,#BE123C] |
| Cover-Sheen | `linear-gradient(100deg, transparent, rgba(255,255,255,0.11) 50%, transparent)` |

Kein Light-Mode, keine Noise-/Grain-Textur (die Textur ist der X-Regen).

---

## 3. Typografie

### 3.1 Web

RadioX lädt **keine Webfont** (0 Font-Requests, `document.fonts` leer). Die Systemschrift ist die Marke: auf Windows Segoe UI, auf Apple SF Pro.

- **Sans (kanonisch):** `-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` – Vereinigung aus dem `html`-Stack (index.css:149, so computed auf `body`: `-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, "Segoe UI", Roboto, sans-serif`) und `@theme --font-sans` (index.css:47–48, beginnt mit `ui-sans-serif`, gilt nur bei `font-sans`-Klasse). Siehe E11.
- **Mono:** `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace` (Terminal, Metriken, Zeitstempel, Preise)
- **Rendering:** antialiased, grayscale, optimizeLegibility
- **Gewichte:** 400 Text · 500 UI · 600 Labels/Kartentitel · 700 Headlines · 900 nur Logo-X und Display. **800 gibt es nicht.**
- **Laufweite:** Caps 0.16em · Display −0.025em · Poster −0.05em · Logo −0.05em (xs/sm −0.04em, Hero −0.06em)
- **Zahlen:** `tabular-nums` für Zähler, KPIs, Zeiten. Lange Texte `line-height: 1.625`.

### 3.2 Skala

| Rolle | Grösse / Zeilenhöhe | Gewicht | Weiteres |
|---|---|---|---|
| micro (Eyebrow, Badge) | 11 px / 1.3 | 600 | Caps, 0.16em, fg-3 oder Ton – Untergrenze |
| meta | 12 px / 1.4 | 400 | |
| nav | 12 px / 1.4 | 700 | Caps, 0.16em |
| body | 14 px / 1.5 | 400 | |
| title (Karte) | 16 px / 1.35 | 600 | |
| h1 (dichte Seiten, /live) | 24 px / 1.2 | 700 | computed /live «Live Stream» 24/32 |
| h1 (Inhaltsseiten) | 36 px / 40 px (< 768: 30 / 36) | 700 | computed /library «Deine RadioX-Sammlung» |
| Fenster-Titel | 18 px / 1.4 | 600 | −0.025em, modal.css:85–91 |
| now playing | 32 px / 1.25 | 700 | −0.025em |
| hero | clamp(28px, 3vw, 44px) / 1.1 | 700 | |
| display | 36–60 px / 0.95 | 900 | −0.025em, Punchline mit Punkt («Behind the broadcast.», ChangelogView.tsx:591 `text-4xl md:text-6xl font-black tracking-tight leading-[0.95]`) |
| poster | 48–72 px / 1.0 | 900 | Caps, −0.05em |
| KPI | Mono 36/40 px | 400 | tabular, Farbe nach Rolle |
| terminal | Mono 11 px / 1.55 | 400/600 | |

### 3.3 Präsentation (PPTX)

| Rolle | Schnitt (primär) | Alternative (Mac/Google Slides) |
|---|---|---|
| Text 400 | `Segoe UI` | `Inter` |
| Labels 600 | `Segoe UI Semibold` | `Inter SemiBold` |
| Titel 700 | `Segoe UI` + bold | `Inter` + bold |
| Display 900 | `Segoe UI Black` | `Inter Black` |
| Mono | `Consolas` | `Consolas` |

Segoe UI ist auf jedem Windows-Office installiert und ist exakt das, was radiox.cloud auf Windows rendert (CDP `getPlatformFontsForNode`). fsType 8 erlaubt editierbares Einbetten. Gewichte werden über den Schnittnamen gesetzt, nicht über ein bold-Boolean. Logo immer als Rasterbild, nie als Live-Text.

| Deck-Rolle | pt | Schnitt | Farbe | charSpacing | Zeilenabstand |
|---|---|---|---|---|---|
| Display | 40–54 | Black | #FFFFFF | −0.025 × pt | 0.92 |
| Titel | 28–30 | Bold | #FFFFFF | −0.015 × pt | 0.95 |
| Kartentitel | 16 | Semibold | #FFFFFF | 0 | 1.0 |
| Text | 12–14 | Regular | #CBD5E1 | 0 | 1.25 |
| Meta | 10 | Regular | #94A3B8 | 0 | 1.2 |
| Eyebrow | 9.5–11 | Semibold, Caps | #22D3EE oder Ton | +0.16 × pt | 1.0 |
| KPI | 32–40 | Consolas | Rollenfarbe | 0 | 1.0 |
| Chart-Labels | 9 | Regular | #94A3B8 | 0 | – |

---

## 4. Form & Raster

### 4.1 Radien

| Token | Wert | Verwendung |
|---|---|---|
| cover | 0 px | Cover-Art ist scharfkantig (`rx-cover-sharp`, «Tech-Look»), wird vom Container beschnitten |
| thumb-s | 4 px | Thumbs ≤ 32 px, Mini-Cover |
| chip | 6 px | Inline-Tags, Publisher-Badge |
| button | 8 px | Buttons sm/md, Thumbs ≤ 56 px, Icon-Button sm |
| inset / button-lg | 12 px | Zeilen, Tiles, News-Karten, Menüs, Buttons lg |
| card | 16 px | Panels, Leerzustände |
| window | 28 px (mobil 20 px) | Fenster, Sheets |
| pill | 9999 px | Badges, Chips, Status, Avatare, Orb |
| app-icon | 24 % | App-Icon-Maske |

### 4.2 Abstände

4-px-Raster mit sieben Stufen: **4 · 8 · 12 · 16 · 24 · 32 · 48**. In Karten 4/8/12, zwischen Karten 16 (mobil 12), nur auf Seitenebene 24/32/48. Verboten: 6, 10, 20, 28. Touch-Ziel 44 px (grob 48 px).

### 4.3 Shell

| Element | Wert |
|---|---|
| Max-Breite | 1920 px Standard · 2400 px /live · 1400 px schmal/Admin |
| Gutter | 16 px (< 768) · 32 px (≥ 768); Logo, Titel und erste Karte auf derselben Kante |
| Header | 56 px (< 1024) · 64 px (≥ 1024) + 1 px Linie, z 40, versteckt sich beim Runterscrollen (200 ms ease.out) |
| Player-Bar | 70 px Desktop · 82 px Phone, Grid `minmax(0,1fr) auto minmax(max-content,1fr)`, Padding 8/16, Gap 16, publiziert `--bottom-stack-h` |
| Seiten-Padding | oben 32 px, unten `calc(var(--bottom-stack-h,5rem) + 1rem)` |
| /live-Kopf-Rhythmus | Header 64 → 12 → Titelzeile 36 → 12 → Grid |
| Dashboard (≥ 1200) | Spalten 1 : 1.5 : 1, zweite Zeile `clamp(200px, …, 240px)`, Gap 16, feste Höhe ohne Scroll |
| Tablet (768–1199) | 12 Spalten, Gap 16 |
| z-Ebenen | Backdrop −10 · Header 40 · Bar 45 · Sheet 50 · Modal 60 · Toast 70 |
| Breakpoints | sm 640 · md 768 · lg 1024 · dashboard 1200 · xl 1280 · 2xl 1536 |

### 4.4 Slide-Raster (16:9, Referenz 1280 × 720 px, 1 px = 9525 EMU = 0.02646 cm)

| Zone | y (px) | Inhalt |
|---|---|---|
| Header-Band | 0–56 | Schwarz 50 %, Unterkante 0.75 pt white/10, Wortmarke links x 32, Höhe 18 px |
| Titelzeile | 68–104 | Eyebrow + Titel |
| Inhalt | 116–648 | 1216 × 532 px, 12 Spalten à 86.67 px, Gap 16 |
| Footer-Band | 664–720 | Schwarz 85 %, Oberkante 0.75 pt white/10, Quellenzeile links, Seitenzahl Mono rechts |

Seitenrand 32 px. Signatur-Raster: drei Spalten 338.3 / 507.4 / 338.3 px, optional zweite Zeile 200 px unter Spalten 2–3. Zwei gleich: 600 px. KPI 4er: 292 px, 5er: 230.4 px.

---

## 5. Bewegung & Hintergründe

### 5.1 Bewegungs-Tokens

| Token | Wert | Verwendung |
|---|---|---|
| fast | 150 ms | Farbe, Hover, Scale am Orb |
| base | 250 ms | Struktur, Glow, Opazität |
| slow | 600 ms | Ruhige Fades (Rest-Modus) |
| morph | 420 ms | Player-Sheet ↔ Mini-Bar |
| scene | 760 ms | Desktop-Eintritt in /live |
| stagger | 320 ms pro Element, 90 ms Abstand, 420 ms Verzögerung | Titel, dann Waveform |
| reduced | 160 ms nur Opazität | Kanonisch für Atlas. Im Produkt nur für Player-Morph (playerMorph.ts:61 `REDUCED_FADE_MS`), Live-Szene (index.css:433) und Fenster-Scrim; die globale Reduced-Motion-Regel setzt dagegen alle Animationen/Transitions auf `0.01ms` (index.css:834–841) → E39 |
| ease.out | `cubic-bezier(0.22, 1, 0.36, 1)` | Standard für alles Neue |
| ease.ios | `cubic-bezier(0.32, 0.72, 0, 1)` | Ganze Flächen bewegen sich |
| ease.fade | `cubic-bezier(0.4, 0, 0.2, 1)` | Reine Opazitäts-/Farb-Fades |

Regeln: kein Überschiessen, Ambient-Loops ≥ 2 s, nichts schneller als 3 Hz, ein pulsierendes Element pro Ansicht.

### 5.2 Signatur-Animationen

- **miniBarEnter:** `translate3d(0,100%,0)` + Opazität 0 → Ruhe, 260 ms ease.out.
- **Fenster:** Scrim dimmt 160 ms ease-out; Karte von `translateY(10px) scale(0.985)` in 250 ms ease.out (kanonisiert, siehe E10).
- **«Glas klärt sich»** (Szene /live, 760 ms ease.ios): alte Seite `scale(0.96) brightness(0.35)`, neue von Opazität 0 + `blur(20px) saturate(1.4)`, deckend bei 45 %, scharf bei 100 %.
- **Cover-Crossfade:** 700 ms, alt 1 → 0, blur 0 → 6 px, scale 1 → 1.03. Reduced: 200 ms nur Opazität.
- **Cover-Sheen:** einmalig, 900 ms ease.fade, Band 100deg white 0.11, translateX 0 → 270 %.
- **Logo-Glitch:** 7 s, ruhig bis 88 %, bei 90 % `text-shadow: -2px 0 rgba(255,0,100,.85), 2px 0 rgba(0,240,255,.85)`, 92 % gespiegelt, 94 % ±1 px bei 0.6, 96 % aus. Hover 0.5 s einmal. Aus bei Reduced Motion, Drive-Modus und im Header.
- **Station-Glow** (Header-Logo, stationLogo.css): Halo `::before` mit `inset: -18px -24px -18px 30%`, `radial-gradient(ellipse, rgba(34,211,238,.65), rgba(167,139,250,.18) 42%, transparent 70%)`, Opazität = Audio-Energie e (0–1), `scale(0.9 + 0.3e)`, Übergänge Opazität 180 ms / Transform 240 ms ease-out; ohne Audio («ambient») Atmen 4 s ease-in-out auf 0.45e. Dazu reagiert das Logo-X selbst: `drop-shadow(0 0 calc(3px + 10px·e) rgba(34,211,238, 0.2 + 0.8e))`, 180 ms ease-out (computed in Ruhe: `drop-shadow(0 0 3px rgba(34,211,238,0.2))`). Im Header kein Glitch. Aus bei Reduced Motion und Drive.
- **LiveDot-Ping:** 1 s `cubic-bezier(0,0,0.2,1)`, scale 2, Opazität 0.75, nur `motion-safe`.

### 5.3 Hintergründe (je mit Bewegung und Standbild für Slide/PDF)

**A. Matrix-X-Regen** (Signatur-Textur, Desktop)
- Bewegung: Canvas, Glyphe «X», bold monospace 10–24 px (10 + z·14), Geschwindigkeit (0.5 + z·1.2) × 0.8–1.3 px/Frame, eine Spalte pro 25 px; Farbe `rgb(60+120g, 80+175g, 90+165g)`, Alpha `0.02 + 0.13z + (0.78+0.07z)g`, g = ((sin(t+offset)+1)/2)³; Spur-Wash `rgba(5,5,5,0.12)` pro Frame; Canvas-Opazität 0.55, fixed, z −10, DPR max. 1.5 (MatrixBackground.tsx:78–267). Auf /live nur an den Rändern (`edgesOnly`, PageLayout.tsx:150): Maske `linear-gradient(to right, #000 0, #000 calc(E − 1.5rem), transparent E, transparent calc(100% − E), #000 calc(100% − E + 1.5rem), #000 100%)` mit E = Shell-Seitenrand + 2rem (MatrixBackground.tsx:38–39); bei 1440 px computed also nur 8 px voll + Fade bis 32 px. Auf allen anderen Desktop-Seiten vollflächig (u. a. Root.tsx, App.tsx:1479, Login, Team, Changelog, Charts, Account).
- Tiers: minimal 0 fps · low 24 · medium 30 · high 45 · ultra 60.
- **Standbild:** 24 vorberechnete Schritte (STILL_FRAME_STEPS), Dichte 1.0, fixer Seed, 2400 × 1350 PNG. Für Slides nur im äusseren Rand (je 8 % links/rechts), nie hinter Text.

**B. Aurora** (Titel-/Kapitel-Licht)
- **Befund im Code** (SpeakerBlobs.tsx): drei Kreise, `mix-blend-mode: screen`. Blob 1: 60vw, oben −10 %/links −10 %, Code-Default `bg-cyan-500`, blur = Tier (40/60/100/120 px), Opazität 0.5 wenn Sprecher aktiv, sonst 0.1, schwebt 25 s. Blob 2: 60vw, unten/rechts −10 %, Code-Default `bg-fuchsia-600`, gleicher Blur, 0.5/0.1, 30 s reverse. Blob 3: 50vw Mitte, Code-Default `bg-blue-900/30` ohne eigene Opazität; mit Cover-Farben Primärfarbe bei 0.15; blur = Tier + 20 px (max. 140), 15 s (scale 1 → 1.3). Farbwechsel 3 s, Opazität 1.5 s (SpeakerBlobs.tsx Inline-Transition; index.css:1500–1521). Auf /live (LiveBackgroundGlow.tsx) kommen die Farben **immer** aus dem Cover (useCoverPalette.ts), ohne Cover neutrales Grau `rgb(72,72,72)` / `rgb(40,40,40)`; darüber `linear-gradient(transparent, rgba(0,0,0,.2) 50%, #000)` (PageLayout.tsx:137). Minimal-Tier: statt Blobs `linear-gradient(to bottom right, slate-900, black)`.
- **Kanonisch (Entscheid E7):** Ohne Cover (Decks, Atlas) leuchtet die Aurora in `#22D3EE` (Blob 1 + 3) und `#A78BFA` (Blob 2) mit 0.5/0.5/0.15 und 120/120/140 px. Fuchsia-600, Blue-900 und das neutrale Grau sind nicht Marke. Belege für das Paar: Logo-X, Station-Glow, Changelog-Hero.
- **Standbild:** gleiche Komposition gebacken. Slides: Cyan-Feld bei 8 %/4 %, Violett bei 92 %/96 %, Opazität 0.45, Blur ≈ 150 px auf 2400 Breite, Mitte 0.12, Fade nach Schwarz im unteren Drittel.

**C. Desktop-Wash** (ruhiger Inhaltshintergrund)
- Bewegung: keine (statisch).
- **Standbild:** identisch: `linear 135deg rgba(22,78,99,.20) → rgba(88,28,135,.10) 50% → transparent` + `radial ellipse at top rgba(6,182,212,.10)`.

**D. Lean-Back-Ambient** (Vollbild-Player)
- Bewegung: Cover 12 × 18 px gestreckt + blur-3xl bei 0.6.
- **Standbild (ohne Cover):** `#0A0A0A` + `radial(ellipse at 30% 40%, rgba(34,211,238,.14), transparent 60%)` + `radial(ellipse at 80% 80%, rgba(167,139,250,.12), transparent 55%)` + Vignette `radial(transparent 45%, rgba(0,0,0,.4))`. Gut für textlastige Statement-Slides.

**Flach-Modus** (Drive, reduced transparency): kein backdrop-filter, keine Loops, Bars `#050505`, Glas-Fallbacks `rgba(10,14,22,.80)` / `#10161E`. Mobile (< 768 px): keine Matrix, kein Wash, keine Blobs, nur `#050505`.

---

## 6. Komponenten-Grammatik

Delta = Abweichung zum heutigen Atlas-Core/Brand-Layer.

| Komponente | RadioX-Spezifikation | Delta zu Atlas |
|---|---|---|
| **Panel** | Karte black/25 + white/10 + 16 px, kein Blur. Kopf 44 px, Padding 12/16/0, 6 px Ton-Punkt + 8 px + Titel 16/20 600 weiss, rechts 28 px Maximize (Hit 44 px, Icon 14 px #94A3B8). Body 0/16/16, Untertitel 12 px fg-2. Überlauf: Maske `linear-gradient(#000 calc(100% - 40px), transparent)` | Atlas: Card py-6, gap-6, shadow-sm, white/3 + 16 px Blur, kein Kopf-Grammatik → neue Komponente `Panel` + Card-Variante |
| **Media-Panel** | Bild vollflächig, Kopf-Overlay Cover-Kopf-Verlauf, Meta-Overlay Cover-Overlay, Padding 32/20, text-shadow `0 1px 3px rgba(0,0,0,.8)` | fehlt |
| **Badge** | Pill, 20/24 px, Padding 8/10, 11 px/1 600 Caps 0.16em weiss, Scrim black/70, Rand Ton/50, Punkt 6/8 px oder Icon 12 px. Varianten: live (Rot), ai «KI-GENERIERT» (Violett + Sparkles), aiHost «KI-MODERATOR» (Violett 15 %/40 %), count (Smaragd/40, tabular), neutral (Scrim, Rand line-strong 0.18, Text fg-2). Badge.tsx:36–50 | Atlas: 12 px, 500, normal case, onMedia weiss → Grösse, Caps, Scrim, Tone-Rollen |
| **Stat-Pill** | 28 px, Pill, Rand Smaragd/20, Füllung Smaragd/4 %, Punkt 8 px, Text 12 px | fehlt |
| **Ticker-Strip** | 30 px Pill, black/25 + white/10, Gap 16, Werte Mono 12 px weiss, Einheiten fg-3, Teiler 1 × 12 px white/15 | fehlt |
| **Terminal** | Panel-Fläche, Mono 11/1.55, Kopf 36 px, Smaragd-Punkt, Prompt `radiox@live ~ tail -f`, Keys fg-4, Werte weiss | fehlt |
| **Button** | Radius 8 px (lg 12), Höhen 32/40/48, Padding 12/16/24, Schrift 12/14/16. Primär `#06B6D4` → Hover `#22D3EE` → Active `#0891B2`, schwarz 600, Glow interactive → hover. Sekundär white/10 → /20, Rand white/20 → /30. Ghost transparent, Hover white/10, Text white/70 → weiss. Outline Cyan. Danger: im Code `red-500`/20 → /30, Rand /30 → /50, Text red-400 (Button.tsx:69–74) – kanonisch **danger-Ton `#FB7185`** mit gleichen Stufen, weil Rot nur Live ist (E32). Übergang im Code `200ms` mit `ease-out` (= `cubic-bezier(0.22,1,0.36,1)` via @theme), kanonisch 250 ms (E10). Fokus im Code `ring-2` Offset 2 auf `#050505` (E22) | Atlas-Theme erzwingt Pill, Primär #22D3EE, Glow `0 0 24px -6px .55`, Höhen 36/32/40 |
| **Chip-Button** | 28 px Pill, Rand Ton/40, black/40, 12 px 600 Ton-100 | fehlt |
| **Icon-Button** | 32/40/48, Radius 8 (sm) / 12 | Radius anpassen |
| **Play-Orb** | Glas-Rezept 2.5 | Atlas: background/45, blur-md, saturate 150 → Rezept ersetzen |
| **Player-Bar** | Glas Bar, 70 px, Cover 44 px r4, Eyebrow 11/600/.16em, Titel 14/600, Waveform 3 px Balken r4, #67E8F9/40 bei 0.5, Pitch 7.5 px; Range Track 4 px white/20, Thumb 18 px weiss mit `0 0 8px rgba(255,255,255,.5)`; Eintritt miniBarEnter | Atlas MediaBar: background/80, blur-md, kein Schatten |
| **Header** | Glas Header, 56/64 px, Logo links, Tabs Mitte, Live-Pill + Konto rechts | Brand-Layer |
| **Nav-Tabs** | Padding 8/16, 12 px 700 Caps 0.16em, Icon 14 px; idle fg-3, Hover #E2E8F0; aktiv Text #A5F3FC auf Cyan/6 % + Indikator 2 px #22D3EE unten, inset-x 12, Glow line | Atlas Tabs: segmentiert bg-muted, Linie weiss → neue Variante `nav` |
| **Bottom-Nav** | Glas Mobile-Nav, Items 56 px, Icon 20 px, Label 11 px 700 Caps 0.16em, aktiv Oberbalken 2 px Cyan + `0 0 12px rgba(34,211,238,.7)` | Atlas: background/85, Satzschreibung |
| **Vote-Row** | 76 px, Padding 8/12, Gap 12, Radius 12, black/25 + white/10, Thumb 52 px r8 mit KI-Badge, Titel 14/600, Artist 12 fg-3, Zähler tabular, «Wählen» | fehlt (produktnah; nur als Rezept) |
| **Track-Row** | Container r12, white/10, white/3, Teiler white/5; Zeile 8/12, Thumb 32 px r4 | Atlas-List-Row anpassen |
| **Quellen-Karte** | r12, white/10, white/3, Hover white/20 + white/6 + Bild scale 1.03 (300 ms), Bild 16/10, Publisher-Badge weiss 24 px r6, Titel 14/600 | MediaCard-Overlays |
| **Fallback-Cover** | Verlauf 2.7, Wasserzeichen «RX» 80 px 900 white/6 unten rechts (−16/−24 px), Eyebrow im Code 9 px 700 0.22em white/65 → kanonisch 11 px 600 0.16em (E13), Initialen 20 px 900 −0.025em, Index Mono 9 px white/60 (GeneratedMiniCover.tsx:4–64) | fehlt |
| **Radar** | 4 Ringe, 6 Achsen, Gitter white/6; Primär Cyan 32 → 10 %, Strich .9 1.75 px, Punkte r3.5; Sekundär Pink 30 → 10 %, 2 px gestrichelt 4/3; Glow chart; Achsenlabels 11 px 600 Caps 0.1em fg-2 | fehlt (Chart-Preset) |
| **Eyebrow** | 11/1.3 600 Caps 0.16em fg-3 oder Ton; Quelltext in Satzschreibung | Atlas 12 px, 0.08em |
| **Inset** | r12, white/6, white/10 | Atlas r8, muted |
| **Leerzustand** | r16, white/10, white/3, Padding 64/24, Icon-Kreis 48 px Cyan/30 Rand Cyan/8 Füllung, Titel 18/700, Primär-Button | Radius 8 → 16 |
| **Avatar** | Kreis, Rand white/20, 20/28/40/48 px, Ring in Sprecherfarbe (ÆON Cyan) | Ring fehlt |
| **Fokus** | `outline: 2px solid #22D3EE`, Offset 2 px (3 px auf Glow-Elementen); in Fenstern `#67E8F9` Offset 3 px; auf Cyan-Füllung weiss | Farbe stimmt, Offsets ergänzen |
| **Hover** | Fläche +1 Weiss-Stufe, Rand 0.10 → 0.20 (Ton 0.30 → 0.50), Text fg-3 → #E2E8F0/weiss, Farbe 150 ms ease.fade, Struktur 250 ms ease.out | – |
| **Icons** | lucide, Strich 2, round caps/joins, currentColor, 12/14/16/18/20 px (Hero 24/28), aktiv Cyan-300/400, KI Violett | Regel fehlt |

---

## 7. Bildsprache & Logo

### 7.1 Wortmarke

«Radio» weiss `#FFFFFF` 600 + «X» 900 mit Verlauf `linear-gradient(145deg, #A5F3FC 12%, #22D3EE 45%, #A78BFA 80%)`, `background-clip: text`, Fallback `#67E8F9`, `drop-shadow(0 0 5px rgba(34,211,238,.25))`. Laufweite −0.05em (xs/sm −0.04em, Hero −0.06em), X mit 0.125 rem Abstand rechts. Immer ein Wort «RadioX». Schutzzone = Höhe des X. Belege: RadioXLogo.tsx:54–145, index.css:805–813, `imagery/header_wordmark_zoom.png`.

Nie: «Radio X» (Radio X Basel), «radiox» klein, flaches Cyan-X, reines Cyan-Verlaufs-X (Login-Altlast), Platte hinter der Marke auf Dunkel, helle/Teal-Fläche als Standard.

### 7.2 App-Icon

Raster-Master `rx-aurora-master.png` (1254 × 1254): Grund `#000000`, «R» `#FEFEFE`, «X» `#00FCFD → #01BFFC → #3E5FFB → #9725FC → #FB57FC → #FE79FC` mit weichem Glow, zwei unscharfe Aurora-Bänder (Farbton 180–270°). Maske 24 %. Nie nachzeichnen oder mit KI neu erzeugen. Das Pink des Icons bleibt Icon-Kunst und wird kein UI-Token.

### 7.3 Bilder

- **Covers:** scharfkantig (0 px), vom Container beschnitten. Thumbs ≤ 32 px r4, ≤ 56 px r8.
- **Text auf Bild:** immer ≥ 78 % Schwarz dahinter (Cover-Overlay) oder Scrim 0.70; weisser Text ≥ 7:1.
- **KI-Bilder:** redaktionelle/dokumentarische Fotografie, natürliches Licht, vollflächig, kein Rahmen, **niemals Text, Buchstaben, Logos, Wasserzeichen**. Keine Markenfärbung des Fotos (mittlere Sättigung 0.16–0.37) – Markenfarbe kommt aus Chrome und Aurora. Jedes KI-Bild trägt das «KI-GENERIERT»-Badge (EU AI Act Art. 50).
- **Fallback ohne Bild:** generiertes Mini-Cover (6 feste Paare, deterministisch per Titel-Hash).
- **Sprecher:** Kreis, Rand white/20, Ring in Akzentfarbe. ÆON-Porträt `speakers/aeon.png` (Obsidian-Glas, Bernstein-Augen) ist Persona-Bild, sein Orange wird kein Token.
- **Nicht als Markenbild:** Produktions-Covers mit realen Personen, Publisher-Logos (`/sources`), Tech-Logos (`/icons`), `og-default.png`, `favicon.svg` (Altlasten), rotes Staging-X.

---

## 8. Stimme & Sprache

- **Name:** «RadioX» (ein Wort). Persona: «ÆON» (Ligatur) auf jeder Oberfläche, «aeon» nur im Code. Rolle «KI-Moderator».
- **Sprache:** Deutsch (Schweiz), de-CH; «ss» statt Eszett; Zitate in «Guillemets». On-Air spricht ÆON Englisch, die Oberfläche bleibt Schweizerdeutsch. Feature-Markennamen nur dann englisch, wenn es keinen deutschen kanonischen Namen gibt.
- **Anrede:** «du» gegenüber Hörern, nie «Sie». Management-Decks: neutrale dritte Person.
- **Zonen-Wortschatz:** Was läuft · Du wählst · Läuft jetzt · Klang-DNA · Quellen. Zeitleiste: Jetzt · Gleich · Davor.
- **Live:** genau ein «● Live»; Zustände «Begrüssung», «Ansage», «Musik läuft», «Bereit», «pausiert». Muster «Subjekt · Zustand». Kein «On Air»/«Now Playing» für Hörer.
- **Hörer:** «1 hört zu» / «N hören zu», keine 0 als Zahl. Generisch «Hörer», keine Gender-Zeichen.
- **Headlines:** Satzschreibung, aussagend, keine Ausrufezeichen, ≤ 8 Wörter. Muster: Aussage + ruhige Beruhigung («Diese Seite gibt es nicht. Das Radio läuft trotzdem.»).
- **Fehler:** Ursache + was hilft, Rohtext hinter «Technische Details» (3 Fundstellen), Wiederholen-Aktion «Nochmal» (copy.ts:245) bzw. «Nochmal tippen?» (copy.ts:244).
- **Zeichen:** Meta « · », kurze Einschübe « – », lange Erklärungen « — », Herkunft « › », Ellipse « …» mit Leerzeichen, Bestätigung «✓».
- **Zahlen/Daten:** 83'276 · 0–100 · 85% · 15°C · 01:00 · 14.10. · «14.10. · 01:00» · vor 2 min · 14.10.2026.
- **Ehrlichkeit:** keine unbelegten Zahlen, kein «personalisierter Feed», kein «welcome back».
- **Emoji:** keine (Lucide-Icons stattdessen).
- **Claims:** «KI-Radio mit News und Musik» (`<title>` index.html:137 «RadioX – KI-Radio mit News und Musik»; Manifest «KI-Radio mit News und Musik rund um die Uhr») · «News & Musik · 24/7» · «KI-moderiertes Radio aus Zürich: News und Musik rund um die Uhr.» (index.html:202) · Meta «KI-moderierte News und Musik rund um die Uhr. Hör rein und stimm mit ab, was als Nächstes läuft.» · Signatur «RadioX · Zürich · {Jahr}» (AppShellFooter.tsx:107, Jahr dynamisch).
- **CTAs:** «Jetzt live hören», «Abspielen», «Wählen», «Teilen», «Nochmal».
- **Erzählung:** Ein Radio, das sich selbst sendet: liest die News, schreibt und spricht das Skript mit KI-Stimmen, wählt die Musik, Hörer bestimmen den Track danach, 24/7 aus Zürich, seit 14.–16.09.2026 rechnen Text, Sprache und Bilder auf der eigenen GPU-Fabric (ai.rapold.io); nur Embeddings laufen noch über das bezahlte Gateway (radiox README.md:44). Nicht «komplett» sagen.
- **Terminal-Idiom** (nur Tech-Slides): `radiox@live ~ tail -f`, `req/min · p50 · hörer`, Kleinbuchstaben, Mono.

---

## 9. Präsentationen (16:9)

Gilt für PPTX und `/praesentation?brand=radiox`. Jede Slide ist dunkel (#050505). Kein Light-Deck, kein Teal-Block, keine farbige Fusslinie.

**Gemeinsame Bausteine**
- **Karte:** roundRect Radius 16 px (0.423 cm / 0.167 in), Füllung Schwarz bei 25 % (PPTX-Transparenz 75) über dem Backdrop; auf flachem #050505 ohne Backdrop Weiss bei 3 % (Transparenz 97). Linie 0.75 pt Weiss, Transparenz 90. Kein Schatten, kein Blur.
- **Kartenkopf:** 44 px Band, 8 px Ton-Punkt, 16 pt Semibold weiss, 16 px seitlich.
- **Inset/Tile:** Radius 12 px, Weiss 6 % (Transparenz 94), Linie white/10.
- **Fenster-Panel** (max. 1 pro Deck): `#0F151D` bei 88 % (Transparenz 12), Linie `#E2F1FF` bei 18 %, obere Lichtkante Weiss 12 %, Radius 28 px, optional zwei weiche Ellipsen `#58DDD3` 13 % oben links und `#BC9CFA` 9 % unten rechts dahinter.
- **Glow:** Aussenschatten Cyan `#22D3EE`, Opazität 0.35, Blur 12 pt, Offset 0 – nur auf einem Primärelement pro Slide.
- **Badges:** Pill 20–24 px, 9.5–11 pt Semibold Caps +0.16, weiss auf Schwarz 70 %, Rand Ton 50 %.
- **Charts:** Serien `#22D3EE, #A78BFA, #34D399, #FBBF24, #F472B6`, Vorperiode `#94A3B8`, Gitter white/6, Achsen 9 pt `#94A3B8`, Datenlabels weiss, Legende `#CBD5E1`, Zahlenformat de-CH `#'##0`.
- **Übergänge:** Fade 0.25 s, Kapitel Fade 0.6 s, optional Morph 0.76 s; Builds Fade + 12 px hoch, 0.32 s, 0.09 s versetzt. Kein Zoom/Spin/Bounce.

**Cover**
1. Backdrop `aurora-cover.png` (Cyan oben links, Violett unten rechts, je 0.45, Fade nach Schwarz).
2. Wortmarke oben links (x 32, y 40, Höhe 28 px), ohne Platte.
3. Eyebrow y ≈ 300: «RADIOX · ZÜRICH · 2026», 11 pt Semibold, `#22D3EE`, +0.16.
4. Titel: Segoe UI Black 48 pt, weiss, −0.025, Zeilenabstand 0.92, max. 2 Zeilen, endet mit Punkt (Beispiel, kein Produkttext: «Ein Radio, das sich selbst sendet.»).
5. Untertitel 16 pt `#CBD5E1`: «News & Musik · 24/7 · Zürich».
6. Optional ein einziges «● LIVE»-Badge – das einzige Rot.
7. Kein Footer-Band.

**Kapitel-Trenner**
1. Backdrop `matrix-edges-aurora.png` (Aurora bei 70 % + X-Regen nur an den Rändern).
2. Wortmarke oben links (18 px).
3. Kapitelnummer Consolas 72 pt `#22D3EE` (oder Zonenton) bei x 32, y ≈ 220.
4. Titel Segoe UI Black 44 pt weiss darunter; Ton-Punkt 8 px + Eyebrow mit Zonenname.
5. Keine Karten.

**Inhalt**
1. Backdrop `wash-content.png` (Desktop-Wash).
2. Header-Band 0–56 (Schwarz 50 %, Linie white/10), Wortmarke links 18 px, rechts optional Meta-Pill.
3. Eyebrow 10 pt Semibold Caps im Zonenton + Titel 28 pt Bold weiss (68–104).
4. Karten auf 12-Spalten-Raster (116–648, Gap 16), Signatur 1 : 1.5 : 1.
5. Footer-Band 664–720 (Schwarz 85 %, Linie white/10): Quellenzeile 9 pt `#94A3B8` links («Quelle: … · Stand: 14.10.2026»), Seitenzahl Consolas 9 pt rechts.
6. KPI-Variante: Eyebrow 10 pt fg-3, Wert Consolas 36 pt in Rollenfarbe, Einheit 12 pt fg-3; nur die Hero-Kachel mit Glow.

**Statement / Zitat**: Backdrop `matrix-edges.png`, Zitat Segoe UI Bold 32 pt weiss in «Guillemets», Attribution «ÆON · KI-MODERATOR» als violettes Eyebrow.

**Foto**: Bild vollflächig, scharfkantig, Cover-Overlay unten, weisser Text mit 32 px Abstand, bei KI-Bild «KI-GENERIERT»-Badge oben rechts.

**Abschluss**
1. Backdrop `aurora-cover.png`.
2. Wortmarke zentriert, 40 px hoch.
3. CTA-Pill «Jetzt live hören», `#06B6D4`, schwarzer Text Semibold, Cyan-Glow.
4. «radiox.cloud/live» 14 pt `#CBD5E1`.
5. Signatur-Eyebrow «RadioX · Zürich · 2026» `#94A3B8`.

**Agenda** aus dem Produkt-Wortschatz (mit Ton-Punkten): Was läuft (neutral) · Du wählst (Smaragd) · Läuft jetzt (Cyan) · Klang-DNA (Pink) · Quellen (Amber). Für Management-Decks vorgeschlagene Ergänzungen, **kein** Produkt-Wortschatz: «Die GPU-Fabrik» (Cyan) · «Ehrlich gekennzeichnet» (Violett). Als Abschnitts-Tracker dient die Nav-Tab-Grammatik (aktiv `#A5F3FC` mit 2-px-Cyan-Linie).

**Verboten im Deck:** helle Flächen, Teal-/Grau-Kartenfüllungen, purple-500/blue-500-Aurora, Noise, farbige Schlagschatten ausser Cyan-Glow, mehrere Akzentfarben für eine Bedeutung, Emoji, «Illustrative Beispieldaten»-Platzhalter, Produktions-Covers mit realen Personen.

---

## 10. Abweichungen & Entscheide

| # | Befund in RadioX | Kanonischer Entscheid (Regel) |
|---|---|---|
| E1 | Tailwind-v4-Utilities rendern oklch (#00D3F3, #00B8DB, #FB2C36 …) neben den v3-Hex-Tokens | **Die @theme-Hex-Tokens gelten.** Atlas übernimmt nie v4-Renderings. |
| E2 | Header-Live-Pill: Cyan-Pill (Rand cyan/30, Füllung cyan/4 %) mit rotem Punkt nur wenn hörbar on air, sonst Cyan-Punkt (AppShellHeader.tsx:82–94); mobiles LIVE-Pill vollrot | **Live-Zustand ist nur Rot `#EF4444`** (Punkt oder Scrim-Badge). Ein Live-*Link* (Header-Pill) ist Interaktion und bleibt Cyan; sein Punkt ist rot, solange wirklich gesendet wird. Vollrote Flächen nirgends im Brand-Kanon. |
| E3 | AI = violet-400, aber purple-* 135× (Admin/Studio) | **Violett `#A78BFA` = KI.** Purple ist Produktlogik (Admin), kein Markenton. |
| E4 | «Du wählst»-Punkt violett, Footer smaragd; ÆON-Story-Button pink; News-Ringe pink | **Token-Bedeutung gewinnt:** Stimmen Smaragd, KI Violett, News-Chrome Amber. Radar: Cyan = Track, Pink = Nutzer (zulässig). |
| E5 | Flächen-Alpha-Wildwuchs (0.01 … 0.25 weiss, /20 … /90 schwarz), opake Slate-Flächen | **Einrasten auf Opazitäts-Skala 2.3.** 0.02 → surface-1 (0.03). Opak nur `#10161E` (Fenster). |
| E6 | Zwei Rand-Farben (Weiss vs. `rgba(226,241,255,…)`) | **Beide behalten, getrennt:** Weiss für Karten/Chrome, Blau-Weiss nur für Fenster. |
| E7 | Aurora-Paare: Logo #22D3EE/#A78BFA, Modal #58DDD3/#BC9CFA, Blob-Default fuchsia-600, OG violet-500, Cover-Fallback Grau | **Marken-Aurora = `#22D3EE` + `#A78BFA`** (Mittelton `#3B82F6` nur im Icon-Kontext). `#58DDD3`/`#BC9CFA` nur als Fensterlicht. Ohne Cover nie Grau. Hinweis: Im Code heissen `#58DDD3`/`#BC9CFA` «RadioX aurora defaults» (LiveBackgroundGlow.tsx:12); die SpeakerBlobs-Defaults sind cyan-500/fuchsia-600/blue-900, auf /live immer Cover-Farben. Das Paar `#22D3EE`/`#A78BFA` ist durch Logo-X, Station-Glow, Changelog-Hero und Panel-Radar belegt, als Hintergrund-Aurora aber ein Entscheid. Offen für Marcel (Q4). |
| E8 | > 15 Cyan-Glow-Kombinationen | **Vier Stufen:** rest 14/.25, interactive 20/.30, hover 30/.40, line 14/.70 (+ orb, chart). |
| E9 | Button-Radius 8 px vs. Pill-CTAs | **Buttons 8 px (lg 12), Pills nur für Chips/Badges.** Offen für Marcel (Q1). |
| E10 | Sechs Easings, Dauern 160–1400 ms | **ease.out + ease.ios, ease.fade nur für reine Fades;** Modal-Kurve (0.16,1,0.3,1) und Cover-Kurven falten in ease.out; Dauern 150/250/600 + morph 420 + scene 760. |
| E11 | Zwei Sans-Stacks (html vs. @theme) | **Ein Stack** (3.1), System zuerst, keine Webfont. |
| E12 | 900 trotz Regel «nur 500/600/700»; Atlas 800 | **900 nur für Logo-X und Display; 800 nie.** |
| E13 | Caps-Laufweite 0.1–0.4em, Grössen 7–10 px | **11 px / 600 / 0.16em für jedes Caps-Label;** Nav 12/700/0.16em. Keine 0.3em-Variante. Untergrenze 11 px. |
| E14 | Settings-H1 Caps + positive Laufweite + Glow | **Altlast.** H1 700 Satzschreibung. |
| E15 | Zahlformat en-US auf /changelog | **de-CH (1'742).** |
| E16 | Logo-X: Aurora / Cyan-Pulse (Login) / flach Cyan (OG, favicon.svg) | **Aurora 145deg überall.** |
| E17 | Radius-Wildwuchs (rounded-lg 214×, 24 px Team/Login) | **4/6/8/12/16/28/Pill** (4.1). 24 px entfällt. |
| E18 | Off-Grid-Abstände 6/10/20/28 px; Mobile-/live-Gutter 20 px | **4/8/12/16/24/32/48; Gutter 16 px.** |
| E19 | z-Index meist arbiträr (z-[100], z-[120]) | **40/45/50/60/70.** |
| E20 | Drei Bottom-Padding-Varianten | **`calc(var(--bottom-stack-h,5rem)+1rem)`.** |
| E21 | Header-Token 64 px, real 56 px unter lg | **56 / 64 px.** |
| E22 | Vier Fokus-Mechanismen, Nav-Tabs ohne Fokus | **Outline 2 px `#22D3EE`, Offset 2 (3 auf Glow), Fenster `#67E8F9`.** |
| E23 | Tote Keyframes (breathe, wave-ambient, timeline-pulse …), undefinierte `animate-in`/`animate-shimmer` | **Nicht übernehmen;** nur Breathing-Wert als Referenz. |
| E24 | Mehrfaches `animate-ping` | **Ein Ping pro Ansicht (LiveDot).** |
| E25 | Matrix auf Mobile durch direkte Mounts | **Matrix nur Desktop.** |
| E26 | «Music DNA» / «Klang-DNA», «Live Stream» / «Live-Stream», Eszett-Reste, «Radio X», vier Ellipsen-Stile, Strich-Mix | **Klang-DNA, Live-Stream, ss, RadioX, « …», « – » kurz / « — » lang.** |
| E27 | «personalisiertes Radio» im Footer | **«KI-Radio mit News und Musik, rund um die Uhr».** |
| E28 | Login fakt App-Icon mit grüner Kachel | **Grün ist nicht Marke;** RX-Aurora-Icon. |
| E29 | Empty-State 8 px | **16 px.** |
| E30 | Icon-Strichstärken 1/1.5/4 | **2.** |
| E31 | Neutraler Ton-Punkt: LivePanel `slate-400` (#94A3B8) vs. tone.ts `TONE_FILL.neutral` = fg-4 `#64748B` | **`#94A3B8` (fg-3)** für Punkte auf Panel-Köpfen; fg-4 bleibt Schrift ≥ 18 px/Deko. |
| E32 | Danger-Button in `red-500` (Button.tsx:69–74), Danger-Token aber rose `#FB7185` | **Danger = `#FB7185`** (Füllung 0.20 → 0.30, Rand 0.30 → 0.50, Text `#FB7185` → `#FDA4AF`). Rot nur Live. |
| E33 | PWA-Manifest `background_color: #0a0a0a`, `theme_color: #050505` (site.webmanifest) | **`#050505` überall** (Splash, theme-color, Slides). `#0A0A0A` nur im Lean-Back-Standbild. |
| E34 | BottomStack-Wrapper `bg-black` z 40 (BottomStack.tsx:109) unter der Glas-Bar (z laut Token 45) | **Bar visuell = deckendes Schwarz.** Für Decks: Footer-Band black 0.85 über Backdrop ist die Glas-Absicht; als Flach-Variante `#000000`. z-Token bleibt 45. |
| E35 | Desktop-Wash nutzt `purple-900/10` (PageLayout.tsx:142), Konto-Avatar `from-cyan-500/30 to-purple-500/30` (AppShellHeader.tsx:173) | **Wash bleibt wie gerendert** (Purple-900 bei 10 % ist Licht, kein Bedeutungsträger). Avatar-Verlauf → Cyan/Violett `#A78BFA` oder neutral; Purple sonst nur Admin (E3). |
| E36 | Changelog-Hero auf Englisch («Behind the broadcast.», «Every commit that shaped RadioX…», ChangelogView.tsx:587–597) | **Oberfläche de-CH.** Die Display-Grammatik (900, 0.95, Punkt am Ende) ist DNA, die englische Copy nicht. |
| E37 | Header-Variante `transparent` mit `blur(12px)` (AppShellHeader.tsx:304) neben Header-Glas 24 px | **Beide behalten:** solid = Standard, transparent nur auf Vollbild-Bühnen. Blur-Skala um 12 px «chip/stage-header» bereits abgedeckt. |
| E38 | Zwei Auswahl-Farben: `::selection rgba(34,211,238,.35)` (index.css:241) vs. PageLayout `selection:bg-brand-500/30` | **`rgba(34,211,238,0.35)`, Text weiss.** |
| E39 | Reduced Motion: global `0.01ms` für alles (index.css:834–841), lokal 160-ms-Fades (playerMorph.ts:61, index.css:433) | **Atlas: ein 160-ms-Opazitäts-Fade statt Animation**, keine Bewegung, Loops aus, Matrix als Standbild. Abweichung vom Produkt bewusst (kein «Springen»); offen für Marcel. |

**Nicht Design (Produktlogik, nicht übernehmen):** rotes Staging-X (`stg.*`), Purple-Admin-Zone, Rest-Modus-Timing, Cover-Palette-Heuristik im Detail, Audio-Hüllkurven-Mathematik, Car/TV-Erkennung, Publisher-Markenfarben, Show-spezifische Poster-Typo (Anton, Permanent Marker), Sprecher-Akzente aus der DB.

---

## 11. Quellen

### Code (Repo `marcelrapold/radiox`)
- `apps/frontend/index.css` – Token-Kommentar 5–27, @theme 28–118, body 127–130, html-Font 149–152, Auswahl 241–244, Scrollbar 255–311, miniBarEnter 311–320, Live-Szene 349–535, Cover-Sheen 466–480, Rest-Modus 554–580, Play-Orb 629–717, Cover scharf 757–760, Logo-Glitch + Aurora-X 769–814, Reduced Motion 819–842, Shell-Variablen 1040–1062, Range 1090–1140, Drive 1344–1432, Blobs 1461–1527 (Zeilen am 14.10.2026 geprüft)
- `apps/frontend/styles/modal.css` 1–311 · `components/AppShell/stationLogo.css` 1–62 · `components/MediaPlayer/BottomStack.tsx`:109 · `components/MediaPlayer/MobileBottomNav.tsx`:96 · `components/LivePlayer/LiveBackgroundGlow.tsx` · `views/ChangelogView.tsx`:575–597 · `api/og-live.tsx`:223–225 · `hooks/useCoverPalette.ts`
- `components/RadioXLogo.tsx` · `MatrixBackground.tsx` · `SpeakerBlobs.tsx` · `layout/PageLayout.tsx` · `layout/PageHeader.tsx` · `AppShell/AppShell.tsx` · `AppShell/AppShellHeader.tsx` · `AppShell/AppShellFooter.tsx` · `MobileBottomNav.tsx` · `BottomStack.tsx`
- `components/LivePlayer/`: `LivePanel.tsx`, `LiveDashboard.tsx`, `PersistentMiniBar.tsx`, `LiveDNASpider.tsx`, `LiveTerminal.tsx`, `LiveCoverImage.tsx`, `coverOverlay.ts`, `coverViewMotion.ts`, `playerMorph.ts`, `liveEnter.ts`, `LiveMobileNative.tsx`, `AiBadge.tsx`, `copy.ts`, `sourceBrand.ts`, `liveCoverTools.css`
- `components/ui/`: `Badge.tsx`, `Button.tsx`, `IconButton.tsx`, `Card.tsx`, `Inset.tsx`, `Eyebrow.tsx`, `LiveDot.tsx`, `tone.ts`, `focusRing.ts`, `GlassPlayButton.tsx`
- `components/MediaPlayer/GeneratedMiniCover.tsx`, `fullscreen/CoverAmbient.tsx` · `hooks/useCoverPalette.ts` · `utils/performanceTiers.ts` · `styles/performanceClasses.ts`
- `public/rx-aurora-master.png`, `public/speakers/aeon.png`, `public/site.webmanifest`, `index.html`
- `backend/services/telegram-bot-service/aeon_persona.md` · `backend/services/media-service/cover_variants.py`, `fabric_images.py` · `README.md` · `docs/operations/modal-design-audit-2026-10-05.md`
- Live-Bundle: `https://radiox.cloud/assets/index-DkEKQjMS.css`

### Screenshots und Messdaten
Basis: `pruefaufnahmen/radiox-dna\`
- `color\` – desktoplive.png, mobilelive.png, desktoplibrary.png, desktop_live_modal.png, atlas_praesentation_radiox.png, computed.json, computed-b.json
- `typography\` – desktop-live.png, desktop-changelog.png, desktop-shows.png, mobile-live.png, computed.json
- `motion\` – desktop_live.png, backdrop-only_live.png, desktop_changelog.png, desktop-reduced_changelog.png, matrix-crop.png, mobile_live.png, probe.json, probe3.json, dl\index-DkEKQjMS.css
- `components\` – el-header.png, el-panel-du.png, el-panel-dna.png, el-panel-quellen.png, el-cover.png, el-minibar.png, el-headerinfo.png, el-terminal.png, hover-login.png, focus-nav.png, focus-panel-max.png, dump-live-desktop.json, states.json
- `imagery\` – header_wordmark_zoom.png, playorb_zoom.png, login_wordmark_gradient.png, og_live_sample.png, ai_cover_contact_sheet.png, atlas_ref_cover-foto.png, atlas_ref_kapitel-trenner.png, crawl.json
- `voice\` – desktop__live.png, mobile__live.png, desktop__team.png, desktop__login.png, desktop__changelog.png, desktop__gibtsnicht.png, crawl.json
- `layout\` – desktop_live.png, wide_live.png, tablet_live.png, mobile_live.png, desktop_library.png, measurements.json, measurements2.json
- `deck-renderer\` – proto-libreoffice-1.png, proto.mjs (Machbarkeitsnachweis pptxgenjs + LibreOffice)
- `critic\` – desktop_live.png, mobile_live.png, desktop_library.png, mobile_library.png, desktop_root.png, mobile_root.png, probe.json, probe2.json, live.css (Gegenprüfung 14.10.2026: Header, Bar, Karten, Orb, Logo-X, Buttons, Matrix-Maske, Schriften)

### Atlas-Ist-Zustand (Gegenbelege)
- `packages/brands/src/radiox.json`, `brand.schema.json`, `presentation.mjs:6`, `slide-scene.mjs`, `project-scene.mjs`, `packages/presentation/src/render.mjs`
- `brands/radiox/theme.css`, `brands/radiox/README.md`
- `apps/docs/public/brands/radiox/reference/cover-foto.png`, `kapitel-trenner.png`, `kpi-board.png`
