// Mock data for Free Programs Pro Store
// Comprehensive sample dataset for development & demo

export type PlatformSlug = 'windows' | 'linux' | 'ubuntu' | 'android' | 'chrome'

export type Platform = {
  slug: PlatformSlug
  name: string
  color: string
  // lucide icon name placeholder; we'll render custom logos in components
  icon: string
  packages: string[]
  sortOrder: number
}

export const platforms: Platform[] = [
  { slug: 'windows', name: 'Windows', color: '#0078D4', icon: 'windows', packages: ['.exe', '.msi', '.zip', '.msix'], sortOrder: 1 },
  { slug: 'linux', name: 'Linux', color: '#F6A800', icon: 'linux', packages: ['.deb', '.AppImage', '.snap', '.flatpak', '.tar.gz'], sortOrder: 2 },
  { slug: 'ubuntu', name: 'Ubuntu', color: '#E95420', icon: 'ubuntu', packages: ['.deb', '.snap'], sortOrder: 3 },
  { slug: 'android', name: 'Android', color: '#3DDC84', icon: 'android', packages: ['.apk', '.aab'], sortOrder: 4 },
  { slug: 'chrome', name: 'Chrome Extension', color: '#4285F4', icon: 'chrome', packages: ['.crx', '.zip'], sortOrder: 5 },
]

export type Category = {
  slug: string
  name: string
  description: string
  icon: string
  sortOrder: number
}

export const categories: Category[] = [
  { slug: 'dev-tools', name: 'Dev Tools', description: 'Code editors, terminals, build tools.', icon: 'code', sortOrder: 1 },
  { slug: 'security', name: 'Security', description: 'Antivirus, VPNs, password managers, firewalls.', icon: 'shield', sortOrder: 2 },
  { slug: 'utilities', name: 'Utilities', description: 'File managers, archivers, system tools.', icon: 'wrench', sortOrder: 3 },
  { slug: 'productivity', name: 'Productivity', description: 'Office suites, notes, PDF tools.', icon: 'briefcase', sortOrder: 4 },
  { slug: 'media', name: 'Media', description: 'Players, editors, converters.', icon: 'film', sortOrder: 5 },
  { slug: 'browsers', name: 'Browsers', description: 'Web browsers and shells.', icon: 'globe', sortOrder: 6 },
  { slug: 'communication', name: 'Communication', description: 'Chat, mail, VoIP clients.', icon: 'message-circle', sortOrder: 7 },
  { slug: 'graphics', name: 'Graphics', description: 'Image editors, 3D, design suites.', icon: 'image', sortOrder: 8 },
]

export type Tag = { slug: string; name: string }

export const tags: Tag[] = [
  { slug: 'open-source', name: 'Open Source' },
  { slug: 'freeware', name: 'Freeware' },
  { slug: 'privacy', name: 'Privacy-first' },
  { slug: 'no-ads', name: 'No Ads' },
  { slug: 'offline', name: 'Works Offline' },
  { slug: 'cross-platform', name: 'Cross-platform' },
  { slug: 'lightweight', name: 'Lightweight' },
  { slug: 'featured', name: 'Featured' },
]

export type Review = {
  id: string
  author: string
  avatarColor: string
  rating: number
  body: string
  helpfulCount: number
  createdAt: string
  status: 'visible' | 'hidden' | 'pending'
}

export type VersionEntry = {
  id: string
  version: string
  platform: PlatformSlug
  channel: 'stable' | 'beta' | 'nightly' | 'rc'
  minOs: string
  architecture: string
  fileUrl: string
  fileSize: number
  checksumSha256: string
  releaseNotes: string
  scanStatus: 'clean' | 'pending' | 'flagged'
  scanProvider: string
  publishedAt: string
}

export type App = {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  iconGradient: [string, string]
  iconText: string
  developer: string
  developerSlug: string
  category: string
  tags: string[]
  platforms: PlatformSlug[]
  license: string
  sourceUrl: string
  homepageUrl: string
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  featured: boolean
  publishedAt: string
  updatedAt: string
  ratingAvg: number
  ratingCount: number
  downloads: number
  versions: VersionEntry[]
  screenshots: { gradient: [string, string]; label: string }[]
  reviews: Review[]
  permissions?: string[]
  sizeBytes: number
}

// Helper: SHA-256-looking string
function sha256(seed: string): string {
  let h = ''
  const chars = '0123456789abcdef'
  let s = seed
  while (s.length < 64) s += s + seed
  for (let i = 0; i < 64; i++) {
    h += chars[(s.charCodeAt(i % s.length) + i * 7) % 16]
  }
  return h
}

