/* Sweeps every steps.js for helper parameters that are accepted and never
   used. This was F3 in docs/NEXT_FEATURES.md, spotted by hand in one file
   (arrays/dutchFlag's `action`); the sweep found a second (circularQueue's
   `op` and `val`) and confirmed the rest of the corpus is clean.

   Why it matters beyond tidiness: in both cases the dead parameter was op-kind
   information — 'swap', 'skip', 'enq', 'deq' — computed at the point of
   creation and thrown away. That is exactly the data src/game/classifyStep.js
   now has to recover by diffing. Both were removed rather than stored, because
   storing them would have produced a `type:` field on 2 of 124 generators, and
   a field that exists on 2% of the corpus is worse than no field at all.

   eslint does not catch these: no-unused-vars defaults to `args: 'after-used'`,
   which only flags trailing parameters, and both offenders were leading ones. */
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = 'src/algorithms'

function stepsFiles() {
  const out = []
  for (const c of fs.readdirSync(ROOT)) {
    const cdir = path.join(ROOT, c)
    if (!fs.statSync(cdir).isDirectory()) continue
    for (const a of fs.readdirSync(cdir)) {
      const p = path.join(cdir, a, 'steps.js')
      if (fs.existsSync(p)) out.push(p)
    }
  }
  return out
}

/* Body of the arrow function starting at `i`: brace-balanced for a block
   body, or to the end of the expression for a concise one. */
function arrowBody(src, i) {
  while (i < src.length && /\s/.test(src[i])) i++
  if (src[i] === '{') {
    let depth = 0, j = i
    do {
      if (src[j] === '{') depth++
      else if (src[j] === '}') depth--
      j++
    } while (depth > 0 && j < src.length)
    return src.slice(i, j)
  }
  let j = i, depth = 0
  while (j < src.length) {
    const ch = src[j]
    if ('([{'.includes(ch)) depth++
    else if (')]}'.includes(ch)) { if (depth === 0) break; depth-- }
    else if (ch === '\n' && depth === 0) break
    j++
  }
  return src.slice(i, j)
}

const DECL = /(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*\(([^)]*)\)\s*=>/g
const findings = []

const files = stepsFiles()
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8')
  let m
  while ((m = DECL.exec(src))) {
    const [full, name, params] = m
    if (!params.trim()) continue
    const body = arrowBody(src, m.index + full.length)
    const names = params
      .split(',')
      .map(s => s.trim().split('=')[0].trim())
      .filter(s => /^[A-Za-z_$][\w$]*$/.test(s))
    for (const p of names) {
      /* A leading underscore is the conventional "deliberately unused". */
      if (p.startsWith('_')) continue
      if (!new RegExp(`\\b${p.replace(/\$/g, '\\$')}\\b`).test(body)) {
        findings.push({ file: file.replace(/\\/g, '/'), helper: name, params: params.trim(), param: p })
      }
    }
  }
}

console.log(`scanned ${files.length} generators`)
if (findings.length) {
  console.log(`\n${findings.length} dead helper parameter(s):`)
  for (const f of findings) {
    console.log(`  ${f.file}`)
    console.log(`      ${f.helper}(${f.params})  ->  '${f.param}' accepted, never used`)
  }
  console.log('\nRemove the parameter and its arguments, or rename it with a leading')
  console.log('underscore if it is deliberately unused.')
} else {
  console.log('no dead helper parameters')
}

assert.equal(findings.length, 0, `${findings.length} dead helper parameter(s) — see above`)
console.log('OK audit-dead-params')
