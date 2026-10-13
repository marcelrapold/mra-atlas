'use client'

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play, X } from 'lucide-react'

/**
 * Lightbox für nicht-interaktive Artefakte (Diagramme, Grafiken, Bilder):
 * rendert `children` inline und öffnet sie per Klick gross auf einem
 * Glassmorphism-Backdrop. Escape/Backdrop-Klick/Close-Button schliessen, der
 * Fokus bleibt im Dialog und kehrt zum Trigger zurück.
 *
 * Zwei Bausteine, seit eine Galerie dazukam:
 *
 *  - `LightboxBetrachter` — der **Betrachter**: Backdrop, Panel, Fokusfalle,
 *    Scroll-Sperre, Blättern. Kennt keinen Auslöser.
 *  - `Lightbox` — **Auslöser plus Betrachter**: der Normalfall für ein
 *    einzelnes Artefakt, unveränderte Schnittstelle.
 *
 * Recipe mit Anatomie, Glas-Spec und A11y-Pflichtteil: patterns/lightbox.md
 * (upstream showcase). Für interaktive Modals (Formulare, Bestätigungen) stattdessen
 * den Radix-`Dialog` verwenden.
 */

/** Tastatur-Fokus im Dialog halten, beim Schliessen zum Trigger zurück (WCAG 2.1.2, 2.4.3). */
function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    if (!active) return
    const node = containerRef.current
    if (!node) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    const getFocusable = (): HTMLElement[] =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement)

    getFocusable()[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const activeEl = document.activeElement
      if (e.shiftKey && (activeEl === first || !node.contains(activeEl))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (activeEl === last || !node.contains(activeEl))) {
        e.preventDefault()
        first.focus()
      }
    }

    node.addEventListener('keydown', onKeyDown)
    return () => {
      node.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [active, containerRef])
}

/**
 * Die zwei Panel-Flächen. Sie unterscheiden sich in genau einer Grösse — der
 * Deckkraft — und die ist nicht Geschmack, sondern gerechnet (siehe unten).
 */
export const LIGHTBOX_FLAECHEN = {
  /**
   * Für **opake Artefakte**: Diagramme, Organigramme, ein einzelnes Bild. Sie
   * bringen ihre Lesbarkeit selbst mit (eigene Füllung, z.B. das Print-Weiss
   * der Org-Diagramme), deshalb darf das Panel Glas bleiben und den Backdrop
   * durchdrücken lassen.
   */
  glass:
    'border-white/25 bg-gradient-to-br from-white/55 via-white/45 to-accent/50 ring-white/20 ' +
    'dark:border-white/10 dark:from-white/12 dark:via-white/8 dark:to-accent/55 dark:ring-white/10',
  /**
   * Für **Inhalt mit Text**: Steckbriefe, Metadaten, beschriftete Panels. Hier
   * trägt nicht mehr das Artefakt die Lesbarkeit, sondern das Panel — und Glas
   * kann das nicht leisten.
   *
   * Warum 94% und nicht «etwas mehr»: Ein Panel mit Deckkraft α über einem
   * beliebigen Hintergrund hat im schlimmsten Fall die Fläche α·Panelfarbe.
   * Gegen `--muted-foreground` gerechnet (die kleinen Wertzeilen sind genau
   * das) braucht es hell mindestens 0.85 und dunkel mindestens 0.90 für die
   * 4.5:1 der WCAG. 0.94 hält beide Themes bei ~5.8:1 und die getönten Ecken
   * noch bei ~5.1:1 — mit Reserve, statt auf der Schwelle zu balancieren.
   * Nachgerechnet in `tests/lightbox-kontrast.test.ts`, nicht geschätzt.
   *
   * Die alte Fassung stand bei 0.45/0.25/0.40 und lieferte für dieselben
   * Wertzeilen **1.39:1** — in freier Wildbahn aufgefallen (MRA, 25.08.2026,
   * Steckbrief der Content-Library).
   */
  readable:
    'border-white/40 bg-gradient-to-br from-white/95 via-white/94 to-accent/95 ring-white/30 ' +
    'dark:border-white/12 dark:from-accent/95 dark:via-accent/94 dark:to-accent/95 dark:ring-white/10',
} as const

export type LightboxFlaeche = keyof typeof LIGHTBOX_FLAECHEN

/**
 * Blättern im Vollbild — die Lightbox wird damit vom Vergrösserer zum
 * Betrachter. Die Reihenfolge kennt nur die aufrufende Galerie.
 */
export interface LightboxNavigation {
  /** Nullbasierte Position im Satz. */
  index: number
  anzahl: number
  aufZurueck: () => void
  aufVor: () => void
  /** Ohne diese beiden bleibt es Blättern ohne Selbstlauf. */
  spielt?: boolean
  aufSpielen?: () => void
}

