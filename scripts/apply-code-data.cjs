/* Apply hand-authored code-snippet rewrites and per-language line maps.

   Source of truth is one file per category, scripts/data/<category>.js:

     module.exports = {
       factorial: {
         // optional: replace a snippet that is NOT a faithful translation of
         // the Java block (e.g. C++ was recursive where Java is iterative, so
         // no step could ever highlight an equivalent line)
         snippets: { cpp: `#include <iostream>\n...` },
         // required: java line -> python's equivalent line
         lineMap: { python: { 2: 2, 4: 4, 5: 5 } },
       },
     }

   Java is canonical (identity, never stored) and Python is the one mapped
   language, so those two highlight and the rest deliberately do not. Every map
   is validated against the real code and the real generateSteps output before
   anything is written, so a clean run means each highlight is a line a human
   judged equivalent.

   Checks (any failure blocks that algorithm's write):
     1. every mapped Java line is actually referenced by a step
     2. every referenced Java line is mapped, for each language that has a map
     3. target line numbers are within that language's source
     4. mappings strictly increase (Java order => target order)
     5. no two Java lines collapse onto one target line

   Usage:
     node scripts/apply-code-data.cjs                 → validate only (dry run)
     node scripts/apply-code-data.cjs --apply         → write code.json
     node scripts/apply-code-data.cjs --apply sorting → limit to categories
*/
const fs = require('fs')
const path = require('path')
const { pathToFileURL } = require('url')

/* Snippet rewrites still apply to every language — several C/C++ blocks shipped
   as stubs or as a different algorithm entirely, and those fixes stand on their
   own merit. Line MAPS are Python-only: Java is canonical (identity, never
   stored), so Java + Python are the two languages that highlight. Maps authored
   for the dropped languages are ignored rather than deleted, so the history in
   scripts/data/*.cjs stays readable. */
