# Atlas ist die verbindliche Referenz

Vom Benutzer ausdrücklich festgelegt: **https://atlas.zvv.dev ist die ultimative Referenz, auch für die Website selbst.** Das zugehörige Quellrepository ist https://github.com/zvvch/zvv-atlas.

## Was sich an Atlas orientiert

- Informationsarchitektur, Seitenaufbau, Navigation und Dokumentationsführung.
- Aufbau von Showcase, Komponentenreferenz und ausführbaren Beispielen.
- Zusammenspiel von Spezifikation, Quellcode, Agenten-Einstieg und maschinenlesbaren Fassungen.
- Komponentenverhalten, Zustände, Bedienbarkeit und Qualitätsanforderungen.
- Präsentationsmuster und Layoutlogik, soweit sie zum Auftrag und zur jeweiligen Firmenvorlage passen.

## Was über die Brand ausgetauscht wird

Farben, Schriften, Logos, Icons, Bildwelt, Tonalität und ausdrücklich definierte Formregeln stammen aus dem gewählten Brand-Paket. Firmenvorgaben gelten ausschliesslich im zugehörigen Theme. Das Default-Preset enthält nur neutrale Informationen. Atlas bleibt die Referenz für das gemeinsame System und die Seite. ZVV-Assets oder interne Dienste gehören nicht in den neutralen Core.

## Vorgehen bei Änderungen

1. Die entsprechende Seite auf `atlas.zvv.dev` und ihren ausführbaren Quellcode prüfen. Bei geschütztem oder nicht zugänglichem Showcase den vorhandenen Repository-Zugriff verwenden und die fehlende visuelle Prüfung offen nennen.
2. Den betrachteten Commit beziehungsweise Seitenstand festhalten. Keine veraltete lokale Kopie als aktuellen Atlas-Stand ausgeben.
3. Das relevante Muster als neutrale Struktur übernehmen und durch semantische Brand-Rollen parametrisieren. Keine neue Seitenarchitektur allein aus persönlicher Designpräferenz erfinden.
4. Jede bewusste Abweichung mit Quelle, Grund und Status dokumentieren. Der Folgeauftrag verlangt mindestens den wiederverwendbaren Atlas-Umfang. Eine frühere Minimalreduktion ist keine Begründung mehr für fehlende Module.
5. Bei beauftragter visueller Abnahme Atlas und die White-Label-Seite anhand der gleichen Nutzungssituation vergleichen. Ein erfolgreicher Build beweist keine visuelle Übereinstimmung.

## Ausgangsstand dieses Repositorys

Die Extraktion basiert auf Atlas-Commit `1c75c95417cc371040e1e24a0986213314b53c13`. Alle 19 exportierten UI-Module sind übernommen und entkoppelt. Die Referenz umfasst 35 Seiten, vollständige Token-Exporte, neutrale Icons und ausführbare Präsentationsmuster. Vollständige Seitenparität mit Atlas und eine visuelle Gegenprüfung sind noch nicht abgeschlossen.

Diese Referenzentscheidung gilt für alle weiteren Arbeiten in `marcelrapold/design`, unabhängig davon, welcher Agent oder Renderer sie ausführt.

## Bewusste Abweichung: Kurzaufträge

Auf Benutzerauftrag vom 11.09.2026 verweist der kopierte Präsentationsprompt auf einen vollständigen Theme-spezifischen Management-Vertrag. Analyse, Defaults, Export und Abnahme liegen dort statt wiederholt im Eingabeprompt. Die Atlas-Seitenstruktur, Layouts, Rezepte und Inhaltslogik bleiben die Referenz. Diese Änderung betrifft die Übergabe an den ausführenden Agenten.

## Rapold-Integration und Web-Audit · 11.10.2026

Für diese Änderung wurde zusätzlich der aktuelle Atlas-Stand `98cd4fd1051d2c0419cde87755ce409e475e2fd6` geprüft: Marken-/Präsenzseite mit echten Exportvorschauen und App-Familie, App-Shell, mobile Navigation und Command-Palette. Die ursprüngliche Extraktionsreferenz bleibt unverändert.

Die bestehende Seitenarchitektur bleibt erhalten. Die Rapold-Markenansicht zeigt produktbezogene Originaldateien, Schutzraum, Favicons, Banner und Downloads innerhalb der vorhandenen Brand-Route. Eine gemeinsame Brand ersetzt vier duplizierte Themes. Der zusätzliche Apple-orientierte Audit beurteilt Web-Usability und Zugänglichkeit; er ersetzt die Atlas-Referenz nicht.

Die Live-Markenansicht von Atlas führt auf eine PIN-Anmeldung. Die sichere Anmeldung wurde durch die Browser-Freigabeprüfung vor einer Übertragung blockiert. Deshalb ist der Atlas-Vergleich für diesen Stand quellenbasiert; eine visuelle Atlas-Parität wird nicht behauptet. Der aktuelle Prüfstatus steht in `docs/apple-design-audit.md`.
