# ADR 0002: Kein `lib/atlas` in EdgePortal

- **Stand:** Vorschlag, 18.10.2026
- **Betrifft:** EdgePortal-Konzept «Jarvis» (`mra-edgeportal`, `docs/konzept/edgeportal-jarvis.md`, Abschnitt 7 «Atlas-Module»), Atlas als einzige Quelle der Frontend-Definitionen
- **Baut auf:** [ADR 0001: npm-Bezug](0001-npm-bezug.md)

## Kontext

Das Jarvis-Konzept plant für Phase 1 eigene Module unter `lib/atlas/*` im EdgePortal-Repo: `tokens`, `hud`, `confirm`, später `input`, `agent`, `voice` und `files`. Als Paket soll nur `@rapold/atlas-tokens` über einen Git-Tag entstehen. Begründet wird das im Einwand-Papier mit dem Aufwand: Für Paketierung, Umbenennung, Changesets und eine Registry rechnet es mit 5–8 Personentagen auf dem kritischen Pfad.

Atlas soll aber jedes Rapold-Produkt vollständig gestalten, und die Produkte sollen ihre Frontend-Definitionen aus einer Quelle beziehen. Ein `lib/atlas` im Produkt wäre die nächste Kopie. Heute driftet EdgePortal bereits, weil es Atlas von Hand übernommen hat.

## Entscheid

Es gibt kein `lib/atlas` in EdgePortal. Jedes Modul kommt an den Ort, an den es seiner Art nach gehört:

| Modul aus dem Konzept | Ort | Begründung |
|---|---|---|
| `tokens` mit den Distanz-Profilen `wand`, `schreibtisch` und `hand` | Atlas, `@rapold/brand-rapold` | Das sind Gestaltungswerte. Die Profile `desk` und `hand` stehen schon in `brands/rapold/edgeportal/edgeportal.json → control.profiles`; `wand` kommt dazu. |
| `hud`: Zonen, Slot-Budget, reservierte Systemzone | Atlas, als Regel in der EdgePortal-Spezifikation und als CSS im Paket | Das sind Layout und Typografie. Die Regeln werden in Atlas headless getestet (`node --test`), so wie heute der TV-Katalog. |
| `confirm`: Oberfläche des Automaten S0–S3 | Oberfläche in Atlas, Automat im Vertragsrepo | Atlas zeigt die Zustände mit Wort und Form. Die Übergänge sind Verhalten und gehören zu Hermes und den Verträgen (`rapold-contracts`), die Pforte, Hermes und EdgePortal gemeinsam testen. |
| `input`: CEC, Geste, Tastatur und Stimme als ein Reducer | EdgePortal | Das ist Produktlogik ohne Gestaltung. |
| `agent`, `voice`, `files` | Gestaltung in Atlas, Logik in EdgePortal | Diese Trennung gilt für jedes weitere Modul. |

Bezogen wird Atlas über den Weg aus ADR 0001: als Tarball von `@rapold/brand-rapold` (und bei Bedarf `@rapold/framework-core`), ohne Registry, ohne Umbenennung und ohne Changesets. Damit entfällt der Einwand mit dem kritischen Pfad. Die Paketierung ist mit dem Durchstich erledigt und muss nicht erst in Phase 2 folgen.

## Grenzen

- **Der TV bleibt, wie er ist.** Der heutige TV-Stand ist verbindlich. Atlas hält ihn als Kopie mit Katalog (`brands/rapold/edgeportal/tv/`, `views.json`) und ersetzt ihn nicht durch Paketimporte. Ändert sich der TV im Produkt, wird die Kopie nachgeführt.
- **Die Steuerung darf sich angleichen.** `edgeportal.rapold.io` darf auf das Paket umziehen und sich dabei leicht verändern.
- Die Grundschrift von 28 px auf Wand-Distanz aus dem Jarvis-Konzept bleibt eine **Idee** (`edgeportal.json → ideas`). Sie wird nur umgesetzt, wenn Marcel es ausdrücklich will.
- In Atlas laufen keine Netzwerkaufrufe. Daten, Automaten und Gerätelogik bleiben im Produkt oder in den Verträgen.

## Folgen

- Das Jarvis-Konzept ersetzt in Abschnitt 7 `lib/atlas/*` durch «Atlas-Paket plus Produktlogik» und streicht `@rapold/atlas-tokens`. Diese Änderung macht die EdgePortal-Session, wenn Marcel zustimmt.
- Atlas erhält in `edgeportal.json` das Profil `wand` und einen Abschnitt `hud`, beides gekennzeichnet als «Vorschlag», solange Jarvis nicht gebaut ist.
- Atlas liefert jede neue EdgePortal-Oberfläche zuerst als Spezifikation und Nachbau. Das Produkt bezieht sie danach über das Paket.

## Verworfen

- **`lib/atlas` im Produkt, später herauslösen:** Diesen Weg bezahlt man zweimal. Die Module entstehen zuerst als Kopie und müssen später zurück nach Atlas. Bis dahin driften sie.
- **Sechs neue `atlas-*`-Pakete mit Umbenennung:** Das ist für Phase 1 zu viel. Ein Paket pro Marke genügt, bis ein zweiter Konsument etwas anderes braucht.
