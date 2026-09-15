'use client'

import * as React from 'react'
import { Check, ShieldCheck, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNav } from '@/lib/store/nav'
import { formatBytes, formatDownloads, type PlatformSlug } from '@/data/mock'
import { PlatformBadge } from './platform-badge'
import { Rating } from './rating'

export type App = {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  iconGradient: [string, string]
  iconText: string
  developer: string
  developerSlug: string
  category: string
  tags: string[]
  platforms: PlatformSlug[]
  license: string
  sourceUrl: string
  homepageUrl: string
  status: string
  featured: boolean
  publishedAt: string
  updatedAt: string
  ratingAvg: number
  ratingCount: number
  downloads: number
  sizeBytes: number
  screenshots: { gradient: [string, string]; label: string }[]
  versions: any[]
  reviews: any[]
  permissions?: string[]
}

type Variant = 'grid' | 'list' | 'hero' | 'compact' | 'rank'

export function AppCard({
  app,
  variant = 'grid',
  rank,
  className,
}: {
  app: App
  variant?: Variant
  rank?: number
  className?: string
}) {
  const navigate = useNav((s) => s.navigate)
  const open = () => navigate({ name: 'app', slug: app.slug })

  if (variant === 'hero') {
    return (
      <button
        onClick={open}
        className={cn(
          'group relative w-full overflow-hidden rounded-2xl border border-border bg-card text-left transition-all hover:border-primary/40',
          className
        )}
        style={{
          background: `linear-gradient(135deg, ${app.iconGradient[0]} 0%, ${app.iconGradient[1]} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:gap-8 md:p-10">
          <div className="flex-1 space-y-4 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
              <Star style={{ width: 12, height: 12 }} fill="currentColor" strokeWidth={0} />
              Featured · {app.ratingAvg.toFixed(1)}
            </div>
            <div>
              <h2 className="text-2xl font-semibold md:text-4xl md:leading-tight">{app.name}</h2>
              <p className="mt-2 max-w-prose text-sm text-white/80 md:text-base">{app.tagline}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/80">
              {app.platforms.map((p) => (
                <span key={p} className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5">
                  {platformLabel(p)}
                </span>
              ))}
              <span>·</span>
              <span>{formatDownloads(app.downloads)} downloads</span>
              <span>·</span>
              <span>{app.license}</span>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-foreground transition-transform group-hover:scale-105">
              View app →
            </span>
          </div>
          <AppIcon app={app} size={120} className="hidden md:block shrink-0" />
        </div>
      </button>
    )
  }

  if (variant === 'list') {
    return (
      <button
        onClick={open}
        className={cn(
          'group flex w-full items-center gap-4 rounded-xl border border-transparent bg-card p-3 text-left transition-all hover:border-border hover:bg-surface-hover md:p-4',
          className
        )}
      >
        <AppIcon app={app} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="truncate text-sm font-medium">{app.name}</h3>
            <span className="truncate text-xs text-muted-foreground">{app.developer}</span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{app.tagline}</p>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Rating value={app.ratingAvg} count={app.ratingCount} showCount={false} size={11} />
            <span>·</span>
            <span>{formatBytes(app.sizeBytes)}</span>
            <span>·</span>
            <span>{app.tags[0]}</span>
          </div>
        </div>
        <div className="hidden shrink-0 md:flex md:items-center md:gap-2">
          {app.platforms.slice(0, 3).map((p) => (
            <PlatformBadge key={p} platform={p} variant="dot" />
          ))}
        </div>
      </button>
    )
  }

  if (variant === 'rank') {
    return (
      <button
        onClick={open}
        className={cn(
          'group flex w-full items-center gap-4 rounded-xl p-2 text-left transition-colors hover:bg-surface-hover',
          className
        )}
      >
        <span className="w-6 shrink-0 text-center text-xl font-semibold text-muted-foreground/40 tabular-nums">
          {rank}
        </span>
        <AppIcon app={app} size={48} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium">{app.name}</h3>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Rating value={app.ratingAvg} count={app.ratingCount} showCount={false} size={11} />
            <span>·</span>
            <span>{formatDownloads(app.downloads)}</span>
          </div>
        </div>
      </button>
    )
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={open}
        className={cn(
          'group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-surface-hover',
          className
        )}
      >
        <AppIcon app={app} size={36} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium">{app.name}</h3>
          <p className="truncate text-[11px] text-muted-foreground">{formatBytes(app.sizeBytes)}</p>
        </div>
      </button>
    )
  }

  // grid (default AppCard)
  return (
    <button
      onClick={open}
      className={cn(
        'group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm md:p-4',
        className
      )}
    >
      <div className="flex w-full items-start gap-3">
        <AppIcon app={app} size={56} />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-tight">{app.name}</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{app.developer}</p>
        </div>
      </div>
      <p className="line-clamp-2 text-xs text-muted-foreground">{app.tagline}</p>
      <div className="mt-auto flex w-full items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <Rating value={app.ratingAvg} count={app.ratingCount} showCount={false} size={11} />
        <span>{formatBytes(app.sizeBytes)}</span>
      </div>
      <div className="flex w-full flex-wrap items-center gap-1">
        {app.platforms.slice(0, 4).map((p) => (
          <PlatformBadge key={p} platform={p} />
        ))}
      </div>
    </button>
  )
}

export function AppIcon({ app, size = 56, className }: { app: App; size?: number; className?: string }) {
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center overflow-hidden rounded-[22%] text-white font-semibold', className)}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${app.iconGradient[0]} 0%, ${app.iconGradient[1]} 100%)`,
        fontSize: size * 0.36,
        letterSpacing: '-0.04em',
      }}
      aria-hidden
    >
      {app.iconText}
    </div>
  )
}

function platformLabel(p: PlatformSlug) {
  return p === 'windows' ? 'Windows'
    : p === 'linux' ? 'Linux'
    : p === 'ubuntu' ? 'Ubuntu'
    : p === 'android' ? 'Android'
    : 'Chrome'
}
