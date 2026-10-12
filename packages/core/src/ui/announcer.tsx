'use client'

import * as React from 'react'

import { cn } from '../lib/utils'

type AnnouncerPoliteness = 'polite' | 'assertive'

interface AnnouncerProps extends Omit<React.ComponentProps<'span'>, 'children' | 'role' | 'aria-live'> {
  /** Zu sprechender Text. `null`/leer bricht eine wartende Ansage ab und bleibt still. */
  message: string | null | undefined
  /**
   * Was sich ändern muss, damit neu gesprochen wird (z. B. eine Track- oder Job-ID).
   * Standard: der Text selbst.
   */
  announceKey?: string | null
  /** `polite` (Standard) wartet, bis der Screenreader frei ist; `assertive` unterbricht. */
  politeness?: AnnouncerPoliteness
  /** Entprellung: erst sprechen, wenn der neue Stand so lange hält. Standard 1000 ms. */
  settleMs?: number
  /** Auch den Stand beim Einhängen ansagen. Standard `false` (nur Wechsel). */
  announceInitial?: boolean
}

/**
 * Unsichtbare Live-Region, die Screenreadern einen **Wechsel** meldet
 * (WCAG 4.1.3). Der Stand beim Einhängen bleibt still, kurze Zwischenzustände
 * gehen in der Entprellung unter. Die Region ist immer im DOM, damit
 * Screenreader die Änderung zuverlässig erkennen.
 */
function Announcer({
  message,
  announceKey,
  politeness = 'polite',
  settleMs = 1000,
  announceInitial = false,
  className,
  ...props
}: AnnouncerProps) {
  const [spoken, setSpoken] = React.useState<{ n: number; text: string } | null>(null)
  const text = message?.trim() ?? ''
  const key = text ? (announceKey ?? text) : null
  // Der Stand beim ersten Render gilt als bekannt (still), ausser
  // `announceInitial`. Ein leerer Start-Stand ist kein Inhalt: Die erste
  // echte Meldung danach wird angesagt. Ref-Initialwert statt «erster
  // Effekt»-Flag, damit StrictMode-Doppelläufe nichts ansagen.
  const knownKeyRef = React.useRef<string | null>(announceInitial ? null : key)

  React.useEffect(() => {
    if (!key) return
    if (key === knownKeyRef.current) return
    const id = window.setTimeout(() => {
      knownKeyRef.current = key
      setSpoken((prev) => ({ n: (prev?.n ?? 0) + 1, text }))
    }, Math.max(0, settleMs))
    return () => window.clearTimeout(id)
  }, [key, text, settleMs, announceInitial])

  return (
    <span
      data-slot="announcer"
      data-politeness={politeness}
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic="true"
      className={cn('sr-only', className)}
      {...props}
    >
      {/* Neuer key je Ansage: auch zwei gleiche Texte hintereinander werden gesprochen. */}
      {spoken && <span key={spoken.n}>{spoken.text}</span>}
    </span>
  )
}

export { Announcer }
export type { AnnouncerProps, AnnouncerPoliteness }
