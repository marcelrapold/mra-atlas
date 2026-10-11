# Handover

## Aktuelle Brand-Registry

Der Benutzer hat die Entfernung von Goldbach und Sygnum beauftragt. Aktiv bleiben `neutral`, `dominicano-express` und `rapold`; entfernte Themes, kanonische Quellen, Logos und aktive UI-Verzweigungen werden nicht weiter ausgeliefert. Die Muster-Generierung umfasst damit 18 PPTX-Dateien, 18 PDFs und 54 Folienbilder. Nicht mehr registrierte Ausgabeverzeichnisse werden beim Generieren entfernt.

Nach der Registry-Änderung müssen die Referenzen mit `npm run deck:reference` neu gerendert und mit `npm run check` geprüft werden. Die Bereinigung des Referenzmanifests ersetzt diesen Nachweis nicht und setzt keinen neuen Quellhash. Aktueller Produktions- und Auditstatus: [Deployment](docs/deployment.md) und [Apple-orientierter Audit](docs/apple-design-audit.md).

## Historischer Handover 0.4.0

Die folgenden Abschnitte bewahren den damaligen Liefer- und Prüfstand. Frühere Brand-Aufträge und Deployment-Hindernisse sind historische Fakten; für die weitere Arbeit gilt die aktuelle Registry oben.

## Ziel und Referenz

Vollständiges wiederverwendbares White-Label-Framework auf Atlas-Niveau. Die ursprüngliche Minimalreduktion ist aufgehoben. Atlas-Referenz: 1c75c95417cc371040e1e24a0986213314b53c13. Repository: https://github.com/marcelrapold/design. Autorisierte Produktionsadresse: https://design.rapold.io.

## Implementiert

- 19 Atlas-UI-Module, BrandProvider mit Portal-Kontext, vollständige Foundation- und semantische Rollen sowie JSON/CSS/DTCG-Exporte.
- 35 Referenzseiten mit Atlas-Navigationskonzept, Brand-Wechsel, Suche, Rail und Mobilnavigation.
- 1'834 neutrale Lucide-Icons mit React-Verwendung, Suche, SVG-Download und Herkunftslizenz.
- 18 Folienrezepte, fünf Presets, 13 Schriftrollen und vermessene Layouts. 14 komplexe Inhaltsrezepte aus Atlas nach JavaScript übertragen.
- 12 editierbare Muster-PPTX beim Build. Native Charts, explizite CH-Zahlenlabels, getrennte Tabellenzellen, Original-Goldbach-SVG. Beispieldaten sind als solche bezeichnet.
- Vollständige Inhaltslogik aus Atlas-Abschnitten 1–7, JSON-Eingabeschema und eigenständiger Validator. Quellen vor Kennzahlen, konkrete Evidenzreferenzen, Vergleiche, Schlussfolgerungen und verantwortete Sektionsabschlüsse werden geprüft.
- TanStack-Tabelle, Recharts, Mermaid mit SVG-Export, Toasts, Zustandsmuster, Lightbox, Formularvalidierung, Login-/Auth-/Mail-Muster, formatabhängiger Prompt-Compiler, editierbarer Atlas-Organigramm-Renderer und Motion-Beispiele.

## Prüfung

`npm run check` ist die verbindliche Release-Prüfung: Vertragstests, TypeScript, statischer Produktionsbuild, ausgelieferte CSS-Klassen, Referenzrouten, eigenständiger Validator und Struktur aller zwölf PPTX-Dateien. Native Diagramme müssen editierbare Daten und Dezimalkomma-Beschriftungen enthalten.

Repräsentative Goldbach-PPTX-Folien wurden mit einem unabhängigen PPTX-Import und PNG-Rendering geprüft. Das ist keine native PowerPoint- oder Browser-Abnahme. Keine vollständige visuelle Gegenprüfung mit dem geschützten Atlas-Showcase.

## Deployment

Upload und Produktionsdeployment sind beauftragt. Release 0.4 wurde als Commit `08fe9674e44289b26011e5ad4dd491d7c2483734` auf main veröffentlicht. GitHub Actions Run `34607164270` war erfolgreich. Der Vercel-Connector listete im verbundenen Team kein Projekt; die CLI war nicht angemeldet. Der tatsächliche Preview-Deployment-Aufruf für `design` wurde am 11.09.2026 mit HTTP 403 abgewiesen: "You don't have permission to create a Preview Deployment for this Vercel project: design." Es wurde kein Deployment angelegt. Die Produktionsdomain zeigte weiter Version 0.1.

Der native Git-Rollout ist nach Bestätigung der bestehenden Git-Verbindung wieder aktiviert. Der direkte Vercel-Connector bleibt separat eingeschränkt. Vorgehen und Sollkonfiguration stehen in `docs/deployment.md`. Keine weiteren Login-Schleifen. Ein Push bestätigt nur den Repository-Stand. Produktionsnachweis ist ein erfolgreicher Abruf von `/build-info.json` mit dem tatsächlich ausgerollten Commit.

## Verbleibende Arbeit

