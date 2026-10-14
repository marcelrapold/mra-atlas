'use client'

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { useBrand } from '../brand-provider'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  const { mode: theme, variables } = useBrand()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      containerAriaLabel="Benachrichtigungen"
      toastOptions={{ closeButtonAriaLabel: 'Meldung schliessen', ...toastOptions }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 motion-safe:animate-spin" />,
      }}
      style={
        {
          ...variables,
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

