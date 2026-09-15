import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/admin/stats — KPI counts for admin dashboard
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !['admin', 'super_admin'].includes((session.user as any).role)) {
    return NextResponse.json({ error: { code: 'forbidden' } }, { status: 403 })
  }

  const [
    apps,
    publishedApps,
    draftApps,
    versions,
    reviews,
    downloads,
    reports,
    pendingReports,
    users,
    auditLogs,
    signingIdentities,
    apiKeys,
    webhooks,
    webhookDeliveries,
    downloads7d,
    downloads30d,
  ] = await Promise.all([
    db.app.count(),
    db.app.count({ where: { status: 'published' } }),
    db.app.count({ where: { status: 'draft' } }),
    db.appVersion.count(),
    db.review.count(),
    db.download.count(),
    db.report.count(),
    db.report.count({ where: { status: 'open' } }),
    db.user.count(),
    db.auditLog.count(),
    db.signingIdentity.count(),
    db.apiKey.count(),
    db.webhook.count(),
    db.webhookDelivery.count(),
    db.download.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    db.download.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
  ])

  // Top apps by downloads
  const topApps = await db.app.findMany({
    take: 6,
    orderBy: { downloads: { _count: 'desc' } },
    include: { _count: { select: { downloads: true } } },
  })

  // Per-platform split
  const platformsWithCounts = await db.platform.findMany({
    include: { _count: { select: { versions: true } } },
    orderBy: { sortOrder: 'asc' },
  })

  // Downloads by day for the last 30 days (SQLite — date math)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentDownloads = await db.download.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  })
  const byDay = new Map<string, number>()
  for (const d of recentDownloads) {
    const key = d.createdAt.toISOString().slice(0, 10)
    byDay.set(key, (byDay.get(key) || 0) + 1)
  }
  // Fill in missing days
  const series: { date: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    series.push({ date: key, count: byDay.get(key) || 0 })
  }

  // Recent audit logs
  const recentAudit = await db.auditLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { actor: true },
  })

  return NextResponse.json({
    data: {
      apps,
      publishedApps,
      draftApps,
      versions,
      reviews,
      downloads,
      reports,
      pendingReports,
      users,
      auditLogs,
      signingIdentities,
      apiKeys,
      webhooks,
      webhookDeliveries,
      downloads7d,
      downloads30d,
      topApps: topApps.map((a) => ({ name: a.name.split(' ')[0], downloads: a._count.downloads })),
      platformSplit: platformsWithCounts.map((p) => ({ name: p.name, value: p._count.versions, color: p.color })),
      downloadsTimeseries: series,
      recentAudit: recentAudit.map((l) => ({
        id: l.id,
        actor: l.actor?.email || l.actorId || 'system',
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        ip: l.ip,
        timestamp: l.createdAt,
      })),
    },
    meta: { source: 'prisma' },
  })
}
