'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/utils'
import { Label, type LabelProps } from './label'
import { Separator } from './separator'
import { uniqueFieldErrors, type FieldErrorItem } from '../lib/field-errors'

/*
 * Formular-Anatomie: Field verbindet Beschriftung, Beschreibung, Fehler und
 * Eingabe ohne Handverdrahtung. Field erzeugt per useId() eine Control-ID;
 * FieldDescription und FieldError melden sich an, sobald sie im DOM stehen.
 * Controls (Input, Textarea oder eigene über useFieldControl) erhalten so
 * id, aria-describedby und aria-invalid. Explizite Props gewinnen immer.
 */

type FieldPart = 'description' | 'error'

type FieldContextValue = {
  /** ID des Controls: explizit gesetzte ID des Controls oder die generierte. */
  controlId: string
  /** Generierte ID, falls das Control keine eigene mitbringt. */
  generatedId: string
  /** IDs der gerenderten Beschreibungen und Fehler, in dieser Reihenfolge. */
  describedBy?: string
  invalid: boolean
  register: (part: FieldPart, id: string) => () => void
  registerControlId: (id: string) => () => void
}

const FieldContext = React.createContext<FieldContextValue | null>(null)

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect

/** Meldet eine ID beim umgebenden Field an, solange `active` gilt. */
function useFieldPart(part: FieldPart, id: string, active: boolean) {
  const register = React.useContext(FieldContext)?.register
  useIsomorphicLayoutEffect(() => (active && register ? register(part, id) : undefined), [register, part, id, active])
}

type FieldControlProps = {
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: React.AriaAttributes['aria-invalid']
}

/**
 * Verdrahtet ein Control mit dem umgebenden `Field`: liefert `id`,
 * `aria-describedby` (gerenderte FieldDescription/FieldError) und
 * `aria-invalid`. Explizit übergebene Props gewinnen. Ausserhalb eines
 * Field werden die Props unverändert zurückgegeben.
 *
 * @param props  Die Props des Controls (mindestens id/aria-describedby/aria-invalid).
 * @returns Die Props, ergänzt um die Field-Verdrahtung.
 */
function useFieldControl<P extends FieldControlProps>(props: P): P {
  const field = React.useContext(FieldContext)
  const explicitId = props.id
  const registerControlId = field?.registerControlId
  useIsomorphicLayoutEffect(
    () => (explicitId && registerControlId ? registerControlId(explicitId) : undefined),
    [explicitId, registerControlId],
  )
  if (!field) return props
  return {
    ...props,
    id: explicitId ?? field.generatedId,
    'aria-describedby': props['aria-describedby'] ?? field.describedBy,
    'aria-invalid': props['aria-invalid'] ?? (field.invalid || undefined),
  }
}

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        'm-0 flex min-w-0 flex-col gap-6 border-0 p-0 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
        className,
      )}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: React.ComponentProps<'legend'> & { variant?: 'legend' | 'label' }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn('mb-3 p-0 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base', className)}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        'group/field-group @container/field-group flex w-full flex-col gap-6 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4',
        className,
      )}
      {...props}
    />
  )
}

const fieldVariants = cva('group/field flex w-full gap-2', {
  variants: {
    orientation: {
      vertical: 'flex-col [&>*]:w-full [&>.sr-only]:w-auto',
      horizontal:
        'flex-row items-center [&>[data-slot=field-label]]:flex-auto has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      responsive:
        'flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto @md/field-group:[&>[data-slot=field-label]]:flex-auto @md/field-group:has-[>[data-slot=field-content]]:items-start',
    },
  },
  defaultVariants: { orientation: 'vertical' },
})

type FieldProps = React.ComponentProps<'div'> &
  VariantProps<typeof fieldVariants> & {
    /**
     * Fehlerzustand. Setzt `data-invalid` und `aria-invalid` am Control.
     * Ohne Angabe gilt das Feld als ungültig, sobald ein FieldError Inhalt hat.
     */
    invalid?: boolean
  }

