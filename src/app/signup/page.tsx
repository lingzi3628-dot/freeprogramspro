'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Fingerprint, Loader2, Mail, User, Lock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNav } from '@/lib/store/nav'
import { signupAction } from '@/app/actions/auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function SignupPage() {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await signupAction(formData)
    setPending(false)

    if (!result.ok) {
      setError(result.error)
      toast.error('Sign up failed', { description: result.error })
      return
    }

    // Auto-login after signup
    const email = String(formData.get('email'))
    const password = String(formData.get('password'))
    toast.success('Account created!', { description: 'Logging you in…' })

    const signInResult = await signIn('credentials', { email, password, redirect: false })
    if (signInResult?.error) {
      setError('Account created but login failed. Try logging in.')
      router.push('/login')
      return
    }
    router.push('/')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-[22%] text-lg font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#1a73e8,#7c3aed)' }}
          >
            FP
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Free, takes 30 seconds. Use any email + password.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-border bg-card p-6 shadow-sm">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-2.5 text-xs">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--destructive)]" />
              <span className="text-[var(--destructive)]">{error}</span>
            </div>
          )}

          <div>
            <Label htmlFor="name" className="mb-1.5 block text-xs font-medium">Full name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="name" name="name" type="text" placeholder="Sam Patel" required
                className="pl-9" />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="mb-1.5 block text-xs font-medium">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" name="email" type="email" placeholder="you@example.com" required
                autoComplete="email" className="pl-9" />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="mb-1.5 block text-xs font-medium">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" name="password" type="password" required minLength={8}
                autoComplete="new-password" className="pl-9" />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">Min 8 characters.</p>
          </div>

          <div>
            <Label htmlFor="confirm" className="mb-1.5 block text-xs font-medium">Confirm password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="confirm" name="confirm" type="password" required minLength={8}
                autoComplete="new-password" className="pl-9" />
            </div>
          </div>

          <Button type="submit" disabled={pending} className="mt-2 w-full">
            {pending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Fingerprint className="mr-1.5 h-4 w-4" />}
            Create account
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">
            By signing up, you agree to our Terms and Privacy Policy.
          </p>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-primary hover:underline">Log in</a>
        </p>
      </div>
    </div>
  )
}
