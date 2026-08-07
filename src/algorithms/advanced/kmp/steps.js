/* KMP. The failure function (LPS) records, for each prefix of the pattern, the
   length of the longest proper prefix that is also a suffix of it. On a
   mismatch that number says how much of the pattern is still known to match,
   so the text pointer never moves backwards — which is what makes the search
   linear instead of quadratic.

   `codeLine` is a Java line number, resolved to Python via code.json's
   lineMap. */

function toText(v, fallback) {
  const raw = Array.isArray(v) ? v.join('') : v
  const s = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
  return s || fallback
}

export function generateSteps(textInput, patternInput) {
  const text = toText(textInput, 'AABAACAADAABAABA')
  let pattern = toText(patternInput, 'AABA')
  if (pattern.length > text.length) pattern = pattern.slice(0, text.length)

  const n = text.length, m = pattern.length
  const arr = text.split('')
  const lps = new Array(m).fill(0)
  const steps = [], found = []

  const addStep = (i, j, phase, description, codeLine) => steps.push({
    array: [...arr],
    array2: pattern.split(''),
    array2Label: `Pattern "${pattern}" — LPS [${lps.join(', ')}]`,
    current: i < n ? i : -1,
    pointers: i < n ? [{ index: i, label: 'i' }] : [],
    highlight: j > 0 ? Array.from({ length: j }, (_, k) => i - j + k).filter(x => x >= 0 && x < n) : [],
    sorted: found.flatMap(f => Array.from({ length: m }, (_, k) => f + k)),
    extra: { phase, i, j, matches: found.length },
    description,
    codeLine,
  })

  addStep(0, 0, 'Build', `Build the failure function for "${pattern}".`, 2)

  let len = 0, fi = 1
  while (fi < m) {
    if (pattern[fi] === pattern[len]) {
      lps[fi++] = ++len
      addStep(0, 0, 'Build', `pattern[${fi - 1}]='${pattern[fi - 1]}' extends the border to length ${len}, so lps[${fi - 1}] = ${len}.`, 7)
    } else if (len > 0) {
      len = lps[len - 1]
      addStep(0, 0, 'Build', `Mismatch — fall back to the next shorter border, length ${len}.`, 8)
    } else {
      lps[fi++] = 0
      addStep(0, 0, 'Build', `No border at all here, so lps[${fi - 1}] = 0.`, 9)
    }
  }

  addStep(0, 0, 'Search', `LPS = [${lps.join(', ')}]. Now scan the text; i never moves backwards.`, 11)

  let i = 0, j = 0
  while (i < n) {
    addStep(i, j, 'Search', `text[${i}]='${text[i]}' vs pattern[${j}]='${pattern[j]}'`, 18)
    if (text[i] === pattern[j]) {
      i++
      j++
      addStep(i, j, 'Search', `Match — advance both. ${j} of ${m} characters matched.`, 18)
    }
    if (j === m) {
      found.push(i - j)
      addStep(i, 0, 'Search', `All ${m} matched — "${pattern}" occurs at index ${i - j}.`, 19)
      j = lps[j - 1]
    } else if (i < n && text[i] !== pattern[j]) {
      if (j > 0) {
        addStep(i, j, 'Search', `Mismatch after ${j} matched. lps[${j - 1}] = ${lps[j - 1]}, so ${lps[j - 1]} characters are still known to match — slide the pattern without re-reading the text.`, 21)
        j = lps[j - 1]
      } else {
        addStep(i, 0, 'Search', 'Mismatch with nothing matched — move on to the next character.', 21)
        i++
      }
    }
  }

  addStep(n, 0, 'Done', found.length
    ? `Done — "${pattern}" occurs at index ${found.join(', ')}.`
    : `Done — "${pattern}" does not occur.`, 23)
  steps[steps.length - 1].result = found.length ? `Found at ${found.join(', ')}` : 'Not found'
  return steps
}
