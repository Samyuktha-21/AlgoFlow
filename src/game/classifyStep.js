/*
 * Infers *what kind of operation* a visualization step performed, by diffing
 * it against the step before it. Pure, node-loadable (explicit .js extensions,
 * no Vite-only imports) so the audit scripts can require it.
 *
 * Why diff instead of retrofitting `type:` into the generators: all 124
 * steps.js files currently pass six audits. Editing every one of them to add a
 * field risks regressions across audited code for no functional gain, and a
 * classifier works retroactively on all 124 at once.
 *
 * A note on `step.type`, because the plan for this module got it wrong: six
 * generators do emit `type:`, but the values are 'nqueens' and 'sudoku' —
 * a *visualizer* discriminator, not an op kind. There is no ground-truth op
 * type anywhere in the codebase, which is also why `typedLabel()` in
 * describeStep.js returns null for all 124 algorithms, not just 118. The one
 * genuine op signal those six carry is the boolean `backtracking` flag, and
 * this module reads that.
 *
 * Returns 'unknown' rather than guessing. Callers must handle it.
 */

/* ---------- op kinds ---------- */

export const OP_KINDS = [
  'init',           // the opening step of a run
  'swap',           // two array cells exchanged values
  'overwrite',      // one array cell took a new value
  'rearrange',      // three or more cells moved at once (merge writeback, rotation)
  'compare',        // two elements weighed against each other, nothing written
  'advance-pointer',// a named pointer / cursor / index moved
  'inspect',        // the highlight moved but no state changed
  'mark-sorted',    // a position was locked as final
  'narrow-range',   // a search interval shrank (low/high/mid, eliminated)
  'found',          // the search target was located
  'visit',          // a graph/tree node was marked visited
  'enqueue',        // something entered the queue
  'dequeue',        // something left the queue
  'push',           // something entered the stack
  'pop',            // something left the stack
  'relax',          // a shortest-path distance improved
  'tree-link',      // an edge was added to the spanning/search tree
  'relink',         // a linked-list `next` pointer was rewritten
  'place',          // a candidate was written onto the board
  'backtrack',      // a candidate was withdrawn / recursion unwound
  'memo-write',     // a DP table cell was computed
  'memo-read',      // the DP cursor moved without computing
  'emit',           // a value was appended to the result
  'no-op',          // nothing observable changed
  'unknown',        // no signal matched
]

/* Short human labels, for weakness panels and option explanations. */
export const OP_KIND_LABELS = {
  'init': 'set up',
  'swap': 'swap',
  'overwrite': 'overwrite a cell',
  'rearrange': 'rewrite a range',
  'compare': 'compare',
  'advance-pointer': 'move a pointer',
  'inspect': 'look at a cell',
  'mark-sorted': 'lock a position',
  'narrow-range': 'narrow the search',
  'found': 'find the target',
  'visit': 'visit a node',
  'enqueue': 'enqueue',
  'dequeue': 'dequeue',
  'push': 'push',
  'pop': 'pop',
  'relax': 'relax an edge',
  'tree-link': 'add a tree edge',
  'relink': 'rewrite a link',
  'place': 'place a candidate',
  'backtrack': 'backtrack',
  'memo-write': 'fill a table cell',
  'memo-read': 'read the table',
  'emit': 'record a result',
  'no-op': 'no change',
  'unknown': 'something else',
}

/* ---------- small diff helpers ---------- */

const isArr = Array.isArray
const len = (a) => (isArr(a) ? a.length : 0)

/* Indices where two flat arrays differ. Bails at `cap` so a 2500-cell grid
   diff cannot dominate a classification that only needs "more than two". */
function diffIndices(a, b, cap = 8) {
  if (!isArr(a) || !isArr(b)) return null
  if (a.length !== b.length) return null
  const out = []
  for (let i = 0; i < a.length; i++) {
    if (!sameVal(a[i], b[i])) {
      out.push(i)
      if (out.length > cap) return out
    }
  }
  return out
}

function sameVal(x, y) {
  if (x === y) return true
  if (isArr(x) && isArr(y)) {
    if (x.length !== y.length) return false
    for (let i = 0; i < x.length; i++) if (!sameVal(x[i], y[i])) return false
    return true
  }
  if (x && y && typeof x === 'object' && typeof y === 'object') {
    const kx = Object.keys(x), ky = Object.keys(y)
    if (kx.length !== ky.length) return false
    for (const k of kx) if (!sameVal(x[k], y[k])) return false
    return true
  }
  return false
}

/* An exchange: a[i],a[j] became a[j],a[i]. */
function isExchange(a, b, i, j) {
  return sameVal(a[i], b[j]) && sameVal(a[j], b[i]) && !sameVal(a[i], a[j])
}

