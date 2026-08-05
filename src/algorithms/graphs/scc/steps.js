import { computeLayout } from '../bfs/steps.js'

/* Strongly connected components only exist on a DIRECTED graph, so the demo
   ships one with three obvious answers: {0,1,2} is a cycle, {3,4,5} is a
   cycle, and 6 reaches 5 but nothing reaches 6. */
const DEFAULT_DIRECTED = {
  nodes: [{ id: 0, label: '0' }, { id: 1, label: '1' }, { id: 2, label: '2' },
    { id: 3, label: '3' }, { id: 4, label: '4' }, { id: 5, label: '5' }, { id: 6, label: '6' }],
  edges: [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 0 },
    { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 3 },
    { from: 6, to: 5 },
  ],
}

/**
 * Kosaraju's algorithm. Pass 1 runs DFS on the graph and pushes each node as
 * it finishes; pass 2 pops that stack and runs DFS on the reversed graph, so
 * each pop that lands on an unvisited node peels off exactly one SCC.
 */
export function generateSteps(inputNodes = null, inputEdges = null) {
  const nodes = inputNodes || DEFAULT_DIRECTED.nodes
  const edges = inputEdges || DEFAULT_DIRECTED.edges

  const adj = {}, radj = {}
  nodes.forEach(n => { adj[n.id] = []; radj[n.id] = [] })
  edges.forEach(e => {
    if (adj[e.from]) adj[e.from].push(e.to)
    if (radj[e.to]) radj[e.to].push(e.from)
  })
  Object.keys(adj).forEach(k => { adj[k].sort((a, b) => a - b); radj[k].sort((a, b) => a - b) })

  const positions = computeLayout(nodes, edges)
  const steps = []

  let done = []                 // nodes coloured "settled" in the current pass
  let stack = []                // finish-order stack (shown as the queue strip)
  let componentEdges = []       // edges inside an already-identified SCC
  const components = []

  const addStep = (current, description, codeLine) => steps.push({
    nodes: nodes.map(n => ({ ...n, ...positions[n.id] })),
    edges,
    visited: [...done],
    current,
    queue: [...stack].reverse(),   // top of the stack shown first
    treeEdges: [...componentEdges],
    treeEdgeLabel: 'Edges inside a component',
    directed: true,
    isDFS: true,
    description,
    codeLine,
  })

  /* ── Pass 1: DFS on the original graph, recording finish order ── */
  addStep(null, 'Pass 1 — DFS the graph and push each node onto a stack the moment it finishes. That records the reverse finishing order.', 18)

  const seen1 = new Set()
  const dfs1 = (u) => {
    seen1.add(u)
    done.push(u)
    addStep(u, `Pass 1: enter node ${u} and mark it visited.`, 9)
    for (const v of adj[u]) {
      if (!seen1.has(v)) {
        addStep(u, `Pass 1: edge ${u}→${v} leads somewhere unvisited — recurse into ${v}.`, 10)
        dfs1(v)
      } else {
        addStep(u, `Pass 1: edge ${u}→${v} points at an already-visited node — nothing to do.`, 10)
      }
    }
    stack.push(u)
    addStep(u, `Pass 1: node ${u} has no unexplored out-edges left, so it finishes and is pushed. Stack: [${stack.join(', ')}]`, 11)
  }

  for (const n of nodes) {
    if (!seen1.has(n.id)) {
      addStep(n.id, `Pass 1: node ${n.id} has not been visited yet — start a new DFS here.`, 19)
      dfs1(n.id)
    }
  }

  /* ── Pass 2: DFS the reversed graph in reverse finishing order ── */
  done = []
  addStep(null, `Pass 1 done. Finishing order (bottom→top): [${stack.join(', ')}]. Now clear the visited marks and walk the REVERSED graph, popping this stack.`, 20)

  const seen2 = new Set()
  const dfs2 = (u, comp) => {
    seen2.add(u)
    comp.push(u)
    done.push(u)
    addStep(u, `Pass 2: node ${u} joins the current component ${'{'}${comp.join(', ')}${'}'}.`, 14)
    for (const v of radj[u]) {
      if (!seen2.has(v)) {
        addStep(u, `Pass 2: reversed edge ${u}←${v} reaches unvisited ${v}, so ${v} can also reach ${u} — same component.`, 15)
        dfs2(v, comp)
      }
    }
  }

  while (stack.length > 0) {
    const u = stack.pop()
    if (seen2.has(u)) {
      addStep(u, `Pass 2: pop ${u} — already assigned to a component, skip it.`, 24)
      continue
    }
    addStep(u, `Pass 2: pop ${u} — unassigned, so it is the root of a brand-new component.`, 23)
    const comp = []
    dfs2(u, comp)
    components.push(comp)
    /* Every original edge with both ends inside this component is an edge of
       the component itself — that is what makes it strongly connected. */
    const inComp = new Set(comp)
    for (const e of edges) {
      if (inComp.has(e.from) && inComp.has(e.to)) componentEdges.push(`${e.from}-${e.to}`)
    }
    addStep(u, `Component #${components.length} complete: {${comp.slice().sort((a, b) => a - b).join(', ')}} — every node here can reach every other one.`, 26)
  }

  addStep(null,
    `${components.length} strongly connected component${components.length === 1 ? '' : 's'}: ${components.map(c => `{${c.slice().sort((a, b) => a - b).join(',')}}`).join(' ')}`,
    29)

  return steps
}
