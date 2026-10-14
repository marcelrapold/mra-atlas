'use client'

import * as React from 'react'

import { cn } from '../lib/utils'
import { focusRing } from '../lib/focus'
import { useFieldControl } from './field'

type InputProps = React.ComponentProps<'input'>

/**
 * Einzeilige Eingabe. Fokus als Outline (`focusRing`), ohne `outline-none`:
 * In Tailwind v4 setzt `outline-none` die Variable `--tw-outline-style` auf
 * `none`, `focus-visible:outline-2` übernimmt diesen Wert, und die Outline
 * bliebe unsichtbar. In einem Field übernimmt Input id, aria-describedby und
 * aria-invalid automatisch.
 */
function Input({ className, type, ...props }: InputProps) {
  const fieldProps = useFieldControl(props)
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
        focusRing,
        'focus-visible:border-ring aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive',
        className,
      )}
      {...fieldProps}
    />
  )
}

export { Input }
export type { InputProps }
