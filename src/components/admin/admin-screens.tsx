'use client'

import * as React from 'react'
import {
  Search,
  Plus,
  ArrowUpDown,
  Pencil,
  Copy,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  Flag,
  XCircle,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useNav } from '@/lib/store/nav'
import { apps, reports, adminUsers, auditLogs, type App } from '@/data/mock'
import { platforms } from '@/data/mock'
import { TrustBadge } from '@/components/store/primitives'
import { Rating } from '@/components/store/rating'
import { formatDownloads, timeAgo } from '@/data/mock'
import { cn } from '@/lib/utils'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

// ===========================================================================
// ADMIN APP LIST
// ===========================================================================

export function AdminAppList() {
  const navigate = useNav((s) => s.navigate)
  const [q, setQ] = React.useState('')
  const [platform, setPlatform] = React.useState<string>('all')
  const [status, setStatus] = React.useState<string>('all')
  const [sort, setSort] = React.useState<'name' | 'downloads' | 'updated' | 'rating'>('updated')

  let filtered = apps.filter((a) => {
    if (q && !(`${a.name} ${a.developer}`.toLowerCase().includes(q.toLowerCase()))) return false
    if (platform !== 'all' && !a.platforms.includes(platform as any)) return false
    if (status !== 'all' && a.status !== status) return false
    return true
  })

  filtered = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'name': return a.name.localeCompare(b.name)
      case 'downloads': return b.downloads - a.downloads
      case 'rating': return b.ratingAvg - a.ratingAvg
      default: return +new Date(b.updatedAt) - +new Date(a.updatedAt)
    }
  })

  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Apps</h1>
          <p className="text-sm text-muted-foreground">{apps.length} apps · {filtered.length} shown</p>
        </div>
        <Button onClick={() => navigate({ name: 'admin-app-new' })}>
          <Plus className="mr-1.5 h-4 w-4" /> New app
        </Button>
      </header>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or developer"
            className="h-9 rounded-full border-border bg-background pl-9"
          />
        </div>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="h-9 w-[150px] rounded-full bg-background text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {platforms.map((p) => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[130px] rounded-full bg-background text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v: any) => setSort(v)}>
          <SelectTrigger className="h-9 w-[150px] rounded-full bg-background text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Sort: Updated</SelectItem>
            <SelectItem value="name">Sort: Name</SelectItem>
            <SelectItem value="downloads">Sort: Downloads</SelectItem>
            <SelectItem value="rating">Sort: Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground">
            <tr>
              <Th label="App" />
              <Th label="Platforms" />
              <Th label="Status" />
              <Th label="Rating" sortable />
              <Th label="Downloads" sortable />
              <Th label="Updated" sortable />
              <Th label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-surface-hover">
                <td className="px-3 py-2">
                  <button onClick={() => navigate({ name: 'admin-app-edit', id: a.id })} className="flex items-center gap-2 text-left">
                    <span className="flex h-8 w-8 items-center justify-center rounded-[22%] text-[10px] font-semibold text-white" style={{ background: `linear-gradient(135deg, ${a.iconGradient[0]}, ${a.iconGradient[1]})` }}>
                      {a.iconText}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{a.name}</div>
                      <div className="truncate text-[10px] text-muted-foreground">{a.developer}</div>
                    </div>
                  </button>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {a.platforms.slice(0, 4).map((p) => (
                      <span key={p} className="h-2 w-2 rounded-full" style={{ background: platforms.find((x) => x.slug === p)?.color }} title={p} />
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={a.status as any} />
                </td>
                <td className="px-3 py-2">
                  <Rating value={a.ratingAvg} count={a.ratingCount} showCount={false} size={11} />
                </td>
                <td className="px-3 py-2 tabular-nums text-muted-foreground">{formatDownloads(a.downloads)}</td>
                <td className="px-3 py-2 text-muted-foreground">{timeAgo(a.updatedAt)}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate({ name: 'admin-app-edit', id: a.id })} aria-label="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Duplicate"
                      onClick={() => toast.success('Duplicated', { description: `${a.name} (copy) created as draft` })}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--destructive)]" aria-label="Delete"
                      onClick={() => toast.success('Archived', { description: `${a.name} soft-deleted` })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ label, sortable }: { label: string; sortable?: boolean }) {
  return (
    <th className="px-3 py-2 font-medium">
      <span className="inline-flex items-center gap-1">
        {label}
        {sortable && <ArrowUpDown className="h-3 w-3 opacity-50" />}
      </span>
    </th>
  )
}

