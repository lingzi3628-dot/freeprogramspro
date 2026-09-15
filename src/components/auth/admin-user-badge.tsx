'use client'

import * as React from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

export function AdminUserBadge() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <Avatar className="h-8 w-8"><AvatarFallback>…</AvatarFallback></Avatar>
  }

  if (!session?.user) {
    return (
      <a href="/login" className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium hover:bg-surface-hover">
        Log in
      </a>
    )
  }

  const user = session.user as any
  const initials = (user.name || user.email || 'A').split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-right md:block">
        <div className="text-xs font-medium">{user.name || user.email}</div>
        <Badge variant="outline" className="text-[10px] capitalize">{user.role}</Badge>
      </div>
      <Avatar className="h-8 w-8">
        <AvatarFallback style={{ background: 'linear-gradient(135deg,#1a73e8,#7c3aed)' }} className="text-[10px] text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full text-[var(--destructive)]"
        aria-label="Log out"
        onClick={() => {
          signOut({ callbackUrl: '/login' })
          toast.success('Signed out')
        }}
      >
        <LogOut className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
