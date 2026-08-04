/* Hand-authored per-language line maps for the `heaps` category.
   See scripts/apply-code-data.cjs. Java line numbers -> equivalent line;
   `null` = this language genuinely has no equivalent line. */
module.exports = {
  /* java: 2 = the backing array, 7 = kick off the build, 9 = buildHeap(),
     14 = the left-child comparison inside heapify.
     Python and JS shipped incremental push/pop heaps with no build-from-array
     phase at all — the visualization builds a heap from an array, so neither
     had a line for java 7 or 9 — both rewritten to Java's build-heap form. */
  maxHeap: {
    snippets: {
      python: `class MaxHeap:
    def __init__(self, arr):
        self.heap = list(arr)
        self.size = len(arr)
        self.build_heap()

    def build_heap(self):
        for i in range(self.size // 2 - 1, -1, -1):
            self.heapify(i)

    def heapify(self, i):
        largest, l, r = i, 2 * i + 1, 2 * i + 2
        if l < self.size and self.heap[l] > self.heap[largest]:
            largest = l
        if r < self.size and self.heap[r] > self.heap[largest]:
            largest = r
        if largest != i:
            self.heap[i], self.heap[largest] = self.heap[largest], self.heap[i]
            self.heapify(largest)


h = MaxHeap([3, 1, 6, 5, 2, 4])
print(h.heap)`,
      javascript: `class MaxHeap {
  constructor(arr) {
    this.heap = [...arr];
    this.size = arr.length;
    this.buildHeap();
  }
  buildHeap() {
    for (let i = Math.floor(this.size / 2) - 1; i >= 0; i--) this.heapify(i);
  }
  heapify(i) {
    let largest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < this.size && this.heap[l] > this.heap[largest]) largest = l;
    if (r < this.size && this.heap[r] > this.heap[largest]) largest = r;
    if (largest !== i) {
      [this.heap[i], this.heap[largest]] = [this.heap[largest], this.heap[i]];
      this.heapify(largest);
    }
  }
}

const h = new MaxHeap([3, 1, 6, 5, 2, 4]);
console.log(h.heap.join(' '));`,
    },
    lineMap: {
      c:          { 2: 2, 7: 21, 9: 14, 14: 5 },
      cpp:        { 2: 19, 7: 20, 9: 14, 14: 7 },
      python:     { 2: 3, 7: 5, 9: 7, 12: 11, 13: 12, 14: 13 },
      javascript: { 2: 3, 7: 5, 9: 7, 14: 13 },
    },
  },

  /* java: 2 = the backing array, 4 = the constructor, 6 = append the value,
     7 = start at the new leaf, 8 = the sift-up test, 9 = swap with the parent,
     10 = move up to the parent.
     C++ delegated to std::push_heap, so the whole sift-up (java 7-10) had no
     lines — rewritten with the explicit loop Java, C, Python and JS use. */
  minHeap: {
    snippets: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

struct MinHeap {
    vector<int> heap;
    MinHeap(int capacity) { heap.reserve(capacity); }
    void insert(int val) {
        heap.push_back(val);
        int i = (int)heap.size() - 1;
        while (i > 0 && heap[(i - 1) / 2] > heap[i]) {
            int tmp = heap[i];
            heap[i] = heap[(i - 1) / 2];
            heap[(i - 1) / 2] = tmp;
            i = (i - 1) / 2;
        }
    }
    int extractMin() {
        int mn = heap[0];
        heap[0] = heap.back();
        heap.pop_back();
        siftDown(0);
        return mn;
    }
    void siftDown(int i) {
        int n = (int)heap.size();
        int smallest = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && heap[l] < heap[smallest]) smallest = l;
        if (r < n && heap[r] < heap[smallest]) smallest = r;
        if (smallest != i) {
            int tmp = heap[i];
            heap[i] = heap[smallest];
            heap[smallest] = tmp;
            siftDown(smallest);
        }
    }
};

int main() {
    MinHeap h(16);
    for (int v : {90, 70, 80, 40, 50, 60, 30}) h.insert(v);
    cout << h.extractMin() << endl;
    return 0;
}`,
    },
    lineMap: {
      // C uses file-scope arrays, so there is no constructor.
      c:          { 2: 2, 4: null, 6: 4, 7: 5, 8: 6, 9: 7, 10: 10 },
      cpp:        { 2: 6, 4: 7, 6: 9, 7: 10, 8: 11, 9: 12, 10: 15 },
      // Python/JS compute the parent index on its own line before swapping.
      python:     { 2: 3, 4: 2, 6: 6, 7: 7, 8: 8, 9: 10, 10: 11 },
      javascript: { 2: 3, 4: 2, 6: 6, 7: 7, 8: 10, 9: 11, 10: 12 },
    },
  },

  /* java: 2 = the class, 4 = the size-k min-heap, 8 = close the add/evict
     loop, 9 = the result array.
     C shipped a '// Simple O(n*k) approach for clarity' selection scan with no
     heap at all, so java 4 had nothing to point at — rewritten to the same
     bounded min-heap the other languages use. */
  kLargestElements: {
    snippets: {
      c: `#include <stdio.h>

int heap[128];
int hn = 0;

void push(int x) {
    heap[hn] = x;
    int i = hn++;
    while (i > 0 && heap[(i - 1) / 2] > heap[i]) {
        int t = heap[i];
        heap[i] = heap[(i - 1) / 2];
        heap[(i - 1) / 2] = t;
        i = (i - 1) / 2;
    }
}

void pop(void) {
    heap[0] = heap[--hn];
    int i = 0;
    while (1) {
        int l = 2 * i + 1, r = 2 * i + 2, s = i;
        if (l < hn && heap[l] < heap[s]) s = l;
        if (r < hn && heap[r] < heap[s]) s = r;
        if (s == i) break;
        int t = heap[i];
        heap[i] = heap[s];
        heap[s] = t;
        i = s;
    }
}

void kLargest(int a[], int n, int k) {
    for (int i = 0; i < n; i++) {
        push(a[i]);
        if (hn > k) pop();
    }
    int result[16];
    for (int i = k - 1; i >= 0; i--) {
        result[i] = heap[0];
        pop();
    }
    for (int i = 0; i < k; i++) printf("%d ", result[i]);
}

int main() {
    int a[] = {3, 2, 1, 5, 6, 4};
    kLargest(a, 6, 3);
    return 0;
}`,
    },
    lineMap: {
      c:          { 2: 34, 4: 3, 8: 38, 9: 39 },
      cpp:        { 2: 4, 4: 5, 8: 9, 9: 10 },
      // Python's heapreplace does java's offer AND poll in one call, which
      // java 8 already maps to; java 7's size guard is Python's value test.
      python:     { 2: 3, 4: 5, 6: null, 7: 7, 8: 8, 9: 9 },
      javascript: { 2: 1, 4: 2, 8: 34, 9: 35 },
    },
  },

  /* java: 2 = heapify(), 4 = the left-child test, 5 = the right-child test,
     6 = swap and recurse, 8 = sort(), 10 = the extract loop.
     JS uses an iterative sift-down that picks the larger child in one test,
     so the separate left/right comparisons have no distinct lines. */
  heapSortHeap: {
    lineMap: {
      c:          { 2: 2, 4: 4, 5: 5, 6: 6, 8: 13, 10: 16 },
      cpp:        { 2: 4, 4: 6, 5: 7, 6: 8, 8: 13, 10: 16 },
      python:     { 2: 1, 4: 4, 5: 6, 6: 8, 8: 12, 10: 16 },
      javascript: { 2: 3, 4: 7, 5: null, 6: 8, 8: 1, 10: 15 },
    },
  },

  /* java: 2 = the class, 4 = the upper-half min-heap, 5 = addNum(),
     7 = move the smaller half's top across to rebalance.
     C shipped '// Two-heap approach simplified for C' and nothing else — the
     two heaps are implemented here explicitly. */
  medianStream: {
    snippets: {
      c: `#include <stdio.h>

/* Two heaps: low is a max-heap holding the smaller half,
   high is a min-heap holding the larger half. */
int low[128], lowN = 0;
int high[128], highN = 0;

void lowPush(int x) {
    int i = lowN++;
    low[i] = x;
    while (i > 0 && low[(i - 1) / 2] < low[i]) {
        int t = low[i];
        low[i] = low[(i - 1) / 2];
        low[(i - 1) / 2] = t;
        i = (i - 1) / 2;
    }
}

int lowPop(void) {
    int top = low[0];
    low[0] = low[--lowN];
    int i = 0;
    while (1) {
        int l = 2 * i + 1, r = 2 * i + 2, b = i;
        if (l < lowN && low[l] > low[b]) b = l;
        if (r < lowN && low[r] > low[b]) b = r;
        if (b == i) break;
        int t = low[i];
        low[i] = low[b];
        low[b] = t;
        i = b;
    }
    return top;
}

void highPush(int x) {
    int i = highN++;
    high[i] = x;
    while (i > 0 && high[(i - 1) / 2] > high[i]) {
        int t = high[i];
        high[i] = high[(i - 1) / 2];
        high[(i - 1) / 2] = t;
        i = (i - 1) / 2;
    }
}

int highPop(void) {
    int top = high[0];
    high[0] = high[--highN];
    int i = 0;
    while (1) {
        int l = 2 * i + 1, r = 2 * i + 2, b = i;
        if (l < highN && high[l] < high[b]) b = l;
        if (r < highN && high[r] < high[b]) b = r;
        if (b == i) break;
        int t = high[i];
        high[i] = high[b];
        high[b] = t;
        i = b;
    }
    return top;
}

void addNum(int n) {
    lowPush(n);
    highPush(lowPop());
    if (lowN < highN) lowPush(highPop());
}

double median(void) {
    return lowN > highN ? low[0] : (low[0] + high[0]) / 2.0;
}

int main() {
    int stream[] = {5, 15, 1, 3};
    for (int i = 0; i < 4; i++) {
        addNum(stream[i]);
        printf("after %d median = %.1f\\n", stream[i], median());
    }
    return 0;
}`,
    },
    lineMap: {
      c:          { 2: 5, 4: 6, 5: 64, 7: 66 },
      cpp:        { 2: 4, 4: 6, 5: 7, 7: 9 },
      python:     { 2: 3, 4: 6, 5: 8, 7: 10 },
      javascript: { 2: 1, 4: 5, 5: 8, 7: 11 },
    },
  },

  /* java: 2 = the class, 5 = seed the heap from every list's head,
     6 = push that head, 8 = the drain loop.
     C shipped only '// Min-heap based K-way merge', and JS explicitly punted
     ('a min-heap of k heads is the classic O(N log k) approach; shown simply
     here') by concatenating and sorting — neither had a heap to point at, so
     both now do the real k-way merge. */
  mergeKSortedLists: {
    snippets: {
      c: `#include <stdio.h>

/* Heap entries are (value, listIndex, positionInList). */
int hv[64], hl[64], hp[64];
int hn = 0;

void push(int v, int li, int pos) {
    int i = hn++;
    hv[i] = v;
    hl[i] = li;
    hp[i] = pos;
    while (i > 0 && hv[(i - 1) / 2] > hv[i]) {
        int p = (i - 1) / 2;
        int a = hv[i]; hv[i] = hv[p]; hv[p] = a;
        int b = hl[i]; hl[i] = hl[p]; hl[p] = b;
        int c = hp[i]; hp[i] = hp[p]; hp[p] = c;
        i = p;
    }
}

void pop(void) {
    hn--;
    hv[0] = hv[hn];
    hl[0] = hl[hn];
    hp[0] = hp[hn];
    int i = 0;
    while (1) {
        int l = 2 * i + 1, r = 2 * i + 2, s = i;
        if (l < hn && hv[l] < hv[s]) s = l;
        if (r < hn && hv[r] < hv[s]) s = r;
        if (s == i) break;
        int a = hv[i]; hv[i] = hv[s]; hv[s] = a;
        int b = hl[i]; hl[i] = hl[s]; hl[s] = b;
        int c = hp[i]; hp[i] = hp[s]; hp[s] = c;
        i = s;
    }
}

void mergeK(int lists[][8], int lens[], int k) {
    for (int i = 0; i < k; i++)
        if (lens[i] > 0) push(lists[i][0], i, 0);
    while (hn > 0) {
        int v = hv[0], li = hl[0], pos = hp[0];
        pop();
        printf("%d ", v);
        if (pos + 1 < lens[li]) push(lists[li][pos + 1], li, pos + 1);
    }
}

int main() {
    int lists[3][8] = {{1, 4, 5}, {1, 3, 4}, {2, 6}};
    int lens[3] = {3, 3, 2};
    mergeK(lists, lens, 3);
    return 0;
}`,
      javascript: `// Min-heap of the k list heads: O(N log k).
class MinHeap {
  constructor() {
    this.data = [];
  }
  push(entry) {
    this.data.push(entry);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p][0] <= this.data[i][0]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    const top = this.data[0], last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      let i = 0;
      const n = this.data.length;
      while (true) {
        let s = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && this.data[l][0] < this.data[s][0]) s = l;
        if (r < n && this.data[r][0] < this.data[s][0]) s = r;
        if (s === i) break;
        [this.data[i], this.data[s]] = [this.data[s], this.data[i]];
        i = s;
      }
    }
    return top;
  }
  get size() {
    return this.data.length;
  }
}

function mergeKLists(lists) {
  const heap = new MinHeap();
  for (let i = 0; i < lists.length; i++) {
    if (lists[i].length > 0) heap.push([lists[i][0], i, 0]);
  }
  const merged = [];
  while (heap.size > 0) {
    const [val, li, pos] = heap.pop();
    merged.push(val);
    if (pos + 1 < lists[li].length) heap.push([lists[li][pos + 1], li, pos + 1]);
  }
  return merged;
}

console.log(mergeKLists([[1, 4, 5], [1, 3, 4], [2, 6]]).join(' '));`,
    },
    lineMap: {
      c:          { 2: 39, 5: 40, 6: 41, 8: 42 },
      // C++ folds the seeding loop and its push onto one line.
      cpp:        { 2: 4, 5: 9, 6: null, 8: 11 },
      python:     { 2: 3, 5: 4, 6: 5, 8: 7 },
      javascript: { 2: 39, 5: 41, 6: 42, 8: 45 },
    },
  },
}
