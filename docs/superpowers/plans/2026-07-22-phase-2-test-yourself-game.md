# Test Yourself Game Mode — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone `/play` "Test Yourself" game where the user answers auto-generated challenges (predict next op, guess complexity, name the algorithm, predict final output) in an Endless or Fixed-rounds session.

**Architecture:** Pure challenge-generation logic (`src/game/*`) is decoupled from Vite/React so it's node-testable; a React page (`src/pages/TestYourself.jsx`) drives a Setup→Playing→Summary state machine and renders challenges by reusing the existing visualizer components with an explicit frozen `step` prop. Two small shared modules are extracted from existing files so the game and the algorithm page share one source of truth.

**Tech Stack:** React 19, Vite 8 (Rolldown), react-router-dom 7, framer-motion, existing `steps.js` generators + `metadata.json`, `localStorage`. Tests: node ESM assertion scripts under `scripts/` (no test framework in this repo — mirror `scripts/live-stats.mjs`), run with `node`.

## Global Constraints

- Node ESM only; repo `package.json` has `"type": "module"`. Test scripts are `.mjs` under `scripts/`.
- Pure game logic (`src/game/challenges/*`, `src/game/describeStep.js`, `src/utils/stepExplain.js`) MUST NOT import React, `import.meta.glob`, `pool.js`, or any `.jsx` — so node can import them. Data (`metadata`, `steps`) is passed in as arguments.
- `src/game/pool.js` is the ONLY game module allowed to use `import.meta.glob` (Vite-only; verified via build, not node).
- Build page theme-aware from the start using Phase-1 vars: `--chrome-*`, `--page-*`, `--chip-*` (defined in `src/index.css`). No hardcoded dark-only colors.
- Do not exceed the pre-existing lint baseline of **36 problems (25 errors, 11 warnings)**. `npm run build` must show no chunk-size warning.
- Language tabs / copy: the game does not add JavaScript; existing 4-language wording is untouched.
- Canonical Big-O distractor set (from `ComplexityPanel` tooltip keys): `['O(1)','O(log n)','O(n)','O(n log n)','O(n²)','O(n³)','O(2ⁿ)','O(√n)','O(V + E)','O(V²)','O((V+E) log V)']`.
- Complexity answer field = `metadata.complexity.time.worst`.

---

### Task 1: Extract `stepExplain.js` (shared explanation helpers)

**Files:**
- Create: `src/utils/stepExplain.js`
- Modify: `src/pages/Algorithm.jsx` (remove local `getWhyText`/`deriveResult`, import from util)
- Test: `scripts/test-step-explain.mjs`

**Interfaces:**
- Produces: `getWhyText(step, algorithmType) → string | null`, `deriveResult(step) → string | null` (moved verbatim from `Algorithm.jsx`).

- [ ] **Step 1: Create the module** — cut the existing `getWhyText` and `deriveResult` function bodies from `src/pages/Algorithm.jsx` (currently local functions) into `src/utils/stepExplain.js`, prefixing each with `export`. Do not change their logic.

```js
// src/utils/stepExplain.js
export function getWhyText(step, algorithmType) {
  /* ...exact body moved from Algorithm.jsx... */
}
export function deriveResult(step) {
  /* ...exact body moved from Algorithm.jsx... */
}
```

- [ ] **Step 2: Import back in Algorithm.jsx** — delete the two local definitions and add:

```js
import { getWhyText, deriveResult } from '../utils/stepExplain'
```

- [ ] **Step 3: Write the node test**

```js
// scripts/test-step-explain.mjs
import assert from 'node:assert'
import { getWhyText, deriveResult } from '../src/utils/stepExplain.js'

// compare step yields a "why" string
const why = getWhyText({ type:'compare', comparing:[0,1], array:[5,3] }, 'sorting')
assert.ok(typeof why === 'string' && why.length > 0, 'compare why text')

// sorted result
const res = deriveResult({ array:[1,2,3], sorted:[0,1,2] })
assert.strictEqual(res, '1 → 2 → 3')

// no-op step returns null
assert.strictEqual(getWhyText(null, 'sorting'), null)
console.log('OK test-step-explain')
```

- [ ] **Step 4: Run test** — `node scripts/test-step-explain.mjs` → Expected: `OK test-step-explain`
- [ ] **Step 5: Verify app still builds** — `npm run build` → Expected: success, no new warnings
- [ ] **Step 6: Commit** — `git add src/utils/stepExplain.js src/pages/Algorithm.jsx scripts/test-step-explain.mjs && git commit -m "refactor: extract stepExplain (getWhyText, deriveResult)"`

---

### Task 2: Extract `visualizerMap.js` (shared type→visualizer map)

