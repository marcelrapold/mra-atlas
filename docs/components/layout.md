# Layout-Komponenten

Seitenstruktur und Navigation, übernommen aus RadioX und für Atlas neutralisiert: nur semantische Tokens, keine Brand-Farben, keine App-Logik (Router, Stores, Player). Dazu die Atlas-Basisprimitive Accordion, Collapsible, Table und Kbd für Inhaltsstruktur. Demo: `apps/docs/app/_components/demos/layout-demo.tsx`.

## PageHeader

`packages/core/src/ui/page-header.tsx`. RadioX-Herkunft: `radiox/apps/frontend/components/layout/PageHeader.tsx`.

**Zweck:** Kopf einer Seite mit genau einem `<h1>`, optionaler Überzeile, Beschreibung, Breadcrumb und Aktionen.

**Props:** `title` (Pflicht, `<h1>`), `eyebrow`, `eyebrowTone` (`Tone`, Standard `neutral`, rendert `<Eyebrow as="p">`), `description`, `breadcrumb` (Slot, meist `<Breadcrumb>`), `actions` (Slot), `size` `default | compact`, `hideBreadcrumbOnMobile` (Standard `false`), `titleProps` (z. B. `id` als Fokusziel nach Navigation). Root ist `<header>` mit `data-slot="page-header"` und `data-size`.

**A11y:** Ein `PageHeader` pro Seite, weil er das `<h1>` setzt. Ein `<header>` innerhalb von `<main>` ist keine Banner-Landmark. Aktionen brechen auf schmalen Viewports in eine eigene Zeile um, statt abgeschnitten zu werden.

**Do:** Die Beschreibung auf einen Satz beschränken. `compact` für dichte Dashboards verwenden.
**Don't:** Einen zweiten `PageHeader` als Abschnittstitel verwenden; dafür ist `Section` da.

**Abweichungen:** `kicker`/`subtitle` heissen `eyebrow`/`description`. `accent` (Brand-Farben) wurde durch `eyebrowTone` ersetzt, `dense` durch `size="compact"`. `center` und `singleLineFromMd` entfallen, weil sie auf eine einzelne RadioX-Seite zugeschnitten waren. `hideBreadcrumbOnMobile` ist standardmässig `false` statt `true`: Atlas blendet Orientierung nicht ohne Zutun der App aus.

## Breadcrumb

`packages/core/src/ui/breadcrumb.tsx`. RadioX-Herkunft: `radiox/apps/frontend/components/layout/Breadcrumb.tsx`.

**Zweck:** Pfadnavigation zur aktuellen Seite. Teile: `Breadcrumb` (`<nav>`, Standardlabel «Pfadnavigation»), `BreadcrumbList` (`<ol>`), `BreadcrumbItem`, `BreadcrumbLink` (`<a>` oder `asChild` für Router-Links), `BreadcrumbPage` (`aria-current="page"`), `BreadcrumbSeparator` (Chevron, eigenes Icon als Kind möglich), `BreadcrumbEllipsis` (`label`, Standard «Weitere Ebenen»).

**A11y:** Geordnete Liste. Trennzeichen sind `role="presentation"` und `aria-hidden`. Die aktuelle Seite ist kein Link. Links haben einen sichtbaren Outline-Fokus und bei grobem Zeiger mindestens 44 px Höhe (`pointer-coarse:min-h-11`).

**Do:** `asChild` mit der Link-Komponente des Routers verwenden, damit Mittelklick und neuer Tab funktionieren.
**Don't:** `onClick`-Buttons als Breadcrumb-Einträge verwenden.

**Abweichungen:** Die Daten-API (`items[]` mit `href`/`onClick`) wurde durch Kompositionsteile ersetzt (shadcn-Muster, router-agnostisch). Die `<button>`-Variante für reine `onClick`-Einträge entfällt; SpaLink wird durch `asChild` ersetzt. `BreadcrumbPage` hat bewusst kein `role="link" aria-disabled` wie bei shadcn.

## Section

`packages/core/src/ui/section.tsx`. RadioX-Herkunft: `radiox/apps/frontend/components/layout/Section.tsx`.

**Zweck:** Ein benannter Seitenbereich mit einheitlichem Kopf.

**Props:** `Section`: `title`, `description`, `icon`, `actions`, `headingLevel` (`2 | 3 | 4`, Standard 2), `spacing` `none | sm | md | lg` (Standard `md`). `SectionHeader` lässt sich einzeln verwenden: dieselben Props plus `titleId`.

**A11y:** Mit `title` erhält `<section>` automatisch `aria-labelledby` auf die Überschrift (`useId`) und wird zur benannten Region. Das Icon ist dekorativ (`aria-hidden`). Die Überschriftenebene muss zur Gliederung der Seite passen.

