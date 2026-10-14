'use client'

import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'

import { cn } from '../lib/utils'
import { toggleVariants } from './toggle'

type ToggleGroupVariant = VariantProps<typeof toggleVariants>['variant']
type ToggleGroupSize = VariantProps<typeof toggleVariants>['size']
type ToggleGroupOrientation = 'horizontal' | 'vertical'

type ToggleGroupContextValue = {
  variant: ToggleGroupVariant
  size: ToggleGroupSize
  spacing: number
  orientation: ToggleGroupOrientation
}

/** Variante und Grösse der Gruppe gehen vor; fehlen sie, gilt die Angabe am Eintrag. */
const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  variant: undefined,
  size: undefined,
  spacing: 0,
  orientation: 'horizontal',
})

type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    /**
     * Abstand zwischen den Einträgen in Tailwind-Schritten (`--spacing`).
     * `0` (Standard) verbindet die Einträge zu einer Leiste mit gemeinsamen Ecken.
     */
    spacing?: number
  }

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  orientation,
  style,
  children,
  ...props
}: ToggleGroupProps) {
  // Ohne `orientation` bleibt Radix in beiden Achsen (alle vier Pfeiltasten, APG-Radiogruppe);
  // dargestellt wird die Leiste dann horizontal.
  const layout: ToggleGroupOrientation = orientation ?? 'horizontal'
  const context = React.useMemo<ToggleGroupContextValue>(
    () => ({ variant, size, spacing, orientation: layout }),
    [variant, size, spacing, layout],
  )
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant ?? 'default'}
      data-size={size ?? 'default'}
      data-spacing={spacing}
      data-orientation={layout}
      orientation={orientation}
      style={{ '--toggle-group-gap': `calc(var(--spacing) * ${spacing})`, ...style } as React.CSSProperties}
      className={cn(
        'group/toggle-group flex w-fit items-center gap-(--toggle-group-gap) rounded-md data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
        spacing === 0 && variant === 'outline' && 'shadow-xs',
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={context}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

/** Verbundene Leiste: nur die äusseren Ecken gerundet, Rahmen nicht doppelt. */
const JOINED: Record<ToggleGroupOrientation, string> = {
  horizontal:
    'rounded-none shadow-none first:rounded-s-md last:rounded-e-md data-[variant=outline]:border-s-0 data-[variant=outline]:first:border-s',
  vertical:
    'rounded-none shadow-none first:rounded-t-md last:rounded-b-md data-[variant=outline]:border-t-0 data-[variant=outline]:first:border-t',
}

/**
 * Unsichtbare Trefferfläche von 44 px. Freistehend als Quadrat; in einer
 * verbundenen Leiste nur quer zur Leiste, damit sich Nachbarn nicht überdecken.
 * `square` entspricht `TOUCH_TARGET` in `toggle.tsx`; später gemeinsam aus `lib/` exportieren.
 */
const TOUCH_TARGET = {
  square:
    "after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
  horizontal: "after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']",
  vertical: "after:absolute after:inset-y-0 after:left-1/2 after:w-11 after:-translate-x-1/2 after:content-['']",
} as const

function ToggleGroupItem({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)
  const resolvedVariant = context.variant ?? variant ?? 'default'
  const resolvedSize = context.size ?? size ?? 'default'
  const joined = context.spacing === 0
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
        'shrink-0 focus-visible:z-10',
        joined && JOINED[context.orientation],
        resolvedSize !== 'lg' && TOUCH_TARGET[joined ? context.orientation : 'square'],
        className,
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
export type { ToggleGroupProps }
