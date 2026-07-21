import { pythonSolutions } from './interviewPython'

export const interviewQuestions = [

  // ══════════════════ ARRAY ══════════════════

  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'easy',
    topic: 'Array',
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'],
    pattern: 'Hashing',
    frequency: 5,
    algorithmLink: '/algorithm/hashing/twoSumHash',
    complexity: { time: 'O(n)', space: 'O(n)' },
    answer: 'Approach: Use a hashmap to store each number and its index; for each element check if the complement exists in the map. Key insight: Trading O(n) space eliminates the nested loop. Time: O(n), Space: O(n)',
    approach: 'Scan once, storing each value with its index in a hashmap; for the current number, check whether its complement (target − num) was already seen and return both indices. Key insight: the hashmap makes the complement lookup O(1), replacing the O(n²) double loop.',
    tags: ['array', 'hashmap', 'two-pass'],
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
    id: 'best-time-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'easy',
    topic: 'Array',
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Goldman Sachs'],
    pattern: 'Sliding Window / Kadane',
    frequency: 5,
    algorithmLink: '/algorithm/arrays/maximumSubarray',
    complexity: { time: 'O(n)', space: 'O(1)' },
    answer: 'Approach: Track the minimum price seen so far and update the maximum profit at each step. Key insight: You must buy before selling — scan left to right keeping a running minimum. Time: O(n), Space: O(1)',
    approach: 'Track the minimum price seen so far while scanning left to right, and at each day update the best profit as price − minPrice. Key insight: you must buy before you sell, so a running minimum captures the best earlier buy for every potential sell day.',
    tags: ['array', 'greedy', 'single-pass'],
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
    id: 'contains-duplicate',
    title: 'Contains Duplicate',
    difficulty: 'easy',
    topic: 'Array',
    companies: ['Amazon', 'Google', 'Apple'],
    pattern: 'Hashing',
    frequency: 4,
    algorithmLink: '/algorithm/hashing/hashMapImpl',
    complexity: { time: 'O(n)', space: 'O(n)' },
    answer: 'Approach: Use a HashSet — for each element if it already exists in the set return true, else add it. Key insight: Set.add() returns false on duplicate, giving a one-liner check. Time: O(n), Space: O(n)',
    approach: 'Insert numbers into a hash set one by one; the moment an insert finds a value already present, a duplicate exists. Key insight: set membership is O(1), so a single pass detects duplicates in linear time.',
    tags: ['array', 'hashset'],
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
      c: `bool containsDuplicate(int* nums, int n) {
    for(int i=0;i<n-1;i++) for(int j=0;j<n-i-1;j++)
        if(nums[j]>nums[j+1]){int t=nums[j];nums[j]=nums[j+1];nums[j+1]=t;}
    for(int i=1;i<n;i++) if(nums[i]==nums[i-1]) return true;
    return false;
}`,
    },
    interviewerTips: ['Discuss space vs time tradeoff: HashSet O(n) space, Sort O(1) space.'],
    followUpQuestions: ['Contains duplicate within k distance apart?'],
  },

  {
    id: 'missing-number',
    title: 'Missing Number',
    difficulty: 'easy',
    topic: 'Array',
    companies: ['Amazon', 'Microsoft', 'Google'],
    pattern: 'Bit Manipulation / Math',
    frequency: 4,
    complexity: { time: 'O(n)', space: 'O(1)' },
    answer: 'Approach: XOR all numbers 0..n with all array elements — duplicates cancel leaving the missing number. Key insight: XOR is its own inverse, so xor(0..n) ^ xor(array) = missing. Time: O(n), Space: O(1)',
    approach: 'XOR together all indices 0..n and all array values; identical numbers cancel in pairs and the leftover is the missing one. Key insight: XOR is its own inverse, so every present value vanishes, leaving only the absent index. (Gauss sum n(n+1)/2 − Σ also works.)',
    visualizationLink: null,
    tags: ['array', 'xor', 'math'],
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
    followUpQuestions: ['Find two missing numbers?', 'Find duplicate AND missing number?'],
  },

  {
    id: 'move-zeroes',
    title: 'Move Zeroes',
    difficulty: 'easy',
    topic: 'Array',
    companies: ['Meta', 'Bloomberg', 'Google'],
    pattern: 'Two Pointers',
    frequency: 3,
    complexity: { time: 'O(n)', space: 'O(1)' },
    answer: 'Approach: Use a slow pointer to mark the next position for non-zero elements, fill remaining positions with zeros. Key insight: Overwrite in-place without an extra array — all non-zeros shift left, zeros fill the tail. Time: O(n), Space: O(1)',
    approach: 'Use a write pointer for the next non-zero slot: copy every non-zero element forward in order, then fill the remaining tail with zeros. Key insight: compacting non-zeros in place preserves their relative order while pushing all zeros to the end with no extra space.',
    visualizationLink: null,
    tags: ['array', 'two-pointer', 'in-place'],
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

  {
    id: 'container-most-water',
    title: 'Container With Most Water',
    difficulty: 'medium',
    topic: 'Array',
    companies: ['Google', 'Amazon', 'Meta', 'Bloomberg'],
    pattern: 'Two Pointers',
    frequency: 5,
    complexity: { time: 'O(n)', space: 'O(1)' },
    answer: 'Approach: Place two pointers at each end, compute area, then move the shorter pointer inward. Key insight: Moving the taller pointer can never increase the area — only moving the shorter can. Time: O(n), Space: O(1)',
    approach: 'Place two pointers at both ends, compute the area between them, and always move the shorter wall inward. Key insight: the area is capped by the shorter side, so moving the taller pointer can never increase it — only moving the shorter one can find a taller wall.',
    visualizationLink: null,
    tags: ['array', 'two-pointer', 'greedy'],
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
    interviewerTips: ['Key insight: moving the taller pointer can never increase area.', 'Prove the greedy choice to the interviewer.'],
    followUpQuestions: ['Trapping Rain Water (harder variant)?'],
  },

  {
    id: 'maximum-subarray',
    title: "Maximum Subarray (Kadane's Algorithm)",
    difficulty: 'medium',
    topic: 'Array',
    companies: ['Amazon', 'Microsoft', 'Google', 'Meta', 'LinkedIn'],
    pattern: "Dynamic Programming / Kadane's",
    frequency: 5,
    algorithmLink: '/algorithm/arrays/maximumSubarray',
    complexity: { time: 'O(n)', space: 'O(1)' },
    answer: "Approach: Track current subarray sum — reset to 0 if it goes negative, update global max at each step. Key insight: A negative prefix always hurts; starting fresh gives a better local sum. Time: O(n), Space: O(1)",
    approach: "Kadane's: keep a running sum, reset it to the current element whenever the running sum would go negative, and track the best sum seen. Key insight: a negative running prefix can only drag down a later subarray, so discarding it is always optimal.",
    tags: ['array', 'dp', 'kadane'],
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
    interviewerTips: ["Name the algorithm (Kadane's) — shows knowledge.", 'Handle all-negative: answer is largest single element.'],
    followUpQuestions: ['Return actual subarray indices?', 'Maximum circular subarray sum?', 'Maximum product subarray?'],
  },

  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'hard',
    topic: 'Array',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Goldman Sachs'],
    pattern: 'Two Pointers / DP',
    frequency: 5,
    complexity: { time: 'O(n)', space: 'O(1)' },
    answer: 'Approach: Two pointers from both ends — water at index i equals min(maxLeft, maxRight) minus height[i]; move whichever side is shorter. Key insight: The shorter side is the bottleneck for water level, so process it first. Time: O(n), Space: O(1)',
    approach: 'Two pointers from both ends track the tallest wall seen on each side; at each step process the shorter side, adding its running max minus its own height as trapped water. Key insight: water over a cell is bounded by the smaller of the tallest walls to its left and right, and the shorter side is always the binding constraint.',
    visualizationLink: null,
    tags: ['array', 'two-pointer', 'dp'],
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
    interviewerTips: ['Show DP approach first (O(n) space), then optimise to O(1) two-pointer.', 'Stack-based O(n) approach also exists.'],
    followUpQuestions: ['Container With Most Water (easier variant)?'],
  },

  {
    id: 'three-sum',
    title: '3Sum',
    difficulty: 'medium',
    topic: 'Array',
    companies: ['Amazon', 'Google', 'Adobe', 'Meta'],
    pattern: 'Two Pointers',
    approach: 'Sort the array, fix each element, and two-pointer the remaining range for a pair summing to its negation, skipping duplicates at every level. Key insight: sorting both enables the linear two-pointer inner search and lets you skip equal values to avoid duplicate triplets.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
    code: {
      java: `public List<List<Integer>> threeSum(int[] a) {
    Arrays.sort(a);
    List<List<Integer>> res = new ArrayList<>();
    for (int i = 0; i < a.length - 2; i++) {
        if (i > 0 && a[i] == a[i-1]) continue;
        int lo = i + 1, hi = a.length - 1;
        while (lo < hi) {
            int sum = a[i] + a[lo] + a[hi];
            if (sum == 0) {
                res.add(Arrays.asList(a[i], a[lo], a[hi]));
                while (lo < hi && a[lo] == a[lo+1]) lo++;
                while (lo < hi && a[hi] == a[hi-1]) hi--;
                lo++; hi--;
            } else if (sum < 0) lo++; else hi--;
        }
    }
    return res;
}`,
      c: `int cmp(const void* a, const void* b) { return *(int*)a - *(int*)b; }
int threeSum(int* a, int n, int out[][3]) {
    qsort(a, n, sizeof(int), cmp);
    int cnt = 0;
    for (int i = 0; i < n - 2; i++) {
        if (i > 0 && a[i] == a[i-1]) continue;
        int lo = i + 1, hi = n - 1;
        while (lo < hi) {
            int s = a[i] + a[lo] + a[hi];
            if (s == 0) {
                out[cnt][0]=a[i]; out[cnt][1]=a[lo]; out[cnt][2]=a[hi]; cnt++;
                while (lo < hi && a[lo] == a[lo+1]) lo++;
                while (lo < hi && a[hi] == a[hi-1]) hi--;
                lo++; hi--;
            } else if (s < 0) lo++; else hi--;
        }
    }
    return cnt;
}`,
      cpp: `vector<vector<int>> threeSum(vector<int>& a) {
    sort(a.begin(), a.end());
    vector<vector<int>> res; int n = a.size();
    for (int i = 0; i < n - 2; i++) {
        if (i > 0 && a[i] == a[i-1]) continue;
        int lo = i + 1, hi = n - 1;
        while (lo < hi) {
            int sum = a[i] + a[lo] + a[hi];
            if (sum == 0) {
                res.push_back({a[i], a[lo], a[hi]});
                while (lo < hi && a[lo] == a[lo+1]) lo++;
                while (lo < hi && a[hi] == a[hi-1]) hi--;
                lo++; hi--;
            } else if (sum < 0) lo++; else hi--;
        }
    }
    return res;
}`,
    },
    visualizationLink: null,
    tags: ['array', 'two-pointer', 'sorting'],
  },

  {
    id: 'rotate-array',
    title: 'Rotate Array',
    difficulty: 'medium',
    topic: 'Array',
    companies: ['Microsoft', 'Amazon', 'Adobe'],
    pattern: 'Reversal',
    approach: 'Reverse the whole array, then reverse the first k elements and the remaining n−k separately. Key insight: reversing the entire array puts the last k at the front in reversed order, and two local reversals restore each part\'s original order — a right rotation by k in O(1) space.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public void rotate(int[] a, int k) {
    int n = a.length; k %= n;
    reverse(a, 0, n - 1); reverse(a, 0, k - 1); reverse(a, k, n - 1);
}
void reverse(int[] a, int i, int j) {
    while (i < j) { int t = a[i]; a[i++] = a[j]; a[j--] = t; }
}`,
      c: `void reverse(int* a, int i, int j) {
    while (i < j) { int t = a[i]; a[i++] = a[j]; a[j--] = t; }
}
void rotate(int* a, int n, int k) {
    k %= n;
    reverse(a, 0, n - 1); reverse(a, 0, k - 1); reverse(a, k, n - 1);
}`,
      cpp: `void rotate(vector<int>& a, int k) {
    int n = a.size(); k %= n;
    reverse(a.begin(), a.end());
    reverse(a.begin(), a.begin() + k);
    reverse(a.begin() + k, a.end());
}`,
    },
    visualizationLink: '/algorithm/arrays/rotateArray',
    tags: ['array', 'reversal', 'in-place'],
  },

  {
    id: 'find-duplicate-number',
    title: 'Find the Duplicate Number',
    difficulty: 'medium',
    topic: 'Array',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: "Floyd's Cycle Detection",
    approach: "Treat each value as a pointer to the next index (i → a[i]); the duplicate makes two indices point to the same place, forming a cycle. Use Floyd's tortoise/hare to find the meeting point, then walk from the start to the cycle entrance. Key insight: the cycle's entrance is exactly the repeated value, found in O(1) space without modifying the array.",
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public int findDuplicate(int[] a) {
    int slow = a[0], fast = a[0];
    do { slow = a[slow]; fast = a[a[fast]]; } while (slow != fast);
    slow = a[0];
    while (slow != fast) { slow = a[slow]; fast = a[fast]; }
    return slow;
}`,
      c: `int findDuplicate(int* a, int n) {
    int slow = a[0], fast = a[0];
    do { slow = a[slow]; fast = a[a[fast]]; } while (slow != fast);
    slow = a[0];
    while (slow != fast) { slow = a[slow]; fast = a[fast]; }
    return slow;
}`,
      cpp: `int findDuplicate(vector<int>& a) {
    int slow = a[0], fast = a[0];
    do { slow = a[slow]; fast = a[a[fast]]; } while (slow != fast);
    slow = a[0];
    while (slow != fast) { slow = a[slow]; fast = a[fast]; }
    return slow;
}`,
    },
    visualizationLink: null,
    tags: ['array', 'cycle-detection', 'two-pointer'],
  },

  {
    id: 'sliding-window-maximum',
    title: 'Sliding Window Maximum',
    difficulty: 'hard',
    topic: 'Array',
    companies: ['Google', 'Amazon'],
    pattern: 'Monotonic Deque',
    approach: 'Maintain a deque of indices whose values are strictly decreasing: drop indices that fall out of the window from the front, and pop smaller values from the back before pushing the new index. The front always holds the current window maximum. Key insight: the monotonic deque means each index enters and leaves once, giving O(n) overall.',
    complexity: { time: 'O(n)', space: 'O(k)' },
    code: {
      java: `public int[] maxSlidingWindow(int[] a, int k) {
    int n = a.length; int[] res = new int[n - k + 1];
    Deque<Integer> dq = new ArrayDeque<>();   // indices, values decreasing
    for (int i = 0; i < n; i++) {
        if (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();
        while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast();
        dq.offerLast(i);
        if (i >= k - 1) res[i - k + 1] = a[dq.peekFirst()];
    }
    return res;
}`,
      c: `int* maxSlidingWindow(int* a, int n, int k, int* retSize) {
    int* res = malloc((n - k + 1) * sizeof(int));
    int* dq = malloc(n * sizeof(int)); int head = 0, tail = 0;   // store indices
    for (int i = 0; i < n; i++) {
        if (tail > head && dq[head] <= i - k) head++;
        while (tail > head && a[dq[tail-1]] <= a[i]) tail--;
        dq[tail++] = i;
        if (i >= k - 1) res[i - k + 1] = a[dq[head]];
    }
    *retSize = n - k + 1; free(dq); return res;
}`,
      cpp: `vector<int> maxSlidingWindow(vector<int>& a, int k) {
    int n = a.size(); vector<int> res;
    deque<int> dq;   // indices, values decreasing
    for (int i = 0; i < n; i++) {
        if (!dq.empty() && dq.front() <= i - k) dq.pop_front();
        while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1) res.push_back(a[dq.front()]);
    }
    return res;
}`,
    },
    visualizationLink: '/algorithm/arrays/slidingWindow',
    tags: ['array', 'deque', 'sliding-window', 'monotonic'],
  },

  // ══════════════════ STRING ══════════════════

  {
    id: 'longest-substring-no-repeat',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'medium',
    topic: 'String',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Adobe', 'Apple'],
    pattern: 'Sliding Window',
    frequency: 5,
    algorithmLink: '/algorithm/arrays/slidingWindow',
    complexity: { time: 'O(n)', space: 'O(min(n,m)) where m is charset' },
    answer: 'Approach: Sliding window with an index map — expand right pointer, and when a duplicate is found jump the left pointer past the last occurrence. Key insight: Using an index map (not just a set) avoids re-scanning the left boundary. Time: O(n), Space: O(charset)',
    approach: "Slide a window while keeping a map of each character's most recent index; on a repeat, jump the left edge to just past the previous occurrence. Key insight: storing indices (not merely a seen-set) lets the left boundary leap directly to the conflict instead of crawling, keeping the scan linear.",
    tags: ['string', 'sliding-window', 'hashmap'],
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
    interviewerTips: ['Classic sliding window — know this cold.', 'Using index map avoids re-scanning the left boundary.', 'Clarify: ASCII or Unicode?'],
    followUpQuestions: ['At most k distinct characters?', 'Minimum window containing all characters of pattern?'],
  },

  {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    difficulty: 'easy',
    topic: 'String',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Hashing',
    approach: 'Tally a 26-letter frequency array, incrementing for the first string and decrementing for the second; the strings are anagrams iff every count ends at zero (and the lengths match). Key insight: anagrams have identical letter multisets, so the signed counts must perfectly cancel.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] cnt = new int[26];
    for (int i = 0; i < s.length(); i++) { cnt[s.charAt(i)-'a']++; cnt[t.charAt(i)-'a']--; }
    for (int c : cnt) if (c != 0) return false;
    return true;
}`,
      c: `bool isAnagram(char* s, char* t) {
    int cnt[26] = {0};
    int i = 0;
    for (; s[i] && t[i]; i++) { cnt[s[i]-'a']++; cnt[t[i]-'a']--; }
    if (s[i] || t[i]) return false;
    for (int j = 0; j < 26; j++) if (cnt[j]) return false;
    return true;
}`,
      cpp: `bool isAnagram(string s, string t) {
    if (s.size() != t.size()) return false;
    int cnt[26] = {0};
    for (int i = 0; i < (int)s.size(); i++) { cnt[s[i]-'a']++; cnt[t[i]-'a']--; }
    for (int c : cnt) if (c) return false;
    return true;
}`,
    },
    visualizationLink: '/algorithm/arrays/anagramCheck',
    tags: ['string', 'hashmap', 'frequency'],
  },

  {
    id: 'group-anagrams',
    title: 'Group Anagrams',
    difficulty: 'medium',
    topic: 'String',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Hashing',
    approach: 'Map each word to a canonical key (its letters sorted) and bucket words sharing a key together in a hashmap. Key insight: all anagrams collapse to the same sorted string, so the sorted form is a perfect group identifier.',
    complexity: { time: 'O(n·k log k)', space: 'O(n·k)' },
    code: {
      java: `public List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> map = new HashMap<>();
    for (String s : strs) {
        char[] c = s.toCharArray(); Arrays.sort(c);
        map.computeIfAbsent(new String(c), k -> new ArrayList<>()).add(s);
    }
    return new ArrayList<>(map.values());
}`,
      c: `// No hashmap in C: compute each word's sorted key, then group by matching keys.
