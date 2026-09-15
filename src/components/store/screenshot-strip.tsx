'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { App } from './app-card'

// Snap-scrolling screenshot strip (mobile + desktop share the same component)
export function ScreenshotStrip({
  screenshots,
  className,
}: {
  screenshots: App['screenshots']
  className?: string
}) {
  const [lightbox, setLightbox] = React.useState<number | null>(null)

  return (
    <>
      <div
        className={cn(
          'no-scrollbar flex snap-x-mandatory gap-3 overflow-x-auto rounded-xl',
          className
        )}
        style={{ scrollPaddingLeft: 16 }}
      >
        {screenshots.map((s, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            className="relative aspect-video w-72 shrink-0 snap-start overflow-hidden rounded-xl border border-border"
            style={{
              background: `linear-gradient(135deg, ${s.gradient[0]} 0%, ${s.gradient[1]} 100%)`,
            }}
            aria-label={`Screenshot ${i + 1}: ${s.label}`}
          >
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute bottom-3 left-3 right-3 text-left">
              <span className="inline-block rounded-md bg-black/40 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                {s.label}
              </span>
            </div>
          </button>
        ))}
      </div>
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20"
            style={{
              background: `linear-gradient(135deg, ${screenshots[lightbox].gradient[0]} 0%, ${screenshots[lightbox].gradient[1]} 100%)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute bottom-4 left-4 right-4 text-left">
              <span className="inline-block rounded-md bg-black/60 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                {screenshots[lightbox].label}
              </span>
            </div>
          </button>
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            ✕
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {screenshots.map((_, i) => (
              <button
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === lightbox ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  setLightbox(i)
                }}
                aria-label={`Go to screenshot ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