/* Cells that changed in a 2-D table, capped the same way. */
function diffCells(a, b, cap = 4) {
  if (!isArr(a) || !isArr(b) || a.length !== b.length) return null
  const out = []
  for (let r = 0; r < a.length; r++) {
    const ra = a[r], rb = b[r]
    if (!isArr(ra) || !isArr(rb) || ra.length !== rb.length) return null
    for (let c = 0; c < ra.length; c++) {
      if (!sameVal(ra[c], rb[c])) {
        out.push([r, c])
        if (out.length > cap) return out
      }
    }
  }
  return out
}

/* `distances` is an object keyed by node id, values number|null (null = ∞). */
function distanceImproved(prev, next) {
  if (!prev || !next || typeof prev !== 'object' || typeof next !== 'object') return false
  for (const k of Object.keys(next)) {
    const a = prev[k], b = next[k]
    if (b === null || b === undefined) continue
    if (a === null || a === undefined) return true          // ∞ → finite
    if (typeof a === 'number' && typeof b === 'number' && b < a) return true
  }
  return false
}

/* Pointers come in two shapes across the codebase: [{index,label}] for arrays
   and [{nodeId,label}] for linked lists. Both are positional. */
function pointersMoved(prev, next) {
  if (!isArr(prev) || !isArr(next)) return false
  if (prev.length !== next.length) return true
  for (let i = 0; i < next.length; i++) {
    const a = prev[i] || {}, b = next[i] || {}
    if (a.index !== b.index || a.nodeId !== b.nodeId) return true
  }
  return false
}

/* Linked-list rewiring: any node's `next` changed. */
function linksRewritten(prev, next) {
  if (!isArr(prev) || !isArr(next) || prev.length !== next.length) return false
  for (let i = 0; i < next.length; i++) {
    const a = prev[i] || {}, b = next[i] || {}
    if (a.next !== undefined && a.next !== b.next) return true
  }
  return false
}

const grew   = (p, n) => len(n) > len(p)
const shrank = (p, n) => len(n) < len(p)

/* A board cell is "empty" at 0; nQueens uses 2 for a trial and -1 for a
   rejected cell, sudoku writes digits. Withdrawal is any cell going back to
   empty or to the rejected marker. */
function boardDelta(prev, next) {
  const cells = diffCells(prev, next)
  if (!cells || !cells.length) return null
  let placed = false, cleared = false
  for (const [r, c] of cells) {
    const a = prev[r][c], b = next[r][c]
    const aEmpty = a === 0 || a === '' || a === null || a === -1
    const bEmpty = b === 0 || b === '' || b === null || b === -1
    if (aEmpty && !bEmpty) placed = true
    else if (!aEmpty && bEmpty) cleared = true
    else if (!aEmpty && !bEmpty) placed = true
  }
  if (cleared) return 'backtrack'
  if (placed) return 'place'
  return null
}

/* ---------- the classifier ---------- */

/**
 * Classify one transition.
 * @param {object|null} prev the step before (null for index 0)
 * @param {object} step the step to classify
 * @returns {string} one of OP_KINDS
 */
