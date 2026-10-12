import * as React from 'react'
import { Sparkles } from 'lucide-react'

import type { Tone } from '../lib/tone'
import { Badge } from './badge'

type AiDisclosureBadgeProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  /** Sichtbarer Text. Standard: «KI-generiert». */
  label?: string
  /** Kurzform für kleine Flächen (Thumbnails). Standard: «KI». */
  shortLabel?: string
  /** Zeigt die Kurzform; Screenreader hören weiterhin `label`. */
  compact?: boolean
  /** Über Bildern/Video: dunkler, halbtransparenter Grund. */
  onMedia?: boolean
  /** Grösse: `sm` (Karten, 20 px) oder `md` (Hero, Cover, 24 px). */
  size?: 'sm' | 'md'
  /** Tonrolle. Standard: `highlight`. */
  tone?: Tone
  /**
   * Blendet das Badge für Screenreader aus. Nur verwenden, wenn dieselbe
   * Angabe bereits im Alt-Text des Bildes steht (sonst doppelt vorgelesen).
   */
  decorative?: boolean
}

/**
 * Sichtbare Kennzeichnung KI-generierter oder KI-veränderter Inhalte
 * (Transparenzpflicht EU AI Act Art. 50). Entscheidet nicht selbst, ob
 * ein Inhalt KI-generiert ist: Diese Herkunft liefert die Anwendung.
 */
function AiDisclosureBadge({
  label = 'KI-generiert',
  shortLabel = 'KI',
  compact = false,
  onMedia = false,
  size = 'sm',
  tone = 'highlight',
  decorative = false,
  className,
  ...props
}: AiDisclosureBadgeProps) {
  return (
    <Badge
      data-ai-disclosure="true"
      tone={tone}
      onMedia={onMedia}
      size={size}
      title={compact ? label : undefined}
      aria-hidden={decorative ? true : undefined}
      icon={<Sparkles aria-hidden="true" />}
      className={className}
      {...props}
    >
      {compact ? (
        <>
          <span aria-hidden="true">{shortLabel}</span>
          <span className="sr-only">{label}</span>
        </>
      ) : (
        label
      )}
    </Badge>
  )
}

export { AiDisclosureBadge }
export type { AiDisclosureBadgeProps }
