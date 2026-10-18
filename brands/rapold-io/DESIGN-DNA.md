# rapold.io – Design-DNA der Dachmarke

**Status: Vorschlag, Freigabe durch Marcel Rapold ausstehend.** Stand 14.10.2026. Maschinenlesbare Werte: [`dna.json`](dna.json). Logo-Master: [`assets/logos/`](assets/logos/). Umsetzung in Atlas: [`implementation-plan.md`](implementation-plan.md).

Bis zur Freigabe gilt in `brands/rapold/sources/provenance.json` weiterhin `umbrellaSymbol: "none"`. Dieses Dokument ändert keine freigegebenen Werte der Brand `rapold`.

---

## 1. Kern und Prinzipien

**rapold.io ist das Dach über der Familie.** Unter ihm stehen elf Produkte mit eigenen Raumfalten-Signets und das Studio für Fullstack Digital Operations. Die Dachmarke ist «Der First»: ein R, das einmal um einen senkrechten Grat gefaltet ist. Oben bildet es ein Satteldach, und der Grat (der First) fängt das Licht.

| | |
|---|---|
| Claim | **Systeme, die laufen.** Übernommen aus der Stimme von rapold.io (`messages/de.json:20`) |
| Dach-Erzählung | **Alles unter einem Dach.** |
| Deskriptor | FULLSTACK DIGITAL OPERATIONS (`messages/de.json:4`) |
| Rückgrat | Build → Connect → Run |

Prinzipien:

1. **Weiterentwickeln, nicht ersetzen.** Die Dachmarke verwendet die freigegebene Raumfalten-Grammatik genau: 256er-Raster, 24 Einheiten Schutzraum, Iso-Steigung 1:0,5, ein Azure-Körper mit Ice-Facetten, ausgeschnittene Negative und die offene Fuge. Neben den zehn Signets wirkt sie als ihr Elternteil.
2. **Licht als Material.** Die Bühne ist Navy, Licht kommt als Azure-Bloom, als Glaskante oder als Firstlicht hinzu. Farbe wird nicht als Fläche verteilt.
3. **Ein warmer Funke.** Firstglut `#FFA36C` ist der einzige warme Ton im kalten Azure/Ice-Kosmos. Er gehört allein der Dachmarke und erscheint auf dem leuchtenden First und als ein Rautenpunkt pro Folie.
4. **Eine Schriftfamilie.** Geist und Geist Mono stehen unter OFL 1.1 und sind bereits gebündelt. Charakter entsteht aus Grösse und Kontrast, ohne zweite Schrift.
5. **Ruhig, präzise, ohne Show.** Die Grafik ist gross und einzeln gesetzt, die Typografie hart, die Metadaten in Mono. Es gibt keine Glitches, keinen Shimmer und keinen Regenbogen.

## 2. Markenarchitektur

**Modell: Branded House mit Endorsement.**

```
rapold.io                       Dachmarke · Studio «Fullstack Digital Operations»
├── AI Fabric · Argus · ÆON Learn · EdgePortal · Lotse
│   Cockpit · Auditor · Rapold Auth · PocketForge · Atlas
│                               Produkte: eigenes Raumfalten-Signet, Name in Geist 600
├── RadioX                      eigenständige Produktmarke (endorsed), eigener Look
└── marcel.rapold.io            Person/Gründer: Absender auf Cover und Schluss, keine Bildbasis
```

**Verhältnis zu den Raumfalten-Signets**

- Die Produkte behalten ihre freigegebenen Signets (`brands/rapold/assets/logos/*.svg`, Freigabe vom 12.10.2026) unverändert.
- Der First ist das einzige Zeichen der Familie, das einen Buchstaben bildet, und das einzige, das Licht trägt. Produkte erhalten nie Firstlicht und nie Firstglut. So bleibt der Unterschied zwischen Eltern und Kindern immer sichtbar.
- Endorsement unter dem Produktnamen: Signet und Name in Geist 600 (−0,03 em), darunter in Geist Mono 450 «EIN SYSTEM VON» und die kompakte Wortmarke.
- Domains heben den eigenen Teil hervor: **ai**.rapold.io, **learn**.rapold.io, **atlas**.rapold.io.

