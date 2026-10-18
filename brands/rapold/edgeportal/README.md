# EdgePortal-CI

**Status: Vorschlag vom 18.10.2026.** Die vollständige Oberfläche von EdgePortal, aufgebaut auf der Brand `rapold` und dem Systemstart aus [DESIGN-DNA 7.1](../../rapold-io/DESIGN-DNA.md#71-korona-und-ridgeline-im-systemstart-bewusste-abweichung-a1). Sichtbar auf der Brand-Seite unter [EdgePortal-CI](https://atlas.rapold.io/brand?brand=rapold#edgeportal-ci).

| Datei | Inhalt |
|---|---|
| [`edgeportal.json`](edgeportal.json) | Spezifikation: Prinzipien, Namen, Distanzprofile, Wall-Tokens, Flächen, Status Screens, Zustände, Bewegung, Fernbedienung, Grussquelle, Quellen und Annahmen |
| [`edgeportal.css`](edgeportal.css) | Bildschirm-Styles mit den Wall-Tokens (`--ep-*`), geladen von der Brand-Seite |
| `tests/edgeportal-ci.test.mjs` | Prüft die Tokens gegen die dunklen Rapold-Rollen, die Kontrastregeln, die Wall-Skala und das Zustandsvokabular |

## Kern

EdgePortal macht jeden Bildschirm in einem Raum zu einer gekoppelten, ruhigen Fläche. Drei Prinzipien tragen jede Entscheidung: **Anzeigen, nicht entscheiden**, **Nichts erfinden** und **Der Raum bestimmt mit**.

## Distanzprofile

| Profil | Abstand | Grundschrift | Kontrast | Bedienung |
|---|---|---|---|---|
| Wall | 3–4 m, TV | 28 px bei 1080p | 7:1 | Fernbedienung |
| Desk | 60–80 cm | 16 px | 4,5:1 | 44 px |
| Hand | 30–40 cm | 16 px | 4,5:1 | 44 px |

Wall-Skala bei 1080p: Caption 28, Text 32, Titel 48, Display 96 px. In CSS als Containereinheiten (`1.458cqi` usw.), damit jede Bildgrösse dieselben Proportionen erhält.

## Flächen

Boot, Setup, Claim, Agents Home (Views Stage, Terminals, Focus, Stack), Launcher, Content, RadioX Fullscreen, Mirror und Share Link, Control, TV Wake und Goodbye, Voice und Perception. Regeln und Regionen stehen je Fläche in der JSON-Datei.

- Agents Home trägt das Agents-Signet, EdgePortal steht als Plattform in der Statuszeile.
- RadioX bleibt eine eigene, endorsed Marke. EdgePortal stellt nur den Rahmen.
- Firstglut kommt in EdgePortal nicht vor, ausser im Systemstart der Dachmarke.

## Zustände

Jeder Zustand spricht mit Wort und Form, nie nur mit Farbe. Die gefüllte Raute gehört als Rautenpunkt der Dachmarke; Warnungen tragen ▲, «braucht dich» und Guest die hohle Raute ◇. Text in der Rolle danger steht auf Wall nur auf dem Grund (7,3:1).

## Quellen, Annahmen, Verfeinerungen

Getrennt aufgeführt in `edgeportal.json` unter `sources`, `assumptions` und `refinements`. Kurz:

- **Quellen:** EdgePortal-Repository bei Commit a5d1ae6 (privat, nur gelesen), Rapold Stack Naming, DESIGN-DNA 7.1, die dunklen Rapold-Rollen.
- **Annahmen:** Wall verlangt 28 px und 7:1 (Jarvis-Konzept); EdgePortal liegt heute bei etwa 20 px. Die englischen Namen sind teils nur vorgeschlagen.
- **Verfeinerungen:** neue Status Screens (`update`, `recovered`, `tv-silent`), Offline mit Entprellung, Aufnahme ohne Pulsieren in der Rolle danger, eine Grussquelle.

Alle Ansichten auf der Brand-Seite zeigen Beispieldaten. Sie melden keine echten Geräte, Agents oder Verbindungen.

## Einbindung

Bis Atlas als npm-Paket erscheint, übernimmt EdgePortal Werte und Regeln aus dieser Spezifikation. Die Tokens sind die dunklen Rapold-Rollen; eigene Hexwerte im Produkt entfallen. Die Prüfung im Browser auf echten TVs (Pi 3 bis 5, 720p bis 4K) steht aus.
