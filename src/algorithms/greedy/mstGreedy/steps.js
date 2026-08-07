import { computeLayout } from '../../graphs/bfs/steps.js'

/* Minimum spanning tree, greedily: sort every edge by weight and take each one
   unless it would close a cycle. The greedy claim is that the cheapest edge
   crossing any cut is always safe to take, which is why never reconsidering a
   choice still lands on a global optimum.

   "Would it close a cycle?" is the whole cost of the algorithm, and union-find
   answers it in near-constant time — two endpoints already in the same
   component means a cycle.

   Follows the Java block in code.json statement by statement: `codeLine` is a
   Java line number, resolved to Python through code.json's lineMap. */

const DEFAULT_NODES = [0, 1, 2, 3, 4, 5].map(id => ({ id, label: String(id) }))
const DEFAULT_EDGES = [
  { from: 0, to: 1, weight: 4 }, { from: 0, to: 2, weight: 1 },
  { from: 1, to: 2, weight: 2 }, { from: 1, to: 3, weight: 5 },
  { from: 2, to: 3, weight: 8 }, { from: 3, to: 4, weight: 3 },
  { from: 4, to: 5, weight: 2 }, { from: 3, to: 5, weight: 7 },
]

export function generateSteps(inputNodes = null, inputEdges = null) {
  const nodes = inputNodes?.length ? inputNodes : DEFAULT_NODES
  const allEdges = (inputEdges?.length ? inputEdges : DEFAULT_EDGES)
    /* An unweighted edge list is legal input; a missing weight becomes 1 so
       the sort stays defined and every edge is comparable. */
    .map(e => ({ ...e, weight: typeof e.weight === 'number' ? e.weight : 1 }))

  const positions = computeLayout(nodes, allEdges)
  const steps = []
  const treeEdges = []
  const visited = []
  let total = 0, count = 0

  /* Node ids need not be 0..n-1 ("5-9, 9-12" is a legal graph), so union-find
     is keyed by id through a Map rather than indexed by position. */
  const parent = new Map(nodes.map(n => [n.id, n.id]))
  const rank = new Map(nodes.map(n => [n.id, 0]))

  const push = (description, codeLine, current = -1) => steps.push({
    nodes: nodes.map(n => ({ ...n, ...positions[n.id] })),
    edges: allEdges,
    visited: [...visited],
    current,
    queue: [],
    treeEdges: treeEdges.map(e => (e.from < e.to ? `${e.from}-${e.to}` : `${e.to}-${e.from}`)),
    treeEdgeLabel: 'In the spanning tree',
    description,
    codeLine,
    extra: { cost: total, chosen: count },
  })

  const find = x => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)))
      x = parent.get(x)
    }
    return x
  }

  push(`Kruskal on ${nodes.length} nodes and ${allEdges.length} edges.`, 14)
  push('Every node starts as its own component — nothing is connected yet.', 15)

  const sorted = [...allEdges].sort((a, b) => a.weight - b.weight)
  push(`Sort the edges by weight: ${sorted.map(e => `${e.from}−${e.to}(${e.weight})`).join(', ')}.`, 16)
  push('Running cost 0, no edges chosen.', 17)

  for (const e of sorted) {
    push(`Consider ${e.from}−${e.to} with weight ${e.weight} — the cheapest edge not yet examined.`, 18, e.from)

    const a = find(e.from), b = find(e.to)
    push(`Find the components: ${e.from} is in component ${a}, ${e.to} is in component ${b}.`, 6, e.from)

    if (a === b) {
      push(`Both endpoints already sit in component ${a}, so this edge would close a cycle. Skip it.`, 7, e.from)
      continue
    }

    let ra = a, rb = b
    if (rank.get(ra) < rank.get(rb)) {
      const t = ra; ra = rb; rb = t
      push(`Component ${rb} is the shallower tree, so hang it under ${ra} — that is what keeps find() fast.`, 8, e.from)
    }
    parent.set(rb, ra)
    push(`Merge: component ${rb} now points at ${ra}.`, 9, e.from)
    if (rank.get(ra) === rank.get(rb)) {
      rank.set(ra, rank.get(ra) + 1)
      push(`The two trees had equal rank, so the merged one is a level deeper: rank[${ra}] = ${rank.get(ra)}.`, 10, e.from)
    }
    push('No cycle — the edge is safe to take.', 11, e.from)

    treeEdges.push(e)
    total += e.weight
    count++
    if (!visited.includes(e.from)) visited.push(e.from)
    if (!visited.includes(e.to)) visited.push(e.to)
    push(`Take ${e.from}−${e.to}. Total cost is now ${total}.`, 20, e.to)

    if (count === nodes.length - 1) {
      push(`${count} edges for ${nodes.length} nodes — the tree is complete, so no remaining edge can help.`, 22)
      break
    }
  }

  push(count === nodes.length - 1
    ? `Minimum spanning tree: ${treeEdges.map(e => `${e.from}−${e.to}`).join(', ')}, total weight ${total}.`
    : `The graph is disconnected, so there is no spanning tree — this is a spanning forest of ${count} edge${count === 1 ? '' : 's'}, total weight ${total}.`, 25)
  steps[steps.length - 1].result = `MST weight = ${total}`
  return steps
}
