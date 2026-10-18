# Changelog

## Unveröffentlicht

- **npm-Durchstich:** Atlas lässt sich als Paket beziehen. Neues Paket `@rapold/brand-rapold` 0.1.0 mit `tokens.css` (hell und dunkel per `light-dark()`), `tokens.light.css`, `tokens.dark.css`, Geist und Geist Mono samt OFL, Signets aller elf Produkte in fünf Varianten, Favicon-Satz und Web-Manifest pro Produkt sowie einem typisierten Katalog (`productIds`, `getProduct()`, `signetPath()`, `colorRoles`); `./edgeportal/boot/*` ist für das Boot-Kit reserviert. `scripts/build-brand-package.mjs` baut `dist/` deterministisch aus den kanonischen Quellen (nicht eingecheckt), `npm run pack:packages` packt Brand und Core nach `dist/packages/`. `@rapold/framework-core` 0.3.0 mit Typen-Bedingung, `package.json`-Export und Lizenzdatei im Tarball; der Core bleibt TypeScript-Quelle. Beide Pakete bleiben `private`, veröffentlicht wird nichts. Entscheid zum Bezug in `docs/adr/0001-npm-bezug.md` (jetzt Tarball im Produkt, später npmjs.com unter `@rapold`), Anleitung und EdgePortal-Migration des Controllers in `docs/produkte-einbinden.md`; der TV von EdgePortal bleibt unverändert. `docs/adr/0002-kein-lib-atlas.md` schlägt vor, statt eines eigenen `lib/atlas` in EdgePortal (Jarvis-Konzept) Gestaltung in Atlas und Logik im Produkt zu halten. Neuer Test `tests/packages-pack.test.mjs` prüft Exportziele, Lizenzen und die Markenfreiheit des Core-Tarballs. `build-brand-assets.mjs` schreibt auf Wunsch in einen eigenen Ordner; die Einzelmodus-Stylesheets kommen aus einer gemeinsamen Funktion.
- **EdgePortal in Atlas:** neue Sektion «EdgePortal: der TV, wie er ist» auf der Rapold-Brand-Seite. Der TV ist Ist-Stand und verbindlich: Atlas übernimmt die Stylesheets von Bühne, Präsenz, Übersicht und TV an/aus als Kopie aus `mra-edgeportal` (Commit e46563c) nach `brands/rapold/edgeportal/tv/` und baut die Ansichten aus dem echten Markup nach, mit neutralen Beispieldaten. `edgeportal.json` hält Werte, Zustände, Texte, Tasten und Grüsse des TVs; die Steuerung ist Atlas-Standard und darf sich leicht ändern; Ideen bleiben optional. Ein Test prüft die Kopien gegen die Spezifikation und die Rapold-Rollen. `worlds.json` und `worlds.css` bleiben unverändert.
- **Korona und Ridgeline im Systemstart (bewusste Abweichung A1):** Die Dachmarke «Der First» eröffnet die Bootsequenz eines Produkts. Nach dem Zünden umläuft ein Funke einmal das R (Firstglut-Kopf, Schweif über Kern, Ink, Ice, Sky zu Azure) und kehrt in den First zurück. Danach kippt der Grat als Ridgeline auf die Iso-Achse und wird zu Ice abgekühlt die Fuge des Produkts. Regeln, Ablauf und Grenzen stehen in `DESIGN-DNA.md` 7.1, Rezepte in 4.3, Werte in `dna.json` (`glow.corona`, `motion.systemStart`, `deviations`). Referenz ist der EdgePortal-Boot, geprüft von zwölf Fachperspektiven. Gilt erst mit der Freigabe des Zeichens. Nebenbei korrigiert: Verweis in 3.2 zeigt auf 4.3.
- **Fabric statt AI Fabric:** Das Produkt heisst seit 18.10.2026 «Fabric» unter `fabric.rapold.io` (Rapold Stack Naming; mra-fabric ADR 0015, `ai.rapold.io` bleibt dort als Alias). `identity.json` mit neuem Namen, neuer Domain und korrigiertem Zweck (Inferenz-Plattform statt «Orchestrierung von KI-Agenten», das ist Agents); Produktwelt-Quelle auf `fabric.rapold.io/login`. Signet unverändert. Belegte Quellen (`brand-tokens.json`, `world-provenance.json`) und Audit-Berichte bleiben, wie sie waren.
- **Agents (agents.rapold.io)** als elftes Rapold-Produkt im Katalog: das native Web-Terminal für KI-Agents, bewusst eigenständig neben EdgePortal. Signet in der Raumfalten-Familie B (humanoider Kopf mit Schultern, senkrecht gefaltet, mit Visier), am 18.10.2026 freigegeben; Nachweis `agentsProposal` in `provenance.json`. Der Deck-Generator nimmt alle freigegebenen Signets in die Familienleiste auf und zentriert sie auf der Schlussfolie nach der Anzahl; die Platten und PPTX-Vorschauen werden mit dem nächsten Linux-Rendering nachgezogen.

