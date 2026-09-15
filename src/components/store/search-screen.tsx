'use client'

import * as React from 'react'
import { Search, Clock, X, TrendingUp, ArrowRight } from 'lucide-react'
import { AppCard, type App } from './app-card'
import { EmptyState } from './primitives'
import { useNav } from '@/lib/store/nav'
import { cn } from '@/lib/utils'

const SUGGESTION_CATEGORIES = ['Privacy', 'Open source', 'Linux', 'Cross-platform', 'Lightweight', 'No account']

export function SearchScreen({ apps }: { apps: App[] }) {
  const navigate = useNav((s) => s.navigate)
  const [q, setQ] = React.useState('')
  const [recent, setRecent] = React.useState(['Notes app', 'Aegis', 'PDF reader', 'Codex'])

  const results = q.length > 0
    ? apps.filter((a) => {
        const s = `${a.name} ${a.tagline} ${a.description} ${a.developer} ${a.tags.join(' ')}`.toLowerCase()
        return s.includes(q.toLowerCase())
      })
    : []

  const suggestions = q.length > 0
    ? apps.filter((a) => a.name.toLowerCase().startsWith(q.toLowerCase()) && !results.includes(a)).slice(0, 4)
    : []

  const trending = [...apps].sort((a, b) => b.downloads - a.downloads).slice(0, 5)

  const submitSearch = (term: string) => {
    if (!term.trim()) return
    setRecent((r) => [term, ...r.filter((x) => x !== term)].slice(0, 8))
    setQ(term)
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 md:p-6 lg:p-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Search</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submitSearch(q)
          }}
          className="relative"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by app name, tagline, developer, or tag…"
            className="h-12 w-full rounded-full border border-border bg-card pl-12 pr-12 text-base shadow-sm outline-none ring-primary/30 focus:ring-2"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>

      {q.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4" /> Recent searches
            </h2>
            {recent.length === 0 ? (
              <p className="text-xs text-muted-foreground">No recent searches yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button
                    key={r}
                    onClick={() => submitSearch(r)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-surface-hover"
                  >
                    {r}
                    <X
                      className="h-3 w-3"
                      onClick={(e) => {
                        e.stopPropagation()
                        setRecent((arr) => arr.filter((x) => x !== r))
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4" /> Trending now
            </h2>
            <div className="flex flex-col gap-2">
              {trending.map((a) => (
                <AppCard key={a.id} app={a} variant="list" />
              ))}
            </div>
          </section>
        </div>
      ) : results.length === 0 && suggestions.length === 0 ? (
        <EmptyState
          icon={<Search className="h-5 w-5" />}
          title={`No results for "${q}"`}
          description="Try a different keyword, or browse all apps. Zero-result queries are logged so we can improve our index."
          action="Browse all apps"
          onAction={() => navigate({ name: 'browse' })}
        />
      ) : (
        <div className="space-y-6">
          {suggestions.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suggestions</h2>
              <div className="flex flex-col gap-1">
                {suggestions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => navigate({ name: 'app', slug: a.slug })}
                    className="flex items-center gap-3 rounded-lg p-2 text-left hover:bg-surface-hover"
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{a.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{a.developer}</span>
                    <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </section>
          )}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">
              {results.length} result{results.length === 1 ? '' : 's'} for "{q}"
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {results.map((a) => (
                <AppCard key={a.id} app={a} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
