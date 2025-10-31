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
  if (isApiRoute && !isAuthApiRoute) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Clone the request headers and strip any x-user-* headers to prevent injection
    const requestHeaders = new Headers(req.headers)

    // Remove any x-user-* headers from the original request (prevent injection)
    const headersToRemove: string[] = []
    requestHeaders.forEach((_, key) => {
      if (key.toLowerCase().startsWith('x-user-')) {
        headersToRemove.push(key)
      }
    })
    headersToRemove.forEach(header => requestHeaders.delete(header))

    // Add authenticated user info to headers
    if (req.auth?.user) {
      requestHeaders.set('x-user-merck-id', req.auth.user.merck_id)
      requestHeaders.set('x-user-email', req.auth.user.email)
      requestHeaders.set('x-user-name', req.auth.user.name)
      requestHeaders.set('x-user-surname', req.auth.user.surname)
      if (req.auth.user.image) {
        requestHeaders.set('x-user-image', req.auth.user.image)
      }
    }

    // Return response with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
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
