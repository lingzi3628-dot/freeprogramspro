import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Secret admin path — must match ADMIN_SECRET_PATH in app-shell.tsx
const ADMIN_PATH = '/adminkenyaorgfpps'

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname
    const token = req.nextauth.token
    const role = token?.role as string | undefined

    // Only protect the secret admin path
    if (path === ADMIN_PATH || path.startsWith(ADMIN_PATH + '/')) {
      if (!token) {
        const url = new URL('/login', req.url)
        url.searchParams.set('callbackUrl', path)
        url.searchParams.set('error', 'unauthorized')
        return NextResponse.redirect(url)
      }
      if (role !== 'admin' && role !== 'super_admin') {
        const url = new URL('/login', req.url)
        url.searchParams.set('callbackUrl', path)
        url.searchParams.set('error', 'forbidden')
        return NextResponse.redirect(url)
      }
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: '/login' },
  }
)

// Only run middleware on the admin path (and the NextAuth API routes)
export const config = {
  matcher: ['/adminkenyaorgfpps', '/adminkenyaorgfpps/:path*'],
}
