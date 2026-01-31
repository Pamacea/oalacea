/**
 * INPUT - Warhammer 40K Brutal Style
 * Angular borders, dark background, terminal aesthetic
 */

import * as React from "react"
import { cn } from "@/lib/utils"

const inputVariants = {
  variant: {
    default: "bg-imperium-black border-imperium-steel-dark text-imperium-bone focus:border-imperium-crimson",
    crimson: "bg-imperium-black border-imperium-crimson-dark text-imperium-bone focus:border-imperium-crimson-bright",
    gold: "bg-imperium-black border-imperium-gold-dark text-imperium-bone focus:border-imperium-gold",
    warp: "bg-imperium-black border-imperium-warp text-imperium-bone focus:border-imperium-warp-bright",
  }
}

function Input({
  className,
  type,
  variant = "default",
  ...props
}: React.ComponentProps<"input"> & { variant?: keyof typeof inputVariants.variant }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base: NO border-radius, brutal style
        "rounded-none border-2 px-4 py-2 w-full min-w-0 bg-transparent font-terminal text-sm shadow-none transition-colors outline-none",
        "placeholder:text-imperium-steel-dark placeholder:opacity-50",
        "focus:ring-2 focus:ring-imperium-crimson/20 focus:border-imperium-crimson",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:text-imperium-bone file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        inputVariants.variant[variant],
        className
      )}
      {...props}
    />
  )
}

export { Input }
