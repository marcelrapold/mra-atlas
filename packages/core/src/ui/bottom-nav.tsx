'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '../lib/utils'

/* -------------------------------------------------------------------------- */
/* BottomNav                                                                  */
/* -------------------------------------------------------------------------- */

const bottomNavVariants = cva('border-t border-border bg-background/95 text-muted-foreground', {
  variants: {
    position: {
      /** Eigenständig am unteren Rand, inkl. Safe Area (Home-Indikator). */
      fixed:
        'fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom,0px)] supports-[backdrop-filter]:bg-background/85 supports-[backdrop-filter]:backdrop-blur-md',
      /** Im Dokumentfluss, z. B. als Kind von `<BottomStack>`. */
      static: 'relative',
    },
  },
  defaultVariants: {
    position: 'fixed',
  },
})

const bottomNavListVariants = cva('m-0 list-none p-0', {
  variants: {
    layout: {
      /** Gleich breite Spalten für 2–5 Hauptziele. */
      grid: 'grid auto-cols-fr grid-flow-col',
      /** Horizontal scrollbare Leiste mit Scroll-Snap für viele Ziele. */
      scroll:
        'flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    },
  },
  defaultVariants: {
    layout: 'grid',
  },
})

type BottomNavProps = React.ComponentProps<'nav'> &
  VariantProps<typeof bottomNavVariants> &
  VariantProps<typeof bottomNavListVariants> & {
    /** Floating Action Button, schwebt rechts über der Leiste. */
    fab?: React.ReactNode
  }

/**
 * Untere Hauptnavigation für schmale Viewports. Kinder sind `<BottomNavItem>`.
 * Auf grossen Viewports per `className="lg:hidden"` ausblenden.
 */
function BottomNav({
  className,
  position = 'fixed',
  layout = 'grid',
  fab,
  children,
  'aria-label': ariaLabel = 'Hauptnavigation',
  ...props
}: BottomNavProps) {
  return (
    <nav
      data-slot="bottom-nav"
      data-position={position}
      data-layout={layout}
      aria-label={ariaLabel}
      className={cn(bottomNavVariants({ position }), className)}
      {...props}
    >
      {fab ? (
        <div data-slot="bottom-nav-fab-slot" className="absolute end-4 bottom-full mb-4">
          {fab}
        </div>
      ) : null}
      <ul data-slot="bottom-nav-list" className={bottomNavListVariants({ layout })}>
        {children}
      </ul>
    </nav>
  )
}

type BottomNavItemProps = Omit<React.ComponentProps<'a'>, 'children'> & {
  /** Sichtbare Beschriftung, zugleich zugänglicher Name. */
  label: React.ReactNode
  /** Icon über der Beschriftung (dekorativ). */
  icon?: React.ReactNode
  /** Aktuelle Seite; setzt `aria-current="page"`. */
  active?: boolean
  /** Rendert das Kind (z. B. Router-Link) statt `<a>`/`<button>`. */
  asChild?: boolean
  /** Bei `asChild` das Link-Element ohne Inhalt, z. B. `<Link href="/" />`. */
  children?: React.ReactNode
  /** Klick ohne `href` rendert einen `<button>`. */
  onClick?: React.MouseEventHandler<HTMLElement>
}

function BottomNavItem({
  className,
  label,
  icon,
  active = false,
  asChild = false,
  href,
  children,
  ...props
}: BottomNavItemProps) {
  const isButton = !asChild && !href
  const Comp: React.ElementType = asChild ? Slot.Root : href ? 'a' : 'button'

  return (
    <li data-slot="bottom-nav-item" className="min-w-0 snap-start [[data-layout=scroll]_&]:w-20 [[data-layout=scroll]_&]:shrink-0">
      <Comp
        data-slot="bottom-nav-link"
        data-active={active ? '' : undefined}
        aria-current={active ? 'page' : undefined}
        href={asChild ? undefined : href}
        type={isButton ? 'button' : undefined}
        className={cn(
          'group/bottom-nav-link relative flex min-h-14 w-full min-w-16 flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors select-none motion-reduce:transition-none',
          'hover:text-foreground active:bg-muted',
          // Innenliegender Fokusrahmen: die Scroll-Leiste würde einen äusseren abschneiden.
          'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
          'data-[active]:bg-primary/5 data-[active]:text-primary',
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-primary opacity-0 transition-opacity motion-reduce:transition-none group-data-[active]/bottom-nav-link:opacity-100"
        />
        {icon ? (
          <span aria-hidden="true" className="flex">
            {icon}
          </span>
        ) : null}
        {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : null}
        <span className="max-w-full truncate leading-tight">{label}</span>
      </Comp>
    </li>
  )
}

/* -------------------------------------------------------------------------- */
/* BottomNavFab                                                               */
/* -------------------------------------------------------------------------- */

type BottomNavFabProps = React.ComponentProps<'button'> & {
  /** Zugänglicher Name; Pflicht, da der FAB nur ein Icon zeigt. */
  label: string
  /** Dekorativer Puls-Ring, z. B. wenn etwas live läuft. Respektiert reduced motion. */
  pulse?: boolean
  asChild?: boolean
}

function BottomNavFab({
  className,
  label,
  pulse = false,
  asChild = false,
  children,
  ...props
}: BottomNavFabProps) {
  const Comp: React.ElementType = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="bottom-nav-fab"
      data-pulse={pulse ? '' : undefined}
      aria-label={label}
      type={asChild ? undefined : 'button'}
      className={cn(
        'relative inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:bg-primary-hover hover:text-primary-hover-foreground motion-safe:active:scale-95',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6",
        className,
      )}
      {...props}
    >
      {pulse ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-primary opacity-40 motion-safe:animate-ping motion-reduce:hidden"
        />
      ) : null}
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : <span className="relative flex">{children}</span>}
    </Comp>
  )
}

