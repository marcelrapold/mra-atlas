/** Eine Fehlermeldung, wie sie Validierungsbibliotheken liefern (react-hook-form, Zod, Valibot). */
export type FieldErrorItem = { message?: string } | undefined

/**
 * Bereinigt eine Fehlerliste für `FieldError`: leere Einträge und leere
 * Meldungen fallen weg, gleiche Meldungen erscheinen nur einmal, die
 * Reihenfolge bleibt erhalten. Reine Funktion ohne React, damit sie ohne
 * Renderer testbar ist.
 *
 * @param errors  Fehlerobjekte mit optionaler `message`.
 * @returns Die eindeutigen, nicht leeren Meldungen.
 */
export function uniqueFieldErrors(errors?: ReadonlyArray<FieldErrorItem>): string[] {
  const seen = new Set<string>()
  for (const error of errors ?? []) {
    const message = error?.message?.trim()
    if (message) seen.add(message)
  }
  return [...seen]
}
