// ============================================================================
// V2.0 DATA ADDENDUM
// Code signing identities, API keys, webhooks, signature results on versions,
// per-platform upload metadata, API usage samples, webhook delivery log.
// ============================================================================

import type { PlatformSlug } from './mock'

export type SigningScheme = 'authenticode' | 'gpg' | 'apk-v2' | 'apk-v3' | 'crx3'

export type TrustLevel = 'verified' | 'self' | 'unsigned' | 'revoked' | 'tampered'

export type SigningIdentity = {
  id: string
  name: string
  platform: PlatformSlug | 'cross'
  scheme: SigningScheme
  thumbprintSha256: string
  status: 'active' | 'grace' | 'revoked'
  revokedAt?: string
  revokedReason?: string
  replacementId?: string
  notBefore: string
  notAfter: string
  owner: string
  createdBy: string
  createdAt: string
  // Counts
  appsSigned: number
  lastUsedAt: string
}

export const signingIdentities: SigningIdentity[] = [
  {
    id: 'si_1',
    name: 'Free Programs Pro LLC (Windows)',
    platform: 'windows',
    scheme: 'authenticode',
    thumbprintSha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678901234567890abcdef1234567',
    status: 'active',
    notBefore: '2025-06-01T00:00:00Z',
    notAfter: '2026-06-01T00:00:00Z',
    owner: 'release-engineering@fppstore.io',
    createdBy: 'admin@fppstore.io',
    createdAt: '2025-06-01T10:00:00Z',
    appsSigned: 14,
    lastUsedAt: '2026-09-13T18:04:00Z',
  },
  {
    id: 'si_2',
    name: 'Free Programs Pro (Ubuntu/Debian GPG)',
    platform: 'ubuntu',
    scheme: 'gpg',
    thumbprintSha256: '0abcd1234ef56789ab0123456789abcdef0123456789abcdef0123456789abcdef',
    status: 'active',
    notBefore: '2025-01-01T00:00:00Z',
    notAfter: '2028-01-01T00:00:00Z',
    owner: 'release-engineering@fppstore.io',
    createdBy: 'admin@fppstore.io',
    createdAt: '2025-01-01T10:00:00Z',
    appsSigned: 9,
    lastUsedAt: '2026-09-12T16:18:00Z',
  },
  {
    id: 'si_3',
    name: 'Free Programs Pro Android (v3)',
    platform: 'android',
    scheme: 'apk-v3',
    thumbprintSha256: 'aabbccddee112233445566778899001122334455667788990011223344556677',
    status: 'active',
    notBefore: '2024-12-01T00:00:00Z',
    notAfter: '2027-12-01T00:00:00Z',
    owner: 'mobile@fppstore.io',
    createdBy: 'admin@fppstore.io',
    createdAt: '2024-12-01T10:00:00Z',
    appsSigned: 5,
    lastUsedAt: '2026-09-11T09:30:00Z',
  },
  {
    id: 'si_4',
    name: 'FPP Chrome Extension Signer',
    platform: 'chrome',
    scheme: 'crx3',
    thumbprintSha256: '99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa',
    status: 'active',
    notBefore: '2025-03-01T00:00:00Z',
    notAfter: '2030-03-01T00:00:00Z',
    owner: 'extension-team@fppstore.io',
    createdBy: 'admin@fppstore.io',
    createdAt: '2025-03-01T10:00:00Z',
    appsSigned: 3,
    lastUsedAt: '2026-09-13T18:04:00Z',
  },
  {
    id: 'si_5',
    name: 'Legacy FPP Windows Cert (deprecated)',
    platform: 'windows',
    scheme: 'authenticode',
    thumbprintSha256: 'decafbad1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    status: 'revoked',
    revokedAt: '2026-05-15T00:00:00Z',
    revokedReason: 'Rotation — superseded by si_1 after 30-day overlap.',
    replacementId: 'si_1',
    notBefore: '2024-01-01T00:00:00Z',
    notAfter: '2025-06-01T00:00:00Z',
    owner: 'release-engineering@fppstore.io',
    createdBy: 'admin@fppstore.io',
    createdAt: '2024-01-01T10:00:00Z',
    appsSigned: 2,
    lastUsedAt: '2026-05-14T08:00:00Z',
  },
]

