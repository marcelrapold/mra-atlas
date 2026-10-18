# EdgePortal in Atlas

**Am TV: Ist-Stand, verbindlich.** Atlas dokumentiert den Fernseher so, wie EdgePortal ihn heute zeigt, und baut ihn 1:1 nach. Atlas ändert am TV nichts. Sichtbar auf der Brand-Seite unter [EdgePortal: der TV, wie er ist](https://atlas.rapold.io/brand?brand=rapold#edgeportal-ci).

**Steuerung (edgeportal.rapold.io): Atlas-Standard.** Die Admin-Oberfläche darf sich leicht an Atlas angleichen, mit Atlas-Komponenten und Tokens und später als npm-Paket.

| Datei | Inhalt |
|---|---|
| [`tv/stage.css`](tv/stage.css) | Kopie von `app/stage.css`: Bühne, Kopfzeile, Poster-Karten, Zustände, RadioX-Leiste, Fokus, Terminals |
| [`tv/presence.css`](tv/presence.css) | Kopie von `app/presence.css`: Präsenz, Gast, Ruhemodus, Kamerahinweis |
| [`tv/screen-nav.css`](tv/screen-nav.css) | Kopie von `app/screen-nav.css`: Übersicht und Kameras, im Rahmen positioniert |
| [`tv/tv-power.css`](tv/tv-power.css) | Kopie von `app/tv-power.css`: TV an und aus, im Rahmen positioniert |
| [`edgeportal.json`](edgeportal.json) | Werte, Zustände, Texte, Tasten und Grüsse am TV; Regeln der Steuerung; Namen; optionale Ideen |
| [`edgeportal.css`](edgeportal.css) | Seitenrahmen für den Nachbau und die Steuerung auf dem Phone |
| `tests/edgeportal-ci.test.mjs` | Prüft Commit-Angaben, Skalierung, Tokens gegen die Kopien und gegen die Rapold-Rollen, Zustände und Grüsse |

## Quelle

`marcelrapold/mra-edgeportal` (privat) bei Commit `e46563c`, dazu Screenshots des Wohnzimmer-Screens im Spiegel (3840 × 2160) und der Steuerung vom 18.10.2026. Die Kopien tragen den Commit im Kopfkommentar.

Umgerechnet für den Rahmen und nur dort:

- Übersicht und TV an/aus: `position: fixed` wird `absolute`, `vw` wird `cqi`. Der Rahmen ist ein virtueller TV mit 3840 × 2160 Pixeln, der als Ganzes verkleinert wird, deshalb gelten alle Werte unverändert.
- Ausgelassen sind die Controller-Einstellungen in `stage.css` und eine Handy-Regel in `screen-nav.css`.

## Nachführen

Ändert sich der TV im Produkt, werden die vier Kopien und `edgeportal.json` mit dem neuen Commit nachgeführt. Von Hand angeglichen wird nichts. Bis EdgePortal Atlas als Paket bezieht, bleibt das Produkt die Quelle für den TV.

## Öffentlich

Die Atlas-Seite zeigt den TV mit neutralen Beispielen: keine echten Gerätenamen, Orte, Hosts, Personen oder Porträts. Gestaltung, Grössen und Texte des Produkts bleiben unverändert.

## Ideen

`edgeportal.json → ideas` sammelt Vorschläge, etwa 28 px Grundschrift für die Wand-Distanz, zusätzliche Statusbildschirme oder den neuen Systemstart aus [DESIGN-DNA 7.1](../../rapold-io/DESIGN-DNA.md#71-korona-und-ridgeline-im-systemstart-bewusste-abweichung-a1). Sie ändern den TV nicht und werden nur umgesetzt, wenn Marcel es ausdrücklich will.
