'use client'

import * as React from 'react'
import {
  Plus,
  Webhook as WebhookIcon,
  Activity,
  RefreshCw,
  Trash2,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useNav } from '@/lib/store/nav'
import { webhooks, webhookDeliveries, ALL_WEBHOOK_EVENTS, type WebhookEvent } from '@/data/v2-mock'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

const STATUS_COLOR: Record<number, string> = {
  200: 'text-[var(--success)]',
  4: 'text-[var(--warning)]',
  5: 'text-[var(--danger)]',
}

export function AdminWebhooks() {
  const [createOpen, setCreateOpen] = React.useState(false)
  const [selected, setSelected] = React.useState(webhooks[0])

  const deliveries = webhookDeliveries.filter((d) => d.webhookId === selected.id)

  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Webhooks</h1>
          <p className="text-sm text-muted-foreground">
            {webhooks.length} endpoints · {webhooks.filter((w) => w.active).length} active · {webhooks.filter((w) => w.failureCount >= 5).length} dead-lettered
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> New webhook
        </Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_460px]">
        {/* Webhook list */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Events</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Last delivery</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {webhooks.map((w) => (
                <tr
                  key={w.id}
                  className={cn('cursor-pointer hover:bg-surface-hover', selected?.id === w.id && 'bg-primary/5')}
                  onClick={() => setSelected(w)}
                >
                  <td className="px-3 py-2">
                    <div className="font-medium">{w.name}</div>
                    <div className="truncate text-[10px] text-muted-foreground">{w.url}</div>
                    <code className="text-[10px] text-muted-foreground">secret…{w.secretLast4}</code>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {w.events.slice(0, 2).map((e) => (
                        <code key={e} className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">{e}</code>
                      ))}
                      {w.events.length > 2 && <span className="text-[10px] text-muted-foreground">+{w.events.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {w.active ? (
                      <Badge className="bg-[var(--success)]/10 text-[var(--success)] text-[10px]">Active</Badge>
                    ) : (
                      <Badge className="bg-[var(--danger)]/10 text-[var(--danger)] text-[10px]">Disabled</Badge>
                    )}
                    {w.failureCount > 0 && (
                      <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] text-[var(--warning)]">
                        <AlertTriangle className="h-2.5 w-2.5" /> {w.failureCount} fail
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {w.lastDeliveryAt ? new Date(w.lastDeliveryAt).toLocaleString().slice(0, 16) : '—'}
                  </td>
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Rotate secret"
                        onClick={() => toast.success('Secret rotated', { description: '24h overlap with previous secret.' })}>
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--destructive)]" aria-label="Delete"
                        onClick={() => toast.success('Webhook deleted')}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delivery log drawer */}
        <aside className="rounded-xl border border-border bg-card p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Activity className="h-4 w-4" /> Delivery log
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{selected.name}</p>
          <div className="mt-3 space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {deliveries.length === 0 ? (
              <p className="text-xs text-muted-foreground">No deliveries yet.</p>
            ) : (
              deliveries.map((d) => (
                <div key={d.id} className={cn(
                  'rounded-lg border p-2.5 text-xs',
                  d.deadLetter ? 'border-[var(--danger)]/30 bg-[var(--danger)]/5'
                  : d.status >= 200 && d.status < 300 ? 'border-[var(--success)]/30 bg-[var(--success)]/5'
                  : 'border-[var(--warning)]/30 bg-[var(--warning)]/5'
                )}>
                  <div className="flex items-center justify-between">
                    <code className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">{d.eventType}</code>
                    <span className={cn('font-mono font-semibold', STATUS_COLOR[Math.floor(d.status / 100) * 100] || 'text-muted-foreground')}>
                      {d.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-muted-foreground">{d.payloadPreview}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="inline-flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" /> {new Date(d.deliveredAt).toLocaleString().slice(0, 16)}
                    </span>
                    <span>·</span>
                    <span>attempt {d.attempt}/5</span>
                    <span>·</span>
                    <span>{d.durationMs}ms</span>
                  </div>
                  {d.nextRetryAt && (
                    <div className="mt-0.5 text-[10px] text-[var(--warning)]">
                      <Clock className="mr-1 inline h-2.5 w-2.5" /> Next retry at {new Date(d.nextRetryAt).toLocaleString().slice(0, 16)}
                    </div>
                  )}
                  {d.deadLetter && (
                    <div className="mt-1 inline-flex items-center gap-1 rounded bg-[var(--danger)]/10 px-1.5 py-0.5 text-[10px] text-[var(--danger)]">
                      <XCircle className="h-2.5 w-2.5" /> Dead-lettered after 5 attempts
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      <CreateWebhookDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

function CreateWebhookDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = React.useState('')
  const [url, setUrl] = React.useState('')
  const [events, setEvents] = React.useState<WebhookEvent[]>(['version.published'])

  const toggle = (e: WebhookEvent) => {
    setEvents((arr) => arr.includes(e) ? arr.filter((x) => x !== e) : [...arr, e])
  }

  const create = () => {
    toast.success('Webhook created', {
      description: 'Secret generated. Webhook secret is shown only once.',
    })
    onOpenChange(false)
    setName(''); setUrl(''); setEvents(['version.published'])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WebhookIcon className="h-4 w-4" /> Create webhook
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Release bot — version.published" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium">URL (HTTPS only)</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://hooks.bot.fppstore.io/fpp-store" className="font-mono text-xs" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Events to subscribe</Label>
            <div className="space-y-1.5">
              {ALL_WEBHOOK_EVENTS.map((e) => (
                <label key={e} className="flex items-center gap-2 rounded-md border border-border p-2">
                  <Checkbox checked={events.includes(e)} onCheckedChange={() => toggle(e)} />
                  <code className="text-[11px] font-mono">{e}</code>
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-2.5 text-xs">
            <AlertTriangle className="mr-1 inline h-3 w-3 text-[var(--warning)]" />
            A webhook secret will be generated on creation. <strong>It is shown only once.</strong> Use it to verify the
            <code className="font-mono"> X-FPP-Signature</code> header (HMAC-SHA256).
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={create} disabled={!name || !url || events.length === 0}>
            <WebhookIcon className="mr-1.5 h-3.5 w-3.5" /> Create webhook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