**Verhältnis zu RadioX**

RadioX (radiox.cloud, Brand `radiox` in Atlas) ist eine eigene Produktmarke mit eigener, freigegebener Bildwelt: Schwarz `#050505`, Cyan `#22D3EE`, Aurora, das Raster-Master des X-Icons und die Systemschrift. Das Dach überschreibt RadioX nicht.

- Die Raumfalten-Signets, Geist und Firstglut kommen im RadioX-Produkt nicht vor.
- rapold.io tritt bei RadioX nur als Absender auf, etwa im Footer «Ein System von rapold.io» oder als Folie in Portfolio-Decks.
- Auf rapold.io-Folien erscheint RadioX mit seinem eigenen Logo als Bild in einer neutralen Panel-Karte und wird nie umgefärbt.

## 3. Zeichen und Wortmarke

### 3.1 Konstruktion «Der First»

Die Konstruktion ist reproduzierbar mit `brands/rapold-io/sources/build.py`.

1. **Flaches R** in (u, v), v nach oben:
   - Aussenform (0,0) (44,0) (44,72) (160,72) (160,168) (0,168)
   - Punze (44,104)–(118,134)
   - Freies Bein (86,58) (138,58) (176,0) (124,0), mit offener Fuge von 14 Einheiten zum Bauch
2. **Faltung** am Grat u = 80 (Sutherland-Hodgman-Schnitt). Steigung 1:0,5 wie `isoP` in `scripts/build-signet-proposals.mjs`.
   - links: (u, −v − 0,5u), die steigende Ebene in Azure
   - rechts: (u, −v − 40 + 0,5(u − 80)), die fallende Ebene in Ice
3. **Einpassen** ins 256er-Raster mit 24 Einheiten Schutzraum: Skala 0,962963 und Versatz (43,259; 224,296). Die Tintenbox ist x 43,259–212,741 und y 24–232. Der Grat liegt bei x = 120,296.
4. **Pfade:** ein evenodd-Pfad als Körper (`data-part="body"`) und ein evenodd-Pfad als Facette (`data-part="facet"`). Es gibt keine Schrift und keine Kurven, wie bei allen Signets.

Lesart: Oben steht ein Satteldach (der First). Die Punze wird zum Hausfenster, also zum Dach-Motiv, und bleibt bis 16 px lesbar. Das freie Bein ist die offene Fuge der Familie.

### 3.2 Varianten (Dateien)

| Datei | Körper | Facette | Fläche |
|---|---|---|---|
| `mark-dark.svg` | Azure `#009DFF` | Ice `#A8EDFF` | Navy `#050B19` |
| `mark-light.svg` | `#0066B3` | `#2B89B5` | Ice Paper `#F4FAFF` |
| `mark-mono-white.svg` | `#FFFFFF` | `#FFFFFF` | beliebig dunkel |
| `mark-mono-black.svg` | `#000000` | `#000000` | beliebig hell |

**Monochrom mit First-Fuge.** In der einfarbigen Fassung ist der Grat als Luft ausgespart: 6 Einheiten aus der fallenden Ebene. Die Regel lautet: In Farbe liegt auf dem First Licht, einfarbig liegt dort Luft. Damit bleibt die Faltung ohne zweite Farbe lesbar, und Stempel, Gravur und Fax funktionieren. Unter 32 px schliesst sich die Fuge optisch, und das Zeichen bleibt ein klares R.

**Firstlicht** existiert nur als gerendertes Licht in Supergrafiken, nicht in Logo-Dateien (siehe 5.3). Die Firstglut-Kante des Konzepts las sich unter etwa 200 px wie ein Passerfehler und wurde deshalb aus den Logos entfernt.

### 3.3 Wortmarke