## 0.11.0 — 2026-10-14

Optimierungsrunde: 13 Fachperspektiven (Tokens, Komponenten-API, Barrierefreiheit, Performance, modernes CSS, Bewegung, Doku und DX, KI-Agenten, Theming, visuelles Handwerk, Engineering, Sicherheit und SEO, Sprache) haben Atlas gegen aktuelle externe Referenzen geprüft (W3C DTCG, shadcn/ui, Radix, React Aria, WAI-ARIA APG, WCAG 2.2, Vercel Geist, Primer, Polaris u. a.). Daraus entstanden 12 Arbeitspakete, jedes umgesetzt, adversarial geprüft und nachgebessert.

- **Core-Fundament:** Foundation-Tokens für Ebenen (`z-*`), Dauer und Easing steuern die Core-Komponenten über `@theme`; echte Ein- und Ausblendungen der Overlays im Timing der Brand; Brand-Regeln in `@layer components`, damit Utilities wieder gewinnen; Select, Popover und Menüs in Dialogen liegen auf Modal-Ebene. Forced Colors, `prefers-contrast: more`, reduzierte Transparenz und reduzierte Bewegung (160-ms-Überblendung statt Sprung).
- **Barrierefreiheit der Steuerelemente:** sichtbare Fokusringe statt `outline-none`, deutsche Standardtexte («Schliessen»), Zielgrössen nach WCAG 2.5.8, kontrollierbare Zustände über `useControllableState`, Drück-Feedback auch für Links.
- **Neue Bausteine:** Field (Label, Beschreibung, Fehler, automatische Verdrahtung), Textarea mit `field-sizing`, Accordion, Collapsible, ToggleGroup, Progress, Table, Kbd; EmptyState als zusammensetzbare Anatomie.
- **Token-Exporte:** pro Brand `tokens.css` mit `light-dark()`, DTCG-Resolver-Dokument, Foundation- und Farb-Sets, Kontrast-Audit der abgeleiteten Paare; Schema spiegelt die Foundation Schlüssel für Schlüssel.
- **Für Agenten:** maschinenlesbares Komponenten-Manifest `/contracts/components.json` (Exporte, Varianten, Slots, Abhängigkeiten, Spezifikation, Deep Links), Spezifikationsabschnitte direkt auf den Referenzseiten, `llms-full.txt` pro Theme, Linkprüfung aller beworbenen Adressen, absolute Links in veröffentlichten Brand-Regeln.
- **Doku-Website:** First Paint in der richtigen Brand und im richtigen Modus (Boot-Skript, statische `theme.css`), Volltextsuche über Seiten, Komponenten und Abschnitte, Ankerüberschriften, Inhaltsverzeichnis, Weiter/Zurück-Navigation, Typo- und Abstandsskala aus Tokens, schlankere Icons- und Mermaid-Seiten.
- **Vertrauen und Betrieb:** Sicherheits-Header (CSP, HSTS mit `includeSubDomains`, Permissions-Policy, COOP), Metadaten und strukturierte Daten auf allen Seiten, deutsche 404-Seite, Web-Manifest, `SECURITY.md`; CI mit getrennten Jobs, Playwright-Smoke- und Axe-Tests über 42 Routen in Hell und Dunkel, strikter Core-Typecheck (`noUncheckedIndexedAccess`), Dependabot ohne den hash-gesperrten Deck-Stack.
- **Sprache und Inhalt:** Schweizer Rechtschreibung, einheitliche Begriffe, veraltete Namen und Links bereinigt, Inhaltstest im Check.
- Deck-Ausgabe, Brand-Farben und Logos sind unverändert; «Der First» bleibt Vorschlag.

