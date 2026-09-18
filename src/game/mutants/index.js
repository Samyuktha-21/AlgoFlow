/*
 * Buggy-variant distractors for the "what happens NEXT?" challenge — Item 2
 * of docs/NEXT_FEATURES.md, and the fix for the F2 defect it describes.
 *
 * The defect: the old buildNextOpOptions walked the run from index 0 and took
 * the first three distinct labels. Distractors were therefore always setup
 * steps, and always the same three regardless of where the question froze. A
 * learner could score by picking "the one that doesn't look like a beginning".
 *
 * What a distractor is here
 * -------------------------
 * The plan called for mutated generators: fork the algorithm with a seeded
 * bug, run it, take the step it would have produced at i+1. That cannot work
 * as written. 118 of 124 generators describe their steps in free-form prose
 * ("arr[mid]=0 -> swap(arr[lo]=1, arr[mid]=0), lo++, mid++"), and a label
 * synthesised by a mutation rule cannot match that voice. It would read as
 * obviously machine-written next to three generator sentences, and the learner
 * would spot the wrong answer by its style instead of its content — trading
 * the old positional tell for a typographic one.
 *
 * So a mutant here is a REAL step from the same run, chosen because it is the
 * step a specific misconception would have predicted. "You would see this if
 * you never advanced the pointer" is the step the run is frozen on. "You would
 * see this if your loop bound was off by one" is the step after the right one.
 * Every option is the generator's own prose, so style carries no signal, and
 * each wrong option still names the mistake it corresponds to.
 *
 * Pure, node-loadable — explicit .js extensions, no Vite-only imports.
 */

import { describeStep } from '../describeStep.js'
import { classifySteps } from '../classifyStep.js'

/* How far either side of the frozen index the fallback sampler looks before
   giving up and widening to the whole run. */
const WINDOW = 6

/* Misconception copy, keyed by rule id. Shown when a learner picks that
   option, so a wrong answer teaches the specific mistake it encodes. */
export const MISCONCEPTIONS = {
  'off-by-one': 'Off-by-one: this is what you would see if the loop ran one iteration too far and skipped the step in between.',
  'no-advance': 'Missing advance: this is the state you are looking at now. Picking it means the pointer never moved on.',
  'premature-lock': 'Premature lock: a position was marked final before the pass that decides it had finished.',
  'flipped-comparator': 'Flipped comparison: with the test the wrong way round, the algorithm would swap here instead of moving on.',
  'missed-swap': 'Flipped comparison: with the test the wrong way round, the algorithm would move on here instead of swapping.',
  'wrong-boundary': 'Right operation, wrong place: the same kind of step, but at an index an incorrect boundary would have produced.',
  'wrong-operation': 'Wrong operation: this step is something the algorithm does, but not what this state calls for next.',
  'nearby-step': 'This is a real step from this run, but not the one that follows this state.',
}

/* ---------- rules ----------
   Each rule takes the run, the frozen index, the per-step op kinds and the
   correct answer's kind, and returns an index into `steps` — the step the
   misconception would have predicted — or null when it does not apply. */

const findFrom = (kinds, from, dir, pred) => {
  for (let j = from; j >= 0 && j < kinds.length; j += dir) if (pred(kinds[j], j)) return j
  return null
}

const RULES = [
  {
    id: 'no-advance',
    /* The frozen step itself. The card renders the visual state but not its
       description (see VizFrozen in ChallengeCard.jsx), so this is a fair
       option and not a giveaway. */
    pick: (steps, i) => (i >= 0 ? i : null),
  },
  {
    id: 'off-by-one',
    pick: (steps, i) => (i + 2 < steps.length ? i + 2 : null),
  },
  {
    id: 'premature-lock',
    /* Only interesting when locking is NOT what actually happens next. */
    pick: (steps, i, kinds, correctKind) =>
      correctKind === 'mark-sorted' ? null : findFrom(kinds, i + 2, +1, k => k === 'mark-sorted'),
  },
  {
    id: 'flipped-comparator',
    /* The comparison went the other way, so a swap happens where none should. */
    pick: (steps, i, kinds, correctKind) =>
      correctKind === 'swap' ? null : findFrom(kinds, i + 2, +1, k => k === 'swap'),
  },
  {
    id: 'missed-swap',
    /* The mirror: a swap was due, but the flipped test moved on instead. */
    pick: (steps, i, kinds, correctKind) =>
      correctKind !== 'swap' ? null
        : findFrom(kinds, i + 2, +1, k => k === 'compare' || k === 'advance-pointer'),
  },
  {
    id: 'wrong-boundary',
    /* Same operation, wrong index — the shape of an off-by-one on a partition
       or window bound. Searched backwards first so it is not just i+2 again. */
    pick: (steps, i, kinds, correctKind) => {
      const back = findFrom(kinds, i - 1, -1, k => k === correctKind)
      if (back !== null) return back
      return findFrom(kinds, i + 2, +1, k => k === correctKind)
    },
  },
  {
    id: 'wrong-operation',
    /* Nearest step in either direction doing something else entirely. */
    pick: (steps, i, kinds, correctKind) => {
      for (let d = 2; d <= WINDOW; d++) {
        const after = i + d, before = i - d + 1
        if (after < kinds.length && kinds[after] !== correctKind) return after
        if (before >= 0 && kinds[before] !== correctKind) return before
      }
      return null
    },
  },
]

