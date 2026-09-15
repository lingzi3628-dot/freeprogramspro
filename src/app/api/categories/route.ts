import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/categories
export async function GET() {
  const cats = await db.category.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({
    data: cats,
    meta: { source: 'prisma' },
  })
}
