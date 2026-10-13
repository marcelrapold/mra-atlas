'use client'

import * as React from 'react'
import { cva } from 'class-variance-authority'
import { CircleHelp, Info, TextCursorInput, TriangleAlert, type LucideIcon } from 'lucide-react'

import { cn } from '../lib/utils'
import { Button } from './button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog'

type ConfirmDialogKind = 'confirm' | 'prompt' | 'inform'
type ConfirmDialogTone = 'default' | 'destructive'
type ConfirmDialogAnswer = boolean | string | null

interface ConfirmDialogBaseOptions {
  /** Heading. Defaults to the kind's label (Bestätigen, Eingabe, Hinweis). */
  title?: React.ReactNode
  /** Body text; line breaks are kept. */
  message: React.ReactNode
}

interface ConfirmOptions extends ConfirmDialogBaseOptions {
  confirmLabel?: string
  cancelLabel?: string
  /** `destructive` colours the confirm action and switches the icon. */
  tone?: ConfirmDialogTone
}

interface PromptOptions extends ConfirmDialogBaseOptions {
  /** Prefilled value; it is selected when the dialog opens. */
  defaultValue?: string
  /** Accessible label for the field. Defaults to the message. */
  inputLabel?: string
  placeholder?: string
  inputType?: 'text' | 'email' | 'url' | 'search' | 'tel'
  /** Disable submit while the trimmed value is empty. */
  required?: boolean
  confirmLabel?: string
  cancelLabel?: string
}

interface InformOptions extends ConfirmDialogBaseOptions {
  /** Label of the single acknowledge action. */
  confirmLabel?: string
  tone?: ConfirmDialogTone
}

interface ConfirmDialogLabels {
  confirmTitle: string
  promptTitle: string
  informTitle: string
  confirm: string
  cancel: string
  submit: string
  acknowledge: string
  close: string
}

const defaultConfirmDialogLabels: ConfirmDialogLabels = {
  confirmTitle: 'Bestätigen',
  promptTitle: 'Eingabe',
  informTitle: 'Hinweis',
  confirm: 'Bestätigen',
  cancel: 'Abbrechen',
  submit: 'Übernehmen',
  acknowledge: 'Verstanden',
  close: 'Schliessen',
}

interface ConfirmDialogRequest {
  id: number
  kind: ConfirmDialogKind
  options: ConfirmOptions & PromptOptions & InformOptions
  resolve: (answer: ConfirmDialogAnswer) => void
}

type AskFn = (
  kind: ConfirmDialogKind,
  options: ConfirmDialogRequest['options'],
) => Promise<ConfirmDialogAnswer>

const ConfirmDialogContext = React.createContext<AskFn | null>(null)

