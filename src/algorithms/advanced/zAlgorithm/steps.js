/* Z-algorithm: z[i] is the length of the longest substring starting at i that
   is also a prefix of s. The trick is the Z-box [l, r) — the match furthest to
   the right found so far — which lets most positions be filled in from an
   earlier answer instead of by comparing characters again.

   This follows the Java block in code.json statement by statement: `codeLine`
   is a Java line number, and code.json's lineMap resolves it to Python. Change
   one and the other has to change with it. */

/* singleString hands us a string, but the Test Yourself game and the older
   array-typed callers can still pass a number list. */
function toText(input) {
  const raw = Array.isArray(input) ? input.join('') : input
  const s = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
  return s || 'AABAACAABAA'
}

export function generateSteps(input) {
  const s = toText(input)
  const n = s.length
  const chars = s.split('')
  const z = new Array(n).fill(0)
  let l = 0, r = 0
  const steps = []

  const push = (i, description, codeLine) => steps.push({
    array: chars,
    array2: [...z],
    array2Label: 'Z-array — match length with the prefix',
    pointers: [
      ...(i >= 0 && i < n ? [{ index: i, label: 'i' }] : []),
      ...(r > l ? [{ index: l, label: 'l' }, { index: Math.min(r - 1, n - 1), label: 'r' }] : []),
    ],
    /* The Z-box is the half-open [l, r); the visualizer shades inclusively. */
    window: r > l ? { start: l, end: Math.min(r - 1, n - 1) } : undefined,
    current: -1,
    description,
    codeLine,
    extra: { l, r },
  })

  push(-1, `Z-algorithm on "${s}". z[i] = how far the suffix starting at i matches the prefix.`, 3)
  z[0] = n
  push(0, `z[0] = ${n} — the whole string trivially matches itself.`, 4)

  for (let i = 1; i < n; i++) {
    push(i, `i = ${i}${r > l ? `. The Z-box is [${l}, ${r - 1}].` : '. No Z-box yet.'}`, 5)

    if (i < r) {
      z[i] = Math.min(r - i, z[i - l])
      push(i, `i < r, so position ${i} is inside the Z-box — copy the answer from ${i - l}: z[${i}] = min(${r - i}, ${z[i - l]}) = ${z[i]}. No character comparisons needed.`, 6)
    }

    /* Java line 7 is the extend loop. Every comparison it makes gets a step,
       including the one that fails — the mismatch is the interesting part. */
    for (;;) {
      if (i + z[i] >= n) {
        push(i, `Ran off the end of the string — z[${i}] = ${z[i]}.`, 7)
        break
      }
      const a = s[z[i]], b = s[i + z[i]]
      if (a !== b) {
        push(i, `s[${z[i]}]='${a}' ≠ s[${i + z[i]}]='${b}' — stop extending. z[${i}] = ${z[i]}.`, 7)
        break
      }
      z[i]++
      push(i, `s[${z[i] - 1}]='${a}' = s[${i + z[i] - 1}]='${b}' — extend to z[${i}] = ${z[i]}.`, 7)
    }

    if (i + z[i] > r) {
      l = i
      r = i + z[i]
      push(i, `The match from ${i} reaches ${r - 1}, past the old box — move the Z-box to [${l}, ${r - 1}].`, 8)
    }
  }

  push(-1, `Done. Z = [${z.join(', ')}]. Any i with z[i] equal to a pattern length is an occurrence of that prefix.`, 10)
  steps[steps.length - 1].result = `Z = [${z.join(', ')}]`
  return steps
}
