# Phase 3 — Practice Problems + Embedded IDE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/practice` page where learners filter curated LeetCode/HackerRank/NeetCode problems by topic + algorithm, read example test cases, and write & run code in an embedded OneCompiler IDE (Java/C/C++/Python); reachable via deep-link buttons from the header, Category pages, and Algorithm pages.

**Architecture:** One lazy-loaded `/practice` route composes two components — a filter/list panel (`PracticeProblemList`) and an iframe IDE (`OneCompilerIDE`). Problem data lives in a static `practiceProblems.js` dataset; a pure `filterProblems` util drives filtering. Every other surface is a deep-link button that prefills the page via `?topic=&algo=` URL params. No backend: code execution is delegated to OneCompiler's embeddable IDE; there is no auto-judging.

**Tech Stack:** React 19, react-router-dom 7, framer-motion (already present), lucide-react icons, inline styles + existing `--page-*`/`--chrome-*` CSS vars, Vite 8 build, node built-in test scripts (`node:assert`).

## Global Constraints

- No backend / no new runtime dependency. Execution is the **OneCompiler iframe embed** only. No auto pass/fail this phase.
- Only these four language slugs, in this order: `java`, `c`, `cpp`, `python`.
- OneCompiler embed base: `https://onecompiler.com/embed/{lang}?theme={dark|light}&hideNew=true&hideNewFileOption=true&hideTitle=true&listenToEvents=true&availableLanguages=java,c,cpp,python`.
- Dataset invariants (enforced by the validator test): each problem has a unique `id`; `categoryId` ∈ `categories.json`; if `algorithmId` present it ∈ `algorithmRegistry[categoryId]`; `source` ∈ `['LeetCode','NeetCode','HackerRank']`; `difficulty` ∈ `['easy','medium','hard']`; non-empty `title`/`url`(http[s])/`prompt`; `examples.length ≥ 1` with non-empty `input`/`output`; **every one of the 14 categories has ≥1 problem**.
- Filter semantics: `topic='all'`→all; `topic=X,algo='all'`→`categoryId===X`; `topic=X,algo=Y`→`categoryId===X && (algorithmId===Y || !algorithmId)`.
- Node test scripts run via `node scripts/<name>.mjs` and print `OK ...` on success. Build: `npm run build`. Lint: `npm run lint` (must add **no** new errors over baseline ≈36 pre-existing problems).
- Icon for the Practice nav button: lucide `Code2` (verified present in `lucide-react@^1.14.0` as `code-2`).
- The homepage entry point is the **header nav button** (matching the existing `Test Yourself`/`Interview` convention — no separate hero CTA).

---

### Task 1: Pure filter util + unit test

**Files:**
- Create: `src/utils/practiceFilter.js`
- Test: `scripts/test-practice-filter.mjs`

**Interfaces:**
- Produces: `filterProblems(problems: Problem[], topic: string, algo: string): Problem[]` where `Problem = { categoryId, algorithmId? }` (plus other fields ignored by the filter).

- [ ] **Step 1: Write the failing test** — `scripts/test-practice-filter.mjs`

```js
import assert from 'node:assert'
import { filterProblems } from '../src/utils/practiceFilter.js'

const P = [
  { id: 'a', categoryId: 'sorting', algorithmId: 'quickSort' },
  { id: 'b', categoryId: 'sorting', algorithmId: 'mergeSort' },
  { id: 'c', categoryId: 'sorting' },                 // category-level fallback
  { id: 'd', categoryId: 'graphs',  algorithmId: 'bfs' },
]

assert.strictEqual(filterProblems(P, 'all', 'all').length, 4)
assert.deepStrictEqual(filterProblems(P, 'sorting', 'all').map(p => p.id), ['a', 'b', 'c'])
assert.deepStrictEqual(filterProblems(P, 'sorting', 'quickSort').map(p => p.id), ['a', 'c'])   // direct + fallback
assert.deepStrictEqual(filterProblems(P, 'sorting', 'shellSort').map(p => p.id), ['c'])         // only fallback
assert.deepStrictEqual(filterProblems(P, 'graphs', 'bfs').map(p => p.id), ['d'])
assert.strictEqual(filterProblems(P, 'greedy', 'all').length, 0)

console.log('OK test-practice-filter')
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/test-practice-filter.mjs`
Expected: FAIL — `Cannot find module '.../src/utils/practiceFilter.js'`.

- [ ] **Step 3: Write minimal implementation** — `src/utils/practiceFilter.js`

```js
/* Filter curated practice problems by topic (categoryId) and algorithm.
   A problem with no algorithmId is a category-level fallback: it shows for
   any algorithm within its category. See the design spec §6. */
export function filterProblems(problems, topic, algo) {
  return problems.filter(p => {
    if (topic && topic !== 'all' && p.categoryId !== topic) return false
    if (algo && algo !== 'all' && p.algorithmId && p.algorithmId !== algo) return false
    return true
  })
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/test-practice-filter.mjs`
Expected: `OK test-practice-filter`

- [ ] **Step 5: Commit**

```bash
git add src/utils/practiceFilter.js scripts/test-practice-filter.mjs
git commit -m "feat(practice): pure problem filter util + tests"
```

---

### Task 2: Practice problems dataset + validator test

**Files:**
- Create: `src/data/practiceProblems.js`
- Test: `scripts/test-practice-data.mjs`
- Reads (existing): `src/data/categories.json`, `src/data/algorithmRegistry.json`

**Interfaces:**
- Produces: `export const practiceProblems: Problem[]` and `export const SOURCES: string[]`.
  `Problem = { id, title, source, url, difficulty, categoryId, algorithmId?, prompt, examples: {input, output, note?}[] }`.

- [ ] **Step 1: Write the failing validator test** — `scripts/test-practice-data.mjs`

```js
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { practiceProblems, SOURCES } from '../src/data/practiceProblems.js'

const here = dirname(fileURLToPath(import.meta.url))
const readJson = (name) => JSON.parse(readFileSync(join(here, '..', 'src', 'data', name), 'utf8'))
const categories = readJson('categories.json')
const registry   = readJson('algorithmRegistry.json')

const catIds = new Set(categories.map(c => c.id))
const algoByCat = Object.fromEntries(
  Object.entries(registry).map(([cid, arr]) => [cid, new Set(arr.map(a => a.id))])
)
const DIFFS = new Set(['easy', 'medium', 'hard'])
const seen = new Set()

assert.ok(Array.isArray(practiceProblems) && practiceProblems.length > 0, 'dataset non-empty')
assert.deepStrictEqual(SOURCES, ['LeetCode', 'NeetCode', 'HackerRank'])

for (const p of practiceProblems) {
  assert.ok(p.id && !seen.has(p.id), `unique id: ${p.id}`); seen.add(p.id)
  assert.ok(typeof p.title === 'string' && p.title.trim(), `title: ${p.id}`)
  assert.ok(/^https?:\/\//.test(p.url || ''), `url http(s): ${p.id}`)
  assert.ok(SOURCES.includes(p.source), `source: ${p.id}`)
  assert.ok(DIFFS.has(p.difficulty), `difficulty: ${p.id}`)
  assert.ok(catIds.has(p.categoryId), `categoryId ${p.categoryId}: ${p.id}`)
  if (p.algorithmId != null)
    assert.ok(algoByCat[p.categoryId]?.has(p.algorithmId), `algorithmId ${p.algorithmId} in ${p.categoryId}: ${p.id}`)
  assert.ok(typeof p.prompt === 'string' && p.prompt.trim(), `prompt: ${p.id}`)
  assert.ok(Array.isArray(p.examples) && p.examples.length >= 1, `examples≥1: ${p.id}`)
  for (const ex of p.examples)
    assert.ok(ex && ex.input && ex.output, `example in/out: ${p.id}`)
}
for (const cid of catIds)
  assert.ok(practiceProblems.some(p => p.categoryId === cid), `every category has ≥1 problem: ${cid}`)

console.log(`OK test-practice-data (${practiceProblems.length} problems)`)
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/test-practice-data.mjs`
Expected: FAIL — cannot find `src/data/practiceProblems.js`.

