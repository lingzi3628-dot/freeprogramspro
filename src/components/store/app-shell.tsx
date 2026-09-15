'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import {
  Search,
  Bell,
  Home,
  LayoutGrid,
  Library,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Shield,
  FileText,
  Key,
  Webhook,
  ShieldCheck,
  BarChart3,
  BookOpen,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNav, type Route } from '@/lib/store/nav'
import { platforms } from '@/data/mock'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PlatformBadge } from '@/components/store/platform-badge'
import { Chip } from '@/components/store/primitives'

// Monogram for the brand
function FPMonogram({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-[22%] font-bold text-white',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, #1a73e8 0%, #7c3aed 100%)',
        letterSpacing: '-0.08em',
      }}
      aria-label="Free Programs Pro Store"
    >
      FP
    </div>
  )
}

// Secret admin path — change this to a different value if you want to move the admin panel.
export const ADMIN_SECRET_PATH = '/adminkenyaorgfpps'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const storeMode = useNav((s) => s.mode)
  // If we're rendering on the secret admin route, force admin mode regardless of store state
  const isAdminRoute = pathname === ADMIN_SECRET_PATH || pathname?.startsWith(ADMIN_SECRET_PATH + '/')
  const mode = isAdminRoute ? 'admin' : storeMode
  return mode === 'admin' ? <AdminShell>{children}</AdminShell> : <PublicShell>{children}</PublicShell>
}

// ===========================================================================
// PUBLIC SHELL
// ===========================================================================

function PublicShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />
      <PlatformChipsBar />
      {/* Desktop 2-column layout */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 gap-0">
        <DesktopSidebar collapsed={!sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
        <main className="min-w-0 flex-1 pb-24 md:pb-0">{children}</main>
      </div>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  )
}

function TopBar() {
  const navigate = useNav((s) => s.navigate)
  const [q, setQ] = React.useState('')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({ name: 'search', q })
  }
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur md:px-5">
      {/* Mobile: logo + search pill */}
      <button
        className="flex shrink-0 items-center gap-2 md:mr-2"
        onClick={() => navigate({ name: 'home' })}
        aria-label="Home"
      >
        <FPMonogram className="h-7 w-7 text-[11px]" />
        <span className="hidden text-sm font-semibold tracking-tight md:inline lg:inline">Free Programs Pro</span>
      </button>

      <form onSubmit={submit} className="relative flex-1 md:max-w-xl lg:max-w-2xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search apps, extensions, developers…"
          className="h-9 rounded-full border-border bg-muted pl-9 pr-9 text-sm"
          aria-label="Search"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline">
          /
        </kbd>
      </form>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hidden rounded-full md:inline-flex"
          onClick={() => navigate({ name: 'submit' })}
        >
          <Sparkles className="mr-1.5 h-4 w-4" />
          Submit app
        </Button>
        <button
          className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-muted"
          onClick={() => navigate({ name: 'account' })}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback style={{ background: 'linear-gradient(135deg,#1a73e8,#7c3aed)' }} className="text-white">
              SP
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-xs font-medium md:inline lg:inline">Sam P.</span>
        </button>
      </div>
    </header>
  )
}

function PlatformChipsBar() {
  const navigate = useNav((s) => s.navigate)
  const route = useNav((s) => s.route)
  const activePlatform = route.name === 'browse' ? route.platform : undefined
  return (
    <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur md:hidden">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 py-2">
        <Chip selected={!activePlatform} onClick={() => navigate({ name: 'browse' })}>
          All
        </Chip>
        {platforms.map((p) => (
          <Chip
            key={p.slug}
            selected={activePlatform === p.slug}
            onClick={() => navigate({ name: 'browse', platform: p.slug })}
          >
            {p.name}
          </Chip>
        ))}
      </div>
    </div>
  )
}

function DesktopSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const navigate = useNav((s) => s.navigate)
  const route = useNav((s) => s.route)

  const isHome = route.name === 'home'
  const isBrowse = route.name === 'browse' || route.name === 'app'

  const navItem = (
    label: string,
    icon: React.ReactNode,
    active: boolean,
    onClick: () => void,
    key?: string
  ) => (
    <button
      key={key}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-surface-hover'
      )}
      title={collapsed ? label : undefined}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  )

  return (
    <aside
      className={cn(
        'sticky top-[60px] hidden h-[calc(100vh-60px)] shrink-0 flex-col gap-1 border-r border-border bg-background py-3 md:flex',
        collapsed ? 'w-[60px] px-2' : 'w-[240px] px-3'
      )}
    >
      <div className="mb-1 flex items-center justify-between">
        {!collapsed && <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Browse</span>}
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      {navItem('Home', <Home className="h-4 w-4" />, isHome, () => navigate({ name: 'home' }))}
      {navItem('All apps', <LayoutGrid className="h-4 w-4" />, isBrowse && !('platform' in route && route.platform), () => navigate({ name: 'browse' }))}
      {navItem('Library', <Library className="h-4 w-4" />, route.name === 'account', () => navigate({ name: 'account' }))}

      {!collapsed && <span className="mt-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Platforms</span>}
      {platforms.map((p) =>
        navItem(
          p.name,
          <PlatformBadgeIcon slug={p.slug} />,
          isBrowse && 'platform' in route && route.platform === p.slug,
          () => navigate({ name: 'browse', platform: p.slug }),
          p.slug
        )
      )}

      {!collapsed && <span className="mt-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Resources</span>}
      {navItem('About', <FileText className="h-4 w-4" />, route.name === 'about', () => navigate({ name: 'about' }), 'about')}
      {navItem('Verify a file', <ShieldCheck className="h-4 w-4" />, route.name === 'verify', () => navigate({ name: 'verify' }), 'verify')}
      {navItem('Public API docs', <BookOpen className="h-4 w-4" />, route.name === 'api-docs', () => navigate({ name: 'api-docs' }), 'api-docs')}

      <div className="mt-auto space-y-1 pt-3">
        {/* Admin panel is intentionally hidden — accessible only via /adminkenyaorgfpps */}
      </div>
    </aside>
  )
}

function PlatformBadgeIcon({ slug }: { slug: string }) {
  // Reuse the small SVG marks
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      {slug === 'windows' && (
        <path d="M3 5.5l7.5-1v7H3V5.5zm8.5-1.2L21 3v8.5h-9.5V4.3zM3 12.5h7.5v7L3 18.5v-6zm8.5 0H21V21l-9.5-1.3v-7.2z" />
      )}
      {(slug === 'linux' || slug === 'ubuntu') && (
        <>
          <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="4" r="2.2" />
          <circle cx="20" cy="14" r="2.2" />
          <circle cx="6" cy="18" r="2.2" />
        </>
      )}
      {slug === 'android' && (
        <path d="M6 10.5h12v6a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 16.5v-6zm-2.5 0a1.5 1.5 0 011.5 1.5v4a1.5 1.5 0 01-1.5 1.5A1.5 1.5 0 012 16v-4a1.5 1.5 0 011.5-1.5zm17 0A1.5 1.5 0 0122 12v4a1.5 1.5 0 01-3 0v-4a1.5 1.5 0 011.5-1.5zM8 5l1-1.7a.3.3 0 01.5 0L9.6 4.2a8 8 0 014.8 0l.1-.9a.3.3 0 01.5 0L16 5a5.5 5.5 0 012.5 4.6v.4H5.5v-.4A5.5 5.5 0 018 5z" />
      )}
      {slug === 'chrome' && (
        <>
          <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="3.5" />
        </>
      )}
    </svg>
  )
}

function MobileBottomNav() {
  const navigate = useNav((s) => s.navigate)
  const route = useNav((s) => s.route)
  const item = (
    label: string,
    icon: React.ReactNode,
    active: boolean,
    onClick: () => void
  ) => (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
        active ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
      {label}
    </button>
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-border bg-background safe-bottom md:hidden">
      {item('Home', <Home className="h-5 w-5" />, route.name === 'home', () => navigate({ name: 'home' }))}
      {item('Apps', <LayoutGrid className="h-5 w-5" />, route.name === 'browse' || route.name === 'app', () => navigate({ name: 'browse' }))}
      {item('Search', <Search className="h-5 w-5" />, route.name === 'search', () => navigate({ name: 'search' }))}
      {item('Library', <Library className="h-5 w-5" />, route.name === 'account', () => navigate({ name: 'account' }))}
      {item('Me', <User className="h-5 w-5" />, false, () => navigate({ name: 'account' }))}
    </nav>
  )
}

