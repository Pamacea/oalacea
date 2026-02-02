/**
 * BUTTON - Warhammer 40K Brutal Style
 * Angular borders, dark colors, minimal effects
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base: NO border-radius, sharp edges
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-imperium-crimson/50",
  {
    variants: {
      variant: {
        // Default - Steel dark
        default: "bg-imperium-steel text-imperium-bone border-2 border-imperium-steel-dark hover:bg-imperium-steel-light hover:border-imperium-steel",

        // Primary - Blood red
        primary: "bg-imperium-crimson text-imperium-bone border-2 border-imperium-crimson-dark hover:bg-imperium-crimson-bright",

        // Secondary - Aged gold
        secondary: "bg-imperium-gold text-imperium-black border-2 border-imperium-gold-dark hover:bg-imperium-gold-bright",

        // Ghost - Minimal
        ghost: "bg-transparent text-imperium-steel border border-imperium-steel-dark hover:bg-imperium-steel/10 hover:text-imperium-bone",

        // Outline - Sharp border
        outline: "bg-transparent text-imperium-bone border-2 border-imperium-steel hover:bg-imperium-steel hover:text-imperium-black",

        // Warp - Blue energy
        warp: "bg-imperium-warp text-imperium-bone border-2 border-imperium-warp-bright hover:bg-imperium-warp-bright hover:shadow-[0_0_15px_rgba(58,90,122,0.5)]",

        // Brutal - Raw glitch
        brutal: "bg-transparent text-imperium-crimson border-2 border-imperium-crimson hover:bg-imperium-crimson hover:text-imperium-bone",

        // Iron - Battle forged
        iron: "bg-imperium-iron text-imperium-bone border-2 border-imperium-iron-dark hover:bg-imperium-iron-light",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
