import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#F5F0E8]/20 text-[#F5F0E8]',
        secondary: 'border-transparent bg-[#2A3D8F] text-[#C4BAA8]',
        destructive: 'border-transparent bg-red-900/20 text-red-400',
        outline: 'border-[#F5F0E8]/20 text-[#F5F0E8]',
        success: 'border-transparent bg-[#F5F0E8]/20 text-[#F5F0E8]',
        warning: 'border-transparent bg-[#E8C97A]/20 text-[#E8C97A]',
        enrolled: 'border-transparent bg-[#243580] text-[#F5F0E8]',
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
