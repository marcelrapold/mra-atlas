# Rapold-Produktwelten

Stand: **11.10.2026**. **Framework 0.6.0 ist umgesetzt, lokal geprüft und produktiv ausgeliefert.** Dieses Dokument hält die belegten Gestaltungsquellen, den Integrationsvertrag sowie die lokalen und öffentlichen Prüfergebnisse fest. Die gezielte Produktions-Browserprüfung ist mit den dokumentierten Bedienfällen bestanden; ihre Grenzen stehen im Prüfstand unten. Der historische Produktionsnachweis für 0.5.0 bleibt im [Apple-Design-Audit, Abschnitt 6](apple-design-audit.md#6-produktions--und-browsernachprüfung--11102026).

## Umfang und Einordnung

Die Ergänzung zeigt Produktatmosphäre innerhalb begrenzter Rapold-Referenzcontainer: Hintergrund, Licht, Glas, neues Produktzeichen, Beispielinhalt und kontrollierbare Bewegung. Die Navigation und Seitenarchitektur von Atlas bleiben der Rahmen. Eine vollständige Source-App samt Anmeldung, Backend oder Nutzerdaten ist kein Bestandteil dieser Referenzen. Massgeblich sind der [Brand-Vertrag](brand-contract.md), der [Komponentenvertrag](https://atlas.rapold.io/contracts/components.md) und das [Rapold-Brand-Paket](../brands/rapold/README.md).

Für den lokal und produktiv bestätigten Stand 0.6.0 besteht die aktive Brand-Auswahl aus `neutral`, `dominicano-express` und `rapold`. Die Produktwelten `fabric`, `learn`, `argus` und `edgeportal` sind Ausprägungen der gemeinsamen Rapold-Brand. Sie sind keine vier weiteren Farbpresets. Goldbach und Sygnum sind auf Nutzerauftrag aus dem aktiven System entfernt; historische 0.5.0-Prüfbeobachtungen bleiben unverändert.

| Ebene | Einordnung |
|---|---|
| Vier Raumfalten-Signets | Am 11.10.2026 freigegebene Produktzeichen; keine ersatzweise erfundene Rapold-Dachmarke |
| AI-Atmosphäre | Eigene, vom Nutzer beauftragte Nachbildung der belegten prozeduralen Originalgestaltung |
| Learn-Hero | Vier tatsächlich verwendete Originaldateien, unverändert übernommen und mit dem gepinnten Git-Stand abgeglichen |
| Bewegung, Terminal und Referenzoberflächen | Integration nach belegten Gestaltungsrezepten mit gemeinsamen Bedien- und Zugänglichkeitsregeln |
| Argus und EdgePortal | Neue CI-Anwendungsbeispiele; keine behauptete Original-App-Parität |
| Facetten und Spektrum | Neue gemeinsame Dekore aus Raumfaltengeometrie und Rapold-Palette; keine historischen Source-App-Assets |

## Belegte Quellen

Der maschinenlesbare [Herkunftsnachweis](../brands/rapold/sources/world-provenance.json) enthält Commit, Originalpfad, öffentliche Download-URL, Git-Blob-ID, SHA-256, Dateigrösse, Format, Abmessungen und Sichtprüfung der übernommenen Dateien.

| Produkt | Gepinnter Quellstand | Geprüfter Designumfang |
|---|---|---|
| AI Fabric | Privates Repository `marcelrapold/mra-ai` (bis 12.10.2026 `ai`), `db588fa7e6e4a31ba1ee1a2e91059534695494af` | Autorisierte, gezielte Designlektüre von `apps/dashboard/app/globals.css`, `apps/dashboard/components/shell/ambient.tsx`, `login-shell.tsx` sowie Designexzerpten aus `components/login/login-view.tsx` |
| ÆON Learn | Öffentliches [aeon-protocol am Commit bf362a3](https://github.com/marcelrapold/aeon-protocol/tree/bf362a37e2bacd13c502e8ad8a291d4e5bc1aabd) | `site/learn/app/globals.css`, `app/shell.tsx` sowie `components/hero-artwork-stack.tsx`, `hero-knowledge-particles.tsx`, `fake-terminal.tsx`, `glitch-pulse.tsx` und `landing.tsx` |
| Argus | Freigegebenes Zeichen und gemeinsame Rapold-CI | Keine zugängliche Original-Frontendquelle als Paritätsnachweis vorhanden |
| EdgePortal | Freigegebenes Zeichen und gemeinsame Rapold-CI | Für diese Integration wird keine vollständige Original-App-Übernahme als belegt ausgegeben |

### AI Fabric: Aurora, Netz und Glas

Die AI-Originalquelle erzeugt ihren Hintergrund prozedural. Drei stark geblurrte Halos bewegen sich langsam; ein deterministisches SVG-Netz verbindet Knoten und führt Lichtpulse entlang einzelner Kanten. Es gibt dafür keine zu kopierende Hintergrundbitmap. Geist und Geist Mono sind bereits die Original-Schriftfamilien. Quelle: die autorisiert geprüften Designpfade am oben genannten AI-Commit, einzeln in [world-provenance.json](../brands/rapold/sources/world-provenance.json) festgehalten.

Die folgenden Zahlen sind **Quellwerte zur Reproduktion**, keine Messwerte einer bereits abgenommenen 0.6.0-Oberfläche:

| Bestandteil | Belegtes Originalrezept |
|---|---|
| Halos | Blau `#0072CE`, Pink `#F472B6`, Cyan `#38BDF8`; Ausdehnung 55vmax, Blur 90 px; Driftzyklen 70, 90 und 110 Sekunden |
| Netz | SVG-Fläche 1600 × 900; deterministischer Seed 1909, 26 Punkte, 33 Kanten, elf animierte Pulse; 24-Sekunden-Zyklus für die Netzopazität |
| Glas | Hauptkarte mit 85 % Kartenfläche, Blur und 24-px-Radius; ergänzende Karten mit 70 % und 16-px-Radius; Header mit 60 % |
| Auftritt und Hover | Einmaliger Auftritt über 600 ms mit 12 px Versatz und gestaffeltem Start; Hover um 4 px über 300 ms; kein dauerhaft schwebender Kartenkörper |
| Ruhige Quelle | Reduced Motion stoppt Aurora und Netzbewegung und verbirgt Pulse |

Die neue Referenz verbindet diese Atmosphäre mit den freigegebenen Raumfaltenzeichen. Die Originalfarben der Lichtquellen sind dekorative Werte. Text, Fokus und echte Bedienflächen folgen weiterhin den gemeinsamen semantischen Rollen.

### ÆON Learn: Originalkunst und steuerbare Bewegung

Die öffentliche [Hero-Komponente](https://github.com/marcelrapold/aeon-protocol/blob/bf362a37e2bacd13c502e8ad8a291d4e5bc1aabd/site/learn/components/hero-artwork-stack.tsx) referenziert genau vier dekorative Dateien. Die [Landingpage](https://github.com/marcelrapold/aeon-protocol/blob/bf362a37e2bacd13c502e8ad8a291d4e5bc1aabd/site/learn/components/landing.tsx) bindet diesen Stack tatsächlich ein. Alle Dateien liegen unverändert unter `brands/rapold/assets/worlds/learn/hero-v2/` und messen **1672 × 941**.

| Originaldatei | Bytes | Tiefenfaktor der Quelle | Ebenenopazität / Mischung der Quelle |
|---|---:|---:|---|
| `base-atmosphere.webp` | 26638 | 2 | 1 / normal |
| `knowledge-rig.svg` | 3602 | 5 | 0,28 / screen |
| `learning-core.webp` | 88752 | 8 | 0,92 / normal |
| `cognitive-signals.svg` | 4153 | 12 | 0,52 / screen |

Die Quelldarstellung verwendet `cover`, zentrierte Bilder, eine Vergrösserung um Faktor 1,07 und eine vertikale Randmaske. Parallax ist in der Quelle an einen feinen Zeiger und fehlendes Reduced Motion gebunden. Die Stern-/Partikeleffektquelle nutzt 58 Punkte, unter 640 px 24, begrenzt die Pixeldichte und pausiert ausserhalb der Sichtfläche; bei reduzierter Bewegung bleibt ein statisches Bild. Diese Bewegungsrezepte werden in der Referenz um eine gemeinsame manuelle Stillsetzung ergänzt. Quellen: [Hero-Stack](https://github.com/marcelrapold/aeon-protocol/blob/bf362a37e2bacd13c502e8ad8a291d4e5bc1aabd/site/learn/components/hero-artwork-stack.tsx), [Partikel](https://github.com/marcelrapold/aeon-protocol/blob/bf362a37e2bacd13c502e8ad8a291d4e5bc1aabd/site/learn/components/hero-knowledge-particles.tsx).

Die [Terminalquelle](https://github.com/marcelrapold/aeon-protocol/blob/bf362a37e2bacd13c502e8ad8a291d4e5bc1aabd/site/learn/components/fake-terminal.tsx) ist eine visuelle Inszenierung: dunkles Gehäuse auch im hellen Modus, feine Scanlines, Vignette, langsamer Glow und eine Tippsequenz. Bei Reduced Motion zeigt die Quelle den vollständigen Text. Die neue Referenz kennzeichnet den Inhalt sichtbar als Beispiel und bindet daran keinen echten Prozesszustand. Gestaltungsdetails stehen zusätzlich in den [Learn-Styles](https://github.com/marcelrapold/aeon-protocol/blob/bf362a37e2bacd13c502e8ad8a291d4e5bc1aabd/site/learn/app/globals.css).

Der kleine leuchtende Würfel in `learning-core.webp` gehört zur Reaktorillustration. Der Quellenabgleich mit dem bisherigen Learn-Icon und der Æ-Wortmarke ergab keinen Hinweis auf ein eingebranntes Altlogo. Er wird als dekoratives Motiv erhalten und nicht als neues Produktsignet verwendet. Die acht unbenutzten Dateien unter `site/learn/public/visuals/backgrounds/` und die unreferenzierte Duplikatdatei `master-composite.webp` werden nicht als aktive Originalgestaltung übernommen; diese Entscheidung ist im [Herkunftsnachweis](../brands/rapold/sources/world-provenance.json) dokumentiert.

## Gemeinsame Identität und bewusste Anpassungen

Alle Produktwelten verwenden die neuen Zeichen unter `brands/rapold/assets/logos/`. Die ursprüngliche Æ-Ligatur, alte Favicons oder andere frühere Produktlogos werden dadurch nicht in das neue Brand-Paket eingeschleust. Die Signetgeometrie bleibt unverändert. Facetten dürfen die vorhandene Faltensprache aufnehmen; eine pauschale 45-Grad-Regel ist aus der tatsächlichen Geometrie nicht abzuleiten. Grundlage ist das [Rapold-Brand-Paket](../brands/rapold/README.md).

**Geist und Geist Mono sind die gemeinsame Typografie.** AI verwendet diese Familien bereits. Learn verwendet laut [Original-Shell](https://github.com/marcelrapold/aeon-protocol/blob/bf362a37e2bacd13c502e8ad8a291d4e5bc1aabd/site/learn/app/shell.tsx) Inter und JetBrains Mono; diese Schriftwahl wird für die Referenz bewusst geändert. Die ursprünglichen Learn-Fontdateien werden nicht zusätzlich kopiert. Die gelieferten Geist-Schriften und ihre Hinweise bleiben unter `brands/rapold/assets/fonts/`.

Facetten und Spektrum sind neue gemeinsame CI-Anwendungen: geometrische Flächen aus der Formfamilie beziehungsweise atmosphärische Farbverläufe aus der Palette. Ihre Beschreibung muss ihre Herkunft als neue Gestaltung erkennbar lassen. Argus und EdgePortal zeigen ebenfalls neue Musteranwendungen. Beispielkarten stellen keine realen Kameras, Sitzungen, verbundenen Geräte oder Messwerte dar. Für keine dieser Anwendungen wird eine unveränderte Original-App oder vollständige visuelle Parität behauptet.

## Bedienkontrakt für die Referenzen

Dieser Abschnitt definiert die Anforderungen an 0.6.0. Die tatsächlich geprüften Teilabläufe und die weiterhin offenen Prüfgrenzen sind im Prüfstand unten getrennt dokumentiert; die Anforderungen selbst sind kein pauschaler Abnahmenachweis.

### Eine gemeinsame Stillsetzung

Ein sichtbarer Bewegungsregler ist mit Tastatur erreichbar und vermittelt den aktuellen Zustand. Er erfasst sämtliche dekorativen Bewegungen der Referenz, einschliesslich CSS-Animationen, Canvas-/SVG-Pulsen, JavaScript-Timern, Terminalsequenz und pointer-/scrollbasierter Parallax. Eine aktivierte Pause bleibt wirksam, während andere Inhalte bedient oder Produkte gewechselt werden. Inhalte und echte Aktionen bleiben zugänglich. Automatisch startende, länger als fünf Sekunden parallel zu anderem Inhalt laufende Bewegung braucht einen Mechanismus zum Pausieren, Stoppen oder Verbergen; automatisch aktualisierende Information hat keine entsprechende Fünf-Sekunden-Ausnahme. Quelle: [W3C, SC 2.2.2 Pause, Stop, Hide, Stufe A](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

`prefers-reduced-motion` erhält von Anfang an eine statische Referenz und reagiert auf einen späteren Präferenzwechsel. Im Terminal ist der Text vollständig sichtbar; unnötige Parallax entfällt. Die Nichtbewegung entfernt keine Information. Das Abschalten nicht wesentlicher interaktionsbedingter Animation entspricht zusätzlich [SC 2.3.3, Stufe AAA](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html). Diese Stufe wird als bewusste Gestaltungsregel verwendet, nicht als schon erfüllte allgemeine AAA-Zertifizierung.

### Tragfähige Textflächen

Regulärer Text muss auch über der hellsten Phase des bewegten Hintergrunds mindestens 4,5:1 erreichen; grosser Text darf nach den üblichen Grössenregeln mit 3:1 bewertet werden. Entscheidend ist die tatsächlich zusammengesetzte Fläche, nicht bloss der Kontrast zweier Basistokens. Text selbst wird nicht durch dekorative Opazität abgeschwächt. Glas erhält deshalb eine ausreichend deckende Kartenfläche; bei fehlendem Blur bleiben Oberfläche, Text und Fokus lesbar. Quelle: [W3C, Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) und die bestehenden Messregeln im [Audit](apple-design-audit.md).

Dekorative Ebenen fangen weder Zeigerereignisse noch Tastaturfokus ab und erhalten keine redundante Vorlesebeschreibung. Die neuen Referenzcontainer wurden bei 320 px, Learn zusätzlich bei 390 px geprüft. Vollständige schmale Browser-Viewports, vergrösserter Text und die übrigen historischen Reflow-Grenzen sind damit nicht abgenommen.

### Ehrliche Zustände

Terminal und Karten tragen direkt am Beispiel eine erkennbare Bezeichnung wie «Demo» oder «Fiktives Muster». Eine animierte Sequenz meldet keine erfolgreiche Anmeldung, aktive Kamera, bestehende Verbindung oder echte Ausführung. Schreibanimationen werden nicht als ständig aktualisierte Live-Region ausgegeben. Erklärender Text bleibt vollständig verfügbar; echte Zustandsmeldungen beschreiben nur reale Aktionen der Referenz, etwa eine bewusst veränderte Auswahl oder ein tatsächliches Kopierergebnis.

## Dateien und Rechte

Die **vier Learn-Originaldateien umfassen 123145 Bytes**. Ihre öffentlichen HTTP-Antworten, MIME-Typen, Abmessungen und SHA-256-Werte sowie die bytegleiche Übereinstimmung mit den gepinnten Git-Blobs wurden am 11.10.2026 geprüft. Alle vier Dateien wurden visuell betrachtet; die beiden SVGs zusätzlich auf Scripts, externe Ressourcen, Schriftabhängigkeiten und eingebettete Raster geprüft. Diese Assetprüfung ist in [world-provenance.json](../brands/rapold/sources/world-provenance.json) dokumentiert und ersetzt keine UI-Prüfung.

Das öffentliche Learn-Repository führt die [Apache License 2.0](https://github.com/marcelrapold/aeon-protocol/blob/bf362a37e2bacd13c502e8ad8a291d4e5bc1aabd/LICENSE). Eine unveränderte Kopie liegt unter [assets/worlds/learn/LICENSE](../brands/rapold/assets/worlds/learn/LICENSE). Der vollständige geprüfte Quellbaum enthielt keine weitere LICENSE- oder NOTICE-Datei. Der ergänzte [NOTICE](../brands/rapold/assets/worlds/learn/NOTICE) ist ausdrücklich ein neuer Herkunftshinweis; die Bilddateien wurden weder bearbeitet noch neu komprimiert.

Die private AI-Quelle besitzt keine belegte offene Repository-Lizenz. Der Nutzerauftrag autorisiert die hier beschriebene eng abgegrenzte Gestaltungsableitung. Er wird nicht als pauschale Open-Source-Lizenz dargestellt. Es werden keine privaten AI-App-Dateien, Nutzerdaten oder Auth-/Backend-Dateien in das Assetpaket kopiert. Rechte und Lizenzen der freigegebenen Signets, der Geist-Fonts und der Learn-Originalbilder bleiben jeweils getrennt nachvollziehbar.

## Prüfstand und dokumentierte Grenzen

Belegt sind die Quellenlektüre, die unveränderten Learn-Originalassets und ihre lokale Datei-/Sichtprüfung. React-/CSS-Integration, Export-Kit und die reduzierte Brand-Auswahl sind lokal umgesetzt. **`npm run check` endete am 11.10.2026 zwischen 09:50 und 09:51 UTC mit Exit 0:** 47 von 47 Tests bestanden, 0 Fehler; TypeScript, Next.js 16.3.5 Production Build und Postbuild erfolgreich. Der tatsächliche LibreOffice-Referenzrender ist im [Audit, Abschnitt 7.4](apple-design-audit.md#74-tatsächlich-ausgeführter-referenzrender--11102026) dokumentiert.

| Lokaler Bestand | Geprüftes Ergebnis |
|---|---|
| Framework | 36 indexierte Routen; drei Brands `neutral`, `dominicano-express`, `rapold` |
| Präsentationen | 18 PPTX, 54 PNG, 18 PDF |
| Logos | 208 Exporte und 27 kanonische Ressourcen |
| Produktwelten | 84 öffentliche Ressourcen im eigenen Manifest; einschliesslich Kopien und ZIP |
| Portables ZIP | 44 Dateien; 43 bytegleich mit den bereitgestellten Gegenstücken. Nur die öffentliche HTML ergänzt eine statische Base-URL für Vercel `cleanUrls`; nach Entfernen exakt dieses Tags ebenfalls bytegleich. Die ZIP-Fassung bleibt relativ/offline. |

Das portable Kit enthält die vier Welten, Hell/Dunkel/Produktstandard, Facetten/Spektrum, Ebenenwahl und Pause. Sein Terminal ist vollständig statisch lesbar; Autotyping und Glitch gehören nicht zum Kit. Der manuell auslösbare Glitch der React-Referenz ist eine bewusst getrennte Variante.

Der versionierte [Kontrastbericht](review/product-worlds-contrast.json) modelliert konservativ 625 Alpha-Kombinationen und sampelt Verläufe in sRGB/Oklab. Nach der Korrektur erreicht Fabric-Hero-Fliesstext mindestens **6,06:1 in Hell / 8,65:1 in Dunkel**, die grosse fette Facetten-Wortmarke **3,70:1 / 6,49:1**, Spektrum **5,57:1 / 5,19:1**. Für die Wortmarken gilt mindestens 20 px / Gewicht 700 und eine Modellgrenze von 3:1; die Facettenfarben sind damit nicht pauschal für kleinen Text freigegeben. Das Learn-Terminal erreicht mit 95-%-Terminalfläche und Text auf Ebene 3 mindestens **6,18:1** selbst gegen die modellierten Schwarz-/Weiss-Hintergrundgrenzen. **Keine Browser-Pixelmessung:** Learn-Hero-Text ausserhalb des Terminals wurde nur auf der flachen CSS-Basis bewertet; Bildkomposition, sämtliche Animationsphasen und tatsächliche Bedienung sind dadurch nicht abgenommen. Die vollständige Einordnung steht im [Audit, Abschnitt 7.5](apple-design-audit.md#75-vollständiger-lokaler-check-und-kontrastmodell--11102026).

### Tatsächliche Produktionsauslieferung

[PR #6](https://github.com/marcelrapold/mra-atlas/pull/6) ist gemergt. Im Produktionsprüflauf am **11.10.2026, 10:06–10:07 UTC**, lieferte die damalige Produktionsadresse (heute [atlas.rapold.io](https://atlas.rapold.io)) **0.6.0** mit dem Anwendungs-Commit [`73498ec4b46cb9f431d7ad5d186e88dd6301162b`](https://github.com/marcelrapold/mra-atlas/commit/73498ec4b46cb9f431d7ad5d186e88dd6301162b); `builtAt: 2026-10-11T10:05:00.077Z`. [Vercel-Deployment](https://vercel.com/marcelrapold/design/8BQn7pjJCTvMNyqpdd9vHvcDoRfD) und [Main-CI](https://github.com/marcelrapold/mra-atlas/actions/runs/38130603944) sind erfolgreich. Die Commit-ID kennzeichnet den datierten produktiven Prüfstand, keinen dauerhaft aktuellen Main-Head. Ein späterer reiner Dokumentations-/Nachweis-Commit erhält eine eigene Build-ID; die bestehenden Browserbelege bleiben dem hier geprüften Anwendungsstand zugeordnet.

Die gezielte öffentliche Prüfung vom **11.10.2026, 10:06:08.102–10:07:03.375 UTC**, bestand vollständig: 84 Weltressourcen, das ZIP mit 44 Dateien, die drei aktiven Brands und zehn erwartete 404 für gezielt geprüfte entfernte Goldbach-/Sygnum-Dateien. Beide Präsentationsseiten haben jetzt korrekte Canonical-/Open-Graph-URLs. Die abschliessende Build-Info bestätigte unverändert denselben Commit und denselben Datei-Hash. Die unveränderten [Produktions-](review/production-0.6.0-73498ec4b46c/production-report.json) und [HTTP-Protokolle](review/production-0.6.0-73498ec4b46c/http-observations.json) sind versioniert; Umfang und Hashwerte stehen im [Audit, Abschnitt 7.6](apple-design-audit.md#76-belegter-produktionsrollout-060--11102026).

Die öffentliche [Standalone-Referenz](https://atlas.rapold.io/brands/rapold/product-worlds) und das [portable ZIP](https://atlas.rapold.io/brands/rapold/rapold-product-worlds.zip) sind ausgeliefert. Das ZIP hat 326782 Bytes und SHA-256 `53714c02dfac3f867f23d586fbeb038e33d957965f92bb9d62274c6a75e2fce3`.

### Gezielte Produktions-Browserprüfung

Der [Browserbericht](review/production-0.6.0-73498ec4b46c/browser-review.json) vom **11.10.2026, 10:17:17 UTC** dokumentiert **14 bestandene Zustands- und Bedienfälle** am Produktionscommit `73498ec4b46cb9f431d7ad5d186e88dd6301162b`: **Chrome, 1363 × 936 CSS-px, DPR 1**. Die Hauptansicht wurde mit allen vier Produkten, hellen und dunklen Zuständen, Facetten/Spektrum, CSS-Pause/Fortsetzen, über Produktwechsel erhaltener Pause, Hintergrundschaltern und ein-/ausgeblendeter Oberfläche geprüft. Die Tastaturbedienung mit Enter zeigte einen tatsächlichen `focus-visible`-Ring von 3 px; Produkt-Dropdown und Downloadüberschrift waren synchron.

Alle vier Referenzcontainer wurden bei **320 CSS-px hell**, EdgePortal zusätzlich dunkel, geprüft; Learn ausserdem bei **390 CSS-px hell**. In diesen Fällen gab es keine gemessenen horizontalen Textüberläufe. **Der Browser-Viewport selbst blieb unverändert:** Dies sind Referenzbreiten, keine vollständigen mobilen Viewporttests. Der [Learn-Screenshot](review/production-0.6.0-73498ec4b46c/learn-dark-live.jpg) zeigt den tatsächlichen dunklen Produktionszustand mit geladenem Original-Hero und als fiktiv gekennzeichnetem Terminal.

Auch das [HTML-Kit](https://atlas.rapold.io/brands/rapold/product-worlds) wurde direkt im Browser bedient: Produktfilter, Hell/Dunkel, Spektrum, Pause, Ebenenschalter und SVG-Details. Alle vier Learn-Originalbilder und das passende Signet waren geladen. Der **tatsächliche Browser-ZIP-Download** bestand die Grössen-, SHA-256- und CRC-Prüfung: 326782 Bytes, 44 Einträge, identischer Hash zum Produktionsmanifest. Die erfassten Anwendungslogs von Hauptansicht und Kit enthielten keine Warnungen oder Fehler; 201 Erweiterungseinträge wurden getrennt ausgeschlossen.

**Verbleibende Grenzen:** Keine physische Mobil-/Touch-Prüfung, keine Assistenztechnik, kein 200-%-Zoom und keine Browseremulation von Forced Colors oder Reduced Motion. Keine Pixelkontrastmessung oder vollständige Abnahme aller Animationsphasen. Der manuelle Learn-Glitch wurde geklickt, seine kurzlebigen Frames und SVG-SMIL-Playheads aber nicht unabhängig instrumentiert. Die im Bericht erfassten CSS-Zustände bestätigen keine vollständig instrumentierte Stillsetzung jeder Effektquelle. Die früher offenen, provozierten Netzwerkfehlerfälle bleiben ebenfalls ungeprüft. Einzelheiten stehen im [Audit, Abschnitt 7.6](apple-design-audit.md#76-belegter-produktionsrollout-060--11102026); der UI-Adapter bleibt `draft`.
