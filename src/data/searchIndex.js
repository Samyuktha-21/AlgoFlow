/* Auto-built from categories.json + algorithmRegistry.json */
import categories from './categories.json'
import registry from './algorithmRegistry.json'

/* Human-readable algorithm names from algorithmId */
function toName(id) {
  const OVERRIDES = {
    bfs:'BFS (Breadth-First Search)', dfs:'DFS (Depth-First Search)',
    lcs:'LCS (Longest Common Subsequence)', lis:'LIS (Longest Increasing Subsequence)',
    lca:'LCA (Lowest Common Ancestor)', bst:'BST Operations',
    tsp:'Traveling Salesman (DP)', kmp:'KMP String Matching',
    scc:'Strongly Connected Components (Kosaraju)', astar:'A* Algorithm',
    fft:'FFT (Fast Fourier Transform)', gcd:'GCD (Euclidean Algorithm)',
    lru:'LRU Cache', lruCacheHash:'LRU Cache (Hashing)',
    lruCache:'LRU Cache', avlTree:'AVL Tree',
    fibDP:'Fibonacci (DP)', fibDP2:'Fibonacci DP',
    dutchFlag:'Dutch National Flag', prefixSum:'Prefix Sum',
    slidingWindow:'Sliding Window', twoSumArray:'Two Sum (Array)',
    twoSumHash:'Two Sum (HashMap)', hashMapImpl:'Hash Map Implementation',
    groupAnagrams:'Group Anagrams', longestConsecutive:'Longest Consecutive Sequence',
    topKFrequent:'Top K Frequent Elements', subarraySum:'Subarray Sum Equals K',
    detectCycle:'Detect Cycle (Linked List)', mergeSortedLists:'Merge Sorted Lists',
    findMiddle:'Find Middle of Linked List', removeNthNode:'Remove Nth Node From End',
    intersectionPoint:'Intersection Point', flattenLinkedList:'Flatten Linked List',
    stackImpl:'Stack Implementation', queueImpl:'Queue Implementation',
    validParenthesesStack:'Valid Parentheses (Stack)', minStack:'Min Stack',
    circularQueue:'Circular Queue', nextGreaterElement:'Next Greater Element',
    maxHeap:'Max Heap', minHeap:'Min Heap', heapSortHeap:'Heap Sort',
    kLargestElements:'K Largest Elements', medianStream:'Median of Stream',
    mergeKSortedLists:'Merge K Sorted Lists', bellmanFord:'Bellman-Ford Algorithm',
    floydWarshall:'Floyd-Warshall Algorithm', bipartiteCheck:'Bipartite Graph Check',
    cycleDetection:'Cycle Detection', topologicalSort:'Topological Sort',
    unionFind:'Union-Find (DSU)', johnsons:'Johnson\'s Algorithm',
    mstGreedy:'MST (Greedy)', coinChangeGreedy:'Coin Change (Greedy)',
    activitySelection:'Activity Selection', fractionalKnapsack:'Fractional Knapsack',
    jobSequencing:'Job Sequencing', egyptianFraction:'Egyptian Fraction',
    fileMerge:'Optimal File Merge', huffman:'Huffman Coding',
    knapsack01:'0/1 Knapsack', coinChangeDP:'Coin Change (DP)',
    matrixChain:'Matrix Chain Multiplication', editDistance:'Edit Distance',
    rodCutting:'Rod Cutting', subsetSum:'Subset Sum', staircase:'Staircase Problem',
    wordBreak:'Word Break', eggDrop:'Egg Drop Problem',
    nQueens:'N-Queens Problem', sudokuSolver:'Sudoku Solver',
    ratInMaze:'Rat in a Maze', wordSearch:'Word Search',
    rabinKarp:'Rabin-Karp Algorithm', zAlgorithm:'Z Algorithm',
    ahoCorasick:'Aho-Corasick Algorithm', suffixArray:'Suffix Array',
    convexHull:'Convex Hull', redBlackTree:'Red-Black Tree',
    treeTraversal:'Tree Traversals', levelOrder:'Level-Order Traversal',
    treeHeight:'Tree Height / Diameter', mirrorTree:'Mirror Tree',
    pathSum:'Path Sum', serializeDeserialize:'Serialize/Deserialize Tree',
    balancedTree:'Balanced Tree Check', segmentTree:'Segment Tree',
    heapSort:'Heap Sort', bubbleSort:'Bubble Sort', selectionSort:'Selection Sort',
    insertionSort:'Insertion Sort', mergeSort:'Merge Sort', quickSort:'Quick Sort',
    countingSort:'Counting Sort', radixSort:'Radix Sort', shellSort:'Shell Sort',
    bucketSort:'Bucket Sort', linearSearch:'Linear Search', binarySearch:'Binary Search',
    jumpSearch:'Jump Search', interpolationSearch:'Interpolation Search',
    exponentialSearch:'Exponential Search', fibonacci:'Fibonacci Sequence',
    factorial:'Factorial', primeCheck:'Prime Check', palindromeCheck:'Palindrome Check',
    reverseString:'Reverse String', countOccurrences:'Count Occurrences',
    power:'Fast Power (Exponentiation)', fizzBuzz:'FizzBuzz', twoSum:'Two Sum',
    maximumSubarray:'Maximum Subarray (Kadane\'s)', rotateArray:'Rotate Array',
    mergeIntervals:'Merge Intervals', anagramCheck:'Anagram Check',
    longestCommonSubstring:'Longest Common Substring', validParentheses:'Valid Parentheses',
    trie:'Trie', prim:'Prim\'s Algorithm', kruskal:'Kruskal\'s Algorithm',
    dijkstra:'Dijkstra\'s Algorithm', permutations:'Permutations', combinations:'Combinations',
  }
  if (OVERRIDES[id]) return OVERRIDES[id]
  // Convert camelCase to Title Case
  return id.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

export const categoryMeta = {
  fundamentals:           { label: 'Fundamentals',       color: '#fbbf24', icon: '🧭' },
  sorting:                { label: 'Sorting',             color: '#7dd3fc', icon: '❄️' },
  searching:              { label: 'Searching',           color: '#fde68a', icon: '🔦' },
  arrays:                 { label: 'Array & String',      color: '#c084fc', icon: '🧩' },
  'linked-lists':         { label: 'Linked Lists',        color: '#fda4af', icon: '🌸' },
  'stacks-queues':        { label: 'Stack & Queue',       color: '#93c5fd', icon: '☁️' },
  hashing:                { label: 'Hashing',             color: '#4ade80', icon: '🌺' },
  trees:                  { label: 'Trees',               color: '#86efac', icon: '🌳' },
  heaps:                  { label: 'Heaps',               color: '#f97316', icon: '🌋' },
  graphs:                 { label: 'Graphs',              color: '#38bdf8', icon: '✨' },
  greedy:                 { label: 'Greedy',              color: '#4ade80', icon: '🎯' },
  'dynamic-programming':  { label: 'Dynamic Programming', color: '#fbbf24', icon: '🚗' },
  backtracking:           { label: 'Backtracking',        color: '#f9a8d4', icon: '💜' },
  advanced:               { label: 'Advanced',            color: '#a78bfa', icon: '⚡' },
}

/* Build flat search index from registry */
export const searchIndex = categories.flatMap(cat => {
  const algos = registry[cat.id] || []
  return algos.map(algo => ({
    id: algo.id,
    name: toName(algo.id),
    category: cat.id,
    categoryLabel: categoryMeta[cat.id]?.label || cat.name,
    path: `/algorithm/${cat.id}/${algo.id}`,
    tags: [cat.name.toLowerCase(), cat.id],
  }))
})

export default searchIndex
