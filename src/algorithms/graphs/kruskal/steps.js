import { computeLayout } from '../bfs/steps.js'

/* Kruskal's MST: sort every edge by weight and take each one unless its two
   endpoints are already connected. Union-find is what makes "already
   connected?" cheap — near constant time per query, so the sort dominates.

   `codeLine` is a Java line number, resolved to Python via code.json's
   lineMap. */

const DEFAULT_NODES = [0, 1, 2, 3, 4].map(id => ({ id, label: String(id) }))
const DEFAULT_EDGES = [
  { from: 0, to: 1, weight: 2 }, { from: 0, to: 3, weight: 6 },
  { from: 1, to: 2, weight: 3 }, { from: 1, to: 3, weight: 8 },
  { from: 1, to: 4, weight: 5 }, { from: 2, to: 4, weight: 7 },
  { from: 3, to: 4, weight: 9 },
]

export function generateSteps(inputNodes = null, inputEdges = null) {
  const nodes = inputNodes?.length ? inputNodes : DEFAULT_NODES
  const allEdges = (inputEdges?.length ? inputEdges : DEFAULT_EDGES)
    /* An unweighted edge list is legal input; a missing weight becomes 1 so
       the sort stays defined. */
    .map(e => ({ ...e, weight: typeof e.weight === 'number' ? e.weight : 1 }))

  const edges = [...allEdges].sort((a, b) => a.weight - b.weight)
  /* Node ids need not be 0..n-1, so union-find is keyed by id. */
  const parent = new Map(nodes.map(n => [n.id, n.id]))
  const positions = computeLayout(nodes, allEdges)
  const steps = []
  const mstEdges = []
  const visited = []

  const find = x => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)))
      x = parent.get(x)
    }
    return x
  }
  const unite = (a, b) => {
    const ra = find(a), rb = find(b)
    if (ra === rb) return false
    parent.set(ra, rb)
    return true
  }

  const addStep = (description, codeLine, current = -1) => steps.push({
    nodes: nodes.map(n => ({ ...n, ...positions[n.id] })),
    edges: allEdges,
    visited: [...visited],
    current,
    queue: [],
    treeEdges: mstEdges.map(e => (e.from < e.to ? `${e.from}-${e.to}` : `${e.to}-${e.from}`)),
    treeEdgeLabel: 'In the MST',
    description,
    codeLine,
    extra: { mstCost: mstEdges.reduce((s, e) => s + e.weight, 0), mstEdges: mstEdges.length },
  })

  addStep(`Kruskal on ${nodes.length} nodes and ${allEdges.length} edges: take the cheapest edge that does not close a cycle.`, 11)
  addStep(`Sorted by weight: ${edges.map(e => `${e.from}−${e.to}(${e.weight})`).join(', ')}.`, 12)

  for (const e of edges) {
    addStep(`Try ${e.from}−${e.to}, weight ${e.weight}.`, 6, e.from)
    if (unite(e.from, e.to)) {
      mstEdges.push(e)
      if (!visited.includes(e.from)) visited.push(e.from)
      if (!visited.includes(e.to)) visited.push(e.to)
      addStep(`${e.from} and ${e.to} were in different components — take it. Total ${mstEdges.reduce((s, x) => s + x.weight, 0)}.`, 16, e.to)
      if (mstEdges.length === nodes.length - 1) {
        addStep(`${nodes.length - 1} edges for ${nodes.length} nodes — the tree is complete.`, 17)
        break
      }
    } else {
      addStep(`${e.from} and ${e.to} are already connected, so this edge would close a cycle. Skip it.`, 7, e.from)
    }
  }

  const total = mstEdges.reduce((s, e) => s + e.weight, 0)
  steps[steps.length - 1].result = mstEdges.length === nodes.length - 1
    ? `MST weight = ${total}`
    : `Disconnected — spanning forest of ${mstEdges.length} edges, weight ${total}`
  return steps
}
