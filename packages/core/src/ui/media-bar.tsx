'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/utils'
import { Announcer } from './announcer'
import { BarWaveform } from './audio-visual'
import { eyebrowClassName } from './eyebrow'
import { GeneratedCover } from './media-card'
import { PlayButton, type PlayButtonProps } from './play-button'

/*
 * MediaBar — persistente Wiedergabeleiste als reine Präsentation.
 * Kein <audio>, kein Store: Zustand und Callbacks kommen von der App.
 */

/** Sekunden als m:ss bzw. h:mm:ss. Ungültige Werte → «0:00». */
function formatMediaTime(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

/** Gesprochene Zeit, z. B. «1 Minute 5 Sekunden». */
function spokenMediaTime(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const parts: string[] = []
  if (h) parts.push(`${h} ${h === 1 ? 'Stunde' : 'Stunden'}`)
  if (m) parts.push(`${m} ${m === 1 ? 'Minute' : 'Minuten'}`)
  if (s || parts.length === 0) parts.push(`${s} ${s === 1 ? 'Sekunde' : 'Sekunden'}`)
  return parts.join(' ')
}

const mediaBarVariants = cva(
  // The bar sizes itself by its own width (container query), not the viewport: it also
  // has to work inside narrow columns and side panels on wide screens.
  '@container/media-bar z-40 w-full border-t bg-background/95 px-4 py-2 text-foreground supports-[backdrop-filter]:bg-background/80 supports-[backdrop-filter]:backdrop-blur-md',
  {
    variants: {
      position: {
        static: 'relative',
        sticky: 'sticky bottom-0',
        fixed: 'fixed inset-x-0 bottom-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]',
      },
    },
    defaultVariants: { position: 'static' },
  },
)

interface MediaBarProps extends React.ComponentProps<'section'>, VariantProps<typeof mediaBarVariants> {
  /** Name der Landmark. */
  label?: string
  /** Text für die höfliche Live-Region (z. B. «Verbindung wird wiederhergestellt»). */
  status?: string
}

const mediaBarGrid =
  'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 @2xl/media-bar:grid-cols-[minmax(0,1fr)_minmax(16rem,2fr)_minmax(0,1fr)] @2xl/media-bar:gap-x-6'

function MediaBar({ className, position = 'static', label = 'Wiedergabe', status, children, ...props }: MediaBarProps) {
  return (
    <section
      data-slot="media-bar"
      data-position={position}
      aria-label={label}
      className={cn(mediaBarVariants({ position }), className)}
      {...props}
    >
      <div data-slot="media-bar-grid" className={mediaBarGrid}>{children}</div>
      <Announcer data-slot="media-bar-status" message={status} settleMs={300} />
    </section>
  )
}

/** Linke Zone: Cover + Meta. */
function MediaBarInfo({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="media-bar-info" className={cn('flex min-w-0 items-center gap-3', className)} {...props} />
}

const mediaBarArtworkVariants = cva('relative shrink-0 overflow-hidden rounded-md border bg-muted', {
  variants: { size: { sm: 'size-10', md: 'size-12', lg: 'size-14' } },
  defaultVariants: { size: 'md' },
})

interface MediaBarArtworkProps extends React.ComponentProps<'div'>, VariantProps<typeof mediaBarArtworkVariants> {
  src?: string
  /** Leer (Standard), wenn das Bild nur den Titel daneben wiederholt. */
  alt?: string
  /** Titel für das generierte Ersatz-Cover. */
  title?: string
  /** Eigener Ersatz statt GeneratedCover. */
  fallback?: React.ReactNode
}

function MediaBarArtwork({
  className,
  size = 'md',
  src,
  alt = '',
  title = '',
  fallback,
  ...props
}: MediaBarArtworkProps) {
  const [failed, setFailed] = React.useState<string | null>(null)
  const show = !!src && src !== failed
  return (
    <div
      data-slot="media-bar-artwork"
      data-size={size}
      className={cn(mediaBarArtworkVariants({ size }), className)}
      {...props}
    >
      {show ? (
        <img
          src={src}
          alt={alt}
          decoding="async"
          onError={() => setFailed(src ?? null)}
          className="size-full object-cover"
        />
      ) : (
        (fallback ?? <GeneratedCover title={title} decorative compact className="size-full" />)
      )}
    </div>
  )
}

interface MediaBarMetaProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  title: React.ReactNode
  subtitle?: React.ReactNode
  /** Kleine Zeile über dem Titel (Sendung, Rubrik). */
  eyebrow?: React.ReactNode
  /** Slot für Live-Badge, Status-Punkt o. ä. neben der Eyebrow. */
  badge?: React.ReactNode
}

function MediaBarMeta({ className, title, subtitle, eyebrow, badge, ...props }: MediaBarMetaProps) {
  return (
    <div data-slot="media-bar-meta" className={cn('min-w-0 flex-1 leading-tight', className)} {...props}>
      {(eyebrow || badge) && (
        <div className={cn('flex min-w-0 items-center gap-2 text-muted-foreground', eyebrowClassName)}>
          {badge}
          {eyebrow && <span className="truncate">{eyebrow}</span>}
        </div>
      )}
      <p className="truncate text-sm font-semibold">{title}</p>
      {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

interface MediaBarTransportProps extends React.ComponentProps<'div'> {
  /** Name der Steuergruppe. */
  label?: string
  /** Rendert den Atlas-PlayButton in der Mitte der Gruppe. */
  playButton?: PlayButtonProps
  /** Knöpfe links vom PlayButton (z. B. zurückspulen). */
  before?: React.ReactNode
}

/** Mittlere Zone: Transportknöpfe, darunter optional die Timeline (children). */
function MediaBarTransport({
  className,
  label = 'Wiedergabesteuerung',
  playButton,
  before,
  children,
  ...props
}: MediaBarTransportProps) {
  return (
    <div
      data-slot="media-bar-transport"
      role="group"
      aria-label={label}
      className={cn(
        'col-start-2 row-start-1 flex min-w-0 flex-col items-center gap-1 @2xl/media-bar:col-start-auto @max-2xl/media-bar:[&>[data-slot=media-bar-timeline]]:hidden',
        className,
      )}
      {...props}
    >
      {(before || playButton) && (
        <div className="flex items-center gap-1">
          {before}
          {playButton && <PlayButton size="md" {...playButton} />}
        </div>
      )}
      {children}
    </div>
  )
}

interface MediaBarTimelineProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  /** Aktuelle Position in Sekunden. */
  value: number
  /** Gesamtdauer in Sekunden. 0 oder `live` = kein Spulen. */
  duration: number
  /** Neue Position (Sekunden) beim Ziehen oder per Tastatur. */
  onSeek?: (seconds: number) => void
  /** Schrittweite der Pfeiltasten in Sekunden (Bild auf/ab: sechsfach). */
  step?: number
  /** Livestream: keine Position, nur «Live». */
  live?: boolean
  liveLabel?: string
  /** Name des Reglers. */
  label?: string
  /** Optionale Wellenform (0..1) als Spur. */
  waveform?: readonly number[]
  disabled?: boolean
}

function MediaBarTimeline({
  className,
  value,
  duration,
  onSeek,
  step = 5,
  live = false,
  liveLabel = 'Live',
  label = 'Position',
  waveform,
  disabled = false,
  ...props
}: MediaBarTimelineProps) {
  const id = React.useId()
  const seekable = !live && duration > 0 && !!onSeek && !disabled
  const safe = Math.min(Math.max(0, value), Math.max(0, duration))
  const progress = duration > 0 ? safe / duration : live ? 1 : 0

  const track = waveform ? (
    <BarWaveform values={waveform} progress={progress} className="h-6" />
  ) : (
    <span className="relative block h-1 w-full overflow-hidden rounded-full bg-muted">
      <span className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${progress * 100}%` }} />
    </span>
  )

  return (
    <div
      data-slot="media-bar-timeline"
      data-live={live || undefined}
      className={cn('flex w-full items-center gap-2 text-xs text-muted-foreground tabular-nums', className)}
      {...props}
    >
      <span aria-hidden className="min-w-10 text-right">
        {live ? '' : formatMediaTime(safe)}
      </span>
      <div
        className={cn(
          'relative flex h-11 min-w-0 flex-1 items-center rounded-sm',
          'has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring',
        )}
      >
        {track}
        {!live && (
          <input
            id={id}
            type="range"
            min={0}
            max={Math.max(0, duration)}
            step={1}
            value={Math.floor(safe)}
            disabled={!seekable}
            aria-label={label}
            aria-valuetext={`${spokenMediaTime(safe)} von ${spokenMediaTime(duration)}`}
            onChange={(e) => onSeek?.(Number(e.currentTarget.value))}
            onKeyDown={(e) => {
              const jump = {
                ArrowRight: step,
                ArrowUp: step,
                ArrowLeft: -step,
                ArrowDown: -step,
                PageUp: step * 6,
                PageDown: -step * 6,
              }[e.key]
              if (jump == null || !seekable) return
              e.preventDefault()
              onSeek?.(Math.min(Math.max(0, safe + jump), duration))
            }}
            className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0 disabled:cursor-default"
          />
        )}
      </div>
      <span className="min-w-10">
        {live ? (
          <span className="font-semibold text-foreground">{liveLabel}</span>
        ) : (
          <span aria-hidden>{formatMediaTime(duration)}</span>
        )}
      </span>
    </div>
  )
}

/** Rechte Zone: Zusatzaktionen (Lautstärke, Queue, Vollbild). */
function MediaBarActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="media-bar-actions"
      className={cn(
        'col-span-2 row-start-2 flex items-center justify-end gap-1 @2xl/media-bar:col-span-1 @2xl/media-bar:row-start-auto',
        className,
      )}
      {...props}
    />
  )
}

export {
  MediaBar,
  MediaBarInfo,
  MediaBarArtwork,
  MediaBarMeta,
  MediaBarTransport,
  MediaBarTimeline,
  MediaBarActions,
  mediaBarVariants,
  formatMediaTime,
  spokenMediaTime,
  type MediaBarProps,
  type MediaBarArtworkProps,
  type MediaBarMetaProps,
  type MediaBarTransportProps,
  type MediaBarTimelineProps,
}
