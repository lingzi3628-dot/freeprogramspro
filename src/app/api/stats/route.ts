import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/stats — KPI counts for the admin dashboard
export async function GET() {
  const [
    apps,
    versions,
    reviews,
    downloads,
    reports,
    users,
    auditLogs,
    signingIdentities,
    apiKeys,
    webhooks,
    webhookDeliveries,
    pendingReports,
  ] = await Promise.all([
    db.app.count(),
    db.appVersion.count(),
    db.review.count(),
    db.download.count(),
    db.report.count(),
    db.user.count(),
    db.auditLog.count(),
    db.signingIdentity.count(),
    db.apiKey.count(),
    db.webhook.count(),
    db.webhookDelivery.count(),
    db.report.count({ where: { status: 'open' } }),
  ])

  return NextResponse.json({
    data: {
      apps,
      versions,
      reviews,
      downloads,
      reports,
      users,
      auditLogs,
      signingIdentities,
      apiKeys,
      webhooks,
      webhookDeliveries,
      pendingReports,
    },
    meta: { source: 'prisma' },
  })
}
