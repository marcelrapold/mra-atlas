import * as React from 'react'

import { focusRingInset } from '../lib/focus'
import { cn } from '../lib/utils'

type TableProps = React.ComponentProps<'table'> & {
  /**
   * Name des Scrollbereichs. Gesetzt, wird der Container zur benannten Region
   * und per Tastatur fokussierbar, damit breite Tabellen ohne Maus horizontal
   * scrollbar sind (WCAG 2.1.1). Für Tabellen, die überlaufen können, setzen.
   */
  scrollLabel?: string
  containerClassName?: string
}

function Table({ className, containerClassName, scrollLabel, ...props }: TableProps) {
  const scrollable = scrollLabel
    ? ({ role: 'region', tabIndex: 0, 'aria-label': scrollLabel } as const)
    : undefined
  return (
    <div
      data-slot="table-container"
      {...scrollable}
      className={cn('relative w-full overflow-x-auto', scrollable && cn('rounded-md', focusRingInset), containerClassName)}
    >
      <table data-slot="table" className={cn('w-full caption-bottom border-collapse text-sm', className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('[&_tr]:border-b', className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
}

type TableRowProps = React.ComponentProps<'tr'> & {
  /** Hebt die Zeile hervor (`data-state="selected"`). Die Auswahl selbst gehört in ein Bedienelement der Zeile, z. B. eine Checkbox. */
  selected?: boolean
}

function TableRow({ className, selected, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      data-state={selected ? 'selected' : undefined}
      className={cn(
        'border-b hover:bg-muted/50 data-[state=selected]:bg-muted motion-safe:transition-colors',
        className,
      )}
      {...props}
    />
  )
}

type TableCellAlignProps = {
  /** Zahlenspalte: rechtsbündig mit gleich breiten Ziffern (`tabular-nums`). */
  numeric?: boolean
}

function TableHead({ className, numeric, scope = 'col', ...props }: React.ComponentProps<'th'> & TableCellAlignProps) {
  return (
    <th
      data-slot="table-head"
      data-numeric={numeric ? '' : undefined}
      scope={scope}
      className={cn(
        'h-10 px-2 text-start align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pe-0',
        numeric && 'text-end tabular-nums',
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, numeric, ...props }: React.ComponentProps<'td'> & TableCellAlignProps) {
  return (
    <td
      data-slot="table-cell"
      data-numeric={numeric ? '' : undefined}
      className={cn(
        'p-2 align-middle [&:has([role=checkbox])]:pe-0',
        numeric && 'text-end whitespace-nowrap tabular-nums',
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return <caption data-slot="table-caption" className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
}

export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption }
export type { TableProps, TableRowProps }
