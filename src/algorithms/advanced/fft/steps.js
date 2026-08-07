/* Iterative Cooley-Tukey FFT. The naive DFT is n^2 because every output reads
   every input. The FFT notices that the even-indexed and odd-indexed halves
   each form a smaller DFT, and that the two halves of the output differ only
   in the sign of the twiddle factor — so one butterfly produces two outputs.
   That is the whole n log n saving.

   The bit-reversal permutation up front is what makes the loop version work:
   after it, every sub-transform the recursion would have made sits in a
   contiguous block, so the levels can be combined bottom-up in place.

   Follows the Java block in code.json statement by statement: `codeLine` is a
   Java line number, resolved to Python through code.json's lineMap. */

const add = (a, b) => ({ re: a.re + b.re, im: a.im + b.im })
const sub = (a, b) => ({ re: a.re - b.re, im: a.im - b.im })
const mul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re })
const fmt = c => `${c.re.toFixed(1)}${c.im < 0 ? '-' : '+'}${Math.abs(c.im).toFixed(1)}i`
const mag = c => Math.round(Math.hypot(c.re, c.im) * 10) / 10

export function generateSteps(inputArray) {
  const raw = Array.isArray(inputArray) && inputArray.length >= 2 ? [...inputArray] : [1, 2, 3, 4]
  /* The transform is only defined on a power-of-two length here, and a big n
     buries the structure in butterflies, so take at most 8 and pad with the
     zeros the algorithm assumes anyway. */
  const capped = raw.slice(0, 8)
  let n = 1
  while (n < capped.length) n *= 2
  const input = [...capped, ...new Array(n - capped.length).fill(0)]
  const a = input.map(v => ({ re: v, im: 0 }))
  const steps = []

  const push = (description, codeLine, marked = []) => steps.push({
    array: input,
    array2: a.map(mag),
    array2Label: 'Current coefficients (magnitude)',
    highlight: marked,
    current: -1,
    pointers: [],
    description,
    codeLine,
    extra: { n },
  })

  push(`FFT of ${capped.length} value${capped.length > 1 ? 's' : ''}${n > capped.length ? `, zero-padded to n = ${n}` : ` (n = ${n})`}.`, 8)

  /* ── Bit-reversal permutation ── */
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; (j & bit) !== 0; bit >>= 1) j ^= bit
    j ^= bit
    push(`i = ${i}: its bit-reversed partner is ${j}.`, 9, [i, j])
    if (i < j) {
      const t = a[i]; a[i] = a[j]; a[j] = t
      push(`Swap positions ${i} and ${j} — after this every sub-transform sits in one contiguous block, which is what lets the loops work in place.`, 12, [i, j])
    }
  }

  /* ── Butterflies, level by level ── */
  for (let len = 2; len <= n; len *= 2) {
    push(`Combine sub-transforms of length ${len / 2} into transforms of length ${len}.`, 14)
    const ang = 2 * Math.PI / len
    const wlen = { re: Math.cos(ang), im: Math.sin(ang) }
    push(`The root of unity for this level is w = ${fmt(wlen)} — one ${len}th of a full turn.`, 16)

    for (let i = 0; i < n; i += len) {
      let w = { re: 1, im: 0 }
      for (let j = 0; j < len / 2; j++) {
        const lo = i + j, hi = i + j + len / 2
        push(`Block starting at ${i}, pair (${lo}, ${hi}), twiddle w = ${fmt(w)}.`, 19, [lo, hi])
        const u = a[lo]
        const v = mul(a[hi], w)
        a[lo] = add(u, v)
        a[hi] = sub(u, v)
        push(`Butterfly: a[${lo}] = u+v = ${fmt(a[lo])}, a[${hi}] = u-v = ${fmt(a[hi])} — two outputs from one multiply, which is where the speed comes from.`, 21, [lo, hi])
        w = mul(w, wlen)
      }
    }
  }

  push(`Done. Spectrum magnitudes: [${a.map(mag).join(', ')}]. Bin 0 is the sum of the inputs (${a[0].re.toFixed(1)}).`, 21)
  steps[steps.length - 1].result = `Magnitudes = [${a.map(mag).join(', ')}]`
  return steps
}
