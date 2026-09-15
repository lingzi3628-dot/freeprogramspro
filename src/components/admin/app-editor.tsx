'use client'

import * as React from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileCheck,
  Image as ImageIcon,
  FileText,
  Shield,
  Globe,
  Eye,
  Rocket,
  X,
  Plus,
  Copy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useNav } from '@/lib/store/nav'
import { platforms, categories, apps, type App } from '@/data/mock'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { TrustBadge } from '@/components/store/primitives'

type Step = 'details' | 'media' | 'versions' | 'files' | 'trust' | 'publish'

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'details', label: 'Details', icon: <FileText className="h-3.5 w-3.5" /> },
  { id: 'media', label: 'Media', icon: <ImageIcon className="h-3.5 w-3.5" /> },
  { id: 'versions', label: 'Platforms & Versions', icon: <Globe className="h-3.5 w-3.5" /> },
  { id: 'files', label: 'Files', icon: <Upload className="h-3.5 w-3.5" /> },
  { id: 'trust', label: 'Trust', icon: <Shield className="h-3.5 w-3.5" /> },
  { id: 'publish', label: 'Publish', icon: <Rocket className="h-3.5 w-3.5" /> },
]

export function AdminAppEditor({ app, mode }: { app?: App; mode: 'new' | 'edit' }) {
  const navigate = useNav((s) => s.navigate)
  const [step, setStep] = React.useState<Step>('details')
  const [mediaFiles, setMediaFiles] = React.useState<{ name: string; size: number; progress: number }[]>([])
  const [binaryFiles, setBinaryFiles] = React.useState<{ name: string; size: number; progress: number; checksum?: string; status: 'pending' | 'clean' | 'flagged' }[]>([])
  const [featured, setFeatured] = React.useState(app?.featured || false)
  const [status, setStatus] = React.useState<'draft' | 'scheduled' | 'published'>(app?.status as any || 'draft')
  const [form, setForm] = React.useState({
    name: app?.name || '',
    slug: app?.slug || '',
    tagline: app?.tagline || '',
    description: app?.description || '',
    category: app?.category || '',
    license: app?.license || 'MIT',
    sourceUrl: app?.sourceUrl || '',
    homepageUrl: app?.homepageUrl || '',
  })
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const idx = STEPS.findIndex((s) => s.id === step)
  const next = () => setStep(STEPS[Math.min(idx + 1, STEPS.length - 1)].id)
  const back = () => setStep(STEPS[Math.max(idx - 1, 0)].id)

  const fakeUpload = (kind: 'media' | 'binary', file: { name: string; size: number }) => {
    const target = kind === 'media' ? setMediaFiles : setBinaryFiles
    const id = Math.random().toString(36).slice(2)
    const newFile = kind === 'binary'
      ? { ...file, progress: 0, status: 'pending' as const }
      : { ...file, progress: 0 }
    target((arr: any) => [...arr, newFile as any])

    // Animate progress
    const start = Date.now()
    const dur = 1400
    const tick = () => {
      const pct = Math.min(100, Math.round(((Date.now() - start) / dur) * 100))
      target((arr: any) => arr.map((f: any) => f.name === file.name ? { ...f, progress: pct } : f))
      if (pct < 100) requestAnimationFrame(tick)
      else if (kind === 'binary') {
        // Finalize scan + checksum after upload completes
        setTimeout(() => {
          setBinaryFiles((arr: any) => arr.map((f: any) => f.name === file.name
            ? { ...f, checksum: sha256Mock(file.name + file.size), status: 'clean' }
            : f))
          toast.success('VirusTotal scan complete', { description: `${file.name}: clean (70+ engines)` })
        }, 600)
      }
    }
    requestAnimationFrame(tick)
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate({ name: 'admin-apps' })}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-3 w-3" /> Back to apps
          </button>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {mode === 'new' ? 'New app' : `Edit ${app?.name}`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">{status}</Badge>
          <Button variant="outline" size="sm">
            <Eye className="mr-1.5 h-3.5 w-3.5" /> Preview as public
          </Button>
        </div>
      </header>

      {/* Stepper */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const isActive = s.id === step
          const isDone = i < idx
          return (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                isActive ? 'border-primary bg-primary text-primary-foreground'
                : isDone ? 'border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)]'
                : 'border-border bg-card text-foreground/80 hover:bg-surface-hover'
              )}
            >
              {isDone ? <FileCheck className="h-3 w-3" /> : s.icon}
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Body */}
      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        {step === 'details' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold">App details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="App name" htmlFor="name">
                <Input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="My Awesome App" />
              </Field>
              <Field label="Slug" htmlFor="slug">
                <Input id="slug" value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="my-awesome-app" />
              </Field>
              <Field label="Tagline" htmlFor="tagline" className="md:col-span-2">
                <Input id="tagline" value={form.tagline} onChange={(e) => update('tagline', e.target.value)} placeholder="One sentence." />
              </Field>
              <Field label="Description (markdown)" htmlFor="description" className="md:col-span-2">
                <Textarea id="description" value={form.description} onChange={(e) => update('description', e.target.value)} rows={6} />
              </Field>
              <Field label="Category" htmlFor="category">
                <Select value={form.category} onValueChange={(v) => update('category', v)}>
                  <SelectTrigger id="category"><SelectValue placeholder="Pick a category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="License" htmlFor="license">
                <Input id="license" value={form.license} onChange={(e) => update('license', e.target.value)} placeholder="MIT" />
              </Field>
              <Field label="Source URL" htmlFor="sourceUrl">
                <Input id="sourceUrl" value={form.sourceUrl} onChange={(e) => update('sourceUrl', e.target.value)} placeholder="https://github.com/..." />
              </Field>
              <Field label="Homepage URL" htmlFor="homepageUrl">
                <Input id="homepageUrl" value={form.homepageUrl} onChange={(e) => update('homepageUrl', e.target.value)} placeholder="https://..." />
              </Field>
              <div className="flex items-center justify-between md:col-span-2 border-t border-border pt-3">
                <div>
                  <Label htmlFor="featured" className="text-xs">Featured on home</Label>
                  <p className="text-[11px] text-muted-foreground">If on, this app appears in the hero carousel.</p>
                </div>
                <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
              </div>
            </div>
          </div>
        )}

        {step === 'media' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold">Media</h2>
            <Field label="Icon (512×512 PNG, required)">
              <Dropzone
                accept="PNG, WebP"
                multiple={false}
                onFiles={(files) => files.forEach((f) => fakeUpload('media', f))}
              />
            </Field>
            <Field label="Feature graphic (1024×500)">
              <Dropzone
                accept="PNG, JPG"
                multiple={false}
                onFiles={(files) => files.forEach((f) => fakeUpload('media', f))}
              />
            </Field>
            <Field label="Screenshots (2–10, PNG/JPG/WebP)">
              <Dropzone
                accept="PNG, JPG, WebP"
                multiple
                onFiles={(files) => files.forEach((f) => fakeUpload('media', f))}
              />
            </Field>
            <FileList files={mediaFiles} />
          </div>
        )}

        {step === 'versions' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold">Platforms & versions</h2>
            <p className="text-xs text-muted-foreground">
              Add a version entry per platform and channel. The latest stable becomes the default download.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {platforms.map((p) => (
                <div key={p.slug} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-sm font-medium">{p.name}</span>
                    <Badge variant="outline" className="ml-auto text-[10px]">{app?.versions.filter((v) => v.platform === p.slug).length || 0} versions</Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 w-full justify-start text-xs">
                    <Plus className="mr-1 h-3 w-3" /> Add version
                  </Button>
                </div>
              ))}
            </div>
            {app && (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Version</th>
                      <th className="px-3 py-2 font-medium">Channel</th>
                      <th className="px-3 py-2 font-medium">Min OS</th>
                      <th className="px-3 py-2 font-medium">Arch</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {app.versions.slice(0, 6).map((v) => (
                      <tr key={v.id} className="hover:bg-surface-hover">
                        <td className="px-3 py-2 font-mono">{v.version}</td>
                        <td className="px-3 py-2">{v.channel}</td>
                        <td className="px-3 py-2 text-muted-foreground">{v.minOs}</td>
                        <td className="px-3 py-2 text-muted-foreground">{v.architecture}</td>
                        <td className="px-3 py-2"><TrustBadge variant={v.scanStatus === 'clean' ? 'clean' : 'pending'} label={v.scanStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {step === 'files' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold">File uploads</h2>
            <p className="text-xs text-muted-foreground">
              Drag-drop binaries here. SHA-256 is computed client-side and verified server-side.
              Optional VirusTotal scan runs async.
            </p>
            <Dropzone
              accept=".exe, .msi, .zip, .deb, .AppImage, .snap, .flatpak, .apk, .crx"
              multiple
              onFiles={(files) => files.forEach((f) => fakeUpload('binary', f))}
            />
            <FileList files={binaryFiles} variant="binary" />
          </div>
        )}

        {step === 'trust' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold">Trust & safety metadata</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="License type">
                <Input value={form.license} onChange={(e) => update('license', e.target.value)} />
              </Field>
              <Field label="Source URL">
                <Input value={form.sourceUrl} onChange={(e) => update('sourceUrl', e.target.value)} placeholder="https://github.com/..." />
              </Field>
              <Field label="Permissions (comma-separated)" className="md:col-span-2">
                <Input defaultValue={(app?.permissions || []).join(', ')} placeholder="Filesystem read, Network" />
              </Field>
              <Field label="Safety notes (markdown)" className="md:col-span-2">
                <Textarea rows={4} placeholder="Anything users should know about install? e.g. 'Requires sudo on Linux for system-wide install.'" />
              </Field>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-xs">
              <Shield className="mr-1 inline h-3 w-3 text-[var(--success)]" />
              Every publish must include: license, source URL, SHA-256 checksum, and a scan status. Missing any of these blocks publication.
            </div>
          </div>
        )}

        {step === 'publish' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold">Publish</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <Label className="text-xs">Status</Label>
                  <p className="text-[11px] text-muted-foreground">Draft is hidden. Published is visible immediately.</p>
                </div>
                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border border-border p-3 text-xs">
                <h3 className="font-semibold">Publishing checklist</h3>
                <ul className="mt-2 space-y-1.5">
                  {[
                    { label: 'App has a name and category', done: !!form.name && !!form.category },
                    { label: 'Icon uploaded (512×512)', done: mediaFiles.length > 0 },
                    { label: 'At least one binary with checksum', done: binaryFiles.length > 0 },
                    { label: 'License type set', done: !!form.license },
                    { label: 'Source URL set', done: !!form.sourceUrl.startsWith('http') },
                  ].map((row) => (
                    <li key={row.label} className="flex items-center gap-2">
                      {row.done
                        ? <FileCheck className="h-3.5 w-3.5 text-[var(--success)]" />
                        : <X className="h-3.5 w-3.5 text-[var(--danger)]" />}
                      <span className={cn(row.done ? 'text-foreground' : 'text-muted-foreground')}>
                        {row.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <Button variant="ghost" onClick={back}>Back</Button>
              <Button
                onClick={() => {
                  toast.success(status === 'published' ? 'App published 🎉' : 'Saved as draft', {
                    description: status === 'published' ? 'Sitemap regenerated. Search index updated.' : undefined,
                  })
                  navigate({ name: 'admin-apps' })
                }}
              >
                <Rocket className="mr-1.5 h-3.5 w-3.5" />
                {status === 'published' ? 'Publish now' : 'Save draft'}
              </Button>
            </div>
          </div>
        )}

        {step !== 'publish' && (
          <div className="flex justify-between border-t border-border pt-3">
            <Button variant="ghost" onClick={back} disabled={idx === 0}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
            </Button>
            <Button onClick={next}>
              Continue <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function sha256Mock(seed: string): string {
  let h = ''
  const chars = '0123456789abcdef'
  let s = seed
  while (s.length < 64) s += s + seed
  for (let i = 0; i < 64; i++) {
    h += chars[(s.charCodeAt(i % s.length) + i * 7) % 16]
  }
  return h
}

function Field({ label, htmlFor, children, className }: { label: string; htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium">{label}</Label>
      {children}
    </div>
  )
}

function Dropzone({ accept, multiple, onFiles }: { accept: string; multiple?: boolean; onFiles: (files: { name: string; size: number }[]) => void }) {
  const [dragging, setDragging] = React.useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        // Simulate a file picker
        const fake = { name: `upload-${Math.random().toString(36).slice(2, 8)}${accept.split(',')[0].trim()}`, size: Math.floor(1_000_000 + Math.random() * 50_000_000) }
        onFiles(multiple ? [fake, { ...fake, name: fake.name + '-2' }] : [fake])
      }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragging(false)
        const files = Array.from(e.dataTransfer.files).map((f) => ({ name: f.name, size: f.size }))
        onFiles(files)
      }}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-sm transition-colors',
        dragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/40 hover:bg-muted/60'
      )}
    >
      <Upload className="h-5 w-5 text-muted-foreground" />
      <span>Drop files here or click to upload</span>
      <span className="text-[11px] text-muted-foreground">{accept}{multiple ? ' · multiple allowed' : ''}</span>
    </button>
  )
}

function FileList({ files, variant }: { files: any[]; variant?: 'binary' }) {
  if (files.length === 0) {
    return <p className="text-xs text-muted-foreground">No files uploaded yet.</p>
  }
  return (
    <ul className="space-y-1.5">
      {files.map((f, i) => (
        <li key={i} className="rounded-lg border border-border bg-background p-2.5">
          <div className="flex items-center gap-2 text-xs">
            <FileCheck className={f.progress === 100 ? 'h-3.5 w-3.5 text-[var(--success)]' : 'h-3.5 w-3.5 text-muted-foreground'} />
            <span className="flex-1 truncate font-medium">{f.name}</span>
            <span className="tabular-nums text-muted-foreground">
              {(f.size / 1_000_000).toFixed(1)} MB
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
                style={{ width: `${f.progress}%` }}
              />
            </div>
            <span className="tabular-nums text-[11px] text-muted-foreground">{f.progress}%</span>
          </div>
          {variant === 'binary' && f.progress === 100 && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
              <TrustBadge variant={f.status === 'clean' ? 'clean' : 'pending'} label={f.status === 'clean' ? 'VirusTotal: clean' : 'Scan pending'} />
              {f.checksum && (
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  SHA-256: {f.checksum.slice(0, 16)}…
                </code>
              )}
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(f.checksum || '')
                  toast.success('Checksum copied')
                }}
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <Copy className="h-2.5 w-2.5" /> Copy
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
