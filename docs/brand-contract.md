# Brand-Vertrag v1

Der Core kennt keine Firma. Seine Komponenten konsumieren ausschliesslich semantische CSS-Variablen. React ist der Adapter für Web-UI, JSON bleibt unabhängig vom Renderer. Ein Präsentationsadapter liest dieselbe Brand-Identität.

## Vorrang

1. Expliziter Auftrag und freigegebene Firmenvorlage.
2. Atlas, dieses Designsystem, für Systemstruktur, Website, Navigation und Komponentenverhalten.
3. Belegte Brand-Quellen mit Version und Herkunft für die markenspezifische Gestaltung. Sie bestimmen die Markenidentität der jeweiligen Brand.
4. Dokumentierte, noch nicht freigegebene Verfeinerungen.
5. Neutrale Atlas-Defaults für Eigenschaften, die weder der Systemvertrag noch die Brand-Vorlage definieren.

Konflikte werden festgehalten. Ein Adapter setzt `status: draft`, solange Abweichungen offen sind. Technische Validierung ist keine CI-Freigabe.

## Neue Brand

1. Folien, DESIGN.md und Assets getrennt vom Core einordnen. Vertrauliche Quellen bleiben in einem privaten Brand-Repository. Der Ordner `brands-private/` ist ignoriert.
2. Eine Brand-Datei nach `packages/brands/src/neutral.json` anlegen. `defineBrand()` validiert das vollständige Objekt. Jede Farbe ist ein sechsstelliger Hex-Wert. Keine HTML- oder CSS-Fragmente in Tokenwerten.
3. Nur belegte Darstellungsmodi hinzufügen. Licht-/Dunkelwerte sind vollständige Sätze; ein fehlender dunkler Modus wird nicht erfunden.
4. Den Eintrag in `packages/brands/src/index.mjs` registrieren. Bei wachsendem Bestand kann die Registry in einen eigenen Brand-Loader wandern; Core-Komponenten brauchen keine Änderung.
5. Anpassungen in einer README begründen. Textkontrast mindestens 4.5:1, funktionaler Fokus und Eingabekontur mindestens 3:1. Ganze Oberflächen zusätzlich visuell und mit Tastatur testen.
6. `npm run check` ausführen. `npm run contracts` erzeugt die maschinenlesbaren Zugänge für Web und Präsentation.

## Integration

```tsx
import { BrandProvider, Button } from '@rapold/framework-core';
import { neutral, toCssVariables } from '@rapold/framework-brands';

<BrandProvider brand={{id: neutral.id, mode: 'light', variables: toCssVariables(neutral)}}>
  <Button>Projekt öffnen</Button>
</BrandProvider>
```

Tailwind v4 einbinden, `@rapold/framework-core/styles.css` importieren und den installierten Core-Quellpfad mit `@source` scannen. In Next.js den Core unter `transpilePackages` eintragen. Schriftdateien bindet die konsumierende Anwendung ein. Das Source-Package liefert keine kompilierten Universal-CSS-Dateien.

## Originalpalette und semantische Rollen

Optionales `palette` enthält ein bis 32 benannte RGB-Farben. Namen sind kleingeschriebene CSS-taugliche Bezeichner, Werte sechsstellige Hex-Codes. Originalfarben werden getrennt von den barrierearmen semantischen Rollen als `--brand-color-*`, `tokens.palette` und DTCG `palette` ausgegeben. Ein Originalfarbwert ist keine automatische Freigabe für kleinen Text. `--brand-heading-font` leitet sich aus der optionalen Display-Familie mit dem allgemeinen Font-Stack als Fallback ab. Schriften werden referenziert, nicht eingebettet.

## Grenzen des ersten Schnitts

Fünf primitive UI-Bausteine, ein BrandProvider, zwei Brand-Konfigurationen, eine Referenz-App und ein Präsentationsvertrag. Auth, Mailing, Datenbank, Analytics, Standort-/Zeitlogik, Diagramm-Libraries und Motion-Engines gehören nicht zum Core. Portals und verschachtelte Brands mit gemischten Farbmodi sind noch kein unterstützter Integrationsvertrag. Spätere Dialog-/Popover-Adapter müssen den Brand-Scope explizit in ihren Portal-Container mitnehmen.