export function classifyTransition(prev, step) {
  if (!step || typeof step !== 'object') return 'unknown'
  if (!prev) return 'init'

  /* 1. The array itself moved. This outranks everything else: if a cell
        changed value, that is what the step did, whatever else also moved. */
  const ad = diffIndices(prev.array, step.array)
  if (ad && ad.length) {
    if (ad.length === 2 && isExchange(prev.array, step.array, ad[0], ad[1])) return 'swap'
    if (ad.length === 1) return 'overwrite'
    if (ad.length === 2) return 'overwrite'
    return 'rearrange'
  }

  /* 1b. The secondary array (`array2`) is a real data array too — the string
         algorithms keep the pattern and its computed tables there. */
  const a2d = diffIndices(prev.array2, step.array2)
  if (a2d && a2d.length) {
    if (a2d.length === 2 && isExchange(prev.array2, step.array2, a2d[0], a2d[1])) return 'swap'
    if (a2d.length <= 2) return 'overwrite'
    return 'rearrange'
  }

  /* 2. Backtracking boards — the one real op signal the six typed
        generators carry (see the header note about `step.type`). */
  if (step.backtracking === true && prev.backtracking !== true) return 'backtrack'
  const bd = boardDelta(prev.board, step.board)
  if (bd) return bd

  /* 3. Linked-list rewiring, before pointer movement: a step that both
        rewires and advances is about the rewire. */
  if (linksRewritten(prev.nodes, step.nodes)) return 'relink'

  /* 4. Shortest paths. Checked before visit/enqueue because a relaxation
        step in Dijkstra also touches the frontier, and the relaxation is
        the part a learner gets wrong. */
  if (distanceImproved(prev.distances, step.distances)) return 'relax'

  /* 5. Graph / tree frontier. */
  if (grew(prev.visited, step.visited)) return 'visit'
  if (grew(prev.treeEdges, step.treeEdges)) return 'tree-link'
  if (grew(prev.queue, step.queue)) return 'enqueue'
  if (shrank(prev.queue, step.queue)) return 'dequeue'
  if (grew(prev.stack, step.stack)) return 'push'
  if (shrank(prev.stack, step.stack)) return 'pop'
  if (grew(prev.stack2, step.stack2)) return 'push'
  if (shrank(prev.stack2, step.stack2)) return 'pop'

  /* 6. DP tables. A value change or a computed-flag flip is a cell being
        filled; a cursor move with the table untouched is a read. */
  const dpCells = diffCells(prev.dp2d, step.dp2d)
  if (dpCells && dpCells.length) return 'memo-write'
  const compCells = diffCells(prev.computed2d, step.computed2d)
  if (compCells && compCells.length) return 'memo-write'
  const dp1 = diffIndices(prev.dp, step.dp)
  if (dp1 && dp1.length) return 'memo-write'
  const comp1 = diffIndices(prev.computed, step.computed)
  if (comp1 && comp1.length) return 'memo-write'

  /* 6b. Several string algorithms have no room in the state shape for the
         table they are building, so they render it into the caption instead —
         KMP's LPS array lives in `array2Label`. A caption that changes is a
         stored value being rewritten, not decoration. `treeEdgeLabel` is
         static in every generator that sets it, so it costs nothing to check. */
  if (prev.array2Label !== step.array2Label) return 'overwrite'
  if (prev.stackLabel !== step.stackLabel) return 'overwrite'
  if (prev.stack2Label !== step.stack2Label) return 'overwrite'
  if (prev.treeEdgeLabel !== step.treeEdgeLabel) return 'overwrite'

  /* 7. Sorting bookkeeping. */
  if (grew(prev.sorted, step.sorted)) return 'mark-sorted'
  if (grew(prev.reversed, step.reversed)) return 'relink'

  /* 8. Announce-style fields. Sorting and heap generators set `swapping` on
        the step that declares the swap and apply it on the next one, so the
        declaration has to be caught here rather than by an array diff. */
  if (len(step.swapping) >= 2 && !sameVal(prev.swapping, step.swapping)) return 'swap'
  if (len(step.comparing) >= 1 && !sameVal(prev.comparing, step.comparing)) return 'compare'

  /* 9. Search intervals. */
  if (step.found !== undefined && step.found >= 0 && !(prev.found >= 0)) return 'found'
  if (grew(prev.eliminated, step.eliminated)) return 'narrow-range'
  if (prev.low !== step.low || prev.high !== step.high) return 'narrow-range'
  if (prev.mid !== step.mid) return 'advance-pointer'

  /* 10. Results. */
  if (grew(prev.result, step.result)) return 'emit'
  if (grew(prev.traversalOrder, step.traversalOrder)) return 'emit'

  /* 11. Cursors. */
  if (pointersMoved(prev.pointers, step.pointers)) return 'advance-pointer'
  if (prev.current !== step.current && !sameVal(prev.current, step.current)) return 'advance-pointer'
  if (!sameVal(prev.cell, step.cell)) return 'memo-read'

  /* 12. Nothing changed but the spotlight. */
  if (!sameVal(prev.highlight, step.highlight)) return 'inspect'
  if (!sameVal(prev.highlighted, step.highlighted)) return 'inspect'
  if (!sameVal(prev.conflicts, step.conflicts)) return 'inspect'
  if (!sameVal(prev.window, step.window)) return 'inspect'
  if (!sameVal(prev.extra, step.extra)) return 'inspect'
  if (prev.heapSize !== step.heapSize) return 'inspect'

  /* 13. Same state, new narration — a generator explaining itself without
         moving anything the visualizer can show. Common in the string and
         shortest-path generators, where "consider this edge" and "compare
         these characters" carry no renderable state. A step identical to its
         predecessor in every field lands here too; it is a no-op by
         definition, not an unclassified case. */
  if (prev.codeLine !== step.codeLine || prev.description !== step.description) return 'no-op'
  if (sameVal(prev, step)) return 'no-op'

  return 'unknown'
}

/**
 * Classify every step in a run.
 * @param {Array<object>} steps
 * @returns {Array<string>} kinds, index-aligned with `steps`
 */
export function classifySteps(steps) {
  if (!Array.isArray(steps)) return []
  const out = new Array(steps.length)
  for (let i = 0; i < steps.length; i++) {
    out[i] = classifyTransition(i === 0 ? null : steps[i - 1], steps[i])
  }
  return out
}

/**
 * The op kind of the step at index `i` in a run — the form the game wants
 * when it freezes a question at `i` and asks about `i + 1`.
 */
export function classifyStep(steps, i) {
  if (!Array.isArray(steps) || i < 0 || i >= steps.length) return 'unknown'
  return classifyTransition(i === 0 ? null : steps[i - 1], steps[i])
}

/** Human label for an op kind, for panels and explanations. */
export function opKindLabel(kind) {
  return OP_KIND_LABELS[kind] || OP_KIND_LABELS.unknown
}

/** Kinds that carry no pedagogical signal — excluded from weakness tracking. */
export const UNINFORMATIVE_KINDS = new Set(['init', 'no-op', 'unknown', 'inspect'])

export const isInformativeKind = (kind) => !UNINFORMATIVE_KINDS.has(kind)
