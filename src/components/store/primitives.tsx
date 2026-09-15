'use client'

import * as React from 'react'
import { ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SectionHeader({
  title,
  subtitle,
  action,
  onAction,
  className,
}: {
  title: string
  subtitle?: string
  action?: string
  onAction?: () => void
  className?: string
}) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div>
        <h2 className="text-lg font-semibold tracking-tight md:text-xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={onAction}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
        >
          {action}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export function Chip({
  children,
  selected,
  onClick,
  removable,
  onRemove,
  className,
}: {
  children: React.ReactNode
  selected?: boolean
  onClick?: () => void
  removable?: boolean
  onRemove?: () => void
  className?: string
}) {
  if (removable) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium',
          className
        )}
      >
        {children}
        <button
          onClick={onRemove}
          className="rounded-full p-0.5 hover:bg-muted-foreground/20"
          aria-label="Remove"
        >
          ✕
        </button>
      </span>
    )
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground hover:bg-surface-hover',
        className
      )}
    >
      {children}
    </button>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  onAction,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: string
  onAction?: () => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center', className)}>
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        {description && <p className="mt-1 max-w-md text-xs text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <button
          onClick={onAction}
          className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-hover"
        >
          {action}
        </button>
      )}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />
}

export function TrustBadge({
  variant,
  label,
  className,
}: {
  variant: 'clean' | 'pending' | 'flagged'
  label: string
  className?: string
}) {
  const styles = {
    clean: 'bg-[var(--success)]/10 text-[var(--success)]',
    pending: 'bg-[var(--warning)]/10 text-[var(--warning)]',
    flagged: 'bg-[var(--destructive)]/10 text-[var(--destructive)]',
  }[variant]
  const icon = {
    clean: <ShieldCheck />,
    pending: <ShieldCheck />,
    flagged: <AlertCircle />,
  }[variant]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium', styles, className)}>
      {icon}
      {label}
    </span>
  )
}
