import { cn } from "@/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-imperium-steel text-imperium-bone pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-none border-2 border-imperium-steel-dark px-1 font-terminal text-xs uppercase select-none",
        "[&_svg:not([class*='size-'])]:size-3",
        "[&:has([data-slot=tooltip-content])]:bg-imperium-steel/30",
        className
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
