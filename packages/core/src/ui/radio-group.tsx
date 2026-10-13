'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'

import { cn } from '../lib/utils'

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  )
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'peer relative aspect-square size-4 shrink-0 cursor-pointer rounded-full border border-muted-foreground/60 bg-background text-primary shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-[state=checked]:border-primary motion-safe:transition-colors dark:bg-input/30',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="size-2 rounded-full bg-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

const radioGroupOptionVariants = cva(
  'group/radio-option relative flex min-h-11 cursor-pointer items-start gap-3 text-sm has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-50',
  {
    variants: {
      variant: {
        plain: 'py-1',
        card: 'rounded-[var(--brand-radius)] border border-border bg-card p-3 hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 motion-safe:transition-colors',
      },
    },
    defaultVariants: {
      variant: 'plain',
    },
  },
)

type RadioGroupOptionProps = Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, 'children'> &
  VariantProps<typeof radioGroupOptionVariants> & {
    /** Sichtbarer Name der Option, zugleich zugänglicher Name. */
    label: React.ReactNode
    /** Optionaler Zusatztext, per aria-describedby verknüpft. */
    description?: React.ReactNode
    /** Klassen am äusseren Label (Karte/Zeile); `className` geht an den Radio-Knopf. */
    optionClassName?: string
  }

/**
 * Radio mit Label und Beschreibung. Die ganze Zeile bzw. Karte ist klickbar
 * (natives <label for>), der Name kommt aus dem Label, die Beschreibung wird
 * als Zusatz vorgelesen.
 */
function RadioGroupOption({
  label,
  description,
  variant = 'plain',
  optionClassName,
  className,
  id,
  ...props
}: RadioGroupOptionProps) {
  const autoId = React.useId()
  const itemId = id ?? `${autoId}-item`
  const labelId = `${autoId}-label`
  const descriptionId = description ? `${autoId}-description` : undefined

  return (
    <label
      htmlFor={itemId}
      data-slot="radio-group-option"
      data-variant={variant}
      className={cn(radioGroupOptionVariants({ variant }), optionClassName)}
    >
      <RadioGroupItem
        id={itemId}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        {...props}
        className={cn('mt-0.5', className)}
      />
      <span className="grid gap-1">
        <span id={labelId} data-slot="radio-group-option-label" className="leading-snug font-medium">
          {label}
        </span>
        {description ? (
          <span
            id={descriptionId}
            data-slot="radio-group-option-description"
            className="text-xs leading-relaxed text-muted-foreground"
          >
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}

export { RadioGroup, RadioGroupItem, RadioGroupOption, radioGroupOptionVariants }
export type { RadioGroupOptionProps }
