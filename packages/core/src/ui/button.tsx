import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { Slot } from 'radix-ui'

import { cn } from '../lib/utils'

const buttonVariants = cva(
  // Fokus über outline statt box-shadow-Ring: bleibt in Forced Colors sichtbar
  // und wird nicht von Schatten-Varianten überschrieben (Audit P1).
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-hover-foreground',
        destructive:
          'bg-destructive text-destructive-foreground hover:brightness-95',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          'border border-foreground/15 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 dark:border-foreground/20',
        ghost:
          'border border-transparent hover:border-border hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-xs': "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  },
)

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Rendert das einzige Kind (z. B. einen Link) mit den Button-Klassen. */
    asChild?: boolean
    /**
     * Ladezustand: zeigt einen Spinner vor dem Inhalt, setzt `aria-busy` und
     * `aria-disabled` und ignoriert Klicks. Der Button bleibt fokussierbar,
     * damit der Tastaturfokus beim Laden nicht verloren geht. Mit `asChild`
     * wird kein Spinner eingefügt (Slot erwartet genau ein Kind).
     */
    loading?: boolean
  }

function Button({
  className,
  variant = 'default',
  size = 'default',
  fullWidth = false,
  asChild = false,
  loading = false,
  disabled,
  onClick,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  // Reine Icon-Buttons tauschen das Icon gegen den Spinner, statt zu wachsen.
  const iconOnly = typeof size === 'string' && size.startsWith('icon')

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading ? '' : undefined}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      disabled={disabled}
      onClick={
        loading
          ? (event: React.MouseEvent<HTMLButtonElement>) => {
              // Nicht `disabled` setzen: das würde den Fokus verwerfen.
              event.preventDefault()
              event.stopPropagation()
            }
          : onClick
      }
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading ? (
            <Loader2 aria-hidden="true" data-slot="button-spinner" className="motion-safe:animate-spin" />
          ) : null}
          {loading && iconOnly ? null : children}
        </>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
