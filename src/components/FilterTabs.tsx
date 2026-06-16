import { cn } from '@/lib/utils'

interface FilterTabsProps {
  value: string
  onValueChange: (value: string) => void
  items: { value: string; label: string }[]
  className?: string
}

export function FilterTabs({ value, onValueChange, items, className }: FilterTabsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {items.map((item) => {
        const active = value === item.value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onValueChange(item.value)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              active
                ? 'bg-[#F5F0E8]/10 text-[#F5F0E8] border border-[#F5F0E8]/20'
                : 'text-[#C4BAA8] hover:text-[#F5F0E8] border border-transparent',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
