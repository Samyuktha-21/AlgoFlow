/*
 * Side-by-side comparison of two algorithms on the same input — Item 1 of
 * docs/NEXT_FEATURES.md. Pure, node-loadable.
 *
 * THE ALIGNMENT DECISION
 * ----------------------
 * The plan is emphatic that this has to be settled before any UI, because it
 * determines the data model. Step i on the left is not the same moment as step
 * i on the right: on the shared sorting input, bubble sort emits 71 steps and
 * heap sort 41, and neither number means anything on its own. Playing them on
 * a shared clock would just show two unrelated animations at different speeds.
 *
 * Three axes were on the table. The choice, and why:
 *
 *   operation  (DEFAULT) — align on the n-th step that actually does
 *       something, using the op kinds from src/game/classifyStep.js. This is
 *       the only axis defined for every pair the picker can offer: two graph
 *       algorithms have no array mutations, two DP algorithms have no
 *       comparisons. It also skips the narration-only steps that make up 18.5%
 *       of the corpus, so the two sides stay on comparable ground.
 *
 *   mutation — align on the n-th write to the data (swap / overwrite /
 *       rearrange / memo-write). The sharpest axis for "these two sort the
 *       same array differently", because every frame is a visible change.
 *       Offered when both runs have writes.
 *
 *   comparison — align on the n-th compare. The classic axis for teaching
 *       sorting cost, and the one the plan named first. Offered when both
 *       runs actually emit comparisons, which is a minority of pairs — the
 *       corpus only classifies 158 steps as `compare` in total.
 *
 * Rejected: two independent clocks. It is the cheapest and, as the plan says,
 * the least illuminating — with nothing tying the sides together, "where did
 * they diverge" has no answer to give.
 *
 * Alignment is by ordinal, not by timestamp: frame k pairs the k-th qualifying
 * step on the left with the k-th on the right. When one side runs out, its
 * half of the frame is null and the panel holds its last state — that is the
 * honest rendering of "this one finished first", which is itself the point for
 * a pair like bubble sort vs heap sort.
 */

import { classifySteps } from './classifyStep.js'

export const AXES = {
  operation: {
    id: 'operation',
    label: 'Each operation',
    hint: 'Frame by frame, every step that changes something.',
    kinds: null, // null = any informative kind
  },
  mutation: {
    id: 'mutation',
    label: 'Each write',
    hint: 'Only the steps that change the data.',
    kinds: new Set(['swap', 'overwrite', 'rearrange', 'memo-write', 'relink', 'place', 'relax']),
  },
  comparison: {
    id: 'comparison',
    label: 'Each comparison',
    hint: 'Only the steps that weigh two elements.',
    kinds: new Set(['compare']),
  },
}

/* Kinds that carry no operation — excluded from the default axis. Kept here
   rather than imported so the axis definition is readable in one place. */
const INERT = new Set(['init', 'no-op', 'unknown', 'inspect'])

/** Indices of the steps in `steps` that qualify for `axis`. */
export function axisIndices(steps, axis, kinds) {
  const k = kinds || classifySteps(steps)
  const spec = AXES[axis] || AXES.operation
  const out = []
  for (let i = 0; i < k.length; i++) {
    if (spec.kinds ? spec.kinds.has(k[i]) : !INERT.has(k[i])) out.push(i)
  }
  return out
}

/**
 * Whether a run has anything to compare at all. Three generators in the
 * corpus — fundamentals/gcd, hashing/lruCacheHash and
 * linked-lists/flattenLinkedList — advance only their narration: every step
 * leaves every renderable field untouched, so the learner watching them sees
 * one static picture for the whole run. They cannot be aligned against
 * anything, and the picker must not offer them. Checked against real steps
 * rather than listed by name, so a fourth one cannot slip in unnoticed.
 */
export function isComparableRun(steps, kinds) {
  return axisIndices(steps, 'operation', kinds).length > 0
}

/** Which axes make sense for this pair — both sides must have frames on it. */
export function availableAxes(stepsA, stepsB, kindsA, kindsB) {
  const ka = kindsA || classifySteps(stepsA)
  const kb = kindsB || classifySteps(stepsB)
  return Object.keys(AXES).filter(id =>
    axisIndices(stepsA, id, ka).length > 0 && axisIndices(stepsB, id, kb).length > 0)
}

/* Two states are comparable when both sides expose the same primary field.
   Returns null when there is nothing meaningful to compare, so the caller can
   say "no comparable state" instead of claiming a false divergence. */
