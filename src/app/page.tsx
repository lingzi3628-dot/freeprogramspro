'use client'

import * as React from 'react'
import { AppShell } from '@/components/store/app-shell'
import { HomeScreen } from '@/components/store/home-screen'
import { BrowseScreen } from '@/components/store/browse-screen'
import { AppDetailScreen } from '@/components/store/app-detail-screen'
import { SearchScreen } from '@/components/store/search-screen'
import { AccountScreen } from '@/components/store/account-screen'
import { AboutScreen } from '@/components/store/about-screen'
import { SubmitScreen } from '@/components/store/submit-screen'
import { AdminDashboard } from '@/components/admin/dashboard'
import { AdminAppEditor } from '@/components/admin/app-editor'
import {
  AdminAppList,
  AdminReviewsQueue,
  AdminReportsQueue,
  AdminUsersScreen,
  AdminAuditScreen,
  AdminAnalyticsScreen,
  AdminSettingsScreen,
} from '@/components/admin/admin-screens'
import { apps, type App } from '@/data/mock'
import { useNav } from '@/lib/store/nav'

export default function Home() {
  const route = useNav((s) => s.route)
  const navigate = useNav((s) => s.navigate)

  // Scroll to top on route change
  React.useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
  }, [route])

  return (
    <AppShell>
      <RouteRenderer route={route} navigate={navigate} apps={apps} />
    </AppShell>
  )
}

function RouteRenderer({
  route,
  navigate,
  apps,
}: {
  route: ReturnType<typeof useNav.getState>['route']
  navigate: ReturnType<typeof useNav.getState>['navigate']
  apps: App[]
}) {
  switch (route.name) {
    case 'home':
      return <HomeScreen apps={apps} />
    case 'browse':
      return <BrowseScreen apps={apps} initialPlatform={route.platform} />
    case 'app': {
      const app = apps.find((a) => a.slug === route.slug)
      if (!app) return <NotFound onHome={() => navigate({ name: 'home' })} />
      return <AppDetailScreen app={app} allApps={apps} />
    }
    case 'search':
      return <SearchScreen apps={apps} />
    case 'account':
      return <AccountScreen apps={apps} />
    case 'about':
      return <AboutScreen />
    case 'submit':
      return <SubmitScreen />
    // Admin routes
    case 'admin-dashboard':
      return <AdminDashboard />
    case 'admin-apps':
      return <AdminAppList />
    case 'admin-app-new':
      return <AdminAppEditor mode="new" />
    case 'admin-app-edit': {
      const app = apps.find((a) => a.id === route.id)
      return <AdminAppEditor app={app} mode="edit" />
    }
    case 'admin-reviews':
      return <AdminReviewsQueue />
    case 'admin-reports':
      return <AdminReportsQueue />
    case 'admin-users':
      return <AdminUsersScreen />
    case 'admin-audit':
      return <AdminAuditScreen />
    case 'admin-analytics':
      return <AdminAnalyticsScreen />
    case 'admin-settings':
      return <AdminSettingsScreen />
    default:
      return <NotFound onHome={() => navigate({ name: 'home' })} />
  }
}

function NotFound({ onHome }: { onHome: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="text-4xl font-semibold tabular-nums text-muted-foreground/30">404</div>
      <h1 className="text-lg font-semibold">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you were looking for doesn't exist, or has been moved. Use the navigation to find what you need.
      </p>
      <button onClick={onHome} className="mt-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover">
        Go to home
      </button>
    </div>
  )
}
