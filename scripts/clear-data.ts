// Clears all demo data from the DB and seeds reference data (platforms,
// categories, tags, roles) + one real admin user.
//
// Run with: bun run scripts/clear-data.ts
//
// After running, the storefront will be empty until you publish real apps via
// the admin panel at /adminkenyaorgfpps (login: admin@fppstore.io / admin1234).

import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { platforms as mockPlatforms, categories as mockCategories, tags as mockTags } from '../src/data/mock'

const db = new PrismaClient()

async function main() {
  console.log('Clearing all app/version/review/download/demo data...')
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
  // Also clear reference data so re-runs are fully idempotent
  await db.tag.deleteMany()
  await db.category.deleteMany()
  await db.platform.deleteMany()
  // Reset users (clear demo users), then create one admin
  await db.user.deleteMany()
  await db.role.deleteMany()

  console.log('Creating roles...')
  const superAdminRole = await db.role.create({
    data: {
      name: 'super_admin',
      permissions: JSON.stringify(['*']),
    },
  })
  const adminRole = await db.role.create({
    data: {
      name: 'admin',
      permissions: JSON.stringify(['apps:*', 'users:read', 'categories:*', 'reviews:*', 'reports:*']),
    },
  })
  const moderatorRole = await db.role.create({
    data: {
      name: 'moderator',
      permissions: JSON.stringify(['reviews:*', 'reports:*']),
    },
  })
  const uploaderRole = await db.role.create({
    data: {
      name: 'uploader',
      permissions: JSON.stringify(['apps:write', 'versions:write', 'media:write']),
    },
  })
  const userRole = await db.role.create({
    data: {
      name: 'user',
      permissions: JSON.stringify(['browse', 'download', 'reviews:write', 'wishlist', 'report']),
    },
  })
  await db.role.create({
    data: {
      name: 'guest',
      permissions: JSON.stringify(['browse', 'download']),
    },
  })

  console.log('Skipping pre-seeded admin user — first signup will become the bootstrap admin.')
  console.log('  → Visit /signup and register; the first account gets super_admin role.')
  // No admin user is pre-seeded. The first person to sign up at /signup
  // automatically gets the super_admin role (see src/app/actions/auth.ts → signupAction).
  // This is more secure than shipping a known admin@fppstore.io/admin1234
  // credential on a public Vercel deploy.
  const adminUserId = 'system-bootstrap' // placeholder; audit log will use null actorId

  console.log('Creating site settings...')
  await db.setting.create({
    data: {
      key: 'site',
      value: JSON.stringify({
        name: 'Free Programs Pro Store',
        tagline: 'Curated, verified, free software',
        contactEmail: 'admin@fppstore.io',
      }),
    },
  })

  console.log('Creating reference data: platforms, categories, tags...')
  for (const p of mockPlatforms) {
    await db.platform.create({
      data: {
        slug: p.slug,
        name: p.name,
        color: p.color,
        icon: p.icon,
        packages: JSON.stringify(p.packages),
        sortOrder: p.sortOrder,
      },
    })
  }
  for (const c of mockCategories) {
    await db.category.create({
      data: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        iconUrl: c.icon,
        sortOrder: c.sortOrder,
      },
    })
  }
  for (const t of mockTags) {
    await db.tag.create({
      data: { slug: t.slug, name: t.name },
    })
  }

  console.log('Creating one audit log entry to mark the reset...')
  await db.auditLog.create({
    data: {
      actorId: null, // no admin user exists yet — first signup will claim it
      action: 'db_reset',
      entityType: 'system',
      entityId: 'database',
      after: JSON.stringify({ clearedAt: new Date().toISOString() }),
      ip: '0.0.0.0',
      userAgent: 'scripts/clear-data.ts',
    },
  })

  // Final counts
  const counts = {
    roles: await db.role.count(),
    users: await db.user.count(),
    platforms: await db.platform.count(),
    categories: await db.category.count(),
    tags: await db.tag.count(),
    apps: await db.app.count(),
    versions: await db.appVersion.count(),
    reviews: await db.review.count(),
    downloads: await db.download.count(),
    reports: await db.report.count(),
    auditLogs: await db.auditLog.count(),
    signingIdentities: await db.signingIdentity.count(),
    apiKeys: await db.apiKey.count(),
    webhooks: await db.webhook.count(),
  }
  console.log('\n✅ Database cleared. Reference data seeded. No admin user — first signup becomes the admin.')
  console.table(counts)
  console.log('\n📋 Next steps:')
  console.log('   1. Visit /signup and register your first account')
  console.log('      → It will automatically get the super_admin role')
  console.log('   2. After signup you\'ll be auto-logged-in and redirected to /')
  console.log('   3. Visit /adminkenyaorgfpps for the admin panel')
  console.log('\nℹ️  No pre-seeded credentials. The first person to sign up bootstraps the admin.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