**Do:** `headingLevel={3}` für verschachtelte Bereiche verwenden.
**Don't:** Überschriften nur über die Schriftgrösse hierarchisieren.

**Abweichungen:** `subtitle` heisst `description`, `headerRight` heisst `actions`. Die Versal-/Sperrsatz-Überschrift in Weiss (RadioX-Stil) wurde zu einer neutralen `text-foreground`-Überschrift. Neu sind `aria-labelledby`, `headingLevel` und `spacing="none"`.

## BottomNav, BottomNavItem, BottomNavFab, BottomStack, BottomStackSpacer

`packages/core/src/ui/bottom-nav.tsx` (`'use client'`). RadioX-Herkunft: `radiox/apps/frontend/components/MediaPlayer/MobileBottomNav.tsx`, `radiox/apps/frontend/components/MediaPlayer/BottomStack.tsx`.

**Zweck:** Hauptnavigation am unteren Rand für schmale Viewports und ein Container, der eine persistente Leiste (z. B. Player) über der Navigation stapelt.

**Props:**
- `BottomNav`: `position` `fixed | static` (Standard `fixed`, inkl. `env(safe-area-inset-bottom)`), `layout` `grid | scroll` (gleich breite Spalten bzw. horizontale Leiste mit CSS-Scroll-Snap), `fab` (Slot, schwebt rechts über der Leiste), `aria-label` (Standard «Hauptnavigation»). Auf Desktop per `className="lg:hidden"` ausblenden.
- `BottomNavItem`: `label` (Pflicht), `icon`, `active` (setzt `aria-current="page"`), `href` (→ `<a>`), ohne `href` → `<button type="button">`, `asChild` + leeres Link-Element als Kind (Icon und Label werden hineingereicht).
- `BottomNavFab`: `label` (Pflicht, `aria-label`), `pulse` (dekorativer Ring, nur bei `motion-safe`), `asChild`.
- `BottomStack`: `position` `fixed | static`, `fab`, `label` (erzeugt eine benannte Region, ohne Label keine Landmark), `publishHeight` (Standard bei `fixed`: schreibt die gemessene Höhe als `--bottom-stack-height` auf `<html>`; Konstante `BOTTOM_STACK_HEIGHT_VAR`). Die Safe Area wird genau einmal am Stack angewendet; enthaltene Navigation `position="static"`.
- `BottomStackSpacer`: Platzhalter mit `height: var(--bottom-stack-height)` am Seitenende.

**A11y:** Ziele sind mindestens 56 × 64 px. Der Fokus ist eine nach innen versetzte Outline (`-outline-offset-2`), weil die scrollbare Leiste eine äussere Outline abschneiden würde. Das aktive Ziel trägt `aria-current="page"`; der Indikatorbalken ist dekorativ. Übergänge entfallen bei `prefers-reduced-motion`. Der Stack misst seine Höhe nur im Browser (`useEffect`, `ResizeObserver` mit Feature-Abfrage) und ist SSR-sicher.

**Do:** Drei bis fünf Hauptziele im `grid`-Layout, mehr im `scroll`-Layout. Seiteninhalt mit `BottomStackSpacer` oder `padding-bottom: var(--bottom-stack-height)` freihalten.
**Don't:** Zwei fixierte Leisten unabhängig voneinander positionieren; Player und Navigation gehören in einen `BottomStack`. Keine Navigation per `onClick` ohne `href`, wenn es ein echtes Ziel gibt.

**Abweichungen:** Routing, Auth, Surface-Erkennung, Haptik und das Starten des Streams sind App-Logik und entfallen; Ziele kommen als Kinder. Die Akzentfarben (cyan/purple/pink mit Glow) werden durch `text-primary`/`bg-primary` ersetzt. Der FAB ist nicht mehr fix mit `bottom: calc(var(--bottom-stack-h) + 1rem)` positioniert, sondern sitzt in einem Slot (`bottom-full`) über Nav bzw. Stack; damit braucht er die CSS-Variable nicht. Die Variable heisst `--bottom-stack-height` statt `--bottom-stack-h`. `PlayerSkipLink`, `PersistentMiniBar` und Playback-Signale gehören nicht zum Core.

## Avatar, AvatarImage, AvatarFallback, AvatarGroup, getInitials

`packages/core/src/ui/avatar.tsx` (`'use client'`, Radix Avatar). RadioX-Herkunft: `radiox/apps/frontend/components/LivePlayer/SpeakerAvatar.tsx`, `radiox/apps/frontend/utils/avatar.ts`, `radiox/apps/frontend/components/LivePlayer/LiveListenerSheet.tsx`.

