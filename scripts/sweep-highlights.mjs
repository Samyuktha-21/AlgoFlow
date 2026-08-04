/* Sweep every mapped algorithm and report steps whose Python highlight does
   not resolve.

   apply-code-data.cjs only proves the map covers the ONE run it makes with
   the default input. Branches that run only on other inputs (a graph that
   queues a node twice, a maze with no exit) can still emit a codeLine that
   the map never mentions, and the user would see the Java highlight move
   while Python sits still. This walks a second, argument-free run of every
   generator to shake those out.

   Usage: node scripts/sweep-highlights.mjs */
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import { createRequire } from 'module'

const ROOT = 'src/algorithms'
const DATA = 'scripts/data'
const require = createRequire(import.meta.url)

/* Deliberate omissions are authored as `null` in scripts/data/<cat>.cjs but
   stripped from code.json when applied, so code.json alone cannot tell
   "decided: no equivalent" from "never considered". Read the source of truth. */
function authoredNulls(cat, algo) {
  try {
    const spec = require(path.resolve(DATA, `${cat}.cjs`))[algo]
    const map = spec?.lineMap?.python || {}
    return new Set(Object.keys(map).filter(k => map[k] === null))
  } catch { return new Set() }
}
let checked = 0, unresolved = 0
const gaps = []

for (const cat of fs.readdirSync(ROOT)) {
  const cd = path.join(ROOT, cat)
  if (!fs.statSync(cd).isDirectory()) continue

  for (const algo of fs.readdirSync(cd)) {
    const codePath = path.join(cd, algo, 'code.json')
    const stepsPath = path.join(cd, algo, 'steps.js')
    if (!fs.existsSync(codePath) || !fs.existsSync(stepsPath)) continue

    const json = JSON.parse(fs.readFileSync(codePath, 'utf8'))
    if (!json.lineMap?.python) continue

    let generateSteps
    try { ({ generateSteps } = await import(pathToFileURL(path.resolve(stepsPath)).href)) } catch { continue }
    if (typeof generateSteps !== 'function') continue

    let steps = []
    try { steps = generateSteps() || [] } catch { continue }

    const pyMap = json.lineMap.python
    const omitted = authoredNulls(cat, algo)
    const missing = new Set()
    for (const s of steps) {
      if (typeof s?.codeLine !== 'number') continue
      checked++
      const key = String(s.codeLine)
      if (key in pyMap || omitted.has(key)) continue
      unresolved++
      missing.add(s.codeLine)
    }
    if (missing.size) gaps.push(`${cat}/${algo}  unmapped java line(s): ${[...missing].sort((a, b) => a - b).join(', ')}`)
  }
}

console.log(`${checked} highlighted steps checked, ${unresolved} with no Python line.`)
console.log(gaps.length ? gaps.join('\n') : '(no gaps)')
process.exitCode = gaps.length ? 1 : 0
