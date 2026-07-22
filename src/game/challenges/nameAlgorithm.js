import { toOptions, shuffle } from './index.js'

export function generateNameAlgorithm(entry, steps, otherNames, rng = Math.random) {
  if (!Array.isArray(steps) || steps.length < 2) return null
  const pool = [...new Set((otherNames || []).filter(n => n && n !== entry.name))]
  if (pool.length < 3) return null
  const distractors = shuffle(pool, rng).slice(0, 3)
  return {
    type: 'nameAlgorithm',
    entry,
    prompt: 'Which algorithm is running below?',
    options: toOptions(entry.name, distractors, rng),
    explanation: `This is ${entry.name}.`,
    renderMode: 'animated',
    render: { steps, algorithmType: entry.type, themeId: entry.themeId, metadata: entry.metadata },
  }
}