## 0.10.0 — 2026-10-14

- **Deck-Render-Vertrag `deck`** für alle Brands: Modus, Flächen und Hintergrundbilder pro Folientyp (Cover, Kapitel, Inhalt, Abschluss), Glas-Materialien (Füllung und Kontur mit Deckkraft, Radius, Lichtkante), Glow, Akzentrollen und Diagrammserien aus der Palette, Schriftrollen mit Versalien-Laufweite und Display-Grösse, Logo-Varianten nach Flächenhelligkeit, Supergrafiken, Schlusszeichen. SVG-Quellen werden beim Build zu PNG gerastert. Brands ohne `deck` bleiben byteidentisch (Snapshot-Test); der Vorschau-Digest umfasst alle referenzierten Bilder.
- **RadioX Design DNA** (`brands/radiox/DESIGN-DNA.md`, `dna.json`): von acht Spezialisten aus radiox.cloud und dem Code extrahiert und kritisch geprüft. Brand korrigiert (neutrale Flächen, keine Unschärfe auf Karten, Live-Rot getrennt von Fehler-Rose, Aurora-X in der Wortmarke). RadioX-Decks dunkel mit Aurora, Matrix-Regen als Standbild, Glas-Karten, Signalfarben nach Bedeutung, Segoe UI wie radiox.cloud unter Windows.
- **Dachmarke rapold.io «Der First»** (Vorschlag): R einmal um einen Grat gefaltet, Elternzeichen der Raumfalten-Familie; drei Konzepte, Jury, DNA unter `brands/rapold-io/`. Rapold-Decks mit Navy-Bühne, gläsernem R mit First-Glühen, Rhombus-Schlusspunkt, Geist und Produkt-Signets; Markenseite mit Dachmarken-Bereich.
- Linux-Referenzrenderer bereitet Inter 600/900 vor und bildet Segoe UI per Fontconfig auf Inter ab.
- Lokale Pfade aus Prüfnachweisen entfernt.

## 0.9.1 — 2026-10-14

- **RadioX-Markenseite** mit eigenem Showcase: Hero mit Port des RadioX-Matrix-Regens (fallende, aufleuchtende X in drei Tiefen) über animiertem Aurora-Licht, Pause-Schalter, Standbild bei reduzierter Bewegung, Lauf nur sichtbar und im aktiven Tab.
- **RadioX-Logos** als Vektorpfade aus Inter-Glyphen (Wortmarke «RadioX» und RX-Zeichen, dunkel, hell, einfarbig) sowie das Aurora-App-Icon und die Favicon-/App-Icon-Sätze aus radiox.cloud, alle mit Download.
- Signalfarben mit Bedeutung und Kopierfunktion, Schrift- und Label-Regeln, Links in alle Komponentenseiten im RadioX-Look.
- Statische Brand-Assets unter `brands/<id>/assets` werden beim Build veröffentlicht.

## 0.9.0 — 2026-10-14

- **Brand RadioX** (`radiox`, Status `draft`): Farben, Signalfarben und Radien aus `marcelrapold/radiox` (`apps/frontend/index.css`), Glasflächen, Aurora-Licht, Cyan-Glow und Pillen-Buttons in `brands/radiox/theme.css`. Der helle Modus ist dokumentiert abgeleitet; alle Kontrastpaare bestehen. Über den Brand-Wechsler zeigen alle Komponenten den Look von radiox.cloud.
- Die sechs aus RadioX übernommenen Komponentenseiten verlinken direkt auf ihre Ansicht mit der Brand RadioX.
- Sechs RadioX-Musterdecks; alle Folienvorschauen unter Linux neu gerendert.

## 0.8.0 — 2026-10-12

