/* Hand-authored per-language line maps for the `arrays` category.
   See scripts/apply-code-data.cjs. Java line numbers -> equivalent line;
   `null` = this language genuinely has no equivalent line. */
module.exports = {
  /* java: 2 = the class, 4 = the seen-map, 5 = the scan loop,
     6 = the complement.
     JS shipped a two-pointer solution for a SORTED array — a different
     algorithm from the hash-map one being visualized, with no map at all —
     so it is rewritten to match. */
  twoSumArray: {
    snippets: {
      javascript: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (seen.has(comp)) return [seen.get(comp), i];
    seen.set(nums[i], i);
  }
  return [-1, -1];
}

console.log(twoSum([2, 7, 11, 15], 9));`,
    },
    lineMap: {
      c:          { 2: 3, 4: 2, 5: 4, 6: 5 },
      cpp:        { 2: 4, 4: 5, 5: 6, 6: 7 },
      python:     { 2: 1, 4: 2, 5: 3, 6: 4 },
      javascript: { 2: 1, 4: 2, 5: 3, 6: 4 },
    },
  },

  /* java: 2 = maxSubArray(), 5 = the scan loop, 7 = restart the run here,
     9 = the extend branch, 11 = close the decision.
     Every other language folds the restart-or-extend decision into a single
     max(...) expression, so only the restart step has a line to claim. */
  maximumSubarray: {
    lineMap: {
      c:          { 2: 2, 5: 4, 7: 5, 9: null, 11: null },
      cpp:        { 2: 5, 5: 7, 7: 8, 9: null, 11: null },
      // Python's `cur = max(x, cur + x)` fuses the test with both branches,
      // so java 6's standalone comparison has no line of its own.
      python:     { 2: 1, 5: 3, 6: null, 7: 4, 9: null, 11: null },
      javascript: { 2: 1, 5: 3, 7: 4, 9: null, 11: null },
    },
  },

  /* java: 2 = rotate(), 3 = the length, 4 = normalise k, 5 = reverse the whole
     array, 6 = reverse the first k. C takes n as a parameter, so the length
     step points at the function itself. */
  rotateArray: {
    lineMap: {
      c:          { 2: 9, 3: null, 4: 10, 5: 11, 6: 12 },
      cpp:        { 2: 4, 3: 5, 4: 6, 5: 7, 6: 8 },
      python:     { 2: 1, 3: 2, 4: 3, 5: 8, 6: 9 },
      javascript: { 2: 1, 3: 2, 4: 3, 5: 11, 6: 12 },
    },
  },

  /* java: 2 = the prefix array, 3 = the constructor, 5 = seed prefix[0],
     6 = the accumulation loop.
     Python and JS build an exclusive (n+1)-length prefix that starts at 0, so
     there is no "seed with arr[0]" line; C takes the buffer as a parameter. */
  prefixSum: {
    lineMap: {
      c:          { 2: 2, 3: null, 5: 3, 6: 4 },
      cpp:        { 2: 5, 3: 6, 5: 8, 6: 9 },
      python:     { 2: 2, 3: 1, 5: null, 6: 4 },
      javascript: { 2: 2, 3: 1, 5: null, 6: 3 },
    },
  },

  /* java: 2 = the class, 4 = the length, 6 = the index deque, 7 = the scan,
     9 = drop smaller values from the back, 10 = push this index.
     JS shipped a fixed-window running SUM — not the deque-based sliding window
     MAXIMUM being visualized — so it is rewritten. */
  slidingWindow: {
    snippets: {
      javascript: `function maxSlidingWindow(nums, k) {
  const n = nums.length;
  const result = [];
  const deque = [];   // holds indices, values decreasing
  for (let i = 0; i < n; i++) {
    while (deque.length && deque[0] < i - k + 1) deque.shift();
    while (deque.length && nums[deque[deque.length - 1]] <= nums[i]) deque.pop();
    deque.push(i);
    if (i >= k - 1) result.push(nums[deque[0]]);
  }
  return result;
}

console.log(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3).join(' '));`,
    },
    lineMap: {
      // C and Python take/derive the length without a dedicated line.
      c:          { 2: 2, 4: null, 6: 3, 7: 4, 9: 6, 10: 7 },
      cpp:        { 2: 4, 4: 5, 6: 7, 7: 8, 9: 10, 10: 11 },
      // java 5 allocates a result array; Python's line 4 creates BOTH the
      // deque and the output list and is already claimed by java 6.
      python:     { 2: 3, 4: null, 5: null, 6: 4, 7: 5, 9: 6, 10: 8 },
      javascript: { 2: 1, 4: 2, 6: 4, 7: 5, 9: 7, 10: 8 },
    },
  },

  /* java: 2 = sort(), 5 = the "is it a 0" test, 6 = swap it to the front,
     8 = the "is it a 1" test, 10 = the 2 branch, 12 = shrink the tail.
     C++ folds each swap and its pointer bump onto one line. */
  dutchFlag: {
    lineMap: {
      c:          { 2: 2, 5: 5, 6: 6, 8: 11, 10: 12, 12: 16 },
      cpp:        { 2: 4, 5: 7, 6: 8, 8: 9, 10: 10, 12: null },
      python:     { 2: 1, 5: 4, 6: 5, 8: 7, 10: 9, 12: 11 },
      javascript: { 2: 1, 5: 4, 6: 5, 8: 8, 10: 10, 12: 12 },
    },
  },

  /* java: 2 = isAnagram(), 3 = the length guard, 5 = tally s, 6 = untally t,
     7 = the leftover check, 8 = success.
     Python counts into a dict and detects the mismatch DURING the second pass
     rather than sweeping a 26-slot array afterwards, so java 7's sweep maps to
     that inline guard. Lines past 3 only run when both strings are the same
     length — the default demo input is not, so one run never reaches them. */
  anagramCheck: {
    lineMap: {
      python: { 2: 1, 3: 2, 5: 6, 6: 10, 7: 8, 8: 11 },
    },
  },

  /* java: 2 = the entry point, 7 = the character comparison (also the only
     line a mismatch executes, since Java leaves dp at its default 0),
     8 = extend the run, 12 = return the answer. */
  longestCommonSubstring: {
    lineMap: {
      python: { 2: 1, 7: 7, 8: 8, 12: 11 },
    },
  },

  /* java: 4 = sort by start, 6 = seed `current`, 8 = the overlap test,
     9 = extend the end, 11 = flush a finished interval, 16 = return.
     Python keeps no separate `current` variable — it mutates merged[-1] in
     place — so java 6 lands on the loop line that binds each interval. */
  mergeIntervals: {
    lineMap: {
      python: { 4: 2, 6: 4, 8: 5, 9: 6, 11: 8, 16: 9 },
    },
  },

  /* java: 4 = the stack, 6 = push an opener, 8 = the empty-stack guard,
     9 = pop the top, 10 = the mismatch test, 15 = the final emptiness check.
     Python folds guard + pop + compare into one `elif`, so the pop wins that
     line and the standalone guard (java 8) has no separate equivalent. */
  validParentheses: {
    lineMap: {
      python: { 4: 3, 6: 6, 8: null, 9: 7, 10: 8, 15: 9 },
    },
  },
}
