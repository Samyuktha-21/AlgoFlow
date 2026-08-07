/* Optimal file merging: merging two files of size a and b costs a+b, so the
   order matters — every file pays its size again for each merge it takes part
   in. The greedy rule is to always merge the two smallest files available,
   which keeps the biggest files out of the deepest merges. It is Huffman's
   algorithm with the letters taken away.

   Follows the Java block in code.json statement by statement: `codeLine` is a
   Java line number, resolved to Python through code.json's lineMap. */

export function generateSteps(inputArray) {
  const files = Array.isArray(inputArray) && inputArray.length >= 2
    ? inputArray.map(v => Math.abs(Math.trunc(v)))
    : [2, 3, 4, 5, 6]

  const steps = []
  /* A plain sorted array stands in for the priority queue: it is the same
     "smallest first" contract and it renders as an ordered row. */
  let pq = []
  let totalCost = 0
  let merges = 0

  const push = (description, codeLine, marked = []) => steps.push({
    array: pq.length ? [...pq] : ['—'],
    array2: files,
    array2Label: 'Original file sizes',
    highlight: marked,
    current: -1,
    pointers: [],
    description,
    codeLine,
    extra: { totalCost, merges, remaining: pq.length },
  })

  push('Start with an empty min-priority-queue.', 4)
  for (const f of files) {
    pq.push(f)
    pq.sort((a, b) => a - b)
    push(`Add file of size ${f}. Queue: [${pq.join(', ')}].`, 5, [pq.indexOf(f)])
  }

  push(`All ${files.length} files queued, smallest first. Running cost is 0.`, 6)

  while (pq.length > 1) {
    push(`${pq.length} files left — keep merging.`, 7, [0, 1])
    const a = pq.shift()
    const b = pq.shift()
    push(`Take the two smallest: ${a} and ${b}. These are the cheapest pair to combine right now.`, 8)
    totalCost += a + b
    merges++
    push(`Merging costs ${a} + ${b} = ${a + b}. Running total: ${totalCost}.`, 9)
    pq.push(a + b)
    pq.sort((x, y) => x - y)
    push(`Put the merged file of size ${a + b} back in the queue: [${pq.join(', ')}]. It will pay its size again in every later merge, which is why the small files go first.`, 10)
  }

  push(`One file left. Minimum total merge cost: ${totalCost}.`, 12)
  steps[steps.length - 1].result = `Minimum merge cost = ${totalCost}`
  return steps
}
