"use client"

import { SessionProvider } from "next-auth/react"
import { WorldThemeProvider } from "@/components/theme"
import { TanStackQueryProvider } from "@/shared/lib/query-client"
import { AdminToastProvider } from "@/features/admin/components/AdminOnlyToast"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AdminToastProvider>
        <TanStackQueryProvider>
          <WorldThemeProvider>
            {children}
          </WorldThemeProvider>
        </TanStackQueryProvider>
      </AdminToastProvider>
    </SessionProvider>
  )
}
