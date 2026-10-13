/**
 * Fokus-Konstanten für Tastaturbedienung. Outline-basiert (nicht
 * box-shadow), damit der Fokus auch im Modus «erhöhter Kontrast» /
 * Forced Colors sichtbar bleibt und nicht von `overflow: hidden` oder
 * Schatten-Tokens der Brand überschrieben wird.
 *
 * `focus-visible:` statt `focus:`: Der Rahmen erscheint nur bei
 * Tastaturfokus, nicht beim Klick.
 */

/** Standard: 2 px Outline in `ring`, 2 px Abstand nach aussen. */
export const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

/**
 * Nach innen versetzt: für Elemente, deren Umgebung `overflow: hidden`
 * hat (Listenzeilen, Kacheln in Scroll-Containern), wo ein äusserer
 * Rahmen abgeschnitten würde.
 */
export const focusRingInset = 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring'

/**
 * Auf Bildern und Medien: Outline in `background` plus innerer Kontrast-
 * rand in `foreground`. Der doppelte Rand bleibt auf hellen wie dunklen
 * Bildern sichtbar. Die Outline ist der Fokusindikator; der Schatten ist
 * nur Verstärkung.
 */
export const focusRingOnMedia =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background focus-visible:ring-2 focus-visible:ring-foreground'
