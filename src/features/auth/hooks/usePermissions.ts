"use client"

import { useSession } from "next-auth/react"
import { hasPermission, hasRoleOrHigher, type Permission, type UserRole } from "@/lib/rbac"

export function usePermissions() {
  const { data: session } = useSession()
  const role = session?.user?.role

  return {
    can: (permission: Permission) => {
      if (!role) return false
      return hasPermission(role, permission)
    },
    canAny: (permissions: Permission[]) => {
      if (!role) return false
      return permissions.some((p) => hasPermission(role, p))
    },
    canAll: (permissions: Permission[]) => {
      if (!role) return false
      return permissions.every((p) => hasPermission(role, p))
    },
    hasRole: (requiredRole: UserRole) => {
      if (!role) return false
      return hasRoleOrHigher(role, requiredRole)
    },
    role: role as UserRole | undefined,
    isAdmin: role === "ADMIN",
    isEditor: role === "EDITOR",
    isAuthor: role === "AUTHOR",
    isViewer: role === "VIEWER",
  }
}
