import bcrypt from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'

// Single Prisma instance for auth (avoids clashing with the global db)
const prisma = new PrismaClient()

// NEXTAUTH_URL: auto-detect from VERCEL_URL if NEXTAUTH_URL isn't set.
// Wrapped in try/catch in case the user sets a malformed NEXTAUTH_URL
// (e.g., "freeprogramspro.vercel.app" without "https://"). Without this,
// `new URL(malformedString)` throws at module load → /api/auth/* 500s.
let NEXTAUTH_URL: string | undefined
try {
  NEXTAUTH_URL = process.env.NEXTAUTH_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
    || (process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : undefined)
  // Validate the URL is parseable
  if (NEXTAUTH_URL) new URL(NEXTAUTH_URL)
} catch (e) {
  console.error('[auth] Invalid NEXTAUTH_URL:', process.env.NEXTAUTH_URL, e)
  // Fall back to VERCEL_URL or skip
  NEXTAUTH_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
}

// NEXTAUTH_SECRET: read from process.env at REQUEST time, not module load.
// We do NOT pass `secret` to authOptions explicitly — NextAuth v4 reads
// process.env.NEXTAUTH_SECRET automatically. This way the build doesn't
// fail if the secret isn't set yet (Vercel builds without env vars).

export const authOptions: NextAuthOptions = {
  // Don't pass `secret` — let NextAuth read process.env.NEXTAUTH_SECRET at runtime.
  // Don't pass `url` if it's undefined — NextAuth falls back to request Host header.
  ...(NEXTAUTH_URL ? { url: new URL(NEXTAUTH_URL) } : {}),
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
          // Returning null gives the user "Invalid email or password" —
          // a clearer UX than crashing the request.
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
