# Field und Textarea

Formular-Anatomie für Atlas: `Field` verbindet Beschriftung, Beschreibung, Fehler und Eingabe, ohne dass IDs von Hand verdrahtet werden. Dazu kommt `Textarea`, die mehrzeilige Schwester von `Input`. Alle Teile tragen `data-slot`, nutzen nur semantische Tokens (`input`, `ring`, `destructive`, `muted-foreground` …) und lassen sich per `className` ergänzen. Fertige Texte bringt keine Komponente mit; Beschriftungen und Meldungen kommen aus der Anwendung.

Dateien: `packages/core/src/ui/field.tsx`, `packages/core/src/ui/textarea.tsx`, `packages/core/src/ui/input.tsx` · Exporte: `Field`, `FieldSet`, `FieldLegend`, `FieldGroup`, `FieldContent`, `FieldLabel`, `FieldTitle`, `FieldDescription`, `FieldError`, `FieldSeparator`, `fieldVariants`, `useFieldControl`, `Textarea`, Typen `FieldProps`, `FieldErrorProps`, `FieldErrorItem`, `TextareaProps`, `InputProps`, `LabelProps`.

Gemeinsame Regeln:

- Fokus immer als Outline über `focusRing` (`focus-visible:outline-2 outline-offset-2 outline-ring`). Kein `outline-none` auf Eingaben: In Tailwind v4 setzt es `--tw-outline-style: none`, und `focus-visible:outline-2` übernimmt diesen Wert. Die Outline bliebe unsichtbar.
- Fehlerzustand sichtbar über `aria-invalid:border-destructive`; mit Tastaturfokus wird die Outline `destructive`.
- Explizite Props gewinnen immer: eigenes `id`, `htmlFor`, `aria-describedby` oder `aria-invalid` ersetzt die automatische Verdrahtung.

## Field

**Zweck:** Ein Formularfeld mit Beschriftung, Eingabe, optionaler Beschreibung und Fehlermeldung. Erzeugt per `React.useId()` die ID des Controls und reicht sie über einen Kontext an `FieldLabel` und das Control weiter.

**Props:** `orientation` vertical (Standard) | horizontal | responsive · `invalid` boolean · alle `div`-Props. `responsive` stapelt untereinander und stellt ab der Containerbreite `@md` der umgebenden `FieldGroup` nebeneinander.

**A11y:** Rendert `role="group"` mit `data-slot="field"`, `data-orientation` und `data-invalid`. Ohne `invalid` gilt das Feld als ungültig, sobald ein `FieldError` Inhalt hat. Das Control erhält `id`, `aria-describedby` (IDs der gerenderten `FieldDescription` und `FieldError`, in dieser Reihenfolge) und `aria-invalid`. Verweise auf nicht gerenderte Elemente entstehen nicht. Im Fehlerzustand färbt sich nur die Beschriftung, nicht die Eingabe.

**Do:** Pro Field genau ein Control. `Input` und `Textarea` verdrahten sich selbst; eigene Controls nutzen `useFieldControl`. Für Formulare mit eigener Validierung `noValidate` setzen und Fehler über `FieldError` zeigen. **Don't:** Keine eigene `id` am Control setzen, wenn es nicht nötig ist: Mit eigener ID stimmt `htmlFor` des `FieldLabel` erst nach der Hydrierung. In diesem Fall `htmlFor` am `FieldLabel` ebenfalls setzen. Checkbox, Switch und RadioGroup verdrahten sich (noch) nicht selbst; dort `id` und `htmlFor` explizit setzen.

```tsx
<Field>
  <FieldLabel>Projektname</FieldLabel>
  <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
  <FieldDescription>Mindestens drei Zeichen.</FieldDescription>
  <FieldError errors={[{ message: errors.title }]} />
</Field>
```

## useFieldControl

**Zweck:** Hook für eigene Controls innerhalb eines `Field`.

**Props:** `useFieldControl(props)` nimmt die Props des Controls und gibt sie ergänzt um `id`, `aria-describedby` und `aria-invalid` zurück. Ausserhalb eines Field kommen die Props unverändert zurück.

**A11y:** Eine explizite `id` meldet der Hook beim Field an, damit `FieldLabel` darauf zeigt.

**Do:** Das Ergebnis vollständig auf das native Element spreaden. **Don't:** Den Hook nicht bedingt aufrufen.

## FieldLabel

**Zweck:** Beschriftung des Controls. Umhüllt `Label` (Radix) und setzt `htmlFor` auf die Control-ID des Field.

**Props:** alle `Label`-Props (`LabelProps`); `htmlFor` überschreibt die automatische ID. Enthält ein `FieldLabel` ein ganzes `Field` (Auswahlkarte), wird es zur umrandeten Fläche; ein angehakter Inhalt hebt sie mit `primary` hervor.

**A11y:** Echtes `<label>`, ein Klick fokussiert das Control. Im Fehlerzustand `text-destructive`, mit `data-disabled="true"` am Field halbe Deckkraft.

**Do:** Kurz und konkret beschriften. **Don't:** Platzhaltertext statt Beschriftung verwenden.

