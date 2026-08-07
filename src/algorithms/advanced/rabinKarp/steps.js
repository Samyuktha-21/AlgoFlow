/* Rabin-Karp: slide a window over the text and compare a rolling hash instead
   of the characters. A hash hit is only a *candidate* — equal hashes can come
   from different text, so line 9 still verifies character by character. The
   payoff is that the next window's hash is computed from the current one in
   O(1) rather than re-read in O(m).

   Follows the Java block in code.json statement by statement: `codeLine` is a
   Java line number, resolved to Python through code.json's lineMap. */

const BASE = 256, MOD = 101

/* stringPair hands us (text, pattern); the array-typed callers can still pass
   a number list, and the game passes whatever the default seed produced. */
function toText(v, fallback) {
  const raw = Array.isArray(v) ? v.join('') : v
  const s = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
  return s || fallback
}

export function generateSteps(textInput, patternInput) {
  const text = toText(textInput, 'GEEKSFORGEEKS')
  /* A pattern longer than the text has no window to sit in, so there is
     nothing to trace; clamp it to something the visualization can show. */
  let pattern = toText(patternInput, 'GEEK')
  if (pattern.length > text.length) pattern = pattern.slice(0, text.length)

  const chars = text.split('')
  const pat = pattern.split('')
  const n = text.length, m = pattern.length
  const found = []
  const steps = []

  let pH = 0, tH = 0, h = 1
  const push = (i, description, codeLine) => steps.push({
    array: chars,
    array2: pat,
    array2Label: `Pattern "${pattern}"`,
    window: i >= 0 ? { start: i, end: Math.min(i + m - 1, n - 1) } : undefined,
    sorted: found.flatMap(f => Array.from({ length: m }, (_, k) => f + k)),
    pointers: i >= 0 && i < n ? [{ index: i, label: 'i' }] : [],
    current: -1,
    description,
    codeLine,
    extra: { textHash: tH, patternHash: pH, matches: found.length },
  })

  push(-1, `Rabin-Karp: find "${pattern}" in "${text}". Text length ${n}, pattern length ${m}.`, 4)

  for (let i = 0; i < m - 1; i++) h = (h * BASE) % MOD
  push(-1, `Precompute the high-order multiplier h = BASE^(m-1) mod ${MOD} = ${h}. This is what removes the outgoing character when the window rolls.`, 5)

  push(-1, 'Start both hashes at 0.', 6)
  for (let i = 0; i < m; i++) {
    pH = (BASE * pH + pattern.charCodeAt(i)) % MOD
    tH = (BASE * tH + text.charCodeAt(i)) % MOD
    push(0, `Seed the hashes with character ${i}: pattern hash = ${pH}, first-window hash = ${tH}.`, 7)
  }

  for (let i = 0; i <= n - m; i++) {
    push(i, `Window [${i}..${i + m - 1}] = "${text.slice(i, i + m)}". Its hash is ${tH}; the pattern's is ${pH}.`, 8)

    if (pH === tH) {
      const slice = text.slice(i, i + m)
      if (slice === pattern) {
        found.push(i)
        push(i, `Hashes match and the characters match — "${pattern}" found at index ${i}.`, 9)
      } else {
        /* Exactly why line 9 re-checks: equal hashes are not equal strings. */
        push(i, `Hashes match but "${slice}" ≠ "${pattern}" — a spurious hit, because ${MOD} buckets cannot separate every string. Keep going.`, 9)
      }
    } else {
      push(i, `Hashes differ (${tH} ≠ ${pH}) — the characters need not be looked at at all.`, 9)
    }

    if (i < n - m) {
      tH = (BASE * (tH - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % MOD
      if (tH < 0) tH += MOD
      push(i + 1, `Roll the window: drop '${text[i]}', take in '${text[i + m]}' — new hash ${tH}, in O(1) instead of re-reading ${m} characters.`, 10)
    }
  }

  push(-1, found.length
    ? `Done — ${found.length} occurrence${found.length > 1 ? 's' : ''}, at index ${found.join(', ')}.`
    : `Done — "${pattern}" does not occur in the text.`, 11)
  steps[steps.length - 1].result = found.length ? `Found at index ${found.join(', ')}` : 'Not found in text'
  return steps
}
