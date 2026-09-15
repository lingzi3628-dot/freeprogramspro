import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/apps/[slug] — full app detail with versions, screenshots, reviews
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const app = await db.app.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      versions: { include: { platform: true }, orderBy: { publishedAt: 'desc' } },
      screenshots: { orderBy: { sortOrder: 'asc' } },
      reviews: { include: { user: true }, where: { status: 'visible' }, take: 5, orderBy: { helpfulCount: 'desc' } },
      _count: { select: { reviews: true, downloads: true } },
    },
  })

  if (!app || app.deletedAt) {
    return NextResponse.json({ error: { code: 'not_found', message: 'App not found' } }, { status: 404 })
  }

  return NextResponse.json({
    data: {
      ...app,
      iconGradient: JSON.parse(app.iconGradient),
      permissions: app.versions[0]?.permissions ? JSON.parse(app.versions[0].permissions) : null,
      tags: app.tags.map((t) => t.tag),
      platforms: [...new Set(app.versions.map((v) => v.platform.slug))],
      ratingCount: app._count.reviews,
      downloadCount: app._count.downloads,
    },
    meta: { source: 'prisma' },
  })
}
