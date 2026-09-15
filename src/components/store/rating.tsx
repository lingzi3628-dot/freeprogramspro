'use client'

import * as React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Rating({
  value,
  count,
  size = 14,
  showCount = true,
  className,
}: {
  value: number
  count?: number
  size?: number
  showCount?: boolean
  className?: string
}) {
  const full = Math.floor(value)
  const frac = value - full
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs', className)}>
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full
          const partial = i === full && frac >= 0.25
          return (
            <span key={i} className="relative" style={{ width: size, height: size }}>
              <Star
                className="absolute inset-0"
                style={{ width: size, height: size, color: 'var(--muted-foreground)' }}
                fill="currentColor"
                strokeWidth={0}
              />
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? '100%' : `${frac * 100}%` }}
                >
                  <Star
                    className="absolute inset-0"
                    style={{ width: size, height: size, color: 'var(--warning)' }}
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </span>
              )}
            </span>
          )
        })}
      </span>
      <span className="font-medium text-foreground">{value.toFixed(1)}</span>
      {showCount && count !== undefined && (
        <span className="text-muted-foreground">({count.toLocaleString()})</span>
      )}
    </span>
  )
}

export function RatingHistogram({
  data,
  total,
}: {
  data: { stars: number; count: number; pct: number }[]
  total: number
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {data.map((row) => (
        <div key={row.stars} className="flex items-center gap-2 text-xs">
          <span className="inline-flex w-12 items-center gap-1 text-muted-foreground">
            {row.stars}
            <Star style={{ width: 11, height: 11, color: 'var(--warning)' }} fill="currentColor" strokeWidth={0} />
          </span>
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${row.pct}%`, background: 'var(--warning)' }}
            />
          </div>
          <span className="w-16 text-right tabular-nums text-muted-foreground">
            {row.count.toLocaleString()}
          </span>
        </div>
      ))}
      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{total.toLocaleString()} ratings</span>
      </div>
    </div>
  )
}
