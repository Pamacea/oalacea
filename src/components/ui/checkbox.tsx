"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-none border-2 border-imperium-steel-dark bg-imperium-black transition-all outline-none focus-visible:border-imperium-crimson focus-visible:shadow-[0_0_0_2px_rgba(154,17,21,0.2)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-imperium-crimson data-[state=checked]:bg-imperium-crimson data-[state=checked]:text-imperium-bone",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
