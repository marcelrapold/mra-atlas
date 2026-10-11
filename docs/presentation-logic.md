# Präsentationslogik

Verbindlicher Inhaltsvertrag von Atlas für Management-Präsentationen. Die Brand bestimmt Identität und ausdrückliche CI-Vorgaben. Struktur, Evidenzlogik und Konstruktion bleiben erhalten.

## Dramaturgie vor Gestaltung

Vor dem Folienbau stehen Entscheidungsfrage, Zielgruppe, Anlass und Sektionsgliederung fest. Pro Sektion 2–6 Folien; Abschluss ist ein Entscheid, ein Auftrag oder ein ausdrücklich benannter Klärungspunkt. Eine reine Statussammlung erfüllt den Vertrag nicht.

Standardbogen: Cover, Agenda, Kapitel, Evidenzsektionen mit Entscheidabschluss, Schluss, Quellenregister und Management-Summary. Die fünf kuratierten Presets sind bewusste Varianten dieses Bogens. Eine kompakte Entscheidungsvorlage braucht beispielsweise keine Kapiteltrenner. Presets bestimmen die Reihenfolge, die Evidenzpflicht gilt in allen Varianten.

Agenda-Einträge entsprechen wortgleich den Sektionstiteln. Die Management-Summary beschreibt Veränderungen und anstehende Entscheidungen, keine Wiederholung sämtlicher Folien.

## Anatomie der Arbeitsfolie

1. Botschafts-Titel: eine belegte Aussage. Agenda und Kapiteltrenner dürfen Themen-Titel tragen.
2. Lead: Zeitraum und Quelle.
3. Evidenz: nachvollziehbare Daten, Befund oder Vergleich.
4. Räumlich getrennte Deutung mit klarer Kernaussage.
5. Quellenzeile mit System-/Repository-ID, Abrufdatum und Methodik. Bei Repository-Analyse zusätzlich Commit und Pfad.

Auf allen Arbeitsfolien dasselbe Fünf-Zonen-Gerüst aus den Deck-Tokens. Keine frei geschätzten Koordinaten. Titel, Cover und Kapitel zählen in der Seitenfolge mit, ihre sichtbare Seitenzahl entfällt.

## Erst Quelle, dann Zahl: drei Ebenen

Vor der ersten Kennzahl steht eine Quellenfolie, welche Herkunft und Datenumfang erklärt. Der Lead jeder Datenfolie nennt Zeitraum und Quelle. Die Fusszeile wiederholt Herkunft und Abrufdatum. Jede Kennzahl braucht Einheit, Zeitraum und einen sinnvollen Vergleichsanker. Ein fehlender Vergleich wird als offene Frage behandelt, nicht durch einen erfundenen Wert ersetzt.

Eine auffällige Kennzahl wird als Prüfgeschichte aufgebaut: Meldung, Ursache, geprüfte Zahl. Unabhängige Gegenproben und Restunsicherheit gehören dazu. «Noch zu klären» kennzeichnet fehlende Belege; Annahmen und Prognosen werden explizit benannt. Vertraulichkeitskennzeichnung stammt aus dem Projekt, nicht aus dem neutralen Core.

## Diagrammwahl und Semantik

- Exakte Werte: getrennte Textbox-Spalten, typischerweise höchstens sechs Datenzeilen plus Total. Zahlen rechtsbündig. Keine ungeprüft übernommenen PowerPoint-Tabellenstile.
- Kategorien/Ranking bis zehn Einträge: horizontale Shape-Balken mit gemeinsamer Nulllinie und Wert am Ende. Keine zusätzliche Achse oder Legende.
- Zwei Perioden: natives Säulendiagramm, Vorperiode links/hinten in neutraler Farbe. KPI-Kacheln kommen vor dem Detailchart.
- Roadmaps, komplexe Verläufe und Flows: aus strukturierten Daten extern rendern, Quellen und Rendering-Pipeline angeben. Linien erhalten Endlabels in Serienfarbe.
- Jede Visualisierung erhält eine Einordnung als Takeaway oder hervorgehobenen Deutungssatz.

Primary bezeichnet aktuelle Aussage. Vergleich/Vorjahr ist neutral. Warning bedeutet Klärungsbedarf, Success positiv, Danger echten Alarm. Negative arithmetische Veränderungen sind neutral, ausser explizit beschrifteten KPI-Deltas. Maximal ein Alarm-Element je Folie. Höchstens ein bis zwei hervorgehobene Aussageflächen. Farbige Diagrammserien müssen zu ihren Karten/Pills auf derselben Folie passen. Semantische Palette gilt auch im Anhang.

## Form und Konstruktion

Folie 33,867 × 19,05 cm. Nutzbreite 32 cm, linker/rechter Rand 0,93 cm. Alle 13 Typorollen, fünf Spaltenraster und Formmasse kommen aus dem aktiven Präsentationsvertrag. Textboxen haben Insets 0, liegen getrennt über den Karten und verwenden absolute Positionen statt Absatzabständen. Karten sind eckig, ohne Rahmen oder Schatten; Rundung nur für Pills, Ellipsen für Nummern und Timeline-Knoten. Brand-Ausnahmen müssen ausdrücklich belegt sein.

Fotoslots brauchen ein passendes Originalmotiv. Vollbildmotiv mindestens etwa 2'400 px breit. Cover-Bilder proportional füllend beschneiden, Logos und Diagramme proportional einpassen. SVG-Logos unverändert übernehmen. Rechte, Quelle und Nutzungsbeschränkungen je Asset prüfen. Ohne verfügbares Motiv bleibt ein Muster sichtbar als Platzhalter gekennzeichnet; ein fertiges Projektdeck darf keinen solchen Platzhalter enthalten.

## Sprache und Zahlen

Schweizer Hochdeutsch, ss und Guillemets. Aktive kurze Sätze, präzise Begriffe, keine Füllwörter. Eine echte Aussage als Titel, keine überzogenen Wirkungsversprechen. Wir-Form nur, wenn der tatsächliche Absender dies verlangt. Maximal eine Alltagsmetapher je Folie. Im Fliesstext sinnvoll runden, in Tabellen und KPI-Anzeigen exakte Werte.

Zahlen: 4'207'156; 5,01 Mio.; CHF 86'341.35; echtes Minus −; 50,7 %; Datum TT.MM.JJJJ. Vergleichsanker unterscheiden relative Prozent und Prozentpunkte. Keine automatische Systemsprachen-Formatierung von Chartlabels übernehmen.

## Abnahme

Vor Abgabe: Dramaturgie, Agenda, Sektionsabschluss, Belege, Vergleichsanker, Zahlenformat, Farbsemantik, Textüberlauf, Editierbarkeit und jede gerenderte Folie prüfen. Warnungen nicht durch Textverkleinerung verstecken. Die JSON-Prüfung ersetzt weder die Bewertung der Aussage noch die visuelle Abnahme.

Bekannte Mechanik: Foliennummern werden als eigene Textbox erzeugt. Cover-Untertitel dürfen keine geerbten Bullets enthalten. Native Chartlabels erhalten explizit formatierten Text. Ein bestehender Corporate-Master hat Vorrang vor einem neutralen Framework-Master.