// Per-version signature result object (§42.4)
export type SignatureResult = {
  scheme: SigningScheme
  verified: boolean
  trustLevel: TrustLevel
  signer?: {
    commonName: string
    organization?: string
    country?: string
  }
  thumbprintSha256?: string
  serial?: string
  chain?: string[]
  timestamp?: {
    present: boolean
    authority?: string
    signedAt?: string
  }
  validity?: {
    notBefore: string
    notAfter: string
  }
  revocationCheckedAt?: string
  warnings: string[]
  identityId?: string // link back to SigningIdentity
}

// Helper: synthesize a believable signature for a stable channel version on a platform
export function synthesizeSignature(platform: PlatformSlug, channel: string, slug: string): SignatureResult {
  // Beta/nightly/rc may be self-signed or unsigned; stable is signed
  const isStable = channel === 'stable'
  const id = signingIdentities.find((i) => i.platform === platform && i.status === 'active')
  if (!id || !isStable) {
    return {
      scheme: platform === 'windows' ? 'authenticode'
        : platform === 'android' ? 'apk-v3'
        : platform === 'chrome' ? 'crx3'
        : 'gpg',
      verified: false,
      trustLevel: channel === 'stable' ? 'unsigned' : 'self',
      warnings: channel === 'stable'
        ? ['No signature detected — admin override allowed (audit logged).']
        : ['Beta/nightly channel — self-signed.'],
    }
  }
  const scheme: SigningScheme = id.scheme
  return {
    scheme,
    verified: true,
    trustLevel: 'verified',
    signer: {
      commonName: id.name.split(' (')[0],
      organization: 'Free Programs Pro LLC',
      country: 'US',
    },
    thumbprintSha256: id.thumbprintSha256,
    serial: '0a1b2c3d4e5f6',
    chain: ['leaf', 'intermediate', 'root'],
    timestamp: {
      present: true,
      authority: 'DigiCert TSA',
      signedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    validity: { notBefore: id.notBefore, notAfter: id.notAfter },
    revocationCheckedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    warnings: [],
    identityId: id.id,
  }
}

export function trustLevelBadge(level: TrustLevel): { label: string; color: string; icon: string } {
  switch (level) {
    case 'verified': return { label: 'Verified publisher', color: 'var(--success)', icon: 'shield-check' }
    case 'self': return { label: 'Signed (unverified)', color: 'var(--warning)', icon: 'shield' }
    case 'unsigned': return { label: 'Unsigned — verify checksum', color: 'var(--warning)', icon: 'alert-triangle' }
    case 'revoked': return { label: 'Signature revoked', color: 'var(--destructive)', icon: 'shield-off' }
    case 'tampered': return { label: 'Blocked — tampered', color: 'var(--destructive)', icon: 'ban' }
  }
}

// ----------------------------------------------------------------------------
// API KEYS
// ----------------------------------------------------------------------------

export type ApiKeyType = 'live' | 'test' | 'publish' | 'read'
export type ApiTier = 'free' | 'developer' | 'partner' | 'enterprise'
export type ApiScope =
  | 'catalog:read' | 'downloads:read' | 'downloads:stats' | 'apps:write'
  | 'versions:write' | 'media:write' | 'reviews:read' | 'reviews:write'
  | 'webhooks:manage' | 'keys:manage'

export const ALL_SCOPES: { scope: ApiScope; description: string }[] = [
  { scope: 'catalog:read', description: 'List and read apps, versions, categories, platforms' },
  { scope: 'downloads:read', description: 'Issue signed download URLs' },
  { scope: 'downloads:stats', description: 'Read aggregate download stats' },
  { scope: 'apps:write', description: 'Create/update apps owned by the key\'s owner' },
  { scope: 'versions:write', description: 'Push new versions (upload binaries)' },
  { scope: 'media:write', description: 'Upload icons, screenshots' },
  { scope: 'reviews:read', description: 'Read reviews' },
  { scope: 'reviews:write', description: 'Post/reply to reviews (partner accounts only)' },
  { scope: 'webhooks:manage', description: 'Register/manage webhook endpoints' },
  { scope: 'keys:manage', description: 'Create/rotate/revoke child keys (super-admin only)' },
]

export const TIER_LIMITS: Record<ApiTier, { rpm: number; burst: number; uploads: number; reads: string; urls: string; pushes: string; storage: string }> = {
  free: { rpm: 60, burst: 120, uploads: 1, reads: '100K/mo', urls: '10K/mo', pushes: '5/mo', storage: '500 MB' },
  developer: { rpm: 600, burst: 1200, uploads: 3, reads: '5M/mo', urls: '500K/mo', pushes: '100/mo', storage: '10 GB' },
  partner: { rpm: 6000, burst: 12000, uploads: 10, reads: '100M/mo', urls: '10M/mo', pushes: '1K/mo', storage: '200 GB' },
  enterprise: { rpm: 0, burst: 0, uploads: 0, reads: 'Custom', urls: 'Custom', pushes: 'Custom', storage: 'Custom' },
}

export type ApiKey = {
  id: string
  name: string
  type: ApiKeyType
  prefix: string
  last4: string
  plaintext?: string // only shown once at creation
  owner: string
  scopes: ApiScope[]
  tier: ApiTier
  ipAllowlist: string[]
  referrerAllowlist: string[]
  status: 'active' | 'grace' | 'expired' | 'revoked'
  graceUntil?: string
  rotatedFromId?: string
  expiresAt?: string
  lastUsedAt?: string
  requestsToday: number
  requestsThisMonth: number
  createdAt: string
  createdBy: string
  notes?: string
}

export const apiKeys: ApiKey[] = [
  {
    id: 'ak_1',
    name: 'CI/CD - GitHub Actions',
    type: 'publish',
    prefix: 'fpp_pub_',
    last4: 'q7a2',
    owner: 'release-bot (service)',
    scopes: ['apps:write', 'versions:write', 'media:write'],
    tier: 'developer',
    ipAllowlist: ['192.0.2.0/24'],
    referrerAllowlist: [],
    status: 'active',
    lastUsedAt: '2026-09-14T08:15:00Z',
    requestsToday: 1842,
    requestsThisMonth: 38492,
    createdAt: '2025-11-01T10:00:00Z',
    createdBy: 'admin@fppstore.io',
    notes: 'Used by release workflow on push to main.',
  },
  {
    id: 'ak_2',
    name: 'Partner dashboard - ACME Corp',
    type: 'live',
    prefix: 'fpp_live_',
    last4: 'b3c4',
    owner: 'integrations@acme.corp',
    scopes: ['catalog:read', 'downloads:read', 'downloads:stats'],
    tier: 'partner',
    ipAllowlist: ['203.0.113.42'],
    referrerAllowlist: [],
    status: 'active',
    lastUsedAt: '2026-09-14T07:42:00Z',
    requestsToday: 92,
    requestsThisMonth: 2810,
    createdAt: '2025-08-15T08:00:00Z',
    createdBy: 'admin@fppstore.io',
    notes: 'ACME integration — partner tier.',
  },
  {
    id: 'ak_3',
    name: 'Marketing site (read-only)',
    type: 'read',
    prefix: 'fpp_read_',
    last4: 'f9d0',
    owner: 'marketing-site (service)',
    scopes: ['catalog:read'],
    tier: 'free',
    ipAllowlist: [],
    referrerAllowlist: ['https://freeprogramspro.store/*', 'https://www.fppstore.io/*'],
    status: 'active',
    lastUsedAt: '2026-09-14T09:01:00Z',
    requestsToday: 6310,
    requestsThisMonth: 142900,
    createdAt: '2025-10-01T08:00:00Z',
    createdBy: 'admin@fppstore.io',
    notes: 'Public catalog browsing on marketing site.',
  },
  {
    id: 'ak_4',
    name: 'Staging test key',
    type: 'test',
    prefix: 'fpp_test_',
    last4: '0001',
    owner: 'qa@fppstore.io',
    scopes: ['catalog:read', 'apps:write', 'versions:write'],
    tier: 'developer',
    ipAllowlist: [],
    referrerAllowlist: [],
    status: 'grace',
    graceUntil: '2026-09-21T00:00:00Z',
    rotatedFromId: 'ak_5',
    lastUsedAt: '2026-09-12T22:51:00Z',
    requestsToday: 12,
    requestsThisMonth: 480,
    createdAt: '2026-03-12T08:00:00Z',
    createdBy: 'admin@fppstore.io',
    notes: 'Old key in 7-day grace after rotation.',
  },
  {
    id: 'ak_5',
    name: 'Staging test key (rotated)',
    type: 'test',
    prefix: 'fpp_test_',
    last4: '00a2',
    owner: 'qa@fppstore.io',
    scopes: ['catalog:read', 'apps:write', 'versions:write'],
    tier: 'developer',
    ipAllowlist: [],
    referrerAllowlist: [],
    status: 'active',
    lastUsedAt: '2026-09-14T06:18:00Z',
    requestsToday: 84,
    requestsThisMonth: 1200,
    createdAt: '2026-09-07T08:00:00Z',
    createdBy: 'admin@fppstore.io',
    notes: 'Replacement for ak_4.',
  },
  {
    id: 'ak_6',
    name: 'Compromised key (revoked)',
    type: 'live',
    prefix: 'fpp_live_',
    last4: '1111',
    owner: 'legacy-partner (deleted)',
    scopes: ['catalog:read', 'downloads:read'],
    tier: 'partner',
    ipAllowlist: [],
    referrerAllowlist: [],
    status: 'revoked',
    lastUsedAt: '2026-08-22T08:00:00Z',
    requestsToday: 0,
    requestsThisMonth: 0,
    createdAt: '2024-09-01T08:00:00Z',
    createdBy: 'admin@fppstore.io',
    notes: 'Revoked after suspected leak in a partner commit.',
  },
]

// Generate a fresh plaintext key for the create flow
export function generatePlaintextKey(type: ApiKeyType): string {
  const prefix = type === 'live' ? 'fpp_live_'
    : type === 'test' ? 'fpp_test_'
    : type === 'publish' ? 'fpp_pub_'
    : 'fpp_read_'
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let body = ''
  for (let i = 0; i < 40; i++) body += chars[Math.floor(Math.random() * chars.length)]
  return `${prefix}${body}`
}

// ----------------------------------------------------------------------------
// WEBHOOKS
// ----------------------------------------------------------------------------

export type WebhookEvent =
  | 'app.created' | 'app.updated' | 'app.published' | 'app.unpublished'
  | 'version.created' | 'version.published' | 'version.scan_completed'
  | 'version.signature_verified' | 'download.milestone' | 'review.created'
  | 'report.created' | 'api_key.rotated' | 'api_key.revoked'
  | 'signing.identity_revoked'

export const ALL_WEBHOOK_EVENTS: WebhookEvent[] = [
  'app.created', 'app.updated', 'app.published', 'app.unpublished',
  'version.created', 'version.published', 'version.scan_completed',
  'version.signature_verified', 'download.milestone', 'review.created',
  'report.created', 'api_key.rotated', 'api_key.revoked',
  'signing.identity_revoked',
]

export type Webhook = {
  id: string
  name: string
  url: string
  owner: string
  events: WebhookEvent[]
  active: boolean
  secretLast4: string
  failureCount: number
  lastDeliveryAt?: string
  lastStatus?: number
  createdAt: string
}

export const webhooks: Webhook[] = [
  {
    id: 'wh_1',
    name: 'Release bot — version.published',
    url: 'https://hooks.bot.fppstore.io/fpp-store',
    owner: 'release-bot (service)',
    events: ['version.published', 'version.scan_completed', 'version.signature_verified'],
    active: true,
    secretLast4: 'a7b2',
    failureCount: 0,
    lastDeliveryAt: '2026-09-14T08:15:00Z',
    lastStatus: 200,
    createdAt: '2025-11-01T10:00:00Z',
  },
  {
    id: 'wh_2',
    name: 'Slack #releases',
    url: 'https://hooks.slack.com/services/T0/B0/XXX',
    owner: 'comms@fppstore.io',
    events: ['app.published', 'version.published', 'download.milestone'],
    active: true,
    secretLast4: '9d4c',
    failureCount: 2,
    lastDeliveryAt: '2026-09-13T18:04:00Z',
    lastStatus: 200,
    createdAt: '2025-09-15T08:00:00Z',
  },
  {
    id: 'wh_3',
    name: 'Partner - ACME (broken)',
    url: 'https://api.acme.corp/fpp-webhook',
    owner: 'integrations@acme.corp',
    events: ['app.published', 'version.published'],
    active: false,
    secretLast4: '0000',
    failureCount: 5,
    lastDeliveryAt: '2026-09-10T22:18:00Z',
    lastStatus: 500,
    createdAt: '2025-08-15T08:00:00Z',
  },
]

export type WebhookDelivery = {
  id: string
  webhookId: string
  eventType: WebhookEvent
  status: number
  attempt: number
  durationMs: number
  deliveredAt: string
  nextRetryAt?: string
  deadLetter?: boolean
  payloadPreview: string
}

export const webhookDeliveries: WebhookDelivery[] = [
  { id: 'wd_1', webhookId: 'wh_1', eventType: 'version.published', status: 200, attempt: 1, durationMs: 142, deliveredAt: '2026-09-14T08:15:00Z', payloadPreview: 'version 1.55.1 of pixel-blocker published' },
  { id: 'wd_2', webhookId: 'wh_1', eventType: 'version.scan_completed', status: 200, attempt: 1, durationMs: 88, deliveredAt: '2026-09-14T08:14:30Z', payloadPreview: 'scan clean — 70 engines' },
  { id: 'wd_3', webhookId: 'wh_1', eventType: 'version.signature_verified', status: 200, attempt: 1, durationMs: 64, deliveredAt: '2026-09-14T08:14:10Z', payloadPreview: 'authenticode verified — Free Programs Pro LLC' },
  { id: 'wd_4', webhookId: 'wh_2', eventType: 'app.published', status: 200, attempt: 1, durationMs: 510, deliveredAt: '2026-09-13T18:04:00Z', payloadPreview: 'meridian-pdf published' },
  { id: 'wd_5', webhookId: 'wh_2', eventType: 'download.milestone', status: 200, attempt: 1, durationMs: 422, deliveredAt: '2026-09-13T10:22:00Z', payloadPreview: 'aegis-vault reached 500K downloads' },
  { id: 'wd_6', webhookId: 'wh_3', eventType: 'version.published', status: 500, attempt: 1, durationMs: 5000, deliveredAt: '2026-09-10T22:18:00Z', nextRetryAt: '2026-09-10T22:18:05Z', payloadPreview: 'atlas-file-cabinet 3.5.1 published' },
  { id: 'wd_7', webhookId: 'wh_3', eventType: 'version.published', status: 500, attempt: 2, durationMs: 5000, deliveredAt: '2026-09-10T22:18:05Z', nextRetryAt: '2026-09-10T22:18:35Z', payloadPreview: 'atlas-file-cabinet 3.5.1 published' },
  { id: 'wd_8', webhookId: 'wh_3', eventType: 'version.published', status: 500, attempt: 5, durationMs: 5000, deliveredAt: '2026-09-10T22:23:35Z', deadLetter: true, payloadPreview: 'atlas-file-cabinet 3.5.1 published' },
]

// ----------------------------------------------------------------------------
// PUBLIC API USAGE (for /account/api/usage style dashboard)
// ----------------------------------------------------------------------------

export type ApiUsageBucket = { hour: string; requests: number; statusClass: { '2xx': number; '4xx': number; '5xx': number } }

export function apiUsageTimeseries(hours = 24): ApiUsageBucket[] {
  const out: ApiUsageBucket[] = []
  for (let i = hours - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 60 * 60 * 1000)
    const hour = d.getHours()
    const businessHours = hour >= 9 && hour <= 18 ? 1.4 : 0.7
    const reqs = Math.round((300 + Math.sin(i / 3) * 80) * businessHours + Math.random() * 50)
    out.push({
      hour: d.toISOString().slice(0, 13).replace('T', ' ') + 'Z',
      requests: reqs,
      statusClass: {
        '2xx': Math.round(reqs * 0.97),
        '4xx': Math.round(reqs * 0.025),
        '5xx': Math.round(reqs * 0.005),
      },
    })
  }
  return out
}

// Top API endpoints
export const apiEndpointUsage = [
  { endpoint: 'GET /v2/apps', scope: 'catalog:read', calls: 184200, p95: 32 },
  { endpoint: 'GET /v2/apps/{slug}', scope: 'catalog:read', calls: 92800, p95: 28 },
  { endpoint: 'POST /v2/apps/{slug}/versions/{v}/download', scope: 'downloads:read', calls: 48300, p95: 18 },
  { endpoint: 'GET /v2/search?q=', scope: 'catalog:read', calls: 12900, p95: 88 },
  { endpoint: 'POST /v2/apps/{slug}/versions/{v}/commit', scope: 'versions:write', calls: 42, p95: 1240 },
  { endpoint: 'POST /v2/webhooks (delivery out)', scope: 'webhooks:manage', calls: 2810, p95: 410 },
  { endpoint: 'GET /v2/me/usage', scope: '(any)', calls: 184, p95: 12 },
]

// ----------------------------------------------------------------------------
// PUBLIC VERIFY TOOL — known checksums
// ----------------------------------------------------------------------------

// We expose every published stable version's checksum so users can verify.
// (Imported lazily from mock.ts so we avoid circular imports — done in verify tool component.)
