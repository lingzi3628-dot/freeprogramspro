'use client'

import * as React from 'react'
import { SlidersHorizontal, SearchX, X } from 'lucide-react'
import { AppCard, type App } from './app-card'
import { Chip, EmptyState } from './primitives'
import { platforms, categories } from '@/data/mock'
import { useNav } from '@/lib/store/nav'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from '@/components/ui/sheet'

type SortKey = 'relevance' | 'newest' | 'rating' | 'downloads' | 'az'

export function BrowseScreen({ apps, initialPlatform }: { apps: App[]; initialPlatform?: string }) {
  const navigate = useNav((s) => s.navigate)
  const [platform, setPlatform] = React.useState<string | undefined>(initialPlatform)
  const [category, setCategory] = React.useState<string | undefined>(undefined)
  const [license, setLicense] = React.useState<string | undefined>(undefined)
  const [minRating, setMinRating] = React.useState<number>(0)
  const [sort, setSort] = React.useState<SortKey>('relevance')
  const [filtersOpenMobile, setFiltersOpenMobile] = React.useState(false)

  React.useEffect(() => {
    setPlatform(initialPlatform)
  }, [initialPlatform])

  let filtered = apps.filter((a) => {
    if (platform && !a.platforms.includes(platform as any)) return false
    if (category && a.category !== category) return false
    if (license && !a.tags.includes(license)) return false
    if (a.ratingAvg < minRating) return false
    return true
  })

  filtered = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'newest': return +new Date(b.publishedAt) - +new Date(a.publishedAt)
      case 'rating': return b.ratingAvg - a.ratingAvg
      case 'downloads': return b.downloads - a.downloads
      case 'az': return a.name.localeCompare(b.name)
      default: return b.downloads * b.ratingAvg - a.downloads * a.ratingAvg
    }
  })

  const activeFilterCount = (platform ? 1 : 0) + (category ? 1 : 0) + (license ? 1 : 0) + (minRating ? 1 : 0)

  const clearAll = () => {
    setPlatform(undefined)
    setCategory(undefined)
    setLicense(undefined)
    setMinRating(0)
    navigate({ name: 'browse' })
  }

  const FilterControls = () => (
    <div className="space-y-4">
      <FilterGroup title="Platform">
        <Chip selected={!platform} onClick={() => setPlatform(undefined)}>All</Chip>
        {platforms.map((p) => (
          <Chip key={p.slug} selected={platform === p.slug} onClick={() => setPlatform(p.slug)}>
            {p.name}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="Category">
        <Chip selected={!category} onClick={() => setCategory(undefined)}>All</Chip>
        {categories.map((c) => (
          <Chip key={c.slug} selected={category === c.slug} onClick={() => setCategory(c.slug)}>
            {c.name}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="License">
        {['open-source', 'freeware', 'privacy', 'offline', 'lightweight'].map((l) => (
          <Chip key={l} selected={license === l} onClick={() => setLicense(license === l ? undefined : l)}>
            {l.replace('-', ' ')}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="Minimum rating">
        {[0, 4, 4.5, 4.8].map((r) => (
          <Chip key={r} selected={minRating === r} onClick={() => setMinRating(r)}>
            {r === 0 ? 'Any' : `★ ${r}+`}
          </Chip>
        ))}
      </FilterGroup>
    </div>
  )

  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      <div className="space-y-1">
        <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
          <button onClick={() => navigate({ name: 'home' })} className="hover:text-primary">Home</button>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">
            {platform ? platforms.find((p) => p.slug === platform)?.name : 'All apps'}
          </span>
        </nav>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {platform ? `${platforms.find((p) => p.slug === platform)?.name} apps` : 'Browse all apps'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length.toLocaleString()} apps
          {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
        </p>
      </div>

      {/* Desktop filter sidebar + content grid */}
      <div className="flex gap-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Filters</h2>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} className="text-xs text-primary hover:underline">
                  Clear all
                </button>
              )}
            </div>
            <FilterControls />
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-3">
          {/* Sticky sort bar */}
          <div className="sticky top-14 z-20 flex items-center gap-2 rounded-xl border border-border bg-background/95 p-2 backdrop-blur md:top-[60px]">
            <Sheet open={filtersOpenMobile} onOpenChange={setFiltersOpenMobile}>
              <SheetTrigger asChild>
                <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium lg:hidden">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{activeFilterCount}</span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <FilterControls />
                  <button
                    onClick={() => setFiltersOpenMobile(false)}
                    className="w-full rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Show {filtered.length} results
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Inline selected filters */}
            <div className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto">
              {platform && (
                <ActiveFilter label={platforms.find((p) => p.slug === platform)?.name || ''} onRemove={() => setPlatform(undefined)} />
              )}
              {category && (
                <ActiveFilter label={categories.find((c) => c.slug === category)?.name || ''} onRemove={() => setCategory(undefined)} />
              )}
              {license && (
                <ActiveFilter label={license.replace('-', ' ')} onRemove={() => setLicense(undefined)} />
              )}
              {minRating > 0 && (
                <ActiveFilter label={`★ ${minRating}+`} onRemove={() => setMinRating(0)} />
              )}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground md:inline">Sort:</span>
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="h-8 w-[140px] rounded-full border-border bg-card text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rating">Top rated</SelectItem>
                  <SelectItem value="downloads">Most downloaded</SelectItem>
                  <SelectItem value="az">A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results grid */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-5 w-5" />}
              title="No apps match your filters"
              description="Try clearing one or more filters, or browse all apps."
              action="Clear all filters"
              onAction={clearAll}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((a) => (
                <AppCard key={a.id} app={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function ActiveFilter({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
      {label}
      <button onClick={onRemove} className="rounded-full p-0.5 hover:bg-muted-foreground/20" aria-label="Remove">
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
