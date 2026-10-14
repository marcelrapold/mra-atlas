# Overlays

Ebenen über dem Seiteninhalt: modale Dialoge, Seitenpaneele, Popover, Tooltips, Menüs, Befehlspalette, Toasts und die Lightbox. Dazu Tabs als umschaltbare Ansichten. Die Radix-basierten Teile rendern im Portal der aktiven Brand (`useBrandPortal`), damit Tokens, Schrift und Modus auch ausserhalb des Seitenbaums gelten.

Gemeinsame Regeln:

- Fokus wandert beim Öffnen in die Ebene und kehrt beim Schliessen zum Auslöser zurück.
- Escape schliesst jede Ebene; modale Ebenen halten den Fokus (Fokusfalle).
- Die Schliessen-Knöpfe von `Dialog`, `Sheet` und `CommandDialog` sind beschriftet (`closeLabel`, Standard «Schliessen») und erreichen bei grobem Zeiger 44 × 44 px.
- Ein- und Ausblenden folgen `data-state`; bei reduzierter Bewegung verkürzt der Brand-Scope jede Animation auf praktisch null.

## Dialog

**Zweck:** Modaler Dialog für eine abgeschlossene Aufgabe: kurze Formulare, Details, Entscheidungen (Radix Dialog). Für Bestätigen, Eingeben und Informieren als Promise `ConfirmDialog` verwenden.

**Props:** `Dialog` (Radix-Root: `open`, `defaultOpen`, `onOpenChange`, `modal`) · `DialogTrigger` · `DialogContent` mit `showCloseButton` (Standard `true`) und `closeLabel` (Standard «Schliessen», Name des Schliessen-Knopfs für Screenreader) · `DialogHeader` · `DialogTitle` · `DialogDescription` · `DialogFooter` mit `showCloseButton` (Standard `false`) und `closeLabel` (Standard «Schliessen», sichtbarer Text des Knopfs) · `DialogClose` · `DialogOverlay` · `DialogPortal`.

**A11y:** `role="dialog"` mit `aria-modal`, Titel und Beschreibung über `aria-labelledby`/`aria-describedby` durch Radix. `DialogTitle` ist Pflicht; ohne sichtbaren Titel in `sr-only` legen. Ohne Beschreibung `aria-describedby={undefined}` am `DialogContent` setzen. Inhalt scrollt innerhalb von `100dvh − 2rem`, der Schliessen-Knopf bleibt erreichbar.

**Do:** Eine Hauptaktion im `DialogFooter`, rechts aussen; Abbrechen als `outline`. **Don't:** Dialoge stapeln oder lange Abläufe mit mehreren Schritten in einen Dialog legen.

## Sheet

**Zweck:** Seitenpaneel vom Bildschirmrand für Navigation, Filter oder Details, ohne den Kontext zu verlassen (Radix Dialog).

**Props:** `Sheet` (Radix-Root) · `SheetTrigger` · `SheetContent` mit `side` top | right (Standard) | bottom | left, `showCloseButton` (Standard `true`), `closeLabel` (Standard «Schliessen»), `swipeToClose` (Standard `false`, nur bei `side="bottom"`) und `showGrabber` (Standard `true`) · `SheetHeader` · `SheetTitle` · `SheetDescription` · `SheetFooter` · `SheetClose`.

**A11y:** Verhalten wie `Dialog`: modal, Fokusfalle, Escape, `SheetTitle` Pflicht. Wischen zum Schliessen ist eine Ergänzung, nie der einzige Weg; Details im Abschnitt «Swipe-to-dismiss» der Dialog-Spezifikation. `data-side` am Inhalt erlaubt seitenabhängige Overrides.

**Do:** `side="bottom"` mit `swipeToClose` für kurze Aktionsblätter auf Mobilgeräten. **Don't:** Ein Sheet für Inhalte verwenden, die eine eigene URL brauchen.

## Popover

**Zweck:** Nicht-modale Ebene an einem Auslöser für kurze Zusatzinhalte oder kleine Eingaben (Radix Popover).

