/* Python solutions for the Interview Hub, keyed by question id.
   Merged into each question's code/solution object by interviewQuestions.js.
   Each entry mirrors the logic of the Java/C++/C reference for that question. */

export const pythonSolutions = {

  // ═══════════ ARRAY ═══════════

  'two-sum': `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        comp = target - x
        if comp in seen:
            return [seen[comp], i]
        seen[x] = i
    return []`,

  'best-time-stock': `def max_profit(prices):
    min_price, best = float('inf'), 0
    for p in prices:
        min_price = min(min_price, p)
        best = max(best, p - min_price)
    return best`,

  'contains-duplicate': `def contains_duplicate(nums):
    seen = set()
    for n in nums:
        if n in seen:
            return True
        seen.add(n)
    return False`,

  'missing-number': `def missing_number(nums):
    xor = len(nums)
    for i, x in enumerate(nums):
        xor ^= i ^ x
    return xor`,

  'move-zeroes': `def move_zeroes(nums):
    slow = 0
    for fast in range(len(nums)):
        if nums[fast] != 0:
            nums[slow], nums[fast] = nums[fast], nums[slow]
            slow += 1
    return nums`,

  'container-most-water': `def max_area(height):
    l, r, best = 0, len(height) - 1, 0
    while l < r:
        best = max(best, min(height[l], height[r]) * (r - l))
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return best`,

  'maximum-subarray': `def max_sub_array(nums):
    cur = best = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best`,

  'trapping-rain-water': `def trap(height):
    l, r = 0, len(height) - 1
    ml = mr = water = 0
    while l < r:
        if height[l] < height[r]:
            ml = max(ml, height[l])
            water += ml - height[l]
            l += 1
        else:
            mr = max(mr, height[r])
            water += mr - height[r]
            r -= 1
    return water`,

  'three-sum': `def three_sum(nums):
    nums.sort()
    res = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        lo, hi = i + 1, len(nums) - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if s == 0:
                res.append([nums[i], nums[lo], nums[hi]])
                while lo < hi and nums[lo] == nums[lo + 1]:
                    lo += 1
                while lo < hi and nums[hi] == nums[hi - 1]:
                    hi -= 1
                lo += 1
                hi -= 1
            elif s < 0:
                lo += 1
            else:
                hi -= 1
    return res`,

  'rotate-array': `def rotate(nums, k):
    n = len(nums)
    k %= n

    def reverse(i, j):
        while i < j:
            nums[i], nums[j] = nums[j], nums[i]
            i += 1
            j -= 1

    reverse(0, n - 1)
    reverse(0, k - 1)
    reverse(k, n - 1)
    return nums`,

  'find-duplicate-number': `def find_duplicate(nums):
    slow = fast = nums[0]
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    slow = nums[0]
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]
    return slow`,

  'sliding-window-maximum': `from collections import deque

def max_sliding_window(nums, k):
    dq, res = deque(), []
    for i, x in enumerate(nums):
        if dq and dq[0] <= i - k:
            dq.popleft()
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            res.append(nums[dq[0]])
    return res`,

  // ═══════════ STRING ═══════════

  'longest-substring-no-repeat': `def length_of_longest_substring(s):
    last = {}
    best = left = 0
    for r, c in enumerate(s):
        if c in last:
            left = max(left, last[c] + 1)
        last[c] = r
        best = max(best, r - left + 1)
    return best`,

  'valid-anagram': `def is_anagram(s, t):
    if len(s) != len(t):
        return False
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    for c in t:
        if count.get(c, 0) == 0:
            return False
        count[c] -= 1
    return True`,

  'group-anagrams': `def group_anagrams(strs):
    groups = {}
    for s in strs:
        key = ''.join(sorted(s))
        groups.setdefault(key, []).append(s)
    return list(groups.values())`,

  // ═══════════ SORTING ═══════════

  'sort-colors': `def sort_colors(nums):
    lo, mid, hi = 0, 0, len(nums) - 1
    while mid <= hi:
        if nums[mid] == 0:
            nums[lo], nums[mid] = nums[mid], nums[lo]
            lo += 1
            mid += 1
        elif nums[mid] == 2:
            nums[hi], nums[mid] = nums[mid], nums[hi]
            hi -= 1
        else:
            mid += 1
    return nums`,

  'merge-intervals': `def merge(intervals):
    intervals.sort(key=lambda iv: iv[0])
    res = []
    for cur in intervals:
        if res and cur[0] <= res[-1][1]:
            res[-1][1] = max(res[-1][1], cur[1])
        else:
            res.append(cur[:])
    return res`,

  'meeting-rooms-ii': `def min_meeting_rooms(intervals):
    starts = sorted(iv[0] for iv in intervals)
    ends = sorted(iv[1] for iv in intervals)
    rooms = best = e = 0
    for s in starts:
        while e < len(ends) and ends[e] <= s:
            rooms -= 1
            e += 1
        rooms += 1
        best = max(best, rooms)
    return best`,

  'kth-largest-sort': `def find_kth_largest(nums, k):
    target = len(nums) - k

    def partition(lo, hi):
        pivot, i = nums[hi], lo
        for j in range(lo, hi):
            if nums[j] < pivot:
                nums[i], nums[j] = nums[j], nums[i]
                i += 1
        nums[i], nums[hi] = nums[hi], nums[i]
        return i

    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        p = partition(lo, hi)
        if p == target:
            return nums[p]
        if p < target:
            lo = p + 1
        else:
            hi = p - 1
    return -1`,

  'sort-by-parity': `def sort_array_by_parity(nums):
    i, j = 0, len(nums) - 1
    while i < j:
        if nums[i] % 2 == 0:
            i += 1
        elif nums[j] % 2 == 1:
            j -= 1
        else:
            nums[i], nums[j] = nums[j], nums[i]
            i += 1
            j -= 1
    return nums`,

  'wiggle-sort': `def wiggle_sort(nums):
    for i in range(len(nums) - 1):
        if (i % 2 == 0 and nums[i] > nums[i + 1]) or (i % 2 == 1 and nums[i] < nums[i + 1]):
            nums[i], nums[i + 1] = nums[i + 1], nums[i]
    return nums`,

  'count-inversions': `def count_inversions(a):
    def sort(lo, hi):
        if lo >= hi:
            return 0
        mid = (lo + hi) // 2
        cnt = sort(lo, mid) + sort(mid + 1, hi)
        merged, i, j = [], lo, mid + 1
        while i <= mid and j <= hi:
            if a[i] <= a[j]:
                merged.append(a[i])
                i += 1
            else:
                merged.append(a[j])
                j += 1
                cnt += mid - i + 1
        merged.extend(a[i:mid + 1])
        merged.extend(a[j:hi + 1])
        a[lo:hi + 1] = merged
        return cnt

    return sort(0, len(a) - 1)`,

  'pancake-sorting': `def pancake_sort(a):
    res = []

    def flip(k):
        i, j = 0, k
        while i < j:
            a[i], a[j] = a[j], a[i]
            i += 1
            j -= 1

    for size in range(len(a), 1, -1):
        mi = max(range(size), key=lambda i: a[i])
        if mi == size - 1:
            continue
        flip(mi)
        res.append(mi + 1)
        flip(size - 1)
        res.append(size)
    return res`,

  // ═══════════ SEARCHING ═══════════

  'binary-search': `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,

  'search-rotated-array': `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,

  'find-min-rotated': `def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]`,

  'search-2d-matrix': `def search_matrix(matrix, target):
    m, n = len(matrix), len(matrix[0])
    lo, hi = 0, m * n - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        v = matrix[mid // n][mid % n]
        if v == target:
            return True
        if v < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False`,

  'peak-element': `def find_peak_element(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < nums[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo`,

  'first-last-position': `def search_range(nums, target):
    def bound(first):
        lo, hi, res = 0, len(nums) - 1, -1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                res = mid
                if first:
                    hi = mid - 1
                else:
                    lo = mid + 1
            elif nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return res

    return [bound(True), bound(False)]`,

  // ═══════════ LINKED LIST ═══════════

  'reverse-linked-list': `def reverse_list(head):
    prev = None
    while head:
        nxt = head.next
        head.next = prev
        prev = head
        head = nxt
    return prev`,

  'detect-cycle': `def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`,

  'merge-two-sorted-lists': `def merge_two_lists(a, b):
    dummy = ListNode(0)
    cur = dummy
    while a and b:
        if a.val <= b.val:
            cur.next = a
            a = a.next
        else:
            cur.next = b
            b = b.next
        cur = cur.next
    cur.next = a or b
    return dummy.next`,

  'reorder-list': `def reorder_list(head):
    if not head or not head.next:
        return
    slow = fast = head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next
    prev, cur = None, slow.next
    slow.next = None
    while cur:
        nxt = cur.next
        cur.next = prev
        prev = cur
        cur = nxt
    first, second = head, prev
    while second:
        n1, n2 = first.next, second.next
        first.next = second
        second.next = n1
        first, second = n1, n2`,

  'remove-nth-node': `def remove_nth_from_end(head, n):
    dummy = ListNode(0)
    dummy.next = head
    fast = slow = dummy
    for _ in range(n):
        fast = fast.next
    while fast.next:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next`,

  'copy-random-pointer': `def copy_random_list(head):
    if not head:
        return None
    mapping = {}
    cur = head
    while cur:
        mapping[cur] = Node(cur.val)
        cur = cur.next
    cur = head
    while cur:
        mapping[cur].next = mapping.get(cur.next)
        mapping[cur].random = mapping.get(cur.random)
        cur = cur.next
    return mapping[head]`,

  'flatten-multilevel-list': `def flatten(head):
    cur = head
    while cur:
        if cur.child:
            nxt, child = cur.next, cur.child
            cur.child = None
            cur.next = child
            child.prev = cur
            tail = child
            while tail.next:
                tail = tail.next
            tail.next = nxt
            if nxt:
                nxt.prev = tail
        cur = cur.next
    return head`,

  'merge-k-sorted-lists': `import heapq

def merge_k_lists(lists):
    heap = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))
    dummy = ListNode(0)
    cur = dummy
    while heap:
        _, i, node = heapq.heappop(heap)
        cur.next = node
        cur = cur.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next`,

  // ═══════════ STACK ═══════════

  'valid-parentheses': `def is_valid(s):
    pairs = {')': '(', '}': '{', ']': '['}
    stack = []
    for c in s:
        if c in '([{':
            stack.append(c)
        elif not stack or stack.pop() != pairs[c]:
            return False
    return not stack`,

  'min-stack': `class MinStack:
    def __init__(self):
        self.stack = []
        self.mins = []

    def push(self, x):
        self.stack.append(x)
        self.mins.append(x if not self.mins else min(x, self.mins[-1]))

    def pop(self):
        self.stack.pop()
        self.mins.pop()

    def top(self):
        return self.stack[-1]

    def get_min(self):
        return self.mins[-1]`,

  'daily-temperatures': `def daily_temperatures(t):
    res = [0] * len(t)
    stack = []
    for i, temp in enumerate(t):
        while stack and temp > t[stack[-1]]:
            j = stack.pop()
            res[j] = i - j
        stack.append(i)
    return res`,

  'next-greater-element': `def next_greater(nums):
    res = [-1] * len(nums)
    stack = []
    for i in range(len(nums) - 1, -1, -1):
        while stack and stack[-1] <= nums[i]:
            stack.pop()
        res[i] = stack[-1] if stack else -1
        stack.append(nums[i])
    return res`,

  'evaluate-rpn': `def eval_rpn(tokens):
    stack = []
    for t in tokens:
        if t in ('+', '-', '*', '/'):
            b, a = stack.pop(), stack.pop()
            if t == '+':
                stack.append(a + b)
            elif t == '-':
                stack.append(a - b)
            elif t == '*':
                stack.append(a * b)
            else:
                stack.append(int(a / b))
        else:
            stack.append(int(t))
    return stack.pop()`,

  'queue-using-stacks': `class MyQueue:
    def __init__(self):
        self.in_stack = []
        self.out_stack = []

    def push(self, x):
        self.in_stack.append(x)

    def _shift(self):
        if not self.out_stack:
            while self.in_stack:
                self.out_stack.append(self.in_stack.pop())

    def pop(self):
        self._shift()
        return self.out_stack.pop()

    def peek(self):
        self._shift()
        return self.out_stack[-1]

    def empty(self):
        return not self.in_stack and not self.out_stack`,

  // ═══════════ TREE ═══════════

  'max-depth-tree': `def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,

  'validate-bst': `def is_valid_bst(root):
    def valid(node, lo, hi):
        if not node:
            return True
        if node.val <= lo or node.val >= hi:
            return False
        return valid(node.left, lo, node.val) and valid(node.right, node.val, hi)

    return valid(root, float('-inf'), float('inf'))`,

  'level-order-traversal': `from collections import deque

def level_order(root):
    res = []
    if not root:
        return res
    q = deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        res.append(level)
    return res`,

  'lca-binary-tree': `def lowest_common_ancestor(root, p, q):
    if not root or root is p or root is q:
        return root
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left and right:
        return root
    return left or right`,

  'binary-tree-max-path-sum': `def max_path_sum(root):
    best = float('-inf')

    def gain(node):
        nonlocal best
        if not node:
            return 0
        left = max(gain(node.left), 0)
        right = max(gain(node.right), 0)
        best = max(best, node.val + left + right)
        return node.val + max(left, right)

    gain(root)
    return best`,

  'serialize-deserialize-tree': `class Codec:
    def serialize(self, root):
        parts = []

        def dfs(node):
            if not node:
                parts.append('#')
                return
            parts.append(str(node.val))
            dfs(node.left)
            dfs(node.right)

        dfs(root)
        return ','.join(parts)

    def deserialize(self, data):
        vals = iter(data.split(','))

        def build():
            v = next(vals)
            if v == '#':
                return None
            node = TreeNode(int(v))
            node.left = build()
            node.right = build()
            return node

        return build()`,

  'diameter-binary-tree': `def diameter_of_binary_tree(root):
    diam = 0

    def height(node):
        nonlocal diam
        if not node:
            return 0
        left = height(node.left)
        right = height(node.right)
        diam = max(diam, left + right)
        return 1 + max(left, right)

    height(root)
    return diam`,

  'symmetric-tree': `def is_symmetric(root):
    def mirror(a, b):
        if not a and not b:
            return True
        if not a or not b or a.val != b.val:
            return False
        return mirror(a.left, b.right) and mirror(a.right, b.left)

    return not root or mirror(root.left, root.right)`,

  'path-sum-ii': `def path_sum(root, target):
    res = []

    def dfs(node, rem, path):
        if not node:
            return
        path.append(node.val)
        if not node.left and not node.right and rem == node.val:
            res.append(path[:])
        else:
            dfs(node.left, rem - node.val, path)
            dfs(node.right, rem - node.val, path)
        path.pop()

    dfs(root, target, [])
    return res`,

  'construct-from-preorder-inorder': `def build_tree(preorder, inorder):
    idx = {v: i for i, v in enumerate(inorder)}
    pre = 0

    def build(lo, hi):
        nonlocal pre
        if lo > hi:
            return None
        root_val = preorder[pre]
        pre += 1
        root = TreeNode(root_val)
        mid = idx[root_val]
        root.left = build(lo, mid - 1)
        root.right = build(mid + 1, hi)
        return root

    return build(0, len(inorder) - 1)`,

  // ═══════════ GRAPH ═══════════

  'number-of-islands': `def num_islands(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])

    def dfs(i, j):
        if i < 0 or i >= rows or j < 0 or j >= cols or grid[i][j] != '1':
            return
        grid[i][j] = '0'
        dfs(i + 1, j)
        dfs(i - 1, j)
        dfs(i, j + 1)
        dfs(i, j - 1)

    count = 0
    for i in range(rows):
        for j in range(cols):
            if grid[i][j] == '1':
                dfs(i, j)
                count += 1
    return count`,

  'clone-graph': `from collections import deque

