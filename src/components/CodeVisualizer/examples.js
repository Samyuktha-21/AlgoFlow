/* Starter programs — one per kind of picture the visualizer can draw */
export const EXAMPLES = [
  {
    id: 'factorial',
    label: 'Recursion — Factorial (call stack)',
    code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

result = factorial(5)
print(result)
`,
  },
  {
    id: 'fib',
    label: 'Recursion — Fibonacci (recursion tree)',
    code: `def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(5))
`,
  },
  {
    id: 'bubble',
    label: 'Array — Bubble Sort',
    code: `arr = [5, 2, 9, 1, 6]
n = len(arr)
for i in range(n):
    for j in range(n - i - 1):
        if arr[j] > arr[j + 1]:
            arr[j], arr[j + 1] = arr[j + 1], arr[j]
print(arr)
`,
  },
  {
    id: 'binsearch',
    label: 'Array — Binary Search',
    code: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

nums = [1, 3, 5, 7, 9, 11, 13]
print(binary_search(nums, 11))
`,
  },
  {
    id: 'stack',
    label: 'Stack — Balanced Brackets',
    code: `def is_balanced(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return len(stack) == 0

print(is_balanced("{[()()]}"))
`,
  },
  {
    id: 'bst',
    label: 'Tree — BST Insert + Inorder',
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if root is None:
        return Node(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root

def inorder(node, out):
    if node:
        inorder(node.left, out)
        out.append(node.val)
        inorder(node.right, out)

root = None
for v in [50, 30, 70, 20, 40, 60, 80]:
    root = insert(root, v)

result = []
inorder(root, result)
print(result)
`,
  },
  {
    id: 'linked',
    label: 'Linked List — Reverse',
    code: `class ListNode:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

head = ListNode(1, ListNode(2, ListNode(3, ListNode(4))))

prev = None
curr = head
while curr:
    nxt = curr.next
    curr.next = prev
    prev = curr
    curr = nxt
head = prev
`,
  },
  {
    id: 'bfs',
    label: 'Graph — BFS',
    code: `from collections import deque

graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E'],
}

visited = set()
queue = deque(['A'])
visited.add('A')
order = []
while queue:
    node = queue.popleft()
    order.append(node)
    for nei in graph[node]:
        if nei not in visited:
            visited.add(nei)
            queue.append(nei)
print(order)
`,
  },
  {
    id: 'lcs',
    label: 'DP — Longest Common Subsequence (grid)',
    code: `a = "ABCB"
b = "BDCB"
m, n = len(a), len(b)
dp = [[0] * (n + 1) for _ in range(m + 1)]
for i in range(1, m + 1):
    for j in range(1, n + 1):
        if a[i - 1] == b[j - 1]:
            dp[i][j] = dp[i - 1][j - 1] + 1
        else:
            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
print(dp[m][n])
`,
  },
]
