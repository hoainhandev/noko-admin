import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#F5F0E8]/15 text-[#F5F0E8]',
        secondary: 'border-transparent bg-[#F5F0E8]/10 text-[#C4BAA8]',
        destructive: 'border-transparent bg-red-900/20 text-red-400',
        outline: 'border border-[#F5F0E8]/20 text-[#F5F0E8]',
        success: 'border-transparent bg-[#F5F0E8]/15 text-[#F5F0E8]',
        warning: 'border-transparent bg-[#E8C97A]/15 text-[#E8C97A]',
        enrolled: 'border-transparent bg-[#F5F0E8]/15 text-[#F5F0E8]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
