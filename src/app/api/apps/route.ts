import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/apps — list published apps with relations
export async function GET(req: Request) {
  const url = new URL(req.url)
  const platform = url.searchParams.get('platform')
  const category = url.searchParams.get('category')
  const limit = Math.min(50, Number(url.searchParams.get('limit') || 20))

  const apps = await db.app.findMany({
    where: {
      status: 'published',
      deletedAt: null,
      ...(platform ? { versions: { some: { platform: { slug: platform } } } } : {}),
      ...(category ? { category: { slug: category } } : {}),
    },
    include: {
      category: true,
      versions: { include: { platform: true }, take: 1, orderBy: { publishedAt: 'desc' } },
      _count: { select: { reviews: true, downloads: true } },
    },
    orderBy: { downloads: { _count: 'desc' } },
    take: limit,
  })

  return NextResponse.json({
    data: apps.map((a) => ({
      slug: a.slug,
      name: a.name,
      tagline: a.tagline,
      developer: a.developerName,
      license: a.license,
      status: a.status,
      featured: a.featured,
      publishedAt: a.publishedAt,
      ratingCount: a._count.reviews,
      downloads: a._count.downloads,
      iconGradient: JSON.parse(a.iconGradient),
      iconText: a.iconText,
      platforms: a.versions.map((v) => v.platform.slug),
      latestVersion: a.versions[0]?.version,
    })),
    meta: { count: apps.length, source: 'prisma' },
  })
}
