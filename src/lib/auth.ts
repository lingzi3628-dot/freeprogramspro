import bcrypt from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'

// Single Prisma instance for auth (avoids clashing with the global db)
const prisma = new PrismaClient()

// Validate required env vars at module load time. This will fail the build
// (and any server runtime) with a clear error message instead of the cryptic
// "There is a problem with the server configuration" error.
function getRequiredEnv(name: string): string {
  const v = process.env[name]
  if (!v) {
    // Log clearly so it shows up in Vercel function logs
    console.error(`[auth] FATAL: Missing required env var ${name}.`)
    console.error(`[auth] Set it in Vercel → Project → Settings → Environment Variables.`)
    throw new Error(`Missing required env var: ${name}`)
  }
  return v
}

// NEXTAUTH_SECRET: required for JWT signing. If not set, NextAuth throws
// "There is a problem with the server configuration" with no useful info.
// Generate one with: openssl rand -base64 32
const NEXTAUTH_SECRET = (() => {
  try {
    return getRequiredEnv('NEXTAUTH_SECRET')
  } catch (e) {
    // In dev, fall back to a dev-only secret so the app still runs locally.
    // In production, this would fail and Vercel logs would show the error.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[auth] Using dev-only NEXTAUTH_SECRET. Set NEXTAUTH_SECRET in .env for proper auth.')
      return 'dev-only-secret-not-for-production-use-xxxxxxxxxxxxxxxxxxxxxx'
    }
    throw e
  }
})()

// NEXTAUTH_URL: required for redirect callbacks. Auto-detect from VERCEL_URL
// if not set (Vercel sets VERCEL_URL automatically on every deployment).
const NEXTAUTH_URL = process.env.NEXTAUTH_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
  || (process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : undefined)

if (!NEXTAUTH_URL && process.env.NODE_ENV === 'production') {
  console.error('[auth] FATAL: NEXTAUTH_URL is not set and VERCEL_URL is not available.')
  console.error('[auth] Set NEXTAUTH_URL to your production URL on Vercel.')
}

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  url: NEXTAUTH_URL ? new URL(NEXTAUTH_URL) : undefined,
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8h, matches the spec
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: { role: true },
          })
          if (!user || !user.passwordHash || user.bannedAt) return null

          const valid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!valid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            role: user.role?.name ?? 'user',
          } as any
        } catch (e) {
          // Database error (Neon connection issue, missing table, etc.)
          console.error('[auth] authorize() DB error:', e)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-expect-error custom fields on the user object
        token.id = user.id
        // @ts-expect-error custom fields on the user object
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  logger: {
    error(code, metadata) {
      console.error('[next-auth][error]', code, metadata)
    },
    warn(code) {
      console.warn('[next-auth][warn]', code)
    },
  },
}

// Helper for server components / server actions / middleware
export type SessionUser = {
  id: string
  email: string
  name?: string | null
  role: string
}
