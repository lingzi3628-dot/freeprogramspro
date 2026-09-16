'use client'

import * as React from 'react'
import { SessionProvider } from 'next-auth/react'

// AuthSessionProvider wraps the app so any component can call useSession().
//
// Note: NextAuth v4's SessionProvider does NOT fetch /api/auth/session during
// SSR — it only fetches client-side via useEffect after mount. So this wrapper
// is safe to render during SSR. The useSession() hook returns
//   { data: null, status: 'loading' }
// during SSR and the first client paint, then resolves to the actual session
// state once the client-side fetch completes.
//
// If you see runtime 500 errors from /api/auth/session, the cause is almost
// always a missing NEXTAUTH_SECRET env var on Vercel — set it in
// Vercel → Project → Settings → Environment Variables
// (generate one with `openssl rand -base64 32`).
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
