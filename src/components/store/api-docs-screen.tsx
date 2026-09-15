'use client'

import * as React from 'react'
import { Key, Code2, BookOpen, Zap, Webhook, Copy, ShieldCheck, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ALL_SCOPES, TIER_LIMITS, type ApiScope } from '@/data/v2-mock'
import { useNav } from '@/lib/store/nav'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Endpoint = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  scope: ApiScope | '(any)'
  desc: string
  group: 'Catalog' | 'Downloads' | 'Publishing' | 'Webhooks' | 'Account'
  example?: { request: string; response: string }
}

const ENDPOINTS: Endpoint[] = [
  { method: 'GET', path: '/apps', scope: 'catalog:read', desc: 'List apps (paginated, filterable).', group: 'Catalog',
    example: {
      request: `GET /v2/apps?platform=windows&sort=rating&limit=20
Authorization: Bearer fpp_live_...`,
      response: `{
  "data": [
    {
      "slug": "notepad-pro",
      "name": "Notepad Pro",
      "tagline": "Fast, minimal text editor",
      "icon_url": "https://cdn.../icon.webp",
      "platforms": ["windows"],
      "rating": 4.8,
      "downloads": 120340,
      "latest_version": "3.2.1",
      "signed": true,
      "updated_at": "2026-01-12T10:00:00Z"
    }
  ],
  "meta": { "request_id": "req_01H...", "took_ms": 32, "next_cursor": "eyJpZCI6..." }
}`,
    },
  },
  { method: 'GET', path: '/apps/{slug}', scope: 'catalog:read', desc: 'App detail.', group: 'Catalog' },
  { method: 'GET', path: '/apps/{slug}/versions', scope: 'catalog:read', desc: 'Version list (includes signature objects).', group: 'Catalog' },
  { method: 'GET', path: '/apps/{slug}/reviews', scope: 'reviews:read', desc: 'Reviews.', group: 'Catalog' },
  { method: 'GET', path: '/categories', scope: 'catalog:read', desc: 'Category list.', group: 'Catalog' },
  { method: 'GET', path: '/platforms', scope: 'catalog:read', desc: 'Platform list.', group: 'Catalog' },
  { method: 'GET', path: '/collections', scope: 'catalog:read', desc: 'Collections.', group: 'Catalog' },
  { method: 'GET', path: '/search?q=', scope: 'catalog:read', desc: 'Search proxy.', group: 'Catalog' },
  { method: 'POST', path: '/apps/{slug}/versions/{version}/download', scope: 'downloads:read', desc: 'Issue signed download URL.', group: 'Downloads',
    example: {
      request: `POST /v2/apps/notepad-pro/versions/3.2.1/download
Authorization: Bearer fpp_live_...`,
      response: `{
  "data": {
    "url": "https://cdn.fppstore.io/.../notepad-pro-3.2.1.exe?sig=...&exp=1736899260",
    "expires_at": "2026-01-12T10:01:00Z",
    "file_size": 18432112,
    "checksum_sha256": "9f86d081884c7d65...",
    "signature": {
      "scheme": "authenticode",
      "signer": "Free Programs Pro LLC",
      "verified": true
    }
  }
}`,
    },
  },
  { method: 'GET', path: '/downloads/stats?slug=&range=30d', scope: 'downloads:stats', desc: 'Aggregate download stats.', group: 'Downloads' },
  { method: 'POST', path: '/apps', scope: 'apps:write', desc: 'Create app (draft).', group: 'Publishing' },
  { method: 'PATCH', path: '/apps/{slug}', scope: 'apps:write', desc: 'Update metadata.', group: 'Publishing' },
  { method: 'POST', path: '/apps/{slug}/versions', scope: 'versions:write', desc: 'Create version (metadata).', group: 'Publishing' },
  { method: 'POST', path: '/apps/{slug}/versions/{v}/upload', scope: 'versions:write', desc: 'Request presigned upload URL.', group: 'Publishing' },
  { method: 'POST', path: '/apps/{slug}/versions/{v}/commit', scope: 'versions:write', desc: 'Confirm upload, trigger scan.', group: 'Publishing' },
  { method: 'POST', path: '/apps/{slug}/media', scope: 'media:write', desc: 'Request upload URL for icon/screenshot.', group: 'Publishing' },
  { method: 'POST', path: '/apps/{slug}/publish', scope: 'apps:write', desc: 'Publish (subject to review if external publisher).', group: 'Publishing' },
  { method: 'GET', path: '/webhooks', scope: 'webhooks:manage', desc: 'List webhooks.', group: 'Webhooks' },
  { method: 'POST', path: '/webhooks', scope: 'webhooks:manage', desc: 'Create webhook.', group: 'Webhooks' },
  { method: 'DELETE', path: '/webhooks/{id}', scope: 'webhooks:manage', desc: 'Delete webhook.', group: 'Webhooks' },
  { method: 'POST', path: '/webhooks/{id}/rotate-secret', scope: 'webhooks:manage', desc: 'Rotate webhook secret with 24h grace overlap.', group: 'Webhooks' },
  { method: 'GET', path: '/me', scope: '(any)', desc: 'Info about the calling key.', group: 'Account' },
  { method: 'GET', path: '/me/usage', scope: '(any)', desc: 'Rate limit + quota usage.', group: 'Account' },
]

