'use client'

import * as React from 'react'
import { SessionProvider } from 'next-auth/react'

// Error boundary so a NextAuth fetch error (e.g. missing NEXTAUTH_SECRET on
// Vercel) doesn't crash the entire app. The user still sees the storefront;
// they just won't be able to login/signup until the env var is fixed.
class AuthErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error) {
    console.warn('[AuthSessionProvider] NextAuth error (likely missing NEXTAUTH_SECRET):', error.message)
  }
  render() {
    if (this.state.hasError) {
      // Just render children without the SessionProvider — the app still
      // works for anonymous browsing, just no logged-in state.
      return <>{this.props.children}</>
    }
    return <SessionProvider>{this.props.children}</SessionProvider>
  }
}

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthErrorBoundary>
      {children}
    </AuthErrorBoundary>
  )
}
