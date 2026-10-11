# Rapold

Ein optional wählbares Rapold-Theme für die vier Produkte AI Fabric, Argus, ÆON Learn und EdgePortal. Es liefert eine gemeinsame Farb- und Typografiebasis für das neutrale Framework. Der Framework-Default bleibt `neutral`.

**Status des UI-Adapters: `draft`, Version 0.1.0.** Marcel Rapold hat am **11.10.2026** die vier Signets der Raumfalten-Familie B freigegeben. Die neue Zuordnung zu vollständigen UI-Rollen und ihre visuelle Abnahme bleiben als separate Integrationsarbeit dokumentiert.

## Markenstruktur

| Ebene | Inhalt | Kanonische Quelle |
|---|---|---|
| Gemeinsames Theme | `rapold`: Farben, Geist, helle und dunkle semantische Rollen | `packages/brands/src/rapold.json` |
| Produktidentität | `fabric`, `argus`, `learn`, `edgeportal`: vier eigenständige Zeichen | [identity.json](identity.json) |
| Produktassets | Transparente SVG-Master und Farbvarianten | `brands/rapold/assets/logos/` |
| Belegte Ausgangswerte | Unveränderte Tokenkopie des gelieferten Brand-Pakets | `brands/rapold/sources/brand-tokens.json` |
| Herkunft und Ableitungen | Nutzerfreigabe, Prüfsumme, Quellen und UI-Verfeinerungen | `brands/rapold/sources/provenance.json` |

Es gibt genau einen Rapold-Eintrag in der Brand-Registry. Die Produktkennungen wählen ein Zeichen innerhalb der gemeinsamen Identität. Sie erzeugen keine zusätzlichen Farbpresets. Für die Dachmarke ist kein separates Symbol festgelegt; `assets.logo` bleibt deshalb ungesetzt. Ein Produktsignet wird nur bei ausdrücklicher Produktwahl verwendet.

## Signets

| Kennung | Produkt | SVG-Master |
|---|---|---|
| `fabric` | AI Fabric | [fabric.svg](assets/logos/fabric.svg) |
| `argus` | Argus | [argus.svg](assets/logos/argus.svg) |
| `learn` | ÆON Learn | [learn.svg](assets/logos/learn.svg) |
| `edgeportal` | EdgePortal | [edgeportal.svg](assets/logos/edgeportal.svg) |

Die Zeichen enthalten keine sichtbare Schrift. Sie verwenden eine transparente `256 × 256`-Fläche und einen Schutzraum von mindestens 24 Einheiten um die sichtbare Kontur. Proportionen und Öffnungen bleiben erhalten. Die Faltkanten stammen aus der akzeptierten Referenz; es gibt keine allgemeine 45-Grad-Vorgabe.

Varianten: `logos/light/`, `logos/mono-white/`, `logos/mono-black/` und `logos/current-color/`, jeweils unter `assets/`. Alle Varianten besitzen dieselbe Geometrie. Die helle Variante verwendet `#0066B3` und `#2B89B5`.

## Farbe und Lesbarkeit

Die Identitätsfarben **Azure `#009DFF`** und **Ice `#A8EDFF`** bleiben unverändert in `palette` und den SVG-Mastern. Das gesamte Quellfarbspektrum enthält zusätzlich Violet, Navy und Paper. Semantische Rollen stehen davon getrennt in `modes.light` und `modes.dark`.

| UI-Rolle | Hell | Dunkel |
|---|---|---|
| Hintergrund | `#F4FAFF` | `#050B19` |
| Karte | `#FFFFFF` | `#0B1528` |
| Text | `#10253D` | `#EDF5FF` |
| Aktion | `#0066B3` | `#38B8FF` |
| Text auf Aktion | `#FFFFFF` | `#04101D` |
| Funktionale Eingabekontur | `#6F87A0` | `#5F7089` |

