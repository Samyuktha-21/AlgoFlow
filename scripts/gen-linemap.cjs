/* Author per-language `lineMap`s for code.json.

   Steps emit `codeLine` as line numbers in the JAVA block. We (1) run each
   algorithm's generateSteps to learn which Java lines are ACTUALLY referenced,
   then (2) align each other language to Java (Needleman-Wunsch on normalized
   tokens) and record a mapping ONLY for referenced lines that have a high-
   confidence, one-to-one match. Minified / structurally-divergent snippets
   simply stay unmapped — the resolver then shows no highlight for them (never
   a wrong one). Java is the identity source and is not stored.

   Modes:
     node scripts/gen-linemap.cjs [cats...]           → write linemap-review.json + summary
     node scripts/gen-linemap.cjs --apply [cats...]   → also write lineMap into each code.json
*/
const fs = require('fs'), path = require('path')
const { pathToFileURL } = require('url')

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const cats = args.filter(a => a !== '--apply')
const CATS = cats.length ? cats : ['fundamentals', 'sorting', 'searching', 'arrays']
const TARGET_LANGS = ['c', 'cpp', 'python', 'javascript']
const MATCH_MIN = 0.45   // a referenced line must match at least this well to map

const STOP = new Set([
  'public','private','protected','static','void','class','new','final','const','let','var',
  'int','long','double','float','char','bool','boolean','string','vector','auto','def','return',
  'import','include','using','namespace','std','self','function','println','printf','print',
  'cout','endl','system','out','true','false','null','none','size','length','len',
  'stdio','stdbool','iostream','main','args','val','elif','pass',
])
const KEYWORDS = new Set(['for','while','if','else','do'])

function tokens(line) {
  return (line.match(/[A-Za-z_][A-Za-z0-9_]*|[<>=!+\-*/%]+|\d+/g) || [])
    .map(t => t.toLowerCase()).filter(t => !STOP.has(t))
}
function sim(a, b) {
  const sa = new Set(a), sb = new Set(b)
  if (!sa.size && !sb.size) return 0
  let inter = 0
  for (const t of sa) if (sb.has(t)) inter++
  const union = new Set([...sa, ...sb]).size
  let s = union ? inter / union : 0
  const ka = a.find(t => KEYWORDS.has(t)), kb = b.find(t => KEYWORDS.has(t))
  if (ka && ka === kb) s += 0.15
  return Math.min(1, s)
}
function align(jaTok, tgTok) {
  const n = jaTok.length, m = tgTok.length, GAP = -0.3, BIAS = 0.3
  const M = Array.from({ length: n + 1 }, () => new Float64Array(m + 1))
  const P = Array.from({ length: n + 1 }, () => new Int8Array(m + 1))
  for (let i = 1; i <= n; i++) { M[i][0] = i * GAP; P[i][0] = 2 }
  for (let j = 1; j <= m; j++) { M[0][j] = j * GAP; P[0][j] = 3 }
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const d = M[i - 1][j - 1] + (sim(jaTok[i - 1], tgTok[j - 1]) - BIAS)
    const u = M[i - 1][j] + GAP, l = M[i][j - 1] + GAP
    let best = d, dir = 1
    if (u > best) { best = u; dir = 2 }
    if (l > best) { best = l; dir = 3 }
    M[i][j] = best; P[i][j] = dir
  }
  const byJa = {} // javaIdx -> { ti, s }
  let i = n, j = m
  while (i > 0 || j > 0) {
    const dir = P[i][j] || (i > 0 ? 2 : 3)
    if (dir === 1) { byJa[i - 1] = { ti: j - 1, s: sim(jaTok[i - 1], tgTok[j - 1]) }; i--; j-- }
    else if (dir === 2) i--
    else j--
  }
  return byJa
}

/* Pick ONE correct argument list from the algorithm's metadata (matching how
   Algorithm.jsx drives generateSteps), with small inputs so step counts stay
   modest. Feeding wrong-shaped inputs can trigger runaway/OOM, so no brute force. */
