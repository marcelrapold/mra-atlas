# Handover

## Aktueller Stand · Atlas 0.7.0

Dieses Repository ist **Atlas**, das Designsystem von Rapold, adressiert unter https://atlas.rapold.io. Atlas ist seine eigene Referenz: Website, Tokens, Komponenten, Navigation und Präsentationsmuster sind hier definiert. Ein externes System dient nicht mehr als Referenz, Benchmark oder Namensgeber. Die Herkunft übernommenen Codes bleibt in `LICENSE` und [docs/extraction.md](docs/extraction.md) dokumentiert; Herkunftsvermerke in Quelldateien bleiben erhalten.

- Website-Identität «Atlas» mit eigenem Signet (gefaltete Karte aus dem Rapold-Produktkatalog) in der Seitenleiste; Titel, Metadaten, Suche und Fusszeile tragen den Namen Atlas.
- 35 indexierte Referenzseiten. Die frühere Abgleichsseite gegen das Ausgangssystem ist entfernt, ebenso die zugehörigen Referenz- und Abdeckungsdokumente und der Vertrag `/contracts/atlas-reference.md`. `build-info.json` enthält keinen externen Referenz-Commit mehr.
- Aktive Brands: `neutral`, `dominicano-express` und `rapold`. Rapold mit vier freigegebenen und sechs vorgeschlagenen Signets (Lotse, Cockpit, Auditor, Rapold Auth, PocketForge, Atlas).
- Die npm-Paketnamen `@rapold/framework-*` bleiben vorerst unverändert.

## Offene Schritte

- Domain `atlas.rapold.io` im Vercel-Projekt einrichten und die bisherige Adresse per Redirect darauf führen (siehe [Deployment](docs/deployment.md)). Erst danach den Rollout mit `node scripts/verify-deployment.mjs https://atlas.rapold.io <commit>` belegen.
- Repository-Umbenennung nach `marcelrapold/mra-atlas` separat ausführen und Repository-Links nachziehen.
- Rapold-UI-Adapter bleibt `draft`. Physische Mobil-/Touch-Geräte, Assistenztechnik, 200-%-Zoom, Forced Colors und Pixelkontrast sind ungeprüft.
- Corporate-Master-Import, gehostetes Organigramm-Widget, Font-Einbettung, spezialisierte Visualisierungen und anbieterspezifische Integrationsbeispiele bleiben offen.
- Lizenz seit 0.7.0: «Alle Rechte vorbehalten», Marcel Rapold. Drittlizenzen (Geist, Lucide, ECharts, Learn-Ebenen) bleiben beigelegt.

Release-Prüfung: `npm run check`. Produktion erst mit passendem `build-info.json` auf der Zieldomain als ausgeliefert bezeichnen.

## Historie (verdichtet)

Die vollständigen datierten Nachweise stehen in [Deployment](docs/deployment.md), [Produktwelten](docs/product-worlds.md), [Apple-orientierter Audit](docs/apple-design-audit.md), `docs/review/` und im [Changelog](CHANGELOG.md).

- **0.6.0 · 11.10.2026:** Produktiver Prüfstand auf der damaligen Produktionsadresse mit Anwendungs-Commit `73498ec4b46cb9f431d7ad5d186e88dd6301162b` (10:06–10:07 UTC), 84 Weltressourcen, ZIP mit 44 Dateien, zehn erwartete 404 für entfernte Downloads. Der [Browserbericht](docs/review/production-0.6.0-73498ec4b46c/browser-review.json) um 10:17 UTC dokumentiert 14 bestandene Fälle in Chrome bei 1363 × 936 CSS-px.
- **Registry-Bereinigung · 11.10.2026:** Goldbach und Sygnum entfernt. Referenzen um 09:42 UTC mit `npm run deck:reference` neu gerendert (18 PDF, 54 PNG); `npm run check` bestand um 09:50–09:51 UTC.
- **0.5.0 · 11.10.2026:** Erster belegter Produktionsrollout mit Commit `ee5bfc2ef4bd2b034fc2045b5a576d101159c217`.
- **0.4 · 11.09.2026:** Navigationsicons mit Rail/Command-Suche, formatabhängiger Prompt-Compiler, Engineering-Vertrag, Organigramm- und Zuständigkeitsrenderer mit Editor, Apache ECharts (unverändert lokal ausgeliefert, gegen den Upstream-Blob geprüft). Der damalige Vercel-Preview-Aufruf scheiterte mit HTTP 403.
- **0.3:** Präsentationsseite mit echten PNG-Vorschauen, PDFs und Preset-Filmstreifen; Inhaltsfingerprint für versionierte Bilder; Projektexport mit Quellen-, Kapazitäts- und Reihenfolgeprüfung.
- **CI/CD:** Die native Vercel-Git-Integration baut `main` mit `npm run check`; die frühere separate Actions-Deployment-Pipeline aus `cf57f7c` ist entfernt. GitHub Actions führt zusätzlich den Check aus und benötigt keine Vercel-Secrets.
