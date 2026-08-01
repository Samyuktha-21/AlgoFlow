/* Hand-authored per-language line maps for the `sorting` category.
   See scripts/apply-code-data.cjs. Java line numbers -> equivalent line;
   `null` = this language genuinely has no equivalent line (usually a closing
   brace, which Python does not have). */
module.exports = {
  /* java: 3 = length, 4 = pass loop, 7 = compare, 8 = swap begins,
     10 = swap done, 13 = close of the inner loop (pass complete),
     14 = the early-exit check.
     C++ used a single `swap()` call, so java 8 and 10 had one line between
     them — expanded to the same explicit three-line swap as Java and C. */
  bubbleSort: {
    snippets: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break;   // Already sorted
    }
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    bubbleSort(arr);
    for (int val : arr) cout << val << " ";
    return 0;
}`,
    },
    lineMap: {
      c:          { 3: 3, 4: 4, 7: 7, 8: 8, 10: 10, 13: 13, 14: 14 },
      cpp:        { 3: 6, 4: 7, 7: 10, 8: 11, 10: 13, 13: 16, 14: 17 },
      // Python/JS swap atomically via destructuring, so "swap done" has no
      // separate line, and Python has no loop-closing token.
      python:     { 3: 2, 4: 3, 7: 6, 8: 7, 10: null, 13: null, 14: 9 },
      javascript: { 3: 2, 4: 3, 7: 6, 8: 7, 10: null, 13: 10, 14: 11 },
    },
  },

  /* java: 3 = length, 4 = pass loop, 6 = inner scan, 7 = new-minimum test,
     10 = the swap, 12 = close pass, 13 = close method.
     C/C++ folded the inner loop and its comparison onto one line (java 6 and 7
     would collide), and used `swap()` — both expanded to match Java. */
  selectionSort: {
    snippets: {
      c: `#include <stdio.h>

void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        int temp = arr[minIdx];
        arr[minIdx] = arr[i];
        arr[i] = temp;
    }
}

int main() {
    int arr[] = {64, 25, 12, 22, 11};
    selectionSort(arr, 5);
    for (int i = 0; i < 5; i++) printf("%d ", arr[i]);
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        int temp = arr[minIdx];
        arr[minIdx] = arr[i];
        arr[i] = temp;
    }
}

int main() {
    vector<int> arr = {64, 25, 12, 22, 11};
    selectionSort(arr);
    for (int v : arr) cout << v << " ";
    return 0;
}`,
    },
    lineMap: {
      c:          { 3: 3, 4: 4, 6: 6, 7: 7, 10: 10, 12: 12, 13: 13 },
      cpp:        { 3: 6, 4: 7, 6: 9, 7: 10, 10: 13, 12: 15, 13: 16 },
      python:     { 3: 2, 4: 3, 6: 5, 7: 6, 10: 8, 12: null, 13: null },
      javascript: { 3: 2, 4: 3, 6: 5, 7: 6, 10: 8, 12: 9, 13: 10 },
    },
  },

  /* java: 3 = length, 4 = the outer pick loop, 6 = the scan cursor,
     7 = the shift test, 9 = step the cursor left, 10 = close the shift loop. */
  insertionSort: {
    lineMap: {
      // C/C++ declare `key` and `j` together, so the cursor shares that line.
      c:          { 3: 2, 4: 3, 6: 4, 7: 5, 9: 7, 10: 8 },
      cpp:        { 3: 5, 4: 6, 6: 7, 7: 8, 9: 10, 10: 11 },
      python:     { 3: 1, 4: 2, 6: 4, 7: 5, 9: 7, 10: null },
      javascript: { 3: 1, 4: 2, 6: 4, 7: 5, 9: 7, 10: 8 },
    },
  },

  /* java: 2 = sort(), 3 = the divide test, 12 = allocate the merge buffers,
     16 = the merge loop, 17 = take the smaller head.
     C/C++ folded the merge loop's body onto the `while` line (java 16 and 17
     would collide) — split onto its own line. NOTE the C/C++ maps run
     backwards: both define `merge` above `mergeSort`, where Java declares
     `sort` first. */
  mergeSort: {
    snippets: {
      c: `#include <stdio.h>

void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    int L[n1], R[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2)
        arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

void mergeSort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}

