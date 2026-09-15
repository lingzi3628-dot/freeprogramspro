import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/admin/apps — list ALL apps (incl. draft/archived) for admin view
// Requires admin session (session checked at middleware level for the admin path,
// but this API is reachable from any client, so we re-check here too).
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !['admin', 'super_admin'].includes((session.user as any).role)) {
    return NextResponse.json({ error: { code: 'forbidden', message: 'Admin role required' } }, { status: 403 })
  }

  const url = new URL(req.url)
  const q = url.searchParams.get('q')?.toLowerCase()
  const platform = url.searchParams.get('platform')
  const status = url.searchParams.get('status')

  const apps = await db.app.findMany({
    where: {
      deletedAt: null,
      ...(q ? { OR: [{ name: { contains: q } }, { developerName: { contains: q } }] } : {}),
      ...(status && status !== 'all' ? { status } : {}),
      ...(platform && platform !== 'all' ? { versions: { some: { platform: { slug: platform } } } } : {}),
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
      versions: { include: { platform: true }, orderBy: { publishedAt: 'desc' }, take: 1 },
      _count: { select: { reviews: true, downloads: true, versions: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({
    data: apps.map((a) => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
      tagline: a.tagline,
      developer: a.developerName,
      developerSlug: a.developerSlug,
      category: a.category?.slug || 'uncategorized',
      categoryName: a.category?.name || 'Uncategorized',
      tags: a.tags.map((t) => t.tag.slug),
      license: a.license,
      sourceUrl: a.sourceUrl,
      homepageUrl: a.homepageUrl,
      status: a.status,
      featured: a.featured,
      publishedAt: a.publishedAt,
      updatedAt: a.updatedAt,
      createdAt: a.createdAt,
      ratingAvg: 0,
      ratingCount: a._count.reviews,
      downloads: a._count.downloads,
      versionCount: a._count.versions,
      sizeBytes: a.versions[0]?.fileSize || 0,
      platforms: [...new Set(a.versions.map((v) => v.platform.slug))],
      iconGradient: JSON.parse(a.iconGradient) as [string, string],
      iconText: a.iconText,
      versions: a.versions.map((v) => ({
        id: v.id,
        version: v.version,
        channel: v.channel,
        platform: v.platform.slug,
        scanStatus: v.scanStatus,
        signatureStatus: v.signatureStatus,
      })),
    })),
    meta: { count: apps.length, source: 'prisma' },
  })
}
