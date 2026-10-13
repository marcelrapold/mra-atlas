'use client'

import * as React from 'react'
import { cva } from 'class-variance-authority'
import { ArrowDownIcon } from 'lucide-react'

import { usePrefersReducedMotion } from '../lib/hooks'
import { cn } from '../lib/utils'

type LogLevel = 'debug' | 'info' | 'success' | 'warning' | 'error'

interface LogLine {
  /** Stabile ID (Sequenznummer). Empfohlen: sonst zählt «neu» nur die Längendifferenz. */
  id?: string | number
  /** Zeitpunkt: `Date`, ISO-String oder bereits formatierter Text. */
  time?: Date | string | number
  /** Quelle/Dienst, z. B. `api`, `worker`, `export`. */
  source?: string
  message: React.ReactNode
  level?: LogLevel
}

interface LogViewLabels {
  /** Zugänglicher Name des Logs. */
  log: string
  /** Text, wenn keine Zeilen vorhanden sind. */
  empty: string
  /** Knopf «zurück zu den neuesten», ohne neue Zeilen. */
  jumpToLatest: string
  /** Knopf mit Anzahl neuer Zeilen während der Pause. */
  newLines: (count: number) => string
  /** Kurzbezeichnung der Stufen (sichtbar als Tag). */
  levels: Record<LogLevel, string>
}

const DEFAULT_LABELS: LogViewLabels = {
  log: 'Protokoll, neueste Einträge unten',
  empty: 'Noch keine Einträge.',
  jumpToLatest: 'Zu den neuesten Einträgen',
  newLines: (n) => (n === 1 ? '1 neuer Eintrag' : `${n} neue Einträge`),
  levels: { debug: 'debug', info: 'info', success: 'ok', warning: 'warn', error: 'error' },
}