interface LightboxProps {
  /** Name des Artefakts — wird zu `aria-label` von Trigger («… im Vollbild öffnen») und Dialog («… — Vollbild»). */
  label: string
  /**
   * Panel-Fläche. `glass` (Vorgabe) für opake Artefakte, `readable`, sobald im
   * Vollbild Text steht. Siehe `LIGHTBOX_FLAECHEN`.
   */
  surface?: LightboxFlaeche
  /**
   * Seitenverhältnis (Breite/Höhe) des Inhalts. Bestimmt die Dialog-Breite als
   * `min(95vw, 92vh·ratio)`, damit die aus der Breite abgeleitete Höhe die
   * Bildschirmhöhe nicht sprengt (Pattern §4). Ohne Angabe gilt nur
   * `max-w`/`max-h` + `overflow-auto`.
   */
  aspectRatio?: number
  /** Optional abweichender Vollbild-Inhalt (z.B. höher aufgelöste Variante); Default: `children`. */
  fullscreen?: ReactNode
  className?: string
  /** Inline-Darstellung des Artefakts. */
  children: ReactNode
}

function BlaetterKnopf({
  richtung,
  onClick,
  deaktiviert,
}: {
  richtung: 'zurueck' | 'vor'
  onClick: () => void
  deaktiviert: boolean
}) {
  const zurueck = richtung === 'zurueck'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deaktiviert}
      aria-label={zurueck ? 'Vorheriges Motiv' : 'Nächstes Motiv'}
 className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background/85 p-2 text-muted-foreground backdrop-blur transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-30 ${
        zurueck ? 'left-2' : 'right-2'
      }`}
    >
      {zurueck ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
    </button>
  )
}

/**
 * Der **Betrachter**: Backdrop, Panel, Fokusfalle, Scroll-Sperre, Escape,
 * Blättern. Kennt keinen Auslöser — wer ihn öffnet, entscheidet der Aufrufer.
 *
 * Warum getrennt von `Lightbox`: Die Lightbox vermischte zwei Aufgaben, den
 * **Auslöser** (ein Artefakt anklickbar machen) und den **Betrachter**. Für ein
 * einzelnes Diagramm fällt das nicht auf. Eine Galerie braucht aber N Auslöser
 * und genau EINEN Betrachter — sonst würde beim Blättern jedes Mal ein Dialog
 * abgebaut und ein neuer aufgebaut, mitsamt Fokusfalle und Scroll-Sperre.
 */
export function LightboxBetrachter({
  label,
  offen,
  aufSchliessen,
  navigation,
  surface = 'glass',
  aspectRatio,
  children,
}: {
  label: string
  offen: boolean
  aufSchliessen: () => void
  navigation?: LightboxNavigation
  surface?: LightboxFlaeche
  aspectRatio?: number
  children: ReactNode
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, offen)

  // Die jeweils aktuellen Rückrufe, ohne dass der Tasten-Effekt neu abonniert.
  // Ohne den Ref schlösse der Handler über die Navigation des ersten Renders —
  // beim zweiten Blättern zeigte die Pfeiltaste dann ins Leere.
  //
  // Nachgezogen im Effekt und nicht im Render: Ein Ref während des Renders zu
  // beschreiben ist unter Concurrent Rendering nicht zulässig (React kann einen
  // Render verwerfen), und `react-hooks/refs` hält es fest. Ohne
  // Abhängigkeitsliste läuft der Effekt nach **jedem** Render — genau das ist
  // hier gewollt.
  const aktuell = useRef({ navigation, aufSchliessen })
  useEffect(() => {
    aktuell.current = { navigation, aufSchliessen }
  })

  // Scroll-Lock ohne Layout-Sprung. Bewusst ein eigener Effekt, der NUR am Auf
  // und Zu hängt: Liefe er beim Blättern mit, merkte er sich die Position bei
  // jedem Motivwechsel neu — und die Seite spränge beim Schliessen woanders hin
  // als dorthin, wo man hergekommen ist.
  useEffect(() => {
    if (!offen) return
    const scrollY = window.scrollY
    const original = document.body.style.cssText
    document.body.style.cssText = `position: fixed; top: -${scrollY}px; left: 0; right: 0; overflow: hidden; width: 100%;`
    return () => {
      document.body.style.cssText = original
      window.scrollTo(0, scrollY)
    }
  }, [offen])

  useEffect(() => {
    if (!offen) return
    const onKeyDown = (e: KeyboardEvent) => {
      const { navigation: nav, aufSchliessen: zu } = aktuell.current
      if (e.key === 'Escape') zu()
      // Pfeiltasten blättern — die erwartete Geste, sobald es einen Satz gibt.
      if (!nav) return
      if (e.key === 'ArrowLeft') nav.aufZurueck()
      if (e.key === 'ArrowRight') nav.aufVor()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [offen])

  if (!offen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/30 p-6 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) aufSchliessen()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${label} — Vollbild`}
        style={aspectRatio ? { width: `min(95vw, calc(92vh * ${aspectRatio}))` } : undefined}
        // Glassmorphism nach Pattern: BEWUSST KEIN eigener backdrop-blur auf dem
        // Panel (der Backdrop blurrt schon — doppelte Rasterung ist teuer),
        // heller Rand + `ring-inset` als Glas-Kante. Wie deckend der Verlauf
        // ist, entscheidet `surface` — gerechnet, siehe `LIGHTBOX_FLAECHEN`.
        className={`relative flex max-h-[95vh] w-[95vw] max-w-[95vw] overflow-auto rounded-2xl border p-4 shadow-2xl ring-1 ring-inset sm:p-6 ${LIGHTBOX_FLAECHEN[surface]}`}
      >
        <button
          type="button"
          onClick={aufSchliessen}
          aria-label="Vollbild schliessen"
 className="absolute right-3 top-3 z-10 rounded-full border bg-background/80 p-1.5 text-muted-foreground backdrop-blur hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <X className="h-4 w-4" />
        </button>

        {navigation ? (
          <>
            {/* Die Blätter-Flächen liegen am Panelrand, nicht über dem Artefakt:
                mittig überlagert verdeckten sie genau das, was man ansieht —
                derselbe Grund, aus dem der Vergrössern-Hinweis in der Ecke sitzt. */}
            <BlaetterKnopf
              richtung="zurueck"
              onClick={navigation.aufZurueck}
              deaktiviert={navigation.anzahl < 2}
            />
            <BlaetterKnopf
              richtung="vor"
              onClick={navigation.aufVor}
              deaktiviert={navigation.anzahl < 2}
            />
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border bg-background/85 p-1 text-xs backdrop-blur">
              {navigation.aufSpielen ? (
                <button
                  type="button"
                  onClick={navigation.aufSpielen}
                  aria-label={navigation.spielt ? 'Slideshow anhalten' : 'Slideshow starten'}
 className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {navigation.spielt ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                </button>
              ) : null}
              <span
                className="px-2 font-mono tabular-nums text-muted-foreground"
                aria-live="polite"
              >
                {navigation.index + 1} / {navigation.anzahl}
              </span>
            </div>
          </>
        ) : null}
        {/*
          Zentriert (`m-auto`) und auf volle Breite gezwungen: SVGs bringen aus
          ihrer Quelle eine eigene `max-width` mit (Mermaid schreibt sie als
          Inline-Style) und blieben sonst im Vollbild auf Inline-Grösse stehen —
          genau das, was man beim Vergrössern nicht will. `!` sticht den
          Inline-Style, `h-auto` hält das Seitenverhältnis.

          Ausgenommen sind `.lucide`-Icons: ein Vollbild-Inhalt darf neben dem
          Artefakt auch beschriftete Panels tragen (Deck-Galerie), und ein
          16-px-Icon auf Spaltenbreite ist kein Vergrössern mehr, sondern ein
          Layout-Schaden.
        */}
        <div className="m-auto w-full [&_img]:h-auto [&_img]:w-full [&_svg:not(.lucide)]:h-auto [&_svg:not(.lucide)]:w-full [&_svg:not(.lucide)]:!max-w-none">
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Der **Auslöser** samt Betrachter: wickelt ein Artefakt ein und macht seine
 * ganze Fläche anklickbar. Der Normalfall für ein einzelnes Diagramm.
 */
export function Lightbox({
  label,
  surface = 'glass',
  aspectRatio,
  fullscreen,
  className = '',
  children,
}: LightboxProps) {
  const [offen, setOffen] = useState(false)

  return (
    <div className={`group relative ${className}`}>
      {children}
      {/*
        Die ganze Fläche ist der Auslöser, nicht das Eck-Symbol: der Zeiger steht
        beim Lesen ohnehin auf dem Artefakt, jede Reise in eine Ecke ist
        verschenkt. Ein zentriertes Symbol wäre der falsche Ausweg — es deckt
        genau die Mitte ab, in der bei einem Diagramm die Aussage steht.
        Das Eck-Symbol bleibt als reiner Hinweis (`aria-hidden`); `zoom-in` als
        Zeigerform ist das eigentliche, überall verstandene Signal.

        Als Überlagerung statt als Umhüllung, damit `children` nicht in einem
        Button verschachtelt wird. Preis: die Fläche schluckt Textauswahl und
        Klicks nach innen — das Pattern gilt deshalb nur für nicht-interaktive
        Artefakte (Diagramme, Grafiken, Bilder).
      */}
      <button
        type="button"
        onClick={() => setOffen(true)}
        aria-label={`${label} im Vollbild öffnen`}
        title="Vergrössern"
 className="absolute inset-0 z-10 cursor-zoom-in rounded-[inherit] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span
          aria-hidden="true"
          className="absolute right-2 top-2 rounded-md border bg-background/80 p-1.5 text-muted-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </span>
      </button>

      <LightboxBetrachter
        label={label}
        offen={offen}
        aufSchliessen={() => setOffen(false)}
        surface={surface}
        aspectRatio={aspectRatio}
      >
        {fullscreen ?? children}
      </LightboxBetrachter>
    </div>
  )
}