SemVer: neue optionale Tokens und Adapter als Minor, Umbenennung/Entfernung semantischer Rollen als Major. App-Projekte pinnen die Brand-Version.

## Original-Assets und PowerPoint-Schriftfamilien

Optionales `assets.logo` enthält `path`, `aspectRatio`, `background` und `padding`. Der Pfad ist relativ zum öffentlichen Asset-Verzeichnis, `padding` ein Anteil des vorgesehenen Logo-Feldes. Seitenverhältnis und Schutzraum müssen aus dem Original-Asset und dessen Brand-Vorgaben stammen. Optionale `typography.bodyFamily` und `headingFamily` benennen die konkreten PowerPoint-Schriftschnitte. Die CSS-Schriftfamilie bleibt in `family`.

## Deck-Rendervertrag (`deck`)

Optionales `deck` beschreibt, wie der Renderer die Folien einer Brand inszeniert. `presentation` bleibt Leitplanke für Agenten, `deck` ist renderrelevant: Folienflächen je Rolle, Materialien für Karten, Glow, Akzente, Schnitte und Rasterlogos. Brands ohne `deck` rendern unverändert die neutralen Atlas-Folien; ein Regressionstest (`tests/deck-baseline.test.mjs`) hält Szenen und `presentation.json` dieser Brands bytegleich.

```json
"deck": {
  "mode": "dark",
  "surfaces": {
    "cover":   { "fill": "#050505", "backdrop": "brands/beispiel/assets/deck/cover.png", "logo": true },
    "section": { "fill": "#050505", "backdrop": "brands/beispiel/assets/deck/section.png", "logo": { "heightCm": 0.48 } },
    "content": { "fill": "#050505", "backdrop": "brands/beispiel/assets/deck/content.png", "logo": { "anchor": "top-right", "heightCm": 0.48 } },
    "closing": { "fill": "#050505", "backdrop": "brands/beispiel/assets/deck/cover.png", "logo": { "anchor": "bottom-center", "heightCm": 1.06 } }
  },
  "materials": {
    "panel":       { "fill": "#000000", "fillOpacity": 0.25, "border": "#FFFFFF", "borderOpacity": 0.10, "borderPt": 0.75, "radiusCm": 0.423 },
    "panelRaised": { "fill": "#FFFFFF", "fillOpacity": 0.06, "border": "#FFFFFF", "borderOpacity": 0.10, "borderPt": 0.75, "radiusCm": 0.317 },
    "window":      { "fill": "#0F151D", "fillOpacity": 0.88, "border": "#E2F1FF", "borderOpacity": 0.18, "borderPt": 0.75, "radiusCm": 0.741, "highlight": { "color": "#FFFFFF", "opacity": 0.12 } }
  },
  "glow": { "color": "akzent", "opacity": 0.35, "blurPt": 12 },
  "accents": { "primary": "akzent", "signal": "alarm", "chart": ["akzent", "zweit", "dritt"], "chartPrevious": "grau" },
  "type": { "headingFace": "Segoe UI", "bodyFace": "Segoe UI", "displayFace": "Segoe UI Black", "labelFace": "Segoe UI Semibold", "capsTrackingEm": 0.16, "displayScale": 1.6 },
  "logo": { "onDark": "brands/beispiel/assets/deck/wordmark-on-dark.png", "onLight": "brands/beispiel/assets/deck/wordmark-on-light.png", "aspectRatio": 3.594, "heightCm": 0.74, "anchor": "top-left", "plate": false },
  "supergraphic": { "section": { "path": "brands/beispiel/assets/deck/zeichen.png", "x": -6, "y": 2, "w": 20, "h": 20, "opacity": 0.9 } },
  "punctuation": { "glyph": "◆", "onDark": "#FFA36C", "onLight": "#B4511A" }
}
```

