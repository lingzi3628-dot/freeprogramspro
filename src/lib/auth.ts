import bcrypt from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'

// Single Prisma instance for auth (avoids clashing with the global db)
const prisma = new PrismaClient()

// NEXTAUTH_URL: auto-detect from VERCEL_URL if not set
// (Vercel sets VERCEL_URL automatically on every deployment). Don't throw if
// missing — NextAuth will fall back to request headers at runtime.
const NEXTAUTH_URL = process.env.NEXTAUTH_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
  || (process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : undefined)

// IMPORTANT: Don't validate NEXTAUTH_SECRET at module load time. The build
// process (next build) imports this module to collect page data for
// /api/auth/[...nextauth], and env vars aren't set during the build. Throwing
// here would break the build.
//
// NextAuth reads NEXTAUTH_SECRET from process.env at runtime — if it's missing
// at runtime, NextAuth throws "There is a problem with the server configuration"
// which the AuthSessionProvider error boundary catches, and the storefront
// still renders (just login/signup won't work).
//
// If you see runtime auth errors, check Vercel → Project → Settings →
// Environment Variables for NEXTAUTH_SECRET (generate one with
// `openssl rand -base64 32`).

export const authOptions: NextAuthOptions = {
  // Let NextAuth read NEXTAUTH_SECRET from process.env at runtime.
  // Don't pass `secret: process.env.NEXTAUTH_SECRET` here — that would
  // cause the value to be `undefined` at build time and break the build.
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