- «rapold.io» in Geist 600 (variabel instanziert), Laufweite −0,045 em, GPOS-Kerning, als Pfade.
- Der Punkt ist die **45°-Raute** der Familie, dieselbe Form wie die Pupille von Argus und die Ortsmarke von Atlas. Sie steht auf der Grundlinie, mit einer Halbdiagonale von 0,078 em und je 0,05 em Luft.
- Farben dunkel: «rapold» Ink `#EDF5FF`, Raute und «io» Azure `#009DFF`. Farben hell: `#10253D`, Raute und «io» `#0066B3`.
- Dateien: `wordmark-dark.svg` und `wordmark-light.svg`, transparent, Ränder von 16 px bei einer Schriftgrösse von 100.

### 3.4 Lockup

`lockup-horizontal-dark.svg` und `lockup-horizontal-light.svg` (Master 529 × 156, Wortmarke 92 px) sind optisch verriegelt:

- Die Oberkante des Zeichens liegt auf der Oberlänge des «l», die Unterkante auf der Grundlinie des Deskriptors.
- Der Abstand zwischen Zeichen und Wortmarke beträgt 0,40 em. Der Deskriptor beginnt am Stamm des «r».
- Deskriptor «FULLSTACK DIGITAL OPERATIONS»: Geist Mono 450, 0,163 em, Laufweite 0,2 em. Farbe `#9AADC7` auf dunkel, `#46617E` auf hell.

**Kompakter Lockup** für Header und Footer, ohne Deskriptor: Die Zeichenhöhe beträgt 1,32 × die Oberlänge, der Abstand 0,34 em.

### 3.5 Schutzraum und Mindestgrössen

| Element | Schutzraum | Minimum |
|---|---|---|
| Zeichen | 24/256 der Kantenlänge (im Master enthalten) | 16 px Bildschirm, 6 mm Druck |
| Wortmarke | Höhe der Raute auf allen Seiten | 14 px Schriftgrösse |
| Lockup mit Deskriptor | Höhe des «r» | 240 px Breite |
| Kompakter Lockup | Höhe des «r» | 96 px Breite |
| Firstlicht (Supergrafik) | – | Zeichenhöhe ab 400 px |

Die Prüfung lief auf einer Navy- und einer Paper-Fläche bei 16, 24, 32, 48, 64 und 96 px (`brands/rapold-io/sources/check-sizes.webp`). Das R ist ab 16 px lesbar, und das Fenster bleibt ab 24 px offen. Ein eigener Pixel-Hint für 16 px ist noch offen (siehe Entscheide).

## 4. Farbe

### 4.1 Werte

| Name | Hex | Rolle |
|---|---|---|
| Navy | `#050B19` | Bühne für Cover, Kapitel, Schluss und Web dunkel |
| Abyss | `#02060F` | Tiefe: unteres Ende des Bodenverlaufs |
| Panel | `#0B1528` | Karten auf dunkel (Panel 2 `#142741`, Linie `#23334A`) |
| Azure | `#009DFF` | Markenfarbe: steigende Ebene, «.io», zweite Titelzeile |
| Ice | `#A8EDFF` | fallende Ebene, Mono-Eyebrows dunkel, Glaskante |
| Sky | `#38B8FF` | Interaktion dunkel (rapold dark.primary) |
| **Firstglut** | `#FFA36C` | das Licht auf dem First und ein Rautenpunkt pro Folie |
| Firstglut-Kern | `#FFE2CC` | heller Kern der Gratlinie |
| Firstglut Light | `#B4511A` | Rautenpunkt auf Ice Paper |
| Ink | `#EDF5FF` | Titel und Wortmarke auf dunkel |
| Muted | `#9AADC7` | Lead und Metadaten auf dunkel |
| Ice Paper | `#F4FAFF` | helle Bühne |
| Deep Azure | `#0066B3` | Primärfarbe hell, Heldenzahlen, Akzentlinie |
| Light Facet | `#2B89B5` | fallende Ebene hell, nur Grafik |
| Ink Light | `#10253D` | Titel hell |
| Muted Light | `#46617E` | Lead und Mono hell |
| Line Light | `#CDDEEE` | Haarlinien und Kartenränder hell |

Diagramme: dunkel Azure, Ice, `#597DFF` und `#42D6EC`; hell `#0066B3`, `#2B89B5`, `#46617E` und `#10253D`. Firstglut kommt nur als einzelner Highlight-Wert vor.

