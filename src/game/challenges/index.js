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

export function toOptions(correct, distractors, rng) {
  const opts = [
    { label: correct, isCorrect: true },
    ...distractors.map(d => ({ label: d, isCorrect: false })),
  ]
  return shuffle(opts, rng)
}
