/* Print everything needed to hand-author a per-language `lineMap`, compactly.

   For each algorithm it runs the real generateSteps (same inputs the Algorithm
   page uses) to learn which JAVA lines the visualization actually references,
   then prints those Java lines plus every target-language source numbered.
   That is exactly the information required to decide "Java line N ⇒ this
   language's line M", and nothing else.

   Usage:
     node scripts/linemap-worksheet.cjs fundamentals          → whole category
     node scripts/linemap-worksheet.cjs sorting/bubbleSort    → one algorithm
     node scripts/linemap-worksheet.cjs --refs fundamentals   → ref lines only
*/
const fs = require('fs')
const path = require('path')
const { pathToFileURL } = require('url')

const TARGET_LANGS = ['c', 'cpp', 'python', 'javascript']
const ROOT = 'src/algorithms'

let appMods = null
async function loadApp() {
  if (appMods) return appMods
  const imp = (rel) => import(pathToFileURL(path.resolve(rel)).href)
  const [di, va] = await Promise.all([imp('src/game/defaultInput.js'), imp('src/utils/validators.js')])
  appMods = { getDefaultInput: di.getDefaultInput, ...va }
  return appMods
}

async function argsFor(meta) {
  const { getDefaultInput, parseArrayInput, parseSearchInput, parseGraphInput } = await loadApp()
  const type = meta?.type || 'sorting'
  const inputType = meta?.inputType
  const def = getDefaultInput(type, inputType)
  if (type === 'searching') {
    const p = parseSearchInput(def.input, def.target)
    return p.error ? null : [p.array, p.target]
  }
  if (type === 'graph') {
    const p = parseGraphInput(def.input)
    return p.error ? [null, null, 0] : [p.nodes, p.edges, 0]
  }
  if (inputType === 'stringPair') {
    const [a, ...rest] = def.input.split(',')
    return [a.trim().toUpperCase(), rest.join(',').trim().toUpperCase()]
  }
  if (inputType === 'singleString') return [def.input.trim()]
  const p = parseArrayInput(def.input)
  return p.error ? null : [p.array]
}

/* Referenced Java lines, in first-seen order, plus a sample step label so the
   intent of each line is visible when the code alone is ambiguous. */
async function referencedLines(dir) {
  const stepsPath = path.join(dir, 'steps.js')
  if (!fs.existsSync(stepsPath)) return { refs: [], err: 'no steps.js' }
  let gen
  try { gen = (await import(pathToFileURL(path.resolve(stepsPath)).href)).generateSteps }
  catch (e) { return { refs: [], err: 'import failed: ' + e.message } }
  if (typeof gen !== 'function') return { refs: [], err: 'no generateSteps export' }
  let meta = {}
  try { meta = JSON.parse(fs.readFileSync(path.join(dir, 'metadata.json'), 'utf8')) } catch { /* none */ }
  try {
    const a = await argsFor(meta)
    if (!a) return { refs: [], err: 'could not build inputs' }
    const steps = gen(...a)
    if (!Array.isArray(steps)) return { refs: [], err: 'generateSteps returned non-array' }
    const seen = new Map()
    for (const s of steps) {
      if (typeof s?.codeLine !== 'number') continue
      if (!seen.has(s.codeLine)) seen.set(s.codeLine, s.description || s.explanation || s.action || '')
    }
    return { refs: [...seen.entries()].sort((x, y) => x[0] - y[0]), err: null, steps: steps.length }
  } catch (e) { return { refs: [], err: 'threw: ' + e.message } }
}

function numbered(code, indent = '  ') {
  return code.split('\n').map((l, i) => `${indent}${String(i + 1).padStart(3)}| ${l}`).join('\n')
}

;(async () => {
  const args = process.argv.slice(2)
  const REFS_ONLY = args.includes('--refs')
  const targets = args.filter(a => !a.startsWith('--'))

  const list = []
  for (const t of targets) {
    if (t.includes('/')) {
      const [cat, algo] = t.split('/')
      list.push({ cat, algo, dir: path.join(ROOT, cat, algo) })
    } else {
      const d = path.join(ROOT, t)
      if (!fs.existsSync(d)) continue
      for (const e of fs.readdirSync(d, { withFileTypes: true }))
        if (e.isDirectory() && fs.existsSync(path.join(d, e.name, 'code.json')))
          list.push({ cat: t, algo: e.name, dir: path.join(d, e.name) })
    }
  }

  for (const f of list) {
    const p = path.join(f.dir, 'code.json')
    if (!fs.existsSync(p)) continue
    const j = JSON.parse(fs.readFileSync(p, 'utf8'))
    const { refs, err, steps } = await referencedLines(f.dir)

    console.log(`\n${'='.repeat(78)}`)
    console.log(`### ${f.cat}/${f.algo}   steps=${steps ?? '?'}  refs=[${refs.map(r => r[0]).join(',')}]${err ? '  ERR: ' + err : ''}`)
    if (!refs.length) { console.log('  (no codeLine references — nothing to map)'); continue }

    const jaLines = (j.java?.code || '').split('\n')
    const descOf = new Map(refs)
    console.log(`--- java (canonical, ${jaLines.length} lines) — ">" marks a referenced line`)
    for (let i = 0; i < jaLines.length; i++) {
      const ln = i + 1
      const hit = descOf.has(ln)
      if (REFS_ONLY && !hit) continue
      const d = hit ? String(descOf.get(ln) || '').slice(0, 55) : ''
      console.log(`${hit ? '>' : ' '} ${String(ln).padStart(3)}| ${jaLines[i]}${d ? '   // ' + d : ''}`)
    }
    for (const [ln] of refs) if (jaLines[ln - 1] === undefined) console.log(`  !! ref ${ln} OUT OF RANGE`)
    if (REFS_ONLY) continue

    for (const lang of TARGET_LANGS) {
      if (!j[lang]?.code) { console.log(`--- ${lang}: MISSING`); continue }
      const n = j[lang].code.split('\n').length
      console.log(`--- ${lang} (${n} lines)`)
      console.log(numbered(j[lang].code))
    }
  }
})()
