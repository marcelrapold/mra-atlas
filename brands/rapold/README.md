# Rapold

Ein optional wählbares Rapold-Theme für die Produkte AI Fabric, Argus, ÆON Learn und EdgePortal (freigegebene Signets) sowie Lotse, Cockpit, Auditor, Rapold Auth und PocketForge (Signet-Vorschläge). Es liefert eine gemeinsame Farb- und Typografiebasis für das neutrale Framework. Der Framework-Default bleibt `neutral`.

**Status des UI-Adapters: `draft`, Version 0.2.0.** Marcel Rapold hat am **11.10.2026** die vier Signets der Raumfalten-Familie B freigegeben. Die neue Zuordnung zu vollständigen UI-Rollen und ihre visuelle Abnahme bleiben als separate Integrationsarbeit dokumentiert.

**Produktwelten für Framework 0.6.0: produktiv ausgeliefert und gezielt geprüft.** Der produktiv geprüfte Anwendungsstand vom **11.10.2026, 10:06–10:17 UTC**, ist `73498ec4b46cb9f431d7ad5d186e88dd6301162b`; der lokale Check, Vercel-/Main-CI-Lauf, öffentliche Dateiabrufe und 14 Browserfälle sind im [Produktwelten-Prüfstand](../../docs/product-worlds.md#prüfstand-und-dokumentierte-grenzen) belegt. Die Prüfung vom 11.10.2026 umfasst schmale Referenzcontainer, konkrete Bedienpfade und einen verifizierten Browser-ZIP-Download. Vollständige mobile Viewports, Assistenztechnik, Browser-Mediaemulation und Pixelkontrast sind damit nicht abgenommen. Der `draft`-Status des UI-Adapters bleibt bestehen.

## Markenstruktur

| Ebene | Inhalt | Kanonische Quelle |
|---|---|---|
| Gemeinsames Theme | `rapold`: Farben, Geist, helle und dunkle semantische Rollen | `packages/brands/src/rapold.json` |
| Produktidentität | Vier freigegebene und fünf vorgeschlagene eigenständige Zeichen, jeweils mit `status` | [identity.json](identity.json) |
| Produktassets | Transparente SVG-Master und Farbvarianten | `brands/rapold/assets/logos/` |
| Belegte Ausgangswerte | Unveränderte Tokenkopie des gelieferten Brand-Pakets | `brands/rapold/sources/brand-tokens.json` |
| Herkunft und Ableitungen | Nutzerfreigabe, Prüfsumme, Quellen und UI-Verfeinerungen | `brands/rapold/sources/provenance.json` |
| Originale Produktwelt-Assets | Vier unveränderte Learn-Hero-Ebenen samt Apache-2.0-Lizenz | `brands/rapold/assets/worlds/learn/` |
| Herkunft der Produktwelten | Gepinnte Quellen, Originalbytes, Lizenzen und bewusste Abweichungen | [world-provenance.json](sources/world-provenance.json) |

Es gibt genau einen Rapold-Eintrag in der Brand-Registry. Die Produktkennungen wählen ein Zeichen innerhalb der gemeinsamen Identität. Sie erzeugen keine zusätzlichen Farbpresets. Für die Dachmarke ist kein separates Symbol festgelegt; `assets.logo` bleibt deshalb ungesetzt. Ein Produktsignet wird nur bei ausdrücklicher Produktwahl verwendet.

## Signets

| Kennung | Produkt | SVG-Master |
|---|---|---|
| `fabric` | AI Fabric | [fabric.svg](assets/logos/fabric.svg) |
| `argus` | Argus | [argus.svg](assets/logos/argus.svg) |
| `learn` | ÆON Learn | [learn.svg](assets/logos/learn.svg) |
| `edgeportal` | EdgePortal | [edgeportal.svg](assets/logos/edgeportal.svg) |

### Vorschläge seit 0.7.0

Die folgenden Signets sind **Vorschläge** (`status: "proposal"`), keine Freigabe. Sie greifen das bisherige Zeichen des jeweiligen Repositorys auf und übertragen es in die Raumfalten-Grammatik: polygonale Faltflächen, Azure-Körper, Ice-Facetten, isometrische Steigung 1 : 0,5, keine Schrift. Die Produkt-Repos verwenden ihre bisherigen Zeichen, bis eine Freigabe in [provenance.json](sources/provenance.json) dokumentiert ist.

| Kennung | Produkt | Bisheriges Zeichen | Vorschlag | SVG-Master |
|---|---|---|---|---|
| `lotse` | Lotse · lotse.rapold.io | Isometrische Etagen mit Route | Wegband, das um die Ecke aufsteigt und in einer Pfeilspitze endet | [lotse.svg](assets/logos/lotse.svg) |
| `cockpit` | Cockpit · cockpit.rapold.io | Tacho mit Nadel | Dreiteilige Faltskala mit Rautenachse und heller Nadel | [cockpit.svg](assets/logos/cockpit.svg) |
| `auditor` | Auditor · auditor.rapold.io | Schild mit Prüfhaken | Senkrecht gefaltetes Schild mit freigestelltem Haken | [auditor.svg](assets/logos/auditor.svg) |
| `auth` | Rapold Auth · auth.rapold.io | Pulslinie | Isometrisches Schloss; die Pulslinie wurde bewusst ersetzt, weil der Dienst Zugang darstellt | [auth.svg](assets/logos/auth.svg) |
| `pocketforge` | PocketForge · game.rapold.io | 4:3-Bildschirm mit einem Pixel | Isometrischer 4:3-Bildschirm mit leuchtendem Pixel | [pocketforge.svg](assets/logos/pocketforge.svg) |

Die Geometrie wird in [`scripts/build-signet-proposals.mjs`](../../scripts/build-signet-proposals.mjs) konstruiert und als SVG-Master geschrieben; der normale Build liest nur die Master. Für die Vorschläge gibt es noch keine eigenen Produktwelten; die Referenz zeigt dort einen Hinweis.

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

Die Zahlen oben beschreiben die statischen Tokenpaare. Text auf neuen Glasflächen oder vor bewegtem Licht muss zusätzlich gegen den tatsächlich zusammengesetzten Hintergrund geprüft werden. Transparenz und Blur liefern für sich keinen Kontrastnachweis.

## Produktwelten für 0.6.0

Die Produktwelten sind begrenzte Referenzcontainer innerhalb des Rapold-Showcases. Sie zeigen, wie sich die gemeinsame Identität in unterschiedlichen Produkten anwenden lässt. Sie übernehmen weder vollständige Source-Apps noch deren Anmeldung, Datenverbindungen oder operative Zustände. Die unveränderten Originalassets und die neu gebauten UI-Beispiele werden in der [Produktwelten-Spezifikation](../../docs/product-worlds.md) getrennt beschrieben.

| Produkt / Motiv | Herkunft und integrierter Umfang |
|---|---|
| AI Fabric | Aus der belegten Originalgestaltung abgeleitete prozedurale Aurora, deterministisches Netz mit Pulsen und Glasflächen. Keine Original-Hintergrundbitmap vorhanden; kein privater App-Quellcode wird als Asset kopiert. Geist und Geist Mono entsprechen bereits der AI-Quelle. |
| ÆON Learn | Vier bytegleich übernommene Hero-Dateien mit Atmosphäre, Wissensnetz, Reaktorkern und Signalbahnen. Partikel, Terminal und dezente Parallax werden als steuerbare Referenz umgesetzt. Die ursprünglichen Schriften Inter und JetBrains Mono werden bewusst durch Geist und Geist Mono ersetzt. |
| Argus | Neues CI-Anwendungsbeispiel mit dem freigegebenen Argus-Zeichen. Es belegt keine Parität mit einer nicht zugänglichen Argus-Oberfläche und zeigt keine realen Kameras oder Betriebszustände. |
| EdgePortal | Neues CI-Anwendungsbeispiel für das freigegebene Portalzeichen. Eine vollständige Übernahme der ursprünglichen App oder ihrer Verbindungszustände wird nicht behauptet. |
| Facetten und Spektrum | Neue gemeinsame CI-Dekore aus der freigegebenen Faltensprache und dem Rapold-Farbspektrum. Sie sind gestalterische Anwendungen der Identität, keine als Original ausgegebenen App-Assets. |

Alle Referenzen verwenden die neuen Raumfalten-Signets. Bestehende Produktlogos oder Wortmarken werden dafür nicht kopiert. Es bleibt eine gemeinsame Brand `rapold` mit vier Produktkennungen.

### Bewegung und ehrliche Beispiele

Ein sichtbarer, per Tastatur bedienbarer Bewegungsregler soll die gesamte Referenz stillsetzen: CSS-Animationen, Partikel, Pulse, Terminalsequenz und Parallax. `prefers-reduced-motion` erhält eine ruhige Darstellung mit vollständigem Terminaltext. Eine Pause bleibt beim Wechsel zwischen Referenzen erhalten; der übrige Inhalt bleibt bedienbar.

Terminalausgaben und Statuskarten werden direkt am Beispiel als fiktive Demonstration bezeichnet. Sie melden keine echte Verbindung, Kameraaktivität, Auslastung oder laufende Verarbeitung. Dekorative Ebenen bleiben ausserhalb der Bedien- und Lesereihenfolge. Überschriften, erklärender Text und echte Aktionen stehen auf ausreichend tragfähigen Flächen und bleiben auch ohne Bewegung oder Hintergrundbilder nutzbar. Das sind Anforderungen an die neue Integration; ihre Laufzeitprüfung steht noch aus.

### Originaldateien und Rechte

Die vier Learn-Dateien unter `assets/worlds/learn/hero-v2/` stammen aus dem öffentlichen Repository `marcelrapold/aeon-protocol`, Commit `bf362a37e2bacd13c502e8ad8a291d4e5bc1aabd`. Sie wurden unverändert von `learn.rapold.io` übernommen; alle Git-Blob- und SHA-256-Werte stimmen mit dem dokumentierten Quellstand überein. Alle Ebenen messen 1672 × 941, zusammen 123145 Bytes. Die unveränderte [Apache-2.0-LICENSE](assets/worlds/learn/LICENSE) und ein eigener [Herkunftshinweis](assets/worlds/learn/NOTICE) liegen daneben.

Für die private AI-Quelle ist keine offene Repository-Lizenz belegt. Die vom Nutzer beauftragte, eng abgegrenzte Nachbildung der sichtbaren Gestaltung wird getrennt von einer Quellcode- oder Bildübernahme behandelt. Der [Herkunftsnachweis](sources/world-provenance.json) hält die autorisiert geprüften Designpfade fest; private Nutzerdaten und Auth-/Backend-Dateien gehören nicht zum Paket. Die Lizenz der Learn-Originaldateien vergibt keine neuen Rechte an den Signets oder Fonts.

## Typografie und Anwendung

Geist ist die gemeinsame Schrift: Fliesstext 400, UI-Überschriften 650. Das Quellpaket definiert für separate Wortmarken 700; dieses Gewicht wird nicht automatisch auf alle UI-Überschriften übertragen. Geist Mono dient Code, technischen Kennungen und tabellarischen Daten.

Für AI bleibt damit die belegte Schriftfamilie erhalten. Bei Learn ist der Wechsel von Inter/JetBrains Mono auf Geist/Geist Mono eine bewusste Vereinheitlichung der Rapold-Identität. Zusammen mit den neuen Signets ist dies eine dokumentierte Abweichung von der Source-App, kein Anspruch auf pixelgenaue Originalparität.

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
- [Produktwelten-Spezifikation](../../docs/product-worlds.md) und [World-Provenance](sources/world-provenance.json): Originalquellen, unveränderte Dateien, integrierte Anpassungen sowie tatsächliche Produktions-/Browsernachweise und ihre Grenzen für 0.6.0.
- [Brand-Vertrag](https://design.rapold.io/contracts/brand-contract.md) für vollständige Rollen, Kontraste und Quellenstatus; Repository-Quelle: `docs/brand-contract.md`.
- [Atlas-Referenz](https://design.rapold.io/contracts/atlas-reference.md) für die neutrale Systemstruktur; Repository-Quelle: `docs/atlas-reference.md`. Diese Integration verändert keine Seitenarchitektur.

Prüfung: `node --test tests/brands.test.mjs tests/rapold.test.mjs`. Das gemeinsame Integrationsgate bleibt `npm run check`; Browser- und Tastaturprüfung erfolgen mit dem aktiven Rapold-Theme. Logo- und Fontrechte werden durch die Framework-Lizenz nicht neu vergeben.
