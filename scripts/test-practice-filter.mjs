import assert from 'node:assert'
import { filterProblems } from '../src/utils/practiceFilter.js'

const P = [
  { id: 'a', categoryId: 'sorting', algorithmId: 'quickSort' },
  { id: 'b', categoryId: 'sorting', algorithmId: 'mergeSort' },
  { id: 'c', categoryId: 'sorting' },                 // category-level fallback
  { id: 'd', categoryId: 'graphs',  algorithmId: 'bfs' },
]

assert.strictEqual(filterProblems(P, 'all', 'all').length, 4)
assert.deepStrictEqual(filterProblems(P, 'sorting', 'all').map(p => p.id), ['a', 'b', 'c'])
assert.deepStrictEqual(filterProblems(P, 'sorting', 'quickSort').map(p => p.id), ['a', 'c'])   // direct + fallback
assert.deepStrictEqual(filterProblems(P, 'sorting', 'shellSort').map(p => p.id), ['c'])         // only fallback
assert.deepStrictEqual(filterProblems(P, 'graphs', 'bfs').map(p => p.id), ['d'])
assert.strictEqual(filterProblems(P, 'greedy', 'all').length, 0)

console.log('OK test-practice-filter')