/* -------------------------------------------------------------------------- */
/* BottomStack                                                                */
/* -------------------------------------------------------------------------- */

const BOTTOM_STACK_HEIGHT_VAR = '--bottom-stack-height'

const bottomStackVariants = cva('flex flex-col bg-background', {
  variants: {
    position: {
      fixed: 'fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom,0px)]',
      static: 'relative',
    },
  },
  defaultVariants: {
    position: 'fixed',
  },
})

type BottomStackProps = React.ComponentProps<'div'> &
  VariantProps<typeof bottomStackVariants> & {
    /**
     * Schreibt die gemessene Höhe als `--bottom-stack-height` auf `<html>`.
     * Standard: nur bei `position="fixed"`.
     */
    publishHeight?: boolean
    /** FAB, schwebt rechts über dem gesamten Stapel. */
    fab?: React.ReactNode
    /** Name der Region. Ohne Label wird keine Landmark erzeugt. */
    label?: string
  }

/**
 * Ein einziger positionierter Container für die persistente untere Leiste:
 * z. B. Player-Leiste über `<BottomNav position="static">`. Die Safe Area wird
 * genau einmal hier angewendet.
 */
function BottomStack({
  className,
  position = 'fixed',
  publishHeight,
  fab,
  label,
  children,
  ...props
}: BottomStackProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const shouldPublish = publishHeight ?? position === 'fixed'

  React.useEffect(() => {
    if (!shouldPublish || typeof window === 'undefined') return
    const el = ref.current
    const root = document.documentElement
    if (!el) return

    const sync = () => {
      root.style.setProperty(BOTTOM_STACK_HEIGHT_VAR, `${Math.round(el.getBoundingClientRect().height)}px`)
    }
    sync()

    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(sync)
    ro?.observe(el)
    window.addEventListener('resize', sync)

    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', sync)
      root.style.removeProperty(BOTTOM_STACK_HEIGHT_VAR)
    }
  }, [shouldPublish])

  return (
    <div
      ref={ref}
      data-slot="bottom-stack"
      data-position={position}
      role={label ? 'region' : undefined}
      aria-label={label}
      className={cn(bottomStackVariants({ position }), className)}
      {...props}
    >
      {fab ? (
        <div data-slot="bottom-stack-fab-slot" className="absolute end-4 bottom-full mb-4">
          {fab}
        </div>
      ) : null}
      {children}
    </div>
  )
}

/**
 * Platzhalter am Seitenende, damit der letzte Inhalt nicht unter dem
 * fixierten `<BottomStack>` verschwindet.
 */
function BottomStackSpacer({ className, style, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="bottom-stack-spacer"
      aria-hidden="true"
      className={cn('shrink-0', className)}
      style={{ height: `var(${BOTTOM_STACK_HEIGHT_VAR}, 0px)`, ...style }}
      {...props}
    />
  )
}

export {
  BottomNav,
  BottomNavItem,
  BottomNavFab,
  BottomStack,
  BottomStackSpacer,
  bottomNavVariants,
  bottomNavListVariants,
  bottomStackVariants,
  BOTTOM_STACK_HEIGHT_VAR,
}
export type { BottomNavProps, BottomNavItemProps, BottomNavFabProps, BottomStackProps }