function comparableState(step) {
  if (!step) return null
  if (Array.isArray(step.array)) return { field: 'array', value: step.array }
  if (Array.isArray(step.visited)) return { field: 'visited', value: step.visited }
  if (Array.isArray(step.result)) return { field: 'result', value: step.result }
  if (Array.isArray(step.traversalOrder)) return { field: 'traversalOrder', value: step.traversalOrder }
  return null
}

const sameSeq = (x, y) => {
  if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length) return false
  for (let i = 0; i < x.length; i++) if (String(x[i]) !== String(y[i])) return false
  return true
}

/* Does `field` ever take a different value across this run? */
function changesOver(steps, field) {
  const first = steps.find(s => Array.isArray(s?.[field]))?.[field]
  if (!first) return false
  return steps.some(s => Array.isArray(s?.[field]) && !sameSeq(s[field], first))
}

/**
 * Build the frame list for two runs on one axis.
 *
 * @returns {{
 *   axis: string,
 *   frames: Array<{ a: number|null, b: number|null, diverged: boolean, field: string|null }>,
 *   divergeAt: number|null,   // first frame index where the two states differ
 *   counts: { a: number, b: number },
 * }}
 */
export function buildAlignment(stepsA, stepsB, axis = 'operation', opts = {}) {
  const empty = { axis, frames: [], divergeAt: null, comparedField: null, fieldStatic: false, counts: { a: 0, b: 0 } }
  if (!Array.isArray(stepsA) || !Array.isArray(stepsB)) return empty
  const kindsA = opts.kindsA || classifySteps(stepsA)
  const kindsB = opts.kindsB || classifySteps(stepsB)
  const ia = axisIndices(stepsA, axis, kindsA)
  const ib = axisIndices(stepsB, axis, kindsB)
  if (!ia.length && !ib.length) return empty

  const n = Math.max(ia.length, ib.length)
  const frames = []
  let divergeAt = null

  for (let k = 0; k < n; k++) {
    const a = k < ia.length ? ia[k] : null
    const b = k < ib.length ? ib[k] : null
    const sa = comparableState(a === null ? stepsA[stepsA.length - 1] : stepsA[a])
    const sb = comparableState(b === null ? stepsB[stepsB.length - 1] : stepsB[b])
    let diverged = false
    let field = null
    if (sa && sb && sa.field === sb.field) {
      field = sa.field
      diverged = !sameSeq(sa.value, sb.value)
    }
    if (diverged && divergeAt === null) divergeAt = k
    frames.push({ a, b, diverged, field })
  }

  /* Whether the field being compared ever moves at all. Binary search and
     linear search both leave `array` untouched from first step to last, so
     "they never diverge" would be true but misleading — the real difference
     between them is that one does 7 operations and the other 12. The caller
     needs to be able to tell those two cases apart. */
  const comparedField = frames.find(f => f.field)?.field || null
  const fieldStatic = comparedField !== null && !changesOver(stepsA, comparedField) && !changesOver(stepsB, comparedField)

  return { axis, frames, divergeAt, comparedField, fieldStatic, counts: { a: ia.length, b: ib.length } }
}

/**
 * Whether two pool entries can be run against each other. getDefaultInput keys
 * off algorithm *type*, so same-type entries already receive byte-identical
 * input — except when one of them ships its own metadata.defaultInput, which
 * overrides the shared default and makes the two runs incomparable unless the
 * caller passes an explicit override.
 */
const hasPreset = (p) =>
  p?.presetInput === true || typeof p?.metadata?.defaultInput === 'string'

export function canPair(a, b, { allowPresetInput = false } = {}) {
  if (!a || !b) return false
  if (a.algorithmId === b.algorithmId && a.categoryId === b.categoryId) return false
  if (!a.hasSteps || !b.hasSteps) return false
  if (a.type !== b.type) return false
  if (!allowPresetInput && (hasPreset(a) || hasPreset(b))) return false
  return true
}

/** Every entry in `pool` that can be paired with `entry`. */
export function partnersFor(pool, entry, opts) {
  if (!entry) return []
  return (pool || []).filter(p => canPair(entry, p, opts))
}

/** Types with at least two pairable members — what the picker can offer. */
export function pairableTypes(pool) {
  const byType = new Map()
  for (const p of pool || []) {
    if (!p.hasSteps) continue
    if (hasPreset(p)) continue
    if (!byType.has(p.type)) byType.set(p.type, [])
    byType.get(p.type).push(p)
  }
  return [...byType].filter(([, v]) => v.length >= 2).map(([k]) => k)
}
