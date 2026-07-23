/* Deterministic "quiz of the day". A date-seeded PRNG drives both the
   (algorithm, challenge-type) pick AND the generators (which already accept a
   trailing rng), so every visitor gets the same question on a given day and it
   is stable across reloads. Mirrors makeChallenge() in TestYourself.jsx. */
import { loadEntry } from './pool'
import { runSteps } from './runSteps'
import { applicableTypes } from './session'
import { generateComplexity } from './challenges/complexity'
import { generateNextOp } from './challenges/nextOp'
import { generateFinalOutput } from './challenges/finalOutput'
import { generateNameAlgorithm } from './challenges/nameAlgorithm'
import { dailySeed, mulberry32 } from './dailyRng'

export { dailySeed, mulberry32 }

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)]

export async function makeDailyChallenge(dateStr, pool, names) {
  if (!pool || !pool.length) return null
  const rng = mulberry32(dailySeed(dateStr))
  // stable ordering so the pick doesn't depend on pool build order
  const ordered = [...pool].sort((x, y) => (x.name < y.name ? -1 : x.name > y.name ? 1 : 0))
  for (let tries = 0; tries < 25; tries++) {
    const pm = pick(rng, ordered)
    const type = pick(rng, applicableTypes(pm))
    const entry = await loadEntry(pm)
    let ch = null
    if (type === 'complexity') {
      ch = generateComplexity(entry, rng)
    } else {
      const steps = runSteps(entry)
      if (steps) {
        if (type === 'nextOp') ch = generateNextOp(entry, steps, rng)
        else if (type === 'finalOutput') ch = generateFinalOutput(entry, steps, rng)
        else if (type === 'nameAlgorithm') ch = generateNameAlgorithm(entry, steps, names, rng)
      }
    }
    if (ch) return ch
  }
  for (const pm of ordered) {
    const ch = generateComplexity(await loadEntry(pm), rng)
    if (ch) return ch
  }
  return null
}
