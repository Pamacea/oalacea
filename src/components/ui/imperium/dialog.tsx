import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Imperium Dialog Component
 * Warhammer 40K inspired brutalist dialog
 *
 * Features:
 * - Square corners (no border radius)
 * - Crimson border glow
 * - Dark backdrop
 * - Strong visual hierarchy
 */

const ImperiumDialog = DialogPrimitive.Root

const ImperiumDialogTrigger = DialogPrimitive.Trigger

const ImperiumDialogPortal = DialogPrimitive.Portal

const ImperiumDialogClose = DialogPrimitive.Close

const ImperiumDialogOverlay = DialogPrimitive.Overlay

const ImperiumDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ImperiumDialogPortal>
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-imperium-black/80 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      )}
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[85%] translate-x-[-50%] translate-y-[-50%]",
        "border-2 border-imperium-crimson bg-imperium-black-raise",
        "shadow-[0_0_50px_rgba(220,20,60,0.3)]",
        "rounded-none p-6",
        "duration-200",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className
      )}
      {...props}
    >
      {/* Crimson accent line at top */}
      <div className="absolute left-0 top-0 right-0 h-1 bg-imperium-crimson" />

      {children}
      <DialogPrimitive.Close
        className={cn(
          "absolute right-4 top-4 rounded-none p-2",
          "text-imperium-ivory-muted hover:text-imperium-crimson",
          "hover:bg-imperium-crimson/10",
          "transition-colors"
        )}
      >
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </ImperiumDialogPortal>
))
ImperiumDialogContent.displayName = DialogPrimitive.Content.displayName

const ImperiumDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left border-b-2 border-imperium-iron pb-4 mb-4",
      className
    )}
    {...props}
  />
)
ImperiumDialogHeader.displayName = "ImperiumDialogHeader"

const ImperiumDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 border-t-2 border-imperium-iron pt-4 mt-4",
      className
    )}
    {...props}
  />
)
ImperiumDialogFooter.displayName = "ImperiumDialogFooter"

const ImperiumDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-bold text-imperium-ivory uppercase tracking-wider",
      className
    )}
    {...props}
  />
))
ImperiumDialogTitle.displayName = DialogPrimitive.Title.displayName

const ImperiumDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-imperium-ivory-muted", className)}
    {...props}
  />
))
ImperiumDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  ImperiumDialog,
  ImperiumDialogPortal,
  ImperiumDialogOverlay,
  ImperiumDialogClose,
  ImperiumDialogTrigger,
  ImperiumDialogContent,
  ImperiumDialogHeader,
  ImperiumDialogFooter,
  ImperiumDialogTitle,
  ImperiumDialogDescription,
}
