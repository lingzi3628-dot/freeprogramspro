// Generate PNG icons at multiple sizes from the SVG monogram.
// Run: bun run scripts/gen-icons.ts

import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'

const OUT = '/home/z/my-project/public'

// Brand SVG: FP monogram in a squircle with the brand gradient
const svg = (size: number, maskable = false) => {
  const radius = maskable ? size * 0.5 : size * 0.22
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a73e8"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>
  <text x="50%" y="50%" font-family="Inter, system-ui, sans-serif" font-size="${size * 0.5}" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="central" letter-spacing="${-size * 0.024}">FP</text>
</svg>`
}

async function gen(size: number, name: string, maskable = false) {
  const buf = Buffer.from(svg(size, maskable))
  await sharp(buf).png().toFile(`${OUT}/${name}`)
  console.log(`✓ ${name} (${size}×${size})`)
}

async function main() {
  if (!existsSync(OUT)) await mkdir(OUT, { recursive: true })
  await gen(16, 'favicon-16.png')
  await gen(32, 'favicon-32.png')
  await gen(180, 'apple-touch-icon.png')
  await gen(192, 'icon-192.png')
  await gen(512, 'icon-512.png')
  await gen(512, 'icon-maskable-512.png', true)
  // Also create a 32×32 favicon.ico (just PNG — most browsers accept PNG favicon)
  await sharp(Buffer.from(svg(32))).png().toFile(`${OUT}/favicon.ico`)
  console.log('✓ favicon.ico (32×32 PNG)')
}

main().catch((e) => { console.error(e); process.exit(1) })