### 4.2 Kontrast (WCAG, berechnet)

| Paar | Verhältnis | Einsatz |
|---|---|---|
| Ink / Navy | 17,88:1 | Titel |
| Muted / Navy | 8,59:1 | Lead und Metadaten |
| Ice / Navy | 15,18:1 | Eyebrows |
| Azure / Navy | 6,80:1 | zweite Titelzeile, «.io» |
| Firstglut / Navy | 10,02:1 | Rautenpunkt |
| Ink Light / Paper | 14,74:1 | Titel hell |
| Muted Light / Paper | 6,10:1 | Lead hell |
| Deep Azure / Paper | 5,62:1 | Breadcrumb und Zahlen |
| Firstglut Light / Paper | 4,83:1 | Rautenpunkt hell |
| Light Facet / Paper | 3,73:1 | **nur Grafik** |
| Weiss / Azure | 2,89:1 | **verboten für Text** |

### 4.3 Licht- und Glas-Rezepte

- **Boden:** `linear-gradient(180deg, #050B19, #02060F)`.
- **Azure-Bloom:** radial 62 % bei 74 % / 34 % (Cover), 26 % / 40 % (Kapitel) oder 50 % / 36 % (Schluss). Azure mit 0,30 im Zentrum, 0,07 bei 45 % und 0 am Rand.
- **Warmer Apex-Halo:** radial mit r 18 % über dem First, `#FFA36C` mit 0,24 bis 0.
- **Isoraster:** Linien mit Steigung ±0,5, Schritt 56 px, Ice mit 0,055, Radialmaske.
- **Körnung:** feTurbulence fractalNoise mit baseFrequency 0,9, 2 Oktaven, seed 1909, Weiss mit Alpha 0,035.
- **Glas-Zeichen (Supergrafik):**
  - linke Ebene `#2FB1FF → #009DFF (55 %) → #003E86`
  - rechte Ebene `#E6FAFF → #A8EDFF (50 %) → #3D7FA6`
  - Kante 1,5 px Ice mit 0,45
- **Firstlicht** auf beiden Gratsegmenten:
  - Halo: 24 px `#FFA36C` mit 0,55, Blur 16
  - Glut: 8 px `#FFA36C`, Blur 3
  - Kern: 2 px `#FFE2CC`
  - Ein Filter auf einer senkrechten Linie braucht `filterUnits="userSpaceOnUse"`, sonst ist die Filterregion 0 breit und das Licht fehlt.
- **Glaskarte dunkel:** `#0B1528` mit 70 %, backdrop-blur 24 px, 1 px Weiss mit 10 %, Radius 16, kein Schatten. In PPTX: 30 % Transparenz und 0,75 pt Rand mit 90 % Transparenz.

## 5. Typografie

### 5.1 Familie

- **Geist** und **Geist Mono**: SIL OFL 1.1, fsType 0, kein Reserved Font Name. Die Dateien liegen in `brands/rapold/assets/fonts/`.
- **Inter** (OFL) dient nur als Fallback.
- **Ausgemustert für die Dachmarke:** Fraunces, Inter Tight und JetBrains Mono vom heutigen rapold.io.

### 5.2 Skala (Folie 1600 × 900 px, 1 px = 0,6 pt)

| Rolle | Schnitt | px | pt | Laufweite |
|---|---|---|---|---|
| Cover-Display | Geist 600 | 136 | 81,6 | −0,05 em |
| Kapiteltitel | Geist 600 | 84 | 50,4 | −0,045 em |
| Kapitelziffer | Geist 250, Kontur 1,5 px Ice mit 55 % | 360 | 216 | −0,05 em |
| Schluss-Aussage | Geist 600 | 72 | 43,2 | −0,045 em |
| Inhaltstitel | Geist 600 | 56 | 33,6 | −0,035 em |
| Heldenzahl | Geist 600 (Einheit 500 / 64 px) | 184 | 110,4 | −0,055 em |
| Lead Cover / Inhalt | Geist 400 | 26 / 22 | 15,6 / 13,2 | −0,01 em |
| Datenlabel | Geist 600 | 24 | 14,4 | −0,02 em |
| Eyebrow | Geist Mono 450, Versalien | 15 | 9 | 0,24 em |
| Metadaten (Untergrenze) | Geist Mono 450, Versalien | 14 | 8,4 | 0,20 em |

