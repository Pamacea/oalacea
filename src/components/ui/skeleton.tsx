import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-imperium-steel/10 animate-pulse rounded-none border border-imperium-steel/20", className)}
      {...props}
    />
  )
}

export { Skeleton }
