# Rapold · Designvertrag

Version des Adapters: **0.2.0**. Status: **draft**. Ausgangspaket: **rapold.io Brand System 1.0.0**. Nutzerfreigabe der vier ursprünglichen Produktsignets am **11.10.2026** und der sechs mit 0.7.0 ergänzten am **12.10.2026**.

## 1. Zuständigkeit

`packages/brands/src/rapold.json` ist die kanonische Framework-Ableitung. Sie ergänzt genau einen optionalen Registry-Eintrag. Die elf Produktzeichen werden separat in `brands/rapold/identity.json` und `brands/rapold/assets/logos/` verwaltet. Diese Grenze gilt auch für neue Anwendungen, Präsentationen und Exporte.

Die Marke wird ausdrücklich ausgewählt. Ohne Auswahl gilt die neutrale Basis. Ein fehlendes Rapold-Dachsymbol wird weder erfunden noch durch eines der Produktzeichen ersetzt. Der Adapter setzt deshalb kein `assets.logo` und verlangt kein Logo auf einer allgemeinen Rapold-Titelfolie.

## 2. Freigabe und Quellen

Die Freigabe betrifft die Formfamilie und die elf SVG-Signets ohne sichtbare Schrift. Die vollständige semantische UI-Zuordnung, abgeleitete Hover- und Statuswerte sowie die Funktionskonturen sind dokumentierte Verfeinerungen. Dafür bleibt `status: draft` gesetzt.

Die unveränderte Tokenquelle liegt unter `sources/brand-tokens.json`. `sources/provenance.json` dokumentiert Datum, Freigabeumfang, SHA-256-Prüfsumme, direkte Rollenabbildungen und jede Farbableitung. Öffentliche Contract-Exporte führen diese Dateien als `brand-tokens.json` und `provenance.json` im jeweiligen Brand-Verzeichnis.

## 3. Identitätspalette

| Palette-Key | Wert | Aufgabe |
|---|---|---|
| `azure` | `#009DFF` | Blaue Hauptfläche der Signets |
| `ice` | `#A8EDFF` | Helle Faltfläche der Signets |
| `violet` | `#7C5CFF` | Ergänzende Identitätsfarbe aus dem Quellpaket |
| `navy` | `#050B19` | Dunkle Markenfläche |
| `paper` | `#F4FAFF` | Helle Markenfläche |
| `logo-light-primary` | `#0066B3` | Hauptfläche der Signets auf hellen Flächen |
| `logo-light-facet` | `#2B89B5` | Zweite Signetfläche auf hellen Flächen |

Die Werte werden unverändert als `--brand-color-*`, als `palette` im Token-JSON und im DTCG-Paletteblock veröffentlicht. Sie sind keine automatische Zuordnung zu Text, Buttons, Charts oder Statusmeldungen. Der separate Produktkatalog benötigt nur seine sechs Signet- und Exportfarben; Violet fügt dort keine neue Zeichenfläche hinzu.

## 4. Semantische UI-Rollen

Die Tokenquelle belegt beide Modi. `canvas`, `surface`, `raised`, `text`, `muted`, `accent`, `accentInk` und `line` werden auf die vollständigen Framework-Rollen abgebildet.

| Quellenrolle | Framework-Rollen |
|---|---|
| `canvas` | `background` |
| `surface` | `card`; im hellen Modus auch `popover` |
| `raised` | `secondary`, `muted`, `accent`; im dunklen Modus auch `popover` |
| `text` | `foreground`, `card-foreground`, `popover-foreground`, `secondary-foreground`, `accent-foreground` |
| `muted` | `muted-foreground` |
| `accent` | `primary`, `ring` |
| `accentInk` | `primary-foreground`, `primary-hover-foreground` |
| `line` | `border` als dekorative Linie |

Die Bezeichnung `accent` im Quellpaket meint die kräftige Aktionsfarbe. Im Framework bezeichnet die semantische Rolle `accent` dagegen eine zurückhaltende Interaktionsfläche. Deshalb wird die Quell-Aktionsfarbe auf `primary` und `ring` abgebildet; `accent` erhält die jeweilige `raised`-Fläche.

### Dokumentierte Farbableitungen

Die Mischungen erfolgen pro sRGB-Kanal mit Rundung auf den nächsten ganzzahligen Kanalwert. Sie sind eine reproduzierbare Adapterentscheidung und keine neue Aussage über die freigegebenen Logo-Farben.