**Files:**
- Create: `src/components/Visualizer/visualizerMap.js`
- Modify: `src/components/Visualizer/VisualizerCanvas.jsx` (import the map)

**Interfaces:**
- Produces: `VISUALIZER_MAP: Record<string, LazyExoticComponent>` and `getVisualizer(type) → LazyComponent` (defaults to ArrayVisualizer).

- [ ] **Step 1: Create the module** — move the `lazy(() => import('./XxxVisualizer'))` declarations and the `VISUALIZER_MAP` object out of `VisualizerCanvas.jsx` into the new file; add a helper.

```js
// src/components/Visualizer/visualizerMap.js
import { lazy } from 'react'
const SortVisualizer         = lazy(() => import('./SortVisualizer'))
const SearchVisualizer       = lazy(() => import('./SearchVisualizer'))
const GraphVisualizer        = lazy(() => import('./GraphVisualizer'))
const ArrayVisualizer        = lazy(() => import('./ArrayVisualizer'))
const DPVisualizer           = lazy(() => import('./DPVisualizer'))
const TreeVisualizer         = lazy(() => import('./TreeVisualizer'))
const LinkedListVisualizer   = lazy(() => import('./LinkedListVisualizer'))
const StackVisualizer        = lazy(() => import('./StackVisualizer'))
const HeapVisualizer         = lazy(() => import('./HeapVisualizer'))
const BacktrackingVisualizer = lazy(() => import('./BacktrackingVisualizer'))

export const VISUALIZER_MAP = {
  sorting: SortVisualizer, searching: SearchVisualizer, graph: GraphVisualizer,
  array: ArrayVisualizer, 'linked-list': LinkedListVisualizer, stack: StackVisualizer,
  queue: StackVisualizer, 'stack-queue': StackVisualizer, tree: TreeVisualizer,
  heap: HeapVisualizer, dp: DPVisualizer, 'dynamic-programming': DPVisualizer,
  backtracking: BacktrackingVisualizer, greedy: ArrayVisualizer, hashing: ArrayVisualizer,
  fundamentals: ArrayVisualizer,
}
export const getVisualizer = (type) => VISUALIZER_MAP[type] || ArrayVisualizer
```

- [ ] **Step 2: Import in VisualizerCanvas** — replace the removed declarations with `import { VISUALIZER_MAP } from './visualizerMap'` and keep the existing `const VisualizerComponent = VISUALIZER_MAP[algorithmType] || ArrayVisualizer` (change fallback to `getVisualizer(algorithmType)` and import it too).
- [ ] **Step 3: Verify build** — `npm run build` → success; confirm visualizer chunks still emit.
- [ ] **Step 4: Commit** — `git add src/components/Visualizer/visualizerMap.js src/components/Visualizer/VisualizerCanvas.jsx && git commit -m "refactor: extract VISUALIZER_MAP to shared module"`

---

### Task 3: `describeStep.js` — step labels + option builder

**Files:**
- Create: `src/game/describeStep.js`
- Test: `scripts/test-describe-step.mjs`

**Interfaces:**
- Produces:
  - `describeStep(step) → string | null` — short label for a TYPED step (`compare`/`swap`/`sorted`/`found`/`visit`/`pivot`/`enqueue`/`dequeue`/`backtrack`/`update`/`relax`/`insert`), else null.
  - `buildNextOpOptions(steps, i) → { correct: string, distractors: string[] } | null` — correct = `describeStep(steps[i+1])`; up to 3 distractors from other typed steps in the same run and a fallback vocabulary; null if fewer than 2 distinct distractors or `describeStep` is null.

- [ ] **Step 1: Write the node test**

```js
// scripts/test-describe-step.mjs
import assert from 'node:assert'
import { describeStep, buildNextOpOptions } from '../src/game/describeStep.js'

const steps = [
  { type:'compare', comparing:[0,1], array:[8,3,5] },
  { type:'swap',    swapping:[0,1],  array:[8,3,5] },
  { type:'sorted',  sorted:[2],      array:[3,8,5] },
]
assert.strictEqual(describeStep(steps[0]), 'Compare 8 and 3')
assert.strictEqual(describeStep(steps[1]), 'Swap 8 and 3')
assert.ok(describeStep(steps[2]).startsWith('Mark'))
assert.strictEqual(describeStep({ description:'x' }), null, 'untyped → null')

const opts = buildNextOpOptions(steps, 0)   // next is swap
assert.ok(opts && opts.correct === 'Swap 8 and 3')
assert.ok(opts.distractors.length >= 2 && !opts.distractors.includes(opts.correct))
console.log('OK test-describe-step')
```

