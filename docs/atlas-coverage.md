# Atlas-Abgleich

Referenz: zvvch/zvv-atlas, Commit 1c75c95417cc371040e1e24a0986213314b53c13. Folgeauftrag: mindestens gleicher Umfang im wiederverwendbaren Framework; ursprüngliche Minimalreduktion aufgehoben. Die folgende Übersicht beschreibt den aktuellen Quellstand mit den drei aktiven Brands Neutral, Dominicano Express und Rapold. Historische Abnahmen sind darunter mit ihrer damaligen Version gekennzeichnet; der aktuelle Produktionsnachweis steht in [Deployment](deployment.md).

| Bereich | Implementiert | Noch offen |
|---|---|---|
| UI-Exports | 19/19 Module aus packages/atlas/src/ui, einschliesslich markenfähiger Portale | Browser-Abnahme aller Zustände |
| Farbrollen | Alle neutralen Atlas-Rollen, Light/Dark, Brand-Overrides, JSON/CSS/DTCG | Visuelle Gegenprüfung mit Atlas |
| Foundation | Abstände, Typografie, Radius, Borders, Opacity, Motion, Breakpoints, Shell, z-index, Icongrössen | Neutrale Ergänzungen sind Defaults, keine gelieferten CI-Vorgaben |
| Shell | 36 Referenzseiten, Gruppen, Atlas-Lucide-Icons, Cmd-K-Suche, Breadcrumbs, Rail, persistente Auswahl, mobile Navigation | Repräsentative Desktop-Prüfung sowie 320-/390-px-Ansicht bestanden; physische Geräte offen |
| Icons | Alle 1'834 Lucide-Icons der installierten Version, React-Import, Suchkatalog, SVG, ISC-Lizenz | ZVV-Zeichen bewusst ausgeschlossen |
| Inhaltslogik | Atlas-Abschnitte 1–7 neutral übertragen; vollständige lesbare Seite und Agenten-Vertrag | Weitere Projektanlässe und CI-Abnahme |
| Folienkatalog | 18 Rezepte, fünf Presets, 13 Schriftrollen; 14 komplexe Inhaltsmuster aus muster_bausteine.py in gemeinsame Szenen übertragen | Fotos und dekorative Brand-Motive fehlen in strukturellen Folien |
| Deck-Exports | 18 editierbare PPTX mit zugehörigen PDFs, 54 echte Folienbilder, Datenadapter für 18 Rezepte und Quellenmanifest | Import bereitgestellter Corporate-Master |
| Deck-Inhaltsprüfung | JSON-Schema, eigenständiger JS-Validator; Agenda, Quellenreihenfolge je Quelle, Evidenzreferenzen, Vergleiche, Behauptungstyp, Alarmgrenze, Sektionsabschluss | Prüfung aller realen Aussagen und visuelle Abnahme bleiben Aufgabe des ausführenden Agenten |
| Daten-Showcases | TanStack-Tabelle mit 250 Beispielzeilen, Filter, Sortierung, Pagination; Recharts-Balken, Linien, Flächen; ECharts-Balken, Donut, Linie und Heatmap mit SVG-Export und Datentabellen | Weitere spezialisierte Visualisierungen wie Geo-Karten |
| Mermaid | Lokales Rendern, Brand-Wechsel, Fehlerzustand, SVG-Export | Browser-Abnahme der Interaktionen |
| Zustände | Toasts, Empty States, Skeletons, Lightbox und lokale Formularvalidierung | Browser-Abnahme mit Tastatur |
| Abläufe | Login-, Auth-Flow- und HTML-Mail-Muster; kein angebundener Dienst | Integrationsrezepte und End-to-End-Beispiele |
| Prompt-Compiler | Getrennte Aufträge und Abnahmeregeln für Präsentation, Interface und schriftliches Management-Briefing | Kein gehosteter Generator |
| Organigramm | Atlas-Renderer für Organigramm und Zuständigkeiten, Live-Formulare, Public-/Farb-/Aufgaben-Umschalter, SVG-, JSON- und HTML-Export mit JSON-LD | Automatisch aktualisiertes gehostetes Widget und Font-Einbettung |
| Motion | Dauer/Easing-Tokens, wiederholbare CSS-Beispiele, Reduced Motion | Weitergehende neutrale Animationen; Corporate-Lotties ausgeschlossen |
| Techstack/Engineering | Stack, Release-/Review-/Versionsregeln, Browser-Abnahme, Auth-/Daten-/Mail-Verantwortung und Rollback dokumentiert | Anbieterbezogene Integrationsbeispiele in konsumierenden Apps |
| Firmenassets | Rapold mit Original-Signets, lokalen Geist-Fonts und Produkt-Exporten; Dominicano Express mit eigenständigem Preset; Farb- und Formrollen parametrisiert | Import bereitgestellter Corporate-Master und die jeweilige anwendungsbezogene CI-Abnahme |

