'use client'

import * as React from 'react'
import { cva } from 'class-variance-authority'
import { Loader2, Pause, Play } from 'lucide-react'

import { focusRing, focusRingOnMedia } from '../lib/focus'
import { cn } from '../lib/utils'
import { Announcer } from './announcer'

type PlayButtonState = 'idle' | 'loading' | 'playing' | 'paused'
type PlayButtonSize = 'sm' | 'md' | 'lg' | 'xl'
type PlayButtonMaterial = 'glass' | 'solid'

const playButtonVariants = cva(
  [
    'group/play-button relative inline-flex shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full select-none',
    focusRing,
    'disabled:cursor-not-allowed disabled:opacity-50 data-[state=loading]:cursor-progress',
    // Bewegung nur ohne «Bewegung reduzieren».
    'motion-safe:transition-[scale,background-color,box-shadow,opacity] motion-safe:duration-(--duration-normal) motion-safe:enabled:hover:scale-105 motion-safe:enabled:active:scale-95',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      material: {
        // Milchglas: Unschärfe nur wo unterstützt, sonst dichte, deckende Tönung.
        // Liegt meist auf Bildern: Fokus mit Kontrastrand (`focusRingOnMedia`).
        glass: [
          focusRingOnMedia,
          'border border-foreground/15 bg-background/85 text-foreground shadow-lg',
          'supports-[backdrop-filter]:bg-background/45 supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:backdrop-saturate-150',
          'enabled:hover:bg-background/90 supports-[backdrop-filter]:enabled:hover:bg-background/60',
        ],
        solid: 'bg-primary text-primary-foreground shadow-md enabled:hover:bg-primary-hover enabled:hover:text-primary-hover-foreground',
      },
      size: {
        // sm liegt unter 44 px: Trefferfläche wird über ein Pseudo-Element erweitert.
        sm: "size-9 after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] [&_svg]:size-4",
        md: 'size-11 [&_svg]:size-[18px]',
        lg: 'size-16 [&_svg]:size-6',
        xl: 'size-28 [&_svg]:size-10',
      },
    },
    defaultVariants: {
      material: 'glass',
      size: 'md',
    },
  },
)

/** Optischer Ausgleich: das Play-Dreieck wirkt sonst nach links versetzt. */
const PLAY_NUDGE: Record<PlayButtonSize, string> = {
  sm: 'ml-px',
  md: 'ml-0.5',
  lg: 'ml-1',
  xl: 'ml-1.5',
}

const DEFAULT_STATUS: Record<PlayButtonState, string> = {
  idle: '',
  loading: 'Wird geladen',
  playing: 'Wiedergabe läuft',
  paused: 'Pausiert',
}

type PlayButtonProps = Omit<
  React.ComponentProps<'button'>,
  'aria-label' | 'aria-pressed' | 'type'
> & {
  /** Wiedergabezustand. `loading` zeigt einen Spinner und ignoriert Klicks. */
  state?: PlayButtonState
  /**
   * Pflicht: fester zugänglicher Name, z. B. «Morgenjournal abspielen».
   * Der Zustand läuft über `aria-pressed`, nicht über den Namen.
   */
  label: string
  size?: PlayButtonSize
  material?: PlayButtonMaterial
  /** Wird bei `idle` und `paused` aufgerufen. */
  onPlay?: () => void
  /** Wird bei `playing` aufgerufen. */
  onPause?: () => void
  /**
   * Zustandswechsel über einen `Announcer` (höfliche Live-Region) ansagen.
   * Standard: an. Der Stand beim Einhängen bleibt still, kurze Zwischen-
   * zustände (laden → spielen) werden entprellt. Bei vielen Knöpfen auf einer
   * Seite `announce={false}` und einen seitenweiten `Announcer` verwenden.
   */
  announce?: boolean
  /** Texte der Live-Region; deutsche Defaults, pro Zustand überschreibbar. */
  statusLabels?: Partial<Record<PlayButtonState, string>>
  /** Zusatzklassen am Symbol. */
  iconClassName?: string
  /** Ebenen unter dem Symbol, z. B. ein Cover oder Porträt (dekorativ). */
  children?: React.ReactNode
}

function PlayButton({
  state = 'idle',
  label,
  size = 'md',
  material = 'glass',
  onPlay,
  onPause,
  onClick,
  announce = true,
  statusLabels,
  iconClassName,
  className,
  children,
  ...props
}: PlayButtonProps) {
  const loading = state === 'loading'
  const active = state === 'playing' || state === 'loading'
  const status = { ...DEFAULT_STATUS, ...statusLabels }[state]

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || loading) return
    if (state === 'playing') onPause?.()
    else onPlay?.()
  }

  return (
    <>
      <button
        type="button"
        data-slot="play-button"
        data-state={state}
        data-size={size}
        data-material={material}
        aria-label={label}
        aria-pressed={active}
        aria-busy={loading || undefined}
        className={cn(playButtonVariants({ material, size }), className)}
        onClick={handleClick}
        {...props}
      >
        {children ? (
          <span
            aria-hidden="true"
            data-slot="play-button-layer"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          >
            {children}
          </span>
        ) : null}
        <span
          aria-hidden="true"
          data-slot="play-button-icon"
          className={cn('relative flex drop-shadow-sm', iconClassName)}
        >
          {loading ? (
            <Loader2 className="motion-safe:animate-spin" />
          ) : state === 'playing' ? (
            <Pause className="fill-current" />
          ) : (
            <Play className={cn('fill-current', PLAY_NUDGE[size])} />
          )}
        </span>
      </button>
      {announce ? <Announcer data-slot="play-button-status" message={status} settleMs={400} /> : null}
    </>
  )
}

export { PlayButton, playButtonVariants }
export type { PlayButtonProps, PlayButtonState, PlayButtonSize, PlayButtonMaterial }
