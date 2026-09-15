'use client'

import * as React from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  ExternalLink,
  ChevronRight,
  Flag,
  Heart,
  Share2,
  Copy,
  Clock,
  Tag,
  HardDrive,
  Check,
  Users,
  Download as DownloadIcon,
  Star,
} from 'lucide-react'
import { AppCard, type App } from './app-card'
import { AppIcon } from './app-card'
import { PlatformBadge } from './platform-badge'
import { Rating, RatingHistogram } from './rating'
import { DownloadButton } from './download-button'
import { ScreenshotStrip } from './screenshot-strip'
import { SectionHeader, TrustBadge, EmptyState } from './primitives'
import { formatBytes, formatDownloads, ratingHistogram, timeAgo, platforms, type PlatformSlug } from '@/data/mock'
import { useNav } from '@/lib/store/nav'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function AppDetailScreen({ app, allApps }: { app: App; allApps: App[] }) {
  const navigate = useNav((s) => s.navigate)
  const [whishlisted, setWhishlisted] = React.useState(false)
  const stable = app.versions.filter((v) => v.channel === 'stable')
  const latest = stable[0] || app.versions[0]
  const moreFromDev = allApps.filter((a) => a.developerSlug === app.developerSlug && a.slug !== app.slug).slice(0, 4)
  const similar = allApps.filter((a) => a.category === app.category && a.slug !== app.slug).slice(0, 4)
  const hist = ratingHistogram(app)

  return (
    <div className="pb-24 md:pb-0">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-background px-4 py-2 md:px-6 md:py-3">
        <nav className="mx-auto flex max-w-[1200px] items-center gap-1.5 text-xs text-muted-foreground">
          <button onClick={() => navigate({ name: 'home' })} className="hover:text-primary">Home</button>
          <ChevronRight className="h-3 w-3" />
          <button onClick={() => navigate({ name: 'browse', platform: app.platforms[0] })} className="hover:text-primary">
            {platforms.find((p) => p.slug === app.platforms[0])?.name}
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{app.name}</span>
        </nav>
      </div>

      <div className="mx-auto grid max-w-[1200px] gap-6 p-4 md:p-6 lg:grid-cols-[320px_1fr] lg:gap-8 lg:p-8">
        {/* Sticky meta rail (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <MetaCard app={app} latest={latest} />
          </div>
        </aside>

        {/* Body */}
        <div className="min-w-0 space-y-6">
          {/* Header (mobile shows meta here) */}
          <div className="lg:hidden">
            <MetaCard app={app} latest={latest} variant="mobile" />
          </div>

          {/* About */}
          <section className="space-y-3">
            <SectionHeader title="About this app" />
            <div className="prose prose-sm max-w-none">
              <p className="leading-relaxed text-foreground/90">{app.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {app.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-medium">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {t.replace('-', ' ')}
                </span>
              ))}
            </div>
          </section>

          {/* Screenshots */}
          <section className="space-y-3">
            <SectionHeader title="Screenshots" />
            <ScreenshotStrip screenshots={app.screenshots} />
          </section>

          {/* What's new */}
          <section className="space-y-3">
            <SectionHeader title="What's new" subtitle={`Latest version: ${latest?.version}`} />
            <Accordion type="single" defaultValue={latest?.id} className="rounded-xl border border-border bg-card">
              {stable.slice(0, 3).map((v) => (
                <AccordionItem key={v.id} value={v.id} className="border-b border-border last:border-0">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex flex-1 items-center justify-between gap-2 pr-2 text-left">
                      <span className="text-sm font-medium">Version {v.version}</span>
                      <span className="text-xs text-muted-foreground">
                        {platforms.find((p) => p.slug === v.platform)?.name} · {timeAgo(v.publishedAt)}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-0">
                    <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-muted-foreground">
{v.releaseNotes}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Trust block */}
          <section className="space-y-3">
            <SectionHeader title="Trust & safety" subtitle="Verify before you install." />
            <div className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
              <TrustRow icon={<ShieldCheck className="h-4 w-4 text-[var(--success)]" />} label="Scan status">
                {latest ? (
                  <TrustBadge variant={latest.scanStatus === 'clean' ? 'clean' : latest.scanStatus === 'pending' ? 'pending' : 'flagged'}
                    label={latest.scanStatus === 'clean' ? 'Clean — no threats found' : latest.scanStatus === 'pending' ? 'Scan in progress' : 'Flagged'} />
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">Scanned by {latest?.scanProvider} · 70+ engines</p>
              </TrustRow>
              <TrustRow icon={<HardDrive className="h-4 w-4" />} label="SHA-256 checksum">
                <code className="block max-w-full break-all rounded-md bg-muted px-2 py-1 text-[11px] font-mono text-foreground/80">
                  {latest?.checksumSha256}
                </code>
                <button
                  className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                  onClick={() => {
                    navigator.clipboard?.writeText(latest?.checksumSha256 || '')
                    toast.success('Copied SHA-256 to clipboard')
                  }}
                >
                  <Copy className="h-3 w-3" /> Copy checksum
                </button>
              </TrustRow>
              <TrustRow icon={<Tag className="h-4 w-4" />} label="License">
                <Badge variant="secondary" className="text-xs">{app.license}</Badge>
                <a href={app.sourceUrl} target="_blank" rel="noreferrer noopener" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> View source
                </a>
              </TrustRow>
              <TrustRow icon={<Clock className="h-4 w-4" />} label="Last updated">
                <span className="text-sm">{timeAgo(app.updatedAt)}</span>
                <p className="text-xs text-muted-foreground">Released {timeAgo(latest?.publishedAt || '')}</p>
              </TrustRow>
              {app.permissions && app.permissions.length > 0 && (
                <TrustRow icon={<Shield className="h-4 w-4" />} label="Permissions" className="md:col-span-2">
                  <div className="flex flex-wrap gap-1">
                    {app.permissions.map((p) => (
                      <span key={p} className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium">{p}</span>
                    ))}
                  </div>
                </TrustRow>
              )}
            </div>
          </section>

          {/* Ratings & reviews */}
          <section className="space-y-3">
            <SectionHeader title="Ratings & reviews" subtitle={`${app.ratingCount.toLocaleString()} ratings · ${app.ratingAvg.toFixed(1)} average`} />
            <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-[260px_1fr]">
              <div className="space-y-3">
                <div className="text-center md:text-left">
                  <div className="text-5xl font-semibold tabular-nums">{app.ratingAvg.toFixed(1)}</div>
                  <div className="mt-1">
                    <Rating value={app.ratingAvg} showCount={false} size={14} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{app.ratingCount.toLocaleString()} ratings</p>
                </div>
                <RatingHistogram data={hist} total={app.ratingCount} />
              </div>
              <div className="space-y-3 border-t border-border pt-4 md:border-l md:border-l-border md:border-t-0 md:pl-4 md:pt-0">
                {app.reviews.slice(0, 3).map((r) => (
                  <ReviewRow key={r.id} review={r} />
                ))}
                <Button variant="ghost" size="sm" className="w-full text-primary">
                  See all {app.reviews.length} reviews
                </Button>
              </div>
            </div>
          </section>

          {/* Version history */}
          <section className="space-y-3">
            <SectionHeader title="Version history" subtitle="All published versions across platforms." />
            <VersionTable app={app} />
          </section>

          {/* More from developer */}
          {moreFromDev.length > 0 && (
            <section className="space-y-3">
              <SectionHeader
                title={`More from ${app.developer}`}
                action="See all"
                onAction={() => navigate({ name: 'developer', slug: app.developerSlug })}
              />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {moreFromDev.map((a) => (
                  <AppCard key={a.id} app={a} />
                ))}
              </div>
            </section>
          )}

          {/* Similar apps */}
          {similar.length > 0 && (
            <section className="space-y-3">
              <SectionHeader title="Similar apps" subtitle={`Other ${app.category.replace('-', ' ')} apps.`} />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {similar.map((a) => (
                  <AppCard key={a.id} app={a} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Sticky mobile download bar */}
      <div className="fixed bottom-14 left-0 right-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur safe-bottom md:hidden">
        <div className="flex items-center gap-3">
          <AppIcon app={app} size={40} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{app.name}</p>
            <p className="truncate text-xs text-muted-foreground">{formatBytes(latest?.fileSize || app.sizeBytes)}</p>
          </div>
          <DownloadButton
            size="sm"
            fileName={`${app.slug}-${latest?.version}.zip`}
            sizeLabel={formatBytes(latest?.fileSize || app.sizeBytes)}
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  )
}

function MetaCard({ app, latest, variant = 'desktop' }: { app: App; latest: any; variant?: 'desktop' | 'mobile' }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', variant === 'mobile' && 'flex gap-4 p-4')}>
      {variant === 'desktop' ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <AppIcon app={app} size={88} />
          <div>
            <h1 className="text-lg font-semibold leading-tight">{app.name}</h1>
            <button
              onClick={() => useNav.getState().navigate({ name: 'developer', slug: app.developerSlug })}
              className="text-xs text-primary hover:underline"
            >
              {app.developer}
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {app.platforms.map((p) => (
              <PlatformBadge key={p} platform={p} />
            ))}
          </div>
          <div className="w-full">
            <Rating value={app.ratingAvg} count={app.ratingCount} size={14} className="justify-center" />
          </div>
          <dl className="w-full space-y-2 border-t border-border pt-3 text-left text-xs">
            <MetaRow label="Downloads" value={formatDownloads(app.downloads)} />
            <MetaRow label="Size" value={formatBytes(latest?.fileSize || app.sizeBytes)} />
            <MetaRow label="Version" value={latest?.version} />
            <MetaRow label="Released" value={timeAgo(latest?.publishedAt || '')} />
            <MetaRow label="License" value={app.license} />
            <MetaRow label="Category" value={app.category.replace('-', ' ')} />
          </dl>
          <DownloadButton
            fileName={`${app.slug}-${latest?.version}.zip`}
            sizeLabel={formatBytes(latest?.fileSize || app.sizeBytes)}
            checksum={latest?.checksumSha256}
            className="w-full"
          />
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href)
                toast.success('Copied link to clipboard')
              }}
            >
              <Share2 className="mr-1 h-3.5 w-3.5" /> Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                useNav.getState().navigate({ name: 'admin-reports' })
                toast.info('Opening report form')
              }}
            >
              <Flag className="mr-1 h-3.5 w-3.5" /> Report
            </Button>
          </div>
        </div>
      ) : (
        <>
          <AppIcon app={app} size={72} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold leading-tight">{app.name}</h1>
            <p className="mt-0.5 text-xs text-primary">{app.developer}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {app.platforms.map((p) => (
                <PlatformBadge key={p} platform={p} />
              ))}
            </div>
            <div className="mt-2">
              <Rating value={app.ratingAvg} count={app.ratingCount} size={13} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDownloads(app.downloads)} downloads · {formatBytes(latest?.fileSize || app.sizeBytes)}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}

function TrustRow({ icon, label, children, className }: { icon: React.ReactNode; label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      {children}
    </div>
  )
}

function ReviewRow({ review }: { review: App['reviews'][0] }) {
  return (
    <article className="space-y-1 border-b border-border pb-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback style={{ background: review.avatarColor }} className="text-[10px] text-white">
            {review.author.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="text-xs font-medium">{review.author}</div>
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          {timeAgo(review.createdAt)}
        </div>
      </div>
      <Rating value={review.rating} showCount={false} size={12} />
      <p className="text-xs leading-relaxed text-foreground/90">{review.body}</p>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <button className="inline-flex items-center gap-1 hover:text-primary">
          <ThumbUp className="h-3 w-3" /> Helpful ({review.helpfulCount})
        </button>
        <button className="hover:text-primary">Report</button>
      </div>
    </article>
  )
}

function ThumbUp(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 10v12M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h.83a2 2 0 0 0 1.67-1.11L12 4a2 2 0 0 1 3-1z"/>
    </svg>
  )
}

function VersionTable({ app }: { app: App }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Version</th>
            <th className="px-3 py-2 font-medium">Platform</th>
            <th className="hidden px-3 py-2 font-medium md:table-cell">Channel</th>
            <th className="hidden px-3 py-2 font-medium md:table-cell">Released</th>
            <th className="px-3 py-2 font-medium">Size</th>
            <th className="px-3 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {app.versions.map((v) => (
            <tr key={v.id} className="hover:bg-surface-hover">
              <td className="px-3 py-2 font-mono font-medium">{v.version}</td>
              <td className="px-3 py-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: platforms.find((p) => p.slug === v.platform)?.color }} />
                  {platforms.find((p) => p.slug === v.platform)?.name}
                </span>
              </td>
              <td className="hidden px-3 py-2 md:table-cell">
                <span className={cn(
                  'rounded px-1.5 py-0.5 text-[10px] font-medium uppercase',
                  v.channel === 'stable' ? 'bg-[var(--success)]/10 text-[var(--success)]'
                  : v.channel === 'beta' ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                  : 'bg-muted text-muted-foreground'
                )}>
                  {v.channel}
                </span>
              </td>
              <td className="hidden px-3 py-2 text-muted-foreground md:table-cell">{timeAgo(v.publishedAt)}</td>
              <td className="px-3 py-2 tabular-nums">{formatBytes(v.fileSize)}</td>
              <td className="px-3 py-2">
                <TrustBadge
                  variant={v.scanStatus === 'clean' ? 'clean' : v.scanStatus === 'pending' ? 'pending' : 'flagged'}
                  label={v.scanStatus}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
