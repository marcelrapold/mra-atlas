'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/utils'
import { getInitials } from './avatar'
import { Eyebrow } from './eyebrow'

/* -------------------------------------------------------------------------- */
/* GeneratedCover                                                             */
/* -------------------------------------------------------------------------- */

const CHART_TOKENS = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'] as const
type ChartToken = (typeof CHART_TOKENS)[number]

/** Stabiler 32-bit-Hash (Java-String-Hash), deterministisch auf Server und Client. */
function stableHash(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  return hash
}

/** Zwei unterschiedliche Chart-Tokens für einen Seed. Rein. */
function coverPalette(seed: string): [ChartToken, ChartToken] {
  const h = stableHash(seed)
  const n = CHART_TOKENS.length
  const a = h % n
  const b = (a + 1 + ((h >>> 8) % (n - 1))) % n
  // Indizes liegen per Modulo immer im Bereich; der Fallback beruhigt nur den Typ.
  return [CHART_TOKENS[a] ?? CHART_TOKENS[0], CHART_TOKENS[b] ?? CHART_TOKENS[1]]
}

interface GeneratedCoverProps extends React.ComponentProps<'div'> {
  /** Titel: Quelle der Initialen und des Standard-Seeds. */
  title: string
  /** Optionaler Seed, falls gleiche Titel verschiedene Farben brauchen. */
  seed?: string
  /** Kleine Zeile oben (z. B. Rubrik). */
  eyebrow?: React.ReactNode
  /** Laufnummer unten rechts (0-basiert, angezeigt als 01, 02 …). */
  index?: number
  /** Dekorativ (aria-hidden), wenn der Titel daneben bereits steht. */
  decorative?: boolean
  /** Barrierefreier Name, wenn nicht dekorativ. */
  label?: string
  /** Nur Initialen, zentriert — für kleine Flächen (< 64 px). */
  compact?: boolean
}

/**
 * Deterministisches Ersatz-Cover ohne Bild: Verlauf aus zwei Chart-Tokens
 * der aktiven Brand und Initialen auf einer kontraststabilen Plakette.
 */
