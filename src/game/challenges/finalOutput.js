import { toOptions } from './index.js'
import { deriveResult } from '../../utils/stepExplain.js'

/* Plausible wrong answers, drawn from the step's own data so they look like
   something the algorithm could have produced.

   The previous version only knew how to read `step.array`, so every graph and
   tree algorithm fell through with too few distractors and got no challenge at
   all — the shape of the step, not the difficulty of the question, decided
   which algorithms were covered. */
function candidateDistractors(first, last, correct) {
  const out = []
  const join = xs => xs.join(' → ')

  const arr = Array.isArray(first?.array) ? first.array : null
  if (arr?.length) {
    out.push(join(arr))
    out.push(join([...arr].reverse()))
  }
  const lastArr = Array.isArray(last?.array) ? last.array : null
  if (lastArr?.length) out.push(join([...lastArr].reverse()))

  const order = Array.isArray(last?.traversalOrder) ? last.traversalOrder : null
  if (order?.length) {
    out.push(join(order))
    out.push(join([...order].reverse()))
  }

  const nodes = Array.isArray(last?.nodes) ? last.nodes : null
  if (nodes?.length) {
    const vals = nodes.map(n => n.value ?? n.label ?? n.id)
    out.push(join(vals))
    out.push(join([...vals].reverse()))
  }

  const visited = Array.isArray(last?.visited) ? last.visited : null
  if (visited?.length) out.push(join(visited))

  /* Yes/no answers carry no number to nudge and no list to reorder, so the
     believable wrong option is simply the opposite verdict. */
  const FLIPS = [
    ['not found', 'found'], ['does not exist', 'exists'], ['cannot', 'can'],
    ['Not balanced', 'Balanced'], ['Not anagrams', 'Anagrams'],
    ['No cycle', 'Cycle detected'], ['Invalid', 'Valid'],
    ['is not prime', 'is prime'], ['No path exists', 'Path exists'],
    ['No intersection', 'Intersects'], ['Not solved', 'Solved'],
  ]
  for (const [a, b] of FLIPS) {
    if (correct.includes(a)) out.push(correct.replace(a, b))
    else if (correct.includes(b)) out.push(correct.replace(b, a))
  }

  /* Nudging the number in the answer is the most reliable source of a
     believable wrong option — it covers every "Height = 2", "MST weight = 13"
     or "Max value = 220" result, whatever the step shape was. */
  const m = String(correct).match(/-?\d+/)
  if (m) {
    const n = Number(m[0])
    for (const alt of [n + 1, n - 1, n * 2]) {
      if (alt !== n) out.push(String(correct).replace(m[0], String(alt)))
    }
  }

  return out
}

export function generateFinalOutput(entry, steps, rng = Math.random) {
  if (!Array.isArray(steps) || steps.length < 2) return null
  const last = steps[steps.length - 1]
  const correct = deriveResult(last)
  if (!correct) return null
  const first = steps[0]

  const distractors = candidateDistractors(first, last, correct)
    .filter(d => d && d !== correct)
  const uniq = [...new Set(distractors)].slice(0, 3)
  if (uniq.length < 2) return null

  const original = Array.isArray(first?.array) ? first.array.join(' → ') : null
  return {
    type: 'finalOutput',
    entry,
    prompt: `Starting from the input shown, what is the FINAL result of ${entry.name}?`,
    options: toOptions(correct, uniq, rng),
    explanation: `Final result: ${correct}.`,
    renderMode: 'input',
    render: { inputText: original || '(default input)' },
  }
}