const confirmDialogEmblemVariants = cva(
  'inline-flex size-10 shrink-0 items-center justify-center rounded-full [&_svg]:size-5',
  {
    variants: {
      tone: {
        default: 'bg-muted text-foreground',
        destructive: 'bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: { tone: 'default' },
  },
)

// Fokus-Outline kommt aus Button; hier nur die 44-px-Zielgrösse auf Touch.
const actionClass = 'pointer-coarse:h-11'

function ConfirmDialogWindow({
  request,
  open,
  labels,
  onAnswer,
  onClosed,
}: {
  request: ConfirmDialogRequest
  open: boolean
  labels: ConfirmDialogLabels
  onAnswer: (answer: ConfirmDialogAnswer) => void
  onClosed: () => void
}) {
  const { kind, options } = request
  const inputId = React.useId()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  const acceptRef = React.useRef<HTMLButtonElement>(null)
  const [value, setValue] = React.useState(options.defaultValue ?? '')
  const tone: ConfirmDialogTone = kind === 'prompt' ? 'default' : (options.tone ?? 'default')

  const title =
    options.title ??
    (kind === 'confirm'
      ? labels.confirmTitle
      : kind === 'prompt'
        ? labels.promptTitle
        : labels.informTitle)
  const acceptLabel =
    options.confirmLabel ??
    (kind === 'confirm' ? labels.confirm : kind === 'prompt' ? labels.submit : labels.acknowledge)
  const cancelLabel = options.cancelLabel ?? labels.cancel
  const Icon: LucideIcon =
    kind === 'prompt'
      ? TextCursorInput
      : tone === 'destructive'
        ? TriangleAlert
        : kind === 'confirm'
          ? CircleHelp
          : Info
  const blocked = kind === 'prompt' && options.required === true && value.trim() === ''

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onAnswer(null)
      }}
    >
      <DialogContent
        role={kind === 'prompt' ? 'dialog' : 'alertdialog'}
        data-slot="confirm-dialog"
        data-kind={kind}
        data-tone={tone}
        closeLabel={labels.close}
        className="sm:max-w-md"
        onOpenAutoFocus={(event) => {
          // Safe default: Cancel for decisions, the field for prompts.
          event.preventDefault()
          const target =
            kind === 'prompt' ? inputRef.current : kind === 'confirm' ? cancelRef.current : acceptRef.current
          target?.focus()
          if (kind === 'prompt') inputRef.current?.select()
        }}
        onCloseAutoFocus={() => {
          // Focus is back where it was: now the caller may continue.
          onClosed()
        }}
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (blocked) return
            onAnswer(kind === 'prompt' ? value : true)
          }}
        >
          <DialogHeader className="flex-row items-center gap-3 text-left">
            <span aria-hidden className={confirmDialogEmblemVariants({ tone })}>
              <Icon />
            </span>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm leading-relaxed break-words whitespace-pre-wrap text-foreground">
            {options.message}
          </DialogDescription>
          {kind === 'prompt' && (
            <div className="grid gap-2">
              {options.inputLabel && (
                <label htmlFor={inputId} className="text-sm font-medium">
                  {options.inputLabel}
                </label>
              )}
              <input
                id={inputId}
                ref={inputRef}
                type={options.inputType ?? 'text'}
                value={value}
                placeholder={options.placeholder}
                required={options.required}
                aria-required={options.required || undefined}
                aria-label={
                  options.inputLabel
                    ? undefined
                    : typeof options.message === 'string'
                      ? options.message
                      : typeof title === 'string'
                        ? title
                        : labels.promptTitle
                }
                onChange={(event) => setValue(event.target.value)}
                className="h-11 w-full min-w-0 rounded-md border border-input bg-transparent px-3 text-base placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:text-sm dark:bg-input/30"
              />
            </div>
          )}
          <DialogFooter>
            {kind !== 'inform' && (
              <Button
                ref={cancelRef}
                type="button"
                variant="outline"
                className={actionClass}
                onClick={() => onAnswer(null)}
              >
                {cancelLabel}
              </Button>
            )}
            <Button
              ref={acceptRef}
              type="submit"
              variant={tone === 'destructive' ? 'destructive' : 'default'}
              disabled={blocked}
              className={actionClass}
            >
              {acceptLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface ConfirmDialogProviderProps {
  children: React.ReactNode
  /** Override the German default labels (Swiss spelling). */
  labels?: Partial<ConfirmDialogLabels>
}

/**
 * Mount once near the app root. `useConfirm`, `usePrompt` and `useInform`
 * open one dialog at a time and resolve after it closed and focus returned.
 * A request while another is on screen resolves immediately as cancelled
 * (false / null), so a decision already shown is never replaced.
 */
function ConfirmDialogProvider({ children, labels }: ConfirmDialogProviderProps) {
  const [request, setRequest] = React.useState<ConfirmDialogRequest | null>(null)
  const [open, setOpen] = React.useState(false)
  const pendingRef = React.useRef<ConfirmDialogRequest | null>(null)
  const answerRef = React.useRef<{ value: ConfirmDialogAnswer } | null>(null)
  const fallbackRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mountedRef = React.useRef(false)
  const idRef = React.useRef(0)

  const merged = React.useMemo(() => ({ ...defaultConfirmDialogLabels, ...labels }), [labels])

  const settle = React.useCallback(() => {
    clearTimeout(fallbackRef.current)
    const pending = pendingRef.current
    const answer = answerRef.current
    if (!pending || !answer) return
    pendingRef.current = null
    answerRef.current = null
    setRequest(null)
    pending.resolve(answer.value)
  }, [])

  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      clearTimeout(fallbackRef.current)
      pendingRef.current?.resolve(null)
      pendingRef.current = null
      answerRef.current = null
    }
  }, [])

  const ask = React.useCallback<AskFn>((kind, options) => {
    if (!mountedRef.current || pendingRef.current) return Promise.resolve(null)
    return new Promise<ConfirmDialogAnswer>((resolve) => {
      const next: ConfirmDialogRequest = { id: ++idRef.current, kind, options, resolve }
      pendingRef.current = next
      answerRef.current = null
      setRequest(next)
      setOpen(true)
    })
  }, [])

  const answer = React.useCallback(
    (value: ConfirmDialogAnswer) => {
      if (!pendingRef.current || answerRef.current) return
      answerRef.current = { value }
      setOpen(false)
      // onCloseAutoFocus normally settles; this covers environments where
      // the close animation or focus restore never reports back.
      fallbackRef.current = setTimeout(settle, 1000)
    },
    [settle],
  )

  return (
    <ConfirmDialogContext.Provider value={ask}>
      {children}
      {request && (
        <ConfirmDialogWindow
          key={request.id}
          request={request}
          open={open}
          labels={merged}
          onAnswer={answer}
          onClosed={settle}
        />
      )}
    </ConfirmDialogContext.Provider>
  )
}

function useAsk(hook: string): AskFn {
  const ask = React.useContext(ConfirmDialogContext)
  if (!ask) throw new Error(`${hook} needs a <ConfirmDialogProvider> above it.`)
  return ask
}

function normalize<T extends ConfirmDialogBaseOptions>(input: string | T): T {
  return (typeof input === 'string' ? { message: input } : input) as T
}

/** `const confirm = useConfirm(); if (await confirm({ message, tone: 'destructive' })) …` */
function useConfirm(): (options: string | ConfirmOptions) => Promise<boolean> {
  const ask = useAsk('useConfirm')
  return React.useCallback(
    async (options) => (await ask('confirm', normalize(options))) === true,
    [ask],
  )
}

/** Resolves to the entered string, or null when cancelled. */
function usePrompt(): (options: string | PromptOptions) => Promise<string | null> {
  const ask = useAsk('usePrompt')
  return React.useCallback(async (options) => {
    const result = await ask('prompt', normalize(options))
    return typeof result === 'string' ? result : null
  }, [ask])
}

/** Resolves once the notice was acknowledged or dismissed. */
function useInform(): (options: string | InformOptions) => Promise<void> {
  const ask = useAsk('useInform')
  return React.useCallback(async (options) => {
    await ask('inform', normalize(options))
  }, [ask])
}

export {
  ConfirmDialogProvider,
  useConfirm,
  usePrompt,
  useInform,
  confirmDialogEmblemVariants,
  defaultConfirmDialogLabels,
}
export type {
  ConfirmDialogProviderProps,
  ConfirmDialogLabels,
  ConfirmDialogTone,
  ConfirmOptions,
  PromptOptions,
  InformOptions,
}
