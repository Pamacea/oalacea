import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Imperium Button Component
 * Warhammer 40K inspired brutalist button with glitch/distortion effects
 *
 * Variants:
 * - primary: Crimson brutal (main action)
 * - secondary: Gold premium (secondary action)
 * - brutal: Glitch effect on hover
 * - distordu: Overdrive/distortion effect
 * - glow: Neon glow style
 * - ghost: Minimal ghost
 * - outline: Inverted border
 */

const buttonVariants = cva(
  // Base: AUCUN border radius - brutalisme pur
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        // Primary - Crimson brutal
        primary: "bg-imperium-crimson text-imperium-ivory border-2 border-imperium-crimson hover:bg-imperium-crimson-glow hover:border-imperium-crimson-glow hover:shadow-[0_0_20px_rgba(220,20,60,0.5)] active:translate-y-px",

        // Secondary - Gold premium
        secondary: "bg-imperium-black text-imperium-gold border-2 border-imperium-gold hover:bg-imperium-gold hover:text-imperium-black active:translate-y-px",

        // Brutal - Glitch effect
        brutal: "bg-transparent text-imperium-crimson border-2 border-imperium-crimson hover:bg-imperium-crimson hover:text-imperium-ivory hover-glitch",

        // Distordu - Overdrive effect
        distordu: "bg-imperium-maroon text-imperium-ivory border-2 border-imperium-maroon hover:distort-skew active:scale-95",

        // Glow - Neon style
        glow: "bg-transparent text-imperium-crimson border border-imperium-crimson shadow-[0_0_10px_rgba(220,20,60,0.5)] hover:shadow-[0_0_25px_rgba(220,20,60,0.8)] hover:bg-imperium-crimson/10",

        // Ghost
        ghost: "bg-transparent text-imperium-ivory border border-imperium-iron hover:bg-imperium-iron hover:border-imperium-ivory",

        // Outline - Inverted
        outline: "bg-transparent text-imperium-ivory border-2 border-imperium-ivory hover:bg-imperium-ivory hover:text-imperium-black",

        // Destructive
        destructive: "bg-imperium-maroon text-imperium-ivory border-2 border-imperium-maroon hover:bg-imperium-crimson hover:border-imperium-crimson",
      },
      size: {
        xs: "h-8 px-3 text-xs",
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-8 text-lg",
        xl: "h-16 px-10 text-xl",
        icon: "size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ImperiumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const ImperiumButton = React.forwardRef<HTMLButtonElement, ImperiumButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
ImperiumButton.displayName = "ImperiumButton"

export { ImperiumButton, buttonVariants }
