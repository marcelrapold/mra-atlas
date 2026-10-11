# Repository und Veröffentlichung

Zielrepository: https://github.com/marcelrapold/mra-atlas. Der Benutzer hat dieses Repository erstellt und den vollständigen Upload ausdrücklich beauftragt. Die Sichtbarkeit ist öffentlich. Es wird keine freie Neulizenzierung daraus abgeleitet.

## Quellstand übernehmen

```sh
git clone https://github.com/marcelrapold/mra-atlas.git
cd design
npm ci
npm run check
```

Die vorhandene Initial-Historie des Zielrepositorys bleibt erhalten.

## Open-Source-Release

Lizenz: «Alle Rechte vorbehalten», Marcel Rapold (`LICENSE`). Drittlizenzen werden mit ausgeliefert.

## Webbetrieb

`npm run build` erzeugt einen statischen Export in `apps/docs/out`. Diese Dateien benötigen keinen Auth-, Datenbank- oder API-Server. Ziel: `atlas.rapold.io`. Kein automatischer DNS-Wechsel, kein Deployment-Token und keine ZVV-Umgebungsvariable werden übernommen. Upload und Produktionsdeployment sind vom Benutzer beauftragt. Der Lizenzstatus bleibt davon getrennt dokumentiert.

Für einen späteren Generator werden Repo-Leserechte und ein Präsentationsrenderer benötigt. Der aktuell implementierte Einstieg `/llms.txt` liefert den Auftrag an den Agenten, kein Backend und keine angebliche PPTX-API.

Der aktuelle Quellstand erzeugt die Muster-PPTX beim Build. Produktionsnachweis: /build-info.json muss den veröffentlichten Commit zeigen. Ein erfolgreicher GitHub-Check allein bestätigt kein Vercel-Deployment.