- **Frontend-Audit** über 16 Perspektiven mit adversarialer Prüfung: 97 belegte Befunde, 0 × P0, 7 × P1. Bericht, Scorecard und Rohdaten unter `docs/review/audit-2026-10-12/`.
- **Aus RadioX übernommen** und neutralisiert (nur semantische Tokens, keine Produktlogik): Tonsystem und Status-Töne, StatusDot/LiveDot, Eyebrow, Inset, KI-Kennzeichnung, Button mit Ladezustand und `fullWidth`, IconButton, PlayButton, Toggle/LikeToggle, Switch, RadioGroup, Confirm-/Prompt-/Inform-Dialog, Wischen zum Schliessen für Bottom-Sheets (opt-in), ErrorBoundary, Breadcrumb, PageHeader, Section, BottomNav/BottomStack, Avatar/AvatarGroup, MediaBar, MediaCard/GeneratedCover, Karussell ohne Fremdbibliothek, Audio-Visualisierungen, Alert, Announcer, LogView sowie Hooks (Media Query, reduzierte Bewegung, Elementgrösse, Scrollrichtung, sichtbarkeitsabhängiges Intervall, Dokumenttitel). Atlas-Core wächst von 19 auf 42 UI-Module.
- Sechs neue Komponentenseiten mit Live-Demos und Verwendungscode; Komponentenliste verlinkt; Komponentenvertrag `/contracts/components.md` für Agenten.
- **Audit-P1 behoben:** sichtbarer Tastaturfokus in allen Core-Komponenten über `outline` statt `box-shadow` (überlebt Brand-Schatten und Forced Colors); Kontrast inaktiver Tabs; Zeilenumbruch im Organigramm-Editor; Einbindungsanleitung auf der Markenseite und in `llms.txt` verlinkt.

## 0.7.1 — 2026-10-12

- Die sechs mit 0.7.0 ergänzten Signets (Lotse, Cockpit, Auditor, Rapold Auth, PocketForge, Atlas) sind freigegeben; der Katalog führt alle zehn Zeichen als `approved`. Nachweis in `provenance.json`.
- Markenseite zeigt die Familie als eine Gruppe und neu alle Zeichen in allen Varianten in einer Übersicht.

## 0.7.0 — 2026-10-11

- Sechs Signet-Vorschläge in der Rapold-Familie: Lotse, Cockpit, Auditor, Rapold Auth, PocketForge und das Designsystem Atlas. Jeder Vorschlag greift das bisherige Zeichen des Produkt-Repositorys auf und überträgt es in die Raumfalten-Grammatik (Herkunft je Zeichen in `provenance.json`).
- Produktkatalog mit `status` je Produkt (`approved` / `proposal`). Die Freigabe der vier ursprünglichen Signets bleibt unverändert und wird durch Vorschläge nicht erweitert.
- Vollständige Exportpalette auch für die Vorschläge: 520 Exporte und 57 kanonische Ressourcen für zehn Produkte. Zählungen in Tests und Build-Prüfung leiten sich aus dem Katalog ab.
- Markenseite gliedert die Familie in «Freigegebene Signets» und «Vorschläge»; Produkte ohne eigene Produktwelt zeigen einen Hinweis statt stillschweigend die AI-Fabric-Welt.
- Das Designsystem heisst jetzt **Atlas** und ist unter `atlas.rapold.io` adressiert (Metadaten, Sitemap, robots, Schemas, Agenten-Einstieg und Verträge). Die Seitenleiste zeigt das Atlas-Signet. Die npm-Paketnamen `@rapold/framework-*` bleiben unverändert.
- Das externe Ausgangssystem ist nicht mehr Referenz, Benchmark oder Namensgeber: Footer-Link, Referenz- und Abdeckungsdokumente, der Vertrag `/contracts/atlas-reference.md` und der Referenz-Commit in `build-info.json` sind entfernt; Website, Arbeitsvertrag und Prompts beschreiben Atlas als eigene Referenz.
- Die Seite «Atlas-Abgleich» ist entfernt; die Referenz umfasst 35 indexierte Seiten.
- Lizenz neu: «Alle Rechte vorbehalten», Marcel Rapold. Drittkomponenten (Geist OFL, Lucide ISC, ECharts und Learn-Ebenen Apache-2.0) behalten ihre Lizenzen. `docs/extraction.md` entfernt.
- EdgePortal-Domain `edgeportal.rapold.io` im Produktkatalog nachgetragen.

