import assert from 'node:assert'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/* Every code.json `lineMap` must point at real lines in the target language:
   lineMap[lang][javaLine] = targetLine, with 1 <= targetLine <= (#lines of lang).
   Guards the hand-authored core maps and any future rollout from typos. */
const ROOT = 'src/algorithms'
let checked = 0, mapped = 0

function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.name === 'code.json') check(p)
  }
}
function check(p) {
  checked++
  const j = JSON.parse(readFileSync(p, 'utf8'))
  if (!j.lineMap) return
  mapped++
  for (const [lang, m] of Object.entries(j.lineMap)) {
    assert.ok(j[lang]?.code, `${p}: lineMap has '${lang}' but no ${lang} code`)
    assert.notStrictEqual(lang, 'java', `${p}: java is the canonical source and must not be mapped`)
    // Java (identity) + Python are the two languages that highlight. C, C++ and
    // JavaScript deliberately carry no map — their snippets diverge from Java
    // too often to keep an honest line-for-line correspondence across all 124.
    assert.strictEqual(lang, 'python', `${p}: '${lang}' is out of scope — only python is mapped`)
    const lines = j[lang].code.split('\n').length
    // No two Java lines may land on the same target line — one of them would
    // then highlight a line that does not correspond to the step being played.
    // Order is deliberately NOT checked: C/C++ define a helper above its caller
    // where Java declares it below, so a correct map can run backwards.
    const used = new Set()
    for (const [ja, tg] of Object.entries(m)) {
      assert.ok(Number.isInteger(tg) && tg >= 1 && tg <= lines,
        `${p} ${lang}: java${ja}->${tg} out of range (1..${lines})`)
      assert.ok(!used.has(tg), `${p} ${lang}: target line ${tg} claimed by two java lines`)
      used.add(tg)
    }
  }
}

walk(ROOT)
/* 108 of 124: the 16 that still ship the placeholder step generator have no
   real operations to point at and are deliberately unmapped. */
assert.ok(mapped >= 108, `expected at least 108 lineMaps, found ${mapped}`)
console.log(`OK test-linemaps (${mapped}/${checked} code.json carry a lineMap)`)