int groupAnagrams(char** strs, int n, int groups[][100], int* groupSizes) {
    char keys[1000][101]; int g = 0;
    for (int i = 0; i < n; i++) {
        char key[101]; strcpy(key, strs[i]);
        for (int x = 1; key[x]; x++) { char c = key[x]; int y = x-1; while (y>=0 && key[y]>c){key[y+1]=key[y];y--;} key[y+1]=c; }
        int found = -1;
        for (int j = 0; j < g; j++) if (strcmp(keys[j], key) == 0) { found = j; break; }
        if (found < 0) { found = g; strcpy(keys[g], key); groupSizes[g] = 0; g++; }
        groups[found][groupSizes[found]++] = i;
    }
    return g;
}`,
      cpp: `vector<vector<string>> groupAnagrams(vector<string>& strs) {
    unordered_map<string, vector<string>> map;
    for (auto& s : strs) { string key = s; sort(key.begin(), key.end()); map[key].push_back(s); }
    vector<vector<string>> res;
    for (auto& [k, v] : map) res.push_back(v);
    return res;
}`,
    },
    visualizationLink: null,
    tags: ['string', 'hashmap', 'sorting'],
  },

  // ══════════════════ SORTING ══════════════════

  {
    id: 'sort-colors',
    title: 'Sort Colors (Dutch National Flag)',
    difficulty: 'medium',
    topic: 'Sorting',
    companies: ['Amazon', 'Microsoft', 'Adobe'],
    pattern: 'Three-Way Partition',
    approach: 'Hold three pointers — low, mid, high. Sweep mid: send 0s to the left by swapping with low, leave 1s alone, and send 2s to the right by swapping with high. Key insight: this one-pass three-way partition keeps everything before low as 0 and after high as 2, so the middle settles to 1 with no extra space.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public void sortColors(int[] a) {
    int lo = 0, mid = 0, hi = a.length - 1;
    while (mid <= hi) {
        if (a[mid] == 0) { int t = a[lo]; a[lo++] = a[mid]; a[mid++] = t; }
        else if (a[mid] == 2) { int t = a[hi]; a[hi--] = a[mid]; a[mid] = t; }
        else mid++;
    }
}`,
      c: `void sortColors(int* a, int n) {
    int lo = 0, mid = 0, hi = n - 1, t;
    while (mid <= hi) {
        if (a[mid] == 0) { t = a[lo]; a[lo++] = a[mid]; a[mid++] = t; }
        else if (a[mid] == 2) { t = a[hi]; a[hi--] = a[mid]; a[mid] = t; }
        else mid++;
    }
}`,
      cpp: `void sortColors(vector<int>& a) {
    int lo = 0, mid = 0, hi = a.size() - 1;
    while (mid <= hi) {
        if (a[mid] == 0) swap(a[lo++], a[mid++]);
        else if (a[mid] == 2) swap(a[mid], a[hi--]);
        else mid++;
    }
}`,
    },
    visualizationLink: '/algorithm/arrays/dutchFlag',
    tags: ['sorting', 'two-pointer', 'partition'],
  },

  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'medium',
    topic: 'Sorting',
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    pattern: 'Sorting + Greedy',
    approach: 'Sort the intervals by start, then walk them: if the current interval starts within the last kept interval, extend that one\'s end; otherwise append it as a new interval. Key insight: sorting by start makes every overlap adjacent, so a single linear scan merges them all.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    code: {
      java: `public int[][] merge(int[][] iv) {
    Arrays.sort(iv, (a, b) -> a[0] - b[0]);
    List<int[]> res = new ArrayList<>();
    for (int[] cur : iv) {
        if (!res.isEmpty() && cur[0] <= res.get(res.size()-1)[1])
            res.get(res.size()-1)[1] = Math.max(res.get(res.size()-1)[1], cur[1]);
        else res.add(cur);
    }
    return res.toArray(new int[0][]);
}`,
      c: `int cmpIv(const void* a, const void* b) { return (*(const int(*)[2])a)[0] - (*(const int(*)[2])b)[0]; }
int merge(int iv[][2], int n, int out[][2]) {
    qsort(iv, n, sizeof(iv[0]), cmpIv);
    int k = 0;
    for (int i = 0; i < n; i++) {
        if (k > 0 && iv[i][0] <= out[k-1][1]) {
            if (iv[i][1] > out[k-1][1]) out[k-1][1] = iv[i][1];
        } else { out[k][0] = iv[i][0]; out[k][1] = iv[i][1]; k++; }
    }
    return k;
}`,
      cpp: `vector<vector<int>> merge(vector<vector<int>>& iv) {
    sort(iv.begin(), iv.end());
    vector<vector<int>> res;
    for (auto& cur : iv) {
        if (!res.empty() && cur[0] <= res.back()[1]) res.back()[1] = max(res.back()[1], cur[1]);
        else res.push_back(cur);
    }
    return res;
}`,
    },
    visualizationLink: '/algorithm/arrays/mergeIntervals',
    tags: ['sorting', 'greedy', 'intervals'],
  },

  {
    id: 'meeting-rooms-ii',
    title: 'Meeting Rooms II',
    difficulty: 'medium',
    topic: 'Sorting',
    companies: ['Google', 'Amazon', 'Meta'],
    pattern: 'Sweep Line',
    approach: 'Sort start times and end times into separate arrays, then sweep starts while advancing an end pointer: free a room whenever a meeting has ended before the next one begins, and take a room for each start, tracking the peak. Key insight: the answer is the maximum number of meetings overlapping at any instant.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    code: {
      java: `public int minMeetingRooms(int[][] iv) {
    int n = iv.length, rooms = 0, max = 0, e = 0;
    int[] starts = new int[n], ends = new int[n];
    for (int i = 0; i < n; i++) { starts[i] = iv[i][0]; ends[i] = iv[i][1]; }
    Arrays.sort(starts); Arrays.sort(ends);
    for (int s = 0; s < n; s++) {
        while (e < n && ends[e] <= starts[s]) { rooms--; e++; }
        rooms++; max = Math.max(max, rooms);
    }
    return max;
}`,
      c: `int cmpInt(const void* a, const void* b) { return *(int*)a - *(int*)b; }
int minMeetingRooms(int iv[][2], int n) {
    int* starts = malloc(n*sizeof(int)); int* ends = malloc(n*sizeof(int));
    for (int i = 0; i < n; i++) { starts[i] = iv[i][0]; ends[i] = iv[i][1]; }
    qsort(starts, n, sizeof(int), cmpInt); qsort(ends, n, sizeof(int), cmpInt);
    int rooms = 0, max = 0, e = 0;
    for (int s = 0; s < n; s++) {
        while (e < n && ends[e] <= starts[s]) { rooms--; e++; }
        if (++rooms > max) max = rooms;
    }
    free(starts); free(ends); return max;
}`,
      cpp: `int minMeetingRooms(vector<vector<int>>& iv) {
    int n = iv.size(), rooms = 0, mx = 0, e = 0;
    vector<int> starts(n), ends(n);
    for (int i = 0; i < n; i++) { starts[i] = iv[i][0]; ends[i] = iv[i][1]; }
    sort(starts.begin(), starts.end()); sort(ends.begin(), ends.end());
    for (int s = 0; s < n; s++) {
        while (e < n && ends[e] <= starts[s]) { rooms--; e++; }
        mx = max(mx, ++rooms);
    }
    return mx;
}`,
    },
    visualizationLink: null,
    tags: ['sorting', 'sweep-line', 'intervals'],
  },

  {
    id: 'kth-largest-sort',
    title: 'Kth Largest Element in an Array',
    difficulty: 'medium',
    topic: 'Sorting',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'QuickSelect',
    approach: 'Run QuickSelect: partition around a pivot and recurse only into the side containing index n−k (the kth largest in sorted order). Key insight: discarding the half that cannot hold the answer gives O(n) average time, unlike a full O(n log n) sort.',
    complexity: { time: 'O(n) avg, O(n²) worst', space: 'O(1)' },
    code: {
      java: `public int findKthLargest(int[] a, int k) {
    int target = a.length - k, lo = 0, hi = a.length - 1;
    while (lo <= hi) {
        int p = partition(a, lo, hi);
        if (p == target) return a[p];
        if (p < target) lo = p + 1; else hi = p - 1;
    }
    return -1;
}
int partition(int[] a, int lo, int hi) {
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; j++) if (a[j] < pivot) { int t=a[i]; a[i]=a[j]; a[j]=t; i++; }
    int t=a[i]; a[i]=a[hi]; a[hi]=t;
    return i;
}`,
      c: `int partition(int* a, int lo, int hi) {
    int pivot = a[hi], i = lo, t;
    for (int j = lo; j < hi; j++) if (a[j] < pivot) { t=a[i]; a[i]=a[j]; a[j]=t; i++; }
    t=a[i]; a[i]=a[hi]; a[hi]=t;
    return i;
}
int findKthLargest(int* a, int n, int k) {
    int target = n - k, lo = 0, hi = n - 1;
    while (lo <= hi) {
        int p = partition(a, lo, hi);
        if (p == target) return a[p];
        if (p < target) lo = p + 1; else hi = p - 1;
    }
    return -1;
}`,
      cpp: `int partition(vector<int>& a, int lo, int hi) {
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; j++) if (a[j] < pivot) swap(a[i++], a[j]);
    swap(a[i], a[hi]);
    return i;
}
int findKthLargest(vector<int>& a, int k) {
    int target = a.size() - k, lo = 0, hi = a.size() - 1;
    while (lo <= hi) {
        int p = partition(a, lo, hi);
        if (p == target) return a[p];
        if (p < target) lo = p + 1; else hi = p - 1;
    }
    return -1;
}`,
    },
    visualizationLink: null,
    tags: ['sorting', 'quickselect', 'partition'],
  },

  {
    id: 'sort-by-parity',
    title: 'Sort Array By Parity',
    difficulty: 'easy',
    topic: 'Sorting',
    companies: ['Amazon', 'Google'],
    pattern: 'Two Pointers',
    approach: 'Place two pointers at the ends: skip evens on the left and odds on the right, and when both are misplaced (odd on the left, even on the right) swap them. Key insight: each swap fixes two elements at once, partitioning evens before odds in a single in-place pass.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public int[] sortArrayByParity(int[] a) {
    int i = 0, j = a.length - 1;
    while (i < j) {
        if (a[i] % 2 == 0) i++;
        else if (a[j] % 2 == 1) j--;
        else { int t = a[i]; a[i] = a[j]; a[j] = t; i++; j--; }
    }
    return a;
}`,
      c: `void sortArrayByParity(int* a, int n) {
    int i = 0, j = n - 1, t;
    while (i < j) {
        if (a[i] % 2 == 0) i++;
        else if (a[j] % 2 == 1) j--;
        else { t = a[i]; a[i] = a[j]; a[j] = t; i++; j--; }
    }
}`,
      cpp: `vector<int> sortArrayByParity(vector<int>& a) {
    int i = 0, j = a.size() - 1;
    while (i < j) {
        if (a[i] % 2 == 0) i++;
        else if (a[j] % 2 == 1) j--;
        else swap(a[i++], a[j--]);
    }
    return a;
}`,
    },
    visualizationLink: null,
    tags: ['sorting', 'two-pointer', 'partition'],
  },

  {
    id: 'wiggle-sort',
    title: 'Wiggle Sort',
    difficulty: 'medium',
    topic: 'Sorting',
    companies: ['Google', 'Amazon'],
    pattern: 'Greedy',
    approach: 'Sweep once and fix each adjacent pair locally: at even index i ensure a[i] <= a[i+1], at odd index i ensure a[i] >= a[i+1], swapping when the rule is violated. Key insight: a swap that fixes the current pair never breaks the already-satisfied previous pair, so one greedy pass produces the zig-zag.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public void wiggleSort(int[] a) {
    for (int i = 0; i + 1 < a.length; i++) {
        if (((i % 2 == 0) && a[i] > a[i+1]) || ((i % 2 == 1) && a[i] < a[i+1])) {
            int t = a[i]; a[i] = a[i+1]; a[i+1] = t;
        }
    }
}`,
      c: `void wiggleSort(int* a, int n) {
    for (int i = 0; i + 1 < n; i++) {
        if (((i % 2 == 0) && a[i] > a[i+1]) || ((i % 2 == 1) && a[i] < a[i+1])) {
            int t = a[i]; a[i] = a[i+1]; a[i+1] = t;
        }
    }
}`,
      cpp: `void wiggleSort(vector<int>& a) {
    for (int i = 0; i + 1 < (int)a.size(); i++)
        if (((i % 2 == 0) && a[i] > a[i+1]) || ((i % 2 == 1) && a[i] < a[i+1]))
            swap(a[i], a[i+1]);
}`,
    },
    visualizationLink: null,
    tags: ['sorting', 'greedy', 'one-pass'],
  },

  {
    id: 'count-inversions',
    title: 'Count Inversions',
    difficulty: 'hard',
    topic: 'Sorting',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Merge Sort',
    approach: 'Run a modified merge sort: while merging two sorted halves, each time you pick an element from the right half it is smaller than all the remaining left-half elements, so add their count as inversions. Key insight: tallying inversions during the merge yields the total in O(n log n) instead of the O(n²) brute force.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    code: {
      java: `public long countInversions(int[] a) { return sort(a, 0, a.length - 1, new int[a.length]); }
long sort(int[] a, int lo, int hi, int[] tmp) {
    if (lo >= hi) return 0;
    int mid = (lo + hi) / 2;
    long cnt = sort(a, lo, mid, tmp) + sort(a, mid + 1, hi, tmp);
    int i = lo, j = mid + 1, k = lo;
    while (i <= mid && j <= hi) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];
        else { tmp[k++] = a[j++]; cnt += mid - i + 1; }
    }
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= hi) tmp[k++] = a[j++];
    for (int x = lo; x <= hi; x++) a[x] = tmp[x];
    return cnt;
}`,
      c: `long sortC(int* a, int lo, int hi, int* tmp) {
    if (lo >= hi) return 0;
    int mid = (lo + hi) / 2;
    long cnt = sortC(a, lo, mid, tmp) + sortC(a, mid + 1, hi, tmp);
    int i = lo, j = mid + 1, k = lo;
    while (i <= mid && j <= hi) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];
        else { tmp[k++] = a[j++]; cnt += mid - i + 1; }
    }
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= hi) tmp[k++] = a[j++];
    for (int x = lo; x <= hi; x++) a[x] = tmp[x];
    return cnt;
}
long countInversions(int* a, int n) { int* tmp = malloc(n*sizeof(int)); long r = sortC(a, 0, n-1, tmp); free(tmp); return r; }`,
      cpp: `long sortM(vector<int>& a, int lo, int hi, vector<int>& tmp) {
    if (lo >= hi) return 0;
    int mid = (lo + hi) / 2;
    long cnt = sortM(a, lo, mid, tmp) + sortM(a, mid + 1, hi, tmp);
    int i = lo, j = mid + 1, k = lo;
    while (i <= mid && j <= hi) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];
        else { tmp[k++] = a[j++]; cnt += mid - i + 1; }
    }
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= hi) tmp[k++] = a[j++];
    for (int x = lo; x <= hi; x++) a[x] = tmp[x];
    return cnt;
}
long countInversions(vector<int>& a) { vector<int> tmp(a.size()); return sortM(a, 0, a.size()-1, tmp); }`,
    },
    visualizationLink: null,
    tags: ['sorting', 'merge-sort', 'divide-conquer'],
  },

  {
    id: 'pancake-sorting',
    title: 'Pancake Sorting',
    difficulty: 'medium',
    topic: 'Sorting',
    companies: ['Google'],
    pattern: 'Selection Sort Variant',
    approach: 'For each target size from n down to 2, find the maximum of the unsorted prefix, flip it to the front, then flip the whole prefix so it lands at the end of the unsorted region. Key insight: two prefix-reversals place each maximum in its final position — selection sort done with flips.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
    code: {
      java: `public List<Integer> pancakeSort(int[] a) {
    List<Integer> res = new ArrayList<>();
    for (int size = a.length; size > 1; size--) {
        int mi = 0;
        for (int i = 1; i < size; i++) if (a[i] > a[mi]) mi = i;
        if (mi == size - 1) continue;
        flip(a, mi); res.add(mi + 1);
        flip(a, size - 1); res.add(size);
    }
    return res;
}
void flip(int[] a, int k) {
    for (int i = 0, j = k; i < j; i++, j--) { int t = a[i]; a[i] = a[j]; a[j] = t; }
}`,
      c: `void flip(int* a, int k) {
    for (int i = 0, j = k; i < j; i++, j--) { int t = a[i]; a[i] = a[j]; a[j] = t; }
}
void pancakeSort(int* a, int n) {
    for (int size = n; size > 1; size--) {
        int mi = 0;
        for (int i = 1; i < size; i++) if (a[i] > a[mi]) mi = i;
        if (mi == size - 1) continue;
        flip(a, mi); flip(a, size - 1);
    }
}`,
      cpp: `void flip(vector<int>& a, int k) { reverse(a.begin(), a.begin() + k + 1); }
vector<int> pancakeSort(vector<int>& a) {
    vector<int> res;
    for (int size = a.size(); size > 1; size--) {
        int mi = max_element(a.begin(), a.begin() + size) - a.begin();
        if (mi == size - 1) continue;
        flip(a, mi); res.push_back(mi + 1);
        flip(a, size - 1); res.push_back(size);
    }
    return res;
}`,
    },
    visualizationLink: null,
    tags: ['sorting', 'simulation', 'reversal'],
  },

  // ══════════════════ SEARCHING ══════════════════

  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'easy',
    topic: 'Searching',
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    pattern: 'Binary Search',
    approach: 'Keep a [lo, hi] window and compare the middle element to the target, discarding the half that cannot contain it each step. Key insight: on sorted data, halving the search space every iteration gives logarithmic time.',
    complexity: { time: 'O(log n)', space: 'O(1)' },
    code: {
      java: `public int search(int[] a, int target) {
    int lo = 0, hi = a.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
}`,
      c: `int search(int* a, int n, int target) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
}`,
      cpp: `int search(vector<int>& a, int target) {
    int lo = 0, hi = a.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
}`,
    },
    visualizationLink: '/algorithm/searching/binarySearch',
    tags: ['searching', 'binary-search', 'divide-conquer'],
  },

  {
    id: 'search-rotated-array',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'medium',
    topic: 'Searching',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Modified Binary Search',
    approach: 'Binary search, but at each step decide which half is sorted by comparing a[lo] to a[mid]; if the target lies within that sorted half search there, otherwise search the other half. Key insight: after a rotation at least one side of mid is always sorted, which tells you where the target can be.',
    complexity: { time: 'O(log n)', space: 'O(1)' },
    code: {
      java: `public int search(int[] a, int target) {
    int lo = 0, hi = a.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) return mid;
        if (a[lo] <= a[mid]) {
            if (a[lo] <= target && target < a[mid]) hi = mid - 1; else lo = mid + 1;
        } else {
            if (a[mid] < target && target <= a[hi]) lo = mid + 1; else hi = mid - 1;
        }
    }
    return -1;
}`,
      c: `int search(int* a, int n, int target) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) return mid;
        if (a[lo] <= a[mid]) {
            if (a[lo] <= target && target < a[mid]) hi = mid - 1; else lo = mid + 1;
        } else {
            if (a[mid] < target && target <= a[hi]) lo = mid + 1; else hi = mid - 1;
        }
    }
    return -1;
}`,
      cpp: `int search(vector<int>& a, int target) {
    int lo = 0, hi = a.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) return mid;
        if (a[lo] <= a[mid]) {
            if (a[lo] <= target && target < a[mid]) hi = mid - 1; else lo = mid + 1;
        } else {
            if (a[mid] < target && target <= a[hi]) lo = mid + 1; else hi = mid - 1;
        }
    }
    return -1;
}`,
    },
    visualizationLink: null,
    tags: ['searching', 'binary-search', 'rotated'],
  },

  {
    id: 'find-min-rotated',
    title: 'Find Minimum in Rotated Sorted Array',
    difficulty: 'medium',
    topic: 'Searching',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Binary Search',
    approach: 'Binary search comparing a[mid] to a[hi]: if a[mid] > a[hi] the rotation point (and minimum) is to the right, so move lo past mid; otherwise the minimum is at mid or to its left. Key insight: the minimum is the only element smaller than its predecessor, and a[mid] vs a[hi] reveals which side holds it.',
    complexity: { time: 'O(log n)', space: 'O(1)' },
    code: {
      java: `public int findMin(int[] a) {
    int lo = 0, hi = a.length - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] > a[hi]) lo = mid + 1; else hi = mid;
    }
    return a[lo];
}`,
      c: `int findMin(int* a, int n) {
    int lo = 0, hi = n - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] > a[hi]) lo = mid + 1; else hi = mid;
    }
    return a[lo];
}`,
      cpp: `int findMin(vector<int>& a) {
    int lo = 0, hi = a.size() - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] > a[hi]) lo = mid + 1; else hi = mid;
    }
    return a[lo];
}`,
    },
    visualizationLink: null,
    tags: ['searching', 'binary-search', 'rotated'],
  },

  {
    id: 'search-2d-matrix',
    title: 'Search a 2D Matrix',
    difficulty: 'medium',
    topic: 'Searching',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Binary Search',
    approach: 'Treat the row-sorted, row-wrapping matrix as one virtual sorted array of length m·n and binary search it, mapping a flat index back with row = idx / n and col = idx % n. Key insight: row-major order makes the whole matrix a single contiguous ascending sequence.',
    complexity: { time: 'O(log(m·n))', space: 'O(1)' },
    code: {
      java: `public boolean searchMatrix(int[][] mat, int target) {
    int m = mat.length, n = mat[0].length, lo = 0, hi = m * n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2, v = mat[mid / n][mid % n];
        if (v == target) return true;
        if (v < target) lo = mid + 1; else hi = mid - 1;
    }
    return false;
}`,
      c: `bool searchMatrix(int** mat, int m, int n, int target) {
    int lo = 0, hi = m * n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2, v = mat[mid / n][mid % n];
        if (v == target) return true;
        if (v < target) lo = mid + 1; else hi = mid - 1;
    }
    return false;
}`,
      cpp: `bool searchMatrix(vector<vector<int>>& mat, int target) {
    int m = mat.size(), n = mat[0].size(), lo = 0, hi = m * n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2, v = mat[mid / n][mid % n];
        if (v == target) return true;
        if (v < target) lo = mid + 1; else hi = mid - 1;
    }
    return false;
}`,
    },
    visualizationLink: null,
    tags: ['searching', 'binary-search', 'matrix'],
  },

  {
    id: 'peak-element',
    title: 'Find Peak Element',
    difficulty: 'medium',
    topic: 'Searching',
    companies: ['Google', 'Amazon', 'Adobe'],
    pattern: 'Binary Search',
    approach: 'Binary search on the slope: if a[mid] < a[mid+1] you are on an uphill, so a peak lies to the right (move lo); otherwise a peak is at mid or to its left. Key insight: always walking toward the higher neighbor must terminate at a peak, even with the virtual −∞ boundaries.',
    complexity: { time: 'O(log n)', space: 'O(1)' },
    code: {
      java: `public int findPeakElement(int[] a) {
    int lo = 0, hi = a.length - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < a[mid + 1]) lo = mid + 1; else hi = mid;
    }
    return lo;
}`,
      c: `int findPeakElement(int* a, int n) {
    int lo = 0, hi = n - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < a[mid + 1]) lo = mid + 1; else hi = mid;
    }
    return lo;
}`,
      cpp: `int findPeakElement(vector<int>& a) {
    int lo = 0, hi = a.size() - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < a[mid + 1]) lo = mid + 1; else hi = mid;
    }
    return lo;
}`,
    },
    visualizationLink: null,
    tags: ['searching', 'binary-search', 'peak'],
  },

  {
    id: 'first-last-position',
    title: 'First and Last Position of Element in Sorted Array',
    difficulty: 'medium',
    topic: 'Searching',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Binary Search',
    approach: 'Run two binary searches for the target: one that keeps moving left after a match to find the first index, and one that keeps moving right to find the last. Key insight: biasing the search direction on equality turns plain binary search into a boundary finder, replacing an O(n) scan with two O(log n) passes.',
    complexity: { time: 'O(log n)', space: 'O(1)' },
    code: {
      java: `public int[] searchRange(int[] a, int target) {
    return new int[]{ bound(a, target, true), bound(a, target, false) };
}
int bound(int[] a, int target, boolean firstPos) {
    int lo = 0, hi = a.length - 1, res = -1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) { res = mid; if (firstPos) hi = mid - 1; else lo = mid + 1; }
        else if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return res;
}`,
      c: `int bound(int* a, int n, int target, int firstPos) {
    int lo = 0, hi = n - 1, res = -1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) { res = mid; if (firstPos) hi = mid - 1; else lo = mid + 1; }
        else if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return res;
}
void searchRange(int* a, int n, int target, int* out) {
    out[0] = bound(a, n, target, 1); out[1] = bound(a, n, target, 0);
}`,
      cpp: `int bound(vector<int>& a, int target, bool firstPos) {
    int lo = 0, hi = a.size() - 1, res = -1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) { res = mid; if (firstPos) hi = mid - 1; else lo = mid + 1; }
        else if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return res;
}
vector<int> searchRange(vector<int>& a, int target) {
    return { bound(a, target, true), bound(a, target, false) };
}`,
    },
    visualizationLink: null,
    tags: ['searching', 'binary-search', 'bounds'],
  },

  // ══════════════════ LINKED LIST ══════════════════

  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'easy',
    topic: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Apple', 'Adobe', 'Google'],
    pattern: 'Linked List',
    frequency: 5,
    algorithmLink: '/algorithm/linked-lists/reverseLinkedList',
    complexity: { time: 'O(n)', space: 'O(1) iterative, O(n) recursive' },
    answer: 'Approach: Iterative three-pointer approach — maintain prev, curr, next; at each step reverse the link and advance all three pointers. Key insight: Save next before overwriting curr.next to avoid losing the rest of the list. Time: O(n), Space: O(1)',
    approach: "Walk the list with three pointers — previous, current, and next — flipping each node's next to point backward before advancing. Key insight: caching next before overwriting current.next is what keeps you from losing the rest of the list.",
    tags: ['linked-list', 'iterative', 'pointer'],
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
    interviewerTips: ['Know BOTH iterative (O(1) space) and recursive (O(n) stack) solutions.', 'Draw a diagram before coding.'],
    followUpQuestions: ['Reverse in groups of k?', 'Reverse only from position m to n?', 'Check if linked list is a palindrome?'],
  },

  {
    id: 'detect-cycle',
    title: 'Linked List Cycle Detection',
    difficulty: 'easy',
    topic: 'Linked List',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: "Floyd's Cycle Detection",
    approach: "Walk two pointers: slow moves one node per step, fast moves two. If fast reaches null the list is acyclic; if the pointers ever meet, a cycle exists. Key insight: inside a loop the fast pointer gains one step on slow every iteration, so a collision is guaranteed.",
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}`,
      c: `bool hasCycle(struct ListNode* head) {
    struct ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
      cpp: `bool hasCycle(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
    },
    visualizationLink: '/algorithm/linked-lists/detectCycle',
    tags: ['linked-list', 'two-pointer', 'cycle'],
  },

  {
    id: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    difficulty: 'easy',
    topic: 'Linked List',
    companies: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
    pattern: 'Linked List',
    approach: 'Keep a dummy head and a tail pointer; repeatedly attach the smaller of the two current nodes and advance that list, then append whatever remains once one list is exhausted. Key insight: the dummy node removes any special-casing for the first element.',
    complexity: { time: 'O(m + n)', space: 'O(1)' },
    code: {
      java: `public ListNode mergeTwoLists(ListNode a, ListNode b) {
    ListNode dummy = new ListNode(0), cur = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) { cur.next = a; a = a.next; }
        else { cur.next = b; b = b.next; }
        cur = cur.next;
    }
    cur.next = (a != null) ? a : b;
    return dummy.next;
}`,
      c: `struct ListNode* mergeTwoLists(struct ListNode* a, struct ListNode* b) {
    struct ListNode dummy, *cur = &dummy;
    while (a && b) {
        if (a->val <= b->val) { cur->next = a; a = a->next; }
        else { cur->next = b; b = b->next; }
        cur = cur->next;
    }
    cur->next = a ? a : b;
    return dummy.next;
}`,
      cpp: `ListNode* mergeTwoLists(ListNode* a, ListNode* b) {
    ListNode dummy(0), *cur = &dummy;
    while (a && b) {
        if (a->val <= b->val) { cur->next = a; a = a->next; }
        else { cur->next = b; b = b->next; }
        cur = cur->next;
    }
    cur->next = a ? a : b;
    return dummy.next;
}`,
    },
    visualizationLink: '/algorithm/linked-lists/mergeSortedLists',
    tags: ['linked-list', 'merge', 'dummy-head'],
  },

  {
    id: 'reorder-list',
    title: 'Reorder List',
    difficulty: 'medium',
    topic: 'Linked List',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Linked List',
    approach: 'Find the middle with slow/fast pointers, reverse the second half in place, then weave the two halves together one node at a time. Key insight: splitting the problem into find-middle, reverse, and merge keeps each step simple and O(1) in space.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public void reorderList(ListNode head) {
    if (head == null || head.next == null) return;
    ListNode slow = head, fast = head;
    while (fast.next != null && fast.next.next != null) { slow = slow.next; fast = fast.next.next; }
    ListNode prev = null, cur = slow.next; slow.next = null;
    while (cur != null) { ListNode nx = cur.next; cur.next = prev; prev = cur; cur = nx; }
    ListNode first = head, second = prev;
    while (second != null) {
        ListNode n1 = first.next, n2 = second.next;
        first.next = second; second.next = n1;
        first = n1; second = n2;
    }
}`,
      c: `void reorderList(struct ListNode* head) {
    if (!head || !head->next) return;
    struct ListNode *slow = head, *fast = head;
    while (fast->next && fast->next->next) { slow = slow->next; fast = fast->next->next; }
    struct ListNode *prev = NULL, *cur = slow->next; slow->next = NULL;
    while (cur) { struct ListNode* nx = cur->next; cur->next = prev; prev = cur; cur = nx; }
    struct ListNode *first = head, *second = prev;
    while (second) {
        struct ListNode *n1 = first->next, *n2 = second->next;
        first->next = second; second->next = n1;
        first = n1; second = n2;
    }
}`,
      cpp: `void reorderList(ListNode* head) {
    if (!head || !head->next) return;
    ListNode *slow = head, *fast = head;
    while (fast->next && fast->next->next) { slow = slow->next; fast = fast->next->next; }
    ListNode *prev = nullptr, *cur = slow->next; slow->next = nullptr;
    while (cur) { ListNode* nx = cur->next; cur->next = prev; prev = cur; cur = nx; }
    ListNode *first = head, *second = prev;
    while (second) {
        ListNode *n1 = first->next, *n2 = second->next;
        first->next = second; second->next = n1;
        first = n1; second = n2;
    }
}`,
    },
    visualizationLink: null,
    tags: ['linked-list', 'reversal', 'two-pointer'],
  },

  {
    id: 'remove-nth-node',
    title: 'Remove N-th Node From End of List',
    difficulty: 'medium',
    topic: 'Linked List',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Two Pointers',
    approach: 'Advance a fast pointer n nodes ahead of a slow pointer (started at a dummy head), then move both until fast hits the end — slow now sits just before the target, which you unlink. Key insight: a fixed gap of n between the pointers locates the node in a single pass.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0); dummy.next = head;
    ListNode fast = dummy, slow = dummy;
    for (int i = 0; i < n; i++) fast = fast.next;
    while (fast.next != null) { fast = fast.next; slow = slow.next; }
    slow.next = slow.next.next;
    return dummy.next;
}`,
      c: `struct ListNode* removeNthFromEnd(struct ListNode* head, int n) {
    struct ListNode dummy; dummy.next = head;
    struct ListNode *fast = &dummy, *slow = &dummy;
    for (int i = 0; i < n; i++) fast = fast->next;
    while (fast->next) { fast = fast->next; slow = slow->next; }
    slow->next = slow->next->next;
    return dummy.next;
}`,
      cpp: `ListNode* removeNthFromEnd(ListNode* head, int n) {
    ListNode dummy(0); dummy.next = head;
    ListNode *fast = &dummy, *slow = &dummy;
    for (int i = 0; i < n; i++) fast = fast->next;
    while (fast->next) { fast = fast->next; slow = slow->next; }
    slow->next = slow->next->next;
    return dummy.next;
}`,
    },
    visualizationLink: '/algorithm/linked-lists/removeNthNode',
    tags: ['linked-list', 'two-pointer', 'gap'],
  },

  {
    id: 'copy-random-pointer',
    title: 'Copy List with Random Pointer',
    difficulty: 'medium',
    topic: 'Linked List',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'HashMap',
    approach: 'First pass: create each clone and map original→clone in a hash table. Second pass: wire every clone\'s next and random by looking up the originals\' pointers in the map. Key insight: the map lets you resolve arbitrary random pointers without knowing positions.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    code: {
      java: `public Node copyRandomList(Node head) {
    Map<Node, Node> map = new HashMap<>();
    for (Node c = head; c != null; c = c.next) map.put(c, new Node(c.val));
    for (Node c = head; c != null; c = c.next) {
        map.get(c).next = map.get(c.next);
        map.get(c).random = map.get(c.random);
    }
    return map.get(head);
}`,
      c: `// Interleave clones with originals, then split — O(1) extra space
