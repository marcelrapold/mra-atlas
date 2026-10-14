'use client'

import * as React from 'react'
import { TriangleAlert } from 'lucide-react'

import { cn } from '../lib/utils'
import { Button } from './button'
import { EmptyState } from './empty-state'

interface ErrorBoundaryFallbackProps {
  error: Error
  /** Clear the error and render the children again. */
  reset: () => void
  scope?: string
}

interface ErrorBoundaryLabels {
  title: string
  description: string
  retry: string
}

const defaultErrorBoundaryLabels: ErrorBoundaryLabels = {
  title: 'Etwas ist schiefgelaufen',
  description: 'Dieser Bereich konnte nicht angezeigt werden. Versuchen Sie es erneut.',
  retry: 'Erneut versuchen',
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  /** Identifier of the guarded area (view name), passed to onError and fallback. */
  scope?: string
  /** Logging or telemetry hook. Atlas reports nothing by itself. */
  onError?: (error: Error, info: React.ErrorInfo, scope?: string) => void
  /** When this value changes (e.g. the route), a shown error resets. */
  resetKey?: unknown
  /** Called after reset, e.g. to refetch data before children render again. */
  onReset?: () => void
  /** Custom fallback: a node, or a render function receiving error and reset. */
  fallback?: React.ReactNode | ((props: ErrorBoundaryFallbackProps) => React.ReactNode)
  /** Override the German default texts of the built-in fallback. */
  labels?: Partial<ErrorBoundaryLabels>
  /** Show error.message in the built-in fallback (use in development only). */
  showDetails?: boolean
  className?: string
}

interface ErrorBoundaryState {
  error: Error | null
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value))
}

function ErrorBoundaryFallback({
  error,
  reset,
  labels: labelOverrides,
  showDetails,
  className,
}: ErrorBoundaryFallbackProps & {
  labels?: Partial<ErrorBoundaryLabels>
  showDetails?: boolean
  className?: string
}) {
  const labels = { ...defaultErrorBoundaryLabels, ...labelOverrides }
  return (
    <div role="alert" data-slot="error-boundary" className={cn('w-full', className)}>
      <EmptyState
        icon={TriangleAlert}
        title={labels.title}
        description={labels.description}
        actions={
          <div className="flex flex-col items-center gap-3">
            {showDetails && error.message ? (
              <pre className="max-w-full overflow-auto rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
                {error.message}
              </pre>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={reset}
              className="pointer-coarse:h-11"
            >
              {labels.retry}
            </Button>
          </div>
        }
      />
    </div>
  )
}

/**
 * Catches render and lifecycle errors below it and shows a recoverable
 * fallback. Errors in event handlers and promises are not caught by React
 * error boundaries; handle those where they occur.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: toError(error) }
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo) {
    this.props.onError?.(toError(error), info, this.props.scope)
  }

  override componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.error && !Object.is(prevProps.resetKey, this.props.resetKey)) {
      this.reset()
    }
  }

  reset = () => {
    this.setState({ error: null })
    this.props.onReset?.()
  }

  override render() {
    const { error } = this.state
    if (!error) return this.props.children

    const { fallback, scope, labels, showDetails, className } = this.props
    if (typeof fallback === 'function') return fallback({ error, reset: this.reset, scope })
    if (fallback !== undefined) return fallback

    return (
      <ErrorBoundaryFallback
        error={error}
        reset={this.reset}
        scope={scope}
        labels={labels}
        showDetails={showDetails}
        className={className}
      />
    )
  }
}

export { ErrorBoundary, ErrorBoundaryFallback, defaultErrorBoundaryLabels }
export type { ErrorBoundaryProps, ErrorBoundaryFallbackProps, ErrorBoundaryLabels }
