"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-imperium-steel-dark text-imperium-crimson focus-visible:border-imperium-crimson focus-visible:shadow-[0_0_0_2px_rgba(154,17,21,0.2)] aspect-square size-4 shrink-0 rounded-none border-2 bg-imperium-black transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-imperium-crimson data-[state=checked]:bg-imperium-crimson data-[state=checked]:shadow-[0_0_10px_rgba(154,17,21,0.4)]",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-imperium-bone absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
