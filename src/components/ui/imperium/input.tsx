import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Imperium Input Component
 * Warhammer 40K inspired brutalist input
 *
 * Features:
 * - Square corners (no border radius)
 * - Crimson/gold focus borders
 * - Strong hover states
 * - High contrast for accessibility
 */

const inputVariants = cva(
  "flex w-full rounded-none border bg-imperium-black-elevate px-4 py-3 text-imperium-ivory placeholder:text-imperium-ivory-muted outline-none transition-all",
  {
    variants: {
      variant: {
        default: "border-imperium-iron focus:border-imperium-crimson focus:ring-1 focus:ring-imperium-crimson/50",
        crimson: "border-imperium-crimson focus:border-imperium-crimson-glow focus:ring-1 focus:ring-imperium-crimson/50",
        gold: "border-imperium-gold focus:border-imperium-glow-gold focus:ring-1 focus:ring-imperium-gold/50",
        steel: "border-imperium-steel focus:border-imperium-crimson focus:ring-1 focus:ring-imperium-crimson/50",
      },
      size: {
        sm: "h-10 px-3 text-sm",
        md: "h-12 px-4 text-base",
        lg: "h-14 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ImperiumInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const ImperiumInput = React.forwardRef<HTMLInputElement, ImperiumInputProps>(
  ({ className, variant, size, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
ImperiumInput.displayName = "ImperiumInput"

export { ImperiumInput, inputVariants }
