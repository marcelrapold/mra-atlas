'use client'

import * as React from 'react'
import { Collapsible as CollapsiblePrimitive } from 'radix-ui'

import { cn } from '../lib/utils'
import { CoreKeyframes, disclosureMotion } from './motion-keyframes'

function Collapsible(props: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

/** Meist mit `asChild` auf einen `Button`; Name und `aria-expanded` kommen dann vom Button bzw. von Radix. */
function CollapsibleTrigger(props: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
}

function CollapsibleContent({ className, ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return (
    <>
      <CoreKeyframes />
      <CollapsiblePrimitive.Content
        data-slot="collapsible-content"
        className={cn('overflow-hidden', disclosureMotion, className)}
        {...props}
      />
    </>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
