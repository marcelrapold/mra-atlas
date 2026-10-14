'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Heart } from 'lucide-react'
import { Toggle as TogglePrimitive } from 'radix-ui'

import { focusRing } from '../lib/focus'
import { cn } from '../lib/utils'

const toggleVariants = cva(
  `relative inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap hover:bg-muted hover:text-foreground ${focusRing} disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground motion-safe:transition-[color,background-color,scale] motion-safe:enabled:active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 min-w-9 px-2',
        /** Alias von `default`. */
        md: 'h-9 min-w-9 px-2',
        sm: 'h-8 min-w-8 px-1.5',
        lg: 'h-11 min-w-11 px-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

/** Erweitert die Trefferfläche kleiner Toggles unsichtbar auf 44 × 44 px. */
const TOUCH_TARGET =
  "after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']"

type ToggleProps = React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>

function Toggle({ className, variant = 'default', size = 'default', ...props }: ToggleProps) {
  // `md` ist ein Alias: `data-size` bleibt `default`.
  const resolvedSize = size === 'md' ? 'default' : size
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      data-variant={variant}
      data-size={resolvedSize}
      className={cn(toggleVariants({ variant, size: resolvedSize }), resolvedSize !== 'lg' && TOUCH_TARGET, className)}
      {...props}
    />
  )
}

type LikeToggleProps = Omit<
  React.ComponentProps<typeof TogglePrimitive.Root>,
  'aria-label' | 'children'
> & {
  /**
   * Fester zugänglicher Name; der Zustand läuft über `aria-pressed`.
   * Standard: «Gefällt mir».
   */
  label?: string
  /** Beschriftung sichtbar neben dem Herz zeigen (sonst nur für Screenreader). */
  showLabel?: boolean
  /** Optionaler Zähler neben dem Herz, z. B. Anzahl Likes. */
  count?: number
  /** `md` ist ein Alias von `default`. */
  size?: 'sm' | 'default' | 'md' | 'lg'
}

function LikeToggle({
  label = 'Gefällt mir',
  showLabel = false,
  count,
  size: sizeProp = 'default',
  className,
  ...props
}: LikeToggleProps) {
  const size = sizeProp === 'md' ? 'default' : sizeProp
  const iconOnly = !showLabel && count === undefined
  return (
    <TogglePrimitive.Root
      data-slot="like-toggle"
      data-size={size}
      aria-label={iconOnly ? label : undefined}
      className={cn(
        toggleVariants({ variant: 'default', size }),
        iconOnly && 'rounded-full px-0',
        iconOnly && size !== 'lg' && TOUCH_TARGET,
        !iconOnly && size !== 'lg' && 'after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-[\'\']',
        'text-muted-foreground data-[state=on]:bg-primary/10 data-[state=on]:text-primary',
        className,
      )}
      {...props}
    >
      <Heart
        aria-hidden="true"
        className="[[data-state=on]>&]:fill-current motion-safe:transition-transform motion-safe:[[data-state=on]>&]:scale-110"
      />
      {showLabel ? <span>{label}</span> : !iconOnly ? <span className="sr-only">{label}</span> : null}
      {count !== undefined ? (
        <span data-slot="like-toggle-count" className="tabular-nums">
          {count.toLocaleString('de-CH')}
        </span>
      ) : null}
    </TogglePrimitive.Root>
  )
}

export { Toggle, LikeToggle, toggleVariants }
export type { ToggleProps, LikeToggleProps }
