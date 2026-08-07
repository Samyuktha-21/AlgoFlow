/* Hand-authored Python line maps for the `advanced` category.
   See scripts/apply-code-data.cjs. Java line numbers -> equivalent Python line.

   ahoCorasick, convexHull, fft, rabinKarp, redBlackTree, suffixArray and
   zAlgorithm used to be excluded because they shipped a placeholder generator
   that walked the input array emitting "Processing index N". They now run the
   real algorithm, so they are mapped like the rest. */
module.exports = {
  /* java: 2 = buildLPS(), 7 = extend the current border, 8 = fall back to a
     shorter border, 9 = no border at all, 11 = return the table,
     18 = the text/pattern character comparison, 19 = a full match,
     21 = the mismatch shift, 23 = the scan is finished.

     Java packs `{ i++; j++; }` and `{ lps[i++] = ++len; }` onto single lines
     that Python spreads over three; the map points at the line carrying the
     step's headline effect. Java also handles both mismatch cases on one line
     (`if (j > 0) j = lps[j-1]; else i++;`), which Python splits into an
     elif/else — the fallback branch wins that row since it is the
     interesting one. */
  kmp: {
    lineMap: {
      python: { 2: 1, 7: 7, 8: 10, 9: 12, 11: 14, 18: 20, 19: 23, 21: 26, 23: 29 },
    },
  },

  /* java: 3 = size n and the z array, 4 = the trivial z[0], 5 = the scan,
     6 = copy an answer from inside the Z-box, 7 = extend by comparison,
     8 = move the Z-box right, 10 = return.
     Java declares n and z on one line; Python splits them, and the map points
     at `n = len(s)` where execution enters the pair. Java's one-line
     `if (i < r) z[i] = ...` becomes an if/body pair in Python — the body wins
     the row, since the step is only emitted when the branch is taken. */
  zAlgorithm: {
    lineMap: {
      python: { 3: 2, 4: 4, 5: 6, 6: 8, 7: 9, 8: 12, 10: 13 },
    },
  },

  /* java: 4 = the text/pattern lengths, 5 = the high-order multiplier,
     6 = zero both hashes, 7 = seed them over the first window, 8 = slide,
     9 = the hash test plus the character re-check, 10 = roll the hash,
     11 = the scan is finished.
     Java updates both hashes on one line where Python uses two (8, 9); the
     loop header carries the row. Java prints as it goes and returns nothing,
     so its closing brace maps to Python's `return hits`. */
  rabinKarp: {
    lineMap: {
      python: { 4: 2, 5: 5, 6: 6, 7: 7, 8: 11, 9: 12, 10: 15, 11: 16 },
    },
  },

  /* java: 3 = the length, 5 = the identity permutation, 7 = rank by first
     character, 8 = the doubling loop, 10 = sort on the rank pairs,
     15 = the first suffix gets rank 0, 16 = walk the sorted order,
     19 = a differing pair means a new rank, 21 = adopt this round's ranks,
     23 = return.
     Python's fast build is the second function in the file (the first is the
     naive one-liner), so every target sits in build_suffix_array_fast. Java
     sorts with a comparator and Python with a key function; both are the same
     "order by (rank, rank at +gap)" step. */
  suffixArray: {
    lineMap: {
      python: { 3: 5, 5: 6, 7: 7, 8: 9, 10: 11, 15: 12, 16: 13, 19: 14, 21: 15, 23: 17 },
    },
  },

  /* java: 7 = start a pattern at the root, 8 = next character, 10 = create a
     node, 11 = descend, 13 = mark an output node, 17 = seed the BFS queue,
     19 = pop a node, 22 = set a child's fail link and inherit its outputs,
     23 = precompute a missing transition, 28 = start the scan at the root,
     29 = read a character, 30 = follow the automaton, 31 = an output node,
     32 = report a match, 33 = the scan is finished.
     The two versions differ in where the fail-link work happens: Java fills a
     dense goto table at build time (line 23), so the search never backs up,
     while Python walks fail links lazily during the search (lines 18-19).
     That walk is the equivalent of Java's precomputation, so 23 maps to it. */
  ahoCorasick: {
    lineMap: {
      python: {
        7: 6, 8: 7, 10: 9, 11: 11, 13: 12, 17: 13, 19: 15, 22: 20, 23: 18,
        28: 27, 29: 28, 30: 31, 31: 32, 32: 33, 33: 34,
      },
    },
  },

  /* java: 4 = the cross product, 7 = enter with n points, 8 = the degenerate
     "2 points or fewer" exit, 9 = sort left to right, 11 = start an empty
     chain, 12 = the lower hull sweep, 13 = the upper hull sweep, 14 = return.
     Java builds both chains in one array with a stack pointer k and returns
     `copyOf(hull, k-1)`; Python keeps `lower` and `upper` separately and drops
     each one's last point. The two `append` lines are the natural targets for
     Java's two sweep lines. */
  convexHull: {
    lineMap: {
      python: { 4: 2, 7: 4, 8: 7, 9: 5, 11: 8, 12: 12, 13: 16, 14: 17 },
    },
  },

  /* java: 8 = the transform length, 9 = the bit-reversal scan, 12 = a swap,
     14 = the level loop, 16 = the root of unity for this level, 19 = the
     butterfly's inner loop, 21 = the butterfly itself.
     Java is the iterative Cooley-Tukey and Python is the textbook recursive
     one, so the correspondence is structural rather than line-for-line: Java's
     level loop is Python's recursive split, and Java's butterfly is Python's
     combine. The bit-reversal permutation (9, 12) exists only to make the
     iterative version work in place — the recursion reorders implicitly by
     slicing, so it has no equivalent line at all. */
  fft: {
    lineMap: {
      python: { 8: 4, 9: null, 12: null, 14: 7, 16: 11, 19: 10, 21: 12 },
    },
  },

  /* The shipped Python was a CLRS red-black tree — parent pointers, uncle
     cases, fix-up after the fact — while the Java is Sedgewick's left-leaning
     variant, where the whole insert is three checks on the way back up the
     recursion. They are different algorithms, so no honest line map existed
     between them. The Python below is the same left-leaning algorithm as the
     Java, which is what makes the map meaningful.

     java: 5 = isRed, 6 = rotateLeft, 7 = rotateRight, 8 = flipColors,
     10 = attach a new red node, 11 = descend left, 12 = descend right,
     13 = lean left, 14 = split a 4-node, 15 = flip colours up, 16 = return
     the fixed subtree, 18 = the public insert that blackens the root. */
  redBlackTree: {
    snippets: {
      python: `RED, BLACK = True, False


class Node:
    def __init__(self, key):
        self.key = key
        self.color = RED
        self.left = self.right = None


def is_red(n):
    return n is not None and n.color == RED


def rotate_left(h):
    x = h.right
    h.right, x.left = x.left, h
    x.color, h.color = h.color, RED
    return x


def rotate_right(h):
    x = h.left
    h.left, x.right = x.right, h
    x.color, h.color = h.color, RED
    return x


def flip_colors(h):
    h.color = not h.color
    h.left.color = not h.left.color
    h.right.color = not h.right.color


def _insert(h, key):
    if h is None:
        return Node(key)
    if key < h.key:
        h.left = _insert(h.left, key)
    elif key > h.key:
        h.right = _insert(h.right, key)
    if is_red(h.right) and not is_red(h.left):
        h = rotate_left(h)
    if is_red(h.left) and is_red(h.left.left):
        h = rotate_right(h)
    if is_red(h.left) and is_red(h.right):
        flip_colors(h)
    return h


class RedBlackTree:
    def __init__(self):
        self.root = None

    def insert(self, key):
        self.root = _insert(self.root, key)
        self.root.color = BLACK


t = RedBlackTree()
for v in [10, 20, 30, 15, 25]:
    t.insert(v)
`,
    },
    lineMap: {
      python: { 5: 12, 6: 17, 7: 24, 8: 30, 10: 37, 11: 39, 12: 41, 13: 43, 14: 45, 15: 47, 16: 48, 18: 57 },
    },
  },
}
