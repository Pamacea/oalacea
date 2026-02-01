"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer data-[state=checked]:bg-imperium-crimson data-[state=unchecked]:bg-imperium-black focus-visible:border-imperium-crimson focus-visible:shadow-[0_0_0_2px_rgba(154,17,21,0.2)] group/switch inline-flex shrink-0 items-center rounded-none border-2 border-imperium-steel-dark transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-5 data-[size=default]:w-9 data-[size=sm]:h-4 data-[size=sm]:w-7",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-imperium-steel pointer-events-none block rounded-none border border-imperium-steel-dark transition-transform group-data-[size=default]/switch:size-3 group-data-[size=sm]/switch:size-2.5 data-[state=checked]:translate-x-[calc(100%-4px)] data-[state=unchecked]:translate-x-0.5 data-[state=checked]:bg-imperium-bone data-[state=checked]:border-imperium-bone"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
