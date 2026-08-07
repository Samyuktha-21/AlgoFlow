/* Merge k sorted lists with a min-heap. The smallest value left anywhere is
   always at the head of one of the k lists, so the heap only ever holds k
   candidates — one per list. That makes each output element cost log k rather
   than k, which is the whole reason to use a heap instead of scanning all the
   heads every time.

   Input: one list per row, rows separated by "/". Each row is sorted first,
   since the algorithm assumes sorted inputs. */

const DEFAULT_LISTS = [[1, 4, 7], [2, 5, 8], [3, 6, 9]]

export function generateSteps(inputGrid) {
  const lists = (Array.isArray(inputGrid) && inputGrid.length && Array.isArray(inputGrid[0])
    ? inputGrid
    : DEFAULT_LISTS
  ).map(l => [...l].sort((a, b) => a - b)).filter(l => l.length).slice(0, 6)
  if (!lists.length) lists.push([0])

  const heap = [], result = [], steps = []
  /* A sorted array stands in for the heap: same "smallest first" contract,
     and it renders as an ordered row. */
  const push = entry => { heap.push(entry); heap.sort((a, b) => a.val - b.val) }
  lists.forEach((l, i) => push({ val: l[0], list: i, idx: 0 }))

  const addStep = (description, codeLine) => steps.push({
    array: result.length > 0 ? [...result] : [0],
    current: result.length - 1,
    stack: heap.map(h => h.val),
    result: [...result],
    extra: { heapMin: heap[0]?.val ?? '—', heapSize: heap.length, merged: result.join(', ') },
    description,
    codeLine,
  })

  addStep(`Merging ${lists.length} sorted lists: ${lists.map(l => `[${l.join(', ')}]`).join(' ')}. The heap starts with the head of each one.`, 2)

  const total = lists.reduce((s, l) => s + l.length, 0)
  while (heap.length > 0 && result.length < total) {
    const min = heap.shift()
    result.push(min.val)
    addStep(`Smallest of the ${heap.length + 1} candidates is ${min.val}, from list ${min.list + 1}. It cannot be beaten by anything still unseen, because every list is sorted.`, 5)
    const next = lists[min.list][min.idx + 1]
    if (next !== undefined) {
      push({ val: next, list: min.list, idx: min.idx + 1 })
      addStep(`Refill from list ${min.list + 1} with ${next} — the heap holds one candidate per list, never more.`, 6)
    }
  }

  addStep(`Merged ${total} values: [${result.join(', ')}]`, 8)
  steps[steps.length - 1].result = result.join(' → ')
  return steps
}
