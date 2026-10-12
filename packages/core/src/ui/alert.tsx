'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { CircleCheckIcon, InfoIcon, OctagonXIcon, TriangleAlertIcon, XIcon, type LucideIcon } from 'lucide-react'

import { toneText, type Tone } from '../lib/tone'
import { cn } from '../lib/utils'

const alertVariants = cva(
  'relative flex w-full items-start gap-3 rounded-[var(--brand-radius)] border px-4 py-3 text-sm text-foreground [&_[data-slot=alert-icon]]:mt-0.5 [&_[data-slot=alert-icon]]:size-4 [&_[data-slot=alert-icon]]:shrink-0',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-card',
        info: 'border-info/40 bg-info/10',
        success: 'border-success/40 bg-success/10',
        warning: 'border-warning/50 bg-warning/10',
        danger: 'border-destructive/50 bg-destructive/10',
      },
      size: {
        default: '',
        sm: 'gap-2 px-3 py-2 text-xs',
      },
    },
    defaultVariants: {
      tone: 'info',
      size: 'default',
    },
  },
)

/** Teilmenge der gemeinsamen Tonrollen aus `lib/tone`. */
type AlertTone = Extract<Tone, 'neutral' | 'info' | 'success' | 'warning' | 'danger'>

const DEFAULT_ICONS: Record<AlertTone, LucideIcon> = {
  neutral: InfoIcon,
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  danger: OctagonXIcon,
}

interface AlertProps extends Omit<React.ComponentProps<'div'>, 'role'>, VariantProps<typeof alertVariants> {
  /**
   * Live-Region-Rolle. Standard: `alert` für `danger`, sonst `status`.
   * `none` für statische Hinweise, die nicht angesagt werden sollen.
   */
  role?: 'status' | 'alert' | 'none'
  /** Eigenes Icon; `null` blendet das Icon aus. Standard: Icon passend zum Ton. */
  icon?: React.ReactNode | null
  /** Zeigt einen Schliessen-Knopf (44×44 px Touch-Ziel). */
  dismissible?: boolean
  /** Beschriftung des Schliessen-Knopfs. Standard «Meldung schliessen». */
  dismissLabel?: string
  /** Wird beim Schliessen und nach `autoHideMs` aufgerufen. */
  onDismiss?: () => void
  /**
   * Blendet nach dieser Zeit aus. Pausiert, solange Zeiger oder Fokus im
   * Hinweis sind, und beginnt danach von vorn (WCAG 2.2.1). Nicht für `danger`.
   */
  autoHideMs?: number
  /** Kontrollierte Sichtbarkeit. Ohne Angabe verwaltet der Alert sie selbst. */
  open?: boolean
}

/**
 * Hinweis- oder Statusbanner im Seitenfluss (keine Toast-Überlagerung).
 * Komposition: `Alert` › `AlertTitle`, `AlertDescription`, `AlertActions`.
 */
function Alert({
  className,
  tone = 'info',
  size = 'default',
  role,
  icon,
  dismissible = false,
  dismissLabel = 'Meldung schliessen',
  onDismiss,
  autoHideMs,
  open: openProp,
  children,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props
}: AlertProps) {
  const resolvedTone: AlertTone = tone ?? 'info'
  const [openState, setOpenState] = React.useState(true)
  const open = openProp ?? openState
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const paused = hovered || focused

  const onDismissRef = React.useRef(onDismiss)
  React.useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  const dismiss = React.useCallback(() => {
    setOpenState(false)
    onDismissRef.current?.()
  }, [])

  React.useEffect(() => {
    if (!open || paused || !autoHideMs || autoHideMs <= 0) return
    const id = window.setTimeout(dismiss, autoHideMs)
    return () => window.clearTimeout(id)
  }, [open, paused, autoHideMs, dismiss])

  if (!open) return null

  const resolvedRole = role ?? (resolvedTone === 'danger' ? 'alert' : 'status')
  const DefaultIcon = DEFAULT_ICONS[resolvedTone]
  const iconNode =
    icon === null ? null : (
      <span data-slot="alert-icon" aria-hidden="true" className={cn('inline-flex [&>svg]:size-full', toneText[resolvedTone])}>
        {icon ?? <DefaultIcon aria-hidden />}
      </span>
    )

  return (
    <div
      data-slot="alert"
      data-variant={resolvedTone}
      data-size={size}
      role={resolvedRole === 'none' ? undefined : resolvedRole}
      className={cn(alertVariants({ tone: resolvedTone, size }), className)}
      onMouseEnter={(e) => {
        setHovered(true)
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        setHovered(false)
        onMouseLeave?.(e)
      }}
      onFocus={(e) => {
        setFocused(true)
        onFocus?.(e)
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
        onBlur?.(e)
      }}
      {...props}
    >
      {iconNode}
      <div data-slot="alert-body" className="grid min-w-0 flex-1 gap-1">
        {children}
      </div>
      {dismissible && (
        <button
          type="button"
          data-slot="alert-dismiss"
          onClick={dismiss}
          aria-label={dismissLabel}
          className="-my-2.5 -mr-2.5 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:transition-colors"
        >
          <XIcon className="size-4" aria-hidden />
        </button>
      )}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="alert-title" className={cn('font-semibold leading-snug', className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('text-muted-foreground [&_a]:underline [&_a]:underline-offset-2 [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
}

function AlertActions({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-actions" className={cn('mt-2 flex flex-wrap items-center gap-2', className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription, AlertActions, alertVariants }
export type { AlertProps, AlertTone }