function shuffleRules(rules, rng) {
  const a = [...rules]
  for (let k = a.length - 1; k > 0; k--) {
    const j = Math.floor(rng() * (k + 1))
    ;[a[k], a[j]] = [a[j], a[k]]
  }
  return a
}

/**
 * Wrong answers for the question frozen at `i`, each tied to a misconception.
 *
 * @param {Array<object>} steps the full run
 * @param {number} i the frozen index; the correct answer is steps[i + 1]
 * @param {object} [opts]
 * @param {Array<string>} [opts.kinds] precomputed op kinds, to avoid re-diffing
 * @param {number} [opts.limit] how many distractors to return
 * @returns {Array<{label: string, misconception: string, rule: string}>}
 */
export function buildMutantDistractors(steps, i, opts = {}) {
  if (!Array.isArray(steps) || i < 0 || i + 1 >= steps.length) return []
  const limit = opts.limit ?? 3
  const kinds = opts.kinds || classifySteps(steps)
  const correct = describeStep(steps[i + 1])
  if (!correct) return []
  const correctKind = kinds[i + 1]

  const seen = new Set([correct])
  const out = []

  const offer = (idx, rule) => {
    if (out.length >= limit) return
    if (idx === null || idx === undefined || idx < 0 || idx >= steps.length) return
    const label = describeStep(steps[idx])
    /* A mutant that produces the correct answer's own label is discarded, not
       shown — the plan is explicit about this, and it is the whole reason the
       rules cannot be trusted blind. Two positions in a run very often carry
       identical prose. */
    if (!label || seen.has(label)) return
    seen.add(label)
    out.push({ label, misconception: MISCONCEPTIONS[rule] || MISCONCEPTIONS['nearby-step'], rule })
  }

  /* Rule order is deliberate — the strongest misconceptions are listed first,
     and with limit 3 the first three applicable rules fill the slate. Pass an
     `rng` to shuffle the order instead, so the *composition* of the slate
     varies between questions and not just its content. The content tells are
     already gone either way: the frozen card renders state, not prose, so a
     learner cannot recognise "the step I am looking at" or "the step after the
     answer" without already knowing the run. */
  const order = opts.rng ? shuffleRules(RULES, opts.rng) : RULES
  for (const rule of order) {
    if (out.length >= limit) break
    offer(rule.pick(steps, i, kinds, correctKind), rule.id)
  }

  /* Fallback, for runs too short or too repetitive for the rules to fill the
     slate. Samples outward from `i`, alternating sides, so the result still
     depends on where the question froze — which is the half of F2 that
     matters most. The old code's index-0 walk is never reached again. */
  if (out.length < limit) {
    for (let d = 1; d < steps.length && out.length < limit; d++) {
      offer(i + 1 + d, 'nearby-step')
      offer(i - d, 'nearby-step')
    }
  }

  return out.slice(0, limit)
}

/**
 * Full option set for the question frozen at `i`, or null when the run cannot
 * supply at least two credible wrong answers.
 */
export function buildMutantOptions(steps, i, opts = {}) {
  const correct = describeStep(steps?.[i + 1])
  if (!correct) return null
  const distractors = buildMutantDistractors(steps, i, opts)
  if (distractors.length < 2) return null
  return { correct, distractors }
}
