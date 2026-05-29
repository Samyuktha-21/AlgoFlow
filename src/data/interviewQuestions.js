export const interviewQuestions = [

  // ══════════════════ EASY ══════════════════

  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'easy',
    description: 'Given an array of integers and a target, return indices of two numbers that add up to the target.',
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'],
    pattern: 'Hashing',
    topic: 'Array',
    frequency: 5,
    algorithmLink: '/algorithm/hashing/twoSumHash',
    complexity: { time: 'O(n)', space: 'O(n)' },
    solution: {
      approach: 'Use a hash map to store each number and its index. For each element, check if (target − element) exists in the map.',
      java: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int comp = target - nums[i];
        if (map.containsKey(comp))
            return new int[]{map.get(comp), i};
        map.put(nums[i], i);
    }
    return new int[]{};
}`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int,int> mp;
    for (int i = 0; i < nums.size(); i++) {
        int comp = target - nums[i];
        if (mp.count(comp)) return {mp[comp], i};
        mp[nums[i]] = i;
    }
    return {};
}`,
      c: `int* twoSum(int* nums, int n, int target, int* rs) {
    int* res = malloc(2*sizeof(int)); *rs = 2;
    for (int i = 0; i < n; i++)
        for (int j = i+1; j < n; j++)
            if (nums[i]+nums[j]==target) { res[0]=i; res[1]=j; return res; }
    return res;
}`,
    },
    interviewerTips: [
      'Always ask: can there be duplicate numbers? Can I use the same element twice?',
      'Start with O(n²) brute force, then optimise to O(n) with hash map.',
      'Mention edge case: what if no solution exists?',
    ],
    followUpQuestions: [
      'What if the array is sorted? (Two pointers — O(1) space)',
      'What if you need ALL pairs?',
      'Three Sum: find all triplets summing to zero?',
    ],
  },

  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    description: 'Determine if a string of brackets is valid — every open bracket has a matching close bracket in the correct order.',
    companies: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
    pattern: 'Stack',
    topic: 'Stack',
    frequency: 5,
    algorithmLink: '/algorithm/stacks-queues/validParenthesesStack',
    complexity: { time: 'O(n)', space: 'O(n)' },
    solution: {
      approach: 'Use a stack. Push open brackets. On closing bracket, pop and check if it matches.',
      java: `public boolean isValid(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (c=='('||c=='{'||c=='[') { stack.push(c); continue; }
        if (stack.isEmpty()) return false;
        char t = stack.pop();
        if (c==')'&&t!='(') return false;
        if (c=='}'&&t!='{') return false;
        if (c==']'&&t!='[') return false;
    }
    return stack.isEmpty();
}`,
      cpp: `bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c=='('||c=='{'||c=='[') { st.push(c); continue; }
        if (st.empty()) return false;
        char t = st.top(); st.pop();
        if (c==')'&&t!='(') return false;
        if (c=='}'&&t!='{') return false;
        if (c==']'&&t!='[') return false;
    }
    return st.empty();
}`,
      c: `bool isValid(char* s) {
    char stack[10001]; int top=-1;
    for(int i=0;s[i];i++) {
        if(s[i]=='('||s[i]=='{'||s[i]=='['){stack[++top]=s[i];continue;}
        if(top<0) return false;
        char t=stack[top--];
        if(s[i]==')'&&t!='(') return false;
        if(s[i]=='}'&&t!='{') return false;
        if(s[i]==']'&&t!='[') return false;
    }
    return top==-1;
}`,
    },
    interviewerTips: [
      'Classic stack pattern — recognise it immediately.',
      'Edge cases: empty string (valid), only open brackets, only close brackets.',
    ],
    followUpQuestions: [
      'What if wildcards (*) can be open, close, or empty?',
      'Remove minimum invalid parentheses to make valid?',
    ],
  },

  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'easy',
    description: 'Reverse a singly linked list iteratively and recursively.',
    companies: ['Amazon', 'Microsoft', 'Apple', 'Adobe', 'Google'],
    pattern: 'Linked List',
    topic: 'Linked List',
    frequency: 5,
    algorithmLink: '/algorithm/linked-lists/reverseLinkedList',
    complexity: { time: 'O(n)', space: 'O(1) iterative, O(n) recursive' },
    solution: {
      approach: 'Iterative: maintain prev, curr, next pointers. Reverse each link as you advance.',
      java: `public ListNode reverseList(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
      cpp: `ListNode* reverseList(ListNode* head) {
    ListNode *prev=nullptr, *curr=head;
    while (curr) {
        ListNode* nxt = curr->next;
        curr->next = prev;
        prev = curr; curr = nxt;
    }
    return prev;
}`,
      c: `struct ListNode* reverseList(struct ListNode* head) {
    struct ListNode *prev=NULL, *curr=head;
    while(curr){ struct ListNode* nxt=curr->next; curr->next=prev; prev=curr; curr=nxt; }
    return prev;
}`,
    },
    interviewerTips: [
      'Know BOTH iterative (O(1) space) and recursive (O(n) stack) solutions.',
      'Draw a diagram before coding.',
      'Common mistake: losing reference to next node before updating pointer.',
    ],
    followUpQuestions: [
      'Reverse in groups of k?',
      'Reverse only from position m to n?',
      'Check if linked list is a palindrome?',
    ],
  },

  {
    id: 'best-time-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'easy',
    description: 'Given a prices array, find the maximum profit from a single buy-sell transaction.',
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Goldman Sachs'],
    pattern: 'Sliding Window / Kadane',
    topic: 'Array',
    frequency: 5,
    algorithmLink: '/algorithm/arrays/maximumSubarray',
    complexity: { time: 'O(n)', space: 'O(1)' },
    solution: {
      approach: 'Track the minimum price seen so far and the maximum profit at each step.',
      java: `public int maxProfit(int[] prices) {
    int minPrice = Integer.MAX_VALUE, maxProfit = 0;
    for (int p : prices) {
        minPrice = Math.min(minPrice, p);
        maxProfit = Math.max(maxProfit, p - minPrice);
    }
    return maxProfit;
}`,
      cpp: `int maxProfit(vector<int>& prices) {
    int mn = INT_MAX, mx = 0;
    for (int p : prices) { mn = min(mn,p); mx = max(mx,p-mn); }
    return mx;
}`,
      c: `int maxProfit(int* p, int n) {
    int mn=INT_MAX, mx=0;
    for(int i=0;i<n;i++){if(p[i]<mn)mn=p[i];if(p[i]-mn>mx)mx=p[i]-mn;}
    return mx;
}`,
    },
    interviewerTips: [
      'Must buy BEFORE selling — scan left to right.',
      'Clarify: can we make multiple transactions? (Different problem!)',
    ],
    followUpQuestions: [
      'Multiple transactions allowed?',
      'At most k transactions?',
      'With cooldown period after selling?',
    ],
  },

  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'easy',
    description: 'You can climb 1 or 2 steps. How many distinct ways to reach step n?',
    companies: ['Amazon', 'Google', 'Apple', 'Adobe'],
    pattern: 'Dynamic Programming',
    topic: 'DP',
    frequency: 4,
    algorithmLink: '/algorithm/dynamic-programming/fibDP',
    complexity: { time: 'O(n)', space: 'O(1)' },
    solution: {
      approach: 'Fibonacci pattern: ways(n) = ways(n-1) + ways(n-2). Optimise to O(1) space.',
      java: `public int climbStairs(int n) {
    if (n <= 2) return n;
    int a=1, b=2;
    for (int i=3; i<=n; i++) { int c=a+b; a=b; b=c; }
    return b;
}`,
      cpp: `int climbStairs(int n) {
    if(n<=2) return n;
    int a=1,b=2;
    for(int i=3;i<=n;i++){int c=a+b;a=b;b=c;}
    return b;
}`,
      c: `int climbStairs(int n) {
    if(n<=2) return n;
    int a=1,b=2,c;
    for(int i=3;i<=n;i++){c=a+b;a=b;b=c;}
    return b;
}`,
    },
    interviewerTips: [
      'Recognise Fibonacci immediately and say so.',
      'Show recursive → memoised → O(1) space progression.',
    ],
    followUpQuestions: [
      'Some steps are broken — cannot step on them?',
      'Minimum cost to climb stairs?',
      'What if you can jump up to k steps?',
    ],
  },

  {
    id: 'contains-duplicate',
    title: 'Contains Duplicate',
    difficulty: 'easy',
    description: 'Return true if any value appears at least twice in the array.',
    companies: ['Amazon', 'Google', 'Apple'],
    pattern: 'Hashing',
    topic: 'Array',
    frequency: 4,
    algorithmLink: '/algorithm/hashing/hashMapImpl',
    complexity: { time: 'O(n)', space: 'O(n)' },
    solution: {
      approach: 'HashSet: if element already exists, duplicate found.',
      java: `public boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int n : nums) if (!seen.add(n)) return true;
    return false;
}`,
      cpp: `bool containsDuplicate(vector<int>& nums) {
    unordered_set<int> seen;
    for(int n:nums){if(seen.count(n))return true;seen.insert(n);}
    return false;
}`,
      c: `// Sort + check adjacent: O(n log n) time, O(1) space
