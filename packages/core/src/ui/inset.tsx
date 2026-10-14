import * as React from 'react'
import { Slot } from 'radix-ui'
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
    /** Rendert das einzige Kind (z. B. `<li>` oder `<article>`) mit den Inset-Klassen. */
    asChild?: boolean
    /**
     * Semantisches Element. Standard: `div`.
     * @deprecated `asChild` mit dem gewünschten Element verwenden, z. B. `<Inset asChild><li>…</li></Inset>`.
     */
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
function Inset({ asChild = false, as = 'div', tone = 'neutral', padding = 'md', className, ...props }: InsetProps) {
  const Comp: React.ElementType = asChild ? Slot.Root : as
  return (
    <Comp
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
