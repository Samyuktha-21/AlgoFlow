/* Print what each mapped step will ACTUALLY highlight, Java line beside target
   line, so the mapping can be eyeballed for semantic correctness.

   The apply script only proves a map is structurally sound (in range, no
   collisions). It cannot tell that java's `while (low <= high)` was mapped to
   Python's `return -1`. This prints both lines together so that kind of slip
   is visible — the check that actually matters.

   Usage:
     node scripts/verify-linemaps.cjs                 → every mapped algorithm
     node scripts/verify-linemaps.cjs sorting         → one category
     node scripts/verify-linemaps.cjs sorting/quickSort
     node scripts/verify-linemaps.cjs --suspect       → only likely-wrong rows
*/
const fs = require('fs')
const path = require('path')

const ROOT = 'src/algorithms'
/* Python is the only mapped language; Java is canonical and maps to itself. */
const LANGS = ['python']

/* Crude "do these two lines do the same kind of thing?" signal. Purely an
   attention-focusing heuristic for --suspect; never used to change data. */
function kindOf(line) {
  const s = line.trim()
  if (!s) return 'blank'
  if (/^[}\]);]+$/.test(s)) return 'close'
  if (/^(\/\/|\/\*|\*|#(?!include|define))/.test(s)) return 'comment'
  if (/\b(for|while)\b/.test(s) || /^\s*for\b/.test(s)) return 'loop'
  if (/^(if|elif|else)\b|\belse if\b/.test(s)) return 'branch'
  if (/^(return|yield)\b/.test(s)) return 'return'
  if (/^(def|class|struct|public|private|void|int|double|float|bool|char|long|string|vector|auto|function|const .*=>|[A-Za-z_<>*&:\s]+\([^)]*\)\s*\{?$)/.test(s)) return 'decl'
  return 'stmt'
}

const args = process.argv.slice(2)
const SUSPECT = args.includes('--suspect')
const targets = args.filter(a => !a.startsWith('--'))

const files = []
for (const cat of fs.readdirSync(ROOT)) {
  const d = path.join(ROOT, cat)
  if (!fs.statSync(d).isDirectory()) continue
  for (const algo of fs.readdirSync(d)) {
    const p = path.join(d, algo, 'code.json')
    if (!fs.existsSync(p)) continue
    const tag = `${cat}/${algo}`
    if (targets.length && !targets.some(t => t === cat || t === tag)) continue
    files.push({ tag, p })
  }
}

let rows = 0, flagged = 0
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(f.p, 'utf8'))
  if (!j.lineMap) continue
  const javaLines = (j.java?.code || '').split('\n')
  const out = []
  for (const lang of LANGS) {
    const m = j.lineMap[lang]
    if (!m) continue
    const src = j[lang].code.split('\n')
    for (const ja of Object.keys(m).map(Number).sort((a, b) => a - b)) {
      const tg = m[String(ja)]
      const jaText = (javaLines[ja - 1] || '').trim()
      const tgText = (src[tg - 1] || '').trim()
      const jk = kindOf(jaText), tk = kindOf(tgText)
      const bad = jk !== tk && !(jk === 'decl' && tk === 'stmt') && !(jk === 'stmt' && tk === 'decl')
      rows++
      if (bad) flagged++
      if (SUSPECT && !bad) continue
      out.push(`  ${bad ? '!!' : '  '} ${lang.padEnd(10)} java${String(ja).padStart(3)} ${jk.padEnd(7)} | ${jaText.slice(0, 52).padEnd(52)} => ${String(tg).padStart(3)} ${tk.padEnd(7)} | ${tgText.slice(0, 52)}`)
    }
  }
  if (out.length) {
    console.log(`\n### ${f.tag}`)
    console.log(out.join('\n'))
  }
}
console.log(`\n${rows} mappings checked, ${flagged} flagged for review (kind mismatch).`)
