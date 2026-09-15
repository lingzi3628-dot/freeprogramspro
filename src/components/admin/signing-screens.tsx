'use client'

import * as React from 'react'
import {
  Plus,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
  Copy,
  XCircle,
  RefreshCw,
  ChevronRight,
  Fingerprint,
  FileText,
  KeySquare,
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
import { signingIdentities, type SigningIdentity, type SigningScheme } from '@/data/v2-mock'
import { platforms, type PlatformSlug } from '@/data/mock'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

export function AdminSigningIdentities() {
  const navigate = useNav((s) => s.navigate)
  const [addOpen, setAddOpen] = React.useState(false)
  const [identities, setIdentities] = React.useState(signingIdentities)

  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Signing identities</h1>
          <p className="text-sm text-muted-foreground">
            {identities.length} identities · {identities.filter((i) => i.status === 'active').length} active · {identities.filter((i) => i.status === 'revoked').length} revoked
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ name: 'admin-signing-policy' })}>
            <FileText className="mr-1.5 h-4 w-4" /> Trust policy
          </Button>
          <Button variant="outline" onClick={() => navigate({ name: 'admin-signing-audit' })}>
            <Activity className="mr-1.5 h-4 w-4" /> Audit log
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add identity
          </Button>
        </div>
      </header>

      <div className="rounded-lg border-2 border-[var(--warning)]/30 bg-[var(--warning)]/5 p-3 text-xs">
        <AlertTriangle className="mr-1 inline h-3 w-3 text-[var(--warning)]" />
        <strong>Private key policy:</strong> We never ask for private keys. Upload only the public certificate or public key.
        Signing happens outside our platform (on the publisher's machine or CI). We verify the resulting signature.
      </div>

      {/* Identities grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {identities.map((id) => (
          <button
            key={id.id}
            onClick={() => navigate({ name: 'admin-signing-detail', id: id.id })}
            className="rounded-xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full',
                  id.status === 'active' ? 'bg-[var(--success)]/10 text-[var(--success)]'
                  : id.status === 'revoked' ? 'bg-[var(--destructive)]/10 text-[var(--destructive)]'
                  : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                )}>
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{id.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{id.platform} · {id.scheme}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <dl className="mt-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Thumbprint</dt>
                <dd><code className="font-mono text-[10px]">{id.thumbprintSha256.slice(0, 16)}…</code></dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Validity</dt>
                <dd>{new Date(id.notBefore).toLocaleDateString()} → {new Date(id.notAfter).toLocaleDateString()}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Apps signed</dt>
                <dd className="font-medium tabular-nums">{id.appsSigned}</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
              <StatusBadge status={id.status} />
              {id.status === 'revoked' && id.revokedReason && (
                <span className="truncate text-[10px] text-muted-foreground" title={id.revokedReason}>
                  {id.revokedReason.slice(0, 40)}…
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <AddIdentityDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={(newId) => setIdentities((arr) => [newId, ...arr])}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: SigningIdentity['status'] }) {
  const styles = {
    active: 'bg-[var(--success)]/10 text-[var(--success)]',
    grace: 'bg-[var(--warning)]/10 text-[var(--warning)]',
    revoked: 'bg-[var(--destructive)]/10 text-[var(--destructive)]',
  }[status]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase', styles)}>
      {status === 'active' ? <ShieldCheck className="h-2.5 w-2.5" /> : <ShieldOff className="h-2.5 w-2.5" />}
      {status}
    </span>
  )
}

function AddIdentityDialog({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onAdded: (id: SigningIdentity) => void
}) {
  const [name, setName] = React.useState('')
  const [platform, setPlatform] = React.useState<PlatformSlug>('windows')
  const [scheme, setScheme] = React.useState<SigningScheme>('authenticode')
  const [pem, setPem] = React.useState('')
  const [thumbprint, setThumbprint] = React.useState<string>('')
  const [computing, setComputing] = React.useState(false)
  const [owner, setOwner] = React.useState('')

  // Scheme <-> platform mapping
  const schemeForPlatform: Record<PlatformSlug, SigningScheme[]> = {
    windows: ['authenticode'],
    linux: ['gpg'],
    ubuntu: ['gpg'],
    android: ['apk-v2', 'apk-v3'],
    chrome: ['crx3'],
  }

  const onPlatformChange = (p: PlatformSlug) => {
    setPlatform(p)
    setScheme(schemeForPlatform[p][0])
  }

  const onPasteOrUpload = (content: string) => {
    setPem(content)
    // Simulate computing the thumbprint via Web Crypto
    setComputing(true)
    setTimeout(() => {
      // Deterministic mock: SHA-256 of the pasted content
      const encoder = new TextEncoder()
      crypto.subtle.digest('SHA-256', encoder.encode(content || 'placeholder')).then((buf) => {
        const hex = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
        setThumbprint(hex)
        setComputing(false)
      })
    }, 600)
  }

  const create = () => {
    const newId: SigningIdentity = {
      id: `si_${Date.now()}`,
      name,
      platform,
      scheme,
      thumbprintSha256: thumbprint,
      status: 'active',
      notBefore: new Date().toISOString(),
      notAfter: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      owner: owner || 'admin@fppstore.io',
      createdBy: 'admin@fppstore.io',
      createdAt: new Date().toISOString(),
      appsSigned: 0,
      lastUsedAt: new Date().toISOString(),
    }
    onAdded(newId)
    onOpenChange(false)
    toast.success('Identity added', { description: `${newId.name} active. Verified on next upload.` })
    setName(''); setPem(''); setThumbprint(''); setOwner('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeySquare className="h-4 w-4" /> Add signing identity
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Friendly name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Free Programs Pro LLC (Windows)" />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Platform">
              <Select value={platform} onValueChange={(v: any) => onPlatformChange(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Scheme">
              <Select value={scheme} onValueChange={(v: any) => setScheme(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {schemeForPlatform[platform].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Public key / certificate (PEM)">
            <Textarea
              rows={6}
              value={pem}
              onChange={(e) => onPasteOrUpload(e.target.value)}
              placeholder={`-----BEGIN CERTIFICATE-----
MIIDljCCAn6gAwIBAgIQhc5VqsIR9...
-----END CERTIFICATE-----`}
              className="font-mono text-[10px]"
            />
            <p className="text-[10px] text-muted-foreground">Paste PEM directly, or upload a .pem / .cer / .asc file below.</p>
          </Field>
          <label className="flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground hover:border-primary/40">
            <input
              type="file"
              accept=".pem,.cer,.asc,.crt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => onPasteOrUpload(reader.result as string)
                reader.readAsText(file)
              }}
            />
            <Plus className="mr-1.5 h-3 w-3" /> Upload file
          </label>

          {/* Computed thumbprint */}
          <Field label="Thumbprint (SHA-256) — auto-computed">
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-2">
              {computing ? (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <RefreshCw className="h-3 w-3 animate-spin" /> Computing…
                </span>
              ) : thumbprint ? (
                <>
                  <code className="flex-1 break-all font-mono text-[10px]">{thumbprint}</code>
                  <button
                    className="rounded p-1 hover:bg-muted"
                    onClick={() => { navigator.clipboard?.writeText(thumbprint); toast.success('Copied') }}
                    aria-label="Copy"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Paste PEM above to compute</span>
              )}
            </div>
          </Field>

          <Field label="Owner (service account or team)">
            <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="release-engineering@fppstore.io" />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={create} disabled={!name || !pem || !thumbprint}>
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Add identity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ===========================================================================
// SIGNING IDENTITY DETAIL
// ===========================================================================

export function AdminSigningIdentityDetail({ identity }: { identity: SigningIdentity }) {
  const navigate = useNav((s) => s.navigate)
  const [revoking, setRevoking] = React.useState(false)
  const [revokeReason, setRevokeReason] = React.useState('')
  const [replacementId, setReplacementId] = React.useState<string>('')

  if (!identity) {
    return (
      <div className="space-y-4 p-4 md:p-6 lg:p-8">
        <button onClick={() => navigate({ name: 'admin-signing' })} className="text-xs text-muted-foreground hover:text-primary">← Back to identities</button>
        <h1 className="text-2xl font-semibold">Identity not found</h1>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <button onClick={() => navigate({ name: 'admin-signing' })} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
        <ChevronRight className="h-3 w-3 rotate-180" /> Back to identities
      </button>

      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{identity.name}</h1>
          <p className="text-sm text-muted-foreground">{identity.platform} · {identity.scheme} · owned by {identity.owner}</p>
        </div>
        <StatusBadge status={identity.status} />
      </header>

      {identity.status === 'revoked' && (
        <div className="rounded-lg border-2 border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-4 text-xs">
          <div className="flex items-center gap-2 font-semibold text-[var(--destructive)]">
            <ShieldOff className="h-4 w-4" /> This identity was revoked
          </div>
          <p className="mt-2 text-foreground/90">{identity.revokedReason}</p>
          <p className="mt-1 text-muted-foreground">
            Revoked at {new Date(identity.revokedAt!).toLocaleString()}
            {identity.replacementId && ` · superseded by ${identity.replacementId}`}
          </p>
        </div>
      )}

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Fingerprint className="h-4 w-4" /> Public key details
        </h2>
        <dl className="mt-3 grid gap-3 md:grid-cols-2">
          <Row label="Thumbprint (SHA-256)">
            <code className="block break-all rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">{identity.thumbprintSha256}</code>
            <button
              className="mt-1 inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
              onClick={() => { navigator.clipboard?.writeText(identity.thumbprintSha256); toast.success('Copied') }}
            >
              <Copy className="h-2.5 w-2.5" /> Copy
            </button>
          </Row>
          <Row label="Validity">
            <div>{new Date(identity.notBefore).toLocaleString()}</div>
            <div>→ {new Date(identity.notAfter).toLocaleString()}</div>
            <div className={cn('text-[10px]', new Date(identity.notAfter) > new Date() ? 'text-[var(--success)]' : 'text-[var(--destructive)]')}>
              {new Date(identity.notAfter) > new Date() ? 'Valid' : 'Expired'}
            </div>
          </Row>
          <Row label="Owner">
            <span className="text-xs">{identity.owner}</span>
          </Row>
          <Row label="Created">
            <span className="text-xs">{new Date(identity.createdAt).toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground">by {identity.createdBy}</span>
          </Row>
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Activity className="h-4 w-4" /> Usage stats
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Stat label="Apps signed" value={identity.appsSigned} />
          <Stat label="Last used" value={identity.lastUsedAt ? new Date(identity.lastUsedAt).toLocaleString().slice(0, 16) : 'Never'} />
          <Stat label="Reverify schedule" value="Weekly" />
        </div>
      </section>

      {identity.status === 'active' && (
        <section className="rounded-xl border-2 border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--destructive)]">
            <ShieldOff className="h-4 w-4" /> Revoke this identity
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            All apps signed by this identity will show a "Signature revoked" badge. Users will be warned not to install.
            Webhook <code className="font-mono">signing.identity_revoked</code> fires.
          </p>
          <div className="mt-3 space-y-2">
            <Field label="Reason">
              <Textarea rows={2} value={revokeReason} onChange={(e) => setRevokeReason(e.target.value)} placeholder="Rotation — superseded by si_new after 30-day overlap." />
            </Field>
            <Field label="Replacement identity (optional)">
              <Select value={replacementId} onValueChange={setReplacementId}>
                <SelectTrigger><SelectValue placeholder="None — no replacement" /></SelectTrigger>
                <SelectContent>
                  {signingIdentities.filter((i) => i.id !== identity.id && i.status === 'active').map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="flex items-center gap-2">
              <Switch checked={revoking} onCheckedChange={setRevoking} id="confirm" />
              <Label htmlFor="confirm" className="text-xs">I understand this cannot be undone</Label>
            </div>
            <Button variant="destructive" size="sm" disabled={!revoking || !revokeReason}
              onClick={() => {
                toast.success('Identity revoked', {
                  description: `All apps signed by ${identity.name} now show revoked badge.`,
                })
                navigate({ name: 'admin-signing' })
              }}
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" /> Revoke identity
            </Button>
          </div>
        </section>
      )}
    </div>
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-xs">{children}</dd>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium tabular-nums">{value}</div>
    </div>
  )
}

// ===========================================================================
// SIGNING POLICY SETTINGS
// ===========================================================================

export function AdminSigningPolicy() {
  const navigate = useNav((s) => s.navigate)
  const [requireSignature, setRequireSignature] = React.useState(true)
  const [blockSha1, setBlockSha1] = React.useState(true)
  const [requireTimestamp, setRequireTimestamp] = React.useState(true)

  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      <button onClick={() => navigate({ name: 'admin-signing' })} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
        <ChevronRight className="h-3 w-3 rotate-180" /> Back to identities
      </button>
      <h1 className="text-2xl font-semibold tracking-tight">Trust policy</h1>
      <p className="text-sm text-muted-foreground">Defaults that govern how signatures are verified across the catalog.</p>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <ToggleRow
          label="Require signature for publish"
          desc="If on, unsigned apps cannot be published without admin override (audit logged + warning badge)."
          checked={requireSignature}
          onCheck={setRequireSignature}
        />
        <div className="border-t border-border pt-3">
          <ToggleRow
            label="Block SHA-1 signatures"
            desc="SHA-1 is deprecated for code signing. Recommended on."
            checked={blockSha1}
            onCheck={setBlockSha1}
          />
        </div>
        <div className="border-t border-border pt-3">
          <ToggleRow
            label="Require RFC 3161 timestamp (Windows)"
            desc="Long-term validity of Authenticode signatures depends on a counter-signature from a TSA."
            checked={requireTimestamp}
            onCheck={setRequireTimestamp}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Minimum key sizes</h2>
          <dl className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between"><dt className="text-muted-foreground">RSA</dt><dd className="font-medium">≥ 3072 bits</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">ECDSA</dt><dd className="font-medium">≥ P-256</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Ed25519</dt><dd className="font-medium">Allowed</dd></div>
          </dl>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Trusted CAs (Windows)</h2>
          <ul className="mt-2 space-y-1 text-xs">
            <li>· Microsoft Trusted Root</li>
            <li>· DigiCert</li>
            <li>· Sectigo</li>
            <li>· GlobalSign</li>
            <li>· Let's Encrypt <span className="text-[10px] text-muted-foreground">(not applicable for code signing)</span></li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Allowed schemes per platform</h2>
        <table className="mt-2 w-full text-left text-xs">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-2 py-1.5 font-medium">Platform</th>
              <th className="px-2 py-1.5 font-medium">Schemes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr><td className="px-2 py-1.5">Windows</td><td className="px-2 py-1.5 font-mono">authenticode</td></tr>
            <tr><td className="px-2 py-1.5">Ubuntu / Linux</td><td className="px-2 py-1.5 font-mono">gpg</td></tr>
            <tr><td className="px-2 py-1.5">Android</td><td className="px-2 py-1.5 font-mono">apk-v2, apk-v3</td></tr>
            <tr><td className="px-2 py-1.5">Chrome</td><td className="px-2 py-1.5 font-mono">crx3</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ToggleRow({ label, desc, checked, onCheck }: { label: string; desc: string; checked: boolean; onCheck: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-xs font-medium">{label}</div>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheck} />
    </div>
  )
}

// ===========================================================================
// SIGNING AUDIT LOG
// ===========================================================================

export function AdminSigningAudit() {
  const navigate = useNav((s) => s.navigate)
  // Mock verification history
  const entries = [
    { id: 'sa_1', ts: '2026-09-14T08:14:10Z', actor: 'verifier-bot', action: 'signature_verified', identity: signingIdentities[0].name, app: 'Pixel Blocker', version: '1.55.1', status: 'verified' },
    { id: 'sa_2', ts: '2026-09-13T18:04:00Z', actor: 'verifier-bot', action: 'signature_verified', identity: signingIdentities[0].name, app: 'Pixel Blocker', version: '1.55.1-beta', status: 'self' },
    { id: 'sa_3', ts: '2026-09-12T16:18:00Z', actor: 'verifier-bot', action: 'signature_verified', identity: signingIdentities[2].name, app: 'Codex Terminal', version: '4.2.1', status: 'verified' },
    { id: 'sa_4', ts: '2026-09-11T09:30:00Z', actor: 'admin@fppstore.io', action: 'identity_added', identity: signingIdentities[3].name, app: '—', version: '—', status: '—' },
    { id: 'sa_5', ts: '2026-05-15T00:00:00Z', actor: 'admin@fppstore.io', action: 'identity_revoked', identity: signingIdentities[4].name, app: '—', version: '—', status: 'revoked' },
    { id: 'sa_6', ts: '2026-09-12T22:51:00Z', actor: 'verifier-bot', action: 'signature_failed', identity: '—', app: 'Aegis Vault', version: '3.1.0', status: 'tampered' },
  ]

  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      <button onClick={() => navigate({ name: 'admin-signing' })} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
        <ChevronRight className="h-3 w-3 rotate-180" /> Back to identities
      </button>
      <h1 className="text-2xl font-semibold tracking-tight">Verification audit log</h1>
      <p className="text-sm text-muted-foreground">Every signature verification attempt, manual override, and identity change.</p>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Timestamp</th>
              <th className="px-3 py-2 font-medium">Actor</th>
              <th className="px-3 py-2 font-medium">Action</th>
              <th className="px-3 py-2 font-medium">Identity</th>
              <th className="px-3 py-2 font-medium">App</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((e) => (
              <tr key={e.id} className="hover:bg-surface-hover">
                <td className="px-3 py-2 font-mono text-muted-foreground">{new Date(e.ts).toISOString().slice(0, 19).replace('T', ' ')}</td>
                <td className="px-3 py-2">{e.actor}</td>
                <td className="px-3 py-2"><code className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono">{e.action}</code></td>
                <td className="px-3 py-2">{e.identity}</td>
                <td className="px-3 py-2">{e.app} <span className="text-muted-foreground">{e.version}</span></td>
                <td className="px-3 py-2"><Badge variant="outline" className={cn('text-[10px]', e.status === 'verified' ? 'border-[var(--success)]/30 text-[var(--success)]' : e.status === 'revoked' ? 'border-[var(--destructive)]/30 text-[var(--destructive)]' : e.status === 'tampered' ? 'border-[var(--destructive)]/30 text-[var(--destructive)]' : '')}>{e.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