function Field({ className, orientation = 'vertical', invalid, children, ...props }: FieldProps) {
  const generatedId = React.useId()
  const [parts, setParts] = React.useState<{ description: string[]; error: string[] }>({ description: [], error: [] })
  const [explicitControlId, setExplicitControlId] = React.useState<string>()

  const register = React.useCallback((part: FieldPart, id: string) => {
    setParts((current) => ({ ...current, [part]: [...current[part].filter((entry) => entry !== id), id] }))
    return () => setParts((current) => ({ ...current, [part]: current[part].filter((entry) => entry !== id) }))
  }, [])
  const registerControlId = React.useCallback((id: string) => {
    setExplicitControlId(id)
    return () => setExplicitControlId((current) => (current === id ? undefined : current))
  }, [])

  const isInvalid = invalid ?? parts.error.length > 0
  const describedBy = [...parts.description, ...parts.error].join(' ') || undefined
  const context = React.useMemo<FieldContextValue>(
    () => ({
      controlId: explicitControlId ?? generatedId,
      generatedId,
      describedBy,
      invalid: isInvalid,
      register,
      registerControlId,
    }),
    [explicitControlId, generatedId, describedBy, isInvalid, register, registerControlId],
  )

  return (
    <FieldContext.Provider value={context}>
      <div
        role="group"
        data-slot="field"
        data-orientation={orientation}
        data-invalid={isInvalid || undefined}
        className={cn(fieldVariants({ orientation }), className)}
        {...props}
      >
        {children}
      </div>
    </FieldContext.Provider>
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-content"
      className={cn('group/field-content flex flex-1 flex-col gap-1.5 leading-snug', className)}
      {...props}
    />
  )
}

function FieldLabel({ className, htmlFor, ...props }: LabelProps) {
  const field = React.useContext(FieldContext)
  return (
    <Label
      data-slot="field-label"
      htmlFor={htmlFor ?? field?.controlId}
      className={cn(
        'group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 group-data-[invalid=true]/field:text-destructive',
        'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4',
        'has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 dark:has-data-[state=checked]:bg-primary/10',
        className,
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-title"
      className={cn(
        'flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, id, ...props }: React.ComponentProps<'p'>) {
  const generatedId = React.useId()
  const descriptionId = id ?? generatedId
  useFieldPart('description', descriptionId, true)
  return (
    <p
      id={descriptionId}
      data-slot="field-description"
      className={cn(
        'text-sm leading-normal font-normal text-muted-foreground group-has-[[data-orientation=horizontal]]/field:text-balance',
        'last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5',
        '[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
        className,
      )}
      {...props}
    />
  )
}

type FieldErrorProps = React.ComponentProps<'div'> & {
  /** Fehler aus der Validierung. Leere und doppelte Meldungen fallen weg. */
  errors?: Array<FieldErrorItem>
}

function FieldError({ className, id, children, errors, ...props }: FieldErrorProps) {
  const generatedId = React.useId()
  const errorId = id ?? generatedId
  const messages = uniqueFieldErrors(errors)
  const hasChildren = children !== undefined && children !== null && children !== false && children !== ''
  const content = hasChildren ? (
    children
  ) : messages.length > 1 ? (
    <ul className="ml-4 flex list-disc flex-col gap-1">
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  ) : (
    messages[0]
  )
  const visible = hasChildren || messages.length > 0
  useFieldPart('error', errorId, visible)
  if (!visible) return null
  return (
    <div
      id={errorId}
      role="alert"
      data-slot="field-error"
      className={cn('text-sm font-normal text-destructive', className)}
      {...props}
    >
      {content}
    </div>
  )
}

function FieldSeparator({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn('relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2', className)}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
  fieldVariants,
  useFieldControl,
}
export type { FieldErrorItem, FieldErrorProps, FieldProps }
