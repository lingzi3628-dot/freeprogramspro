'use client'

import * as React from 'react'
import { SessionProvider } from 'next-auth/react'

// AuthSessionProvider wraps the app so any component can call useSession().
//
// IMPORTANT: We deliberately SKIP rendering SessionProvider during SSR and
// the first client render. This avoids 500 errors when:
//   - NEXTAUTH_SECRET is not set on Vercel yet (NextAuth throws at runtime)
//   - The /api/auth/session endpoint is unreachable
//   - DATABASE_URL is missing (Prisma can't connect)
//
// Error boundaries (React.Component + getDerivedStateFromError) do NOT catch
// errors during SSR — they only catch client-side render errors. So the only
// safe way to make the app resilient to NextAuth config issues is to defer
// the SessionProvider until after mount on the client.
//
// Cost: useSession() returns { status: 'loading' } for one frame on first
// paint, then resolves. The public-user-badge / admin-user-badge components
// already handle the 'loading' state gracefully.
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    // SSR + first client render: render children without SessionProvider.
    // Anonymous browsing works; login state will hydrate after mount.
    return <>{children}</>
  }

  return <SessionProvider>{children}</SessionProvider>
}