- [ ] **Step 2: Run to confirm it fails** — `node scripts/test-describe-step.mjs` → Expected: FAIL (module not found)
- [ ] **Step 3: Implement `describeStep.js`**

```js
// src/game/describeStep.js
const val = (arr, i) => (arr && arr[i] !== undefined ? arr[i] : `#${i}`)

export function describeStep(step) {
  if (!step || !step.type) return null
  const a = step.array
  switch (step.type) {
    case 'compare':
      if (Array.isArray(step.comparing) && step.comparing.length >= 2)
        return `Compare ${val(a, step.comparing[0])} and ${val(a, step.comparing[1])}`
      return 'Compare two elements'
    case 'swap':
      if (Array.isArray(step.swapping) && step.swapping.length >= 2)
        return `Swap ${val(a, step.swapping[0])} and ${val(a, step.swapping[1])}`
      return 'Swap two elements'
    case 'sorted': {
      const idx = Array.isArray(step.sorted) ? step.sorted[step.sorted.length - 1] : undefined
      return idx !== undefined ? `Mark position ${idx} as sorted` : 'Lock a position as sorted'
    }
    case 'pivot':    return step.pivot !== undefined ? `Choose ${val(a, step.pivot)} as pivot` : 'Choose a pivot'
    case 'found':    return 'Target found'
    case 'visit':    return step.current !== undefined ? `Visit node ${step.current}` : 'Visit a node'
    case 'enqueue':  return 'Add neighbours to the queue'
    case 'dequeue':  return 'Take the next node from the queue'
    case 'backtrack':return 'Backtrack from a dead end'
    case 'update':   return 'Update a stored (memoized) value'
    case 'relax':    return 'Relax an edge (shorter path found)'
    case 'insert':   return 'Insert the element into place'
    default:         return null
  }
}

const FALLBACK_OPS = [
  'Compare two elements', 'Swap two elements', 'Lock a position as sorted',
  'Visit a node', 'Choose a pivot', 'Backtrack from a dead end',
  'Add neighbours to the queue', 'Update a stored (memoized) value',
]

export function buildNextOpOptions(steps, i) {
  const next = steps[i + 1]
  const correct = describeStep(next)
  if (!correct) return null
  const seen = new Set([correct])
  const distractors = []
  // prefer other real steps from this run
  for (const s of steps) {
    const label = describeStep(s)
    if (label && !seen.has(label)) { seen.add(label); distractors.push(label) }
    if (distractors.length >= 3) break
  }
  // pad from fallback vocabulary
  for (const label of FALLBACK_OPS) {
    if (distractors.length >= 3) break
    if (!seen.has(label)) { seen.add(label); distractors.push(label) }
  }
  if (distractors.length < 2) return null
  return { correct, distractors: distractors.slice(0, 3) }
}
```

- [ ] **Step 4: Run test** — `node scripts/test-describe-step.mjs` → Expected: `OK test-describe-step`
- [ ] **Step 5: Commit** — `git add src/game/describeStep.js scripts/test-describe-step.mjs && git commit -m "feat: describeStep + next-op option builder"`

---

### Task 4: Challenge generators (`complexity`, `nextOp`, `finalOutput`, `nameAlgorithm`)

**Files:**
- Create: `src/game/challenges/complexity.js`, `src/game/challenges/nextOp.js`, `src/game/challenges/finalOutput.js`, `src/game/challenges/nameAlgorithm.js`, `src/game/challenges/index.js`
- Test: `scripts/test-generators.mjs`

**Interfaces:**
- Shared `Challenge` object: `{ type, entry, prompt, options: [{label, isCorrect}], explanation, renderMode, render }` where `renderMode ∈ {'none','frozen','animated','input'}` and `render` carries render data (`{ step, algorithmType, themeId, metadata }` for frozen; `{ steps, ... }` for animated; `{ inputText }` for input; absent for none).
- `entry` (from Task 5 pool): `{ categoryId, algorithmId, name, type, themeId, metadata }`.
- Produces:
  - `generateComplexity(entry, rng) → Challenge | null`
  - `generateNextOp(entry, steps, rng) → Challenge | null`
  - `generateFinalOutput(entry, steps, rng) → Challenge | null`
  - `generateNameAlgorithm(entry, steps, otherNames, rng) → Challenge | null`
  - `shuffle(array, rng)` helper in `index.js`; `rng` defaults to `Math.random` (tests pass a seeded fn — note repo forbids `Math.random` only inside Workflow scripts, not app code).

- [ ] **Step 1: Write the node test** (uses one real steps.js + a synthetic entry)

```js
// scripts/test-generators.mjs
import assert from 'node:assert'
import fs from 'node:fs'
import { generateComplexity } from '../src/game/challenges/complexity.js'
import { generateNextOp } from '../src/game/challenges/nextOp.js'
import { generateFinalOutput } from '../src/game/challenges/finalOutput.js'
import { generateNameAlgorithm } from '../src/game/challenges/nameAlgorithm.js'

