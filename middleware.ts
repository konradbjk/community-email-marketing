import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Only protect API routes (backend)
  // Frontend protection is handled client-side
  const isApiRoute = pathname.startsWith("/api")
  const isAuthApiRoute = pathname.startsWith("/api/auth")

  // Protect API routes except auth endpoints
  if (isApiRoute && !isAuthApiRoute && !isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match API routes only
     * Exclude: auth endpoints, static files, images
     */
    "/api/:path*",
  ],
}
