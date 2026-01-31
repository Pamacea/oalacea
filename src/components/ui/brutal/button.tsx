/**
 * BRUTAL BUTTON - Le bouton qui tremble
 * Pas de safe design - glitch permanent, décalé, agressif
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const brutalButtonVariants = cva(
  // Base: PAS de radius, bold, glitch ready
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-bold transition-all disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        // CRIMSON - Le sang impérial
        crimson: "bg-imperium-crimson text-white border-2 border-imperium-crimson hover:bg-imperium-crimson-bright hover:shadow-[0_0_30px_rgba(154,17,21,0.6)] active:translate-y-px",

        // GOLD - L'or impérial
        gold: "bg-imperium-gold text-imperium-black-deep border-2 border-imperium-gold hover:bg-imperium-gold-brightness hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] active:translate-y-px",

        // BRUTAL - Le glitch violent
        brutal: "bg-transparent text-imperium-crimson border-2 border-imperium-crimson hover:bg-imperium-crimson hover:text-white",

        // CORRUPTED - Data corruption
        corrupted: "bg-imperium-charcoal text-imperium-teal border-2 border-imperium-teal font-mono hover:animate-glitch-skew",

        // RUSTED - Le métal oxydé
        rusted: "bg-imperium-rust text-white border-2 border-imperium-earth hover:opacity-80",

        // GHOST - Minimal
        ghost: "bg-transparent text-imperium-metal border border-imperium-metal-dark hover:bg-imperium-metal hover:text-white",
      },
      size: {
        xs: "h-8 px-3 text-xs",
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-8 text-lg",
        xl: "h-16 px-10 text-xl",
        icon: "size-12 p-0",
      },
      // DÉCALAGE - Offset aléatoire pour le côté brutal
      offset: {
        none: "",
        "1": "translate-x-[-2px] translate-y-[1px] rotate-[-0.5deg]",
        "2": "translate-x-[2px] translate-y-[-1px] rotate-[0.5deg]",
        "3": "translate-x-[-1px] translate-y-[2px] rotate-[1deg]",
      },
    },
    defaultVariants: {
      variant: "crimson",
      size: "md",
      offset: "none",
    },
  }
)

export interface BrutalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof brutalButtonVariants> {
  asChild?: boolean
  showGlitch?: boolean
}

const BrutalButton = React.forwardRef<HTMLButtonElement, BrutalButtonProps>(
  ({ className, variant, size, offset, asChild = false, showGlitch = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const [isHovered, setIsHovered] = React.useState(false)

    return (
      <motion.div
        className="inline-block"
        animate={showGlitch ? {
          x: [0, -1, 1, -0.5, 0.5, 0],
          y: [0, 0.5, -0.5, 0.25, -0.25, 0],
        } : {}}
        transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 0.5 }}
      >
        <Comp
          ref={ref}
          className={cn(brutalButtonVariants({ variant, size, offset, className }))}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...props}
        >
          {/* Glitch overlay - TOUJOURS ACTIF si showGlitch */}
          {showGlitch && (
            <>
              <motion.div
                className="absolute inset-0 bg-imperium-crimson/40 pointer-events-none"
                animate={{
                  x: [0, -10, 10, -5, 5, 0],
                  opacity: [0.3, 0.6, 0.4, 0.7, 0.5, 0.3],
                }}
                transition={{ duration: 0.2, repeat: Infinity, repeatType: "reverse" }}
              />
              <motion.div
                className="absolute inset-0 bg-imperium-teal/30 pointer-events-none"
                animate={{
                  x: [0, 10, -10, 5, -5, 0],
                  opacity: [0.2, 0.5, 0.3, 0.6, 0.4, 0.2],
                }}
                transition={{ duration: 0.18, repeat: Infinity, repeatType: "reverse" }}
              />
            </>
          )}

          {/* Glitch extra on hover */}
          {isHovered && (
            <>
              <motion.div
                className="absolute inset-0 bg-imperium-crimson/50 pointer-events-none"
                animate={{
                  x: [0, -15, 15, -8, 8, 0],
                  opacity: [0, 0.7, 0.5, 0.8, 0.6, 0],
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute inset-0 bg-imperium-teal/40 pointer-events-none"
                animate={{
                  x: [0, 15, -15, 8, -8, 0],
                  opacity: [0, 0.5, 0.7, 0.6, 0.8, 0],
                }}
                transition={{ duration: 0.3 }}
              />
            </>
          )}

          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none opacity-30"
               style={{
                 backgroundImage: `linear-gradient(transparent 50%, rgba(0,0,0,0.4) 50%)`,
                 backgroundSize: "100% 4px"
               }}
          />

          {props.children}
        </Comp>
      </motion.div>
    )
  }
)
BrutalButton.displayName = "BrutalButton"

export { BrutalButton, brutalButtonVariants }
