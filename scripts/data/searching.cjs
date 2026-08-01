/* Hand-authored per-language line maps for the `searching` category.
   See scripts/apply-code-data.cjs. Java line numbers -> equivalent line;
   `null` = this language genuinely has no equivalent line. */
module.exports = {
  /* java: 3 = lo/hi bounds, 6 = midpoint, 8 = hit test, 10 = go-right test,
     11 = raise low, 13 = lower high, 14 = close of the if/else chain.
     JS folded the test and the assignment onto one line (`if (a[mid] < target)
     lo = mid + 1;`), so java 10 and 11 would collide on it — expanded to the
     same if/else-if/else shape as Java. */
  binarySearch: {
    snippets: {
      javascript: `function binarySearch(a, target) {
  let low = 0, high = a.length - 1;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (a[mid] === target) {
      return mid;
    } else if (a[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1;
}

console.log(binarySearch([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23));`,
    },
    lineMap: {
      c:          { 3: 3, 6: 6, 8: 8, 10: 11, 11: 12, 13: 15, 14: 17 },
      cpp:        { 3: 6, 6: 9, 8: 11, 10: 14, 11: 15, 13: 18, 14: 20 },
      // Python has no closing delimiter for the if/else chain.
      python:     { 3: 2, 6: 4, 8: 5, 10: 7, 11: 8, 13: 10, 14: null },
      javascript: { 3: 2, 6: 4, 8: 5, 10: 7, 11: 8, 13: 10, 14: 11 },
    },
  },

  /* java: 2 = the binarySearch helper, 6 = narrow the range, 7 = close its
     loop, 9 = close the helper, 10 = the exponential search entry point.
     JS inlined the binary phase into one function, leaving java 2 and 9
     nothing to point at — split back into a helper, as Java/C/C++/Python have. */
  exponentialSearch: {
    snippets: {
      javascript: `function binarySearch(a, lo, hi, target) {
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (a[mid] === target) return mid;
    if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
  }
  return -1;
}

function exponentialSearch(a, target) {
  if (a[0] === target) return 0;
  let i = 1;
  while (i < a.length && a[i] <= target) i *= 2;
  return binarySearch(a, Math.floor(i / 2), Math.min(i, a.length - 1), target);
}

console.log(exponentialSearch([2, 3, 4, 10, 40, 55, 68, 80], 10));`,
    },
    lineMap: {
      c:          { 2: 2, 6: 6, 7: 8, 9: 10, 10: 11 },
      cpp:        { 2: 4, 6: 8, 7: 10, 9: 12, 10: 13 },
      // No closing delimiters in Python: the helper simply ends at `return -1`.
      python:     { 2: 1, 6: 6, 7: null, 9: 10, 10: 12 },
      javascript: { 2: 1, 6: 5, 7: 6, 9: 8, 10: 10 },
    },
  },

  /* java: 2 = search(), 6 = the interpolation probe, 7 = hit test,
     8 = go-right test. */
  interpolationSearch: {
    lineMap: {
      c:          { 2: 2, 6: 6, 7: 7, 8: 8 },
      cpp:        { 2: 4, 6: 8, 7: 9, 8: 10 },
      python:     { 2: 1, 6: 7, 7: 8, 8: 10 },
      javascript: { 2: 1, 6: 5, 7: 6, 8: 7 },
    },
  },

  /* java: 2 = search(), 5 = the jump loop, 7 = advance the jump,
     8 = past-the-end guard, 9 = close the jump loop.
     Python/JS finish with a `for` scan instead of Java's second `while`, and
     advance `prev` rather than `step`, so the guard and the loop close have no
     equivalent there. */
  jumpSearch: {
    lineMap: {
      c:          { 2: 3, 5: 5, 7: 7, 8: 8, 9: 9 },
      cpp:        { 2: 5, 5: 7, 7: 9, 8: 10, 9: 11 },
      python:     { 2: 3, 5: 7, 7: 8, 8: null, 9: null },
      javascript: { 2: 1, 5: 5, 7: 7, 8: null, 9: 8 },
    },
  },

  /* java: 2 = search(), 3 = the scan loop, 4 = the comparison, 5 = close loop.
     C/C++ folded the loop and the comparison onto one line, so java 3 and 4
     would collide — both expanded to a braced body. */
  linearSearch: {
    snippets: {
      c: `#include <stdio.h>

int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}

int main() {
    int arr[] = {4, 2, 7, 1, 9, 3};
    printf("%d\\n", linearSearch(arr, 6, 7));
    printf("%d\\n", linearSearch(arr, 6, 5));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int linearSearch(const vector<int>& arr, int target) {
    for (int i = 0; i < (int)arr.size(); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}

int main() {
    vector<int> arr = {4, 2, 7, 1, 9, 3};
    cout << linearSearch(arr, 7) << endl;
    cout << linearSearch(arr, 5) << endl;
    return 0;
}`,
    },
    lineMap: {
      c:          { 2: 3, 3: 4, 4: 5, 5: 6 },
      cpp:        { 2: 5, 3: 6, 4: 7, 5: 8 },
      python:     { 2: 1, 3: 2, 4: 3, 5: null },
      javascript: { 2: 1, 3: 2, 4: 3, 5: 4 },
    },
  },
}
