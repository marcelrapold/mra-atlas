/**
 * Keyframes der Core-Primitives (Accordion, Collapsible, Progress).
 *
 * Die Keyframes stehen hier statt in `styles.css`, damit die Primitives auch
 * ohne zusätzliche Stylesheet-Version funktionieren. React 19 behandelt ein
 * `<style>` mit `href` und `precedence` als Ressource: Es landet einmal pro
 * `href` im `<head>` (auch beim Server-Render), egal wie viele Komponenten es
 * rendern, und bleibt nach dem Unmount stehen. Die Bewegung bleibt in CSS, so
 * wartet Radix `Presence` beim Schliessen auf `animationend`.
 *
 * Alle Animationen laufen nur unter `motion-safe:`; bei reduzierter Bewegung
 * öffnet und schliesst der Inhalt sofort.
 */

const KEYFRAMES =
  '@keyframes atlas-disclosure-open{from{height:0}to{height:var(--radix-collapsible-content-height)}}' +
  '@keyframes atlas-disclosure-close{from{height:var(--radix-collapsible-content-height)}to{height:0}}' +
  '@keyframes atlas-progress-indeterminate{from{translate:-100% 0}to{translate:300% 0}}'

/** Hängt die Keyframes einmalig in den `<head>`; rendert an Ort und Stelle nichts. */
function CoreKeyframes() {
  return (
    <style href="atlas-core-keyframes" precedence="atlas-core">
      {KEYFRAMES}
    </style>
  )
}

/** Höhenanimation über `--radix-collapsible-content-height` (gilt auch für Accordion). */
const disclosureMotion =
  'motion-safe:data-[state=open]:animate-[atlas-disclosure-open_200ms_ease-out] motion-safe:data-[state=closed]:animate-[atlas-disclosure-close_200ms_ease-out]'

/** Gleitender Balken für unbestimmten Fortschritt. */
const progressIndeterminateMotion = 'motion-safe:animate-[atlas-progress-indeterminate_1.4s_ease-in-out_infinite]'

export { CoreKeyframes, disclosureMotion, progressIndeterminateMotion }
