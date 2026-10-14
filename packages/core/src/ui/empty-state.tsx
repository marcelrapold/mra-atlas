import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'
import { Slot } from 'radix-ui'

import { cn } from '../lib/utils'

/* -------------------------------------------------------------------------- */
/* Anatomie                                                                    */
/* -------------------------------------------------------------------------- */

/** Rahmen eines leeren Zustands: gestrichelt, zentriert, ruhige Fläche. */
function Empty({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        'flex min-w-0 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-card/40 px-6 py-12 text-center',
        className,
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="empty-header" className={cn('flex flex-col items-center gap-1', className)} {...props} />
}

const emptyMediaVariants = cva('flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0', {
  variants: {
    variant: {
      default: 'bg-transparent',
      icon: "rounded-full bg-muted p-3 text-muted-foreground [&_svg:not([class*='size-'])]:size-5",
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

/** Bild oder Icon über dem Titel. Dekorativ: Icons darin `aria-hidden` setzen. */
function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant }), className)}
      {...props}
    />
  )
}

/**
 * Titel. Ohne `asChild` ein `div`; für eine Überschrift passender Ebene
 * `asChild` mit `<h2>`–`<h4>` verwenden, z. B. `<EmptyTitle asChild><h2>…</h2></EmptyTitle>`.
 */
function EmptyTitle({ className, asChild = false, ...props }: React.ComponentProps<'div'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'div'
  return <Comp data-slot="empty-title" className={cn('text-sm font-semibold', className)} {...props} />
}

/** Beschreibung als `<p>`, wie im bisherigen `EmptyState`. */
function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="empty-description"
      className={cn(
        'max-w-sm text-xs leading-relaxed text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

/** Handlungen und Zusatzinhalt unter dem Text (Button, Link, Details). */
function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="empty-content" className={cn('flex min-w-0 flex-col items-center gap-3', className)} {...props} />
}

/* -------------------------------------------------------------------------- */
/* Preset                                                                      */
/* -------------------------------------------------------------------------- */

type EmptyStateProps = Omit<React.ComponentProps<'div'>, 'title'> & {
  /** Dekoratives Icon im runden Feld. */
  icon?: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
  /** Handlung(en) unter dem Text. */
  actions?: React.ReactNode
  /** Überschriftenebene des Titels, passend zur Gliederung der Seite. Standard 3. */
  headingLevel?: 2 | 3 | 4
}

/** Fertig komponierter leerer Zustand aus `Empty`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription` und `EmptyContent`. */
function EmptyState({ icon: Icon, title, description, actions, headingLevel = 3, ...props }: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const
  return (
    <Empty {...props}>
      {Icon ? (
        <EmptyMedia variant="icon">
          <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
        </EmptyMedia>
      ) : null}
      <EmptyHeader>
        <EmptyTitle asChild>
          <Heading>{title}</Heading>
        </EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {actions ? <EmptyContent className="mt-2">{actions}</EmptyContent> : null}
    </Empty>
  )
}

export { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent, EmptyState, emptyMediaVariants }
export type { EmptyStateProps }
