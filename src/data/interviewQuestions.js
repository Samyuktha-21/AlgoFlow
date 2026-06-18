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
    answer: 'Approach: Sort the array, then for each element fix it and use two pointers on the remaining subarray to find pairs summing to its negation. Key insight: Sorting enables duplicate skipping — advance pointers past equal values to avoid duplicate triplets. Time: O(n²), Space: O(1)',
    tags: ['array', 'two-pointer', 'sorting'],
  },

  {
    id: 'rotate-array',
    title: 'Rotate Array',
    difficulty: 'medium',
    topic: 'Array',
    companies: ['Microsoft', 'Amazon', 'Adobe'],
    pattern: 'Reversal',
    answer: 'Approach: Reverse the whole array, then reverse the first k elements, then reverse the remaining n-k elements. Key insight: Three reversals achieve any rotation in O(1) space without extra memory. Time: O(n), Space: O(1)',
    tags: ['array', 'reversal', 'in-place'],
  },

  {
    id: 'find-duplicate-number',
    title: 'Find the Duplicate Number',
    difficulty: 'medium',
    topic: 'Array',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: "Floyd's Cycle Detection",
    answer: "Approach: Treat array values as pointers to indices forming a linked list; use Floyd's slow/fast pointer to detect the cycle entry point, which is the duplicate. Key insight: The duplicate creates a cycle — the entrance to that cycle is the repeated value. Time: O(n), Space: O(1)",
    tags: ['array', 'cycle-detection', 'two-pointer'],
  },

  {
    id: 'sliding-window-maximum',
    title: 'Sliding Window Maximum',
    difficulty: 'hard',
    topic: 'Array',
    companies: ['Google', 'Amazon'],
    pattern: 'Monotonic Deque',
    answer: 'Approach: Maintain a monotonic decreasing deque of indices; add new elements by removing smaller ones from the back, remove elements outside the window from the front, front always holds the maximum. Key insight: The deque is always monotonically decreasing so the max is always at the front. Time: O(n), Space: O(k)',
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
    answer: 'Approach: Count character frequencies of both strings using a 26-element array; the strings are anagrams if all counts are zero after incrementing for s and decrementing for t. Key insight: Frequency count comparison in O(1) space for lowercase letters. Time: O(n), Space: O(1)',
    tags: ['string', 'hashmap', 'frequency'],
  },

  {
    id: 'group-anagrams',
    title: 'Group Anagrams',
    difficulty: 'medium',
    topic: 'String',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Hashing',
    answer: 'Approach: Sort each string to form a canonical key; group all strings with the same key using a hashmap. Key insight: Anagrams have identical sorted forms, making the sorted string a perfect group key. Time: O(n·k·log k), Space: O(n·k)',
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
    answer: 'Approach: Use three pointers — low, mid, high — to partition 0s to the left, 2s to the right, and 1s in the middle in a single pass. Key insight: Dutch National Flag algorithm partitions three values in one pass without extra space. Time: O(n), Space: O(1)',
    tags: ['sorting', 'two-pointer', 'partition'],
  },

  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'medium',
    topic: 'Sorting',
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    pattern: 'Sorting + Greedy',
    answer: 'Approach: Sort intervals by start time; iterate and merge the current interval into the previous if its start is within the previous end. Key insight: Sorting by start time makes overlapping intervals adjacent so you only need to check neighbors. Time: O(n log n), Space: O(n)',
    tags: ['sorting', 'greedy', 'intervals'],
  },

  {
    id: 'meeting-rooms-ii',
    title: 'Meeting Rooms II',
    difficulty: 'medium',
    topic: 'Sorting',
    companies: ['Google', 'Amazon', 'Meta'],
    pattern: 'Min Heap',
    answer: 'Approach: Sort meetings by start time; use a min-heap of end times — if the earliest-ending meeting finishes before the new one starts, reuse its room; otherwise allocate a new room. Key insight: The heap size at any point equals the minimum rooms needed. Time: O(n log n), Space: O(n)',
    tags: ['sorting', 'heap', 'intervals', 'greedy'],
  },

  {
    id: 'kth-largest-sort',
    title: 'Kth Largest Element in an Array',
    difficulty: 'medium',
    topic: 'Sorting',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'QuickSelect',
    answer: 'Approach: Use QuickSelect — partition the array around a pivot; if pivot position equals k-1 from end we are done, else recurse on the relevant half. Key insight: QuickSelect is O(n) average by not recursing on both halves like QuickSort. Time: O(n) avg / O(n²) worst, Space: O(1)',
    tags: ['sorting', 'quickselect', 'partition'],
  },

  {
    id: 'sort-by-parity',
    title: 'Sort Array By Parity',
    difficulty: 'easy',
    topic: 'Sorting',
    companies: ['Amazon', 'Google'],
    pattern: 'Two Pointers',
    answer: 'Approach: Two-pointer partition — left pointer finds odd, right pointer finds even, swap them and advance both. Key insight: Same as Lomuto partition but swapping even/odd instead of pivot comparisons. Time: O(n), Space: O(1)',
    tags: ['sorting', 'two-pointer', 'partition'],
  },

  {
    id: 'wiggle-sort',
    title: 'Wiggle Sort',
    difficulty: 'medium',
    topic: 'Sorting',
    companies: ['Google', 'Amazon'],
    pattern: 'Greedy',
    answer: 'Approach: One pass — if an even-indexed element is greater than the next odd-indexed element swap them; if an odd-indexed element is less than the next even-indexed element swap them. Key insight: A local swap always fixes a violation without breaking earlier elements. Time: O(n), Space: O(1)',
    tags: ['sorting', 'greedy', 'one-pass'],
  },

  {
    id: 'count-inversions',
    title: 'Count Inversions',
    difficulty: 'hard',
    topic: 'Sorting',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Merge Sort',
    answer: 'Approach: Modify merge sort — count cross-inversions (pairs where left > right) during the merge step; the total across all merges is the answer. Key insight: During merge, when we pick from the right half, all remaining left-half elements are inversions with it. Time: O(n log n), Space: O(n)',
    tags: ['sorting', 'merge-sort', 'divide-conquer'],
  },

  {
    id: 'pancake-sorting',
    title: 'Pancake Sorting',
    difficulty: 'medium',
    topic: 'Sorting',
    companies: ['Google'],
    pattern: 'Selection Sort Variant',
    answer: 'Approach: For each size from n down to 2, find the max in the unsorted portion, flip it to the front, then flip it to its correct position. Key insight: Two flips per element places it correctly — similar to selection sort but using flips instead of swaps. Time: O(n²), Space: O(1)',
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
    answer: 'Approach: Maintain lo and hi pointers; compare mid element to target and eliminate half the array each iteration. Key insight: Halving the search space each step gives logarithmic time on sorted arrays. Time: O(log n), Space: O(1)',
    tags: ['searching', 'binary-search', 'divide-conquer'],
  },

  {
    id: 'search-rotated-array',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'medium',
    topic: 'Searching',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Modified Binary Search',
    answer: 'Approach: In each binary search step determine which half is sorted; if target lies in the sorted half search there, else search the other half. Key insight: At least one half is always sorted after rotation — use that to decide which side to recurse on. Time: O(log n), Space: O(1)',
    tags: ['searching', 'binary-search', 'rotated'],
  },

  {
    id: 'find-min-rotated',
    title: 'Find Minimum in Rotated Sorted Array',
    difficulty: 'medium',
    topic: 'Searching',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Binary Search',
    answer: 'Approach: Binary search — if mid > right the minimum is in the right half, else it is in the left half including mid. Key insight: The minimum is always in the unsorted half — comparing mid to rightmost identifies which half that is. Time: O(log n), Space: O(1)',
    tags: ['searching', 'binary-search', 'rotated'],
  },

  {
    id: 'search-2d-matrix',
    title: 'Search a 2D Matrix',
    difficulty: 'medium',
    topic: 'Searching',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Binary Search',
    answer: 'Approach: Treat the m×n matrix as a virtual 1D sorted array of length m·n; convert mid index to row/col with row=mid/n, col=mid%n and run standard binary search. Key insight: Row-major order makes the matrix a contiguous sorted sequence. Time: O(log(m·n)), Space: O(1)',
    tags: ['searching', 'binary-search', 'matrix'],
  },

  {
    id: 'peak-element',
    title: 'Find Peak Element',
    difficulty: 'medium',
    topic: 'Searching',
    companies: ['Google', 'Amazon', 'Adobe'],
    pattern: 'Binary Search',
    answer: 'Approach: Binary search on the slope — if nums[mid] < nums[mid+1] a peak must exist to the right, else a peak exists at mid or to the left. Key insight: Moving toward the uphill neighbor always leads to a peak. Time: O(log n), Space: O(1)',
    tags: ['searching', 'binary-search', 'peak'],
  },

  {
    id: 'first-last-position',
    title: 'First and Last Position of Element in Sorted Array',
    difficulty: 'medium',
    topic: 'Searching',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Binary Search',
    answer: 'Approach: Run two binary searches — one biased left (find first occurrence) and one biased right (find last occurrence) by adjusting what happens when target is found. Key insight: Two O(log n) passes replace a single O(n) scan. Time: O(log n), Space: O(1)',
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
    answer: "Approach: Use slow and fast pointers — slow moves one step, fast moves two; if they ever meet there is a cycle. Key insight: In a cycle the fast pointer laps the slow pointer, guaranteeing collision. Time: O(n), Space: O(1)",
    tags: ['linked-list', 'two-pointer', 'cycle'],
  },

  {
    id: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    difficulty: 'easy',
    topic: 'Linked List',
    companies: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
    pattern: 'Linked List',
    answer: 'Approach: Use a dummy head node and a current pointer — repeatedly attach the smaller of the two front nodes, advancing its list pointer until one list is exhausted, then attach the remainder. Key insight: A dummy head eliminates special-casing the first node. Time: O(m+n), Space: O(1)',
    tags: ['linked-list', 'merge', 'dummy-head'],
  },

  {
    id: 'reorder-list',
    title: 'Reorder List',
    difficulty: 'medium',
    topic: 'Linked List',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Linked List',
    answer: 'Approach: Find the middle with slow/fast pointers, reverse the second half, then interleave the two halves. Key insight: Three sub-problems (find middle, reverse, merge) each have clean implementations. Time: O(n), Space: O(1)',
    tags: ['linked-list', 'reversal', 'two-pointer'],
  },

  {
    id: 'remove-nth-node',
    title: 'Remove N-th Node From End of List',
    difficulty: 'medium',
    topic: 'Linked List',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Two Pointers',
    answer: 'Approach: Advance the fast pointer n steps ahead; then advance both pointers together until fast reaches the end — the slow pointer is now at the node before the target. Key insight: Maintaining a fixed gap of n between two pointers positions slow exactly one node before the target. Time: O(n), Space: O(1)',
    tags: ['linked-list', 'two-pointer', 'gap'],
  },

  {
    id: 'copy-random-pointer',
    title: 'Copy List with Random Pointer',
    difficulty: 'medium',
    topic: 'Linked List',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'HashMap',
    answer: 'Approach: First pass creates a mapping from each original node to its clone; second pass assigns next and random pointers of each clone using the map. Key insight: The map acts as a registry so random pointers can be resolved without back-references. Time: O(n), Space: O(n)',
    tags: ['linked-list', 'hashmap', 'deep-copy'],
  },

  {
    id: 'flatten-multilevel-list',
    title: 'Flatten a Multilevel Doubly Linked List',
    difficulty: 'medium',
    topic: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Adobe'],
    pattern: 'DFS / Stack',
    answer: 'Approach: Iterate the list; when a node has a child, insert the child list between the current node and its next, clear the child pointer, then continue. Key insight: The child sublist can be inserted in-place by updating four pointers — no stack needed. Time: O(n), Space: O(1)',
    tags: ['linked-list', 'dfs', 'recursion'],
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
    answer: 'Approach: Maintain two stacks — the main stack for values and an auxiliary stack for the current minimum at each level; push/pop both stacks in sync. Key insight: The auxiliary stack records the running minimum so getMin() is always O(1). Time: O(1) all ops, Space: O(n)',
    tags: ['stack', 'design', 'auxiliary-stack'],
  },

  {
    id: 'daily-temperatures',
    title: 'Daily Temperatures',
    difficulty: 'medium',
    topic: 'Stack',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Monotonic Stack',
    answer: 'Approach: Use a monotonic decreasing stack of indices; when a warmer temperature is found, pop indices from the stack and fill their answer with the current distance. Key insight: Monotonic stack defers answers until the condition is met, processing each element at most twice. Time: O(n), Space: O(n)',
    tags: ['stack', 'monotonic', 'next-greater'],
  },

  {
    id: 'next-greater-element',
    title: 'Next Greater Element',
    difficulty: 'medium',
    topic: 'Stack',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Monotonic Stack',
    answer: 'Approach: Iterate right-to-left, maintaining a monotonic stack — pop elements smaller than the current to find the first greater to the right, then push current. Key insight: Right-to-left traversal with a stack naturally surfaces the next greater element at each step. Time: O(n), Space: O(n)',
    tags: ['stack', 'monotonic', 'next-greater'],
  },

  {
    id: 'evaluate-rpn',
    title: 'Evaluate Reverse Polish Notation',
    difficulty: 'medium',
    topic: 'Stack',
    companies: ['Amazon', 'Google', 'LinkedIn'],
    pattern: 'Stack',
    answer: 'Approach: Push operands onto a stack; when an operator is encountered pop two operands, apply the operator, and push the result. Key insight: RPN eliminates operator precedence issues — a stack naturally handles the LIFO evaluation order. Time: O(n), Space: O(n)',
    tags: ['stack', 'expression', 'simulation'],
  },

  {
    id: 'queue-using-stacks',
    title: 'Implement Queue Using Stacks',
    difficulty: 'easy',
    topic: 'Stack',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Stack',
    answer: 'Approach: Use two stacks — push always goes into stack1; pop lazily transfers all elements to stack2 only when stack2 is empty, then pops from stack2. Key insight: Lazy transfer amortizes cost to O(1) per operation — each element moves between stacks at most once. Time: O(1) amortized, Space: O(n)',
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
    answer: 'Approach: Recursively validate each node by passing valid min/max bounds — the left subtree must stay below current value and right subtree must stay above. Key insight: Passing bounds avoids the common mistake of only checking parent-child relationships. Time: O(n), Space: O(h)',
    tags: ['tree', 'bst', 'dfs', 'bounds'],
  },

  {
    id: 'level-order-traversal',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'medium',
    topic: 'Tree',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'BFS',
    answer: 'Approach: BFS with a queue — process all nodes at the current level before enqueuing the next level; use level size to separate levels. Key insight: Queue naturally provides level-by-level ordering; snapshot the size before processing each level. Time: O(n), Space: O(w) where w is max width',
    tags: ['tree', 'bfs', 'level-order'],
  },

  {
    id: 'lca-binary-tree',
    title: 'Lowest Common Ancestor of a Binary Tree',
    difficulty: 'medium',
    topic: 'Tree',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Tree DFS',
    answer: 'Approach: Post-order DFS — if the current node is p or q return it; the LCA is the node where left and right subtrees both return non-null. Key insight: If both subtrees find one target each, the current node must be the LCA. Time: O(n), Space: O(h)',
    tags: ['tree', 'dfs', 'lca', 'post-order'],
  },

  {
    id: 'binary-tree-max-path-sum',
    title: 'Binary Tree Maximum Path Sum',
    difficulty: 'hard',
    topic: 'Tree',
    companies: ['Amazon', 'Google', 'Meta'],
    pattern: 'Tree DFS',
    answer: 'Approach: DFS returns the best single-branch gain from each node; at each node update the global max with the sum of left gain + node + right gain. Key insight: The path through a node is left_gain + node + right_gain, but you can only carry one branch upward to the parent. Time: O(n), Space: O(h)',
    tags: ['tree', 'dfs', 'path-sum'],
  },

  {
    id: 'serialize-deserialize-tree',
    title: 'Serialize and Deserialize Binary Tree',
    difficulty: 'hard',
    topic: 'Tree',
    companies: ['Google', 'Amazon', 'Meta'],
    pattern: 'BFS / DFS',
    answer: 'Approach: Serialize with level-order BFS encoding null nodes as "N"; deserialize by reconstructing level by level using a queue. Key insight: Encoding null markers preserves tree structure, making deserialization unambiguous. Time: O(n), Space: O(n)',
    tags: ['tree', 'bfs', 'serialization'],
  },

  {
    id: 'diameter-binary-tree',
    title: 'Diameter of Binary Tree',
    difficulty: 'easy',
    topic: 'Tree',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Tree DFS',
    answer: 'Approach: DFS computes height of each subtree; the diameter through any node is leftHeight + rightHeight; track the global maximum across all nodes. Key insight: Diameter is not always rooted at the root — must check every node. Time: O(n), Space: O(h)',
    tags: ['tree', 'dfs', 'height'],
  },

  {
    id: 'symmetric-tree',
    title: 'Symmetric Tree',
    difficulty: 'easy',
    topic: 'Tree',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Tree DFS',
    answer: 'Approach: Recursively check if the tree is a mirror of itself — a tree is symmetric if left.val == right.val and left.left mirrors right.right and left.right mirrors right.left. Key insight: Mirror check is two simultaneous DFS traversals moving in opposite directions. Time: O(n), Space: O(h)',
    tags: ['tree', 'dfs', 'symmetry'],
  },

  {
    id: 'path-sum-ii',
    title: 'Path Sum II',
    difficulty: 'medium',
    topic: 'Tree',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'DFS Backtracking',
    answer: 'Approach: DFS with backtracking — add the node to the current path, recurse left and right; at a leaf if the remaining sum equals the node value save the path; then remove the node before returning. Key insight: Backtracking restores state after each recursive call to explore all root-to-leaf paths. Time: O(n), Space: O(h)',
    tags: ['tree', 'dfs', 'backtracking', 'path'],
  },

  {
    id: 'construct-from-preorder-inorder',
    title: 'Construct Binary Tree from Preorder and Inorder Traversal',
    difficulty: 'medium',
    topic: 'Tree',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Divide and Conquer',
    answer: 'Approach: The first element of preorder is the root; find it in inorder to split into left and right subtrees; recurse with correct sub-arrays for each. Key insight: Preorder gives the root, inorder splits left from right — a hashmap makes root lookup O(1). Time: O(n), Space: O(n)',
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
    answer: 'Approach: BFS from the start node using a hashmap from original nodes to their clones; for each node clone its neighbors and add unvisited neighbors to the queue. Key insight: The hashmap serves as both a visited set and a registry for cloned nodes. Time: O(V+E), Space: O(V)',
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
    pattern: 'Reverse BFS',
    answer: 'Approach: BFS outward from both ocean borders simultaneously; cells reachable from both oceans are the answer. Key insight: Reverse the direction — flow from ocean inward (uphill) is easier than simulating all cells flowing to both oceans. Time: O(m×n), Space: O(m×n)',
    tags: ['graph', 'bfs', 'dfs', 'grid'],
  },

  {
    id: 'connected-components',
    title: 'Number of Connected Components in Undirected Graph',
    difficulty: 'medium',
    topic: 'Graph',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Union Find / DFS',
    answer: 'Approach: Use Union-Find — for each edge union the two nodes; the number of distinct roots at the end is the component count. Key insight: Union-Find with path compression and union by rank runs near O(1) per operation. Time: O(n·α(n)), Space: O(n)',
    tags: ['graph', 'union-find', 'dfs'],
  },

  {
    id: 'alien-dictionary',
    title: 'Alien Dictionary',
    difficulty: 'hard',
    topic: 'Graph',
    companies: ['Google', 'Meta', 'Airbnb'],
    pattern: 'Topological Sort',
    answer: "Approach: Compare adjacent words to derive character ordering edges, then topological sort the character graph; if a cycle exists return empty string. Key insight: Adjacent words in sorted order encode one ordering constraint between the first differing characters. Time: O(C) where C is total characters, Space: O(1) for 26 letters",
    tags: ['graph', 'topological-sort', 'string'],
  },

  {
    id: 'dijkstra-shortest-path',
    title: "Dijkstra's Shortest Path",
    difficulty: 'medium',
    topic: 'Graph',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Min Heap',
    answer: 'Approach: Use a min-heap (priority queue) of (distance, node) pairs; always process the node with smallest current distance and relax its neighbors. Key insight: Greedy extraction of the minimum ensures each node is finalized in non-decreasing distance order. Time: O((V+E) log V), Space: O(V)',
    tags: ['graph', 'shortest-path', 'heap', 'greedy'],
  },

  {
    id: 'minimum-spanning-tree',
    title: "Minimum Spanning Tree (Kruskal's)",
    difficulty: 'medium',
    topic: 'Graph',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Union Find',
    answer: "Approach: Sort all edges by weight; greedily add the cheapest edge that doesn't create a cycle (using Union-Find to detect cycles). Key insight: The greedy choice is safe by the cut property — the minimum weight crossing edge of any cut must be in the MST. Time: O(E log E), Space: O(V)",
    tags: ['graph', 'union-find', 'greedy', 'mst'],
  },

  {
    id: 'detect-cycle-directed',
    title: 'Detect Cycle in a Directed Graph',
    difficulty: 'medium',
    topic: 'Graph',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'DFS with Colors',
    answer: 'Approach: DFS with three-color marking — white (unvisited), gray (in current path), black (fully processed); a back edge to a gray node means a cycle. Key insight: Gray nodes represent the current DFS stack; an edge to a gray node is a back edge indicating a cycle. Time: O(V+E), Space: O(V)',
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
    answer: 'Approach: 2D DP table where dp[i][j] is the LCS of s1[0..i-1] and s2[0..j-1]; if characters match dp[i][j] = dp[i-1][j-1]+1, else take the max of omitting either character. Key insight: The recurrence captures the optimal substructure — LCS of prefixes. Time: O(m·n), Space: O(m·n)',
    tags: ['dp', '2d-dp', 'subsequence'],
  },

  {
    id: 'knapsack-01',
    title: '0/1 Knapsack',
    difficulty: 'medium',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
    pattern: 'Dynamic Programming',
    answer: 'Approach: 2D DP where dp[i][w] is max value using first i items with capacity w; each item is either taken (dp[i-1][w-weight]+value) or skipped (dp[i-1][w]). Key insight: Space can be reduced to O(W) by iterating the weight dimension in reverse for each item. Time: O(n·W), Space: O(n·W) or O(W)',
    tags: ['dp', '2d-dp', 'knapsack'],
  },

  {
    id: 'lis',
    title: 'Longest Increasing Subsequence',
    difficulty: 'medium',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Dynamic Programming / Binary Search',
    answer: 'Approach: O(n²) DP: dp[i] = length of LIS ending at index i; for each i check all j<i where nums[j]<nums[i]. Optimized O(n log n): maintain a tails array using patience sorting with binary search. Key insight: The tails array is always sorted, enabling binary search to maintain it. Time: O(n log n), Space: O(n)',
    tags: ['dp', 'binary-search', 'subsequence'],
  },

  {
    id: 'word-break',
    title: 'Word Break',
    difficulty: 'medium',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Dynamic Programming',
    answer: 'Approach: Boolean DP array where dp[i] means the first i characters can be segmented; for each position check all prefixes ending there against the dictionary. Key insight: Storing all prefix results avoids recomputing subproblems. Time: O(n²), Space: O(n)',
    tags: ['dp', 'string', 'bottom-up'],
  },

  {
    id: 'edit-distance',
    title: 'Edit Distance (Levenshtein)',
    difficulty: 'hard',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Dynamic Programming',
    answer: 'Approach: 2D DP where dp[i][j] is the minimum edits to convert word1[0..i-1] to word2[0..j-1]; when characters match no edit needed, else take 1 + min(insert, delete, replace). Key insight: Three edit operations correspond to three neighboring cells in the DP table. Time: O(m·n), Space: O(m·n)',
    tags: ['dp', '2d-dp', 'string'],
  },

  {
    id: 'max-product-subarray',
    title: 'Maximum Product Subarray',
    difficulty: 'medium',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Dynamic Programming',
    answer: 'Approach: Track both the maximum and minimum product ending at each position; a negative number flips max and min, so both must be maintained. Key insight: The current minimum could become the next maximum when multiplied by a negative value. Time: O(n), Space: O(1)',
    tags: ['dp', 'subarray', 'product'],
  },

  {
    id: 'house-robber',
    title: 'House Robber',
    difficulty: 'easy',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Dynamic Programming',
    answer: 'Approach: DP where dp[i] = max loot from first i houses; either rob house i (dp[i-2] + nums[i]) or skip it (dp[i-1]). Key insight: Two variables suffice since only the previous two states are needed. Time: O(n), Space: O(1)',
    tags: ['dp', 'bottom-up', 'no-adjacent'],
  },

  {
    id: 'unique-paths',
    title: 'Unique Paths',
    difficulty: 'medium',
    topic: 'DP',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Dynamic Programming',
    answer: 'Approach: DP grid where dp[i][j] = paths to cell (i,j) = dp[i-1][j] + dp[i][j-1]; top row and left column are all 1s. Key insight: Combinatorics gives O(1) space solution — C(m+n-2, m-1) total paths. Time: O(m·n), Space: O(n)',
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
    answer: 'Approach: Compute prefix sums and use a hashmap to count how many times (currentSum - k) has appeared; each such occurrence is a valid subarray. Key insight: prefixSum[j] - prefixSum[i] = k ↔ the subarray i+1..j sums to k. Time: O(n), Space: O(n)',
    tags: ['hashing', 'prefix-sum', 'subarray'],
  },

  {
    id: 'longest-consecutive-sequence',
    title: 'Longest Consecutive Sequence',
    difficulty: 'medium',
    topic: 'Hashing',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'HashSet',
    answer: 'Approach: Put all numbers in a HashSet; for each number that has no predecessor (n-1 not in set) start a new sequence and count consecutive elements. Key insight: Only start counting at sequence beginnings to avoid redundant work — this keeps total time O(n). Time: O(n), Space: O(n)',
    tags: ['hashing', 'hashset', 'sequence'],
  },

  {
    id: 'top-k-frequent-elements',
    title: 'Top K Frequent Elements',
    difficulty: 'medium',
    topic: 'Hashing',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Bucket Sort / Heap',
    answer: 'Approach: Count frequencies with a hashmap, then use bucket sort (frequency as index) to collect the top k elements in O(n). Key insight: Bucket sort by frequency avoids O(n log n) heap sorting — max frequency is at most n. Time: O(n), Space: O(n)',
    tags: ['hashing', 'bucket-sort', 'frequency'],
  },

  {
    id: 'four-sum',
    title: 'Four Sum',
    difficulty: 'hard',
    topic: 'Hashing',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Two Pointers',
    answer: 'Approach: Sort the array; fix two outer indices with nested loops and use a two-pointer approach on the remaining inner subarray; skip duplicates at all levels. Key insight: Generalizes 3Sum — each additional fixed pointer adds an O(n) factor. Time: O(n³), Space: O(1)',
    tags: ['hashing', 'two-pointer', 'sorting'],
  },

  {
    id: 'jewels-and-stones',
    title: 'Jewels and Stones',
    difficulty: 'easy',
    topic: 'Hashing',
    companies: ['Amazon', 'Google'],
    pattern: 'HashSet',
    answer: 'Approach: Put all jewel types in a HashSet then count stones that exist in the set. Key insight: HashSet lookup is O(1) reducing overall complexity from O(j·s) to O(j+s). Time: O(j+s), Space: O(j)',
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
    answer: 'Approach: Maintain a min-heap of size k — add each element and pop the minimum when size exceeds k; the root is the kth largest. Key insight: A min-heap of size k always retains the k largest elements seen so far. Time: O(n log k), Space: O(k)',
    tags: ['heap', 'priority-queue', 'kth-element'],
  },

  {
    id: 'top-k-frequent-words',
    title: 'Top K Frequent Words',
    difficulty: 'medium',
    topic: 'Heap',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Max Heap',
    answer: 'Approach: Count word frequencies with a hashmap; use a min-heap of size k keyed by (frequency, word) — pop when size exceeds k; reverse for final output. Key insight: Custom comparator handles tie-breaking by lexicographic order. Time: O(n log k), Space: O(n)',
    tags: ['heap', 'hashmap', 'frequency', 'string'],
  },

  {
    id: 'find-median-stream',
    title: 'Find Median from Data Stream',
    difficulty: 'hard',
    topic: 'Heap',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Two Heaps',
    answer: 'Approach: Maintain a max-heap for the lower half and a min-heap for the upper half; balance them so they differ in size by at most 1; median is top of larger heap or average of both tops. Key insight: Two balanced heaps give O(1) median access and O(log n) insert. Time: O(log n) insert, O(1) median, Space: O(n)',
    tags: ['heap', 'design', 'two-heaps'],
  },

  {
    id: 'task-scheduler',
    title: 'Task Scheduler',
    difficulty: 'medium',
    topic: 'Heap',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Greedy + Heap',
    answer: 'Approach: Always schedule the most frequent remaining task; after each cooling period re-add tasks to the heap; idle slots are needed when no task is available. Key insight: Greedy — execute the most frequent task first to minimize idle time. Time: O(n log n), Space: O(1) for 26 letters',
    tags: ['heap', 'greedy', 'simulation'],
  },

  {
    id: 'reorganize-string',
    title: 'Reorganize String',
    difficulty: 'medium',
    topic: 'Heap',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Greedy + Heap',
    answer: 'Approach: Use a max-heap keyed by frequency; at each step pick the two most frequent characters and append them; re-insert with decremented counts. Key insight: Always interleaving the two most frequent characters prevents adjacency of the same character. Time: O(n log k), Space: O(k) for alphabet',
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
    answer: 'Approach: Place queens row by row; use three sets (columns, diagonals, anti-diagonals) to check validity in O(1); backtrack by removing the queen when a column leads to no solution. Key insight: A queen at (r,c) occupies diagonal r-c and anti-diagonal r+c — encoding these as sets gives O(1) conflict checks. Time: O(n!), Space: O(n)',
    tags: ['backtracking', 'constraint', 'sets'],
  },

  {
    id: 'sudoku-solver',
    title: 'Sudoku Solver',
    difficulty: 'hard',
    topic: 'Backtracking',
    companies: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
    pattern: 'Backtracking',
    answer: 'Approach: Find the next empty cell; try digits 1–9, checking row/column/box validity; recurse and backtrack on failure. Key insight: Constraint propagation via bitmasks for rows/cols/boxes makes validity O(1). Time: O(9^(empty cells)), Space: O(1)',
    tags: ['backtracking', 'constraint', 'grid'],
  },

  {
    id: 'generate-parentheses',
    title: 'Generate Parentheses',
    difficulty: 'medium',
    topic: 'Backtracking',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Backtracking',
    answer: 'Approach: Recursively build the string — add an open bracket if open count < n, add a close bracket if close count < open count; record when both reach n. Key insight: Tracking open/close counts pruning invalid prefixes avoids generating and validating all 2^(2n) strings. Time: O(4^n / √n) Catalan, Space: O(n)',
    tags: ['backtracking', 'string', 'catalan'],
  },

  {
    id: 'permutations',
    title: 'Permutations',
    difficulty: 'medium',
    topic: 'Backtracking',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Backtracking',
    answer: 'Approach: Swap the current index with each subsequent index, recurse, then swap back (backtrack); base case is when the index reaches the end. Key insight: In-place swapping generates all n! permutations without an extra visited array. Time: O(n! · n), Space: O(n)',
    tags: ['backtracking', 'swap', 'permutation'],
  },

  {
    id: 'subsets',
    title: 'Subsets',
    difficulty: 'medium',
    topic: 'Backtracking',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    pattern: 'Backtracking',
    answer: 'Approach: At each step either include or exclude the current element and recurse; add the current subset to the result at every node of the recursion tree. Key insight: Unlike combination problems, there is no length constraint — every partial selection is a valid subset. Time: O(2^n · n), Space: O(n)',
    tags: ['backtracking', 'include-exclude', 'subsets'],
  },

  {
    id: 'word-search',
    title: 'Word Search',
    difficulty: 'medium',
    topic: 'Backtracking',
    companies: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
    pattern: 'DFS Backtracking',
    answer: 'Approach: DFS from every cell matching the first letter; mark the current cell visited (e.g., with a special char), recurse in all 4 directions, then unmark on backtrack. Key insight: In-place marking avoids a separate visited matrix; restoring on backtrack enables other paths to use the cell. Time: O(m·n·4^L), Space: O(L) where L is word length',
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
    answer: 'Approach: Iterate 1 to n; check divisibility by 15 (FizzBuzz), then 3 (Fizz), then 5 (Buzz), else print the number. Key insight: Check 15 first to avoid the 3 and 5 cases masking it; use modulo operator. Time: O(n), Space: O(1)',
    tags: ['fundamentals', 'modulo', 'simulation'],
  },

  {
    id: 'fibonacci-optimized',
    title: 'Fibonacci Number (Optimized)',
    difficulty: 'easy',
    topic: 'Fundamentals',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Dynamic Programming',
    answer: 'Approach: Iterative DP with two variables — no recursion stack needed; advanced: matrix exponentiation computes F(n) in O(log n). Key insight: Naive recursion is O(2^n); DP reduces to O(n); matrix exponentiation to O(log n). Time: O(n) or O(log n), Space: O(1)',
    tags: ['fundamentals', 'dp', 'fibonacci'],
  },

  {
    id: 'fast-exponentiation',
    title: 'Fast Exponentiation (Power Function)',
    difficulty: 'medium',
    topic: 'Fundamentals',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Divide and Conquer',
    answer: 'Approach: If n is even compute pow(x, n/2)² else compute x · pow(x, n-1); handle negative exponents by inverting x. Key insight: Halving the exponent at each step gives logarithmic depth — the base squaring trick. Time: O(log n), Space: O(log n) recursion / O(1) iterative',
    tags: ['fundamentals', 'divide-conquer', 'math'],
  },

  {
    id: 'gcd-algorithm',
    title: 'Greatest Common Divisor (Euclidean)',
    difficulty: 'easy',
    topic: 'Fundamentals',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Math',
    answer: 'Approach: Euclidean algorithm — gcd(a, b) = gcd(b, a % b); base case is gcd(a, 0) = a. Key insight: gcd(a,b) = gcd(b, a mod b) because any common divisor of a and b also divides a mod b. Time: O(log min(a,b)), Space: O(1)',
    tags: ['fundamentals', 'math', 'recursion'],
  },

  {
    id: 'prime-sieve',
    title: 'Sieve of Eratosthenes',
    difficulty: 'medium',
    topic: 'Fundamentals',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Sieve',
    answer: 'Approach: Initialize a boolean array of size n+1; for each prime p starting at 2 mark all multiples starting from p² as composite. Key insight: Starting from p² avoids redundant marking — smaller multiples were already marked by smaller primes. Time: O(n log log n), Space: O(n)',
    tags: ['fundamentals', 'math', 'primes'],
  },

  {
    id: 'reverse-integer',
    title: 'Reverse Integer',
    difficulty: 'medium',
    topic: 'Fundamentals',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Math',
    answer: 'Approach: Repeatedly extract the last digit with mod 10 and build the reversed number; check for 32-bit overflow before each multiplication by checking if rev > INT_MAX/10. Key insight: Overflow check must happen before multiplication, not after, to avoid undefined behavior. Time: O(log x), Space: O(1)',
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
    answer: 'Approach: Precompute a failure function (LPS array) that for each position stores the length of the longest proper prefix that is also a suffix; use it to skip comparisons on mismatch. Key insight: The failure function encodes how much of the pattern is already matched on a partial mismatch, avoiding backtracking. Time: O(n+m), Space: O(m)',
    tags: ['advanced', 'string', 'pattern-matching'],
  },

  {
    id: 'segment-tree',
    title: 'Segment Tree (Range Query)',
    difficulty: 'hard',
    topic: 'Advanced',
    companies: ['Google', 'Amazon', 'Microsoft'],
    pattern: 'Segment Tree',
    answer: 'Approach: Build a complete binary tree over the array where each node stores the aggregate (sum/min/max) of its range; query by combining relevant segments; update in O(log n). Key insight: Each query touches O(log n) nodes by splitting the range into pre-computed segments. Time: O(n) build, O(log n) query/update, Space: O(n)',
    tags: ['advanced', 'tree', 'range-query'],
  },

  {
    id: 'trie-insert-search',
    title: 'Trie Insert and Search',
    difficulty: 'medium',
    topic: 'Advanced',
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    pattern: 'Trie',
    answer: 'Approach: Each TrieNode contains a 26-element children array and an isEnd flag; insert by creating nodes along the path; search by traversing and checking isEnd. Key insight: Trie stores strings with shared prefixes compactly and enables prefix search in O(L) time. Time: O(L) insert/search, Space: O(N·L)',
    tags: ['advanced', 'trie', 'string', 'prefix'],
  },

  {
    id: 'lfu-cache',
    title: 'LFU Cache',
    difficulty: 'hard',
    topic: 'Advanced',
    companies: ['Google', 'Amazon', 'Meta'],
    pattern: 'HashMap + Frequency Buckets',
    answer: 'Approach: Maintain a key→(value,freq) map, a freq→LinkedHashSet map, and the current minimum frequency; on get/put update frequency and shift keys between frequency buckets. Key insight: LinkedHashSet per frequency bucket provides O(1) LRU eviction within the same frequency. Time: O(1) all ops, Space: O(capacity)',
    tags: ['advanced', 'design', 'hashmap', 'frequency'],
  },

  {
    id: 'skyline-problem',
    title: 'The Skyline Problem',
    difficulty: 'hard',
    topic: 'Advanced',
    companies: ['Google', 'Amazon', 'Microsoft'],
    pattern: 'Sweep Line + Max Heap',
    answer: 'Approach: Sweep line over all building edges; use a max-heap to track active heights; a key point occurs whenever the current maximum height changes. Key insight: At each x-coordinate the skyline height equals the maximum active building height — a heap tracks this efficiently. Time: O(n log n), Space: O(n)',
    tags: ['advanced', 'sweep-line', 'heap'],
  },

  {
    id: 'convex-hull',
    title: 'Convex Hull (Graham Scan)',
    difficulty: 'hard',
    topic: 'Advanced',
    companies: ['Google', 'Amazon', 'Microsoft'],
    pattern: 'Computational Geometry',
    answer: 'Approach: Sort points by polar angle relative to the lowest point; iterate points maintaining a stack where only left turns are kept — pop on right turns. Key insight: Maintaining a stack of left turns traces the convex hull counterclockwise. Time: O(n log n), Space: O(n)',
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
    answer: 'Approach: Sort activities by finish time; greedily select each activity if its start time is ≥ the finish time of the last selected activity. Key insight: Choosing the earliest-finishing compatible activity leaves the maximum room for future activities. Time: O(n log n), Space: O(1)',
    tags: ['greedy', 'sorting', 'intervals'],
  },

  {
    id: 'fractional-knapsack',
    title: 'Fractional Knapsack',
    difficulty: 'medium',
    topic: 'Greedy',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Greedy',
    answer: 'Approach: Sort items by value/weight ratio in descending order; greedily take as much as possible of each item until the knapsack is full. Key insight: Fractions are allowed, so the greedy choice of highest ratio per unit weight is always optimal. Time: O(n log n), Space: O(1)',
    tags: ['greedy', 'sorting', 'knapsack'],
  },

  {
    id: 'gas-station',
    title: 'Gas Station',
    difficulty: 'medium',
    topic: 'Greedy',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Greedy',
    answer: "Approach: If total gas ≥ total cost a solution always exists; find it by tracking a running tank balance — reset the start to i+1 whenever the balance goes negative. Key insight: The station after the last deficit point must be the answer if a solution exists. Time: O(n), Space: O(1)",
    tags: ['greedy', 'circular', 'simulation'],
  },

  {
    id: 'assign-cookies',
    title: 'Assign Cookies',
    difficulty: 'easy',
    topic: 'Greedy',
    companies: ['Amazon', 'Google'],
    pattern: 'Greedy',
    answer: 'Approach: Sort both greed factors and cookie sizes; use two pointers — assign the smallest sufficient cookie to the least greedy child. Key insight: Satisfying the least greedy child first with the smallest sufficient cookie conserves larger cookies for greedier children. Time: O(n log n), Space: O(1)',
    tags: ['greedy', 'sorting', 'two-pointer'],
  },

  {
    id: 'min-platforms',
    title: 'Minimum Number of Platforms Required',
    difficulty: 'medium',
    topic: 'Greedy',
    companies: ['Amazon', 'Google', 'Microsoft'],
    pattern: 'Sorting + Two Pointers',
    answer: 'Approach: Sort arrivals and departures separately; use two pointers — increment platform count on arrival, decrement on departure; track the maximum. Key insight: Treating arrivals and departures as separate sorted events reveals the maximum simultaneous trains. Time: O(n log n), Space: O(1)',
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
export const COMPANIES = [...new Set(interviewQuestions.flatMap(q => q.companies))].sort()

export default interviewQuestions
