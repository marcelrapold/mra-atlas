# Atlas

Atlas ist das Designsystem von Rapold: ein neutraler White-Label-Designstandard mit austauschbaren Brand-Vorgaben für Interfaces und Management-Präsentationen.

**Stand:** Atlas 0.11.0, live auf https://atlas.rapold.io; den ausgelieferten Stand meldet [/build-info.json](https://atlas.rapold.io/build-info.json) mit Version und Commit. Die native Vercel-Git-Verbindung baut jeden Push auf `main` mit `npm run check`. Datierte Rollout- und Browsernachweise stehen im [Deployment](docs/deployment.md). Das Repository `marcelrapold/mra-atlas` ist öffentlich. Lizenz: «Alle Rechte vorbehalten», Marcel Rapold; Drittkomponenten behalten ihre Lizenzen (siehe `LICENSE`).

## Referenz

Atlas ist seine eigene Referenz. Website, Tokens, Icons, Komponenten, Navigation und Präsentationsmuster sind in diesem Repository definiert und unter https://atlas.rapold.io dokumentiert; die jeweilige Brand liefert ihre CI. Komponenten Dritter und ihre Lizenzen stehen in [LICENSE](LICENSE).

Rapold-Produkte übernehmen Signet, Favicon, Manifest, Tokens, Geist-Fonts und den Login über auth.rapold.io gemäss [Atlas in Produkten einbinden](docs/produkte-einbinden.md).

## Zielauftrag

> Analysiere owner/repo und erstelle eine Management-Präsentation. Lies und befolge https://atlas.rapold.io/brands/neutral/management.md.

Für Rapold denselben Auftrag mit https://atlas.rapold.io/brands/rapold/management.md verwenden; für Dominicano Express mit https://atlas.rapold.io/brands/dominicano-express/management.md und für RadioX mit https://atlas.rapold.io/brands/radiox/management.md. Der Einstieg enthält den vollständigen Ablauf: standardmässig acht Folien, Deutsch (Schweiz), 16:9, editierbare PPTX, PDF, Quellenmanifest und deck.json. Explizite Wünsche überschreiben diese Defaults. Auf der [Präsentationsseite](https://atlas.rapold.io/praesentation) und im Prompt-Compiler wird der Kurzauftrag für das aktive Theme erzeugt.

Der Standard liefert Brand-Daten, Präsentationsrollen und einen vollständigen Agenten-Vertrag. Der ausführende Agent braucht Repo-Zugang und einen Renderer. Ein gehosteter Generator ist nicht Teil dieses ersten Schnitts.

## Start

Node.js 22 oder neuer:

```sh
npm ci
npm run dev
```

`npm run check` prüft die Brand-Verträge, Core-Isolation, Kontraste, TypeScript und den statischen Produktionsbuild. Die Referenz-App konsumiert direkt `@rapold/framework-core`. `npm run contracts` generiert die maschinenlesbaren Dateien unter `apps/docs/public` aus den kanonischen Quellen. Die Rapold-Assetpipeline verwendet dabei Sharp und JSZip aus dem Lockfile; SVGs, PNGs, ICOs, Web-Manifeste und Produkt-ZIPs brauchen kein Python.

Wenn sich renderwirksame Tokens oder Fonts ändern: `python scripts/prepare-render-fonts.py` und anschliessend `npm run deck:reference`. Dafür sind FontTools mit Brotli, Fontconfig, LibreOffice und Poppler erforderlich. Der normale Build verwendet die versionierten, per Hash geprüften PDF-/PNG-Referenzen.

Bei Änderungen an der Brand-Registry entfernt die Generierung nicht mehr registrierte Brand-Verzeichnisse aus `apps/docs/public` und `apps/docs/out` sowie ihre Einträge im Referenzmanifest. Anschliessend `npm run deck:reference` ausführen: Die verbleibenden Vorschauen müssen aus der neuen Quellkonfiguration gerendert werden. Die Bereinigung ändert ihren bisherigen Quellhash nicht.

[Apple-orientierter Audit](docs/apple-design-audit.md): Der externe Skill ist auf einen Commit fixiert und wird als Reviewreferenz verwendet. Seine vollständigen HIG-Texte sind kein Bestandteil dieses Repositorys.

## Aufbau

