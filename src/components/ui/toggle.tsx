"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-none text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-imperium-crimson focus-visible:shadow-[0_0_0_2px_rgba(154,17,21,0.2)] outline-none transition-[color,box-shadow] whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-imperium-black border-2 border-imperium-steel-dark text-imperium-steel hover:bg-imperium-iron hover:text-imperium-bone data-[state=on]:bg-imperium-crimson data-[state=on]:text-imperium-bone data-[state=on]:border-imperium-crimson data-[state=on]:shadow-[0_0_10px_rgba(154,17,21,0.4)]",
        outline:
          "border-2 border-imperium-steel-dark bg-imperium-black text-imperium-steel hover:border-imperium-crimson hover:text-imperium-crimson data-[state=on]:border-imperium-crimson data-[state=on]:text-imperium-crimson data-[state=on]:bg-imperium-crimson/10",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
