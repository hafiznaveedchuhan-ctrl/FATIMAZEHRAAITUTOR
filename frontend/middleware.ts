import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'

export const middleware = withAuth(
  function middleware(req: NextRequest & { nextauth: any }) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/learn/:path*',
    '/chat/:path*',
    '/profile/:path*',
  ],
}