const meta = JSON.parse(fs.readFileSync('src/algorithms/fundamentals/twoSum/metadata.json','utf8'))
const entry = { categoryId:'fundamentals', algorithmId:'twoSum', name: meta.name, type: meta.type, themeId:'compass', metadata: meta }

const oneCorrect = (c) => c && c.options.filter(o => o.isCorrect).length === 1 && c.options.length >= 3
const rng = () => 0.42

const cx = generateComplexity(entry, rng)
assert.ok(oneCorrect(cx), 'complexity shape')
assert.ok(cx.options.some(o => o.isCorrect && o.label === meta.complexity.time.worst), 'complexity correct = time.worst')

// typed steps for nextOp/finalOutput
const steps = [
  { type:'compare', comparing:[0,1], array:[2,5,8], description:'cmp', codeLine:3 },
  { type:'swap', swapping:[0,1], array:[2,5,8], description:'swap', codeLine:4 },
  { type:'found', found:1, array:[5,2,8], description:'done', codeLine:5 },
]
const no = generateNextOp(entry, steps, rng)
assert.ok(oneCorrect(no) && no.renderMode === 'frozen', 'nextOp shape')

const fo = generateFinalOutput(entry, steps, rng)
assert.ok(fo === null || oneCorrect(fo), 'finalOutput shape-or-null')

