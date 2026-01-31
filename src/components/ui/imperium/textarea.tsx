import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Imperium Textarea Component
 * Warhammer 40K inspired brutalist textarea
 */

const textareaVariants = cva(
  "flex w-full rounded-none border bg-imperium-black-elevate px-4 py-3 text-imperium-ivory placeholder:text-imperium-ivory-muted outline-none transition-all resize-none",
  {
    variants: {
      variant: {
        default: "border-imperium-iron focus:border-imperium-crimson focus:ring-1 focus:ring-imperium-crimson/50",
        crimson: "border-imperium-crimson focus:border-imperium-crimson-glow focus:ring-1 focus:ring-imperium-crimson/50",
        gold: "border-imperium-gold focus:border-imperium-glow-gold focus:ring-1 focus:ring-imperium-gold/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ImperiumTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const ImperiumTextarea = React.forwardRef<HTMLTextAreaElement, ImperiumTextareaProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
ImperiumTextarea.displayName = "ImperiumTextarea"

export { ImperiumTextarea, textareaVariants }