| Rolle | Wert | Ableitung aus den Quellen |
|---|---|---|
| `light.primary-hover` | `#03599B` | 80 % `light.accent` + 20 % `light.text` |
| `dark.primary-hover` | `#54C5FF` | 75 % `dark.accent` + 25 % `brand.ice` |
| `light.input` | `#6F87A0` | 30 % `light.line` + 70 % `light.muted` |
| `dark.input` | `#5F7089` | 50 % `dark.line` + 50 % `dark.muted` |
| `light.success` | `#217969` | 48 % `semantic.success` + 52 % `light.text` |
| `light.warning` | `#816F31` | 48 % `semantic.warning` + 52 % `light.text` |
| `light.destructive` | `#814960` | 48 % `semantic.danger` + 52 % `light.text` |

Die drei hellen Statusrollen erhalten weisse Vordergrundschrift. Im dunklen Modus bleiben die Quell-Statusfarben `#34D399`, `#FBBF24` und `#FB7185` erhalten; ihre Vordergrundschrift verwendet `dark.accentInk`, also `#04101D`.

### Kontrastvertrag

- Reguläre Textpaare: mindestens 4,5:1.
- Fokus und funktionale Eingabekontur: mindestens 3:1 gegen `background` und `card`.
- Farbige Statusschrift: mindestens 4,5:1 auf `background` und `card`.
- `border` bleibt dekorativ. Für die Erkennbarkeit eines Eingabefelds wird `input` verwendet.

Azure mit Weiss liegt bei 2,89:1 und wird deshalb nicht für kleine weisse Aktionsbeschriftungen übernommen. `light.primary` mit Weiss erreicht 5,91:1; `dark.primary` mit seiner dunklen Schrift erreicht 8,63:1. Die abgeleiteten Eingabekonturen erreichen mindestens 3,53:1. Kontrastmessungen erfolgen auf den definierten opaken Farbwerten; Transparenz, Bilder oder zusätzliche Overlays verlangen eine Prüfung am tatsächlichen Hintergrund.

Statusmeldungen erhalten zusätzlich Text oder ein verständliches Symbol. Animation, Hover und Farbe dürfen die einzige Information nicht ersetzen.

## 5. Typografie

| Verwendung | Familie | Gewicht / Quellenwert |
|---|---|---|
| Fliesstext und Bedienung | Geist | 400 |
| UI-Überschriften | Geist | 650 |
| Separate Wortmarke | Geist | 700; keine sichtbare Schrift in den Signet-SVGs |
| Code, IDs, tabellarische Daten | Geist Mono | 400 |

Die variablen Fontdateien liegen unter `assets/fonts/Geist-Variable.woff2` und `assets/fonts/GeistMono-Variable.woff2`. `OFL.txt`, `LICENSE.txt`, `AUTHORS.txt` und `validation.json` werden im selben Verzeichnis mitgeführt. Die App lädt die Dateien und bindet sie im Rapold-Scope ein. Das Core-Paket bleibt frei von Rapold- oder Geist-Bindungen.

Die bestehende generische Typografie-Schnittstelle genügt: `family`, `bodyFamily`, `headingFamily` sowie Gewichte. Geist Mono wird über `--font-mono` im konsumierenden App-Adapter gesetzt. Es gibt keine zusätzliche Schema-Eigenschaft für diese einzelne Integration.

Die dokumentierten Schriftgrössen ergänzen die vorhandene Framework-Skala: 24 px für Subheading, 36 px für Heading und 56 px für Display. Die zugehörigen Zeilenhöhen sind 1,25, 1,12 und 1,05. Fliesstext und Daten verwenden 1,6. Rollen ohne expliziten Rapold-Wert behalten ihren neutralen Default.

## 6. Geometrie, Abstand und Bewegung

Die Signet-Master verwenden `viewBox="0 0 256 256"`. Ihr transparenter Innenrand wahrt mindestens 24 Einheiten Schutzraum. Ab 24 px Canvasgrösse sind sie reguläre UI-Zeichen; die gesonderten Favicon-Ausgaben werden auch in kleineren Rastergrössen geprüft. Die sichtbaren Konturen bleiben proportional. Die einzelnen Produkte werden nicht auf dieselbe Breite und Höhe verzerrt.

Die Formfamilie verwendet gefaltete lineare Flächen mit offenen Zwischenräumen. Ihre Diagonalwinkel folgen der akzeptierten Referenz. Nur die Argus-Pupille ist eine 45-Grad-Raute. Produktübergreifend wird keine universelle Winkelregel behauptet.

