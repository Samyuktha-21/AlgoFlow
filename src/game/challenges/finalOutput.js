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
  const distractors = [original, reversed, 'Not found in array'].filter(d => d && d !== correct)
  const uniq = [...new Set(distractors)].slice(0, 3)
  if (uniq.length < 2) return null
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
