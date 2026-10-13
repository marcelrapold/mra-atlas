import * as React from 'react'
import { cva } from 'class-variance-authority'

import { cn } from '../lib/utils'
import { Button, type ButtonProps } from './button'

/**
 * Zusätze zu `buttonVariants` für reine Icon-Buttons. Die Grundgestalt
 * (Fokus-Outline, Disabled, Loading) kommt aus `Button`.
 */
const iconButtonVariants = cva(
  // Unsichtbare Trefferfläche: mindestens 44 × 44 px, auch wenn der sichtbare
  // Knopf kleiner ist (WCAG 2.5.8 / 2.5.5).
  "relative after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
  {
    variants: {
      size: {
        sm: 'size-8',
        md: 'size-10',
        lg: 'size-12 [&_svg:not([class*=size-])]:size-5',
      },
      shape: {
        square: 'rounded-[var(--brand-radius)]',
        round: 'rounded-full',
      },
      glass: {
        // Milchglas nur wo backdrop-filter existiert; sonst flache, deckende Fläche.
        true: 'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground supports-[backdrop-filter]:bg-background/60 supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:hover:bg-background/80',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'square',
      glass: false,
    },
  },
)

type IconButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass'
type IconButtonSize = 'sm' | 'md' | 'lg'

type IconButtonProps = Omit<ButtonProps, 'size' | 'variant' | 'fullWidth' | 'aria-label'> & {
  /** Pflicht: beschreibt die Aktion für Screenreader, z. B. «Teilen». */
  'aria-label': string
  variant?: IconButtonVariant
  /** sm 32 px · md 40 px · lg 48 px sichtbar, Trefferfläche immer ≥ 44 px. */
  size?: IconButtonSize
  shape?: 'square' | 'round'
}

function IconButton({
  variant = 'ghost',
  size = 'md',
  shape = 'square',
  className,
  ...props
}: IconButtonProps) {
  const isGlass = variant === 'glass'
  // Button setzt data-slot/data-variant/data-size vor dem Prop-Spread, daher
  // überschreiben die Werte hier die Button-Defaults.
  return (
    <Button
      {...props}
      variant={isGlass ? 'ghost' : variant}
      size="icon"
      data-slot="icon-button"
      data-variant={variant}
      data-size={size}
      className={cn(iconButtonVariants({ size, shape, glass: isGlass }), className)}
    />
  )
}

export { IconButton, iconButtonVariants }
export type { IconButtonProps, IconButtonVariant, IconButtonSize }
