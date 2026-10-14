'use client'

import * as React from 'react'
import { XIcon } from 'lucide-react'
import { Dialog as SheetPrimitive } from 'radix-ui'

import { useBrandPortal } from '../brand-provider'
import { useSwipeToDismiss } from '../lib/use-swipe-to-dismiss'
import { cn } from '../lib/utils'

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal container={useBrandPortal()} data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'fixed inset-0 z-(--z-index-overlay) bg-overlay/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-(--duration-slow) data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-(--duration-deliberate)',
        className,
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  closeLabel = 'Schliessen',
  swipeToClose = false,
  showGrabber = true,
  ref,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left'
  showCloseButton?: boolean
  closeLabel?: string
  /**
   * Bottom sheets only: drag down with one finger to close. Defaults to true
   * for `side="bottom"`, ignored for other sides.
   */
  swipeToClose?: boolean
  /** Show the grabber handle on coarse pointers when swipeToClose is active. */
  showGrabber?: boolean
}) {
  const [node, setNode] = React.useState<HTMLDivElement | null>(null)
  const dismissRef = React.useRef<HTMLButtonElement>(null)
  const swipeEnabled = swipeToClose && side === 'bottom'

  const setRefs = React.useCallback(
    (el: HTMLDivElement | null) => {
      setNode(el)
      if (typeof ref === 'function') ref(el)
      else if (ref) ref.current = el
    },
    [ref],
  )

  useSwipeToDismiss(node, {
    enabled: swipeEnabled,
    // Closing through a Radix Close keeps controlled and uncontrolled sheets
    // in sync with onOpenChange, exactly like the close button.
    onDismiss: () => dismissRef.current?.click(),
  })

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={setRefs}
        data-slot="sheet-content"
        data-side={side}
        data-swipe-to-close={swipeEnabled ? '' : undefined}
        className={cn(
          'fixed z-(--z-index-modal) flex flex-col gap-4 bg-background shadow-lg transition ease-(--easing-drawer) data-[state=closed]:animate-out data-[state=closed]:duration-(--duration-slow) data-[state=open]:animate-in data-[state=open]:duration-(--duration-deliberate)',
          side === 'right' &&
            'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
          side === 'left' &&
            'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
          side === 'top' &&
            'inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
          side === 'bottom' &&
            'inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          swipeEnabled && 'overscroll-contain',
          className,
        )}
        {...props}
      >
        {swipeEnabled && showGrabber && (
          <div
            aria-hidden
            data-slot="sheet-grabber"
            className="mx-auto mt-2 -mb-2 hidden h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/40 pointer-coarse:block"
          />
        )}
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-xs text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none disabled:pointer-events-none pointer-coarse:size-11">
            <XIcon className="size-4" />
            <span className="sr-only">{closeLabel}</span>
          </SheetPrimitive.Close>
        )}
        {swipeEnabled && (
          <SheetPrimitive.Close ref={dismissRef} hidden tabIndex={-1} aria-hidden data-slot="sheet-swipe-close" />
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('pr-10 font-semibold text-balance text-foreground', className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-sm text-pretty text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}

