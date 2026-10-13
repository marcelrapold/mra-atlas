import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/utils'

const sectionVariants = cva('', {
  variants: {
    spacing: {
      none: '',
      sm: 'mb-6',
      md: 'mb-10',
      lg: 'mb-16',
    },
  },
  defaultVariants: {
    spacing: 'md',
  },
})

type HeadingLevel = 2 | 3 | 4

type SectionHeaderProps = Omit<React.ComponentProps<'div'>, 'title'> & {
  /** Überschrift des Bereichs. */
  title?: React.ReactNode
  /** Kurze Beschreibung unter der Überschrift. */
  description?: React.ReactNode
  /** Dekoratives Icon vor der Überschrift (wird vor Screenreadern verborgen). */
  icon?: React.ReactNode
  /** Rechtsbündiger Slot für Buttons oder Filter. */
  actions?: React.ReactNode
  /** Überschriftenebene, Standard `2`. */
  headingLevel?: HeadingLevel
  /** `id` der Überschrift, damit `<section aria-labelledby>` darauf zeigen kann. */
  titleId?: string
}

function SectionHeader({
  className,
  title,
  description,
  icon,
  actions,
  headingLevel = 2,
  titleId,
  children,
  ...props
}: SectionHeaderProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4'

  return (
    <div
      data-slot="section-header"
      className={cn('mb-6 flex flex-wrap items-start justify-between gap-4', className)}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-3">
        {icon ? (
          <span
            data-slot="section-icon"
            aria-hidden="true"
            className="flex shrink-0 text-primary [&>svg]:size-5"
          >
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          {title ? (
            <Heading
              id={titleId}
              data-slot="section-title"
              className="text-xl font-semibold tracking-tight text-foreground"
            >
              {title}
            </Heading>
          ) : null}
          {description ? (
            <p data-slot="section-description" className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
          {children}
        </div>
      </div>
      {actions ? (
        <div data-slot="section-actions" className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  )
}

type SectionProps = Omit<React.ComponentProps<'section'>, 'title'> &
  VariantProps<typeof sectionVariants> &
  Pick<SectionHeaderProps, 'title' | 'description' | 'icon' | 'actions' | 'headingLevel'>

/**
 * Seitenbereich. Mit `title` rendert er einen `SectionHeader` und verknüpft die
 * Überschrift über `aria-labelledby`, sodass der Bereich als benannte Region
 * erscheint. Ohne `title` bleibt er ein unbenanntes `<section>`; dann bei Bedarf
 * selbst `aria-labelledby` oder `aria-label` setzen.
 */
function Section({
  className,
  spacing = 'md',
  title,
  description,
  icon,
  actions,
  headingLevel,
  children,
  ...props
}: SectionProps) {
  const generatedId = React.useId()
  const titleId = `${generatedId}-title`
  const hasHeader = Boolean(title || description || actions)

  return (
    <section
      data-slot="section"
      data-spacing={spacing}
      aria-labelledby={title ? titleId : undefined}
      className={cn(sectionVariants({ spacing }), className)}
      {...props}
    >
      {hasHeader ? (
        <SectionHeader
          title={title}
          titleId={titleId}
          description={description}
          icon={icon}
          actions={actions}
          headingLevel={headingLevel}
        />
      ) : null}
      {children}
    </section>
  )
}

export { Section, SectionHeader, sectionVariants }
export type { SectionProps, SectionHeaderProps }
