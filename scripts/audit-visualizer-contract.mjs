/* Does every step actually render?

   The other audits ask whether a generator survives and reads its input. This
   asks whether what it emits is something its visualizer can draw. A step can
   be perfectly valid data and still render as a blank canvas or a crash — an
   index pointing past the end of the array, a node id no node has, a `board`
   the wrong shape — and none of the other checks would notice, because the
   generator returned steps and nobody complained.

   Which visualizer an algorithm gets comes from metadata.type via
   src/components/Visualizer/visualizerMap.js; the expectations below are read
   off what each component actually destructures and indexes.

   Usage: node scripts/audit-visualizer-contract.mjs */
import { loadAlgorithms, runDefault, argsFor } from './lib/run-algorithms.mjs'

/* Mirror of VISUALIZER_MAP. A type missing here falls through to Array, which
   is itself worth reporting. */
const VIZ = {
  sorting: 'Sort', searching: 'Search', graph: 'Graph', array: 'Array',
  'linked-list': 'LinkedList', stack: 'Stack', queue: 'Stack', 'stack-queue': 'Stack',
  tree: 'Tree', heap: 'Heap', dp: 'DP', 'dynamic-programming': 'DP',
  backtracking: 'Backtracking', greedy: 'Array', hashing: 'Array', fundamentals: 'Array',
}

const isInt = v => Number.isInteger(v)
/* -1 is this codebase's "nothing selected" sentinel. It renders harmlessly —
   no cell has index -1, so the lookups simply miss — and it is used
   deliberately all over, so it is not an out-of-range error. */
const NONE = -1

/* Each checker returns a list of complaints for one step. */
const CHECKS = {
  Array: (s) => {
    const out = []
    if (!Array.isArray(s.array)) return ['no `array` to draw']
    const n = s.array.length
    for (const key of ['comparing', 'swapping', 'sorted', 'highlight']) {
      const v = s[key]
      if (v === undefined) continue
      if (!Array.isArray(v)) { out.push(`\`${key}\` is not an array`); continue }
      for (const i of v) {
        if (i === NONE) continue
        if (!isInt(i) || i < 0 || i >= n) out.push(`\`${key}\` has index ${i} outside 0..${n - 1}`)
      }
    }
    if (s.current !== undefined && s.current !== null && s.current !== NONE
        && (!isInt(s.current) || s.current < 0 || s.current >= n)) out.push(`\`current\` ${s.current} outside 0..${n - 1}`)
    if (s.window && (!isInt(s.window.start) || !isInt(s.window.end) || s.window.start < 0 || s.window.end >= n)) {
      out.push(`\`window\` ${JSON.stringify(s.window)} outside 0..${n - 1}`)
    }
    if (Array.isArray(s.pointers)) {
      for (const p of s.pointers) {
        if (p?.index === NONE) continue
        if (!isInt(p?.index) || p.index < 0 || p.index >= n) out.push(`pointer "${p?.label}" at ${p?.index} outside 0..${n - 1}`)
      }
    }
    return out
  },
  Sort: (s) => CHECKS.Array(s),
  Search: (s) => CHECKS.Array(s),
  Stack: (s) => CHECKS.Array(s),
  Heap: (s) => (Array.isArray(s.array) || Array.isArray(s.heap) || Array.isArray(s.stack)
    ? [] : ['no `array`, `heap` or `stack` to draw']),
  DP: (s) => {
    if (Array.isArray(s.dp2d)) {
      const out = []
      if (!Array.isArray(s.rows) || !Array.isArray(s.cols)) out.push('dp2d without `rows`/`cols` labels')
      else {
        if (s.dp2d.length !== s.rows.length) out.push(`dp2d has ${s.dp2d.length} rows but ${s.rows.length} row labels`)
        for (const r of s.dp2d) if (r.length !== s.cols.length) { out.push(`a dp2d row has ${r.length} cells but ${s.cols.length} column labels`); break }
      }
      return out
    }
    return Array.isArray(s.dp) ? [] : ['no `dp` or `dp2d` to draw']
  },
  Graph: (s) => {
    const out = []
    if (!Array.isArray(s.nodes) || !s.nodes.length) return ['no `nodes` to draw']
    const ids = new Set(s.nodes.map(n => n.id))
    for (const n of s.nodes) {
      if (!Number.isFinite(n.x) || !Number.isFinite(n.y)) { out.push(`node ${n.id} has no position`); break }
    }
    if (Array.isArray(s.edges)) {
      for (const e of s.edges) {
        if (!ids.has(e.from) || !ids.has(e.to)) { out.push(`edge ${e.from}-${e.to} references a node that is not in \`nodes\``); break }
      }
    }
    for (const key of ['visited', 'queue']) {
      if (Array.isArray(s[key])) for (const id of s[key]) {
        if (!ids.has(id)) { out.push(`\`${key}\` names node ${id}, which is not in \`nodes\``); break }
      }
    }
    if (s.current !== undefined && s.current !== null && s.current !== -1 && !ids.has(s.current)) {
      out.push(`\`current\` is node ${s.current}, which is not in \`nodes\``)
    }
    return out
  },
  Tree: (s) => {
    const out = []
    if (!Array.isArray(s.nodes)) return ['no `nodes` to draw']
    if (!s.nodes.length) return []
    const ids = new Set(s.nodes.map(n => n.id))
    if (!s.nodes.some(n => n.parent == null || n.parent === -1)) out.push('no root: every node claims a parent')
    for (const n of s.nodes) {
      for (const side of ['left', 'right']) {
        if (n[side] != null && !ids.has(n[side])) { out.push(`node ${n.id}.${side} points at ${n[side]}, which is not in \`nodes\``); break }
      }
      if (n.value === undefined) { out.push(`node ${n.id} has no \`value\` to label it`); break }
    }
    for (const key of ['visited', 'highlighted']) {
      if (Array.isArray(s[key])) for (const id of s[key]) {
        if (!ids.has(id)) { out.push(`\`${key}\` names node ${id}, which is not in \`nodes\``); break }
      }
    }
    return out
  },
  LinkedList: (s) => {
    const out = []
    if (!Array.isArray(s.nodes)) return ['no `nodes` to draw']
    if (!s.nodes.length) return []
    const ids = new Set(s.nodes.map(n => n.id))
    for (const n of s.nodes) if (n.value === undefined) { out.push(`node ${n.id} has no \`value\``); break }
    if (Array.isArray(s.pointers)) for (const p of s.pointers) {
      if (p.nodeId != null && p.nodeId !== -1 && !ids.has(p.nodeId)) { out.push(`pointer "${p.label}" names node ${p.nodeId}, which is not in \`nodes\``); break }
    }
    return out
  },
  Backtracking: (s) => {
    const out = []
    if (!Array.isArray(s.board) || !s.board.length) return ['no `board` to draw']
    if (!s.board.every(r => Array.isArray(r))) return ['`board` is not a 2-D array']
    const rows = s.board.length, cols = s.board[0].length
    if (!s.board.every(r => r.length === cols)) out.push('`board` rows are not all the same width')
    const h = s.highlighted
    if (h && (h.row > rows - 1 || h.col > cols - 1)) out.push(`\`highlighted\` (${h.row},${h.col}) is off a ${rows}x${cols} board`)
    return out
  },
}

