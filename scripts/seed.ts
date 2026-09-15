// Seed script — populates the SQLite DB with the v1+v2 sample data.
// Run with: bun run scripts/seed.ts
//
// Reads from src/data/mock.ts and src/data/v2-mock.ts and writes to Prisma.
// Idempotent: deletes all rows before inserting.

import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { apps as mockApps, platforms as mockPlatforms, categories as mockCategories, tags as mockTags, reviews as _reviews, type App as MockApp } from '../src/data/mock'
import { signingIdentities as mockIdentities, apiKeys as mockApiKeys, webhooks as mockWebhooks, webhookDeliveries as mockDeliveries } from '../src/data/v2-mock'

const db = new PrismaClient()

// Lightweight hash to mimic a SHA-256 key hash (NOT for production — demo only)
function hashStr(s: string): string {
  return crypto.createHash('sha256').update(s).digest('hex')
}

function sha256Mock(seed: string): string {
  let h = ''
  const chars = '0123456789abcdef'
  let s = seed
  while (s.length < 64) s += s + seed
  for (let i = 0; i < 64; i++) h += chars[(s.charCodeAt(i % s.length) + i * 7) % 16]
  return h
}

async function main() {
  console.log('Clearing existing data...')
  await db.webhookDelivery.deleteMany()
  await db.webhook.deleteMany()
  await db.apiKey.deleteMany()
  await db.signingIdentity.deleteMany()
  await db.notification.deleteMany()
  await db.subscription.deleteMany()
  await db.setting.deleteMany()
  await db.auditLog.deleteMany()
  await db.report.deleteMany()
  await db.review.deleteMany()
  await db.download.deleteMany()
  await db.file.deleteMany()
  await db.appVersion.deleteMany()
  await db.appTag.deleteMany()
  await db.screenshot.deleteMany()
  await db.collectionApp.deleteMany()
  await db.collection.deleteMany()
  await db.app.deleteMany()
  await db.tag.deleteMany()
  await db.category.deleteMany()
  await db.platform.deleteMany()
  await db.user.deleteMany()
  await db.role.deleteMany()

  console.log('Creating roles...')
  const roles = await Promise.all([
    db.role.create({ data: { name: 'guest', permissions: JSON.stringify(['browse', 'search', 'download']) } }),
    db.role.create({ data: { name: 'user', permissions: JSON.stringify(['browse', 'search', 'download', 'reviews', 'wishlist', 'report']) } }),
    db.role.create({ data: { name: 'uploader', permissions: JSON.stringify(['user perms', 'submit apps']) } }),
    db.role.create({ data: { name: 'moderator', permissions: JSON.stringify(['user perms', 'review/report queues']) } }),
    db.role.create({ data: { name: 'admin', permissions: JSON.stringify(['user perms', 'full app CRUD', 'users', 'categories']) } }),
    db.role.create({ data: { name: 'super_admin', permissions: JSON.stringify(['admin perms', 'roles', 'settings', 'audit logs', 'impersonation']) } }),
  ])
  const adminRole = roles.find((r) => r.name === 'super_admin')!
  const userRole = roles.find((r) => r.name === 'user')!
  const modRole = roles.find((r) => r.name === 'moderator')!

  console.log('Creating users...')
  const users = await Promise.all([
    db.user.create({ data: { email: 'admin@fppstore.io', name: 'Site Admin', roleId: adminRole.id, emailVerifiedAt: new Date() } }),
    db.user.create({ data: { email: 'sam.patel@example.com', name: 'Sam Patel', roleId: userRole.id, emailVerifiedAt: new Date() } }),
    db.user.create({ data: { email: 'priya.k@example.com', name: 'Priya Krish', roleId: userRole.id, emailVerifiedAt: new Date() } }),
    db.user.create({ data: { email: 'marco.t@example.com', name: 'Marco Toledo', roleId: userRole.id, emailVerifiedAt: new Date() } }),
    db.user.create({ data: { email: 'mei.z@example.com', name: 'Mei Zhou', roleId: modRole.id, emailVerifiedAt: new Date() } }),
  ])

  console.log('Creating platforms...')
  const platformRecords: Record<string, string> = {}
  for (const p of mockPlatforms) {
    const row = await db.platform.create({
      data: {
        slug: p.slug,
        name: p.name,
        color: p.color,
        icon: p.icon,
        packages: JSON.stringify(p.packages),
        sortOrder: p.sortOrder,
      },
    })
    platformRecords[p.slug] = row.id
  }

  console.log('Creating categories...')
  const categoryRecords: Record<string, string> = {}
  for (const c of mockCategories) {
    const row = await db.category.create({
      data: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        iconUrl: c.icon,
        sortOrder: c.sortOrder,
      },
    })
    categoryRecords[c.slug] = row.id
  }

  console.log('Creating tags...')
  const tagRecords: Record<string, string> = {}
  for (const t of mockTags) {
    const row = await db.tag.create({
      data: { slug: t.slug, name: t.name },
    })
    tagRecords[t.slug] = row.id
  }

  console.log(`Creating ${mockApps.length} apps with versions, screenshots, reviews...`)
  for (const a of mockApps) {
    const app = await db.app.create({
      data: {
        slug: a.slug,
        name: a.name,
        tagline: a.tagline,
        description: a.description,
        iconGradient: JSON.stringify(a.iconGradient),
        iconText: a.iconText,
        developerName: a.developer,
        developerSlug: a.developerSlug,
        categoryId: categoryRecords[a.category],
        license: a.license,
        sourceUrl: a.sourceUrl,
        homepageUrl: a.homepageUrl,
        status: a.status,
        featured: a.featured,
        publishedAt: new Date(a.publishedAt),
      },
    })

    // Tags
    for (const t of a.tags) {
      if (tagRecords[t]) {
        await db.appTag.create({
          data: { appId: app.id, tagId: tagRecords[t] },
        }).catch(() => {}) // ignore duplicate on re-run
      }
    }

    // Screenshots (gradient stored as URL, label in url field as data: URI)
    for (let i = 0; i < a.screenshots.length; i++) {
      const s = a.screenshots[i]
      await db.screenshot.create({
        data: {
          appId: app.id,
          url: `data:gradient:${s.gradient[0]},${s.gradient[1]}`,
          width: 1280,
          height: 720,
          sortOrder: i,
        },
      })
    }

    // Versions
    for (const v of a.versions) {
      await db.appVersion.create({
        data: {
          appId: app.id,
          platformId: platformRecords[v.platform],
          version: v.version,
          channel: v.channel,
          releaseNotes: v.releaseNotes,
          fileUrl: v.fileUrl,
          fileSize: v.fileSize,
          checksumSha256: v.checksumSha256,
          minOs: v.minOs,
          architecture: v.architecture,
          permissions: v.permissions ? JSON.stringify(v.permissions) : null,
          scanStatus: v.scanStatus,
          scanProvider: v.scanProvider,
          scanReportUrl: null,
          publishedAt: new Date(v.publishedAt),
          signatureStatus: v.channel === 'stable' ? 'verified' : 'unsigned',
        },
      })
    }

    // Reviews (one per user, rotate users)
    for (let i = 0; i < a.reviews.length; i++) {
      const r = a.reviews[i]
      const user = users[(i + 1) % users.length] // skip admin
      await db.review.create({
        data: {
          appId: app.id,
          userId: user.id,
          rating: r.rating,
          body: r.body,
          helpfulCount: r.helpfulCount,
          status: r.status,
          createdAt: new Date(r.createdAt),
        },
      }).catch(() => {})
    }

    // A few downloads for stats
    for (let i = 0; i < 5; i++) {
      await db.download.create({
        data: {
          appId: app.id,
          userId: users[(i + 1) % users.length].id,
          ipHash: hashStr(`ip-${app.id}-${i}`),
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          country: ['KE', 'US', 'IN', 'DE', 'BR'][i % 5],
        },
      })
    }
  }

  console.log('Creating audit logs...')
  const auditData = [
    { actor: users[0], action: 'publish', entityType: 'app', entityId: 'pixel-blocker', ip: '203.0.113.42', ts: '2026-09-13T18:04:00Z' },
    { actor: users[0], action: 'upload', entityType: 'file', entityId: 'aegis-vault-3.1-android.apk', ip: '203.0.113.42', ts: '2026-09-13T11:22:00Z' },
    { actor: users[4], action: 'hide_review', entityType: 'review', entityId: 'r_codex_8842', ip: '203.0.113.51', ts: '2026-09-12T22:51:00Z' },
    { actor: users[0], action: 'update', entityType: 'app', entityId: 'codex-terminal', ip: '203.0.113.42', ts: '2026-09-12T16:18:00Z' },
    { actor: users[0], action: 'create', entityType: 'app', entityId: 'meridian-pdf', ip: '203.0.113.42', ts: '2026-09-11T09:30:00Z' },
  ]
  for (const a of auditData) {
    await db.auditLog.create({
      data: {
        actorId: a.actor.id,
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        ip: a.ip,
        createdAt: new Date(a.ts),
      },
    })
  }

  console.log('Creating reports...')
  const reportData = [
    { type: 'app', targetId: 'aegis-vault', reporter: users[2], reason: 'Wrong metadata', description: 'SHA-256 listed does not match GitHub releases page.', status: 'open' },
    { type: 'review', targetId: 'codex-terminal-r8842', reporter: users[3], reason: 'Spam', description: 'Review contains promotional link.', status: 'open' },
    { type: 'app', targetId: 'orbot-relay', reporter: users[2], reason: 'Broken download', description: '.deb link returns 404.', status: 'open' },
    { type: 'user', targetId: 'spammer@example.com', reporter: users[1], reason: 'Harassment', description: 'Multiple hostile reviews across 3 apps.', status: 'open' },
  ]
  for (const r of reportData) {
    await db.report.create({
      data: {
        type: r.type,
        targetId: r.targetId,
        reporterId: r.reporter.id,
        reason: r.reason,
        description: r.description,
        status: r.status,
      },
    })
  }

  console.log('Creating settings...')
  await db.setting.create({
    data: {
      key: 'site',
      value: JSON.stringify({
        name: 'Free Programs Pro Store',
        tagline: 'Curated, verified, free software',
        contactEmail: 'hello@fppstore.io',
      }),
    },
  })

  console.log('Creating signing identities (v2)...')
  for (const id of mockIdentities) {
    await db.signingIdentity.create({
      data: {
        name: id.name,
        platform: id.platform,
        scheme: id.scheme,
        publicKeyPem: `-----BEGIN PUBLIC KEY-----\n[public key for ${id.name}]\n-----END PUBLIC KEY-----`,
        thumbprintSha256: id.thumbprintSha256,
        chain: JSON.stringify(['leaf', 'intermediate', 'root']),
        status: id.status,
        revokedAt: id.revokedAt ? new Date(id.revokedAt) : null,
        revokedReason: id.revokedReason,
        replacementId: id.replacementId,
        notBefore: new Date(id.notBefore),
        notAfter: new Date(id.notAfter),
        owner: id.owner,
        createdBy: id.createdBy,
        createdAt: new Date(id.createdAt),
      },
    })
  }

  console.log('Creating API keys (v2)...')
  for (const k of mockApiKeys) {
    await db.apiKey.create({
      data: {
        name: k.name,
        type: k.type,
        keyPrefix: k.prefix,
        keyLast4: k.last4,
        keyHash: hashStr(k.prefix + k.last4 + k.name),
        scopes: JSON.stringify(k.scopes),
        ipAllowlist: k.ipAllowlist.length ? JSON.stringify(k.ipAllowlist) : null,
        referrerAllowlist: k.referrerAllowlist.length ? JSON.stringify(k.referrerAllowlist) : null,
        tier: k.tier,
        status: k.status,
        graceUntil: k.graceUntil ? new Date(k.graceUntil) : null,
        notes: k.notes,
        lastUsedAt: k.lastUsedAt ? new Date(k.lastUsedAt) : null,
        createdAt: new Date(k.createdAt),
      },
    })
  }

  console.log('Creating webhooks (v2)...')
  for (const w of mockWebhooks) {
    const webhook = await db.webhook.create({
      data: {
        name: w.name,
        url: w.url,
        secretHash: hashStr(w.secretLast4 + w.url),
        secretLast4: w.secretLast4,
        events: JSON.stringify(w.events),
        active: w.active,
        failureCount: w.failureCount,
        lastDeliveryAt: w.lastDeliveryAt ? new Date(w.lastDeliveryAt) : null,
        lastStatus: w.lastStatus,
        createdAt: new Date(w.createdAt),
      },
    })

    // Deliveries for this webhook
    for (const d of mockDeliveries.filter((d) => d.webhookId === w.id)) {
      await db.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          eventType: d.eventType,
          payload: JSON.stringify({ preview: d.payloadPreview }),
          statusCode: d.status,
          attempt: d.attempt,
          durationMs: d.durationMs,
          deliveredAt: new Date(d.deliveredAt),
          nextRetryAt: d.nextRetryAt ? new Date(d.nextRetryAt) : null,
          deadLetter: d.deadLetter || false,
        },
      })
    }
  }

  // Stats
  const counts = {
    roles: await db.role.count(),
    users: await db.user.count(),
    platforms: await db.platform.count(),
    categories: await db.category.count(),
    tags: await db.tag.count(),
    apps: await db.app.count(),
    versions: await db.appVersion.count(),
    screenshots: await db.screenshot.count(),
    reviews: await db.review.count(),
    downloads: await db.download.count(),
    reports: await db.report.count(),
    auditLogs: await db.auditLog.count(),
    signingIdentities: await db.signingIdentity.count(),
    apiKeys: await db.apiKey.count(),
    webhooks: await db.webhook.count(),
    webhookDeliveries: await db.webhookDelivery.count(),
  }
  console.log('\n✅ Seed complete. Counts:')
  console.table(counts)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