| Schlüssel | Pflicht | Bedeutung |
|---|---|---|
| `mode` | ja | `light` oder `dark`: welcher Eintrag aus `modes` die Deckfarben liefert. Der Modus muss existieren. |
| `surfaces` | `cover`, `section`, `content`; `closing` optional | Fläche je Folienrolle: `fill` (Hex), `backdrop` (Bild über die volle Folie), `logo` (`true` oder `{anchor, heightCm}`), optional `mode` und `textWidthCm` (Cover, Kapitel, Schluss: maximale Textspaltenbreite ab dem linken Rand, damit Titel nicht über eine im Backdrop gebackene Supergrafik laufen). Ohne `mode` gilt die Luminanz der Füllung (unter 0,4 dunkel); ein dunkler Surface verlangt `modes.dark`. Fehlt `closing`, gilt `cover`. |
| `materials` | `panel`, `panelRaised`; `window` optional | Kartenmaterial: Füllung und Rand mit Deckkraft, Randstärke in pt, Radius in cm, optionale obere Lichtkante `highlight`. |
| `glow` | ja | Aussenschatten für genau ein Primärelement je Folie (KPI-Heldenkachel). |
| `accents` | `chart` | Palette-Schlüssel oder Hex. `primary` ersetzt die Akzentrolle, `signal` den Alarm, `chart[1]` die zweite Serie, `chartPrevious` die Vorperiode. Gilt für den Deck-Modus. |
| `type` | `headingFace`, `bodyFace`, `capsTrackingEm` | PowerPoint-Schnitte. `displayFace` für Cover-, Kapitel- und Schlusstitel, `labelFace` für Versalien-Labels, `displayScale` (1–3, Standard 1,5) multipliziert die 30-pt-Titelgrösse auf Cover und Kapitel. Nennt ein Schnitt sein Gewicht («Semibold», «Bold», «Black»), setzt der Renderer kein zusätzliches Fett. |
| `logo` | ja | Rasterlogos `onDark`/`onLight`, `aspectRatio`, `heightCm`, `anchor`, optional `marginCm` (Standard 0,93). `plate` ist immer `false`: Deck-Logos stehen ohne Platte. |
| `supergraphic` | nein | Grosse Markengrafik je `cover`, `section`, `closing` mit Lage in cm (darf über den Rand ragen) und optionaler Deckkraft. |
| `punctuation` | nein | Markenpunkt: ein Titel, der mit «.» endet, erhält stattdessen die Glyphe (Unicode-Block Geometric Shapes) in `onDark` bzw. `onLight`; `scale` relativ zur Titelgrösse (Standard 0,32), `append: true` setzt sie an jeden Rollentitel. Höchstens ein Punkt je Folie. |

**Pfade.** Alle Bilder sind PNG oder JPG, relativ zum Repository und liegen in `brands/<id>/`. SVG wird abgelehnt, weil PowerPoint-Export aus Node SVG nicht zuverlässig darstellt. Die SVG-Quellen liegen in `brands/<id>/assets/deck-src/`; `node scripts/build-deck-assets.mjs` rastert sie nach `brands/<id>/assets/deck/` (16:9-Quelle → 2400 × 1350, sonst 1200 px breit, `name@2000w.svg` setzt die Breite). `deck-assets.json` hält Quell- und Ausgabehash; unveränderte Quellen werden nicht neu kodiert, `--force` erzwingt es. Die PNGs sind kanonisch und werden committet. Der Build (`npm run contracts`) führt den Schritt vor den Decks aus und veröffentlicht die referenzierten Dateien unter demselben Pfad.

**Was der Renderer daraus macht.** Folientypen werden Rollen zugeordnet: `cover-foto` → `cover`, `foto-schluss` → `closing`, `kapitel-trenner` → `section`, alle anderen → `content`. Statt der opaken Grundfläche und der Primärbänder setzt er den Folienhintergrund (Farbe oder Bild). Cover und Kapitel erhalten grosse Titel, Inhaltsfolien eine Haarlinie statt der Primär-Fusslinie. Neutrale Evidenzflächen werden `panel`, hervorgehobene `panelRaised`. Versalien-Labels (Eyebrows, Spaltenköpfe, Pills) erhalten die Laufweite `capsTrackingEm`. Diagramme übernehmen Achsen-, Legenden- und Wertfarben aus dem Surface-Modus. Das Logo erscheint nur auf Rollen mit `logo`, in der Variante passend zur Flächenluminanz. Auf Inhaltsfolien darf das Logo nicht `top-left` oder `top-center` stehen, dort liegt die Titelzone.

**Referenzbilder.** `deck` und die Bytes aller referenzierten Bilder gehen in den Digest der Folienvorschauen (`scripts/reference-cache.mjs`). Jede Änderung verlangt `npm run deck:reference`.
