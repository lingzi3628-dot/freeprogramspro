'use client'

import * as React from 'react'
import { Upload, FileCheck, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNav } from '@/lib/store/nav'
import { platforms, categories } from '@/data/mock'
import { toast } from 'sonner'

export function SubmitScreen() {
  const navigate = useNav((s) => s.navigate)
  const [step, setStep] = React.useState(1)
  const [form, setForm] = React.useState({
    name: '', slug: '', tagline: '', description: '',
    category: '', platform: '', license: 'MIT', sourceUrl: '', homepageUrl: '',
  })

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="mx-auto max-w-[800px] space-y-6 p-4 md:p-6 lg:p-8">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" /> Submitter portal
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Submit your app</h1>
        <p className="text-sm text-muted-foreground">
          Open-source apps are free to publish. We review every submission within 72 hours. Your app
          stays in <code className="rounded bg-muted px-1 py-0.5 text-xs">draft</code> until you publish.
        </p>
      </header>

      {/* Stepper */}
      <ol className="grid grid-cols-3 gap-2">
        {['Details', 'Files & media', 'Submit'].map((label, i) => {
          const stepNo = i + 1
          const isActive = stepNo === step
          const isDone = stepNo < step
          return (
            <li key={label} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
              <span className={cn_step(isActive, isDone)}>{isDone ? <FileCheck className="h-3 w-3" /> : stepNo}</span>
              <span className="text-xs font-medium">{label}</span>
            </li>
          )
        })}
      </ol>

      {step === 1 && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6">
          <h2 className="text-sm font-semibold">App details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="App name" htmlFor="name">
              <Input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="My Awesome App" />
            </Field>
            <Field label="Slug" htmlFor="slug">
              <Input id="slug" value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="my-awesome-app" />
            </Field>
            <Field label="Tagline" htmlFor="tagline" className="md:col-span-2">
              <Input id="tagline" value={form.tagline} onChange={(e) => update('tagline', e.target.value)} placeholder="One sentence that describes your app." />
            </Field>
            <Field label="Category" htmlFor="category">
              <Select value={form.category} onValueChange={(v) => update('category', v)}>
                <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Primary platform" htmlFor="platform">
              <Select value={form.platform} onValueChange={(v) => update('platform', v)}>
                <SelectTrigger id="platform"><SelectValue placeholder="Select a platform" /></SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Description" htmlFor="description" className="md:col-span-2">
              <Textarea id="description" value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} placeholder="Markdown supported. Tell users what your app does and why it's trustworthy." />
            </Field>
            <Field label="License" htmlFor="license" className="md:col-span-2">
              <Input id="license" value={form.license} onChange={(e) => update('license', e.target.value)} placeholder="SPDX identifier e.g. MIT, Apache-2.0, GPL-3.0" />
            </Field>
            <Field label="Source URL" htmlFor="sourceUrl">
              <Input id="sourceUrl" value={form.sourceUrl} onChange={(e) => update('sourceUrl', e.target.value)} placeholder="https://github.com/you/your-app" />
            </Field>
            <Field label="Homepage URL" htmlFor="homepageUrl">
              <Input id="homepageUrl" value={form.homepageUrl} onChange={(e) => update('homepageUrl', e.target.value)} placeholder="https://your-app.example" />
            </Field>
          </div>
          <div className="flex justify-between border-t border-border pt-3">
            <Button variant="ghost" onClick={() => navigate({ name: 'home' })}>Cancel</Button>
            <Button onClick={() => setStep(2)} disabled={!form.name || !form.category || !form.platform}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6">
          <h2 className="text-sm font-semibold">Files & media</h2>
          <div className="space-y-3">
            <Field label="App icon (512×512 PNG, required)" className="md:col-span-2">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground hover:border-primary/40 hover:bg-muted/60">
                <Upload className="h-4 w-4" /> Drop icon here or click to upload
              </button>
            </Field>
            <Field label="Feature graphic (1024×500)" className="md:col-span-2">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground hover:border-primary/40 hover:bg-muted/60">
                <Upload className="h-4 w-4" /> Drop graphic here
              </button>
            </Field>
            <Field label="Binary upload (.exe / .deb / .apk / .crx / .zip)" className="md:col-span-2">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground hover:border-primary/40 hover:bg-muted/60">
                <Upload className="h-4 w-4" /> Drop binary here — max 500 MB
              </button>
              <p className="mt-2 text-xs text-muted-foreground">
                <ShieldCheck className="mr-1 inline h-3 w-3" />
                We compute SHA-256 client-side and verify server-side. Optional VirusTotal scan.
              </p>
            </Field>
          </div>
          <div className="flex justify-between border-t border-border pt-3">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6">
          <h2 className="text-sm font-semibold">Review & submit</h2>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <Row label="App name" value={form.name || '—'} />
            <Row label="Category" value={categories.find((c) => c.slug === form.category)?.name || '—'} />
            <Row label="Platform" value={platforms.find((p) => p.slug === form.platform)?.name || '—'} />
            <Row label="License" value={form.license || '—'} />
          </dl>
          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mr-1 inline h-3 w-3 text-[var(--success)]" />
            By submitting, you confirm you own or are licensed to distribute this software. False claims
            will result in account suspension and takedown.
          </div>
          <div className="flex justify-between border-t border-border pt-3">
            <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
            <Button
              onClick={() => {
                toast.success('Submission received', { description: 'We\'ll review within 72 hours. Status updates appear in your account.' })
                navigate({ name: 'account', tab: 'downloads' })
              }}
            >
              Submit for review
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function cn_step(active: boolean, done: boolean) {
  return [
    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
    done ? 'bg-[var(--success)] text-white'
    : active ? 'bg-primary text-primary-foreground'
    : 'bg-muted text-muted-foreground'
  ].join(' ')
}

function Field({ label, htmlFor, children, className }: { label: string; htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium">{label}</Label>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
