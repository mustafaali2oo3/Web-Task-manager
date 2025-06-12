import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  try {
    // Create a response object
    const res = NextResponse.next()

    // Create the Supabase client
    const supabase = createMiddlewareClient({ req, res })

    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const path = req.nextUrl.pathname

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login", "/signup", "/auth"]
    const isPublicRoute = publicRoutes.some((route) => path === route || path.startsWith("/auth/"))

    // Protected routes that require authentication
    const isProtectedRoute =
      !isPublicRoute && !path.includes("_next") && !path.includes("api") && !path.includes("favicon.ico")

    // If user is not signed in and trying to access a protected route, redirect to home
    if (!session && isProtectedRoute) {
      const redirectUrl = new URL("/", req.url)
      redirectUrl.searchParams.set("redirect", path)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is signed in and trying to access the home page, redirect to dashboard
    if (session && path === "/") {
      const redirectUrl = new URL("/dashboard", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    // If there's an error, just continue without redirection
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
