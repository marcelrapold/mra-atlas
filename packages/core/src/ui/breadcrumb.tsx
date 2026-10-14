import * as React from 'react'
import { ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'
import { Slot } from 'radix-ui'

import { focusRing } from '../lib/focus'
import { cn } from '../lib/utils'

/**
 * Pfadnavigation (Breadcrumb). Router-agnostisch: Links werden als `<a>`
 * gerendert oder über `asChild` an die Link-Komponente des Routers übergeben.
 */
function Breadcrumb({
  'aria-label': ariaLabel = 'Pfadnavigation',
  ...props
}: React.ComponentProps<'nav'>) {
  return <nav data-slot="breadcrumb" aria-label={ariaLabel} {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2',
        className,
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<'a'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'a'

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        'inline-flex items-center rounded-xs underline-offset-4 transition-colors hover:text-foreground hover:underline motion-reduce:transition-none pointer-coarse:min-h-11',
        focusRing,
        className,
      )}
      {...props}
    />
  )
}

/** Aktuelle Seite: kein Link, `aria-current="page"`. */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn('font-medium text-foreground', className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('text-muted-foreground/70 [&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  )
}

/** Platzhalter für ausgeblendete Zwischenebenen. */
function BreadcrumbEllipsis({
  className,
  label = 'Weitere Ebenen',
  ...props
}: React.ComponentProps<'span'> & { label?: string }) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
