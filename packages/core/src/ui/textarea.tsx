'use client'

import * as React from 'react'

import { cn } from '../lib/utils'
import { focusRing } from '../lib/focus'
import { useFieldControl } from './field'

type TextareaProps = React.ComponentProps<'textarea'>

/**
 * Mehrzeilige Eingabe mit denselben Tokens wie Input. Wächst mit dem Inhalt
 * (`field-sizing: content`, Chromium; sonst feste Mindesthöhe) zwischen
 * drei und zwanzig Zeilen, danach scrollt sie. In einem Field übernimmt sie
 * id, aria-describedby und aria-invalid automatisch.
 */
function Textarea({ className, ...props }: TextareaProps) {
  const fieldProps = useFieldControl(props)
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-[calc(3lh+1rem)] max-h-[calc(20lh+1rem)] w-full min-w-0 resize-y rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] [field-sizing:content] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
        focusRing,
        'focus-visible:border-ring aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive',
        className,
      )}
      {...fieldProps}
    />
  )
}

export { Textarea }
export type { TextareaProps }
