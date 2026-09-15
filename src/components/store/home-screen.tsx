'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Clock, Star, Layers, Shield, Download, ArrowRight } from 'lucide-react'
import { AppCard, type App } from './app-card'
import { SectionHeader, Chip } from './primitives'
import { platforms } from '@/data/mock'
import { PlatformLogo } from './platform-badge'
import { useNav } from '@/lib/store/nav'
import { cn } from '@/lib/utils'
import { formatDownloads } from '@/data/mock'

export function HomeScreen({ apps }: { apps: App[] }) {
  const navigate = useNav((s) => s.navigate)

  const featured = apps.filter((a) => a.featured).slice(0, 5)
  const sortedByDownloads = [...apps].sort((a, b) => b.downloads - a.downloads)
  const sortedByRating = [...apps].sort((a, b) => b.ratingAvg - a.ratingAvg)
  const sortedByUpdated = [...apps].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
  const sortedByNewest = [...apps].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
  const editorsPicks = apps.filter((a) => a.featured).slice(0, 4)

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      {/* Hero carousel */}
      <HeroCarousel apps={featured} />

      {/* Browse by platform tiles */}
      <section className="space-y-3">
        <SectionHeader title="Browse by platform" subtitle="Pick a platform to see curated apps." />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {platforms.map((p) => (
            <button
              key={p.slug}
              onClick={() => navigate({ name: 'browse', platform: p.slug })}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-[22%]"
                style={{ background: `${p.color}1A`, color: p.color }}
              >
                <PlatformLogo slug={p.slug} className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {apps.filter((a) => a.platforms.includes(p.slug)).length} apps
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Top free apps */}
      <section className="space-y-3">
        <SectionHeader
          title="Top free apps"
          subtitle="Most downloaded this month."
          action="See all"
          onAction={() => navigate({ name: 'browse', category: 'top' })}
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sortedByDownloads.slice(0, 10).map((a) => (
            <AppCard key={a.id} app={a} />
          ))}
        </div>
      </section>

      {/* Editor's picks */}
      <section className="space-y-3">
        <SectionHeader
          title="Editor's picks"
          subtitle="Hand-curated by our team. Always free, always verified."
          action="See collection"
          onAction={() => navigate({ name: 'collections' })}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {editorsPicks.map((a) => (
            <AppCard key={a.id} app={a} variant="grid" />
          ))}
        </div>
      </section>

      {/* Two-column: New releases + Top rated */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-3">
          <SectionHeader
            title="New releases"
            subtitle="Freshly published apps."
            action="See all"
            onAction={() => navigate({ name: 'browse', category: 'new' })}
          />
          <div className="flex flex-col gap-2">
            {sortedByNewest.slice(0, 5).map((a) => (
              <AppCard key={a.id} app={a} variant="list" />
            ))}
          </div>
        </section>
        <section className="space-y-3">
          <SectionHeader
            title="Top rated"
            subtitle="Highest-rated by our community."
            action="See all"
            onAction={() => navigate({ name: 'browse', category: 'top-rated' })}
          />
          <div className="flex flex-col gap-2">
            {sortedByRating.slice(0, 5).map((a, i) => (
              <AppCard key={a.id} app={a} variant="rank" rank={i + 1} />
            ))}
          </div>
        </section>
      </div>

      {/* Recently updated */}
      <section className="space-y-3">
        <SectionHeader
          title="Recently updated"
          subtitle="Apps that shipped a new version this week."
          action="See all"
          onAction={() => navigate({ name: 'browse', category: 'updated' })}
        />
        <div className="no-scrollbar -mx-4 flex gap-3 px-4 md:mx-0 md:rounded-xl md:border md:border-border md:bg-card md:p-3">
          {sortedByUpdated.slice(0, 8).map((a) => (
            <AppCard key={a.id} app={a} className="w-56 shrink-0" />
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-background p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: <Shield className="h-5 w-5" />, title: 'SHA-256 verified', body: 'Every binary has its checksum shown on the detail page so you can verify before install.' },
            { icon: <Shield className="h-5 w-5" />, title: 'VirusTotal scanned', body: 'Every upload is scanned against 70+ engines. Scan status is public on each version.' },
            { icon: <Shield className="h-5 w-5" />, title: 'Open licenses', body: 'We publish the license type and source URL for every app. No warez, no repacks.' },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                {f.icon}
              </span>
              <div>
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function HeroCarousel({ apps }: { apps: App[] }) {
  const [idx, setIdx] = React.useState(0)
  const total = apps.length
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % total), 6000)
    return () => clearInterval(t)
  }, [total])

  const next = () => setIdx((i) => (i + 1) % total)
  const prev = () => setIdx((i) => (i - 1 + total) % total)

  return (
    <section className="relative overflow-hidden rounded-2xl">
      <div className="relative aspect-[16/10] md:aspect-[21/9]">
        {apps.map((app, i) => (
          <div
            key={app.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-500',
              i === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            style={{
              background: `linear-gradient(135deg, ${app.iconGradient[0]} 0%, ${app.iconGradient[1]} 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative flex h-full flex-col justify-end gap-3 p-5 md:gap-5 md:p-10">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                <Sparkles className="h-3 w-3" /> Featured · #{i + 1}
              </div>
              <div className="max-w-2xl text-white">
                <h2 className="text-2xl font-semibold tracking-tight md:text-4xl">{app.name}</h2>
                <p className="mt-2 max-w-prose text-sm text-white/85 md:text-base">{app.tagline}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/80">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3" fill="currentColor" strokeWidth={0} /> {app.ratingAvg.toFixed(1)}
                  </span>
                  <span>·</span>
                  <span>{formatDownloads(app.downloads)} downloads</span>
                  <span>·</span>
                  <span>{app.license}</span>
                </div>
              </div>
              <button
                onClick={() => useNav.getState().navigate({ name: 'app', slug: app.slug })}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-foreground transition-transform hover:scale-105"
              >
                <Download className="h-4 w-4" /> View app
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30 md:flex"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30 md:flex"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {apps.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
