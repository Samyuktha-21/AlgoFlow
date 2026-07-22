import { toOptions, shuffle } from './index.js'

const BIG_O = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2ⁿ)', 'O(√n)', 'O(V + E)', 'O(V²)', 'O((V+E) log V)']

export function generateComplexity(entry, rng = Math.random) {
  const correct = entry?.metadata?.complexity?.time?.worst
  if (!correct) return null
  const pool = BIG_O.filter(o => o !== correct)
  const distractors = shuffle(pool, rng).slice(0, 3)
  if (distractors.length < 3) return null
  return {
    type: 'complexity',
    entry,
    prompt: `What is the worst-case TIME complexity of ${entry.name}?`,
    options: toOptions(correct, distractors, rng),
    explanation: entry.metadata.complexity.time.worstCase
      ? `Worst case: ${entry.metadata.complexity.time.worstCase}.`
      : `${entry.name} runs in ${correct} in the worst case.`,
    renderMode: 'none',
  }
}
