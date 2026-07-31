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
    const lines = j[lang].code.split('\n').length
    for (const [ja, tg] of Object.entries(m)) {
      assert.ok(Number.isInteger(tg) && tg >= 1 && tg <= lines,
        `${p} ${lang}: java${ja}->${tg} out of range (1..${lines})`)
    }
  }
}

walk(ROOT)
assert.ok(mapped >= 4, `expected at least the 4 core lineMaps, found ${mapped}`)
console.log(`OK test-linemaps (${mapped}/${checked} code.json carry a lineMap)`)