function StatusBadge({ status }: { status: 'published' | 'draft' | 'scheduled' | 'archived' }) {
  const styles = {
    published: 'bg-[var(--success)]/10 text-[var(--success)]',
    draft: 'bg-muted text-muted-foreground',
    scheduled: 'bg-[var(--warning)]/10 text-[var(--warning)]',
    archived: 'bg-[var(--danger)]/10 text-[var(--danger)]',
  }[status]
  return <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium uppercase', styles)}>{status}</span>
}

// ===========================================================================
// ADMIN REVIEWS QUEUE
// ===========================================================================

export function AdminReviewsQueue() {
  const allReviews = apps.flatMap((a) => a.reviews.map((r) => ({ ...r, app: a }))).slice(0, 8)
  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Reviews queue</h1>
        <p className="text-sm text-muted-foreground">{allReviews.length} reviews · 2 pending moderation</p>
      </header>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground">
            <tr>
              <Th label="App" />
              <Th label="User" />
              <Th label="Rating" />
              <Th label="Excerpt" />
              <Th label="Date" />
              <Th label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allReviews.map((r) => (
              <tr key={r.id} className="hover:bg-surface-hover">
                <td className="px-3 py-2 font-medium">{r.app.name}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback style={{ background: r.avatarColor }} className="text-[9px] text-white">
                        {r.author.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{r.author}</span>
                  </div>
                </td>
                <td className="px-3 py-2"><Rating value={r.rating} showCount={false} size={11} /></td>
                <td className="px-3 py-2 max-w-[280px] truncate text-muted-foreground">"{r.body}"</td>
                <td className="px-3 py-2 text-muted-foreground">{timeAgo(r.createdAt)}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--success)]" aria-label="Approve"
                      onClick={() => toast.success('Approved')}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--warning)]" aria-label="Hide"
                      onClick={() => toast.success('Hidden')}>
                      <EyeOff className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--destructive)]" aria-label="Delete"
                      onClick={() => toast.success('Deleted')}>
                      <XCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ===========================================================================
// ADMIN REPORTS QUEUE
// ===========================================================================

