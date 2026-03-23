import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'

export const middleware = withAuth(
  function middleware(req: NextRequest & { nextauth: any }) {
    const { pathname } = req.nextUrl

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/learn', '/chat', '/profile', '/pricing']

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    )

    // If protected route and no session, redirect to login
    if (isProtectedRoute && !req.nextauth.token) {
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // If on auth pages and have session, redirect to dashboard
    const isAuthRoute = pathname.startsWith('/auth')
    if (isAuthRoute && req.nextauth.token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Token exists means user is authenticated
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/learn/:path*',
    '/chat/:path*',
    '/profile/:path*',
    '/pricing/:path*',
    '/auth/:path*',
  ],
}
