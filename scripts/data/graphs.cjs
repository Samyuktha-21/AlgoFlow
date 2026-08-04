/* Hand-authored Python line maps for the `graphs` category.
   See scripts/apply-code-data.cjs. Java line numbers -> equivalent Python line;
   `null` = Python genuinely has no equivalent line.

   Not mapped here: astar, johnsons, prim, scc and tsp still ship the
   placeholder step generator (it walks the node list emitting "Processing
   node N" rather than running the algorithm), so there is no real operation
   for a highlight to point at. They need a real generateSteps first. */
module.exports = {
  /* java: 3 = bellmanFord(), 7 = the V-1 relaxation passes, 10 = the relax
     test, 11 = tighten the distance, 17 = return the table.
     Python has no INF sentinel guard on dist[u] because float('inf') + w
     stays inf, so java 10's two-part condition maps to the single test. */
  bellmanFord: {
    lineMap: {
      python: { 3: 1, 7: 4, 10: 6, 11: 7, 17: 11 },
    },
  },

  /* java: 5 = size the visited array, 9 = mark the source, 13 = dequeue,
     17 = the unvisited test, 19 = enqueue a neighbour, 22 = the queue drained.
     Python has no explicit size lookup — it iterates the dict directly — so
     java 5 has no equivalent line, and marking the source IS the set literal
     on python 4. */
  bfs: {
    lineMap: {
      python: { 5: null, 9: 4, 13: 8, 17: 11, 19: 13, 22: 14 },
    },
  },

  /* java: 3 = isBipartite(), 7 = colour the component root, 11 = dequeue,
     13 = colour a neighbour the opposite colour, 14 = same colour on both
     ends of an edge, 18 = every component 2-coloured.
     Java tracks colours in an int[] seeded to -1; Python uses dict membership
     for "not yet coloured", which is why the tests read differently. */
  bipartiteCheck: {
    lineMap: {
      python: { 3: 3, 7: 8, 11: 11, 13: 14, 14: 17, 18: 18 },
    },
  },

  /* java: 2 = hasCycle(), 6 = a DFS reported a cycle, 7 = no cycle anywhere,
     10 = enter a node (mark visited + on-stack), 11 = an already-finished
     neighbour, 12 = descend into an unvisited neighbour, 13 = a back edge,
     15 = leave the node (pop the recursion stack).
     Java keeps two boolean arrays (visited + recStack); Python uses the
     WHITE/GRAY/BLACK colouring, so "on the recursion stack" is GRAY and
     "finished" is BLACK. Java's two exits (java 6 found one, java 7 found
     none) are a single `any(...)` in Python, so only the positive one gets
     that line — mapping both would highlight the same row for opposite
     outcomes. */
  cycleDetection: {
    lineMap: {
      python: { 2: 1, 6: 13, 7: null, 10: 5, 11: 6, 12: 9, 13: 7, 15: 11 },
    },
  },

  /* java: 3 = dfs(), 7 = seed the stack, 9 = pop the next node,
     10 = skip one already visited, 14 = push an unvisited neighbour,
     16 = the traversal is finished.
     Java is iterative with an explicit stack; Python recurses, so the push
     maps to the recursive call and there is no separate seed line — the
     initial "push" is just the first call, which java 7 has no analogue for. */
  dfs: {
    lineMap: {
      python: { 3: 1, 7: null, 9: 4, 10: 7, 14: 8, 16: 9 },
    },
  },

  /* java: 3 = dijkstra(), 14 = drop a node already settled, 15 = settle the
     popped node, 17 = the relax test, 18 = tighten the distance,
     23 = return the table.
     Java carries a visited[] array; Python instead discards stale heap
     entries with `if d > dist[u]`, so "settle u" is the pop itself and the
     skip is that staleness check. java 14 only fires when a node is queued
     twice, which the default demo graph never does — mapped anyway because
     user-supplied graphs reach it. */
  dijkstra: {
    lineMap: {
      python: { 3: 3, 14: 9, 15: 8, 17: 12, 18: 13, 23: 15 },
    },
  },

  /* java: 3 = floydWarshall(), 4 = the intermediate vertex k, 8 = tighten a
     pair, 9 = every pair settled.
     Java mutates the caller's matrix and returns void; Python builds and
     returns its own, so the closing line maps to that return. */
  floydWarshall: {
    lineMap: {
      python: { 3: 1, 4: 8, 8: 12, 9: 13 },
    },
  },

  /* java: 6 = find both roots, 7 = same root means the edge closes a cycle,
     11 = mst(), 12 = sort edges by weight, 16 = accept the edge,
     17 = return the tree.
     Java splits union() out as a helper that both finds and merges; Python
     inlines it, so java 7's early return maps to the positive `if ru != rv`
     test guarding the merge. */
  kruskal: {
    lineMap: {
      python: { 6: 10, 7: 11, 11: 1, 12: 9, 16: 13, 17: 15 },
    },
  },

  /* java: 6 = count in-degrees, 8 = seed the queue with the zero-in-degree
     nodes, 12 = append to the order, 13 = decrement a neighbour and enqueue
     it when it hits zero, 16 = return the order.
     Java folds the decrement and the enqueue onto one line; Python spreads
     them over three, so the decrement carries that row. */
  topologicalSort: {
    lineMap: {
      python: { 6: 7, 8: 8, 12: 12, 13: 14, 16: 17 },
    },
  },

  /* java: 5 = every node starts as its own parent, 12 = find both roots,
     16 = attach one root under the other, 17 = the union succeeded.
     Java recurses in find() with path compression on the way back up; Python
     iterates with path halving. Java also picks the taller root inline;
     Python swaps the names first, so the actual re-parent is a single line. */
  unionFind: {
    lineMap: {
      python: { 5: 3, 12: 13, 16: 18, 17: 21 },
    },
  },
}
