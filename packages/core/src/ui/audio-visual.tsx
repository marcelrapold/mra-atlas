'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { usePrefersReducedMotion } from '../lib/hooks'
import { cn } from '../lib/utils'

/*
 * Audio-Visualisierungen als datengetriebenes SVG.
 *
 * Core kennt kein Web Audio: Die App liefert Werte (0..1) aus einem
 * Analyser, einer vorberechneten Wellenform oder synthetisch. Farben kommen
 * ausschliesslich aus `currentColor` bzw. semantischen Tokens. Bei
 * «Bewegung reduzieren» zeigen live-Visualisierungen eine stehende Hüllkurve.
 */

const clamp01 = (v: number) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0)

/**
 * Stehende Hüllkurve (Sinus-Bogen mit Welle) für Pause und reduzierte
 * Bewegung. Rein und deterministisch.
 */
function staticEnvelope(count: number, cycles = 2): number[] {
  const n = Math.max(1, Math.floor(count))
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1)
    const env = Math.sin(t * Math.PI)
    const wave = (Math.sin(t * Math.PI * 2 * cycles) + 1) / 2
    return Math.max(0.18, env * 0.4 + wave * 0.6)
  })
}

/** Bringt `values` auf `count` Werte (Mittelwert je Fenster bzw. Wiederholung). */
function resample(values: readonly number[], count?: number): number[] {
  if (!count || count === values.length || values.length === 0) return values.map(clamp01)
  const out: number[] = []
  const ratio = values.length / count
  for (let i = 0; i < count; i += 1) {
    const start = Math.floor(i * ratio)
    const end = Math.max(start + 1, Math.floor((i + 1) * ratio))
    let sum = 0
    for (let j = start; j < end; j += 1) sum += values[Math.min(j, values.length - 1)]
    out.push(clamp01(sum / (end - start)))
  }
  return out
}

function a11yProps(label?: string) {
  return label ? ({ role: 'img', 'aria-label': label } as const) : ({ 'aria-hidden': true } as const)
}

const visualToneVariants = cva('', {
  variants: {
    tone: {
      current: 'text-current',
      primary: 'text-primary',
      muted: 'text-muted-foreground',
      'chart-1': 'text-chart-1',
      'chart-2': 'text-chart-2',
      'chart-3': 'text-chart-3',
      'chart-4': 'text-chart-4',
      'chart-5': 'text-chart-5',
    },
  },
  defaultVariants: { tone: 'primary' },
})

type VisualTone = NonNullable<VariantProps<typeof visualToneVariants>['tone']>

/* -------------------------------------------------------------------------- */
/* BarWaveform                                                                */
/* -------------------------------------------------------------------------- */

interface BarWaveformProps
  extends Omit<React.ComponentProps<'svg'>, 'values'>, VariantProps<typeof visualToneVariants> {
  /** Balkenhöhen 0..1. */
  values: readonly number[]
  /** Anzahl Balken; ohne Angabe eine pro Wert. */
  barCount?: number
  /** 0..1: Anteil, der als «gespielt» in `tone` erscheint, der Rest gedämpft. */
  progress?: number
  /** Wohin die Balken wachsen: aus der Mitte oder vom Boden. */
  anchor?: 'center' | 'bottom'
  /** Werte ändern sich laufend (Analyser). Bei reduzierter Bewegung steht dann die Hüllkurve. */
  live?: boolean
  /** Barrierefreier Name. Ohne Label ist die Grafik dekorativ (aria-hidden). */
  label?: string
}

