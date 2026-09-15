'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { LogIn, UserPlus, LogOut, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useNav } from '@/lib/store/nav'
import { toast } from 'sonner'

export function PublicUserBadge() {
  const { data: session, status } = useSession()
  const navigate = useNav((s) => s.navigate)

  if (status === 'loading') {
    return <Avatar className="h-8 w-8"><AvatarFallback><Loader2 className="h-3.5 w-3.5 animate-spin" /></AvatarFallback></Avatar>
  }

  if (!session?.user) {
    // Logged out — show login + signup buttons
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href="/login"
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium hover:bg-surface-hover"
        >
          <LogIn className="h-3.5 w-3.5" /> Log in
        </Link>
        <Link
          href="/signup"
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary-hover"
        >
          <UserPlus className="h-3.5 w-3.5" /> Sign up
        </Link>
      </div>
    )
  }

  // Logged in — show avatar + name + logout
  const user = session.user as any
  const initials = (user.name || user.email || 'U').split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => navigate({ name: 'account' })}
        className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-muted"
        title={`${user.email} (${user.role})`}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback style={{ background: 'linear-gradient(135deg,#1a73e8,#7c3aed)' }} className="text-[10px] text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-xs font-medium md:inline">{user.name || user.email}</span>
      </button>
      <button
        onClick={() => {
          signOut({ callbackUrl: '/' })
          toast.success('Signed out')
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-hover hover:text-[var(--destructive)]"
        aria-label="Log out"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
