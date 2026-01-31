/**
 * CARD - Warhammer 40K Brutal Style
 * Angular borders, dark backgrounds, minimal shadows
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  // Base: NO border-radius by default for brutal style
  "rounded-none border-2 transition-colors",
  {
    variants: {
      variant: {
        // Default - Dark steel
        default: "bg-imperium-black border-imperium-steel-dark text-imperium-bone",

        // Crimson - Blood red border
        crimson: "bg-imperium-black border-imperium-crimson text-imperium-bone border-l-4 border-l-imperium-crimson-bright",

        // Gold - Aged gold border
        gold: "bg-imperium-black border-imperium-gold text-imperium-bone border-l-4 border-l-imperium-gold-bright",

        // Warp - Blue energy
        warp: "bg-imperium-black border-imperium-warp text-imperium-bone border-l-4 border-l-imperium-warp-bright",

        // Iron - Battle forged
        iron: "bg-imperium-iron border-imperium-iron-dark text-imperium-bone",

        // Steel - Mechanicus
        steel: "bg-imperium-steel border-imperium-steel-dark text-imperium-bone",

        // Brutal - Offset shadow
        brutal: "bg-imperium-black border-imperium-crimson text-imperium-bone shadow-[4px_4px_0_rgba(90,10,10,0.5)] hover:shadow-[2px_2px_0_rgba(90,10,10,0.5)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, size, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, size, className }))}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col space-y-1.5",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("font-display text-lg uppercase tracking-wider text-imperium-bone", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("font-terminal text-sm text-imperium-steel", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("pt-0", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center pt-4 mt-4 border-t border-imperium-steel-dark", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
}
