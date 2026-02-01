/**
 * BADGE - Warhammer 40K Brutal Style
 * Angular borders, terminal style, colored variants
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Base: NO border-radius, sharp edges, terminal font
  "inline-flex items-center justify-center rounded-none border-2 px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap font-terminal uppercase tracking-wider",
  {
    variants: {
      variant: {
        // Default - Steel
        default: "bg-imperium-steel text-imperium-bone border-imperium-steel-dark",

        // Crimson - Blood
        crimson: "bg-imperium-crimson text-imperium-bone border-imperium-crimson-dark",

        // Gold - Premium
        gold: "bg-imperium-gold text-imperium-black border-imperium-gold-dark",

        // Warp - Blue energy
        warp: "bg-imperium-warp text-imperium-bone border-imperium-warp-bright",

        // Iron - Battle forged
        iron: "bg-imperium-iron text-imperium-bone border-imperium-iron-dark",

        // Ghost - Minimal
        ghost: "bg-transparent text-imperium-steel border border-imperium-steel-dark",

        // Outline - Sharp border
        outline: "bg-transparent text-imperium-bone border-2 border-imperium-steel",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