Für UI-Kontrollen gelten 8 px Radius; die Foundation-Rollen für Karten und Panels werden mit 16 px und 24 px belegt. Die bestehende Framework-Bedienhöhe von 44 px und der schattenfreie Default bleiben erhalten. Nicht ausdrücklich überschriebene Abstands- und Layoutrollen folgen dem neutralen System.

Die reguläre Bewegung übernimmt 180 ms und `cubic-bezier(.2,.7,.2,1)` aus dem Quellpaket. Nicht wesentliche Bewegung wird bei reduzierter Bewegung unterdrückt. Die Signetdateien selbst sind statisch und enthalten keine Scripts.

## 7. Integrationsgrenzen und Prüfung

Das Brand-Paket liefert Farb- und Typografieentscheidungen. Seitenaufbau, Komponentenverhalten, Navigation und Präsentationsmuster bleiben beim neutralen Systemvertrag von Atlas. Die Integration fügt keine an Rapold gebundene Logik in Core-Komponenten ein.

`tests/brands.test.mjs` prüft den gemeinsamen Brand-Vertrag einschliesslich der Kontraste beider Modi. `tests/rapold.test.mjs` ergänzt die Grenzen zwischen Dachtheme und Produktzeichen, die unveränderte Identitätspalette, die Exporttrennung, zusätzliche Textpaare und den Quellen-/Freigabestatus. `npm run check` bleibt das gemeinsame Integrationsgate. Die visuelle Prüfung von Komponenten, Formzuständen, Portals und Tastaturfokus ist separat abzuschliessen.

## 8. Dachmarke rapold.io «Der First» (Vorschlag)

**Status: Vorschlag Dachmarke, Freigabe durch Marcel Rapold ausstehend.** Herkunft und Status: `sources/provenance.json` → `approval.umbrellaProposal`; `approval.umbrellaSymbol` bleibt `none`, bis die Freigabe mit Datum und Beleg dokumentiert ist. Vollständige Regeln: [`brands/rapold-io/DESIGN-DNA.md`](../rapold-io/DESIGN-DNA.md).

- **Zeichen und Lockups:** `assets/umbrella/` enthält die unveränderten Master aus `brands/rapold-io/assets/logos/` und die abgeleiteten kompakten Lockups (Zeichenhöhe 1,32 × Oberlänge, Abstand 0,34 em). `umbrella.json` bündelt sie für die Brand-Seite. Erzeugt mit `node scripts/brand-rapold-deck.mjs`.
- **Präsentationen:** `packages/brands/src/rapold.json` → `deck`. Cover, Kapitel und Schluss stehen auf Navy-Platten mit Glas-First und Firstlicht, Inhalt auf Ice Paper. Die Platten (`assets/deck-src/*.svg` → `assets/deck/*.png`) enthalten keinen Text; die Körnung der Web-Bühne fehlt bewusst, weil sie in der Projektion unsichtbar ist und das PNG etwa versechsfacht. Die zehn Signets stehen als Familienleiste auf Cover und Schluss.
- **Systemstart:** Die Bootsequenz eines Produkts beginnt mit dem First. Korona und Ridgeline sind eine bewusste Abweichung (A1) und nur dort erlaubt: Regeln in [DESIGN-DNA 7.1](../rapold-io/DESIGN-DNA.md#71-korona-und-ridgeline-im-systemstart-bewusste-abweichung-a1), Werte in `dna.json` unter `glow.corona`.
- **Rautenpunkt:** Der Titel jeder Folie endet mit der 45°-Raute, auf dunkel Firstglut `#FFA36C`, auf hell `#B4511A`, höchstens einmal pro Folie. Firstglut erscheint im Deck nur als dieser Rautenpunkt; Signalwerte (aktueller Meilenstein, Alarmwert) nutzen die Fehlerfarbe der Brand, damit pro Folie genau ein Firstglut-Punkt bleibt. Diagrammserien: Deep Azure, Ink Light, Light Facet, Muted Light; Ink Light steht an zweiter Stelle, weil die Serie 2 auch Beschriftungen und Pill-Text trägt (Light Facet erreicht auf Ice Paper nur 3,73:1 und bleibt Grafik).
- **Schrift:** Geist SemiBold für Titel, Geist für Text, Geist Mono für Versalien-Labels (0,2 em). Die statischen Geist-TTF für die PPTX-Einbettung sind noch offen; ohne installierte Geist fällt PowerPoint auf eine Systemschrift zurück.
- `presentation.logoOnCover` bleibt `false` (Altschalter für Brands ohne `deck`); das Deck setzt den Lockup über `deck.logo` auf Cover, Inhalt und Schluss.