**Props:** `Popover` (Radix-Root: `open`, `onOpenChange`, `modal`) · `PopoverTrigger` · `PopoverContent` mit `align` (Standard `center`), `sideOffset` (Standard 4) und Radix-Positionierung (`side`, `collisionPadding`) · `PopoverAnchor` · `PopoverHeader` · `PopoverTitle` (rendert `<h2>`) · `PopoverDescription`.

**A11y:** Der Auslöser erhält `aria-expanded` und `aria-controls`. Beim Öffnen wandert der Fokus in den Inhalt, Escape und Klick ausserhalb schliessen. Nicht modal: der Rest der Seite bleibt bedienbar. `PopoverTitle` ist ein `<h2>`; bei abweichender Gliederung eine eigene Überschrift verwenden.

**Do:** Für Datumsauswahl, Filter oder kurze Erklärungen mit Link. **Don't:** Menüs als Popover bauen; dafür `DropdownMenu` mit Menü-Semantik.

## Tooltip

**Zweck:** Kurzer Hinweis zu einem Bedienelement bei Hover und Tastaturfokus (Radix Tooltip).

**Props:** `TooltipProvider` mit `delayDuration` (Standard 0) · `Tooltip` (Radix-Root: `open`, `defaultOpen`, `onOpenChange`) · `TooltipTrigger` (meist mit `asChild`) · `TooltipContent` mit `sideOffset` (Standard 0), `side` und Pfeil.

**A11y:** Der Inhalt wird per `aria-describedby` an den Auslöser gehängt und erscheint auch bei Tastaturfokus. Auf Touch-Geräten erscheint er nicht zuverlässig: der Auslöser braucht deshalb einen eigenen Namen (`aria-label`). `TooltipProvider` einmal um die Anwendung legen.

**Do:** Icon-Buttons mit einem Tooltip ergänzen, der den Namen wiederholt. **Don't:** Links, Buttons oder unverzichtbare Informationen in einen Tooltip legen.

## DropdownMenu

**Zweck:** Aktionsmenü an einem Auslöser, mit Gruppen, Auswahl-Einträgen und Untermenüs (Radix DropdownMenu).

**Props:** `DropdownMenu` (Radix-Root) · `DropdownMenuTrigger` · `DropdownMenuContent` mit `sideOffset` (Standard 4) · `DropdownMenuItem` mit `variant` default | destructive und `inset` · `DropdownMenuCheckboxItem` (`checked`, `onCheckedChange`) · `DropdownMenuRadioGroup` und `DropdownMenuRadioItem` · `DropdownMenuLabel` (`inset`) · `DropdownMenuSeparator` · `DropdownMenuShortcut` · `DropdownMenuGroup` · `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent` · `DropdownMenuPortal`.

**A11y:** `role="menu"` mit Pfeiltasten, Typeahead, Pos1/Ende und Fokusrückgabe durch Radix. Auswahl-Einträge tragen `menuitemcheckbox` bzw. `menuitemradio`. `DropdownMenuShortcut` ist nur Anzeige und registriert kein Tastenkürzel.

**Do:** Zerstörende Einträge mit `variant="destructive"` ans Ende, durch einen Separator getrennt. **Don't:** Navigation zwischen Seiten in ein Menü verstecken, wenn sie dauerhaft sichtbar sein kann.

## Command

**Zweck:** Durchsuchbare Befehlsliste und Befehlspalette (cmdk), auch als Dialog.

**Props:** `Command` (cmdk-Root: `value`, `onValueChange`, `filter`, `shouldFilter`, `loop`) · `CommandDialog` mit `title` und `description` (nur für Screenreader sichtbar; immer deutsch übergeben), `showCloseButton` (Standard `true`), `closeLabel` (Standard «Schliessen»), `contentProps` und den Props von `Dialog` · `CommandInput` · `CommandList` · `CommandEmpty` · `CommandGroup` (`heading`) · `CommandItem` (`value`, `keywords`, `onSelect`, `disabled`) · `CommandSeparator` · `CommandShortcut`.

