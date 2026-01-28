import { auth } from "@/core/auth"
import { NextResponse } from "next/server"
import { requirePermission, requireRole, type Permission, type UserRole } from "@/lib/rbac"
import type { Session } from "next-auth"

export async function withAuth(
  handler: (request: Request, session: Session) => Promise<Response> | Response
) {
  return async (request: Request) => {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return handler(request, session)
  }
}

export async function withPermission(
  permission: Permission,
  handler: (request: Request, session: Session) => Promise<Response> | Response
) {
  return withAuth(async (request, session) => {
    try {
      requirePermission(session.user.role, permission)
      return handler(request, session)
    } catch (error) {
      if (error instanceof Error && error.name === "AuthorizationError") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      throw error
    }
  })
}

export async function withRole(
  role: UserRole,
  handler: (request: Request, session: Session) => Promise<Response> | Response
) {
  return withAuth(async (request, session) => {
    try {
      requireRole(session.user.role, role)
      return handler(request, session)
    } catch (error) {
      if (error instanceof Error && error.name === "AuthorizationError") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      throw error
    }
  })
}

export function checkPermission(role: UserRole, permission: Permission): boolean {
  try {
    requirePermission(role, permission)
    return true
  } catch {
    return false
  }
}
