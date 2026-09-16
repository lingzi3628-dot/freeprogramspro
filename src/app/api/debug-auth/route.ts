import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/debug-auth — comprehensive auth + DB diagnostics.
// Visit this URL in your browser to see exactly what's wrong with your
// Vercel deploy. No secrets are exposed — only booleans and counts.
export async function GET() {
  // 1. Env var checks
  const envCheck = {
    NEXTAUTH_SECRET: {
      set: !!process.env.NEXTAUTH_SECRET,
      length: process.env.NEXTAUTH_SECRET?.length || 0,
    },
    NEXTAUTH_URL: {
      set: !!process.env.NEXTAUTH_URL,
      value: process.env.NEXTAUTH_URL || null,
    },
    DATABASE_URL: {
      set: !!process.env.DATABASE_URL,
      // Only show the host part, mask the password
      host: process.env.DATABASE_URL ? extractHost(process.env.DATABASE_URL) : null,
    },
    VERCEL_URL: {
      set: !!process.env.VERCEL_URL,
      value: process.env.VERCEL_URL || null,
    },
    NODE_ENV: process.env.NODE_ENV,
  }

  // 2. DB reachability check
  let dbState = { reachable: false, userCount: 0, roleCount: 0, error: undefined as string | undefined }
  try {
    const [userCount, roleCount] = await Promise.all([db.user.count(), db.role.count()])
    dbState = { reachable: true, userCount, roleCount, error: undefined }
  } catch (e: any) {
    dbState = { reachable: false, userCount: 0, roleCount: 0, error: e?.message?.slice(0, 300) || String(e) }
  }

  // 3. NextAuth session check — try to call getServerSession
  let sessionState = { ok: false, session: null as any, error: undefined as string | undefined }
  try {
    const session = await getServerSession(authOptions)
    sessionState = { ok: true, session, error: undefined }
  } catch (e: any) {
    sessionState = {
      ok: false,
      session: null,
      error: e?.message?.slice(0, 500) || String(e),
    }
  }

  // 4. Diagnosis — what to do next
  const diagnosis: string[] = []
  if (!envCheck.NEXTAUTH_SECRET.set) {
    diagnosis.push('❌ NEXTAUTH_SECRET is not set. Add it on Vercel → Settings → Environment Variables. Generate with `openssl rand -base64 32`.')
  } else if (envCheck.NEXTAUTH_SECRET.length < 16) {
    diagnosis.push('⚠️ NEXTAUTH_SECRET looks too short (< 16 chars). Use a 32+ char random string.')
  }
  if (!envCheck.DATABASE_URL.set) {
    diagnosis.push('❌ DATABASE_URL is not set. Add your Neon connection string on Vercel.')
  }
  if (!envCheck.NEXTAUTH_URL.set && !envCheck.VERCEL_URL.set) {
    diagnosis.push('⚠️ Neither NEXTAUTH_URL nor VERCEL_URL is set. Set NEXTAUTH_URL to your Vercel URL.')
  }
  if (!dbState.reachable) {
    diagnosis.push('❌ Database is not reachable. Check DATABASE_URL and Neon connection. Error: ' + dbState.error)
  } else if (dbState.roleCount === 0) {
    diagnosis.push('⚠️ DB is reachable but has 0 roles. Run `bun run db:push` then `bun run db:clear` against your Neon DB.')
  } else if (dbState.userCount === 0) {
    diagnosis.push('✅ DB is reachable and roles exist. No users yet — first signup at /signup will become the bootstrap admin.')
  } else {
    diagnosis.push(`✅ DB is reachable. ${dbState.userCount} user(s) exist. Login should work.`)
  }
  if (!sessionState.ok) {
    diagnosis.push('❌ getServerSession() threw an error: ' + sessionState.error)
  }

  return NextResponse.json({
    data: { envCheck, dbState, sessionState },
    diagnosis,
    meta: { generatedAt: new Date().toISOString() },
  })
}

function extractHost(url: string): string {
  try {
    const u = new URL(url)
    return `${u.hostname}${u.port ? ':' + u.port : ''}${u.pathname}`
  } catch {
    return '(invalid URL)'
  }
}
