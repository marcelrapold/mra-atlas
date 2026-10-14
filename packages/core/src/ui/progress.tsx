'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Progress as ProgressPrimitive } from 'radix-ui'

import { toneFill, type Tone } from '../lib/tone'
import { cn } from '../lib/utils'
import { CoreKeyframes, progressIndeterminateMotion } from './motion-keyframes'

const NBSP = String.fromCharCode(0xa0)

/** Standardtext für `aria-valuetext`: gerundeter Prozentwert mit geschütztem Leerzeichen, z. B. «42 %». */
function formatProgressValue(value: number, max: number) {
  return `${Math.round((value / max) * 100)}${NBSP}%`
}

const progressVariants = cva('relative w-full overflow-hidden rounded-full bg-muted', {
  variants: {
    size: {
      sm: 'h-1',
      default: 'h-2',
      lg: 'h-3',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root> &
  VariantProps<typeof progressVariants> & {
    /** Tonrolle des Balkens. Standard `primary`. */
    tone?: Tone
    indicatorClassName?: string
  }

/**
 * Fortschrittsbalken. Mit `value={null}` (oder ohne `value`) unbestimmt:
 * Radix setzt dann `data-state="indeterminate"` und lässt `aria-valuenow` weg.
 * Der Name kommt vom Aufrufer (`aria-label` oder `aria-labelledby`).
 */
function Progress({
  className,
  indicatorClassName,
  value,
  max = 100,
  size = 'default',
  tone = 'primary',
  getValueLabel = formatProgressValue,
  ...props
}: ProgressProps) {
  const safeMax = typeof max === 'number' && max > 0 ? max : 100
  const determinate = typeof value === 'number' && Number.isFinite(value)
  const percent = determinate ? Math.min(100, Math.max(0, (value / safeMax) * 100)) : 0
  return (
    <>
      {determinate ? null : <CoreKeyframes />}
      <ProgressPrimitive.Root
        data-slot="progress"
        data-size={size ?? 'default'}
        data-tone={tone}
        value={determinate ? value : null}
        max={safeMax}
        getValueLabel={getValueLabel}
        className={cn(progressVariants({ size }), className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(
            'h-full rounded-full',
            toneFill[tone],
            determinate
              ? 'w-full motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out'
              : cn('w-1/3 motion-reduce:w-full motion-reduce:opacity-50', progressIndeterminateMotion),
            indicatorClassName,
          )}
          style={determinate ? { transform: `translateX(-${100 - percent}%)` } : undefined}
        />
      </ProgressPrimitive.Root>
    </>
  )
}

export { Progress, progressVariants, formatProgressValue }
export type { ProgressProps }
