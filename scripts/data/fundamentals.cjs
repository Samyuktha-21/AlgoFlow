/* Hand-authored per-language line maps (and the snippet rewrites some of them
   required) for the `fundamentals` category. See scripts/apply-code-data.cjs.

   Keys are JAVA line numbers as emitted by steps.js `codeLine`; values are the
   equivalent line in that language. `null` means "this language has no
   equivalent line" (typically Java's closing `}`, which Python simply lacks) —
   the resolver then shows no highlight, which is correct rather than wrong.

   Snippets are rewritten only where the shipped code was a DIFFERENT algorithm
   from the Java block — e.g. C++ factorial/gcd were recursive while the
   visualization (and Java) are iterative, and twoSum was a hash-map solution in
   Python/JS while Java uses two pointers. No step could ever have highlighted a
   matching line in those files. */
module.exports = {
  /* java: 2 = frequency-map header, 4 = count(), 5 = the freq map itself.
     All four languages counted something different (a single target, or just
     printing), so all four are rewritten to Java's frequency-map algorithm. */
  countOccurrences: {
    snippets: {
      c: `#include <stdio.h>

void countOccurrences(int arr[], int n) {
    int freq[1000] = {0};
    for (int i = 0; i < n; i++) freq[arr[i]]++;
    for (int i = 0; i < 1000; i++)
        if (freq[i]) printf("%d -> %d\\n", i, freq[i]);
}

int main() {
    int arr[] = {1, 2, 2, 3, 3, 3, 1};
    countOccurrences(arr, 7);
    return 0;
}`,
      cpp: `#include <iostream>
#include <unordered_map>
#include <vector>
using namespace std;

unordered_map<int, int> countOccurrences(vector<int>& arr) {
    unordered_map<int, int> freq;
    for (int x : arr) freq[x]++;
    return freq;
}

int main() {
    vector<int> arr = {1, 2, 2, 3, 3, 3, 1};
    for (auto& [k, v] : countOccurrences(arr)) cout << k << " -> " << v << endl;
    return 0;
}`,
      python: `from collections import defaultdict

def count_occurrences(arr):
    freq = defaultdict(int)
    for x in arr:
        freq[x] += 1
    return freq

print(dict(count_occurrences([1, 2, 2, 3, 3, 3, 1])))`,
      javascript: `// Count occurrences using a frequency map
function countOccurrences(arr) {
  const freq = new Map();
  for (const x of arr) freq.set(x, (freq.get(x) || 0) + 1);
  return freq;
}

console.log([...countOccurrences([1, 2, 2, 3, 3, 3, 1])]);`,
    },
    lineMap: {
      c:          { 2: 1, 4: 3, 5: 4 },
      cpp:        { 2: 2, 4: 6, 5: 7 },
      python:     { 2: 1, 4: 3, 5: 4 },
      javascript: { 2: 1, 4: 2, 5: 3 },
    },
  },

  /* java: 2 = factorial(), 4 = the accumulating loop, 5 = return result.
     C++ shipped the recursive one-liner; Python led with the recursive form
     while the visualization is iterative. Both rewritten to lead with the
     iterative algorithm (each keeps the recursive variant, as Java does). */
  factorial: {
    snippets: {
      cpp: `#include <iostream>
using namespace std;

long long factorial(int n) {
    long long result = 1;
    for (int i = 2; i <= n; i++) result *= i;
    return result;
}

long long factorialRecursive(int n) {
    return n <= 1 ? 1 : n * factorialRecursive(n - 1);
}

int main() {
    cout << factorial(10) << endl;
    return 0;
}`,
      python: `def factorial(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result


def factorial_recursive(n):
    return 1 if n <= 1 else n * factorial_recursive(n - 1)


print(factorial(10))
print(factorial_recursive(5))`,
    },
    lineMap: {
      c:          { 2: 2, 4: 4, 5: 5 },
      cpp:        { 2: 4, 4: 6, 5: 7 },
      python:     { 2: 1, 4: 3, 5: 5 },
      javascript: { 2: 1, 4: 3, 5: 4 },
    },
  },

  /* java: 2 = fib(), 4 = seed a=0/b=1, 5 = the rolling loop. All four already
     use the same iterative two-variable algorithm. */
  fibonacci: {
    lineMap: {
      c:          { 2: 2, 4: 4, 5: 5 },
      cpp:        { 2: 3, 4: 5, 5: 6 },
      python:     { 2: 1, 4: 2, 5: 3 },
      javascript: { 2: 1, 4: 3, 5: 4 },
    },
  },

  /* java: 2 = method, 3 = loop, 5 = Fizz branch, 7 = default branch,
     9 = the method's closing brace (mapped to each language's last line of
     the equivalent function). */
  fizzBuzz: {
    lineMap: {
      c:          { 2: 2, 3: 3, 5: 5, 7: 7, 9: 10 },
      cpp:        { 2: 3, 3: 4, 5: 6, 7: 8, 9: 11 },
      python:     { 2: 1, 3: 2, 5: 5, 7: 9, 9: 10 },
      javascript: { 2: 1, 3: 3, 5: 5, 7: 7, 9: 10 },
    },
  },

  /* java: 2 = gcd(), 3 = the Euclid loop, 4 = return a, 5 = closing brace.
     C++ shipped the recursive one-liner — rewritten to Java's iterative loop
     so the "swap and take the remainder" step has a line to land on. */
  gcd: {
    snippets: {
      cpp: `#include <iostream>
using namespace std;

int gcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

int lcm(int a, int b) {
    return a / gcd(a, b) * b;
}

int main() {
    cout << "gcd=" << gcd(48, 18) << " lcm=" << lcm(4, 6) << endl;
    return 0;
}`,
    },
    lineMap: {
      c:          { 2: 2, 3: 3, 4: 8, 5: 9 },
      cpp:        { 2: 4, 3: 5, 4: 10, 5: 11 },
      // Python has no closing delimiter for the function body.
      python:     { 2: 1, 3: 2, 4: 4, 5: null },
      javascript: { 2: 1, 3: 2, 4: 5, 5: 6 },
    },
  },

  /* java: 2 = myPow(), 5 = the halving loop, 7 = square the base,
     8 = halve the exponent. All four already use binary exponentiation. */
  power: {
    lineMap: {
      c:          { 2: 2, 5: 8, 7: 10, 8: 11 },
      cpp:        { 2: 4, 5: 10, 7: 12, 8: 13 },
      python:     { 2: 1, 5: 3, 6: 5, 7: 6, 8: 7 },
      javascript: { 2: 1, 5: 3, 7: 5, 8: 6 },
    },
  },

  /* java: 2 = isPrime(), 10 = the main/driver that prints primes. */
  primeCheck: {
    lineMap: {
      c:          { 2: 3, 10: 10 },
      cpp:        { 2: 4, 10: 11 },
      python:     { 2: 1, 7: 10, 10: 15 },
      javascript: { 2: 1, 10: 9 },
    },
  },

  /* java: 2 = class header, 4 = the two pointers, 5 = the converge loop,
     7 = the hit branch, 8 = the advance-left branch. Python and JS shipped a
     hash-map solution — a completely different algorithm from the two-pointer
     one being visualized — so both are rewritten. */
  twoSum: {
    snippets: {
      python: `def two_sum(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        total = arr[left] + arr[right]
        if total == target:
            return [left, right]
        elif total < target:
            left += 1
        else:
            right -= 1
    return [-1, -1]


print(two_sum([1, 2, 4, 6, 8, 9, 14, 15], 13))`,
      javascript: `function twoSum(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    else if (sum < target) left++;
    else right--;
  }
  return [-1, -1];
}

console.log(twoSum([1, 2, 4, 6, 8, 9, 14, 15], 13));`,
    },
    lineMap: {
      c:          { 2: 1, 4: 3, 5: 4, 7: 6, 8: 9 },
      cpp:        { 2: 1, 4: 5, 5: 6, 7: 8, 8: 9 },
      python:     { 2: 1, 4: 2, 5: 3, 7: 5, 8: 7 },
      javascript: { 2: 1, 4: 2, 5: 3, 7: 5, 8: 6 },
    },
  },

  /* java: 3 = the two pointers, 5 = the character comparison (a mismatch
     returns straight from this line), 8 = every pair matched. */
  palindromeCheck: {
    lineMap: {
      python: { 3: 2, 5: 4, 8: 8 },
    },
  },

  /* java: 3 = the two pointers, 5 = the swap, 11 = print the reversed value.
     Java reverses the caller's char[] in place and has nothing to return, so
     the result surfaces in main; Python returns a rebuilt string instead. */
  reverseString: {
    lineMap: {
      python: { 3: 3, 5: 5, 11: 10 },
    },
  },
}