Kein 100-%-Label: Anzahl übernommener Module, inhaltliche Abdeckung, Laufzeitfunktion und visuelle Parität sind verschiedene Prüfdimensionen.

Die Galerie zeigt 54 echte, versionierte PPTX-Renderings über LibreOffice/PDF. Ein Build-Gate prüft die Referenzdateien gegen die kanonischen Quellen. Ein achtseitiges Projektdeck aus versionierten Repository-Inhalten wurde mit PPTX, PDF und Quellenmanifest ausgeführt. Zahlenbeschriftungen nativer Diagramme werden wie bei Atlas explizit gesetzt, damit das Dezimalkomma unabhängig von Office-Spracheinstellungen bleibt. Nach Datenänderungen die Labels neu erzeugen.

Die Präsentationsseite übernimmt zusätzlich den erklärenden Einstieg, den Erzeugungsablauf, Farb- und Typorollen, gruppierte Galerie, Detailanleitung neben der Folie, fünf Preset-Filmstreifen, Downloads je Preset sowie die sechs Grundregeln. Die direkte visuelle Browser-Gegenprüfung mit der geschützten Atlas-Seite bleibt offen.

## Historische Abnahmen

Diese Befunde dokumentieren die jeweilige frühere Version. Erwähnte ehemalige Brands gehören nicht zur aktuellen Registry.

Version 0.4: Desktop-Navigation, Rail, gefilterte Suche, Brand-Wechsel, Folien-Detailansicht, ECharts und öffentliche Organigramm-Fassung wurden im Browser bedient. Mobilnavigation bei 390 px und Prompt-Compiler bei 320 px wurden geprüft; ein Toolbar-Überlauf wurde behoben. Die direkte visuelle Atlas-Gegenprüfung bleibt wegen nicht abgeschlossener PIN-Anmeldung offen; der Quellcode wurde am genannten Commit geprüft.

### Mermaid und Goldbach · 0.4.1

Die fünf Mermaid-Referenzmuster aus dem oben genannten Atlas-Commit sind als
automatische Galerie mit Vollbild übernommen. Theme-Gruppen, Font-Vermessung und
Textumbruch entsprechen der Quellenlogik; Farben stammen aus der aktiven Brand.
Weitere Diagrammtypen sind nicht vollständig abgenommen. Details: [Mermaid](mermaid.md).
Goldbach zeigt das Original-Logo in der Shell und vier Farbkonstellationen mit
Downloads auf der Brand-Seite. ZIP-Quellen bleiben unverändert; Fotografien und
ein separater Firmen-Icon-Satz sind nicht im gelieferten Paket enthalten.

Tabellen folgen `example/app/(showcase)/tables/page.tsx` desselben Atlas-Commits:
10 × 16 px Zellen, dezente Header- und Hoverflächen, Badges, Monospace-Werte,
Such-Icon und 12 Zeilen pro Seite. Neutrale Bausteindaten ersetzen die Fahrzeugdaten.
Zusätzlich: eindeutige Sortierzustände, rechtsbündige Zahlen, Seitenlängenauswahl,
Filter-Reset und horizontaler Scrollbereich auf Mobilgeräten.

### Theme-Trennung · 0.4.2

Gemäss Benutzerauftrag enthält das Default-Preset keine Goldbach-Informationen.
Corporate-Quellen, Logos, FAQs und Bildwelt-Hinweise erscheinen ausschliesslich im
aktiven Goldbach-Theme. Der Theme-Wähler enthält nur die Namen zur Auswahl.
Jedes Theme hat einen eigenen Agenten-Einstieg unter `/brands/{id}/llms.txt`.
Gemeinsame Verträge setzen keine Firmen-CI voraus. Der Produktionscheck prüft
die Default-Seiten und verhindert Verweise auf fremde Brand-Verträge im Agenten-Einstieg.
