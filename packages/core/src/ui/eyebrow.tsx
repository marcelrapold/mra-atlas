import * as React from 'react'
import { Slot } from 'radix-ui'

import { cn } from '../lib/utils'
import { toneText, type Tone } from '../lib/tone'

/** Basisklasse, falls ein Element kein <Eyebrow> sein kann (z. B. <summary>). */
const eyebrowClassName = 'text-xs leading-snug font-semibold tracking-[0.08em] uppercase'

type EyebrowTag = 'span' | 'p' | 'div' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'dt' | 'label' | 'legend'

type EyebrowProps = React.HTMLAttributes<HTMLElement> & {
  /** Rendert das einzige Kind (z. B. `<h2>` oder einen Link) mit den Eyebrow-Klassen. */
  asChild?: boolean
  /**
   * Semantisches Element. Standard: `span`. Für Abschnittstitel `h2`–`h6`.
   * @deprecated `asChild` mit dem gewünschten Element verwenden, z. B. `<Eyebrow asChild><h2>…</h2></Eyebrow>`.
   */
  as?: EyebrowTag
  /** Tonrolle der Schrift. Standard: `neutral` (muted-foreground). */
  tone?: Tone
  ref?: React.Ref<HTMLElement>
  /** Nur relevant mit `as="label"`. */
  htmlFor?: string
}

/**
 * Kleines Versal-Label über Titeln, Zonen und Kennzahlen. 12 px, nicht
 * kleiner, damit `muted-foreground` die AA-Schwelle für kleine Schrift hält.
 */
function Eyebrow({ asChild = false, as = 'span', tone = 'neutral', className, ...props }: EyebrowProps) {
  const Comp: React.ElementType = asChild ? Slot.Root : as
  return (
    <Comp
      data-slot="eyebrow"
      data-tone={tone}
      className={cn(eyebrowClassName, toneText[tone], className)}
      {...props}
    />
  )
}

export { Eyebrow, eyebrowClassName }
export type { EyebrowProps, EyebrowTag }
