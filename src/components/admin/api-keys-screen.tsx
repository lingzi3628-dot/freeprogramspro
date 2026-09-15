'use client'

import * as React from 'react'
import {
  Search,
  Plus,
  Key as KeyIcon,
  Copy,
  Check,
  RefreshCw,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Clock,
  ChevronRight,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNav } from '@/lib/store/nav'
import {
  apiKeys,
  ALL_SCOPES,
  TIER_LIMITS,
  generatePlaintextKey,
  type ApiKey,
  type ApiKeyType,
  type ApiTier,
  type ApiScope,
} from '@/data/v2-mock'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'

export function AdminApiKeys() {
  const navigate = useNav((s) => s.navigate)
  const [q, setQ] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [createOpen, setCreateOpen] = React.useState(false)
  const [newlyCreated, setNewlyCreated] = React.useState<{ plaintext: string; id: string } | null>(null)
  const [saved, setSaved] = React.useState(false)

  const filtered = apiKeys.filter((k) => {
    if (q && !`${k.name} ${k.owner} ${k.prefix}${k.last4}`.toLowerCase().includes(q.toLowerCase())) return false
    if (statusFilter !== 'all' && k.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">API keys</h1>
          <p className="text-sm text-muted-foreground">
            {apiKeys.length} keys · {apiKeys.filter((k) => k.status === 'active').length} active · {apiKeys.filter((k) => k.status === 'grace').length} in grace
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> New API key
        </Button>
      </header>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, owner, or last4"
            className="h-9 rounded-full border-border bg-background pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[150px] rounded-full bg-background text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="grace">In grace</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key list */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Key</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Scopes</th>
              <th className="px-3 py-2 font-medium">Tier</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Last used</th>
              <th className="px-3 py-2 font-medium">Requests (today)</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((k) => (
              <tr key={k.id} className="hover:bg-surface-hover">
                <td className="px-3 py-2">
                  <div className="font-medium">{k.name}</div>
                  <code className="font-mono text-[10px] text-muted-foreground">{k.prefix}<span className="opacity-50">••••••••••••••••</span>{k.last4}</code>
                  <div className="text-[10px] text-muted-foreground">{k.owner}</div>
                </td>
                <td className="px-3 py-2">
                  <Badge variant="outline" className="text-[10px] font-mono">{k.type}</Badge>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {k.scopes.slice(0, 3).map((s) => (
                      <code key={s} className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">{s}</code>
                    ))}
                    {k.scopes.length > 3 && <span className="text-[10px] text-muted-foreground">+{k.scopes.length - 3}</span>}
                  </div>
                </td>
                <td className="px-3 py-2 capitalize">{k.tier}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={k.status} graceUntil={k.graceUntil} />
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString().slice(0, 16) : '—'}
                </td>
                <td className="px-3 py-2 tabular-nums text-muted-foreground">{k.requestsToday.toLocaleString()}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Rotate"
                      onClick={() => toast.success('Rotation started', { description: 'Old key enters 7-day grace.' })}>
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--destructive)]" aria-label="Revoke"
                      onClick={() => toast.success('Revoked', { description: 'All in-flight requests will fail on next call.' })}>
                      <XCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(plaintext, id) => { setNewlyCreated({ plaintext, id }); setSaved(false) }}
      />

      {/* Plaintext-once reveal modal */}
      <Dialog open={!!newlyCreated} onOpenChange={(o) => { if (!o) setNewlyCreated(null) }}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyIcon className="h-4 w-4" /> Your new API key
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border-2 border-[var(--warning)]/30 bg-[var(--warning)]/5 p-3 text-xs">
              <AlertTriangle className="mr-1 inline h-3 w-3 text-[var(--warning)]" />
              This is the <strong>only time</strong> we'll show the plaintext. Only a SHA-256 hash is stored server-side. Copy it now.
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3">
              <code className="flex-1 break-all font-mono text-[11px]">{newlyCreated?.plaintext}</code>
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard?.writeText(newlyCreated?.plaintext || ''); toast.success('Copied') }}>
                <Copy className="mr-1 h-3 w-3" /> Copy
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="saved" checked={saved} onCheckedChange={(v) => setSaved(!!v)} />
              <Label htmlFor="saved" className="text-xs">I've stored my key securely</Label>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={!saved} onClick={() => { setNewlyCreated(null); toast.success('Key created', { description: 'Active immediately.' }) }}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatusBadge({ status, graceUntil }: { status: ApiKey['status']; graceUntil?: string }) {
  const styles = {
    active: 'bg-[var(--success)]/10 text-[var(--success)]',
    grace: 'bg-[var(--warning)]/10 text-[var(--warning)]',
    expired: 'bg-muted text-muted-foreground',
    revoked: 'bg-[var(--destructive)]/10 text-[var(--destructive)]',
  }[status]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase', styles)}>
      {status === 'grace' && <Clock className="h-2.5 w-2.5" />}
      {status === 'revoked' && <ShieldAlert className="h-2.5 w-2.5" />}
      {status}
      {status === 'grace' && graceUntil && (
        <span className="normal-case opacity-80">· {Math.max(0, Math.ceil((+new Date(graceUntil) - Date.now()) / (24 * 60 * 60 * 1000)))}d left</span>
      )}
    </span>
  )
}

function CreateKeyDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: (plaintext: string, id: string) => void
}) {
  const [step, setStep] = React.useState(1)
  const [name, setName] = React.useState('')
  const [type, setType] = React.useState<ApiKeyType>('live')
  const [owner, setOwner] = React.useState('')
  const [scopes, setScopes] = React.useState<ApiScope[]>(['catalog:read'])
  const [tier, setTier] = React.useState<ApiTier>('free')
  const [ipAllow, setIpAllow] = React.useState('')
  const [referrerAllow, setReferrerAllow] = React.useState('')
  const [notes, setNotes] = React.useState('')

  const reset = () => {
    setStep(1); setName(''); setType('live'); setOwner(''); setScopes(['catalog:read'])
    setTier('free'); setIpAllow(''); setReferrerAllow(''); setNotes('')
  }

  const toggleScope = (s: ApiScope) => {
    setScopes((arr) => arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s])
  }

  const create = () => {
    const plaintext = generatePlaintextKey(type)
    onCreated(plaintext, `ak_new_${Date.now()}`)
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create API key
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-3">
            <Field label="Key name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="CI/CD - GitHub Actions" />
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Type">
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live secret (fpp_live_)</SelectItem>
                    <SelectItem value="test">Test secret (fpp_test_)</SelectItem>
                    <SelectItem value="publish">Publish token (fpp_pub_)</SelectItem>
                    <SelectItem value="read">Public read key (fpp_read_)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Owner (user or service account)">
                <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="release-bot (service)" />
              </Field>
            </div>
            <Field label="Rate limit tier">
              <Select value={tier} onValueChange={(v: any) => setTier(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free · 60 rpm · 100K reads/mo</SelectItem>
                  <SelectItem value="developer">Developer · 600 rpm · 5M reads/mo</SelectItem>
                  <SelectItem value="partner">Partner · 6K rpm · 100M reads/mo</SelectItem>
                  <SelectItem value="enterprise">Enterprise · Custom</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Req/min:</span> <span className="font-medium">{TIER_LIMITS[tier].rpm || 'Custom'}</span></div>
                <div><span className="text-muted-foreground">Burst:</span> <span className="font-medium">{TIER_LIMITS[tier].burst || 'Custom'}</span></div>
                <div><span className="text-muted-foreground">Catalog reads:</span> <span className="font-medium">{TIER_LIMITS[tier].reads}</span></div>
                <div><span className="text-muted-foreground">Storage:</span> <span className="font-medium">{TIER_LIMITS[tier].storage}</span></div>
              </div>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={() => setStep(2)} disabled={!name || !owner}>Next: scopes</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <Field label="Scopes">
              <p className="text-[11px] text-muted-foreground">Wildcards are not allowed. Select exactly what this key needs.</p>
              <div className="mt-1 space-y-1.5">
                {ALL_SCOPES.map((s) => (
                  <label key={s.scope} className="flex items-start gap-2 rounded-md border border-border p-2">
                    <Checkbox checked={scopes.includes(s.scope)} onCheckedChange={() => toggleScope(s.scope)} />
                    <div className="flex-1">
                      <code className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-mono text-primary">{s.scope}</code>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{s.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Field>
            <div className="flex justify-between border-t border-border pt-3">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} disabled={scopes.length === 0}>Next: restrictions</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <Field label="IP allowlist (CIDR, one per line)">
              <Textarea
                rows={3}
                value={ipAllow}
                onChange={(e) => setIpAllow(e.target.value)}
                placeholder="192.0.2.0/24&#10;203.0.113.42"
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">Empty = any IP. Enforced at edge before routing.</p>
            </Field>
            {type === 'read' && (
              <Field label="Referrer allowlist (glob patterns, one per line)">
                <Textarea
                  rows={3}
                  value={referrerAllow}
                  onChange={(e) => setReferrerAllow(e.target.value)}
                  placeholder="https://freeprogramspro.store/*"
                  className="font-mono text-xs"
                />
              </Field>
            )}
            <Field label="Notes (internal, not shown to API consumers)">
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What is this key used for?" />
            </Field>
            <div className="flex justify-between border-t border-border pt-3">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={create}>
                <KeyIcon className="mr-1.5 h-3.5 w-3.5" /> Create key
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs font-medium">{label}</Label>
      {children}
    </div>
  )
}
