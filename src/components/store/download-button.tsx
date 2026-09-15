'use client'

import * as React from 'react'
import { Download, Check, AlertCircle, Loader2, ShieldCheck, Shield, ShieldOff, AlertTriangle, Copy, FileWarning } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { SignatureBadge } from './signature-display'
import type { SignatureResult } from '@/data/v2-mock'

type State = 'default' | 'downloading' | 'installed' | 'error'

export function DownloadButton({
  variant = 'default',
  size = 'lg',
  className,
  fileName,
  sizeLabel,
  checksum,
  signature,
  scanStatus,
  confirmBeforeDownload = false,
}: {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
  fileName: string
  sizeLabel?: string
  checksum?: string
  signature?: SignatureResult
  scanStatus?: 'clean' | 'pending' | 'flagged'
  confirmBeforeDownload?: boolean
}) {
  const [state, setState] = React.useState<State>('default')
  const [progress, setProgress] = React.useState(0)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const startDownload = () => {
    setState('downloading')
    setProgress(0)
    const startedAt = Date.now()
    const duration = 1400
    const tick = () => {
      const elapsed = Date.now() - startedAt
      const pct = Math.min(100, Math.round((elapsed / duration) * 100))
      setProgress(pct)
      if (pct < 100) {
        requestAnimationFrame(tick)
      } else {
        setState('installed')
        toast.success('Download complete', {
          description: `${fileName} · verified ${checksum ? '✓ SHA-256 match' : ''}`,
        })
      }
    }
    requestAnimationFrame(tick)
  }

  const onClick = () => {
    if (state === 'downloading') return
    if (state === 'installed') {
      toast.success('Already downloaded', { description: fileName })
      return
    }
    if (confirmBeforeDownload) {
      setConfirmOpen(true)
      return
    }
    startDownload()
  }

  return (
    <>
      <Button
        onClick={onClick}
        variant={variant}
        size={size}
        className={cn('relative overflow-hidden', className)}
      >
        {state === 'downloading' ? (
          <>
            <span
              className="absolute inset-y-0 left-0 bg-white/15"
              style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
            />
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="tabular-nums">{progress}%</span>
          </>
        ) : state === 'installed' ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Installed
          </>
        ) : state === 'error' ? (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Retry
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download
            {sizeLabel && <span className="ml-2 text-xs opacity-70">{sizeLabel}</span>}
          </>
        )}
      </Button>

      <DownloadConfirmationModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        fileName={fileName}
        sizeLabel={sizeLabel}
        checksum={checksum}
        signature={signature}
        scanStatus={scanStatus}
        onConfirm={() => { setConfirmOpen(false); startDownload() }}
      />
    </>
  )
}

function DownloadConfirmationModal({
  open,
  onOpenChange,
  fileName,
  sizeLabel,
  checksum,
  signature,
  scanStatus,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  fileName: string
  sizeLabel?: string
  checksum?: string
  signature?: SignatureResult
  scanStatus?: 'clean' | 'pending' | 'flagged'
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Confirm download
          </DialogTitle>
          <DialogDescription className="text-xs">
            Verify before you install. If your OS warns about this file, compare the checksum below.
          </DialogDescription>
        </DialogHeader>

        <dl className="space-y-2 text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">File</dt>
            <dd className="font-mono text-[11px]">{fileName}</dd>
          </div>
          {sizeLabel && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Size</dt>
              <dd className="font-medium">{sizeLabel}</dd>
            </div>
          )}
          {scanStatus && (
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Scan status</dt>
              <dd>
                {scanStatus === 'clean' ? (
                  <span className="inline-flex items-center gap-1 text-[var(--success)]">
                    <ShieldCheck className="h-3 w-3" /> Clean (70+ engines)
                  </span>
                ) : scanStatus === 'pending' ? (
                  <span className="inline-flex items-center gap-1 text-[var(--warning)]">
                    <AlertTriangle className="h-3 w-3" /> Pending
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[var(--danger)]">
                    <FileWarning className="h-3 w-3" /> Flagged
                  </span>
                )}
              </dd>
            </div>
          )}
          {checksum && (
            <div className="space-y-1">
              <dt className="flex items-center justify-between text-muted-foreground">
                <span>SHA-256</span>
                <button
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                  onClick={() => { navigator.clipboard?.writeText(checksum); toast.success('Copied') }}
                >
                  <Copy className="h-2.5 w-2.5" /> Copy
                </button>
              </dt>
              <dd>
                <code className="block break-all rounded bg-muted px-2 py-1 font-mono text-[10px]">
                  {checksum}
                </code>
              </dd>
            </div>
          )}
          {signature && (
            <div className="space-y-1.5 border-t border-border pt-2">
              <dt className="text-muted-foreground">Signature</dt>
              <dd>
                <div className="flex flex-wrap items-center gap-2">
                  <SignatureBadge signature={signature} size="md" />
                  {signature.signer && (
                    <span className="text-[11px] text-muted-foreground">
                      Signed by <span className="font-medium text-foreground">{signature.signer.commonName}</span>
                    </span>
                  )}
                </div>
              </dd>
            </div>
          )}
        </dl>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onConfirm}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Download now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