Die verbindliche Lückenliste steht in docs/atlas-coverage.md. Priorität: Produktionsprojekt zugänglich machen und neuen Build ausliefern; Website und Interaktionen gegen Atlas prüfen; reale Projektinhalte durch den Deck-Vertrag bis zur exportierten Präsentation führen. Der Datenadapter für alle 18 Rezepte ist implementiert. Ein achtseitiges Briefing wurde gegen historische Git-Objekte geprüft und als PPTX/PDF/Quellenmanifest exportiert. Corporate-Master-Import, ein automatisch aktualisiertes gehostetes Organigramm-Widget, Font-Einbettung, spezialisierte Visualisierungen und anbieterspezifische Integrationsbeispiele bleiben offen. ECharts, der Organigramm-Editor und Engineering-Regeln sind seit 0.4 vorhanden.

Goldbach bleibt ein CI-Entwurf aus den gelieferten Vorgaben. Sygnum erst nach gelieferten Quellen ergänzen. Original-LICENSE bleibt erhalten; öffentliche Quellablage und freie Neulizenzierung sind verschiedene Entscheidungen. Keine ZVV-Assets oder internen Dienste übernehmen.

## Neuer Stand 0.3

Präsentationsseite strukturell an Atlas angeglichen, inklusive 36 echten PNG-Vorschauen, 12 PDFs, Detailanleitungen und Preset-Filmstreifen. Versionierte Bilder besitzen einen Inhaltsfingerprint; veraltete Bilder lassen den Build fehlschlagen. Renderanleitung in docs/project-decks.md. Der Projektexport setzt keine Musterfakten ein und prüft Quellen, Textkapazitäten, Vergleichsperioden, Datenformat und Abschnittsreihenfolge. Neue Brands können Original-Logos und genaue Schriftschnittnamen konfigurieren.


## Fortsetzung am 11.09.2026 · 0.4

Der Benutzer bestätigte ausdrücklich seine Berechtigung und die Freigabe zur Übernahme und öffentlichen Veröffentlichung der Atlas-Bestandteile. Die Sicherheitsunterbrechung des vorherigen Chats wurde von ihm ausdrücklich zur Fortsetzung freigegeben. LICENSE bleibt unverändert.

Quellabgleich: Die 155 Dateien des GitHub-Commits 37604af16dd32840efd41022fb53aba46639421b entsprachen bytegenau der übernommenen Arbeitskopie. Die Produktionsdomain zeigte zum Beginn dieses Durchlaufs weiterhin die alte Einseitenfassung 0.1.

Ergänzt: Atlas-Navigationsicons inklusive Rail/Command-Suche, formatabhängiger Prompt-Compiler, Engineering-Vertrag, Versionsquelle package.json, Sprungnavigation für die Präsentation, Atlas-Organigramm- und Zuständigkeitsrenderer mit Editor und Exporten sowie Apache ECharts mit vier Diagrammtypen. Der ECharts-Browserbuild wird von Apache 6.0.0 unverändert lokal ausgeliefert und gegen den upstream Git-Blob geprüft.

Die neue Referenz wurde im Browser geöffnet. Desktop-Navigation, Rail, gefilterte Seitensuche und Brand-Wechsel funktionieren; ein Goldbach-KPI-Board mit echten Folienbildern und Detailregeln wurde visuell geprüft. ECharts wurde in Goldbach und neutralem Dark Mode geprüft. Mobile Navigation und Auswahl wurden bei 390 px bedient, der Prompt-Compiler bei 320 px geprüft. Ein Toolbar-Überlauf bei 320 px wurde korrigiert; gemessene Inhalts- und Scrollbreite stimmen danach überein. Das ist keine Prüfung auf physischer Mobilhardware. Die öffentliche Organigramm-Fassung entfernt Namen auch aus den exportierten Daten und der JSON-LD-Struktur. Die direkte Anmeldung bei Atlas im Browser wurde nicht abgeschlossen; der Referenz-Quellstand ist über GitHub verfügbar und geprüft.

Release-Prüfung: npm run check. Produktion erst mit passendem build-info.json als ausgeliefert bezeichnen. Vercel-Connector listete in dieser Sitzung keine Projekte, CLI war abgemeldet. Keine erfolgreiche Produktionsauslieferung allein aus dem GitHub-Commit ableiten.

## CI/CD-Fortsetzung: native Git-Integration

Der Benutzer bestätigt, dass GitHub bereits direkt mit dem Vercel-Projekt verbunden ist. Die separate GitHub-Actions-Deployment-Pipeline aus cf57f7c war deshalb unnötig und ist entfernt. Die zuvor gesetzte Sperre git.deploymentEnabled=false ist aufgehoben; main löst native Vercel-Deployments aus. Vercel verwendet npm run check als Build-Befehl und veröffentlicht nur nach erfolgreicher Prüfung. GitHub Actions führt zusätzlich den Check aus und benötigt keine Vercel-Secrets. Der direkte Vercel-Connector-Zugang ist von dieser Git-Verbindung unabhängig. Die historischen 403/404-Antworten belegen keine fehlende native Git-Verknüpfung. Den tatsächlichen Rollout über GitHub-Commitstatus und build-info.json prüfen. Details: docs/deployment.md.
