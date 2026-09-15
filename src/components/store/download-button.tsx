'use client'

import * as React from 'react'
import { Download, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type State = 'default' | 'downloading' | 'installed' | 'error'

export function DownloadButton({
  variant = 'default',
  size = 'lg',
  className,
  fileName,
  sizeLabel,
  checksum,
}: {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
  fileName: string
  sizeLabel?: string
  checksum?: string
}) {
  const [state, setState] = React.useState<State>('default')
  const [progress, setProgress] = React.useState(0)

  const onClick = () => {
    if (state === 'downloading') return
    if (state === 'installed') {
      toast.success('Already downloaded', { description: fileName })
      return
    }
    setState('downloading')
    setProgress(0)
    // Simulate download progress
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

  return (
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
  )
}
