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
    type: 'nextOp',
    entry,
    prompt: 'Given the state below, what happens NEXT?',
    options: toOptions(correct, distractors, rng),
    explanation: getWhyText(steps[i + 1], entry.type) || correct,
    renderMode: 'frozen',
    render: { step: steps[i], algorithmType: entry.type, themeId: entry.themeId, metadata: entry.metadata },
  }
}
