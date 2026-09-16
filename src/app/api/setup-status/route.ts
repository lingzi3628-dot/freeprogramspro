import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/setup-status — public endpoint that returns:
//   - isFirstUser: whether no users exist yet (first signup becomes admin)
//   - dbReachable: whether the DB connection works
//   - envCheck: which env vars are set (NEXTAUTH_SECRET, DATABASE_URL, NEXTAUTH_URL, VERCEL_URL)
// This helps the user diagnose Vercel deploy issues without exposing secrets.
export async function GET() {
  // Env var checks (values are NOT exposed — only booleans)
  const envCheck = {
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    VERCEL_URL: !!process.env.VERCEL_URL,
    NODE_ENV: process.env.NODE_ENV || 'unknown',
  }

  // DB reachability check
  let userCount = 0
  let dbReachable = true
  let dbError: string | undefined
  try {
    userCount = await db.user.count()
  } catch (e: any) {
    dbReachable = false
    dbError = e?.message?.slice(0, 200) || 'Unknown DB error'
  }

  return NextResponse.json({
    data: {
      isFirstUser: dbReachable && userCount === 0,
      userCount,
      dbReachable,
      dbError,
      envCheck,
    },
    meta: { source: 'setup-status' },
  })
}