**Zweck:** Bild einer Person oder Gruppe mit ehrlichem Fallback (Initialen oder Icon), ausserdem gestapelte Gruppen mit Zähler.

**Props:**
- `Avatar`: `size` `xs | sm | md | lg | xl` (24–64 px, innerhalb einer Gruppe von ihr übernommen), `shape` `circle | square` (`square` nutzt `var(--brand-radius)`).
- `AvatarImage`: Radix-Image, `referrerPolicy` standardmässig `no-referrer`.
- `AvatarFallback`: `label` (zugänglicher Name; die sichtbaren Initialen werden dann `aria-hidden`), `delayMs` (Radix).
- `AvatarGroup`: `size`, `max`, `total` (Gesamtzahl, wenn grösser als die übergebenen Avatare), `spacing` `tight | default | loose`, `label` (`role="group"`), `formatOverflowLabel` (Standard «und N weitere», Zahl im Format de-CH). Der Zähler zeigt `+N`, ab 100 `99+`.
- `getInitials(value, fallback = '?')`: Initialen aus Name oder E-Mail-Adresse.

**A11y:** Bilder brauchen ein `alt`; bei dekorativen Avataren neben dem Namen `alt=""` und kein `label`. Der Zähler hat einen Screenreader-Text statt eines `aria-label` auf einem generischen `<span>`. Die Überlappungsringe nutzen `ring-background` und sind rein dekorativ.

**Do:** Bei vielen Personen `total` übergeben statt hunderte Avatare zu rendern.
**Don't:** Initialen ohne `label` anzeigen, wenn der Name sonst nirgends steht.

**Abweichungen:** Die Kandidatenkette von SpeakerAvatar (verkleinerte Variante → Original → Fallback) wird durch das Radix-Laden mit einer Quelle ersetzt; Bildtransformation ist App-Sache. Die Supabase-/Google-/Spotify-Logik aus `avatar.ts` entfällt; übrig bleibt die generische Initialen-Ableitung `getInitials`. Der Gradient-Fallback wird durch `bg-muted` ersetzt. `AvatarGroup` ist neu: RadioX stapelte Zuhörende inline im LivePlayer; das Detail-Sheet (`LiveListenerSheet`) bleibt App-Logik und lässt sich mit `Sheet` aufbauen.

## Accordion, AccordionItem, AccordionTrigger, AccordionContent

`packages/core/src/ui/accordion.tsx` (`'use client'`, Radix Accordion). Atlas-Basisprimitive, kein RadioX-Vorbild.

**Zweck:** Gestapelte Abschnitte, die sich einzeln auf- und zuklappen lassen: FAQ, Einstellungsgruppen, lange Detaillisten.

**Props:**
- `Accordion`: Radix-Props (`type` `single | multiple`, `collapsible`, `value`, `defaultValue`, `onValueChange`, `disabled`, `orientation`).
- `AccordionItem`: `value` (Pflicht), `disabled`. Trennlinie unten, beim letzten Eintrag ohne.
- `AccordionTrigger`: `headingLevel` `2 | 3 | 4 | 5 | 6` (Standard 3) für die umgebende Überschrift; Chevron am Ende der Zeile.
- `AccordionContent`: `className` gilt für den inneren Inhalt (Abstände), nicht für den animierten Rahmen.

**Verhalten:** Der Inhalt animiert seine Höhe über `--radix-collapsible-content-height` (200 ms, nur `motion-safe:`); der Chevron dreht sich nur `motion-safe`. Die Keyframes liefert die interne Ressource `CoreKeyframes` (`motion-keyframes.tsx`): ein React-19-`<style>` mit `href` und `precedence`, das genau einmal im `<head>` landet, auch beim Server-Render. `styles.css` bleibt dafür unverändert. Radix wartet beim Schliessen auf das Ende der Animation; beim ersten Render offene Einträge animieren nicht.

**A11y:** Jeder Trigger ist ein `<button>` in einer Überschrift, mit `aria-expanded` und `aria-controls`; der Inhalt ist eine Region mit `aria-labelledby`. Pfeiltasten, Pos1 und Ende durch Radix. Trigger mindestens 44 px hoch, Fokus als Outline (`focusRing`). Der Chevron ist `aria-hidden`.

**Do:** Die Überschriftenebene an die Gliederung anpassen (`headingLevel`). Kurze, eindeutige Trigger-Texte.
**Don't:** Pflichtinformationen zuklappen. Keine interaktiven Elemente in den Trigger legen.

## Collapsible, CollapsibleTrigger, CollapsibleContent

`packages/core/src/ui/collapsible.tsx` (`'use client'`, Radix Collapsible). Atlas-Basisprimitive.

