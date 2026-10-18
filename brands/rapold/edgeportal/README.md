# EdgePortal in Atlas

**Am TV: Ist-Stand, verbindlich.** Atlas dokumentiert den Fernseher so, wie EdgePortal ihn heute zeigt, und baut ihn 1:1 nach: jede Ansicht mit Auslöser und Quelle im Katalog `views.json`, nach Bereichen von der Bühne bis zu den lokalen Seiten des Pi. Atlas ändert am TV nichts. Sichtbar auf der Brand-Seite unter [EdgePortal: der TV, wie er ist](https://atlas.rapold.io/brand?brand=rapold#edgeportal-ci).

**Steuerung (edgeportal.rapold.io): Atlas-Standard.** Die Admin-Oberfläche darf sich leicht an Atlas angleichen, mit Atlas-Komponenten und Tokens und später als npm-Paket.

| Datei | Inhalt |
|---|---|
| [`tv/`](tv/) | Kopien der TV-Stylesheets, je mit Quelle und Commit im Kopf: `base.css` (Grundregeln aus `globals.css`), `stage.css`, `autopilot.css`, `hermes-stack.css`, `argus.css`, `presence.css`, `voice.css`, `perception.css`, `screen-nav.css`, `radiox.css`, `tv-power.css`, `mirror.css`, `screen.css`, dazu `pi-setup.css` und `bootstrap.css` für die lokalen Seiten des Pi |
| [`views.json`](views.json) | Katalog aller Ansichten am TV mit Bereich, Auslöser, Quelle und Stand («nachgebaut» oder «dokumentiert» mit Grund) |
| [`edgeportal.json`](edgeportal.json) | Werte, Zustände, Texte, Tasten und Grüsse am TV; Regeln der Steuerung; Namen; optionale Ideen |
| [`edgeportal.css`](edgeportal.css) | Seitenrahmen für den Nachbau und die Steuerung auf dem Phone |
| `apps/docs/app/_components/edgeportal/*.tsx` | Nachbau je Bereich: gemeinsames Markup in `shared.tsx`, Ansichten als Liste mit Id; die Brand-Seite ordnet sie nach `views.json` |
| `tests/edgeportal-ci.test.mjs` | Prüft Commit-Angaben aller Kopien, Skalierung, Tokens gegen die Kopien und gegen die Rapold-Rollen, Zustände, Grüsse und dass Katalog und Nachbau übereinstimmen |

## Quelle

`marcelrapold/mra-edgeportal` (privat) bei Commit `e46563c`, dazu Screenshots des Wohnzimmer-Screens im Spiegel (3840 × 2160) und der Steuerung vom 18.10.2026. Die Kopien tragen den Commit im Kopfkommentar.

Umgerechnet für den Rahmen und nur dort:

- Der Rahmen ist ein virtueller TV mit 3840 × 2160 Pixeln (Hochformat 2160 × 3840, ultrabreit 5120 × 2160), der als Ganzes verkleinert wird. Deshalb gelten alle Werte unverändert.
- `position: fixed` wird `absolute`, `vw` wird `cqi`, wo eine Kopie das braucht. Regeln aus `globals.css` stehen in einem Block `:where(.ep-tv-screen)` und gelten nur im Rahmen.
- Grundregeln der Atlas-Doku, die das Produkt nicht hat (Laufweite von `h2` und `h3`, `pre`, Strichstärke der Icons), setzt `edgeportal.css` im Rahmen zurück.
- Ausgelassen sind die Controller-Einstellungen in `stage.css` und eine Handy-Regel in `screen-nav.css`.
- Momentaufnahmen von Blenden halten Deckkraft und Animation inline fest; im Produkt laufen sie über Sekunden.

## Nachführen

Ändert sich der TV im Produkt, werden die Kopien, `edgeportal.json` und `views.json` mit dem neuen Commit nachgeführt. Eine neue Ansicht kommt zuerst in den Katalog und dann als Rahmen in das passende Modul. Von Hand angeglichen wird nichts. Bis EdgePortal Atlas als Paket bezieht, bleibt das Produkt die Quelle für den TV.

## Öffentlich

Die Atlas-Seite zeigt den TV mit neutralen Beispielen: keine echten Gerätenamen, Orte, Hosts, Personen oder Porträts. Gestaltung, Grössen und Texte des Produkts bleiben unverändert.

## Ideen

`edgeportal.json → ideas` sammelt Vorschläge, etwa 28 px Grundschrift für die Wand-Distanz, zusätzliche Statusbildschirme oder den neuen Systemstart aus [DESIGN-DNA 7.1](../../rapold-io/DESIGN-DNA.md#71-korona-und-ridgeline-im-systemstart-bewusste-abweichung-a1). Sie ändern den TV nicht und werden nur umgesetzt, wenn Marcel es ausdrücklich will.
