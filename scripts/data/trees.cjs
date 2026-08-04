/* Hand-authored per-language line maps for the `trees` category.
   See scripts/apply-code-data.cjs. Java line numbers -> equivalent line;
   `null` = this language genuinely has no equivalent line. */
module.exports = {
  /* java: 2 = the root field, 6 = close insert() (the value is placed),
     9 = descend left, 10 = descend right. C/C++/Python/JS all pass the root
     through as a parameter instead of holding a field, so the node type stands
     in for "the tree". */
  bst: {
    lineMap: {
      c:          { 2: 3, 6: 7, 9: 14, 10: 15 },
      cpp:        { 2: 3, 6: 8, 9: 10, 10: 11 },
      python:     { 2: 1, 6: 5, 9: 9, 10: 11 },
      // JS uses a plain `else` rather than an explicit `val > root.val` test.
      javascript: { 2: 1, 6: 9, 9: 11, 10: 12 },
    },
  },

  /* java: 2 = height(), 3 = the null base case, 4 = recurse left,
     5 = recurse right, 6 = combine.
     C++/Python/JS compute both sides inside the `max(...)` call, so the two
     recursive descents share a line; only the left one claims it. */
  /* The Python here answered a different question: Java's base case returns
     -1 so height counts EDGES, Python returned 0 so it counted NODES — the
     same tree gave 2 in Java and 3 in Python, and the step descriptions
     (written against Java) contradicted the Python listing. Base case fixed
     to -1 so both compute the same value. */
  treeHeight: {
    snippets: {
      python: `class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None


def height(root):
    if not root:
        return -1  # -1 so height counts edges, not nodes
    return 1 + max(height(root.left), height(root.right))


root = Node(1)
root.left, root.right = Node(2), Node(3)
root.left.left = Node(4)
print(height(root))`,
    },
    lineMap: {
      c:          { 2: 6, 3: 7, 4: 8, 5: null, 6: 9 },
      cpp:        { 2: 9, 3: 10, 4: 11, 5: null, 6: null },
      python:     { 2: 6, 3: 8, 4: 9, 5: null, 6: null },
      javascript: { 2: 9, 3: 10, 4: 11, 5: null, 6: null },
    },
  },

  /* java: 2 = the node type, 4 = inorder(), 6 = the left-subtree descent. */
  treeTraversal: {
    lineMap: {
      c:          { 2: 3, 4: 13, 6: 15 },
      cpp:        { 2: 3, 4: 8, 6: 10 },
      python:     { 2: 1, 4: 5, 6: 7 },
      javascript: { 2: 1, 4: 17, 6: 19 },
    },
  },

  /* java: 2 = isBalanced(), 4 = close it, 9 = measure the right subtree,
     10 = bail out if that side is unbalanced.
     Python folds the right-subtree bail-out into a combined test; JS tracks a
     `balanced` flag instead of the -1 sentinel, so its check is the abs test. */
  balancedTree: {
    lineMap: {
      c:          { 2: 16, 4: 18, 9: 11, 10: 12 },
      cpp:        { 2: 17, 4: 19, 9: 12, 10: 13 },
      python:     { 2: 5, 4: 16, 9: 12, 10: 13 },
      javascript: { 2: 9, 4: 19, 9: 14, 10: 15 },
    },
  },

  /* java: 2 = lca(), 3 = the base case, 4 = search the left subtree,
     6 = both sides found => this is the ancestor, 7 = propagate the one that
     did, 8 = close the method.
     C/C++ recurse into both subtrees on one line, so the left descent claims
     it; neither has a distinct closing line beyond the function's brace. */
  lca: {
    lineMap: {
      c:          { 2: 6, 3: 7, 4: 8, 6: 9, 7: 10, 8: 11 },
      cpp:        { 2: 6, 3: 7, 4: 8, 6: 9, 7: 10, 8: 11 },
      python:     { 2: 5, 3: 6, 4: 8, 6: 10, 7: 12, 8: null },
      javascript: { 2: 9, 3: 10, 4: 11, 6: 13, 7: 14, 8: 15 },
    },
  },

  /* java: 2 = mirror(), 4 = mirror the left subtree, 5 = mirror the right,
     7 = attach the swapped children.
     C/C++ swap first and then recurse; Python/JS swap and recurse in a single
     destructuring assignment, so only one line carries the descent. */
  mirrorTree: {
    lineMap: {
      c:          { 2: 6, 4: 11, 5: 12, 7: 10 },
      cpp:        { 2: 7, 4: 10, 5: 11, 7: 9 },
      python:     { 2: 5, 4: 7, 5: null, 7: null },
      javascript: { 2: 9, 4: 11, 5: null, 7: null },
    },
  },

  /* java: 2 = hasPathSum(), 4 = the leaf test, 6 = recurse right,
     7/8 = the closing braces as the recursion unwinds.
     Every other language does both recursive calls on one line, so the right
     descent claims it and there is no second closing line to unwind to. */
  pathSum: {
    lineMap: {
      c:          { 2: 6, 4: 8, 6: 9, 7: 10, 8: null },
      cpp:        { 2: 5, 4: 7, 6: 8, 7: 9, 8: null },
      python:     { 2: 5, 4: 8, 6: 11, 7: null, 8: null },
      javascript: { 2: 9, 4: 11, 6: 12, 7: 13, 8: null },
    },
  },

  /* java: 2 = the class, 3 = levelOrder(), 6 = the queue, 8 = the drain loop,
     9 = capture this level's width, 11 = walk that many nodes.
     C and C++ print as they go rather than grouping per level, so there is no
     level-width capture or inner loop in either. */
  levelOrder: {
    lineMap: {
      c:          { 2: 3, 3: 8, 6: 10, 8: 13, 9: null, 11: null },
      cpp:        { 2: 4, 3: 9, 6: 11, 8: 13, 9: null, 11: null },
      // Python's `for _ in range(len(queue))` captures the width and loops in
      // one line, so only the loop step claims it.
      python:     { 2: 3, 3: 7, 6: 11, 8: 12, 9: null, 11: 14 },
      javascript: { 2: 1, 3: 9, 6: 12, 8: 13, 9: 15, 11: 16 },
    },
  },

  /* java: 2 = the tree array, 4 = the constructor, 6 = allocate 4n slots,
     7 = kick off the recursive build.
     Python and JS use the iterative bottom-up (2n) form, where declaring and
     sizing the array is one line and "build" is the fold loop. */
  segmentTree: {
    lineMap: {
      c:          { 2: 2, 4: null, 6: null, 7: 3 },
      // The C++ constructor sizes `t` in its initialiser list, on its own line.
      cpp:        { 2: 4, 4: 6, 6: null, 7: 7 },
      python:     { 2: 5, 4: 3, 6: null, 7: 8 },
      javascript: { 2: 4, 4: 2, 6: null, 7: 6 },
    },
  },

  /* java: 2 = serialize(), 3 = the null marker, 4 = the preorder concat,
     6 = deserialize().
     C shipped only '// Serialize to preorder string, deserialize recursively',
     and C++ shipped serialize() with no deserialize at all. C is implemented;
     C++'s missing half is left unmapped rather than pointed somewhere wrong. */
  serializeDeserialize: {
    snippets: {
      c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Node {
    int v;
    struct Node *l, *r;
} Node;

void serialize(Node* n, char* out) {
    if (!n) {
        strcat(out, "N,");
        return;
    }
    char buf[16];
    sprintf(buf, "%d,", n->v);
    strcat(out, buf);
    serialize(n->l, out);
    serialize(n->r, out);
}

Node* build(char** cursor) {
    char* token = strsep(cursor, ",");
    if (!token || token[0] == 'N') return NULL;
    Node* n = malloc(sizeof(Node));
    n->v = atoi(token);
    n->l = build(cursor);
    n->r = build(cursor);
    return n;
}

Node* deserialize(char* data) {
    char* cursor = data;
    return build(&cursor);
}

int main() {
    Node a = {1, NULL, NULL}, b = {2, NULL, NULL}, c = {3, NULL, NULL};
    a.l = &b;
    a.r = &c;
    char out[256] = "";
    serialize(&a, out);
    printf("%s\\n", out);
    return 0;
}`,
    },
    lineMap: {
      c:          { 2: 10, 3: 12, 4: 16, 6: 32 },
      // C++ has no deserialize half.
      cpp:        { 2: 9, 3: 10, 4: 11, 6: null },
      // Python/JS build a token list in a nested dfs rather than concatenating.
      python:     { 2: 5, 3: 9, 4: 11, 6: 17 },
      javascript: { 2: 9, 3: 13, 4: 16, 6: 24 },
    },
  },

  /* java: 2 = the trie node type, 4 = insert(), 5 = start at the root,
     7 = create the missing child.
     Python stores children in plain dicts, so there is no node type and the
     create-if-absent is folded into `setdefault`. */
  trie: {
    lineMap: {
      c:          { 2: 4, 4: 8, 5: 9, 7: 12 },
      cpp:        { 2: 4, 4: 8, 5: 9, 7: 11 },
      python:     { 2: 3, 4: 5, 5: 6, 7: 8 },
      javascript: { 2: 1, 4: 12, 5: 13, 7: 15 },
    },
  },

  /* The shipped Java packed all of insert() plus both rotations onto three
     lines, so every one of the 15 visualization steps would have highlighted
     the same line. Re-expanded here (whitespace only — identical program) and
     steps.js was re-authored against these numbers.

     java: 8 = height(), 10 = balance(), 14/23 = the pointer swing inside each
     rotation, 30 = insert(), 31 = the empty-slot base case, 32/33 = descend,
     34 = duplicate key, 36 = compute the balance factor, 37/38/39/43 = the
     LL/RR/LR/RL cases, 47 = return the (possibly new) subtree root. */
  avlTree: {
    snippets: {
      java: `public class AVLTree {
    class Node {
        int val, height;
        Node left, right;
        Node(int v) { val = v; height = 1; }
    }

    int height(Node n) { return n == null ? 0 : n.height; }

    int balance(Node n) { return n == null ? 0 : height(n.left) - height(n.right); }

    Node rotateRight(Node y) {
        Node x = y.left, T2 = x.right;
        x.right = y;
        y.left = T2;
        y.height = 1 + Math.max(height(y.left), height(y.right));
        x.height = 1 + Math.max(height(x.left), height(x.right));
        return x;
    }

    Node rotateLeft(Node x) {
        Node y = x.right, T2 = y.left;
        y.left = x;
        x.right = T2;
        x.height = 1 + Math.max(height(x.left), height(x.right));
        y.height = 1 + Math.max(height(y.left), height(y.right));
        return y;
    }

    Node insert(Node node, int key) {
        if (node == null) return new Node(key);
        if (key < node.val) node.left = insert(node.left, key);
        else if (key > node.val) node.right = insert(node.right, key);
        else return node;
        node.height = 1 + Math.max(height(node.left), height(node.right));
        int bf = balance(node);
        if (bf > 1 && key < node.left.val) return rotateRight(node);
        if (bf < -1 && key > node.right.val) return rotateLeft(node);
        if (bf > 1 && key > node.left.val) {
            node.left = rotateLeft(node.left);
            return rotateRight(node);
        }
        if (bf < -1 && key < node.right.val) {
            node.right = rotateRight(node.right);
            return rotateLeft(node);
        }
        return node;
    }
}`,
    },
    lineMap: {
      // Python's insert has no explicit duplicate branch — its `else` covers
      // both `>` and `==`, so java 34 has no equivalent line.
      python: { 8: 6, 10: 9, 14: 17, 23: 23, 30: 27, 31: 29, 32: 31, 33: 33, 34: null, 36: 35, 37: 36, 38: 38, 39: 40, 43: 43, 47: 46 },
    },
  },
}