const EVENT_CATALOG = [
  'app.created', 'app.updated', 'app.published', 'app.unpublished',
  'version.created', 'version.published', 'version.scan_completed',
  'version.signature_verified', 'download.milestone', 'review.created',
  'report.created', 'api_key.rotated', 'api_key.revoked',
  'signing.identity_revoked',
]

const METHOD_COLOR: Record<Endpoint['method'], string> = {
  GET: 'text-[var(--success)]',
  POST: 'text-[var(--warning)]',
  PATCH: 'text-primary',
  DELETE: 'text-[var(--destructive)]',
}

export function ApiDocsScreen() {
  const navigate = useNav((s) => s.navigate)
  const grouped = ENDPOINTS.reduce((acc, e) => {
    (acc[e.group] = acc[e.group] || []).push(e)
    return acc
  }, {} as Record<Endpoint['group'], Endpoint[]>)

  return (
    <div className="mx-auto max-w-[1100px] space-y-8 p-4 md:p-6 lg:p-8">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <BookOpen className="h-3 w-3" /> Public API · v2 stable
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Free Programs Pro Store API</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Programmatic access to the catalog, downloads, and (for approved publishers) version publishing.
          Same auth, rate limiting, and storage layers as the web UI — not a bolt-on.
        </p>
      </header>

      {/* Quickstart */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Key className="h-4 w-4" /> Authentication
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Send your API key as a Bearer token. Live, test, publish, and read-only keys have different prefixes.
          </p>
          <CodeBlock title="Header" code={`Authorization: Bearer fpp_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
# or legacy:
X-API-Key: fpp_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`} />
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Code2 className="h-4 w-4" /> Base URL & versioning
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            <code className="font-mono">https://api.freeprogramspro.store/v2</code> is the current stable surface.
            Breaking changes go to <code className="font-mono">/v3</code> with 12-month deprecation on /v2.
          </p>
          <CodeBlock title="Try it" code={`curl https://api.freeprogramspro.store/v2/apps \\
  -H "Authorization: Bearer fpp_live_..." \\
  -H "Accept: application/json"`} />
        </div>
      </section>

      {/* Rate limit tiers */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Zap className="h-4 w-4" /> Rate limits & quotas
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">Per-key, applied at the edge (Cloudflare + Redis sliding window).</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="px-2 py-1.5 font-medium">Tier</th>
                <th className="px-2 py-1.5 font-medium">Req/min</th>
                <th className="px-2 py-1.5 font-medium">Burst</th>
                <th className="px-2 py-1.5 font-medium">Concurrent uploads</th>
                <th className="px-2 py-1.5 font-medium">Catalog reads</th>
                <th className="px-2 py-1.5 font-medium">Download URLs</th>
                <th className="px-2 py-1.5 font-medium">Version pushes</th>
                <th className="px-2 py-1.5 font-medium">Storage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(['free', 'developer', 'partner', 'enterprise'] as const).map((tier) => (
                <tr key={tier}>
                  <td className="px-2 py-1.5 font-medium capitalize">{tier}</td>
                  <td className="px-2 py-1.5 tabular-nums">{TIER_LIMITS[tier].rpm || 'Custom'}</td>
                  <td className="px-2 py-1.5 tabular-nums">{TIER_LIMITS[tier].burst || 'Custom'}</td>
                  <td className="px-2 py-1.5 tabular-nums">{TIER_LIMITS[tier].uploads || 'Custom'}</td>
                  <td className="px-2 py-1.5">{TIER_LIMITS[tier].reads}</td>
                  <td className="px-2 py-1.5">{TIER_LIMITS[tier].urls}</td>
                  <td className="px-2 py-1.5">{TIER_LIMITS[tier].pushes}</td>
                  <td className="px-2 py-1.5">{TIER_LIMITS[tier].storage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Every response includes <code className="font-mono">X-RateLimit-*</code> and <code className="font-mono">X-Quota-*</code> headers.
          Quota overage returns <code className="font-mono">429 quota_exceeded</code>.
        </p>
      </section>

      {/* Scopes */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4" /> Scopes & permissions
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">Wildcards are not allowed; you must enumerate scopes at key creation.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {ALL_SCOPES.map((s) => (
            <div key={s.scope} className="flex items-start gap-2 rounded-lg border border-border p-2.5">
              <code className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-mono text-primary">{s.scope}</code>
              <span className="text-xs text-muted-foreground">{s.description}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Endpoint reference */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Endpoint reference</h2>
        <Accordion type="multiple" defaultValue={['Catalog']} className="space-y-2">
          {Object.entries(grouped).map(([group, eps]) => (
            <AccordionItem key={group} value={group} className="overflow-hidden rounded-xl border border-border bg-card">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2 pr-2">
                  <Badge variant="secondary" className="text-[10px]">{eps.length}</Badge>
                  <span className="text-sm font-semibold">{group}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0">
                <ul className="divide-y divide-border">
                  {eps.map((ep) => (
                    <li key={ep.method + ep.path} className="py-2">
                      <div className="flex items-center gap-2">
                        <span className={cn('w-12 shrink-0 font-mono text-[10px] font-semibold', METHOD_COLOR[ep.method])}>{ep.method}</span>
                        <code className="text-xs font-mono">{ep.path}</code>
                        <Badge variant="outline" className="ml-auto text-[10px]">{ep.scope}</Badge>
                      </div>
                      <p className="mt-0.5 pl-14 text-[11px] text-muted-foreground">{ep.desc}</p>
                      {ep.example && (
                        <div className="mt-2 pl-14">
                          <div className="grid gap-2 md:grid-cols-2">
                            <CodeBlock title="Request" code={ep.example.request} small />
                            <CodeBlock title="Response" code={ep.example.response} small />
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Webhooks */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Webhook className="h-4 w-4" /> Webhooks
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          HTTP POST, 5 retries with exponential backoff (1s, 5s, 30s, 5m, 30m), 10s timeout. Dead-letter after 5 failures.
          Verify the signature using <code className="font-mono">X-FPP-Signature</code> HMAC-SHA256.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {EVENT_CATALOG.map((e) => (
            <code key={e} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-mono">{e}</code>
          ))}
        </div>
        <CodeBlock title="Webhook payload" code={`{
  "id": "evt_01H...",
  "type": "version.signature_verified",
  "created_at": "2026-01-12T10:00:00Z",
  "data": {
    "app_slug": "notepad-pro",
    "version": "3.2.1",
    "platform": "windows",
    "signature": {
      "scheme": "authenticode",
      "verified": true,
      "signer": "Free Programs Pro LLC",
      "thumbprint": "a1b2c3..."
    }
  }
}`} />
      </section>

      {/* Error envelope */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Code2 className="h-4 w-4" /> Response envelope & errors
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-medium text-[var(--success)]">Success</h3>
            <CodeBlock small code={`{ "data": { ... }, "meta": { "request_id": "req_01H...", "took_ms": 42 } }`} />
          </div>
          <div>
            <h3 className="text-xs font-medium text-[var(--danger)]">Error</h3>
            <CodeBlock small code={`{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "You have exceeded 60 req/min for this key.",
    "details": { "retry_after_s": 12 },
    "request_id": "req_01H..."
  }
}`} />
          </div>
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">
          Standard error codes: <code className="font-mono">unauthorized</code>, <code className="font-mono">forbidden</code>, <code className="font-mono">not_found</code>, <code className="font-mono">validation_error</code>, <code className="font-mono">rate_limit_exceeded</code>, <code className="font-mono">quota_exceeded</code>, <code className="font-mono">key_revoked</code>, <code className="font-mono">signature_required</code>, <code className="font-mono">internal_error</code>.
        </p>
      </section>

      {/* HMAC signing */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4" /> Optional HMAC request signing
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          For high-value keys (write scopes), requests can be signed to protect against replay and key leakage in transit logs.
        </p>
        <CodeBlock title="Headers" code={`X-FPP-Timestamp: 1736899200
X-FPP-Signature: sha256=hex(hmac_sha256(secret, timestamp + "." + method + "." + path + "." + body_sha256))`} />
        <p className="mt-2 text-[11px] text-muted-foreground">
          Server rejects if timestamp skew &gt; 300s, signature mismatch, or body hash mismatch.
        </p>
      </section>

      {/* CTA */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary/5 p-4">
        <div>
          <h2 className="text-sm font-semibold">Ready to build?</h2>
          <p className="text-xs text-muted-foreground">Create an API key in the admin panel to get started.</p>
        </div>
        <button
          onClick={() => navigate({ name: 'admin-api-keys' })}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary-hover"
        >
          <Key className="h-3.5 w-3.5" /> Manage API keys
        </button>
      </section>
    </div>
  )
}

function CodeBlock({ title, code, small }: { title?: string; code: string; small?: boolean }) {
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-border bg-muted/40">
      {title && (
        <div className="border-b border-border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
      )}
      <div className="flex items-start gap-2 p-3">
        <pre className={cn('flex-1 overflow-x-auto font-mono', small ? 'text-[10px]' : 'text-[11px]')}>{code}</pre>
        <button
          onClick={() => { navigator.clipboard?.writeText(code); toast.success('Copied') }}
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted"
          aria-label="Copy"
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