export function AdminReportsQueue() {
  const [selected, setSelected] = React.useState(reports[0])
  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Reports queue</h1>
        <p className="text-sm text-muted-foreground">{reports.filter((r) => r.status === 'open').length} open · {reports.filter((r) => r.status === 'resolved').length} resolved</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <Th label="Type" />
                <Th label="Target" />
                <Th label="Reason" />
                <Th label="Status" />
                <Th label="Date" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.map((r) => (
                <tr
                  key={r.id}
                  className={cn('cursor-pointer hover:bg-surface-hover', selected?.id === r.id && 'bg-primary/5')}
                  onClick={() => setSelected(r)}
                >
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="text-[10px]">{r.type}</Badge>
                  </td>
                  <td className="px-3 py-2 font-medium">{r.target}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.reason}</td>
                  <td className="px-3 py-2">
                    {r.status === 'open' ? <Badge className="bg-[var(--warning)]/10 text-[var(--warning)] text-[10px]">Open</Badge>
                      : r.status === 'resolved' ? <Badge className="bg-[var(--success)]/10 text-[var(--success)] text-[10px]">Resolved</Badge>
                      : <Badge variant="secondary" className="text-[10px]">Dismissed</Badge>}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{timeAgo(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail drawer */}
        <aside className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-[var(--danger)]" />
            <h2 className="text-sm font-semibold">{selected.target}</h2>
          </div>
          <dl className="mt-3 space-y-2 text-xs">
            <Row label="Type" value={selected.type} />
            <Row label="Reason" value={selected.reason} />
            <Row label="Reporter" value={selected.reporter} />
            <Row label="Status" value={selected.status} />
            <Row label="Filed" value={timeAgo(selected.createdAt)} />
          </dl>
          <div className="mt-3 rounded-lg bg-muted/40 p-3 text-xs">
            <h3 className="font-medium">Description</h3>
            <p className="mt-1 text-muted-foreground">{selected.description}</p>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="default" size="sm" onClick={() => toast.success('Resolved')}>
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Resolve
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success('Dismissed')}>
              <XCircle className="mr-1.5 h-3.5 w-3.5" /> Dismiss
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}

// ===========================================================================
// ADMIN USERS
// ===========================================================================

export function AdminUsersScreen() {
  const [q, setQ] = React.useState('')
  const filtered = adminUsers.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Users & roles</h1>
        <p className="text-sm text-muted-foreground">{adminUsers.length} demo users · {adminUsers.filter((u) => u.banned).length} banned</p>
      </header>
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users" className="h-9 rounded-full border-border bg-card pl-9" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground">
            <tr>
              <Th label="User" />
              <Th label="Role" />
              <Th label="Joined" />
              <Th label="Reviews" />
              <Th label="Downloads" />
              <Th label="Status" />
              <Th label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-surface-hover">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback style={{ background: 'linear-gradient(135deg,#1a73e8,#7c3aed)' }} className="text-[10px] text-white">
                        {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-[10px] text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Badge variant="outline" className="text-[10px]">{u.role}</Badge>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{timeAgo(u.joinedAt)}</td>
                <td className="px-3 py-2 tabular-nums">{u.reviews}</td>
                <td className="px-3 py-2 tabular-nums">{u.downloads}</td>
                <td className="px-3 py-2">
                  {u.banned
                    ? <Badge className="bg-[var(--destructive)]/10 text-[var(--destructive)] text-[10px]">Banned</Badge>
                    : <Badge className="bg-[var(--success)]/10 text-[var(--success)] text-[10px]">Active</Badge>}
                </td>
                <td className="px-3 py-2">
                  <Button variant="ghost" size="sm" className="h-7 text-xs"
                    onClick={() => toast.info(u.banned ? 'Unbanned' : 'Banned', { description: u.name })}>
                    {u.banned ? 'Unban' : 'Ban'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ===========================================================================
// ADMIN AUDIT LOGS
// ===========================================================================

export function AdminAuditScreen() {
  const [q, setQ] = React.useState('')
  const filtered = auditLogs.filter((l) => `${l.actor} ${l.action} ${l.entityId}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="text-sm text-muted-foreground">Every admin write action — read-only, exportable.</p>
      </header>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by actor, action, entity" className="h-9 rounded-full border-border bg-card pl-9" />
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success('Exported', { description: 'audit-logs.csv sent to downloads' })}>
          Export CSV
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground">
            <tr>
              <Th label="Timestamp" />
              <Th label="Actor" />
              <Th label="Action" />
              <Th label="Entity" />
              <Th label="IP" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-surface-hover">
                <td className="px-3 py-2 font-mono text-muted-foreground">{new Date(l.timestamp).toISOString().slice(0, 19).replace('T', ' ')}</td>
                <td className="px-3 py-2">{l.actor}</td>
                <td className="px-3 py-2">
                  <Badge variant="secondary" className="text-[10px] font-mono">{l.action}</Badge>
                </td>
                <td className="px-3 py-2">
                  <span className="text-muted-foreground">{l.entityType}:</span>
                  <code className="font-mono">{l.entityId}</code>
                </td>
                <td className="px-3 py-2 font-mono text-muted-foreground">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ===========================================================================
// ADMIN ANALYTICS
// ===========================================================================

export function AdminAnalyticsScreen() {
  // Re-use some of the dashboard data but show fuller funnel / referrers tables
  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Privacy-respecting analytics · Plausible self-hosted · No PII</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <KpiBox label="Pageviews (7d)" value="48.2K" trend="+14.2%" />
        <KpiBox label="App detail views (7d)" value="12.4K" trend="+9.1%" />
        <KpiBox label="Downloads (7d)" value="4.8K" trend="+12.4%" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Funnel: view → detail → download</h2>
          <div className="mt-3 space-y-2 text-xs">
            <FunnelBar label="Browse / home" pct={100} count="48,200" />
            <FunnelBar label="App detail" pct={62} count="29,900" />
            <FunnelBar label="Initiated download" pct={24} count="11,600" />
            <FunnelBar label="Verified download" pct={19} count="9,200" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Top referrers (7d)</h2>
          <ul className="mt-3 space-y-1.5 text-xs">
            {[
              { src: 'Google search', count: '18,420', pct: 38 },
              { src: 'Direct / None', count: '9,820', pct: 20 },
              { src: 'news.ycombinator.com', count: '4,310', pct: 9 },
              { src: 'github.com', count: '3,920', pct: 8 },
              { src: 'reddit.com/r/linux', count: '2,100', pct: 4 },
            ].map((r) => (
              <li key={r.src} className="flex items-center gap-3">
                <span className="w-44 truncate">{r.src}</span>
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="tabular-nums text-muted-foreground">{r.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function KpiBox({ label, value, trend }: { label: string; value: string; trend: string }) {
  const up = trend.startsWith('+')
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      <div className={cn('mt-0.5 text-xs', up ? 'text-[var(--success)]' : 'text-[var(--danger)]')}>{trend}</div>
    </div>
  )
}

function FunnelBar({ label, pct, count }: { label: string; pct: number; count: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">{count} ({pct}%)</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ===========================================================================
// ADMIN SETTINGS
// ===========================================================================

export function AdminSettingsScreen() {
  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">General, SEO, storage, email, security, integrations.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <SettingsCard title="General">
          <LabeledInput label="Site name" defaultValue="Free Programs Pro Store" />
          <LabeledInput label="Tagline" defaultValue="Curated, verified, free software" />
          <LabeledInput label="Contact email" defaultValue="hello@fppstore.io" />
        </SettingsCard>
        <SettingsCard title="SEO">
          <LabeledInput label="Default meta title" defaultValue="Free Programs Pro Store" />
          <LabeledInput label="Default meta description" defaultValue="Browse and download free, verified software…" />
          <div className="flex items-center justify-between">
            <span className="text-xs">Generate sitemap.xml</span>
            <Badge className="bg-[var(--success)]/10 text-[var(--success)] text-[10px]">On</Badge>
          </div>
        </SettingsCard>
        <SettingsCard title="Storage (S3-compatible)">
          <LabeledInput label="Endpoint" defaultValue="s3.amazonaws.com" />
          <LabeledInput label="Bucket" defaultValue="fppstore-prod" />
          <LabeledInput label="Region" defaultValue="us-east-1" />
          <LabeledInput label="Public URL" defaultValue="https://cdn.fppstore.io" />
        </SettingsCard>
        <SettingsCard title="Email (Resend)">
          <LabeledInput label="From address" defaultValue="no-reply@fppstore.io" />
          <LabeledInput label="API key" defaultValue="re_••••••••••••••" type="password" />
        </SettingsCard>
        <SettingsCard title="Security">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium">2FA required for admins</div>
              <p className="text-[10px] text-muted-foreground">TOTP only. Enforced on next login.</p>
            </div>
            <Badge className="bg-[var(--success)]/10 text-[var(--success)] text-[10px]">Enforced</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium">Session length</div>
              <p className="text-[10px] text-muted-foreground">Max 8 hours for admin sessions.</p>
            </div>
            <span className="text-xs tabular-nums">8h</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium">IP allowlist (admin)</div>
              <p className="text-[10px] text-muted-foreground">Optional. Empty = any IP.</p>
            </div>
            <span className="text-xs text-muted-foreground">none</span>
          </div>
        </SettingsCard>
        <SettingsCard title="Integrations">
          {[
            { name: 'VirusTotal', status: 'connected', desc: 'Async malware scans on upload' },
            { name: 'Sentry', status: 'connected', desc: 'Error & performance monitoring' },
            { name: 'Stripe', status: 'off', desc: 'Donations + Pro membership (v1.1)' },
            { name: 'Resend', status: 'connected', desc: 'Transactional email' },
          ].map((i) => (
            <div key={i.name} className="flex items-center justify-between border-b border-border py-2 last:border-0">
              <div>
                <div className="text-xs font-medium">{i.name}</div>
                <div className="text-[10px] text-muted-foreground">{i.desc}</div>
              </div>
              <Badge className={cn(
                'text-[10px]',
                i.status === 'connected' ? 'bg-[var(--success)]/10 text-[var(--success)]'
                : 'bg-muted text-muted-foreground'
              )}>{i.status}</Badge>
            </div>
          ))}
        </SettingsCard>
      </div>
    </div>
  )
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3 space-y-3">
        {children}
      </div>
    </div>
  )
}

function LabeledInput({ label, defaultValue, type = 'text' }: { label: string; defaultValue?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
      />
    </label>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
