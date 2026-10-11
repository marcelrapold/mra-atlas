# Apple Design Review · Web-Designsystem

Stand: **11.10.2026**. Gegenstand: `marcelrapold/mra-design`, Integration der freigegebenen Rapold-Raumfaltenfamilie. Geprüfte Baseline: **`03555e3c86364e500da9b5a8a97b132e741cdfd8`**. Die unten genannten Zeilen beziehen sich auf diese Baseline, sofern ausdrücklich kein Integrationsstand genannt ist.

**Status: belegter Code-Audit mit anschliessender Korrekturprüfung.** Dies ist keine WCAG-Zertifizierung und keine Bestätigung vollständiger Atlas-Parität. Die statische Prüfung fand konkrete Probleme bei Dialogfokus, Suchsemantik, Tastaturfokus und schmalen Ansichten. Korrekturen und tatsächlich ausgeführte Prüfungen werden am Ende separat protokolliert. Ein geplanter Fix zählt noch nicht als bestandene Abnahme.

## 1. Quellen, Auftrag und Grenzen

Die lokalen Arbeitsverträge `AGENTS.md`, `apps/docs/AGENTS.md`, `README.md`, `docs/atlas-reference.md` und `docs/atlas-coverage.md` wurden gelesen. Atlas bleibt die verbindliche Referenz für Seitenarchitektur, Navigation, Komponentenverhalten und Präsentationsmuster. Apple HIG liefert ergänzende Kriterien für Bedienbarkeit und Gestaltung. Die freigegebene Rapold-Identität wird dadurch nicht ersetzt.

