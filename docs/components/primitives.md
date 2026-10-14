# Primitives

Grundbausteine für Flächen, Formulare und Ladezustände. Sie stammen aus dem shadcn-Muster, sind auf semantische Tokens (`card`, `border`, `input`, `ring`, `primary`, `muted-foreground` …) und `data-slot`-Anatomie umgestellt und tragen kein Brand-Wissen. Das Aussehen einer Marke kommt aus dem Brand-Paket.

Gemeinsame Regeln:

- Jedes Teil setzt ein `data-slot` (z. B. `card-header`). Overrides per Selektor `[data-slot=…]` statt über interne Klassen.
- `className` wird mit `cn()` zusammengeführt; spätere Utilities gewinnen.
- Fokus als Outline (`focus-visible:outline-2 outline-offset-2 outline-ring`), Fehlerzustand über `aria-invalid`.
- Formularfelder immer mit einem sichtbaren `Label` verbinden.

## Card

**Zweck:** Abgegrenzte Fläche für zusammengehörige Inhalte mit optionalem Kopf, Aktion und Fuss.

**Props:** `Card` · `CardHeader` · `CardTitle` · `CardDescription` · `CardAction` (rechts im Kopf, über beide Kopfzeilen) · `CardContent` · `CardFooter`.

Alle Teile nehmen die Props des jeweiligen `div` entgegen. Ein Kopf mit `className="border-b"` und ein Fuss mit `border-t` erhalten automatisch den passenden Innenabstand.

**A11y:** `CardTitle` rendert ein `div`, keine Überschrift. Für die Gliederung eine Überschrift der passenden Ebene hineinlegen (`<CardTitle><h3>…</h3></CardTitle>`). Eine Karte ist keine Klickfläche; ein Ziel als Link im Titel oder als Button in `CardAction` anbieten.

**Do:** `CardAction` für eine einzelne Aktion zum Inhalt (Menü, Bearbeiten). **Don't:** Karten verschachteln; für Innenflächen `Inset` verwenden.

## Separator

**Zweck:** Dünne Trennlinie zwischen Inhaltsgruppen (Radix Separator).

**Props:** `orientation` horizontal (Standard) | vertical · `decorative` boolean (Standard `true`) · Radix-Separator-Props.

**A11y:** Standardmässig dekorativ (`role="none"`), Screenreader überspringen die Linie. Nur mit `decorative={false}` entsteht `role="separator"` mit `aria-orientation`, etwa zwischen Werkzeuggruppen einer Toolbar.

**Do:** Gruppen zuerst über Abstand trennen, die Linie nur ergänzend einsetzen. **Don't:** Separator als Ersatz für eine Überschrift oder einen Abschnitt verwenden.

## Label

**Zweck:** Beschriftung eines Formularfelds (Radix Label).

**Props:** `htmlFor` (ID des Felds) · Radix-Label-Props.

**A11y:** Klick auf das Label fokussiert bzw. schaltet das verbundene Feld; damit wächst auch die Trefferfläche kleiner Felder wie `Checkbox`. Ein deaktiviertes Geschwisterfeld (`peer`) oder eine Gruppe mit `data-disabled="true"` dämpft das Label mit.

**Do:** Label sichtbar über oder neben dem Feld platzieren, kurz und eindeutig. **Don't:** Platzhaltertext als einzige Beschriftung verwenden.

## Skeleton

**Zweck:** Platzhalter in der Form des erwarteten Inhalts, solange Daten laden.

**Props:** `className` (Grösse und Form, z. B. `h-4 w-48`, `size-10 rounded-full`) · Props des `div`.

**A11y:** Rein visuell. Den ladenden Bereich mit `aria-busy="true"` markieren und den Zustand als Text melden (z. B. sr-only «Wird geladen»); die Skeletons selbst `aria-hidden` setzen. Nach dem Laden den Inhalt an derselben Stelle einsetzen, damit kein Layoutsprung entsteht.