function argsFor(meta) {
  const t = meta?.type, it = meta?.inputType
  if (it === 'singleString') return ['racecar']
  if (it === 'stringPair') return ['ABCBDAB', 'BDCAB']
  if (t === 'searching') return [[1, 3, 5, 7, 9, 11, 13], 7]
  return [[5, 2, 8, 1, 9, 3, 7]]   // sorting / array / dp → single small array
}
async function referencedLines(dir) {
  const stepsPath = path.join(dir, 'steps.js')
  if (!fs.existsSync(stepsPath)) return null
  let gen
  try { gen = (await import(pathToFileURL(stepsPath).href)).generateSteps } catch { return null }
  if (typeof gen !== 'function') return null
  let meta = {}
  try { meta = JSON.parse(fs.readFileSync(path.join(dir, 'metadata.json'), 'utf8')) } catch { /* none */ }
  const set = new Set()
  try {
    const steps = gen(...argsFor(meta))
    if (Array.isArray(steps)) for (const s of steps) if (typeof s?.codeLine === 'number') set.add(s.codeLine)
  } catch { /* generator threw — leave unmapped */ }
  return set
}

;(async () => {
  const files = []
  for (const c of CATS) {
    const d = path.join('src/algorithms', c)
    if (!fs.existsSync(d)) continue
    for (const e of fs.readdirSync(d, { withFileTypes: true }))
      if (e.isDirectory() && fs.existsSync(path.join(d, e.name, 'code.json')))
        files.push({ cat: c, algo: e.name, dir: path.join(d, e.name) })
  }

  const review = {}
  let applied = 0
  for (const f of files) {
    const p = path.join(f.dir, 'code.json')
    const j = JSON.parse(fs.readFileSync(p, 'utf8'))
    if (!j.java?.code) continue
    // Never clobber a hand-verified map that's already in place.
    if (APPLY && j.lineMap) { console.log(`${f.cat}/${f.algo}  (kept existing lineMap)`); continue }
    const refs = await referencedLines(f.dir)
    const jaLines = j.java.code.split('\n')
    const jaTok = jaLines.map(tokens)
    const refList = refs && refs.size ? [...refs].sort((a, b) => a - b) : []
    const lineMap = {}
    const rev = { refs: refList, langs: {} }
    for (const lang of TARGET_LANGS) {
      if (!j[lang]?.code) continue
      const tgLines = j[lang].code.split('\n')
      const byJa = align(jaTok, tgLines.map(tokens))
      const map = {}, rows = [], usedTargets = {}
      for (const ln of refList) {
        const ji = ln - 1
        const hit = byJa[ji]
        if (!hit || hit.s < MATCH_MIN) continue
        const tgNo = hit.ti + 1
        // one-to-one: if a target line already claimed, keep higher sim
        if (usedTargets[tgNo] != null) {
          if (usedTargets[tgNo].s >= hit.s) continue
          delete map[usedTargets[tgNo].ja]
        }
        usedTargets[tgNo] = { ja: ln, s: hit.s }
        map[ln] = tgNo
        rows.push([ln, tgNo, +hit.s.toFixed(2), jaLines[ji].trim(), tgLines[hit.ti].trim()])
      }
      const coverage = refList.length ? Object.keys(map).length / refList.length : 0
      rev.langs[lang] = { mapped: Object.keys(map).length, coverage: +coverage.toFixed(2), rows }
      if (Object.keys(map).length) lineMap[lang] = map
    }
    review[`${f.cat}/${f.algo}`] = rev
    if (APPLY && Object.keys(lineMap).length) {
      j.lineMap = lineMap
      fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n')
      applied++
    }
  }

  fs.writeFileSync('linemap-review.json', JSON.stringify(review, null, 2))
  for (const key of Object.keys(review)) {
    const r = review[key]
    const parts = Object.keys(r.langs).map(l => `${l}:${r.langs[l].mapped}/${r.refs.length}`)
    console.log(`${key.padEnd(32)} refs=${r.refs.length}  ${parts.join(' ')}`)
  }
  console.log(`\n${Object.keys(review).length} algos. ${APPLY ? `APPLIED to ${applied} code.json.` : 'review → linemap-review.json (nothing changed).'}`)
})()
