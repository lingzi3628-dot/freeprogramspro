'use client'

import * as React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  AppWindow,
  Download,
  Users,
  Flag,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  FileText,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNav } from '@/lib/store/nav'
import { apps, reports, auditLogs, downloadsTimeseries, platforms, adminUsers, formatDownloads } from '@/data/mock'
import { cn } from '@/lib/utils'

export function AdminDashboard() {
  const navigate = useNav((s) => s.navigate)
  const ts = React.useMemo(() => downloadsTimeseries(30), [])
  const totalDownloads7d = ts.slice(-7).reduce((s, d) => s + d.count, 0)
  const totalDownloads30d = ts.reduce((s, d) => s + d.count, 0)

  const topApps = [...apps].sort((a, b) => b.downloads - a.downloads).slice(0, 6)
    .map((a) => ({ name: a.name.split(' ')[0], downloads: a.downloads }))

  const platformSplit = platforms.map((p) => ({
    name: p.name,
    value: apps.filter((a) => a.platforms.includes(p.slug as any)).length,
    color: p.color,
  }))

  const openReports = reports.filter((r) => r.status === 'open')
  const pendingReviews = apps.flatMap((a) => a.reviews).filter((r) => r.status === 'pending').slice(0, 4)

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, admin. Here's what's happening across the store.</p>
      </header>

      {/* KPI cards */}
      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<AppWindow className="h-5 w-5" />}
          label="Published apps"
          value={apps.length}
          trend={+3}
          trendLabel="vs last week"
        />
        <KpiCard
          icon={<Download className="h-5 w-5" />}
          label="Downloads (7d)"
          value={formatDownloads(totalDownloads7d)}
          trend={+12.4}
          trendLabel="vs last week"
        />
        <KpiCard
          icon={<Users className="h-5 w-5" />}
          label="Registered users"
          value={adminUsers.length * 1842}
          trend={+8.1}
          trendLabel="vs last week"
        />
        <KpiCard
          icon={<Flag className="h-5 w-5" />}
          label="Pending reports"
          value={openReports.length}
          trend={-2}
          trendLabel="vs last week"
          trendColor="var(--success)"
        />
      </section>

      {/* Charts */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads over time</CardTitle>
            <Badge variant="secondary" className="text-[10px]">30d · {formatDownloads(totalDownloads30d)}</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ts} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="dlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickFormatter={(v) => v.slice(5)}
                    interval={4}
                  />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: any) => [`${v.toLocaleString()} downloads`, '']}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Platform split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformSplit}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {platformSplit.map((p) => (
                      <Cell key={p.name} fill={p.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top apps by downloads</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate({ name: 'admin-apps' })}>
              All apps <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topApps} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={11} width={70} />
                  <Tooltip
                    contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: any) => [`${v.toLocaleString()} downloads`, '']}
                    cursor={{ fill: 'var(--muted)' }}
                  />
                  <Bar dataKey="downloads" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <QueueRow
              icon={<Clock className="h-4 w-4 text-[var(--warning)]" />}
              label="Pending reviews"
              count={pendingReviews.length}
              onClick={() => navigate({ name: 'admin-reviews' })}
            />
            <QueueRow
              icon={<Flag className="h-4 w-4 text-[var(--danger)]" />}
              label="Open reports"
              count={openReports.length}
              onClick={() => navigate({ name: 'admin-reports' })}
            />
            <QueueRow
              icon={<FileText className="h-4 w-4 text-primary" />}
              label="Draft apps"
              count={2}
              onClick={() => navigate({ name: 'admin-apps' })}
            />
            <QueueRow
              icon={<ShieldCheck className="h-4 w-4 text-[var(--success)]" />}
              label="Scans in progress"
              count={1}
              onClick={() => navigate({ name: 'admin-apps' })}
            />
          </CardContent>
        </Card>
      </section>

      {/* Recent audit log */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent audit log</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate({ name: 'admin-audit' })}>
            All entries <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border text-xs">
            {auditLogs.slice(0, 5).map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-2">
                <span className="font-mono text-muted-foreground">{new Date(l.timestamp).toISOString().slice(5, 16).replace('T', ' ')}</span>
                <Badge variant="secondary" className="text-[10px]">{l.action}</Badge>
                <span className="text-foreground">{l.entityType}:<code className="font-mono">{l.entityId}</code></span>
                <span className="ml-auto truncate text-muted-foreground">{l.actor} · {l.ip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  trend,
  trendLabel,
  trendColor,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  trend: number
  trendLabel?: string
  trendColor?: string
}) {
  const isUp = trend >= 0
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-[11px] font-medium',
              isUp ? 'text-[var(--success)]' : 'text-[var(--danger)]'
            )}
            style={trendColor ? { color: trendColor } : undefined}
          >
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        </div>
        <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
        {trendLabel && <div className="mt-0.5 text-[10px] text-muted-foreground/80">{trendLabel}</div>}
      </CardContent>
    </Card>
  )
}

function QueueRow({
  icon,
  label,
  count,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-surface-hover"
    >
      {icon}
      <span className="flex-1 font-medium">{label}</span>
      <Badge variant="outline" className="tabular-nums">{count}</Badge>
      <ArrowRight className="h-3 w-3 text-muted-foreground" />
    </button>
  )
}