Im Web: Display `clamp(56px, 8vw, 128px)`, H1 `clamp(40px, 5vw, 72px)`, Fliesstext 17 px / 1,6, Mono 12 px / 0,2 em.

Regeln:

- Pro Folie höchstens zwei Schnitte der Geist, dazu Mono.
- Zahlen im Schweizer Format: 4'207, 99,97 % (mit schmalem Leerzeichen), echtes Minus U+2212.

### 5.3 Der Rautenpunkt

Der Schlusspunkt der Hauptaussage einer Folie ist die 45°-Raute (Halbdiagonale 0,087 em). Auf dunkel ist sie Firstglut `#FFA36C`, auf hell `#B4511A`. Es gibt genau einen Rautenpunkt pro Folie: im Cover- oder Schlusstitel, im Aktionstitel oder als Azure-Punkt hinter der Kapitelziffer. Diese Idee ist aus «Faltpunkt» übernommen, dort mit gefaltetem Quadrat. Hier ist sie mit der Familienraute gelöst, damit es nur eine Punktform gibt.

### 5.4 PPTX

- Theme-Schriften: Major und Minor Geist, Mono Geist Mono.
- Eingebettet werden statische TTF-Instanzen: Geist Regular, Medium und SemiBold sowie Geist Mono Regular und Medium. PowerPoint kann variable WOFF2-Dateien nicht einbetten.
- Logos werden als SVG mit PNG-Fallback (2×) gesetzt, nie als Live-Text. Das ersetzt das heutige «Rapold» in 11 pt.

## 6. Raster

- **Folie:** 1600 × 900 px, Rand 112 px (0,933 in), 12 Spalten, Gutter 24 px.
  - Inhaltsbereich y 300–760
  - Fusslinie y 808, Fuss-Grundlinie y 850
  - Fuss-Kontext ab x 420
- **Web:** Container 1200 px, Gutter 24 px (mobil 16 px), Sektionsabstand 96 px (mobil 64 px). Basisraster 8 px mit den Schritten 4, 8, 12, 16, 24, 32, 48, 64, 96 und 112.
- **Radien:** Bedienelemente 8 px, Karten 16 px, App-Icon 56/256. Die gefaltete Kartenecke hat 0 px.

## 7. Bewegung und Hintergründe

- **Logo-Reveal «Falten»:** Das flache R faltet sich um den Grat, die rechte Seite fällt in 900 ms mit `cubic-bezier(0.2, 0.7, 0.2, 1)`. Danach zündet der First: Die Firstglut-Linie wächst in 240 ms von 0 auf 1, mit einem 10-px-Glow-Puls.
- **Ambient:** Die Bloom-Drift dauert 70 s, das Raster atmet über 24 s (Opazität 0,04 bis 0,07), der Apex-Halo über 12 s (0,12 bis 0,22). Alles läuft über eine gemeinsame Token-Komponente, nicht als Kopie pro Seite.
- **UI:** Übergänge 180 ms, Karten steigen 12 px. Beim Hover über ein Produktsignet erscheint eine 1-px-Firstglut-Haarlinie an der gefalteten Ecke.
- **Verboten:** Glitch, RGB-Split, Shimmer und alles über 3 Hz. Ambient pausiert in verborgenen Tabs. Parallax gibt es nur bei feinem Zeiger und mit höchstens 12 px.
- **prefers-reduced-motion:** statischer Endzustand. Das Zeichen ist gefaltet, der First leuchtet, und es gibt keine Ambient-Bewegung.
- **Statische Folien-Fassung:** Jeder Hintergrund wird einmal als Platte (3200 × 1800 PNG) gerendert: Boden, Bloom, Halo, Raster, Glas-Zeichen mit Firstlicht, Schleier und Körnung. Text bleibt live. Übergänge: Fade 0,3 s, Cover → Kapitel als Morph 0,9 s (die Supergrafik wandert von Skala 4,0 rechts nach Skala 3,2 links), Aufbau mit Fade und 8 % Einflug.

