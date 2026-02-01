"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "rounded-none border-2 border-imperium-steel-dark bg-imperium-black text-imperium-bone font-terminal shadow-[4px_4px_0_rgba(58,63,66,0.4)]",
          title: "font-display uppercase tracking-wider text-sm",
          description: "font-terminal text-xs text-imperium-steel",
          actionButton: "rounded-none border-2 border-imperium-crimson bg-imperium-crimson text-imperium-bone hover:bg-imperium-crimson-bright font-display uppercase text-xs",
          cancelButton: "rounded-none border-2 border-imperium-steel-dark bg-imperium-black text-imperium-steel hover:bg-imperium-iron font-display uppercase text-xs",
          error: "border-imperium-crimson text-imperium-crimson",
          success: "border-imperium-steel text-imperium-bone",
          warning: "border-imperium-gold text-imperium-gold",
          info: "border-imperium-steel text-imperium-steel",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-imperium-bone" />,
        info: <InfoIcon className="size-4 text-imperium-crimson" />,
        warning: <TriangleAlertIcon className="size-4 text-imperium-gold" />,
        error: <OctagonXIcon className="size-4 text-imperium-crimson" />,
        loading: <Loader2Icon className="size-4 animate-spin text-imperium-crimson" />,
      }}
      style={
        {
          "--normal-bg": "#1c1c1c",
          "--normal-text": "#e8e4d9",
          "--normal-border": "#3a3f42",
          "--border-radius": "0px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
