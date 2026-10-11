# Engineering-Vertrag

Diese Regeln beschreiben die Arbeit an und mit Atlas. Bestehende projektspezifische Arbeitsregeln und ausdrücklich autorisierte Release-Abläufe haben Vorrang.

## Branches und Umgebungen

main bezeichnet den Produktionsstand. Für Anwendungen mit Integrationstestumgebung zweigen feat/, fix/, chore/ und refactor/ von integration ab und werden über Pull Requests dorthin zurückgeführt. Geprüfte Releases gehen von integration nach main. Ein dringend notwendiger hotfix/ zweigt von main ab und wird anschliessend in integration übernommen.

Ein einzelner Maintainer kann für Dokumentation und begrenzte Änderungen direkt auf main arbeiten, sofern der Projektvertrag das erlaubt. Dieses Repository folgt dieser Ausnahme; der Benutzer hat Upload und Produktionsrollout ausdrücklich beauftragt. Eine tatsächlich eingerichtete Branch Protection bleibt verbindlich. Das Framework verändert keine Repository-Berechtigungen.

## Commits und Reviews

Conventional Commits mit fachlichem Scope: feat(presentation), fix(navigation), docs(engineering), build(contracts). Der Betreff beschreibt die Änderung; der Text erklärt den Grund und das resultierende Verhalten. Zusammenhängende Änderungen werden gemeinsam eingecheckt. Ein Review nennt Problem, Lösung, Nachweis und verbleibende Einschränkungen.

Änderungen an Authentifizierung, Berechtigungen, Datenmodellen und externen Schnittstellen erfordern eine gezielte Prüfung. Für Schemaänderungen gehören Migrationsreihenfolge und Rückweg zum Release. Ein grüner Build belegt weder fachliche Korrektheit noch visuelle Abnahme.

## Version und Herkunft

MAJOR kennzeichnet inkompatible Vertragsänderungen. MINOR ergänzt kompatible Funktionen. PATCH korrigiert Verhalten oder Dokumentation. Die Version in package.json ist die Quelle für Website und build-info.json; Versionen werden nicht separat in Komponenten eingetragen. CHANGELOG.md beschreibt jedes Release. Die Herkunft übernommenen Codes wird mit einem konkreten Commit dokumentiert (docs/extraction.md).

Version, Commit und Build-Zeit bleiben maschinenlesbar. Der Produktionsnachweis vergleicht build-info.json der Zieldomain mit dem ausgelieferten Git-Commit. Eine erreichbare Domain oder ein erfolgreicher GitHub-Push allein bestätigt keinen neuen Produktionsstand.

## Reproduzierbare Prüfung

npm ci installiert das versionierte Lockfile. npm run check ist der gemeinsame Prüfeinstieg für lokale Arbeit und CI. Der aktuelle Prüfvertrag umfasst Brand-Schema, Kontraste, Core-Isolation, Inhalts- und Exportverträge, TypeScript, statischen Build, ausgelieferte Komponentenklassen, Referenzrouten und die zwölf PowerPoint-Decks. Der Build prüft zusätzlich die Prüfsummen aller 36 Folienbilder und zwölf PDFs.

Abhängigkeiten und Actions werden auf nachvollziehbare Versionen fixiert. Änderungen an Hauptversionen werden separat geprüft. Die Runtime-Version wird im Projekt festgelegt; CI und Entwicklung verwenden denselben Stand. Zusätzliche Lint-, Format- und Grössenprüfungen sind im jeweiligen Projekt ausdrücklich zu konfigurieren, bevor sie als bestehendes Prüftor behauptet werden.

## Browser-Abnahme

- Den primären Ablauf bedienen: Einstieg, Navigation, Brand-Auswahl, Suche und Ergebnis.
- Dialoge mit Tastatur öffnen und per Escape schliessen; Fokus muss zum Auslöser zurückkehren.
- Helle und dunkle Darstellung prüfen, soweit die Brand beide definiert. Ein nicht unterstützter Modus darf keine erfundenen Brand-Farben verwenden.
- Schmale Ansicht und vergrösserte Schrift prüfen. Tabellen und Diagramme erhalten einen eigenen Scrollbereich statt eines überbreiten Seitenlayouts.
- Diagramme mit zugänglichen Daten und benannten Serien versehen. Lade-, Leer-, Fehler- und Erfolgszustände gehören zum selben Ablauf.
- Downloads auf tatsächlichen Inhalt, Format und verwendete Brand prüfen. Folienbilder werden mit der exportierten Präsentation abgeglichen.

## Daten, Authentifizierung und Mail

Der Core enthält Gestaltung und Interaktionsmuster. Serveranwendungen verantworten Sessions, Rollen, Mandantentrennung und Autorisierung. Ein Client-Filter ersetzt keine serverseitige Prüfung. Geheimnisse bleiben ausserhalb des Browser-Bundles. Öffentliche Anmeldeantworten geben keine Auskunft darüber, ob ein Konto existiert; Token sind kurzlebig und einmalig.

Mailvorlagen werden getrennt von ihrem Transport geprüft. Der Showcase bietet eine isolierte HTML-Vorschau ohne Versand. Ein integrierter Mailer benötigt dokumentierte Absender, Fehlerbehandlung, Wiederholung und Zustellnachweise. Konkrete Unternehmensdienste werden im konsumierenden Projekt konfiguriert.

## Betrieb und Rollback

Produktionsreleases benötigen einen erfolgreich geprüften Quellstand, abgeschlossenen Deploymentstatus und Abruf der Zieldomain. Die letzte funktionsfähige Version bleibt als Rückfallpunkt bekannt. Ein statischer Rollback stellt ein früheres Deployment wieder her; Datenmigrationen benötigen einen separat geprüften Rückweg.

Logs enthalten technische Ereignisse und korrelierbare Request-IDs. Personenbezogene Inhalte und Zugangsdaten gehören nicht in Fehlermeldungen. Health-Antworten unterscheiden Prozesszustand, notwendige Abhängigkeiten und fachliche Funktionsfähigkeit. Die statische Referenz zeigt ausschliesslich ihren eigenen Buildstand.

## Abweichungen dokumentieren

Jede bewusste Abweichung vom Vertrag nennt betroffenes Muster, Entscheidung, Grund und Prüfnachweis. Dokumentierte Muster, implementierte Funktionen, getestete Interaktionen und freigegebene Corporate-Assets bleiben getrennte Aussagen. HANDOFF.md führt die offenen Punkte.