## 8. Präsentationen

Die Muster sind gerendert und geprüft: `brands/rapold-io/sources/deck-cover|section|content|closing.webp`. Alle Masse gelten auf 1600 × 900.

### Cover

1. Platte `cover-dark.png`:
   - Boden, Azure-Bloom 74 % / 34 % und warmer Halo über dem Apex
   - Isoraster
   - Glas-First mit Skala 4,0 bei x 905 / y −40, 830 px hoch, oben und rechts angeschnitten, mit leuchtendem Grat
   - Boden-Ausblendung ab 62 % Höhe, damit die Fusszeile frei bleibt
   - Schleier von links (92 % → 0 bei 70 %) und Körnung
2. Oben links der kompakte Lockup (Wortmarke 30 px, Grundlinie 112). Rechts davon eine Haarlinie und in Mono 14 px «MANAGEMENT REVIEW · Q4 2026».
3. Eyebrow y 333: Ice-Raute und Mono 15 px Ice «RAPOLD.IO / PRODUKTE & BETRIEB / 2026».
4. Titel Geist 600, 136 px: «Systeme,» in Ink (Grundlinie 476) und «die laufen» in Azure (Grundlinie 618), dazu der Firstglut-Rautenpunkt.
5. Lead 26 px Muted (Grundlinie 692), höchstens 900 px breit.
6. Familienleiste: Haarlinie y 776, die freigegebenen Signets à 40 px (derzeit elf), rechts in Mono «MARCEL RAPOLD · FOUNDER · DATUM».

### Kapitel

1. Platte `section-dark.png`: Bloom 26 % / 40 %, Glas-First mit Skala 3,2 links angeschnitten, Schleier nach rechts.
2. Konturziffer «02» (Geist 250, 360 px) ab x 820, Grundlinie 470, mit Azure-Rautenpunkt.
3. Eyebrow mit Firstglut-Raute: «KAPITEL 02 / BETRIEB».
4. Titel 84 px, zweizeilig in Ink und Azure.
5. Fuss in Mono mit den Produkten des Kapitels und der Seitenzahl.

### Inhalt (hell)

1. Ice Paper mit Azure-Bloom oben rechts (10 %) und einer Eckfacette in `#0066B3` mit 6 %.
2. Breadcrumb in Mono, Deep Azure: «02.3 / BETRIEB / VERFÜGBARKEIT».
3. Aktionstitel als ganzer Satz, 56 px, mit Rautenpunkt in `#B4511A`. Darunter der Lead mit 22 px.
4. Eine Heldenzahl pro Folie in einer weissen Karte: Radius 16, Rand `#CDDEEE`, gefaltete Ecke unten links, Zahl 184 px in Deep Azure, Quelle in Mono.
5. Balken mit Facettenschnitt 1:0,5 an der Oberkante, 3-px-Lichtkante in Ice und Verlauf Azure → Deep Azure. Beispieldaten sind als «BEISPIELDATEN» markiert.
6. Fuss:
   - Haarlinie y 808 mit einem 96-px-Akzent in `#0066B3`
   - kompakter Lockup hell (22 px)
   - Mono-Kontext und Seitenzahl

### Schluss

1. Platte `closing-dark.png`: Glas-First zentriert (Skala 1,55) mit vollem Firstlicht, Bloom und Halo darüber.
2. «Gebaut. Betrieben.» in Ink und «Unter einem Dach» in Azure, 72 px, zentriert, mit Firstglut-Rautenpunkt.
3. Kompakter Lockup und darunter in Mono «MARCEL@RAPOLD.IO · RAPOLD.IO · MARCEL.RAPOLD.IO».
4. Haarlinie und die freigegebenen Signets zentriert, die Familie unter dem Dach.

Lesbarkeit: Jeder Text liegt auf ruhiger Fläche (Schleier, Ausblendung), alle Textpaare erreichen AA (siehe 4.2), Metadaten sind mindestens 8,4 pt gross.

