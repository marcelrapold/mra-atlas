import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '../lib/utils'
import { focusRing } from '../lib/focus'
import { toneBorder, toneClasses, type Tone, type ToneAppearance } from '../lib/tone'
import { LiveDot, StatusDot } from './live-indicator'

const badgeVariants = cva(
  `inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent text-xs font-medium whitespace-nowrap transition-colors motion-reduce:transition-none ${focusRing} aria-invalid:border-destructive [&>svg]:pointer-events-none [&>svg]:size-3 [&>svg]:shrink-0`,
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        ghost: '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 [a&]:hover:underline',
      },
      size: {
        default: 'px-2 py-0.5',
        sm: 'h-5 px-2 leading-none',
        md: 'h-6 gap-1.5 px-2.5 leading-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    /**
     * Tonrolle. Gesetzt ersetzt sie die Farben von `variant`
     * (Form und Grösse bleiben). `live` bekommt automatisch einen LiveDot.
     */
    tone?: Tone
    /** Darstellung der Tonrolle: `soft` (Standard), `solid` oder `outline`. */
    appearance?: ToneAppearance
    /** Führender Punkt in der Tonrolle. Bei `tone="live"` standardmässig an. */
    dot?: boolean
    /** Lässt den Punkt pulsieren (nur mit `motion-safe`, eine Stelle pro Ansicht). */
    pulse?: boolean
    /** Führendes Icon (lucide). Ersetzt den Punkt. Wird `aria-hidden` empfohlen. */
    icon?: React.ReactNode
    /**
     * Für Badges über Bildern/Video: dunkler, halbtransparenter Grund
     * (`bg-foreground/80 text-background`), Rahmen in der Tonrolle.
     */
    onMedia?: boolean
    /** Tabellarische Ziffern für Zähler (z. B. «128 hören zu»). */
    numeric?: boolean
  }

function Badge({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  tone,
  appearance = 'soft',
  dot,
  pulse = false,
  icon,
  onMedia = false,
  numeric = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : 'span'
  const toned = tone !== undefined || onMedia
  const effectiveTone: Tone = tone ?? 'neutral'
  const dotSize = size === 'md' ? 'md' : 'sm'

  const showDot = icon === undefined && (dot ?? effectiveTone === 'live')
  const lead =
    icon !== undefined ? (
      icon
    ) : showDot ? (
      effectiveTone === 'live' ? (
        <LiveDot size={dotSize} pulse={pulse} />
      ) : (
        <StatusDot data-slot="badge-dot" tone={effectiveTone} size={dotSize} pulse={pulse} />
      )
    ) : null

  const toneClassName = onMedia
    ? cn('bg-foreground/80 text-background', tone ? toneBorder[tone] : 'border-background/30')
    : tone
      ? toneClasses(tone, appearance)
      : undefined

  // Mit asChild muss genau ein Kind an Slot gehen; der führende Punkt
  // entfällt dann (das Kind bestimmt seinen Inhalt selbst).
  const content = asChild ? (
    children
  ) : (
    <>
      {lead}
      {children}
    </>
  )

  return (
    <Comp
      data-slot="badge"
      data-variant={toned ? undefined : variant}
      data-size={size}
      data-tone={tone}
      data-appearance={tone && !onMedia ? appearance : undefined}
      data-on-media={onMedia ? 'true' : undefined}
      className={cn(
        badgeVariants({ variant: toned ? null : variant, size }),
        toneClassName,
        numeric && 'tabular-nums',
        className,
      )}
      {...props}
    >
      {content}
    </Comp>
  )
}

export { Badge, badgeVariants }
export type { BadgeProps }
