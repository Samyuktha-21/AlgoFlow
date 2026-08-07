import { computeLayout } from '../bfs/steps.js'

/* A graph is bipartite when its nodes can be split into two groups with every
   edge crossing between them. Equivalently: 2-colour it by BFS, giving each
   neighbour the opposite colour of the node it came from. The first edge whose
   two ends already share a colour proves it cannot be done — that edge closes
   an odd cycle, and odd cycles are exactly what bipartite graphs cannot have.

   `codeLine` is a Java line number, resolved to Python via code.json's
   lineMap. */

const DEFAULT_NODES = [0, 1, 2, 3, 4, 5].map(id => ({ id, label: String(id) }))
const DEFAULT_EDGES = [
  { from: 0, to: 1 }, { from: 0, to: 3 }, { from: 1, to: 2 },
  { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 1, to: 4 },
]

export function generateSteps(inputNodes = null, inputEdges = null) {
  const nodes = inputNodes?.length ? inputNodes : DEFAULT_NODES
  const edges = inputEdges?.length ? inputEdges : DEFAULT_EDGES

  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(e => {
    if (adj[e.from]) adj[e.from].push(e.to)
    if (adj[e.to]) adj[e.to].push(e.from)
  })

  const positions = computeLayout(nodes, edges)
  const color = {}
  const steps = []
  const visited = []
  let bipartite = true

  const addStep = (cur, q, description, codeLine) => steps.push({
    nodes: nodes.map(n => ({ ...n, ...positions[n.id] })),
    edges: [...edges],
    visited: [...visited],
    current: cur,
    queue: [...q],
    description,
    codeLine,
    extra: { bipartite, coloured: Object.keys(color).length },
  })

  addStep(-1, [], '2-colour the graph: every edge must join a blue node to a red one.', 3)

  /* One BFS only reaches one component, so a disconnected graph needs a fresh
     start per component — each is coloured independently. */
  for (const root of nodes) {
    if (color[root.id] !== undefined) continue
    color[root.id] = 0
    const queue = [root.id]
    addStep(root.id, queue, `Colour ${root.id} blue and start a BFS from it.`, 7)

    while (queue.length > 0) {
      const u = queue.shift()
      visited.push(u)
      addStep(u, queue, `Process node ${u} (${color[u] === 0 ? 'blue' : 'red'}).`, 11)

      for (const v of adj[u]) {
        if (color[v] === undefined) {
          color[v] = 1 - color[u]
          queue.push(v)
          addStep(v, queue, `Colour ${v} ${color[v] === 0 ? 'blue' : 'red'} — the opposite of ${u}.`, 13)
        } else if (color[v] === color[u]) {
          bipartite = false
          addStep(u, queue, `Conflict: ${u} and ${v} are adjacent but both ${color[u] === 0 ? 'blue' : 'red'}. That closes an odd cycle, so the graph is NOT bipartite.`, 14)
          return steps
        }
      }
    }
  }

  const blue = nodes.filter(n => color[n.id] === 0).map(n => n.id)
  const red = nodes.filter(n => color[n.id] === 1).map(n => n.id)
  addStep(-1, [], `Bipartite. Blue: [${blue.join(', ')}], red: [${red.join(', ')}] — every edge crosses between the two sets.`, 18)
  steps[steps.length - 1].result = `Bipartite: blue [${blue.join(',')}] / red [${red.join(',')}]`
  return steps
}
