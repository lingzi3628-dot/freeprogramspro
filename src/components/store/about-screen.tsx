'use client'

import * as React from 'react'
import { Shield, Heart, Globe, FileText, Mail, ShieldQuestion } from 'lucide-react'

export function AboutScreen() {
  return (
    <div className="mx-auto max-w-[800px] space-y-8 p-4 md:p-6 lg:p-10">
      <header className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[22%] text-lg font-bold text-white" style={{ background: 'linear-gradient(135deg,#1a73e8,#7c3aed)' }}>
          FP
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Free Programs Pro Store</h1>
        <p className="text-sm text-muted-foreground">
          The cleanest, most trustworthy place to discover and download free software across
          desktop, mobile, and browser.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Our promise</h2>
        <p className="text-sm leading-relaxed text-foreground/90">
          Free Programs Pro is a curated, admin-controlled catalog of free software. We only publish
          apps that the operator owns or is licensed to distribute. Every binary carries a SHA-256
          checksum, is scanned by VirusTotal (status shown publicly), and links back to its source
          repository. No piracy, no repacks, no telemetry in the catalog itself.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {[
          { icon: <Shield className="h-5 w-5" />, title: 'Verified', body: 'SHA-256 checksums shown on every detail page. Verify before install.' },
          { icon: <Globe className="h-5 w-5" />, title: 'Open', body: 'Source URL, license type, and permissions list are public.' },
          { icon: <Heart className="h-5 w-5" />, title: 'Free', body: 'No paid apps, no in-app purchases, no advertising between cards.' },
          { icon: <ShieldQuestion className="h-5 w-5" />, title: 'Curated', body: 'Admin-controlled catalog. Future submitter role under moderation.' },
        ].map((f) => (
          <div key={f.title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {f.icon}
            </span>
            <div>
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Legal & policies</h2>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          {['Privacy Policy', 'Terms of Service', 'Cookie Notice', 'DMCA / Takedown', 'Report Abuse', 'Security.txt'].map((l) => (
            <li key={l}>
              <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs hover:bg-surface-hover">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                {l}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Mail className="h-4 w-4" /> Contact
        </h2>
        <p className="text-xs text-muted-foreground">
          Press / partnerships: <a className="text-primary hover:underline" href="mailto:press@fppstore.io">press@fppstore.io</a><br />
          Security disclosures: <a className="text-primary hover:underline" href="mailto:security@fppstore.io">security@fppstore.io</a> (PGP on /.well-known/security.txt)<br />
          Bug reports: open an issue on the app's source repository.
        </p>
      </section>
    </div>
  )
}
