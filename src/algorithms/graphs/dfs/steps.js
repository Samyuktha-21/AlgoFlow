import { computeLayout, DEFAULT_GRAPH } from '../bfs/steps.js'

export function generateSteps(inputNodes=null, inputEdges=null, startNode=0) {
  const nodes = inputNodes || DEFAULT_GRAPH.nodes
  const edges = inputEdges || DEFAULT_GRAPH.edges
  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(e => { adj[e.from].push(e.to); adj[e.to].push(e.from) })
  // Sort ascending so traversal matches standard textbook order
  Object.keys(adj).forEach(k => adj[k].sort((a, b) => a - b))
  const positions = computeLayout(nodes, edges)
  const steps = [], visited = new Set(), stack = []

  // isDFS flag tells GraphVisualizer to label this as a Stack
  const addStep = (vis, cur, stk, desc, line) => steps.push({
    nodes: nodes.map(n => ({ ...n, ...positions[n.id] })),
    edges: [...edges],
    visited: [...vis],
    current: cur,
    queue: [...stk],   // GraphVisualizer reads 'queue' field — we populate it
    stack: [...stk],   // Extra field: signals GraphVisualizer this is a STACK
    isDFS: true,       // Flag: tells GraphVisualizer to label "Stack" not "Queue"
    description: desc,
    codeLine: line,
  })

  addStep([], null, [],
    'DFS uses a Stack (LIFO). We go as deep as possible before backtracking.', 2)

  stack.push(startNode)
  addStep([], null, [...stack],
    `Push start node ${startNode} onto the stack. Stack: [${stack.join(', ')}]`, 3)

  while (stack.length > 0) {
    const node = stack.pop()
    if (visited.has(node)) {
      addStep([...visited], node, [...stack],
        `Pop node ${node} from stack — already visited, skip it.`, 5)
      continue
    }
    visited.add(node)
    addStep([...visited], node, [...stack],
      `Pop and visit node ${node}. Stack: [${stack.join(', ')}]`, 6)

    const nbrs = (adj[node] || []).slice().reverse() // push high→low so low explored first
    for (const nb of nbrs) {
      if (!visited.has(nb)) {
        stack.push(nb)
        addStep([...visited], node, [...stack],
          `Push unvisited neighbor ${nb} onto stack. Stack: [${stack.join(', ')}]`, 9)
      } else {
        addStep([...visited], node, [...stack],
          `Neighbor ${nb} already visited — skip`, 9)
      }
    }
  }

  addStep([...visited], null, [],
    `DFS complete! Traversal order: ${[...visited].join(' → ')}`, 11)
  return steps
}
