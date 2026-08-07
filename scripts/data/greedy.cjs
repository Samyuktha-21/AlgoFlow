/* Hand-authored Python line maps for the `greedy` category.
   See scripts/apply-code-data.cjs. Java line numbers -> equivalent Python line;
   `null` = Python genuinely has no equivalent line.

   egyptianFraction, fileMerge, huffman and mstGreedy used to be excluded
   because they shipped a placeholder generator that walked the input array
   emitting "Processing index N". They now run the real algorithm, so they are
   mapped like the rest. */
module.exports = {
  /* java: 7 = sort by finish time, 10 = take the next activity,
     11 = the compatibility test, 12 = select it, 16 = return the set.
     Python seeds `chosen` with the first activity and iterates the rest, so
     its loop line stands in for Java's index-array walk. */
  activitySelection: {
    lineMap: {
      python: { 7: 2, 10: 5, 11: 6, 12: 7, 16: 9 },
    },
  },

  /* java: 2 = makeChange(), 5 = how many of this coin fit, 6 = the remainder,
     8 = return the tally.
     Java divides once per denomination; Python subtracts in a while loop, so
     the division maps to that loop header and the modulo to the subtraction. */
  coinChangeGreedy: {
    lineMap: {
      python: { 2: 1, 5: 5, 6: 6, 8: 8 },
    },
  },

  /* java: 7 = sort by value/weight ratio, 9 = take the next item,
     10 = the whole-item branch, 11 = the fractional branch, 13 = return.
     Python unpacks (weight, value) in the loop header rather than building an
     Item[] first. */
  fractionalKnapsack: {
    lineMap: {
      python: { 7: 2, 9: 4, 10: 5, 11: 9, 13: 11 },
    },
  },

  /* java: 7 = sort by profit, 10 = next job, 11 = scan slots backwards from
     the deadline, 12 = claim a free slot, 15 = return count + profit.
     Python returns the filled slots and the profit as a tuple. */
  jobSequencing: {
    lineMap: {
      python: { 7: 2, 10: 6, 11: 7, 12: 8, 15: 12 },
    },
  },

  /* java: 3 = the "nothing left" test, 4 = the remainder is already a unit
     fraction, 5 = the remainder is a whole number, 6/7/8 = peel off the whole
     part when num > den, 10 = the greedy denominator ceil(den/num), 11 = emit
     the unit fraction, 12 = recurse on the remainder.
     Java is recursive with four early exits; Python is a single loop that
     handles all of them by falling out when the numerator hits zero. Only the
     three lines of the general case have a Python counterpart — the special
     cases map to null rather than to an approximate line. */
  egyptianFraction: {
    lineMap: {
      python: { 3: 5, 4: null, 5: null, 6: null, 7: null, 8: null, 10: 6, 11: 7, 12: 8 },
    },
  },

  /* java: 4 = create the priority queue, 5 = load the file sizes into it,
     6 = zero the running cost, 7 = more than one file left, 8 = take the two
     smallest, 9 = pay a+b, 10 = put the merged file back, 12 = return.
     Python heapifies the caller's list in place, so there is no separate
     "create the queue" line for java 4 to point at. Java polls both files on
     one line where Python uses two pops; the first carries the row. */
  fileMerge: {
    lineMap: {
      python: { 4: null, 5: 4, 6: 5, 7: 6, 8: 7, 9: 9, 10: 10, 12: 11 },
    },
  },

  /* java: 11 = the leaf test, 12 = emit a codeword, 13 = descend left (0),
     14 = descend right (1), 17 = create the priority queue, 18 = queue one
     leaf per symbol, 19 = more than one node left, 20 = take the two lightest,
     21 = push their parent back, 23 = walk the finished tree.
     Java builds the queue then adds leaves (17, 18); Python builds the list of
     leaves first and heapifies it, so those two rows run backwards against
     each other. Java's printCodes recursion is Python's nested walk(). */
  huffman: {
    lineMap: {
      python: { 11: 14, 12: 15, 13: 17, 14: 18, 17: 5, 18: 4, 19: 7, 20: 8, 21: 10, 23: 19 },
    },
  },

  /* The shipped Python was Prim's algorithm — grow one tree from a start node
     using a heap of crossing edges — while the Java is Kruskal: sort every
     edge and union-find your way past the cycles. Two different algorithms,
     so there was no honest line map between them. The Python below is
     Kruskal, matching the canonical Java.

     java: 6 = find both endpoints' roots, 7 = same root means a cycle,
     8 = swap so the shallower tree hangs under the deeper one, 9 = link,
     10 = equal ranks deepen the result, 11 = the union succeeded,
     14 = allocate parent/rank, 15 = every node is its own parent,
     16 = sort the edges by weight, 17 = zero the totals, 18 = the next
     cheapest edge, 20 = take it, 22 = n-1 edges means done, 25 = return. */
  mstGreedy: {
    snippets: {
      python: `def find(parent, x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x


def union(parent, rank, a, b):
    a, b = find(parent, a), find(parent, b)
    if a == b:
        return False
    if rank[a] < rank[b]:
        a, b = b, a
    parent[b] = a
    if rank[a] == rank[b]:
        rank[a] += 1
    return True


def kruskal(n, edges):              # edges: (u, v, weight)
    parent = list(range(n))
    rank = [0] * n
    edges.sort(key=lambda e: e[2])
    total = count = 0
    for u, v, w in edges:
        if union(parent, rank, u, v):
            total += w
            count += 1
            print(u, "-", v, ":", w)
            if count == n - 1:
                break
    return total


print(kruskal(6, [(0, 1, 4), (0, 2, 1), (1, 2, 2), (1, 3, 5),
                  (2, 3, 8), (3, 4, 3), (4, 5, 2), (3, 5, 7)]))
`,
    },
    lineMap: {
      python: {
        6: 9, 7: 10, 8: 13, 9: 14, 10: 16, 11: 17,
        14: 22, 15: 21, 16: 23, 17: 24, 18: 25, 20: 27, 22: 30, 25: 32,
      },
    },
  },
}
