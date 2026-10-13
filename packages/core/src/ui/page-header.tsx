import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/utils'
import type { Tone } from '../lib/tone'
import { Eyebrow } from './eyebrow'

const pageHeaderVariants = cva(
  'flex flex-wrap items-end justify-between gap-x-4 gap-y-3',
  {
    variants: {
      size: {
        default: 'mb-8',
        compact: 'mb-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

const pageHeaderTitleVariants = cva('font-bold tracking-tight text-foreground text-balance', {
  variants: {
    size: {
      default: 'mt-1 text-3xl md:text-4xl',
      compact: 'text-xl md:text-2xl',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

type PageHeaderProps = Omit<React.ComponentProps<'header'>, 'title'> &
  VariantProps<typeof pageHeaderVariants> & {
    /** Kleine Überzeile über dem Titel. */
    eyebrow?: React.ReactNode
    /** Tonrolle der Überzeile, Standard `neutral`. */
    eyebrowTone?: Tone
    /** Seitentitel, gerendert als `<h1>`. */
    title: React.ReactNode
    /** Einzeilige Beschreibung unter dem Titel. */
    description?: React.ReactNode
    /** Slot für eine `<Breadcrumb>` über der Überzeile. */
    breadcrumb?: React.ReactNode
    /** Rechtsbündiger Slot für Aktionen (Buttons, Filter). */
    actions?: React.ReactNode
    /** Blendet die Breadcrumb unter `md` aus (Standard: `false`). */
    hideBreadcrumbOnMobile?: boolean
    /** Zusätzliche Attribute für das `<h1>`, etwa eine `id` als Fokusziel. */
    titleProps?: React.ComponentProps<'h1'>
  }

function PageHeader({
  className,
  size = 'default',
  eyebrow,
  eyebrowTone = 'neutral',
  title,
  description,
  breadcrumb,
  actions,
  hideBreadcrumbOnMobile = false,
  titleProps,
  ...props
}: PageHeaderProps) {
  const compact = size === 'compact'

  return (
    <header
      data-slot="page-header"
      data-size={size}
      className={cn(pageHeaderVariants({ size }), className)}
      {...props}
    >
      <div className="min-w-0">
        {breadcrumb ? (
          <div
            data-slot="page-header-breadcrumb"
            className={cn(compact ? 'mb-1' : 'mb-2', hideBreadcrumbOnMobile && 'max-md:hidden')}
          >
            {breadcrumb}
          </div>
        ) : null}
        {eyebrow ? (
          <Eyebrow as="p" tone={eyebrowTone} data-slot="page-header-eyebrow">
            {eyebrow}
          </Eyebrow>
        ) : null}
        <div className={cn(compact && 'mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-1')}>
          <h1
            data-slot="page-header-title"
            {...titleProps}
            className={cn(pageHeaderTitleVariants({ size }), titleProps?.className)}
          >
            {title}
          </h1>
          {description ? (
            <p
              data-slot="page-header-description"
              className={cn(
                'max-w-2xl text-muted-foreground',
                compact ? 'text-xs' : 'mt-2 text-sm md:text-base',
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div data-slot="page-header-actions" className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  )
}

export { PageHeader, pageHeaderVariants, pageHeaderTitleVariants }
export type { PageHeaderProps }
