import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-slate-700 text-white hover:bg-slate-600',
        secondary:
          'border-transparent bg-slate-600/50 text-slate-300 hover:bg-slate-600/70',
        destructive:
          'border-transparent bg-red-600/80 text-white hover:bg-red-600',
        outline: 'border-slate-600 text-slate-300',
        category:
          'border-transparent bg-violet-600/80 text-white hover:bg-violet-600/90',
        success:
          'border-transparent bg-emerald-600/80 text-white hover:bg-emerald-600',
        info:
          'border-transparent bg-blue-600/80 text-white hover:bg-blue-600',
        warning:
          'border-transparent bg-slate-600/60 text-slate-300 hover:bg-slate-600/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
