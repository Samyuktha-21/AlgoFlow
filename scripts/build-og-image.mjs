/*
 * Rasterizes public/og-default.svg to public/og-default.png at 1200x630.
 *
 * Facebook, LinkedIn and Slack do not render SVG Open Graph cards — they need
 * a raster image — so the PNG is the one referenced by og:image and the SVG is
 * kept as the editable source.
 *
 * Requires a local Chrome plus playwright-core, neither of which is a project
 * dependency. This is a one-off asset build, not part of `npm run build`:
 *   npm i --no-save playwright-core
 *   node scripts/build-og-image.mjs
 * Re-run it only after editing the SVG, and commit the regenerated PNG.
 */
import { chromium } from 'playwright-core'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'public', 'og-default.svg'), 'utf8')

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.setContent(
  `<!doctype html><style>html,body{margin:0;padding:0;background:#0b0f1a}svg{display:block}</style>${svg}`,
  { waitUntil: 'load' },
)
await page.waitForTimeout(300)   // let webfonts settle before the capture
const out = join(root, 'public', 'og-default.png')
await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1200, height: 630 } })
await browser.close()
console.log(`wrote ${out}`)
