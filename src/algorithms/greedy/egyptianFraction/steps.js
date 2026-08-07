/* Egyptian fraction: write num/den as a sum of distinct unit fractions. The
   greedy rule is to take the largest unit fraction that still fits, which is
   1/ceil(den/num). What makes it terminate is that the remainder's numerator
   is always strictly smaller than the one you started with — even though the
   denominators grow by roughly squaring, which is why 5/121 needs a 25-digit
   denominator by its fifth term.

   That growth is also why the arithmetic here is BigInt: in doubles the
   products go silently inexact long before the expansion ends, and a wrong
   sum presented as an equality is worse than no expansion at all.

   Follows the Java block in code.json statement by statement: `codeLine` is a
   Java line number, resolved to Python through code.json's lineMap. The Java
   is recursive with several early exits the iterative Python has no
   equivalent for; those map to null rather than to an approximate line. */

const MAX_TERMS = 10
/* Past this the denominator stops being something a person can read, and the
   cell it renders in turns into a smear of digits. */
const MAX_DIGITS = 30

export function generateSteps(inputArray) {
  const nums = Array.isArray(inputArray) && inputArray.length >= 2 ? inputArray : [6, 14]
  let num = BigInt(Math.abs(Math.trunc(nums[0])) || 6)
  let den = BigInt(Math.abs(Math.trunc(nums[1])) || 14)

  const parts = []
  const steps = []
  const start = `${num}/${den}`
  let truncated = false

  const push = (description, codeLine) => steps.push({
    array: parts.length ? [...parts] : ['—'],
    highlight: parts.length ? [parts.length - 1] : [],
    current: -1,
    pointers: [],
    description,
    codeLine,
    extra: { remaining: `${num}/${den}`, terms: parts.length },
  })

  push(`Write ${start} as a sum of distinct unit fractions.`, 3)

  for (let guard = 0; ; guard++) {
    if (guard >= MAX_TERMS || String(den).length > MAX_DIGITS) { truncated = true; break }
    if (den === 0n || num === 0n) {
      push('Nothing left over — the sum is exact.', 3)
      break
    }
    if (den % num === 0n) {
      parts.push(`1/${den / num}`)
      push(`${num}/${den} is already a unit fraction: 1/${den / num}. Done.`, 4)
      break
    }
    if (num % den === 0n) {
      parts.push(`${num / den}`)
      push(`${num}/${den} is the whole number ${num / den}. Done.`, 5)
      break
    }
    if (num > den) {
      const whole = num / den
      push(`${num}/${den} is bigger than 1 — split off the whole part ${whole} first.`, 6)
      parts.push(`${whole}`)
      push(`Take ${whole}, leaving ${num % den}/${den}.`, 7)
      num = num % den
      push(`Recurse on the proper fraction ${num}/${den}.`, 8)
      continue
    }

    const x = den / num + 1n
    push(`The largest unit fraction not exceeding ${num}/${den} is 1/${x}, since ${den}/${num} rounds up to ${x}.`, 10)
    parts.push(`1/${x}`)
    push(`Take 1/${x}.`, 11)

    const nextNum = num * x - den
    const nextDen = den * x
    push(`Remainder: ${num}/${den} - 1/${x} = ${nextNum}/${nextDen}. Its numerator (${nextNum}) is smaller than ${num}, which is why this terminates.`, 12)
    num = nextNum
    den = nextDen
  }

  /* Only claim equality when the expansion actually finished. */
  push(truncated
    ? `${start} = ${parts.join(' + ')} + … — stopped after ${parts.length} terms; the greedy denominators grow by squaring and the next one is too large to show.`
    : `${start} = ${parts.join(' + ')}`, 3)
  steps[steps.length - 1].result = `${start} = ${parts.join(' + ')}${truncated ? ' + …' : ''}`
  return steps
}
