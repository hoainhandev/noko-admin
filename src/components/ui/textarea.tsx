import * as React from 'react'
import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-[#F5F0E8]/10 bg-input-background px-3 py-2 text-sm text-[#F5F0E8] shadow-sm placeholder:text-[#A89880] focus-visible:outline-none focus-visible:border-[#E8C97A]/50 focus-visible:ring-2 focus-visible:ring-[#E8C97A]/30 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export { Textarea }
