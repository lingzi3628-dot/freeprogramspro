'use client'

import * as React from 'react'
import { platforms, type PlatformSlug } from '@/data/mock'
import { cn } from '@/lib/utils'

type Variant = 'pill' | 'dot' | 'minimal'

export function PlatformBadge({
  platform,
  variant = 'pill',
  className,
}: {
  platform: PlatformSlug
  variant?: Variant
  className?: string
}) {
  const p = platforms.find((x) => x.slug === platform)
  if (!p) return null

  if (variant === 'dot') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-xs', className)}>
        <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
        <span className="text-muted-foreground">{p.name}</span>
      </span>
    )
  }

  if (variant === 'minimal') {
    return (
      <span className={cn('inline-flex items-center text-xs font-medium', className)} style={{ color: p.color }}>
        {p.name}
      </span>
    )
  }

  // pill
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none',
        className
      )}
      style={{
        background: `${p.color}1A`,
        color: p.color,
      }}
    >
      <PlatformLogo slug={p.slug} className="h-2.5 w-2.5" />
      {p.name}
    </span>
  )
}

export function PlatformLogo({ slug, className }: { slug: PlatformSlug; className?: string }) {
  // Simple SVG marks evoking each platform's brand, all single-color
  const p = platforms.find((x) => x.slug === slug)
  if (!p) return null
  const color = p.color

  if (slug === 'windows') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" style={{ color }}>
        <path d="M3 5.5l7.5-1v7H3V5.5zm8.5-1.2L21 3v8.5h-9.5V4.3zM3 12.5h7.5v7L3 18.5v-6zm8.5 0H21V21l-9.5-1.3v-7.2z" />
      </svg>
    )
  }
  if (slug === 'linux' || slug === 'ubuntu') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" style={{ color }}>
        <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="4" r="2.2" />
        <circle cx="20" cy="14" r="2.2" />
        <circle cx="6" cy="18" r="2.2" />
      </svg>
    )
  }
  if (slug === 'android') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" style={{ color }}>
        <path d="M6 10.5h12v6a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 16.5v-6zm-2.5 0a1.5 1.5 0 011.5 1.5v4a1.5 1.5 0 01-1.5 1.5A1.5 1.5 0 012 16v-4a1.5 1.5 0 011.5-1.5zm17 0A1.5 1.5 0 0122 12v4a1.5 1.5 0 01-3 0v-4a1.5 1.5 0 011.5-1.5zM8 5l1-1.7a.3.3 0 01.5 0L9.6 4.2a8 8 0 014.8 0l.1-.9a.3.3 0 01.5 0L16 5a5.5 5.5 0 012.5 4.6v.4H5.5v-.4A5.5 5.5 0 018 5zM8.5 8a.7.7 0 100-1.4.7.7 0 000 1.4zm7 0a.7.7 0 100-1.4.7.7 0 000 1.4z" />
      </svg>
    )
  }
  // chrome
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" style={{ color }} strokeWidth="1.8">
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" />
      <path d="M12 2.5v6M12 8.5h9.5" />
    </svg>
  )
}