- [ ] **Step 3: Create the dataset** — `src/data/practiceProblems.js`

This is the curated seed. It covers **all 14 categories** and passes every validator invariant. Extend it later by appending entries of the same shape — the validator guards additions.

```js
/* Curated interview-practice problems from LeetCode / NeetCode / HackerRank.
   `algorithmId` omitted = category-level fallback (shows for any algorithm in
   that category). Example cases are the public examples from each problem
   statement; hidden judge test cases are intentionally NOT included (they are
   not obtainable). See docs/superpowers/specs/2026-07-22-phase-3-practice-problems-design.md */

export const SOURCES = ['LeetCode', 'NeetCode', 'HackerRank']

const lc = (slug) => `https://leetcode.com/problems/${slug}/`

export const practiceProblems = [
  // ── fundamentals ─────────────────────────────────────────────
  { id: 'two-sum', title: 'Two Sum', source: 'LeetCode', url: lc('two-sum'), difficulty: 'easy',
    categoryId: 'fundamentals', algorithmId: 'twoSum',
    prompt: 'Return the indices of the two numbers that add up to target.',
    examples: [{ input: 'nums=[2,7,11,15], target=9', output: '[0,1]' }, { input: 'nums=[3,2,4], target=6', output: '[1,2]' }] },
  { id: 'fizz-buzz', title: 'Fizz Buzz', source: 'LeetCode', url: lc('fizz-buzz'), difficulty: 'easy',
    categoryId: 'fundamentals', algorithmId: 'fizzBuzz',
    prompt: 'Output Fizz/Buzz/FizzBuzz for multiples of 3/5/15, else the number.',
    examples: [{ input: 'n=5', output: '["1","2","Fizz","4","Buzz"]' }] },
  { id: 'valid-palindrome', title: 'Valid Palindrome', source: 'LeetCode', url: lc('valid-palindrome'), difficulty: 'easy',
    categoryId: 'fundamentals', algorithmId: 'palindromeCheck',
    prompt: 'Return true if the string is a palindrome, ignoring non-alphanumerics and case.',
    examples: [{ input: 's="A man, a plan, a canal: Panama"', output: 'true' }, { input: 's="race a car"', output: 'false' }] },
  { id: 'reverse-string', title: 'Reverse String', source: 'LeetCode', url: lc('reverse-string'), difficulty: 'easy',
    categoryId: 'fundamentals', algorithmId: 'reverseString',
    prompt: 'Reverse a char array in place.',
    examples: [{ input: 's=["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }] },

  // ── sorting ──────────────────────────────────────────────────
  { id: 'sort-an-array', title: 'Sort an Array', source: 'LeetCode', url: lc('sort-an-array'), difficulty: 'medium',
    categoryId: 'sorting', algorithmId: 'quickSort',
    prompt: 'Sort an integer array in ascending order without built-in sort.',
    examples: [{ input: 'nums=[5,2,3,1]', output: '[1,2,3,5]' }, { input: 'nums=[5,1,1,2,0,0]', output: '[0,0,1,1,2,5]' }] },
  { id: 'sort-list', title: 'Sort List', source: 'LeetCode', url: lc('sort-list'), difficulty: 'medium',
    categoryId: 'sorting', algorithmId: 'mergeSort',
    prompt: 'Sort a linked list in O(n log n) — classic merge sort on lists.',
    examples: [{ input: 'head=[4,2,1,3]', output: '[1,2,3,4]' }] },
  { id: 'insertion-sort-list', title: 'Insertion Sort List', source: 'LeetCode', url: lc('insertion-sort-list'), difficulty: 'medium',
    categoryId: 'sorting', algorithmId: 'insertionSort',
    prompt: 'Sort a linked list using insertion sort.',
    examples: [{ input: 'head=[-1,5,3,4,0]', output: '[-1,0,3,4,5]' }] },
  { id: 'largest-number', title: 'Largest Number', source: 'LeetCode', url: lc('largest-number'), difficulty: 'medium',
    categoryId: 'sorting',
    prompt: 'Arrange numbers to form the largest concatenated value (custom comparator sort).',
    examples: [{ input: 'nums=[10,2]', output: '"210"' }, { input: 'nums=[3,30,34,5,9]', output: '"9534330"' }] },

  // ── searching ────────────────────────────────────────────────
  { id: 'binary-search', title: 'Binary Search', source: 'LeetCode', url: lc('binary-search'), difficulty: 'easy',
    categoryId: 'searching', algorithmId: 'binarySearch',
    prompt: 'Return the index of target in a sorted array, or -1.',
    examples: [{ input: 'nums=[-1,0,3,5,9,12], target=9', output: '4' }, { input: 'nums=[-1,0,3,5,9,12], target=2', output: '-1' }] },
  { id: 'search-rotated', title: 'Search in Rotated Sorted Array', source: 'LeetCode', url: lc('search-in-rotated-sorted-array'), difficulty: 'medium',
    categoryId: 'searching', algorithmId: 'binarySearch',
    prompt: 'Search a rotated sorted array in O(log n).',
    examples: [{ input: 'nums=[4,5,6,7,0,1,2], target=0', output: '4' }] },
  { id: 'search-insert-position', title: 'Search Insert Position', source: 'LeetCode', url: lc('search-insert-position'), difficulty: 'easy',
    categoryId: 'searching',
    prompt: 'Return the index where target is or would be inserted.',
    examples: [{ input: 'nums=[1,3,5,6], target=5', output: '2' }, { input: 'nums=[1,3,5,6], target=2', output: '1' }] },

  // ── arrays ───────────────────────────────────────────────────
  { id: 'maximum-subarray', title: 'Maximum Subarray', source: 'LeetCode', url: lc('maximum-subarray'), difficulty: 'medium',
    categoryId: 'arrays', algorithmId: 'maximumSubarray',
    prompt: "Find the contiguous subarray with the largest sum (Kadane's).",
    examples: [{ input: 'nums=[-2,1,-3,4,-1,2,1,-5,4]', output: '6', note: 'subarray [4,-1,2,1]' }] },
  { id: 'rotate-array', title: 'Rotate Array', source: 'LeetCode', url: lc('rotate-array'), difficulty: 'medium',
    categoryId: 'arrays', algorithmId: 'rotateArray',
    prompt: 'Rotate the array to the right by k steps in place.',
    examples: [{ input: 'nums=[1,2,3,4,5,6,7], k=3', output: '[5,6,7,1,2,3,4]' }] },
  { id: 'merge-intervals', title: 'Merge Intervals', source: 'LeetCode', url: lc('merge-intervals'), difficulty: 'medium',
    categoryId: 'arrays', algorithmId: 'mergeIntervals',
    prompt: 'Merge all overlapping intervals.',
    examples: [{ input: '[[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' }] },
  { id: 'valid-parentheses', title: 'Valid Parentheses', source: 'LeetCode', url: lc('valid-parentheses'), difficulty: 'easy',
    categoryId: 'arrays', algorithmId: 'validParentheses',
    prompt: 'Return true if brackets are correctly matched and nested.',
    examples: [{ input: 's="()[]{}"', output: 'true' }, { input: 's="(]"', output: 'false' }] },
  { id: 'longest-substring-no-repeat', title: 'Longest Substring Without Repeating Characters', source: 'NeetCode', url: lc('longest-substring-without-repeating-characters'), difficulty: 'medium',
    categoryId: 'arrays', algorithmId: 'slidingWindow',
    prompt: 'Length of the longest substring without repeating characters.',
    examples: [{ input: 's="abcabcbb"', output: '3', note: '"abc"' }, { input: 's="bbbbb"', output: '1' }] },
  { id: 'sort-colors', title: 'Sort Colors', source: 'LeetCode', url: lc('sort-colors'), difficulty: 'medium',
    categoryId: 'arrays', algorithmId: 'dutchFlag',
    prompt: 'Sort an array of 0s, 1s, 2s in place (Dutch National Flag).',
    examples: [{ input: 'nums=[2,0,2,1,1,0]', output: '[0,0,1,1,2,2]' }] },
  { id: 'valid-anagram', title: 'Valid Anagram', source: 'LeetCode', url: lc('valid-anagram'), difficulty: 'easy',
    categoryId: 'arrays', algorithmId: 'anagramCheck',
    prompt: 'Return true if t is an anagram of s.',
    examples: [{ input: 's="anagram", t="nagaram"', output: 'true' }, { input: 's="rat", t="car"', output: 'false' }] },

  // ── linked-lists ─────────────────────────────────────────────
  { id: 'reverse-linked-list', title: 'Reverse Linked List', source: 'LeetCode', url: lc('reverse-linked-list'), difficulty: 'easy',
    categoryId: 'linked-lists', algorithmId: 'reverseLinkedList',
    prompt: 'Reverse a singly linked list.',
    examples: [{ input: 'head=[1,2,3,4,5]', output: '[5,4,3,2,1]' }] },
  { id: 'linked-list-cycle', title: 'Linked List Cycle', source: 'LeetCode', url: lc('linked-list-cycle'), difficulty: 'easy',
    categoryId: 'linked-lists', algorithmId: 'detectCycle',
    prompt: "Detect whether a linked list has a cycle (Floyd's tortoise & hare).",
    examples: [{ input: 'head=[3,2,0,-4], pos=1', output: 'true' }] },
  { id: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', source: 'LeetCode', url: lc('merge-two-sorted-lists'), difficulty: 'easy',
    categoryId: 'linked-lists', algorithmId: 'mergeSortedLists',
    prompt: 'Merge two sorted linked lists into one sorted list.',
    examples: [{ input: 'l1=[1,2,4], l2=[1,3,4]', output: '[1,1,2,3,4,4]' }] },
  { id: 'middle-of-linked-list', title: 'Middle of the Linked List', source: 'LeetCode', url: lc('middle-of-the-linked-list'), difficulty: 'easy',
    categoryId: 'linked-lists', algorithmId: 'findMiddle',
    prompt: 'Return the middle node (second middle if even length).',
    examples: [{ input: 'head=[1,2,3,4,5]', output: '[3,4,5]' }] },
  { id: 'lru-cache', title: 'LRU Cache', source: 'LeetCode', url: lc('lru-cache'), difficulty: 'medium',
    categoryId: 'linked-lists', algorithmId: 'lruCache',
    prompt: 'Design an O(1) get/put LRU cache (hashmap + doubly linked list).',
    examples: [{ input: 'capacity=2; put(1,1); put(2,2); get(1); put(3,3); get(2)', output: 'get(1)=1, get(2)=-1 (evicted)' }] },

  // ── stacks-queues ────────────────────────────────────────────
  { id: 'min-stack', title: 'Min Stack', source: 'LeetCode', url: lc('min-stack'), difficulty: 'medium',
    categoryId: 'stacks-queues', algorithmId: 'minStack',
    prompt: 'Design a stack supporting push/pop/top and getMin in O(1).',
    examples: [{ input: 'push(-2); push(0); push(-3); getMin()', output: '-3' }] },
  { id: 'valid-parentheses-stack', title: 'Valid Parentheses', source: 'NeetCode', url: lc('valid-parentheses'), difficulty: 'easy',
    categoryId: 'stacks-queues', algorithmId: 'validParenthesesStack',
    prompt: 'Match brackets using a stack.',
    examples: [{ input: 's="([{}])"', output: 'true' }, { input: 's="(]"', output: 'false' }] },
  { id: 'next-greater-element-i', title: 'Next Greater Element I', source: 'LeetCode', url: lc('next-greater-element-i'), difficulty: 'easy',
    categoryId: 'stacks-queues', algorithmId: 'nextGreaterElement',
    prompt: 'For each element find the next greater element to its right (monotonic stack).',
    examples: [{ input: 'nums1=[4,1,2], nums2=[1,3,4,2]', output: '[-1,3,-1]' }] },
  { id: 'implement-queue-using-stacks', title: 'Implement Queue using Stacks', source: 'LeetCode', url: lc('implement-queue-using-stacks'), difficulty: 'easy',
    categoryId: 'stacks-queues',
    prompt: 'Implement a FIFO queue using two stacks.',
    examples: [{ input: 'push(1); push(2); peek(); pop()', output: 'peek()=1, pop()=1' }] },

  // ── hashing ──────────────────────────────────────────────────
  { id: 'two-sum-hash', title: 'Two Sum', source: 'LeetCode', url: lc('two-sum'), difficulty: 'easy',
    categoryId: 'hashing', algorithmId: 'twoSumHash',
    prompt: 'Use a hashmap of value→index to find the complement in one pass.',
    examples: [{ input: 'nums=[2,7,11,15], target=9', output: '[0,1]' }] },
  { id: 'group-anagrams', title: 'Group Anagrams', source: 'LeetCode', url: lc('group-anagrams'), difficulty: 'medium',
    categoryId: 'hashing', algorithmId: 'groupAnagrams',
    prompt: 'Group words that are anagrams of each other.',
    examples: [{ input: '["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }] },
  { id: 'longest-consecutive-sequence', title: 'Longest Consecutive Sequence', source: 'LeetCode', url: lc('longest-consecutive-sequence'), difficulty: 'medium',
    categoryId: 'hashing', algorithmId: 'longestConsecutive',
    prompt: 'Length of the longest run of consecutive integers, in O(n) using a set.',
    examples: [{ input: 'nums=[100,4,200,1,3,2]', output: '4', note: '[1,2,3,4]' }] },
  { id: 'top-k-frequent-elements', title: 'Top K Frequent Elements', source: 'NeetCode', url: lc('top-k-frequent-elements'), difficulty: 'medium',
    categoryId: 'hashing', algorithmId: 'topKFrequent',
    prompt: 'Return the k most frequent elements.',
    examples: [{ input: 'nums=[1,1,1,2,2,3], k=2', output: '[1,2]' }] },
  { id: 'subarray-sum-equals-k', title: 'Subarray Sum Equals K', source: 'LeetCode', url: lc('subarray-sum-equals-k'), difficulty: 'medium',
    categoryId: 'hashing', algorithmId: 'subarraySum',
    prompt: 'Count subarrays summing to k using prefix-sum counts.',
    examples: [{ input: 'nums=[1,1,1], k=2', output: '2' }] },

  // ── trees ────────────────────────────────────────────────────
  { id: 'inorder-traversal', title: 'Binary Tree Inorder Traversal', source: 'LeetCode', url: lc('binary-tree-inorder-traversal'), difficulty: 'easy',
    categoryId: 'trees', algorithmId: 'treeTraversal',
    prompt: 'Return the inorder traversal of a binary tree.',
    examples: [{ input: 'root=[1,null,2,3]', output: '[1,3,2]' }] },
  { id: 'level-order-traversal', title: 'Binary Tree Level Order Traversal', source: 'LeetCode', url: lc('binary-tree-level-order-traversal'), difficulty: 'medium',
    categoryId: 'trees', algorithmId: 'levelOrder',
    prompt: 'Return node values level by level (BFS).',
    examples: [{ input: 'root=[3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' }] },
  { id: 'max-depth-binary-tree', title: 'Maximum Depth of Binary Tree', source: 'LeetCode', url: lc('maximum-depth-of-binary-tree'), difficulty: 'easy',
    categoryId: 'trees', algorithmId: 'treeHeight',
    prompt: 'Return the height (max depth) of a binary tree.',
    examples: [{ input: 'root=[3,9,20,null,null,15,7]', output: '3' }] },
  { id: 'validate-bst', title: 'Validate Binary Search Tree', source: 'NeetCode', url: lc('validate-binary-search-tree'), difficulty: 'medium',
    categoryId: 'trees', algorithmId: 'bst',
    prompt: 'Return true if a binary tree is a valid BST.',
    examples: [{ input: 'root=[2,1,3]', output: 'true' }, { input: 'root=[5,1,4,null,null,3,6]', output: 'false' }] },
  { id: 'lca-binary-tree', title: 'Lowest Common Ancestor of a Binary Tree', source: 'LeetCode', url: lc('lowest-common-ancestor-of-a-binary-tree'), difficulty: 'medium',
    categoryId: 'trees', algorithmId: 'lca',
    prompt: 'Find the lowest common ancestor of two nodes.',
    examples: [{ input: 'root=[3,5,1,6,2,0,8], p=5, q=1', output: '3' }] },
  { id: 'implement-trie', title: 'Implement Trie (Prefix Tree)', source: 'LeetCode', url: lc('implement-trie-prefix-tree'), difficulty: 'medium',
    categoryId: 'trees', algorithmId: 'trie',
    prompt: 'Implement insert / search / startsWith for a trie.',
    examples: [{ input: 'insert("apple"); search("apple"); search("app"); startsWith("app")', output: 'true, false, true' }] },

  // ── heaps ────────────────────────────────────────────────────
  { id: 'kth-largest-element', title: 'Kth Largest Element in an Array', source: 'LeetCode', url: lc('kth-largest-element-in-an-array'), difficulty: 'medium',
    categoryId: 'heaps', algorithmId: 'kLargestElements',
    prompt: 'Return the kth largest element (min-heap of size k).',
    examples: [{ input: 'nums=[3,2,1,5,6,4], k=2', output: '5' }] },
  { id: 'find-median-data-stream', title: 'Find Median from Data Stream', source: 'LeetCode', url: lc('find-median-from-data-stream'), difficulty: 'hard',
    categoryId: 'heaps', algorithmId: 'medianStream',
    prompt: 'Maintain a running median with two heaps.',
    examples: [{ input: 'addNum(1); addNum(2); findMedian(); addNum(3); findMedian()', output: '1.5, 2.0' }] },
  { id: 'merge-k-sorted-lists', title: 'Merge k Sorted Lists', source: 'LeetCode', url: lc('merge-k-sorted-lists'), difficulty: 'hard',
    categoryId: 'heaps', algorithmId: 'mergeKSortedLists',
    prompt: 'Merge k sorted linked lists using a min-heap.',
    examples: [{ input: 'lists=[[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' }] },
  { id: 'last-stone-weight', title: 'Last Stone Weight', source: 'LeetCode', url: lc('last-stone-weight'), difficulty: 'easy',
    categoryId: 'heaps',
    prompt: 'Repeatedly smash the two heaviest stones (max-heap).',
    examples: [{ input: 'stones=[2,7,4,1,8,1]', output: '1' }] },

  // ── graphs ───────────────────────────────────────────────────
  { id: 'number-of-islands', title: 'Number of Islands', source: 'NeetCode', url: lc('number-of-islands'), difficulty: 'medium',
    categoryId: 'graphs', algorithmId: 'bfs',
    prompt: 'Count connected groups of 1s in a grid (BFS/DFS flood fill).',
    examples: [{ input: 'grid with one connected land mass', output: '1' }] },
  { id: 'clone-graph', title: 'Clone Graph', source: 'LeetCode', url: lc('clone-graph'), difficulty: 'medium',
    categoryId: 'graphs', algorithmId: 'dfs',
    prompt: 'Deep-copy a connected undirected graph (DFS + visited map).',
    examples: [{ input: 'adjList=[[2,4],[1,3],[2,4],[1,3]]', output: 'identical cloned graph' }] },
  { id: 'course-schedule', title: 'Course Schedule', source: 'LeetCode', url: lc('course-schedule'), difficulty: 'medium',
    categoryId: 'graphs', algorithmId: 'topologicalSort',
    prompt: 'Determine if all courses can finish (cycle detection / topological sort).',
    examples: [{ input: 'numCourses=2, prerequisites=[[1,0]]', output: 'true' }, { input: 'prerequisites=[[1,0],[0,1]]', output: 'false' }] },
  { id: 'network-delay-time', title: 'Network Delay Time', source: 'LeetCode', url: lc('network-delay-time'), difficulty: 'medium',
    categoryId: 'graphs', algorithmId: 'dijkstra',
    prompt: 'Time for a signal to reach all nodes (shortest paths from a source).',
    examples: [{ input: 'times=[[2,1,1],[2,3,1],[3,4,1]], n=4, k=2', output: '2' }] },
  { id: 'is-graph-bipartite', title: 'Is Graph Bipartite?', source: 'LeetCode', url: lc('is-graph-bipartite'), difficulty: 'medium',
    categoryId: 'graphs', algorithmId: 'bipartiteCheck',
    prompt: 'Two-color the graph so no edge joins same-colored nodes.',
    examples: [{ input: 'graph=[[1,3],[0,2],[1,3],[0,2]]', output: 'true' }] },
  { id: 'redundant-connection', title: 'Redundant Connection', source: 'LeetCode', url: lc('redundant-connection'), difficulty: 'medium',
    categoryId: 'graphs', algorithmId: 'unionFind',
    prompt: 'Find the edge that creates a cycle (union-find).',
    examples: [{ input: 'edges=[[1,2],[1,3],[2,3]]', output: '[2,3]' }] },

  // ── greedy ───────────────────────────────────────────────────
  { id: 'jump-game', title: 'Jump Game', source: 'LeetCode', url: lc('jump-game'), difficulty: 'medium',
    categoryId: 'greedy',
    prompt: 'Can you reach the last index? Track the furthest reachable position.',
    examples: [{ input: 'nums=[2,3,1,1,4]', output: 'true' }, { input: 'nums=[3,2,1,0,4]', output: 'false' }] },
  { id: 'non-overlapping-intervals', title: 'Non-overlapping Intervals', source: 'LeetCode', url: lc('non-overlapping-intervals'), difficulty: 'medium',
    categoryId: 'greedy', algorithmId: 'activitySelection',
    prompt: 'Minimum intervals to remove so the rest do not overlap.',
    examples: [{ input: '[[1,2],[2,3],[3,4],[1,3]]', output: '1' }] },
  { id: 'task-scheduler', title: 'Task Scheduler', source: 'LeetCode', url: lc('task-scheduler'), difficulty: 'medium',
    categoryId: 'greedy', algorithmId: 'jobSequencing',
    prompt: 'Least time to run tasks with a cooldown between identical tasks.',
    examples: [{ input: 'tasks=["A","A","A","B","B","B"], n=2', output: '8' }] },
  { id: 'gas-station', title: 'Gas Station', source: 'LeetCode', url: lc('gas-station'), difficulty: 'medium',
    categoryId: 'greedy',
    prompt: 'Find the starting station to complete the circuit once.',
    examples: [{ input: 'gas=[1,2,3,4,5], cost=[3,4,5,1,2]', output: '3' }] },

  // ── dynamic-programming ──────────────────────────────────────
  { id: 'climbing-stairs', title: 'Climbing Stairs', source: 'LeetCode', url: lc('climbing-stairs'), difficulty: 'easy',
    categoryId: 'dynamic-programming', algorithmId: 'staircase',
    prompt: 'Count distinct ways to climb n stairs taking 1 or 2 steps.',
    examples: [{ input: 'n=3', output: '3', note: '1+1+1, 1+2, 2+1' }] },
  { id: 'coin-change', title: 'Coin Change', source: 'NeetCode', url: lc('coin-change'), difficulty: 'medium',
    categoryId: 'dynamic-programming', algorithmId: 'coinChangeDP',
    prompt: 'Fewest coins to make an amount, or -1.',
    examples: [{ input: 'coins=[1,2,5], amount=11', output: '3', note: '5+5+1' }] },
  { id: 'longest-common-subsequence', title: 'Longest Common Subsequence', source: 'LeetCode', url: lc('longest-common-subsequence'), difficulty: 'medium',
    categoryId: 'dynamic-programming', algorithmId: 'lcs',
    prompt: 'Length of the longest common subsequence of two strings.',
    examples: [{ input: 'text1="abcde", text2="ace"', output: '3', note: '"ace"' }] },
  { id: 'longest-increasing-subsequence', title: 'Longest Increasing Subsequence', source: 'LeetCode', url: lc('longest-increasing-subsequence'), difficulty: 'medium',
    categoryId: 'dynamic-programming', algorithmId: 'lis',
    prompt: 'Length of the longest strictly increasing subsequence.',
    examples: [{ input: 'nums=[10,9,2,5,3,7,101,18]', output: '4', note: '[2,3,7,101]' }] },
  { id: 'edit-distance', title: 'Edit Distance', source: 'LeetCode', url: lc('edit-distance'), difficulty: 'medium',
    categoryId: 'dynamic-programming', algorithmId: 'editDistance',
    prompt: 'Minimum insert/delete/replace ops to convert word1 to word2.',
    examples: [{ input: 'word1="horse", word2="ros"', output: '3' }] },
  { id: 'word-break', title: 'Word Break', source: 'LeetCode', url: lc('word-break'), difficulty: 'medium',
    categoryId: 'dynamic-programming', algorithmId: 'wordBreak',
    prompt: 'Can the string be segmented into dictionary words?',
    examples: [{ input: 's="leetcode", dict=["leet","code"]', output: 'true' }] },
  { id: 'partition-equal-subset-sum', title: 'Partition Equal Subset Sum', source: 'LeetCode', url: lc('partition-equal-subset-sum'), difficulty: 'medium',
    categoryId: 'dynamic-programming', algorithmId: 'subsetSum',
    prompt: 'Can the array be split into two equal-sum subsets?',
    examples: [{ input: 'nums=[1,5,11,5]', output: 'true', note: '[1,5,5] & [11]' }] },

  // ── backtracking ─────────────────────────────────────────────
  { id: 'n-queens', title: 'N-Queens', source: 'LeetCode', url: lc('n-queens'), difficulty: 'hard',
    categoryId: 'backtracking', algorithmId: 'nQueens',
    prompt: 'Place n queens so none attack each other; return all boards.',
    examples: [{ input: 'n=4', output: '2 distinct solutions' }] },
  { id: 'permutations', title: 'Permutations', source: 'LeetCode', url: lc('permutations'), difficulty: 'medium',
    categoryId: 'backtracking', algorithmId: 'permutations',
    prompt: 'Return all permutations of distinct integers.',
    examples: [{ input: 'nums=[1,2,3]', output: '6 permutations' }] },
  { id: 'combinations', title: 'Combinations', source: 'LeetCode', url: lc('combinations'), difficulty: 'medium',
    categoryId: 'backtracking', algorithmId: 'combinations',
    prompt: 'Return all k-length combinations from 1..n.',
    examples: [{ input: 'n=4, k=2', output: '[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]' }] },
  { id: 'word-search', title: 'Word Search', source: 'LeetCode', url: lc('word-search'), difficulty: 'medium',
    categoryId: 'backtracking', algorithmId: 'wordSearch',
    prompt: 'Does the word exist as a path of adjacent cells in the grid?',
    examples: [{ input: 'board grid, word="ABCCED"', output: 'true' }] },
  { id: 'subsets', title: 'Subsets', source: 'NeetCode', url: lc('subsets'), difficulty: 'medium',
    categoryId: 'backtracking',
    prompt: 'Return the power set of distinct integers.',
    examples: [{ input: 'nums=[1,2,3]', output: '8 subsets' }] },

  // ── advanced ─────────────────────────────────────────────────
  { id: 'str-str-kmp', title: 'Find the Index of the First Occurrence in a String', source: 'LeetCode', url: lc('find-the-index-of-the-first-occurrence-in-a-string'), difficulty: 'easy',
    categoryId: 'advanced', algorithmId: 'kmp',
    prompt: 'Return the first index of needle in haystack (KMP).',
    examples: [{ input: 'haystack="sadbutsad", needle="sad"', output: '0' }, { input: 'haystack="leetcode", needle="leeto"', output: '-1' }] },
  { id: 'shortest-palindrome-z', title: 'Shortest Palindrome', source: 'LeetCode', url: lc('shortest-palindrome'), difficulty: 'hard',
    categoryId: 'advanced', algorithmId: 'zAlgorithm',
    prompt: 'Prepend the fewest characters to make the string a palindrome (KMP/Z-function).',
    examples: [{ input: 's="aacecaaa"', output: '"aaacecaaa"' }] },
  { id: 'erect-the-fence', title: 'Erect the Fence', source: 'LeetCode', url: lc('erect-the-fence'), difficulty: 'hard',
    categoryId: 'advanced', algorithmId: 'convexHull',
    prompt: 'Return the points on the convex hull enclosing all trees.',
    examples: [{ input: 'points=[[1,1],[2,2],[2,0],[2,4],[3,3],[4,2]]', output: '[[1,1],[2,0],[4,2],[3,3],[2,4]]' }] },
]
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/test-practice-data.mjs`
Expected: `OK test-practice-data (67 problems)` (count is informational — it changes as you append more).

- [ ] **Step 5: Commit**

```bash
git add src/data/practiceProblems.js scripts/test-practice-data.mjs
git commit -m "feat(practice): curated LeetCode/NeetCode/HackerRank dataset + validator"
```

---

### Task 3: OneCompiler IDE component

**Files:**
- Create: `src/components/practice/OneCompilerIDE.jsx`

**Interfaces:**
- Consumes: `useTheme()` from `../../context/ThemeContext` (provides `{ isDark }`).
- Produces: default export `OneCompilerIDE({ initialLanguage = 'java' })` — self-manages the selected language.

- [ ] **Step 1: Write the component** — `src/components/practice/OneCompilerIDE.jsx`

```jsx
import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'

/* Embedded, runnable IDE via OneCompiler. No backend: OneCompiler executes the
   code. Switching language remounts the iframe (key) so the editor reloads for
   the new runtime. There is no auto-judging — users self-check against the
   example cases shown in the problem panel. */
const LANGS = [
  { id: 'java', label: 'Java' },
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'python', label: 'Python' },
]

export default function OneCompilerIDE({ initialLanguage = 'java' }) {
  const { isDark } = useTheme()
  const start = LANGS.some(l => l.id === initialLanguage) ? initialLanguage : 'java'
  const [lang, setLang] = useState(start)
  const theme = isDark ? 'dark' : 'light'
  const src =
    `https://onecompiler.com/embed/${lang}` +
    `?theme=${theme}&hideNew=true&hideNewFileOption=true&hideTitle=true` +
    `&listenToEvents=true&availableLanguages=java,c,cpp,python`

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '100%',
      border: '1px solid var(--page-border)', borderRadius: 14, overflow: 'hidden',
      background: 'var(--page-surface)',
    }}>
      <div style={{ display: 'flex', gap: 6, padding: '8px 10px', borderBottom: '1px solid var(--page-border)', flexWrap: 'wrap' }}>
        {LANGS.map(l => {
          const active = lang === l.id
          return (
            <button key={l.id} type="button" onClick={() => setLang(l.id)} style={{
              padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              background: active ? 'rgba(245,129,31,0.18)' : 'transparent',
              border: `1px solid ${active ? 'rgba(245,129,31,0.45)' : 'var(--page-border)'}`,
              color: active ? '#fdba74' : 'var(--chrome-text-muted)',
            }}>{l.label}</button>
          )
        })}
      </div>
      <iframe
        key={`${lang}-${theme}`}
        src={src}
        title="AlgoFlow code editor"
        loading="lazy"
        style={{ width: '100%', flex: 1, minHeight: 480, border: 'none', background: '#0d0d0d' }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify it builds & lints**

Run: `npm run build` → Expected: build succeeds, no errors.
Run: `npm run lint` → Expected: no **new** errors referencing `OneCompilerIDE.jsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/practice/OneCompilerIDE.jsx
git commit -m "feat(practice): OneCompiler embedded IDE component"
```

---

### Task 4: Problem list + filters + active-problem panel

**Files:**
- Create: `src/components/practice/PracticeProblemList.jsx`

**Interfaces:**
- Consumes: `filterProblems` (Task 1), `practiceProblems` (Task 2), `categories.json`, `algorithmRegistry.json`, lucide `ExternalLink`.
- Produces: default export `PracticeProblemList({ topic, algo, onTopicChange, onAlgoChange, activeId, onSelectProblem })`.
  - `onTopicChange(topicId)` — parent resets `algo` to `'all'` when topic changes.
  - `onSelectProblem(problem)` — parent stores it as the active/pinned problem.

- [ ] **Step 1: Write the component** — `src/components/practice/PracticeProblemList.jsx`

```jsx
import { useMemo } from 'react'
import { ExternalLink } from 'lucide-react'
import categories from '../../data/categories.json'
import registry from '../../data/algorithmRegistry.json'
import { practiceProblems } from '../../data/practiceProblems'
import { filterProblems } from '../../utils/practiceFilter'

const DIFF = {
  easy:   { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  medium: { bg: '#fef9c3', color: '#a16207', border: '#fde047' },
  hard:   { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
}
const SELECT_STYLE = {
  background: 'var(--page-surface)', border: '1px solid var(--page-border)',
  borderRadius: 10, padding: '0.55rem 0.8rem', color: 'var(--chrome-text)',
  fontSize: '0.85rem', cursor: 'pointer', outline: 'none', fontFamily: 'inherit', flex: 1, minWidth: 0,
}
const MONO = "'IBM Plex Mono', monospace"

export default function PracticeProblemList({ topic, algo, onTopicChange, onAlgoChange, activeId, onSelectProblem }) {
  const algoOptions = useMemo(
    () => topic === 'all' ? [] : (registry[topic] || []).map(a => ({ id: a.id, name: a.name })),
    [topic],
  )
  const problems = useMemo(() => filterProblems(practiceProblems, topic, algo), [topic, algo])
  const active = useMemo(() => problems.find(p => p.id === activeId) || null, [problems, activeId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10 }}>
        <select value={topic} onChange={e => onTopicChange(e.target.value)} style={SELECT_STYLE} aria-label="Topic">
          <option value="all">All Topics</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={algo} onChange={e => onAlgoChange(e.target.value)} disabled={topic === 'all'}
          style={{ ...SELECT_STYLE, opacity: topic === 'all' ? 0.5 : 1 }} aria-label="Algorithm">
          <option value="all">All Algorithms</option>
          {algoOptions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      {/* Problem list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
        {problems.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
            No curated problems here yet — try the topic level or browse all.
          </div>
        ) : problems.map(p => {
          const dc = DIFF[p.difficulty] || DIFF.medium
          const isActive = p.id === activeId
          return (
            <div key={p.id} onClick={() => onSelectProblem(p)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '0.7rem 0.9rem',
              background: isActive ? 'var(--page-surface-2)' : 'var(--page-surface)',
              border: `1px solid ${isActive ? 'rgba(245,129,31,0.4)' : 'var(--page-border)'}`,
              borderRadius: 12, cursor: 'pointer',
            }}>
              <span style={{
                background: dc.bg, color: dc.color, border: `1px solid ${dc.border}`,
                borderRadius: 20, padding: '2px 10px', fontSize: '0.68rem', fontWeight: 700,
                textTransform: 'capitalize', flexShrink: 0,
              }}>{p.difficulty}</span>
              <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600, color: 'var(--chrome-text)' }}>{p.title}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--chrome-text-muted)', flexShrink: 0 }}>{p.source}</span>
              <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                title={`Open on ${p.source}`} style={{ color: '#fdba74', display: 'inline-flex', flexShrink: 0 }}>
                <ExternalLink size={14} />
              </a>
            </div>
          )
        })}
      </div>

      {/* Active problem: prompt + example cases (self-check target) */}
      {active && (
        <div style={{ padding: '1rem 1.1rem', borderRadius: 14, background: 'var(--page-surface)', border: '1px solid rgba(245,129,31,0.28)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', color: '#f5811f' }}>NOW SOLVING</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--chrome-text)' }}>{active.title}</span>
            <a href={active.url} target="_blank" rel="noopener noreferrer"
              style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#fdba74', textDecoration: 'none' }}>
              Open on {active.source} <ExternalLink size={12} />
            </a>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--chrome-text-muted)', lineHeight: 1.55, margin: '0 0 10px' }}>{active.prompt}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {active.examples.map((ex, i) => (
              <div key={i} style={{
                fontFamily: MONO, fontSize: '0.78rem', color: 'var(--chrome-text)',
                background: 'var(--page-surface-2)', border: '1px solid var(--page-border)', borderRadius: 8, padding: '6px 10px',
              }}>
                <span style={{ color: '#64748b' }}>in:</span> {ex.input}{'   '}<span style={{ color: '#64748b' }}>→</span> {ex.output}
                {ex.note && <div style={{ color: '#64748b', marginTop: 2 }}>{ex.note}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify it builds & lints**

Run: `npm run build` → Expected: succeeds.
Run: `npm run lint` → Expected: no new errors for `PracticeProblemList.jsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/practice/PracticeProblemList.jsx
git commit -m "feat(practice): problem list, filters, and example-cases panel"
```

---

### Task 5: `/practice` page + route + telemetry

**Files:**
- Create: `src/pages/Practice.jsx`
- Modify: `src/App.jsx` (add lazy import + route)
- Modify: `src/firebase/stats.js` (add `recordPracticeView`)

**Interfaces:**
- Consumes: `PracticeProblemList` (Task 4), `OneCompilerIDE` (Task 3), `recordPracticeView` (this task), `Seo`, `useSearchParams`.
- Produces: default export `Practice` (route component); `recordPracticeView()` in stats.

- [ ] **Step 1: Add the telemetry helper** — in `src/firebase/stats.js`, after `recordInterviewView` (around line 64), add:

```js
export function recordPracticeView() {
  bump({ practiceViews: increment(1) })
}
```

- [ ] **Step 2: Write the page** — `src/pages/Practice.jsx`

```jsx
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import Seo from '../components/Seo'
import PracticeProblemList from '../components/practice/PracticeProblemList'
import OneCompilerIDE from '../components/practice/OneCompilerIDE'
import { recordPracticeView } from '../firebase/stats'

/* Practice hub: filter curated LeetCode/NeetCode/HackerRank problems by topic +
   algorithm (prefilled from ?topic=&algo=), read the example cases, and solve
   in the embedded IDE. See the Phase 3 design spec. */
export default function Practice() {
  const [params, setParams] = useSearchParams()
  const [topic, setTopic]   = useState(params.get('topic') || 'all')
  const [algo, setAlgo]     = useState(params.get('algo') || 'all')
  const [active, setActive] = useState(null)
  const [isWide, setIsWide] = useState(true)

  useEffect(() => { recordPracticeView() }, [])

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 900)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  /* Keep the URL shareable/in-sync with the filters */
  useEffect(() => {
    const next = {}
    if (topic !== 'all') next.topic = topic
    if (algo !== 'all') next.algo = algo
    setParams(next, { replace: true })
  }, [topic, algo, setParams])

  const handleTopicChange = (t) => { setTopic(t); setAlgo('all') }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>
      <Seo
        title="Practice"
        description="Practice coding-interview problems from LeetCode, HackerRank and NeetCode with an embedded Java/C/C++/Python IDE, filtered by topic and algorithm."
      />
      <div className="max-w-[1400px] mx-auto px-5 py-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 18, color: 'var(--chrome-text-muted)' }}>
          <Link to="/" style={{ color: 'var(--chrome-text-muted)', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <span style={{ fontWeight: 600, color: 'var(--chrome-text)' }}>Practice</span>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--chrome-text)', marginBottom: 6 }}>💻 Practice Problems</h1>
        <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6, maxWidth: 660, marginBottom: 22 }}>
          Curated problems from LeetCode, HackerRank and NeetCode. Pick a topic and algorithm, read the
          examples, and solve them in the embedded IDE — Java, C, C++ or Python. Full statement and official
          submission are on the source site.
        </p>

        <div style={{ display: 'flex', flexDirection: isWide ? 'row' : 'column', gap: 16, alignItems: 'stretch' }}>
          <div style={{ width: isWide ? '42%' : '100%', flexShrink: 0 }}>
            <PracticeProblemList
              topic={topic}
              algo={algo}
              onTopicChange={handleTopicChange}
              onAlgoChange={setAlgo}
              activeId={active?.id}
              onSelectProblem={setActive}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0, minHeight: isWide ? 560 : 420, display: 'flex' }}>
            <OneCompilerIDE />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Register the route in `src/App.jsx`**

Add the lazy import beside the other page imports (after the `TestYourself` line, ~line 17):

```jsx
const Practice       = lazy(() => import('./pages/Practice'))
```

Add the route inside `<Routes>` (after the `/play` route, ~line 92):

```jsx
<Route path="/practice" element={<Practice />} />
```

- [ ] **Step 4: Verify build + smoke test the route**

Run: `npm run build` → Expected: succeeds; the build output lists a separate `Practice-*.js` chunk (code-split).
Run: `npm run dev`, open `http://localhost:5173/practice` → dropdowns render, selecting a topic filters the list and populates the algorithm dropdown, clicking a card pins it with its example cases, and the OneCompiler IDE loads and runs code. Then open `http://localhost:5173/practice?topic=sorting&algo=quickSort` → both dropdowns are prefilled and the list is filtered.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Practice.jsx src/App.jsx src/firebase/stats.js
git commit -m "feat(practice): /practice page, route, and practiceViews telemetry"
```

---

### Task 6: Header **Practice** nav button

**Files:**
- Modify: `src/components/Layout/Header.jsx`

**Interfaces:**
- Consumes: existing `navBtn`, `algoMatch`/`algoCategory`/`algoId`, `useNavigate`.
- Produces: a `Practice` button in both the homepage and non-homepage nav clusters that deep-links `?topic=&algo=` from an algorithm page.

- [ ] **Step 1: Add the icon import** — change line 2:

```jsx
import { Zap, MessageSquare, Sun, Moon, Gamepad2, Code2 } from 'lucide-react'
```

- [ ] **Step 2: Add the handler + button factory** — after `const handlePlay = () => navigate('/play')` (~line 139), add:

```jsx
  const handlePractice = () => {
    if (algoMatch) navigate(`/practice?topic=${algoCategory}&algo=${algoId}`)
    else navigate('/practice')
  }
```

Then, after the `playBtn` factory (~line 155), add:

```jsx
  const practiceBtn = (big) => (
    <button type="button" className="nav-btn" onClick={handlePractice} style={navBtn(big)}>
      <Code2 size={big ? 13 : 12} /> Practice
    </button>
  )
```

- [ ] **Step 3: Render it in both nav clusters**

In the homepage header cluster, before `{playBtn(false)}` (~line 168):

```jsx
            {practiceBtn(false)}
```

In the non-homepage header cluster, before `{playBtn(true)}` (~line 191):

```jsx
          {practiceBtn(true)}
```

- [ ] **Step 4: Verify build + lint**

Run: `npm run build` → succeeds.
Run: `npm run lint` → no new errors in `Header.jsx`.
Manual: on any algorithm page the header **Practice** button navigates to `/practice?topic=<cat>&algo=<algo>`; elsewhere to `/practice`.

- [ ] **Step 5: Commit**

```bash
git add src/components/Layout/Header.jsx
git commit -m "feat(practice): Practice nav button with algorithm-aware deep link"
```

---

### Task 7: Category + Algorithm page deep-link buttons

**Files:**
- Modify: `src/pages/Category.jsx`
- Modify: `src/pages/Algorithm.jsx`

**Interfaces:**
- Consumes: existing `Link` (already imported in both), `categoryId`/`algorithmId` params.
- Produces: a "Practice" link on each page targeting `/practice` with the topic (and algorithm) prefilled.

- [ ] **Step 1: Category page** — in `src/pages/Category.jsx`, the breadcrumb row (~lines 97-106) currently ends with the category name span. Add a right-aligned practice link inside that breadcrumb `div`, immediately before its closing `</div>`:

```jsx
            <Link
              to={`/practice?topic=${categoryId}`}
              style={{
                marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: '0.72rem', fontWeight: 600, textDecoration: 'none',
                color: contrast.heading,
                background: contrast.statBg, border: `1px solid ${contrast.statBorder}`,
                borderRadius: 20, padding: '0.25rem 0.7rem',
              }}
            >
              Practice {category.name} ↗
            </Link>
```

(`contrast.heading`, `contrast.statBg`, `contrast.statBorder` are already computed in this component and used by `StatBadge`.)

- [ ] **Step 2: Algorithm page** — in `src/pages/Algorithm.jsx`, page-title row. Two edits:

(a) Change the Share button's `marginLeft: 'auto'` (~line 535) to `marginLeft: 8` so the Practice link can take the `auto` slot:

```jsx
                  marginLeft: 8, display:'flex', alignItems:'center', gap:6,
```

(b) Insert the Practice link immediately before the Share `<button>` (before `<button type="button" onClick={handleShare} ...>`, ~line 529):

```jsx
              <Link
                to={`/practice?topic=${categoryId}&algo=${algorithmId}`}
                style={{
                  marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  color: isLight ? '#b45309' : '#fdba74',
                  background: 'rgba(245,129,31,0.14)', border: '1px solid rgba(245,129,31,0.35)',
                  textDecoration: 'none',
                }}
              >
                <Code2 size={14} /> Practice
              </Link>
```

(c) Add `Code2` to the lucide import at the top of `Algorithm.jsx` (~line 3):

```jsx
import { ChevronRight, Target, BarChart2, Globe, CheckCircle, Share2, Check, Code2 } from 'lucide-react'
```

- [ ] **Step 3: Verify build + lint + manual**

Run: `npm run build` → succeeds.
Run: `npm run lint` → no new errors.
Manual: Category page header shows "Practice {name} ↗" → `/practice?topic=<cat>`; Algorithm page title row shows a "Practice" button → `/practice?topic=<cat>&algo=<algo>`, both prefilling the dropdowns.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Category.jsx src/pages/Algorithm.jsx
git commit -m "feat(practice): deep-link buttons on Category and Algorithm pages"
```

---

### Task 8: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run all node test scripts**

Run:
```bash
node scripts/test-practice-filter.mjs && node scripts/test-practice-data.mjs
```
Expected: `OK test-practice-filter` then `OK test-practice-data (…)`.

- [ ] **Step 2: Build + lint**

Run: `npm run build` → succeeds, no chunk-size regression errors; `Practice-*.js` chunk present.
Run: `npm run lint` → total problems ≈ baseline (no new errors from Phase 3 files).

- [ ] **Step 3: Manual smoke checklist** (`npm run dev`)

- `/practice` — dropdowns, filtering, card→pin, example cases, IDE runs code in all four languages.
- `/practice?topic=graphs&algo=bfs` — prefilled; list filtered to graph/bfs (+ graph category-level).
- Header **Practice** button on home, a category page, and an algorithm page (deep-links correctly).
- "Practice {name}" on a Category page; "Practice" on an Algorithm page.
- Empty state: pick a topic with only category-level entries and an algorithm with no direct problems → still shows the fallback set (never blank for a valid topic).
- Toggle light/dark → IDE reloads with matching theme; page chrome respects theme.

- [ ] **Step 4: Final commit (if any manual fixups were needed)**

```bash
git add -A
git commit -m "chore(practice): Phase 3 verification fixups"
```

---

## Self-Review

**1. Spec coverage**

| Spec section | Task |
| --- | --- |
| §3 entry points (header/home via header, category, algorithm) | Tasks 6, 7 |
| §4 `/practice` page, URL prefill, split layout, Seo | Task 5 |
| §5 components (`Practice`, `PracticeProblemList`, `OneCompilerIDE`, `practiceFilter`) | Tasks 1, 3, 4, 5 |
| §6 dataset shape + filter semantics + fallback + all-14-covered | Tasks 1, 2 |
| §7 OneCompiler integration (embed URL, 4 langs, theme, remount) | Task 3 |
| §8 edge cases (empty state, invalid params → `all`, theme) | Tasks 4, 5 |
| §9 testing (filter unit test, dataset validator, build/lint) | Tasks 1, 2, 8 |
| §11 telemetry `recordPracticeView` | Task 5 |
| §10 out-of-scope (no judging/backend) | Respected — no such code planned |

Deviation from spec §3: the "Home hero CTA" is intentionally replaced by the **header nav button** (which renders on the homepage), matching the existing `Test Yourself`/`Interview` pattern — noted in Global Constraints.

**2. Placeholder scan:** No TBD/TODO; every code step contains complete code; the dataset is a real, validator-passing seed (extendable). The only deferred detail — OneCompiler `postMessage` starter-code preload — is explicitly out of this plan (the plain embed is fully functional); it can be a later enhancement.

**3. Type consistency:** `filterProblems(problems, topic, algo)` signature identical in Task 1 (impl), Task 4 (consumer), Task 5 (indirect). Problem shape (`id,title,source,url,difficulty,categoryId,algorithmId?,prompt,examples[{input,output,note?}]`) identical across Task 2 (data), Task 2 (validator), Task 4 (rendering). `SOURCES` order `['LeetCode','NeetCode','HackerRank']` identical in dataset + validator. Component prop names (`onTopicChange/onAlgoChange/onSelectProblem/activeId`) identical between `PracticeProblemList` (Task 4) and `Practice` (Task 5). `recordPracticeView` identical in stats (Task 5 def) and page (Task 5 use).