/* The default input is one shape out of many, and an index bug usually only
   shows on some data — quickSort only marked an out-of-range cell when the
   pivot landed at an end. So every algorithm that takes a plain array is also
   rendered against these. */
const EXTRA_INPUTS = [
  '3, 7', '7, 7, 7, 7', '5, 3, 5, 1, 3, 7', '1, 2, 3, 4, 5, 6, 7',
  '9, 8, 7, 6, 5, 4, 3', '-5, 3, -1, 8, -9, 2', '0, 0, 5, 0, 3',
  '64, 34, 25, 12, 22, 11, 90',
]
const PLAIN_ARRAY = new Set([undefined, null])

const all = await loadAlgorithms()
const findings = []
let checked = 0
let renders = 0

for (const e of all) {
  if (!e.gen) { findings.push(`${e.id}: no generateSteps`); continue }
  const viz = VIZ[e.meta.type]
  if (!viz) { findings.push(`${e.id}: type "${e.meta.type}" is not in VISUALIZER_MAP — silently renders as an array`); continue }
  const r = runDefault(e)
  if (r.error) { findings.push(`${e.id}: default input rejected — ${r.error}`); continue }
  if (r.thrown) { findings.push(`${e.id}: threw — ${r.thrown}`); continue }
  if (!Array.isArray(r.steps) || !r.steps.length) { findings.push(`${e.id}: produced no steps`); continue }
  checked++

  const check = CHECKS[viz]
  if (!check) continue
  const seen = new Set()

  /* One complaint per kind per algorithm — a bad index usually repeats in
     every step and would otherwise bury everything else. */
  const inspect = (steps, where) => {
    renders++
    steps.forEach((s, i) => {
      for (const complaint of check(s)) {
        if (seen.has(complaint)) continue
        seen.add(complaint)
        findings.push(`${e.id} [${viz}Visualizer] ${where} step ${i}: ${complaint}`)
      }
    })
  }
  inspect(r.steps, 'default')

  if (e.meta.type !== 'graph' && PLAIN_ARRAY.has(e.meta.inputType)) {
    for (const v of EXTRA_INPUTS) {
      const a = argsFor(e.meta, v, e.meta.type === 'searching' ? '7' : '')
      if (a.error) continue
      let steps
      try { steps = e.gen(...a.args) } catch { continue }
      if (Array.isArray(steps) && steps.length) inspect(steps, `input "${v}"`)
    }
  }
}

console.log(`${checked} algorithms rendered against their visualizer's contract.\n`)
if (findings.length) {
  console.log(`${findings.length} finding(s):\n`)
  console.log(findings.map(f => '  ' + f).join('\n'))
} else {
  console.log('No findings — every step carries what its visualizer indexes.')
}
process.exitCode = findings.length ? 1 : 0
