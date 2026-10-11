# CI/CD über die native Vercel-Git-Integration

## Automatischer Ablauf

Das GitHub-Repository [`marcelrapold/mra-design`](https://github.com/marcelrapold/mra-design) ist mit dem bestehenden Vercel-Projekt **`design`** im Scope `marcelrapold` verbunden. Jeder Push auf `main` löst den nativen Vercel-Build aus. In `vercel.json` ist `main` ausdrücklich aktiviert; andere Branches lösen durch diese Konfiguration keine Vercel-Deployments aus. Die tatsächlichen Produktionsrollouts 0.5.0 und 0.6.0 vom 11.10.2026 sind unten separat dokumentiert.

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

**Nachbefund:** `/praesentation` und `/praesentationslogik` lieferten im genannten Commit Canonical- und Open-Graph-URLs der Startseite. Die beiden Seitenquellen wurden anschliessend lokal auf ihre eigenen Routen und passende Open-Graph-Titel korrigiert. Zum damaligen Prüfstand waren Commit, Folge-Deployment und öffentliche Nachprüfung noch pendent. Der weiter unten dokumentierte 0.6.0-Rollout bestätigt inzwischen beide Korrekturen produktiv. Die erfolgreichen Routen- und Assetprüfungen werden deshalb nicht als Nachweis fehlerfreier Seitenmetadaten oder als finale Gesamtfreigabe gewertet.

**Damals beauftragter Folgestand 0.6.0:** Zusätzliche produktspezifische Hintergründe, Effekte und Motion sowie die Entfernung von Goldbach und Sygnum wurden anschliessend umgesetzt. Die Nachweise dieses ersten Abschnitts bleiben ausdrücklich bei 0.5.0 und der damaligen Fünf-Brand-Registry. Die separate Prüfung des Folgestands steht unten.

## Belegter Produktionsrollout 0.6.0 · 11.10.2026

Nach [PR #6](https://github.com/marcelrapold/mra-design/pull/6) wurde Framework **0.6.0** am **11.10.2026, 10:06–10:07 UTC**, auf [design.rapold.io](https://design.rapold.io) produktiv bestätigt. Die [Produktwelten](product-worlds.md) ergänzen AI-Aurora, Netz und Glas, vier unveränderte Learn-Hero-Dateien mit Partikeln, Terminal und Parallax sowie gemeinsame Geist-Typografie, neue Raumfaltenzeichen und Facetten/Spektrum. Argus und EdgePortal bleiben CI-Anwendungsbeispiele ohne Original-App-Paritätsclaim. Die aktive Brand-Auswahl enthält genau `neutral`, `dominicano-express` und `rapold`. Der folgende Commitbeleg gilt für diesen datierten Anwendungsstand. Ein anschliessender reiner Dokumentations-/Nachweis-Commit hat eine neue Main- und Build-ID; dadurch werden die hier abgeschlossenen UI-Abläufe nicht als erneut geprüft ausgegeben.

| Nachweis | Tatsächliches Ergebnis |
|---|---|
| Produktiver Prüfstand · Anwendungs-Commit | [`73498ec4b46cb9f431d7ad5d186e88dd6301162b`](https://github.com/marcelrapold/mra-design/commit/73498ec4b46cb9f431d7ad5d186e88dd6301162b) |
| GitHub CI | [Run 38130603944](https://github.com/marcelrapold/mra-design/actions/runs/38130603944): `success` |
| Vercel | [Deployment 8BQn7pjJCTvMNyqpdd9vHvcDoRfD](https://vercel.com/marcelrapold/design/8BQn7pjJCTvMNyqpdd9vHvcDoRfD): `success` |
| Öffentliche Build-Info | Version `0.6.0`, exakter Commit oben, `builtAt: 2026-10-11T10:05:00.077Z` |
| Gezielte Produktionsprüfung | **10:06:08.102–10:07:03.375 UTC**, `passed: true`, keine Fehler; 112 protokollierte HTTP-Anfragen |
| Weltressourcen | Alle **84 Dateien** des ausgelieferten Weltmanifests und das enthaltene portable ZIP mit **44 Dateien** geprüft; vier unveränderte Original-Learn-Artworks enthalten |
| ZIP-Integrität | **326782 Bytes**, SHA-256 `53714c02dfac3f867f23d586fbeb038e33d957965f92bb9d62274c6a75e2fce3` |
| Registry und alte Downloads | Drei erwartete aktive Brands; **zehn erwartete 404** für gezielt geprüfte alte Goldbach-/Sygnum-Verträge, Management-Dateien, Logos, Muster-PPTX und Referenz-PDF |
| Seitenmetadaten | Canonical und Open-Graph-URL auf `/praesentation` und `/praesentationslogik` jeweils korrekt zur eigenen Route, passende Titel; OG-Bild 1200 × 630 |
| Abschlusskontrolle | Build-Info unverändert auf demselben Commit; SHA-256 zu Beginn und am Ende `d5e10bfca262125523a4be03c94633d69494c8bc8e4f8845f08316b3602a2f2f` |

Die tatsächlichen [Produktionsberichte](review/production-0.6.0-73498ec4b46c/production-report.json) und [HTTP-Einzelbeobachtungen](review/production-0.6.0-73498ec4b46c/http-observations.json) sind unverändert im Repository abgelegt. Das [Weltmanifest](https://design.rapold.io/brands/rapold/worlds-manifest.json) hatte SHA-256 `82c8c1cf646967313445e3a11333facba1ed356353edc7d38deb34662a879288`. Die öffentliche [Standalone-Referenz](https://design.rapold.io/brands/rapold/product-worlds) und das [ZIP](https://design.rapold.io/brands/rapold/rapold-product-worlds.zip) sind verfügbar. Die Web-HTML enthält genau eine zusätzliche statische Base-URL für Vercel `cleanUrls`; nach Entfernen dieses Tags ist sie bytegleich zur relativen Offline-HTML. Alle anderen 43 Kit-Dateien sind bytegleich.

**Gezielte Browsernachprüfung abgeschlossen:** Der [Browserbericht](review/production-0.6.0-73498ec4b46c/browser-review.json) vom **11.10.2026, 10:17:17 UTC** dokumentiert 14 bestandene Zustands- und Bedienfälle auf dem Produktionscommit in **Chrome, 1363 × 936 CSS-px, DPR 1**. Belegt sind Produkt-/Modus-/Wortmarkenwechsel, CSS-Pause und Fortsetzen, über Produktwechsel erhaltene Pause, Hintergrund- und Oberflächenschalter, Enter-Bedienung mit 3-px-Fokusmarkierung und synchrone Produkt-/Downloadauswahl. Alle vier Produkte wurden in 320-px-Referenzcontainern ohne horizontale Textüberläufe geprüft, Learn zusätzlich bei 390 px. **Es wurde der Referenzcontainer geändert, nicht der Browser-Viewport.**

Das öffentliche HTML-Kit wurde mit Produktfilter, Hell/Dunkel, Spektrum, Pause, ausgeschalteter Ebene und geöffneten SVG-Details geprüft; vier Learn-Originalbilder und das Signet waren geladen. Der tatsächliche Browserdownload des Welt-ZIP bestand CRC-, Grössen- und SHA-256-Prüfung mit den oben genannten 326782 Bytes und 44 Einträgen. Die erfassten Anwendungslogs von Hauptansicht und Kit waren ohne Warnungen/Fehler; 201 Erweiterungseinträge sind separat ausgeschlossen. Ein [Produktionsscreenshot](review/production-0.6.0-73498ec4b46c/learn-dark-live.jpg) belegt Learn im dunklen Modus.

**Prüfgrenzen:** Keine physische Mobil-/Touch- oder AT-Prüfung, keine vollständige schmale Viewportemulation, kein 200-%-Zoom und keine reale Browseremulation von Forced Colors/Reduced Motion. Keine Pixelkontrastmessung oder vollständige Instrumentierung aller Animationsphasen; der Glitch-Auslöser wurde bedient, kurzlebige Frames und SVG-SMIL-Playheads nicht unabhängig geprüft. Erfolgreiche Normalabläufe ersetzen keine gezielt provozierten Netzwerkfehlerprüfungen. Der genaue Umfang steht im [Audit, Abschnitt 7.6](apple-design-audit.md#76-belegter-produktionsrollout-060--11102026); die historischen 0.5.0-Ergebnisse bleiben davon getrennt.

## Korrektur der vorherigen Pipeline

Commit `cf57f7c` hatte native Git-Deployments deaktiviert und einen eigenen Actions-Deployment-Job hinzugefügt. Dieser scheiterte an drei fehlenden Actions-Secrets. Nach der Bestätigung der bereits bestehenden Git-Verbindung wurde diese zusätzliche Pipeline entfernt und natives Deployment für `main` wieder aktiviert.

Die 403/404-Antworten der direkten Vercel-Werkzeuge betreffen deren Verbindung und sind kein Nachweis gegen die bestehende Vercel-GitHub-Integration. Keine neuen Secrets oder Ersatzprojekte für diesen Ablauf anlegen.

## Rücknahme

Wenn die ausgelieferte Version fehlschlägt, im bestehenden Vercel-Projekt das zuvor geprüfte Deployment wieder zuordnen. Vor der Rücknahme Deployment-ID und Commit dokumentieren. Anschliessend Domain und Build-Info erneut prüfen.
