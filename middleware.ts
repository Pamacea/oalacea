import NextAuth from "next-auth"
import { authConfig } from "@/core/auth/auth.config"
import { NextResponse } from "next/server"
import { isProtectedPath, getRequiredRole } from "@/lib/rbac"
import type { UserRole } from "@/types/auth"

const publicPaths = ["/", "/login", "/api/auth"]

// Create Edge-compatible auth instance from config
const { auth } = NextAuth(authConfig)

// Cache for role checks to speed up middleware
const roleCache = new Map<string, { allowed: boolean; timestamp: number }>()
const CACHE_TTL = 5_000 // 5 seconds

function checkRoleCache(pathname: string, userRole: UserRole): boolean | null {
  const cacheKey = `${pathname}:${userRole}`
  const cached = roleCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.allowed
  }

  return null
}

function setRoleCache(pathname: string, userRole: UserRole, allowed: boolean): void {
  const cacheKey = `${pathname}:${userRole}`
  roleCache.set(cacheKey, { allowed, timestamp: Date.now() })
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const isAuthRoute = pathname.startsWith("/api/auth")
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  if (isAuthRoute || isPublicPath) {
    if (isLoggedIn && pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const userRole = req.auth?.user?.role as UserRole | undefined
  const isAdmin = req.auth?.user?.isAdmin === true

  if (!userRole) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Admin redirection to 3D scene
  if (pathname.startsWith("/admin")) {
    const url = req.nextUrl
    const useFallback = url.searchParams.get("fallback") === "true"

    // Redirect admins to 3D scene unless fallback is requested
    if (isAdmin && pathname === "/admin" && !useFallback) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    const cached = checkRoleCache(pathname, userRole)

    if (cached === false) {
      return NextResponse.redirect(new URL("/admin", req.url))
    }

    if (cached === null) {
      const requiredRole = getRequiredRole(pathname)
      const allowed = !requiredRole || isProtectedPath(pathname, userRole)
      setRoleCache(pathname, userRole, allowed)

      if (!allowed) {
        return NextResponse.redirect(new URL("/admin", req.url))
      }
    }
  }

  return
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|_next/webpack-hmr).*)"],
}