def clone_graph(node):
    if not node:
        return None
    mapping = {node: Node(node.val)}
    q = deque([node])
    while q:
        cur = q.popleft()
        for nb in cur.neighbors:
            if nb not in mapping:
                mapping[nb] = Node(nb.val)
                q.append(nb)
            mapping[cur].neighbors.append(mapping[nb])
    return mapping[node]`,

  'course-schedule': `from collections import deque

def can_finish(num_courses, prerequisites):
    adj = [[] for _ in range(num_courses)]
    indeg = [0] * num_courses
    for course, pre in prerequisites:
        adj[pre].append(course)
        indeg[course] += 1
    q = deque(i for i in range(num_courses) if indeg[i] == 0)
    seen = 0
    while q:
        u = q.popleft()
        seen += 1
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return seen == num_courses`,

  'word-ladder': `from collections import deque

def ladder_length(begin, end, word_list):
    words = set(word_list)
    q = deque([begin])
    steps = 1
    while q:
        for _ in range(len(q)):
            word = q.popleft()
            if word == end:
                return steps
            for i in range(len(word)):
                for c in 'abcdefghijklmnopqrstuvwxyz':
                    nxt = word[:i] + c + word[i + 1:]
                    if nxt in words:
                        words.remove(nxt)
                        q.append(nxt)
        steps += 1
    return 0`,

  'pacific-atlantic-flow': `def pacific_atlantic(heights):
    if not heights:
        return []
    m, n = len(heights), len(heights[0])
    pac = [[False] * n for _ in range(m)]
    atl = [[False] * n for _ in range(m)]

    def dfs(vis, i, j):
        vis[i][j] = True
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ni, nj = i + di, j + dj
            if 0 <= ni < m and 0 <= nj < n and not vis[ni][nj] and heights[ni][nj] >= heights[i][j]:
                dfs(vis, ni, nj)

    for i in range(m):
        dfs(pac, i, 0)
        dfs(atl, i, n - 1)
    for j in range(n):
        dfs(pac, 0, j)
        dfs(atl, m - 1, j)
    return [[i, j] for i in range(m) for j in range(n) if pac[i][j] and atl[i][j]]`,

  'connected-components': `def count_components(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    count = n
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            count -= 1
    return count`,

  'alien-dictionary': `from collections import deque

def alien_order(words):
    adj = {c: set() for w in words for c in w}
    indeg = {c: 0 for c in adj}
    for a, b in zip(words, words[1:]):
        if len(a) > len(b) and a.startswith(b):
            return ""
        for x, y in zip(a, b):
            if x != y:
                if y not in adj[x]:
                    adj[x].add(y)
                    indeg[y] += 1
                break
    q = deque(c for c in indeg if indeg[c] == 0)
    res = []
    while q:
        c = q.popleft()
        res.append(c)
        for nx in adj[c]:
            indeg[nx] -= 1
            if indeg[nx] == 0:
                q.append(nx)
    return ''.join(res) if len(res) == len(adj) else ""`,

  'dijkstra-shortest-path': `import heapq

def dijkstra(n, edges, src):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist = [float('inf')] * n
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(pq, (dist[v], v))
    return dist`,

  'minimum-spanning-tree': `def kruskal(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    total = used = 0
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            total += w
            used += 1
            if used == n - 1:
                break
    return total`,

  'detect-cycle-directed': `def has_cycle(n, adj):
    color = [0] * n  # 0=white, 1=gray, 2=black

    def dfs(u):
        color[u] = 1
        for v in adj[u]:
            if color[v] == 1:
                return True
            if color[v] == 0 and dfs(v):
                return True
        color[u] = 2
        return False

    return any(color[i] == 0 and dfs(i) for i in range(n))`,

  // ═══════════ DYNAMIC PROGRAMMING ═══════════

  'climbing-stairs': `def climb_stairs(n):
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b`,

  'coin-change': `def coin_change(coins, amount):
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for c in coins:
            if c <= i:
                dp[i] = min(dp[i], dp[i - c] + 1)
    return dp[amount] if dp[amount] <= amount else -1`,

  'lcs': `def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,

  'knapsack-01': `def knapsack(weights, values, cap):
    dp = [0] * (cap + 1)
    for i in range(len(weights)):
        for c in range(cap, weights[i] - 1, -1):
            dp[c] = max(dp[c], dp[c - weights[i]] + values[i])
    return dp[cap]`,

  'lis': `from bisect import bisect_left

def length_of_lis(nums):
    tails = []
    for x in nums:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)`,

  'word-break': `def word_break(s, word_dict):
    words = set(word_dict)
    dp = [False] * (len(s) + 1)
    dp[0] = True
    for i in range(1, len(s) + 1):
        for j in range(i):
            if dp[j] and s[j:i] in words:
                dp[i] = True
                break
    return dp[len(s)]`,

  'edit-distance': `def min_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,

  'max-product-subarray': `def max_product(nums):
    cur_max = cur_min = res = nums[0]
    for x in nums[1:]:
        if x < 0:
            cur_max, cur_min = cur_min, cur_max
        cur_max = max(x, cur_max * x)
        cur_min = min(x, cur_min * x)
        res = max(res, cur_max)
    return res`,

  'house-robber': `def rob(nums):
    prev = cur = 0
    for x in nums:
        prev, cur = cur, max(cur, prev + x)
    return cur`,

  'unique-paths': `def unique_paths(m, n):
    dp = [1] * n
    for _ in range(1, m):
        for j in range(1, n):
            dp[j] += dp[j - 1]
    return dp[n - 1]`,

  // ═══════════ HASHING ═══════════

  'subarray-sum-k': `def subarray_sum(nums, k):
    count = {0: 1}
    total = res = 0
    for x in nums:
        total += x
        res += count.get(total - k, 0)
        count[total] = count.get(total, 0) + 1
    return res`,

  'longest-consecutive-sequence': `def longest_consecutive(nums):
    num_set = set(nums)
    best = 0
    for x in num_set:
        if x - 1 not in num_set:
            cur, length = x, 1
            while cur + 1 in num_set:
                cur += 1
                length += 1
            best = max(best, length)
    return best`,

  'top-k-frequent-elements': `def top_k_frequent(nums, k):
    freq = {}
    for x in nums:
        freq[x] = freq.get(x, 0) + 1
    buckets = [[] for _ in range(len(nums) + 1)]
    for val, f in freq.items():
        buckets[f].append(val)
    res = []
    for f in range(len(buckets) - 1, 0, -1):
        for val in buckets[f]:
            res.append(val)
            if len(res) == k:
                return res
    return res`,

  'four-sum': `def four_sum(nums, target):
    nums.sort()
    n = len(nums)
    res = []
    for i in range(n - 3):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        for j in range(i + 1, n - 2):
            if j > i + 1 and nums[j] == nums[j - 1]:
                continue
            lo, hi = j + 1, n - 1
            while lo < hi:
                s = nums[i] + nums[j] + nums[lo] + nums[hi]
                if s == target:
                    res.append([nums[i], nums[j], nums[lo], nums[hi]])
                    while lo < hi and nums[lo] == nums[lo + 1]:
                        lo += 1
                    while lo < hi and nums[hi] == nums[hi - 1]:
                        hi -= 1
                    lo += 1
                    hi -= 1
                elif s < target:
                    lo += 1
                else:
                    hi -= 1
    return res`,

  'jewels-and-stones': `def num_jewels_in_stones(jewels, stones):
    jewel_set = set(jewels)
    return sum(1 for c in stones if c in jewel_set)`,

  // ═══════════ HEAP ═══════════

  'kth-largest-element': `import heapq

def find_kth_largest(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]`,

  'top-k-frequent-words': `import heapq

def top_k_frequent(words, k):
    freq = {}
    for w in words:
        freq[w] = freq.get(w, 0) + 1
    return heapq.nsmallest(k, freq, key=lambda w: (-freq[w], w))`,

  'find-median-stream': `import heapq

class MedianFinder:
    def __init__(self):
        self.lo = []  # max-heap (negated) — smaller half
        self.hi = []  # min-heap — larger half

    def add_num(self, x):
        heapq.heappush(self.lo, -x)
        heapq.heappush(self.hi, -heapq.heappop(self.lo))
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def find_median(self):
        if len(self.lo) > len(self.hi):
            return -self.lo[0]
        return (-self.lo[0] + self.hi[0]) / 2.0`,

  'task-scheduler': `def least_interval(tasks, cooldown):
    freq = [0] * 26
    for t in tasks:
        freq[ord(t) - ord('A')] += 1
    max_f = max(freq)
    cnt_max = freq.count(max_f)
    slots = (max_f - 1) * (cooldown + 1) + cnt_max
    return max(len(tasks), slots)`,

  'reorganize-string': `def reorganize_string(s):
    freq = [0] * 26
    for c in s:
        freq[ord(c) - ord('a')] += 1
    max_f = max(freq)
    max_idx = freq.index(max_f)
    if max_f > (len(s) + 1) // 2:
        return ""
    res = [''] * len(s)
    idx = 0
    while freq[max_idx] > 0:
        res[idx] = chr(ord('a') + max_idx)
        idx += 2
        freq[max_idx] -= 1
    for i in range(26):
        while freq[i] > 0:
            if idx >= len(s):
                idx = 1
            res[idx] = chr(ord('a') + i)
            idx += 2
            freq[i] -= 1
    return ''.join(res)`,

  // ═══════════ BACKTRACKING ═══════════

  'n-queens': `def total_n_queens(n):
    count = 0
    cols, diag, anti = set(), set(), set()

    def solve(r):
        nonlocal count
        if r == n:
            count += 1
            return
        for c in range(n):
            if c in cols or (r - c) in diag or (r + c) in anti:
                continue
            cols.add(c)
            diag.add(r - c)
            anti.add(r + c)
            solve(r + 1)
            cols.remove(c)
            diag.remove(r - c)
            anti.remove(r + c)

    solve(0)
    return count`,

  'sudoku-solver': `def solve_sudoku(board):
    def valid(r, c, d):
        for i in range(9):
            if board[r][i] == d or board[i][c] == d:
                return False
            if board[3 * (r // 3) + i // 3][3 * (c // 3) + i % 3] == d:
                return False
        return True

    def solve():
        for r in range(9):
            for c in range(9):
                if board[r][c] == '.':
                    for d in '123456789':
                        if valid(r, c, d):
                            board[r][c] = d
                            if solve():
                                return True
                            board[r][c] = '.'
                    return False
        return True

    solve()
    return board`,

  'generate-parentheses': `def generate_parenthesis(n):
    res = []

    def bt(s, open_count, close_count):
        if len(s) == 2 * n:
            res.append(s)
            return
        if open_count < n:
            bt(s + '(', open_count + 1, close_count)
        if close_count < open_count:
            bt(s + ')', open_count, close_count + 1)

    bt('', 0, 0)
    return res`,

  'permutations': `def permute(nums):
    res = []

    def bt(k):
        if k == len(nums):
            res.append(nums[:])
            return
        for i in range(k, len(nums)):
            nums[k], nums[i] = nums[i], nums[k]
            bt(k + 1)
            nums[k], nums[i] = nums[i], nums[k]

    bt(0)
    return res`,

  'subsets': `def subsets(nums):
    res = []

    def bt(start, cur):
        res.append(cur[:])
        for i in range(start, len(nums)):
            cur.append(nums[i])
            bt(i + 1, cur)
            cur.pop()

    bt(0, [])
    return res`,

  'word-search': `def exist(board, word):
    rows, cols = len(board), len(board[0])

    def dfs(i, j, k):
        if k == len(word):
            return True
        if i < 0 or i >= rows or j < 0 or j >= cols or board[i][j] != word[k]:
            return False
        tmp = board[i][j]
        board[i][j] = '#'
        found = (dfs(i + 1, j, k + 1) or dfs(i - 1, j, k + 1) or
                 dfs(i, j + 1, k + 1) or dfs(i, j - 1, k + 1))
        board[i][j] = tmp
        return found

    return any(dfs(i, j, 0) for i in range(rows) for j in range(cols))`,

  // ═══════════ FUNDAMENTALS ═══════════

  'fizzbuzz': `def fizz_buzz(n):
    res = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            res.append("FizzBuzz")
        elif i % 3 == 0:
            res.append("Fizz")
        elif i % 5 == 0:
            res.append("Buzz")
        else:
            res.append(str(i))
    return res`,

  'fibonacci-optimized': `def fib(n):
    if n < 2:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b`,

  'fast-exponentiation': `def my_pow(x, n):
    if n < 0:
        x = 1 / x
        n = -n
    res = 1.0
    while n > 0:
        if n & 1:
            res *= x
        x *= x
        n >>= 1
    return res`,

  'gcd-algorithm': `def gcd(a, b):
    while b:
        a, b = b, a % b
    return a`,

  'prime-sieve': `def sieve(n):
    composite = [False] * (n + 1)
    primes = []
    for p in range(2, n + 1):
        if not composite[p]:
            primes.append(p)
            for m in range(p * p, n + 1, p):
                composite[m] = True
    return primes`,

  'reverse-integer': `def reverse(x):
    sign = -1 if x < 0 else 1
    x = abs(x)
    res = 0
    while x:
        res = res * 10 + x % 10
        x //= 10
    res *= sign
    return res if -2**31 <= res <= 2**31 - 1 else 0`,

  // ═══════════ ADVANCED ═══════════

  'kmp-string-matching': `def str_str(text, pat):
    n, m = len(text), len(pat)
    if m == 0:
        return 0
    lps = [0] * m
    length, i = 0, 1
    while i < m:
        if pat[i] == pat[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length > 0:
            length = lps[length - 1]
        else:
            lps[i] = 0
            i += 1
    i = j = 0
    while i < n:
        if text[i] == pat[j]:
            i += 1
            j += 1
            if j == m:
                return i - m
        elif j > 0:
            j = lps[j - 1]
        else:
            i += 1
    return -1`,

  'segment-tree': `class SegTree:
    def __init__(self, a):
        self.n = len(a)
        self.tree = [0] * (2 * self.n)
        for i in range(self.n):
            self.tree[self.n + i] = a[i]
        for i in range(self.n - 1, 0, -1):
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

    def update(self, i, val):
        i += self.n
        self.tree[i] = val
        i //= 2
        while i > 0:
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]
            i //= 2

    def query(self, l, r):  # sum of [l, r)
        total = 0
        l += self.n
        r += self.n
        while l < r:
            if l & 1:
                total += self.tree[l]
                l += 1
            if r & 1:
                r -= 1
                total += self.tree[r]
            l //= 2
            r //= 2
        return total`,

  'trie-insert-search': `class Trie:
    def __init__(self):
        self.children = {}
        self.is_end = False

    def insert(self, word):
        node = self
        for c in word:
            if c not in node.children:
                node.children[c] = Trie()
            node = node.children[c]
        node.is_end = True

    def search(self, word):
        node = self
        for c in word:
            if c not in node.children:
                return False
            node = node.children[c]
        return node.is_end`,

  'lfu-cache': `from collections import defaultdict, OrderedDict

class LFUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.min_freq = 0
        self.vals = {}                          # key -> value
        self.counts = {}                        # key -> frequency
        self.lists = defaultdict(OrderedDict)   # frequency -> ordered keys

    def get(self, key):
        if key not in self.vals:
            return -1
        f = self.counts[key]
        del self.lists[f][key]
        if not self.lists[f] and f == self.min_freq:
            self.min_freq += 1
        self.counts[key] = f + 1
        self.lists[f + 1][key] = None
        return self.vals[key]

    def put(self, key, value):
        if self.cap <= 0:
            return
        if key in self.vals:
            self.vals[key] = value
            self.get(key)
            return
        if len(self.vals) >= self.cap:
            evict, _ = self.lists[self.min_freq].popitem(last=False)
            del self.vals[evict]
            del self.counts[evict]
        self.vals[key] = value
        self.counts[key] = 1
        self.min_freq = 1
        self.lists[1][key] = None`,

  'skyline-problem': `import heapq

def get_skyline(buildings):
    events = []
    for l, r, h in buildings:
        events.append((l, -h, r))   # start: negative height
        events.append((r, 0, 0))    # end marker
    events.sort()
    res = []
    heap = [(0, float('inf'))]      # (negative height, end x)
    for x, neg_h, r in events:
        while heap[0][1] <= x:
            heapq.heappop(heap)
        if neg_h < 0:
            heapq.heappush(heap, (neg_h, r))
        cur = -heap[0][0]
        if not res or res[-1][1] != cur:
            res.append([x, cur])
    return res`,

  'convex-hull': `def convex_hull(points):
    points = sorted(map(tuple, points))
    if len(points) < 3:
        return points

    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    lower = []
    for p in points:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    upper = []
    for p in reversed(points):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]`,

  // ═══════════ GREEDY ═══════════

  'jump-game': `def can_jump(nums):
    reach = 0
    for i, x in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + x)
    return True`,

  'activity-selection': `def activity_selection(activities):
    activities.sort(key=lambda a: a[1])
    count = 0
    last_end = float('-inf')
    for start, end in activities:
        if start >= last_end:
            count += 1
            last_end = end
    return count`,

  'fractional-knapsack': `def fractional_knapsack(items, cap):   # items[i] = [value, weight]
    items.sort(key=lambda it: it[0] / it[1], reverse=True)
    total = 0.0
    for value, weight in items:
        if cap >= weight:
            total += value
            cap -= weight
        else:
            total += value * (cap / weight)
            break
    return total`,

  'gas-station': `def can_complete_circuit(gas, cost):
    total = tank = start = 0
    for i in range(len(gas)):
        diff = gas[i] - cost[i]
        total += diff
        tank += diff
        if tank < 0:
            start = i + 1
            tank = 0
    return start if total >= 0 else -1`,

  'assign-cookies': `def find_content_children(g, s):
    g.sort()
    s.sort()
    i = j = 0
    while i < len(g) and j < len(s):
        if s[j] >= g[i]:
            i += 1
        j += 1
    return i`,

  'min-platforms': `def min_platforms(arr, dep):
    arr.sort()
    dep.sort()
    n = len(arr)
    plat = best = i = j = 0
    while i < n:
        if arr[i] <= dep[j]:
            plat += 1
            i += 1
            best = max(best, plat)
        else:
            plat -= 1
            j += 1
    return best`,

  // ═══════════ DESIGN ═══════════

  'lru-cache': `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)`,

}
