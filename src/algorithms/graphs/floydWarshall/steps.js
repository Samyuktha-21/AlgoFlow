import { computeLayout } from '../bfs/steps.js'

/* Floyd-Warshall: shortest path between every pair of nodes. The loop order is
   the whole idea — the outer loop fixes an intermediate node k, and after that
   iteration dist[i][j] is the best route from i to j using only nodes 0..k as
   stepping stones. Growing the set of allowed intermediates one node at a time
   is what makes a triple loop enough.

   `codeLine` is a Java line number, resolved to Python via code.json's
   lineMap. */

const INF = 999
/* The matrix is V x V and the algorithm is cubic, so every extra node costs a
   whole extra grid per step. Past this the grid stops being readable long
   before it stops being affordable. */
const MAX_V = 7

const DEFAULT_NODES = [0, 1, 2, 3].map(id => ({ id, label: String(id) }))
const DEFAULT_EDGES = [
  { from: 0, to: 1, weight: 3 }, { from: 0, to: 3, weight: 7 },
  { from: 1, to: 0, weight: 8 }, { from: 1, to: 2, weight: 2 },
  { from: 2, to: 0, weight: 5 }, { from: 2, to: 3, weight: 1 },
  { from: 3, to: 0, weight: 2 },
]

export function generateSteps(inputNodes = null, inputEdges = null) {
  const allNodes = inputNodes?.length ? inputNodes : DEFAULT_NODES
  const nodes = allNodes.slice(0, MAX_V)
  const kept = new Set(nodes.map(n => n.id))
  const edges = (inputEdges?.length ? inputEdges : DEFAULT_EDGES)
    .filter(e => kept.has(e.from) && kept.has(e.to))

  const V = nodes.length
  /* Node ids need not be 0..V-1, so the matrix is indexed by position and the
     labels carry the real ids. */
  const idx = new Map(nodes.map((n, i) => [n.id, i]))
  const labels = nodes.map(n => String(n.id))

  const dist = Array.from({ length: V }, (_, i) =>
    Array.from({ length: V }, (_, j) => (i === j ? 0 : INF)))
  for (const e of edges) {
    const i = idx.get(e.from), j = idx.get(e.to)
    const w = typeof e.weight === 'number' ? e.weight : 1
    /* Parallel edges: keep the cheapest. */
    if (w < dist[i][j]) dist[i][j] = w
  }

  const computed = Array.from({ length: V }, () => new Array(V).fill(false))
  const positions = computeLayout(nodes, edges)
  const steps = []

  const addStep = (i, j, k, description, codeLine) => steps.push({
    dp2d: dist.map(r => r.map(v => (v >= INF ? '∞' : v))),
    rows: labels,
    cols: labels,
    cell: { row: i, col: j },
    computed2d: computed.map(r => [...r]),
    description,
    codeLine,
    extra: { k: k >= 0 ? `via ${labels[k]}` : 'init' },
    nodes: nodes.map(n => ({ ...n, ...positions[n.id] })),
    edges,
    directed: true,
    visited: [],
    current: -1,
    queue: [],
  })

  addStep(0, 0, -1,
    `Start from the edge weights: 0 on the diagonal, ∞ where there is no direct edge.${allNodes.length > V ? ` (Showing the first ${V} of ${allNodes.length} nodes.)` : ''}`, 3)
  computed[0][0] = true

  for (let k = 0; k < V; k++) {
    addStep(0, 0, k, `Allow node ${labels[k]} as an intermediate: can any pair do better by routing through it?`, 4)
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          const old = dist[i][j] >= INF ? '∞' : dist[i][j]
          addStep(i, j, k, `${labels[i]}→${labels[j]} costs ${old}, but going ${labels[i]}→${labels[k]}→${labels[j]} costs ${dist[i][k] + dist[k][j]} — better.`, 8)
          dist[i][j] = dist[i][k] + dist[k][j]
          computed[i][j] = true
          addStep(i, j, k, `dist[${labels[i]}][${labels[j]}] = ${dist[i][j]}.`, 8)
        }
      }
    }
  }

  const unreachable = dist.flat().filter(v => v >= INF).length
  addStep(0, 0, -1, `All-pairs shortest paths computed.${unreachable ? ` ${unreachable} pair${unreachable > 1 ? 's remain' : ' remains'} unreachable.` : ''}`, 9)
  steps[steps.length - 1].result = dist.map(r => r.map(v => (v >= INF ? '∞' : v)).join(' ')).join(' | ')
  return steps
}