## FieldDescription

**Zweck:** Hilfetext zum Feld (Format, Grenzen, Beispiel).

**Props:** alle `p`-Props; eine eigene `id` wird übernommen.

**A11y:** Meldet seine ID beim Field an; das Control verweist über `aria-describedby` darauf. Text in `muted-foreground`.

**Do:** Regeln nennen, bevor ein Fehler entsteht («Mindestens drei Zeichen.»). **Don't:** Fehlermeldungen in die Beschreibung schreiben.

## FieldError

**Zweck:** Fehlermeldung zum Feld, direkt aus der Validierung.

**Props:** `errors?: Array<{ message?: string } | undefined>` · `children` (hat Vorrang vor `errors`) · alle `div`-Props. Leere und doppelte Meldungen fallen weg; bei mehreren Meldungen erscheint eine Liste.

**A11y:** Rendert nur mit Inhalt, dann mit `role="alert"` in `text-destructive`. Leere Live-Regionen stehen so nie im DOM; erscheint die Meldung, wird sie angesagt. Ihre ID kommt nach der Beschreibung in `aria-describedby`, und das Field wird ungültig.

**Do:** Sagen, was zu tun ist («Der Projektname braucht mindestens drei Zeichen.»). Fehler zurücksetzen, sobald die Eingabe gültig ist. **Don't:** Keine dauerhaft gerenderte leere `role="alert"`-Fläche. Nicht mehrere Fehler gleichzeitig mit `role="alert"` für dasselbe Feld.

## FieldSet, FieldLegend, FieldGroup

**Zweck:** `FieldSet` gruppiert zusammengehörige Felder semantisch (`<fieldset>`), `FieldLegend` beschriftet die Gruppe, `FieldGroup` stapelt Felder mit einheitlichem Abstand und ist Container (`@container/field-group`) für `orientation="responsive"`.

**Props:** `FieldLegend`: `variant` legend (Standard, `text-base`) | label (`text-sm`). Sonst alle Props des jeweiligen Elements.

**A11y:** Die Legende wird beim ersten Fokus in der Gruppe vorgelesen. Für Checkbox- und Radio-Gruppen immer `FieldSet` mit `FieldLegend` verwenden.

**Do:** Eine Legende pro Gruppe. **Don't:** `FieldSet` nur für Abstand verwenden; dafür ist `FieldGroup` da.

## FieldContent, FieldTitle, FieldSeparator

**Zweck:** `FieldContent` fasst Beschriftung und Beschreibung neben einem Control zusammen (horizontale Felder, Checkbox mit Erklärung). `FieldTitle` ist eine Überschrift ohne `<label>`-Semantik, etwa in einer Auswahlkarte. `FieldSeparator` trennt Abschnitte, optional mit Text in der Mitte («oder»).

**Props:** alle `div`-Props. `FieldSeparator` setzt `data-content`, wenn Kinder vorhanden sind.

**A11y:** Die Linie im `FieldSeparator` ist dekorativ; ein Text darin bleibt lesbar.

**Do:** `FieldContent` immer dann, wenn neben dem Control mehr als eine Zeile steht. **Don't:** `FieldTitle` statt `FieldLabel` verwenden, wenn ein Control beschriftet werden muss.

## Textarea

**Zweck:** Mehrzeilige Eingabe, z. B. für Beschreibungen, Code oder Listen mit einem Eintrag pro Zeile.

**Props:** alle `textarea`-Props (`TextareaProps`), `ref` direkt als Prop (React 19). Für Code: `className="font-mono"`.

**A11y:** `data-slot="textarea"`, dieselben Tokens wie `Input`, Fokus über `focusRing`, Fehlerzustand über `aria-invalid:border-destructive`. Wächst mit dem Inhalt (`field-sizing: content`, Chromium) zwischen drei Zeilen (`min-h-[calc(3lh+1rem)]`) und zwanzig Zeilen (`max-h-[calc(20lh+1rem)]`), danach scrollt sie. Browser ohne `field-sizing` zeigen die Mindesthöhe; die Höhe lässt sich vertikal ziehen (`resize-y`). In einem `Field` verdrahtet sie sich selbst.

**Do:** Mit `Field` und `FieldLabel` beschriften oder, ohne sichtbare Beschriftung, `aria-label` setzen. **Don't:** Keine feste `height` setzen; das hebt das Mitwachsen auf.

## Input (Anpassung)

**Zweck:** Bestehende einzeilige Eingabe, jetzt mit Outline-Fokus und Field-Verdrahtung.

**Props:** alle `input`-Props (`InputProps`).

**A11y:** `outline-none` entfernt (auf `/tables` war die Fokus-Outline des Suchfelds dadurch unsichtbar), Fokus über `focusRing`. Der wirkungslose `aria-invalid:ring-*` ist durch `aria-invalid:border-destructive` ersetzt. In einem `Field` verdrahtet es sich selbst.

**Do:** Mit `FieldLabel` oder `Label` beschriften. **Don't:** Den Fokus nicht per `className` mit `outline-none` abschalten.