**Do:** Die Struktur des Inhalts andeuten (Zeilenlängen, Avatar, Titel). **Don't:** Skeletons für Vorgänge zeigen, die länger als einige Sekunden dauern; dafür einen Fortschritt oder `Alert` verwenden.

## Input

**Zweck:** Einzeiliges Texteingabefeld auf Basis des nativen `<input>`.

**Props:** `type` (alle nativen Typen, inkl. `file`) · alle Props von `<input>` · `aria-invalid` für den Fehlerzustand.

**A11y:** Immer mit `Label htmlFor` verbinden. Fehler über `aria-invalid` und eine per `aria-describedby` verknüpfte Meldung ausweisen, nicht nur über die Rahmenfarbe. Schriftgrösse auf schmalen Viewports 16 px (`text-base`), damit iOS beim Fokus nicht zoomt; ab `md` 14 px. Passende `autoComplete`- und `inputMode`-Werte setzen.

**Do:** `type="email"`, `type="search"` usw. für die passende Bildschirmtastatur. **Don't:** Eingaben per `disabled` sperren, deren Wert die Person lesen muss; dafür `readOnly`.

## Checkbox

**Zweck:** Auswahl, die erst mit dem Absenden wirksam wird, einzeln oder in Gruppen (Radix Checkbox).

**Props:** `checked`, `defaultChecked`, `onCheckedChange`, `disabled`, `required`, `name`, `value` · Radix-Checkbox-Props · `aria-invalid` für den Fehlerzustand.

**A11y:** `role="checkbox"` und `aria-checked` durch Radix; Leertaste schaltet. Die sichtbare Box misst 16 px: mit `Label htmlFor` verbinden, damit die ganze Beschriftung als Trefferfläche dient. Mehrere Checkboxen in einem `fieldset` mit `legend` gruppieren.

**Do:** Für Einstellungen mit sofortiger Wirkung `Switch` wählen, für Formulare die Checkbox. **Don't:** `checked="indeterminate"` verwenden; der Indikator zeigt in diesem Zustand ebenfalls ein Häkchen.

## Select

**Zweck:** Auswahl genau eines Werts aus einer längeren Liste (Radix Select).

**Props:** `Select` (Radix-Root: `value`, `defaultValue`, `onValueChange`, `name`, `required`, `disabled`) · `SelectTrigger` mit `size` default | sm · `SelectValue` (`placeholder`) · `SelectContent` mit `position` item-aligned (Standard) | popper und `align` (Standard `center`) · `SelectItem` (`value`, `disabled`) · `SelectGroup` · `SelectLabel` · `SelectSeparator` · `SelectScrollUpButton` · `SelectScrollDownButton`.

**A11y:** Tastaturbedienung, Typeahead und Fokusrückgabe durch Radix. Den Trigger benennen: `id` am `SelectTrigger` plus `Label htmlFor`, sonst `aria-label`. Die Liste rendert im Portal der aktiven Brand (`useBrandPortal`) und behält so Tokens und Modus. Gruppen über `SelectLabel` benennen.

**Do:** Für zwei bis etwa sieben Optionen `RadioGroup` bevorzugen, damit alle Optionen sichtbar sind. **Don't:** Aktionen oder Navigation in ein Select legen; dafür `DropdownMenu`.

## EmptyState

**Zweck:** Leerzustand einer Liste oder Ansicht mit Erklärung und dem nächsten sinnvollen Schritt.

**Props:** `title` (Pflicht) · `description` · `icon` (Lucide-Komponente, z. B. `Inbox`) · `actions` (Slot, meist ein `Button`) · `className`.

**A11y:** Der Titel ist ein `<h3>`; die Ebene muss zur Gliederung der Seite passen. Das Icon ist dekorativ (`aria-hidden`). Erscheint der Leerzustand nach einer Suche oder einem Filter, das Ergebnis zusätzlich über eine Live-Region melden.

**Do:** Sagen, warum nichts da ist, und eine Handlung anbieten («Filter zurücksetzen»). **Don't:** Fehler als Leerzustand tarnen; ein Fehler braucht eine Fehlermeldung mit Wiederholen (`ErrorBoundary`, `Alert`).
