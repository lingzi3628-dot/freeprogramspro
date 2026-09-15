'use client'

import * as React from 'react'
import {
  Fingerprint,
  Upload,
  ShieldCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  KeyRound,
  FileCheck2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useNav } from '@/lib/store/nav'
import { apps, platforms, type PlatformSlug } from '@/data/mock'
import { signingIdentities } from '@/data/v2-mock'
import { SignatureBadge, SignatureBlock } from '@/components/store/signature-display'
import { synthesizeSignature } from '@/data/v2-mock'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Tab = 'checksum' | 'thumbprint' | 'file'

type MatchResult =
  | { kind: 'no-match'; input: string }
  | { kind: 'match'; app: typeof apps[0]; version: any; signature: any }
  | { kind: 'identity-match'; identity: typeof signingIdentities[0]; apps: typeof apps }
  | null

export function VerifyTool() {
  const navigate = useNav((s) => s.navigate)
  const [tab, setTab] = React.useState<Tab>('checksum')
  const [checksumInput, setChecksumInput] = React.useState('')
  const [thumbprintInput, setThumbprintInput] = React.useState('')
  const [scanning, setScanning] = React.useState(false)
  const [result, setResult] = React.useState<MatchResult>(null)

  const lookupChecksum = (input: string) => {
    setScanning(true)
    setResult(null)
    setTimeout(() => {
      const clean = input.trim().toLowerCase()
      const match = apps.flatMap((a) => a.versions.map((v) => ({ app: a, version: v }))).find((x) => x.version.checksumSha256 === clean)
      if (match) {
        const sig = synthesizeSignature(match.version.platform, match.version.channel, match.app.slug)
        setResult({ kind: 'match', app: match.app, version: match.version, signature: sig })
      } else {
        setResult({ kind: 'no-match', input: clean })
      }
      setScanning(false)
    }, 800)
  }

  const lookupThumbprint = (input: string) => {
    setScanning(true)
    setResult(null)
    setTimeout(() => {
      const clean = input.trim().toLowerCase()
      const identity = signingIdentities.find((i) => i.thumbprintSha256 === clean)
      if (identity) {
        const appsSigned = apps.filter((a) => a.platforms.includes(identity.platform as PlatformSlug)).slice(0, 4)
        setResult({ kind: 'identity-match', identity, apps: appsSigned })
      } else {
        setResult({ kind: 'no-match', input: clean })
      }
      setScanning(false)
    }, 800)
  }

  const onFile = (file: File) => {
    setScanning(true)
    setResult(null)
    // Simulate computing SHA-256 client-side using SubtleCrypto
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const buf = reader.result as ArrayBuffer
        const hashBuf = await crypto.subtle.digest('SHA-256', buf)
        const hash = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, '0')).join('')
        // Compare to known checksums
        const match = apps.flatMap((a) => a.versions.map((v) => ({ app: a, version: v }))).find((x) => x.version.checksumSha256 === hash)
        if (match) {
          const sig = synthesizeSignature(match.version.platform, match.version.channel, match.app.slug)
          setResult({ kind: 'match', app: match.app, version: match.version, signature: sig })
        } else {
          setResult({ kind: 'no-match', input: hash })
        }
      } catch {
        toast.error('Failed to read file')
      }
      setScanning(false)
    }
    reader.onerror = () => { setScanning(false); toast.error('Failed to read file') }
    reader.readAsArrayBuffer(file)
  }

  const reset = () => { setResult(null); setChecksumInput(''); setThumbprintInput('') }

  return (
    <div className="mx-auto max-w-[900px] space-y-6 p-4 md:p-6 lg:p-8">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Fingerprint className="h-3 w-3" /> Public verify tool
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Verify a download</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Paste a SHA-256 checksum, paste a signing thumbprint, or upload a file — we'll tell you whether
          it matches a published version on Free Programs Pro Store and whether the signature is verified.
          This runs entirely client-side; we don't see your file.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: 'checksum' as const, label: 'Paste SHA-256', icon: <Fingerprint className="h-3.5 w-3.5" /> },
          { id: 'thumbprint' as const, label: 'Paste thumbprint', icon: <KeyRound className="h-3.5 w-3.5" /> },
          { id: 'file' as const, label: 'Upload a file', icon: <Upload className="h-3.5 w-3.5" /> },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); reset() }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              tab === t.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-surface-hover'
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        {tab === 'checksum' && (
          <form
            onSubmit={(e) => { e.preventDefault(); lookupChecksum(checksumInput) }}
            className="space-y-3"
          >
            <Label htmlFor="checksum" className="text-xs">SHA-256 (64 hex characters)</Label>
            <Input
              id="checksum"
              value={checksumInput}
              onChange={(e) => setChecksumInput(e.target.value)}
              placeholder="9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Try the SHA-256 from any app's detail page — open an app, scroll to "Trust & safety" → "Copy checksum",
              and paste it here.
            </p>
            <Button type="submit" disabled={!checksumInput || scanning}>
              {scanning ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Search className="mr-1.5 h-3.5 w-3.5" />}
              Verify
            </Button>
          </form>
        )}

        {tab === 'thumbprint' && (
          <form
            onSubmit={(e) => { e.preventDefault(); lookupThumbprint(thumbprintInput) }}
            className="space-y-3"
          >
            <Label htmlFor="thumbprint" className="text-xs">Signing certificate thumbprint (SHA-256)</Label>
            <Input
              id="thumbprint"
              value={thumbprintInput}
              onChange={(e) => setThumbprintInput(e.target.value)}
              placeholder="a1b2c3d4e5f6..."
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Paste a thumbprint to see which signing identities and apps on Free Programs Pro are signed by it.
            </p>
            <Button type="submit" disabled={!thumbprintInput || scanning}>
              {scanning ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Search className="mr-1.5 h-3.5 w-3.5" />}
              Verify
            </Button>
          </form>
        )}

        {tab === 'file' && (
          <div className="space-y-3">
            <Label className="text-xs">Drop a file or click to upload</Label>
            <label
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 p-10 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/60"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]) }}
            >
              <Upload className="h-6 w-6" />
              <span>Drop file here or click to choose</span>
              <span className="text-[11px]">SHA-256 computed locally via Web Crypto API — file never leaves your machine</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files?.[0]) }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-3">
          {result.kind === 'match' && (
            <div className="space-y-3 rounded-xl border-2 border-[var(--success)]/30 bg-[var(--success)]/5 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
                <h2 className="text-base font-semibold text-[var(--success)]">Match found — verified</h2>
              </div>
              <p className="text-sm text-foreground/90">
                This checksum belongs to <strong>{result.app.name}</strong> version <code className="font-mono">{result.version.version}</code> for <span className="font-medium">{platforms.find((p) => p.slug === result.version.platform)?.name}</span>.
              </p>
              <div className="rounded-lg border border-border bg-card p-3">
                <SignatureBlock
                  signature={result.signature}
                  checksumSha256={result.version.checksumSha256}
                  fileSize={result.version.fileSize}
                  fileName={`${result.app.slug}-${result.version.version}.bin`}
                  scanStatus={result.version.scanStatus}
                />
              </div>
              <Button variant="default" size="sm" onClick={() => navigate({ name: 'app', slug: result.app.slug })}>
                View app page →
              </Button>
            </div>
          )}

          {result.kind === 'identity-match' && (
            <div className="space-y-3 rounded-xl border-2 border-[var(--success)]/30 bg-[var(--success)]/5 p-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-[var(--success)]" />
                <h2 className="text-base font-semibold text-[var(--success)]">Signing identity found</h2>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{result.identity.name}</dd>
                <dt className="text-muted-foreground">Platform</dt>
                <dd className="font-medium">{result.identity.platform}</dd>
                <dt className="text-muted-foreground">Scheme</dt>
                <dd className="font-mono">{result.identity.scheme}</dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant="outline" className={cn(
                    'text-[10px]',
                    result.identity.status === 'active' ? 'border-[var(--success)]/30 text-[var(--success)]'
                    : result.identity.status === 'revoked' ? 'border-[var(--destructive)]/30 text-[var(--destructive)]'
                    : 'border-[var(--warning)]/30 text-[var(--warning)]'
                  )}>
                    {result.identity.status}
                  </Badge>
                </dd>
                <dt className="text-muted-foreground">Validity</dt>
                <dd>{new Date(result.identity.notBefore).toLocaleDateString()} → {new Date(result.identity.notAfter).toLocaleDateString()}</dd>
              </dl>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Apps signed by this identity
                </h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {result.apps.map((a) => (
                    <li key={a.id}>
                      <button
                        onClick={() => navigate({ name: 'app', slug: a.slug })}
                        className="flex w-full items-center gap-2 rounded-lg border border-border bg-card p-2 text-left hover:bg-surface-hover"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-[22%] text-[10px] font-semibold text-white" style={{ background: `linear-gradient(135deg, ${a.iconGradient[0]}, ${a.iconGradient[1]})` }}>
                          {a.iconText}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium">{a.name}</div>
                          <div className="truncate text-[10px] text-muted-foreground">{a.developer}</div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              {result.identity.status === 'revoked' && (
                <div className="rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-3 text-xs">
                  <AlertTriangle className="mr-1 inline h-3 w-3 text-[var(--destructive)]" />
                  <strong>Warning:</strong> This signing certificate was revoked on{' '}
                  {new Date(result.identity.revokedAt!).toLocaleDateString()}. Do not install apps signed by it
                  unless you trust the source. Reason: {result.identity.revokedReason}
                </div>
              )}
            </div>
          )}

          {result.kind === 'no-match' && (
            <div className="space-y-3 rounded-xl border-2 border-[var(--danger)]/30 bg-[var(--danger)]/5 p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-[var(--danger)]" />
                <h2 className="text-base font-semibold text-[var(--danger)]">No match found</h2>
              </div>
              <p className="text-sm text-foreground/90">
                We couldn't find this in our catalog. It either doesn't belong to a published Free Programs Pro
                file, or you may be looking at a tampered or unofficial build.
              </p>
              {result.input && (
                <div className="text-[11px]">
                  <span className="text-muted-foreground">You searched for:</span>
                  <code className="ml-2 break-all rounded bg-muted px-1.5 py-0.5 font-mono">{result.input}</code>
                </div>
              )}
              <div className="rounded-lg border border-border bg-card p-3 text-xs">
                <strong className="text-[var(--danger)]">Do not install</strong> files whose checksum doesn't
                match the one shown on the app's official detail page. If you believe this is an error, file a
                report via the app's "Report" button.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trust explainer */}
      <section className="rounded-xl border border-border bg-muted/30 p-4 md:p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-[var(--success)]" /> What does each trust level mean?
        </h2>
        <ul className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
          <li className="flex items-start gap-2">
            <Badge className="bg-[var(--success)]/10 text-[var(--success)] text-[10px]">Verified</Badge>
            <span className="text-muted-foreground">Signature valid, signer matches a registered identity, chain trusted, not revoked.</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge className="bg-[var(--warning)]/10 text-[var(--warning)] text-[10px]">Signed (self)</Badge>
            <span className="text-muted-foreground">Signature present but self-signed or signer not registered.</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge className="bg-[var(--warning)]/10 text-[var(--warning)] text-[10px]">Unsigned</Badge>
            <span className="text-muted-foreground">No signature found. Admin override required to publish; cannot be Editor's pick.</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge className="bg-[var(--destructive)]/10 text-[var(--destructive)] text-[10px]">Revoked</Badge>
            <span className="text-muted-foreground">Signer's certificate was revoked — do not install unless you trust the source.</span>
          </li>
        </ul>
      </section>
    </div>
  )
}
