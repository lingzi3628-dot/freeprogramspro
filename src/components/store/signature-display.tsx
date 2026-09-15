'use client'

import * as React from 'react'
import {
  ShieldCheck,
  Shield,
  ShieldOff,
  AlertTriangle,
  Ban,
  Copy,
  ExternalLink,
  Clock,
  KeySquare,
  Fingerprint,
  FileCheck2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trustLevelBadge, type SignatureResult, type TrustLevel } from '@/data/v2-mock'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNav } from '@/lib/store/nav'

const ICONS: Record<string, React.ReactNode> = {
  'shield-check': <ShieldCheck className="h-3.5 w-3.5" />,
  'shield': <Shield className="h-3.5 w-3.5" />,
  'shield-off': <ShieldOff className="h-3.5 w-3.5" />,
  'alert-triangle': <AlertTriangle className="h-3.5 w-3.5" />,
  'ban': <Ban className="h-3.5 w-3.5" />,
}

export function SignatureBadge({
  signature,
  size = 'sm',
  className,
}: {
  signature: SignatureResult
  size?: 'sm' | 'md'
  className?: string
}) {
  const meta = trustLevelBadge(signature.trustLevel)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
        size === 'md' && 'px-3 py-1 text-xs',
        className
      )}
      style={{
        background: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
        color: meta.color,
      }}
      title={`${signature.scheme} · ${signature.verified ? 'verified' : 'not verified'}`}
    >
      {ICONS[meta.icon]}
      {meta.label}
    </span>
  )
}

export function SignatureBlock({
  signature,
  checksumSha256,
  fileSize,
  fileName,
  scanStatus,
}: {
  signature: SignatureResult
  checksumSha256: string
  fileSize: number
  fileName: string
  scanStatus: 'clean' | 'pending' | 'flagged'
}) {
  const navigate = useNav((s) => s.navigate)
  const meta = trustLevelBadge(signature.trustLevel)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SignatureBadge signature={signature} size="md" />
        <Badge variant="outline" className="text-[10px] font-mono">
          {signature.scheme}
        </Badge>
        {signature.timestamp?.present && (
          <Badge variant="outline" className="text-[10px]">
            <Clock className="mr-1 h-2.5 w-2.5" /> Timestamped
          </Badge>
        )}
      </div>

      <dl className="grid gap-x-4 gap-y-2 rounded-lg bg-muted/30 p-3 text-xs sm:grid-cols-2">
        {signature.signer && (
          <Row icon={<KeySquare className="h-3 w-3" />} label="Signer" value={
            <span>
              <div className="font-medium">{signature.signer.commonName}</div>
              {signature.signer.organization && (
                <div className="text-[10px] text-muted-foreground">{signature.signer.organization}{signature.signer.country ? `, ${signature.signer.country}` : ''}</div>
              )}
            </span>
          } />
        )}
        {signature.thumbprintSha256 && (
          <Row icon={<Fingerprint className="h-3 w-3" />} label="Thumbprint (SHA-256)">
            <code className="block break-all rounded bg-background px-1.5 py-0.5 font-mono text-[10px]">
              {signature.thumbprintSha256}
            </code>
            <button
              className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
              onClick={() => { navigator.clipboard?.writeText(signature.thumbprintSha256 || ''); toast.success('Thumbprint copied') }}
            >
              <Copy className="h-2.5 w-2.5" /> Copy
            </button>
          </Row>
        )}
        {signature.timestamp && signature.timestamp.present && (
          <Row icon={<Clock className="h-3 w-3" />} label="Timestamp" value={
            <span>
              <div>{signature.timestamp.authority}</div>
              <div className="text-[10px] text-muted-foreground">
                {signature.timestamp.signedAt && new Date(signature.timestamp.signedAt).toLocaleString()}
              </div>
            </span>
          } />
        )}
        {signature.validity && (
          <Row icon={<FileCheck2 className="h-3 w-3" />} label="Cert validity" value={
            <span>
              <div>{new Date(signature.validity.notBefore).toLocaleDateString()} → {new Date(signature.validity.notAfter).toLocaleDateString()}</div>
              <div className="text-[10px] text-muted-foreground">
                {new Date(signature.validity.notAfter) > new Date() ? 'Valid' : 'Expired'}
              </div>
            </span>
          } />
        )}
        {signature.serial && (
          <Row icon={<FileCheck2 className="h-3 w-3" />} label="Serial" value={<code className="font-mono text-[10px]">{signature.serial}</code>} />
        )}
      </dl>

      {signature.warnings.length > 0 && (
        <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-[var(--warning)]">
            <AlertTriangle className="h-3 w-3" /> Warnings
          </div>
          <ul className="mt-1 list-disc pl-5 text-muted-foreground">
            {signature.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => window.open('https://www.virustotal.com/', '_blank')}>
          <ExternalLink className="mr-1.5 h-3 w-3" /> Verify on VirusTotal
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate({ name: 'verify' })}>
          <Fingerprint className="mr-1.5 h-3 w-3" /> Public verify tool
        </Button>
        <Button variant="ghost" size="sm" onClick={() => {
          navigator.clipboard?.writeText(checksumSha256)
          toast.success('SHA-256 copied')
        }}>
          <Copy className="mr-1.5 h-3 w-3" /> Copy SHA-256
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Free Programs Pro verifies signatures against registered identities. We are not a CA — we never
        issue certificates. Signing happens on the publisher's machine; we verify the result.
      </p>
    </div>
  )
}

function Row({ icon, label, children, value }: { icon: React.ReactNode; label: string; children?: React.ReactNode; value?: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-xs">{value ?? children}</dd>
    </div>
  )
}
