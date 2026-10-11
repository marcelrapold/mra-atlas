# CI/CD über die native Vercel-Git-Integration

## Automatischer Ablauf

Das GitHub-Repository [`marcelrapold/mra-design`](https://github.com/marcelrapold/mra-design) ist mit dem bestehenden Vercel-Projekt **`design`** im Scope `marcelrapold` verbunden. Jeder Push auf `main` löst den nativen Vercel-Build aus. In `vercel.json` ist `main` ausdrücklich aktiviert; andere Branches lösen durch diese Konfiguration keine Vercel-Deployments aus. Der tatsächliche Produktionsrollout vom 11.10.2026 ist unten separat dokumentiert.

Vercel führt `npm ci` und danach `npm run check` aus. Dieser Befehl umfasst Tests, TypeScript, den statischen Produktionsbuild sowie die Prüfung der Präsentationsdateien. Erst ein erfolgreicher Build kann veröffentlicht werden. Das Ausgabe-Verzeichnis ist `apps/docs/out`.

GitHub Actions führt unabhängig davon bei jedem Push und Pull Request denselben Check aus. Es gibt keinen zusätzlichen Actions-Deployment-Job und keine dafür erforderlichen `VERCEL_TOKEN`-, `VERCEL_ORG_ID`- oder `VERCEL_PROJECT_ID`-Secrets. Vercel und GitHub verwenden die bereits eingerichtete Git-Integration. Die beiden Prüfungen laufen unabhängig; die Vercel-Veröffentlichung hängt an ihrem eigenen erfolgreichen `npm run check`.

Grundlage: [Vercel für GitHub](https://vercel.com/docs/git/vercel-for-github) und [branchabhängige Git-Deployments](https://vercel.com/docs/project-configuration/git-configuration#git.deploymentenabled).

## Projekteinstellungen

| Einstellung | Wert |
|---|---|
| Git-Repository | `marcelrapold/mra-design` |
| Vercel-Projekt | `design`, Scope `marcelrapold` |
| Produktionsbranch | `main` |
| Root Directory | Repository-Wurzel (`.`), da npm-Workspaces verwendet werden |
| Framework Preset | Other (`framework: null`); Next.js erzeugt einen statischen Export |
| Node.js | 22.x, entsprechend der CI |
| Install Command | `npm ci` |
| Build Command | `npm run check` |
| Output Directory | `apps/docs/out` |
| Clean URLs | `true` |
| Produktionsdomain | `design.rapold.io` |

Build- und Routingwerte stehen in `vercel.json`. Die erfolgreiche Veröffentlichung des gemergten `main`-Commits auf der Produktionsdomain ist im Nachtrag unten belegt. Die vollständigen Projekteinstellungen wurden über den eingeschränkten Connector nicht unabhängig ausgelesen; der beobachtete Rollout ersetzt diese Einsicht nicht.

## Auslieferung prüfen

Den Vercel-Status am gepushten GitHub-Commit beziehungsweise das zugehörige Deployment abwarten. Nach einem erfolgreichen Rollout muss [`build-info.json`](https://design.rapold.io/build-info.json) die **Version aus `package.json` des bereitgestellten Commits** und dessen vollständige Commit-ID enthalten. Den Prüfer aus genau diesem Checkout ausführen; er liest die erwartete Version selbst aus `package.json`.

Die öffentliche Prüfung ist auch ohne Vercel-Token ausführbar:

```bash
node scripts/verify-deployment.mjs https://design.rapold.io <vollständige-commit-id>
```

Der Prüfer kontrolliert Version und Commit, die Kernrouten `/`, `/praesentation`, `/organigramm`, `/charts`, `/prompt-compiler` sowie den Engineering-Vertrag. Ein grüner GitHub-Check allein bestätigt noch keinen Produktionsrollout. Die technische Prüfung ersetzt keine visuelle Browser-Abnahme.

## Belegter erster Produktionsrollout · 11.10.2026

Dieser Nachtrag dokumentiert den ersten Rollout nach [PR #5](https://github.com/marcelrapold/mra-design/pull/5), Framework **0.5.0**, Commit [`ee5bfc2ef4bd2b034fc2045b5a576d101159c217`](https://github.com/marcelrapold/mra-design/commit/ee5bfc2ef4bd2b034fc2045b5a576d101159c217). Er ist keine finale Vollabnahme späterer Korrekturen oder gestalterischer Ergänzungen.

| Nachweis | Ergebnis |
|---|---|
| GitHub CI auf `main` | [Run 38127246567](https://github.com/marcelrapold/mra-design/actions/runs/38127246567): `completed` / `success` |
| Vercel-Produktion | [Deployment 3Z67rf5o5Fek1Dtfs9t1EsjNixU4](https://vercel.com/marcelrapold/design/3Z67rf5o5Fek1Dtfs9t1EsjNixU4): `success`, bestehendes Projekt `design` |
| Öffentliche Build-Info | **11.10.2026, 09:09:20.833 UTC:** HTTP 200, Version `0.5.0`, exakte Commit-ID oben; `builtAt: 2026-10-11T09:08:37.687Z` |
| Produktionsprüfer | Abschluss **09:10:23.923 UTC**, Exit 0: Version, Commit, fünf Kernrouten und Engineering-Vertrag bestätigt |
| Erweiterte HTTP-Prüfung | Abschluss **09:11:07.532 UTC**: 36 erreichbare Framework-Routen; 208 Rapold-Exporte und 27 Ressourcen mit HTTP 200 sowie passenden Bytes, SHA-256 und MIME-Typen |
| Format- und Bestandsprüfung | 136 PNG-Abmessungen, 76 schriftfreie SVG, vier ICO, zwei WOFF2 und vier Produkt-ZIP mit je 52 Dateien geprüft. 231 deterministische Dateien bytegleich zum lokalen Build; ZIP-Zeitstempel variieren, daher Vergleich der ZIP-Bytes mit dem jeweiligen Produktionsmanifest. |
| Desktop-Browser | Tatsächliche Produkt-/Filter-/Download-, Fokus-, Such- und Zustandsprüfungen in Chrome bei 1363 × 936 CSS-px; Umfang und Grenzen im [Apple-Design-Audit, Abschnitt 6](apple-design-audit.md#6-produktions--und-browsernachprüfung--11102026) |

Die Arbeitsprotokolle dieses Rollouts sind unter `production-verification-ee5bfc2` benannt: `build-observations.ndjson`, `existing-script-result.json`, `production-assets-report.json`, `canonical-route-findings.json` und `browser-downloads-report.json`. Das [produktive Rapold-Manifest](https://design.rapold.io/brands/rapold/assets-manifest.json) hatte bei der Prüfung SHA-256 `1e6ac2355da93fd7ea7a488b60fd20d59ca81e2fdda9cd0af0487e395995614c`.

**Nachbefund:** `/praesentation` und `/praesentationslogik` lieferten im genannten Commit Canonical- und Open-Graph-URLs der Startseite. Die beiden Seitenquellen sind lokal auf ihre eigenen Routen und passende Open-Graph-Titel korrigiert. Der abschliessende Commit, das zweite Deployment und die anschliessende öffentliche Nachprüfung sind zu diesem Dokumentationsstand noch pendent. Die erfolgreichen Routen- und Assetprüfungen werden deshalb nicht als Nachweis fehlerfreier Seitenmetadaten oder als finale Gesamtfreigabe gewertet.

**Geplanter Folgestand 0.6.0:** Beauftragt sind zusätzliche produktspezifische Hintergründe, Effekte und Motion sowie die Entfernung von Goldbach und Sygnum. Die künftige aktive Brand-Auswahl soll `neutral`, `dominicano-express` und `rapold` enthalten. Die Nachweise dieses Abschnitts bleiben ausdrücklich bei 0.5.0 und der damaligen Fünf-Brand-Registry; sie bestätigen weder Build noch Rollout oder Browserabnahme des geplanten Folgestands.

## Produktwelten für 0.6.0 · geplanter Auslieferungsumfang

Die [Produktwelten-Spezifikation](product-worlds.md) beschreibt die neue Ergänzung. Vier unveränderte Learn-Hero-Dateien samt Lizenz und Herkunftsnachweis sind bereits lokal geprüft. AI-Aurora, Netz und Glas werden als begrenzte Gestaltungsreferenz umgesetzt; Learn ergänzt Partikel, Terminal und Parallax. Gemeinsame Geist-Typografie, neue Raumfaltenzeichen sowie Facetten/Spektrum verbinden diese Referenzen. Argus und EdgePortal bleiben ausdrücklich CI-Anwendungsbeispiele ohne behauptete Original-App-Parität.

**Status dieses Abschnitts: Vorbereitung, kein neuer Rolloutnachweis.** React-/CSS-Integration, Export-Kit und Brand-Bereinigung werden separat umgesetzt. Die Byteprüfung der vier Original-Learn-Dateien bestätigt keine bereits erfolgte Auslieferung auf `design.rapold.io`.

Für den späteren Produktionsnachtrag sind die tatsächlich ausgelieferte Version und Commit-ID erneut zu prüfen. Die aktive Auswahl muss dem neuen Vertrag `neutral`, `dominicano-express`, `rapold` entsprechen; entfernte Brandpakete dürfen nicht als aktuelle Downloads weiter ausgegeben werden. Die Canonical-/Open-Graph-Korrekturen der beiden Präsentationsseiten und die neuen Weltressourcen samt Lizenz-/Herkunftsdateien benötigen ihren eigenen öffentlichen Nachweis. Die Assetzahlen des historischen 0.5.0-Abschnitts werden dafür nicht als feste Sollwerte übernommen.

Die Browserabnahme konzentriert sich zusätzlich auf den gemeinsamen Bewegungsregler, Reduced Motion, tatsächliche Lesbarkeit der komponierten Flächen und ehrliche Demo-Zustände. Nur ausgeführte Abläufe werden als Nachweis ergänzt; die offenen mobilen und AT-Prüfgrenzen bleiben ausdrücklich bestehen. Der getrennte Prüfstand steht im [Audit, Abschnitt 7](apple-design-audit.md#7-produktwelten-für-060--spezifikation-vom-11102026).

## Korrektur der vorherigen Pipeline

Commit `cf57f7c` hatte native Git-Deployments deaktiviert und einen eigenen Actions-Deployment-Job hinzugefügt. Dieser scheiterte an drei fehlenden Actions-Secrets. Nach der Bestätigung der bereits bestehenden Git-Verbindung wurde diese zusätzliche Pipeline entfernt und natives Deployment für `main` wieder aktiviert.

Die 403/404-Antworten der direkten Vercel-Werkzeuge betreffen deren Verbindung und sind kein Nachweis gegen die bestehende Vercel-GitHub-Integration. Keine neuen Secrets oder Ersatzprojekte für diesen Ablauf anlegen.

## Rücknahme

Wenn die ausgelieferte Version fehlschlägt, im bestehenden Vercel-Projekt das zuvor geprüfte Deployment wieder zuordnen. Vor der Rücknahme Deployment-ID und Commit dokumentieren. Anschliessend Domain und Build-Info erneut prüfen.
