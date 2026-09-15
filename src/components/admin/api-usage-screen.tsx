'use client'

import * as React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts'
import {
  Zap, Activity, AlertTriangle, CheckCircle2, TrendingUp, ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { apiUsageTimeseries, apiEndpointUsage, TIER_LIMITS } from '@/data/v2-mock'
import { useNav } from '@/lib/store/nav'
import { cn } from '@/lib/utils'

export function AdminApiUsage() {
  const navigate = useNav((s) => s.navigate)
  const ts = React.useMemo(() => apiUsageTimeseries(24), [])
  const total24h = ts.reduce((s, b) => s + b.requests, 0)
  const ok24h = ts.reduce((s, b) => s + b.statusClass['2xx'], 0)
  const err24h = ts.reduce((s, b) => s + b.statusClass['4xx'] + b.statusClass['5xx'], 0)
  const errRate = (err24h / total24h * 100).toFixed(2)

  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">API usage</h1>
          <p className="text-sm text-muted-foreground">Last 24h across all keys. Privacy-respecting — no PII in telemetry.</p>
        </div>
        <Button variant="outline" onClick={() => navigate({ name: 'admin-api-keys' })}>
          Manage keys <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </header>

      {/* KPIs */}
      <section className="grid gap-3 md:grid-cols-4">
        <Kpi icon={<Activity className="h-4 w-4" />} label="Requests (24h)" value={total24h.toLocaleString()} />
        <Kpi icon={<CheckCircle2 className="h-4 w-4 text-[var(--success)]" />} label="2xx responses" value={ok24h.toLocaleString()} pct={`${(ok24h / total24h * 100).toFixed(1)}%`} />
        <Kpi icon={<AlertTriangle className="h-4 w-4 text-[var(--danger)]" />} label="Errors (4xx + 5xx)" value={err24h.toLocaleString()} pct={`${errRate}%`} />
        <Kpi icon={<Zap className="h-4 w-4 text-primary" />} label="Tier caps (active keys)" value="Partner" pct="6K rpm" />
      </section>

      {/* Request volume chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Request volume (24h, hourly)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ts} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(v) => v.slice(11, 13)} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                <Tooltip
                  contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any, n: string) => [v.toLocaleString(), n === 'requests' ? 'Requests' : n]}
                />
                <Line type="monotone" dataKey="requests" stroke="var(--primary)" strokeWidth={2} dot={false} name="Requests" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status class distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Status class distribution (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ts} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(v) => v.slice(11, 13)} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                <Tooltip
                  contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any, n: string) => [v.toLocaleString(), n]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="2xx" stackId="a" fill="var(--success)" name="2xx" />
                <Bar dataKey="4xx" stackId="a" fill="var(--warning)" name="4xx" />
                <Bar dataKey="5xx" stackId="a" fill="var(--destructive)" name="5xx" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top endpoints */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top endpoints (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-2 py-1.5 font-medium">Endpoint</th>
                  <th className="px-2 py-1.5 font-medium">Scope</th>
                  <th className="px-2 py-1.5 font-medium text-right">Calls (24h)</th>
                  <th className="px-2 py-1.5 font-medium text-right">p95 latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {apiEndpointUsage.map((e) => (
                  <tr key={e.endpoint} className="hover:bg-surface-hover">
                    <td className="px-2 py-1.5 font-mono text-[11px]">{e.endpoint}</td>
                    <td className="px-2 py-1.5"><Badge variant="outline" className="text-[10px]">{e.scope}</Badge></td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{e.calls.toLocaleString()}</td>
                    <td className={cn('px-2 py-1.5 text-right tabular-nums', e.p95 > 1000 ? 'text-[var(--warning)]' : '')}>{e.p95}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tier table reference */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Rate limit tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-2 py-1.5 font-medium">Tier</th>
                  <th className="px-2 py-1.5 font-medium">Req/min</th>
                  <th className="px-2 py-1.5 font-medium">Burst</th>
                  <th className="px-2 py-1.5 font-medium">Uploads (concurrent)</th>
                  <th className="px-2 py-1.5 font-medium">Catalog reads</th>
                  <th className="px-2 py-1.5 font-medium">Storage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(['free', 'developer', 'partner', 'enterprise'] as const).map((tier) => (
                  <tr key={tier}>
                    <td className="px-2 py-1.5 font-medium capitalize">{tier}</td>
                    <td className="px-2 py-1.5 tabular-nums">{TIER_LIMITS[tier].rpm || 'Custom'}</td>
                    <td className="px-2 py-1.5 tabular-nums">{TIER_LIMITS[tier].burst || 'Custom'}</td>
                    <td className="px-2 py-1.5 tabular-nums">{TIER_LIMITS[tier].uploads || 'Custom'}</td>
                    <td className="px-2 py-1.5">{TIER_LIMITS[tier].reads}</td>
                    <td className="px-2 py-1.5">{TIER_LIMITS[tier].storage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Every response includes <code className="font-mono">X-RateLimit-*</code>, <code className="font-mono">X-Quota-*</code>, and <code className="font-mono">X-Request-Id</code> headers.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function Kpi({ icon, label, value, pct }: { icon: React.ReactNode; label: string; value: string; pct?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">{icon}</span>
          {pct && <Badge variant="outline" className="text-[10px]">{pct}</Badge>}
        </div>
        <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  )
}
