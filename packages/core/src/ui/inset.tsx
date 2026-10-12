import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/utils'
import { toneBorder, toneTint, type Tone } from '../lib/tone'

const insetVariants = cva('rounded-md border', {
  variants: {
    padding: {
      none: '',
      sm: 'p-2',
      md: 'p-3',
    },
  },
  defaultVariants: {
    padding: 'md',
  },
})

type InsetTag = 'div' | 'section' | 'li' | 'article' | 'figure' | 'aside'

type InsetProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof insetVariants> & {
    /** Semantisches Element. Standard: `div`. */
    as?: InsetTag
    /** Tönt Rahmen und Grund. Standard: `neutral` (muted). */
    tone?: Tone
    ref?: React.Ref<HTMLElement>
  }

/**
 * Innenfläche: eine Karte in einer Karte. Solide, ohne Unschärfe, Radius
 * `radius-md` (folgt `--brand-radius`, höchstens 8 px). Eine Tonrolle
 * tönt Rahmen und Grund leicht, die Schrift bleibt `foreground`.
 */
function Inset({ as = 'div', tone = 'neutral', padding = 'md', className, ...props }: InsetProps) {
  const Tag = as as React.ElementType
  return (
    <Tag
      data-slot="inset"
      data-tone={tone}
      data-padding={padding}
      className={cn(insetVariants({ padding }), toneBorder[tone], toneTint[tone], 'text-foreground', className)}
      {...props}
    />
  )
}

export { Inset, insetVariants }
export type { InsetProps, InsetTag }