const na = generateNameAlgorithm(entry, steps, ['Bubble Sort','Merge Sort','Dijkstra'], rng)
assert.ok(oneCorrect(na) && na.options.some(o => o.isCorrect && o.label === meta.name), 'nameAlgorithm shape')
console.log('OK test-generators')
```

- [ ] **Step 2: Run to confirm it fails** — `node scripts/test-generators.mjs` → Expected: FAIL (modules not found)

- [ ] **Step 3: Implement `index.js` helpers**

```js
// src/game/challenges/index.js
export function shuffle(arr, rng = Math.random) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
export function toOptions(correct, distractors, rng) {
  const opts = [{ label: correct, isCorrect: true }, ...distractors.map(d => ({ label: d, isCorrect: false }))]
  return shuffle(opts, rng)
}
```

- [ ] **Step 4: Implement `complexity.js`**

```js
// src/game/challenges/complexity.js
import { toOptions, shuffle } from './index.js'
const BIG_O = ['O(1)','O(log n)','O(n)','O(n log n)','O(n²)','O(n³)','O(2ⁿ)','O(√n)','O(V + E)','O(V²)','O((V+E) log V)']
export function generateComplexity(entry, rng = Math.random) {
  const correct = entry?.metadata?.complexity?.time?.worst
  if (!correct) return null
  const pool = BIG_O.filter(o => o !== correct)
  const distractors = shuffle(pool, rng).slice(0, 3)
  if (distractors.length < 3) return null
  return {
    type: 'complexity', entry,
    prompt: `What is the worst-case TIME complexity of ${entry.name}?`,
    options: toOptions(correct, distractors, rng),
    explanation: entry.metadata.complexity.time.worstCase
      ? `Worst case: ${entry.metadata.complexity.time.worstCase}.`
      : `${entry.name} runs in ${correct} in the worst case.`,
    renderMode: 'none',
  }
}
```

- [ ] **Step 5: Implement `nextOp.js`**

```js
// src/game/challenges/nextOp.js
import { toOptions } from './index.js'
import { buildNextOpOptions } from '../describeStep.js'
import { getWhyText } from '../../utils/stepExplain.js'
export function generateNextOp(entry, steps, rng = Math.random) {
  if (!Array.isArray(steps) || steps.length < 3) return null
  // choose a frozen index i in [0, len-2] that yields a describable next op
  const candidates = []
  for (let i = 0; i < steps.length - 1; i++) if (buildNextOpOptions(steps, i)) candidates.push(i)
  if (candidates.length === 0) return null
  const i = candidates[Math.floor(rng() * candidates.length)]
  const { correct, distractors } = buildNextOpOptions(steps, i)
  return {
    type: 'nextOp', entry,
    prompt: 'Given the state below, what happens NEXT?',
    options: toOptions(correct, distractors, rng),
    explanation: getWhyText(steps[i + 1], entry.type) || correct,
    renderMode: 'frozen',
    render: { step: steps[i], algorithmType: entry.type, themeId: entry.themeId, metadata: entry.metadata },
  }
}
```

- [ ] **Step 6: Implement `finalOutput.js`**

```js
// src/game/challenges/finalOutput.js
import { toOptions } from './index.js'
import { deriveResult } from '../../utils/stepExplain.js'
export function generateFinalOutput(entry, steps, rng = Math.random) {
  if (!Array.isArray(steps) || steps.length < 2) return null
  const last = steps[steps.length - 1]
  const correct = deriveResult(last)
  if (!correct) return null
  const first = steps[0]
  const original = Array.isArray(first?.array) ? first.array.join(' → ') : null
  const reversed = Array.isArray(last?.array) ? [...last.array].reverse().join(' → ') : null
  const distractors = [original, reversed, 'Not found in array']
    .filter(d => d && d !== correct)
  const uniq = [...new Set(distractors)].slice(0, 3)
  if (uniq.length < 2) return null
  return {
    type: 'finalOutput', entry,
    prompt: `Starting from the input shown, what is the FINAL result of ${entry.name}?`,
    options: toOptions(correct, uniq, rng),
    explanation: `Final result: ${correct}.`,
    renderMode: 'input',
    render: { inputText: original || '(default input)' },
  }
}
```

- [ ] **Step 7: Implement `nameAlgorithm.js`**

```js
// src/game/challenges/nameAlgorithm.js
import { toOptions, shuffle } from './index.js'
export function generateNameAlgorithm(entry, steps, otherNames, rng = Math.random) {
  if (!Array.isArray(steps) || steps.length < 2) return null
  const pool = [...new Set((otherNames || []).filter(n => n && n !== entry.name))]
  if (pool.length < 3) return null
  const distractors = shuffle(pool, rng).slice(0, 3)
  return {
    type: 'nameAlgorithm', entry,
    prompt: 'Which algorithm is running below?',
    options: toOptions(entry.name, distractors, rng),
    explanation: `This is ${entry.name}.`,
    renderMode: 'animated',
    render: { steps, algorithmType: entry.type, themeId: entry.themeId, metadata: entry.metadata },
  }
}
```

- [ ] **Step 8: Run test** — `node scripts/test-generators.mjs` → Expected: `OK test-generators`
- [ ] **Step 9: Commit** — `git add src/game/challenges scripts/test-generators.mjs && git commit -m "feat: four challenge generators (complexity, nextOp, finalOutput, nameAlgorithm)"`

---

### Task 5: `pool.js` — eligible-algorithm pool (Vite glob)

**Files:**
- Create: `src/game/pool.js`
- Modify: none (verified by build + Task 6 session)

**Interfaces:**
- Consumes: `src/data/algorithmRegistry.json` (category → [algorithmId]), `src/data/categories.json` (id, name, theme).
- Produces:
  - `buildPool(selectedCategoryIds?) → PoolMeta[]` — `PoolMeta = { categoryId, algorithmId, name, type, themeId, hasSteps }` (sync; from eager metadata glob). `selectedCategoryIds` undefined/empty ⇒ all.
  - `loadEntry(poolMeta) → Promise<{ ...poolMeta, metadata, generateSteps|null }>` — dynamic import of metadata.json + steps.js.
  - `allNames(pool) → string[]` — for name-the-algorithm distractors.

- [ ] **Step 1: Implement `pool.js`**

```js
// src/game/pool.js
import registry from '../data/algorithmRegistry.json'
import categories from '../data/categories.json'

const metaModules  = import.meta.glob('../algorithms/**/metadata.json', { eager: true })
const stepsLoaders = import.meta.glob('../algorithms/**/steps.js')          // lazy

const themeOf = (categoryId) => (categories.find(c => c.id === categoryId)?.theme) || 'circuit'
const metaPath  = (c, a) => `../algorithms/${c}/${a}/metadata.json`
const stepsPath = (c, a) => `../algorithms/${c}/${a}/steps.js`

export function buildPool(selectedCategoryIds) {
  const cats = (selectedCategoryIds && selectedCategoryIds.length)
    ? selectedCategoryIds
    : Object.keys(registry)
  const pool = []
  for (const categoryId of cats) {
    for (const algorithmId of (registry[categoryId] || [])) {
      const meta = metaModules[metaPath(categoryId, algorithmId)]
      const metadata = meta?.default || meta
      if (!metadata) continue
      pool.push({
        categoryId, algorithmId,
        name: metadata.name, type: metadata.type,
        themeId: themeOf(categoryId),
        hasSteps: !!stepsLoaders[stepsPath(categoryId, algorithmId)],
      })
    }
  }
  return pool
}

