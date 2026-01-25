import { auth } from "@/core/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnLoginPage = req.nextUrl.pathname === "/login"
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")

  if (isAuthRoute) return

  if (!isLoggedIn && !isOnLoginPage) {
    return Response.redirect(new URL("/login", req.url))
  }

  if (isLoggedIn && isOnLoginPage) {
    return Response.redirect(new URL("/", req.url))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