const logLevelVariants = cva(
  'inline-flex shrink-0 items-center rounded-sm px-1 text-[0.85em] leading-[1.4] font-semibold uppercase',
  {
    variants: {
      level: {
        debug: 'text-muted-foreground',
        info: 'text-muted-foreground',
        success: 'bg-success text-success-foreground',
        warning: 'bg-warning text-warning-foreground',
        error: 'bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: { level: 'info' },
  },
)

const logMessageVariants = cva('min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere]', {
  variants: {
    level: {
      debug: 'text-muted-foreground',
      info: 'text-foreground',
      success: 'text-foreground',
      warning: 'text-foreground',
      error: 'font-medium text-destructive',
    },
  },
  defaultVariants: { level: 'info' },
})

const TIME_FORMAT =
  typeof Intl !== 'undefined'
    ? new Intl.DateTimeFormat('de-CH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    : null

function toDate(value: LogLine['time']): Date | null {
  if (value === undefined || value === null || value === '') return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'number') return new Date(value)
  // Nur ISO-artige Strings parsen; bereits formatierter Text bleibt Text.
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function defaultFormatTime(value: LogLine['time']): string {
  const d = toDate(value)
  if (!d) return value === undefined || value === null ? '' : String(value)
  return TIME_FORMAT ? TIME_FORMAT.format(d) : d.toISOString().slice(11, 19)
}

interface LogViewProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  lines: LogLine[]
  /** Höchstens so viele Zeilen im DOM (die neuesten). Standard 500. */
  maxLines?: number
  /** Automatisch zur neuesten Zeile folgen. Hochscrollen pausiert, der Knopf setzt fort. Standard `true`. */
  follow?: boolean
  /**
   * Ansage neuer Zeilen. Standard `off`: ein laufendes Log würde Screenreader
   * überfluten. `polite` nur für seltene, wichtige Zeilen.
   */
  live?: 'off' | 'polite'
  /** Zeit formatieren. Standard: `HH:MM:SS` (de-CH), Text bleibt Text. */
  formatTime?: (time: LogLine['time']) => string
  /** Zusätzliche Klassen je Quelle, z. B. `(s) => s === 'api' ? 'text-chart-1' : ''`. */
  sourceClassName?: (source: string) => string | undefined
  /** Stufen-Tag zeigen (für `success`, `warning`, `error`). Standard `true`. */
  showLevel?: boolean
  /** Überschreibbare Texte (Standard Deutsch, Schweizer Schreibweise). */
  labels?: Partial<LogViewLabels>
  /** Klassen für den scrollbaren Bereich (Höhe hier steuern). Standard `h-72`. */
  viewportClassName?: string
}

/**
 * Monospace-Protokoll mit Zeit, Quelle, Stufe und Meldung. Folgt neuen Zeilen,
 * pausiert beim Hochscrollen und zeigt dann «n neue Einträge».
 * `role="log"`, Ansage standardmässig aus; per Tastatur scrollbar.
 */
function LogView({
  lines,
  maxLines = 500,
  follow = true,
  live = 'off',
  formatTime = defaultFormatTime,
  sourceClassName,
  showLevel = true,
  labels: labelsProp,
  viewportClassName,
  className,
  ...props
}: LogViewProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp, levels: { ...DEFAULT_LABELS.levels, ...labelsProp?.levels } }
  const reducedMotion = usePrefersReducedMotion()
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const pausedRef = React.useRef(false)
  const [paused, setPaused] = React.useState(false)
  const [unseen, setUnseen] = React.useState(0)

  const shown = React.useMemo(() => (maxLines > 0 ? lines.slice(-maxLines) : lines), [lines, maxLines])

  // Neue Zeilen während der Pause zählen.
  const prevRef = React.useRef<{ lastId: LogLine['id']; length: number }>({ lastId: undefined, length: 0 })
  React.useEffect(() => {
    const prev = prevRef.current
    const last = lines[lines.length - 1]
    prevRef.current = { lastId: last?.id, length: lines.length }
    if (!pausedRef.current || lines.length === 0) return
    let added = 0
    if (prev.lastId !== undefined && last?.id !== undefined) {
      if (prev.lastId === last.id) return
      const idx = lines.findIndex((l) => l.id === prev.lastId)
      added = idx === -1 ? lines.length : lines.length - 1 - idx
    } else {
      added = Math.max(0, lines.length - prev.length)
    }
    if (added > 0) setUnseen((n) => n + added)
  }, [lines])

  // Folgen: neueste Zeile unten, solange niemand hochgescrollt hat.
  React.useLayoutEffect(() => {
    const el = viewportRef.current
    if (el && follow && !pausedRef.current) el.scrollTop = el.scrollHeight
  }, [shown, follow])

  const onScroll = () => {
    const el = viewportRef.current
    if (!el || !follow) return
    const atEnd = el.scrollHeight - el.scrollTop - el.clientHeight < 24
    if (pausedRef.current === !atEnd) return
    pausedRef.current = !atEnd
    setPaused(!atEnd)
    if (atEnd) setUnseen(0)
  }

  const toEnd = () => {
    pausedRef.current = false
    setPaused(false)
    setUnseen(0)
    const el = viewportRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <div
      data-slot="log-view"
      data-following={follow && !paused ? '' : undefined}
      className={cn(
        'relative flex min-h-0 flex-col overflow-hidden rounded-[var(--brand-radius)] border border-border bg-card font-mono text-xs leading-relaxed',
        className,
      )}
      {...props}
    >
      <div
        ref={viewportRef}
        data-slot="log-view-viewport"
        role="log"
        aria-live={live}
        aria-label={labels.log}
        tabIndex={0}
        onScroll={onScroll}
        className={cn(
          'h-72 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
          viewportClassName,
        )}
      >
        {shown.length === 0 ? (
          <p data-slot="log-view-empty" className="py-2 text-muted-foreground">
            {labels.empty}
          </p>
        ) : (
          <ol className="m-0 list-none p-0">
            {shown.map((line, i) => {
              const level = line.level ?? 'info'
              const time = formatTime(line.time)
              const date = toDate(line.time)
              const tag = showLevel && (level === 'success' || level === 'warning' || level === 'error')
              return (
                <li
                  key={line.id ?? `${lines.length - shown.length + i}`}
                  data-slot="log-view-line"
                  data-level={level}
                  className="flex flex-wrap items-baseline gap-x-3 py-px sm:flex-nowrap"
                >
                  {time && (
                    <time
                      dateTime={date ? date.toISOString() : undefined}
                      className="shrink-0 tabular-nums text-muted-foreground"
                    >
                      {time}
                    </time>
                  )}
                  {line.source && (
                    <span
                      title={line.source}
                      className={cn(
                        'w-[12ch] shrink-0 truncate text-muted-foreground',
                        sourceClassName?.(line.source),
                      )}
                    >
                      {line.source}
                    </span>
                  )}
                  <span className="flex min-w-0 basis-full items-baseline gap-2 sm:basis-auto">
                    {tag ? (
                      <span className={logLevelVariants({ level })}>{labels.levels[level]}</span>
                    ) : level === 'debug' || level === 'error' ? (
                      <span className="sr-only">{labels.levels[level]}: </span>
                    ) : null}
                    <span className={logMessageVariants({ level })}>{line.message}</span>
                  </span>
                </li>
              )
            })}
          </ol>
        )}
      </div>
      {follow && paused && (
        <button
          type="button"
          data-slot="log-view-resume"
          onClick={toEnd}
          className="absolute right-3 bottom-2 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-popover px-3 font-sans text-xs font-medium text-popover-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowDownIcon className="size-3.5" aria-hidden />
          {unseen > 0 ? labels.newLines(unseen) : labels.jumpToLatest}
        </button>
      )}
    </div>
  )
}

export { LogView, logLevelVariants }
export type { LogViewProps, LogLine, LogLevel, LogViewLabels }
