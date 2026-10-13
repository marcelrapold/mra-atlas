import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/utils'
import { toneFill, type Tone } from '../lib/tone'

const statusDotVariants = cva('relative inline-flex shrink-0 rounded-full', {
  variants: {
    size: {
      sm: 'size-1.5',
      md: 'size-2',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

type StatusDotProps = Omit<React.ComponentProps<'span'>, 'children'> &
  VariantProps<typeof statusDotVariants> & {
    /** Tonrolle der Füllung. Standard: `neutral`. */
    tone?: Tone
    /**
     * Pulsierender Ring. Nur für genau eine Stelle pro Ansicht gedacht.
     * Läuft nur ohne «Bewegung reduzieren» (`motion-safe:`).
     */
    pulse?: boolean
    /**
     * Zugänglicher Name. Ohne `label` ist der Punkt dekorativ
     * (`aria-hidden`) und die Bedeutung muss als Text daneben stehen.
     */
    label?: string
  }

/** Farbiger Statuspunkt in einer Tonrolle, optional pulsierend. */
function StatusDot({ className, size = 'md', tone = 'neutral', pulse = false, label, ...props }: StatusDotProps) {
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const }

  return (
    <span
      data-slot="status-dot"
      data-size={size}
      data-tone={tone}
      data-pulse={pulse ? 'true' : undefined}
      className={cn(statusDotVariants({ size }), className)}
      {...a11y}
      {...props}
    >
      {pulse && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-0 hidden rounded-full opacity-75 motion-safe:inline-flex motion-safe:animate-ping',
            toneFill[tone],
          )}
        />
      )}
      <span aria-hidden="true" className={cn('relative inline-flex size-full rounded-full', toneFill[tone])} />
    </span>
  )
}

type LiveDotProps = Omit<StatusDotProps, 'tone'>

/**
 * Der «Live»-Punkt: Statuspunkt in der Tonrolle `live`. Ruhig, ausser
 * `pulse` ist gesetzt. Dekorativ, solange kein `label` übergeben wird.
 */
function LiveDot({ className, ...props }: LiveDotProps) {
  return <StatusDot data-slot="live-dot" tone="live" className={className} {...props} />
}

export { LiveDot, StatusDot, statusDotVariants }
export type { LiveDotProps, StatusDotProps }