| Pfad | Zweck |
|---|---|
| `packages/core/src` | Alle UI-Module (seit 0.8.0 inklusive der aus RadioX übernommenen Komponenten), Hooks und BrandProvider |
| `packages/brands/src` | Validierter Brand-Vertrag, Registry für Neutral, Dominicano Express, Rapold und RadioX sowie Präsentationsadapter |
| `packages/presentation/src` | Datenadapter, Inhaltsprüfung und editierbarer PPTX-Export |
| `apps/docs` | Next.js-Referenz, statisch exportierbar; die indexierten Seiten listet `/sitemap.xml` |
| `brands/rapold` | Original-Signets, lokale Geist-Fonts, Produktkatalog und dokumentierte UI-Ableitungen |
| `docs/apple-design-audit.md` | Apple-orientierter Web-Audit mit Befunden und Abnahmegrenzen |
| `brands/dominicano-express` | Vorgaben und Inhaltsbeispiel für das Dominicano-Preset |
| `brands/radiox` | Design-DNA, Theme und Logos der Brand RadioX |
| `brands/rapold-io` | Dachmarke rapold.io «Der First»: Design-DNA, Konzepte und Master (Vorschlag, Freigabe ausstehend) |
| `docs/brand-contract.md` | Integration und Erweiterung |
| `docs/produkte-einbinden.md` | Atlas in Produkten einbinden: Signet, Favicon, Manifest, Tokens, Geist und Login über auth.rapold.io (live: https://atlas.rapold.io/contracts/produkte-einbinden.md) |
| `docs/repo-to-management.md` | Vollständiger Agenten-Auftrag für Management-Decks |
| `docs/release.md` | Repository-Übernahme und spätere Veröffentlichung |
| `scripts/build-contracts.mjs` | Erzeugt JSON- und Markdown-Endpunkte |
| `tests` | Vertrag, Kontrast und Core-Isolation |
| `llms.txt` | Einstieg für Agenten |
| `AGENTS.md` | Arbeitsvertrag für Agenten |
| `HANDOFF.md` | Stand, Abnahme und offene Schritte |

## Ausprägungen

Die Brand-Registry enthält vier Einträge:

- Neutral (`neutral`): vollständige helle und dunkle Basis und Default.
- Dominicano Express (`dominicano-express`): eigenständiges helles und dunkles Preset mit seinem Caja-Inhaltsbeispiel.
- Rapold (`rapold`): gemeinsame Brand für AI Fabric, Argus, ÆON Learn und EdgePortal sowie Lotse, Cockpit, Auditor, Rapold Auth, PocketForge, Atlas selbst und Agents; elf freigegebene Signets. 55 SVG-Master, lokale Geist-Fonts und 572 reproduzierbare Exporte. Status `draft` für den UI-Adapter. Markenansicht: `/brand?brand=rapold`. [Quellen und Anwendung](brands/rapold/README.md). Die Dachmarke rapold.io «Der First» ist ein Vorschlag; die Freigabe steht aus ([Design-DNA](brands/rapold-io/DESIGN-DNA.md)).
- RadioX (`radiox`): Brand im Look von radiox.cloud (Schwarz, Cyan, Glas, Glow) für die aus RadioX übernommenen Medien-, Status- und Player-Komponenten; Status `draft`. [Design-DNA und Ableitungen](brands/radiox/README.md).

Firmenlogos, interne Vorgaben und lizenzierte Assets sind getrennt vom neutralen Core. Eine künftige freie Code-Lizenz erteilt keine Marken- oder Fontrechte.

## Zieladressen

Repository: [marcelrapold/mra-atlas](https://github.com/marcelrapold/mra-atlas).
Hauptadresse: `atlas.rapold.io`.

Die Domain steht in der Metadaten-Konfiguration, in `vercel.json` und im Agenten-Einstieg. `atlas.rapold.io` ist im Vercel-Projekt `atlas` verifiziert; die frühere Adresse leitet per 308 dorthin um ([Deployment](docs/deployment.md)). Die npm-Paketnamen `@rapold/framework-*` bleiben vorerst unverändert.

## Erweiterter Stand

- UI-Module und markenfähige Portale, vollständig beschrieben im [Komponentenvertrag](https://atlas.rapold.io/contracts/components.md).
- Vollständiger neutraler Lucide-Katalog mit SVG- und React-Verwendung.
- Grundlagen, semantische Rollen, CSS-, JSON- und DTCG-Exporte.
- 18 Folienrezepte, fünf Presets, vermessene Raster und 13 Typorollen.
- Editierbare Muster-Decks pro Brand. Die Vorschauen werden aus den exportierten PowerPoints über PDF nach PNG gerendert. Ein Build-Gate prüft ihre Aktualität.
- Inhaltslogik: docs/presentation-logic.md und scripts/validate-deck.mjs.

- Organigramm-Renderer mit Editor und Exporten, vier lokale ECharts-Beispiele, Navigationsicons, formatabhängige Prompts und der [Engineering-Vertrag](docs/engineering.md).

Der Muster-Renderer erzeugt 24 editierbare PPTX-Dateien (vier Brands × sechs Decks). Zusätzlich verarbeitet `@rapold/framework-presentation` echte Projektinhalte mit allen 18 Rezepten. `npm run deck:export -- deck.json --out ./ergebnis --repo-dir ./projekt --pdf` erzeugt PPTX, PDF und Quellenmanifest. Vollständiger Ablauf und Eingabeschema: [Projektdecks](docs/project-decks.md).

Bekannte Lücken und Abnahmestatus: [HANDOFF.md](HANDOFF.md). Änderungen je Version: [CHANGELOG.md](CHANGELOG.md).
