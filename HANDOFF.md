# Handover

## Aktueller Stand · Atlas 0.11.0

Dieses Repository ist **Atlas**, das Designsystem von Rapold, live unter https://atlas.rapold.io. Den ausgelieferten Stand meldet [/build-info.json](https://atlas.rapold.io/build-info.json) mit Version und Commit. Atlas ist seine eigene Referenz: Website, Tokens, Komponenten, Navigation und Präsentationsmuster sind hier definiert. Ein externes System dient nicht als Referenz, Benchmark oder Namensgeber. Die Herkunft übernommenen Codes steht in `LICENSE`; Herkunftsvermerke in Quelldateien bleiben erhalten.

- Website-Identität «Atlas» mit eigenem Signet (gefaltete Karte aus dem Rapold-Produktkatalog) in der Seitenleiste; Titel, Metadaten, Suche und Fusszeile tragen den Namen Atlas.
- Core-UI-Module und markenfähige Portale, vollständig beschrieben im [Komponentenvertrag](https://atlas.rapold.io/contracts/components.md); die indexierten Referenzseiten listet `/sitemap.xml` (41 im Build von 0.11.0).
- Aktive Brands: `neutral`, `dominicano-express`, `rapold` und `radiox`. Die Musterdeck-Vorschauen sind per Hash an ihre Render-Quellen gebunden; ein Build-Gate prüft ihre Aktualität.
- Rapold: zehn freigegebene Signets, Agents (agents.rapold.io) als Signet-Vorschlag; Dachmarke «Der First» als Vorschlag, Freigabe ausstehend. Der UI-Adapter bleibt `draft`.
- RadioX: Brand nach der Design-DNA aus radiox.cloud und dem RadioX-Code, Status `draft`; die visuelle Abnahme steht aus.
- Die npm-Paketnamen `@rapold/framework-*` bleiben vorerst unverändert.

## Offene Schritte

- Freigabe der Dachmarke «Der First» (Vorschlag) durch Marcel Rapold; bis dahin bleibt `approval.umbrellaSymbol` in `brands/rapold/sources/provenance.json` auf `none`.
- Rapold- und RadioX-UI-Adapter bleiben `draft`. Physische Mobil-/Touch-Geräte, Assistenztechnik, 200-%-Zoom, Forced Colors und Pixelkontrast sind ungeprüft.
- Statische Geist-TTF für die PPTX-Einbettung fehlen; ohne installierte Geist fällt PowerPoint auf eine Systemschrift zurück.
- Corporate-Master-Import, gehostetes Organigramm-Widget, Font-Einbettung, spezialisierte Visualisierungen und anbieterspezifische Integrationsbeispiele bleiben offen.
- Lizenz seit 0.7.0: «Alle Rechte vorbehalten», Marcel Rapold. Drittlizenzen (Geist, Lucide, ECharts, Learn-Ebenen) bleiben beigelegt.

Release-Prüfung: `npm run check`. Produktion erst mit passendem `build-info.json` auf der Zieldomain als ausgeliefert bezeichnen; Prüfer: `node scripts/verify-deployment.mjs https://atlas.rapold.io <commit>` (siehe [Deployment](docs/deployment.md)).

## Historie (verdichtet)

Die vollständigen datierten Nachweise stehen in [Deployment](docs/deployment.md), [Produktwelten](docs/product-worlds.md), [Apple-orientierter Audit](docs/apple-design-audit.md), `docs/review/` und im [Changelog](CHANGELOG.md).

- **0.11.0 · 14.10.2026:** Optimierungsrunde über 13 Fachperspektiven mit externen Referenzen: Foundation-Tokens steuern Core (Ebenen, Bewegung, Kaskaden-Layer), Fokus- und Kontrastmodi, neue Bausteine (Field, Textarea, Accordion, Collapsible, ToggleGroup, Progress, Table, Kbd), Token-Exporte mit Resolver, Komponenten-Manifest für Agenten, First Paint ohne Brand-Flackern, Volltextsuche, Sicherheits-Header, E2E- und Axe-Tests in der CI.
- **0.10.0 · 14.10.2026:** Deck-Render-Vertrag `deck` für alle Brands, RadioX-Design-DNA mit korrigierter Brand und dunklen Decks, Dachmarken-Vorschlag rapold.io «Der First» mit Rapold-Decks auf Navy-Bühne.
- **0.9.1 · 14.10.2026:** RadioX-Markenseite mit Matrix-Regen und Aurora, RadioX-Logos und Icon-Sätze, statische Brand-Assets werden beim Build veröffentlicht.
- **0.9.0 · 14.10.2026:** Brand RadioX (`radiox`, `draft`) mit Glas, Aurora und Glow; sechs RadioX-Musterdecks.
- **0.8.0 · 12.10.2026:** Frontend-Audit über 16 Perspektiven (0 × P0, 7 × P1, P1 behoben); aus RadioX übernommene, neutralisierte Komponenten; der Core wächst von 19 auf 42 UI-Module.
- **0.7.1 · 12.10.2026:** Die sechs mit 0.7.0 vorgeschlagenen Signets sind freigegeben; der Katalog führt alle zehn Zeichen als `approved`.
- **Repository-Umbenennung · 12.10.2026:** Das Repository heisst `marcelrapold/mra-atlas`; Repository-Links sind nachgezogen.
- **Domain · 11.10.2026:** `atlas.rapold.io` im Vercel-Projekt `atlas` verifiziert, die frühere Adresse leitet per 308 dorthin um; `build-info.json` meldete 0.7.0.
- **0.7.0 · 11.10.2026:** Name Atlas, sechs Signet-Vorschläge, Lizenz «Alle Rechte vorbehalten», externer Referenzabgleich entfernt.
- **0.6.0 · 11.10.2026:** Produktiver Prüfstand auf der damaligen Produktionsadresse mit Anwendungs-Commit `73498ec4b46cb9f431d7ad5d186e88dd6301162b` (10:06–10:07 UTC), 84 Weltressourcen, ZIP mit 44 Dateien, zehn erwartete 404 für entfernte Downloads. Der [Browserbericht](docs/review/production-0.6.0-73498ec4b46c/browser-review.json) um 10:17 UTC dokumentiert 14 bestandene Fälle in Chrome bei 1363 × 936 CSS-px.
- **Registry-Bereinigung · 11.10.2026:** Goldbach und Sygnum entfernt. Referenzen um 09:42 UTC mit `npm run deck:reference` neu gerendert (18 PDF, 54 PNG); `npm run check` bestand um 09:50–09:51 UTC.
- **0.5.0 · 11.10.2026:** Erster belegter Produktionsrollout mit Commit `ee5bfc2ef4bd2b034fc2045b5a576d101159c217`.
- **0.4 · 11.09.2026:** Navigationsicons mit Rail/Command-Suche, formatabhängiger Prompt-Compiler, Engineering-Vertrag, Organigramm- und Zuständigkeitsrenderer mit Editor, Apache ECharts (unverändert lokal ausgeliefert, gegen den Upstream-Blob geprüft). Der damalige Vercel-Preview-Aufruf scheiterte mit HTTP 403.
- **0.3:** Präsentationsseite mit echten PNG-Vorschauen, PDFs und Preset-Filmstreifen; Inhaltsfingerprint für versionierte Bilder; Projektexport mit Quellen-, Kapazitäts- und Reihenfolgeprüfung.
- **CI/CD:** Die native Vercel-Git-Integration baut `main` mit `npm run check`; die frühere separate Actions-Deployment-Pipeline aus `cf57f7c` ist entfernt. GitHub Actions führt zusätzlich den Check aus und benötigt keine Vercel-Secrets.