**A11y:** Combobox mit Listbox durch cmdk: Pfeiltasten bewegen die Auswahl, Enter führt aus, der Fokus bleibt im Suchfeld. `CommandEmpty` meldet leere Ergebnisse. `CommandDialog` erbt Fokusfalle, Escape und Fokusrückgabe von `Dialog`.

**Do:** Globale Suche per `⌘K`/`Ctrl+K` öffnen und das Kürzel sichtbar anzeigen. **Don't:** Die Palette als einzigen Weg zu einer Funktion anbieten.

## Tabs

**Zweck:** Umschaltbare Ansichten desselben Kontexts auf einer Fläche (Radix Tabs).

**Props:** `Tabs` (Radix-Root: `value`, `defaultValue`, `onValueChange`, `orientation` horizontal (Standard) | vertical, `activationMode`) · `TabsList` mit `variant` default | line · `TabsTrigger` (`value`, `disabled`) · `TabsContent` (`value`, `forceMount`).

**A11y:** `tablist`, `tab` und `tabpanel` mit Roving Focus durch Radix; Pfeiltasten wechseln den Tab, Tab springt ins Panel. Die Liste benennen (`aria-label` am `TabsList`). Das Panel zeigt beim Tastaturfokus eine Outline.

**Do:** Kurze, gleichrangige Bezeichnungen; `line` für Unternavigation in Seiten. **Don't:** Tabs für aufeinanderfolgende Schritte verwenden oder Inhalte verstecken, die verglichen werden müssen.

## Toaster

**Zweck:** Ausgabestelle für kurze, flüchtige Rückmeldungen (sonner), gefärbt mit den Tokens der aktiven Brand.

**Props:** `position` · `duration` · `closeButton` · `visibleToasts` · `expand` · `toastOptions` · alle weiteren sonner-`ToasterProps`.

Modus und Brand-Variablen kommen aus `useBrand()`; der `Toaster` braucht deshalb einen umgebenden `BrandProvider`. Meldungen über `toast()`, `toast.success()`, `toast.error()` und `toast.loading()` aus `sonner`.

**A11y:** sonner meldet Toasts über eine Live-Region. Status-Icons sind ergänzend, der Text trägt die Aussage. Fehler mit `duration: Infinity` stehen lassen, bis sie gelesen sind. Muster für Fortschritt im Abschnitt «Rezept: Fortschritts-Toast» der Feedback-Spezifikation.

**Do:** Einen `Toaster` pro Anwendung, nahe der Wurzel. **Don't:** Toasts für Entscheidungen oder für Inhalte, die die Person später wieder braucht; dafür `ConfirmDialog` bzw. `Alert`.

## Lightbox, LightboxBetrachter

**Zweck:** Nicht-interaktive Artefakte (Diagramme, Grafiken, Bilder) inline zeigen und per Klick im Vollbild öffnen. `LightboxBetrachter` ist der Betrachter allein, etwa für Galerien mit einem gemeinsamen Vollbild.

**Props:**

- `Lightbox`: `label` (Pflicht), `surface` glass (Standard) | readable, `aspectRatio` (Breite/Höhe), `fullscreen` (abweichender Vollbild-Inhalt), `className`, `children`.
- `LightboxBetrachter`: `label`, `offen`, `aufSchliessen`, `navigation` (`index`, `anzahl`, `aufZurueck`, `aufVor`, optional `spielt` und `aufSpielen`), `surface`, `aspectRatio`, `children`.
- `LIGHTBOX_FLAECHEN`: Klassen der beiden Panel-Flächen `glass` und `readable`.

**A11y:** Die ganze Fläche ist ein Button mit `aria-label` «{label} im Vollbild öffnen». Das Vollbild ist `role="dialog"` mit `aria-modal` und `aria-label` «{label} — Vollbild», hält den Fokus, sperrt das Scrollen und gibt den Fokus an den Auslöser zurück. Escape und Klick auf den Hintergrund schliessen, Pfeiltasten blättern; die Position wird höflich angesagt. `readable` hält Text auf dem Panel bei mindestens 4,5:1.

**Do:** `surface="readable"`, sobald im Vollbild Text steht. **Don't:** Formulare, Links oder andere bedienbare Inhalte in eine Lightbox legen; dafür `Dialog`.
