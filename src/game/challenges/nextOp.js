import { toOptions } from './index.js'
import { describeStep } from '../describeStep.js'
import { classifySteps, isInformativeKind } from '../classifyStep.js'
import { buildMutantOptions } from '../mutants/index.js'
import { getWhyText } from '../../utils/stepExplain.js'

export function generateNextOp(entry, steps, rng = Math.random) {
  if (!Array.isArray(steps) || steps.length < 3) return null

  /* Classify once for the whole run: every candidate index reuses it, and the
     op kind of the answer is what the weakness map records. */
  const kinds = classifySteps(steps)

  /* Choose a frozen index i in [0, len-2] that yields a describable next op.
     Prefer indices whose answer is an actual operation — a step that only
     advances the narration without moving anything the visualizer can show
     ("Relax 0->2: 0+1=1 vs dist[2]=inf", which leaves every field untouched)
     makes a question the learner cannot reason about from the picture.
     18.5% of the corpus is that kind of step; see scripts/test-classify-step.

     `isInformativeKind` is the same predicate the weakness map filters on, so
     the questions asked and the answers recorded agree by construction — a
     question whose answer is 'inspect' would teach the learner nothing and
     leave the weakness map with nothing to record either. */
  const candidates = []
  const informative = []
  for (let i = 0; i < steps.length - 1; i++) {
    if (!buildMutantOptions(steps, i, { kinds })) continue
    candidates.push(i)
    if (isInformativeKind(kinds[i + 1])) informative.push(i)
  }
  const usable = informative.length ? informative : candidates
  if (usable.length === 0) return null

  const i = usable[Math.floor(rng() * usable.length)]
  /* rng only on the chosen index: the scan above must stay deterministic, or
     "can this index build a question" would answer differently each pass. */
  const { correct, distractors } = buildMutantOptions(steps, i, { kinds, rng })

  return {
    type: 'nextOp',
    entry,
    prompt: 'Given the state below, what happens NEXT?',
    options: toOptions(correct, distractors, rng),
    explanation: getWhyText(steps[i + 1], entry.type) || correct,
    renderMode: 'frozen',
    /* The op kind of the correct answer, for the weakness map. Recorded on the
       challenge rather than recomputed at answer time so the two can never
       disagree about which step was being asked about. */
    opKind: kinds[i + 1],
    render: { step: steps[i], algorithmType: entry.type, themeId: entry.themeId, metadata: entry.metadata },
  }
}

/* Re-exported so callers that only want a label keep a single import. */
export { describeStep }
