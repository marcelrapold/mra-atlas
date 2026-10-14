'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Switch as SwitchPrimitive } from 'radix-ui'

import { focusRing } from '../lib/focus'
import { cn } from '../lib/utils'

const switchVariants = cva(
  [
    'peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
    'data-[state=unchecked]:bg-input data-[state=checked]:bg-primary',
    focusRing,
    'disabled:cursor-not-allowed disabled:opacity-50',
    'motion-safe:transition-colors',
    // Trefferfläche vertikal auf 44 px erweitern.
    "after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']",
  ],
  {
    variants: {
      size: {
        default: 'h-6 w-11',
        /** Alias von `default`. */
        md: 'h-6 w-11',
        sm: 'h-5 w-9',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

const switchThumbVariants = cva(
  // Rand am Daumen hält ihn auch auf bg-input und in Forced Colors sichtbar.
  'pointer-events-none block rounded-full border border-foreground/10 bg-background shadow-sm ring-0 data-[state=unchecked]:translate-x-0 motion-safe:transition-transform',
  {
    variants: {
      size: {
        default: 'size-5 data-[state=checked]:translate-x-5',
        md: 'size-5 data-[state=checked]:translate-x-5',
        sm: 'size-4 data-[state=checked]:translate-x-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> & VariantProps<typeof switchVariants>

function Switch({ className, size = 'default', ...props }: SwitchProps) {
  // `md` ist ein Alias: `data-size` bleibt `default`.
  const resolvedSize = size === 'md' ? 'default' : size
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={resolvedSize}
      className={cn(switchVariants({ size: resolvedSize }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className={switchThumbVariants({ size: resolvedSize })} />
    </SwitchPrimitive.Root>
  )
}

export { Switch, switchVariants }
export type { SwitchProps }
