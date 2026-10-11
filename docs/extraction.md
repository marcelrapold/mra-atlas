# Atlas-Auszug

Quelle: `zvvch/zvv-atlas`, Commit `1c75c95417cc371040e1e24a0986213314b53c13`, Default-Branch `main`.

Der GitHub-Dateibaum umfasst 1536 Einträge inklusive Verzeichnissen. Der Quellzugriff erfolgte über die verbundene GitHub-Dateischnittstelle. Ein Git-Clone scheiterte an fehlender Terminal-Authentifizierung. Dieser Stand ist daher ein gezielter Quellauszug mit neuer lokaler Historie, kein vollständiger Clone und kein GitHub-Fork.

## Übernommen und angepasst

- `packages/atlas/src/ui/{button,card,input,badge,label}.tsx` nach `packages/core/src/ui/`.
- `packages/atlas/src/lib/utils.ts` nach `packages/core/src/lib/`.
- Button-Primary: feste ZVV-Klassen durch semantische Primary-/Hover-Rollen ersetzt.
- Button/Badge destructive: fester weisser Text durch passenden Foreground-Token ersetzt.
- Fokus-Ring: expliziter, deckender semantischer Token.
- Ausführungskern bleibt React mit Tailwind v4 und Radix-Primitiven. Next.js ist nur Host der Referenz-App, keine Core-Abhängigkeit.
- Ursprungslizenz unverändert erhalten. Keine pauschale Neulizenzierung vorgenommen.

## Neu implementiert

Validierter Brand-Vertrag mit CSS-Variablenadapter, neutralen Defaults, scoped BrandProvider, austauschbaren Brand-Adaptern, Präsentationsadapter und kleine direkt konsumierende Referenz-App. Die aktuelle Registry enthält Neutral, Dominicano Express und Rapold. Alte Farbwerte und Hausschriften werden nicht als neutrale Defaults weitergeführt.

## Bewusst nicht übernommen

ZVV-Logos, Brown-Narrow-Fonts, Linienfarben, Organigrammdaten, Content-Library, Präsentationsassets, Bilder, Lottie-Dateien, PIN-Gate, Mailer-/SSO-/Datenbank-Anbindungen, Analytics, Zeitzonen-Automatik, interne Endpunkte, alte Workflows, NPM-Registry-Zugang und Commit-Historie. Keine Änderung am ursprünglichen ZVV-Repository.

## Browserbefund

`atlas.zvv.de` lieferte in dieser Sitzung 502. Die im Repository dokumentierte Domain `atlas.zvv.dev` zeigte das PIN-Gate. Der geschützte Showcase wurde nicht im Browser geprüft. Die Extraktion stützt sich auf den ausführbaren Repository-Code und seine Dokumentation.