function GeneratedCover({
  title,
  seed,
  eyebrow,
  index,
  decorative = false,
  label,
  compact = false,
  className,
  style,
  ...props
}: GeneratedCoverProps) {
  const [from, to] = coverPalette(seed ?? title)
  return (
    <div
      data-slot="generated-cover"
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': label ?? `Generiertes Cover für ${title}` })}
      className={cn('@container relative isolate aspect-square overflow-hidden bg-muted', className)}
      style={{
        backgroundImage: `radial-gradient(circle at 22% 18%, var(${from}) 0%, transparent 60%), linear-gradient(135deg, var(${to}) 0%, color-mix(in oklab, var(${to}) 45%, var(--foreground)) 100%)`,
        ...style,
      }}
      {...props}
    >
      {compact ? (
        <div className="absolute inset-0 grid place-items-center">
          <span className="rounded-sm bg-background/85 px-1 text-xs leading-tight font-bold text-foreground">
            {getInitials(title, '·')}
          </span>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col justify-between p-[8%]">
          {eyebrow ? (
            <span className="w-fit max-w-full truncate rounded-sm bg-background/85 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-foreground uppercase">
              {eyebrow}
            </span>
          ) : (
            <span />
          )}
          <div className="flex items-end justify-between gap-2">
            <span className="rounded-md bg-background/85 px-2 py-0.5 text-lg leading-tight font-bold tracking-tight text-foreground @[8rem]:text-2xl">
              {getInitials(title, '·')}
            </span>
            {index != null && (
              <span className="rounded-sm bg-background/85 px-1 font-mono text-[10px] text-foreground tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* MediaCard                                                                  */
/* -------------------------------------------------------------------------- */

const mediaCardVariants = cva(
  'group/media-card relative isolate flex overflow-hidden rounded-lg border bg-card text-card-foreground motion-safe:transition-[border-color,background-color,box-shadow] motion-safe:duration-(--duration-fast) hover:border-foreground/25 data-[active=true]:border-primary data-[active=true]:ring-1 data-[active=true]:ring-primary',
  {
    variants: {
      variant: {
        tile: 'flex-col',
        wide: 'flex-row items-stretch gap-4 p-3 sm:p-4',
      },
    },
    defaultVariants: { variant: 'tile' },
  },
)

const mediaCardImageVariants = cva('relative shrink-0 overflow-hidden bg-muted', {
  variants: {
    variant: {
      tile: 'aspect-square w-full',
      wide: 'aspect-square w-24 self-start rounded-md sm:w-32',
    },
  },
  defaultVariants: { variant: 'tile' },
})

interface MediaCardProps
  extends Omit<React.ComponentProps<'article'>, 'title'>, VariantProps<typeof mediaCardVariants> {
  title: React.ReactNode
  /** Text für das generierte Ersatz-Cover und den Seed (Standard: `title`, falls String). */
  coverTitle?: string
  imageSrc?: string
  /** Alt-Text. Leer lassen (Standard), wenn das Bild nur den Titel wiederholt. */
  imageAlt?: string
  /** Eigener Ersatz statt GeneratedCover, wenn kein Bild vorhanden ist oder es nicht lädt. */
  fallback?: React.ReactNode
  eyebrow?: React.ReactNode
  description?: React.ReactNode
  /** Metazeile (Datum, Dauer, Badges). */
  meta?: React.ReactNode
  /** Kleines Etikett auf dem Bild (z. B. «Neu», Dauer). */
  overlayTag?: React.ReactNode
  /** Eigenständige Aktionen (Buttons), liegen über dem Stretched Link. */
  action?: React.ReactNode
  /** Läuft gerade / ausgewählt: Rahmen in primary, aria-current. */
  active?: boolean
  /** Ansage für Screenreader im aktiven Zustand. */
  activeLabel?: string
  /** Ziel der ganzen Karte (Stretched Link über den Titel). */
  href?: string
  /** Link-Komponente, z. B. Next.js `Link`. Standard `a`. */
  linkComponent?: React.ElementType
  /** Zusätzliche Props für den Link (z. B. `prefetch`). */
  linkProps?: Record<string, unknown>
  headingLevel?: 'h2' | 'h3' | 'h4'
}

function MediaCardImage({
  variant,
  imageSrc,
  imageAlt = '',
  fallback,
  coverTitle,
  overlayTag,
}: Pick<MediaCardProps, 'variant' | 'imageSrc' | 'imageAlt' | 'fallback' | 'coverTitle' | 'overlayTag'>) {
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null)
  const showImage = !!imageSrc && imageSrc !== failedSrc
  return (
    <div data-slot="media-card-image" className={mediaCardImageVariants({ variant })}>
      {showImage ? (
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(imageSrc ?? null)}
          className="size-full object-cover motion-safe:transition-transform motion-safe:duration-(--duration-slow) motion-safe:group-hover/media-card:scale-105"
        />
      ) : (
        (fallback ?? <GeneratedCover title={coverTitle ?? ''} decorative className="size-full" />)
      )}
      {overlayTag && (
        <span
          data-slot="media-card-overlay-tag"
          className="absolute top-2 right-2 inline-flex max-w-[calc(100%-1rem)] items-center gap-1 truncate rounded-full bg-background/90 px-2 py-0.5 text-xs font-semibold text-foreground"
        >
          {overlayTag}
        </span>
      )}
    </div>
  )
}

function MediaCard({
  className,
  variant = 'tile',
  title,
  coverTitle,
  imageSrc,
  imageAlt,
  fallback,
  eyebrow,
  description,
  meta,
  overlayTag,
  action,
  active = false,
  activeLabel = 'Wird gerade abgespielt',
  href,
  linkComponent: LinkComp = 'a',
  linkProps,
  headingLevel: Heading = 'h3',
  ...props
}: MediaCardProps) {
  const seedTitle = coverTitle ?? (typeof title === 'string' ? title : '')
  return (
    <article
      data-slot="media-card"
      data-variant={variant}
      data-active={active}
      aria-current={active ? 'true' : undefined}
      className={cn(mediaCardVariants({ variant }), className)}
      {...props}
    >
      <MediaCardImage
        variant={variant}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        fallback={fallback}
        coverTitle={seedTitle}
        overlayTag={overlayTag}
      />
      <div
        data-slot="media-card-body"
        className={cn('flex min-w-0 flex-1 flex-col gap-1', variant === 'tile' ? 'p-4' : 'justify-center')}
      >
        {meta && (
          <div
            data-slot="media-card-meta"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"
          >
            {meta}
          </div>
        )}
        {eyebrow && (
          <Eyebrow as="p" tone="primary" data-slot="media-card-eyebrow" className="truncate">
            {eyebrow}
          </Eyebrow>
        )}
        <Heading data-slot="media-card-title" className="line-clamp-2 text-base leading-snug font-semibold">
          {href ? (
            <LinkComp
              href={href}
              {...linkProps}
              className="rounded-sm outline-none after:absolute after:inset-0 after:z-0 after:rounded-lg hover:underline hover:underline-offset-4 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring"
            >
              {title}
            </LinkComp>
          ) : (
            title
          )}
        </Heading>
        {active && <span className="sr-only">{activeLabel}</span>}
        {description && (
          <p data-slot="media-card-description" className="line-clamp-2 text-sm text-muted-foreground sm:line-clamp-3">
            {description}
          </p>
        )}
        {action && (
          <div data-slot="media-card-action" className="relative z-10 mt-2 flex flex-wrap items-center gap-2">
            {action}
          </div>
        )}
      </div>
    </article>
  )
}

export {
  MediaCard,
  GeneratedCover,
  mediaCardVariants,
  coverPalette,
  type MediaCardProps,
  type GeneratedCoverProps,
}
