'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Fingerprint, Loader2, Mail, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function LoginPage() {
  return (
    <React.Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </React.Suspense>
  )
}

function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Show error if redirected from middleware with ?error=...
  React.useEffect(() => {
    const err = params.get('error')
    if (err === 'unauthorized') setError('You must be logged in as an admin to view that page.')
    else if (err === 'forbidden') setError('Your account does not have admin access.')
    else if (err === 'SessionRequired') setError('Please log in to continue.')
  }, [params])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email'))
    const password = String(formData.get('password'))
    const callbackUrl = params.get('callbackUrl') || '/'

    const result = await signIn('credentials', { email, password, redirect: false })
    setPending(false)

    if (result?.error) {
      setError('Invalid email or password.')
      toast.error('Login failed', { description: 'Check your email and password.' })
      return
    }

    toast.success('Logged in!')
    router.push(callbackUrl)
    router.refresh()
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
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log in to your Free Programs Pro account.
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
            <Label htmlFor="email" className="mb-1.5 block text-xs font-medium">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" name="email" type="email" required autoComplete="email"
                placeholder="you@example.com" className="pl-9" defaultValue="admin@fppstore.io" />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="mb-1.5 block text-xs font-medium">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" name="password" type="password" required
                autoComplete="current-password" className="pl-9" defaultValue="admin1234" />
            </div>
          </div>

          <Button type="submit" disabled={pending} className="mt-2 w-full">
            {pending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Fingerprint className="mr-1.5 h-4 w-4" />}
            Log in
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <a href="/signup" className="font-medium text-primary hover:underline">Sign up</a>
        </p>

        <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-3 text-[11px] text-muted-foreground">
          <strong className="text-[var(--warning)]">Demo credentials:</strong> admin@fppstore.io / admin1234
          <br />(change after first login)
        </div>
      </div>
    </div>
  )
}