bool containsDuplicate(int* nums, int n) {
    // Sort then check adjacent elements
    for(int i=0;i<n-1;i++) for(int j=0;j<n-i-1;j++)
        if(nums[j]>nums[j+1]){int t=nums[j];nums[j]=nums[j+1];nums[j+1]=t;}
    for(int i=1;i<n;i++) if(nums[i]==nums[i-1]) return true;
    return false;
}`,
    },
    interviewerTips: [
      'Discuss space vs time tradeoff: HashSet O(n) space, Sort O(1) space.',
    ],
    followUpQuestions: [
      'Contains duplicate within k distance apart?',
    ],
  },

  {
    id: 'missing-number',
    title: 'Missing Number',
    difficulty: 'easy',
    description: 'Find the missing number in an array containing n distinct numbers from 0 to n.',
    companies: ['Amazon', 'Microsoft', 'Google'],
    pattern: 'Bit Manipulation / Math',
    topic: 'Array',
    frequency: 4,
    algorithmLink: '/algorithm/fundamentals/twoSum',
    complexity: { time: 'O(n)', space: 'O(1)' },
    solution: {
      approach: 'XOR all numbers 0..n with all array elements. Duplicates cancel, leaving the missing number.',
      java: `public int missingNumber(int[] nums) {
    int xor = nums.length;
    for (int i=0; i<nums.length; i++) xor ^= i ^ nums[i];
    return xor;
}`,
      cpp: `int missingNumber(vector<int>& nums) {
    int x = nums.size();
    for(int i=0;i<nums.size();i++) x ^= i^nums[i];
    return x;
}`,
      c: `int missingNumber(int* nums, int n) {
    int x=n;
    for(int i=0;i<n;i++) x^=i^nums[i];
    return x;
}`,
    },
    interviewerTips: [
      'Show 3 approaches: XOR O(1), Gauss sum formula n*(n+1)/2, HashSet O(n) space.',
      'XOR approach impresses interviewers most.',
    ],
    followUpQuestions: [
      'Find two missing numbers?',
      'Find duplicate AND missing number?',
    ],
  },

  {
    id: 'max-depth-tree',
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'easy',
    description: 'Find the maximum depth (nodes along longest root-to-leaf path) of a binary tree.',
    companies: ['Amazon', 'Google', 'Meta', 'Apple'],
    pattern: 'Tree DFS',
    topic: 'Tree',
    frequency: 4,
    algorithmLink: '/algorithm/trees/treeTraversal',
    complexity: { time: 'O(n)', space: 'O(h) where h is height' },
    solution: {
      approach: 'Recursive DFS: max depth = 1 + max(depth(left), depth(right)).',
      java: `public int maxDepth(TreeNode root) {
    if (root==null) return 0;
    return 1+Math.max(maxDepth(root.left),maxDepth(root.right));
}`,
      cpp: `int maxDepth(TreeNode* root) {
    if(!root) return 0;
    return 1+max(maxDepth(root->left),maxDepth(root->right));
}`,
      c: `int maxDepth(struct TreeNode* r) {
    if(!r) return 0;
    int l=maxDepth(r->left),ri=maxDepth(r->right);
    return 1+(l>ri?l:ri);
}`,
    },
    interviewerTips: [
      'Know both recursive DFS and iterative BFS solutions.',
      'BFS approach: count levels traversed.',
    ],
    followUpQuestions: [
      'Minimum depth of binary tree?',
      'Balanced binary tree check?',
      'Diameter of binary tree?',
    ],
  },

  {
    id: 'move-zeroes',
    title: 'Move Zeroes',
    difficulty: 'easy',
    description: 'Move all zeroes to the end while maintaining relative order of non-zero elements, in-place.',
    companies: ['Meta', 'Bloomberg', 'Google'],
    pattern: 'Two Pointers',
    topic: 'Array',
    frequency: 3,
    algorithmLink: '/algorithm/fundamentals/twoSum',
    complexity: { time: 'O(n)', space: 'O(1)' },
    solution: {
      approach: 'Slow pointer marks next position for non-zero element. Fill remaining with zeros.',
      java: `public void moveZeroes(int[] nums) {
    int slow=0;
    for(int fast=0;fast<nums.length;fast++)
        if(nums[fast]!=0) nums[slow++]=nums[fast];
    while(slow<nums.length) nums[slow++]=0;
}`,
      cpp: `void moveZeroes(vector<int>& nums) {
    int slow=0;
    for(int f:nums) if(f!=0) nums[slow++]=f;
    while(slow<nums.size()) nums[slow++]=0;
}`,
      c: `void moveZeroes(int* nums, int n) {
    int slow=0;
    for(int i=0;i<n;i++) if(nums[i]!=0) nums[slow++]=nums[i];
    while(slow<n) nums[slow++]=0;
}`,
    },
    interviewerTips: ['In-place required — no extra array.'],
    followUpQuestions: ['Move all negatives to front?', 'Segregate even and odd?'],
  },

  // ══════════════════ MEDIUM ══════════════════

  {
    id: 'longest-substring-no-repeat',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'medium',
    description: 'Find the length of the longest substring without repeating characters.',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Adobe', 'Apple'],
    pattern: 'Sliding Window',
    topic: 'String',
    frequency: 5,
    algorithmLink: '/algorithm/arrays/slidingWindow',
    complexity: { time: 'O(n)', space: 'O(min(n,m)) where m is charset' },
    solution: {
      approach: 'Sliding window with index map. Expand right, jump left past duplicate when found.',
      java: `public int lengthOfLongestSubstring(String s) {
    Map<Character,Integer> map=new HashMap<>();
    int max=0,left=0;
    for(int r=0;r<s.length();r++){
        char c=s.charAt(r);
        if(map.containsKey(c)) left=Math.max(left,map.get(c)+1);
        map.put(c,r);
        max=Math.max(max,r-left+1);
    }
    return max;
}`,
      cpp: `int lengthOfLongestSubstring(string s) {
    unordered_map<char,int> mp;
    int mx=0,l=0;
    for(int r=0;r<s.size();r++){
        if(mp.count(s[r])) l=max(l,mp[s[r]]+1);
        mp[s[r]]=r; mx=max(mx,r-l+1);
    }
    return mx;
}`,
      c: `int lengthOfLongestSubstring(char* s) {
    int map[256]; memset(map,-1,sizeof(map));
    int mx=0,l=0;
    for(int r=0;s[r];r++){
        if(map[(int)s[r]]>=l) l=map[(int)s[r]]+1;
        map[(int)s[r]]=r; if(r-l+1>mx) mx=r-l+1;
    }
    return mx;
}`,
    },
    interviewerTips: [
      'Classic sliding window — know this cold.',
      'Using index map avoids re-scanning the left boundary.',
      'Clarify: ASCII or Unicode?',
    ],
    followUpQuestions: [
      'At most k distinct characters?',
      'Minimum window containing all characters of pattern?',
    ],
  },

  {
    id: 'container-most-water',
    title: 'Container With Most Water',
    difficulty: 'medium',
    description: 'Find two lines that form a container holding the most water.',
    companies: ['Google', 'Amazon', 'Meta', 'Bloomberg'],
    pattern: 'Two Pointers',
    topic: 'Array',
    frequency: 5,
    algorithmLink: '/algorithm/arrays/slidingWindow',
    complexity: { time: 'O(n)', space: 'O(1)' },
    solution: {
      approach: 'Two pointers from both ends. Move the shorter pointer inward — it can never do better.',
      java: `public int maxArea(int[] height) {
    int l=0, r=height.length-1, max=0;
    while(l<r){
        max=Math.max(max,Math.min(height[l],height[r])*(r-l));
        if(height[l]<height[r]) l++; else r--;
    }
    return max;
}`,
      cpp: `int maxArea(vector<int>& h) {
    int l=0,r=h.size()-1,mx=0;
    while(l<r){mx=max(mx,min(h[l],h[r])*(r-l));if(h[l]<h[r])l++;else r--;}
    return mx;
}`,
      c: `int maxArea(int* h, int n) {
    int l=0,r=n-1,mx=0;
    while(l<r){int a=(h[l]<h[r]?h[l]:h[r])*(r-l);if(a>mx)mx=a;if(h[l]<h[r])l++;else r--;}
    return mx;
}`,
    },
    interviewerTips: [
      'Key insight: moving the taller pointer can never increase area.',
      'Prove the greedy choice to the interviewer.',
    ],
    followUpQuestions: ['Trapping Rain Water (harder variant)?'],
  },

  {
    id: 'maximum-subarray',
    title: "Maximum Subarray (Kadane's Algorithm)",
    difficulty: 'medium',
    description: 'Find the contiguous subarray with the largest sum.',
    companies: ['Amazon', 'Microsoft', 'Google', 'Meta', 'LinkedIn'],
    pattern: "Dynamic Programming / Kadane's",
    topic: 'Array',
    frequency: 5,
    algorithmLink: '/algorithm/arrays/maximumSubarray',
    complexity: { time: 'O(n)', space: 'O(1)' },
    solution: {
      approach: "Kadane's: track current sum. If negative, reset to 0. Track global max.",
      java: `public int maxSubArray(int[] nums) {
    int curr=nums[0], max=nums[0];
    for(int i=1;i<nums.length;i++){
        curr=Math.max(nums[i],curr+nums[i]);
        max=Math.max(max,curr);
    }
    return max;
}`,
      cpp: `int maxSubArray(vector<int>& nums) {
    int curr=nums[0],mx=nums[0];
    for(int i=1;i<nums.size();i++){curr=max(nums[i],curr+nums[i]);mx=max(mx,curr);}
    return mx;
}`,
      c: `int maxSubArray(int* nums, int n) {
    int curr=nums[0],mx=nums[0];
    for(int i=1;i<n;i++){curr=nums[i]>curr+nums[i]?nums[i]:curr+nums[i];if(curr>mx)mx=curr;}
    return mx;
}`,
    },
    interviewerTips: [
      "Name the algorithm (Kadane's) — shows knowledge.",
      'Discuss D&C alternative O(n log n).',
      'Handle all-negative: answer is largest single element.',
    ],
    followUpQuestions: [
      'Return actual subarray indices?',
      'Maximum circular subarray sum?',
      'Maximum product subarray?',
    ],
  },

  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    difficulty: 'medium',
    description: 'Count islands in a 2D grid of land (1) and water (0).',
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Bloomberg'],
    pattern: 'BFS / DFS',
    topic: 'Graph',
    frequency: 5,
    algorithmLink: '/algorithm/graphs/bfs',
    complexity: { time: 'O(m×n)', space: 'O(m×n)' },
    solution: {
      approach: 'DFS/BFS from each unvisited land cell, marking it visited. Count DFS calls.',
      java: `public int numIslands(char[][] grid) {
    int cnt=0;
    for(int i=0;i<grid.length;i++)
        for(int j=0;j<grid[0].length;j++)
            if(grid[i][j]=='1'){dfs(grid,i,j);cnt++;}
    return cnt;
}
void dfs(char[][] g,int i,int j){
    if(i<0||i>=g.length||j<0||j>=g[0].length||g[i][j]!='1') return;
    g[i][j]='0';
    dfs(g,i+1,j);dfs(g,i-1,j);dfs(g,i,j+1);dfs(g,i,j-1);
}`,
      cpp: `int numIslands(vector<vector<char>>& g) {
    int cnt=0,m=g.size(),n=g[0].size();
    function<void(int,int)> dfs=[&](int i,int j){
        if(i<0||i>=m||j<0||j>=n||g[i][j]!='1') return;
        g[i][j]='0'; dfs(i+1,j);dfs(i-1,j);dfs(i,j+1);dfs(i,j-1);
    };
    for(int i=0;i<m;i++) for(int j=0;j<n;j++) if(g[i][j]=='1'){dfs(i,j);cnt++;}
    return cnt;
}`,
      c: `void dfs(char** g,int m,int n,int i,int j){
    if(i<0||i>=m||j<0||j>=n||g[i][j]!='1') return;
    g[i][j]='0';dfs(g,m,n,i+1,j);dfs(g,m,n,i-1,j);dfs(g,m,n,i,j+1);dfs(g,m,n,i,j-1);
}`,
    },
    interviewerTips: [
      'Template for many grid/graph problems — know it cold.',
      'Discuss Union-Find alternative.',
      'Clarify: is diagonal connectivity counted?',
    ],
    followUpQuestions: ['Max area of island?', 'Number of enclaves?'],
  },

  {
    id: 'coin-change',
    title: 'Coin Change',
    difficulty: 'medium',
    description: 'Find minimum number of coins to make a target amount. Return -1 if impossible.',
    companies: ['Amazon', 'Google', 'Microsoft', 'Goldman Sachs', 'Uber'],
    pattern: 'Dynamic Programming',
    topic: 'DP',
    frequency: 5,
    algorithmLink: '/algorithm/dynamic-programming/coinChangeDP',
    complexity: { time: 'O(n × amount)', space: 'O(amount)' },
    solution: {
      approach: 'Bottom-up DP. dp[i] = min coins for amount i. For each amount, try all denominations.',
      java: `public int coinChange(int[] coins, int amount) {
    int[] dp=new int[amount+1];
    Arrays.fill(dp,amount+1); dp[0]=0;
    for(int i=1;i<=amount;i++)
        for(int c:coins) if(c<=i) dp[i]=Math.min(dp[i],dp[i-c]+1);
    return dp[amount]>amount?-1:dp[amount];
}`,
      cpp: `int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount+1,amount+1); dp[0]=0;
    for(int i=1;i<=amount;i++)
        for(int c:coins) if(c<=i) dp[i]=min(dp[i],dp[i-c]+1);
    return dp[amount]>amount?-1:dp[amount];
}`,
      c: `int coinChange(int* coins, int n, int amount) {
    int* dp=calloc(amount+1,sizeof(int));
    for(int i=1;i<=amount;i++) dp[i]=amount+1;
    for(int i=1;i<=amount;i++)
        for(int j=0;j<n;j++) if(coins[j]<=i&&dp[i-coins[j]]+1<dp[i]) dp[i]=dp[i-coins[j]]+1;
    return dp[amount]>amount?-1:dp[amount];
}`,
    },
    interviewerTips: [
      'Greedy DOES NOT work — show counterexample: coins=[1,3,4], target=6.',
      'Explain dp[0]=0 and initialise others to infinity.',
    ],
    followUpQuestions: ['Number of ways to make change?', 'Coin change with limited coins?'],
  },

  {
    id: 'lru-cache',
    title: 'LRU Cache',
    difficulty: 'medium',
    description: 'Design an LRU cache with O(1) get and put.',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Uber'],
    pattern: 'HashMap + Doubly Linked List',
    topic: 'Design',
    frequency: 5,
    algorithmLink: '/algorithm/stacks-queues/lruCache',
    complexity: { time: 'O(1) get and put', space: 'O(capacity)' },
    solution: {
      approach: 'Doubly linked list (O(1) delete/move) + HashMap (O(1) access). Head = most recent, tail = LRU.',
      java: `class LRUCache {
    Map<Integer,Node> map=new HashMap<>();
    Node head=new Node(0,0), tail=new Node(0,0);
    int cap;
    LRUCache(int cap){this.cap=cap;head.next=tail;tail.prev=head;}
    public int get(int k){if(!map.containsKey(k))return -1;Node n=map.get(k);remove(n);addFront(n);return n.v;}
    public void put(int k,int v){if(map.containsKey(k))remove(map.get(k));if(map.size()==cap)remove(tail.prev);addFront(new Node(k,v));}
    void remove(Node n){map.remove(n.k);n.prev.next=n.next;n.next.prev=n.prev;}
    void addFront(Node n){map.put(n.k,n);n.next=head.next;n.prev=head;head.next.prev=n;head.next=n;}
    class Node{int k,v;Node prev,next;Node(int k,int v){this.k=k;this.v=v;}}
}`,
      cpp: `class LRUCache {
    int cap;
    list<pair<int,int>> lst;
    unordered_map<int,list<pair<int,int>>::iterator> mp;
public:
    LRUCache(int c):cap(c){}
    int get(int k){if(!mp.count(k))return -1;lst.splice(lst.begin(),lst,mp[k]);return mp[k]->second;}
    void put(int k,int v){if(mp.count(k))lst.erase(mp[k]);else if(lst.size()==cap){mp.erase(lst.back().first);lst.pop_back();}lst.push_front({k,v});mp[k]=lst.begin();}
};`,
      c: '/* C: use doubly linked list + hash map manually. See algorithm page. */',
    },
    interviewerTips: [
      'Most important design question — know it perfectly.',
      'Dummy head/tail nodes simplify edge cases enormously.',
      'Java LinkedHashMap solves in 3 lines — but explain the underlying structure.',
    ],
    followUpQuestions: ['LFU Cache?', 'Thread-safe LRU?'],
  },

  {
    id: 'course-schedule',
    title: 'Course Schedule',
    difficulty: 'medium',
    description: 'Given prerequisites, determine if you can finish all courses (detect cycle in directed graph).',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Topological Sort',
    topic: 'Graph',
    frequency: 5,
    algorithmLink: '/algorithm/graphs/topologicalSort',
    complexity: { time: 'O(V + E)', space: 'O(V + E)' },
    solution: {
      approach: "Kahn's BFS: if topological sort includes all nodes, no cycle exists.",
      java: `public boolean canFinish(int n, int[][] pre) {
    List<List<Integer>> adj=new ArrayList<>();
    int[] ind=new int[n];
    for(int i=0;i<n;i++) adj.add(new ArrayList<>());
    for(int[] p:pre){adj.get(p[1]).add(p[0]);ind[p[0]]++;}
    Queue<Integer> q=new LinkedList<>();
    for(int i=0;i<n;i++) if(ind[i]==0) q.add(i);
    int cnt=0;
    while(!q.isEmpty()){int u=q.poll();cnt++;for(int v:adj.get(u))if(--ind[v]==0)q.add(v);}
    return cnt==n;
}`,
      cpp: `bool canFinish(int n, vector<vector<int>>& pre) {
    vector<vector<int>> adj(n); vector<int> ind(n,0);
    for(auto& p:pre){adj[p[1]].push_back(p[0]);ind[p[0]]++;}
    queue<int> q;
    for(int i=0;i<n;i++) if(!ind[i]) q.push(i);
    int cnt=0;
    while(!q.empty()){int u=q.front();q.pop();cnt++;for(int v:adj[u])if(--ind[v]==0)q.push(v);}
    return cnt==n;
}`,
      c: '/* See graphs page for C implementation */',
    },
    interviewerTips: ['Frame as cycle detection in directed graph.', 'Both DFS and BFS (Kahn) work.'],
    followUpQuestions: ['Return the course order (Course Schedule II)?'],
  },

  {
    id: 'jump-game',
    title: 'Jump Game',
    difficulty: 'medium',
    description: 'Each element represents max jump length. Can you reach the last index?',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Greedy',
    topic: 'Array',
    frequency: 4,
    algorithmLink: '/algorithm/greedy/activitySelection',
    complexity: { time: 'O(n)', space: 'O(1)' },
    solution: {
      approach: 'Track furthest reachable index. If current index > furthest, cannot proceed.',
      java: `public boolean canJump(int[] nums) {
    int max=0;
    for(int i=0;i<nums.length;i++){
        if(i>max) return false;
        max=Math.max(max,i+nums[i]);
    }
    return true;
}`,
      cpp: `bool canJump(vector<int>& nums) {
    int mx=0;
    for(int i=0;i<nums.size();i++){if(i>mx)return false;mx=max(mx,i+(int)nums[i]);}
    return true;
}`,
      c: `bool canJump(int* nums, int n) {
    int mx=0;
    for(int i=0;i<n;i++){if(i>mx)return false;if(i+nums[i]>mx)mx=i+nums[i];}
    return true;
}`,
    },
    interviewerTips: ['Elegant greedy — many candidates overthink this with DP.'],
    followUpQuestions: ['Jump Game II: minimum jumps?', 'Jump Game III: can reach index 0?'],
  },

  // ══════════════════ HARD ══════════════════

  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'hard',
    description: 'Given heights of bars, compute total water trapped after raining.',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Goldman Sachs'],
    pattern: 'Two Pointers / DP',
    topic: 'Array',
    frequency: 5,
    algorithmLink: '/algorithm/arrays/slidingWindow',
    complexity: { time: 'O(n)', space: 'O(1)' },
    solution: {
      approach: 'Two pointer: water at i = min(maxLeft, maxRight) - height[i]. Move the smaller side inward.',
      java: `public int trap(int[] height) {
    int l=0, r=height.length-1, ml=0, mr=0, water=0;
    while(l<r){
        if(height[l]<height[r]){
            ml=Math.max(ml,height[l]);
            water+=ml-height[l]; l++;
        } else {
            mr=Math.max(mr,height[r]);
            water+=mr-height[r]; r--;
        }
    }
    return water;
}`,
      cpp: `int trap(vector<int>& h) {
    int l=0,r=h.size()-1,ml=0,mr=0,w=0;
    while(l<r){if(h[l]<h[r]){ml=max(ml,h[l]);w+=ml-h[l];l++;}else{mr=max(mr,h[r]);w+=mr-h[r];r--;}}
    return w;
}`,
      c: `int trap(int* h, int n) {
    int l=0,r=n-1,ml=0,mr=0,w=0;
    while(l<r){if(h[l]<h[r]){if(h[l]>=ml)ml=h[l];else w+=ml-h[l];l++;}else{if(h[r]>=mr)mr=h[r];else w+=mr-h[r];r--;}}
    return w;
}`,
    },
    interviewerTips: [
      'Show DP approach first (O(n) space), then optimise to O(1) two-pointer.',
      'Stack-based O(n) approach also exists.',
    ],
    followUpQuestions: ['Container With Most Water (easier variant)?'],
  },

  {
    id: 'merge-k-sorted-lists',
    title: 'Merge K Sorted Lists',
    difficulty: 'hard',
    description: 'Merge k sorted linked lists into one sorted linked list.',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Uber'],
    pattern: 'Heap / Divide & Conquer',
    topic: 'Linked List',
    frequency: 5,
    algorithmLink: '/algorithm/heaps/mergeKSortedLists',
    complexity: { time: 'O(n log k)', space: 'O(k)' },
    solution: {
      approach: 'Use a min-heap of size k (one entry per list). Always extract smallest, then push next from same list.',
      java: `public ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> pq=new PriorityQueue<>((a,b)->a.val-b.val);
    for(ListNode l:lists) if(l!=null) pq.add(l);
    ListNode dummy=new ListNode(0), cur=dummy;
    while(!pq.isEmpty()){
        cur.next=pq.poll(); cur=cur.next;
        if(cur.next!=null) pq.add(cur.next);
    }
    return dummy.next;
}`,
      cpp: `ListNode* mergeKLists(vector<ListNode*>& lists) {
    auto cmp=[](ListNode* a,ListNode* b){return a->val>b->val;};
    priority_queue<ListNode*,vector<ListNode*>,decltype(cmp)> pq(cmp);
    for(auto l:lists) if(l) pq.push(l);
    ListNode dummy(0),*cur=&dummy;
    while(!pq.empty()){cur->next=pq.top();pq.pop();cur=cur->next;if(cur->next)pq.push(cur->next);}
    return dummy.next;
}`,
      c: '/* See heaps page for C implementation */',
    },
    interviewerTips: [
      'Heap approach: O(n log k). Divide & Conquer: same complexity.',
      'Naive merge all then sort: O(n log n) — acceptable but not optimal.',
    ],
    followUpQuestions: ['Merge k sorted arrays?'],
  },

  {
    id: 'word-ladder',
    title: 'Word Ladder',
    difficulty: 'hard',
    description: 'Find shortest transformation sequence from beginWord to endWord, changing one letter at a time.',
    companies: ['Amazon', 'Google', 'Meta', 'LinkedIn'],
    pattern: 'BFS',
    topic: 'Graph',
    frequency: 4,
    algorithmLink: '/algorithm/graphs/bfs',
    complexity: { time: 'O(M² × N) where M=word length, N=words', space: 'O(M² × N)' },
    solution: {
      approach: 'BFS level by level. For each word, try all single-character changes. If changed word is in word list, enqueue it.',
      java: `public int ladderLength(String begin, String end, List<String> wordList) {
    Set<String> set=new HashSet<>(wordList);
    Queue<String> q=new LinkedList<>(); q.add(begin);
    int steps=1;
    while(!q.isEmpty()){
        int sz=q.size();
        while(sz-->0){
            String word=q.poll();
            if(word.equals(end)) return steps;
            char[] arr=word.toCharArray();
            for(int i=0;i<arr.length;i++){
                char orig=arr[i];
                for(char c='a';c<='z';c++){
                    arr[i]=c; String next=new String(arr);
                    if(set.remove(next)) q.add(next);
                }
                arr[i]=orig;
            }
        }
        steps++;
    }
    return 0;
}`,
      cpp: `int ladderLength(string begin, string end, vector<string>& wl) {
    unordered_set<string> st(wl.begin(),wl.end());
    queue<string> q; q.push(begin); int steps=1;
    while(!q.empty()){int sz=q.size();while(sz--){string w=q.front();q.pop();if(w==end)return steps;for(int i=0;i<w.size();i++){char orig=w[i];for(char c='a';c<='z';c++){w[i]=c;if(st.count(w)){st.erase(w);q.push(w);}}w[i]=orig;}}steps++;}
    return 0;
}`,
      c: '/* See BFS page for C implementation */',
    },
    interviewerTips: [
      'Classic BFS — shortest path in unweighted graph.',
      'Bidirectional BFS halves the search space.',
    ],
    followUpQuestions: ['Find all shortest transformation sequences?'],
  },
]

/* Filter helpers */
export const DIFFICULTIES = ['easy', 'medium', 'hard']
export const TOPICS = [...new Set(interviewQuestions.map(q => q.topic))].sort()
export const PATTERNS = [...new Set(interviewQuestions.map(q => q.pattern))].sort()
export const COMPANIES = [...new Set(interviewQuestions.flatMap(q => q.companies))].sort()

export default interviewQuestions