## 9. Do und Don't

**Do**

- Den First als einziges Zeichen mit Licht einsetzen.
- Den Rautenpunkt genau einmal pro Folie verwenden.
- Navy als Bühne für Cover, Kapitel und Schluss nutzen, Ice Paper für Inhalt.
- Signets in Originalform und Originalfarbe setzen.
- Zahlen im Schweizer Format schreiben.
- Platten für Licht verwenden und den Text live halten.

**Don't**

- Firstglut als Fläche, für Produkte, in Fliesstext oder für mehr als einen Punkt pro Folie verwenden.
- Firstglut-Kanten in Logo-Dateien setzen.
- Das Zeichen drehen, spiegeln, entfalten, konturieren oder mit Schatten versehen.
- Violett oder Spektrum für die Dachmarke einsetzen.
- Fraunces, Inter Tight oder JetBrains Mono verwenden.
- Weisse Schrift auf Azure setzen.
- «Rapold» als 11-pt-Text statt des Logos verwenden.
- Ein Produkt mit dem First ausstatten.
- RadioX umfärben.
- Glitch- oder Shimmer-Effekte einsetzen.

## 10. Entscheide

**Jury** (Creative Director, Markenstrategie, Design-Systems-Engineering; Skala 0–10):

| Konzept | Distinktion | Kohärenz | Skalierung | Deck | Atlas | Total |
|---|---|---|---|---|---|---|
| **fold «Der First»** | 9 | 9 | 8 | 9 | 8 | **43** |
| light «Lichtfalte» | 8 | 8 | 9 | 9 | 7 | 41 |
| type «Faltpunkt» | 6 | 6 | 8 | 7 | 9 | 36 |

**Begründung**

- **Der First** ist eindeutig ein R und damit eindeutig Rapold. Das Zeichen trägt eine Geschichte für Management-Decks (Dach, Fenster, First) und ist geometrisch ein Kind derselben Faltregel wie die Signets.
- **Die Lichtfalte** hat die stärkste Lichtinszenierung und skaliert am besten. Ihr «r.» liest sich aber auch als Γ oder Fahne, und das Spektrum mit Violett driftet Richtung generischer KI-Ästhetik. Glas und Spektrum verlangen zudem Rasterplatten.
- **Der Faltpunkt** ist elegant und am leichtesten umzusetzen. Sein Monogramm nutzt aber ein rundes Geist-«r» und keine Faltgeometrie, die geknickte Ecke wirkt weiterhin wie ein Dokument-Icon, und dem Konzept fehlt die verlangte «Fancyness».

**Übernommen (Grafts)**

- Aus **light**: Glaskante 1,5 px, Körnung (seed 1909), Fussgrammatik (Haarlinie y 808, Lockup links, Kontext x 420, Seite rechts), Breadcrumb in Mono, Heldenzahl-Karte, Balken mit 1:0,5-Facettenschnitt und Ice-Lichtkante, Rand 112 px, Morph von Cover zu Kapitel, der Claim «Systeme, die laufen.», marcel.rapold.io als Absender.
- Aus **type**: Schlusspunkt als Markenpunkt (hier als Raute), Endorsement «EIN SYSTEM VON rapold.io», Ziffer mit Punkt auf Kapitelfolien, Schluss mit Wortmarke als Absender, Build → Connect → Run, höchstens zwei Schnitte pro Folie, Mono-Untergrenze.

**Verworfen**

- Firstglut-Kante in den Logo-Dateien.
- Mono mit 62 % Deckkraft, ersetzt durch die First-Fuge.
- Violett und Spektrum.
- Gefaltetes Quadrat als zweite Punktform.

**Offen**

- Freigabe des Zeichens durch Marcel Rapold.
- Pixel-Hint für 16 px (Favicon).
- Marken- und Ähnlichkeitsrecherche für das R-Zeichen.
- Umsetzung in Atlas (siehe `implementation-plan.md`).
- `npm run check` wurde nicht ausgeführt, weil kein Repository-Code geändert wurde.
