# Repository und Veröffentlichung

Zielrepository: https://github.com/marcelrapold/design. Der Benutzer hat dieses Repository erstellt und den vollständigen Upload ausdrücklich beauftragt. Die Sichtbarkeit ist öffentlich. Es wird keine freie Neulizenzierung daraus abgeleitet.

## Quellstand übernehmen

```sh
git clone https://github.com/marcelrapold/design.git
cd design
npm ci
npm run check
```

Die vorhandene Initial-Historie des Zielrepositorys bleibt erhalten. Der lokale Code-Auszug (Herkunft: docs/extraction.md) wird als zusammenhängender Import übernommen.

## Open-Source-Release

Die Original-LICENSE beschränkt Verteilung ausserhalb ZVV/Mandatsträger und verlangt schriftliche Zustimmung der ZVV ICT. Das Core-White-Labeling allein ersetzt diese Freigabe nicht. Vor einer freien Lizenz muss der erlaubte Umfang der extrahierten Dateien dokumentiert werden. Brand-Quellen und Assets behalten ihren separaten Rechte- und Freigabestatus. Ihr beauftragter Upload erteilt keine allgemeine Nutzungslizenz. Danach können Code-Lizenz, Package-Publish-Konfiguration und Sichtbarkeit gezielt gesetzt werden.

## Webbetrieb

`npm run build` erzeugt einen statischen Export in `apps/docs/out`. Diese Dateien benötigen keinen Auth-, Datenbank- oder API-Server. Ziel: `atlas.rapold.io`. Kein automatischer DNS-Wechsel, kein Deployment-Token und keine ZVV-Umgebungsvariable werden übernommen. Upload und Produktionsdeployment sind vom Benutzer beauftragt. Der Lizenzstatus bleibt davon getrennt dokumentiert.

Für einen späteren Generator werden Repo-Leserechte und ein Präsentationsrenderer benötigt. Der aktuell implementierte Einstieg `/llms.txt` liefert den Auftrag an den Agenten, kein Backend und keine angebliche PPTX-API.

Der aktuelle Quellstand erzeugt die Muster-PPTX beim Build. Produktionsnachweis: /build-info.json muss den veröffentlichten Commit zeigen. Ein erfolgreicher GitHub-Check allein bestätigt kein Vercel-Deployment.
