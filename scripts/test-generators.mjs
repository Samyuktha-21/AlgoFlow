import assert from 'node:assert'
import fs from 'node:fs'
import { generateComplexity } from '../src/game/challenges/complexity.js'
import { generateNextOp } from '../src/game/challenges/nextOp.js'
import { generateFinalOutput } from '../src/game/challenges/finalOutput.js'
import { generateNameAlgorithm } from '../src/game/challenges/nameAlgorithm.js'

const meta = JSON.parse(fs.readFileSync('src/algorithms/fundamentals/twoSum/metadata.json', 'utf8'))
const entry = { categoryId: 'fundamentals', algorithmId: 'twoSum', name: meta.name, type: meta.type, themeId: 'compass', metadata: meta }

const oneCorrect = (c) => c && c.options.filter(o => o.isCorrect).length === 1 && c.options.length >= 3
const rng = () => 0.42

const cx = generateComplexity(entry, rng)
assert.ok(oneCorrect(cx), 'complexity shape')
assert.ok(cx.options.some(o => o.isCorrect && o.label === meta.complexity.time.worst), 'complexity correct = time.worst')

// typed steps for nextOp/finalOutput
const steps = [
  { type: 'compare', comparing: [0, 1], array: [2, 5, 8], description: 'cmp', codeLine: 3 },
  { type: 'swap', swapping: [0, 1], array: [2, 5, 8], description: 'swap', codeLine: 4 },
  { type: 'found', found: 1, array: [5, 2, 8], description: 'done', codeLine: 5 },
]
const no = generateNextOp(entry, steps, rng)
assert.ok(oneCorrect(no) && no.renderMode === 'frozen', 'nextOp shape')

const fo = generateFinalOutput(entry, steps, rng)
assert.ok(fo === null || oneCorrect(fo), 'finalOutput shape-or-null')

const na = generateNameAlgorithm(entry, steps, ['Bubble Sort', 'Merge Sort', 'Dijkstra'], rng)
assert.ok(oneCorrect(na) && na.options.some(o => o.isCorrect && o.label === meta.name), 'nameAlgorithm shape')

console.log('OK test-generators')
