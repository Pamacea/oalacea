"use client"

import * as React from "react"
import { GripVertical } from "lucide-react"
import {
  Group as ResizablePanelGroupPrimitive,
  Panel as ResizablePanelPrimitive,
  Separator as ResizableSeparatorPrimitive,
  type GroupProps,
  type SeparatorProps,
} from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = React.forwardRef<HTMLDivElement, GroupProps>(
  ({ className, ...props }, ref) => (
    <ResizablePanelGroupPrimitive
      elementRef={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
)
ResizablePanelGroup.displayName = "ResizablePanelGroup"

const ResizablePanel = ResizablePanelPrimitive

const ResizableHandle = React.forwardRef<
  HTMLDivElement,
  SeparatorProps & { withHandle?: boolean }
>(({ withHandle, className, ...props }, ref) => (
  <ResizableSeparatorPrimitive
    elementRef={ref as React.RefObject<HTMLDivElement>}
    className={cn(
      "bg-imperium-steel-dark focus-visible:ring-imperium-crimson relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 after:bg-imperium-gold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="bg-imperium-black border-imperium-steel-dark z-10 flex h-4 w-3 items-center justify-center rounded-none border-2">
        <GripVertical className="size-2.5 text-imperium-gold" />
      </div>
    )}
  </ResizableSeparatorPrimitive>
))
ResizableHandle.displayName = "ResizableHandle"

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