function makeVersions(slug: string, plats: PlatformSlug[], base: string): VersionEntry[] {
  const versions: VersionEntry[] = []
  const channels: VersionEntry['channel'][] = ['stable', 'beta', 'rc']
  plats.forEach((p, i) => {
    channels.forEach((c, j) => {
      const ver = `${base}.${j + 1}`
      versions.push({
        id: `${slug}-${p}-${c}`,
        version: ver,
        platform: p,
        channel: c,
        minOs: p === 'android' ? 'Android 8.0+' : p === 'chrome' ? 'Chrome 100+' : 'Windows 10 / Ubuntu 20.04+',
        architecture: p === 'android' ? 'arm64-v8a, armeabi-v7a' : 'x64, ARM64',
        fileUrl: `#/apps/${slug}/${ver}/${p}/download`,
        fileSize: 18_000_000 + ((i + 1) * 4_500_000) + (j * 1_200_000),
        checksumSha256: sha256(`${slug}-${p}-${c}-${ver}`),
        releaseNotes: j === 0
          ? `## What's new in ${ver}\n\n- Improved startup performance by 22%.\n- Fixed rare crash when opening large files.\n- Updated translations for 14 languages.`
          : j === 1
          ? `## Beta ${ver}\n\n- Experimental new file picker UI.\n- Try the new command palette (Ctrl+K).`
          : `## Release Candidate ${ver}\n\n- Final stability fixes before stable release.`,
        scanStatus: j === 2 ? 'pending' : 'clean',
        scanProvider: 'VirusTotal',
        publishedAt: new Date(Date.now() - (j + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
    })
  })
  return versions
}

function makeReviews(seed: string, avg: number, count: number): Review[] {
  const names = ['Sam', 'Priya', 'Marco', 'Lena', 'Hiro', 'Sofia', 'Dev', 'Aisha', 'Tom', 'Mei', 'Ravi', 'Eva']
  const bodies = [
    'Exactly what I needed. Clean install, no ads, no telemetry. The checksum matched the source repo.',
    'Fast, lightweight, and well-maintained. Open-source alternative to commercial tools that cost $80/yr.',
    'Solid release. The new version fixed the issue I reported last month. Kudos to the developer.',
    'Works perfectly on my system. Verified the SHA-256 before installing — all good.',
    'Decent but the UI feels dated. Functionality-wise though, it does what it says.',
    'Impressive performance. Startup is nearly instant. The CLI mode is a power user\'s dream.',
    'Was skeptical at first but no issues after 3 weeks of daily use. Background updates are silent.',
    'Best in its category. Cross-platform, no account required, no tracking.',
    'Would love dark mode to be a bit deeper but otherwise excellent.',
    'The dev responds quickly on the issue tracker. Real open-source energy.',
  ]
  const reviews: Review[] = []
  const colors = ['#1a73e8', '#0b8f6a', '#7c3aed', '#d93025', '#f29900', '#0078D4', '#E95420', '#3DDC84']
  const n = Math.min(count, 8)
  for (let i = 0; i < n; i++) {
    const r = avg >= 4.5 ? 5 : avg >= 4 ? (i % 4 === 0 ? 4 : 5) : (i % 3 === 0 ? 3 : 4)
    reviews.push({
      id: `${seed}-r${i}`,
      author: names[(seed.charCodeAt(0) + i) % names.length],
      avatarColor: colors[i % colors.length],
      rating: r,
      body: bodies[(seed.charCodeAt(1) + i) % bodies.length],
      helpfulCount: (i * 3 + seed.length * 2) % 47,
      createdAt: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'visible',
    })
  }
  return reviews
}

export const apps: App[] = [
  {
    id: '1', slug: 'nucleus-notes', name: 'Nucleus Notes', tagline: 'Markdown-first note app with bidirectional links.',
    description: 'Nucleus Notes is a privacy-first, local-first markdown editor with bidirectional links, graph view, and end-to-end encrypted sync. Your notes live in plain text on your own machine — no servers, no accounts, no telemetry. Built by ex-Obsidian contributors who wanted a faster, lighter alternative with first-class keyboard support.',
    iconGradient: ['#1a73e8', '#7c3aed'], iconText: 'Nu',
    developer: 'Nucleus Labs', developerSlug: 'nucleus-labs',
    category: 'productivity', tags: ['open-source', 'privacy', 'offline', 'cross-platform'],
    platforms: ['windows', 'linux', 'ubuntu', 'android'],
    license: 'MIT', sourceUrl: 'https://github.com/nucleus-labs/notes', homepageUrl: 'https://nucleus.notes',
    status: 'published', featured: true,
    publishedAt: '2026-08-12T10:00:00Z', updatedAt: '2026-09-10T14:30:00Z',
    ratingAvg: 4.8, ratingCount: 1284, downloads: 184_500, sizeBytes: 38_000_000,
    versions: makeVersions('nucleus-notes', ['windows', 'linux', 'ubuntu', 'android'], '2.4'),
    screenshots: [
      { gradient: ['#1a73e8', '#7c3aed'], label: 'Editor + graph view' },
      { gradient: ['#0b8f6a', '#1a73e8'], label: 'Command palette' },
      { gradient: ['#7c3aed', '#d93025'], label: 'Encrypted sync setup' },
      { gradient: ['#f29900', '#1a73e8'], label: 'Mobile view' },
    ],
    reviews: makeReviews('nucleus-notes', 4.8, 1284),
    permissions: ['Filesystem read', 'Filesystem write', 'Network (sync, opt-in)'],
  },
  {
    id: '2', slug: 'aegis-vault', name: 'Aegis Vault', tagline: 'Offline 2FA authenticator with encrypted backups.',
    description: 'Aegis Vault is a free, open-source two-factor authentication app that stores TOTP and HOTP entries in an encrypted, offline vault. No cloud, no account, no ads. Export and import encrypted JSON backups. Supports biometric unlock, hardware-backed keystore on Android, and yubikey-compatible HMAC on desktop.',
    iconGradient: ['#0b8f6a', '#1a73e8'], iconText: 'Ae',
    developer: 'Aegis Project', developerSlug: 'aegis-project',
    category: 'security', tags: ['open-source', 'privacy', 'offline', 'lightweight'],
    platforms: ['android', 'windows', 'linux'],
    license: 'GPL-3.0', sourceUrl: 'https://github.com/aegis/vault', homepageUrl: 'https://aegis.app',
    status: 'published', featured: true,
    publishedAt: '2026-07-01T08:00:00Z', updatedAt: '2026-09-08T09:00:00Z',
    ratingAvg: 4.9, ratingCount: 3120, downloads: 421_000, sizeBytes: 12_500_000,
    versions: makeVersions('aegis-vault', ['android', 'windows', 'linux'], '3.1'),
    screenshots: [
      { gradient: ['#0b8f6a', '#1a73e8'], label: 'Vault list' },
      { gradient: ['#1a73e8', '#0b8f6a'], label: 'Biometric unlock' },
      { gradient: ['#d93025', '#0b8f6a'], label: 'Encrypted backup' },
    ],
    reviews: makeReviews('aegis-vault', 4.9, 3120),
    permissions: ['Biometric', 'Keystore', 'Clipboard (opt-in)'],
  },
  {
    id: '3', slug: 'pixel-painter-pro', name: 'Pixel Painter Pro', tagline: 'Pixel-art studio with layers, palettes, and animation.',
    description: 'Pixel Painter Pro is a free pixel-art editor with onion-skin animation, Aseprite-compatible file format support, palette swapping, and tile mode. Designed for game developers and hobbyists. Cross-platform, scriptable with Lua, and exports directly to PNG, GIF, and animated WebP.',
    iconGradient: ['#f29900', '#d93025'], iconText: 'Pp',
    developer: 'Brushworks', developerSlug: 'brushworks',
    category: 'graphics', tags: ['open-source', 'cross-platform', 'offline'],
    platforms: ['windows', 'linux', 'ubuntu', 'android'],
    license: 'GPL-3.0', sourceUrl: 'https://github.com/brushworks/ppp', homepageUrl: 'https://pixelpainter.pro',
    status: 'published', featured: true,
    publishedAt: '2026-06-15T12:00:00Z', updatedAt: '2026-09-11T16:00:00Z',
    ratingAvg: 4.7, ratingCount: 890, downloads: 67_500, sizeBytes: 42_000_000,
    versions: makeVersions('pixel-painter-pro', ['windows', 'linux', 'ubuntu', 'android'], '1.8'),
    screenshots: [
      { gradient: ['#f29900', '#d93025'], label: 'Canvas + layers' },
      { gradient: ['#d93025', '#f29900'], label: 'Onion-skin animation' },
      { gradient: ['#7c3aed', '#f29900'], label: 'Tile mode' },
    ],
    reviews: makeReviews('pixel-painter-pro', 4.7, 890),
    permissions: ['Filesystem read', 'Filesystem write'],
  },
  {
    id: '4', slug: 'orbot-relay', name: 'Orbot Relay', tagline: 'Tor-based network relay for privacy-conscious users.',
    description: 'Orbot Relay routes your traffic through the Tor network with a circuit-builder UI, exit node selection, and per-app routing rules. Built on the official tor binary with a modern, accessible frontend. No logs, no analytics, no account.',
    iconGradient: ['#5F6368', '#1F1F1F'], iconText: 'Or',
    developer: 'Tor Foundation', developerSlug: 'tor-foundation',
    category: 'security', tags: ['open-source', 'privacy', 'cross-platform'],
    platforms: ['windows', 'linux', 'ubuntu', 'android'],
    license: 'BSD-3-Clause', sourceUrl: 'https://github.com/tor-foundation/orbot-relay', homepageUrl: 'https://orbot.relay',
    status: 'published', featured: false,
    publishedAt: '2026-05-20T08:00:00Z', updatedAt: '2026-09-09T11:00:00Z',
    ratingAvg: 4.6, ratingCount: 421, downloads: 38_900, sizeBytes: 22_000_000,
    versions: makeVersions('orbot-relay', ['windows', 'linux', 'ubuntu', 'android'], '0.42'),
    screenshots: [
      { gradient: ['#5F6368', '#1F1F1F'], label: 'Circuit builder' },
      { gradient: ['#1F1F1F', '#5F6368'], label: 'Exit node map' },
      { gradient: ['#1a73e8', '#1F1F1F'], label: 'Per-app routing' },
    ],
    reviews: makeReviews('orbot-relay', 4.6, 421),
    permissions: ['VPN', 'Network', 'Foreground service'],
  },
  {
    id: '5', slug: 'kresge-mail', name: 'Kresge Mail', tagline: 'Lightweight IMAP/JMAP client with PGP built in.',
    description: 'Kresge Mail is a privacy-first email client with built-in PGP, server-side search (no download required), and a unified inbox that handles 5+ accounts without breaking a sweat. Built for keyboard-heavy users. No tracking, no telemetry, no "smart" features scanning your mail.',
    iconGradient: ['#d93025', '#f29900'], iconText: 'Kr',
    developer: 'Kresge', developerSlug: 'kresge',
    category: 'communication', tags: ['open-source', 'privacy', 'cross-platform'],
    platforms: ['windows', 'linux', 'ubuntu'],
    license: 'MPL-2.0', sourceUrl: 'https://github.com/kresge/mail', homepageUrl: 'https://kresge.email',
    status: 'published', featured: true,
    publishedAt: '2026-04-10T08:00:00Z', updatedAt: '2026-09-12T10:00:00Z',
    ratingAvg: 4.5, ratingCount: 678, downloads: 52_400, sizeBytes: 56_000_000,
    versions: makeVersions('kresge-mail', ['windows', 'linux', 'ubuntu'], '0.9'),
    screenshots: [
      { gradient: ['#d93025', '#f29900'], label: 'Unified inbox' },
      { gradient: ['#f29900', '#d93025'], label: 'PGP setup' },
      { gradient: ['#1a73e8', '#d93025'], label: 'Server-side search' },
    ],
    reviews: makeReviews('kresge-mail', 4.5, 678),
    permissions: ['Network', 'Filesystem write', 'Notifications'],
  },
  {
    id: '6', slug: 'codex-terminal', name: 'Codex Terminal', tagline: 'GPU-accelerated terminal with splits, tabs, and SSH.',
    description: 'Codex Terminal is a fast, GPU-accelerated terminal emulator with splits, tabs, SSH connection manager, integrated SFTP, and a powerful scripting layer. Compatible with tmux configurations. Built in Rust with a custom text shaping engine that handles CJK, emoji, and ligatures correctly.',
    iconGradient: ['#1F1F1F', '#5F6368'], iconText: 'Co',
    developer: 'Codexware', developerSlug: 'codexware',
    category: 'dev-tools', tags: ['open-source', 'cross-platform', 'lightweight'],
    platforms: ['windows', 'linux', 'ubuntu'],
    license: 'Apache-2.0', sourceUrl: 'https://github.com/codexware/terminal', homepageUrl: 'https://codex.term',
    status: 'published', featured: true,
    publishedAt: '2026-03-15T08:00:00Z', updatedAt: '2026-09-13T18:00:00Z',
    ratingAvg: 4.9, ratingCount: 2104, downloads: 312_000, sizeBytes: 28_000_000,
    versions: makeVersions('codex-terminal', ['windows', 'linux', 'ubuntu'], '4.2'),
    screenshots: [
      { gradient: ['#1F1F1F', '#5F6368'], label: 'Splits + tabs' },
      { gradient: ['#5F6368', '#1F1F1F'], label: 'SSH manager' },
      { gradient: ['#1a73e8', '#1F1F1F'], label: 'Themes' },
    ],
    reviews: makeReviews('codex-terminal', 4.9, 2104),
    permissions: ['Filesystem read', 'Network', 'PTY'],
  },
  {
    id: '7', slug: 'fermi-media', name: 'Fermi Media', tagline: 'FFmpeg-powered transcoder with a friendly UI.',
    description: 'Fermi Media wraps FFmpeg in a clean, accessible UI with batch processing, preset manager, hardware acceleration detection (NVENC, QSV, VAAPI), and a queue that survives crashes. Supports every codec FFmpeg knows about, plus ProRes, AV1, and H.265 exports.',
    iconGradient: ['#7c3aed', '#1a73e8'], iconText: 'Fe',
    developer: 'Fermi Codec Group', developerSlug: 'fermi-codec-group',
    category: 'media', tags: ['open-source', 'cross-platform', 'offline'],
    platforms: ['windows', 'linux', 'ubuntu'],
    license: 'GPL-3.0', sourceUrl: 'https://github.com/fermi/media', homepageUrl: 'https://fermi.media',
    status: 'published', featured: false,
    publishedAt: '2026-02-28T08:00:00Z', updatedAt: '2026-09-05T09:00:00Z',
    ratingAvg: 4.6, ratingCount: 540, downloads: 71_000, sizeBytes: 88_000_000,
    versions: makeVersions('fermi-media', ['windows', 'linux', 'ubuntu'], '2.0'),
    screenshots: [
      { gradient: ['#7c3aed', '#1a73e8'], label: 'Batch queue' },
      { gradient: ['#1a73e8', '#7c3aed'], label: 'Preset manager' },
      { gradient: ['#d93025', '#7c3aed'], label: 'Hardware accel' },
    ],
    reviews: makeReviews('fermi-media', 4.6, 540),
    permissions: ['Filesystem read', 'Filesystem write', 'GPU'],
  },
  {
    id: '8', slug: 'atlas-file-cabinet', name: 'Atlas File Cabinet', tagline: 'Dual-pane file manager with cloud mounts.',
    description: 'Atlas is a dual-pane file manager with tabs, batch rename, checksum tools, integrated archive support (7z, zip, tar, rar, zst), and cloud mounting for S3, GCS, Backblaze, and WebDAV. Plugin system supports Lua scripting. Fast — handles million-file directories without breaking a sweat.',
    iconGradient: ['#0078D4', '#1a73e8'], iconText: 'At',
    developer: 'Atlasware', developerSlug: 'atlasware',
    category: 'utilities', tags: ['open-source', 'cross-platform', 'lightweight'],
    platforms: ['windows', 'linux', 'ubuntu'],
    license: 'MIT', sourceUrl: 'https://github.com/atlasware/cabinet', homepageUrl: 'https://atlas.files',
    status: 'published', featured: false,
    publishedAt: '2026-01-22T08:00:00Z', updatedAt: '2026-09-07T14:00:00Z',
    ratingAvg: 4.7, ratingCount: 980, downloads: 145_000, sizeBytes: 24_000_000,
    versions: makeVersions('atlas-file-cabinet', ['windows', 'linux', 'ubuntu'], '3.5'),
    screenshots: [
      { gradient: ['#0078D4', '#1a73e8'], label: 'Dual-pane' },
      { gradient: ['#1a73e8', '#0078D4'], label: 'Cloud mounts' },
      { gradient: ['#5F6368', '#0078D4'], label: 'Batch rename' },
    ],
    reviews: makeReviews('atlas-file-cabinet', 4.7, 980),
    permissions: ['Filesystem read', 'Filesystem write', 'Network (cloud mounts)'],
  },
  {
    id: '9', slug: 'sentry-pass', name: 'Sentry Pass', tagline: 'Self-hosted password manager with hardware keys.',
    description: 'Sentry Pass is a Bitwarden-compatible, self-hosted password manager with native clients for every desktop and mobile platform. Supports WebAuthn, YubiKey, FIDO2, and TOTP. Local vault encryption with Argon2id. Browser auto-fill works on Chromium, Firefox, and Safari.',
    iconGradient: ['#d93025', '#1F1F1F'], iconText: 'Se',
    developer: 'Sentry Collective', developerSlug: 'sentry-collective',
    category: 'security', tags: ['open-source', 'privacy', 'cross-platform'],
    platforms: ['windows', 'linux', 'ubuntu', 'android', 'chrome'],
    license: 'GPL-3.0', sourceUrl: 'https://github.com/sentry/pass', homepageUrl: 'https://sentry.pass',
    status: 'published', featured: true,
    publishedAt: '2026-08-01T08:00:00Z', updatedAt: '2026-09-14T08:00:00Z',
    ratingAvg: 4.8, ratingCount: 1789, downloads: 263_000, sizeBytes: 31_000_000,
    versions: makeVersions('sentry-pass', ['windows', 'linux', 'ubuntu', 'android', 'chrome'], '2026.4'),
    screenshots: [
      { gradient: ['#d93025', '#1F1F1F'], label: 'Vault' },
      { gradient: ['#1F1F1F', '#d93025'], label: 'Hardware key setup' },
      { gradient: ['#1a73e8', '#d93025'], label: 'Browser autofill' },
    ],
    reviews: makeReviews('sentry-pass', 4.8, 1789),
    permissions: ['Biometric', 'Keystore', 'Browser autofill', 'Clipboard (10s)'],
  },
  {
    id: '10', slug: 'tab-rover', name: 'Tab Rover', tagline: 'Session manager + tab suspender for Chrome.',
    description: 'Tab Rover is a Chrome extension that saves, restores, and syncs browser sessions. Includes a tab suspender that frees memory without losing your place, a session sidebar, and one-click export to JSON. Privacy-first — no account required, sync uses your existing Chrome Sync.',
    iconGradient: ['#4285F4', '#3DDC84'], iconText: 'Tr',
    developer: 'Tab Rover', developerSlug: 'tab-rover',
    category: 'utilities', tags: ['open-source', 'privacy', 'lightweight'],
    platforms: ['chrome'],
    license: 'MIT', sourceUrl: 'https://github.com/tab-rover/ext', homepageUrl: 'https://tabrover.ext',
    status: 'published', featured: false,
    publishedAt: '2026-07-22T08:00:00Z', updatedAt: '2026-09-12T10:00:00Z',
    ratingAvg: 4.5, ratingCount: 612, downloads: 88_000, sizeBytes: 850_000,
    versions: makeVersions('tab-rover', ['chrome'], '2.3'),
    screenshots: [
      { gradient: ['#4285F4', '#3DDC84'], label: 'Session sidebar' },
      { gradient: ['#3DDC84', '#4285F4'], label: 'Tab suspender' },
      { gradient: ['#1a73e8', '#4285F4'], label: 'Export to JSON' },
    ],
    reviews: makeReviews('tab-rover', 4.5, 612),
    permissions: ['tabs', 'storage', 'contextMenus'],
  },
  {
    id: '11', slug: 'lumen-reader', name: 'Lumen Reader', tagline: 'RSS, Atom, and YouTube subscriptions in one place.',
    description: 'Lumen Reader aggregates RSS, Atom, JSON Feed, and YouTube channel updates into a single, fast reader. OPML import/export, full-text search across subscriptions, read-it-later queue, dark mode, and a privacy-first design that never proxies your feeds through our servers.',
    iconGradient: ['#f29900', '#0b8f6a'], iconText: 'Lu',
    developer: 'Lumenware', developerSlug: 'lumenware',
    category: 'productivity', tags: ['open-source', 'privacy', 'cross-platform', 'offline'],
    platforms: ['windows', 'linux', 'ubuntu', 'android'],
    license: 'AGPL-3.0', sourceUrl: 'https://github.com/lumenware/reader', homepageUrl: 'https://lumen.read',
    status: 'published', featured: false,
    publishedAt: '2026-06-08T08:00:00Z', updatedAt: '2026-09-06T12:00:00Z',
    ratingAvg: 4.7, ratingCount: 742, downloads: 91_000, sizeBytes: 19_000_000,
    versions: makeVersions('lumen-reader', ['windows', 'linux', 'ubuntu', 'android'], '1.5'),
    screenshots: [
      { gradient: ['#f29900', '#0b8f6a'], label: 'Feed list' },
      { gradient: ['#0b8f6a', '#f29900'], label: 'Article view' },
      { gradient: ['#1a73e8', '#0b8f6a'], label: 'OPML import' },
    ],
    reviews: makeReviews('lumen-reader', 4.7, 742),
    permissions: ['Network', 'Notifications', 'Background sync'],
  },
  {
    id: '12', slug: 'cipher-chat', name: 'Cipher Chat', tagline: 'Matrix client with E2EE, spaces, and threads.',
    description: 'Cipher Chat is a Matrix client built for power users. Spaces, threads, message scheduling, custom emoji packs, and a full keyboard-driven UI. End-to-end encryption by default, with verified-device management and cross-signing. Bridges to IRC, Slack, Discord, and Telegram.',
    iconGradient: ['#3DDC84', '#1a73e8'], iconText: 'Ci',
    developer: 'Cipher Labs', developerSlug: 'cipher-labs',
    category: 'communication', tags: ['open-source', 'privacy', 'cross-platform'],
    platforms: ['windows', 'linux', 'ubuntu', 'android'],
    license: 'AGPL-3.0', sourceUrl: 'https://github.com/cipher-labs/chat', homepageUrl: 'https://cipher.chat',
    status: 'published', featured: false,
    publishedAt: '2026-05-12T08:00:00Z', updatedAt: '2026-09-03T15:00:00Z',
    ratingAvg: 4.6, ratingCount: 530, downloads: 47_000, sizeBytes: 45_000_000,
    versions: makeVersions('cipher-chat', ['windows', 'linux', 'ubuntu', 'android'], '0.11'),
    screenshots: [
      { gradient: ['#3DDC84', '#1a73e8'], label: 'Spaces' },
      { gradient: ['#1a73e8', '#3DDC84'], label: 'E2EE settings' },
      { gradient: ['#7c3aed', '#3DDC84'], label: 'Bridges' },
    ],
    reviews: makeReviews('cipher-chat', 4.6, 530),
    permissions: ['Network', 'Notifications', 'Filesystem write', 'Microphone (calls)'],
  },
  {
    id: '13', slug: 'vault-mirror', name: 'Vault Mirror', tagline: 'Restic-compatible encrypted backup client.',
    description: 'Vault Mirror is a backup client compatible with the Restic repository format. Incremental, encrypted, deduplicated backups to S3, B2, R2, SFTP, or local disk. Built-in restore-test scheduler that verifies your backups recover, not just store. Snapshot browser with file-level restore.',
    iconGradient: ['#5F6368', '#0b8f6a'], iconText: 'Vm',
    developer: 'Vaultware', developerSlug: 'vaultware',
    category: 'utilities', tags: ['open-source', 'cross-platform', 'privacy'],
    platforms: ['windows', 'linux', 'ubuntu'],
    license: 'Apache-2.0', sourceUrl: 'https://github.com/vaultware/mirror', homepageUrl: 'https://vault.mirror',
    status: 'published', featured: false,
    publishedAt: '2026-04-22T08:00:00Z', updatedAt: '2026-09-02T10:00:00Z',
    ratingAvg: 4.5, ratingCount: 410, downloads: 33_000, sizeBytes: 36_000_000,
    versions: makeVersions('vault-mirror', ['windows', 'linux', 'ubuntu'], '1.2'),
    screenshots: [
      { gradient: ['#5F6368', '#0b8f6a'], label: 'Backup jobs' },
      { gradient: ['#0b8f6a', '#5F6368'], label: 'Snapshot browser' },
      { gradient: ['#1a73e8', '#5F6368'], label: 'Restore test' },
    ],
    reviews: makeReviews('vault-mirror', 4.5, 410),
    permissions: ['Filesystem read', 'Filesystem write', 'Network', 'Scheduler'],
  },
  {
    id: '14', slug: 'serif-scribe', name: 'Serif Scribe', tagline: 'Word processor with PDF, EPUB, and LaTeX export.',
    description: 'Serif Scribe is a free word processor with PDF, EPUB, and LaTeX export, focus mode, tracked changes, comments, BibTeX integration, and an open document format. Built for writers who want a serious desktop tool, not a subscription. Templates for novel, thesis, screenplay, and technical report.',
    iconGradient: ['#7c3aed', '#d93025'], iconText: 'Ss',
    developer: 'Serif Software', developerSlug: 'serif-software',
    category: 'productivity', tags: ['open-source', 'offline', 'cross-platform'],
    platforms: ['windows', 'linux', 'ubuntu'],
    license: 'LGPL-2.1', sourceUrl: 'https://github.com/serif-software/scribe', homepageUrl: 'https://serif.scribe',
    status: 'published', featured: false,
    publishedAt: '2026-03-30T08:00:00Z', updatedAt: '2026-08-28T09:00:00Z',
    ratingAvg: 4.4, ratingCount: 320, downloads: 24_500, sizeBytes: 72_000_000,
    versions: makeVersions('serif-scribe', ['windows', 'linux', 'ubuntu'], '0.7'),
    screenshots: [
      { gradient: ['#7c3aed', '#d93025'], label: 'Editor' },
      { gradient: ['#d93025', '#7c3aed'], label: 'Tracked changes' },
      { gradient: ['#1a73e8', '#7c3aed'], label: 'Export dialog' },
    ],
    reviews: makeReviews('serif-scribe', 4.4, 320),
    permissions: ['Filesystem read', 'Filesystem write'],
  },
  {
    id: '15', slug: 'glimpse-capture', name: 'Glimpse Capture', tagline: 'Screenshot + screen recording with annotations.',
    description: 'Glimpse Capture is a screenshot and screen recording tool with built-in annotations, OCR text extraction, scrolling capture, GIF/WebM recording, and a Cloudflare R2 sync option. Cross-platform, no account required, no telemetry. OCR runs locally with Tesseract.',
    iconGradient: ['#f29900', '#1a73e8'], iconText: 'Gl',
    developer: 'Glimpse', developerSlug: 'glimpse',
    category: 'utilities', tags: ['open-source', 'cross-platform', 'offline'],
    platforms: ['windows', 'linux', 'ubuntu'],
    license: 'MIT', sourceUrl: 'https://github.com/glimpse/capture', homepageUrl: 'https://glimpse.cap',
    status: 'published', featured: false,
    publishedAt: '2026-02-18T08:00:00Z', updatedAt: '2026-08-22T09:00:00Z',
    ratingAvg: 4.8, ratingCount: 870, downloads: 156_000, sizeBytes: 26_000_000,
    versions: makeVersions('glimpse-capture', ['windows', 'linux', 'ubuntu'], '2.7'),
    screenshots: [
      { gradient: ['#f29900', '#1a73e8'], label: 'Annotation tools' },
      { gradient: ['#1a73e8', '#f29900'], label: 'OCR result' },
      { gradient: ['#7c3aed', '#f29900'], label: 'Recording' },
    ],
    reviews: makeReviews('glimpse-capture', 4.8, 870),
    permissions: ['Screen capture', 'Filesystem write', 'Notifications'],
  },
  {
    id: '16', slug: 'pulse-monitor', name: 'Pulse Monitor', tagline: 'System stats: CPU, GPU, RAM, network in your menu bar.',
    description: 'Pulse Monitor is a system stats tool that lives in your menu bar / system tray. Real-time CPU, GPU, RAM, disk, and network graphs. Per-process resource drilldown. Alerting on temperature and load. Cross-platform, plugin system supports custom sensors via Lua.',
    iconGradient: ['#1a73e8', '#0b8f6a'], iconText: 'Pu',
    developer: 'Pulseware', developerSlug: 'pulseware',
    category: 'utilities', tags: ['open-source', 'lightweight', 'cross-platform'],
    platforms: ['windows', 'linux', 'ubuntu'],
    license: 'MIT', sourceUrl: 'https://github.com/pulseware/monitor', homepageUrl: 'https://pulse.mon',
    status: 'published', featured: false,
    publishedAt: '2026-01-15T08:00:00Z', updatedAt: '2026-08-30T10:00:00Z',
    ratingAvg: 4.6, ratingCount: 645, downloads: 73_000, sizeBytes: 14_000_000,
    versions: makeVersions('pulse-monitor', ['windows', 'linux', 'ubuntu'], '1.9'),
    screenshots: [
      { gradient: ['#1a73e8', '#0b8f6a'], label: 'Menu bar graph' },
      { gradient: ['#0b8f6a', '#1a73e8'], label: 'Per-process view' },
      { gradient: ['#f29900', '#1a73e8'], label: 'Alerts' },
    ],
    reviews: makeReviews('pulse-monitor', 4.6, 645),
    permissions: ['System info', 'Notifications'],
  },
  {
    id: '17', slug: 'nova-launcher-lite', name: 'Nova Launcher Lite', tagline: 'Lightweight Android home screen replacement.',
    description: 'Nova Launcher Lite is a free, open-source home screen replacement for Android. Gesture navigation, icon pack support, custom grid sizes, scrollable dock, and a search pill that opens any app, contact, or setting. No ads, no analytics, no telemetry. APK is signed by the operator and SHA-256 verified.',
    iconGradient: ['#3DDC84', '#1a73e8'], iconText: 'Nv',
    developer: 'Nova Lite', developerSlug: 'nova-lite',
    category: 'utilities', tags: ['open-source', 'lightweight', 'privacy'],
    platforms: ['android'],
    license: 'Apache-2.0', sourceUrl: 'https://github.com/nova-lite/launcher', homepageUrl: 'https://nova.lite',
    status: 'published', featured: false,
    publishedAt: '2026-07-15T08:00:00Z', updatedAt: '2026-09-01T08:00:00Z',
    ratingAvg: 4.7, ratingCount: 1430, downloads: 198_000, sizeBytes: 8_500_000,
    versions: makeVersions('nova-launcher-lite', ['android'], '8.0'),
    screenshots: [
      { gradient: ['#3DDC84', '#1a73e8'], label: 'Home screen' },
      { gradient: ['#1a73e8', '#3DDC84'], label: 'Drawer' },
      { gradient: ['#7c3aed', '#3DDC84'], label: 'Settings' },
    ],
    reviews: makeReviews('nova-launcher-lite', 4.7, 1430),
    permissions: ['Home', 'Apps list', 'Wallpaper', 'Notifications'],
  },
  {
    id: '18', slug: 'stellarium-mobile', name: 'Stellarium Mobile', tagline: 'Open-source planetarium for sky observation.',
    description: 'Stellarium Mobile is a free, open-source planetarium for your phone. Realistic real-time 3D sky, with 600k+ stars, asterisms, constellation art, planets, and deep-sky objects. Point your phone at the sky and identify what you see using GPS + compass. No account, no ads, no in-app purchases.',
    iconGradient: ['#1F1F1F', '#1a73e8'], iconText: 'St',
    developer: 'Stellarium Project', developerSlug: 'stellarium-project',
    category: 'media', tags: ['open-source', 'offline', 'privacy'],
    platforms: ['android', 'windows', 'linux', 'ubuntu'],
    license: 'GPL-2.0', sourceUrl: 'https://github.com/stellarium/mobile', homepageUrl: 'https://stellarium.mob',
    status: 'published', featured: false,
    publishedAt: '2026-06-01T08:00:00Z', updatedAt: '2026-08-25T08:00:00Z',
    ratingAvg: 4.8, ratingCount: 2310, downloads: 287_000, sizeBytes: 64_000_000,
    versions: makeVersions('stellarium-mobile', ['android', 'windows', 'linux', 'ubuntu'], '1.3'),
    screenshots: [
      { gradient: ['#1F1F1F', '#1a73e8'], label: 'Sky view' },
      { gradient: ['#1a73e8', '#1F1F1F'], label: 'Constellation art' },
      { gradient: ['#7c3aed', '#1F1F1F'], label: 'Object info' },
    ],
    reviews: makeReviews('stellarium-mobile', 4.8, 2310),
    permissions: ['Location (compass)', 'Sensors', 'Filesystem read'],
  },
  {
    id: '19', slug: 'meridian-pdf', name: 'Meridian PDF', tagline: 'Fast PDF reader with annotations and form fill.',
    description: 'Meridian PDF is a fast, lightweight PDF reader with annotation, form filling, page reordering, and PDF/A export. Optimized for big files — opens 1GB+ PDFs instantly via mmap. Tabbed reading, split view, and dark mode that doesn\'t break colored figures.',
    iconGradient: ['#d93025', '#f29900'], iconText: 'Me',
    developer: 'Meridianware', developerSlug: 'meridianware',
    category: 'productivity', tags: ['open-source', 'lightweight', 'cross-platform'],
    platforms: ['windows', 'linux', 'ubuntu', 'android'],
    license: 'AGPL-3.0', sourceUrl: 'https://github.com/meridianware/pdf', homepageUrl: 'https://meridian.pdf',
    status: 'published', featured: false,
    publishedAt: '2026-05-05T08:00:00Z', updatedAt: '2026-08-20T08:00:00Z',
    ratingAvg: 4.6, ratingCount: 980, downloads: 124_000, sizeBytes: 32_000_000,
    versions: makeVersions('meridian-pdf', ['windows', 'linux', 'ubuntu', 'android'], '3.0'),
    screenshots: [
      { gradient: ['#d93025', '#f29900'], label: 'Tabbed reading' },
      { gradient: ['#f29900', '#d93025'], label: 'Annotations' },
      { gradient: ['#1a73e8', '#d93025'], label: 'Form fill' },
    ],
    reviews: makeReviews('meridian-pdf', 4.6, 980),
    permissions: ['Filesystem read', 'Filesystem write', 'Printer'],
  },
  {
    id: '20', slug: 'pixel-blocker', name: 'Pixel Blocker', tagline: 'uBlock Origin-compatible ad blocker with custom lists.',
    description: 'Pixel Blocker is a Chrome extension that uses the uBlock Origin engine to block ads, trackers, malvertising, and coin miners. Supports custom filter lists, per-site toggle, element zapper, and a network request log. Privacy-first — no analytics, no "acceptable ads" deals, no telemetry.',
    iconGradient: ['#4285F4', '#d93025'], iconText: 'Px',
    developer: 'Pixelware', developerSlug: 'pixelware',
    category: 'security', tags: ['open-source', 'privacy', 'lightweight'],
    platforms: ['chrome'],
    license: 'GPL-3.0', sourceUrl: 'https://github.com/pixelware/blocker', homepageUrl: 'https://pixel.block',
    status: 'published', featured: true,
    publishedAt: '2026-08-22T08:00:00Z', updatedAt: '2026-09-13T08:00:00Z',
    ratingAvg: 4.9, ratingCount: 4120, downloads: 542_000, sizeBytes: 4_500_000,
    versions: makeVersions('pixel-blocker', ['chrome'], '1.55'),
    screenshots: [
      { gradient: ['#4285F4', '#d93025'], label: 'Popup' },
      { gradient: ['#d93025', '#4285F4'], label: 'Element zapper' },
      { gradient: ['#1a73e8', '#4285F4'], label: 'Network log' },
    ],
    reviews: makeReviews('pixel-blocker', 4.9, 4120),
    permissions: ['storage', 'tabs', 'webRequest', ' declarativeContent', 'alarms'],
  },
]

export type Report = {
  id: string
  type: 'app' | 'review' | 'user'
  target: string
  reporter: string
  reason: string
  description: string
  status: 'open' | 'resolved' | 'dismissed'
  createdAt: string
}

export const reports: Report[] = [
  { id: 'r1', type: 'app', target: 'Aegis Vault', reporter: 'u_3182', reason: 'Wrong metadata', description: 'SHA-256 listed on detail page does not match the one on the GitHub releases page.', status: 'open', createdAt: '2026-09-14T08:15:00Z' },
  { id: 'r2', type: 'review', target: 'Codex Terminal', reporter: 'u_4291', reason: 'Spam', description: 'Review contains promotional link unrelated to the app.', status: 'open', createdAt: '2026-09-13T19:42:00Z' },
  { id: 'r3', type: 'app', target: 'Orbot Relay', reporter: 'u_8821', reason: 'Broken download', description: '.deb link returns 404 since this morning.', status: 'open', createdAt: '2026-09-13T11:08:00Z' },
  { id: 'r4', type: 'user', target: 'u_9821', reporter: 'u_4402', reason: 'Harassment', description: 'Multiple hostile reviews targeting developer across 3 apps.', status: 'open', createdAt: '2026-09-12T22:30:00Z' },
  { id: 'r5', type: 'app', target: 'Tab Rover', reporter: 'u_5510', reason: 'Copyright', description: 'Icon resembles a trademarked design owned by submitter.', status: 'resolved', createdAt: '2026-09-10T14:22:00Z' },
]

export type AuditLog = {
  id: string
  actor: string
  action: string
  entityType: string
  entityId: string
  ip: string
  timestamp: string
}

export const auditLogs: AuditLog[] = [
  { id: 'a1', actor: 'admin@fp2s', action: 'publish', entityType: 'app', entityId: 'pixel-blocker', ip: '203.0.113.42', timestamp: '2026-09-13T18:04:00Z' },
  { id: 'a2', actor: 'admin@fp2s', action: 'upload', entityType: 'file', entityId: 'aegis-vault-3.1-android.apk', ip: '203.0.113.42', timestamp: '2026-09-13T11:22:00Z' },
  { id: 'a3', actor: 'mod@fp2s', action: 'hide_review', entityType: 'review', entityId: 'r_codex_8842', ip: '203.0.113.51', timestamp: '2026-09-12T22:51:00Z' },
  { id: 'a4', actor: 'admin@fp2s', action: 'update', entityType: 'app', entityId: 'codex-terminal', ip: '203.0.113.42', timestamp: '2026-09-12T16:18:00Z' },
  { id: 'a5', actor: 'admin@fp2s', action: 'create', entityType: 'app', entityId: 'meridian-pdf', ip: '203.0.113.42', timestamp: '2026-09-11T09:30:00Z' },
]

export type DownloadEvent = { date: string; count: number }

export function downloadsTimeseries(days = 30): DownloadEvent[] {
  const out: DownloadEvent[] = []
  const base = 4200
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const weekday = d.getDay()
    const weekendBoost = weekday === 0 || weekday === 6 ? 1.25 : 1.0
    const noise = 1 + Math.sin(i / 3) * 0.12 + Math.cos(i / 7) * 0.08
    out.push({
      date: d.toISOString().slice(0, 10),
      count: Math.round(base * weekendBoost * noise + Math.random() * 400),
    })
  }
  return out
}

export function formatDownloads(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(2)} GB`
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
  return `${bytes} B`
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = 60 * 1000, h = 60 * m, d = 24 * h, w = 7 * d, mo = 30 * d, y = 365 * d
  if (diff < m) return 'just now'
  if (diff < h) return `${Math.floor(diff / m)}m ago`
  if (diff < d) return `${Math.floor(diff / h)}h ago`
  if (diff < w) return `${Math.floor(diff / d)}d ago`
  if (diff < mo) return `${Math.floor(diff / w)}w ago`
  if (diff < y) return `${Math.floor(diff / mo)}mo ago`
  return `${Math.floor(diff / y)}y ago`
}

export function ratingHistogram(app: App): { stars: number; count: number; pct: number }[] {
  const total = app.ratingCount || 1
  const out: { stars: number; count: number; pct: number }[] = []
  // Synthesize a believable distribution centered around ratingAvg
  for (let s = 5; s >= 1; s--) {
    const dist = s === 5 ? 0.62 : s === 4 ? 0.21 : s === 3 ? 0.10 : s === 2 ? 0.04 : 0.03
    const count = Math.round(total * dist)
    out.push({ stars: s, count, pct: dist * 100 })
  }
  return out
}

// Stable demo user list for admin
export const adminUsers = [
  { id: 'u_3182', email: 'sam.l@gmail.com', name: 'Sam Liu', role: 'user', joinedAt: '2026-08-14T08:00:00Z', banned: false, reviews: 3, downloads: 14 },
  { id: 'u_4291', email: 'priya.k@gmail.com', name: 'Priya Krish', role: 'user', joinedAt: '2026-08-22T08:00:00Z', banned: false, reviews: 8, downloads: 42 },
  { id: 'u_4402', email: 'marco.t@gmail.com', name: 'Marco Toledo', role: 'uploader', joinedAt: '2026-07-01T08:00:00Z', banned: false, reviews: 12, downloads: 105 },
  { id: 'u_8821', email: 'lena.h@gmail.com', name: 'Lena Hartmann', role: 'user', joinedAt: '2026-09-01T08:00:00Z', banned: false, reviews: 1, downloads: 8 },
  { id: 'u_9821', email: 'spammer@example.com', name: 'Anonymous Troll', role: 'user', joinedAt: '2026-09-12T22:00:00Z', banned: true, reviews: 23, downloads: 0 },
  { id: 'u_5510', email: 'mei.z@gmail.com', name: 'Mei Zhou', role: 'moderator', joinedAt: '2026-06-14T08:00:00Z', banned: false, reviews: 0, downloads: 27 },
]