## 0.6.0 — 2026-10-11

- Produktwelten in der Rapold-Markenreferenz: originale AI-Fabric-Aurora mit Signalnetz und Glasflächen sowie vier unveränderte ÆON-Learn-Hero-Layer mit Partikelfeld, Terminal und begrenzter Parallax.
- Freigegebene Facetten- und Spektrum-Wortmarken in Geist ergänzt. Die vier Signets bleiben unveränderte reine SVGs ohne Schrift.
- Steuerbare Ebenen, Hintergrundansicht, 320-/390-px-Referenzcontainer, gemeinsame Bewegungspause und statische Reduced-Motion-Darstellung. Glitch startet nur auf ausdrücklichen Knopfdruck; das Beispieltranskript bleibt vollständig sichtbar.
- Argus- und EdgePortal-Oberflächen als klar gekennzeichnete CI-Anwendungsbeispiele; Herkunft, Originaldateien, Schriften und Lizenzen sind im Produktweltenvertrag dokumentiert.
- Eigenständiges Produktwelten-Paket mit HTML, CSS, lokalen Schriften, SVG-Signets, Original-Hintergründen und separatem Ressourcenmanifest.
- Goldbach und Sygnum aus Registry, Auswahl, Quellen, aktiven Vorlagen und erzeugten Downloads entfernt. Aktive Brands: neutrale Basis, Dominicano Express und Rapold. Historische Release- und Prüfnachweise bleiben zeitlich eingeordnet erhalten.
- Canonical- und Open-Graph-URLs der Präsentations- und Präsentationslogikseite auf ihre eigenen Routen korrigiert.

## 0.5.0 — 2026-10-11

- Gemeinsame Rapold-Brand mit vier originalen Raumfalten-Signets, Geist und Geist Mono, separaten Identitätsfarben und geprüften semantischen Rollen für Hell und Dunkel.
- Markenreferenz mit Produktwahl, fünf SVG-Varianten, echten Banner-/Icon-Vorschauen, filterbaren Einzeldateien und Produkt-ZIPs. 208 Exporte entstehen reproduzierbar aus versionierten Quellen.
- Apple-orientierter Web-Audit über alle 19 Core-Module und typische Docs-Abläufe; Befunde, Korrekturen und verbleibende Prüfgrenzen im Auditbericht.
- Dialogfokus, Suchbenennung, Tabpanel-Fokus, Schliessen-Flächen, mobile Suche, Reflow und dynamische Rückmeldungen korrigiert. System/Hell/Dunkel als Darstellungswahl; Brand bleibt in Navigationslinks erhalten.
- Brand-Inhalte auf ihre aktiven Themes begrenzt. Atlas-Struktur bleibt Referenz; keine Apple-HIG-Kopien als Paketbestandteil übernommen.
- Rapold-Präsentationsreferenzen mit lokal vorbereiteten Geist-Faces. Der Referenzcache berücksichtigt mitgelieferte Fontdateien und ihre Vorbereitung.

## Sygnum-Adapter · 11.09.2026

- Drittes isoliertes Preset mit gemessener PDF-Palette, referenzierten Originalfamilien, Presse-Logo und vollständigem Quellen-/Lückenmanifest.
- Originalpalette getrennt von funktionalen Kontrastrollen; generische CSS-/JSON-/DTCG-Exporte.
- Eigener Brand-Showcase und Management-Einstieg; keine Firmeninhalte im Default-Preset.
- Leichte Brand-Headlines werden im PPTX nicht mehr automatisch fett gesetzt.
- Vorschauprüfungen skalieren mit der Brand-Registry statt festen Zweibrand-Zahlen.
- Keine Originalfonts, geschützten Vollreports oder erfundenen SVG-/Folienmaster ausgeliefert.


## 0.4.3 — 2026-09-11

