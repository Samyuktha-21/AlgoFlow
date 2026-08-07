/* Pick the largest set of activities that never overlap. Sorting by FINISH
   time is the whole algorithm: the activity that ends earliest leaves the most
   room for everything after it, so taking it can never be worse than taking
   any other. Sorting by start time or by duration both give wrong answers.

   Input: pairs of numbers, each pair a (start, end). */
export function generateSteps(inputArray) {
  const nums = Array.isArray(inputArray) && inputArray.length >= 2
    ? inputArray.map(v => Math.trunc(v))
    : [1, 2, 3, 4, 0, 6, 5, 7, 8, 9, 5, 9]

  const acts = []
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const s = nums[i], e = nums[i + 1]
    /* A pair given the wrong way round is still a valid interval. */
    acts.push({ id: acts.length, s: Math.min(s, e), e: Math.max(s, e) })
  }
  acts.sort((a, b) => a.e - b.e || a.s - b.s)

  const arr = acts.map(a => a.e)
  const steps = [], selected = [], sorted = []
  const addStep = (cur, description, codeLine) => steps.push({
    array: [...arr],
    current: cur,
    highlight: [...sorted],
    sorted: [...sorted],
    pointers: cur >= 0 ? [{ index: cur, label: 'i' }] : [],
    extra: {
      selected: selected.length,
      lastEnd: selected.length ? acts.find(a => a.id === selected[selected.length - 1]).e : '—',
    },
    description,
    codeLine,
  })

  addStep(-1, `Sorted by finish time: ${acts.map(a => `[${a.s},${a.e}]`).join(' ')}. The cells show each activity's finish time.`, 7)

  let lastEnd = -Infinity
  acts.forEach((act, i) => {
    addStep(i, `Activity [${act.s},${act.e}]: does it start at or after ${lastEnd === -Infinity ? 'the beginning' : lastEnd}?`, 11)
    if (act.s >= lastEnd) {
      selected.push(act.id)
      lastEnd = act.e
      sorted.push(i)
      addStep(i, `Yes — take it. Nothing selected so far runs past ${lastEnd}.`, 12)
    } else {
      addStep(i, `No — it starts at ${act.s}, before the last selected activity finishes at ${lastEnd}. Skip.`, 10)
    }
  })

  const chosen = acts.filter(a => selected.includes(a.id)).map(a => `[${a.s},${a.e}]`)
  addStep(-1, `Maximum ${selected.length} non-overlapping activities: ${chosen.join(' ')}`, 16)
  steps[steps.length - 1].result = `${selected.length} activities: ${chosen.join(' ')}`
  return steps
}
