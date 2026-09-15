'use client'

import * as React from 'react'
import { User, Download, Heart, Star, Settings, LogOut, ShieldCheck } from 'lucide-react'
import { AppCard, type App } from './app-card'
import { useNav } from '@/lib/store/nav'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function AccountScreen({ apps }: { apps: App[] }) {
  const navigate = useNav((s) => s.navigate)
  const [tab, setTab] = React.useState('downloads')

  const downloads = apps.slice(0, 4)
  const wishlist = apps.slice(4, 7)
  const reviews = apps.slice(0, 2)

  return (
    <div className="mx-auto max-w-[1000px] space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback style={{ background: 'linear-gradient(135deg,#1a73e8,#7c3aed)' }} className="text-lg font-semibold text-white">
            SP
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold">Sam Patel</h1>
          <p className="text-sm text-muted-foreground">sam.patel@example.com · Member since Aug 2026</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">User</Badge>
            <Badge className="bg-[var(--success)]/10 text-[var(--success)] text-[10px] hover:bg-[var(--success)]/20">
              Email verified
            </Badge>
          </div>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="downloads"><Download className="mr-1.5 h-3.5 w-3.5" /> Downloads</TabsTrigger>
          <TabsTrigger value="wishlist"><Heart className="mr-1.5 h-3.5 w-3.5" /> Wishlist</TabsTrigger>
          <TabsTrigger value="reviews"><Star className="mr-1.5 h-3.5 w-3.5" /> Reviews</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-1.5 h-3.5 w-3.5" /> Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="downloads" className="space-y-3">
          <h2 className="text-sm font-semibold">Recent downloads</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {downloads.map((a) => (
              <AppCard key={a.id} app={a} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="wishlist" className="space-y-3">
          <h2 className="text-sm font-semibold">Your wishlist</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {wishlist.map((a) => (
              <AppCard key={a.id} app={a} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="space-y-3">
          <h2 className="text-sm font-semibold">Your reviews</h2>
          <div className="flex flex-col gap-2">
            {reviews.map((a) => (
              <div key={a.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <button className="text-sm font-medium hover:underline" onClick={() => navigate({ name: 'app', slug: a.slug })}>
                    {a.name}
                  </button>
                  <span className="text-xs text-muted-foreground">★★★★★</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">"Solid release. Verified the SHA-256 before installing."</p>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <div className="space-y-4 rounded-xl border border-border bg-card p-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Appearance</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="theme" className="text-xs">Use system theme</Label>
                <Switch id="theme" defaultChecked />
              </div>
            </div>
            <div className="space-y-3 border-t border-border pt-4">
              <h3 className="text-sm font-semibold">Notifications</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="n1" className="text-xs">Email me when a wishlisted app gets a new version</Label>
                  <Switch id="n1" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="n2" className="text-xs">Email me when a developer I follow publishes</Label>
                  <Switch id="n2" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="n3" className="text-xs">Marketing & community updates</Label>
                  <Switch id="n3" />
                </div>
              </div>
            </div>
            <div className="space-y-3 border-t border-border pt-4">
              <h3 className="text-sm font-semibold">Privacy</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>· Your IP is hashed before storage in download logs.</p>
                <p>· No third-party analytics. Self-hosted Plausible only.</p>
                <p>· Export your data as JSON, or delete your account anytime.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Export my data</Button>
                <Button variant="outline" size="sm" className="text-[var(--destructive)]">Delete account</Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" size="sm">
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