- Kurze Präsentationsaufträge mit einem Theme-spezifischen Management-Einstieg. Vollständiger Ablauf, Defaults, Nutzer-Overrides, Quellenprüfung, Export und Abnahme liegen im versionierten Vertrag.
- Präsentationsseite, Agenten-Einstieg und Prompt-Compiler verwenden denselben Generator. Das aktive Theme und ein gewähltes Preset bleiben im Kurzauftrag erhalten.
- Generierte Management-Verträge werden im Produktionsbuild auf vollständige lokale Ziele und Brand-Isolation geprüft.

## 0.4.2 — 2026-09-11

- Default-Preset und Goldbach-Theme in Markenansicht, Präsentations-FAQs, Bildwelt, Abdeckung und Agentenhinweisen getrennt. Firmenlogos und Goldbach-Vorgaben erscheinen nur im aktiven Goldbach-Theme.
- Eigene Agenten-Einstiege pro Theme; kopierte Aufträge und Downloads folgen der aktiven Brand. Gemeinsame Verträge enthalten keine vorausgewählte Firmen-CI.
- Theme-Auswahl kennzeichnet die neutrale Basis ausdrücklich als Default.

## 0.4.1 — 2026-09-11

- Tabellen nach Atlas verfeinert: kompakte Zeilen und Kopfzeile, Badges, Monospace-Kennungen, rechtsbündige Zahlen, sichtbare Sortierung, Suchfeld mit Zurücksetzen, 12 Zeilen als Standard und zugänglicher Leerzustand.

- Mermaid auf die fünf Atlas-Referenzmuster erweitert: automatisches Rendern, Vollbild, Editor, Quelltext, SVG-/MMD-Export und vollständige Brand-Farbgruppen. Font-Vermessung, lange Labels und Render-Reihenfolge abgesichert.
- Goldbach-Original-Logo in Navigation, mobiler Navigation und Präsentationsdownloads sichtbar. Markenansicht mit vier in der Quelle beschriebenen Farbkonstellationen der gelieferten Logo-Pfade, SVG-Downloads, Typografie und Vorlagen.
- Brand-Direktlinks über ?brand=goldbach, maschinenlesbare Mermaid-Themes und dokumentierte Herkunft.

## 0.4.0 — 2026-09-11

- Native Vercel-Git-Integration für Pushes auf main aktiviert; Vercel führt vor der Veröffentlichung npm run check aus. GitHub Actions prüft unabhängig. Die zusätzliche Token-Pipeline wurde entfernt.

- Organigramm und Zuständigkeiten mit dem Atlas-SVG-Renderer, öffentlicher Fassung ohne Namen, Live-Editor sowie SVG-, JSON- und HTML-Export.
- Apache ECharts mit vier Diagrammtypen, zugänglichen Datentabellen und SVG-Export. Bundle lokal ausgeliefert, versioniert und gegen Apache geprüft.
- Sprungnavigation auf der Präsentationsseite; Copy-Fehler werden sichtbar gemeldet.
- Atlas-Lucide-Icons in Navigation, eingeklappter Seitenleiste, Mobilnavigation und Suche übernommen; alle Links besitzen zugängliche Namen.
- Prompt-Compiler trennt Präsentation, Interface und schriftliches Management-Briefing mit passenden Quellen, Arbeitsschritten und Abnahmeregeln.
- Engineering-Vertrag um Releaseablauf, Herkunft, Browser-Abnahme, Integrationsverantwortung und Rollback ergänzt.
- Kopfzeile bleibt auch bei 320 px innerhalb der Ansicht; lange Seitentitel werden gekürzt. Statische Vercel-Routen erhalten explizite Clean URLs.
- Version und Buildstand werden aus package.json abgeleitet. Entwicklungsstart unterstützt weitergereichte Host- und Portparameter.

## 0.3.0 — 2026-09-11

- Eigene Atlas-Präsentationsseite mit 18 Folientypen, fünf Presets, 36 echten Folienvorschauen und zwölf PDFs.
- Datengetriebener Projektexport mit editierbarer PPTX, optionalem PDF und Quellenmanifest.

## 0.2.0 — 2026-09-11

- 19 UI-Module, vollständige Tokenverträge, Lucide-Katalog und 35 Referenzseiten übernommen.
- Atlas-Inhaltslogik und überprüfbare Deck-Verträge ergänzt.
