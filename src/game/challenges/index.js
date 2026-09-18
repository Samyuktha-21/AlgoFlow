/* Shared helpers for challenge generators. Pure — node-testable.
   rng defaults to Math.random; tests inject a deterministic fn. */

export function shuffle(arr, rng = Math.random) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* A distractor is either a plain label, or { label, misconception } — the
   buggy-variant distractors in src/game/mutants carry the mistake each wrong
   answer encodes, so the card can name it after a wrong pick. */
export function toOptions(correct, distractors, rng) {
  const opts = [
    { label: correct, isCorrect: true },
    ...distractors.map(d => (
      typeof d === 'string'
        ? { label: d, isCorrect: false }
        : { label: d.label, isCorrect: false, misconception: d.misconception }
    )),
  ]
  return shuffle(opts, rng)
}