**Zweck:** Ein einzelner auf- und zuklappbarer Bereich ohne eigene Gestaltung, z. B. «Weitere Optionen» unter einem Formular oder Details in einer Karte.

**Props:** `Collapsible`: Radix-Props (`open`, `defaultOpen`, `onOpenChange`, `disabled`). `CollapsibleTrigger`: meist `asChild` mit einem `Button`. `CollapsibleContent`: animiert wie das Accordion (`overflow-hidden`, Höhe über die Radix-Variable, nur `motion-safe`).

**A11y:** Radix setzt `aria-expanded` und `aria-controls` am Trigger. Der Trigger braucht einen sichtbaren, gleichbleibenden Namen; den Zustand nicht zusätzlich in den Namen schreiben, `aria-expanded` trägt ihn bereits.

**Do:** Für einen einzelnen Bereich; für mehrere gleichartige Abschnitte das Accordion verwenden.
**Don't:** Navigation in einem Collapsible verstecken, die auf grossen Viewports dauerhaft sichtbar sein sollte.

## Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption

`packages/core/src/ui/table.tsx`. Serverfähig, ohne Client-Code. Atlas-Basisprimitive.

**Zweck:** Datentabellen mit semantischem HTML. Sortierung, Filter und Paginierung bleiben App-Logik.

**Props:**
- `Table`: alle `<table>`-Props plus `scrollLabel` und `containerClassName`. Rendert immer einen `div[data-slot=table-container]` mit `overflow-x-auto` um die Tabelle.
- `TableRow`: `selected` setzt `data-state="selected"` (Hervorhebung `bg-muted`).
- `TableHead`: `scope` (Standard `col`; für Zeilenköpfe `scope="row"`), `numeric`.
- `TableCell`: `numeric`.
- `TableCaption`: Beschriftung unter der Tabelle (`caption-bottom`).

**Zahlen:** `numeric` an `TableHead` und `TableCell` derselben Spalte setzt `text-end` und `tabular-nums` (gleich breite Ziffern) und markiert die Zelle mit `data-numeric`. Werte vorher mit `Intl.NumberFormat('de-CH')` formatieren.

**A11y:** Mit `scrollLabel` wird der Container eine benannte Region (`role="region"`, `aria-label`) mit `tabIndex=0` und nach innen versetzter Fokus-Outline (`focusRingInset`), damit breite Tabellen per Tastatur horizontal scrollbar sind (WCAG 2.1.1). Ohne `scrollLabel` bleibt der Container neutral; das passt nur, wenn die Tabelle sicher nicht überläuft. Spaltenköpfe tragen `scope="col"`. Eine `TableCaption` oder eine Überschrift mit `aria-labelledby` benennt die Tabelle. `selected` ist nur Darstellung: Die Auswahl gehört in ein Bedienelement der Zeile (Checkbox mit Namen).

**Do:** Für Tabellen, die auf schmalen Viewports überlaufen können, immer `scrollLabel` setzen («Projekte, horizontal scrollbar»). Text am Anfang, Zahlen am Ende der Zelle ausrichten.
**Don't:** Tabellen für Layout verwenden. Keine klickbaren Zeilen ohne Link oder Button in der Zeile.

## Kbd, KbdGroup

`packages/core/src/ui/kbd.tsx`. Serverfähig. Atlas-Basisprimitive.

**Zweck:** Tastenbezeichnungen in Hilfetexten, Tooltips und Menüs, z. B. `<Kbd>Esc</Kbd>` oder `<KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>`.

**Darstellung:** `bg-muted`, `text-muted-foreground`, feiner Rahmen in `border` (bleibt in Forced Colors als Kontur sichtbar), `text-xs`, Mindestbreite 20 px. Icons darin werden auf 12 px gesetzt.

**A11y:** Natives `<kbd>`; `KbdGroup` ist ebenfalls ein `<kbd>`, denn verschachtelte `<kbd>` stehen in HTML für eine Tastenkombination. Bei Symboltasten den Namen im umgebenden Text nennen («Befehlstaste ⌘ und K»), weil Screenreader `⌘` nicht überall vorlesen.

**Do:** Plattformgerechte Tasten zeigen (`Strg` unter Windows, `⌘` unter macOS). **Don't:** `Kbd` als Button oder als Badge verwenden.

## Offen

- Komponenten sind noch nicht in `packages/core/src/index.ts` exportiert (Integration folgt). Accordion, Collapsible, Table und Kbd haben noch keine Demo.
- Visuelle Prüfung im Browser steht aus (Safe Area auf iOS, Scroll-Snap, FAB-Lage im Stack).
