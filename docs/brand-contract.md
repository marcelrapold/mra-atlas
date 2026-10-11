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
