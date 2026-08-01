/* Hand-authored per-language line maps for the `hashing` category.
   See scripts/apply-code-data.cjs. Java line numbers -> equivalent line;
   `null` = this language genuinely has no equivalent line. */
module.exports = {
  /* java: 2 = the class, 4 = the seen-map, 5 = the scan loop,
     6 = compute the complement. */
  twoSumHash: {
    lineMap: {
      c:          { 2: 4, 4: 3, 5: 5, 6: 6 },
      cpp:        { 2: 4, 4: 5, 5: 6, 6: 7 },
      python:     { 2: 1, 4: 2, 5: 3, 6: 4 },
      javascript: { 2: 1, 4: 2, 5: 3, 6: 4 },
    },
  },

  /* java: 2 = the class, 4 = the key -> group map, 5 = the scan loop,
     6/7 = sort the letters to build the key.
     C shipped a comparator plus '// Group by sorted key — omitted for brevity
     in C' — there was no grouping code at all — so it is implemented. */
  groupAnagrams: {
    snippets: {
      c: `#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define MAX 64

int cmp(const void* a, const void* b) {
    return *(char*)a - *(char*)b;
}

void groupAnagrams(char* strs[], int n) {
    char keys[MAX][32];
    int groupOf[MAX], groups = 0;
    for (int i = 0; i < n; i++) {
        char key[32];
        strcpy(key, strs[i]);
        qsort(key, strlen(key), sizeof(char), cmp);
        int g = -1;
        for (int j = 0; j < groups; j++)
            if (strcmp(keys[j], key) == 0) { g = j; break; }
        if (g == -1) { g = groups; strcpy(keys[groups++], key); }
        groupOf[i] = g;
    }
    for (int g = 0; g < groups; g++) {
        printf("[");
        for (int i = 0; i < n; i++) if (groupOf[i] == g) printf("%s ", strs[i]);
        printf("]\\n");
    }
}

int main() {
    char* strs[] = {"eat", "tea", "tan", "ate", "nat", "bat"};
    groupAnagrams(strs, 6);
    return 0;
}`,
    },
    lineMap: {
      c:          { 2: 11, 4: 13, 5: 14, 7: 17 },
      cpp:        { 2: 6, 4: 7, 5: 8, 7: 10 },
      python:     { 2: 1, 4: 2, 5: 3, 7: 4 },
      javascript: { 2: 1, 4: 2, 5: 3, 7: 4 },
    },
  },

  /* java: 2 = the class, 5 = seed the map with prefix 0, 6 = the running
     count + prefix sum, 7 = the scan loop. */
  subarraySum: {
    lineMap: {
      c:          { 2: 2, 5: 4, 6: 3, 7: 5 },
      cpp:        { 2: 4, 5: 6, 6: 7, 7: 8 },
      python:     { 2: 1, 5: 4, 6: 2, 7: 5 },
      javascript: { 2: 1, 5: 2, 6: 3, 7: 4 },
    },
  },

  /* java: 2 = the import/header, 5 = the set, 6 = fill it, 7 = the best
     length, 8 = iterate candidate sequence starts.
     C scanned the array O(n^2) with no set at all — java 5/6/8 had nothing to
     point at — so it is rewritten with an open-addressing hash set. */
  longestConsecutive: {
    snippets: {
      c: `#include <stdio.h>
#include <stdbool.h>

#define CAP 1024

int slots[CAP];
bool used[CAP];

void setAdd(int v) {
    int i = ((v % CAP) + CAP) % CAP;
    while (used[i] && slots[i] != v) i = (i + 1) % CAP;
    slots[i] = v;
    used[i] = true;
}

bool setHas(int v) {
    int i = ((v % CAP) + CAP) % CAP;
    while (used[i]) {
        if (slots[i] == v) return true;
        i = (i + 1) % CAP;
    }
    return false;
}

int longestConsecutive(int nums[], int n) {
    for (int i = 0; i < n; i++) setAdd(nums[i]);
    int longest = 0;
    for (int i = 0; i < n; i++) {
        int v = nums[i];
        if (!setHas(v - 1)) {
            int count = 1;
            while (setHas(v + count)) count++;
            if (count > longest) longest = count;
        }
    }
    return longest;
}

int main() {
    int nums[] = {100, 4, 200, 1, 3, 2};
    printf("%d\\n", longestConsecutive(nums, 6));
    return 0;
}`,
    },
    lineMap: {
      c:          { 2: 6, 5: 9, 6: 27, 7: 28, 8: 29 },
      // C++/Python/JS build the set from the array in ONE expression, so
      // "create the set" and "fill it" are the same line; only the first
      // claims it.
      cpp:        { 2: 1, 5: 6, 6: null, 7: 7, 8: 8 },
      python:     { 2: 1, 5: 2, 6: null, 7: 3, 8: 4 },
      javascript: { 2: 1, 5: 2, 6: null, 7: 3, 8: 4 },
    },
  },

  /* java: 2 = the class, 4 = the frequency map, 6 = the heap that keeps the
     top k. Python/JS pick the top k without an explicit heap object, so that
     step lands on the selection expression instead. */
  topKFrequent: {
    lineMap: {
      c:          { 2: 2, 4: 3, 6: 7 },
      cpp:        { 2: 5, 4: 6, 6: 11 },
      python:     { 2: 3, 4: 4, 6: 7 },
      javascript: { 2: 1, 4: 2, 6: 4 },
    },
  },

  /* java: 2 = the table class, 4 = the bucket array, 6 = the hash function,
     7 = put(), 9 = scan the bucket for an existing key (collision chaining). */
  hashMapImpl: {
    lineMap: {
      c:          { 2: 3, 4: 7, 6: 8, 7: 11, 9: 13 },
      cpp:        { 2: 5, 4: 7, 6: 8, 7: 12, 9: 14 },
      python:     { 2: 1, 4: 3, 6: 6, 7: 9, 9: 11 },
      javascript: { 2: 1, 4: 3, 6: 6, 7: 11, 9: 13 },
    },
  },

  /* java: 2 = the cache class, 5 = the head/tail sentinels, 6 = the
     constructor, 9 = get(), 10 = the cache-miss check.
     C shipped only a Node struct and two comments ('Hash table maps key ->
     Node pointer; DLL tracks recency') with no cache at all — implemented
     here as the same hash-table + doubly-linked-list design as Java. */
  lruCacheHash: {
    snippets: {
      c: `/* LRU Cache: hash table + doubly linked list = O(1) get and put */
#include <stdio.h>
#include <stdlib.h>

#define CAP 3
#define HSIZE 1024

typedef struct Node {
    int key, val;
    struct Node *prev, *next;
} Node;

Node* table[HSIZE];
Node head, tail;
int count = 0;

void initCache(void) {
    head.next = &tail;
    tail.prev = &head;
}

void addFront(Node* n) {
    n->next = head.next;
    n->prev = &head;
    head.next->prev = n;
    head.next = n;
}

void unlink(Node* n) {
    n->prev->next = n->next;
    n->next->prev = n->prev;
}

int get(int key) {
    Node* n = table[key % HSIZE];
    if (!n) return -1;
    unlink(n);
    addFront(n);
    return n->val;
}

void put(int key, int val) {
    Node* n = table[key % HSIZE];
    if (n) {
        n->val = val;
        unlink(n);
        addFront(n);
        return;
    }
    if (count == CAP) {
        Node* lru = tail.prev;
        unlink(lru);
        table[lru->key % HSIZE] = NULL;
        free(lru);
        count--;
    }
    n = (Node*)malloc(sizeof(Node));
    n->key = key;
    n->val = val;
    addFront(n);
    table[key % HSIZE] = n;
    count++;
}

int main() {
    initCache();
    put(1, 1);
    put(2, 2);
    printf("%d\\n", get(1));
    put(3, 3);
    put(4, 4);
    printf("%d\\n", get(2));
    return 0;
}`,
    },
    lineMap: {
      c:          { 2: 13, 5: 14, 6: 17, 9: 34, 10: 36 },
      // C++/Python use a built-in ordered container instead of hand-rolled
      // sentinels, so that line stands in for the recency list.
      cpp:        { 2: 3, 5: 5, 6: 8, 9: 9, 10: 10 },
      python:     { 2: 3, 5: 6, 6: 4, 9: 8, 10: 9 },
      javascript: { 2: 10, 5: 14, 6: 11, 9: 29, 10: 30 },
    },
  },
}
