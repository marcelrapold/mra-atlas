'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Avatar as AvatarPrimitive } from 'radix-ui'

import { cn } from '../lib/utils'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const AvatarGroupContext = React.createContext<{ size?: AvatarSize } | null>(null)

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden bg-muted text-muted-foreground select-none',
  {
    variants: {
      size: {
        xs: 'size-6 text-[0.625rem]',
        sm: 'size-8 text-xs',
        md: 'size-10 text-sm',
        lg: 'size-12 text-base',
        xl: 'size-16 text-lg',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-[var(--brand-radius)]',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  },
)

type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>

function Avatar({ className, size, shape = 'circle', ...props }: AvatarProps) {
  const group = React.useContext(AvatarGroupContext)
  const resolvedSize = size ?? group?.size ?? 'md'

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={resolvedSize}
      data-shape={shape}
      className={cn(avatarVariants({ size: resolvedSize, shape }), className)}
      {...props}
    />
  )
}

/**
 * Bild des Avatars. `alt` beschreibt die Person; bei rein dekorativen Avataren
 * (Name steht daneben) `alt=""` setzen. `referrerPolicy` ist standardmässig
 * `no-referrer`, weil einige OAuth-Bildquellen sonst mit 403 antworten.
 */
function AvatarImage({
  className,
  referrerPolicy = 'no-referrer',
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      referrerPolicy={referrerPolicy}
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  )
}

type AvatarFallbackProps = React.ComponentProps<typeof AvatarPrimitive.Fallback> & {
  /**
   * Zugänglicher Name, wenn kein Bild lädt (z. B. «Anna Meier»). Die sichtbaren
   * Initialen werden dann vor Screenreadern verborgen.
   */
  label?: string
}

/** Initialen oder Icon, solange bzw. falls das Bild nicht lädt. */
function AvatarFallback({ className, label, children, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center font-medium uppercase [&_svg]:size-1/2 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {label ? (
        <>
          <span aria-hidden="true">{children}</span>
          <span className="sr-only">{label}</span>
        </>
      ) : (
        children
      )}
    </AvatarPrimitive.Fallback>
  )
}

/**
 * Leitet 1–2 Initialen aus einem Namen oder einer E-Mail-Adresse ab.
 * «Anna Meier» → «AM», «anna.meier@example.ch» → «AM», leer → `fallback`.
 */
function getInitials(value: string | null | undefined, fallback = '?'): string {
  const raw = value?.trim() ?? ''
  if (!raw) return fallback
  const base = raw.includes('@') ? (raw.split('@')[0] ?? '') : raw
  const parts = base.split(/[\s._-]+/).filter(Boolean)
  const letters = parts
    .map((part) => Array.from(part)[0]?.toLocaleUpperCase('de-CH') ?? '')
    .filter(Boolean)
  if (letters.length === 0) return fallback
  if (letters.length === 1) return letters[0]!
  return `${letters[0]}${letters[letters.length - 1]}`
}

/* -------------------------------------------------------------------------- */
/* AvatarGroup                                                                */
/* -------------------------------------------------------------------------- */

const avatarGroupVariants = cva('flex items-center', {
  variants: {
    spacing: {
      tight: '-space-x-3',
      default: '-space-x-2',
      loose: '-space-x-1',
    },
  },
  defaultVariants: {
    spacing: 'default',
  },
})

type AvatarGroupProps = React.ComponentProps<'div'> &
  VariantProps<typeof avatarGroupVariants> & {
    /** Grösse für alle enthaltenen Avatare und den Zähler. */
    size?: AvatarSize
    /** Höchstzahl sichtbarer Avatare; der Rest wird als «+N» gezählt. */
    max?: number
    /** Gesamtzahl, falls grösser als die übergebenen Avatare (z. B. 1240 Zuhörende). */
    total?: number
    /** Zugänglicher Name der Gruppe, z. B. «Teilnehmende». */
    label?: string
    /** Text für Screenreader zum Zähler. */
    formatOverflowLabel?: (count: number) => string
  }

function defaultOverflowLabel(count: number) {
  return `und ${count.toLocaleString('de-CH')} weitere`
}

function AvatarGroup({
  className,
  spacing = 'default',
  size = 'md',
  max,
  total,
  label,
  formatOverflowLabel = defaultOverflowLabel,
  children,
  ...props
}: AvatarGroupProps) {
  const items = React.Children.toArray(children).filter(React.isValidElement)
  const limit = typeof max === 'number' && max >= 0 ? max : items.length
  const visible = items.slice(0, limit)
  const overflow = Math.max(0, (total ?? items.length) - visible.length)
  const contextValue = React.useMemo(() => ({ size }), [size])

  return (
    <AvatarGroupContext.Provider value={contextValue}>
      <div
        data-slot="avatar-group"
        data-size={size}
        role="group"
        aria-label={label}
        className={cn(
          avatarGroupVariants({ spacing }),
          '*:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background',
          className,
        )}
        {...props}
      >
        {visible}
        {overflow > 0 ? (
          <span
            data-slot="avatar-group-count"
            className={cn(
              avatarVariants({ size, shape: 'circle' }),
              'items-center justify-center bg-secondary font-medium text-secondary-foreground tabular-nums ring-2 ring-background',
            )}
          >
            <span aria-hidden="true">{overflow > 99 ? '99+' : `+${overflow}`}</span>
            <span className="sr-only">{formatOverflowLabel(overflow)}</span>
          </span>
        ) : null}
      </div>
    </AvatarGroupContext.Provider>
  )
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, avatarVariants, avatarGroupVariants, getInitials }
export type { AvatarProps, AvatarFallbackProps, AvatarGroupProps, AvatarSize }
