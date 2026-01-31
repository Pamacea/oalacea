import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Imperium Badge Component
 * Warhammer 40K inspired brutalist badge
 *
 * Features:
 * - Square corners (no border radius)
 * - Uppercase with wide letter spacing
 * - Accent borders
 * - Bold weight
 */

const badgeVariants = cva(
  "inline-flex items-center rounded-none border px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "border-imperium-iron bg-imperium-black-elevate text-imperium-ivory",
        crimson: "border-imperium-crimson bg-imperium-crimson/20 text-imperium-crimson",
        gold: "border-imperium-gold bg-imperium-gold/20 text-imperium-gold",
        maroon: "border-imperium-maroon bg-imperium-maroon/20 text-imperium-maroon",
        outline: "border-imperium-ivory bg-transparent text-imperium-ivory",
        glow: "border-imperium-crimson bg-imperium-crimson/10 text-imperium-crimson shadow-[0_0_10px_rgba(220,20,60,0.3)]",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ImperiumBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function ImperiumBadge({ className, variant, size, ...props }: ImperiumBadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { ImperiumBadge, badgeVariants }
