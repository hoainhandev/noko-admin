import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DataTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl overflow-hidden border border-[#F5F0E8]/8', className)}>
      <table className="w-full">{children}</table>
    </div>
  )
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="bg-[#0F1F52]">{children}</tr>
    </thead>
  )
}

export function DataTableTh({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'px-6 py-4 text-left text-[11px] font-semibold text-[#C4BAA8] uppercase tracking-[0.1em]',
        className,
      )}
    >
      {children}
    </th>
  )
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-[#F5F0E8]/6">{children}</tbody>
}

export function DataTableRow({
  children,
  className,
  interactive = true,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }) {
  return (
    <tr
      className={cn(
        'bg-[#1B2B6B] hover:bg-[#243580]/60 transition-colors duration-150',
        interactive && 'cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

export function DataTableTd({
  children,
  className,
  muted,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { muted?: boolean }) {
  return (
    <td
      className={cn(
        muted ? 'px-6 py-4 text-sm text-[#C4BAA8]' : 'px-6 py-4 text-sm text-[#F5F0E8]',
        className,
      )}
      {...props}
    >
      {children}
    </td>
  )
}

export function DataTableEmpty({
  colSpan,
  message = 'No data yet',
  icon: Icon = Inbox,
}: {
  colSpan: number
  message?: string
  icon?: LucideIcon
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-16 text-[#C4BAA8]">
        <Icon className="mx-auto mb-3 h-12 w-12 opacity-40" />
        <p>{message}</p>
      </td>
    </tr>
  )
}

export function TableActionButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'p-1.5 rounded-lg text-[#C4BAA8] hover:text-[#F5F0E8] hover:bg-[#F5F0E8]/10 transition-colors',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
