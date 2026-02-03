import { UserRole } from "@/types/auth"

export type { UserRole } from "@/types/auth"

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 4,
  EDITOR: 3,
  AUTHOR: 2,
  VIEWER: 1,
}

export type Permission =
  | "users:read"
  | "users:write"
  | "users:delete"
  | "posts:read"
  | "posts:write"
  | "posts:publish"
  | "posts:delete"
  | "projects:read"
  | "projects:write"
  | "projects:delete"
  | "comments:moderate"
  | "settings:manage"
  | "activity:read"

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    "users:read",
    "users:write",
    "users:delete",
    "posts:read",
    "posts:write",
    "posts:publish",
    "posts:delete",
    "projects:read",
    "projects:write",
    "projects:delete",
    "comments:moderate",
    "settings:manage",
    "activity:read",
  ],
  EDITOR: [
    "posts:read",
    "posts:write",
    "posts:publish",
    "posts:delete",
    "projects:read",
    "projects:write",
    "projects:delete",
    "comments:moderate",
    "activity:read",
  ],
  AUTHOR: [
    "posts:read",
    "posts:write",
    "posts:publish",
    "projects:read",
    "projects:write",
    "activity:read",
  ],
  VIEWER: ["posts:read", "projects:read"],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => ROLE_PERMISSIONS[role].includes(p))
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => ROLE_PERMISSIONS[role].includes(p))
}

export function hasRoleOrHigher(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function canEditUser(editorRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[editorRole] > ROLE_HIERARCHY[targetRole]
}

export function getProtectedPaths(): Record<string, UserRole[]> {
  return {
    "/admin/users": ["ADMIN"],
    "/admin/settings": ["ADMIN"],
    "/admin/activity": ["ADMIN", "EDITOR"],
    "/admin/posts": ["ADMIN", "EDITOR", "AUTHOR"],
    "/admin/projects": ["ADMIN", "EDITOR", "AUTHOR"],
    "/admin/comments": ["ADMIN", "EDITOR"],
  }
}

export function isProtectedPath(pathname: string, userRole: UserRole): boolean {
  const protectedPaths = getProtectedPaths()

  for (const [path, allowedRoles] of Object.entries(protectedPaths)) {
    if (pathname.startsWith(path)) {
      return allowedRoles.includes(userRole)
    }
  }

  return false
}

export function getRequiredRole(pathname: string): UserRole | null {
  const protectedPaths = getProtectedPaths()

  for (const [path, allowedRoles] of Object.entries(protectedPaths)) {
    if (pathname.startsWith(path)) {
      return allowedRoles[0] as UserRole
    }
  }

  return null
}

export class AuthorizationError extends Error {
  constructor(message: string = "You do not have permission to perform this action") {
    super(message)
    this.name = "AuthorizationError"
  }
}

export function requirePermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new AuthorizationError(`Required permission: ${permission}`)
  }
}

export function requireRole(userRole: UserRole, requiredRole: UserRole): void {
  if (!hasRoleOrHigher(userRole, requiredRole)) {
    throw new AuthorizationError(`Required role: ${requiredRole}`)
  }
}

export function requireAnyRole(userRole: UserRole, roles: UserRole[]): void {
  if (!roles.includes(userRole)) {
    throw new AuthorizationError(`Required one of roles: ${roles.join(", ")}`)
  }
}
