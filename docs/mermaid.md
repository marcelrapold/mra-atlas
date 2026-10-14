# Mermaid-Diagramme

Die Referenzseite zeigt fünf Muster: Flussdiagramm, Sequenzdiagramm,
Zeitstrahl, Torte und lange Beschriftungen. Beispiele sind illustrative Daten.
Alle Diagramme rendern automatisch und öffnen im vorhandenen Lightbox-Modul.
Der zusätzliche Editor bietet Quelltext, SVG- und MMD-Download und Copy-Rückmeldung.

## Brand und Darstellung

`packages/brands/src/mermaid-theme.mjs` liefert die vollständigen Farbgruppen.
Neutrale Flächen, Texte, Konturen, Akteure, Signale, Schleifen und Notizen kommen
aus den aktiven semantischen Brand-Tokens. Zwölf Kategorien steuern Timeline,
Journey und Pie; acht steuern GitGraph. Die Kategorien bleiben zwischen Hell und
Dunkel konstant, mit mindestens 4,5:1 Kontrast zu weissen Beschriftungen.
Torten sind vollständig deckend und haben abgegrenzte Segmente.
`mermaidThemeCSS` hält Timeline-Achsen sichtbar und entfernt die automatische
120-Prozent-Aufhellung der Ereignisflächen. Die Korrektur wird ins SVG exportiert;
so bleiben Brand-Farben und Textkontraste auch im Download erhalten.

Die Kategorien verwenden ausschliesslich die
Identitätsfarben der aktiven Brand. Andere Firmenpaletten werden nicht übernommen. Flowchart-Klassen `source`, `delivery` und `consumer`
benennen Rollen statt Unternehmensfarben. Explizite `classDef`-Farben im eigenen
Quelltext haben Vorrang vor dem Theme; ein kopiertes Beispiel enthält die Farben
der zum Kopierzeitpunkt aktiven Brand.

Exporte: `/brands/{id}/mermaid.{mode}.json`. Das Dokument enthält Theme-Variablen,
Klassen und Flowchart-Geometrie. Es dient auch als Agenten-Vertrag.

## Rendern und Vermessen

- Mermaid als lokales npm-Bundle laden, `securityLevel: strict` beibehalten.
- Auf `document.fonts.ready` warten; dieselbe Schrift für Vermessung und SVG nutzen.
- Messcontainer mit `visibility: hidden` ausserhalb der Ansicht positionieren,
  niemals mit `display: none`; er bleibt Teil des Brand-Bereichs.
- `look: classic` explizit setzen: Mermaid 12 verwendet sonst Neo-Schatten.
- Flowchart: `wrappingWidth: 260`, `padding: 10`. Kantenbeschriftungen kurz halten.
- `initialize` und `render` gemeinsam serialisieren, da Mermaid globale Konfiguration hat.
- Veraltete Ergebnisse nach einem Brand-Wechsel verwerfen, Messcontainer auch bei
  Syntaxfehlern leeren. Keine Mermaid-Fehlergrafik am Dokumentende hinterlassen.
- Definitionen auf 30 000 Zeichen und 500 Kanten begrenzen.
- SVG mit unverzerrtem Seitenverhältnis zeigen. Vollbild über dieselbe Lightbox
  mit Fokusfalle, Escape und Rückkehr zum Auslöser anbieten.
- Erst rendern, wenn das Diagramm in die Nähe des sichtbaren Bereichs kommt
  (IntersectionObserver, 400 px Vorlauf). Ausserhalb bleibt das letzte SVG stehen und
  gilt nach einem Brand- oder Moduswechsel als veraltet, bis es wieder in der Nähe ist.
- Zwischen zwei Diagrammen dem Browser eine Runde lassen (`scheduler.yield`,
  sonst `setTimeout`). Das Mermaid-Bundle im Leerlauf vorladen.
- Das beim ersten Rendern gemessene Seitenverhältnis beibehalten. Ein Brand-Wechsel
  rendert in denselben Rahmen und verschiebt den Inhalt darunter nicht.

## Barrierefreiheit

- Jede Definition beginnt mit accTitle und accDescr, direkt nach der Typzeile.
  Mermaid schreibt sie als `<title>` und `<desc>` ins SVG; Screenreader erhalten so
  Titel und Kernaussage, auch im Download.
- accTitle nennt das Diagramm, accDescr die Aussage in einem bis zwei Sätzen.
  Illustrative Werte als solche kennzeichnen.
- Farbe unterstützt die Orientierung, trägt aber nie allein die Bedeutung.
  Kategorien, Segmente und Rollen sind immer beschriftet.

## Abdeckung

Flowchart, Sequence, Timeline und Pie haben sichtbare Beispiele. Journey und
GitGraph besitzen vorbereitete Paletten, aber noch keine eigene Abnahme. Weitere
Mermaid-Typen sind nicht vollständig auf die Brand geprüft. SVG enthält Schrift-
referenzen; für dieselbe Darstellung ausserhalb der Website muss Inter verfügbar sein.
