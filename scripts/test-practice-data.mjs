import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { practiceProblems, SOURCES } from '../src/data/practiceProblems.js'

const here = dirname(fileURLToPath(import.meta.url))
const readJson = (name) => JSON.parse(readFileSync(join(here, '..', 'src', 'data', name), 'utf8'))
const categories = readJson('categories.json')
const registry   = readJson('algorithmRegistry.json')

const catIds = new Set(categories.map(c => c.id))
const algoByCat = Object.fromEntries(
  Object.entries(registry).map(([cid, arr]) => [cid, new Set(arr.map(a => a.id))])
)
const DIFFS = new Set(['easy', 'medium', 'hard'])
const seen = new Set()

assert.ok(Array.isArray(practiceProblems) && practiceProblems.length > 0, 'dataset non-empty')
assert.deepStrictEqual(SOURCES, ['LeetCode', 'NeetCode', 'HackerRank'])

for (const p of practiceProblems) {
  assert.ok(p.id && !seen.has(p.id), `unique id: ${p.id}`); seen.add(p.id)
  assert.ok(typeof p.title === 'string' && p.title.trim(), `title: ${p.id}`)
  assert.ok(/^https?:\/\//.test(p.url || ''), `url http(s): ${p.id}`)
  assert.ok(SOURCES.includes(p.source), `source: ${p.id}`)
  assert.ok(DIFFS.has(p.difficulty), `difficulty: ${p.id}`)
  assert.ok(catIds.has(p.categoryId), `categoryId ${p.categoryId}: ${p.id}`)
  if (p.algorithmId != null)
    assert.ok(algoByCat[p.categoryId]?.has(p.algorithmId), `algorithmId ${p.algorithmId} in ${p.categoryId}: ${p.id}`)
  assert.ok(typeof p.prompt === 'string' && p.prompt.trim(), `prompt: ${p.id}`)
  assert.ok(Array.isArray(p.examples) && p.examples.length >= 1, `examples≥1: ${p.id}`)
  for (const ex of p.examples)
    assert.ok(ex && ex.input && ex.output, `example in/out: ${p.id}`)
}
for (const cid of catIds)
  assert.ok(practiceProblems.some(p => p.categoryId === cid), `every category has ≥1 problem: ${cid}`)

console.log(`OK test-practice-data (${practiceProblems.length} problems)`)