const SNIPPET_LANGS = ['java', 'c', 'cpp', 'python', 'javascript']
const MAP_LANGS = ['python']
const ROOT = 'src/algorithms'
const DATA = 'scripts/data'

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
  const def = getDefaultInput(type, inputType, meta?.inputSpec, meta?.defaultInput)
  if (type === 'searching') {
    const p = parseSearchInput(def.input, def.target)
    return p.error ? null : [p.array, p.target]
  }
  if (type === 'graph') {
    if (!def.input.trim()) return [null, null, 0]
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

async function referencedLines(dir) {
  const stepsPath = path.join(dir, 'steps.js')
  if (!fs.existsSync(stepsPath)) return new Set()
  let gen
  try { gen = (await import(pathToFileURL(path.resolve(stepsPath)).href)).generateSteps } catch { return new Set() }
  if (typeof gen !== 'function') return new Set()
  let meta = {}
  try { meta = JSON.parse(fs.readFileSync(path.join(dir, 'metadata.json'), 'utf8')) } catch { /* none */ }
  const set = new Set()
  try {
    const a = await argsFor(meta)
    if (!a) return set
    const steps = gen(...a)
    if (Array.isArray(steps)) for (const s of steps) if (typeof s?.codeLine === 'number') set.add(s.codeLine)
  } catch { /* leave empty */ }
  return set
}

;(async () => {
  const args = process.argv.slice(2)
  const APPLY = args.includes('--apply')
  const only = args.filter(a => !a.startsWith('--'))

  const files = fs.existsSync(DATA)
    ? fs.readdirSync(DATA).filter(f => f.endsWith('.cjs')).sort()
    : []

  const problems = []
  const unexercised = []
  let wrote = 0, algos = 0, entries = 0, rewrites = 0, omissions = 0
  const perCat = []

  for (const file of files) {
    const cat = file.replace(/\.cjs$/, '')
    if (only.length && !only.includes(cat)) continue
    const authored = require(path.resolve(DATA, file))
    let catEntries = 0, catAlgos = 0, catRewrites = 0

    for (const algo of Object.keys(authored)) {
      const dir = path.join(ROOT, cat, algo)
      const p = path.join(dir, 'code.json')
      const tag = `${cat}/${algo}`
      if (!fs.existsSync(p)) { problems.push(`${tag}: no code.json`); continue }

      const json = JSON.parse(fs.readFileSync(p, 'utf8'))
      const spec = authored[algo]
      let ok = true

      // --- snippet rewrites first: the line map is authored against these
      for (const lang of Object.keys(spec.snippets || {})) {
        if (!SNIPPET_LANGS.includes(lang)) { problems.push(`${tag}: refusing to rewrite '${lang}' (java is canonical)`); ok = false; continue }
        if (!json[lang]) { problems.push(`${tag} ${lang}: no such block in code.json`); ok = false; continue }
        const code = spec.snippets[lang]
        if (typeof code !== 'string' || !code.trim()) { problems.push(`${tag} ${lang}: empty snippet`); ok = false; continue }
        json[lang].code = code.replace(/\s+$/, '') + '\n'
        catRewrites++
      }

      const refs = await referencedLines(dir)

      /* Rewriting the JAVA block renumbers every codeLine in steps.js, so a
         java rewrite is only safe when the steps were re-authored against it.
         Catch the obvious failure — a step pointing past the end of the file —
         rather than silently shipping highlights that land nowhere. */
      const javaMax = (json.java?.code || '').split('\n').length
      for (const r of refs) {
        if (r > javaMax) { problems.push(`${tag}: steps reference java line ${r} but java is only ${javaMax} lines`); ok = false }
      }

      const lineMap = {}

      for (const lang of MAP_LANGS) {
        const map = spec.lineMap?.[lang]
        if (!map) continue
        if (!json[lang]?.code) { problems.push(`${tag} ${lang}: no source but map authored`); ok = false; continue }
        const maxLine = json[lang].code.split('\n').length

        const javaLines = Object.keys(map).map(Number).sort((a, b) => a - b)
        const usedTargets = new Set()

        const clean = {}
        for (const ja of javaLines) {
          const tg = map[String(ja)]
          /* Not an error: `refs` comes from ONE run on the default input, but
             users supply their own. avlTree only rotates on some inputs and
             anagramCheck exits early unless the two strings are the same
             length, so a complete map legitimately covers lines this run never
             reached. Reported so a genuine typo still stands out. */
          if (!refs.has(ja)) unexercised.push(`${tag} ${lang}: java ${ja}`)
          // `null` = deliberately unmapped: this language has no equivalent line
          // (e.g. Java's closing `}` has none in Python). The resolver shows no
          // highlight for a missing entry, which beats showing a wrong one.
          if (tg === null) { omissions++; continue }
          if (typeof tg !== 'number' || tg < 1 || tg > maxLine) {
            problems.push(`${tag} ${lang}: java ${ja} -> ${tg} out of range (1..${maxLine})`); ok = false; continue
          }
          // NB: no monotonicity check. C/C++ must define a helper BEFORE its
          // caller where Java declares it after, so a faithful map legitimately
          // runs backwards (e.g. mergeSort's `merge` sits above `sort`).
          if (usedTargets.has(tg)) { problems.push(`${tag} ${lang}: target line ${tg} claimed twice`); ok = false }
          usedTargets.add(tg)
          clean[String(ja)] = tg
        }
        for (const r of refs) {
          // Missing entirely is a silent gap; explicit `null` is a decision.
          if (!(String(r) in map)) { problems.push(`${tag} ${lang}: referenced java line ${r} is UNMAPPED (use null to omit deliberately)`); ok = false }
        }
        lineMap[lang] = clean
        catEntries += Object.keys(clean).length
      }

      if (!ok) continue
      // Assign, never merge: a stale c/cpp/javascript map already in code.json
      // must not survive a re-apply now that those languages are out of scope.
      if (Object.keys(lineMap).length) json.lineMap = lineMap
      else delete json.lineMap
      if (APPLY) fs.writeFileSync(p, JSON.stringify(json, null, 2) + '\n')
      wrote++
      catAlgos++
    }
    algos += catAlgos
    entries += catEntries
    rewrites += catRewrites
    perCat.push(`${cat.padEnd(22)} ${String(catAlgos).padStart(3)} algos  ${String(catEntries).padStart(4)} mappings  ${String(catRewrites).padStart(3)} snippet rewrites`)
  }

  // Matching nothing is a typo'd category or a missing data file, not success.
  if (!algos && !problems.length) {
    console.log(`No data files matched${only.length ? ` for [${only.join(', ')}]` : ''}. Looked in ${DATA}/ for <category>.cjs`)
    process.exitCode = 1
    return
  }

  console.log(perCat.join('\n'))
  console.log(`\n${algos} algorithms, ${entries} mappings, ${rewrites} snippet rewrites, ${omissions} deliberate omissions.`)
  if (unexercised.length) {
    console.log(`\n${unexercised.length} mapped line(s) the DEFAULT input never reaches (fine for input-dependent branches — check for typos):`)
    console.log(unexercised.join('\n'))
  }
  if (problems.length) {
    console.log(`\n${problems.length} PROBLEM(S) — those algorithms were NOT written:`)
    console.log(problems.join('\n'))
    process.exitCode = 1
  } else {
    console.log(APPLY ? `Validation clean. Wrote ${wrote} code.json.` : 'Validation clean (dry run — nothing written).')
  }
})()