struct Node* copyRandomList(struct Node* head) {
    if (!head) return NULL;
    for (struct Node* c = head; c; c = c->next->next) {
        struct Node* cp = malloc(sizeof(struct Node));
        cp->val = c->val; cp->next = c->next; c->next = cp;
    }
    for (struct Node* c = head; c; c = c->next->next)
        c->next->random = c->random ? c->random->next : NULL;
    struct Node* res = head->next;
    for (struct Node* c = head; c; c = c->next) {
        struct Node* cp = c->next; c->next = cp->next;
        if (cp->next) cp->next = cp->next->next;
    }
    return res;
}`,
      cpp: `Node* copyRandomList(Node* head) {
    unordered_map<Node*, Node*> map;
    for (Node* c = head; c; c = c->next) map[c] = new Node(c->val);
    for (Node* c = head; c; c = c->next) {
        map[c]->next = map[c->next];
        map[c]->random = map[c->random];
    }
    return map[head];
}`,
    },
    visualizationLink: null,
    tags: ['linked-list', 'hashmap', 'deep-copy'],
  },

  {
    id: 'flatten-multilevel-list',
    title: 'Flatten a Multilevel Doubly Linked List',
    difficulty: 'medium',
    topic: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Adobe'],
    pattern: 'DFS / Stack',
    approach: 'Walk the list; whenever a node has a child, splice that child list in between the node and its next (fixing prev pointers), null the child pointer, and continue from the spliced-in head. Key insight: inserting the child sublist in place with pointer surgery avoids any recursion or stack.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public Node flatten(Node head) {
    for (Node cur = head; cur != null; cur = cur.next) {
        if (cur.child != null) {
            Node next = cur.next, child = cur.child;
            cur.child = null; cur.next = child; child.prev = cur;
            Node tail = child;
            while (tail.next != null) tail = tail.next;
            tail.next = next;
            if (next != null) next.prev = tail;
        }
    }
    return head;
}`,
      c: `struct Node* flatten(struct Node* head) {
    for (struct Node* cur = head; cur; cur = cur->next) {
        if (cur->child) {
            struct Node *next = cur->next, *child = cur->child;
            cur->child = NULL; cur->next = child; child->prev = cur;
            struct Node* tail = child;
            while (tail->next) tail = tail->next;
            tail->next = next;
            if (next) next->prev = tail;
        }
    }
    return head;
}`,
      cpp: `Node* flatten(Node* head) {
    for (Node* cur = head; cur; cur = cur->next) {
        if (cur->child) {
            Node *next = cur->next, *child = cur->child;
            cur->child = nullptr; cur->next = child; child->prev = cur;
            Node* tail = child;
            while (tail->next) tail = tail->next;
            tail->next = next;
            if (next) next->prev = tail;
        }
    }
    return head;
}`,
    },
    visualizationLink: '/algorithm/linked-lists/flattenLinkedList',
    tags: ['linked-list', 'dfs', 'in-place'],
  },

  {
    id: 'merge-k-sorted-lists',
    title: 'Merge K Sorted Lists',
    difficulty: 'hard',
    topic: 'Heap',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Uber'],
    pattern: 'Heap / Divide & Conquer',
    frequency: 5,
    algorithmLink: '/algorithm/heaps/mergeKSortedLists',
    complexity: { time: 'O(n log k)', space: 'O(k)' },
    answer: 'Approach: Use a min-heap seeded with the head of each list — repeatedly extract the minimum, attach it to the result, and push the next node from its list. Key insight: The heap always holds exactly one candidate from each list, keeping comparisons to O(log k). Time: O(n log k), Space: O(k)',
    approach: 'Seed a min-heap with the head node of every list, then repeatedly pop the smallest node, append it to the result, and push that node\'s successor. Key insight: the heap holds at most one candidate per list (k items), so each of the n nodes is placed with an O(log k) heap operation.',
    tags: ['heap', 'merge', 'priority-queue'],
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
    interviewerTips: ['Heap approach: O(n log k). Divide & Conquer: same complexity.'],
    followUpQuestions: ['Merge k sorted arrays?'],
  },

  // ══════════════════ STACK ══════════════════

  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    topic: 'Stack',
    companies: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
    pattern: 'Stack',
    frequency: 5,
    algorithmLink: '/algorithm/stacks-queues/validParenthesesStack',
    complexity: { time: 'O(n)', space: 'O(n)' },
    answer: 'Approach: Push open brackets onto a stack; when a close bracket is encountered pop and verify it matches the expected open bracket. Key insight: Stack enforces LIFO order which mirrors how brackets must be closed. Time: O(n), Space: O(n)',
    approach: 'Push every opening bracket; on each closing bracket, pop the top and verify it is the matching opener. The string is valid only if nothing mismatches and the stack ends empty. Key insight: a stack naturally enforces the last-opened-first-closed nesting brackets require.',
    tags: ['stack', 'brackets', 'matching'],
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
    interviewerTips: ['Classic stack pattern — recognise it immediately.', 'Edge cases: empty string (valid), only open brackets, only close brackets.'],
    followUpQuestions: ['What if wildcards (*) can be open, close, or empty?', 'Remove minimum invalid parentheses to make valid?'],
  },

  {
    id: 'min-stack',
    title: 'Min Stack',
    difficulty: 'medium',
    topic: 'Stack',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Stack',
    approach: 'Back the value stack with a second stack that stores the running minimum at each level, pushing/popping both together. Key insight: because the min stack mirrors the value stack, getMin() is a constant-time peek with no scanning.',
    complexity: { time: 'O(1) per op', space: 'O(n)' },
    code: {
      java: `class MinStack {
    Deque<Integer> st = new ArrayDeque<>(), min = new ArrayDeque<>();
    public void push(int x) { st.push(x); min.push(min.isEmpty() ? x : Math.min(x, min.peek())); }
    public void pop() { st.pop(); min.pop(); }
    public int top() { return st.peek(); }
    public int getMin() { return min.peek(); }
}`,
      c: `// Parallel arrays: val[] and curMin[]
typedef struct { int val[10000], mn[10000], top; } MinStack;
MinStack* minStackCreate() { MinStack* s = malloc(sizeof(MinStack)); s->top = -1; return s; }
void minStackPush(MinStack* s, int x) {
    s->val[++s->top] = x;
    s->mn[s->top] = (s->top == 0) ? x : (x < s->mn[s->top-1] ? x : s->mn[s->top-1]);
}
void minStackPop(MinStack* s) { s->top--; }
int minStackTop(MinStack* s) { return s->val[s->top]; }
int minStackGetMin(MinStack* s) { return s->mn[s->top]; }`,
      cpp: `class MinStack {
    stack<int> st, mn;
public:
    void push(int x) { st.push(x); mn.push(mn.empty() ? x : min(x, mn.top())); }
    void pop() { st.pop(); mn.pop(); }
    int top() { return st.top(); }
    int getMin() { return mn.top(); }
};`,
    },
    visualizationLink: '/algorithm/stacks-queues/minStack',
    tags: ['stack', 'design', 'auxiliary-stack'],
  },

  {
    id: 'daily-temperatures',
    title: 'Daily Temperatures',
    difficulty: 'medium',
    topic: 'Stack',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Monotonic Stack',
    approach: 'Keep a stack of indices whose temperatures are still waiting for a warmer day. For each day, pop every colder index and record the distance to today, then push today. Key insight: a monotonic (decreasing) stack lets each index be pushed and popped once, giving linear time.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    code: {
      java: `public int[] dailyTemperatures(int[] t) {
    int[] res = new int[t.length];
    Deque<Integer> st = new ArrayDeque<>();
    for (int i = 0; i < t.length; i++) {
        while (!st.isEmpty() && t[i] > t[st.peek()]) {
            int j = st.pop();
            res[j] = i - j;
        }
        st.push(i);
    }
    return res;
}`,
      c: `int* dailyTemperatures(int* t, int n, int* retSize) {
    int* res = calloc(n, sizeof(int));
    int* st = malloc(n * sizeof(int)); int top = -1;
    for (int i = 0; i < n; i++) {
        while (top >= 0 && t[i] > t[st[top]]) { int j = st[top--]; res[j] = i - j; }
        st[++top] = i;
    }
    free(st); *retSize = n; return res;
}`,
      cpp: `vector<int> dailyTemperatures(vector<int>& t) {
    vector<int> res(t.size(), 0);
    stack<int> st;
    for (int i = 0; i < (int)t.size(); i++) {
        while (!st.empty() && t[i] > t[st.top()]) { int j = st.top(); st.pop(); res[j] = i - j; }
        st.push(i);
    }
    return res;
}`,
    },
    visualizationLink: null,
    tags: ['stack', 'monotonic', 'next-greater'],
  },

  {
    id: 'next-greater-element',
    title: 'Next Greater Element',
    difficulty: 'medium',
    topic: 'Stack',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Monotonic Stack',
    approach: 'Scan right to left keeping a stack of candidate "greater" values; pop everything not larger than the current element, then the stack top (if any) is its next greater element before you push it. Key insight: the stack stays monotonic decreasing, so each element is handled once.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    code: {
      java: `public int[] nextGreater(int[] a) {
    int n = a.length; int[] res = new int[n];
    Deque<Integer> st = new ArrayDeque<>();
    for (int i = n - 1; i >= 0; i--) {
        while (!st.isEmpty() && st.peek() <= a[i]) st.pop();
        res[i] = st.isEmpty() ? -1 : st.peek();
        st.push(a[i]);
    }
    return res;
}`,
      c: `void nextGreater(int* a, int n, int* res) {
    int* st = malloc(n * sizeof(int)); int top = -1;
    for (int i = n - 1; i >= 0; i--) {
        while (top >= 0 && st[top] <= a[i]) top--;
        res[i] = top < 0 ? -1 : st[top];
        st[++top] = a[i];
    }
    free(st);
}`,
      cpp: `vector<int> nextGreater(vector<int>& a) {
    int n = a.size(); vector<int> res(n);
    stack<int> st;
    for (int i = n - 1; i >= 0; i--) {
        while (!st.empty() && st.top() <= a[i]) st.pop();
        res[i] = st.empty() ? -1 : st.top();
        st.push(a[i]);
    }
    return res;
}`,
    },
    visualizationLink: '/algorithm/stacks-queues/nextGreaterElement',
    tags: ['stack', 'monotonic', 'next-greater'],
  },

  {
    id: 'evaluate-rpn',
    title: 'Evaluate Reverse Polish Notation',
    difficulty: 'medium',
    topic: 'Stack',
    companies: ['Amazon', 'Google', 'LinkedIn'],
    pattern: 'Stack',
    approach: 'Scan tokens left to right: push numbers, and on an operator pop the top two operands, apply it, and push the result back. Key insight: postfix notation encodes precedence in its order, so a single stack pass evaluates it with no parsing.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    code: {
      java: `public int evalRPN(String[] tokens) {
    Deque<Integer> st = new ArrayDeque<>();
    for (String t : tokens) {
        switch (t) {
            case "+": st.push(st.pop() + st.pop()); break;
            case "*": st.push(st.pop() * st.pop()); break;
            case "-": { int b = st.pop(), a = st.pop(); st.push(a - b); break; }
            case "/": { int b = st.pop(), a = st.pop(); st.push(a / b); break; }
            default: st.push(Integer.parseInt(t));
        }
    }
    return st.pop();
}`,
      c: `int evalRPN(char** tokens, int n) {
    int* st = malloc(n * sizeof(int)); int top = -1;
    for (int i = 0; i < n; i++) {
        char* t = tokens[i];
        if ((t[0]=='+'||t[0]=='-'||t[0]=='*'||t[0]=='/') && t[1]=='\\0') {
            int b = st[top--], a = st[top--];
            st[++top] = t[0]=='+'?a+b : t[0]=='-'?a-b : t[0]=='*'?a*b : a/b;
        } else st[++top] = atoi(t);
    }
    int r = st[top]; free(st); return r;
}`,
      cpp: `int evalRPN(vector<string>& tokens) {
    stack<int> st;
    for (auto& t : tokens) {
        if (t == "+" || t == "-" || t == "*" || t == "/") {
            int b = st.top(); st.pop(); int a = st.top(); st.pop();
            st.push(t=="+"?a+b : t=="-"?a-b : t=="*"?a*b : a/b);
        } else st.push(stoi(t));
    }
    return st.top();
}`,
    },
    visualizationLink: null,
    tags: ['stack', 'expression', 'simulation'],
  },

  {
    id: 'queue-using-stacks',
    title: 'Implement Queue Using Stacks',
    difficulty: 'easy',
    topic: 'Stack',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Stack',
    approach: 'Use an "in" stack for pushes and an "out" stack for pops; only when "out" is empty do you tip the entire "in" stack into it, reversing the order. Key insight: each element is moved between stacks at most once, so operations are amortized O(1).',
    complexity: { time: 'O(1) amortized', space: 'O(n)' },
    code: {
      java: `class MyQueue {
    Deque<Integer> in = new ArrayDeque<>(), out = new ArrayDeque<>();
    public void push(int x) { in.push(x); }
    private void shift() { if (out.isEmpty()) while (!in.isEmpty()) out.push(in.pop()); }
    public int pop() { shift(); return out.pop(); }
    public int peek() { shift(); return out.peek(); }
    public boolean empty() { return in.isEmpty() && out.isEmpty(); }
}`,
      c: `typedef struct { int in[1000], out[1000], it, ot; } MyQueue;
MyQueue* myQueueCreate() { MyQueue* q = malloc(sizeof(MyQueue)); q->it = q->ot = -1; return q; }
void myQueuePush(MyQueue* q, int x) { q->in[++q->it] = x; }
static void shift(MyQueue* q) { if (q->ot < 0) while (q->it >= 0) q->out[++q->ot] = q->in[q->it--]; }
int myQueuePop(MyQueue* q) { shift(q); return q->out[q->ot--]; }
int myQueuePeek(MyQueue* q) { shift(q); return q->out[q->ot]; }`,
      cpp: `class MyQueue {
    stack<int> in, out;
    void shift() { if (out.empty()) while (!in.empty()) { out.push(in.top()); in.pop(); } }
public:
    void push(int x) { in.push(x); }
    int pop() { shift(); int v = out.top(); out.pop(); return v; }
    int peek() { shift(); return out.top(); }
    bool empty() { return in.empty() && out.empty(); }
};`,
    },
    visualizationLink: null,
    tags: ['stack', 'queue', 'amortized'],
  },

  // ══════════════════ TREE ══════════════════

  {
    id: 'max-depth-tree',
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'easy',
    topic: 'Tree',
    companies: ['Amazon', 'Google', 'Meta', 'Apple'],
    pattern: 'Tree DFS',
    frequency: 4,
    algorithmLink: '/algorithm/trees/treeTraversal',
    complexity: { time: 'O(n)', space: 'O(h) where h is height' },
    answer: 'Approach: Recursive DFS — the max depth at any node is 1 plus the maximum depth of its two subtrees. Key insight: Post-order recursion naturally computes height bottom-up. Time: O(n), Space: O(h)',
    approach: 'Recurse into both subtrees and return 1 plus the larger of their depths, with an empty subtree contributing 0. Key insight: a node\'s depth depends only on its children, so a simple post-order recursion computes it bottom-up.',
    tags: ['tree', 'dfs', 'recursion'],
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
    interviewerTips: ['Know both recursive DFS and iterative BFS solutions.', 'BFS approach: count levels traversed.'],
    followUpQuestions: ['Minimum depth of binary tree?', 'Balanced binary tree check?', 'Diameter of binary tree?'],
  },

  {
    id: 'validate-bst',
    title: 'Validate Binary Search Tree',
    difficulty: 'medium',
    topic: 'Tree',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Tree DFS',
    approach: 'Recurse with an allowed (min, max) range for each node: a node must lie strictly inside its range, the left child inherits (min, node) and the right inherits (node, max). Key insight: checking only parent vs child is not enough — passing bounds down enforces the BST property across the whole subtree.',
    complexity: { time: 'O(n)', space: 'O(h)' },
    code: {
      java: `public boolean isValidBST(TreeNode root) { return valid(root, Long.MIN_VALUE, Long.MAX_VALUE); }
boolean valid(TreeNode n, long lo, long hi) {
    if (n == null) return true;
    if (n.val <= lo || n.val >= hi) return false;
    return valid(n.left, lo, n.val) && valid(n.right, n.val, hi);
}`,
      c: `bool valid(struct TreeNode* n, long lo, long hi) {
    if (!n) return true;
    if (n->val <= lo || n->val >= hi) return false;
    return valid(n->left, lo, n->val) && valid(n->right, n->val, hi);
}
bool isValidBST(struct TreeNode* root) { return valid(root, LONG_MIN, LONG_MAX); }`,
      cpp: `bool valid(TreeNode* n, long lo, long hi) {
    if (!n) return true;
    if (n->val <= lo || n->val >= hi) return false;
    return valid(n->left, lo, n->val) && valid(n->right, n->val, hi);
}
bool isValidBST(TreeNode* root) { return valid(root, LONG_MIN, LONG_MAX); }`,
    },
    visualizationLink: '/algorithm/trees/bst',
    tags: ['tree', 'bst', 'dfs', 'bounds'],
  },

  {
    id: 'level-order-traversal',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'medium',
    topic: 'Tree',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'BFS',
    approach: 'Run BFS with a queue, but snapshot the queue size at the start of each level so you know exactly how many nodes belong to the current row before enqueuing their children. Key insight: processing the queue in size-bounded batches cleanly separates the tree into levels.',
    complexity: { time: 'O(n)', space: 'O(w)' },
    code: {
      java: `public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> res = new ArrayList<>();
    if (root == null) return res;
    Queue<TreeNode> q = new LinkedList<>(); q.add(root);
    while (!q.isEmpty()) {
        int sz = q.size(); List<Integer> level = new ArrayList<>();
        for (int i = 0; i < sz; i++) {
            TreeNode n = q.poll(); level.add(n.val);
            if (n.left != null) q.add(n.left);
            if (n.right != null) q.add(n.right);
        }
        res.add(level);
    }
    return res;
}`,
      c: `int** levelOrder(struct TreeNode* root, int* returnSize, int** colSizes) {
    int** res = malloc(2000 * sizeof(int*));
    *colSizes = malloc(2000 * sizeof(int)); *returnSize = 0;
    if (!root) return res;
    struct TreeNode* q[10000]; int head = 0, tail = 0; q[tail++] = root;
    while (head < tail) {
        int sz = tail - head, *level = malloc(sz * sizeof(int));
        for (int i = 0; i < sz; i++) {
            struct TreeNode* n = q[head++]; level[i] = n->val;
            if (n->left) q[tail++] = n->left;
            if (n->right) q[tail++] = n->right;
        }
        res[*returnSize] = level; (*colSizes)[(*returnSize)++] = sz;
    }
    return res;
}`,
      cpp: `vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> res;
    if (!root) return res;
    queue<TreeNode*> q; q.push(root);
    while (!q.empty()) {
        int sz = q.size(); vector<int> level;
        for (int i = 0; i < sz; i++) {
            TreeNode* n = q.front(); q.pop(); level.push_back(n->val);
            if (n->left) q.push(n->left);
            if (n->right) q.push(n->right);
        }
        res.push_back(level);
    }
    return res;
}`,
    },
    visualizationLink: '/algorithm/trees/levelOrder',
    tags: ['tree', 'bfs', 'level-order'],
  },

  {
    id: 'lca-binary-tree',
    title: 'Lowest Common Ancestor of a Binary Tree',
    difficulty: 'medium',
    topic: 'Tree',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Tree DFS',
    approach: 'Post-order recurse: return the node itself if it equals p or q, otherwise return whichever side(s) found a target. The first node that gets non-null results from both its subtrees is the LCA. Key insight: "found p on one side and q on the other" can only happen at their split point.',
    complexity: { time: 'O(n)', space: 'O(h)' },
    code: {
      java: `public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q) return root;
    TreeNode l = lowestCommonAncestor(root.left, p, q);
    TreeNode r = lowestCommonAncestor(root.right, p, q);
    if (l != null && r != null) return root;
    return l != null ? l : r;
}`,
      c: `struct TreeNode* lowestCommonAncestor(struct TreeNode* root, struct TreeNode* p, struct TreeNode* q) {
    if (!root || root == p || root == q) return root;
    struct TreeNode* l = lowestCommonAncestor(root->left, p, q);
    struct TreeNode* r = lowestCommonAncestor(root->right, p, q);
    if (l && r) return root;
    return l ? l : r;
}`,
      cpp: `TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if (!root || root == p || root == q) return root;
    TreeNode* l = lowestCommonAncestor(root->left, p, q);
    TreeNode* r = lowestCommonAncestor(root->right, p, q);
    if (l && r) return root;
    return l ? l : r;
}`,
    },
    visualizationLink: '/algorithm/trees/lca',
    tags: ['tree', 'dfs', 'lca', 'post-order'],
  },

  {
    id: 'binary-tree-max-path-sum',
    title: 'Binary Tree Maximum Path Sum',
    difficulty: 'hard',
    topic: 'Tree',
    companies: ['Amazon', 'Google', 'Meta'],
    pattern: 'Tree DFS',
    approach: 'DFS returns the best downward gain from a node (node value plus the larger non-negative child gain). At each node, update a global best with node + leftGain + rightGain, which represents a path that bends through that node. Key insight: a path may turn at a node, but only one branch can be passed up to the parent.',
    complexity: { time: 'O(n)', space: 'O(h)' },
    code: {
      java: `int best;
public int maxPathSum(TreeNode root) { best = Integer.MIN_VALUE; gain(root); return best; }
int gain(TreeNode n) {
    if (n == null) return 0;
    int l = Math.max(gain(n.left), 0), r = Math.max(gain(n.right), 0);
    best = Math.max(best, n.val + l + r);
    return n.val + Math.max(l, r);
}`,
      c: `int gain(struct TreeNode* n, int* best) {
    if (!n) return 0;
    int l = gain(n->left, best); if (l < 0) l = 0;
    int r = gain(n->right, best); if (r < 0) r = 0;
    if (n->val + l + r > *best) *best = n->val + l + r;
    return n->val + (l > r ? l : r);
}
int maxPathSum(struct TreeNode* root) { int best = INT_MIN; gain(root, &best); return best; }`,
      cpp: `int best;
int gain(TreeNode* n) {
    if (!n) return 0;
    int l = max(gain(n->left), 0), r = max(gain(n->right), 0);
    best = max(best, n->val + l + r);
    return n->val + max(l, r);
}
int maxPathSum(TreeNode* root) { best = INT_MIN; gain(root); return best; }`,
    },
    visualizationLink: null,
    tags: ['tree', 'dfs', 'path-sum'],
  },

  {
    id: 'serialize-deserialize-tree',
    title: 'Serialize and Deserialize Binary Tree',
    difficulty: 'hard',
    topic: 'Tree',
    companies: ['Google', 'Amazon', 'Meta'],
    pattern: 'DFS Preorder',
    approach: 'Serialize with a preorder DFS, writing each value and a sentinel ("#") for null children. Deserialize by consuming that same stream in preorder, rebuilding a node for each value and a null for each sentinel. Key insight: recording null markers makes the flattened preorder uniquely decodable back into the tree.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    code: {
      java: `public String serialize(TreeNode root) {
    StringBuilder sb = new StringBuilder(); ser(root, sb); return sb.toString();
}
void ser(TreeNode n, StringBuilder sb) {
    if (n == null) { sb.append("#,"); return; }
    sb.append(n.val).append(","); ser(n.left, sb); ser(n.right, sb);
}
int idx;
public TreeNode deserialize(String data) { idx = 0; return de(data.split(",")); }
TreeNode de(String[] a) {
    String v = a[idx++];
    if (v.equals("#")) return null;
    TreeNode n = new TreeNode(Integer.parseInt(v));
    n.left = de(a); n.right = de(a);
    return n;
}`,
      c: `void ser(struct TreeNode* n, char* out) {
    if (!n) { strcat(out, "#,"); return; }
    char buf[12]; sprintf(buf, "%d,", n->val); strcat(out, buf);
    ser(n->left, out); ser(n->right, out);
}
char* serialize(struct TreeNode* root) { char* out = calloc(1 << 16, 1); ser(root, out); return out; }
struct TreeNode* de(char** s) {
    if (**s == '#') { *s += 2; return NULL; }
    int v = strtol(*s, s, 10); (*s)++;            /* skip comma */
    struct TreeNode* n = malloc(sizeof(struct TreeNode));
    n->val = v; n->left = de(s); n->right = de(s);
    return n;
}
struct TreeNode* deserialize(char* data) { return de(&data); }`,
      cpp: `string serialize(TreeNode* root) {
    string s; function<void(TreeNode*)> ser = [&](TreeNode* n) {
        if (!n) { s += "#,"; return; }
        s += to_string(n->val) + ","; ser(n->left); ser(n->right);
    };
    ser(root); return s;
}
TreeNode* deserialize(string data) {
    int i = 0;
    function<TreeNode*()> de = [&]() -> TreeNode* {
        if (data[i] == '#') { i += 2; return nullptr; }
        int j = data.find(',', i); int v = stoi(data.substr(i, j - i)); i = j + 1;
        TreeNode* n = new TreeNode(v); n->left = de(); n->right = de(); return n;
    };
    return de();
}`,
    },
    visualizationLink: '/algorithm/trees/serializeDeserialize',
    tags: ['tree', 'dfs', 'serialization'],
  },

  {
    id: 'diameter-binary-tree',
    title: 'Diameter of Binary Tree',
    difficulty: 'easy',
    topic: 'Tree',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Tree DFS',
    approach: 'Compute each subtree height with DFS, and at every node update a global maximum with leftHeight + rightHeight (the longest path passing through that node). Key insight: the diameter is not necessarily through the root, so you must consider the path bending at every node.',
    complexity: { time: 'O(n)', space: 'O(h)' },
    code: {
      java: `int diam;
public int diameterOfBinaryTree(TreeNode root) { diam = 0; height(root); return diam; }
int height(TreeNode n) {
    if (n == null) return 0;
    int l = height(n.left), r = height(n.right);
    diam = Math.max(diam, l + r);
    return 1 + Math.max(l, r);
}`,
      c: `int height(struct TreeNode* n, int* diam) {
    if (!n) return 0;
    int l = height(n->left, diam), r = height(n->right, diam);
    if (l + r > *diam) *diam = l + r;
    return 1 + (l > r ? l : r);
}
int diameterOfBinaryTree(struct TreeNode* root) { int d = 0; height(root, &d); return d; }`,
      cpp: `int diam;
int height(TreeNode* n) {
    if (!n) return 0;
    int l = height(n->left), r = height(n->right);
    diam = max(diam, l + r);
    return 1 + max(l, r);
}
int diameterOfBinaryTree(TreeNode* root) { diam = 0; height(root); return diam; }`,
    },
    visualizationLink: null,
    tags: ['tree', 'dfs', 'height'],
  },

  {
    id: 'symmetric-tree',
    title: 'Symmetric Tree',
    difficulty: 'easy',
    topic: 'Tree',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Tree DFS',
    approach: 'Compare the tree against its own mirror by recursing on two pointers that move outward in opposite directions: left.left with right.right, and left.right with right.left. Key insight: symmetry is just a mirror equality check run as two synchronized DFS walks.',
    complexity: { time: 'O(n)', space: 'O(h)' },
    code: {
      java: `public boolean isSymmetric(TreeNode root) { return root == null || mirror(root.left, root.right); }
boolean mirror(TreeNode a, TreeNode b) {
    if (a == null && b == null) return true;
    if (a == null || b == null || a.val != b.val) return false;
    return mirror(a.left, b.right) && mirror(a.right, b.left);
}`,
      c: `bool mirror(struct TreeNode* a, struct TreeNode* b) {
    if (!a && !b) return true;
    if (!a || !b || a->val != b->val) return false;
    return mirror(a->left, b->right) && mirror(a->right, b->left);
}
bool isSymmetric(struct TreeNode* root) { return !root || mirror(root->left, root->right); }`,
      cpp: `bool mirror(TreeNode* a, TreeNode* b) {
    if (!a && !b) return true;
    if (!a || !b || a->val != b->val) return false;
    return mirror(a->left, b->right) && mirror(a->right, b->left);
}
bool isSymmetric(TreeNode* root) { return !root || mirror(root->left, root->right); }`,
    },
    visualizationLink: '/algorithm/trees/mirrorTree',
    tags: ['tree', 'dfs', 'symmetry'],
  },

  {
    id: 'path-sum-ii',
    title: 'Path Sum II',
    difficulty: 'medium',
    topic: 'Tree',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'DFS Backtracking',
    approach: 'DFS down each root-to-leaf path, appending the current node and subtracting its value from the remaining target; record a copy of the path when you reach a leaf whose value finishes the sum, then pop the node on the way back up. Key insight: backtracking (the pop) lets one path buffer be reused across every branch.',
    complexity: { time: 'O(n²)', space: 'O(h)' },
    code: {
      java: `public List<List<Integer>> pathSum(TreeNode root, int target) {
    List<List<Integer>> res = new ArrayList<>();
    dfs(root, target, new ArrayList<>(), res);
    return res;
}
void dfs(TreeNode n, int rem, List<Integer> path, List<List<Integer>> res) {
    if (n == null) return;
    path.add(n.val);
    if (n.left == null && n.right == null && rem == n.val) res.add(new ArrayList<>(path));
    else { dfs(n.left, rem - n.val, path, res); dfs(n.right, rem - n.val, path, res); }
    path.remove(path.size() - 1);
}`,
      c: `void dfs(struct TreeNode* n, int rem, int* path, int d, int*** res, int* rs, int** col) {
    if (!n) return;
    path[d++] = n->val;
    if (!n->left && !n->right && rem == n->val) {
        (*res)[*rs] = malloc(d * sizeof(int));
        for (int i = 0; i < d; i++) (*res)[*rs][i] = path[i];
        (*col)[*rs] = d; (*rs)++;
    } else {
        dfs(n->left, rem - n->val, path, d, res, rs, col);
        dfs(n->right, rem - n->val, path, d, res, rs, col);
    }
}`,
      cpp: `vector<vector<int>> pathSum(TreeNode* root, int target) {
    vector<vector<int>> res; vector<int> path;
    function<void(TreeNode*,int)> dfs = [&](TreeNode* n, int rem) {
        if (!n) return;
        path.push_back(n->val);
        if (!n->left && !n->right && rem == n->val) res.push_back(path);
        else { dfs(n->left, rem - n->val); dfs(n->right, rem - n->val); }
        path.pop_back();
    };
    dfs(root, target); return res;
}`,
    },
    visualizationLink: '/algorithm/trees/pathSum',
    tags: ['tree', 'dfs', 'backtracking', 'path'],
  },

  {
    id: 'construct-from-preorder-inorder',
    title: 'Construct Binary Tree from Preorder and Inorder Traversal',
    difficulty: 'medium',
    topic: 'Tree',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Divide and Conquer',
    approach: 'The next preorder value is always the current subtree root; locating it in the inorder array splits the remaining inorder into the left and right subtrees, which you build recursively. Key insight: a value→index map over inorder turns each root lookup into O(1), giving overall linear time.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    code: {
      java: `Map<Integer,Integer> idx = new HashMap<>();
int pre;
public TreeNode buildTree(int[] preorder, int[] inorder) {
    for (int i = 0; i < inorder.length; i++) idx.put(inorder[i], i);
    pre = 0;
    return build(preorder, 0, inorder.length - 1);
}
TreeNode build(int[] preorder, int lo, int hi) {
    if (lo > hi) return null;
    int rootVal = preorder[pre++];
    TreeNode root = new TreeNode(rootVal);
    int mid = idx.get(rootVal);
    root.left = build(preorder, lo, mid - 1);
    root.right = build(preorder, mid + 1, hi);
    return root;
}`,
      c: `struct TreeNode* build(int* pre, int* pi, int* in, int lo, int hi) {
    if (lo > hi) return NULL;
    int rootVal = pre[(*pi)++], mid = lo;
    while (in[mid] != rootVal) mid++;
    struct TreeNode* root = malloc(sizeof(struct TreeNode));
    root->val = rootVal;
    root->left = build(pre, pi, in, lo, mid - 1);
    root->right = build(pre, pi, in, mid + 1, hi);
    return root;
}
struct TreeNode* buildTree(int* preorder, int n, int* inorder, int m) {
    int pi = 0; return build(preorder, &pi, inorder, 0, m - 1);
}`,
      cpp: `unordered_map<int,int> idx; int pre;
TreeNode* build(vector<int>& preorder, int lo, int hi) {
    if (lo > hi) return nullptr;
    int rootVal = preorder[pre++];
    TreeNode* root = new TreeNode(rootVal);
    int mid = idx[rootVal];
    root->left = build(preorder, lo, mid - 1);
    root->right = build(preorder, mid + 1, hi);
    return root;
}
TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
    for (int i = 0; i < (int)inorder.size(); i++) idx[inorder[i]] = i;
    pre = 0; return build(preorder, 0, inorder.size() - 1);
}`,
    },
    visualizationLink: null,
    tags: ['tree', 'divide-conquer', 'recursion'],
  },

  // ══════════════════ GRAPH ══════════════════

  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    difficulty: 'medium',
    topic: 'Graph',
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Bloomberg'],
    pattern: 'BFS / DFS',
    frequency: 5,
    algorithmLink: '/algorithm/graphs/bfs',
    complexity: { time: 'O(m×n)', space: 'O(m×n)' },
    answer: 'Approach: DFS from each unvisited land cell, marking all connected land as visited; each DFS call corresponds to one island. Key insight: Marking cells visited by overwriting with 0 avoids a separate visited array. Time: O(m×n), Space: O(m×n)',
    approach: 'Scan the grid; on each unvisited land cell, flood-fill all connected land with DFS/BFS and count one island. Key insight: marking visited land by sinking it (overwriting with water) doubles as the visited-set, so no cell is ever counted twice.',
    tags: ['graph', 'dfs', 'bfs', 'grid'],
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
    interviewerTips: ['Template for many grid/graph problems — know it cold.', 'Discuss Union-Find alternative.'],
    followUpQuestions: ['Max area of island?', 'Number of enclaves?'],
  },

  {
    id: 'clone-graph',
    title: 'Clone Graph',
    difficulty: 'medium',
    topic: 'Graph',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'BFS + HashMap',
    approach: 'Traverse the graph (BFS or DFS) keeping a map from each original node to its freshly created clone. When you visit an edge, create the neighbor clone if unseen and wire the cloned edge. Key insight: the map doubles as the visited-set and the lookup table that lets you connect clones without duplicating nodes.',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    code: {
      java: `public Node cloneGraph(Node node) {
    if (node == null) return null;
    Map<Node, Node> map = new HashMap<>();
    Queue<Node> q = new LinkedList<>(); q.add(node);
    map.put(node, new Node(node.val));
    while (!q.isEmpty()) {
        Node cur = q.poll();
        for (Node nb : cur.neighbors) {
            if (!map.containsKey(nb)) { map.put(nb, new Node(nb.val)); q.add(nb); }
            map.get(cur).neighbors.add(map.get(nb));
        }
    }
    return map.get(node);
}`,
      c: `struct Node* clone(struct Node* node, struct Node** seen) {
    if (!node) return NULL;
    if (seen[node->val]) return seen[node->val];
    struct Node* cp = malloc(sizeof(struct Node));
    cp->val = node->val; cp->numNeighbors = node->numNeighbors;
    cp->neighbors = malloc(sizeof(struct Node*) * node->numNeighbors);
    seen[node->val] = cp;
    for (int i = 0; i < node->numNeighbors; i++)
        cp->neighbors[i] = clone(node->neighbors[i], seen);
    return cp;
}
struct Node* cloneGraph(struct Node* node) {
    struct Node* seen[101] = {0};
    return clone(node, seen);
}`,
      cpp: `Node* cloneGraph(Node* node) {
    if (!node) return nullptr;
    unordered_map<Node*, Node*> map;
    queue<Node*> q; q.push(node);
    map[node] = new Node(node->val);
    while (!q.empty()) {
        Node* cur = q.front(); q.pop();
        for (Node* nb : cur->neighbors) {
            if (!map.count(nb)) { map[nb] = new Node(nb->val); q.push(nb); }
            map[cur]->neighbors.push_back(map[nb]);
        }
    }
    return map[node];
}`,
    },
    visualizationLink: null,
    tags: ['graph', 'bfs', 'hashmap', 'deep-copy'],
  },

  {
    id: 'course-schedule',
    title: 'Course Schedule (Cycle Detection)',
    difficulty: 'medium',
    topic: 'Graph',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Topological Sort',
    frequency: 5,
    algorithmLink: '/algorithm/graphs/topologicalSort',
    complexity: { time: 'O(V + E)', space: 'O(V + E)' },
    answer: "Approach: Build a directed graph from prerequisites; use Kahn's BFS topological sort — if all nodes are processed there is no cycle. Key insight: A valid topological order exists if and only if the graph is a DAG (no cycle). Time: O(V+E), Space: O(V+E)",
    approach: "Model prerequisites as a directed graph and run Kahn's topological sort, repeatedly removing nodes with zero in-degree. Key insight: all courses are finishable exactly when every node gets processed — i.e., the graph has no cycle.",
    tags: ['graph', 'topological-sort', 'cycle-detection', 'bfs'],
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
    id: 'word-ladder',
    title: 'Word Ladder',
    difficulty: 'hard',
    topic: 'Graph',
    companies: ['Amazon', 'Google', 'Meta', 'LinkedIn'],
    pattern: 'BFS',
    frequency: 4,
    algorithmLink: '/algorithm/graphs/bfs',
    complexity: { time: 'O(M² × N)', space: 'O(M² × N)' },
    answer: 'Approach: BFS level by level — for each word try all single-character substitutions and enqueue those present in the word set (removing them to avoid revisits). Key insight: BFS guarantees the shortest path in an unweighted graph; removing words from the set serves as the visited check. Time: O(M²·N), Space: O(M²·N)',
    approach: 'BFS level by level from the start word, generating neighbors by changing one letter at a time and keeping only words present in the dictionary (removed once enqueued). Key insight: BFS over this implicit word graph finds the shortest ladder because every single-letter edge has equal weight.',
    tags: ['graph', 'bfs', 'shortest-path'],
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
    interviewerTips: ['Classic BFS — shortest path in unweighted graph.', 'Bidirectional BFS halves the search space.'],
    followUpQuestions: ['Find all shortest transformation sequences?'],
  },

  {
    id: 'pacific-atlantic-flow',
    title: 'Pacific Atlantic Water Flow',
    difficulty: 'medium',
    topic: 'Graph',
    companies: ['Amazon', 'Google', 'Meta'],
    pattern: 'Reverse DFS',
    approach: 'Instead of simulating every cell draining to an ocean, flood inward from each ocean\'s border, only stepping to neighbors of equal or greater height. Cells reached from both floods can reach both oceans. Key insight: reversing the flow direction turns one hard many-to-many simulation into two simple border DFS passes.',
    complexity: { time: 'O(m·n)', space: 'O(m·n)' },
    code: {
      java: `int[][] DIRS = {{1,0},{-1,0},{0,1},{0,-1}};
public List<List<Integer>> pacificAtlantic(int[][] h) {
    int m = h.length, n = h[0].length;
    boolean[][] pac = new boolean[m][n], atl = new boolean[m][n];
    for (int i = 0; i < m; i++) { dfs(h, pac, i, 0); dfs(h, atl, i, n - 1); }
    for (int j = 0; j < n; j++) { dfs(h, pac, 0, j); dfs(h, atl, m - 1, j); }
    List<List<Integer>> res = new ArrayList<>();
    for (int i = 0; i < m; i++) for (int j = 0; j < n; j++)
        if (pac[i][j] && atl[i][j]) res.add(Arrays.asList(i, j));
    return res;
}
void dfs(int[][] h, boolean[][] vis, int i, int j) {
    vis[i][j] = true;
    for (int[] d : DIRS) {
        int ni = i + d[0], nj = j + d[1];
        if (ni >= 0 && ni < h.length && nj >= 0 && nj < h[0].length
            && !vis[ni][nj] && h[ni][nj] >= h[i][j]) dfs(h, vis, ni, nj);
    }
}`,
      c: `void dfs(int** h, int m, int n, int i, int j, bool** vis) {
    vis[i][j] = true;
    int di[] = {1,-1,0,0}, dj[] = {0,0,1,-1};
    for (int k = 0; k < 4; k++) {
        int ni = i + di[k], nj = j + dj[k];
        if (ni >= 0 && ni < m && nj >= 0 && nj < n && !vis[ni][nj] && h[ni][nj] >= h[i][j])
            dfs(h, m, n, ni, nj, vis);
    }
}
/* run dfs from every Pacific (top/left) and Atlantic (bottom/right) border cell,
   then collect cells marked reachable by both. */`,
      cpp: `vector<vector<int>> pacificAtlantic(vector<vector<int>>& h) {
    int m = h.size(), n = h[0].size();
    vector<vector<bool>> pac(m, vector<bool>(n)), atl(m, vector<bool>(n));
    int di[] = {1,-1,0,0}, dj[] = {0,0,1,-1};
    function<void(vector<vector<bool>>&,int,int)> dfs = [&](vector<vector<bool>>& v, int i, int j) {
        v[i][j] = true;
        for (int k = 0; k < 4; k++) {
            int ni = i + di[k], nj = j + dj[k];
            if (ni>=0 && ni<m && nj>=0 && nj<n && !v[ni][nj] && h[ni][nj] >= h[i][j]) dfs(v, ni, nj);
        }
    };
    for (int i = 0; i < m; i++) { dfs(pac, i, 0); dfs(atl, i, n-1); }
    for (int j = 0; j < n; j++) { dfs(pac, 0, j); dfs(atl, m-1, j); }
    vector<vector<int>> res;
    for (int i = 0; i < m; i++) for (int j = 0; j < n; j++)
        if (pac[i][j] && atl[i][j]) res.push_back({i, j});
    return res;
}`,
    },
    visualizationLink: null,
    tags: ['graph', 'dfs', 'grid'],
  },

  {
    id: 'connected-components',
    title: 'Number of Connected Components in Undirected Graph',
    difficulty: 'medium',
    topic: 'Graph',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Union Find',
    approach: 'Start with n isolated components and a union-find structure; for every edge, union its endpoints and decrement the component count whenever two previously separate sets merge. Key insight: each successful union reduces the number of components by exactly one.',
    complexity: { time: 'O(n + E·α(n))', space: 'O(n)' },
    code: {
      java: `int[] parent;
public int countComponents(int n, int[][] edges) {
    parent = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;
    int count = n;
    for (int[] e : edges) {
        int a = find(e[0]), b = find(e[1]);
        if (a != b) { parent[a] = b; count--; }
    }
    return count;
}
int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }`,
      c: `int parent[100000];
int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
int countComponents(int n, int edges[][2], int e) {
    for (int i = 0; i < n; i++) parent[i] = i;
    int count = n;
    for (int i = 0; i < e; i++) {
        int a = find(edges[i][0]), b = find(edges[i][1]);
        if (a != b) { parent[a] = b; count--; }
    }
    return count;
}`,
      cpp: `vector<int> parent;
int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
int countComponents(int n, vector<vector<int>>& edges) {
    parent.resize(n); iota(parent.begin(), parent.end(), 0);
    int count = n;
    for (auto& e : edges) {
        int a = find(e[0]), b = find(e[1]);
        if (a != b) { parent[a] = b; count--; }
    }
    return count;
}`,
    },
    visualizationLink: '/algorithm/graphs/unionFind',
    tags: ['graph', 'union-find', 'dfs'],
  },

  {
    id: 'alien-dictionary',
    title: 'Alien Dictionary',
    difficulty: 'hard',
    topic: 'Graph',
    companies: ['Google', 'Meta', 'Airbnb'],
    pattern: 'Topological Sort',
    approach: 'Each pair of adjacent words gives one ordering edge between their first differing characters; build that character graph and topologically sort it. Key insight: a valid alphabet is a topological order of these constraints — if a cycle appears (or a longer word precedes its own prefix) no order exists.',
    complexity: { time: 'O(C)', space: 'O(1)' },
    code: {
      java: `public String alienOrder(String[] words) {
    Map<Character, Set<Character>> adj = new HashMap<>();
    int[] indeg = new int[26]; boolean[] seen = new boolean[26];
    for (String w : words) for (char c : w.toCharArray()) { seen[c-'a'] = true; adj.putIfAbsent(c, new HashSet<>()); }
    for (int i = 0; i + 1 < words.length; i++) {
        String a = words[i], b = words[i+1];
        if (a.length() > b.length() && a.startsWith(b)) return "";
        for (int j = 0; j < Math.min(a.length(), b.length()); j++) {
            char x = a.charAt(j), y = b.charAt(j);
            if (x != y) { if (adj.get(x).add(y)) indeg[y-'a']++; break; }
        }
    }
    Queue<Character> q = new LinkedList<>(); int total = 0;
    for (int i = 0; i < 26; i++) if (seen[i]) { total++; if (indeg[i] == 0) q.add((char)('a'+i)); }
    StringBuilder sb = new StringBuilder();
    while (!q.isEmpty()) {
        char c = q.poll(); sb.append(c);
        for (char nx : adj.get(c)) if (--indeg[nx-'a'] == 0) q.add(nx);
    }
    return sb.length() == total ? sb.toString() : "";
}`,
      c: `char* alienOrder(char** words, int n) {
    bool adj[26][26] = {{false}}; int indeg[26] = {0}; bool seen[26] = {false};
    for (int i = 0; i < n; i++) for (int j = 0; words[i][j]; j++) seen[words[i][j]-'a'] = true;
    for (int i = 0; i + 1 < n; i++) {
        char *a = words[i], *b = words[i+1]; int k = 0;
        while (a[k] && b[k] && a[k] == b[k]) k++;
        if (a[k] && !b[k]) return strdup("");
        if (a[k] && b[k] && !adj[a[k]-'a'][b[k]-'a']) { adj[a[k]-'a'][b[k]-'a'] = true; indeg[b[k]-'a']++; }
    }
    int q[26], head = 0, tail = 0, total = 0;
    for (int i = 0; i < 26; i++) if (seen[i]) { total++; if (!indeg[i]) q[tail++] = i; }
    char* res = malloc(27); int len = 0;
    while (head < tail) {
        int c = q[head++]; res[len++] = 'a' + c;
        for (int j = 0; j < 26; j++) if (adj[c][j] && --indeg[j] == 0) q[tail++] = j;
    }
    res[len] = '\\0';
    if (len != total) res[0] = '\\0';
    return res;
}`,
      cpp: `string alienOrder(vector<string>& words) {
    unordered_map<char, unordered_set<char>> adj;
    int indeg[26] = {0}; bool seen[26] = {false};
    for (auto& w : words) for (char c : w) { seen[c-'a'] = true; adj[c]; }
    for (int i = 0; i + 1 < (int)words.size(); i++) {
        string &a = words[i], &b = words[i+1];
        if (a.size() > b.size() && a.substr(0, b.size()) == b) return "";
        for (int j = 0; j < (int)min(a.size(), b.size()); j++)
            if (a[j] != b[j]) { if (adj[a[j]].insert(b[j]).second) indeg[b[j]-'a']++; break; }
    }
    queue<char> q; int total = 0;
    for (int i = 0; i < 26; i++) if (seen[i]) { total++; if (!indeg[i]) q.push('a'+i); }
    string res;
    while (!q.empty()) { char c = q.front(); q.pop(); res += c; for (char nx : adj[c]) if (--indeg[nx-'a'] == 0) q.push(nx); }
    return (int)res.size() == total ? res : "";
}`,
    },
    visualizationLink: '/algorithm/graphs/topologicalSort',
    tags: ['graph', 'topological-sort', 'string'],
  },

  {
    id: 'dijkstra-shortest-path',
    title: "Dijkstra's Shortest Path",
    difficulty: 'medium',
    topic: 'Graph',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Min Heap',
    approach: 'Keep tentative distances and a min-heap of (distance, node); repeatedly pop the closest unfinalized node and relax its outgoing edges. Key insight: with non-negative weights, the first time a node is popped its distance is final, so each is settled exactly once.',
    complexity: { time: 'O((V + E) log V)', space: 'O(V)' },
    code: {
      java: `public int[] dijkstra(int n, int[][] edges, int src) {
    List<int[]>[] adj = new List[n];
    for (int i = 0; i < n; i++) adj[i] = new ArrayList<>();
    for (int[] e : edges) adj[e[0]].add(new int[]{e[1], e[2]});
    int[] dist = new int[n]; Arrays.fill(dist, Integer.MAX_VALUE); dist[src] = 0;
    PriorityQueue<int[]> pq = new PriorityQueue<>((a,b) -> a[1] - b[1]);
    pq.add(new int[]{src, 0});
    while (!pq.isEmpty()) {
        int[] cur = pq.poll(); int u = cur[0];
        if (cur[1] > dist[u]) continue;
        for (int[] nb : adj[u]) {
            int v = nb[0], w = nb[1];
            if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pq.add(new int[]{v, dist[v]}); }
        }
    }
    return dist;
}`,
      c: `/* O(V^2) variant using an adjacency matrix (no heap) */
void dijkstra(int n, int** g, int src, int* dist) {
    bool done[1000] = {false};
    for (int i = 0; i < n; i++) dist[i] = INT_MAX;
    dist[src] = 0;
    for (int it = 0; it < n; it++) {
        int u = -1;
        for (int i = 0; i < n; i++) if (!done[i] && (u == -1 || dist[i] < dist[u])) u = i;
        if (u == -1 || dist[u] == INT_MAX) break;
        done[u] = true;
        for (int v = 0; v < n; v++)
            if (g[u][v] && dist[u] != INT_MAX && dist[u] + g[u][v] < dist[v]) dist[v] = dist[u] + g[u][v];
    }
}`,
      cpp: `vector<int> dijkstra(int n, vector<vector<int>>& edges, int src) {
    vector<vector<pair<int,int>>> adj(n);
    for (auto& e : edges) adj[e[0]].push_back({e[1], e[2]});
    vector<int> dist(n, INT_MAX); dist[src] = 0;
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({0, src});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : adj[u])
            if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pq.push({dist[v], v}); }
    }
    return dist;
}`,
    },
    visualizationLink: '/algorithm/graphs/dijkstra',
    tags: ['graph', 'shortest-path', 'heap', 'greedy'],
  },

  {
    id: 'minimum-spanning-tree',
    title: "Minimum Spanning Tree (Kruskal's)",
    difficulty: 'medium',
    topic: 'Graph',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Union Find',
    approach: 'Sort all edges by weight and add them cheapest-first, using union-find to skip any edge whose endpoints are already connected (which would form a cycle). Key insight: by the cut property the lightest edge crossing any cut is safe, so the greedy choice always belongs to some MST.',
    complexity: { time: 'O(E log E)', space: 'O(V)' },
    code: {
      java: `int[] parent;
public int kruskal(int n, int[][] edges) {
    Arrays.sort(edges, (a, b) -> a[2] - b[2]);
    parent = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;
    int total = 0, used = 0;
    for (int[] e : edges) {
        int a = find(e[0]), b = find(e[1]);
        if (a != b) { parent[a] = b; total += e[2]; if (++used == n - 1) break; }
    }
    return total;
}
int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }`,
      c: `int parent[100000];
int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
int cmp(const void* a, const void* b) { return ((int*)a)[2] - ((int*)b)[2]; }
int kruskal(int n, int edges[][3], int e) {
    qsort(edges, e, sizeof(edges[0]), cmp);
    for (int i = 0; i < n; i++) parent[i] = i;
    int total = 0, used = 0;
    for (int i = 0; i < e; i++) {
        int a = find(edges[i][0]), b = find(edges[i][1]);
        if (a != b) { parent[a] = b; total += edges[i][2]; if (++used == n - 1) break; }
    }
    return total;
}`,
      cpp: `vector<int> parent;
int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
int kruskal(int n, vector<vector<int>>& edges) {
    sort(edges.begin(), edges.end(), [](auto& a, auto& b){ return a[2] < b[2]; });
    parent.resize(n); iota(parent.begin(), parent.end(), 0);
    int total = 0, used = 0;
    for (auto& e : edges) {
        int a = find(e[0]), b = find(e[1]);
        if (a != b) { parent[a] = b; total += e[2]; if (++used == n - 1) break; }
    }
    return total;
}`,
    },
    visualizationLink: '/algorithm/graphs/kruskal',
    tags: ['graph', 'union-find', 'greedy', 'mst'],
  },

  {
    id: 'detect-cycle-directed',
    title: 'Detect Cycle in a Directed Graph',
    difficulty: 'medium',
    topic: 'Graph',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'DFS with Colors',
    approach: 'DFS while coloring nodes white (unvisited), gray (on the current recursion stack), and black (fully explored). Encountering an edge to a gray node is a back edge, which means a cycle. Key insight: gray nodes are exactly the current path, so a back edge into the path closes a loop.',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    code: {
      java: `int[] color;  // 0=white, 1=gray, 2=black
public boolean hasCycle(int n, List<List<Integer>> adj) {
    color = new int[n];
    for (int i = 0; i < n; i++) if (color[i] == 0 && dfs(i, adj)) return true;
    return false;
}
boolean dfs(int u, List<List<Integer>> adj) {
    color[u] = 1;
    for (int v : adj.get(u)) {
        if (color[v] == 1) return true;
        if (color[v] == 0 && dfs(v, adj)) return true;
    }
    color[u] = 2;
    return false;
}`,
      c: `int color[100000];
bool dfs(int u, int** adj, int* deg) {
    color[u] = 1;
    for (int i = 0; i < deg[u]; i++) {
        int v = adj[u][i];
        if (color[v] == 1) return true;
        if (color[v] == 0 && dfs(v, adj, deg)) return true;
    }
    color[u] = 2;
    return false;
}
bool hasCycle(int n, int** adj, int* deg) {
    for (int i = 0; i < n; i++) color[i] = 0;
    for (int i = 0; i < n; i++) if (color[i] == 0 && dfs(i, adj, deg)) return true;
    return false;
}`,
      cpp: `vector<int> color;  // 0=white, 1=gray, 2=black
bool dfs(int u, vector<vector<int>>& adj) {
    color[u] = 1;
    for (int v : adj[u]) {
        if (color[v] == 1) return true;
        if (color[v] == 0 && dfs(v, adj)) return true;
    }
    color[u] = 2;
    return false;
}
bool hasCycle(int n, vector<vector<int>>& adj) {
    color.assign(n, 0);
    for (int i = 0; i < n; i++) if (color[i] == 0 && dfs(i, adj)) return true;
    return false;
}`,
    },
    visualizationLink: '/algorithm/graphs/cycleDetection',
    tags: ['graph', 'dfs', 'cycle-detection', 'coloring'],
  },

  // ══════════════════ DYNAMIC PROGRAMMING ══════════════════

  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'easy',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Apple', 'Adobe'],
    pattern: 'Dynamic Programming',
    frequency: 4,
    algorithmLink: '/algorithm/dynamic-programming/fibDP',
    complexity: { time: 'O(n)', space: 'O(1)' },
    answer: 'Approach: The number of ways to reach step n is the sum of ways to reach n-1 and n-2 (Fibonacci); optimize to O(1) space by keeping only two variables. Key insight: This is exactly Fibonacci — recognizing the pattern earns points. Time: O(n), Space: O(1)',
    approach: 'Each step n is reachable from n−1 (a single step) or n−2 (a double step), so ways(n) = ways(n−1) + ways(n−2) — the Fibonacci recurrence — maintained in two rolling variables. Key insight: recognizing this as Fibonacci collapses the whole table to O(1) space.',
    tags: ['dp', 'fibonacci', 'bottom-up'],
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
    interviewerTips: ['Recognise Fibonacci immediately and say so.', 'Show recursive → memoised → O(1) space progression.'],
    followUpQuestions: ['Some steps are broken — cannot step on them?', 'Minimum cost to climb stairs?', 'What if you can jump up to k steps?'],
  },

  {
    id: 'coin-change',
    title: 'Coin Change',
    difficulty: 'medium',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Microsoft', 'Goldman Sachs', 'Uber'],
    pattern: 'Dynamic Programming',
    frequency: 5,
    algorithmLink: '/algorithm/dynamic-programming/coinChangeDP',
    complexity: { time: 'O(n × amount)', space: 'O(amount)' },
    answer: 'Approach: Bottom-up DP — dp[i] = minimum coins to make amount i; for each amount try all coin denominations and take the minimum. Key insight: Greedy fails — use DP to consider all combinations; initialize dp array to infinity except dp[0]=0. Time: O(n·amount), Space: O(amount)',
    approach: 'Bottom-up DP where dp[a] is the fewest coins making amount a: initialize to infinity, dp[0] = 0, and for each amount try every coin, taking 1 + dp[a − coin]. Key insight: greedy fails for arbitrary denominations, so every coin must be considered at each amount, built up from zero.',
    tags: ['dp', 'bottom-up', 'unbounded-knapsack'],
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
    interviewerTips: ['Greedy DOES NOT work — show counterexample: coins=[1,3,4], target=6.', 'Explain dp[0]=0 and initialise others to infinity.'],
    followUpQuestions: ['Number of ways to make change?', 'Coin change with limited coins?'],
  },

  {
    id: 'lcs',
    title: 'Longest Common Subsequence',
    difficulty: 'medium',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
    pattern: 'Dynamic Programming',
    approach: 'Fill a 2D table where dp[i][j] is the LCS length of the first i and first j characters: if the characters match, extend the diagonal (dp[i-1][j-1] + 1); otherwise take the better of dropping one character from either string. Key insight: the LCS of prefixes has optimal substructure, so each cell depends only on three neighbors.',
    complexity: { time: 'O(m·n)', space: 'O(m·n)' },
    code: {
      java: `public int lcs(String a, String b) {
    int m = a.length(), n = b.length();
    int[][] dp = new int[m+1][n+1];
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a.charAt(i-1) == b.charAt(j-1)
                ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);
    return dp[m][n];
}`,
      c: `int lcs(char* a, char* b) {
    int m = strlen(a), n = strlen(b);
    int dp[m+1][n+1];
    for (int i = 0; i <= m; i++) for (int j = 0; j <= n; j++) {
        if (i == 0 || j == 0) dp[i][j] = 0;
        else if (a[i-1] == b[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
        else dp[i][j] = dp[i-1][j] > dp[i][j-1] ? dp[i-1][j] : dp[i][j-1];
    }
    return dp[m][n];
}`,
      cpp: `int lcs(string a, string b) {
    int m = a.size(), n = b.size();
    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a[i-1] == b[j-1] ? dp[i-1][j-1] + 1 : max(dp[i-1][j], dp[i][j-1]);
    return dp[m][n];
}`,
    },
    visualizationLink: '/algorithm/dynamic-programming/lcs',
    tags: ['dp', '2d-dp', 'subsequence'],
  },

  {
    id: 'knapsack-01',
    title: '0/1 Knapsack',
    difficulty: 'medium',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
    pattern: 'Dynamic Programming',
    approach: 'Use a 1D dp over capacity where dp[c] is the best value achievable with capacity c; for each item, update capacities from high to low so the item is counted at most once. Key insight: iterating capacity in reverse is what enforces the 0/1 (take-each-item-once) constraint while keeping space O(W).',
    complexity: { time: 'O(n·W)', space: 'O(W)' },
    code: {
      java: `public int knapsack(int[] w, int[] v, int cap) {
    int[] dp = new int[cap+1];
    for (int i = 0; i < w.length; i++)
        for (int c = cap; c >= w[i]; c--)
            dp[c] = Math.max(dp[c], dp[c-w[i]] + v[i]);
    return dp[cap];
}`,
      c: `int knapsack(int* w, int* v, int n, int cap) {
    int* dp = calloc(cap+1, sizeof(int));
    for (int i = 0; i < n; i++)
        for (int c = cap; c >= w[i]; c--)
            if (dp[c-w[i]] + v[i] > dp[c]) dp[c] = dp[c-w[i]] + v[i];
    int r = dp[cap]; free(dp); return r;
}`,
      cpp: `int knapsack(vector<int>& w, vector<int>& v, int cap) {
    vector<int> dp(cap+1, 0);
    for (int i = 0; i < (int)w.size(); i++)
        for (int c = cap; c >= w[i]; c--)
            dp[c] = max(dp[c], dp[c-w[i]] + v[i]);
    return dp[cap];
}`,
    },
    visualizationLink: '/algorithm/dynamic-programming/knapsack01',
    tags: ['dp', 'knapsack'],
  },

  {
    id: 'lis',
    title: 'Longest Increasing Subsequence',
    difficulty: 'medium',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Patience Sorting + Binary Search',
    approach: 'Maintain a "tails" array where tails[k] is the smallest possible tail of an increasing subsequence of length k+1; for each number, binary-search the first tail ≥ it and overwrite (or append). Key insight: tails stays sorted, so each element is placed in O(log n), and its final length is the LIS length.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    code: {
      java: `public int lengthOfLIS(int[] a) {
    List<Integer> tails = new ArrayList<>();
    for (int x : a) {
        int lo = 0, hi = tails.size();
        while (lo < hi) { int mid = (lo+hi)/2; if (tails.get(mid) < x) lo = mid+1; else hi = mid; }
        if (lo == tails.size()) tails.add(x); else tails.set(lo, x);
    }
    return tails.size();
}`,
      c: `int lengthOfLIS(int* a, int n) {
    int* tails = malloc(n * sizeof(int)); int len = 0;
    for (int i = 0; i < n; i++) {
        int lo = 0, hi = len;
        while (lo < hi) { int mid = (lo+hi)/2; if (tails[mid] < a[i]) lo = mid+1; else hi = mid; }
        tails[lo] = a[i];
        if (lo == len) len++;
    }
    free(tails); return len;
}`,
      cpp: `int lengthOfLIS(vector<int>& a) {
    vector<int> tails;
    for (int x : a) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x); else *it = x;
    }
    return tails.size();
}`,
    },
    visualizationLink: '/algorithm/dynamic-programming/lis',
    tags: ['dp', 'binary-search', 'subsequence'],
  },

  {
    id: 'word-break',
    title: 'Word Break',
    difficulty: 'medium',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Dynamic Programming',
    approach: 'Let dp[i] mean the prefix of length i is segmentable; for each i, look for a split point j where dp[j] is true and s[j..i) is a dictionary word. Key insight: caching prefix results turns the exponential split search into O(n²) by reusing solved subproblems.',
    complexity: { time: 'O(n²)', space: 'O(n)' },
    code: {
      java: `public boolean wordBreak(String s, List<String> dict) {
    Set<String> set = new HashSet<>(dict);
    boolean[] dp = new boolean[s.length()+1]; dp[0] = true;
    for (int i = 1; i <= s.length(); i++)
        for (int j = 0; j < i; j++)
            if (dp[j] && set.contains(s.substring(j, i))) { dp[i] = true; break; }
    return dp[s.length()];
}`,
      c: `bool wordBreak(char* s, char** dict, int dn) {
    int n = strlen(s);
    bool* dp = calloc(n+1, 1); dp[0] = true;
    for (int i = 1; i <= n; i++)
        for (int j = 0; j < i && !dp[i]; j++)
            if (dp[j])
                for (int k = 0; k < dn; k++) {
                    int len = strlen(dict[k]);
                    if (len == i - j && strncmp(s + j, dict[k], len) == 0) { dp[i] = true; break; }
                }
    bool r = dp[n]; free(dp); return r;
}`,
      cpp: `bool wordBreak(string s, vector<string>& dict) {
    unordered_set<string> set(dict.begin(), dict.end());
    vector<bool> dp(s.size()+1, false); dp[0] = true;
    for (int i = 1; i <= (int)s.size(); i++)
        for (int j = 0; j < i; j++)
            if (dp[j] && set.count(s.substr(j, i - j))) { dp[i] = true; break; }
    return dp[s.size()];
}`,
    },
    visualizationLink: '/algorithm/dynamic-programming/wordBreak',
    tags: ['dp', 'string', 'bottom-up'],
  },

  {
    id: 'edit-distance',
    title: 'Edit Distance (Levenshtein)',
    difficulty: 'hard',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Dynamic Programming',
    approach: 'Fill dp[i][j] = min edits to turn the first i chars of A into the first j chars of B: on a match copy the diagonal, otherwise take 1 + the min of the three neighbors (delete, insert, replace). Key insight: the three edit operations map exactly to the left, top, and diagonal cells.',
    complexity: { time: 'O(m·n)', space: 'O(m·n)' },
    code: {
      java: `public int minDistance(String a, String b) {
    int m = a.length(), n = b.length();
    int[][] dp = new int[m+1][n+1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a.charAt(i-1) == b.charAt(j-1) ? dp[i-1][j-1]
                : 1 + Math.min(dp[i-1][j-1], Math.min(dp[i-1][j], dp[i][j-1]));
    return dp[m][n];
}`,
      c: `int minDistance(char* a, char* b) {
    int m = strlen(a), n = strlen(b);
    int dp[m+1][n+1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++) {
            if (a[i-1] == b[j-1]) dp[i][j] = dp[i-1][j-1];
            else {
                int x = dp[i-1][j-1] < dp[i-1][j] ? dp[i-1][j-1] : dp[i-1][j];
                if (dp[i][j-1] < x) x = dp[i][j-1];
                dp[i][j] = 1 + x;
            }
        }
    return dp[m][n];
}`,
      cpp: `int minDistance(string a, string b) {
    int m = a.size(), n = b.size();
    vector<vector<int>> dp(m+1, vector<int>(n+1));
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a[i-1] == b[j-1] ? dp[i-1][j-1]
                : 1 + min({dp[i-1][j-1], dp[i-1][j], dp[i][j-1]});
    return dp[m][n];
}`,
    },
    visualizationLink: '/algorithm/dynamic-programming/editDistance',
    tags: ['dp', '2d-dp', 'string'],
  },

  {
    id: 'max-product-subarray',
    title: 'Maximum Product Subarray',
    difficulty: 'medium',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Dynamic Programming',
    approach: 'Track both the max and min product ending at the current index, swapping them when the element is negative, then update each with the current value or the extended product. Key insight: a negative number turns the smallest (most negative) product into the largest, so the running minimum must be carried alongside the maximum.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public int maxProduct(int[] a) {
    int max = a[0], min = a[0], res = a[0];
    for (int i = 1; i < a.length; i++) {
        int x = a[i];
        if (x < 0) { int t = max; max = min; min = t; }
        max = Math.max(x, max * x);
        min = Math.min(x, min * x);
        res = Math.max(res, max);
    }
    return res;
}`,
      c: `int maxProduct(int* a, int n) {
    int mx = a[0], mn = a[0], res = a[0];
    for (int i = 1; i < n; i++) {
        int x = a[i];
        if (x < 0) { int t = mx; mx = mn; mn = t; }
        mx = x > mx * x ? x : mx * x;
        mn = x < mn * x ? x : mn * x;
        if (mx > res) res = mx;
    }
    return res;
}`,
      cpp: `int maxProduct(vector<int>& a) {
    int mx = a[0], mn = a[0], res = a[0];
    for (int i = 1; i < (int)a.size(); i++) {
        int x = a[i];
        if (x < 0) swap(mx, mn);
        mx = max(x, mx * x);
        mn = min(x, mn * x);
        res = max(res, mx);
    }
    return res;
}`,
    },
    visualizationLink: null,
    tags: ['dp', 'subarray', 'product'],
  },

  {
    id: 'house-robber',
    title: 'House Robber',
    difficulty: 'easy',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Dynamic Programming',
    approach: 'Scan the houses keeping two rolling values — best loot excluding the previous house and best including it — choosing at each house to either rob it (prev + value) or skip it (cur). Key insight: the no-adjacent rule means each decision depends only on the last two results, so O(1) space suffices.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public int rob(int[] a) {
    int prev = 0, cur = 0;
    for (int x : a) { int t = Math.max(cur, prev + x); prev = cur; cur = t; }
    return cur;
}`,
      c: `int rob(int* a, int n) {
    int prev = 0, cur = 0;
    for (int i = 0; i < n; i++) { int t = cur > prev + a[i] ? cur : prev + a[i]; prev = cur; cur = t; }
    return cur;
}`,
      cpp: `int rob(vector<int>& a) {
    int prev = 0, cur = 0;
    for (int x : a) { int t = max(cur, prev + x); prev = cur; cur = t; }
    return cur;
}`,
    },
    visualizationLink: null,
    tags: ['dp', 'bottom-up', 'no-adjacent'],
  },

  {
    id: 'unique-paths',
    title: 'Unique Paths',
    difficulty: 'medium',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Dynamic Programming',
    approach: 'Keep one row of counts initialized to 1 and sweep top to bottom, adding the left neighbor into each cell so dp[j] += dp[j-1]. Key insight: paths to a cell are the sum of paths from above and from the left, and rolling a single row reduces the grid DP to O(n) space.',
    complexity: { time: 'O(m·n)', space: 'O(n)' },
    code: {
      java: `public int uniquePaths(int m, int n) {
    int[] dp = new int[n]; Arrays.fill(dp, 1);
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[j] += dp[j-1];
    return dp[n-1];
}`,
      c: `int uniquePaths(int m, int n) {
    int* dp = malloc(n * sizeof(int));
    for (int j = 0; j < n; j++) dp[j] = 1;
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[j] += dp[j-1];
    int r = dp[n-1]; free(dp); return r;
}`,
      cpp: `int uniquePaths(int m, int n) {
    vector<int> dp(n, 1);
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[j] += dp[j-1];
    return dp[n-1];
}`,
    },
    visualizationLink: null,
    tags: ['dp', 'grid', 'combinatorics'],
  },

  // ══════════════════ HASHING ══════════════════

  {
    id: 'subarray-sum-k',
    title: 'Subarray Sum Equals K',
    difficulty: 'medium',
    topic: 'Hashing',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Prefix Sum + Hashing',
    approach: 'Track a running prefix sum and a hashmap of how many times each prefix sum has occurred; at each index add the count of (currentSum − k) seen so far. Key insight: a subarray sums to k exactly when two prefix sums differ by k, so counting earlier prefixes gives every valid subarray in one pass.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    code: {
      java: `public int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> count = new HashMap<>();
    count.put(0, 1);
    int sum = 0, res = 0;
    for (int x : nums) {
        sum += x;
        res += count.getOrDefault(sum - k, 0);
        count.merge(sum, 1, Integer::sum);
    }
    return res;
}`,
      c: `int subarraySum(int* nums, int n, int k) {
    // hashmap keyed by prefix sum; simplified with open addressing
    int res = 0, sum = 0;
    int cap = 4096; int* keys = malloc(cap*sizeof(int)); int* cnt = calloc(cap, sizeof(int));
    for (int i = 0; i < cap; i++) keys[i] = INT_MIN;
    #define PUT(s) do{ int h=((s)%cap+cap)%cap; while(keys[h]!=INT_MIN&&keys[h]!=(s)) h=(h+1)%cap; keys[h]=(s); cnt[h]++; }while(0)
    #define GET(s) ({ int h=((s)%cap+cap)%cap; while(keys[h]!=INT_MIN&&keys[h]!=(s)) h=(h+1)%cap; keys[h]==(s)?cnt[h]:0; })
    PUT(0);
    for (int i = 0; i < n; i++) { sum += nums[i]; res += GET(sum - k); PUT(sum); }
    free(keys); free(cnt); return res;
}`,
      cpp: `int subarraySum(vector<int>& nums, int k) {
    unordered_map<int,int> count{{0,1}};
    int sum = 0, res = 0;
    for (int x : nums) { sum += x; res += count[sum - k]; count[sum]++; }
    return res;
}`,
    },
    visualizationLink: '/algorithm/hashing/subarraySum',
    tags: ['hashing', 'prefix-sum', 'subarray'],
  },

  {
    id: 'longest-consecutive-sequence',
    title: 'Longest Consecutive Sequence',
    difficulty: 'medium',
    topic: 'Hashing',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'HashSet',
    approach: 'Put every number in a hash set, then only start counting a run from numbers that have no predecessor (n−1 absent), walking n, n+1, n+2… while present. Key insight: starting runs only at their smallest element means each number is visited at most twice, giving linear time despite the nested look.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    code: {
      java: `public int longestConsecutive(int[] nums) {
    Set<Integer> set = new HashSet<>();
    for (int x : nums) set.add(x);
    int best = 0;
    for (int x : set) {
        if (!set.contains(x - 1)) {
            int cur = x, len = 1;
            while (set.contains(cur + 1)) { cur++; len++; }
            best = Math.max(best, len);
        }
    }
    return best;
}`,
      c: `int cmp(const void* a, const void* b) { return (*(int*)a > *(int*)b) - (*(int*)a < *(int*)b); }
int longestConsecutive(int* nums, int n) {
    if (n == 0) return 0;
    qsort(nums, n, sizeof(int), cmp);
    int best = 1, len = 1;
    for (int i = 1; i < n; i++) {
        if (nums[i] == nums[i-1]) continue;
        if (nums[i] == nums[i-1] + 1) len++;
        else len = 1;
        if (len > best) best = len;
    }
    return best;
}`,
      cpp: `int longestConsecutive(vector<int>& nums) {
    unordered_set<int> set(nums.begin(), nums.end());
    int best = 0;
    for (int x : set) {
        if (!set.count(x - 1)) {
            int cur = x, len = 1;
            while (set.count(cur + 1)) { cur++; len++; }
            best = max(best, len);
        }
    }
    return best;
}`,
    },
    visualizationLink: '/algorithm/hashing/longestConsecutive',
    tags: ['hashing', 'hashset', 'sequence'],
  },

  {
    id: 'top-k-frequent-elements',
    title: 'Top K Frequent Elements',
    difficulty: 'medium',
    topic: 'Hashing',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Bucket Sort / Heap',
    approach: 'Count occurrences in a hashmap, then place each value into a bucket indexed by its frequency and read buckets from high to low until you have k values. Key insight: frequencies are bounded by n, so bucketing by frequency collects the top k in linear time without sorting.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    code: {
      java: `public int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> freq = new HashMap<>();
    for (int x : nums) freq.merge(x, 1, Integer::sum);
    List<Integer>[] buckets = new List[nums.length + 1];
    for (var e : freq.entrySet()) {
        int f = e.getValue();
        if (buckets[f] == null) buckets[f] = new ArrayList<>();
        buckets[f].add(e.getKey());
    }
    int[] res = new int[k]; int idx = 0;
    for (int f = buckets.length - 1; f >= 0 && idx < k; f--)
        if (buckets[f] != null) for (int v : buckets[f]) { if (idx < k) res[idx++] = v; }
    return res;
}`,
      c: `// count with a hashmap, then selection of the k highest counts
int* topKFrequent(int* nums, int n, int k, int* returnSize) {
    int* vals = malloc(n * sizeof(int)); int* cnt = malloc(n * sizeof(int)); int m = 0;
    for (int i = 0; i < n; i++) {
        int j = 0; for (; j < m; j++) if (vals[j] == nums[i]) { cnt[j]++; break; }
        if (j == m) { vals[m] = nums[i]; cnt[m++] = 1; }
    }
    int* res = malloc(k * sizeof(int));
    for (int t = 0; t < k; t++) {
        int bi = 0; for (int j = 1; j < m; j++) if (cnt[j] > cnt[bi]) bi = j;
        res[t] = vals[bi]; cnt[bi] = -1;
    }
    *returnSize = k; free(vals); free(cnt); return res;
}`,
      cpp: `vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int,int> freq;
    for (int x : nums) freq[x]++;
    vector<vector<int>> buckets(nums.size() + 1);
    for (auto& [v, f] : freq) buckets[f].push_back(v);
    vector<int> res;
    for (int f = buckets.size() - 1; f >= 0 && (int)res.size() < k; f--)
        for (int v : buckets[f]) { if ((int)res.size() < k) res.push_back(v); }
    return res;
}`,
    },
    visualizationLink: '/algorithm/hashing/topKFrequent',
    tags: ['hashing', 'bucket-sort', 'frequency'],
  },

  {
    id: 'four-sum',
    title: 'Four Sum',
    difficulty: 'hard',
    topic: 'Hashing',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Two Pointers',
    approach: 'Sort the array, fix the first two numbers with nested loops, and two-pointer the remaining range for the other two, skipping duplicates at every level. Key insight: this is 3Sum with one extra fixed index — sorting lets the inner pair be found in linear time so the whole search is O(n³).',
    complexity: { time: 'O(n³)', space: 'O(1)' },
    code: {
      java: `public List<List<Integer>> fourSum(int[] nums, int target) {
    Arrays.sort(nums);
    List<List<Integer>> res = new ArrayList<>();
    int n = nums.length;
    for (int i = 0; i < n - 3; i++) {
        if (i > 0 && nums[i] == nums[i-1]) continue;
        for (int j = i + 1; j < n - 2; j++) {
            if (j > i + 1 && nums[j] == nums[j-1]) continue;
            int lo = j + 1, hi = n - 1;
            while (lo < hi) {
                long sum = (long)nums[i] + nums[j] + nums[lo] + nums[hi];
                if (sum == target) {
                    res.add(Arrays.asList(nums[i], nums[j], nums[lo], nums[hi]));
                    while (lo < hi && nums[lo] == nums[lo+1]) lo++;
                    while (lo < hi && nums[hi] == nums[hi-1]) hi--;
                    lo++; hi--;
                } else if (sum < target) lo++; else hi--;
            }
        }
    }
    return res;
}`,
      c: `int cmp(const void* a, const void* b) { return (*(int*)a > *(int*)b) - (*(int*)a < *(int*)b); }
// returns count of quadruplets; fills out[][4]
int fourSum(int* nums, int n, int target, int out[][4]) {
    qsort(nums, n, sizeof(int), cmp);
    int cnt = 0;
    for (int i = 0; i < n - 3; i++) {
        if (i > 0 && nums[i] == nums[i-1]) continue;
        for (int j = i + 1; j < n - 2; j++) {
            if (j > i + 1 && nums[j] == nums[j-1]) continue;
            int lo = j + 1, hi = n - 1;
            while (lo < hi) {
                long s = (long)nums[i] + nums[j] + nums[lo] + nums[hi];
                if (s == target) {
                    out[cnt][0]=nums[i]; out[cnt][1]=nums[j]; out[cnt][2]=nums[lo]; out[cnt][3]=nums[hi]; cnt++;
                    while (lo < hi && nums[lo] == nums[lo+1]) lo++;
                    while (lo < hi && nums[hi] == nums[hi-1]) hi--;
                    lo++; hi--;
                } else if (s < target) lo++; else hi--;
            }
        }
    }
    return cnt;
}`,
      cpp: `vector<vector<int>> fourSum(vector<int>& nums, int target) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> res; int n = nums.size();
    for (int i = 0; i < n - 3; i++) {
        if (i > 0 && nums[i] == nums[i-1]) continue;
        for (int j = i + 1; j < n - 2; j++) {
            if (j > i + 1 && nums[j] == nums[j-1]) continue;
            int lo = j + 1, hi = n - 1;
            while (lo < hi) {
                long sum = (long)nums[i] + nums[j] + nums[lo] + nums[hi];
                if (sum == target) {
                    res.push_back({nums[i], nums[j], nums[lo], nums[hi]});
                    while (lo < hi && nums[lo] == nums[lo+1]) lo++;
                    while (lo < hi && nums[hi] == nums[hi-1]) hi--;
                    lo++; hi--;
                } else if (sum < target) lo++; else hi--;
            }
        }
    }
    return res;
}`,
    },
    visualizationLink: null,
    tags: ['hashing', 'two-pointer', 'sorting'],
  },

  {
    id: 'jewels-and-stones',
    title: 'Jewels and Stones',
    difficulty: 'easy',
    topic: 'Hashing',
    companies: ['Amazon', 'Google'],
    pattern: 'HashSet',
    approach: 'Load every jewel character into a hash set, then scan the stones once, counting those whose type is in the set. Key insight: the set turns each membership test into O(1), so the whole job is linear in the input sizes instead of quadratic.',
    complexity: { time: 'O(j + s)', space: 'O(j)' },
    code: {
      java: `public int numJewelsInStones(String jewels, String stones) {
    Set<Character> set = new HashSet<>();
    for (char c : jewels.toCharArray()) set.add(c);
    int count = 0;
    for (char c : stones.toCharArray()) if (set.contains(c)) count++;
    return count;
}`,
      c: `int numJewelsInStones(char* jewels, char* stones) {
    bool isJewel[128] = {false};
    for (int i = 0; jewels[i]; i++) isJewel[(int)jewels[i]] = true;
    int count = 0;
    for (int i = 0; stones[i]; i++) if (isJewel[(int)stones[i]]) count++;
    return count;
}`,
      cpp: `int numJewelsInStones(string jewels, string stones) {
    unordered_set<char> set(jewels.begin(), jewels.end());
    int count = 0;
    for (char c : stones) if (set.count(c)) count++;
    return count;
}`,
    },
    visualizationLink: null,
    tags: ['hashing', 'hashset', 'counting'],
  },

  // ══════════════════ HEAP ══════════════════

  {
    id: 'kth-largest-element',
    title: 'Kth Largest Element in an Array',
    difficulty: 'medium',
    topic: 'Heap',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Min Heap',
    approach: 'Keep a min-heap capped at size k: push each value and pop the smallest whenever the heap exceeds k, so the heap always holds the k largest seen. Key insight: the root of that size-k min-heap is the kth largest, achieved in O(n log k) without sorting everything.',
    complexity: { time: 'O(n log k)', space: 'O(k)' },
    code: {
      java: `public int findKthLargest(int[] a, int k) {
    PriorityQueue<Integer> pq = new PriorityQueue<>();
    for (int x : a) { pq.offer(x); if (pq.size() > k) pq.poll(); }
    return pq.peek();
}`,
      c: `static void siftUp(int* h, int i){ while(i){int p=(i-1)/2; if(h[p]<=h[i])break; int t=h[p];h[p]=h[i];h[i]=t; i=p;} }
static void siftDown(int* h,int n,int i){ for(;;){int l=2*i+1,r=2*i+2,s=i; if(l<n&&h[l]<h[s])s=l; if(r<n&&h[r]<h[s])s=r; if(s==i)break; int t=h[s];h[s]=h[i];h[i]=t; i=s;} }
int findKthLargest(int* a, int n, int k) {
    int* h = malloc(k*sizeof(int)); int sz = 0;
    for (int i = 0; i < n; i++) {
        if (sz < k) { h[sz] = a[i]; siftUp(h, sz); sz++; }
        else if (a[i] > h[0]) { h[0] = a[i]; siftDown(h, k, 0); }
    }
    int r = h[0]; free(h); return r;
}`,
      cpp: `int findKthLargest(vector<int>& a, int k) {
    priority_queue<int, vector<int>, greater<int>> pq;
    for (int x : a) { pq.push(x); if ((int)pq.size() > k) pq.pop(); }
    return pq.top();
}`,
    },
    visualizationLink: '/algorithm/heaps/kLargestElements',
    tags: ['heap', 'priority-queue', 'kth-element'],
  },

  {
    id: 'top-k-frequent-words',
    title: 'Top K Frequent Words',
    difficulty: 'medium',
    topic: 'Heap',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Max Heap',
    approach: 'Count word frequencies, then keep a size-k heap ordered by frequency ascending and, for ties, reverse-lexicographic, popping the worst when it overflows. Key insight: the custom comparator bakes the tie-break (higher frequency first, then alphabetical) directly into the heap so the surviving k entries are the answer.',
    complexity: { time: 'O(n log k)', space: 'O(n)' },
    code: {
      java: `public List<String> topKFrequent(String[] words, int k) {
    Map<String, Integer> freq = new HashMap<>();
    for (String w : words) freq.merge(w, 1, Integer::sum);
    PriorityQueue<String> pq = new PriorityQueue<>((a, b) ->
        freq.get(a).equals(freq.get(b)) ? b.compareTo(a) : freq.get(a) - freq.get(b));
    for (String w : freq.keySet()) { pq.offer(w); if (pq.size() > k) pq.poll(); }
    List<String> res = new ArrayList<>();
    while (!pq.isEmpty()) res.add(0, pq.poll());
    return res;
}`,
      c: `typedef struct { char* w; int c; } WC;
int cmpWC(const void* a, const void* b) {
    const WC* x = a; const WC* y = b;
    if (x->c != y->c) return y->c - x->c;
    return strcmp(x->w, y->w);
}
char** topKFrequent(char** words, int n, int k, int* retSize) {
    WC* arr = malloc(n * sizeof(WC)); int m = 0;
    for (int i = 0; i < n; i++) {
        int j = 0; for (; j < m; j++) if (strcmp(arr[j].w, words[i]) == 0) { arr[j].c++; break; }
        if (j == m) { arr[m].w = words[i]; arr[m].c = 1; m++; }
    }
    qsort(arr, m, sizeof(WC), cmpWC);
    char** res = malloc(k * sizeof(char*));
    for (int i = 0; i < k; i++) res[i] = arr[i].w;
    *retSize = k; free(arr); return res;
}`,
      cpp: `vector<string> topKFrequent(vector<string>& words, int k) {
    unordered_map<string,int> freq;
    for (auto& w : words) freq[w]++;
    auto cmp = [&](const string& a, const string& b) {
        return freq[a] == freq[b] ? a < b : freq[a] > freq[b];
    };
    priority_queue<string, vector<string>, decltype(cmp)> pq(cmp);
    for (auto& [w, f] : freq) { pq.push(w); if ((int)pq.size() > k) pq.pop(); }
    vector<string> res(k);
    for (int i = k - 1; i >= 0; i--) { res[i] = pq.top(); pq.pop(); }
    return res;
}`,
    },
    visualizationLink: null,
    tags: ['heap', 'hashmap', 'frequency', 'string'],
  },

  {
    id: 'find-median-stream',
    title: 'Find Median from Data Stream',
    difficulty: 'hard',
    topic: 'Heap',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Two Heaps',
    approach: 'Split the stream across a max-heap (lower half) and a min-heap (upper half), rebalancing after each insert so their sizes differ by at most one. Key insight: the heap tops straddle the middle, so the median is the larger heap\'s top (odd count) or the average of both tops (even count) in O(1).',
    complexity: { time: 'O(log n) insert, O(1) median', space: 'O(n)' },
    code: {
      java: `class MedianFinder {
    PriorityQueue<Integer> lo = new PriorityQueue<>(Collections.reverseOrder()); // max-heap
    PriorityQueue<Integer> hi = new PriorityQueue<>();                           // min-heap
    public void addNum(int x) {
        lo.offer(x);
        hi.offer(lo.poll());
        if (hi.size() > lo.size()) lo.offer(hi.poll());
    }
    public double findMedian() {
        return lo.size() > hi.size() ? lo.peek() : (lo.peek() + hi.peek()) / 2.0;
    }
}`,
      c: `static int lo[100000], hi[100000], ls, hs;   // lo = max-heap, hi = min-heap
static void hpush(int* h, int* s, int x, int isMax) {
    int i = (*s)++; h[i] = x;
    while (i) { int p = (i-1)/2; int sw = isMax ? h[p] < h[i] : h[p] > h[i]; if (!sw) break;
        int t = h[p]; h[p] = h[i]; h[i] = t; i = p; }
}
static int hpop(int* h, int* s, int isMax) {
    int top = h[0]; h[0] = h[--(*s)]; int i = 0;
    for (;;) { int l=2*i+1, r=2*i+2, b=i;
        if (l < *s && (isMax ? h[l] > h[b] : h[l] < h[b])) b = l;
        if (r < *s && (isMax ? h[r] > h[b] : h[r] < h[b])) b = r;
        if (b == i) break; int t = h[b]; h[b] = h[i]; h[i] = t; i = b; }
    return top;
}
void addNum(int x) {
    hpush(lo, &ls, x, 1);
    hpush(hi, &hs, hpop(lo, &ls, 1), 0);
    if (hs > ls) hpush(lo, &ls, hpop(hi, &hs, 0), 1);
}
double findMedian() { return ls > hs ? lo[0] : (lo[0] + hi[0]) / 2.0; }`,
      cpp: `class MedianFinder {
    priority_queue<int> lo;                              // max-heap
    priority_queue<int, vector<int>, greater<int>> hi;   // min-heap
public:
    void addNum(int x) {
        lo.push(x); hi.push(lo.top()); lo.pop();
        if (hi.size() > lo.size()) { lo.push(hi.top()); hi.pop(); }
    }
    double findMedian() {
        return lo.size() > hi.size() ? lo.top() : (lo.top() + hi.top()) / 2.0;
    }
};`,
    },
    visualizationLink: '/algorithm/heaps/medianStream',
    tags: ['heap', 'design', 'two-heaps'],
  },

  {
    id: 'task-scheduler',
    title: 'Task Scheduler',
    difficulty: 'medium',
    topic: 'Heap',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Greedy + Counting',
    approach: 'The busiest task forces the schedule: with max frequency f and cooldown, lay out f−1 full frames of size (cooldown+1) and append the tasks that also hit frequency f. The answer is max(total tasks, (f−1)·(cooldown+1) + countOfMax). Key insight: only the most frequent task(s) can create mandatory idle gaps, so they determine the minimum length.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public int leastInterval(char[] tasks, int cooldown) {
    int[] freq = new int[26];
    for (char t : tasks) freq[t - 'A']++;
    int maxF = 0, cntMax = 0;
    for (int f : freq) { if (f > maxF) { maxF = f; cntMax = 1; } else if (f == maxF) cntMax++; }
    int slots = (maxF - 1) * (cooldown + 1) + cntMax;
    return Math.max(tasks.length, slots);
}`,
      c: `int leastInterval(char* tasks, int n, int cooldown) {
    int freq[26] = {0};
    for (int i = 0; i < n; i++) freq[tasks[i] - 'A']++;
    int maxF = 0, cntMax = 0;
    for (int i = 0; i < 26; i++) { if (freq[i] > maxF) { maxF = freq[i]; cntMax = 1; } else if (freq[i] == maxF) cntMax++; }
    int slots = (maxF - 1) * (cooldown + 1) + cntMax;
    return n > slots ? n : slots;
}`,
      cpp: `int leastInterval(vector<char>& tasks, int cooldown) {
    int freq[26] = {0};
    for (char t : tasks) freq[t - 'A']++;
    int maxF = 0, cntMax = 0;
    for (int f : freq) { if (f > maxF) { maxF = f; cntMax = 1; } else if (f == maxF) cntMax++; }
    int slots = (maxF - 1) * (cooldown + 1) + cntMax;
    return max((int)tasks.size(), slots);
}`,
    },
    visualizationLink: null,
    tags: ['heap', 'greedy', 'counting'],
  },

  {
    id: 'reorganize-string',
    title: 'Reorganize String',
    difficulty: 'medium',
    topic: 'Heap',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Greedy + Counting',
    approach: 'If any character\'s count exceeds (n+1)/2 it is impossible; otherwise place the most frequent character into the even indices first, then fill the rest into the remaining even-then-odd slots. Key insight: spacing the highest-frequency character two apart guarantees no two equal characters end up adjacent.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public String reorganizeString(String s) {
    int[] freq = new int[26];
    for (char c : s.toCharArray()) freq[c - 'a']++;
    int maxF = 0, maxIdx = 0;
    for (int i = 0; i < 26; i++) if (freq[i] > maxF) { maxF = freq[i]; maxIdx = i; }
    if (maxF > (s.length() + 1) / 2) return "";
    char[] res = new char[s.length()]; int idx = 0;
    while (freq[maxIdx]-- > 0) { res[idx] = (char)('a' + maxIdx); idx += 2; }
    for (int i = 0; i < 26; i++)
        while (freq[i]-- > 0) { if (idx >= res.length) idx = 1; res[idx] = (char)('a' + i); idx += 2; }
    return new String(res);
}`,
      c: `char* reorganizeString(char* s) {
    int n = strlen(s), freq[26] = {0}, maxF = 0, maxIdx = 0;
    for (int i = 0; i < n; i++) freq[s[i] - 'a']++;
    for (int i = 0; i < 26; i++) if (freq[i] > maxF) { maxF = freq[i]; maxIdx = i; }
    char* res = malloc(n + 1); res[n] = '\\0';
    if (maxF > (n + 1) / 2) { res[0] = '\\0'; return res; }
    int idx = 0;
    while (freq[maxIdx]-- > 0) { res[idx] = 'a' + maxIdx; idx += 2; }
    for (int i = 0; i < 26; i++)
        while (freq[i]-- > 0) { if (idx >= n) idx = 1; res[idx] = 'a' + i; idx += 2; }
    return res;
}`,
      cpp: `string reorganizeString(string s) {
    int freq[26] = {0}, maxF = 0, maxIdx = 0, n = s.size();
    for (char c : s) freq[c - 'a']++;
    for (int i = 0; i < 26; i++) if (freq[i] > maxF) { maxF = freq[i]; maxIdx = i; }
    if (maxF > (n + 1) / 2) return "";
    string res(n, ' '); int idx = 0;
    while (freq[maxIdx]-- > 0) { res[idx] = 'a' + maxIdx; idx += 2; }
    for (int i = 0; i < 26; i++)
        while (freq[i]-- > 0) { if (idx >= n) idx = 1; res[idx] = 'a' + i; idx += 2; }
    return res;
}`,
    },
    visualizationLink: null,
    tags: ['heap', 'greedy', 'string'],
  },

  // ══════════════════ BACKTRACKING ══════════════════

  {
    id: 'n-queens',
    title: 'N-Queens',
    difficulty: 'hard',
    topic: 'Backtracking',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Backtracking',
    approach: 'Place one queen per row, tracking used columns and both diagonals in boolean arrays so each placement is checked in O(1); recurse to the next row and undo on backtrack. Key insight: a queen at (r,c) owns diagonal r−c and anti-diagonal r+c, so three marker arrays detect every conflict instantly.',
    complexity: { time: 'O(n!)', space: 'O(n)' },
    code: {
      java: `int count;
public int totalNQueens(int n) {
    count = 0;
    solve(0, n, new boolean[n], new boolean[2*n], new boolean[2*n]);
    return count;
}
void solve(int r, int n, boolean[] col, boolean[] diag, boolean[] anti) {
    if (r == n) { count++; return; }
    for (int c = 0; c < n; c++) {
        int d = r - c + n, a = r + c;
        if (col[c] || diag[d] || anti[a]) continue;
        col[c] = diag[d] = anti[a] = true;
        solve(r + 1, n, col, diag, anti);
        col[c] = diag[d] = anti[a] = false;
    }
}`,
      c: `int count;
void solve(int r, int n, int* col, int* diag, int* anti) {
    if (r == n) { count++; return; }
    for (int c = 0; c < n; c++) {
        int d = r - c + n, a = r + c;
        if (col[c] || diag[d] || anti[a]) continue;
        col[c] = diag[d] = anti[a] = 1;
        solve(r + 1, n, col, diag, anti);
        col[c] = diag[d] = anti[a] = 0;
    }
}
int totalNQueens(int n) {
    count = 0;
    int* col = calloc(n, sizeof(int)); int* diag = calloc(2*n, sizeof(int)); int* anti = calloc(2*n, sizeof(int));
    solve(0, n, col, diag, anti);
    free(col); free(diag); free(anti); return count;
}`,
      cpp: `int count;
void solve(int r, int n, vector<bool>& col, vector<bool>& diag, vector<bool>& anti) {
    if (r == n) { count++; return; }
    for (int c = 0; c < n; c++) {
        int d = r - c + n, a = r + c;
        if (col[c] || diag[d] || anti[a]) continue;
        col[c] = diag[d] = anti[a] = true;
        solve(r + 1, n, col, diag, anti);
        col[c] = diag[d] = anti[a] = false;
    }
}
int totalNQueens(int n) {
    count = 0;
    vector<bool> col(n), diag(2*n), anti(2*n);
    solve(0, n, col, diag, anti);
    return count;
}`,
    },
    visualizationLink: '/algorithm/backtracking/nQueens',
    tags: ['backtracking', 'constraint', 'sets'],
  },

  {
    id: 'sudoku-solver',
    title: 'Sudoku Solver',
    difficulty: 'hard',
    topic: 'Backtracking',
    companies: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
    pattern: 'Backtracking',
    approach: 'Find the next empty cell, try digits 1–9 that satisfy the row, column, and 3×3 box constraints, recurse, and revert the cell if the branch fails. Key insight: depth-first search with per-cell constraint checking prunes the vast majority of digit combinations.',
    complexity: { time: 'O(9^m), m = empty cells', space: 'O(1)' },
    code: {
      java: `public void solveSudoku(char[][] b) { solve(b); }
boolean solve(char[][] b) {
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++)
            if (b[r][c] == '.') {
                for (char d = '1'; d <= '9'; d++)
                    if (valid(b, r, c, d)) {
                        b[r][c] = d;
                        if (solve(b)) return true;
                        b[r][c] = '.';
                    }
                return false;
            }
    return true;
}
boolean valid(char[][] b, int r, int c, char d) {
    for (int i = 0; i < 9; i++)
        if (b[r][i] == d || b[i][c] == d || b[3*(r/3)+i/3][3*(c/3)+i%3] == d) return false;
    return true;
}`,
      c: `bool valid(char b[9][9], int r, int c, char d) {
    for (int i = 0; i < 9; i++)
        if (b[r][i] == d || b[i][c] == d || b[3*(r/3)+i/3][3*(c/3)+i%3] == d) return false;
    return true;
}
bool solve(char b[9][9]) {
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++)
            if (b[r][c] == '.') {
                for (char d = '1'; d <= '9'; d++)
                    if (valid(b, r, c, d)) {
                        b[r][c] = d;
                        if (solve(b)) return true;
                        b[r][c] = '.';
                    }
                return false;
            }
    return true;
}`,
      cpp: `bool valid(vector<vector<char>>& b, int r, int c, char d) {
    for (int i = 0; i < 9; i++)
        if (b[r][i] == d || b[i][c] == d || b[3*(r/3)+i/3][3*(c/3)+i%3] == d) return false;
    return true;
}
bool solve(vector<vector<char>>& b) {
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++)
            if (b[r][c] == '.') {
                for (char d = '1'; d <= '9'; d++)
                    if (valid(b, r, c, d)) {
                        b[r][c] = d;
                        if (solve(b)) return true;
                        b[r][c] = '.';
                    }
                return false;
            }
    return true;
}
void solveSudoku(vector<vector<char>>& board) { solve(board); }`,
    },
    visualizationLink: '/algorithm/backtracking/sudokuSolver',
    tags: ['backtracking', 'constraint', 'grid'],
  },

  {
    id: 'generate-parentheses',
    title: 'Generate Parentheses',
    difficulty: 'medium',
    topic: 'Backtracking',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Backtracking',
    approach: 'Grow the string one bracket at a time, allowed to add "(" while open < n and ")" only while close < open; record the string once it reaches length 2n. Key insight: enforcing close < open prunes every invalid prefix, so only the Catalan-many valid combinations are ever built.',
    complexity: { time: 'O(4ⁿ / √n)', space: 'O(n)' },
    code: {
      java: `public List<String> generateParenthesis(int n) {
    List<String> res = new ArrayList<>();
    bt(res, new StringBuilder(), 0, 0, n);
    return res;
}
void bt(List<String> res, StringBuilder sb, int open, int close, int n) {
    if (sb.length() == 2 * n) { res.add(sb.toString()); return; }
    if (open < n) { sb.append('('); bt(res, sb, open+1, close, n); sb.deleteCharAt(sb.length()-1); }
    if (close < open) { sb.append(')'); bt(res, sb, open, close+1, n); sb.deleteCharAt(sb.length()-1); }
}`,
      c: `void bt(char* buf, int pos, int open, int close, int n, char** res, int* cnt) {
    if (pos == 2 * n) { buf[pos] = '\\0'; res[*cnt] = strdup(buf); (*cnt)++; return; }
    if (open < n)     { buf[pos] = '('; bt(buf, pos+1, open+1, close, n, res, cnt); }
    if (close < open) { buf[pos] = ')'; bt(buf, pos+1, open, close+1, n, res, cnt); }
}
char** generateParenthesis(int n, int* retSize) {
    char** res = malloc(2000 * sizeof(char*)); char buf[40]; int cnt = 0;
    bt(buf, 0, 0, 0, n, res, &cnt);
    *retSize = cnt; return res;
}`,
      cpp: `vector<string> generateParenthesis(int n) {
    vector<string> res; string cur;
    function<void(int,int)> bt = [&](int open, int close) {
        if ((int)cur.size() == 2 * n) { res.push_back(cur); return; }
        if (open < n)     { cur += '('; bt(open+1, close); cur.pop_back(); }
        if (close < open) { cur += ')'; bt(open, close+1); cur.pop_back(); }
    };
    bt(0, 0); return res;
}`,
    },
    visualizationLink: null,
    tags: ['backtracking', 'string', 'catalan'],
  },

  {
    id: 'permutations',
    title: 'Permutations',
    difficulty: 'medium',
    topic: 'Backtracking',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Backtracking',
    approach: 'Fix each position by swapping the current index with every index from it onward, recursing on the next position, then swapping back to restore order. Key insight: in-place swapping enumerates all n! orderings without needing a separate "used" set.',
    complexity: { time: 'O(n! · n)', space: 'O(n)' },
    code: {
      java: `public List<List<Integer>> permute(int[] a) {
    List<List<Integer>> res = new ArrayList<>();
    bt(a, 0, res);
    return res;
}
void bt(int[] a, int k, List<List<Integer>> res) {
    if (k == a.length) {
        List<Integer> p = new ArrayList<>();
        for (int x : a) p.add(x);
        res.add(p); return;
    }
    for (int i = k; i < a.length; i++) { swap(a, k, i); bt(a, k+1, res); swap(a, k, i); }
}
void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }`,
      c: `void bt(int* a, int n, int k, int out[][20], int* cnt) {
    if (k == n) { for (int i = 0; i < n; i++) out[*cnt][i] = a[i]; (*cnt)++; return; }
    for (int i = k; i < n; i++) {
        int t = a[k]; a[k] = a[i]; a[i] = t;
        bt(a, n, k+1, out, cnt);
        t = a[k]; a[k] = a[i]; a[i] = t;
    }
}
int permute(int* a, int n, int out[][20]) { int cnt = 0; bt(a, n, 0, out, &cnt); return cnt; }`,
      cpp: `vector<vector<int>> permute(vector<int>& a) {
    vector<vector<int>> res;
    function<void(int)> bt = [&](int k) {
        if (k == (int)a.size()) { res.push_back(a); return; }
        for (int i = k; i < (int)a.size(); i++) { swap(a[k], a[i]); bt(k+1); swap(a[k], a[i]); }
    };
    bt(0); return res;
}`,
    },
    visualizationLink: '/algorithm/backtracking/permutations',
    tags: ['backtracking', 'swap', 'permutation'],
  },

  {
    id: 'subsets',
    title: 'Subsets',
    difficulty: 'medium',
    topic: 'Backtracking',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Backtracking',
    approach: 'DFS over a start index: record the current selection at every node, then branch by including each later element in turn and backtracking. Key insight: with no length constraint, every node of the include/exclude recursion tree is itself a valid subset, yielding all 2ⁿ of them.',
    complexity: { time: 'O(2ⁿ · n)', space: 'O(n)' },
    code: {
      java: `public List<List<Integer>> subsets(int[] a) {
    List<List<Integer>> res = new ArrayList<>();
    bt(a, 0, new ArrayList<>(), res);
    return res;
}
void bt(int[] a, int start, List<Integer> cur, List<List<Integer>> res) {
    res.add(new ArrayList<>(cur));
    for (int i = start; i < a.length; i++) { cur.add(a[i]); bt(a, i+1, cur, res); cur.remove(cur.size()-1); }
}`,
      c: `void bt(int* a, int n, int start, int* cur, int d, int out[][20], int* sizes, int* cnt) {
    for (int i = 0; i < d; i++) out[*cnt][i] = cur[i];
    sizes[*cnt] = d; (*cnt)++;
    for (int i = start; i < n; i++) { cur[d] = a[i]; bt(a, n, i+1, cur, d+1, out, sizes, cnt); }
}
int subsets(int* a, int n, int out[][20], int* sizes) {
    int cur[20], cnt = 0; bt(a, n, 0, cur, 0, out, sizes, &cnt); return cnt;
}`,
      cpp: `vector<vector<int>> subsets(vector<int>& a) {
    vector<vector<int>> res; vector<int> cur;
    function<void(int)> bt = [&](int start) {
        res.push_back(cur);
        for (int i = start; i < (int)a.size(); i++) { cur.push_back(a[i]); bt(i+1); cur.pop_back(); }
    };
    bt(0); return res;
}`,
    },
    visualizationLink: null,
    tags: ['backtracking', 'include-exclude', 'subsets'],
  },

  {
    id: 'word-search',
    title: 'Word Search',
    difficulty: 'medium',
    topic: 'Backtracking',
    companies: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
    pattern: 'DFS Backtracking',
    approach: 'From each cell that matches the first letter, DFS in four directions matching successive letters, temporarily marking the visited cell and restoring it on the way back. Key insight: mutating the cell to a sentinel acts as an in-place visited flag, and restoring it on backtrack frees the cell for other paths.',
    complexity: { time: 'O(m·n·4ᴸ)', space: 'O(L)' },
    code: {
      java: `public boolean exist(char[][] board, String word) {
    for (int i = 0; i < board.length; i++)
        for (int j = 0; j < board[0].length; j++)
            if (dfs(board, word, i, j, 0)) return true;
    return false;
}
boolean dfs(char[][] b, String w, int i, int j, int k) {
    if (k == w.length()) return true;
    if (i < 0 || i >= b.length || j < 0 || j >= b[0].length || b[i][j] != w.charAt(k)) return false;
    char tmp = b[i][j]; b[i][j] = '#';
    boolean found = dfs(b,w,i+1,j,k+1) || dfs(b,w,i-1,j,k+1) || dfs(b,w,i,j+1,k+1) || dfs(b,w,i,j-1,k+1);
    b[i][j] = tmp;
    return found;
}`,
      c: `bool dfs(char** b, int m, int n, char* w, int i, int j, int k) {
    if (w[k] == '\\0') return true;
    if (i < 0 || i >= m || j < 0 || j >= n || b[i][j] != w[k]) return false;
    char tmp = b[i][j]; b[i][j] = '#';
    bool found = dfs(b,m,n,w,i+1,j,k+1) || dfs(b,m,n,w,i-1,j,k+1) || dfs(b,m,n,w,i,j+1,k+1) || dfs(b,m,n,w,i,j-1,k+1);
    b[i][j] = tmp;
    return found;
}
bool exist(char** board, int m, int n, char* word) {
    for (int i = 0; i < m; i++) for (int j = 0; j < n; j++)
        if (dfs(board, m, n, word, i, j, 0)) return true;
    return false;
}`,
      cpp: `bool exist(vector<vector<char>>& board, string word) {
    int m = board.size(), n = board[0].size();
    function<bool(int,int,int)> dfs = [&](int i, int j, int k) {
        if (k == (int)word.size()) return true;
        if (i < 0 || i >= m || j < 0 || j >= n || board[i][j] != word[k]) return false;
        char tmp = board[i][j]; board[i][j] = '#';
        bool found = dfs(i+1,j,k+1) || dfs(i-1,j,k+1) || dfs(i,j+1,k+1) || dfs(i,j-1,k+1);
        board[i][j] = tmp;
        return found;
    };
    for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) if (dfs(i, j, 0)) return true;
    return false;
}`,
    },
    visualizationLink: '/algorithm/backtracking/wordSearch',
    tags: ['backtracking', 'dfs', 'grid'],
  },

  // ══════════════════ FUNDAMENTALS ══════════════════

  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    difficulty: 'easy',
    topic: 'Fundamentals',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Simulation',
    approach: 'Loop 1..n and test divisibility by 15 first, then 3, then 5, falling back to the number itself. Key insight: checking 15 before 3 and 5 prevents the single-factor cases from shadowing the combined "FizzBuzz" case.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public List<String> fizzBuzz(int n) {
    List<String> res = new ArrayList<>();
    for (int i = 1; i <= n; i++) {
        if (i % 15 == 0) res.add("FizzBuzz");
        else if (i % 3 == 0) res.add("Fizz");
        else if (i % 5 == 0) res.add("Buzz");
        else res.add(String.valueOf(i));
    }
    return res;
}`,
      c: `void fizzBuzz(int n) {
    for (int i = 1; i <= n; i++) {
        if (i % 15 == 0) printf("FizzBuzz\\n");
        else if (i % 3 == 0) printf("Fizz\\n");
        else if (i % 5 == 0) printf("Buzz\\n");
        else printf("%d\\n", i);
    }
}`,
      cpp: `vector<string> fizzBuzz(int n) {
    vector<string> res;
    for (int i = 1; i <= n; i++) {
        if (i % 15 == 0) res.push_back("FizzBuzz");
        else if (i % 3 == 0) res.push_back("Fizz");
        else if (i % 5 == 0) res.push_back("Buzz");
        else res.push_back(to_string(i));
    }
    return res;
}`,
    },
    visualizationLink: '/algorithm/fundamentals/fizzBuzz',
    tags: ['fundamentals', 'modulo', 'simulation'],
  },

  {
    id: 'fibonacci-optimized',
    title: 'Fibonacci Number (Optimized)',
    difficulty: 'easy',
    topic: 'Fundamentals',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Dynamic Programming',
    approach: 'Iterate from the bottom keeping only the previous two values and rolling them forward, avoiding the exponential recomputation of naive recursion. Key insight: F(n) depends solely on F(n−1) and F(n−2), so two variables and O(1) space suffice (matrix exponentiation pushes it to O(log n)).',
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public int fib(int n) {
    if (n < 2) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }
    return b;
}`,
      c: `int fib(int n) {
    if (n < 2) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }
    return b;
}`,
      cpp: `int fib(int n) {
    if (n < 2) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }
    return b;
}`,
    },
    visualizationLink: '/algorithm/fundamentals/fibonacci',
    tags: ['fundamentals', 'dp', 'fibonacci'],
  },

  {
    id: 'fast-exponentiation',
    title: 'Fast Exponentiation (Power Function)',
    difficulty: 'medium',
    topic: 'Fundamentals',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Divide and Conquer',
    approach: 'Binary exponentiation: scan the exponent bit by bit, squaring the base each step and multiplying it into the result whenever the current bit is set; invert the base for negative exponents. Key insight: x^n only needs O(log n) multiplications because each bit of n doubles the achievable power via squaring.',
    complexity: { time: 'O(log n)', space: 'O(1)' },
    code: {
      java: `public double myPow(double x, long n) {
    if (n < 0) { x = 1 / x; n = -n; }
    double res = 1;
    while (n > 0) {
        if ((n & 1) == 1) res *= x;
        x *= x; n >>= 1;
    }
    return res;
}`,
      c: `double myPow(double x, long n) {
    if (n < 0) { x = 1 / x; n = -n; }
    double res = 1;
    while (n > 0) {
        if (n & 1) res *= x;
        x *= x; n >>= 1;
    }
    return res;
}`,
      cpp: `double myPow(double x, long n) {
    if (n < 0) { x = 1 / x; n = -n; }
    double res = 1;
    while (n > 0) {
        if (n & 1) res *= x;
        x *= x; n >>= 1;
    }
    return res;
}`,
    },
    visualizationLink: '/algorithm/fundamentals/power',
    tags: ['fundamentals', 'divide-conquer', 'math'],
  },

  {
    id: 'gcd-algorithm',
    title: 'Greatest Common Divisor (Euclidean)',
    difficulty: 'easy',
    topic: 'Fundamentals',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Math',
    approach: 'Repeatedly replace (a, b) with (b, a mod b) until b is zero, at which point a is the GCD. Key insight: any common divisor of a and b also divides a mod b, so the remainder step preserves the GCD while shrinking the numbers fast.',
    complexity: { time: 'O(log min(a,b))', space: 'O(1)' },
    code: {
      java: `public int gcd(int a, int b) {
    while (b != 0) { int t = b; b = a % b; a = t; }
    return a;
}`,
      c: `int gcd(int a, int b) {
    while (b != 0) { int t = b; b = a % b; a = t; }
    return a;
}`,
      cpp: `int gcd(int a, int b) {
    while (b != 0) { int t = b; b = a % b; a = t; }
    return a;
}`,
    },
    visualizationLink: '/algorithm/fundamentals/gcd',
    tags: ['fundamentals', 'math', 'recursion'],
  },

  {
    id: 'prime-sieve',
    title: 'Sieve of Eratosthenes',
    difficulty: 'medium',
    topic: 'Fundamentals',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Sieve',
    approach: 'Mark a boolean array: for each unmarked p starting at 2, cross out all its multiples beginning at p². Whatever stays unmarked is prime. Key insight: starting at p² skips multiples already crossed by smaller primes, giving the near-linear O(n log log n) running time.',
    complexity: { time: 'O(n log log n)', space: 'O(n)' },
    code: {
      java: `public List<Integer> sieve(int n) {
    boolean[] composite = new boolean[n + 1];
    List<Integer> primes = new ArrayList<>();
    for (int p = 2; p <= n; p++)
        if (!composite[p]) {
            primes.add(p);
            for (long m = (long)p * p; m <= n; m += p) composite[(int)m] = true;
        }
    return primes;
}`,
      c: `int sieve(int n, int* primes) {
    char* composite = calloc(n + 1, 1); int cnt = 0;
    for (int p = 2; p <= n; p++)
        if (!composite[p]) {
            primes[cnt++] = p;
            for (long m = (long)p * p; m <= n; m += p) composite[m] = 1;
        }
    free(composite); return cnt;
}`,
      cpp: `vector<int> sieve(int n) {
    vector<bool> composite(n + 1, false);
    vector<int> primes;
    for (int p = 2; p <= n; p++)
        if (!composite[p]) {
            primes.push_back(p);
            for (long m = (long)p * p; m <= n; m += p) composite[m] = true;
        }
    return primes;
}`,
    },
    visualizationLink: null,
    tags: ['fundamentals', 'math', 'primes'],
  },

  {
    id: 'reverse-integer',
    title: 'Reverse Integer',
    difficulty: 'medium',
    topic: 'Fundamentals',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Math',
    approach: 'Peel off the last digit with %10 and rebuild the reversed value as res = res*10 + digit, checking before each multiply that it will not overflow the 32-bit range. Key insight: testing res against INT_MAX/10 (and INT_MIN/10) before multiplying prevents undefined overflow rather than detecting it too late.',
    complexity: { time: 'O(log x)', space: 'O(1)' },
    code: {
      java: `public int reverse(int x) {
    int res = 0;
    while (x != 0) {
        int digit = x % 10; x /= 10;
        if (res > Integer.MAX_VALUE/10 || res < Integer.MIN_VALUE/10) return 0;
        res = res * 10 + digit;
    }
    return res;
}`,
      c: `int reverse(int x) {
    int res = 0;
    while (x != 0) {
        int digit = x % 10; x /= 10;
        if (res > INT_MAX/10 || res < INT_MIN/10) return 0;
        res = res * 10 + digit;
    }
    return res;
}`,
      cpp: `int reverse(int x) {
    int res = 0;
    while (x != 0) {
        int digit = x % 10; x /= 10;
        if (res > INT_MAX/10 || res < INT_MIN/10) return 0;
        res = res * 10 + digit;
    }
    return res;
}`,
    },
    visualizationLink: null,
    tags: ['fundamentals', 'math', 'overflow'],
  },

  // ══════════════════ ADVANCED ══════════════════

  {
    id: 'kmp-string-matching',
    title: 'KMP String Matching',
    difficulty: 'hard',
    topic: 'Advanced',
    companies: ['Google', 'Amazon', 'Microsoft'],
    pattern: 'KMP',
    approach: 'Precompute an LPS array giving, for each pattern prefix, the longest proper prefix that is also a suffix; while scanning the text, on a mismatch jump the pattern pointer back using LPS instead of restarting. Key insight: the LPS tells you how much of the pattern is already matched, so the text pointer never moves backward — giving O(n+m).',
    complexity: { time: 'O(n + m)', space: 'O(m)' },
    code: {
      java: `public int strStr(String text, String pat) {
    int n = text.length(), m = pat.length();
    if (m == 0) return 0;
    int[] lps = new int[m];
    for (int i = 1, len = 0; i < m; ) {
        if (pat.charAt(i) == pat.charAt(len)) lps[i++] = ++len;
        else if (len > 0) len = lps[len-1];
        else lps[i++] = 0;
    }
    for (int i = 0, j = 0; i < n; ) {
        if (text.charAt(i) == pat.charAt(j)) { i++; j++; if (j == m) return i - m; }
        else if (j > 0) j = lps[j-1];
        else i++;
    }
    return -1;
}`,
      c: `int strStr(char* text, char* pat) {
    int n = strlen(text), m = strlen(pat);
    if (m == 0) return 0;
    int* lps = calloc(m, sizeof(int));
    for (int i = 1, len = 0; i < m; ) {
        if (pat[i] == pat[len]) lps[i++] = ++len;
        else if (len > 0) len = lps[len-1];
        else lps[i++] = 0;
    }
    for (int i = 0, j = 0; i < n; ) {
        if (text[i] == pat[j]) { i++; j++; if (j == m) { free(lps); return i - m; } }
        else if (j > 0) j = lps[j-1];
        else i++;
    }
    free(lps); return -1;
}`,
      cpp: `int strStr(string text, string pat) {
    int n = text.size(), m = pat.size();
    if (m == 0) return 0;
    vector<int> lps(m, 0);
    for (int i = 1, len = 0; i < m; ) {
        if (pat[i] == pat[len]) lps[i++] = ++len;
        else if (len > 0) len = lps[len-1];
        else lps[i++] = 0;
    }
    for (int i = 0, j = 0; i < n; ) {
        if (text[i] == pat[j]) { i++; j++; if (j == m) return i - m; }
        else if (j > 0) j = lps[j-1];
        else i++;
    }
    return -1;
}`,
    },
    visualizationLink: '/algorithm/advanced/kmp',
    tags: ['advanced', 'string', 'pattern-matching'],
  },

  {
    id: 'segment-tree',
    title: 'Segment Tree (Range Query)',
    difficulty: 'hard',
    topic: 'Advanced',
    companies: ['Google', 'Amazon', 'Microsoft'],
    pattern: 'Segment Tree',
    approach: 'Store the array in the leaves of an iterative segment tree (size 2n) and set each internal node to the aggregate of its two children; a range query walks up from both ends combining only the segments that fall inside the range. Key insight: every range decomposes into O(log n) precomputed nodes, so queries and point updates are both logarithmic.',
    complexity: { time: 'O(n) build, O(log n) query/update', space: 'O(n)' },
    code: {
      java: `class SegTree {
    int[] tree; int n;
    SegTree(int[] a) {
        n = a.length; tree = new int[2 * n];
        for (int i = 0; i < n; i++) tree[n + i] = a[i];
        for (int i = n - 1; i > 0; i--) tree[i] = tree[2*i] + tree[2*i+1];
    }
    void update(int i, int val) {
        for (tree[i += n] = val, i /= 2; i > 0; i /= 2) tree[i] = tree[2*i] + tree[2*i+1];
    }
    int query(int l, int r) {   // sum of [l, r)
        int sum = 0;
        for (l += n, r += n; l < r; l /= 2, r /= 2) {
            if ((l & 1) == 1) sum += tree[l++];
            if ((r & 1) == 1) sum += tree[--r];
        }
        return sum;
    }
}`,
      c: `static int* tree; static int N;
void build(int* a, int n) {
    N = n; tree = malloc(2 * n * sizeof(int));
    for (int i = 0; i < n; i++) tree[n + i] = a[i];
    for (int i = n - 1; i > 0; i--) tree[i] = tree[2*i] + tree[2*i+1];
}
void update(int i, int val) {
    for (tree[i += N] = val, i /= 2; i > 0; i /= 2) tree[i] = tree[2*i] + tree[2*i+1];
}
int query(int l, int r) {   /* sum of [l, r) */
    int sum = 0;
    for (l += N, r += N; l < r; l /= 2, r /= 2) {
        if (l & 1) sum += tree[l++];
        if (r & 1) sum += tree[--r];
    }
    return sum;
}`,
      cpp: `struct SegTree {
    vector<int> tree; int n;
    SegTree(vector<int>& a) : n(a.size()), tree(2 * a.size()) {
        for (int i = 0; i < n; i++) tree[n + i] = a[i];
        for (int i = n - 1; i > 0; i--) tree[i] = tree[2*i] + tree[2*i+1];
    }
    void update(int i, int val) {
        for (tree[i += n] = val, i /= 2; i > 0; i /= 2) tree[i] = tree[2*i] + tree[2*i+1];
    }
    int query(int l, int r) {   // sum of [l, r)
        int sum = 0;
        for (l += n, r += n; l < r; l /= 2, r /= 2) {
            if (l & 1) sum += tree[l++];
            if (r & 1) sum += tree[--r];
        }
        return sum;
    }
};`,
    },
    visualizationLink: '/algorithm/trees/segmentTree',
    tags: ['advanced', 'tree', 'range-query'],
  },

  {
    id: 'trie-insert-search',
    title: 'Trie Insert and Search',
    difficulty: 'medium',
    topic: 'Advanced',
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    pattern: 'Trie',
    approach: 'Each node holds 26 child links and an end-of-word flag; insert walks/creates a path letter by letter and flags the final node, while search walks the same path and checks the flag. Key insight: shared prefixes collapse into shared paths, so insert and lookup cost O(L) regardless of how many words are stored.',
    complexity: { time: 'O(L) per op', space: 'O(N·L)' },
    code: {
      java: `class Trie {
    Trie[] child = new Trie[26];
    boolean isEnd;
    public void insert(String w) {
        Trie node = this;
        for (char c : w.toCharArray()) {
            if (node.child[c-'a'] == null) node.child[c-'a'] = new Trie();
            node = node.child[c-'a'];
        }
        node.isEnd = true;
    }
    public boolean search(String w) {
        Trie node = this;
        for (char c : w.toCharArray()) {
            if (node.child[c-'a'] == null) return false;
            node = node.child[c-'a'];
        }
        return node.isEnd;
    }
}`,
      c: `typedef struct Trie { struct Trie* child[26]; bool isEnd; } Trie;
Trie* trieNew() { return calloc(1, sizeof(Trie)); }
void insert(Trie* root, char* w) {
    Trie* node = root;
    for (int i = 0; w[i]; i++) {
        int c = w[i] - 'a';
        if (!node->child[c]) node->child[c] = trieNew();
        node = node->child[c];
    }
    node->isEnd = true;
}
bool search(Trie* root, char* w) {
    Trie* node = root;
    for (int i = 0; w[i]; i++) {
        int c = w[i] - 'a';
        if (!node->child[c]) return false;
        node = node->child[c];
    }
    return node->isEnd;
}`,
      cpp: `struct Trie {
    Trie* child[26] = {};
    bool isEnd = false;
    void insert(string w) {
        Trie* node = this;
        for (char c : w) {
            if (!node->child[c-'a']) node->child[c-'a'] = new Trie();
            node = node->child[c-'a'];
        }
        node->isEnd = true;
    }
    bool search(string w) {
        Trie* node = this;
        for (char c : w) {
            if (!node->child[c-'a']) return false;
            node = node->child[c-'a'];
        }
        return node->isEnd;
    }
};`,
    },
    visualizationLink: '/algorithm/trees/trie',
    tags: ['advanced', 'trie', 'string', 'prefix'],
  },

  {
    id: 'lfu-cache',
    title: 'LFU Cache',
    difficulty: 'hard',
    topic: 'Advanced',
    companies: ['Google', 'Amazon', 'Meta'],
    pattern: 'HashMap + Frequency Buckets',
    approach: 'Keep a value map, a use-count map, and per-frequency ordered buckets plus a running minimum frequency; every access bumps a key into the next bucket, and eviction removes the oldest key from the lowest-frequency bucket. Key insight: ordered buckets per frequency break ties by recency, so the least-frequently (then least-recently) used victim is found in O(1).',
    complexity: { time: 'O(1) per op', space: 'O(capacity)' },
    code: {
      java: `class LFUCache {
    Map<Integer,Integer> vals = new HashMap<>(), counts = new HashMap<>();
    Map<Integer, LinkedHashSet<Integer>> lists = new HashMap<>();
    int cap, min;
    LFUCache(int capacity) { cap = capacity; lists.put(1, new LinkedHashSet<>()); }
    public int get(int key) {
        if (!vals.containsKey(key)) return -1;
        int c = counts.get(key); counts.put(key, c + 1);
        lists.get(c).remove(key);
        if (c == min && lists.get(c).isEmpty()) min++;
        lists.computeIfAbsent(c + 1, k -> new LinkedHashSet<>()).add(key);
        return vals.get(key);
    }
    public void put(int key, int value) {
        if (cap <= 0) return;
        if (vals.containsKey(key)) { vals.put(key, value); get(key); return; }
        if (vals.size() >= cap) {
            int evict = lists.get(min).iterator().next();
            lists.get(min).remove(evict); vals.remove(evict); counts.remove(evict);
        }
        vals.put(key, value); counts.put(key, 1); min = 1;
        lists.computeIfAbsent(1, k -> new LinkedHashSet<>()).add(key);
    }
}`,
      c: `/* O(capacity) array variant: evict by (lowest freq, oldest access time). */
typedef struct { int key, val, freq, time, used; } Entry;
static Entry* T; static int CAP, CLK;
void lfuInit(int capacity) { CAP = capacity; CLK = 0; T = calloc(capacity, sizeof(Entry)); }
int lfuGet(int key) {
    for (int i = 0; i < CAP; i++)
        if (T[i].used && T[i].key == key) { T[i].freq++; T[i].time = ++CLK; return T[i].val; }
    return -1;
}
void lfuPut(int key, int val) {
    if (CAP <= 0) return;
    for (int i = 0; i < CAP; i++)
        if (T[i].used && T[i].key == key) { T[i].val = val; T[i].freq++; T[i].time = ++CLK; return; }
    int slot = -1;
    for (int i = 0; i < CAP; i++) if (!T[i].used) { slot = i; break; }
    if (slot < 0) {
        slot = 0;
        for (int i = 1; i < CAP; i++)
            if (T[i].freq < T[slot].freq || (T[i].freq == T[slot].freq && T[i].time < T[slot].time)) slot = i;
    }
    T[slot] = (Entry){ key, val, 1, ++CLK, 1 };
}`,
      cpp: `class LFUCache {
    unordered_map<int,int> vals, counts;
    unordered_map<int, list<int>> lists;
    unordered_map<int, list<int>::iterator> iters;
    int cap, minF = 0;
public:
    LFUCache(int capacity) : cap(capacity) {}
    int get(int key) {
        if (!vals.count(key)) return -1;
        int c = counts[key]++;
        lists[c].erase(iters[key]);
        if (lists[c].empty() && minF == c) minF++;
        lists[c+1].push_front(key); iters[key] = lists[c+1].begin();
        return vals[key];
    }
    void put(int key, int value) {
        if (cap <= 0) return;
        if (vals.count(key)) { vals[key] = value; get(key); return; }
        if ((int)vals.size() >= cap) {
            int evict = lists[minF].back(); lists[minF].pop_back();
            vals.erase(evict); counts.erase(evict); iters.erase(evict);
        }
        vals[key] = value; counts[key] = 1; minF = 1;
        lists[1].push_front(key); iters[key] = lists[1].begin();
    }
};`,
    },
    visualizationLink: null,
    tags: ['advanced', 'design', 'hashmap', 'frequency'],
  },

  {
    id: 'skyline-problem',
    title: 'The Skyline Problem',
    difficulty: 'hard',
    topic: 'Advanced',
    companies: ['Google', 'Amazon', 'Microsoft'],
    pattern: 'Sweep Line + Multiset',
    approach: 'Turn each building into a start event (height entering) and an end event (height leaving), sort the events by x, and sweep while maintaining a multiset of active heights; record a key point whenever the current tallest active height changes. Key insight: the skyline only changes when the maximum active height changes, so tracking that max across the sweep produces the outline.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    code: {
      java: `public List<List<Integer>> getSkyline(int[][] buildings) {
    List<int[]> events = new ArrayList<>();
    for (int[] b : buildings) { events.add(new int[]{b[0], -b[2]}); events.add(new int[]{b[1], b[2]}); }
    events.sort((a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
    TreeMap<Integer,Integer> heights = new TreeMap<>(); heights.put(0, 1);
    int prev = 0; List<List<Integer>> res = new ArrayList<>();
    for (int[] e : events) {
        if (e[1] < 0) heights.merge(-e[1], 1, Integer::sum);
        else if (heights.merge(e[1], -1, Integer::sum) == 0) heights.remove(e[1]);
        int cur = heights.lastKey();
        if (cur != prev) { res.add(Arrays.asList(e[0], cur)); prev = cur; }
    }
    return res;
}`,
      c: `int cmpEv(const void* a, const void* b) {
    const int* x = *(const int(*)[2])a; const int* y = *(const int(*)[2])b;
    return x[0] != y[0] ? x[0] - y[0] : x[1] - y[1];
}
/* O(n^2) variant: events + linear scan of active heights */
int** getSkyline(int buildings[][3], int n, int* retSize, int** colSizes) {
    int (*ev)[2] = malloc(2*n*sizeof(*ev)); int m = 0;
    for (int i = 0; i < n; i++) {
        ev[m][0]=buildings[i][0]; ev[m++][1]=-buildings[i][2];
        ev[m][0]=buildings[i][1]; ev[m++][1]= buildings[i][2];
    }
    qsort(ev, m, sizeof(*ev), cmpEv);
    int* active = malloc((m+1)*sizeof(int)); int as = 0; active[as++] = 0;
    int** res = malloc(m*sizeof(int*)); *colSizes = malloc(m*sizeof(int)); *retSize = 0; int prev = 0;
    for (int i = 0; i < m; i++) {
        int h = ev[i][1];
        if (h < 0) active[as++] = -h;
        else for (int j = 0; j < as; j++) if (active[j] == h) { active[j] = active[--as]; break; }
        int cur = 0; for (int j = 0; j < as; j++) if (active[j] > cur) cur = active[j];
        if (cur != prev) { res[*retSize] = malloc(2*sizeof(int)); res[*retSize][0]=ev[i][0]; res[*retSize][1]=cur; (*colSizes)[*retSize]=2; (*retSize)++; prev = cur; }
    }
    free(ev); free(active); return res;
}`,
      cpp: `vector<vector<int>> getSkyline(vector<vector<int>>& buildings) {
    vector<pair<int,int>> events;
    for (auto& b : buildings) { events.push_back({b[0], -b[2]}); events.push_back({b[1], b[2]}); }
    sort(events.begin(), events.end());
    multiset<int> heights = {0}; int prev = 0;
    vector<vector<int>> res;
    for (auto& [x, h] : events) {
        if (h < 0) heights.insert(-h);
        else heights.erase(heights.find(h));
        int cur = *heights.rbegin();
        if (cur != prev) { res.push_back({x, cur}); prev = cur; }
    }
    return res;
}`,
    },
    visualizationLink: null,
    tags: ['advanced', 'sweep-line', 'multiset'],
  },

  {
    id: 'convex-hull',
    title: 'Convex Hull (Andrew\'s Monotone Chain)',
    difficulty: 'hard',
    topic: 'Advanced',
    companies: ['Google', 'Amazon', 'Microsoft'],
    pattern: 'Computational Geometry',
    approach: 'Sort points by (x, then y) and build the lower hull left to right, then the upper hull right to left, popping any point that would create a non-counterclockwise turn (cross product ≤ 0). Key insight: keeping only left turns while sweeping the sorted points traces the hull boundary in O(n log n), dominated by the sort.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    code: {
      java: `public int[][] convexHull(int[][] pts) {
    Arrays.sort(pts, (a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
    int n = pts.length; if (n < 3) return pts;
    int[][] hull = new int[2 * n][2]; int k = 0;
    for (int i = 0; i < n; i++) {
        while (k >= 2 && cross(hull[k-2], hull[k-1], pts[i]) <= 0) k--;
        hull[k++] = pts[i];
    }
    for (int i = n - 2, t = k + 1; i >= 0; i--) {
        while (k >= t && cross(hull[k-2], hull[k-1], pts[i]) <= 0) k--;
        hull[k++] = pts[i];
    }
    return Arrays.copyOf(hull, k - 1);
}
long cross(int[] o, int[] a, int[] b) {
    return (long)(a[0]-o[0])*(b[1]-o[1]) - (long)(a[1]-o[1])*(b[0]-o[0]);
}`,
      c: `int cmpPt(const void* a, const void* b) {
    const int* x = *(const int(*)[2])a; const int* y = *(const int(*)[2])b;
    return x[0] != y[0] ? x[0] - y[0] : x[1] - y[1];
}
long cross(int* o, int* a, int* b) {
    return (long)(a[0]-o[0])*(b[1]-o[1]) - (long)(a[1]-o[1])*(b[0]-o[0]);
}
int convexHull(int pts[][2], int n, int hull[][2]) {
    qsort(pts, n, sizeof(pts[0]), cmpPt);
    if (n < 3) { for (int i = 0; i < n; i++) { hull[i][0]=pts[i][0]; hull[i][1]=pts[i][1]; } return n; }
    int k = 0;
    for (int i = 0; i < n; i++) {
        while (k >= 2 && cross(hull[k-2], hull[k-1], pts[i]) <= 0) k--;
        hull[k][0]=pts[i][0]; hull[k][1]=pts[i][1]; k++;
    }
    for (int i = n - 2, t = k + 1; i >= 0; i--) {
        while (k >= t && cross(hull[k-2], hull[k-1], pts[i]) <= 0) k--;
        hull[k][0]=pts[i][0]; hull[k][1]=pts[i][1]; k++;
    }
    return k - 1;
}`,
      cpp: `long cross(vector<int>& o, vector<int>& a, vector<int>& b) {
    return (long)(a[0]-o[0])*(b[1]-o[1]) - (long)(a[1]-o[1])*(b[0]-o[0]);
}
vector<vector<int>> convexHull(vector<vector<int>>& pts) {
    sort(pts.begin(), pts.end());
    int n = pts.size(); if (n < 3) return pts;
    vector<vector<int>> hull(2 * n); int k = 0;
    for (int i = 0; i < n; i++) {
        while (k >= 2 && cross(hull[k-2], hull[k-1], pts[i]) <= 0) k--;
        hull[k++] = pts[i];
    }
    for (int i = n - 2, t = k + 1; i >= 0; i--) {
        while (k >= t && cross(hull[k-2], hull[k-1], pts[i]) <= 0) k--;
        hull[k++] = pts[i];
    }
    hull.resize(k - 1);
    return hull;
}`,
    },
    visualizationLink: '/algorithm/advanced/convexHull',
    tags: ['advanced', 'geometry', 'sorting'],
  },

  // ══════════════════ GREEDY ══════════════════

  {
    id: 'jump-game',
    title: 'Jump Game',
    difficulty: 'medium',
    topic: 'Greedy',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Greedy',
    frequency: 4,
    algorithmLink: '/algorithm/greedy/activitySelection',
    complexity: { time: 'O(n)', space: 'O(1)' },
    answer: 'Approach: Track the furthest reachable index — if the current index ever exceeds it we cannot proceed. Key insight: Greedy works here because the furthest reachable index monotonically captures all possibilities. Time: O(n), Space: O(1)',
    approach: 'Track the farthest index reachable so far while scanning left to right; if you ever stand on an index beyond that reach, you are stuck. Key insight: greedily maintaining a single furthest-reach value captures every possibility, so reaching the last index is decidable in one pass.',
    tags: ['greedy', 'array', 'reachability'],
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

  {
    id: 'activity-selection',
    title: 'Activity Selection Problem',
    difficulty: 'easy',
    topic: 'Greedy',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Greedy',
    approach: 'Sort activities by finish time, then greedily take each one whose start is at or after the last chosen finish. Key insight: always picking the earliest-finishing compatible activity frees up the most remaining time for future picks, which is provably optimal.',
    complexity: { time: 'O(n log n)', space: 'O(1)' },
    code: {
      java: `public int activitySelection(int[][] acts) {   // acts[i] = {start, end}
    Arrays.sort(acts, (a, b) -> a[1] - b[1]);
    int count = 0, lastEnd = Integer.MIN_VALUE;
    for (int[] a : acts) if (a[0] >= lastEnd) { count++; lastEnd = a[1]; }
    return count;
}`,
      c: `int cmpEnd(const void* a, const void* b) { return (*(const int(*)[2])a)[1] - (*(const int(*)[2])b)[1]; }
int activitySelection(int acts[][2], int n) {
    qsort(acts, n, sizeof(acts[0]), cmpEnd);
    int count = 0, lastEnd = INT_MIN;
    for (int i = 0; i < n; i++) if (acts[i][0] >= lastEnd) { count++; lastEnd = acts[i][1]; }
    return count;
}`,
      cpp: `int activitySelection(vector<vector<int>>& acts) {   // {start, end}
    sort(acts.begin(), acts.end(), [](auto& a, auto& b){ return a[1] < b[1]; });
    int count = 0, lastEnd = INT_MIN;
    for (auto& a : acts) if (a[0] >= lastEnd) { count++; lastEnd = a[1]; }
    return count;
}`,
    },
    visualizationLink: '/algorithm/greedy/activitySelection',
    tags: ['greedy', 'sorting', 'intervals'],
  },

  {
    id: 'fractional-knapsack',
    title: 'Fractional Knapsack',
    difficulty: 'medium',
    topic: 'Greedy',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Greedy',
    approach: 'Sort items by value-to-weight ratio descending and take them whole until one no longer fits, then take a fraction of that item to fill the remaining capacity. Key insight: because fractions are allowed, greedily spending each unit of capacity on the densest remaining value is always optimal.',
    complexity: { time: 'O(n log n)', space: 'O(1)' },
    code: {
      java: `public double fractionalKnapsack(int[][] items, int cap) {   // items[i] = {value, weight}
    Arrays.sort(items, (a, b) -> Double.compare((double)b[0]/b[1], (double)a[0]/a[1]));
    double total = 0;
    for (int[] it : items) {
        if (cap >= it[1]) { total += it[0]; cap -= it[1]; }
        else { total += it[0] * ((double)cap / it[1]); break; }
    }
    return total;
}`,
      c: `int cmpRatio(const void* a, const void* b) {
    const int* x = *(const int(*)[2])a; const int* y = *(const int(*)[2])b;
    double rx = (double)x[0]/x[1], ry = (double)y[0]/y[1];
    return (ry > rx) - (ry < rx);
}
double fractionalKnapsack(int items[][2], int n, int cap) {
    qsort(items, n, sizeof(items[0]), cmpRatio);
    double total = 0;
    for (int i = 0; i < n; i++) {
        if (cap >= items[i][1]) { total += items[i][0]; cap -= items[i][1]; }
        else { total += items[i][0] * ((double)cap / items[i][1]); break; }
    }
    return total;
}`,
      cpp: `double fractionalKnapsack(vector<vector<int>>& items, int cap) {   // {value, weight}
    sort(items.begin(), items.end(), [](auto& a, auto& b){ return (double)a[0]/a[1] > (double)b[0]/b[1]; });
    double total = 0;
    for (auto& it : items) {
        if (cap >= it[1]) { total += it[0]; cap -= it[1]; }
        else { total += it[0] * ((double)cap / it[1]); break; }
    }
    return total;
}`,
    },
    visualizationLink: '/algorithm/greedy/fractionalKnapsack',
    tags: ['greedy', 'sorting', 'knapsack'],
  },

  {
    id: 'gas-station',
    title: 'Gas Station',
    difficulty: 'medium',
    topic: 'Greedy',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Greedy',
    approach: 'Sweep once tracking total surplus and a running tank; whenever the tank goes negative, no station up to here can be the start, so reset the candidate start to the next station and zero the tank. Key insight: a trip is possible iff total gas ≥ total cost, and the answer is the station right after the last deficit.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    code: {
      java: `public int canCompleteCircuit(int[] gas, int[] cost) {
    int total = 0, tank = 0, start = 0;
    for (int i = 0; i < gas.length; i++) {
        int diff = gas[i] - cost[i];
        total += diff; tank += diff;
        if (tank < 0) { start = i + 1; tank = 0; }
    }
    return total >= 0 ? start : -1;
}`,
      c: `int canCompleteCircuit(int* gas, int* cost, int n) {
    int total = 0, tank = 0, start = 0;
    for (int i = 0; i < n; i++) {
        int diff = gas[i] - cost[i];
        total += diff; tank += diff;
        if (tank < 0) { start = i + 1; tank = 0; }
    }
    return total >= 0 ? start : -1;
}`,
      cpp: `int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
    int total = 0, tank = 0, start = 0;
    for (int i = 0; i < (int)gas.size(); i++) {
        int diff = gas[i] - cost[i];
        total += diff; tank += diff;
        if (tank < 0) { start = i + 1; tank = 0; }
    }
    return total >= 0 ? start : -1;
}`,
    },
    visualizationLink: null,
    tags: ['greedy', 'circular', 'simulation'],
  },

  {
    id: 'assign-cookies',
    title: 'Assign Cookies',
    difficulty: 'easy',
    topic: 'Greedy',
    companies: ['Amazon', 'Google'],
    pattern: 'Greedy',
    approach: 'Sort children by greed and cookies by size, then two-pointer through them: give the current smallest cookie that satisfies the current least-greedy child, advancing the child only on success. Key insight: spending the smallest adequate cookie on the easiest child preserves bigger cookies for greedier children, maximizing the count.',
    complexity: { time: 'O(n log n)', space: 'O(1)' },
    code: {
      java: `public int findContentChildren(int[] g, int[] s) {
    Arrays.sort(g); Arrays.sort(s);
    int i = 0, j = 0;
    while (i < g.length && j < s.length) {
        if (s[j] >= g[i]) i++;
        j++;
    }
    return i;
}`,
      c: `int cmpInt(const void* a, const void* b) { return *(int*)a - *(int*)b; }
int findContentChildren(int* g, int gn, int* s, int sn) {
    qsort(g, gn, sizeof(int), cmpInt); qsort(s, sn, sizeof(int), cmpInt);
    int i = 0, j = 0;
    while (i < gn && j < sn) { if (s[j] >= g[i]) i++; j++; }
    return i;
}`,
      cpp: `int findContentChildren(vector<int>& g, vector<int>& s) {
    sort(g.begin(), g.end()); sort(s.begin(), s.end());
    int i = 0, j = 0;
    while (i < (int)g.size() && j < (int)s.size()) { if (s[j] >= g[i]) i++; j++; }
    return i;
}`,
    },
    visualizationLink: null,
    tags: ['greedy', 'sorting', 'two-pointer'],
  },

  {
    id: 'min-platforms',
    title: 'Minimum Number of Platforms Required',
    difficulty: 'medium',
    topic: 'Greedy',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Sorting + Two Pointers',
    approach: 'Sort arrival and departure times separately, then merge them with two pointers: take a platform on each arrival that precedes the next departure, free one otherwise, and track the running peak. Key insight: the answer is the largest number of trains present at once, which the merged event sweep measures directly.',
    complexity: { time: 'O(n log n)', space: 'O(1)' },
    code: {
      java: `public int minPlatforms(int[] arr, int[] dep) {
    Arrays.sort(arr); Arrays.sort(dep);
    int n = arr.length, plat = 0, max = 0, i = 0, j = 0;
    while (i < n) {
        if (arr[i] <= dep[j]) { plat++; i++; max = Math.max(max, plat); }
        else { plat--; j++; }
    }
    return max;
}`,
      c: `int cmpI(const void* a, const void* b) { return *(int*)a - *(int*)b; }
int minPlatforms(int* arr, int* dep, int n) {
    qsort(arr, n, sizeof(int), cmpI); qsort(dep, n, sizeof(int), cmpI);
    int plat = 0, max = 0, i = 0, j = 0;
    while (i < n) {
        if (arr[i] <= dep[j]) { if (++plat > max) max = plat; i++; }
        else { plat--; j++; }
    }
    return max;
}`,
      cpp: `int minPlatforms(vector<int>& arr, vector<int>& dep) {
    sort(arr.begin(), arr.end()); sort(dep.begin(), dep.end());
    int n = arr.size(), plat = 0, mx = 0, i = 0, j = 0;
    while (i < n) {
        if (arr[i] <= dep[j]) { mx = max(mx, ++plat); i++; }
        else { plat--; j++; }
    }
    return mx;
}`,
    },
    visualizationLink: null,
    tags: ['greedy', 'sorting', 'intervals'],
  },

  // ══════════════════ DESIGN ══════════════════

  {
    id: 'lru-cache',
    title: 'LRU Cache',
    difficulty: 'medium',
    topic: 'Design',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Uber'],
    pattern: 'HashMap + Doubly Linked List',
    frequency: 5,
    algorithmLink: '/algorithm/stacks-queues/lruCache',
    complexity: { time: 'O(1) get and put', space: 'O(capacity)' },
    answer: 'Approach: Combine a HashMap (O(1) lookup) with a doubly-linked list (O(1) insert/delete); most recently used goes to the head, least recently used evicts from the tail. Key insight: Dummy head and tail nodes eliminate edge cases in all pointer manipulations. Time: O(1), Space: O(capacity)',
    approach: 'Combine a hashmap (O(1) key lookup) with a doubly-linked list ordered by recency: on access move the node to the front, and when over capacity evict the tail. Key insight: the hashmap finds nodes instantly while the linked list maintains LRU order, so get and put are both O(1); dummy head/tail nodes remove edge cases.',
    tags: ['design', 'hashmap', 'doubly-linked-list', 'cache'],
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

]

/* Filter helpers */
export const DIFFICULTIES = ['easy', 'medium', 'hard']
export const TOPICS = [...new Set(interviewQuestions.map(q => q.topic))].sort()
export const PATTERNS = [...new Set(interviewQuestions.map(q => q.pattern).filter(Boolean))].sort()
/* Merge the Python solutions in, matching each question's existing storage shape
   (some questions use `code`, others use `solution`). */
for (const q of interviewQuestions) {
  const py = pythonSolutions[q.id]
  if (!py) continue
  if (q.code) q.code.python = py
  else if (q.solution) q.solution.python = py
  else q.code = { python: py }
}

export const COMPANIES = [...new Set(interviewQuestions.flatMap(q => q.companies))].sort()

export default interviewQuestions
