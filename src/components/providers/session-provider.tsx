"use client"

import { SessionProvider } from "next-auth/react"
import { WorldThemeProvider } from "@/components/theme"
import { TanStackQueryProvider } from "@/shared/lib/query-client"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <TanStackQueryProvider>
        <WorldThemeProvider>
          {children}
        </WorldThemeProvider>
      </TanStackQueryProvider>
    </SessionProvider>
  )
}
