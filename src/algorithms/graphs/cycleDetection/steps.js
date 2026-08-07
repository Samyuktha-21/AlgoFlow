import { computeLayout } from '../bfs/steps.js'

/* Cycle detection in a directed graph by DFS. "Already visited" is not enough
   to prove a cycle — a node can be reachable by two different paths without
   any cycle existing. What proves it is a *back edge*: an edge into a node
   still on the current recursion stack, meaning we found a way back to
   somewhere we have not finished leaving.

   `codeLine` is a Java line number, resolved to Python via code.json's
   lineMap. */

const DEFAULT_NODES = [0, 1, 2, 3, 4].map(id => ({ id, label: String(id) }))
const DEFAULT_EDGES = [
  { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
  { from: 3, to: 1 }, { from: 0, to: 4 },
]

export function generateSteps(inputNodes = null, inputEdges = null) {
  const nodes = inputNodes?.length ? inputNodes : DEFAULT_NODES
  const edges = inputEdges?.length ? inputEdges : DEFAULT_EDGES

  /* Directed: an edge list from the input box is read as from -> to only. */
  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(e => { if (adj[e.from]) adj[e.from].push(e.to) })

  const positions = computeLayout(nodes, edges)
  const steps = []
  const visited = new Set()
  const recStack = new Set()
  let cycleFound = false

  const addStep = (cur, description, codeLine) => steps.push({
    nodes: nodes.map(n => ({ ...n, ...positions[n.id] })),
    edges: [...edges],
    visited: [...visited],
    current: cur,
    queue: [...recStack],
    directed: true,
    description,
    codeLine,
    extra: { cycleFound, onStack: recStack.size },
  })

  addStep(-1, 'Cycle detection: DFS while tracking which nodes are still on the recursion stack.', 2)

  function dfs(v) {
    visited.add(v)
    recStack.add(v)
    addStep(v, `Enter ${v}. Recursion stack: [${[...recStack].join(', ')}].`, 10)

    for (const u of adj[v] || []) {
      if (!visited.has(u)) {
        addStep(u, `Edge ${v}→${u} leads somewhere unvisited — descend.`, 12)
        if (dfs(u)) return true
      } else if (recStack.has(u)) {
        cycleFound = true
        addStep(v, `Back edge ${v}→${u}: node ${u} is still on the recursion stack, so following the edges from ${u} led back to ${u}. That is a cycle.`, 13)
        return true
      } else {
        addStep(v, `Node ${u} was visited but has already been left, so edge ${v}→${u} is a cross edge, not a cycle.`, 11)
      }
    }

    recStack.delete(v)
    addStep(v, `Leave ${v}, taking it off the stack. Recursion stack: [${[...recStack].join(', ')}].`, 15)
    return false
  }

  for (const n of nodes) {
    if (cycleFound) break
    if (!visited.has(n.id)) dfs(n.id)
  }

  /* A cycle short-circuits out of hasCycle (java 6); a clean run falls through
     to the final `return false` (java 7). */
  addStep(-1, cycleFound ? 'This graph contains a cycle.' : 'Every node was entered and left with no back edge — the graph is acyclic.',
    cycleFound ? 6 : 7)
  steps[steps.length - 1].result = cycleFound ? 'Cycle detected' : 'No cycle (acyclic)'
  return steps
}
