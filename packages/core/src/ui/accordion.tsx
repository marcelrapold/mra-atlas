'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { Accordion as AccordionPrimitive } from 'radix-ui'

import { focusRing } from '../lib/focus'
import { cn } from '../lib/utils'
import { CoreKeyframes, disclosureMotion } from './motion-keyframes'

function Accordion({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" className={cn('flex w-full flex-col', className)} {...props} />
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn('border-b last:border-b-0', className)} {...props} />
}

type AccordionTriggerProps = React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  /** Überschriftenebene des umgebenden Headers, passend zur Gliederung der Seite. Standard 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

function AccordionTrigger({ className, children, headingLevel = 3, ...props }: AccordionTriggerProps) {
  const Heading = `h${headingLevel}` as const
  return (
    <AccordionPrimitive.Header asChild>
      <Heading data-slot="accordion-header" className="flex">
        <AccordionPrimitive.Trigger
          data-slot="accordion-trigger"
          className={cn(
            'flex min-h-11 flex-1 items-start justify-between gap-4 rounded-md py-3 text-start text-sm font-medium hover:underline disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
            focusRing,
            className,
          )}
          {...props}
        >
          {children}
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none mt-0.5 size-4 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-200"
          />
        </AccordionPrimitive.Trigger>
      </Heading>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <>
      <CoreKeyframes />
      <AccordionPrimitive.Content
        data-slot="accordion-content"
        className={cn('overflow-hidden text-sm', disclosureMotion)}
        {...props}
      >
        <div className={cn('pt-0 pb-4', className)}>{children}</div>
      </AccordionPrimitive.Content>
    </>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
export type { AccordionTriggerProps }
