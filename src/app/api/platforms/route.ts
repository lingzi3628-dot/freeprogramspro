import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/platforms
export async function GET() {
  const platforms = await db.platform.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({
    data: platforms.map((p) => ({ ...p, packages: JSON.parse(p.packages) })),
    meta: { source: 'prisma' },
  })
}