function SiteFooter() {
  const navigate = useNav((s) => s.navigate)
  const setMode = useNav((s) => s.setMode)
  return (
    <footer className="mt-auto hidden border-t border-border bg-muted/30 md:block">
      <div className="mx-auto max-w-[1440px] px-6 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <FPMonogram className="h-7 w-7 text-[11px]" />
              <span className="text-sm font-semibold">Free Programs Pro Store</span>
            </div>
            <p className="max-w-sm text-xs text-muted-foreground">
              The cleanest, most trustworthy place to discover and download free software across desktop,
              mobile, and browser. Verified files. Transparent checksums. No piracy.
            </p>
            <Badge variant="secondary" className="text-[10px]">v2.0 · API + Code signing + Per-platform upload</Badge>
          </div>
          <FooterCol title="Store" links={['Browse all', 'New releases', "Editor's picks", 'Collections']} onLink={(i) => i === 0 && navigate({ name: 'browse' })} />
          <FooterCol title="Platforms" links={platforms.map((p) => p.name)} onLink={(i) => navigate({ name: 'browse', platform: platforms[i].slug })} />
          <FooterCol title="Resources" links={['About', 'Submit app', 'Verify a file', 'Public API docs', 'Privacy', 'Terms', 'DMCA']} onLink={(i) => {
            if (i === 0) navigate({ name: 'about' })
            else if (i === 2) navigate({ name: 'verify' })
            else if (i === 3) navigate({ name: 'api-docs' })
          }} />
          <FooterCol title="Internal" links={['Status']} onLink={() => {}} />
        </div>
        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© 2026 Free Programs Pro. Open source where applicable.</p>
          <div className="flex items-center gap-4">
            <span>Built with Next.js, Prisma, and shadcn/ui</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links, onLink }: { title: string; links: string[]; onLink?: (i: number) => void }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      <ul className="space-y-1.5">
        {links.map((l, i) => (
          <li key={l}>
            <button
              onClick={() => onLink?.(i)}
              className="text-xs text-foreground/80 hover:text-primary"
            >
              {l}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ===========================================================================
// ADMIN SHELL
// ===========================================================================

function AdminShell({ children }: { children: React.ReactNode }) {
  const navigate = useNav((s) => s.navigate)
  const route = useNav((s) => s.route)

  const nav: { label: string; route: Route; icon: React.ReactNode }[] = [
    { label: 'Dashboard', route: { name: 'admin-dashboard' }, icon: <LayoutGrid className="h-4 w-4" /> },
    { label: 'Apps', route: { name: 'admin-apps' }, icon: <LayoutGrid className="h-4 w-4" /> },
    { label: 'New app', route: { name: 'admin-app-new' }, icon: <Sparkles className="h-4 w-4" /> },
    { label: 'Reviews queue', route: { name: 'admin-reviews' }, icon: <Bell className="h-4 w-4" /> },
    { label: 'Reports', route: { name: 'admin-reports' }, icon: <Shield className="h-4 w-4" /> },
    { label: 'Users & roles', route: { name: 'admin-users' }, icon: <User className="h-4 w-4" /> },
    { label: 'Analytics', route: { name: 'admin-analytics' }, icon: <BarChart3 className="h-4 w-4" /> },
    { label: 'Audit logs', route: { name: 'admin-audit' }, icon: <FileText className="h-4 w-4" /> },
    { label: 'Settings', route: { name: 'admin-settings' }, icon: <FileText className="h-4 w-4" /> },
    // V2.0 sections
    { label: 'API keys', route: { name: 'admin-api-keys' }, icon: <Key className="h-4 w-4" /> },
    { label: 'Webhooks', route: { name: 'admin-webhooks' }, icon: <Webhook className="h-4 w-4" /> },
    { label: 'Signing identities', route: { name: 'admin-signing' }, icon: <ShieldCheck className="h-4 w-4" /> },
    { label: 'API usage', route: { name: 'admin-api-usage' }, icon: <BarChart3 className="h-4 w-4" /> },
  ]

  const active = (r: Route) => r.name === route.name

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-background px-3 md:px-5">
        <button className="flex shrink-0 items-center gap-2" onClick={() => navigate({ name: 'admin-dashboard' })}>
          <FPMonogram className="h-7 w-7 text-[11px]" />
          <span className="text-sm font-semibold">Free Programs Pro</span>
          <Badge variant="secondary" className="ml-1 text-[10px]">Admin</Badge>
        </button>
        <form className="relative ml-4 hidden flex-1 md:block md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Jump to app, user, file… (Cmd+K)" className="h-9 rounded-full border-border bg-background pl-9 text-sm" />
        </form>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <a href="/" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-sm font-medium hover:bg-surface-hover">
            <Home className="mr-1.5 h-4 w-4" /> Exit to store
          </a>
          <Avatar className="h-8 w-8">
            <AvatarFallback style={{ background: 'linear-gradient(135deg,#1a73e8,#7c3aed)' }} className="text-white">
              AD
            </AvatarFallback>
          </Avatar>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 gap-0">
        <aside className="sticky top-14 hidden h-[calc(100vh-56px)] w-[240px] shrink-0 flex-col gap-1 border-r border-border bg-background p-3 md:flex">
          <span className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Manage</span>
          {nav.map((n) => (
            <button
              key={n.label}
              onClick={() => navigate(n.route)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active(n.route) ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-surface-hover'
              )}
            >
              {n.icon}
              <span>{n.label}</span>
            </button>
          ))}
          <div className="mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start rounded-lg"
              onClick={() => navigate({ name: 'admin-app-new' })}
            >
              <Sparkles className="mr-2 h-4 w-4" /> Create new app
            </Button>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      {/* Mobile admin nav as a horizontal scroll */}
      <div className="md:hidden border-t border-border bg-background sticky bottom-0 safe-bottom">
        <div className="no-scrollbar flex gap-1 overflow-x-auto px-2 py-1.5">
          {nav.map((n) => (
            <button
              key={n.label}
              onClick={() => navigate(n.route)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium',
                active(n.route) ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground/80'
              )}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