function BarWaveform({
  values,
  barCount,
  progress,
  anchor = 'center',
  live = false,
  label,
  tone = 'primary',
  className,
  ...props
}: BarWaveformProps) {
  const reduced = usePrefersReducedMotion()
  const count = barCount ?? Math.max(1, values.length)
  const bars = live && reduced ? staticEnvelope(count) : resample(values.length ? values : staticEnvelope(count), count)
  const unit = 10
  const barWidth = 6
  const width = bars.length * unit
  const height = 100
  const played = progress == null ? bars.length : Math.round(clamp01(progress) * bars.length)

  const rect = (h: number, i: number) => {
    const barHeight = Math.max(4, h * height)
    const y = anchor === 'center' ? (height - barHeight) / 2 : height - barHeight
    return (
      <rect key={i} x={i * unit + (unit - barWidth) / 2} y={y} width={barWidth} height={barHeight} rx={barWidth / 2} />
    )
  }

  return (
    <svg
      data-slot="bar-waveform"
      data-anchor={anchor}
      data-live={live || undefined}
      data-still={live && reduced ? '' : undefined}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      focusable="false"
      className={cn('block h-8 w-full overflow-visible', visualToneVariants({ tone }), className)}
      {...a11yProps(label)}
      {...props}
    >
      <g className="fill-current">{bars.slice(0, played).map((h, i) => rect(h, i))}</g>
      {played < bars.length && (
        <g className="fill-current opacity-30">{bars.slice(played).map((h, i) => rect(h, i + played))}</g>
      )}
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/* RadialBars                                                                 */
/* -------------------------------------------------------------------------- */

interface RadialBarsProps extends Omit<React.ComponentProps<'svg'>, 'values'>, VariantProps<typeof visualToneVariants> {
  /** Balkenlängen 0..1, im Uhrzeigersinn ab 12 Uhr. */
  values: readonly number[]
  barCount?: number
  /** Kantenlänge des Quadrats in px. */
  size?: number
  /** Abstand des Balkenfusses vom Zentrum in px. */
  innerRadius?: number
  /** 0..1: skaliert Länge und Deckkraft (1 = volle Länge). */
  strength?: number
  strokeWidth?: number
  live?: boolean
  label?: string
}

/** Endpunkte der Linie `i` von `count` für Höhe `h` (0..1). Rein. */
function radialBarGeometry(
  i: number,
  count: number,
  h: number,
  g: { cx: number; cy: number; innerRadius: number; maxLength: number; strength: number },
) {
  const angle = (i / count) * Math.PI * 2 - Math.PI / 2
  const length = g.innerRadius + Math.max(0.05, h) * g.maxLength * g.strength
  return {
    x1: g.cx + Math.cos(angle) * g.innerRadius,
    y1: g.cy + Math.sin(angle) * g.innerRadius,
    x2: g.cx + Math.cos(angle) * length,
    y2: g.cy + Math.sin(angle) * length,
    opacity: (0.55 + h * 0.35) * (0.4 + 0.6 * g.strength),
  }
}

function RadialBars({
  values,
  barCount = 36,
  size = 88,
  innerRadius = 24,
  strength = 1,
  strokeWidth = 2,
  live = false,
  label,
  tone = 'primary',
  className,
  style,
  ...props
}: RadialBarsProps) {
  const reduced = usePrefersReducedMotion()
  const bars =
    live && reduced
      ? staticEnvelope(barCount, 3)
      : resample(values.length ? values : staticEnvelope(barCount, 3), barCount)
  const c = size / 2
  const geometry = {
    cx: c,
    cy: c,
    innerRadius,
    maxLength: Math.max(0, c - innerRadius - strokeWidth),
    strength: clamp01(strength),
  }
  return (
    <svg
      data-slot="radial-bars"
      data-still={live && reduced ? '' : undefined}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      focusable="false"
      className={cn('block shrink-0', visualToneVariants({ tone }), className)}
      style={style}
      {...a11yProps(label)}
      {...props}
    >
      <g className="stroke-current" strokeWidth={strokeWidth} strokeLinecap="round">
        {bars.map((h, i) => {
          const { opacity, ...line } = radialBarGeometry(i, bars.length, h, geometry)
          return <line key={i} {...line} strokeOpacity={opacity} />
        })}
      </g>
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/* ActivityRing                                                               */
/* -------------------------------------------------------------------------- */

type ActivityMode = 'speech' | 'music' | 'off'

/** Kranzgeometrie für ein rundes Element mit Durchmesser `d` px. Rein. */
function activityRingGeometry(d: number) {
  const small = d < 32
  const spread = Math.round(d * (small ? 0.3 : 0.45) + 2)
  return {
    size: d + 2 * spread,
    innerRadius: Math.round(d / 2 + Math.max(2, d * 0.04)),
    barCount: small ? 24 : 36,
    spread,
  }
}

interface ActivityRingProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /** speech: volle Balken in `tone` mit Schein · music: dezent, halbe Länge · off: ausgeblendet. */
  mode: ActivityMode
  /** Durchmesser des umringten Elements in px. */
  diameter?: number
  /** Balkenwerte 0..1; ohne Angabe die stehende Hüllkurve. */
  values?: readonly number[]
  /** 0..1, steuert den Schein (nur speech). */
  intensity?: number
  /** Farbton im Modus speech. */
  tone?: VisualTone
  /** Farbton im Modus music. */
  musicTone?: VisualTone
  /** Barrierefreier Name, z. B. «Moderation spricht». Ohne Label dekorativ. */
  label?: string
  /** Das umringte Element (Avatar, Play-Knopf). */
  children?: React.ReactNode
}

function ActivityRing({
  mode,
  diameter = 44,
  values,
  intensity,
  tone = 'primary',
  musicTone = 'muted',
  label,
  className,
  style,
  children,
  ...props
}: ActivityRingProps) {
  const reduced = usePrefersReducedMotion()
  const geo = activityRingGeometry(diameter)
  const speech = mode === 'speech'
  const level = reduced || intensity == null ? 0.4 : clamp01(intensity)
  const glow = speech ? 0.25 + level * 0.5 : 0

  return (
    <span
      data-slot="activity-ring"
      data-activity={mode}
      data-still={reduced ? '' : undefined}
      className={cn('relative inline-grid shrink-0 place-items-center rounded-full', className)}
      style={{ width: diameter, height: diameter, ...style }}
      {...props}
    >
      <span
        {...(label && mode !== 'off' ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
        className={cn(
          'pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 motion-safe:transition-opacity motion-safe:duration-500',
          mode === 'off' ? 'opacity-0' : 'opacity-100',
        )}
        style={{ width: geo.size, height: geo.size }}
      >
        <RadialBars
          values={values ?? []}
          live={values != null}
          size={geo.size}
          innerRadius={geo.innerRadius}
          barCount={geo.barCount}
          strength={speech ? 1 : 0.45}
          tone={speech ? tone : musicTone}
        />
        <span
          className={cn(
            'absolute rounded-full bg-current motion-safe:transition-opacity motion-safe:duration-300',
            visualToneVariants({ tone }),
          )}
          style={{
            inset: geo.spread - 2,
            opacity: glow * 0.35,
            filter: `blur(${4 + level * 10}px)`,
          }}
        />
      </span>
      {children != null && (
        <span className="relative z-10 grid size-full place-items-center rounded-full">{children}</span>
      )}
    </span>
  )
}

export {
  BarWaveform,
  RadialBars,
  ActivityRing,
  activityRingGeometry,
  radialBarGeometry,
  staticEnvelope,
  visualToneVariants,
  type ActivityMode,
  type BarWaveformProps,
  type RadialBarsProps,
  type ActivityRingProps,
  type VisualTone,
}
