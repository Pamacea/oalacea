"use client"

import { SessionProvider } from "next-auth/react"
import { WorldThemeProvider } from "@/components/theme"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <WorldThemeProvider>
        {children}
      </WorldThemeProvider>
    </SessionProvider>
  )
}
