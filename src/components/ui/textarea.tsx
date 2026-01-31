/**
 * TEXTAREA - Warhammer 40K Brutal Style
 * Angular borders, dark background, terminal aesthetic
 */

import * as React from "react"
import { cn } from "@/lib/utils"

const textareaVariants = {
  variant: {
    default: "bg-imperium-black border-imperium-steel-dark text-imperium-bone focus:border-imperium-crimson",
    crimson: "bg-imperium-black border-imperium-crimson-dark text-imperium-bone focus:border-imperium-crimson-bright",
    gold: "bg-imperium-black border-imperium-gold-dark text-imperium-bone focus:border-imperium-gold",
    warp: "bg-imperium-black border-imperium-warp text-imperium-bone focus:border-imperium-warp-bright",
  }
}

function Textarea({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"textarea"> & { variant?: keyof typeof textareaVariants.variant }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base: NO border-radius, brutal style
        "rounded-none border-2 px-4 py-3 w-full min-h-32 bg-transparent font-terminal text-sm shadow-none transition-colors outline-none resize-y",
        "placeholder:text-imperium-steel-dark placeholder:opacity-50",
        "focus:ring-2 focus:ring-imperium-crimson/20 focus:border-imperium-crimson",
        "disabled:cursor-not-allowed disabled:opacity-50",
        textareaVariants.variant[variant],
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
