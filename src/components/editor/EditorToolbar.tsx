import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title?: string
  children: ReactNode
}

export function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        active
          ? 'bg-[#F5F0E8]/10 text-[#F5F0E8]'
          : 'text-[#C4BAA8] hover:bg-[#F5F0E8]/5 hover:text-[#F5F0E8]',
      )}
    >
      {children}
    </button>
  )
}

export function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-[#F5F0E8]/10" aria-hidden />
}
