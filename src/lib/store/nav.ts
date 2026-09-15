// Global navigation store for the single-page Free Programs Pro Store.
// Mirrors the spec's URL sitemap (§6) but stays client-side because the
// sandbox preview only exposes the / route.

import { create } from 'zustand'

export type Route =
  | { name: 'home' }
  | { name: 'browse'; platform?: string; category?: string }
  | { name: 'app'; slug: string }
  | { name: 'developer'; slug: string }
  | { name: 'collections' }
  | { name: 'collection'; slug: string }
  | { name: 'search'; q?: string }
  | { name: 'account'; tab?: 'profile' | 'downloads' | 'wishlist' | 'reviews' | 'settings' }
  | { name: 'about' }
  | { name: 'submit' }
  // Admin routes
  | { name: 'admin-dashboard' }
  | { name: 'admin-apps' }
  | { name: 'admin-app-new' }
  | { name: 'admin-app-edit'; id: string; tab?: string }
  | { name: 'admin-versions' }
  | { name: 'admin-reviews' }
  | { name: 'admin-reports' }
  | { name: 'admin-users' }
  | { name: 'admin-audit' }
  | { name: 'admin-analytics' }
  | { name: 'admin-collections' }
  | { name: 'admin-settings' }
  // V2.0 routes
  | { name: 'admin-api-keys' }
  | { name: 'admin-api-key-new' }
  | { name: 'admin-webhooks' }
  | { name: 'admin-signing' }
  | { name: 'admin-signing-new' }
  | { name: 'admin-signing-detail'; id: string }
  | { name: 'admin-signing-policy' }
  | { name: 'admin-signing-audit' }
  | { name: 'admin-api-usage' }
  // Public V2.0 routes
  | { name: 'verify' }
  | { name: 'api-docs' }

type NavState = {
  route: Route
  history: Route[]
  mode: 'public' | 'admin'
  // actions
  navigate: (r: Route) => void
  back: () => void
  setMode: (m: 'public' | 'admin') => void
}

export const useNav = create<NavState>((set, get) => ({
  route: { name: 'home' },
  history: [{ name: 'home' }],
  mode: 'public',
  navigate: (r) =>
    set((s) => ({
      route: r,
      history: [...s.history, r].slice(-30),
    })),
  back: () => {
    const h = get().history
    if (h.length <= 1) return
    const next = h.slice(0, -1)
    set({ route: next[next.length - 1], history: next })
  },
  setMode: (m) =>
    set({
      mode: m,
      route: m === 'admin' ? { name: 'admin-dashboard' } : { name: 'home' },
      history: [m === 'admin' ? { name: 'admin-dashboard' } : { name: 'home' }],
    }),
}))
