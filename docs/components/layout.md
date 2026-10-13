# Layout-Komponenten

Seitenstruktur und Navigation, übernommen aus RadioX und für Atlas neutralisiert: nur semantische Tokens, keine Brand-Farben, keine App-Logik (Router, Stores, Player). Demo: `apps/docs/app/_components/demos/layout-demo.tsx`.

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

## Offen

- Komponenten sind noch nicht in `packages/core/src/index.ts` exportiert (Integration folgt).
- Visuelle Prüfung im Browser steht aus (Safe Area auf iOS, Scroll-Snap, FAB-Lage im Stack).