export async function loadEntry(pm) {
  const meta = metaModules[metaPath(pm.categoryId, pm.algorithmId)]
  const metadata = meta?.default || meta
  let generateSteps = null
  const loader = stepsLoaders[stepsPath(pm.categoryId, pm.algorithmId)]
  if (loader) {
    try { generateSteps = (await loader()).generateSteps || null } catch { generateSteps = null }
  }
  return { ...pm, metadata, generateSteps }
}

export const allNames = (pool) => pool.map(p => p.name)
```

- [ ] **Step 2: Verify build** — `npm run build` → success (glob resolves; `/play` not wired yet, so add a temporary `console.log(buildPool().length)` only if needed, then remove). Expected: builds clean.
- [ ] **Step 3: Commit** — `git add src/game/pool.js && git commit -m "feat: game algorithm pool (glob-backed)"`

---

### Task 6: `session.js` — session controller

**Files:**
- Create: `src/game/session.js`
- Test: `scripts/test-session.mjs` (inject fake pool/loader/generators — no glob)

**Interfaces:**
- Produces:
  - `createSession({ mode:'endless'|'rounds', categoryIds, roundLength }) → Session` where `Session = { mode, roundLength, score, streak, bestStreak, index, total, perType, over }`.
  - `scoreAnswer(session, isCorrect) → Session` (pure; returns next session state: endless → streak reset on wrong, score `+10 + 2*streak` on correct; rounds → increment index/perType, set `over` when index === total).
  - `loadBest() → { bestScore, bestStreak }` and `saveBest(session)` (localStorage `algoflow-play`, try/catch).
  - The React page owns challenge fetching (pick entry+type, `loadEntry`, generate, re-roll); `pickChallengeType(entry, rng)` helper lives here returning an ordered list of applicable types.

- [ ] **Step 1: Write node test**

```js
// scripts/test-session.mjs
import assert from 'node:assert'
import { createSession, scoreAnswer } from '../src/game/session.js'
let s = createSession({ mode:'endless' })
s = scoreAnswer(s, true)   // +10, streak 1
assert.strictEqual(s.score, 10); assert.strictEqual(s.streak, 1)
s = scoreAnswer(s, true)   // +10 + 2*1 = 12 → 22, streak 2
assert.strictEqual(s.score, 22); assert.strictEqual(s.streak, 2)
s = scoreAnswer(s, false)  // streak resets, score stays
assert.strictEqual(s.score, 22); assert.strictEqual(s.streak, 0)

