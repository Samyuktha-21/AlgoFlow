/* Hand-authored per-language line maps for the `linked-lists` category.
   See scripts/apply-code-data.cjs. Java line numbers -> equivalent line;
   `null` = this language genuinely has no equivalent line. */
module.exports = {
  /* java: 2 = the node type, 4 = reverse(), 6 = the walk loop,
     7 = stash the next pointer, 9 = advance prev. */
  reverseLinkedList: {
    lineMap: {
      c:          { 2: 2, 4: 6, 6: 8, 7: 9, 9: 11 },
      cpp:        { 2: 3, 4: 9, 6: 11, 7: 12, 9: 14 },
      python:     { 2: 1, 4: 5, 6: 7, 7: 8, 9: 10 },
      javascript: { 2: 1, 4: 8, 6: 10, 7: 11, 9: 13 },
    },
  },

  /* java: 2 = the node type, 4 = the two pointers, 6 = advance the slow one. */
  detectCycle: {
    lineMap: {
      c:          { 2: 2, 4: 8, 6: 10 },
      cpp:        { 2: 3, 4: 10, 6: 12 },
      python:     { 2: 1, 4: 6, 6: 8 },
      javascript: { 2: 1, 4: 9, 6: 11 },
    },
  },

  /* java: 2 = findMiddle(), 4 = the fast/slow loop, 5 = advance slow,
     7 = close the loop (middle reached). */
  findMiddle: {
    lineMap: {
      c:          { 2: 7, 4: 9, 5: 10, 7: 12 },
      cpp:        { 2: 5, 4: 7, 5: 8, 7: 10 },
      python:     { 2: 5, 4: 7, 5: 8, 7: null },
      javascript: { 2: 8, 4: 10, 5: 11, 7: 13 },
    },
  },

  /* java: 2 = mergeTwoLists(), 4 = the merge loop, 5 = take from the first
     list, 7 = advance the tail, 9 = attach whatever remains. */
  mergeSortedLists: {
    lineMap: {
      c:          { 2: 6, 4: 9, 5: 10, 7: 17, 9: 19 },
      cpp:        { 2: 7, 4: 10, 5: 11, 7: 18, 9: 20 },
      python:     { 2: 5, 4: 8, 5: 9, 7: 13, 9: 14 },
      javascript: { 2: 8, 4: 11, 5: 12, 7: 19, 9: 21 },
    },
  },

  /* java: 2 = removeNthFromEnd(), 3 = the dummy head, 5 = the two cursors,
     6 = advance fast by n, 8 = unlink the node, 9 = return the new head. */
  removeNthNode: {
    lineMap: {
      c:          { 2: 6, 3: 7, 5: 9, 6: 10, 8: 15, 9: 16 },
      cpp:        { 2: 5, 3: 6, 5: 8, 6: 9, 8: 14, 9: 15 },
      python:     { 2: 5, 3: 6, 5: 8, 6: 9, 8: 14, 9: 15 },
      javascript: { 2: 8, 3: 9, 5: 11, 6: 12, 8: 17, 9: 18 },
    },
  },

  /* java: 2 = getIntersectionNode(), 3 = the two walkers, 5 = advance the
     first walker (switching lists at the end). */
  intersectionPoint: {
    lineMap: {
      c:          { 2: 6, 3: 7, 5: 9 },
      cpp:        { 2: 5, 3: 6, 5: 8 },
      python:     { 2: 5, 3: 6, 5: 8 },
      javascript: { 2: 8, 3: 9, 5: 11 },
    },
  },

  /* java: 2 = the node type, 4 = flatten(), 5 = the empty guard,
     6 = the walk cursor.
     C shipped only a struct and a `// Flatten by connecting child lists
     inline` comment — no implementation at all — and JS solved a different
     problem (merging `bottom` lists rather than splicing `child` lists).
     Both rewritten to Java's child-splicing flatten. */
  flattenLinkedList: {
    snippets: {
      c: `#include <stdlib.h>

typedef struct Node {
    int v;
    struct Node *next, *child;
} Node;

Node* flatten(Node* head) {
    if (!head) return NULL;
    Node* curr = head;
    while (curr) {
        if (curr->child) {
            Node* nxt = curr->next;
            curr->next = curr->child;
            curr->child = NULL;
            Node* tail = curr->next;
            while (tail->next) tail = tail->next;
            tail->next = nxt;
        }
        curr = curr->next;
    }
    return head;
}`,
      javascript: `class Node {
  constructor(val) {
    this.val = val;
    this.next = null;
    this.child = null;
  }
}

function flatten(head) {
  if (head === null) return null;
  let curr = head;
  while (curr) {
    if (curr.child) {
      const nxt = curr.next;
      curr.next = curr.child;
      curr.child = null;
      let tail = curr.next;
      while (tail.next) tail = tail.next;
      tail.next = nxt;
    }
    curr = curr.next;
  }
  return head;
}

const a = new Node(1), b = new Node(2), c = new Node(3), d = new Node(4);
a.next = b;
b.next = c;
b.child = d;
const out = [];
for (let n = flatten(a); n; n = n.next) out.push(n.val);
console.log(out.join(' '));`,
    },
    lineMap: {
      c:          { 2: 3, 4: 8, 5: 9, 6: 10 },
      cpp:        { 2: 1, 4: 5, 5: 6, 6: 7 },
      // Python walks straight from `cur = head`; no explicit empty guard.
      python:     { 2: 1, 4: 5, 5: null, 6: 6 },
      javascript: { 2: 1, 4: 9, 5: 10, 6: 11 },
    },
  },

  /* java: 2 = the cache type, 5 = the constructor, 6 = store the capacity,
     9 = close the backing-map setup, 10 = close the constructor.
     C models the cache with file-scope arrays and no constructor at all, and
     C++ folds the whole constructor onto one line, so several of these have
     no distinct line there. */
  lruCache: {
    lineMap: {
      c:          { 2: 4, 5: null, 6: 3, 9: null, 10: null },
      cpp:        { 2: 4, 5: 8, 6: 5, 9: 7, 10: null },
      python:     { 2: 1, 5: 8, 6: 9, 9: 11, 10: 12 },
      javascript: { 2: 1, 5: 2, 6: 3, 9: 4, 10: 5 },
    },
  },
}