| Referenz | Geprüfter Stand und Bedeutung |
|---|---|
| mra-design | [Baseline 03555e3](https://github.com/marcelrapold/mra-design/tree/03555e3c86364e500da9b5a8a97b132e741cdfd8), Framework 0.4.3 |
| Atlas-Extraktion | `1c75c95417cc371040e1e24a0986213314b53c13`, in `docs/atlas-reference.md` dokumentiert |
| Aktueller Atlas-Quellvergleich | [98cd4fd](https://github.com/zvvch/zvv-atlas/tree/98cd4fd1051d2c0419cde87755ce409e475e2fd6). Die Hauptprüfung las Brand-Seite und Bausteine sowie App-Shell, Mobile-Navigation und Command-Palette. |
| Apple-Design-Skill | [SKILL.md am Commit 904b0ee](https://github.com/dickwu/apple-design-skill/blob/904b0eedc7cc778152f545506075d5bb5219ce77/SKILL.md), vollständige SHA `904b0eedc7cc778152f545506075d5bb5219ce77`, Commit vom 02.10.2026 |
| Web-Anforderungen | Primärquellen des W3C: WCAG 2.2 Understanding und ARIA Authoring Practices. Diese konkretisieren die Web-Semantik; die Understanding-Texte sind Erläuterungen zu den Erfolgskriterien. |

`https://atlas.zvv.dev/brand` zeigte eine geschützte Anmeldung. Eine sichere Anmeldung war durch den Browser-Anmeldeblock nicht möglich; Zugangsdaten wurden nicht übertragen. Der Quellvergleich ist belegt, der direkte visuelle Atlas-Vergleich bleibt offen. Die Hauptprüfung inspizierte separat den bestehenden Live-Stand auf `design.rapold.io`; diese Beobachtung ist kein Test des noch lokalen Integrationsstands.

### Auswertung des Skills

`SKILL.md`, `README.md`, `AGENTS.md` und `references/cross-platform.md` wurden vollständig gelesen. Die verwendeten HIG-Referenzen wurden vor der Bewertung vollständig gelesen: Accessibility, Layout, Typography, Color, Design principles, Branding, Icons, Dark Mode, Motion, VoiceOver, Modality, Focus and selection, Search fields, Entering data, Buttons, Sheets und Loading. App icons, Designing for macOS und Web views wurden zur Abgrenzung ebenfalls geprüft. Die Referenzen sind über [den festen Quellenbaum](https://github.com/dickwu/apple-design-skill/tree/904b0eedc7cc778152f545506075d5bb5219ce77/references/hig) reproduzierbar.

Der Skill verlangt für Web-Anwendungen einen Grundlagenmodus. Seine React-Native- und Desktop-Wrapper-Beispiele sind keine Implementierungsanleitung für React DOM. Im Audit wurden deshalb fünf Bereiche verwendet: Zugänglichkeit, passende Web-Konventionen, visuelle Hierarchie, Interaktion und verständlicher Inhalt.

**Nicht auf das Web übertragen:** native 17-pt-Schriftvorgaben, Apple-Tabbar-Positionen, macOS-Menüleisten, Sheet-Detents, obligatorische Wischgesten, SF Pro, SF Symbols, Liquid Glass und Icon Composer. Auch ein Web-Schalter für Hell/Dunkel ist nicht wegen einer nativen Empfehlung unzulässig. Geist, Geist Mono, die Raumfaltenzeichen und die freigegebenen Farben bleiben gültige Brand-Mittel. Ein Produktlogo ist kein generisches UI-Icon; eine Logo-Galerie darf ihre Varianten wiederholen.

### Messregeln für diese Web-Prüfung

- Regulärer Text: mindestens **4,5:1**. **3:1** gilt bei grossem Text ab 24 CSS-px oder etwa 18,67 CSS-px in fett. Die pauschale Formulierung des Skills zu beliebigem fettem Text wurde nicht übernommen. Sie ist für WCAG-Web-Text zu grosszügig. [W3C: Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- Funktional notwendige Konturen, Zustände und Fokusmarkierungen werden am tatsächlichen angrenzenden Hintergrund beurteilt; dekorative Trennlinien sind kein pauschaler 3:1-Pflichtfall. Opazität muss eingerechnet werden. [W3C: Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- Zeigerziele: **24 × 24 CSS-px** oder eine anwendbare Ausnahme, beispielsweise ausreichender Abstand. **44 × 44 CSS-px** ist hier eine sinnvolle Touch-Zielgrösse, kein pauschaler AA-Grenzwert. [W3C: Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- Text muss bei **200 %** verwendbar bleiben. Reflow wird bei **320 CSS-px** Breite geprüft. Tabellen, Diagramme und eigentliche Präsentationsflächen können eine notwendige zweidimensionale Anordnung behalten; Navigation, Formulare, Begleittexte und HTML-Karten darum herum müssen sich anpassen. [W3C: Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [W3C: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- Native HTML-Semantik, nachvollziehbare Fokusführung und benannte Steuerelemente gehen einer blossen ARIA-Beschriftung vor. [W3C: APG Read Me First](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/)

## 2. Verfahren und Abdeckung

Alle **19 exportierten Core-Module** wurden statisch gelesen. Zusätzlich geprüft: BrandProvider und Portal-Scopes, Core-CSS, globale Docs-CSS, Shell, Brand-Showcase, Komponentendemo, Icon-Suche, Tabelle, Daten- und ECharts-Beispiele, Mermaid, Organigramm, Formular-/Login-/Statusmuster, Präsentationsgalerie und Changelog-Infografik. Die kanonische Rapold-Definition, Identitätsbeschreibung und Integrationsregeln wurden separat vom Baseline-Code geprüft.

Entscheidende Bibliotheksdetails wurden im tatsächlich installierten Code nachgelesen. Ein kleiner SSR-Versuch mit `react-dom/server` und dem installierten `cmdk` bestätigte die leere interne Input-Beschriftung ohne `Command label`. Für diese Prüfung wurden keine neuen Dependencies installiert. SSR und Quellprüfung ersetzen keine Tastatur- oder Screenreader-Bedienung.

Prioritäten: **P1** unterbricht einen wichtigen Bedienpfad oder schneidet regulären Inhalt ab; **P2** ist ein konkreter Integrations- oder Zustandsfehler mit begrenztem Umfang; **P3** ist eine begründete Gestaltungsverbesserung. Wo Layout oder Assistenztechnik noch nicht ausgeführt wurden, steht das ausdrücklich beim Befund.

| Core-Modul | Geprüftes Verhalten / Ergebnis der statischen Prüfung |
|---|---|
| `button` | Natives Button-Element beziehungsweise explizites `asChild`; Fokus-/Disabled-Styles vorhanden. Kleine Varianten ab 24 px; Touch-Ergonomie und Press-Feedback separat beurteilen. |
| `badge` | Informative Labels und Farbrollen. Kein Trefferflächenurteil für nicht interaktive Badges; bei `asChild` gelten die Anforderungen des Ziel-Elements. |
| `card` | Neutrale Container und semantische Farben. `CardTitle` ist kein automatisches Dokument-Heading; die konsumierende Seite bleibt für ihre Gliederung verantwortlich. |
| `checkbox` | Radix-Zustand, Checked-Indikator, Invalid-/Disabled-Props. 16-px-Zeichen; Label und umgebender Trefferbereich müssen im konkreten Einsatz mitgemessen werden. |
| `command` | cmdk-Tastaturpfad, Empty-State, Dialogintegration und Benennung. Befund A02. |
| `dialog` | Radix-Modalität, Escape, Titel/Beschreibung, Portals. Kontrollierte Öffnungen und begrenzte Viewporthöhe: A01/A05. |
| `dropdown-menu` | Radix-Menürollen, Fokus, disabled, Checkbox-/Radio-/Submenüs; Token-Portal vorhanden. Laufzeitbedienung der Untermenüs bleibt separat. |
| `empty-state` | Überschrift, Beschreibung und optionale Aktion; dekoratives Icon verborgen. Ein dynamischer Status wird vom Aufrufer ausgezeichnet. |
| `input` | Natives Input, durchreichbare Label-/Invalid-Verknüpfungen, sichtbarer Fokus, 16 px mobil. |
| `label` | Radix-Label mit durchreichbarem `htmlFor`; zugehörige Inputs in den geprüften Formularen verbunden. |
| `lightbox` | Benannter Dialog, sichtbares Schliessen, Tab-Schleife, Escape, Scrollsperre und Rückkehr zum vorherigen Fokus im Code. Eigenes Fokusmodell verlangt reale AT-/Tastaturprüfung; kein Fehler allein wegen fehlendem zusätzlichem `aria-hidden` behauptet. |
| `popover` | Radix-Dialogrolle; konkrete Demo ohne Namen und inkonsistentes Title-Markup: A06. |
| `select` | Radix-Combobox-/Listenbedienung und Zustände; Demo benannt, Inhalte im aktiven Brand-Portal. |
| `separator` | Standardmässig dekorativ, Orientierung und semantischer Modus durchreichbar. |
| `sheet` | Radix-Dialog mit Seitenvarianten. Mobile kontrollierte Öffnung: A01; Trefferfläche: A13. |
| `skeleton` | Visueller Platzhalter; Busy-/Status-Semantik gehört zum ladenden Bereich. Reduzierte CSS-Bewegung vorhanden. |
| `sonner` | Bestehender Toaster mit Brand-Variablen und Symbol plus Text je Status. Reale Ansage-/Dauerprüfung bleibt offen. |
| `tabs` | Radix-Tastatur-/State-Modell übernommen; Tabpanel-Fokus wird visuell entfernt: A03. |
| `tooltip` | Radix Hover-/Fokusverhalten, Portal und Textkontrastrollen. Keine ausschliesslich per Tooltip beschriftete primäre Aktion in den geprüften Demos. |

## 3. Belegte Baseline-Befunde

### A01 · P1 · Fokus geht nach kontrolliertem Dialog verloren

**Code:** `apps/docs/app/_components/framework-shell.tsx:18,24–28`, `icon-gallery.tsx:11`, `presentation-page.tsx:31–34`.

Mobile Navigation, Suchpalette, Icon-Details und Foliengalerie öffnen über State ohne zugehörigen Radix-Trigger. Eine eigene `onCloseAutoFocus`-Rückgabe fehlt. Der installierte `@radix-ui/react-dialog/dist/index.js:205–208` verhindert die FocusScope-Standardrückgabe und fokussiert nur `context.triggerRef.current`. Dieser Ref ist in den genannten Abläufen nicht gesetzt. Der Fokus kann nach Escape oder Schliessen auf dem Dokument statt am bisherigen Arbeitsort landen.

**Korrektur und Abnahme:** Mobile Navigation mit echtem `SheetTrigger`; bei Suche und Galerien den konkreten Auslöser pro Öffnung merken und beim Schliessen fokussieren. Galerie-Navigation darf diesen Ursprung nicht ersetzen. Prüfen: Icon → Escape, Folie → zweimal Weiter → Escape sowie Öffnung aus dem Preset-Filmstreifen. Falls ein Auslöser entfernt wurde, ein sinnvolles bestehendes Ziel verwenden. Quelle: [W3C Dialog Pattern › Keyboard Interaction](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), HIG `focus-and-selection.md › Best practices`.

### A02 · P1 · Suchpalette hat falsche Titelposition und leeres Eingabelabel

**Code:** `packages/core/src/ui/command.tsx:37–46`, `apps/docs/app/_components/component-demo.tsx:17`.

Der versteckte `DialogHeader` steht ausserhalb des nur geöffnet gemounteten Contents. Der Titel bleibt deshalb auch bei geschlossener Suche in der Seitenstruktur; die Hauptprüfung beobachtete ihn ebenfalls im Accessibility-Baum des bestehenden Live-Stands. Zusätzlich fehlt beim inneren `Command` das `label`. cmdk erzeugt dann ein leeres Label und verbindet das Eingabefeld über seine eigene `aria-labelledby`-ID damit. Der SSR-Versuch bestätigte genau dieses Markup. Ein Placeholder benennt diesen Pfad nicht zuverlässig.

**Korrektur und Abnahme:** Header in `DialogContent`; `Command label={title}` beziehungsweise ein explizites Eingabelabel. Inline-Demo ebenfalls benennen. Deutsche List- und Close-Texte an den deutschsprachigen Aufrufstellen. Geschlossen darf kein Suchdialog-Header im Accessibility-Baum bleiben; geöffnet müssen Dialog und Combobox sinnvoll benannt sein. Quelle: [W3C Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html), HIG `search-fields.md › Best practices` und `modality.md › Best practices`.

### A03 · P1 · Fokussierbares Tabpanel ohne sichtbaren Fokus

**Code:** `packages/core/src/ui/tabs.tsx:71–76`, `apps/docs/app/globals.css:18`, `component-demo.tsx:13`.

Radix macht den Tabpanel fokussierbar. `TabsContent` entfernt mit `outline-none` die Standardmarkierung; ein eigener Fokusstil fehlt. Die globale Docs-Regel erfasst Links, Buttons, Selects und Summary, aber keine Tabpanels. Im Tab mit reinem Erklärungstext kann der Tab-Fokus deshalb unsichtbar werden.

**Korrektur und Abnahme:** Sichtbare `focus-visible`-Markierung am Panel. Mit Tab vom aktiven Tab in den Text-Panel und weiter navigieren; jede Station bleibt sichtbar, auch im dunklen Rapold-Theme. Quelle: [W3C Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html), HIG `focus-and-selection.md › Best practices`.

### A04 · P1 · Changelog-Karten schneiden Inhalt bei 320 px ab

**Code:** `apps/docs/app/_components/changelog-infographic.tsx:17,32,48`, `apps/docs/app/globals.css:20`.

Die erste HTML-Gridreihe verlangt mindestens 320 px Spaltenbreite plus 48 px Sectionpadding. Bei 320 px Viewport bleiben nach dem mobilen Main-Padding nur 284 px. Die erforderlichen 368 px passen nicht; der äussere Container verbirgt Überlauf. Eine zweite Reihe verwendet 260-px-Minima innerhalb weiterer Innenabstände. Das ist regulärer HTML-Karteninhalt, keine notwendige zweidimensionale Präsentationsfläche.

**Korrektur und Abnahme:** Mindestbreite durch verfügbare Breite begrenzen, etwa `minmax(min(100%, 320px), 1fr)` und analog für 260 px. Die gesamten Karten und Texte müssen bei 320 px ohne horizontalen Seitenüberlauf erreichbar sein. Die geometrische Ursache ist im Code belegt; tatsächliche Umbrüche und Fokusdarstellung brauchen Browserprüfung. Quelle: [W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), HIG `layout.md › Adaptability`.

### A05 · P2 · Allgemeine Dialoge berücksichtigen geringe Höhe nicht

**Code:** `packages/core/src/ui/dialog.tsx:57`, `command.tsx:43,77`; zum Vergleich bereits begrenzte `.deck-detail` in `apps/docs/app/globals.css:23`.

Der allgemeine Dialog ist fix in der Viewportmitte positioniert, besitzt aber keine maximale Höhe und keinen Scrollbereich. Icon-Details und Suchpalette können bei geringer Fensterhöhe oder vergrössertem Text über den gesperrten Hintergrund hinausreichen. Die Folienansicht hat bereits eine passende Begrenzung. Für den allgemeinen Fall ist dies ein belegtes Layout-Risiko, noch kein gemessener Browserfehler.

**Korrektur und Abnahme:** Dialoghöhe am dynamischen Viewport begrenzen; Content beziehungsweise Command-Liste gezielt scrollbar und schrumpfbar machen. Bei 200-%-Text und geringer nutzbarer Höhe bleiben Titel, Eingabe, Ergebnisse und Schliessen erreichbar. Quelle: [W3C Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), HIG `modality.md › Best practices`.

### A06 · P2 · Popover-Demo ist ein unbenannter Dialog

**Code:** `apps/docs/app/_components/component-demo.tsx:14`, `packages/core/src/ui/popover.tsx:53–54`.

Der installierte Radix-Popover verwendet `role="dialog"`. Die Demo zeigt einen unverbundenen `strong`-Text und setzt weder `aria-label` noch `aria-labelledby`. `PopoverTitle` ist zudem als `h2` typisiert, rendert tatsächlich aber ein `div`.

**Korrektur und Abnahme:** Echtes Heading mit ID und verbundenem `aria-labelledby`; Typ und HTML-Element stimmen überein. Beim Öffnen wird die Aufgabe «Kontext zur Aktion» vermittelt; Escape und Rückkehr zum Trigger funktionieren. Quelle: [W3C Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html), HIG `modality.md › Best practices`.

### A07 · P2 · Mobile Nutzer erreichen die Seitensuche nicht

**Code:** `apps/docs/app/_components/framework-shell.tsx:24–28`, `apps/docs/app/globals.css:20`.

Der einzige sichtbare Suchauslöser steht in der Sidebar, die unter 768 px verschwindet. Das mobile Sheet enthält nur Navigation. Ohne Hardwaretastatur gibt es damit keinen Weg zur angebotenen Cmd-K-Suche.

**Korrektur und Abnahme:** Sichtbarer Suchzugang auch im mobilen Navigations-/Toolbar-Pfad. Mit Touch bei 320 und 390 px öffnen, Begriff suchen, Ergebnis öffnen und Abbrechen prüfen. Quelle: HIG `search-fields.md › Tablet and desktop › Account for window resizing`; als Web-Prinzip übernommen, ohne native Platzierung vorzuschreiben.

### A08 · P2 · Tabellen-Reset entfernt den fokussierten Auslöser

**Code:** `apps/docs/app/_components/table-showcase.tsx:41,43,49`.

Sowohl das X im Suchfeld als auch der Resetbutton im Kein-Treffer-Zustand verschwinden nach `resetSearch`. Der Fokus wird dabei nicht an das bestehende Suchfeld weitergegeben. Die bereits guten Statusmeldungen und die zugängliche Scrollregion lösen diesen Fokusverlust nicht.

**Korrektur und Abnahme:** Suchfeld-Ref verwenden und bei beiden Resetaktionen dorthin fokussieren. Suchbegriff, Seitennummer und Ergebnisstatus müssen danach den zurückgesetzten Zustand anzeigen. Quelle: HIG `focus-and-selection.md › Best practices`; [W3C APG Read Me First](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/).

### A09 · P2 · Icon-Suche meldet Trefferänderungen nur visuell

**Code:** `apps/docs/app/_components/icon-gallery.tsx:11`.

Trefferzahl und «Keine Icons gefunden» erscheinen ohne Statusrolle. Die Tastatur bleibt im Suchfeld, während sich diese Rückmeldung andernorts ändert. Die Ergebnisliste selbst muss dafür nicht zur Live-Region werden.

**Korrektur und Abnahme:** Kurze, zusammenhängende Suchstatusmeldung mit `role="status"`, bei Bedarf `aria-atomic`. Suche mit Treffern und ohne Treffer sowie «Weitere Icons laden» prüfen; keine Ansage aller Icons bei jeder Eingabe. Quelle: [W3C Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), HIG `voiceover.md › Descriptions`.

### A10 · P2 · Kopierbestätigung gilt fälschlich für einen geänderten Prompt

**Code:** `apps/docs/app/_components/presentation-page.tsx:15,19–20,24`.

Nach erfolgreichem Kopieren bleibt `copied=true`, auch wenn Repository, Anlass oder Brand den generierten Auftrag verändern. «Kopiert» bezeichnet dann nicht mehr den sichtbaren Prompt. Gerade im primären Übergabepfad kann dadurch veralteter Text verwendet werden.

**Korrektur und Abnahme:** Bestätigung an den tatsächlich kopierten Text binden beziehungsweise bei Promptwechsel zurücksetzen. Erst kopieren, dann jeweils Repository, Anlass und Brand ändern; die Bestätigung muss verschwinden. Quelle: HIG `design-principles.md › Agency`, `entering-data.md › Best practices`.

### A11 · P2 · ECharts zeigt nach endgültigem Ladefehler weiter Loading

**Code:** `apps/docs/app/_components/echarts-showcase.tsx:43,47–48`.

Der Scriptfehler setzt `error`, aber nicht `ready`. Alle vier Panels zeigen weiter «Diagramm wird geladen», während gleichzeitig der Fehler gemeldet wird. Das wirkt wie ein noch laufender Vorgang. Die Datentabellen bleiben bereits als inhaltlicher Fallback verfügbar.

**Korrektur und Abnahme:** Terminalen Fehler bis zu den Panels weiterreichen und Ladeanzeigen beenden. Bei fehlender Bibliothek bleiben Tabellen erreichbar und SVG-Aktionen deaktiviert; es wird kein unendlicher Ladevorgang behauptet. Quelle: HIG `loading.md › Showing progress`; [W3C Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

### A12 · P2 · Brand-spezifischer Inhalt erscheint im falschen Theme

**Code:** `apps/docs/app/_components/changelog-infographic.tsx:20–30`, `brand-showcase.tsx:9–10,31`, `presentation-page.tsx:14`.

Die Infografik zeigt Dominicano-Firmendaten auch im neutralen oder Rapold-Theme und ergänzt lediglich einen Hinweis. Der Brand-Showcase und Präsentations-FAQ behandeln teilweise alle nicht gesondert behandelten Brands als neutral. Dadurch können ein Firmenname und «Default ohne Firmenlogo» im selben aktiven Brand-Kontext widersprechen. Die neue Rapold-Auswahl macht diese bestehende Verzweigungsannahme zusätzlich sichtbar.

**Korrektur und Abnahme:** Corporate-Inhalte nur im zugehörigen Brand, sonst tatsächlich neutrale Inhalte; Texte an vorhandene Assets und aktive Brand binden. Alle Brands einmal durch Brand-Seite, Infografik und Präsentations-FAQ wechseln. Kein Produktsignet wird als erfundenes Rapold-Dachlogo benutzt. Quellen: lokale `AGENTS.md`, `docs/atlas-reference.md`; HIG `branding.md › Best practices`.

### A13 · P2 · Close-Zeichen haben nur 16-px-Trefferflächen

**Code:** `packages/core/src/ui/dialog.tsx:64–69`, `sheet.tsx:73–75`; Toolbar `.icon-button` in `apps/docs/app/globals.css:18` hat 30 px.

Die Close-Buttons besitzen keine zusätzliche Fläche um das 16-px-Icon. Das ist auf Touch und bei eingeschränkter Feinmotorik unnötig schwierig. Aus dem Iconmass allein folgt **kein** WCAG-2.5.8-Fehler: Ein genügend freistehender Button kann die Abstandsausnahme erfüllen. Andere kleine Controls, insbesondere die Checkbox mit aktivem Label, müssen als vollständiger Trefferbereich betrachtet werden.

**Korrektur und Abnahme:** Close-Buttons mindestens 32 px im kompakten Layout und 44 px bei grobem Zeiger; Icon bleibt optisch klein. Der grössere Bereich darf Titel oder Suchfeld nicht überdecken. Messung am Elementrechteck, nicht am SVG. Quelle: HIG `buttons.md › Best practices`; [W3C Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## 4. Bewusste Entscheidungen und verbleibende Prüfgrenzen

Die Rapold-Integration hält Identität und UI-Rollen getrennt: `packages/brands/src/rapold.json` enthält das optionale Theme; `brands/rapold/identity.json` verwaltet vier Produktsignets. Azure und Ice bleiben Logo-Farben, während reguläre Texte und Aktionen eigene kontrastgerechte Rollen erhalten. Die Brand besitzt absichtlich kein erfundenes Dachsymbol. Diese Architektur entspricht dem lokalen White-Label-Vertrag und HIG `branding.md`; sie ist keine Stilabweichung, die auf Apple-Optik korrigiert werden sollte.

Positiv vorhanden sind benannte native Formularfelder, beschriftete Status-Badges, konkrete Fehler-/Leerzustände, Tabellen als Alternative zu Diagrammen, Tastatur-Scrollbar für die grosse Tabelle, Brand-Scopes für Radix-Portale und Reduced-Motion-CSS. ECharts beobachtet die Motion-Präferenz. Der installierte Recharts-Stand nutzt bei `isAnimationActive='auto'` selbst `prefers-reduced-motion`; das Fehlen eines expliziten Props in der Demo wurde daher nicht als Fehler gemeldet.

**#meinung:** Ein dezenter Press-Zustand für individuell gestaltete Buttons würde das Feedback verbessern. Das ist ein Craft-Vorschlag aus HIG `buttons.md`, kein zusätzlicher Freigabeblocker und keine Aufforderung, Brand-Formen oder Typografie zu vereinheitlichen.

Offen bleiben eine echte Screenreader-Prüfung, physische Touch-Bedienung, Forced Colors sowie vollständige Tastaturbedienung aller Chart-Legenden, VisualMap-Interaktionen, verschachtelten Menüs und eigenen Lightbox-Zustände. Datentabellen belegen den Zugang zu den Zahlen, nicht automatisch die Gleichwertigkeit jeder gezeichneten Chart-Aktion. Ein festes 16:9-Deck und seine Raster-SVGs werden nicht pauschal als Reflow-Verstoss gewertet.

### Lizenz und Installation des Audit-Skills

Am gepinnten Commit hat das Skill-Repository keine `LICENSE`-Datei; die GitHub-Lizenzmetadaten sind leer. Die README verweist auf Apples Rechte an den HIG-Inhalten und bezeichnet zusätzliche Materialien lediglich als «as is». Das ist keine belegte MIT-/Apache-Freigabe. Deshalb wurden weder Skilltexte noch HIG-Kopien in dieses Repository übernommen. Dieser Audit enthält eigene Befunde und Quellenverweise.

Die README beschreibt `npx skills add dickwu/apple-design-skill -a codex` und eine Submodule-Variante. **Es wurde nichts installiert** und kein Refresh-Script ausgeführt. Eine spätere Installation ist für die Nachvollziehbarkeit dieses Audits nicht erforderlich; massgeblich ist die oben festgehaltene SHA. Framework-, Logo- und Fontrechte werden dadurch nicht verändert.

## 5. Korrektur- und Abnahmeprotokoll

### 5.1 Gezielte Quellnachprüfung der Korrekturen

Die folgende Nachprüfung bezieht sich auf den lokalen Integrationsstand vom 11.10.2026, Framework 0.5.0, vor Commit und Push. Sie prüft die konkreten Änderungen und eröffnet keinen neuen allgemeinen Audit. **«Quellkorrektur bestätigt» bedeutet nicht «im Browser abgenommen».** Für alle 13 dokumentierten Baseline-Befunde, einschliesslich der vier P1-Befunde, ist die beschriebene Korrektur im Code bestätigt.

| Befund | Belegte Korrektur im Integrationsstand | Status |
|---|---|---|
| A01 | Shell besitzt einen echten `SheetTrigger`, gespeicherten Suchursprung und gezielte `onCloseAutoFocus`-Handler. Das mobile Sheet schliesst vollständig und öffnet die Suche erst in diesem Close-Handler; der Shortcut im offenen Sheet nutzt denselben Weg. Icon-Galerie, Foliengalerie und Preset-Filmstreifen speichern `event.currentTarget` pro Öffnung; Weiter/Zurück verändert diesen Ref nicht. | Quellkorrektur bestätigt; Rückkehr, Seitenwechsel und mobiler Sheet→Suche-Übergang im Browser offen |
| A02 | `CommandDialog` mountet Header im Content und reicht `label={title}` an Command. Inline-Demo und Listen sind explizit deutsch benannt; Close-Texte über eine generische API. | Quellkorrektur bestätigt |
| A03 | `TabsContent` besitzt wieder `focus-visible`-Outline; die Docs ergänzen eine kontrastgebundene 3-px-Regel. | Quellkorrektur bestätigt; visuelle Fokusabnahme offen |
| A04 | `changelog-infographic.tsx:101,128` begrenzt beide Grid-Minima mit `min(100%, 320px)` beziehungsweise `min(100%, 260px)`. Schrumpfbare Kindspalten, `minWidth: 0`, umbrechbarer Text und variables Innenpadding ergänzen den Fix. | Quellkorrektur bestätigt; tatsächlicher Reflow bei 320/390 px offen |
| A05 | `DialogContent` begrenzt die Höhe auf `100dvh - 2rem` und erlaubt vertikales Scrollen. `accessibility.css` begrenzt die Command-Liste am Viewport und setzt `min-height: 0`. | Quellkorrektur bestätigt; kleine Höhe/200-%-Text noch im Browser prüfen |
| A06 | Popover-Content verweist über `useId` auf den sichtbaren Titel; `PopoverTitle` rendert nun tatsächlich `h2`. | Quellkorrektur bestätigt |
| A07 | Mobile Navigation enthält einen sichtbaren Suchbutton. Die Toolbar kann auf schmalen Ansichten umbrechen; mobile Seitenanker sind nicht mehr zusätzlich sticky. | Quellkorrektur bestätigt; Touch-/Tastaturübergang offen |
| A08 | Beide Tabellenresetwege fokussieren den bestehenbleibenden Suchinput über einen Ref. | Quellkorrektur bestätigt |
| A09 | Trefferzahl der Icon-Suche besitzt `role="status"`, `aria-live="polite"` und `aria-atomic="true"`. | Quellkorrektur bestätigt; tatsächliche Ansage offen |
| A10 | Prompt-/Brand-/Anlass-/Repositorywechsel setzen die Kopierbestätigung zurück; eine Versuchskennung verwirft verspätete Clipboard-Ergebnisse. | Quellkorrektur bestätigt |
| A11 | Scriptfehler werden an Chart-Panels weitergereicht; Loading endet, Exporte bleiben deaktiviert, Tabellen öffnen sich als Fallback. Auch fehlende Engine und Fehler bei `init`/`setOption` werden abgefangen. | Quellkorrektur bestätigt; ausgelöster Fehlerfall im Browser offen |
| A12 | Rapold besitzt einen eigenen Showcase; Brand-Showcase, Katalog und Coverage unterscheiden Rapold, Dominicano und Default. Die Infografik wählt Corporate-Inhalte nur für `dominicano-express`, sonst ein ausdrücklich fiktives neutrales Muster, und verwendet semantische Farben. `presentation-page.tsx:11–39` enthält fünf eigene FAQ-Zweige. Nur neutral ist das Default-Preset; Rapold nennt die vier freigegebenen Produktzeichen, kein Dachmarkenlogo und den separat als Entwurf geführten UI-Adapter. | Quellkorrektur bestätigt, einschliesslich des abschliessenden FAQ-Textfixes; realer Brand-Wechsel im Browser offen |
| A13 | Dialog/Sheet-Close haben 32 px und bei grobem Zeiger 44 px. Titel erhalten Abstand; CommandInput reserviert Raum für die Close-Aktion. | Quellkorrektur bestätigt; tatsächliche Rechtecke/Überdeckungen offen |

**Zusätzliche gezielte Integrationsprüfung:** Die Datenzuordnung des neuen `rapold-showcase.tsx` stimmt mit dem erzeugten `assets-manifest.json` überein: 208 Einträge, 52 pro Produkt, je ein Produkt-ZIP, gültige Kategorie-/Formatwerte, sämtliche angeforderten Bannerkombinationen in SVG/PNG und alle fest referenzierten Favicon-/App-Icon-Pfade. Es wurden dafür die Metadaten und konkreten Dateipfade verglichen, nicht erneut alle Assetbytes breit getestet. Familienbuttons verwenden ihren gedrückten Zustand, separate editierbare Namen und eine Statusmeldung. `currentColor` wird korrekt als Inline-SVG-Anwendung erklärt. Die Schriftdateien werden lokal geladen; der Geist-Mono-Override steht im App-Adapter nach `toCssVariables` und wird daher nicht von dessen Inline-Default überschrieben.

Die zusätzlich gemeldeten Zustandsfälle sind im Code korrigiert. `rapold-showcase.tsx:40,98–100` fokussiert vor einem erneuten Ladeversuch über einen Ref die bestehenbleibende Vorschauüberschrift. Der Button für weitere Dateien bleibt nach dem letzten Batch an derselben Stelle erhalten, trägt `aria-disabled="true"` und ignoriert weitere Aktivierungen (`:119`). `framework-shell.tsx:136` zeigt beim Wechsel von explizit Dunkel zu einer Brand ohne Dark-Modus den tatsächlich verwendeten Wert Hell. Der mobile Suchbutton und Cmd/Ctrl-K im geöffneten Sheet setzen nur einen Suchwunsch und schliessen das Sheet; erst dessen `onCloseAutoFocus` öffnet den Command-Dialog (`:70–80,146–148`). Damit sind die gemeldeten Ursachen im Quellcode behoben; reale Fokusfolge und Ansagen bleiben Teil der Browser-/AT-Abnahme.

### 5.2 Laufzeit- und Abnahmeevidenz

Die Hauptprüfung hat den Integrationsstand mit `npm run check` geprüft und die folgenden Ergebnisse übermittelt. Dieser Gesamtlauf lag vor dem abschliessenden FAQ-Textfix; der Korrekturagent meldete für den anschliessenden FAQ-Stand separat einen erfolgreichen Typecheck und eine fehlerfreie Diff-Prüfung. Der Audit-Agent hat diese Prüfungen nicht parallel erneut ausgeführt. Die lokal gelesene `apps/docs/out/build-info.json` weist Framework 0.5.0, 19 UI-Module, 18 Folientypen und fünf Deck-Presets aus. Die nachstehenden Rendernachweise beziehen sich auf Präsentationsdateien; sie sind keine UI-Browserabnahme.

| Prüfschritt | Aktueller belegter Stand |
|---|---|
| Baseline und alle 19 Core-Module statisch gelesen | Erledigt, Baseline-SHA oben |
| cmdk-Labelverhalten per SSR geprüft | Erledigt: ohne Root-Label leeres verbundenes Label; mit `label="Aktion suchen"` korrekter Text |
| Radix-Rückgabefokus im installierten Code geprüft | Erledigt: Modal-Close fokussiert ausschliesslich den registrierten Trigger, wenn kein eigener Handler eingreift |
| Gezielte Quellnachprüfung der umgesetzten Korrekturen | Erledigt im oben beschriebenen Umfang, einschliesslich Changelog, mobilem Suchübergang, drei Zustandskorrekturen und dem abschliessenden FAQ-Fix |
| `npm run check` am Integrationsstand vor dem letzten FAQ-Textfix | Bestanden laut Hauptprüfung: 50/50 Tests, TypeScript und Next.js-16.3.5-Build; 36 Routen indexiert |
| Abschliessender FAQ-Stand | Im Code nachgelesen; Korrekturagent bestätigt danach `npm run typecheck` mit Exit 0 und `git diff --check` ohne Befund |
| Präsentationsdateien und echte Referenzrenders | Hauptprüfung bestätigt 30 PPTX, 90 tatsächlich gerenderte PNG und 30 PDF; kein blosses Umbenennen von SVG als PNG |
| Rapold-PDF-Schriften | `pdffonts` an einem Rapold-Muster bestätigt laut Hauptprüfung tatsächlich eingebettete Geist-Regular und Geist-Bold |
| Visuelle Rapold-Referenzprüfung | Hauptprüfung betrachtete Cover, Management Summary und Split-Tabelle als gerenderte PNG; kein Befund zu Text oder Clipping in diesen drei Mustern. Keine pauschale Sichtabnahme sämtlicher Folien |
| Auslieferbare Brand-Dateien | Hauptprüfung bestätigt im deploybaren `apps/docs/out` 208 Assets und 27 zusätzliche Ressourcen, jeweils mit SHA-256 gegen den Vertrag geprüft |
| Atlas-Quellenabgleich | Erledigt durch Hauptprüfung am oben genannten Commit |
| Direkter visueller Atlas-Vergleich | Offen: Browser-Anmeldeblock |
| Aktuelle UI, 320/390 px, Hell/Dunkel | Offen: Für den neuen Integrationsstand liegt keine Browser-Evidenz vor |
| Suche, Dialoge, Sheet, Galerien, Tabellenreset per Tastatur | Offen: Quellkorrekturen sind belegt, tatsächliche Bedienung noch nicht |
| 200-%-Text und geringe Viewporthöhe | Offen bis tatsächliche Prüfung dokumentiert |
| VoiceOver/NVDA oder gleichwertige reale AT-Bedienung | Offen |

`vercel.json` erlaubt Git-Deployments ausdrücklich nur für `main` und deaktiviert andere Branches. Diese Konfiguration wurde für den Audit nicht verändert. Ein reviewbarer Branch beziehungsweise PR liefert deshalb noch keine neue Browser-Preview. Die zuvor betrachtete Live-Seite ist kein Nachweis für diesen Integrationsstand. Der direkte visuelle Atlas-Vergleich bleibt zusätzlich durch den beschriebenen Anmeldeblock offen.

### 5.3 Konkrete offene Browser- und AT-Abnahme

Die folgende Liste beschreibt die verbleibenden Prüfungen am tatsächlich bereitgestellten Integrationsstand. Zu jedem Ergebnis gehören URL beziehungsweise Commit, Browser, Viewport und verwendete Assistenztechnik; ein bestandener Build ersetzt diese Angaben nicht.

| Ablauf | Abnahmekriterium |
|---|---|
| Shell, Brand-Seite und Changelog bei 320 und 390 CSS-px | In Rapold Hell/Dunkel und einer Brand nur mit Hell bleiben Toolbar, Themeauswahl, Suchzugang und HTML-Kartentexte vollständig erreichbar. Kein horizontaler Seitenüberlauf ausserhalb notwendiger Tabellen-/Präsentationsflächen; Trefferbereiche überdecken keine Nachbaraktion. |
| Mobile Navigation → Suche | Sheet per sichtbarem Button öffnen, Suche einmal per sichtbarem Suchbutton und einmal per Cmd/Ctrl-K starten. Der Fokus erreicht das Suchfeld, ohne konkurrierende Modalbereiche. Escape aus der Suche führt zum bestehenbleibenden Menübutton zurück. Ein Suchergebnis behält die gewählte Brand in der Zielroute und führt den Fokus nachvollziehbar in den Hauptinhalt. |
| Dialoge und Galerien | Icon öffnen → Escape; Folie öffnen → zweimal Weiter → Escape; dasselbe aus dem Preset-Filmstreifen. Der Fokus kehrt jeweils zum ursprünglichen Auslöser zurück. Dialog-Close und Popover sind verständlich benannt; die geschlossene Suche hinterlässt keinen Dialogtitel im Accessibility-Baum. |
| Tastaturfokus, 200-%-Text und geringe Höhe | Tabpanel erhält einen sichtbaren Fokus. Bei 200-%-Text und geringer Fensterhöhe bleiben Dialogtitel, Eingaben, Liste und Schliessen erreichbar. Dialog-/Sheet-Close messen 32 px beziehungsweise 44 px bei grobem Zeiger und überdecken weder Titel noch Suche. |
| Dynamische Such- und Datenzustände | Beide Tabellenresetwege führen zum Suchfeld zurück. Icon-Trefferzahlen werden verständlich angekündigt. Kopierbestätigungen verfallen nach einer Änderung der Eingaben. Ein ausgelöster ECharts-Ladefehler endet in sichtbarer Fehlermeldung und zugänglicher Datentabelle; der Export bleibt dann deaktiviert. |
| Rapold-Manifest, Familienwahl und Downloads | Ladefehler auslösen → Erneut laden: Fokus bleibt an der Vorschauüberschrift. Mehrfach weitere Dateien laden: Der letzte Auslöser bleibt fokussierbar und meldet den abgeschlossenen Zustand. Filter ohne Treffer zeigen eine verständliche Rückmeldung; Produktwechsel hält Signet, Vorschau und Downloads konsistent. |
| Brand-Wechsel und Inhalt | Alle Brand-Seiten, die Infografik und Präsentations-FAQ verwenden passende Markeninhalte. Explizit Dunkel → Brand ohne Dark-Modus zeigt sichtbar Hell. Corporate-Daten erscheinen ausschliesslich im passenden Brand-Kontext. |
| Reale Assistenztechnik | Mit VoiceOver/Safari oder NVDA/Firefox die Suche, Dialoge, Statusmeldungen, Filter und Downloadtabelle bedienen. Namen, Rollen und Zustände sind verständlich; Fokus bleibt im offenen Modal und kehrt danach nachvollziehbar zurück. Ansagen werden weder verschluckt noch störend doppelt ausgegeben. |

Forced Colors, tatsächliche Touch-Bedienung sowie weitergehende Chart-, Menü- und Lightbox-Interaktionen aus Abschnitt 4 bleiben als zusätzliche Prüfgrenzen dokumentiert. Aus dem vorliegenden Quell-, Build- und Rendernachweis folgt keine vollständige WCAG- oder Atlas-Abnahme.