let r = createSession({ mode:'rounds', roundLength: 2 })
r = scoreAnswer(r, true); assert.strictEqual(r.over, false)
r = scoreAnswer(r, false); assert.strictEqual(r.over, true); assert.strictEqual(r.score, 1)
console.log('OK test-session')
```

- [ ] **Step 2: Run to confirm fail** — `node scripts/test-session.mjs` → FAIL
- [ ] **Step 3: Implement `session.js`**

```js
// src/game/session.js
const KEY = 'algoflow-play'
export function createSession({ mode, categoryIds = [], roundLength = 10 }) {
  return { mode, categoryIds, roundLength: mode === 'rounds' ? roundLength : 0,
    score: 0, streak: 0, maxStreak: 0, index: 0, total: mode === 'rounds' ? roundLength : 0,
    perType: {}, over: false }
}
export function scoreAnswer(s, isCorrect) {
  const next = { ...s, perType: { ...s.perType } }
  if (s.mode === 'endless') {
    if (isCorrect) {
      next.score = s.score + 10 + 2 * s.streak
      next.streak = s.streak + 1
      next.maxStreak = Math.max(s.maxStreak, next.streak)
    } else next.streak = 0
  } else {
    if (isCorrect) next.score = s.score + 1
    next.index = s.index + 1
    next.over = next.index >= s.total
  }
  return next
}
export function recordType(s, type, isCorrect) {
  const cur = s.perType[type] || { correct: 0, total: 0 }
  return { ...s, perType: { ...s.perType, [type]: { correct: cur.correct + (isCorrect?1:0), total: cur.total + 1 } } }
}
export function loadBest() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { bestScore:0, bestStreak:0 } }
  catch { return { bestScore:0, bestStreak:0 } }
}
export function saveBest(session) {
  try {
    const b = loadBest()
    const next = { bestScore: Math.max(b.bestScore, session.score), bestStreak: Math.max(b.bestStreak, session.maxStreak || 0) }
    localStorage.setItem(KEY, JSON.stringify(next)); return next
  } catch { return null }
}
export const ALL_TYPES = ['nextOp','complexity','nameAlgorithm','finalOutput']
export function applicableTypes(entry) {
  const t = ['complexity']
  if (entry.hasSteps) t.push('nextOp','nameAlgorithm','finalOutput')
  return t
}
```

- [ ] **Step 4: Run test** — `node scripts/test-session.mjs` → `OK test-session`
- [ ] **Step 5: Commit** — `git add src/game/session.js scripts/test-session.mjs && git commit -m "feat: game session controller + scoring"`

---

### Task 7: Game UI components

**Files:**
- Create: `src/components/game/GameSetup.jsx`, `src/components/game/ScoreBar.jsx`, `src/components/game/ChallengeCard.jsx`, `src/components/game/GameSummary.jsx`

**Interfaces:**
- Consumes: `Challenge` (Task 4), `Session` (Task 6), `buildPool`/`categories` for the topic picker, `VISUALIZER_MAP` (Task 2) for `frozen`/`animated` renders.
- Produces (props):
  - `GameSetup({ onStart })` → `onStart({ mode, categoryIds, roundLength })`
  - `ScoreBar({ session })` → shows score/streak/best (endless) or `index/total` (rounds)
  - `ChallengeCard({ challenge, answered, selectedIndex, onSelect, onNext })`
  - `GameSummary({ session, onPlayAgain, onChangeSettings })`

- [ ] **Step 1: `ChallengeCard.jsx`** — renders `challenge.prompt`, an optional render area by `renderMode`, the shuffled option buttons, and (once `answered`) the ✓/✗ + `challenge.explanation` + a Next button. Render area:
  - `none` → nothing.
  - `input` → a mono chip showing `challenge.render.inputText`.
  - `frozen` → `<Suspense fallback={spinner}><Viz step={render.step} themeId metadata /></Suspense>` using `VISUALIZER_MAP[render.algorithmType] || ArrayVisualizer`.
  - `animated` → same Viz but cycle `render.steps` with a `setInterval` (500ms, cleared on unmount / answer), passing the current step.
  - Option buttons: before answer, neutral (theme vars); after answer, correct = green (`--chip-green-text` bg tint), chosen-wrong = red, using inline styles with the Phase-1 vars. All buttons `type="button"`, `aria-pressed`, keyboard focusable.

```jsx
// key structure — full colors via var(--chrome-*)/var(--page-*)/var(--chip-*)
import { Suspense, useEffect, useState } from 'react'
import { VISUALIZER_MAP } from '../Visualizer/visualizerMap'
function VizFrozen({ render }) {
  const Viz = VISUALIZER_MAP[render.algorithmType] || VISUALIZER_MAP.array
  return <Suspense fallback={<Spinner/>}><Viz step={render.step} themeId={render.themeId} metadata={render.metadata} /></Suspense>
}
function VizAnimated({ render }) {
  const [i, setI] = useState(0)
  useEffect(() => { const id = setInterval(() => setI(v => (v+1) % render.steps.length), 500); return () => clearInterval(id) }, [render])
  const Viz = VISUALIZER_MAP[render.algorithmType] || VISUALIZER_MAP.array
  return <Suspense fallback={<Spinner/>}><Viz step={render.steps[i]} themeId={render.themeId} metadata={render.metadata} /></Suspense>
}
```

- [ ] **Step 2: `GameSetup.jsx`** — mode segmented control (Endless / Rounds), a category multi-select (chips from `categories.json`, "All" toggles), round-length selector (5/10/20) shown only for Rounds, and a Start button calling `onStart`. Theme-aware.
- [ ] **Step 3: `ScoreBar.jsx`** — endless: `Score {score} · Streak {streak}🔥 · Best {best}` + an "End run" button (wired by the page); rounds: `Question {index+1} / {total} · Score {score}`.
- [ ] **Step 4: `GameSummary.jsx`** — endless: final score, best streak (+ "New best!" when applicable); rounds: `score/total` + per-type breakdown from `session.perType`; buttons "Play again" / "Change settings".
- [ ] **Step 5: Verify build** — `npm run build` → success.
- [ ] **Step 6: Commit** — `git add src/components/game && git commit -m "feat: Test Yourself game UI components"`

---

### Task 8: `TestYourself.jsx` page + state machine

**Files:**
- Create: `src/pages/TestYourself.jsx`

**Interfaces:**
- Consumes: `buildPool`/`loadEntry`/`allNames` (pool), `createSession`/`scoreAnswer`/`recordType`/`applicableTypes`/`saveBest`/`loadBest` (session), the four generators, the four UI components, `Seo`.
- Behavior: state `phase ∈ {'setup','playing','summary'}`; on Start → build pool for topics, `createSession`, fetch first challenge; `getNextChallenge()` picks a random pool entry, a random applicable type, `loadEntry`, calls the matching generator (with `allNames` for nameAlgorithm), re-rolls up to N times if it returns null; on answer → `scoreAnswer` + `recordType`, reveal; Next → fetch next or (rounds `over`) go to summary; endless "End run" → `saveBest` then summary.

- [ ] **Step 1: Implement the page** with a `getNextChallenge(session, pool)` async helper:

```jsx
const GENERATORS = {
  complexity: (e) => generateComplexity(e),
  nextOp:     (e) => e.generateSteps ? generateNextOp(e, e.generateSteps(defaultInputFor(e))) : null,
  finalOutput:(e) => e.generateSteps ? generateFinalOutput(e, e.generateSteps(defaultInputFor(e))) : null,
  nameAlgorithm: (e, names) => e.generateSteps ? generateNameAlgorithm(e, e.generateSteps(defaultInputFor(e)), names) : null,
}
async function getNextChallenge(pool, names) {
  for (let tries = 0; tries < 25; tries++) {
    const pm = pool[Math.floor(Math.random() * pool.length)]
    const entry = await loadEntry(pm)
    const types = applicableTypes(pm)
    const type = types[Math.floor(Math.random() * types.length)]
    const ch = GENERATORS[type](entry, names)
    if (ch) return ch
  }
  return generateComplexity(await loadEntry(pool[0]))  // guaranteed-buildable fallback
}
```
- `defaultInputFor(entry)` reuses the default-input logic from `Algorithm.jsx` (`getDefaultInput`) — extract it into `src/game/defaultInput.js` and import in BOTH `Algorithm.jsx` and here (small shared helper; do the extraction in this step).
- Render `<Seo title="Test Yourself" description="Practice algorithms with predict-the-next-step challenges, complexity quizzes, and more." />` + the phase's component.

- [ ] **Step 2: Verify build** — `npm run build` → success.
- [ ] **Step 3: Commit** — `git add src/pages/TestYourself.jsx src/game/defaultInput.js src/pages/Algorithm.jsx && git commit -m "feat: Test Yourself page state machine"`

---

### Task 9: Route + nav wiring

**Files:**
- Modify: `src/App.jsx` (lazy route `/play`), `src/components/Layout/Header.jsx` (nav button both variants)

- [ ] **Step 1: Add lazy route** in `App.jsx`:

```jsx
const TestYourself = lazy(() => import('./pages/TestYourself'))
// inside <Routes>:
<Route path="/play" element={<TestYourself />} />
```

- [ ] **Step 2: Add nav button** — in `Header.jsx` add a `playBtn(big)` mirroring `interviewBtn`, using `navigate('/play')` and a `Gamepad2` icon from lucide-react; render it in both header variants next to Interview/Discussion.
- [ ] **Step 3: Verify** — `npm run build` (new `TestYourself` chunk emitted) and `npm run lint` (≤ baseline).
- [ ] **Step 4: Commit** — `git add src/App.jsx src/components/Layout/Header.jsx && git commit -m "feat: /play route + Test Yourself nav"`

---

### Task 10: Full verification pass

- [ ] **Step 1: Run all node tests** — `node scripts/test-step-explain.mjs && node scripts/test-describe-step.mjs && node scripts/test-generators.mjs && node scripts/test-session.mjs` → all print `OK ...`
- [ ] **Step 2: Build** — `npm run build` → no chunk-size warning; `/play` + game chunks present.
- [ ] **Step 3: Lint** — `npm run lint` → problem count ≤ 36 baseline (compare via `git stash` if needed).
- [ ] **Step 4: Manual smoke (dev)** — `npm run dev`; open `/play`; verify: Setup (both modes, topic filter, round length), Endless (streak resets on wrong, End run → summary, best persists across reload), Rounds (N questions, breakdown), and that all four challenge types appear and render (frozen board, animation, complexity, input). Check light + dark themes.
- [ ] **Step 5: Commit any fixes** — `git add -A && git commit -m "test: Phase 2 verification fixes"` (only if fixes were needed)

---

## Self-review notes (addressed)

- **Spec coverage:** setup/two-modes/topic-filter (Tasks 7–8), four generators (Task 4), reuse extractions (Tasks 1–2, plus `defaultInput` in Task 8), scoring/persistence (Task 6), route/nav/Seo (Tasks 8–9), theme-aware (Task 7), coverage logging (pool `hasSteps` + applicability) — all mapped.
- **Applicability reality:** `nextOp`/`finalOutput`/`nameAlgorithm` require `hasSteps`; `nextOp`/`finalOutput` additionally return null when steps aren't typed / have no derivable result — the page re-rolls, and `complexity` is the always-buildable fallback. This is intentional, not a gap.
- **Type consistency:** `Challenge`, `entry`, `Session`, and generator signatures are used identically across Tasks 4–8.
- **No test framework:** pure logic is covered by node `.mjs` assertion scripts; glob/UI verified by build + manual (documented, not hidden).
