/* Hand-authored Python line maps for the `graphs` category.
   See scripts/apply-code-data.cjs. Java line numbers -> equivalent Python line;
   `null` = Python genuinely has no equivalent line.

   astar, johnsons, prim, scc and tsp used to be excluded because they shipped
   a placeholder generator that walked the node list emitting "Processing node
   N". They now run the real algorithm, so they are mapped like the rest. */
module.exports = {
  /* java: 10 = the g[start]=0 seed, 16 = pop the lowest f, 18 = the goal test,
     22 = the tentative g through the current node, 23 = "is that better?",
     24 = commit the better g, 35 = walk `came` back to build the path.
     Java stores the parent map keyed by "r,c" strings and reconstructs in a
     helper; Python keys by tuple and inlines the walk, so java 35's loop is
     python's `return path[::-1]` — the line that yields the finished path. */
  astar: {
    lineMap: {
      python: { 10: 8, 16: 11, 18: 12, 22: 21, 23: 22, 24: 23, 35: 17 },
    },
  },

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

  /* The shipped Java was a fragment: it declared bellmanFord() and dijkstra()
     but never added the virtual source, never reweighted, and had no driver
     tying the two together — literally not Johnson's algorithm, and with no
     line for the reweighting step to point at. Replaced with the complete
     algorithm; steps.js is authored against these line numbers.

     java: 10 = the virtual source's 0-weight edges, 13 = the V-1 Bellman-Ford
     passes, 15 = relax a potential, 17 = the negative-cycle certificate,
     22 = reweight w' = w + h[u] - h[v], 28 = seed one Dijkstra run,
     32 = pop the closest node, 36 = the relax test, 37 = tighten it,
     43 = undo the shift, 45 = return the matrix.
     Python builds the virtual edges inline and never checks for a negative
     cycle, so java 17 has no counterpart. */
  johnsons: {
    snippets: {
      java: `import java.util.*;
public class Johnson {
    static final int INF = Integer.MAX_VALUE / 2;

    // Reweight with Bellman-Ford, then run Dijkstra from every vertex.
    // O(V*E + V*E log V) — beats Floyd-Warshall's O(V^3) on sparse graphs.
    public int[][] johnson(int n, int[][] edges) {
        // 1. Virtual source n, reaching every vertex with a 0-weight edge.
        List<int[]> all = new ArrayList<>(Arrays.asList(edges));
        for (int v = 0; v < n; v++) all.add(new int[]{n, v, 0});
        int[] h = new int[n + 1];
        Arrays.fill(h, INF); h[n] = 0;
        for (int pass = 0; pass < n; pass++)
            for (int[] e : all)
                if (h[e[0]] < INF && h[e[0]] + e[2] < h[e[1]]) h[e[1]] = h[e[0]] + e[2];
        for (int[] e : all)
            if (h[e[0]] < INF && h[e[0]] + e[2] < h[e[1]]) throw new IllegalStateException("negative cycle");

        // 2. Reweight: w' = w + h[u] - h[v] is never negative.
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) adj.get(e[0]).add(new int[]{e[1], e[2] + h[e[0]] - h[e[1]]});

        // 3. Dijkstra from each vertex — legal now that no weight is negative.
        int[][] dist = new int[n][n];
        for (int src = 0; src < n; src++) {
            int[] d = new int[n];
            Arrays.fill(d, INF); d[src] = 0;
            PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
            pq.offer(new int[]{0, src});
            while (!pq.isEmpty()) {
                int[] cur = pq.poll();
                int u = cur[1];
                if (cur[0] > d[u]) continue;
                for (int[] nb : adj.get(u))
                    if (d[u] + nb[1] < d[nb[0]]) {
                        d[nb[0]] = d[u] + nb[1];
                        pq.offer(new int[]{d[nb[0]], nb[0]});
                    }
            }
            // 4. Undo the shift: real = d + h[v] - h[src].
            for (int v = 0; v < n; v++)
                dist[src][v] = d[v] >= INF ? INF : d[v] + h[v] - h[src];
        }
        return dist;
    }
}`,
    },
    lineMap: {
      python: { 10: 6, 13: 7, 15: 10, 17: null, 22: 13, 28: 17, 32: 20, 36: 24, 37: 25, 43: 27, 45: 29 },
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

  /* java: 8 = key[0]=0 seeds the tree, 13 = pop the cheapest crossing edge,
     15 = mark the node in-tree, 16 = add its edge weight to the total,
     18 = the "cheaper than v's current key?" test, 19 = tighten that key,
     24 = return the total weight.
     Java pops a node and reads key[u]; Python carries (w, u, v) on the heap
     and skips already-visited targets, so java 13's poll is python's heappop
     and java 15's inMST flag is python's visited.add. */
  prim: {
    lineMap: {
      python: { 8: 4, 13: 9, 15: 12, 16: 14, 18: 16, 19: 17, 24: 18 },
    },
  },

  /* java: 9 = mark visited in pass 1, 10 = recurse into an unvisited
     neighbour, 11 = push on finish, 14 = add to the component in pass 2,
     15 = recurse over the reversed edges, 18 = start pass 1, 19 = a new DFS
     root, 20 = clear the marks before pass 2, 23 = pop the finish stack,
     24 = an unpopped node roots a new component, 26 = record the component,
     29 = return them all.
     Python defines dfs1/dfs2 before their callers, so the map legitimately
     runs backwards: java 18 lands on python 2, above java 15's target. */
  scc: {
    lineMap: {
      python: { 9: 4, 10: 6, 11: 8, 14: 20, 15: 22, 18: 2, 19: 10, 20: 16, 23: 24, 24: 25, 26: 28, 29: 29 },
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

  /* java: 22 = dp[{0}][0]=0 starts the tour at city 0, 32 = "is this hop
     cheaper than what that state already holds?", 33 = store the better cost,
     44 = close the tour by returning to city 0, 45 = keep the best closing
     city, 53 = walk par[] backwards, 61 = print the tour.
     Java fills a bottom-up dp table and reconstructs from par[]; Python is a
     top-down memoised recursion that returns only the cost. Its single
     `min(...)` already carries java 32, so java 45 has no separate line, and
     it never reconstructs a route, so java 53 has none either. */
  tsp: {
    lineMap: {
      python: { 22: 15, 32: 12, 33: 13, 44: 6, 45: null, 53: null, 61: 18 },
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
