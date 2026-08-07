import { buildList } from '../../../utils/buildList.js'

/* Merge two sorted lists. Because both are sorted, the smallest value left
   anywhere is always at one of the two heads — so a single comparison per step
   is enough, and the whole merge is linear with no sorting at all.

   The input is split in half and each half sorted, giving the two lists. */
export function generateSteps(inputArray) {
  const nums = Array.isArray(inputArray) && inputArray.length >= 2
    ? inputArray.map(v => Math.trunc(v))
    : [1, 3, 5, 2, 4, 6]
  const half = Math.ceil(nums.length / 2)
  const a = nums.slice(0, half).sort((x, y) => x - y)
  const b = nums.slice(half).sort((x, y) => x - y)

  const l1 = buildList(a, { startId: 0 })
  const l2 = buildList(b, { startId: 100 })
  const nodes = [...l1.nodes, ...l2.nodes]
  const byId = new Map([...l1.byId, ...l2.byId])

  const merged = []
  const steps = []
  let p1 = l1.headId, p2 = l2.headId

  const addStep = (hl, description, codeLine) => steps.push({
    nodes: [...nodes],
    pointers: [
      { nodeId: p1, label: 'p1', color: '#60a5fa' },
      { nodeId: p2, label: 'p2', color: '#f87171' },
    ],
    reversed: [...merged],
    highlighted: [...hl],
    description,
    codeLine,
  })

  addStep([], `Merge two sorted lists: L1 = [${a.join(', ')}] and L2 = [${b.join(', ')}].`, 2)

  while (p1 !== null && p2 !== null) {
    const n1 = byId.get(p1), n2 = byId.get(p2)
    addStep([p1, p2], `Compare heads: ${n1.value} and ${n2.value}. One of them is the smallest value left anywhere.`, 4)
    if (n1.value <= n2.value) {
      merged.push(p1)
      addStep([p1], `Take ${n1.value} from L1. Merged: [${merged.map(id => byId.get(id).value).join(', ')}]`, 5)
      p1 = n1.next
    } else {
      merged.push(p2)
      addStep([p2], `Take ${n2.value} from L2. Merged: [${merged.map(id => byId.get(id).value).join(', ')}]`, 7)
      p2 = n2.next
    }
  }

  let rem = p1 !== null ? p1 : p2
  while (rem !== null) {
    merged.push(rem)
    rem = byId.get(rem).next
  }

  const out = merged.map(id => byId.get(id).value)
  addStep([...merged], `One list ran out, so the rest of the other is already in order — append it. Merged: [${out.join(', ')}]`, 9)
  steps[steps.length - 1].result = out.join(' → ')
  return steps
}
