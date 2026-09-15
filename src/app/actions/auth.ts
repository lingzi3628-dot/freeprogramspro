'use server'

import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

export type SignupState = { ok: true; userId: string } | { ok: false; error: string }

export async function signupAction(formData: FormData): Promise<SignupState> {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const name = String(formData.get('name') || '').trim()
  const password = String(formData.get('password') || '')
  const confirm = String(formData.get('confirm') || '')

  // Validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }
  if (!name || name.length < 2) {
    return { ok: false, error: 'Please enter your name (min 2 characters).' }
  }
  if (password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' }
  }
  if (password !== confirm) {
    return { ok: false, error: 'Passwords do not match.' }
  }

  // Check existing user
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return { ok: false, error: 'An account with this email already exists. Try logging in.' }
  }

  // Get default user role
  const userRole = await db.role.findUnique({ where: { name: 'user' } })
  if (!userRole) {
    return { ok: false, error: 'Server misconfiguration: missing default role.' }
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await db.user.create({
    data: {
      email,
      name,
      passwordHash,
      roleId: userRole.id,
      // emailVerifiedAt is null — in v3.1 we'll wire Resend to verify it
    },
  })

  revalidatePath('/')
  return { ok: true, userId: user.id }
}

export type PublishAppState = { ok: true; appId: string; slug: string } | { ok: false; error: string }

// Creates a new app in draft state. Called from the admin app editor's
// Publish step (status can be draft, scheduled, or published).
export async function publishAppAction(formData: FormData): Promise<PublishAppState> {
  const name = String(formData.get('name') || '').trim()
  const slug = String(formData.get('slug') || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
  const tagline = String(formData.get('tagline') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const category = String(formData.get('category') || '').trim()
  const license = String(formData.get('license') || '').trim() || 'MIT'
  const sourceUrl = String(formData.get('sourceUrl') || '').trim()
  const homepageUrl = String(formData.get('homepageUrl') || '').trim()
  const developerName = String(formData.get('developerName') || '').trim()
  const developerSlug = developerName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  const status = String(formData.get('status') || 'draft') as 'draft' | 'scheduled' | 'published'
  const featured = formData.get('featured') === 'on'
  const iconGradientFrom = String(formData.get('iconGradientFrom') || '#1a73e8')
  const iconGradientTo = String(formData.get('iconGradientTo') || '#7c3aed')
  const iconText = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'AP'

  if (!name || !slug || !tagline || !description || !category) {
    return { ok: false, error: 'Missing required fields (name, slug, tagline, description, category).' }
  }

  // Verify category exists
  const cat = await db.category.findUnique({ where: { slug: category } })
  if (!cat) {
    return { ok: false, error: `Category "${category}" does not exist.` }
  }

  // Check slug uniqueness
  const existing = await db.app.findUnique({ where: { slug } })
  if (existing) {
    return { ok: false, error: `Slug "${slug}" is already taken. Choose a different one.` }
  }

  const app = await db.app.create({
    data: {
      slug,
      name,
      tagline,
      description,
      iconGradient: JSON.stringify([iconGradientFrom, iconGradientTo]),
      iconText,
      developerName: developerName || 'Unknown',
      developerSlug,
      categoryId: cat.id,
      license,
      sourceUrl: sourceUrl || null,
      homepageUrl: homepageUrl || null,
      status,
      featured,
      publishedAt: status === 'published' ? new Date() : null,
    },
  })

  revalidatePath('/')
  revalidatePath('/adminkenyaorgfpps')
  revalidatePath('/api/apps')

  return { ok: true, appId: app.id, slug: app.slug }
}

export type SignoutState = { ok: true }

export async function signOutAction(): Promise<SignoutState> {
  // Client-side signout is handled by next-auth/react's signOut()
  // This server action is a no-op stub kept for future server-side cleanup
  return { ok: true }
}