int main() {
    int arr[] = {38, 27, 43, 3, 9, 82, 10};
    mergeSort(arr, 0, 6);
    for (int i = 0; i < 7; i++) printf("%d ", arr[i]);
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

void merge(vector<int>& arr, int l, int m, int r) {
    vector<int> L(arr.begin() + l, arr.begin() + m + 1);
    vector<int> R(arr.begin() + m + 1, arr.begin() + r + 1);
    int i = 0, j = 0, k = l;
    while (i < (int)L.size() && j < (int)R.size())
        arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    while (i < (int)L.size()) arr[k++] = L[i++];
    while (j < (int)R.size()) arr[k++] = R[j++];
}

void mergeSort(vector<int>& arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}

int main() {
    vector<int> arr = {38, 27, 43, 3, 9, 82, 10};
    mergeSort(arr, 0, 6);
    for (int v : arr) cout << v << " ";
    return 0;
}`,
    },
    lineMap: {
      c:          { 2: 15, 3: 16, 12: 5, 16: 9, 17: 10 },
      cpp:        { 2: 15, 3: 16, 12: 6, 16: 9, 17: 10 },
      // Python/JS merge into a fresh list, so the "buffer" is `merged`.
      python:     { 2: 1, 3: 2, 12: 7, 16: 8, 17: 9 },
      javascript: { 2: 1, 3: 2, 12: 6, 16: 8, 17: 9 },
    },
  },

  /* java: 2 = partition(), 3 = pivot + boundary, 5 = the <= pivot test,
     6 = advance the boundary, 9 = close the scan (pivot placed), 13 = sort().
     Python inlined partition into quick_sort, and JS shipped a functional
     non-in-place variant with no partition/boundary at all — both rewritten to
     Java's in-place Lomuto partition so every step has a line to land on. */
  quickSort: {
    snippets: {
      python: `def partition(a, low, high):
    pivot = a[high]
    i = low - 1
    for j in range(low, high):
        if a[j] <= pivot:
            i += 1
            a[i], a[j] = a[j], a[i]
    a[i + 1], a[high] = a[high], a[i + 1]
    return i + 1


def quick_sort(a, low=0, high=None):
    if high is None:
        high = len(a) - 1
    if low < high:
        pi = partition(a, low, high)
        quick_sort(a, low, pi - 1)
        quick_sort(a, pi + 1, high)
    return a


print(quick_sort([10, 7, 8, 9, 1, 5]))`,
      javascript: `function partition(a, low, high) {
  const pivot = a[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (a[j] <= pivot) {
      i++;
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
  [a[i + 1], a[high]] = [a[high], a[i + 1]];
  return i + 1;
}

function quickSort(a, low = 0, high = a.length - 1) {
  if (low < high) {
    const pi = partition(a, low, high);
    quickSort(a, low, pi - 1);
    quickSort(a, pi + 1, high);
  }
  return a;
}

console.log(quickSort([10, 7, 8, 9, 1, 5]));`,
    },
    lineMap: {
      c:          { 2: 2, 3: 3, 5: 5, 6: 6, 9: 11, 13: 18 },
      cpp:        { 2: 5, 3: 6, 5: 8, 6: 9, 9: 12, 13: 17 },
      // Python has no closing token; the pivot lands on its final line instead.
      python:     { 2: 1, 3: 2, 5: 5, 6: 6, 9: 8, 13: 12 },
      javascript: { 2: 1, 3: 2, 5: 5, 6: 6, 9: 9, 13: 14 },
    },
  },

  /* java: 2 = heapify(), 3 = largest + child indices, 6 = the violation test,
     10 = close heapify, 11 = sort(), 13 = build the heap, 14 = the extract
     loop, 15 = swap the root out.
     The JS map runs backwards for java 11: JS nests `heapify` inside
     `heapSort`, so the sort entry is line 1 and the helper follows. */
  heapSort: {
    lineMap: {
      c:          { 2: 2, 3: 3, 6: 6, 10: 12, 11: 14, 13: 15, 14: 16, 15: 17 },
      cpp:        { 2: 6, 3: 7, 6: 10, 10: 14, 11: 16, 13: 18, 14: 19, 15: 20 },
      // Python splits `largest` and the child indices; no closing token.
      python:     { 2: 1, 3: 2, 6: 8, 10: null, 11: 12, 13: 14, 14: 16, 15: 17 },
      javascript: { 2: 3, 3: 4, 6: 8, 10: 12, 11: 1, 13: 13, 14: 14, 15: 15 },
    },
  },

  /* java: 2 = the algorithm header, 4 = length + max, 5 = the count array,
     7 = the cumulative-sum pass, 8 = the output array, 10 = copy back.
     C++ declared `cnt` and `out` on one line (java 5 and 8 would collide).
     Python and JS shipped a bucket-expansion variant with no cumulative-sum
     pass and no stable placement at all — java 7, 8 and 10 had nothing to
     point at — so all three are rewritten to Java's stable counting sort. */
  countingSort: {
    snippets: {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void countingSort(vector<int>& arr) {
    int n = arr.size(), mx = *max_element(arr.begin(), arr.end());
    vector<int> cnt(mx + 1, 0);
    for (int v : arr) cnt[v]++;
    for (int i = 1; i <= mx; i++) cnt[i] += cnt[i - 1];
    vector<int> out(n);
    for (int i = n - 1; i >= 0; i--) out[--cnt[arr[i]]] = arr[i];
    arr = out;
}

int main() {
    vector<int> a = {4, 2, 2, 8, 3, 3, 1};
    countingSort(a);
    for (int v : a) cout << v << " ";
    return 0;
}`,
      python: `def counting_sort(a):
    n = len(a)
    max_val = max(a)
    count = [0] * (max_val + 1)
    for v in a:
        count[v] += 1
    for i in range(1, max_val + 1):
        count[i] += count[i - 1]
    output = [0] * n
    for i in range(n - 1, -1, -1):
        count[a[i]] -= 1
        output[count[a[i]]] = a[i]
    return output


print(counting_sort([4, 2, 2, 8, 3, 3, 1]))`,
      javascript: `function countingSort(a) {
  const n = a.length;
  const max = Math.max(...a);
  const count = new Array(max + 1).fill(0);
  for (const v of a) count[v]++;
  for (let i = 1; i <= max; i++) count[i] += count[i - 1];
  const output = new Array(n);
  for (let i = n - 1; i >= 0; i--) output[--count[a[i]]] = a[i];
  return output;
}

console.log(countingSort([4, 2, 2, 8, 3, 3, 1]));`,
    },
    lineMap: {
      c:          { 2: 3, 4: 4, 5: 6, 7: 9, 8: 10, 10: 12 },
      cpp:        { 2: 6, 4: 7, 5: 8, 7: 10, 8: 11, 10: 13 },
      python:     { 2: 1, 4: 2, 5: 4, 7: 7, 8: 9, 10: 13 },
      javascript: { 2: 1, 4: 2, 5: 4, 7: 6, 8: 7, 10: 9 },
    },
  },

  /* java: 2 = the algorithm header (mapped to each language's radix driver),
     4 = the output + digit-count arrays, 7 = the stable placement pass,
     9 = close of one digit pass.
     Python shipped a bucket-expansion radix with no count array and no stable
     placement, so java 4/7/9 had nothing to point at — rewritten to the
     counting-by-digit form Java, C, C++ and JS all use. */
  radixSort: {
    snippets: {
      python: `def counting_sort_by_digit(a, exp):
    n = len(a)
    output = [0] * n
    count = [0] * 10
    for x in a:
        count[(x // exp) % 10] += 1
    for i in range(1, 10):
        count[i] += count[i - 1]
    for i in range(n - 1, -1, -1):
        digit = (a[i] // exp) % 10
        count[digit] -= 1
        output[count[digit]] = a[i]
    a[:] = output


def radix_sort(a):
    if not a:
        return a
    max_val = max(a)
    exp = 1
    while max_val // exp > 0:
        counting_sort_by_digit(a, exp)
        exp *= 10
    return a


print(radix_sort([170, 45, 75, 90, 802, 24, 2, 66]))`,
    },
    lineMap: {
      c:          { 2: 10, 4: 3, 7: 6, 9: 8 },
      cpp:        { 2: 15, 4: 8, 7: 11, 9: 13 },
      python:     { 2: 16, 4: 3, 7: 9, 9: 13 },
      // JS inlines the digit pass, so "close of the pass" is the copy-back.
      javascript: { 2: 1, 4: 5, 7: 9, 9: 13 },
    },
  },

  /* java: 2 = the algorithm header, 5 = allocate the buckets, 7 = distribute
     into buckets, 9 = the write cursor, 10 = the gather loop. */
  bucketSort: {
    lineMap: {
      c:          { 2: 14, 5: 15, 7: 18, 9: 23, 10: 24 },
      cpp:        { 2: 6, 5: 8, 7: 9, 9: 11, 10: 12 },
      // Python/JS gather into a fresh list, so the cursor is that list.
      python:     { 2: 1, 5: 6, 7: 7, 9: 10, 10: 11 },
      javascript: { 2: 1, 5: 5, 7: 6, 9: 7, 10: 8 },
    },
  },

  /* java: 2 = sort(), 3 = length (the step describes picking the gap, so C —
     which takes n as a parameter — points at the gap loop), 5 = the pass loop,
     7 = the shift test, 9 = step back by one gap, 11 = drop the key in. */
  shellSort: {
    lineMap: {
      c:          { 2: 2, 3: 3, 5: 4, 7: 6, 9: 8, 11: 10 },
      cpp:        { 2: 5, 3: 6, 5: 8, 7: 10, 9: 12, 11: 14 },
      python:     { 2: 1, 3: 2, 5: 5, 7: 8, 9: 10, 11: 11 },
      javascript: { 2: 1, 3: 2, 5: 4, 7: 7, 9: 9, 11: 11 },
    },
  },
}