Azure erreicht mit Weiss nur **2,89:1**. Der helle Aktionswert erreicht **5,91:1**, der dunkle Aktionswert mit seiner dunklen Schrift **8,63:1**. Dekorative Linien sind eigene Rollen; funktionale Eingabekonturen und Fokusmarkierungen erfüllen mindestens **3:1** gegen Hintergrund und Karte. Alle regulären Textpaare erfüllen mindestens **4,5:1**. Statusfarben werden zusätzlich mit Text oder einem verständlichen Symbol kombiniert.

Die exakten Zuordnungen, abgeleiteten Werte und Berechnungsregeln stehen in [DESIGN.md](DESIGN.md) und der Provenance-Datei. Diese technische Prüfung ersetzt keine visuelle UI-Abnahme.

## Typografie und Anwendung

Geist ist die gemeinsame Schrift: Fliesstext 400, UI-Überschriften 650. Das Quellpaket definiert für separate Wortmarken 700; dieses Gewicht wird nicht automatisch auf alle UI-Überschriften übertragen. Geist Mono dient Code, technischen Kennungen und tabellarischen Daten.

Die Fontdateien liegen unter `assets/fonts/`. Zugehörige Lizenz- und Autorenhinweise werden dort mitgeführt. Die konsumierende Anwendung lädt die Schriften und bindet sie im Rapold-Scope ein. Der Core erhält keine firmenspezifischen Fonts. Das bestehende Brand-Schema bleibt unverändert; eine zusätzliche `typography.monoFamily`-Eigenschaft ist für diese Integration nicht erforderlich.

```tsx
import { BrandProvider } from '@rapold/framework-core';
import { rapold, toCssVariables } from '@rapold/framework-brands';

const mode = 'dark';
const variables = {
  ...toCssVariables(rapold, mode),
  '--font-mono': '"Geist Mono", ui-monospace, monospace',
};

<BrandProvider brand={{ id: rapold.id, mode, variables }}>
  {/* Anwendung mit expliziter Rapold-Auswahl */}
</BrandProvider>;
```

Der Mono-Override gehört in den App-Adapter. `toCssVariables` setzt die Variablen inline am Provider; bei einer CSS-Lösung muss die Kaskade entsprechend berücksichtigt werden.

### Schriften für LibreOffice-Referenzen

`python scripts/prepare-render-fonts.py` bereitet die gelieferten Fonts für native PDF-Referenzen vor. Benötigt werden FontTools mit WOFF-Unterstützung (`python -m pip install 'fonttools[woff]'`) und Fontconfig. Das Script behält Inter 300/400/700 bei und instanziert Geist 400/500/650/700 sowie Geist Mono 400/500 als statische TTF-Faces. Familie, Stilnamen und Gewichtstabellen werden gesetzt; danach aktualisiert es den lokalen Fontcache und kontrolliert jedes Gewicht mit `fc-match`.

Die Ausgaben liegen ausschliesslich unter `~/.local/share/fonts/framework`. Konvertierte Fontbinaries werden nicht im Repository abgelegt. Die Referenzrender-Pipeline kann diese installierten Faces mit LibreOffice verwenden; ihre Ausführung und der Referenz-Cache werden separat gesteuert.

## Quellen und Abnahme

- Nutzerfreigabe der vier Raumfalten-Signets vom 11.10.2026.
- Geliefertes `rapold-brand-system`, Version 1.0.0: Tokenkopie und SHA-256-Nachweis im Brand-Paket.
- [Brand-Vertrag](https://design.rapold.io/contracts/brand-contract.md) für vollständige Rollen, Kontraste und Quellenstatus; Repository-Quelle: `docs/brand-contract.md`.
- [Atlas-Referenz](https://design.rapold.io/contracts/atlas-reference.md) für die neutrale Systemstruktur; Repository-Quelle: `docs/atlas-reference.md`. Diese Integration verändert keine Seitenarchitektur.

Prüfung: `node --test tests/brands.test.mjs tests/rapold.test.mjs`. Das gemeinsame Integrationsgate bleibt `npm run check`; Browser- und Tastaturprüfung erfolgen mit dem aktiven Rapold-Theme. Logo- und Fontrechte werden durch die Framework-Lizenz nicht neu vergeben.
