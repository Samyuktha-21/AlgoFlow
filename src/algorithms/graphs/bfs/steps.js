/**
 * Default graph for BFS demo — a clean tree-like structure showing BFS levels.
 * Nodes: 0-6, edges forming a balanced tree.
 */
export const DEFAULT_GRAPH = {
  nodes: [
    { id: 0, label: '0' },
    { id: 1, label: '1' },
    { id: 2, label: '2' },
    { id: 3, label: '3' },
    { id: 4, label: '4' },
    { id: 5, label: '5' },
    { id: 6, label: '6' },
  ],
  edges: [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 1, to: 4 },
    { from: 2, to: 5 },
    { from: 2, to: 6 },
  ],
}

/**
 * Computes a level-based layout for a graph starting from node 0.
 * Returns { nodeId: { x, y } } positions for SVG rendering.
 */
export function computeLayout(nodes, edges, svgWidth = 560, svgHeight = 360) {
  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(e => {
    adj[e.from].push(e.to)
    adj[e.to].push(e.from)
  })

  // BFS to determine levels
  const levels = {}
  const visited = new Set()
  const queue = [nodes[0].id]
  visited.add(nodes[0].id)
  levels[nodes[0].id] = 0

  while (queue.length > 0) {
    const node = queue.shift()
    for (const neighbor of adj[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        levels[neighbor] = levels[node] + 1
        queue.push(neighbor)
      }
    }
  }

  // Group nodes by level
  const byLevel = {}
  nodes.forEach(n => {
    const lv = levels[n.id] ?? 0
    if (!byLevel[lv]) byLevel[lv] = []
    byLevel[lv].push(n.id)
  })

  const maxLevel = Math.max(...Object.keys(byLevel).map(Number))
  const positions = {}
  const padding = 60

  for (const [lv, nodeIds] of Object.entries(byLevel)) {
    const y = padding + (Number(lv) / Math.max(maxLevel, 1)) * (svgHeight - padding * 2)
    nodeIds.forEach((nodeId, i) => {
      const x = padding + (i + 1) * ((svgWidth - padding * 2) / (nodeIds.length + 1))
      positions[nodeId] = { x, y }
    })
  }

  return positions
}

/**
 * Generates BFS traversal steps for visualization.
 */
export function generateSteps(inputNodes = null, inputEdges = null, startNode = 0) {
  const nodes = inputNodes || DEFAULT_GRAPH.nodes
  const edges = inputEdges || DEFAULT_GRAPH.edges

  // Build adjacency list (sorted for deterministic order)
  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(e => {
    adj[e.from].push(e.to)
    adj[e.to].push(e.from)
  })
  Object.keys(adj).forEach(k => adj[k].sort((a, b) => a - b))

  const positions = computeLayout(nodes, edges)
  const steps = []

  const addStep = (visited, current, queue, description, codeLine) => {
    steps.push({
      nodes: nodes.map(n => ({ ...n, ...positions[n.id] })),
      edges: [...edges],
      visited: [...visited],
      current,
      queue: [...queue],
      description,
      codeLine,
    })
  }

  addStep([], null, [],
    `BFS starting from node ${startNode}. Initialize visited array and empty queue.`, 5)

  const visited = new Set()
  const queue = []

  visited.add(startNode)
  queue.push(startNode)

  addStep([...visited], null, [...queue],
    `Mark node ${startNode} as visited and enqueue it. Queue: [${queue.join(', ')}]`, 9)

  while (queue.length > 0) {
    const node = queue.shift()

    addStep([...visited], node, [...queue],
      `Dequeue node ${node}. Process it. Queue: [${queue.join(', ')}]`, 13)

    const neighbors = adj[node] || []
    if (neighbors.length === 0) {
      addStep([...visited], node, [...queue],
        `Node ${node} has no unvisited neighbors.`, 16)
      continue
    }

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        addStep([...visited], node, [...queue],
          `Neighbor ${neighbor} of node ${node} is unvisited → mark and enqueue`, 17)

        visited.add(neighbor)
        queue.push(neighbor)

        addStep([...visited], node, [...queue],
          `Marked ${neighbor} as visited. Queue: [${queue.join(', ')}]`, 19)
      } else {
        addStep([...visited], node, [...queue],
          `Neighbor ${neighbor} already visited — skip`, 17)
      }
    }
  }

  addStep([...visited], null, [],
    `BFS complete! Traversal order: ${[...visited].join(' → ')}`, 22)

  return steps
}
