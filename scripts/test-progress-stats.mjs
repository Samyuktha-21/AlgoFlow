import assert from 'node:assert'
import { progressKey, splitKey, computeProgress } from '../src/utils/progressStats.js'

// key round-trip
assert.strictEqual(progressKey('graphs', 'bfs'), 'graphs__bfs')
assert.deepStrictEqual(splitKey('graphs__bfs'), ['graphs', 'bfs'])
assert.deepStrictEqual(splitKey(progressKey('linked-lists', 'reverseLinkedList')), ['linked-lists', 'reverseLinkedList'])

const categories = [{ id: 'sorting', name: 'Sorting' }, { id: 'graphs', name: 'Graphs' }]
const registry = {
  sorting: [{ id: 'quickSort', implemented: true }, { id: 'mergeSort', implemented: true }, { id: 'shellSort', implemented: false }],
  graphs:  [{ id: 'bfs', implemented: true }, { id: 'dfs', implemented: true }],
}

// empty → 0; implemented-only denominator (shellSort excluded)
let r = computeProgress({}, categories, registry)
assert.strictEqual(r.overall.total, 4)
assert.strictEqual(r.overall.learned, 0)
assert.strictEqual(r.overall.pct, 0)
assert.strictEqual(r.byCategory.sorting.total, 2)

// a learned key that is NOT implemented must not inflate learned or total
const learned = {
  [progressKey('sorting', 'quickSort')]: 1,
  [progressKey('sorting', 'shellSort')]: 1,
  [progressKey('graphs', 'bfs')]: 1,
}
r = computeProgress(learned, categories, registry)
assert.strictEqual(r.byCategory.sorting.learned, 1)
assert.strictEqual(r.byCategory.sorting.pct, 50)
assert.strictEqual(r.byCategory.graphs.learned, 1)
assert.strictEqual(r.byCategory.graphs.pct, 50)
assert.strictEqual(r.overall.learned, 2)
assert.strictEqual(r.overall.total, 4)
assert.strictEqual(r.overall.pct, 50)

console.log('OK test-progress-stats')
